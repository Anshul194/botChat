import { notFound, redirect } from 'next/navigation';
import { headers } from 'next/headers';
import TenantLandingClient, { TenantData } from './TenantLandingClient';
import { Metadata } from 'next';

async function fetchTenantData(domain: string, hostHeader?: string): Promise<TenantData | null> {
  const host = hostHeader || domain;
  
  // Resolve API domain based on environment (similar to biolink resolution)
  const isDev = process.env.NODE_ENV !== 'production';
  const devDomain = process.env.NEXT_PUBLIC_DEV_DOMAIN;
  let apiDomain = (isDev && devDomain) ? devDomain : 'agency-api.megadm.chat';

  if ((!isDev || !devDomain) && host) {
    const cleanHostname = host.replace('www.', '').split(':')[0];

    // Check if it is a platform subdomain
    if (cleanHostname.endsWith('megadm.chat')) {
      const prefix = cleanHostname.split('.')[0];
      if (prefix === 'localhost' || prefix === 'api' || cleanHostname === 'megadm.chat') {
        apiDomain = 'api.megadm.chat';
      } else {
        apiDomain = `${prefix}-api.megadm.chat`;
      }
    } else {
      // It's a custom domain! Fallback to the main agency API to resolve
      apiDomain = 'agency-api.megadm.chat';
    }
  }

  // Use the tenant API endpoint. For custom domains, it might hit central if agency-api is central, 
  // but if agency-api acts as a tenant router or if we need to pass host, we append host.
  const apiUrl = `https://${apiDomain}/api/v1/public/tenant-landing?host=${encodeURIComponent(host)}`;

  try {
    const res = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store', // Can be improved with Next.js revalidation
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success || !json.tenant) return null;
    return json;
  } catch (err) {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ domain: string }> }): Promise<Metadata> {
  const { domain } = await params;
  const headersList = await headers();
  const host = headersList.get('host') || domain;
  
  const tenantData = await fetchTenantData(domain, host);
  
  if (!tenantData) {
    return {
      title: 'Not Found',
      description: 'The requested page could not be found.',
    };
  }

  const title = tenantData.branding?.company_name 
    ? `${tenantData.branding.company_name} — ${tenantData.branding.tagline || 'Social Media Automation'}`
    : 'Social Media Automation';

  return {
    title,
    description: tenantData.landing_page?.hero_description || 'Auto DMs from comments, stories & messages.',
    icons: tenantData.branding?.favicon ? [{ rel: 'icon', url: tenantData.branding.favicon }] : undefined,
    openGraph: {
      title,
      description: tenantData.landing_page?.hero_description || 'Auto DMs from comments, stories & messages.',
      images: tenantData.branding?.logo ? [tenantData.branding.logo] : [],
      url: `https://${host}`,
    },
    alternates: {
      canonical: `https://${host}`,
    }
  };
}

export default async function TenantDomainPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  
  // Read ALL incoming visitor headers so we can forward them to Laravel.
  const headersList = await headers();
  const host = headersList.get('host') || domain;

  // Resolve API domain based on environment (similar to biolink resolution)
  // Use devDomain ONLY in development. In production, always resolve dynamically based on the requested host.
  const isDev = process.env.NODE_ENV !== 'production';
  const devDomain = process.env.NEXT_PUBLIC_DEV_DOMAIN;
  let apiDomain = (isDev && devDomain) ? devDomain : 'api.megadm.chat'; // Default central API domain

  if ((!isDev || !devDomain) && host) {
    const cleanHostname = host.replace('www.', '').split(':')[0];
    if (cleanHostname.endsWith('megadm.chat')) {
      const prefix = cleanHostname.split('.')[0];
      if (prefix === 'localhost' || prefix === 'api' || cleanHostname === 'megadm.chat') {
        apiDomain = 'api.megadm.chat';
      } else {
        apiDomain = `${prefix}-api.megadm.chat`;
      }
    } else {
      // It's a custom domain! Fallback to the main agency API to resolve
      apiDomain = 'agency-api.megadm.chat';
    }
  }

  // Call the public tenant landing API
  const apiUrl = `https://${apiDomain}/api/v1/public/tenant-landing?host=${encodeURIComponent(host)}`;

  const forwardHeaders: Record<string, string> = {
    'Accept': 'application/json',
  };

  const userAgent = headersList.get('user-agent');
  if (userAgent) forwardHeaders['User-Agent'] = userAgent;

  const realIp =
    headersList.get('cf-connecting-ip') ||
    headersList.get('x-real-ip') ||
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    '127.0.0.1';
  forwardHeaders['X-Forwarded-For'] = realIp;

  try {
    const res = await fetch(apiUrl, {
      method: 'GET',
      headers: forwardHeaders,
      cache: 'no-store', // We can switch to next: { tags: [...] } later for better caching
    });

    if (!res.ok) {
      if (res.status === 404) {
        notFound();
      }
      throw new Error(`Failed to fetch tenant data, status: ${res.status}`);
    }

    const json = await res.json();
    if (!json.success || !json.tenant) {
      notFound();
    }

    const tenantData: TenantData = json;

    if (!tenantData.landing_page?.enabled) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800">
          <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-3">Landing Page Unavailable</h2>
            <p className="text-gray-500 text-sm">
              This website is currently disabled. Please contact the owner.
            </p>
          </div>
        </div>
      );
    }

    return <TenantLandingClient tenantData={tenantData} />;

  } catch (error) {
    console.error('Tenant fetch error:', error);
    // If API fails, show 404 or a generic error page
    notFound();
  }
}
