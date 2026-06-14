import { notFound, redirect } from 'next/navigation';
import { headers } from 'next/headers';
import BioLayout from '@/app/bio-layout/page'; 

export default async function SlugResolverPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  // We are running on the server, so we must construct the API URL.
  // In Next.js App Router, we can read the incoming request host:
  const headersList = headers();
  const host = headersList.get('host') || '';
  
  // Custom API endpoint resolution based on the host
  // If local DEV_DOMAIN is set, use it. Otherwise compute from host.
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

  const apiUrl = `https://${apiDomain}/api/v1/public/resolve/${slug}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Do not cache this, because we want tracking to execute every time 
      // a user visits the slug.
      cache: 'no-store', 
    });

    if (!response.ok) {
      console.error(`Link Resolver Error: [${response.status}] for slug: ${slug}`);
      return notFound();
    }

    const json = await response.json();

    if (json.success) {
      if (json.action === 'redirect' && json.destination) {
        // Trigger server-side redirect for short links, vcards, events, and files.
        redirect(json.destination);
      }

      if (json.action === 'render_biolink') {
        // Render the bio page UI.
        // In the future, you will pass json.data into the BioLayout component:
        // return <BioLayout data={json.data} />;
        return <BioLayout />;
      }
    }

    return notFound();
  } catch (error) {
    console.error("Link Resolution Fetch Error:", error);
    return notFound();
  }
}
