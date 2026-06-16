import { notFound, redirect } from 'next/navigation';
import { headers, cookies } from 'next/headers';
import BioLayout from '@/app/bio-layout/page';
import * as setCookieParser from 'set-cookie-parser';

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
    const prefix = cleanHostname.split('.')[0];
    if (prefix === 'localhost' || prefix === 'api' || cleanHostname === 'megadm.chat') {
      apiDomain = 'api.megadm.chat';
    } else {
      apiDomain = `${prefix}-api.megadm.chat`;
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
    notFound();
  }

  // ── Forward Set-Cookie from Laravel ──────────────────────────────────
  if (fetchResponse) {
    const setCookieHeader = fetchResponse.headers.get('set-cookie');
    if (setCookieHeader) {
      const cookieStore = await cookies();
      // Basic split by comma (note: this might split dates, but usually tracking cookies don't have complex dates)
      // For a robust parsing, you'd use a library, but let's do a simple parse for tracking cookies
      const splitCookies = setCookieHeader.split(/,(?=\s*[a-zA-Z0-9_-]+\=)/);
      for (const cookieStr of splitCookies) {
        const parts = cookieStr.split(';')[0].split('=');
        if (parts.length === 2) {
          cookieStore.set(parts[0].trim(), parts[1].trim(), {
             maxAge: 60 * 60 * 24, // 1 day
             path: '/',
          });
        }
      }
    }
  }

  if (result.action === 'redirect' && result.destination) {
    redirect(result.destination);
  }

  if (result.action === 'render_biolink') {
    return <BioLayout />;
  }

  notFound();
}
