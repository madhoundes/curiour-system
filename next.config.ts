import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Enable ESLint during builds for better code quality
    ignoreDuringBuilds: false,
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Modern Next.js 15+ configuration - no deprecated experimental options
  // Use modern serverExternalPackages instead of deprecated serverComponentsExternalPackages
  serverExternalPackages: [],
  // Disable static optimization for development
  ...(process.env.NODE_ENV === 'development' && {
    staticPageGenerationTimeout: 120,
  }),
};

export default nextConfig;
