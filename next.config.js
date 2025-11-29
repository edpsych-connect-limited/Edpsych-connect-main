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
  webpack: (config) => {
    // Force memory cache to avoid external drive filesystem errors
    config.cache = { type: 'memory' };
    config.resolve.symlinks = false;
    config.snapshot = {
      managedPaths: [],
      immutablePaths: [],
    };
    return config;
  },
}

export default withNextIntl(nextConfig);

