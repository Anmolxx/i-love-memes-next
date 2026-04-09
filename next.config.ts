import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api-proxy/:path*',
        destination: 'https://i-love-memes-backend.onrender.com/api/v1/files/:path*',
      },
      {
        source: '/s3-proxy/:path*',
        destination: 'https://i-love-memes-files.s3.ap-southeast-2.amazonaws.com/:path*',
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "staging.ilovememes.com",
        pathname: "/api/v1/files/**",
      },
      {
        protocol: "https",
        hostname: "i-love-memes-files.s3.ap-southeast-2.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;