import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="h-screen flex items-center justify-center bg-black text-white">Loading...</div>;
    }

    return user ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
