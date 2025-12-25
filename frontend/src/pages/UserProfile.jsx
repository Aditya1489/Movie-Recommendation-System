import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaHeart, FaHistory, FaSignOutAlt, FaEye, FaTrash, FaStar, FaEdit, FaClock, FaCheckCircle, FaFilm } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

const UserProfile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [watchlist, setWatchlist] = useState([]);
    const [summary, setSummary] = useState({ to_watch: 0, watching: 0, watched: 0, total: 0 });
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('watchlist');
    const [activeFilter, setActiveFilter] = useState('');
    const [editingReview, setEditingReview] = useState(null);
    const [editReviewData, setEditReviewData] = useState({ rating: 5, comment: '' });

    useEffect(() => {
        fetchData();
    }, [activeFilter]);

    const fetchData = async () => {
        try {
            // Fetch watchlist
            const params = { size: 50 };
            if (activeFilter) params.status = activeFilter;
            const watchlistRes = await api.get('/watchlist/watchlist', { params });
            setWatchlist(watchlistRes.data.items || []);

            // Fetch summary
            try {
                const summaryRes = await api.get('/watchlist/watchlist/summary');
                setSummary({
                    ...summaryRes.data,
                    total: (summaryRes.data.to_watch || 0) + (summaryRes.data.watching || 0) + (summaryRes.data.watched || 0)
                });
            } catch (e) {
                console.log('Summary not available');
            }

            // Fetch user's reviews
            const reviewsRes = await api.get('/reviews/my_reviews');
            setReviews(reviewsRes.data.reviews || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const removeFromWatchlist = async (movieId) => {
        try {
            await api.delete(`/watchlist/watchlist/${movieId}`);
            setWatchlist(watchlist.filter(item => item.movie_id !== movieId));
            fetchData();
        } catch (error) {
            console.error('Error removing:', error);
        }
    };

    const updateWatchlistStatus = async (movieId, newStatus) => {
        try {
            await api.put(`/watchlist/watchlist/${movieId}?status=${newStatus}`);
            setWatchlist(watchlist.map(item =>
                item.movie_id === movieId ? { ...item, status: newStatus } : item
            ));
            fetchData(); // Refresh summary
        } catch (error) {
            console.error('Error updating:', error);
            alert(error.response?.data?.detail || 'Failed to update');
        }
    };

    const deleteReview = async (reviewId) => {
        try {
            await api.delete(`/reviews/Delete_Reviews/${reviewId}`);
            setReviews(reviews.filter(r => r.id !== reviewId));
        } catch (error) {
            console.error('Error deleting review:', error);
        }
    };

    const startEditReview = (review) => {
        setEditingReview(review.id);
        setEditReviewData({ rating: review.rating, comment: review.comment || '' });
    };

    const updateReview = async (reviewId) => {
        try {
            await api.put(`/reviews/Update_Reviews/${reviewId}`, editReviewData);
            setReviews(reviews.map(r =>
                r.id === reviewId ? { ...r, ...editReviewData } : r
            ));
            setEditingReview(null);
        } catch (error) {
            console.error('Error updating review:', error);
            alert(error.response?.data?.detail || 'Failed to update review');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Watching': return <FaEye className="text-blue-500" />;
            case 'Watched': return <FaCheckCircle className="text-green-500" />;
            default: return <FaClock className="text-yellow-500" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Profile Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-[#E50914] rounded-full flex items-center justify-center">
                            <FaUser className="text-white text-3xl" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-900">{user?.username || user?.email}</h1>
                            <p className="text-gray-500">{user?.email}</p>
                            <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-medium ${user?.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                {user?.role?.toUpperCase()}
                            </span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                        >
                            <FaSignOutAlt /> Sign Out
                        </button>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid md:grid-cols-5 gap-4 mb-8">
                    <button
                        onClick={() => { setActiveTab('watchlist'); setActiveFilter(''); }}
                        className={`bg-white p-5 rounded-xl shadow-sm border transition ${activeTab === 'watchlist' && activeFilter === '' ? 'border-[#E50914]' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <FaFilm className="text-gray-600" />
                            </div>
                            <div className="text-left">
                                <p className="text-gray-500 text-xs">All Movies</p>
                                <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
                            </div>
                        </div>
                    </button>
                    <button
                        onClick={() => { setActiveTab('watchlist'); setActiveFilter('To Watch'); }}
                        className={`bg-white p-5 rounded-xl shadow-sm border transition ${activeFilter === 'To Watch' ? 'border-[#E50914]' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <FaClock className="text-yellow-600" />
                            </div>
                            <div className="text-left">
                                <p className="text-gray-500 text-xs">To Watch</p>
                                <p className="text-2xl font-bold text-gray-900">{summary.to_watch}</p>
                            </div>
                        </div>
                    </button>
                    <button
                        onClick={() => { setActiveTab('watchlist'); setActiveFilter('Watching'); }}
                        className={`bg-white p-5 rounded-xl shadow-sm border transition ${activeFilter === 'Watching' ? 'border-[#E50914]' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FaEye className="text-blue-600" />
                            </div>
                            <div className="text-left">
                                <p className="text-gray-500 text-xs">Watching</p>
                                <p className="text-2xl font-bold text-gray-900">{summary.watching}</p>
                            </div>
                        </div>
                    </button>
                    <button
                        onClick={() => { setActiveTab('watchlist'); setActiveFilter('Watched'); }}
                        className={`bg-white p-5 rounded-xl shadow-sm border transition ${activeFilter === 'Watched' ? 'border-[#E50914]' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <FaCheckCircle className="text-green-600" />
                            </div>
                            <div className="text-left">
                                <p className="text-gray-500 text-xs">Watched</p>
                                <p className="text-2xl font-bold text-gray-900">{summary.watched}</p>
                            </div>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`bg-white p-5 rounded-xl shadow-sm border transition ${activeTab === 'reviews' ? 'border-[#E50914]' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <FaStar className="text-purple-600" />
                            </div>
                            <div className="text-left">
                                <p className="text-gray-500 text-xs">My Reviews</p>
                                <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Watchlist Tab */}
                {activeTab === 'watchlist' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">
                                {activeFilter ? `${activeFilter} Movies` : 'My Watchlist'}
                            </h2>
                            <span className="text-gray-500">{watchlist.length} movies</span>
                        </div>

                        {loading ? (
                            <div className="p-12 text-center text-gray-500">Loading...</div>
                        ) : watchlist.length === 0 ? (
                            <div className="p-12 text-center">
                                <FaFilm className="text-5xl text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 mb-4">
                                    {activeFilter ? `No ${activeFilter.toLowerCase()} movies` : 'Your watchlist is empty'}
                                </p>
                                <Link to="/movies" className="text-[#E50914] hover:underline font-medium">Browse movies →</Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-6">
                                {watchlist.map(item => (
                                    <div key={item.movie_id} className="group relative">
                                        <Link to={`/movies/${item.movie_id}`}>
                                            <div className="aspect-[2/3] bg-gray-200 rounded-lg overflow-hidden group-hover:ring-2 group-hover:ring-[#E50914] transition">
                                                <img
                                                    src={item.poster_url || "https://via.placeholder.com/200x300?text=No+Poster"}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </Link>

                                        <div className="mt-2">
                                            <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                {getStatusIcon(item.status)}
                                                <span>{item.status}</span>
                                            </div>
                                        </div>

                                        {/* Status dropdown */}
                                        <select
                                            value={item.status}
                                            onChange={(e) => updateWatchlistStatus(item.movie_id, e.target.value)}
                                            className="mt-1 w-full text-xs p-1.5 border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                                        >
                                            <option value="To Watch">📋 To Watch</option>
                                            <option value="Watching">👁️ Watching</option>
                                            <option value="Watched">✅ Watched</option>
                                        </select>

                                        {/* Delete button */}
                                        <button
                                            onClick={() => removeFromWatchlist(item.movie_id)}
                                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg"
                                            title="Remove from watchlist"
                                        >
                                            <FaTrash size={10} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">My Reviews</h2>
                        </div>

                        {loading ? (
                            <div className="p-12 text-center text-gray-500">Loading...</div>
                        ) : reviews.length === 0 ? (
                            <div className="p-12 text-center">
                                <FaStar className="text-5xl text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 mb-4">You haven't written any reviews yet</p>
                                <Link to="/movies" className="text-[#E50914] hover:underline font-medium">Browse movies to review →</Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {reviews.map(review => (
                                    <div key={review.id} className="p-6">
                                        <div className="flex items-start gap-4">
                                            {/* Movie poster */}
                                            <Link to={`/movies/${review.movie_id}`} className="flex-shrink-0">
                                                <img
                                                    src={review.poster_url || "https://via.placeholder.com/80x120?text=Movie"}
                                                    alt={review.movie_title}
                                                    className="w-20 h-28 object-cover rounded-lg"
                                                />
                                            </Link>

                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <Link to={`/movies/${review.movie_id}`} className="text-lg font-bold text-gray-900 hover:text-[#E50914]">
                                                            {review.movie_title || `Movie #${review.movie_id}`}
                                                        </Link>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className="flex items-center gap-1 text-yellow-500">
                                                                <FaStar />
                                                                <span className="font-bold">{review.rating}/10</span>
                                                            </div>
                                                            <span className="text-gray-400 text-sm">
                                                                {new Date(review.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => startEditReview(review)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                            title="Edit review"
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteReview(review.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                            title="Delete review"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </div>

                                                {editingReview === review.id ? (
                                                    <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                                                        <div className="mb-3">
                                                            <label className="block text-sm text-gray-600 mb-1">Rating</label>
                                                            <div className="flex gap-1">
                                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                                                    <button
                                                                        key={n}
                                                                        onClick={() => setEditReviewData({ ...editReviewData, rating: n })}
                                                                        className={`w-8 h-8 rounded text-sm font-bold ${editReviewData.rating >= n ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                                                                    >
                                                                        {n}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="mb-3">
                                                            <label className="block text-sm text-gray-600 mb-1">Comment</label>
                                                            <textarea
                                                                value={editReviewData.comment}
                                                                onChange={(e) => setEditReviewData({ ...editReviewData, comment: e.target.value })}
                                                                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                                                                rows={3}
                                                            />
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => updateReview(review.id)}
                                                                className="px-4 py-2 bg-[#E50914] text-white rounded-lg font-medium hover:bg-[#b0060f]"
                                                            >
                                                                Save Changes
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingReview(null)}
                                                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="mt-2 text-gray-600">{review.comment || 'No comment'}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfile;
