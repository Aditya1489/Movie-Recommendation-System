from fastapi import FastAPI
from app.middlewares.auth_middleware import AttachUserMiddleware
from app.api.v1 import auth_routes, user_watchlist_routes, movie_routes, user_review_routes
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Movie Recommendation API",
    description="Movie recommendation system with Admin and User roles",
    version="1.0.0",
)

# Add middleware to attach user from JWT
app.add_middleware(AttachUserMiddleware)

# Enable CORS for Swagger/Postman
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_routes.router, prefix="/auth")
app.include_router(user_watchlist_routes.user, prefix="/watchlist")
app.include_router(movie_routes.router, prefix="/movies")
app.include_router(user_review_routes.router, prefix="/UserReviews")
# app.include_router(user_review_routes.router, prefix="/reviews") # Assuming variable is router

@app.get("/")
def root():
    return {"message": "Welcome to Movie Recommendation API"}
