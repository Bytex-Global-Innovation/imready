import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a minimal, self-contained `.next/standalone` build so the
  // Docker runtime image only needs the traced output, not node_modules.
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bytex-uex-production.s3.ap-south-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "4000",
        pathname: "/uploads/**",
      },
    ],
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
