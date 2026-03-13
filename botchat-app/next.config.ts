import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Each dev instance gets its own build directory to avoid lock conflicts
    // when running admin and reseller simultaneously.
    distDir: process.env.NEXT_DIST_DIR || '.next',

    env: {
        NEXT_PUBLIC_DEV_DOMAIN: process.env.NEXT_PUBLIC_DEV_DOMAIN || '',
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
    },
};

export default nextConfig;
