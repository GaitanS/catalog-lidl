import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'standalone',
    images: {
        unoptimized: true,
    },
    serverExternalPackages: ['child_process'],
};

export default nextConfig;
