from sqlalchemy.orm import Session
from app.models import Movies, Reviews, ReviewLikes, User, UserLogin # Updated imports to match new models

# Helper functions for reviews (HEAD version)
def get_movie_by_id(db: Session, movie_id: int):
    return db.query(Movies).filter(Movies.id == movie_id).first()

def get_existing_review(db: Session, user_id: int, movie_id: int):
    return db.query(Reviews).filter(Reviews.user_id == user_id, Reviews.movie_id == movie_id).first()

def get_review_by_id(db: Session, review_id: int, user_id: int = None):
    q = db.query(Reviews).filter(Reviews.id == review_id)
    if user_id:
        q = q.filter(Reviews.user_id == user_id)
    return q.first()

def get_reviews_by_movie(db: Session, movie_id: int):
    return db.query(Reviews).filter(Reviews.movie_id == movie_id)

def get_like_by_user(db: Session, review_id: int, user_id: int):
    return db.query(ReviewLikes).filter(ReviewLikes.review_id == review_id, ReviewLikes.user_id == user_id).first()

# Auth helpers (kept from HEAD just in case, though create_user.py uses repo now)
def reg(db: Session, email: str, username: str):
    return db.query(User).filter((User.email == email) | (User.username == username)).first()

def log(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def val(db: Session, token: str):
    return db.query(UserLogin).filter(UserLogin.token == token, UserLogin.status == "active").first()

def log_out(db: Session, token: str):
    return db.query(UserLogin).filter(UserLogin.token == token).first()
