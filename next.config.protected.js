/**
 * EdPsych Connect - Production Build Configuration with Code Protection
 * 
 * This configuration enables:
 * 1. Code minification and obfuscation
 * 2. Source map protection (disabled in production)
 * 3. Webpack optimization for IP protection
 * 
 * Usage: Rename to next.config.js for production builds
 */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable source maps in production to prevent code inspection
  productionBrowserSourceMaps: false,
  
  // Enable strict mode for better code quality
  reactStrictMode: true,
  
  // Compiler options for production optimization
  compiler: {
    // Remove console.log statements in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
    
    // Enable React optimizations
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },
  
  // Webpack configuration for code protection
  webpack: (config, { dev, isServer }) => {
    // Only apply obfuscation in production client builds
    if (!dev && !isServer) {
      // Enhanced minification settings
      config.optimization = {
        ...config.optimization,
        minimize: true,
        minimizer: config.optimization.minimizer?.map(plugin => {
          if (plugin.constructor.name === 'TerserPlugin') {
            return new (require('terser-webpack-plugin'))({
              terserOptions: {
                compress: {
                  drop_console: true,
                  drop_debugger: true,
                  pure_funcs: ['console.log', 'console.info', 'console.debug'],
                  passes: 2,
                },
                mangle: {
                  safari10: true,
                  properties: {
                    // Mangle private properties (starting with _)
                    regex: /^_/,
                  },
                },
                format: {
                  comments: false,
                  ascii_only: true,
                },
                toplevel: true,
                keep_classnames: false,
                keep_fnames: false,
              },
              extractComments: false,
            });
          }
          return plugin;
        }),
        
        // Split chunks to obscure code structure
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            default: false,
            vendors: false,
            // Split vendor code
            vendor: {
              chunks: 'all',
              name: (module) => {
                const match = module.context?.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
                if (match) {
                  // Hash the package name to obscure dependencies
                  const packageName = match[1];
                  const hash = require('crypto')
                    .createHash('md5')
                    .update(packageName)
                    .digest('hex')
                    .substring(0, 8);
                  return `v-${hash}`;
                }
                return 'vendor';
              },
              test: /[\\/]node_modules[\\/]/,
              priority: 20,
            },
            // Split common chunks
            common: {
              minChunks: 2,
              priority: 10,
              reuseExistingChunk: true,
              name: (module, chunks) => {
                const hash = require('crypto')
                  .createHash('md5')
                  .update(chunks.map(c => c.name).join(''))
                  .digest('hex')
                  .substring(0, 8);
                return `c-${hash}`;
              },
            },
          },
        },
      };
      
      // Obfuscate chunk names
      config.output = {
        ...config.output,
        chunkFilename: 'static/chunks/[contenthash].js',
        filename: 'static/chunks/[contenthash].js',
      };
    }
    
    return config;
  },
  
  // Headers for additional security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Prevent embedding in iframes (clickjacking protection)
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Prevent MIME type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // XSS protection
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // Referrer policy
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        // Prevent direct access to source files
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
    ];
  },
  
  // Existing configuration preserved
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'files.heygen.ai' },
      { protocol: 'https', hostname: 'resource.heygen.ai' },
      { protocol: 'https', hostname: 'api.heygen.ai' },
      { protocol: 'https', hostname: '*.heygen.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: ['localhost:3000', 'edpsychconnect.com', 'www.edpsychconnect.com'],
    },
  },
};

module.exports = withBundleAnalyzer(nextConfig);
