import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "flagcdn.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/hr/:path*",
        destination: "/job-search/:path*",
        permanent: true,
      },
      {
        source: "/hr",
        destination: "/job-search",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
