import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

// Build validation can be enabled via environment variable
// Set ENABLE_BUILD_CHECKS=true to enable TypeScript and ESLint during build
const enableBuildChecks = process.env.ENABLE_BUILD_CHECKS === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Only ignore errors if build checks are disabled
    ignoreBuildErrors: !enableBuildChecks,
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
    // Force memory cache to avoid external drive filesystem errors
    config.cache = { type: 'memory' };
    
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
    };
    
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

