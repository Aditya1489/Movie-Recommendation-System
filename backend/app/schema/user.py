from pydantic import BaseModel, EmailStr, Field, conint, constr
from typing import Optional, List
import enum
from datetime import datetime

class RoleEnum(str, enum.Enum):
    user = "user"
    admin = "admin"

class RegisterSchema(BaseModel):
    username: str = Field(..., min_length=3)
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: RoleEnum = RoleEnum.user

class LoginSchema(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    role: str

# Movie Schemas (from Adarsh)
class MovieIn(BaseModel):
    title: str
    release_year: int
    description: Optional[str] = None
    genre: Optional[str] = None
    language: Optional[str] = None
    director: Optional[str] = None
    cast: Optional[str] = None
    poster_url: Optional[str] = None

class MovieUpdate(BaseModel):
    title: Optional[str] = None
    release_year: Optional[str] = None # Should this be int? keeping str as per conflict
    description: Optional[str] = None
    genre: Optional[str] = None
    language: Optional[str] = None
    director: Optional[str] = None
    cast: Optional[str] = None
    poster_url: Optional[str] = None
    rating: Optional[float] = None
    approved: Optional[bool] = None

# Review Schemas (Merged HEAD and Adarsh)
# HEAD uses conint, Adarsh uses float. DB says Float. using float.
class ReviewCreate(BaseModel):
    movie_id: int
    rating: float = Field(..., ge=0, le=10)
    comment: Optional[constr(strip_whitespace=True, max_length=2000)] = None

# Alias for compatibility if needed
class ReviewIn(BaseModel):
    movie_id: int
    rating: float
    comment: Optional[str] = None

class ReviewUpdate(BaseModel):
    rating: Optional[float] = Field(None, ge=0, le=10)
    comment: Optional[constr(strip_whitespace=True, max_length=2000)] = None

class ReviewOut(BaseModel):
    id: int
    movie_id: int
    user_id: int
    rating: float
    comment: Optional[str]
    like_count: int = 0
    sentiment_score: Optional[float]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class PaginatedReviews(BaseModel):
    total: int
    page: int
    size: int
    reviews: List[ReviewOut]

class PaginatedMovies(BaseModel):
    total: int
    page: int
    size: int
    movies: List[MovieIn] # Or MovieOut? using MovieIn for now or define MovieOut?
    # Adarsh didn't define MovieOut in the snippet, maybe implied or missing.

class PlatformSchema(BaseModel):
    movie_id : int
    platform : str
