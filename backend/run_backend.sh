#!/bin/bash
# ============================================
# Movie Recommendation Backend Startup Script
# ============================================
# 
# This script starts the FastAPI backend server.
# 
# Usage: ./run_backend.sh
# 
# Available Endpoints after starting:
#   - API Docs: http://localhost:8000/docs
#   - ReDoc: http://localhost:8000/redoc
#   - Health: http://localhost:8000/health
#
# Routers:
#   - /auth - Authentication (login, register, logout)
#   - /movies - Movie operations (list, details, admin CRUD)
#   - /watchlist - User watchlist management
#   - /reviews - Movie reviews and ratings
# ============================================

set -e

echo "============================================"
echo "  Movie Recommendation API - Backend"
echo "============================================"
echo ""

# Navigate to script directory
cd "$(dirname "$0")"

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "🔧 Virtual environment not found. Creating..."
    python3 -m venv .venv
    source .venv/bin/activate
    echo "📦 Installing dependencies..."
    pip install -r requirements.txt
else
    source .venv/bin/activate
fi

# Check if port 8000 is in use
PID=$(lsof -ti :8000 || true)
if [ ! -z "$PID" ]; then
    echo "⚠️  Port 8000 is in use by PID $PID. Killing it..."
    kill -9 $PID
    sleep 1
fi

echo ""
echo "📍 Starting server at: http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo "📖 ReDoc Documentation: http://localhost:8000/redoc"
echo ""
echo "Available Routes:"
echo "  • /auth - Authentication"
echo "  • /movies - Movie operations"
echo "  • /watchlist - User watchlist"
echo "  • /reviews - Reviews & ratings"
echo ""
echo "============================================"
echo ""

# Run the FastAPI server
uvicorn main:app --reload --port 8000 --host 0.0.0.0
