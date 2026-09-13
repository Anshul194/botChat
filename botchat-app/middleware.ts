import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (static files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  
  // Get hostname of request (e.g. rohit.megadm.chat, www.rohitbusiness.com)
  let hostname = req.headers.get('host') || '';

  // Clean port for local testing
  hostname = hostname.replace(/:\d+$/, '');

  // Define main platform domains
  const devDomain = process.env.NEXT_PUBLIC_DEV_DOMAIN || 'localhost';
  const mainDomains = ['megadm.chat', 'www.megadm.chat', devDomain];

  // If the request is for the root path '/' and it's NOT a main domain,
  // we rewrite to the dynamic tenant landing page route.
  if (!mainDomains.includes(hostname) && url.pathname === '/') {
    // Rewrite to /tenant/[hostname]
    return NextResponse.rewrite(new URL(`/tenant/${hostname}`, req.url));
  }

  return NextResponse.next();
}
