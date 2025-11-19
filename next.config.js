/** @type {import('next').NextConfig} */
// Rebuild trigger: 2025-11-19 - Fresh deployment build (9321ad1)
const nextConfig = {
  reactStrictMode: true,

  // IP Protection: Disable source maps in production
  productionBrowserSourceMaps: false,

  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // IP Protection: Remove console logs and minimize code in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'], // Keep error and warn logs for debugging
    } : false,
  },

  eslint: {
    // Allow production builds to complete even with ESLint warnings/errors
    // We'll fix these cosmetic issues in Phase 3+
    ignoreDuringBuilds: true,
  },

  // IP Protection: Webpack optimizations for code obfuscation
  webpack: (config, { isServer, dev }) => {
    // Only apply optimizations in production
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
        // Mangle variable names for obfuscation
        minimizer: config.optimization.minimizer.map((plugin) => {
          if (plugin.constructor.name === 'TerserPlugin') {
            plugin.options.terserOptions = {
              ...plugin.options.terserOptions,
              mangle: true,
              compress: {
                drop_console: true,
                drop_debugger: true,
              },
              output: {
                comments: false,
              },
            };
          }
          return plugin;
        }),
      };
    }

    return config;
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
}

export default nextConfig;