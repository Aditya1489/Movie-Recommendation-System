import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const res = await register(username, email, password);
        setLoading(false);
        if (res.success) {
            navigate('/login');
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="relative h-screen w-screen flex items-center justify-center bg-black font-sans overflow-hidden">

            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: "url('/assets/movie-cutouts-bg.png')",
                }}
            ></div>
            <div className="absolute inset-0 bg-black/20"></div>

            <div className="relative z-10 w-full max-w-[450px] bg-black/90 px-12 py-16 rounded-xl shadow-2xl mx-4 border border-white/10">
                <h1 className="text-3xl font-bold text-white mb-8">Sign Up</h1>

                {error && (
                    <div className="mb-4 bg-[#e87c03] text-white p-3 rounded text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="relative">
                        <label className="text-[#8c8c8c] text-xs font-semibold mb-1 block pl-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-[#333] text-white rounded h-12 px-4 focus:outline-none focus:bg-[#454545] border-none"
                            required
                        />
                    </div>

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
                        <label className="text-[#8c8c8c] text-xs font-semibold mb-1 block pl-1">Password</label>
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
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>

                    <div className="mt-4 text-[#737373] text-base font-medium">
                        Already have an account? <Link to="/login" className="text-white hover:underline ml-1">Sign In</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
