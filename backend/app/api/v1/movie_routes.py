from functools import wraps
from fastapi import Request, HTTPException, Security
from app.core.logging_config import logger
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import APIRouter, Request, Query, Response, status, HTTPException, Depends
from typing import Optional
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schema.user import MovieIn, MovieUpdate, PaginatedMovies
from app.services.movie_services import get_movie_by_id, update_movie, soft_delete_movie, list_movies_advanced,add_movie,update_movie
from app.core.logging_config import logger
from fastapi import APIRouter, Request, Depends
from app.db.session import get_db
from app.core.logging_config import logger
from app.schema.user import MovieIn

security = HTTPBearer()
def _find_request(args, kwargs):
    
    for a in args:
        
        if hasattr(a, "scope") and isinstance(getattr(a, "scope"), dict):
            return a
    return kwargs.get("request")

def admin_required(fn):
    @wraps(fn)
    async def wrapper(*args, **kwargs):
        request: Request = _find_request(args, kwargs)
        if not request:
            logger.error("admin_required used on endpoint without Request param")
            raise HTTPException(status_code=500, detail="Internal decorator error")
        user = getattr(request.state, "user", None)
        if not user:
            logger.info(user)
            logger.info("Admin access denied: not authenticated")
            raise HTTPException(status_code=401, detail="Authentication required")
        if getattr(user, "role", "") != "admin":
            logger.info(f"Admin access denied for user {getattr(user,'email', None)}")
            raise HTTPException(status_code=403, detail="Admin access required")
        return await fn(*args, **kwargs)
    return wrapper


router = APIRouter()

@router.get("/admin/dashboard", dependencies=[Security(security)])
@admin_required
async def admin_dashboard(request: Request):
    admin = request.state.user
    logger.info(f"Admin dashboard viewed by {admin.email}")
    return {"message": f"Welcome Admin {admin.username}"}

@router.post("/admin/add_movie", dependencies=[Security(security)])
@admin_required
async def admin_add_movie(request: Request, payload: MovieIn, db = Depends(get_db)):
    admin = request.state.user
    m = await add_movie(db=db, title=payload.title,release_year=payload.release_year, description=payload.description, genre=payload.genre,language=payload.language,director=payload.director, cast=payload.cast,poster_url=payload.poster_url, created_by=admin.user_id, approved=True)
    return {"message": "Movie added", "movie_id": m.id}

@router.delete("/admin/delete_movie/{movie_id}", dependencies=[Security(security)])
@admin_required
async def admin_delete_movie(
    request: Request, 
    movie_id: int, 
    db = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    result = await soft_delete_movie(db=db, movie_id=movie_id)
    return result


@router.get("/admin/movies", dependencies=[Security(security)])
@admin_required
async def list_all_movies(
    request: Request,
    page: int = 1,
    size: int = 10,
    title: Optional[str] = None,
    genre: Optional[str] = None,
    language: Optional[str] = None,
    release_year: Optional[int] = None,
    ratingFrom: Optional[float] = None,
    approved: Optional[bool] = None,
    sort: str = "rating",
    order: str = "desc",
    db: Session = Depends(get_db),
):
    return list_movies_advanced(
        db=db,
        page=page,
        size=size,
        title=title,
        genre=genre,
        language=language,
        release_year=release_year,
        ratingFrom=ratingFrom,
        approved=approved,
        sort=sort,
        order=order,
    )

@router.put(
    "/admin/update_movie/{movie_id}",
    status_code=status.HTTP_200_OK,
    dependencies=[Security(security)]
)
@admin_required
async def update_movie_endpoint(
    request: Request,
    movie_id: int,
    movie_data: MovieUpdate,
    db: Session = Depends(get_db)):
    user_id = request.state.user.user_id
    try:
        result = await update_movie(db=db, movie_id=movie_id, updated_by=user_id, movie_data=movie_data)
        return dict(result)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/movies/{movie_id}", status_code=status.HTTP_200_OK, dependencies=[Security(security)])
async def get_movie(movie_id: int, db: Session = Depends(get_db)):
    result = await get_movie_by_id(db=db, movie_id=movie_id)
    return result

@router.get("/list", dependencies=[Security(security)])
async def list_movies_public(
    request: Request,
    page: int = 1,
    size: int = 10,
    title: Optional[str] = None,
    genre: Optional[str] = None,
    sort: str = "rating",
    order: str = "desc",
    db: Session = Depends(get_db),
):
    # Retrieve user from request if needed, but this is a public list (auth required)
    # Force approved=True for public
    return list_movies_advanced(
        db=db,
        page=page,
        size=size,
        title=title,
        genre=genre,
        approved=True,
        sort=sort,
        order=order,
    )
