import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { FaSearch, FaStar, FaFilter, FaHeart, FaCheck, FaPlus } from 'react-icons/fa';

const Movies = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('');
    const [sortBy, setSortBy] = useState('rating');
    const [watchlistStatus, setWatchlistStatus] = useState({});

    const genres = ['Action', 'Drama', 'Comedy', 'Thriller', 'Sci-Fi', 'Horror', 'Romance', 'Animation'];

    useEffect(() => {
        fetchMovies();
    }, [selectedGenre, sortBy]);

    const fetchMovies = async () => {
        setLoading(true);
        try {
            const params = { size: 50, sort: sortBy };
            if (searchQuery) params.title = searchQuery;
            if (selectedGenre) params.genre = selectedGenre;

            const res = await api.get('/movies/list', { params });
            const movieList = res.data.movies || [];
            setMovies(movieList);

            // Check watchlist status for each movie
            checkWatchlistStatus(movieList);
        } catch (error) {
            console.error('Error fetching movies:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkWatchlistStatus = async (movieList) => {
        const statusMap = {};
        for (const movie of movieList) {
            try {
                const res = await api.get(`/watchlist/watchlist/${movie.id}/check`);
                statusMap[movie.id] = res.data.in_watchlist;
            } catch (err) {
                statusMap[movie.id] = false;
            }
        }
        setWatchlistStatus(statusMap);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchMovies();
    };

    const toggleWatchlist = async (movieId, e) => {
        e.preventDefault();
        e.stopPropagation();

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
            alert(err.response?.data?.detail || 'Failed to update watchlist');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Browse Movies</h1>
                </div>

                {/* Search & Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                    <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
                        {/* Search */}
                        <div className="flex-1 min-w-[200px] relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search movies..."
                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                            />
                        </div>

                        {/* Genre Filter */}
                        <div className="relative">
                            <select
                                value={selectedGenre}
                                onChange={(e) => setSelectedGenre(e.target.value)}
                                className="appearance-none px-4 py-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E50914] bg-white"
                            >
                                <option value="">All Genres</option>
                                {genres.map(genre => (
                                    <option key={genre} value={genre}>{genre}</option>
                                ))}
                            </select>
                            <FaFilter className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>

                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E50914] bg-white"
                        >
                            <option value="rating">Top Rated</option>
                            <option value="release_year">Newest</option>
                            <option value="title">A-Z</option>
                        </select>

                        <button
                            type="submit"
                            className="px-6 py-3 bg-[#E50914] text-white font-bold rounded-lg hover:bg-[#b0060f] transition"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* Results Count */}
                <p className="text-gray-500 mb-6">{movies.length} movies found</p>

                {/* Movies Grid */}
                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading movies...</div>
                ) : movies.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">No movies found</p>
                        <p className="text-gray-400">Try different search criteria</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {movies.map(movie => (
                            <Link to={`/movies/${movie.id}`} key={movie.id} className="group relative">
                                <div className="aspect-[2/3] bg-gray-200 rounded-xl overflow-hidden group-hover:ring-2 group-hover:ring-[#E50914] transition-all duration-300 group-hover:-translate-y-2 shadow-lg">
                                    <img
                                        src={movie.poster_url || "https://via.placeholder.com/300x450?text=No+Poster"}
                                        alt={movie.title}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />

                                    {/* Watchlist Button */}
                                    <button
                                        onClick={(e) => toggleWatchlist(movie.id, e)}
                                        className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition shadow-lg ${watchlistStatus[movie.id]
                                                ? 'bg-[#E50914] text-white'
                                                : 'bg-white/90 text-gray-700 hover:bg-[#E50914] hover:text-white'
                                            }`}
                                    >
                                        {watchlistStatus[movie.id] ? <FaCheck /> : <FaPlus />}
                                    </button>
                                </div>

                                <div className="mt-3">
                                    <h3 className="font-semibold text-gray-900 truncate group-hover:text-[#E50914] transition">
                                        {movie.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <span className="flex items-center gap-1 text-yellow-500">
                                            <FaStar size={12} /> {movie.rating?.toFixed(1) || 'N/A'}
                                        </span>
                                        <span>•</span>
                                        <span>{movie.release_year}</span>
                                        {movie.genre && (
                                            <>
                                                <span>•</span>
                                                <span className="truncate">{movie.genre.split(',')[0]}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Movies;
