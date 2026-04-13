import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'standalone',
    images: {
        unoptimized: true,
    },
    serverExternalPackages: ['child_process'],
    async redirects() {
        return [
            {
                source: '/:path*',
                has: [{ type: 'host', value: 'www.cataloglidl.ro' }],
                destination: 'https://cataloglidl.ro/:path*',
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
