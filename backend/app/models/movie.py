from sqlalchemy import (
    Column, BIGINT, String, Enum, TIMESTAMP, func,
    ForeignKey, Text, Float, Boolean, Integer
)
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.db.session import engine

class Movies(Base):
    __tablename__ = "movies"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    genre = Column(String(100))
    language = Column(String(50))
    director = Column(String(100))
    cast = Column(Text)
    release_year = Column(Integer)
    poster_url = Column(Text)
    rating = Column(Float, default=0.0)
    approved = Column(Boolean, default=False)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    status = Column(Enum("active", "deleted", name="movie_status"), default="active")
    platform = Column(String(100))
    
    creator = relationship("User", back_populates="movies")
    # reviews = relationship("Review", back_populates="movie", cascade="all, delete-orphan")
    # watchlist_entries = relationship("Watchlist", back_populates="movie", cascade="all, delete-orphan")

    # reviews = relationship("Review", back_populates="movie", cascade="all, delete-orphan")
    # watchlist_entries = relationship("Watchlist", back_populates="movie", cascade="all, delete-orphan")

class Platform(Base):
    __tablename__ = "platforms"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50))

class Region(Base):
    __tablename__ = "regions"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50))

# MOVIE AVAILABILITY
class MovieAvailability(Base):
    __tablename__ = "movie_availability"
    id = Column(Integer, primary_key=True, index=True)
    movie_id = Column(Integer, ForeignKey("movies.id", ondelete="CASCADE"))
    platform_id = Column(Integer, ForeignKey("platforms.id", ondelete="CASCADE")) # Note: platforms might not exist in conflict list?
    region_id = Column(Integer, ForeignKey("regions.id", ondelete="CASCADE")) # regions might not exist?
    availability_type = Column(String(50))
    start_date = Column(TIMESTAMP)
    end_date = Column(TIMESTAMP)
    url = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

# MOVIE VERSION HISTORY
class MovieVersion(Base):
    __tablename__ = "movie_versions"
    id = Column(Integer, primary_key=True, index=True)
    movie_id = Column(Integer, ForeignKey("movies.id", ondelete="CASCADE"))
    changed_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    previous_data = Column(Text)
    changed_at = Column(TIMESTAMP, server_default=func.now())

# Base.metadata.create_all(bind=engine)
