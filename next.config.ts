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
  // Fix for clientReferenceManifest error
  experimental: {
    // Enable proper client reference handling
    clientReferenceManifest: true,
    // Ensure proper RSC handling
    serverComponentsExternalPackages: [],
  },
  // Ensure proper output configuration
  output: 'standalone',
  // Disable static optimization for development
  ...(process.env.NODE_ENV === 'development' && {
    staticPageGenerationTimeout: 120,
  }),
};

export default nextConfig;
