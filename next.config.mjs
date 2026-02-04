import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
let createNextIntlPlugin;
try {
  const nextIntlPluginModule = require('next-intl/plugin');
  createNextIntlPlugin = nextIntlPluginModule?.default ?? nextIntlPluginModule;
} catch (error) {
  console.error('[next-config] Failed to load next-intl/plugin', error);
  throw error;
}
const nextIntlConfigPath = fs.existsSync(path.join(__dirname, 'src', 'i18n', 'request.ts'))
  ? './src/i18n/request.ts'
  : './src/i18n.ts';
const withNextIntl = createNextIntlPlugin(nextIntlConfigPath);
const withBundleAnalyzer = process.env.ANALYZE === 'true'
  ? require('@next/bundle-analyzer')({
      enabled: true,
      analyzerMode: 'static',
      openAnalyzer: false,
      generateStatsFile: true,
      statsFilename: 'analyze/[name].stats.json',
    })
  : (config) => config;

// Dist dir selection
// - We allow overriding via NEXT_DIST_DIR (used by the release gate).
// - We treat legacy ".next_build" as unsafe on some Windows setups (EPERM/ACL/file locks)
//   and transparently move it to a fresh local directory.
const requestedDistDir = process.env.NEXT_DIST_DIR;
const resolvedDistDir = requestedDistDir === '.next_build' ? '.next_build_local' : requestedDistDir;

// Vercel's build runtime (vercel build / Next.js framework) expects the standard `.next`
// output directory to exist and contain manifests like `routes-manifest.json`.
// We use alternate distDirs locally to avoid Windows/drive ACL issues, but on Vercel
// we must align with `.next`.
//
// IMPORTANT: Only treat this as “running on Vercel” when we have Vercel runtime-only
// environment markers.
// Some local setups carry `VERCEL=1` / `VERCEL_ENV=...` in dotenv files; that should
// *not* force distDir to `.next` locally.
const isVercel = Boolean(
  process.env.VERCEL === '1' && (process.env.VERCEL_REGION || process.env.VERCEL_URL)
);

const isNextStart = process.argv.includes('start');
const isNextBuild = process.argv.includes('build');

function hasBuildId(distDir) {
  if (!distDir) return false;
  try {
    return fs.existsSync(path.join(distDir, 'BUILD_ID'));
  } catch {
    return false;
  }
}

function canCreateTypesDir(distDir) {
  if (!distDir) return false;
  try {
    // The most common failure mode we've seen is an ACL/EPERM on `<distDir>/types`.
    // Probe that exact path so we can fall back deterministically.
    fs.mkdirSync(path.join(distDir, 'types'), { recursive: true });
    const probeFile = path.join(distDir, '.write_probe');
    fs.writeFileSync(probeFile, `ok:${new Date().toISOString()}`);
    fs.unlinkSync(probeFile);
    return true;
  } catch {
    return false;
  }
}

function chooseDistDir(preferred) {
  const candidates = [
    preferred,
    // Common release gate fallbacks.
    '.next_build_gate',
    '.next_build_gate_alt',
    '.next_build_local',
    '.next_build_local2',
    '.next',
    // Last-resort: a uniquely named local build directory to unblock builds.
    `.next_build_${os.hostname()}`,
  ].filter(Boolean);

  // For `next start`, selecting a directory with a valid production build is more
  // important than being able to (re)create `types/`.
  if (isNextStart && !isNextBuild) {
    for (const candidate of candidates) {
      if (hasBuildId(candidate)) return candidate;
    }
    // Fall back to preferred (or Next's default) and let Next surface a clear error.
    return preferred || undefined;
  }

  for (const candidate of candidates) {
    if (canCreateTypesDir(candidate)) return candidate;
  }

  // If everything fails, fall back to Next's default and let it throw a real error.
  return undefined;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  // output: 'standalone',
  // eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  // Prevent Next from inferring an incorrect monorepo root when other lockfiles exist on the machine.
  // outputFileTracingRoot: __dirname,
  // Use a fresh build directory name; older `.next` / `.next_temp` folders on this drive can become undeletable.
  distDir: isVercel ? '.next' : (chooseDistDir(resolvedDistDir) || '.next_build_local'),
  async redirects() {
    return [
      {
        source: '/register',
        destination: '/signup',
        permanent: true,
      },
      {
        source: '/:locale/register',
        destination: '/:locale/signup',
        permanent: true,
      },
    ];
  },
  webpack: (config, { dev }) => {
    if (process.env.ANALYZE === 'true') {
      // Ensure analyzer receives chunk + asset data, not just module sizes.
      config.profile = true;
      config.stats = {
        assets: true,
        chunks: true,
        chunkModules: true,
        moduleAssets: true,
        modules: true,
        errorDetails: true,
      };
    }

    // Enable polling based on env var (for WSL/Docker/network drives)
    if (dev && (process.env.NEXT_WEBPACK_USEPOLLING || process.env.CHOKIDAR_USEPOLLING)) {
      config.watchOptions = {
        poll: 800,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
