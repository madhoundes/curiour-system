import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Move from experimental to root level (Next.js 15 change)
  serverExternalPackages: ["@prisma/client"],
  // Allow external network access during development
  allowedDevOrigins: ['10.0.0.66', '*.10.0.0.66', 'localhost', '127.0.0.1'],
  // Enable logging for debugging network issues
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
