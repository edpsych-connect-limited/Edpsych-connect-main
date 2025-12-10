import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // output: 'standalone',
  // eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  webpack: (config) => {
    config.cache = false;
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    // Fix for EISDIR on Windows mapped drives
    config.resolve.symlinks = false;
    return config;
  }
};

export default withNextIntl(nextConfig);
