from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_
from fastapi import HTTPException
from typing import Optional, List
from app.core.logging_config import logger
from app.models import Movies, Reviews, ReviewHistory, ReviewLikes
from app.models.watchlist import Watchlist
from app.repositories.user_repository import (
    get_movie_by_id,
    get_existing_review,
    get_review_by_id,
    get_reviews_by_movie,
    get_like_by_user,
)

def _sentiment_placeholder(text: Optional[str]) -> Optional[float]:
    if not text:
        return None
    txt = text.lower()
    pos = sum(word in txt for word in ("good", "great", "amazing", "love", "excellent", "enjoyed"))
    neg = sum(word in txt for word in ("bad", "boring", "terrible", "awful", "hate", "worst"))
    score = (pos - neg) / (pos + neg + 1e-6)
    return max(0.0, min(1.0, (score + 1) / 2))

def recalc_movie_rating(db: Session, movie_id: int) -> float:
    avg = db.query(func.avg(Reviews.rating)).filter(Reviews.movie_id == movie_id).scalar()
    avg_val = float(avg) if avg is not None else 0.0
    movie = get_movie_by_id(db, movie_id)
    if movie:
        movie.rating = avg_val
        db.add(movie)
        db.commit()
        logger.info(f"Recalculated movie {movie_id} rating -> {avg_val}")
    return avg_val


# ============================================
# WATCHLIST FUNCTIONS
# ============================================

def search_movies(
    db: Session,
    q: Optional[str] = None,
    genre: Optional[str] = None,
    page: int = 1,
    limit: int = 10,
    sort_by: str = "rating",
    order: str = "desc"
):
    """Search movies by title, genre, etc."""
    query = db.query(Movies).filter(Movies.approved == True)
    
    if q:
        query = query.filter(or_(
            Movies.title.ilike(f"%{q}%"),
            Movies.description.ilike(f"%{q}%")
        ))
    if genre:
        query = query.filter(Movies.genre.ilike(f"%{genre}%"))
    
    total = query.count()
    
    # Sorting
    sort_col = getattr(Movies, sort_by, Movies.rating)
    if order.lower() == "desc":
        query = query.order_by(desc(sort_col))
    else:
        query = query.order_by(sort_col)
    
    movies = query.offset((page - 1) * limit).limit(limit).all()
    
    return {
        "total": total,
        "page": page,
        "size": limit,
        "movies": [{
            "id": m.id,
            "title": m.title,
            "genre": m.genre,
            "language": m.language,
            "release_year": m.release_year,
            "rating": m.rating,
            "poster_url": m.poster_url,
        } for m in movies]
    }


def add_to_watchlist(db: Session, user_id: int, movie_ids: List[int], status: str = "To Watch"):
    """Add movies to user's watchlist"""
    added = []
    for movie_id in movie_ids:
        # Check if already in watchlist
        existing = db.query(Watchlist).filter(
            Watchlist.user_id == user_id,
            Watchlist.movie_id == movie_id
        ).first()
        
        if existing:
            continue
        
        # Check if movie exists
        movie = db.query(Movies).filter(Movies.id == movie_id).first()
        if not movie:
            continue
        
        entry = Watchlist(
            user_id=user_id, 
            movie_id=movie_id, 
            movie_title=movie.title,
            status=status
        )
        db.add(entry)
        added.append(movie_id)
    
    db.commit()
    logger.info(f"User {user_id} added {len(added)} movies to watchlist")
    return {"message": f"Added {len(added)} movies to watchlist", "added": added}


def list_watchlist(
    db: Session,
    user_id: int,
    status: Optional[str] = None,
    sort: str = "added_at",
    order: str = "desc",
    page: int = 1,
    size: int = 10
):
    """Get user's watchlist"""
    query = db.query(Watchlist).filter(Watchlist.user_id == user_id)
    
    if status:
        query = query.filter(Watchlist.status == status)
    
    total = query.count()
    
    # Sorting
    sort_col = getattr(Watchlist, sort, Watchlist.added_at)
    if order.lower() == "desc":
        query = query.order_by(desc(sort_col))
    else:
        query = query.order_by(sort_col)
    
    items = query.offset((page - 1) * size).limit(size).all()
    
    result = []
    for item in items:
        movie = db.query(Movies).filter(Movies.id == item.movie_id).first()
        if movie:
            result.append({
                "movie_id": movie.id,
                "title": movie.title,
                "poster_url": movie.poster_url,
                "status": item.status,
                "added_at": item.added_at,
            })
    
    return {"total": total, "page": page, "size": size, "items": result}


def remove_from_watchlist(db: Session, user_id: int, movie_id: int):
    """Remove a movie from watchlist"""
    entry = db.query(Watchlist).filter(
        Watchlist.user_id == user_id,
        Watchlist.movie_id == movie_id
    ).first()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Movie not in watchlist")
    
    db.delete(entry)
    db.commit()
    logger.info(f"User {user_id} removed movie {movie_id} from watchlist")
    return {"message": "Removed from watchlist"}


