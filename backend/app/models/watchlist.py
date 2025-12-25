from sqlalchemy import Column, Integer, String, TIMESTAMP, func, ForeignKey, UniqueConstraint
from app.db.base import Base
from app.db.session import engine

class Watchlist(Base):
    __tablename__ = "watchlist"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    movie_id = Column(Integer, ForeignKey("movies.id", ondelete="CASCADE"))
    movie_title = Column(String(255), nullable=False)
    status = Column(String(50), default="To Watch")
    added_at = Column(TIMESTAMP, server_default=func.now())
    created_at = Column(TIMESTAMP, server_default=func.now())

    __table_args__ = (UniqueConstraint("user_id", "movie_id", name="unique_user_movie"),)

# Recreate tables if needed
Base.metadata.create_all(bind=engine)