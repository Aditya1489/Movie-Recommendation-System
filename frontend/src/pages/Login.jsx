import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const res = await login(email, password);
        setLoading(false);
        if (res.success) {
            navigate('/');
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="relative h-screen w-screen flex items-center justify-center bg-black font-sans overflow-hidden">

            {/* Background */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: "url('/assets/movie-cutouts-bg.png')",
                }}
            ></div>
            <div className="absolute inset-0 bg-black/20"></div>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-[450px] bg-black/90 px-12 py-16 rounded-xl shadow-2xl mx-4 border border-white/10">
                <h1 className="text-3xl font-bold text-white mb-8">Login</h1>

                {error && (
                    <div className="mb-4 bg-[#e87c03] text-white p-3 rounded text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="relative">
                        <label className="text-[#8c8c8c] text-xs font-semibold mb-1 block pl-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#333] text-white rounded h-12 px-4 focus:outline-none focus:bg-[#454545] border-none"
                            required
                        />
                    </div>

                    <div className="relative">
                        <div className="flex justify-between items-center mb-1 pl-1">
                            <label className="text-[#8c8c8c] text-xs font-semibold">Password</label>
                            <a href="#" className="text-[#0071eb] text-xs hover:underline">Forgot Password?</a>
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#333] text-white rounded h-12 px-4 focus:outline-none focus:bg-[#454545] border-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#E50914] text-white font-bold h-12 rounded mt-6 hover:bg-[#b0060f] transition-colors duration-200"
                    >
                        {loading ? 'Loading...' : 'Login'}
                    </button>

                    <div className="mt-4 text-[#737373] text-base font-medium">
                        Don't have an account? <Link to="/register" className="text-white hover:underline ml-1">Sign Up</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
