"""
===========================================
MOVIE RECOMMENDATION API - MAIN APPLICATION
===========================================

All routers are consolidated in this single file.
Run with: ./run_backend.sh

API Documentation: http://localhost:8000/docs
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import middleware
from app.middlewares.auth_middleware import AttachUserMiddleware

# Import all routers
from app.api.v1.auth_routes import router as auth_router
from app.api.v1.movie_routes import router as movie_router
from app.api.v1.user_watchlist_routes import user as watchlist_router
from app.api.v1.user_review_routes import router as review_router
from app.api.v1.admin_user_routes import router as admin_user_router

# ============================================
# APPLICATION CONFIGURATION
# ============================================
app = FastAPI(
    title="Movie Recommendation API",
    description="""
## 🎬 Movie Recommendation System API

### Available Routes:

#### 🔐 Authentication (`/auth`)
- POST `/auth/register` - Register new user
- POST `/auth/login` - User login
- POST `/auth/logout` - User logout
- POST `/auth/validate_token` - Validate JWT token

#### 🎥 Movies (`/movies`)
- GET `/movies/list` - List all movies (with filters)
- GET `/movies/movies/{id}` - Get movie details
- GET `/movies/admin/movies` - Admin: List all movies
- POST `/movies/admin/add_movie` - Admin: Add movie
- PUT `/movies/admin/update_movie/{id}` - Admin: Update movie
- DELETE `/movies/admin/delete_movie/{id}` - Admin: Delete movie

#### 📋 Watchlist (`/watchlist`)
- POST `/watchlist/watchlist` - Add to watchlist
- GET `/watchlist/watchlist` - Get user's watchlist
- PUT `/watchlist/watchlist/{movie_id}` - Update status
- DELETE `/watchlist/watchlist/{movie_id}` - Remove from watchlist
- GET `/watchlist/watchlist/{movie_id}/check` - Check if in watchlist

#### ⭐ Reviews (`/reviews`)
- POST `/reviews/Write_Reviews` - Create review
- GET `/reviews/Get_Reviews_by_movie_id/{id}` - Get movie reviews
- PUT `/reviews/Update_Reviews/{id}` - Update review
- DELETE `/reviews/Delete_Reviews/{id}` - Delete review
- POST `/reviews/Like_Reviews/{id}/like` - Like a review

#### 👥 Admin - Users (`/admin`)
- GET `/admin/users` - List all users
- GET `/admin/users/{id}` - Get user details
- PUT `/admin/users/{id}/role` - Update user role
- PUT `/admin/users/{id}/status` - Activate/deactivate user
- DELETE `/admin/users/{id}` - Delete user
- GET `/admin/stats` - Dashboard statistics
""",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ============================================
# MIDDLEWARE
# ============================================

# CORS - Allow all origins (configure for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT User Attachment
app.add_middleware(AttachUserMiddleware)

# ============================================
# ROUTER REGISTRATION
# ============================================

# Authentication Routes
app.include_router(
    auth_router, 
    prefix="/auth", 
    tags=["🔐 Authentication"]
)

# Movie Routes (including admin movie management)
app.include_router(
    movie_router, 
    prefix="/movies", 
    tags=["🎥 Movies"]
)

# Watchlist Routes
app.include_router(
    watchlist_router, 
    prefix="/watchlist", 
    tags=["📋 Watchlist"]
)

# Review Routes
app.include_router(
    review_router, 
    prefix="/reviews", 
    tags=["⭐ Reviews"]
)

# Admin User Management Routes
app.include_router(
    admin_user_router, 
    prefix="/admin", 
    tags=["👥 Admin - Users"]
)

# ============================================
# ROOT ENDPOINTS
# ============================================

@app.get("/", tags=["🏠 Root"])
def root():
    """API Health Check & Info"""
    return {
        "message": "🎬 Welcome to Movie Recommendation API",
        "version": "1.0.0",
        "docs": "/docs",
        "routes": {
            "auth": "/auth",
            "movies": "/movies", 
            "watchlist": "/watchlist",
            "reviews": "/reviews",
            "admin": "/admin",
        }
    }


@app.get("/health", tags=["🏠 Root"])
def health_check():
    """Health check for monitoring"""
    return {"status": "healthy", "service": "movie-recommendation-api"}
