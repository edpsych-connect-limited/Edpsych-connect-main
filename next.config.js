import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';
import { fileURLToPath } from 'url';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    // Suppress 'Critical dependency' warning from require-in-the-middle
    // This is expected behavior for dynamic instrumentation and does not affect functionality
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /require-in-the-middle/,
        message: /Critical dependency/,
      },
    ];
    
    // Optimize cache for large projects to avoid OOM
    // Disable caching entirely during production builds to avoid memory issues from stale cache
    // Development builds use filesystem cache for faster rebuilds
    if (process.env.NODE_ENV === 'production') {
      config.cache = false; // Disable all caching in production
    } else if (isServer) {
      config.cache = {
        type: 'filesystem',
        hashAlgorithm: 'md4',
        name: 'webpack-server',
        version: '1',
        cacheDirectory: path.join(__dirname, '.next/cache/webpack-server'),
      };
    } else {
      // Client-side: use filesystem cache with strict limits
      config.cache = {
        type: 'filesystem',
        hashAlgorithm: 'md4',
        name: 'webpack-client',
        version: '1',
        cacheDirectory: path.join(__dirname, '.next/cache/webpack-client'),
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

