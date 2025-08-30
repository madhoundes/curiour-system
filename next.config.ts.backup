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
  // Webpack configuration to fix chunk loading issues
  webpack: (config, { isServer }) => {
    // Fix for React-PDF and other dynamic imports
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        stream: false,
        util: false,
        zlib: false,
        buffer: false,
        assert: false,
      };
    }

    // Optimize chunk splitting for better loading
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        chunks: 'all',
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          'react-pdf': {
            name: 'react-pdf',
            test: /[\\/]node_modules[\\/]@react-pdf[\\/]/,
            chunks: 'all',
            priority: 30,
            reuseExistingChunk: true,
          },
        },
      },
    };

    return config;
  },
  // Transpile React-PDF packages for better compatibility
  transpilePackages: ['@react-pdf/renderer'],
  // Experimental features for better chunk handling
  experimental: {
    optimizePackageImports: ['@react-pdf/renderer'],
  },
};

export default nextConfig;
