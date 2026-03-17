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

const DEV_DOMAIN = process.env.NEXT_PUBLIC_DEV_DOMAIN || '';

/**
 * Returns the active tenant domain.
 * - Local/Vercel: reads NEXT_PUBLIC_DEV_DOMAIN
 * - Production: reads window.location.hostname
 */
export function getTenantDomain(): string {
    if (typeof window === 'undefined') {
        // SSR — resolve from env or default
        return DEV_DOMAIN || 'botchat.divyangtechlabs.com';
    }

    if (DEV_DOMAIN) {
        return DEV_DOMAIN;
    }

    const hostname = window.location.hostname;

    // ─────────────────────────────────────────────────────────────────────────────
    // Conditional Logic (Mirrors api.ts)
    // ─────────────────────────────────────────────────────────────────────────────

    // If agency subdomain or agency localhost, use reseller domain
    if (hostname.includes('agency.metadm.chat') || hostname.includes('agency.localhost')) {
        return 'pos.divyangtechlabs.com';
    }

    // Default to central API domain for metadm.chat or localhost
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
