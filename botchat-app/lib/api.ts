import axios from 'axios';
import { resolveApiBaseUrl, resolveXHost } from './config';

// Determine base URL based on host
const getBaseURL = () => {
    if (typeof window !== 'undefined') {
        const host = window.location.host;

        // If agency subdomain, use tenant API
        if (host.includes('agency.metadm.chat') || host.includes('agency.localhost')) {
            return 'https://pos.divyangtechlabs.com/api/v1';
        }

        // If metadm.chat or localhost (default), use central API
        if (host.includes('metadm.chat') || host.includes('localhost')) {
            return 'https://botchat.divyangtechlabs.com/api/v1';
        }
    }

    // Fallback to central API
    return 'https://botchat.divyangtechlabs.com/api/v1';
};

const api = axios.create({
    baseURL: getBaseURL(),
    timeout: 10000,
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

export default api;
