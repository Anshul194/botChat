import axios from 'axios';

const api = axios.create({
    baseURL: 'https://botchat-backend-5qnk.onrender.com/api/v1',
    timeout: 10000,
});

// Configure Axios to dynamically grab headers for multi-tenancy and auth
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const host = window.location.host;
            // Inject target host header (resolves the tenant)
            // Auto-fallback to botchat.com when running locally
            config.headers['x-host'] = host.includes('localhost') ? 'botchat.com' : host;

            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
