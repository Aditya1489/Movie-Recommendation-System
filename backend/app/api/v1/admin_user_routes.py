"""
Admin User Management Routes
============================
Routes for admin to manage users (list, view, update, delete)
"""
from fastapi import APIRouter, Depends, Request, HTTPException, status, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
from functools import wraps

from app.db.session import get_db
from app.models.user import User
from app.core.logging_config import logger

router = APIRouter()
security = HTTPBearer()


def _find_request(args, kwargs):
    for a in args:
        if hasattr(a, "scope") and isinstance(getattr(a, "scope"), dict):
            return a
    return kwargs.get("request")


def admin_required(fn):
    """Decorator to ensure only admin can access"""
    @wraps(fn)
    async def wrapper(*args, **kwargs):
        request: Request = _find_request(args, kwargs)
        if not request:
            logger.error("admin_required used on endpoint without Request param")
            raise HTTPException(status_code=500, detail="Internal decorator error")
        user = getattr(request.state, "user", None)
        if not user:
            logger.info("Admin access denied: not authenticated")
            raise HTTPException(status_code=401, detail="Authentication required")
        if getattr(user, "role", "") != "admin":
            logger.info(f"Admin access denied for user {getattr(user, 'email', None)}")
            raise HTTPException(status_code=403, detail="Admin access required")
        return await fn(*args, **kwargs)
    return wrapper


# ============================================
# USER MANAGEMENT ROUTES
# ============================================

