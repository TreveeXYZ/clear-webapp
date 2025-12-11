import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel optimizations
  output: 'standalone',

  // Disable Turbopack for production builds (more stable)
  experimental: {
    turbo: undefined,
  },
};

export default nextConfig;
