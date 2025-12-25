# app/repositories/movie_repository.py
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional, List, Dict
from fastapi import HTTPException, status
from app.models import Movies, MovieAvailability, MovieVersion
from app.core.logging_config import logger


class MovieRepository:
    def __init__(self, db: Session):
        self.db = db

    # ----------------------------
    # Utility: convert model → dict
    # ----------------------------
    def _movie_to_dict(self, m: Movies) -> Dict:
        return {
            "id": m.id,
            "title": m.title,
            "description": m.description,
            "genre": m.genre,
            "language": m.language,
            "director": m.director,
            "cast": m.cast,
            "release_year": m.release_year,
            "poster_url": m.poster_url,
            "rating": m.rating,
            "approved": m.approved,
            "created_by": m.created_by,
            "created_at": m.created_at,
            "updated_at": m.updated_at,
            "status": m.status,
        }

    # ----------------------------
    # CRUD
    # ----------------------------
    def get_movie_by_id(self, movie_id: int) -> Optional[Movies]:
        return self.db.query(Movies).filter(
            Movies.id == movie_id,
            Movies.status != "deleted"
        ).first()

    def add_movie(self, movie: Movies):
        self.db.add(movie)
        self.db.commit()
        self.db.refresh(movie)
        return movie

    def update_movie(self, movie: Movies):
        self.db.commit()
        self.db.refresh(movie)
        return movie

    def soft_delete_movie(self, movie_id: int):
        movie = self.db.query(Movies).filter(Movies.id == movie_id).first()
        if not movie:
            raise HTTPException(status_code=404, detail="Movie not found")
        movie.status = "deleted"
        self.db.commit()
        logger.info(f"Movie {movie_id} soft-deleted")
        return movie

    def list_movies(
        self,
        page: int,
        size: int,
        title: Optional[str],
        genre: Optional[str],
        language: Optional[str],
        release_year: Optional[int],
        rating_from: Optional[float],
        approved: Optional[bool],
        sort: str,
        order: str,
    ) -> Dict:

        q = self.db.query(Movies).filter(Movies.status != "deleted")

        if title:
            q = q.filter(Movies.title.ilike(f"%{title}%"))
        if genre:
            q = q.filter(Movies.genre == genre)
        if language:
            q = q.filter(Movies.language == language)
        if release_year:
            q = q.filter(Movies.release_year == release_year)
        if rating_from is not None:
            q = q.filter(Movies.rating >= rating_from)
        if approved is not None:
            q = q.filter(Movies.approved == approved)

        total = q.count()

        # sorting
        if hasattr(Movies, sort):
            order_col = getattr(Movies, sort)
        else:
            order_col = Movies.created_at

        if order.lower() == "desc":
            q = q.order_by(desc(order_col))
        else:
            q = q.order_by(order_col)

        movies = q.offset((page - 1) * size).limit(size).all()

        return {"total": total, "movies": movies}

    # def get_reviews_for_movie(self, movie_id: int):
    #     return self.db.query(Review).filter(Review.movie_id == movie_id).all()

    def get_availability_for_movie(self, movie_id: int):
        availability = self.db.query(MovieAvailability).filter(
            MovieAvailability.movie_id == movie_id
        ).all()
        result = []
        for a in availability:
            platform = self.db.query(Platform).filter(Platform.id == a.platform_id).first()
            region = self.db.query(Region).filter(Region.id == a.region_id).first()
            result.append({
                "platform": platform.name if platform else None,
                "region": region.code if region else None,
                "availability_type": a.availability_type,
                "start_date": a.start_date,
                "end_date": a.end_date,
                "url": a.url,
            })
        return result

    def save_version(self, movie_id: int, updated_by: int, prev_data: str):
        version = MovieVersion(movie_id=movie_id, changed_by=updated_by, previous_data=prev_data)
        self.db.add(version)
        self.db.commit()
