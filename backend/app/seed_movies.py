"""
Seed script to populate the database with sample movies.
Run this from the backend directory with: python -m app.seed_movies
"""
import sys
sys.path.insert(0, '.')

from app.db.session import SessionLocal
from app.models.movie import Movies

SAMPLE_MOVIES = [
    {
        "title": "The Dark Knight",
        "description": "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
        "genre": "Action, Crime, Drama",
        "language": "en",
        "director": "Christopher Nolan",
        "cast": "Christian Bale, Heath Ledger, Aaron Eckhart",
        "release_year": 2008,
        "poster_url": "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        "rating": 9.0,
        "approved": True,
    },
    {
        "title": "Inception",
        "description": "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
        "genre": "Action, Sci-Fi, Thriller",
        "language": "en",
        "director": "Christopher Nolan",
        "cast": "Leonardo DiCaprio, Joseph Gordon-Levitt, Ellen Page",
        "release_year": 2010,
        "poster_url": "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Ber.jpg",
        "rating": 8.8,
        "approved": True,
    },
    {
        "title": "Interstellar",
        "description": "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
        "genre": "Adventure, Drama, Sci-Fi",
        "language": "en",
        "director": "Christopher Nolan",
        "cast": "Matthew McConaughey, Anne Hathaway, Jessica Chastain",
        "release_year": 2014,
        "poster_url": "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        "rating": 8.6,
        "approved": True,
    },
    {
        "title": "The Shawshank Redemption",
        "description": "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
        "genre": "Drama",
        "language": "en",
        "director": "Frank Darabont",
        "cast": "Tim Robbins, Morgan Freeman",
        "release_year": 1994,
        "poster_url": "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
        "rating": 9.3,
        "approved": True,
    },
    {
        "title": "Pulp Fiction",
        "description": "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
        "genre": "Crime, Drama",
        "language": "en",
        "director": "Quentin Tarantino",
        "cast": "John Travolta, Uma Thurman, Samuel L. Jackson",
        "release_year": 1994,
        "poster_url": "https://image.tmdb.org/t/p/w500/dM2w364MScsjFf8pfMbaWUcWrR.jpg",
        "rating": 8.9,
        "approved": True,
    },
    {
        "title": "The Matrix",
        "description": "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
        "genre": "Action, Sci-Fi",
        "language": "en",
        "director": "The Wachowskis",
        "cast": "Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss",
        "release_year": 1999,
        "poster_url": "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
        "rating": 8.7,
        "approved": True,
    },
    {
        "title": "Avengers: Endgame",
        "description": "After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more.",
        "genre": "Action, Adventure, Drama",
        "language": "en",
        "director": "Anthony Russo, Joe Russo",
        "cast": "Robert Downey Jr., Chris Evans, Mark Ruffalo",
        "release_year": 2019,
        "poster_url": "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
        "rating": 8.4,
        "approved": True,
    },
    {
        "title": "Parasite",
        "description": "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
        "genre": "Comedy, Drama, Thriller",
        "language": "ko",
        "director": "Bong Joon-ho",
        "cast": "Song Kang-ho, Lee Sun-kyun, Cho Yeo-jeong",
        "release_year": 2019,
        "poster_url": "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
        "rating": 8.5,
        "approved": True,
    },
    {
        "title": "Spider-Man: No Way Home",
        "description": "With Spider-Man's identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds start to appear.",
        "genre": "Action, Adventure, Fantasy",
        "language": "en",
        "director": "Jon Watts",
        "cast": "Tom Holland, Zendaya, Benedict Cumberbatch",
        "release_year": 2021,
        "poster_url": "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
        "rating": 8.3,
        "approved": True,
    },
    {
        "title": "Dune",
        "description": "Feature adaptation of Frank Herbert's science fiction novel about the son of a noble family entrusted with the protection of the most valuable asset in the galaxy.",
        "genre": "Action, Adventure, Drama",
        "language": "en",
        "director": "Denis Villeneuve",
        "cast": "Timothée Chalamet, Rebecca Ferguson, Zendaya",
        "release_year": 2021,
        "poster_url": "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
        "rating": 8.0,
        "approved": True,
    },
]


def seed_movies():
    db = SessionLocal()
    try:
        # Check if movies already exist
        existing = db.query(Movies).count()
        if existing > 0:
            print(f"Database already has {existing} movies. Skipping seed.")
            return
        
        for movie_data in SAMPLE_MOVIES:
            movie = Movies(**movie_data)
            db.add(movie)
        
        db.commit()
        print(f"Successfully added {len(SAMPLE_MOVIES)} sample movies!")
    except Exception as e:
        print(f"Error seeding movies: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_movies()
