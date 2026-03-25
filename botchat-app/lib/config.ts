/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  Multi-Tenant Config — resolves API base URL + x-host from the same domain
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  The Rule:
 *    baseURL  = https://<tenant-domain>/api/v1
 *    x-host   = <tenant-domain>
 *
 *  Both always come from the SAME domain (no mismatch).
 *
 *  ┌───────────────────┬───────────────────────────────────────────────────┐
 *  │ Environment       │ Tenant Domain Source                              │
 *  ├───────────────────┼───────────────────────────────────────────────────┤
 *  │ Local / Vercel    │ NEXT_PUBLIC_DEV_DOMAIN in .env.local              │
 *  │ Production        │ window.location.hostname (auto, zero config)      │
 *  └───────────────────┴───────────────────────────────────────────────────┘
 *
 *  Example .env.local:
 *    NEXT_PUBLIC_DEV_DOMAIN=pos.divyangtechlabs.com     → reseller
 *    NEXT_PUBLIC_DEV_DOMAIN=botchat.divyangtechlabs.com → superadmin
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

const DEV_DOMAIN = process.env.NEXT_PUBLIC_DEV_DOMAIN || 'pos.divyangtechlabs.com';

/**
 * Returns the active tenant domain.
 * - Local/Vercel: reads NEXT_PUBLIC_DEV_DOMAIN if set
 * - Production: reads window.location.hostname
 */
export function getTenantDomain(): string {
    
    if (typeof window === 'undefined') {
        // SSR — resolve from env or default
        return process.env.NEXT_PUBLIC_DEV_DOMAIN || 'botchat.divyangtechlabs.com';
    }

    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('localhost:');
    
    // Explicitly log for debugging on live
    console.log('[Config] Current hostname:', hostname);

    // 1. PRIORITY: Conditional Logic for specific staging/local domains (User requested)
    // These always map to the reseller domain 'pos.divyangtechlabs.com'
    if (hostname.includes('agency.metadm.chat') || 
        hostname.includes('agency.localhost') || 
        hostname.includes('localhost:3001') || 
        hostname.includes('localhost:3002')) {
        console.log('[Config] Special tenant domain detected:', hostname);
        return 'pos.divyangtechlabs.com';
    }

    // 2. If we have an explicit DEV_DOMAIN set in ENV and we are on localhost, use it
    if (isLocalhost && process.env.NEXT_PUBLIC_DEV_DOMAIN) {
        console.log('[Config] Localhost detected, using ENV domain:', process.env.NEXT_PUBLIC_DEV_DOMAIN);
        return process.env.NEXT_PUBLIC_DEV_DOMAIN;
    }

    // 3. In Production, ALWAYS use the current hostname if it's not localhost
    if (!isLocalhost && hostname) {
        console.log('[Config] Production detected, using hostname as tenant:', hostname);
        return hostname;
    }

    // 4. Fallback default
    const fallback = process.env.NEXT_PUBLIC_DEV_DOMAIN || 'botchat.divyangtechlabs.com';
    console.log('[Config] Falling back to:', fallback);
    return fallback;
}

/**
 * Returns the base URL for all API calls:
 *   https://<tenant-domain>/api/v1
 */
export function resolveApiBaseUrl(): string {
    const domain = getTenantDomain();
    return domain ? `https://${domain}/api/v1` : '';
}

/**
 * Returns the x-host header value for Laravel's tenant resolution.
 * Same domain as the baseURL — always in sync.
 */
export function resolveXHost(): string {
    return getTenantDomain();
}
