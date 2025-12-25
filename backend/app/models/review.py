from sqlalchemy import (
    Column, Integer, BigInteger, String, Text, Float, Boolean, TIMESTAMP,
    ForeignKey, func, Enum, CheckConstraint, UniqueConstraint
)
from app.db.base import Base
from app.db.session import engine
from pydantic import BaseModel
import enum

# Reviews
class Reviews(Base):
    __tablename__ = "reviews"
    id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True, index=True)
    movie_id = Column(BigInteger().with_variant(Integer, "sqlite"), ForeignKey("movies.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(BigInteger().with_variant(Integer, "sqlite"), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Float, nullable=False)  # DB-level CHECK can be applied with migrations
    comment = Column(Text)
    like_count = Column(Integer, default=0)
    sentiment_score = Column(Float, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "movie_id", name="unique_user_movie_review"),
        CheckConstraint("rating >= 0 AND rating <= 10", name="rating_range_check"),
    )

# Review likes (prevent duplicate likes)
class ReviewLikes(Base):
    __tablename__ = "review_likes"
    id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True, index=True)
    review_id = Column(BigInteger().with_variant(Integer, "sqlite"), ForeignKey("reviews.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(BigInteger().with_variant(Integer, "sqlite"), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    __table_args__ = (UniqueConstraint("review_id", "user_id", name="unique_review_user_like"),)

# Review history (audit)
class ReviewHistory(Base):
    __tablename__ = "review_history"
    id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True, index=True)
    review_id = Column(BigInteger().with_variant(Integer, "sqlite"), nullable=False)
    user_id = Column(BigInteger().with_variant(Integer, "sqlite"), nullable=False)
    old_rating = Column(Float)
    old_comment = Column(Text)
    changed_at = Column(TIMESTAMP, server_default=func.now())

    # create all tables
# Base.metadata.create_all(bind=engine)

