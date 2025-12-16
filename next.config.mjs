import createNextIntlPlugin from 'next-intl/plugin';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

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
  // output: 'standalone',
  // eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  // Prevent Next from inferring an incorrect monorepo root when other lockfiles exist on the machine.
  outputFileTracingRoot: __dirname,
  // Use a fresh build directory name; older `.next` / `.next_temp` folders on this drive can become undeletable.
  distDir: isVercel ? '.next' : (chooseDistDir(resolvedDistDir) || '.next_build_local'),
  webpack: (config, { dev }) => {
    // Dev-only: reduce flakiness on Windows/mapped drives.
    // NOTE: Do not disable webpack cache in production builds; Next 16's
    // FlightClientEntryPlugin expects the cache shape to be present.
    if (dev) {
      config.cache = false;
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };

      // Fix for EISDIR on Windows mapped drives (dev only).
      config.resolve.symlinks = false;
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
