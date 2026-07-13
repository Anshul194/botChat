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
            const responseData = error.response?.data || {};
            const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/forgot-password') || url.includes('/auth/me');

            if (status === 401 && !isAuthRoute) {
                console.warn(`[API INTERCEPTOR] 401 on ${url}`, responseData);
                try {
                    localStorage.removeItem('token');
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('user');
                } catch (e) {
                    // Ignore localStorage errors (e.g. strict privacy modes)
                }
                window.dispatchEvent(new CustomEvent('auth:logout'));
                window.location.href = '/auth/sign-in';
            }

            if (status === 403 && !isAuthRoute) {
                console.error(`[API INTERCEPTOR] 403 on ${url}`, { data: JSON.stringify(responseData), headers: error.config?.headers });
                const isPlanError = responseData.expired
                    || responseData.feature
                    || responseData.limit !== undefined
                    || (typeof responseData.message === 'string' && (
                        responseData.message.includes('plan')
                        || responseData.message.includes('Plan')
                        || responseData.message.includes('expired')
                        || responseData.message.includes('limit')
                        || responseData.message.includes('feature')
                        || responseData.message.includes('Feature')
                        || responseData.message.includes('upgrade')
                        || responseData.message.includes('Upgrade')
                    ));

                if (!isPlanError) {
                    console.error(`[API INTERCEPTOR] Redirecting to /dashboard?error=unauthorized due to 403 on ${url}`);
                    try {
                        localStorage.removeItem('token');
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('user');
                    } catch (e) {}
                    window.location.href = '/dashboard?error=unauthorized';
                } else {
                    console.warn(`[API INTERCEPTOR] 403 on ${url} is a plan error, NOT redirecting`);
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;
