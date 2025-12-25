from pydantic import BaseModel, EmailStr, Field, field_validator
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

class TokenValidateRequest(BaseModel):
    ac_token: Optional[str] = None

class LogoutRequest(BaseModel):
    user_login_id: int

class MovieIn(BaseModel):
    title: str
    description: Optional[str] = None
    genre: Optional[str] = None

class ReviewIn(BaseModel):
    movie_id: int
    rating: float
    comment: Optional[str] = None

class SearchParams(BaseModel):
    q: Optional[str] = None
    genre: Optional[str] = None
    page: int = 1
    limit: int = 10
    sort_by: Optional[str] = "rating"
    order: Optional[str] = "desc"




# ------------- Watchlist Validators -------------- #

class StatusEnum(str, enum.Enum):
    To_Watch = "To Watch"
    Watched = "Watched"

class WatchlistAdd(BaseModel):
    movie_ids: Optional[List[int]] = None
    movie_titles: Optional[List[str]] = None
    status: str = "To Watch"

    @field_validator("movie_titles", mode="before")
    @classmethod
    def normalize_titles(cls, titles):
        if titles is None:
            return None
        if isinstance(titles, str):
            titles = [titles]
        return [t.strip().title() for t in titles]

class WatchlistOut(BaseModel):
    movie_id: int
    title : str
    status: str
    added_at: datetime

class WatchlistStatus(BaseModel):
    inWatchlist: bool
    status : Optional[str] = None

