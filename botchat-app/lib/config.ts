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

const DEV_DOMAIN = process.env.NEXT_PUBLIC_DEV_DOMAIN;

/**
 * Returns the active tenant domain.
 * - Local/Vercel: reads NEXT_PUBLIC_DEV_DOMAIN
 * - Production: reads window.location.hostname
 */
export function getTenantDomain(): string {

    if (typeof window === 'undefined') {
        // SSR — resolve from env or default (We cannot read window.location on server, need headers if doing true SSR but typically this is for client)
        return DEV_DOMAIN || 'botchat.divyangtechlabs.com';
    }

    console.log('Resolving tenant domain for hostname:', window.location.hostname);

    // Only use DEV_DOMAIN if we are running in development, or if DEV_DOMAIN was explicitly provided and we are overriding.
    // However, for single-build production, we MUST use window.location.hostname.
    if (process.env.NODE_ENV !== 'production' && DEV_DOMAIN) {
        console.log('Using DEV_DOMAIN:', DEV_DOMAIN);
        return DEV_DOMAIN;
    }

    const hostname = window.location.hostname;

    // ─────────────────────────────────────────────────────────────────────────────
    // Conditional Logic (Mirrors api.ts)
    // ─────────────────────────────────────────────────────────────────────────────

    // If agency subdomain or agency localhost, use reseller domain
    if (hostname.includes('agency.megadm.chat') || hostname.includes('agency.localhost') || hostname.includes('localhost:3002')) {
        return 'pos.divyangtechlabs.com';
    }

    // Default to central API domain for megadm.chat or localhost
    return 'botchat.divyangtechlabs.com';
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
