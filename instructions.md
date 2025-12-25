# Movie Recommendation System
## Complete Setup & Usage Guide

---

## 📁 Project Structure

```
Movie_Recommendation/
├── backend/
│   ├── main.py              # Main FastAPI app (all routers)
│   ├── run_backend.sh       # Start backend server
│   ├── seed_movies.sh       # Add sample movies
│   ├── fix_posters.sh       # Fix movie poster URLs
│   └── app/
│       ├── api/v1/          # Route handlers
│       ├── services/        # Business logic
│       ├── models/          # Database models
│       └── repositories/    # Data access
│
├── frontend/
│   ├── run_frontend.sh      # Start frontend server
│   └── src/
│       ├── pages/           # React pages
│       ├── components/      # Reusable components
│       ├── context/         # Auth context
│       └── api/             # Axios config
│
└── instructions.md          # This file
```

---

## 🚀 Quick Start

### 1. Start Backend
```bash
cd backend
./run_backend.sh
```

### 2. Start Frontend (new terminal)
```bash
cd frontend
npm install  # First time only
npm run dev
# Or: bash run_frontend.sh
```

### 3. Seed Sample Movies (optional, first time)
```bash
cd backend
./seed_movies.sh
```

---

## 🌐 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| API Docs (ReDoc) | http://localhost:8000/redoc |

---

## 📡 API Endpoints (main.py)

### Authentication (`/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login (returns JWT) |
| POST | `/auth/logout` | Logout user |
| POST | `/auth/validate_token` | Validate JWT token |

### Movies (`/movies`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/movies/list` | List movies (public) |
| GET | `/movies/movies/{id}` | Get movie details |
| GET | `/movies/admin/movies` | Admin: List all movies |
| POST | `/movies/admin/add_movie` | Admin: Add movie |
| PUT | `/movies/admin/update_movie/{id}` | Admin: Update movie |
| DELETE | `/movies/admin/delete_movie/{id}` | Admin: Delete movie |

### Watchlist (`/watchlist`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/watchlist/dashboard` | User dashboard |
| POST | `/watchlist/watchlist` | Add to watchlist |
| GET | `/watchlist/watchlist` | Get watchlist |
| PUT | `/watchlist/watchlist/{id}` | Update status |
| DELETE | `/watchlist/watchlist/{id}` | Remove from watchlist |
| GET | `/watchlist/watchlist/{id}/check` | Check if in watchlist |

### Reviews (`/reviews`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/reviews/Write_Reviews` | Create review |
| GET | `/reviews/Get_Reviews_by_movie_id/{id}` | Get reviews |
| PUT | `/reviews/Update_Reviews/{id}` | Update review |
| DELETE | `/reviews/Delete_Reviews/{id}` | Delete review |
| POST | `/reviews/Like_Reviews/{id}/like` | Like review |

---

## 🔧 Backend Shell Scripts

| Script | Purpose |
|--------|---------|
| `run_backend.sh` | Start the FastAPI server |
| `seed_movies.sh` | Add 10 sample movies |
| `fix_posters.sh` | Update movie poster URLs |

---

## 🎨 Frontend Pages

| Route | Component | Features |
|-------|-----------|----------|
| `/` | Home | Hero, movie rows |
| `/movies` | Movies | Browse, search, filter |
| `/movies/:id` | MovieDetails | Details, watchlist |
| `/search` | Search | Global search |
| `/profile` | UserProfile | Profile, watchlist |
| `/admin/dashboard` | AdminDashboard | Manage movies |
| `/admin/movies/add` | AddMovie | Add new movie |

---

## 👤 User Roles

| Role | Permissions |
|------|-------------|
| `user` | Browse movies, manage watchlist, write reviews |
| `admin` | All user permissions + add/edit/delete movies |

---

## 🔒 Authentication Flow

1. User registers at `/auth/register`
2. User logs in at `/auth/login` → receives JWT token
3. Frontend stores token in `localStorage`
4. Token is sent in `Authorization: Bearer <token>` header
5. Backend validates token and attaches user to request

---

## 🛠️ Troubleshooting

### Permission Denied on .sh files (macOS)
```bash
# Use bash instead of ./
bash run_backend.sh
bash run_frontend.sh
```

### Port Already in Use
```bash
# Kill process on port 8000
lsof -ti :8000 | xargs kill -9

# Kill process on port 5173
lsof -ti :5173 | xargs kill -9
```

### Database Reset
```bash
cd backend
rm -f movie_recommendation.db
./run_backend.sh  # Will recreate tables
./seed_movies.sh  # Re-add sample movies
```
