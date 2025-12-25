#!/bin/bash
# ============================================
# Seed Movies Script
# ============================================
# 
# This script adds sample movies to the database.
# Run this after starting the backend for the first time.
#
# Usage: ./seed_movies.sh
# ============================================

set -e

cd "$(dirname "$0")"

source .venv/bin/activate

echo "🎬 Seeding sample movies to database..."
python -m app.seed_movies

echo "✅ Done!"
