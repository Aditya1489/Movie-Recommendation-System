#!/bin/bash

# Ensure script fails on error
set -e

echo "Starting Frontend Development Server..."

# Navigate to frontend directory (from project root if needed)
cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Check if port 5173 is in use and kill the process
PID=$(lsof -ti :5173 || true)
if [ ! -z "$PID" ]; then
    echo "Port 5173 is in use by PID $PID. Killing it..."
    kill -9 $PID
fi

# Run the Vite dev server
npm run dev
