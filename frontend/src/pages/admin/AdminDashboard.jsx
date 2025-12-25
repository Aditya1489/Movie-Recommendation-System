import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaFilm, FaUsers, FaChartLine, FaUserShield, FaStar, FaTimes, FaCheck, FaCheckSquare, FaSquare } from 'react-icons/fa';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ users: {}, movies: {} });
    const [movies, setMovies] = useState([]);
    const [users, setUsers] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('movies');

    // Selection for bulk delete
    const [selectedMovies, setSelectedMovies] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedReviews, setSelectedReviews] = useState([]);

    // Add User Modal
    const [showAddUser, setShowAddUser] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'user' });
    const [addingUser, setAddingUser] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, moviesRes, usersRes, reviewsRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/movies/admin/movies', { params: { size: 100 } }),
                api.get('/admin/users', { params: { size: 100 } }),
                api.get('/admin/reviews', { params: { size: 100 } })
            ]);

            setStats(statsRes.data);
            setMovies(moviesRes.data.movies || []);
            setUsers(usersRes.data.users || []);
            setReviews(reviewsRes.data.reviews || []);
        } catch (error) {
            console.error('Error fetching admin data:', error);
            alert('Error loading admin data: ' + (error.response?.data?.detail || error.message));
        } finally {
            setLoading(false);
        }
    };

    // ================== MOVIE APPROVE/DISAPPROVE ==================
    const handleDisapproveMovie = async (movieId) => {
        console.log('🎬 Disapproving movie:', movieId);
        try {
            await api.put(`/movies/admin/update_movie/${movieId}`, { approved: false });
            console.log('✅ Movie disapproved');
            // Update the local state
            setMovies(movies.map(m => m.id === movieId ? { ...m, approved: false } : m));
            // Refresh stats
            const statsRes = await api.get('/admin/stats');
            setStats(statsRes.data);
        } catch (error) {
            console.error('❌ Error disapproving movie:', error);
        }
    };

    const handleApproveMovie = async (movieId) => {
        console.log('🎬 Approving movie:', movieId);
        try {
            await api.put(`/movies/admin/update_movie/${movieId}`, { approved: true });
            console.log('✅ Movie approved');
            setMovies(movies.map(m => m.id === movieId ? { ...m, approved: true } : m));
            const statsRes = await api.get('/admin/stats');
            setStats(statsRes.data);
        } catch (error) {
            console.error('❌ Error approving movie:', error);
        }
    };

    const handleDeleteMovie = async (movieId) => {
        console.log('🎬 Deleting movie:', movieId);
        try {
            await api.delete(`/movies/admin/delete_movie/${movieId}`);
            console.log('✅ Movie deleted');
            setMovies(movies.filter(m => m.id !== movieId));
            setSelectedMovies(selectedMovies.filter(id => id !== movieId));
            const statsRes = await api.get('/admin/stats');
            setStats(statsRes.data);
        } catch (error) {
            console.error('❌ Error deleting movie:', error);
        }
    };

    const handleBulkDisapproveMovies = async () => {
        if (selectedMovies.length === 0) return;
        console.log('🎬 Bulk disapproving movies:', selectedMovies);
        try {
            for (const movieId of selectedMovies) {
                await api.put(`/movies/admin/update_movie/${movieId}`, { approved: false });
            }
            setMovies(movies.map(m => selectedMovies.includes(m.id) ? { ...m, approved: false } : m));
            setSelectedMovies([]);
            fetchData();
        } catch (error) {
            console.error('❌ Error bulk deleting:', error);
        }
    };

    // ================== USER DELETE ==================
    const handleDeleteUser = async (userId) => {
        console.log('👤 Suspending user:', userId);
        try {
            const response = await api.delete(`/admin/users/${userId}`);
            console.log('✅ Delete response:', response.data);
            setUsers(users.map(u => u.id === userId ? { ...u, status: 'suspended' } : u));
        } catch (error) {
            console.error('❌ Error suspending user:', error);
        }
    };

    const handleBulkDeleteUsers = async () => {
        if (selectedUsers.length === 0) return;
        console.log('👤 Bulk suspending users:', selectedUsers);
        try {
            for (const userId of selectedUsers) {
                await api.delete(`/admin/users/${userId}`);
            }
            setUsers(users.map(u => selectedUsers.includes(u.id) ? { ...u, status: 'suspended' } : u));
            setSelectedUsers([]);
        } catch (error) {
            console.error('❌ Error bulk suspending:', error);
        }
    };

    // ================== REVIEW DELETE ==================
    const handleDeleteReview = async (reviewId) => {
        console.log('⭐ Deleting review:', reviewId);
        try {
            const response = await api.delete(`/admin/reviews/${reviewId}`);
            console.log('✅ Delete response:', response.data);
            setReviews(reviews.filter(r => r.id !== reviewId));
            setSelectedReviews(selectedReviews.filter(id => id !== reviewId));
            fetchData();
        } catch (error) {
            console.error('❌ Error deleting review:', error);
        }
    };

    const handleBulkDeleteReviews = async () => {
        if (selectedReviews.length === 0) return;
        console.log('⭐ Bulk deleting reviews:', selectedReviews);
        try {
            for (const reviewId of selectedReviews) {
                await api.delete(`/admin/reviews/${reviewId}`);
            }
            setReviews(reviews.filter(r => !selectedReviews.includes(r.id)));
            setSelectedReviews([]);
            fetchData();
        } catch (error) {
            console.error('❌ Error bulk deleting reviews:', error);
        }
    };

    // ================== USER ROLE/STATUS CHANGES ==================
    const handleUserRoleChange = async (userId, newRole) => {
        try {
            await api.put(`/admin/users/${userId}/role?role=${newRole}`);
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error('Error updating role:', error);
            alert(error.response?.data?.detail || 'Failed to update role');
        }
    };

    const handleUserStatusChange = async (userId, newStatus) => {
        try {
            await api.put(`/admin/users/${userId}/status?status=${newStatus}`);
            setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        } catch (error) {
            console.error('Error updating status:', error);
            alert(error.response?.data?.detail || 'Failed to update status');
        }
    };

    // ================== ADD USER ==================
    const handleAddUser = async (e) => {
        e.preventDefault();
        setAddingUser(true);
        try {
            const params = new URLSearchParams(newUser);
            await api.post(`/admin/users?${params}`);
            setShowAddUser(false);
            setNewUser({ username: '', email: '', password: '', role: 'user' });
            fetchData();
            alert('User created successfully!');
        } catch (error) {
            console.error('Error creating user:', error);
            alert(error.response?.data?.detail || 'Failed to create user');
        } finally {
            setAddingUser(false);
        }
    };

    // ================== SELECTION HANDLERS ==================
    const toggleMovieSelection = (id) => {
        setSelectedMovies(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const toggleUserSelection = (id) => {
        setSelectedUsers(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const toggleReviewSelection = (id) => {
        setSelectedReviews(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const selectAllMovies = () => {
        if (selectedMovies.length === movies.length) {
            setSelectedMovies([]);
        } else {
            setSelectedMovies(movies.map(m => m.id));
        }
    };

    const selectAllUsers = () => {
        if (selectedUsers.length === users.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(users.map(u => u.id));
        }
    };

    const selectAllReviews = () => {
        if (selectedReviews.length === reviews.length) {
            setSelectedReviews([]);
        } else {
            setSelectedReviews(reviews.map(r => r.id));
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-[#E50914] border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading admin data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowAddUser(true)}
                            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
                        >
                            <FaPlus /> Add User
                        </button>
                        <Link
                            to="/admin/movies/add"
                            className="flex items-center gap-2 bg-[#E50914] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#b0060f] transition"
                        >
                            <FaPlus /> Add Movie
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-100 rounded-lg">
                                <FaFilm className="text-[#E50914] text-2xl" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Movies</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.movies?.total || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <FaChartLine className="text-green-600 text-2xl" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Approved</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.movies?.approved || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <FaUsers className="text-blue-600 text-2xl" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Users</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.users?.total || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <FaUserShield className="text-purple-600 text-2xl" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Admins</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.users?.admins || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <FaStar className="text-yellow-600 text-2xl" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Reviews</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.total_reviews || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab('movies')}
                        className={`px-6 py-2 rounded-lg font-medium transition ${activeTab === 'movies' ? 'bg-[#E50914] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                    >
                        🎬 Movies ({movies.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-6 py-2 rounded-lg font-medium transition ${activeTab === 'users' ? 'bg-[#E50914] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                    >
                        👥 Users ({users.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`px-6 py-2 rounded-lg font-medium transition ${activeTab === 'reviews' ? 'bg-[#E50914] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                    >
                        ⭐ Reviews ({reviews.length})
                    </button>
                </div>

                {/* Movies Table */}
                {activeTab === 'movies' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Manage Movies</h2>
                            {selectedMovies.length > 0 && (
                                <button
                                    onClick={handleBulkDisapproveMovies}
                                    className="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-700"
                                >
                                    <FaTimes /> Disapprove {selectedMovies.length} Selected
                                </button>
                            )}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left">
                                            <button onClick={selectAllMovies} className="text-gray-500 hover:text-gray-700">
                                                {selectedMovies.length === movies.length && movies.length > 0 ? <FaCheckSquare /> : <FaSquare />}
                                            </button>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Movie</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Genre</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {movies.map(movie => (
                                        <tr key={movie.id} className={`hover:bg-gray-50 ${selectedMovies.includes(movie.id) ? 'bg-red-50' : ''}`}>
                                            <td className="px-4 py-4">
                                                <button onClick={() => toggleMovieSelection(movie.id)} className="text-gray-500 hover:text-gray-700">
                                                    {selectedMovies.includes(movie.id) ? <FaCheckSquare className="text-[#E50914]" /> : <FaSquare />}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={movie.poster_url || "https://via.placeholder.com/40x60"}
                                                        alt={movie.title}
                                                        className="w-10 h-14 object-cover rounded"
                                                    />
                                                    <span className="font-medium text-gray-900">{movie.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">{movie.genre}</td>
                                            <td className="px-6 py-4 text-gray-500">{movie.release_year}</td>
                                            <td className="px-6 py-4 text-gray-500">{movie.rating?.toFixed(1)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${movie.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {movie.approved ? 'Approved' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right flex gap-2 justify-end">
                                                {movie.approved ? (
                                                    <button
                                                        onClick={() => handleDisapproveMovie(movie.id)}
                                                        className="px-3 py-1 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 transition"
                                                        title="Disapprove Movie"
                                                    >
                                                        Disapprove
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleApproveMovie(movie.id)}
                                                        className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition"
                                                        title="Approve Movie"
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteMovie(movie.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Delete Movie Permanently"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Users Table */}
                {activeTab === 'users' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Manage Users</h2>
                            {selectedUsers.length > 0 && (
                                <button
                                    onClick={handleBulkDeleteUsers}
                                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700"
                                >
                                    <FaTrash /> Suspend {selectedUsers.length} Selected
                                </button>
                            )}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left">
                                            <button onClick={selectAllUsers} className="text-gray-500 hover:text-gray-700">
                                                {selectedUsers.length === users.length && users.length > 0 ? <FaCheckSquare /> : <FaSquare />}
                                            </button>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {users.map(user => (
                                        <tr key={user.id} className={`hover:bg-gray-50 ${selectedUsers.includes(user.id) ? 'bg-red-50' : ''}`}>
                                            <td className="px-4 py-4">
                                                <button onClick={() => toggleUserSelection(user.id)} className="text-gray-500 hover:text-gray-700">
                                                    {selectedUsers.includes(user.id) ? <FaCheckSquare className="text-[#E50914]" /> : <FaSquare />}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">{user.id}</td>
                                            <td className="px-6 py-4 font-medium text-gray-900">{user.username}</td>
                                            <td className="px-6 py-4 text-gray-500">{user.email}</td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                                                    className={`px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}
                                                >
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={user.status}
                                                    onChange={(e) => handleUserStatusChange(user.id, e.target.value)}
                                                    className={`px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="suspended">Suspended</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Suspend User"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Reviews Table */}
                {activeTab === 'reviews' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Manage Reviews</h2>
                            {selectedReviews.length > 0 && (
                                <button
                                    onClick={handleBulkDeleteReviews}
                                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700"
                                >
                                    <FaTrash /> Delete {selectedReviews.length} Selected
                                </button>
                            )}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left">
                                            <button onClick={selectAllReviews} className="text-gray-500 hover:text-gray-700">
                                                {selectedReviews.length === reviews.length && reviews.length > 0 ? <FaCheckSquare /> : <FaSquare />}
                                            </button>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Movie</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comment</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {reviews.map(review => (
                                        <tr key={review.id} className={`hover:bg-gray-50 ${selectedReviews.includes(review.id) ? 'bg-red-50' : ''}`}>
                                            <td className="px-4 py-4">
                                                <button onClick={() => toggleReviewSelection(review.id)} className="text-gray-500 hover:text-gray-700">
                                                    {selectedReviews.includes(review.id) ? <FaCheckSquare className="text-[#E50914]" /> : <FaSquare />}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">{review.id}</td>
                                            <td className="px-6 py-4 font-medium text-gray-900">{review.movie_title}</td>
                                            <td className="px-6 py-4 text-gray-500">{review.username}</td>
                                            <td className="px-6 py-4">
                                                <span className="flex items-center gap-1 text-yellow-600">
                                                    <FaStar /> {review.rating}/10
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{review.comment || '-'}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteReview(review.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Delete Review"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Add User Modal */}
            {showAddUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Add New User</h2>
                            <button onClick={() => setShowAddUser(false)} className="text-gray-400 hover:text-gray-600">
                                <FaTimes size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddUser}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                    <input
                                        type="text"
                                        value={newUser.username}
                                        onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={newUser.email}
                                        onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <input
                                        type="password"
                                        value={newUser.password}
                                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <select
                                        value={newUser.role}
                                        onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button
                                    type="submit"
                                    disabled={addingUser}
                                    className="flex-1 bg-[#E50914] text-white py-3 rounded-lg font-bold hover:bg-[#b0060f] transition disabled:opacity-50"
                                >
                                    {addingUser ? 'Creating...' : 'Create User'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddUser(false)}
                                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
