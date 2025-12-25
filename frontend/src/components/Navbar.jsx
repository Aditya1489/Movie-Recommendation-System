import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSearch, FaBell, FaCaretDown, FaUser, FaCog } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isAdmin = user?.role === 'admin';
    const isActive = (path) => location.pathname === path;
    const isActivePrefix = (prefix) => location.pathname.startsWith(prefix);

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-gradient-to-b from-black/60 to-transparent py-4'}`}>
            <div className="px-4 md:px-16 flex items-center justify-between">
                <div className="flex items-center gap-12">
                    <Link to="/" className="text-3xl font-black text-[#E50914] tracking-tighter">MOVIEREALM</Link>

                    {user && (
                        <ul className={`hidden md:flex gap-6 text-sm font-medium ${isScrolled ? 'text-gray-800' : 'text-white'}`}>
                            <li>
                                <Link to="/" className={`transition ${isActive('/') ? 'text-[#E50914] font-bold' : 'hover:text-[#E50914]'}`}>
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/movies" className={`transition ${isActive('/movies') || (isActivePrefix('/movies/') && !isActivePrefix('/movies/edit')) ? 'text-[#E50914] font-bold' : 'hover:text-[#E50914]'}`}>
                                    Movies
                                </Link>
                            </li>
                            <li>
                                <Link to="/search" className={`transition ${isActive('/search') ? 'text-[#E50914] font-bold' : 'hover:text-[#E50914]'}`}>
                                    Search
                                </Link>
                            </li>
                            <li>
                                <Link to="/profile" className={`transition ${isActive('/profile') ? 'text-[#E50914] font-bold' : 'hover:text-[#E50914]'}`}>
                                    My List
                                </Link>
                            </li>
                            {isAdmin && (
                                <li>
                                    <Link to="/admin/dashboard" className={`transition ${isActivePrefix('/admin') ? 'text-[#E50914] font-bold' : 'hover:text-[#E50914]'}`}>
                                        Admin
                                    </Link>
                                </li>
                            )}
                        </ul>
                    )}
                </div>

                <div className={`flex items-center gap-6 ${isScrolled ? 'text-gray-800' : 'text-white'}`}>
                    <Link to="/search" className="hover:text-[#E50914] transition">
                        <FaSearch className="text-lg" />
                    </Link>

                    {user ? (
                        <>
                            <FaBell className="cursor-pointer hover:text-[#E50914] text-lg" />
                            <div className="group relative flex items-center gap-2 cursor-pointer">
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"
                                    alt="avatar"
                                    className="w-9 h-9 rounded-md border border-gray-200 shadow-sm"
                                />
                                <FaCaretDown className="text-sm group-hover:rotate-180 transition-transform" />

                                <div className="absolute top-full right-0 mt-3 w-64 bg-white border border-gray-100 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
                                    <div className="px-4 py-4 text-sm text-gray-700 border-b border-gray-100 bg-gray-50/50">
                                        Signed in as
                                        <strong className="block text-gray-900 truncate">{user.username || user.email}</strong>
                                        <span className={`mt-1 inline-block px-2 py-0.5 rounded text-xs ${isAdmin ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {user.role}
                                        </span>
                                    </div>

                                    <div className="py-2">
                                        <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                            <FaUser /> Profile & Watchlist
                                        </Link>

                                        {isAdmin && (
                                            <>
                                                <hr className="my-2 border-gray-100" />
                                                <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                    <FaCog /> Admin Dashboard
                                                </Link>
                                            </>
                                        )}
                                    </div>

                                    <div className="border-t border-gray-100">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-3 text-sm font-medium text-[#E50914] hover:bg-red-50 transition-colors"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex gap-3">
                            <Link to="/login" className="px-5 py-2 text-sm font-bold hover:text-[#E50914] transition">Sign In</Link>
                            <Link to="/register" className="px-5 py-2 bg-[#E50914] text-white text-sm font-bold rounded-md hover:bg-[#b0060f] transition">Sign Up</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
