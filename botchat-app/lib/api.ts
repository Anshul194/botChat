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
                    (config.headers as Record<string, string>)[name] = value;
                }
            };

            // ── 2. Auth token ────────────────────────────────────────────────
            const raw = localStorage.getItem('token') || localStorage.getItem('accessToken');
            if (raw) {
                const clean = raw.replace(/^"(.*)"$/, '$1');
                const bearer = clean.startsWith('Bearer ') ? clean : `Bearer ${clean}`;
                setHeader('Authorization', bearer);
            }

            // ── 3. Tenant identification (x-host) ────────────────────────────
            // The Laravel backend uses this header to resolve the right tenant.
            setHeader('x-host', resolveXHost());
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => {
        if (typeof window !== 'undefined') {
            const url = response.config?.url || '';
            if (url.includes('/payment/razorpay/verify') && response.data?.success !== false) {
                window.dispatchEvent(new CustomEvent('payment:success'));
                window.dispatchEvent(new CustomEvent('subscription:refresh'));
            }
        }

        return response;
    },
    (error) => {
        if (typeof window !== 'undefined') {
            const status = error.response?.status;
            const url = error.config?.url || '';
            const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/forgot-password');

            if (status === 401 && !isAuthRoute) {
                localStorage.removeItem('token');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                window.location.href = '/auth/login';
            }

            if (status === 403 && !isAuthRoute) {
                window.location.href = '/dashboard?error=unauthorized';
            }
        }

        return Promise.reject(error);
    }
);

export default api;
