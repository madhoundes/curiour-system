import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Modern Next.js 15+ configuration - no deprecated experimental options
  // Use modern serverExternalPackages instead of deprecated serverComponentsExternalPackages
  serverExternalPackages: [],
  // Ensure proper output configuration
  output: 'standalone',
  // Disable static optimization for development
  ...(process.env.NODE_ENV === 'development' && {
    staticPageGenerationTimeout: 120,
  }),
};

export default nextConfig;
