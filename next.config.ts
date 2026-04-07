import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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