import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Ignore ESLint warnings during build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