@router.get("/users", dependencies=[Security(security)])
@admin_required
async def list_all_users(
    request: Request,
    page: int = 1,
    size: int = 20,
    role: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    List all users (Admin only)
    
    - Filter by role (user/admin)
    - Search by username or email
    """
    query = db.query(User)
    
    if role:
        query = query.filter(User.role == role)
    if search:
        query = query.filter(
            (User.username.ilike(f"%{search}%")) | 
            (User.email.ilike(f"%{search}%"))
        )
    
    total = query.count()
    users = query.offset((page - 1) * size).limit(size).all()
    
    return {
        "total": total,
        "page": page,
        "size": size,
        "users": [{
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "role": u.role,
            "status": u.status,
            "created_at": u.created_at,
        } for u in users]
    }


@router.get("/users/{user_id}", dependencies=[Security(security)])
@admin_required
async def get_user_details(
    request: Request,
    user_id: int,
    db: Session = Depends(get_db),
):
    """Get details of a specific user (Admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "status": user.status,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
    }


@router.put("/users/{user_id}/role", dependencies=[Security(security)])
@admin_required
async def update_user_role(
    request: Request,
    user_id: int,
    role: str,
    db: Session = Depends(get_db),
):
    """
    Update user role (Admin only)
    
    - role: 'user' or 'admin'
    """
    if role not in ['user', 'admin']:
        raise HTTPException(status_code=400, detail="Role must be 'user' or 'admin'")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent admin from demoting themselves
    admin = request.state.user
    if user.id == admin.user_id and role != 'admin':
        raise HTTPException(status_code=400, detail="Cannot change your own role")
    
    old_role = user.role
    user.role = role
    db.commit()
    
    logger.info(f"Admin {admin.email} changed user {user.email} role from {old_role} to {role}")
    return {"message": f"User role updated to {role}"}


@router.put("/users/{user_id}/status", dependencies=[Security(security)])
@admin_required
async def toggle_user_status(
    request: Request,
    user_id: int,
    status: str,
    db: Session = Depends(get_db),
):
    """
    Change user status (Admin only)
    - status: 'active' or 'suspended'
    """
    if status not in ['active', 'suspended']:
        raise HTTPException(status_code=400, detail="Status must be 'active' or 'suspended'")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent admin from suspending themselves
    admin = request.state.user
    if user.id == admin.user_id and status == 'suspended':
        raise HTTPException(status_code=400, detail="Cannot suspend your own account")
    
    user.status = status
    db.commit()
    
    logger.info(f"Admin {admin.email} changed user {user.email} status to {status}")
    return {"message": f"User status updated to {status}"}


@router.delete("/users/{user_id}", dependencies=[Security(security)])
@admin_required
async def delete_user(
    request: Request,
    user_id: int,
    db: Session = Depends(get_db),
):
    """
    Delete a user (Admin only)
    
    This is a soft delete - user will be suspended
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent admin from deleting themselves
    admin = request.state.user
    if user.id == admin.user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    # Soft delete - suspend user
    user.status = 'suspended'
    db.commit()
    
    logger.info(f"Admin {admin.email} deleted (suspended) user {user.email}")
    return {"message": "User deleted"}


@router.get("/stats", dependencies=[Security(security)])
@admin_required
async def get_admin_stats(
    request: Request,
    db: Session = Depends(get_db),
):
    """Get dashboard stats for admin"""
    from app.models.movie import Movies
    from app.models.watchlist import Watchlist
    from app.models.review import Reviews
    
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.status == 'active').count()
    admin_count = db.query(User).filter(User.role == 'admin').count()
    total_movies = db.query(Movies).count()
    approved_movies = db.query(Movies).filter(Movies.approved == True).count()
    total_watchlist = db.query(Watchlist).count()
    total_reviews = db.query(Reviews).count()
    
    return {
        "users": {
            "total": total_users,
            "active": active_users,
            "admins": admin_count,
        },
        "movies": {
            "total": total_movies,
            "approved": approved_movies,
            "pending": total_movies - approved_movies,
        },
        "watchlist_entries": total_watchlist,
        "total_reviews": total_reviews,
    }


# ============================================
# ADMIN - CREATE USER
# ============================================

@router.post("/users", dependencies=[Security(security)])
@admin_required
async def create_user(
    request: Request,
    username: str,
    email: str,
    password: str,
    role: str = "user",
    db: Session = Depends(get_db),
):
    """
    Create a new user (Admin only)
    
    - role: 'user' or 'admin'
    """
    from app.core.security import hash_password
    
    if role not in ['user', 'admin']:
        raise HTTPException(status_code=400, detail="Role must be 'user' or 'admin'")
    
    # Check if user exists
    existing = db.query(User).filter(
        (User.email == email) | (User.username == username)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email or username already exists")
    
    # Create user
    new_user = User(
        username=username,
        email=email,
        password=hash_password(password),
        role=role,
        status='active'
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    logger.info(f"Admin {request.state.user.email} created user {email}")
    return {
        "message": "User created successfully",
        "user": {
            "id": new_user.id,
            "username": new_user.username,
            "email": new_user.email,
            "role": new_user.role,
        }
    }


# ============================================
# ADMIN - REVIEW MANAGEMENT
# ============================================

@router.get("/reviews", dependencies=[Security(security)])
@admin_required
async def list_all_reviews(
    request: Request,
    page: int = 1,
    size: int = 20,
    movie_id: Optional[int] = None,
    user_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """List all reviews (Admin only)"""
    from app.models.review import Reviews
    from app.models.movie import Movies
    
    query = db.query(Reviews)
    
    if movie_id:
        query = query.filter(Reviews.movie_id == movie_id)
    if user_id:
        query = query.filter(Reviews.user_id == user_id)
    
    total = query.count()
    reviews = query.order_by(Reviews.created_at.desc()).offset((page - 1) * size).limit(size).all()
    
    result = []
    for r in reviews:
        movie = db.query(Movies).filter(Movies.id == r.movie_id).first()
        user = db.query(User).filter(User.id == r.user_id).first()
        result.append({
            "id": r.id,
            "movie_id": r.movie_id,
            "movie_title": movie.title if movie else "Unknown",
            "user_id": r.user_id,
            "username": user.username if user else "Unknown",
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at,
        })
    
    return {"total": total, "page": page, "size": size, "reviews": result}


@router.delete("/reviews/{review_id}", dependencies=[Security(security)])
@admin_required
async def admin_delete_review(
    request: Request,
    review_id: int,
    db: Session = Depends(get_db),
):
    """Delete any review (Admin only)"""
    from app.models.review import Reviews
    
    review = db.query(Reviews).filter(Reviews.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    db.delete(review)
    db.commit()
    
    logger.info(f"Admin {request.state.user.email} deleted review {review_id}")
    return {"message": "Review deleted"}
