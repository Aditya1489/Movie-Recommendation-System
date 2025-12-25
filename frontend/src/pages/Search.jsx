import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { FaSearch, FaStar, FaPlus, FaCheck, FaFilter, FaTimes } from 'react-icons/fa';

const Search = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [selectedGenre, setSelectedGenre] = useState('');
    const [recentSearches, setRecentSearches] = useState([]);
    const [watchlistStatus, setWatchlistStatus] = useState({});

    const genres = ['Action', 'Drama', 'Comedy', 'Thriller', 'Sci-Fi', 'Horror', 'Romance', 'Animation'];
    const popularSearches = ['Avengers', 'Batman', 'Spider-Man', 'Inception', 'Interstellar'];

    useEffect(() => {
        // Load recent searches from localStorage
        const saved = localStorage.getItem('recentSearches');
        if (saved) setRecentSearches(JSON.parse(saved).slice(0, 5));
    }, []);

    const handleSearch = async (searchQuery = query) => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        setSearched(true);

        try {
            const params = { size: 50 };
            if (searchQuery) params.title = searchQuery;
            if (selectedGenre) params.genre = selectedGenre;

            const res = await api.get('/movies/list', { params });
            const movieList = res.data.movies || [];
            setResults(movieList);

            // Save to recent searches
            const updatedSearches = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
            setRecentSearches(updatedSearches);
            localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));

            // Check watchlist status
            checkWatchlistStatus(movieList);
        } catch (error) {
            console.error('Error searching:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const checkWatchlistStatus = async (movieList) => {
        const statusMap = {};
        for (const movie of movieList.slice(0, 20)) {
            try {
                const res = await api.get(`/watchlist/watchlist/${movie.id}/check`);
                statusMap[movie.id] = res.data.in_watchlist;
            } catch (err) {
                statusMap[movie.id] = false;
            }
        }
        setWatchlistStatus(statusMap);
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
        }
    };

    const clearSearch = () => {
        setQuery('');
        setResults([]);
        setSearched(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            {/* Search Header */}
            <div className="bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-6 py-12">
                    <h1 className="text-4xl font-bold text-gray-900 text-center mb-8">Search Movies</h1>

                    <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="relative">
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search for movies..."
                                    className="w-full pl-14 pr-12 py-4 bg-gray-50 text-gray-900 text-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E50914] border border-gray-200"
                                />
                                {query && (
                                    <button
                                        type="button"
                                        onClick={clearSearch}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <FaTimes />
                                    </button>
                                )}
                            </div>

                            {/* Genre Filter */}
                            <select
                                value={selectedGenre}
                                onChange={(e) => setSelectedGenre(e.target.value)}
                                className="px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E50914] bg-white"
                            >
                                <option value="">All Genres</option>
                                {genres.map(genre => (
                                    <option key={genre} value={genre}>{genre}</option>
                                ))}
                            </select>

                            <button
                                type="submit"
                                className="px-8 bg-[#E50914] text-white font-bold rounded-xl hover:bg-[#b0060f] transition"
                            >
                                Search
                            </button>
                        </div>
                    </form>

                    {/* Quick Search Tags */}
                    {!searched && (
                        <div className="mt-6">
                            <p className="text-gray-500 text-sm mb-3">Popular searches:</p>
                            <div className="flex flex-wrap gap-2">
                                {popularSearches.map(term => (
                                    <button
                                        key={term}
                                        onClick={() => { setQuery(term); handleSearch(term); }}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-[#E50914] hover:text-white transition"
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Searches */}
                    {!searched && recentSearches.length > 0 && (
                        <div className="mt-6">
                            <p className="text-gray-500 text-sm mb-3">Recent searches:</p>
                            <div className="flex flex-wrap gap-2">
                                {recentSearches.map(term => (
                                    <button
                                        key={term}
                                        onClick={() => { setQuery(term); handleSearch(term); }}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition flex items-center gap-2"
                                    >
                                        <FaSearch size={10} /> {term}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Results */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin w-12 h-12 border-4 border-[#E50914] border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-500">Searching...</p>
                    </div>
                ) : searched && results.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-600 text-lg">No results found for "{query}"</p>
                        <p className="text-gray-400 mt-2">Try different keywords or browse all movies</p>
                        <Link to="/movies" className="inline-block mt-4 px-6 py-3 bg-[#E50914] text-white rounded-lg font-bold hover:bg-[#b0060f] transition">
                            Browse Movies
                        </Link>
                    </div>
                ) : results.length > 0 ? (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-gray-600">Found {results.length} results for "{query}"</p>
                            <button onClick={clearSearch} className="text-[#E50914] hover:underline">Clear search</button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {results.map(movie => (
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
                    </>
                ) : (
                    <div className="text-center py-20">
                        <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">Start typing to search for movies</p>
                        <p className="text-gray-400 mt-2">Or try one of the popular searches above</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
