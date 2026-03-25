import axios from 'axios';
import { resolveApiBaseUrl, resolveXHost } from './config';

const api = axios.create({
    baseURL: resolveApiBaseUrl(),
    timeout: 3600000,
});

api.interceptors.request.use(
    (config) => {
        // ── 1. Dynamic base URL (re-resolved each request) ──────────────────
        config.baseURL = resolveApiBaseUrl();

        if (typeof window !== 'undefined') {
            const setHeader = (name: string, value: string) => {
                if (config.headers && typeof config.headers.set === 'function') {
                    config.headers.set(name, value);
                }
                if (config.headers) {
                    (config.headers as any)[name] = value;
                }
            };

            // ── 2. Auth token ────────────────────────────────────────────────
            const raw = localStorage.getItem('token') || localStorage.getItem('accessToken');
            
            console.log('[API Request] URL:', config.url);
            console.log('[API Request] BaseURL:', config.baseURL);
            console.log('[API Request] Token found:', !!raw);

            if (raw) {
                const clean = raw.replace(/^"(.*)"$/, '$1');
                const bearer = clean.startsWith('Bearer ') ? clean : `Bearer ${clean}`;
                setHeader('Authorization', bearer);
            }

            // ── 3. Tenant identification (x-host) ────────────────────────────
            // The Laravel backend uses this header to resolve the right tenant.
            const xHost = resolveXHost();
            console.log('[API Request] x-host:', xHost);
            setHeader('x-host', xHost);
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ── 4. Response Interceptor for Debugging ────────────────────────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (typeof window !== 'undefined') {
            console.error('[API Error] Status:', error.response?.status);
            console.error('[API Error] Data:', error.response?.data);
            
            if (error.response?.status === 401) {
                console.warn('[API Error] 401 Unauthorized detected. This may trigger a redirect.');
            }
        }
        return Promise.reject(error);
    }
);

export default api;
