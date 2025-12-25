import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="h-screen flex items-center justify-center bg-gray-50 text-gray-900">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (user.role !== 'admin') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
                <p className="text-gray-500 mb-6">You need admin privileges to access this page.</p>
                <a href="/" className="text-[#E50914] hover:underline">← Back to Home</a>
            </div>
        );
    }

    return <Outlet />;
};

export default AdminRoute;
