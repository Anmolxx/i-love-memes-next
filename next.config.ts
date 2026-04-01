import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "staging.ilovememes.com",
          pathname: "/api/v1/files/**",
        },
      ],
    },
};

export default nextConfig;