def remove_bulk_watchlist(db: Session, user_id: int, movie_ids: List[int]):
    """Remove multiple movies from watchlist"""
    deleted = db.query(Watchlist).filter(
        Watchlist.user_id == user_id,
        Watchlist.movie_id.in_(movie_ids)
    ).delete(synchronize_session=False)
    
    db.commit()
    logger.info(f"User {user_id} removed {deleted} movies from watchlist")
    return {"message": f"Removed {deleted} movies from watchlist"}


def check_in_watchlist(db: Session, user_id: int, movie_id: int):
    """Check if movie is in user's watchlist"""
    entry = db.query(Watchlist).filter(
        Watchlist.user_id == user_id,
        Watchlist.movie_id == movie_id
    ).first()
    
    return {"in_watchlist": entry is not None, "status": entry.status if entry else None}


def update_watchlist_status(db: Session, user_id: int, movie_id: int, status: str):
    """Update watchlist entry status"""
    entry = db.query(Watchlist).filter(
        Watchlist.user_id == user_id,
        Watchlist.movie_id == movie_id
    ).first()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Movie not in watchlist")
    
    entry.status = status
    db.commit()
    logger.info(f"User {user_id} updated movie {movie_id} status to {status}")
    return {"message": f"Status updated to {status}"}


def watchlist_status(db: Session, user_id: int):
    """Get watchlist summary by status"""
    to_watch = db.query(Watchlist).filter(
        Watchlist.user_id == user_id,
        Watchlist.status == "To Watch"
    ).count()
    
    watching = db.query(Watchlist).filter(
        Watchlist.user_id == user_id,
        Watchlist.status == "Watching"
    ).count()
    
    watched = db.query(Watchlist).filter(
        Watchlist.user_id == user_id,
        Watchlist.status == "Watched"
    ).count()
    
    return {
        "to_watch": to_watch,
        "watching": watching,
        "watched": watched,
        "total": to_watch + watching + watched
    }


# ============================================
# REVIEW FUNCTIONS
# ============================================

class Review_Funcations:

    @staticmethod
    def add_review(db: Session, user_id: int, movie_id: int, rating: float, comment: Optional[str]):
        movie = get_movie_by_id(db, movie_id)
        if not movie:
            raise HTTPException(status_code=404, detail="Movie not found")

        existing = get_existing_review(db, user_id, movie_id)
        if existing:
            raise HTTPException(status_code=400, detail="You already reviewed this movie")

        sentiment = _sentiment_placeholder(comment)
        review = Reviews(
            movie_id=movie_id,
            user_id=user_id,
            rating=float(rating),
            comment=comment,
            sentiment_score=sentiment,
        )
        db.add(review)
        db.commit()
        db.refresh(review)
        recalc_movie_rating(db, movie_id)
        logger.info(f"Review {review.id} created by user {user_id} for movie {movie_id}")
        return review

    @staticmethod
    def update_review(db: Session, review_id: int, user_id: int, rating: Optional[float], comment: Optional[str]):
        review = get_review_by_id(db, review_id, user_id)
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")

        hist = ReviewHistory(
            review_id=review.id,
            user_id=user_id,
            old_rating=review.rating,
            old_comment=review.comment,
        )
        db.add(hist)

        if rating is not None:
            review.rating = float(rating)
        if comment is not None:
            review.comment = comment

        review.sentiment_score = _sentiment_placeholder(comment)
        db.add(review)
        db.commit()
        db.refresh(review)
        recalc_movie_rating(db, review.movie_id)
        logger.info(f"Review {review_id} updated by user {user_id}")
        return review

    @staticmethod
    def delete_review(db: Session, review_id: int, user_id: int):
        review = get_review_by_id(db, review_id, user_id)
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")

        movie_id = review.movie_id
        db.delete(review)
        db.commit()
        recalc_movie_rating(db, movie_id)
        logger.info(f"Review {review_id} deleted by user {user_id}")
        return 

    @staticmethod
    def list_reviews_by_movie(
        db: Session,
        movie_id: int,
        page: int = 1,
        size: int = 10,
        ratingFrom: float = 0.0,
        userId: Optional[int] = None,
        sort: str = "created_at",
        order: str = "desc",
    ):
        q = get_reviews_by_movie(db, movie_id)
        if ratingFrom:
            q = q.filter(Reviews.rating >= ratingFrom)
        if userId:
            q = q.filter(Reviews.user_id == userId)
        total = q.count()

        order_col = Reviews.like_count if sort == "helpful" else getattr(Reviews, sort, Reviews.created_at)
        if order.lower() == "desc":
            q = q.order_by(desc(order_col))
        else:
            q = q.order_by(order_col)
        reviews = q.offset((page - 1) * size).limit(size).all()

        return {"total": total, "page": page, "size": size, "reviews": reviews}

    @staticmethod
    def like_review(db: Session, review_id: int, user_id: int):
        review = get_review_by_id(db, review_id)
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")

        exists = get_like_by_user(db, review_id, user_id)
        if exists:
            logger.info(f"User {user_id} already liked review {review_id}")
            return {"message": "Already liked", "like_count": review.like_count}

        like = ReviewLikes(review_id=review_id, user_id=user_id)
        db.add(like)
        review.like_count = (review.like_count or 0) + 1
        db.add(review)
        db.commit()
        db.refresh(review)
        logger.info(f"User {user_id} liked review {review_id}")
        return {"message": "Review liked", "like_count": review.like_count}
