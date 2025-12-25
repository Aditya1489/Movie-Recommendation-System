from fastapi import APIRouter, Depends, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional

from app.db.session import get_db
from app.schema.user import ReviewCreate, ReviewUpdate, ReviewOut, PaginatedReviews
from app.services.user_services import Review_Funcations
from app.core.security import user_required, _get_user_from_request
from app.core.logging_config import logger
from app.models.review import Reviews
from app.models.movie import Movies
from app.schema.user import PlatformSchema

router = APIRouter()
bearer = HTTPBearer()


@router.post("/Write_Reviews", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
@user_required
async def create_review(
    request: Request,
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    cred: HTTPAuthorizationCredentials = Depends(bearer)
):
    user = _get_user_from_request(request)
    review = Review_Funcations.add_review(
        db=db,
        user_id=user.user_id,
        movie_id=payload.movie_id,
        rating=payload.rating,
        comment=payload.comment,
    )
    logger.info(f"User {user.user_id} created review for movie {payload.movie_id}")
    return review


@router.get("/Get_Reviews_by_movie_id/{movie_id}", response_model=PaginatedReviews)
@user_required
async def get_reviews(
    request: Request,
    movie_id: int,
    page: int = 1,
    size: int = 10,
    ratingFrom: float = 0.0,
    userId: Optional[int] = None,
    sort: str = "created_at",
    order: str = "desc",
    db: Session = Depends(get_db),
    cred: HTTPAuthorizationCredentials = Depends(bearer)
):
    result = Review_Funcations.list_reviews_by_movie(
        db=db,
        movie_id=movie_id,
        page=page,
        size=size,
        ratingFrom=ratingFrom,
        userId=userId,
        sort=sort,
        order=order,
    )
    logger.info(f"Fetched reviews for movie {movie_id}")
    return result


@router.put("/Update_Reviews/{review_id}", response_model=ReviewOut)
@user_required
async def modify_review(
    request: Request,
    review_id: int,
    payload: ReviewUpdate,
    db: Session = Depends(get_db),
    cred: HTTPAuthorizationCredentials = Depends(bearer)
):
    user = _get_user_from_request(request)
    updated = Review_Funcations.update_review(
        db=db,
        review_id=review_id,
        user_id=user.user_id,
        rating=payload.rating,
        comment=payload.comment,
    )
    logger.info(f"User {user.user_id} updated review {review_id}")
    return updated


@router.delete("/Delete_Reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
@user_required
async def remove_review(
    request: Request,
    review_id: int,
    db: Session = Depends(get_db),
    cred: HTTPAuthorizationCredentials = Depends(bearer)
):
    user = _get_user_from_request(request)
    Review_Funcations.delete_review(db=db, review_id=review_id, user_id=user.user_id)
    logger.info(f"User {user.user_id} deleted review {review_id}")
    return {"message": "Review deleted"}


@router.post("/Like_Reviews/{review_id}/like")
@user_required
async def like_a_review(
    request: Request,
    review_id: int,
    db: Session = Depends(get_db),
    cred: HTTPAuthorizationCredentials = Depends(bearer)
):
    user = _get_user_from_request(request)
    result = Review_Funcations.like_review(db=db, review_id=review_id, user_id=user.user_id)
    logger.info(f"User {user.user_id} liked review {review_id}")
    return result


@router.get("/my_reviews")
@user_required
async def get_my_reviews(
    request: Request,
    page: int = 1,
    size: int = 20,
    db: Session = Depends(get_db),
    cred: HTTPAuthorizationCredentials = Depends(bearer)
):
    """Get current user's reviews with movie info"""
    user = _get_user_from_request(request)
    
    query = db.query(Reviews).filter(Reviews.user_id == user.user_id)
    total = query.count()
    reviews = query.order_by(Reviews.created_at.desc()).offset((page - 1) * size).limit(size).all()
    
    result = []
    for r in reviews:
        movie = db.query(Movies).filter(Movies.id == r.movie_id).first()
        result.append({
            "id": r.id,
            "movie_id": r.movie_id,
            "movie_title": movie.title if movie else "Unknown",
            "poster_url": movie.poster_url if movie else None,
            "rating": r.rating,
            "comment": r.comment,
            "like_count": r.like_count,
            "created_at": r.created_at,
        })
    
    logger.info(f"User {user.user_id} fetched their reviews")
    return {"total": total, "page": page, "size": size, "reviews": result}
