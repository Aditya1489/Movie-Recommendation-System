import os

# Use SQLite for local development to avoid MySQL dependency issues
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
url = f"sqlite:///{BASE_DIR}/movie_app.db"

# JWT
SECRET_KEY = "My_Secret_Key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Logging
LOG_DIR = "logs"
os.makedirs(LOG_DIR, exist_ok=True)

# API Keys (from Adarsh)
TMDB_API_KEY = "a59259e4bba0e0e9ba7462022b67484c"
