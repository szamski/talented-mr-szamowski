import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "a.storyblok.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/profile",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
