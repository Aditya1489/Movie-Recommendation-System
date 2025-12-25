import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { FaPlay, FaInfoCircle, FaStar, FaPlus, FaCheck } from 'react-icons/fa';

const Home = () => {
    const navigate = useNavigate();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [watchlistStatus, setWatchlistStatus] = useState({});

    useEffect(() => {
        fetchMovies();
    }, []);

    const fetchMovies = async () => {
        try {
            const res = await api.get('/movies/list', { params: { size: 40, sort: 'rating' } });
            const movieList = res.data.movies || [];
            setMovies(movieList);
            checkWatchlistStatus(movieList);
        } catch (err) {
            console.error('Error fetching movies:', err);
            setError('Failed to load movies');
        } finally {
            setLoading(false);
        }
    };

    const checkWatchlistStatus = async (movieList) => {
        const statusMap = {};
        for (const movie of movieList.slice(0, 10)) {
            try {
                const res = await api.get(`/watchlist/watchlist/${movie.id}/check`);
                statusMap[movie.id] = res.data.in_watchlist;
            } catch (err) {
                statusMap[movie.id] = false;
            }
        }
        setWatchlistStatus(statusMap);
    };

    const toggleWatchlist = async (movieId) => {
        try {
            if (watchlistStatus[movieId]) {
                await api.delete(`/watchlist/watchlist/${movieId}`);
                setWatchlistStatus({ ...watchlistStatus, [movieId]: false });
            } else {
                await api.post('/watchlist/watchlist', { movie_ids: [movieId], status: 'To Watch' });
                setWatchlistStatus({ ...watchlistStatus, [movieId]: true });
            }
        } catch (err) {
            console.error('Error updating watchlist:', err);
        }
    };

    if (loading) {
        return <div className="h-screen bg-gray-50 flex items-center justify-center text-gray-900">Loading...</div>;
    }

    if (error) {
        return (
            <div className="h-screen bg-gray-50 flex flex-col items-center justify-center">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    const featuredMovie = movies[0];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            {featuredMovie && (
                <div className="relative h-[85vh] w-full">
                    <div className="absolute inset-0">
                        <img
                            src={featuredMovie.poster_url || "https://via.placeholder.com/1920x1080?text=No+Image"}
                            alt={featuredMovie.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-black/40 to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent"></div>
                    </div>

                    <div className="absolute bottom-24 left-8 md:left-16 max-w-2xl z-10">
                        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4 drop-shadow-xl">
                            {featuredMovie.title}
                        </h1>

                        <div className="flex items-center gap-4 mb-4 text-white/90">
                            <span className="flex items-center gap-1 text-yellow-400">
                                <FaStar /> {featuredMovie.rating?.toFixed(1) || 'N/A'}
                            </span>
                            <span>{featuredMovie.release_year}</span>
                            <span className="px-2 py-0.5 border border-white/50 rounded text-sm">{featuredMovie.language?.toUpperCase()}</span>
                        </div>

                        <p className="text-white/80 text-lg mb-8 line-clamp-3">
                            {featuredMovie.description || "A captivating movie experience awaits you."}
                        </p>

                        <div className="flex gap-4">
                            <button className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded font-bold hover:bg-gray-200 transition">
                                <FaPlay /> Play
                            </button>
                            <button
                                onClick={() => navigate(`/movies/${featuredMovie.id}`)}
                                className="flex items-center gap-2 bg-gray-600/50 text-white px-8 py-3 rounded font-bold hover:bg-gray-600 transition border border-white/30"
                            >
                                <FaInfoCircle /> More Info
                            </button>
                            <button
                                onClick={() => toggleWatchlist(featuredMovie.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded font-bold transition ${watchlistStatus[featuredMovie.id]
                                        ? 'bg-[#E50914] text-white'
                                        : 'bg-gray-600/50 text-white border border-white/30 hover:bg-gray-600'
                                    }`}
                            >
                                {watchlistStatus[featuredMovie.id] ? <><FaCheck /> In List</> : <><FaPlus /> Add to List</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Movie Rows */}
            <div className="px-8 md:px-16 py-12 bg-gray-50">
                <MovieRow
                    title="Top Rated"
                    movies={movies}
                    watchlistStatus={watchlistStatus}
                    toggleWatchlist={toggleWatchlist}
                    navigate={navigate}
                />
                <MovieRow
                    title="Continue Watching"
                    movies={movies.slice(5, 15)}
                    watchlistStatus={watchlistStatus}
                    toggleWatchlist={toggleWatchlist}
                    navigate={navigate}
                />
                <MovieRow
                    title="New Releases"
                    movies={movies.slice().reverse()}
                    watchlistStatus={watchlistStatus}
                    toggleWatchlist={toggleWatchlist}
                    navigate={navigate}
                />
            </div>
        </div>
    );
};

const MovieRow = ({ title, movies, watchlistStatus, toggleWatchlist, navigate }) => (
    <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {movies.map(movie => (
                <div
                    key={movie.id}
                    className="flex-shrink-0 w-48 cursor-pointer group relative"
                    onClick={() => navigate(`/movies/${movie.id}`)}
                >
                    <div className="aspect-[2/3] bg-gray-200 rounded-xl overflow-hidden group-hover:ring-2 group-hover:ring-[#E50914] transition-all duration-300 group-hover:-translate-y-2 shadow-lg">
                        <img
                            src={movie.poster_url || "https://via.placeholder.com/200x300?text=No+Poster"}
                            alt={movie.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />

                        {/* Watchlist Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleWatchlist(movie.id);
                            }}
                            className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition shadow-lg opacity-0 group-hover:opacity-100 ${watchlistStatus[movie.id]
                                    ? 'bg-[#E50914] text-white'
                                    : 'bg-white/90 text-gray-700 hover:bg-[#E50914] hover:text-white'
                                }`}
                        >
                            {watchlistStatus[movie.id] ? <FaCheck size={12} /> : <FaPlus size={12} />}
                        </button>
                    </div>
                    <p className="mt-2 text-sm font-medium text-gray-800 truncate group-hover:text-[#E50914] transition">
                        {movie.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1 text-yellow-500">
                            <FaStar size={10} /> {movie.rating?.toFixed(1) || 'N/A'}
                        </span>
                        <span>{movie.release_year}</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default Home;
