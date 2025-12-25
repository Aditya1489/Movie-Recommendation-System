from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.user_services import (
    search_movies,
    add_to_watchlist,
    list_watchlist,
    remove_from_watchlist,
    remove_bulk_watchlist,
    check_in_watchlist,
    update_watchlist_status,
    watchlist_status,
)
from app.validators.user import (
    SearchParams,
    WatchlistAdd,
)
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import decode_access_token, user_required
from app.core.logging_config import logger
from types import SimpleNamespace
from fastapi import HTTPException
from typing import List, Optional

user = APIRouter()
bearer_scheme = HTTPBearer()


# ---------------- Dashboard ---------------- #
@user.get("/dashboard")
@user_required
async def user_dashboard(
    request: Request, credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)
):
    """User Dashboard"""
    return {"message": f"Welcome user {request.state.user.email} to your dashboard!"}


# ---------------- Watchlist Summary (MUST be before /{movie_id} routes) ---------------- #
@user.get("/watchlist/summary")
@user_required
async def get_watchlist_summary(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
):
    """Get watchlist summary by status"""
    return watchlist_status(db=db, user_id=request.state.user.user_id)


# ---------------- Watchlist CRUD ---------------- #
@user.post("/watchlist")
@user_required
async def add_movie_to_watchlist(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    payload: WatchlistAdd = None,
    db: Session = Depends(get_db),
):
    """Add movie(s) to watchlist"""
    user_id = request.state.user.user_id
    if payload and payload.movie_ids:
        return add_to_watchlist(
            db=db,
            user_id=user_id,
            movie_ids=payload.movie_ids,
            status=payload.status,
        )
    return {"message": "No movies to add"}


@user.get("/watchlist")
@user_required
async def get_watchlist(
    request: Request,
    status: Optional[str] = None,
    sort: str = "added_at",
    order: str = "desc",
    page: int = 1,
    size: int = 20,
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
):
    """Get user's watchlist"""
    data = list_watchlist(
        db=db,
        user_id=request.state.user.user_id,
        status=status,
        sort=sort,
        order=order,
        page=page,
        size=size,
    )
    return data


@user.put("/watchlist/{movie_id}")
@user_required
async def update_watchlist(
    movie_id: int,
    status: str,
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
):
    """Update watchlist item status"""
    return update_watchlist_status(
        db=db, user_id=request.state.user.user_id, movie_id=movie_id, status=status
    )


@user.delete("/watchlist/{movie_id}")
@user_required
async def delete_watchlist_item(
    movie_id: int,
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
):
    """Remove a movie from watchlist"""
    return remove_from_watchlist(
        db=db, user_id=request.state.user.user_id, movie_id=movie_id
    )


@user.delete("/watchlist/bulk")
@user_required
async def delete_bulk_watchlist(
    request: Request,
    movie_ids: List[int],
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
):
    """Bulk delete from watchlist"""
    return remove_bulk_watchlist(
        db=db, user_id=request.state.user.user_id, movie_ids=movie_ids
    )


@user.get("/watchlist/{movie_id}/check")
@user_required
async def check_watchlist(
    movie_id: int,
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
):
    """Check if movie is in watchlist"""
    return check_in_watchlist(
        db=db, user_id=request.state.user.user_id, movie_id=movie_id
    )


# ---------------- Movie Search ---------------- #
@user.post("/movies/search")
def movies_search(params: SearchParams, db: Session = Depends(get_db)):
    """Search movies"""
    return search_movies(
        db=db,
        q=params.q,
        genre=params.genre,
        page=params.page,
        limit=params.limit,
        sort_by=params.sort_by,
        order=params.order,
    )
