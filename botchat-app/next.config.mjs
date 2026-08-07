/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable StrictMode to prevent double useEffect invocations in dev.
  // React 18 StrictMode intentionally mounts+unmounts components twice,
  // which causes every API-fetching useEffect to fire twice.
  reactStrictMode: false,
  // Standalone mode: bundles only runtime-needed files into .next/standalone
  // Result: ~20MB deploy instead of 500MB+ node_modules upload
  output: 'standalone',
  transpilePackages: ['recharts'],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/",
        locale: false,
        headers: [
          { key: "Cache-Control", value: "public, max-age=600, s-maxage=3600, stale-while-revalidate=604800" },
        ],
      },
      {
        source: "/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)",
        locale: false,
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/:all*(mp4|webm)",
        locale: false,
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/_next/static/:path*",
        locale: false,
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/_next/image",
        locale: false,
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
      {
        source: "/:path*.(woff|woff2|ttf|otf|eot)",
        locale: false,
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/(.*?)",
        locale: false,
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
