import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { FaPlay, FaPlus, FaCheck, FaArrowLeft, FaStar, FaUser, FaThumbsUp, FaEye, FaClock, FaCheckCircle } from 'react-icons/fa';

const MovieDetails = () => {
    const { movie_id } = useParams();
    const { user } = useAuth();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [watchlistInfo, setWatchlistInfo] = useState({ inWatchlist: false, status: null });
    const [addingToWatchlist, setAddingToWatchlist] = useState(false);

    // Reviews
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        fetchMovie();
        checkWatchlist();
        fetchReviews();
    }, [movie_id]);

    const fetchMovie = async () => {
        try {
            const res = await api.get(`/movies/movies/${movie_id}`);
            setMovie(res.data);
        } catch (err) {
            console.error('Error fetching movie:', err);
            setError(err.response?.data?.detail || 'Failed to load movie details');
        } finally {
            setLoading(false);
        }
    };

    const checkWatchlist = async () => {
        try {
            const res = await api.get(`/watchlist/watchlist/${movie_id}/check`);
            setWatchlistInfo({
                inWatchlist: res.data.in_watchlist || false,
                status: res.data.status || null
            });
        } catch (err) {
            setWatchlistInfo({ inWatchlist: false, status: null });
        }
    };

    const addToWatchlist = async (status = 'To Watch') => {
        setAddingToWatchlist(true);
        try {
            await api.post('/watchlist/watchlist', { movie_ids: [parseInt(movie_id)], status });
            setWatchlistInfo({ inWatchlist: true, status });
        } catch (err) {
            console.error('Error adding to watchlist:', err);
            alert(err.response?.data?.detail || 'Failed to add to watchlist');
        } finally {
            setAddingToWatchlist(false);
        }
    };

    const updateWatchlistStatus = async (newStatus) => {
        try {
            await api.put(`/watchlist/watchlist/${movie_id}?status=${newStatus}`);
            setWatchlistInfo({ ...watchlistInfo, status: newStatus });
        } catch (err) {
            console.error('Error updating status:', err);
            alert(err.response?.data?.detail || 'Failed to update status');
        }
    };

    const removeFromWatchlist = async () => {
        try {
            await api.delete(`/watchlist/watchlist/${movie_id}`);
            setWatchlistInfo({ inWatchlist: false, status: null });
        } catch (err) {
            console.error('Error removing from watchlist:', err);
        }
    };

    const fetchReviews = async () => {
        try {
            const res = await api.get(`/reviews/Get_Reviews_by_movie_id/${movie_id}`);
            setReviews(res.data.reviews || []);
        } catch (err) {
            console.error('Error fetching reviews:', err);
        } finally {
            setReviewsLoading(false);
        }
    };

    const submitReview = async (e) => {
        e.preventDefault();
        setSubmittingReview(true);
        try {
            await api.post('/reviews/Write_Reviews', {
                movie_id: parseInt(movie_id),
                rating: newReview.rating,
                comment: newReview.comment,
            });
            setShowReviewForm(false);
            setNewReview({ rating: 5, comment: '' });
            fetchReviews();
            fetchMovie();
            alert('Review submitted!');
        } catch (err) {
            console.error('Error submitting review:', err);
            alert(err.response?.data?.detail || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    const likeReview = async (reviewId) => {
        try {
            await api.post(`/reviews/Like_Reviews/${reviewId}/like`);
            fetchReviews();
        } catch (err) {
            console.error('Error liking review:', err);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Watching': return <FaEye />;
            case 'Watched': return <FaCheckCircle />;
            default: return <FaClock />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Watching': return 'bg-blue-500';
            case 'Watched': return 'bg-green-500';
            default: return 'bg-yellow-500';
        }
    };

    if (loading) {
        return (
            <div className="h-screen bg-black text-white flex items-center justify-center">
                Loading...
            </div>
        );
    }

    if (error || !movie) {
        return (
            <div className="h-screen bg-black text-white flex flex-col items-center justify-center">
                <p className="text-red-500 mb-4">{error || 'Movie not found'}</p>
                <Link to="/" className="text-[#E50914] hover:underline">← Back to Home</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Hero Section */}
            <div className="relative h-[70vh] w-full">
                <div className="absolute inset-0">
                    <img
                        src={movie.poster_url || "https://via.placeholder.com/1920x1080?text=No+Image"}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent"></div>
                </div>

                {/* Back Button */}
                <Link
                    to="/"
                    className="absolute top-24 left-8 flex items-center gap-2 text-white/80 hover:text-white transition z-10"
                >
                    <FaArrowLeft /> Back
                </Link>

                {/* Movie Info */}
                <div className="absolute bottom-16 left-8 md:left-16 max-w-2xl">
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-4 drop-shadow-xl">
                        {movie.title}
                    </h1>

                    <div className="flex items-center gap-4 mb-6 text-sm md:text-base">
                        <span className="flex items-center gap-1 text-yellow-400">
                            <FaStar /> {movie.rating?.toFixed(1) || 'N/A'}
                        </span>
                        <span className="text-gray-300">{movie.release_year}</span>
                        <span className="px-2 py-0.5 border border-gray-500 rounded text-xs">{movie.language?.toUpperCase()}</span>
                        <span className="text-gray-400">{movie.genre}</span>
                    </div>

                    <p className="text-gray-200 text-lg mb-8 line-clamp-4 leading-relaxed">
                        {movie.description || "No description available."}
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <button className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded font-bold hover:bg-gray-200 transition">
                            <FaPlay /> Play
                        </button>

                        {/* Watchlist Controls */}
                        {!watchlistInfo.inWatchlist ? (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => addToWatchlist('To Watch')}
                                    disabled={addingToWatchlist}
                                    className="flex items-center gap-2 bg-gray-600/50 text-white px-6 py-3 rounded font-bold border border-gray-500 hover:bg-gray-600 transition"
                                >
                                    <FaClock /> To Watch
                                </button>
                                <button
                                    onClick={() => addToWatchlist('Watching')}
                                    disabled={addingToWatchlist}
                                    className="flex items-center gap-2 bg-blue-600/80 text-white px-6 py-3 rounded font-bold hover:bg-blue-600 transition"
                                >
                                    <FaEye /> Watching
                                </button>
                                <button
                                    onClick={() => addToWatchlist('Watched')}
                                    disabled={addingToWatchlist}
                                    className="flex items-center gap-2 bg-green-600/80 text-white px-6 py-3 rounded font-bold hover:bg-green-600 transition"
                                >
                                    <FaCheckCircle /> Watched
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                {/* Current Status Badge */}
                                <div className={`flex items-center gap-2 ${getStatusColor(watchlistInfo.status)} text-white px-4 py-3 rounded font-bold`}>
                                    {getStatusIcon(watchlistInfo.status)} {watchlistInfo.status}
                                </div>

                                {/* Status Dropdown */}
                                <select
                                    value={watchlistInfo.status}
                                    onChange={(e) => updateWatchlistStatus(e.target.value)}
                                    className="bg-gray-700 text-white px-4 py-3 rounded font-medium border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                                >
                                    <option value="To Watch">📋 To Watch</option>
                                    <option value="Watching">👁️ Watching</option>
                                    <option value="Watched">✅ Watched</option>
                                </select>

                                {/* Remove Button */}
                                <button
                                    onClick={removeFromWatchlist}
                                    className="flex items-center gap-2 bg-red-600/50 text-white px-4 py-3 rounded font-bold hover:bg-red-600 transition border border-red-500"
                                >
                                    Remove
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Details Section */}
            <div className="px-8 md:px-16 py-12 bg-black">
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    <div className="md:col-span-2">
                        <h2 className="text-2xl font-bold mb-4">About</h2>
                        <p className="text-gray-300 leading-relaxed">
                            {movie.description || "No description available for this movie."}
                        </p>
                    </div>

                    <div className="space-y-4">
                        {movie.director && (
                            <div>
                                <span className="text-gray-500">Director: </span>
                                <span className="text-white">{movie.director}</span>
                            </div>
                        )}
                        {movie.cast && (
                            <div>
                                <span className="text-gray-500">Cast: </span>
                                <span className="text-white">{movie.cast}</span>
                            </div>
                        )}
                        {movie.genre && (
                            <div>
                                <span className="text-gray-500">Genre: </span>
                                <span className="text-white">{movie.genre}</span>
                            </div>
                        )}
                        {movie.language && (
                            <div>
                                <span className="text-gray-500">Language: </span>
                                <span className="text-white">{movie.language.toUpperCase()}</span>
                            </div>
                        )}

                        {/* Watchlist Status Info */}
                        {watchlistInfo.inWatchlist && (
                            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                                <p className="text-gray-400 text-sm mb-2">In Your List</p>
                                <div className={`inline-flex items-center gap-2 ${getStatusColor(watchlistInfo.status)} text-white px-3 py-1 rounded-full text-sm font-medium`}>
                                    {getStatusIcon(watchlistInfo.status)} {watchlistInfo.status}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="border-t border-gray-800 pt-12">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold">Reviews ({reviews.length})</h2>
                        {!showReviewForm && (
                            <button
                                onClick={() => setShowReviewForm(true)}
                                className="px-6 py-2 bg-[#E50914] text-white rounded-lg font-bold hover:bg-[#b0060f] transition"
                            >
                                Write a Review
                            </button>
                        )}
                    </div>

                    {/* Review Form */}
                    {showReviewForm && (
                        <div className="bg-gray-900 rounded-xl p-6 mb-8">
                            <h3 className="text-xl font-bold mb-4">Write Your Review</h3>
                            <form onSubmit={submitReview}>
                                <div className="mb-4">
                                    <label className="block text-gray-400 mb-2">Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                            <button
                                                key={num}
                                                type="button"
                                                onClick={() => setNewReview({ ...newReview, rating: num })}
                                                className={`w-10 h-10 rounded-full border-2 font-bold transition ${newReview.rating >= num
                                                        ? 'bg-yellow-500 border-yellow-500 text-black'
                                                        : 'border-gray-600 text-gray-400 hover:border-yellow-500'
                                                    }`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-400 mb-2">Comment</label>
                                    <textarea
                                        value={newReview.comment}
                                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                        rows={4}
                                        className="w-full bg-gray-800 text-white rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                                        placeholder="Share your thoughts about this movie..."
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        disabled={submittingReview}
                                        className="px-6 py-2 bg-[#E50914] text-white rounded-lg font-bold hover:bg-[#b0060f] transition disabled:opacity-50"
                                    >
                                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowReviewForm(false)}
                                        className="px-6 py-2 bg-gray-700 text-white rounded-lg font-bold hover:bg-gray-600 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Reviews List */}
                    {reviewsLoading ? (
                        <p className="text-gray-500">Loading reviews...</p>
                    ) : reviews.length === 0 ? (
                        <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                    ) : (
                        <div className="space-y-6">
                            {reviews.map(review => (
                                <div key={review.id} className="bg-gray-900 rounded-xl p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                                                <FaUser className="text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium">User {review.user_id}</p>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(review.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-yellow-400">
                                            <FaStar />
                                            <span className="font-bold">{review.rating}/10</span>
                                        </div>
                                    </div>

                                    <p className="text-gray-300 mb-4">{review.comment || 'No comment'}</p>

                                    <button
                                        onClick={() => likeReview(review.id)}
                                        className="flex items-center gap-2 text-gray-400 hover:text-[#E50914] transition"
                                    >
                                        <FaThumbsUp /> {review.like_count || 0} Helpful
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MovieDetails;
