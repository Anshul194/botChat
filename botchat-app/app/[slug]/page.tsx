import { notFound, redirect } from 'next/navigation';
import { headers } from 'next/headers';
import BioLayout from '@/app/bio-layout/page';

export default async function SlugResolverPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Read ALL incoming visitor headers so we can forward them to Laravel.
  const headersList = await headers();
  const host = headersList.get('host') || '';

  // ── API domain resolution ────────────────────────────────────────────
  const devDomain = process.env.NEXT_PUBLIC_DEV_DOMAIN;
  let apiDomain = devDomain || 'agency-api.megadm.chat';

  if (!devDomain && host) {
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
      // It's a custom domain! Fallback to the main agency API to resolve the link
      // Since biolink_db is shared, any tenant API can resolve it.
      apiDomain = 'agency-api.megadm.chat';
    }
  }

  const apiUrl = `https://${apiDomain}/api/v1/public/resolve/${slug}?host=${encodeURIComponent(host)}`;

  // ── Build forwarded headers ──────────────────────────────────────────
  const forwardHeaders: Record<string, string> = {
    'Accept': 'application/json',
  };

  const userAgent = headersList.get('user-agent');
  if (userAgent) forwardHeaders['User-Agent'] = userAgent;

  const acceptLanguage = headersList.get('accept-language');
  if (acceptLanguage) forwardHeaders['Accept-Language'] = acceptLanguage;

  const referer = headersList.get('referer');
  if (referer) forwardHeaders['Referer'] = referer;

  const cookie = headersList.get('cookie');
  if (cookie) forwardHeaders['Cookie'] = cookie;

  const realIp =
    headersList.get('cf-connecting-ip') ||
    headersList.get('x-real-ip') ||
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    null;

  if (realIp) {
    forwardHeaders['X-Forwarded-For'] = realIp;
    forwardHeaders['X-Real-IP']       = realIp;
  }

  // ── Call Laravel ─────────────────────────────────────────────────────
  let result = null;
  let fetchResponse = null;

  try {
    fetchResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: forwardHeaders,
      cache: 'no-store',
    });

    if (fetchResponse.ok) {
      result = await fetchResponse.json();
    }
  } catch (error) {
    console.error('Link Resolution Fetch Error:', error);
  }

  if (!result || !result.success) {
    // TEMPORARY DEBUGGING
    return (
      <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
        <h2>DEBUG: Fetch Failed</h2>
        <p><strong>API URL:</strong> {apiUrl}</p>
        <p><strong>Host Header Received:</strong> {host}</p>
        <p><strong>API Domain Computed:</strong> {apiDomain}</p>
        <p><strong>Fetch Response Status:</strong> {fetchResponse ? fetchResponse.status : 'No Response'}</p>
        <pre>
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    );
  }

  if (result.action === 'redirect' && result.destination) {
    redirect(result.destination);
  }

  if (result.action === 'render_biolink') {
    return <BioLayout />;
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h2>DEBUG: Action Not Recognized</h2>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
}
