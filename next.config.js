import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

// Build validation can be enabled via environment variable
// Set ENABLE_BUILD_CHECKS=true to enable TypeScript and ESLint during build
const enableBuildChecks = process.env.ENABLE_BUILD_CHECKS === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Required for Docker deployment
  typescript: {
    // Only ignore errors if build checks are disabled
    ignoreBuildErrors: !enableBuildChecks,
  },
  eslint: {
    // Skip ESLint during Docker build (linting done in CI/locally)
    ignoreDuringBuilds: !enableBuildChecks,
  },
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // CRITICAL: Exclude Sentry from bundling to prevent "self is not defined" error
    // Sentry SDK tries to access browser globals during server-side build
    // This external prevents it from being included in the bundle
    if (isServer) {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : [config.externals]).filter(Boolean),
        {
          '@sentry/nextjs': '@sentry/nextjs',
          '@sentry/node': '@sentry/node',
          '@sentry/integrations': '@sentry/integrations',
        },
      ];
    }
    
    // Suppress 'Critical dependency' warning from require-in-the-middle (used by Sentry/OpenTelemetry)
    // This is expected behavior for dynamic instrumentation and does not affect functionality
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /require-in-the-middle/,
        message: /Critical dependency/,
      },
    ];
    
    // Optimize cache for large projects to avoid OOM
    // Use filesystem cache on server-side (less memory), disable on client (faster)
    if (isServer) {
      config.cache = {
        type: 'filesystem',
        hashAlgorithm: 'md4',
        name: 'webpack-server',
        version: '1',
        cacheDirectory: '.next/cache/webpack-server',
      };
    } else {
      // Client-side: use memory cache but with strict limits
      config.cache = {
        type: 'filesystem',
        hashAlgorithm: 'md4',
        name: 'webpack-client',
        version: '1',
        cacheDirectory: '.next/cache/webpack-client',
        maxMemoryGenerations: 1,
      };
    }
    
    // Disable symlink resolution to avoid EISDIR errors on external drives
    config.resolve.symlinks = false;
    
    // Disable resolving real paths (fixes EISDIR on Windows external drives)
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    
    // Use hash instead of filesystem-based dependency tracking
    // This avoids EISDIR errors when building on external drives
    config.snapshot = {
      managedPaths: [],
      immutablePaths: [],
      resolveBuildDependencies: {
        hash: true,
        timestamp: false,
      },
      buildDependencies: {
        hash: true,
        timestamp: false,
      },
      module: {
        hash: true,
        timestamp: false,
      },
      resolve: {
        hash: true,
        timestamp: false,
      },
    };
    
    // Disable watchOptions to prevent filesystem polling issues
    config.watchOptions = {
      ignored: ['**/node_modules/**', '**/.git/**', '**/.next/**'],
      followSymlinks: false,
    };
    
    // Prevent webpack from trying to readlink on Windows
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
      chunkIds: 'deterministic',
      // Reduce memory usage
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: 10,
        minSize: 20000,
        cacheGroups: {
          default: false,
          vendors: false,
          // Only create essential chunks
          framework: {
            name: 'framework',
            test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
            priority: 40,
            chunks: 'all',
            enforce: true,
          },
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 20,
          },
        },
      },
    };
    
    // Reduce memory by limiting parallelism
    config.parallelism = 2;
    
    // Set infrastructure logging to see what's happening
    config.infrastructureLogging = {
      level: 'warn',
    };
    
    // Disable realpath resolution which causes EISDIR errors
    if (config.resolveLoader) {
      config.resolveLoader.symlinks = false;
    }
    
    return config;
  },
}

export default withNextIntl(nextConfig);

