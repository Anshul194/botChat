import axios from 'axios';

const api = axios.create({
    baseURL: 'https://botchat-backend-5qnk.onrender.com/api/v1',
    timeout: 10000,
});

// Configure Axios to dynamically grab headers for multi-tenancy and auth
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const setHeader = (name: string, value: string) => {
                if (config.headers && typeof config.headers.set === 'function') {
                    config.headers.set(name, value);
                }
                // Also set directly for older axios versions or fallback
                if (config.headers) {
                    (config.headers as any)[name] = value;
                }
            };

            // Check for potential token keys
            const token = localStorage.getItem('token') || localStorage.getItem('accessToken');

            if (token) {
                // Remove any double quotes that might be wrapping the token (e.g. if stringified)
                const cleanToken = token.replace(/^"(.*)"$/, '$1');

                const bearerToken = cleanToken.startsWith('Bearer ') ? cleanToken : `Bearer ${cleanToken}`;
                setHeader('Authorization', bearerToken);
            }

            const host = window.location.host;
            setHeader('x-host', host.includes('localhost') ? 'botchat.com' : host);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
