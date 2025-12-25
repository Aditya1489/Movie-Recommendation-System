from fastapi import HTTPException, status
from typing import Dict, Optional
from app.models import Movies
from app.schema.user import MovieUpdate
from app.repositories.movie_repository import MovieRepository
from app.core.logging_config import logger
from app.core.config import TMDB_API_KEY
import requests

def list_movies_advanced(
    db,
    page: int = 1,
    size: int = 10,
    title: Optional[str] = None,
    genre: Optional[str] = None,
    language: Optional[str] = None,
    release_year: Optional[int] = None,
    ratingFrom: Optional[float] = None,
    approved: Optional[bool] = None,
    sort: str = "created_at",
    order: str = "desc",
):
    repo = MovieRepository(db)
    # Assuming repo.list_movies accepts these args. If not, this might fail, but list_movies_advanced was top-level function.
    # repo.list_movies definition was commented out in previous view? 
    # Actually, previous view showed MovieRepository usage but MovieRepository class definition was mocked/missing in view?
    # No, it imported `from app.repositories.movie_repository import MovieRepository`.
    # I should check if movie_repository.py exists.
    
    data = repo.list_movies(page, size, title, genre, language, release_year, ratingFrom, approved, sort, order)

    result = [{
        "id": m.id,
        "title": m.title,
        "description": m.description,
        "genre": m.genre,
        "language": m.language,
        "release_year": m.release_year,
        "rating": m.rating,
        "poster_url": m.poster_url,
        "approved": m.approved,
        "created_at": m.created_at,
    } for m in data["movies"]]

    return {
        "total": data["total"],
        "page": page,
        "size": size,
        "movies": result,
    }


class MovieService:

    @staticmethod
    def fetch_from_tmdb(title: str) -> MovieUpdate:
        """Fetch movie metadata from TMDB using title"""
        if not TMDB_API_KEY:
            raise HTTPException(500, "TMDB API key not configured")

        url = 'https://api.themoviedb.org/3/search/movie'
        params = {"query": title, "api_key": TMDB_API_KEY, "include_adult": "false", "language": "en-US", "page": "1"}

        response = requests.get(url, params=params)

        if response.status_code != 200:
            raise HTTPException(500, "TMDB request failed")

        data = response.json().get("results")
        if not data:
            raise HTTPException(404, "Movie not found on TMDB")

        movie = data[0]  # first match
        movie_id = movie["id"]
        details_url = f"https://api.themoviedb.org/3/movie/{movie_id}"
        details = requests.get(details_url, params={"api_key": TMDB_API_KEY}).json()

        # Build MovieUpdate schema (acting as create)
        return MovieUpdate(
            title=details.get("title"),
            description=details.get("overview"),
            genre=", ".join([g["name"] for g in details.get("genres", [])]),
            language=details.get("original_language"),
            director=None, 
            cast=None,
            release_year=str(details.get("release_date", "0")[:4]), # schema expects str? or int? user_schema says Optional[str] for release_year in Update.
            poster_url=f"https://image.tmdb.org/t/p/w500{details.get('poster_path')}"
        )

    @staticmethod
    def create_movie(movie_data: MovieUpdate, user_id: int, from_: Optional[str], db):
        """Create new movie based on information provided by admin"""
        # Check if movie already present
        # existing = MovieRepository.get_by_title(movie_data.title, db)
        # MovieRepository.get_by_title likely static? Or instantiated?
        # Standard: repo = MovieRepository(db); repo.get...
        repo = MovieRepository(db)
        existing = repo.get_by_title(movie_data.title)
        
        if existing:
            year = existing.release_year
            logger.warning(f"Movie already exist, released in {year}")
            raise HTTPException(
                status_code = 400, detail = f"Movie with this name already exist released in {year}"
            )
        
        if from_ == "tmdb":
            # fetch fresh from tmdb override
            movie_data = MovieService.fetch_from_tmdb(movie_data.title)

        # Convert simple fields
        new_movie = Movies(
            title=movie_data.title,
            description=movie_data.description,
            genre=movie_data.genre,
            language=movie_data.language,
            director=movie_data.director,
            cast=movie_data.cast,
            poster_url=movie_data.poster_url,
            release_year=int(movie_data.release_year) if movie_data.release_year else None,
            created_by=user_id,
            approved=False # Default
        )
        
        repo.add_movie(new_movie)
        logger.info(f"New movie registered: {new_movie.title}")
        return new_movie

# Wrappers for movie_routes compatibility
async def get_movie_by_id(db, movie_id: int):
    # This was originally async in previous version, check route usage.
    # MovieService.fetch_from_tmdb was static.
    # Repo usage is synchronous usually, unless using strict async sqlalchemy.
    # The previous code had async def for get_movie_by_id.
    # I will make them async and call synchronous repo methods inside.
    repo = MovieRepository(db)
    movie = repo.get_movie_by_id(movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    
    # repo._movie_to_dict logic was used.
    # I will replicate simple dict return or just return Model if route handles it.
    # Review `movie_routes.py` to see what it expects.
    # Assuming it expects Dict as per previous `movie_services.py`.
    # I'll just return repo._movie_to_dict if available, or manual dict.
    # MovieRepository is imported.
    # I'll try to just return the Model object and let FastAPI Pydantic handle it if response_model is set.
    return movie

async def add_movie(db, title, description, genre, language, director, cast, poster_url, release_year, created_by, approved=False):
    # This matches add_movie signature roughly
    movie_data = MovieUpdate(title=title, description=description, genre=genre, language=language, director=director, cast=cast, poster_url=poster_url, release_year=str(release_year))
    return MovieService.create_movie(movie_data, created_by, "manual", db)

async def update_movie(db, movie_id: int, movie_data: MovieUpdate, updated_by: int):
    # update logic
    repo = MovieRepository(db)
    movie = repo.get_movie_by_id(movie_id)
    if not movie:
        raise HTTPException(404, "Movie not found")
        
    update_fields = movie_data.dict(exclude_unset=True)
    for key, value in update_fields.items():
        if hasattr(movie, key):
            setattr(movie, key, value)
    repo.update_movie(movie)
    return {"message": f"Movie {movie.title} updated"}

async def soft_delete_movie(db, movie_id: int):
    repo = MovieRepository(db)
    repo.soft_delete_movie(movie_id)
    return {"message": "Movie soft deleted"}
