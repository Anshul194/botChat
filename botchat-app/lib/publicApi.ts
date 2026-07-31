/**
 * publicApi.ts
 * Unauthenticated fetch helper for public endpoints (landing page, pricing).
 * Does NOT use the Axios instance that carries Bearer tokens.
 */

const PUBLIC_API_BASE = 'https://api.megadm.chat/api/v1';

export async function publicFetch<T = any>(path: string): Promise<T> {
    const res = await fetch(`${PUBLIC_API_BASE}${path}`, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 60 }, // ISR: revalidate every 60s (Next.js App Router)
    });
    if (!res.ok) throw new Error(`publicFetch failed: ${res.status} ${path}`);
    const json = await res.json();
    return json.data ?? json;
}

export async function getPublicPlans() {
    return publicFetch('/public/plans');
}

export async function getPublicDefinitions(): Promise<{
    features: Record<string, FeatureDefinition>;
    groups: Record<string, { label: string; description: string }>;
}> {
    return publicFetch('/public/plans/definitions');
}

export interface FeatureDefinition {
    label: string;
    description?: string;
    unit?: string;
    tooltip?: string;
    depends_on?: string;
    type: 'toggle' | 'limit';
    group: string;
    default: string;
    default_type?: 'fixed' | 'monthly';
}

export interface PublicPlan {
    id: number;
    name: string;
    description?: string;
    price: string;
    duration: number;
    duration_type: string;
    status: boolean;
    is_highlighted: boolean;
    features?: Record<string, string | { value: string; limit_type?: string }>;
}
