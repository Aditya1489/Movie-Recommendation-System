import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false
});

// Request interceptor to add token to ALL requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');

    // Debug logging for delete requests
    if (config.method === 'delete') {
        console.log('🗑️ DELETE Request:', config.url);
        console.log('🔐 Token exists:', !!token);
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        console.warn('⚠️ No token found in localStorage!');
    }

    return config;
}, (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        // Debug logging for delete responses
        if (response.config.method === 'delete') {
            console.log('✅ DELETE Response:', response.status, response.data);
        }
        return response;
    },
    (error) => {
        console.error('❌ API Error:', error.response?.status, error.response?.data);

        // Handle 401 Unauthorized (token expired)
        if (error.response?.status === 401) {
            console.log('🔒 401 Unauthorized - Token invalid or expired');
            if (!window.location.pathname.includes('/login')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        return Promise.reject(error);
    }
);

export default api;
