/**
 * CI smoke checks
 *
 * Purpose: Catch high-impact regressions that lint/type-check may not surface,
 * without needing a running server, DB, or external services.
 */

import fs from 'node:fs';
import path from 'node:path';

function fail(message: string): never {
  // eslint-disable-next-line no-console
  console.error(`SMOKE_FAIL: ${message}`);
  process.exit(1);
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) fail(message);
}

function readText(p: string): string {
  return fs.readFileSync(p, 'utf8');
}

function exists(p: string): boolean {
  return fs.existsSync(p);
}

function parseMajorNodeVersion(version: string): number {
  // version like v20.11.1
  const m = /^v(\d+)\./.exec(version);
  return m ? Number(m[1]) : NaN;
}

function main() {
  const repoRoot = process.cwd();

  const isCI = Boolean(process.env.CI) || Boolean(process.env.GITHUB_ACTIONS) || Boolean(process.env.VERCEL);

  // Ensure we're not in a known-vulnerable Next.js range for the disclosed RSC CVEs.
  // Advisory recommended fixed Next versions include >=16.0.7.
  const pkgJsonPath = path.join(repoRoot, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8")) as {
    dependencies?: Record<string, string>;
  };
  const declaredNext = pkg.dependencies?.next;
  if (declaredNext) {
    const parsed = parseMajorMinorPatch(declaredNext);
    if (parsed) {
      const [maj, min, patch] = parsed;
      const isAtLeast1607 = maj > 16 || (maj === 16 && (min > 0 || (min === 0 && patch >= 7)));
      assert(
        isAtLeast1607,
        `Next.js must be >=16.0.7 per RSC advisory; package.json declares next='${declaredNext}'`,
      );
    }
  }

  // 1) Node version sanity (we pin to Node 20.x for CI/Vercel reproducibility)
  //    but avoid breaking local developer workflows if they're experimenting
  //    on a different Node version.
  const major = parseMajorNodeVersion(process.version);
  if (isCI) {
    assert(
      major === 20,
      [
        `Expected Node 20.x in CI, got ${process.version}.`,
        'Fix: use Node 20 (see package.json engines, .nvmrc, .node-version).',
        'Tip: run `node tools/assert-node20.cjs` for a detailed remediation message.',
      ].join(' '),
    );
  } else if (major !== 20) {
    // eslint-disable-next-line no-console
    console.warn(`SMOKE_WARN: Recommended Node 20.x; detected ${process.version}`);
  }

  // 2) Ensure critical files exist (routing/SEO + observability)
  const mustExist = [
    path.join(repoRoot, 'vercel.json'),
    path.join(repoRoot, 'next.config.mjs'),
    path.join(repoRoot, 'middleware.ts'),
    path.join(repoRoot, 'src', 'app', 'api', 'health', 'route.ts'),
    path.join(repoRoot, 'src', 'app', 'api', 'version', 'route.ts'),
    path.join(repoRoot, 'src', 'proxy.ts'),
  ];

  for (const p of mustExist) {
    assert(exists(p), `Missing required file: ${path.relative(repoRoot, p)}`);
  }

  // 3) Ensure Vercel build is gated by lint + type-check
  const vercelJsonText = readText(path.join(repoRoot, 'vercel.json'));
  assert(
    /"buildCommand"\s*:\s*"npm run build:vercel"/.test(vercelJsonText),
    'vercel.json must set buildCommand to "npm run build:vercel"'
  );

  const pkgJsonText = readText(path.join(repoRoot, 'package.json'));
  assert(
    /"build:vercel"\s*:\s*"npm run verify:ci && npm run build"/.test(pkgJsonText),
    'package.json must define build:vercel as "npm run verify:ci && npm run build"'
  );

  // 4) Prevent accidental reintroduction of build-time singleton side effects
  //    (these were causing noisy build logs during Next "Collecting page data")
  const aiSingletonChecks: Array<{ file: string; forbidden: RegExp; hint: string }> = [
    {
      file: path.join(repoRoot, 'src', 'services', 'ai', 'problem-matcher.ts'),
      forbidden: /export\s+const\s+problemMatcher\s*=\s*new\s+/,
      hint: 'Use getProblemMatcher() lazy getter instead of exporting a new singleton at module load time.',
    },
    {
      file: path.join(repoRoot, 'src', 'services', 'ai', 'living-demos.ts'),
      forbidden: /export\s+const\s+livingDemos\s*=\s*new\s+/,
      hint: 'Use getLivingDemos() lazy getter instead of exporting a new singleton at module load time.',
    },
    {
      file: path.join(repoRoot, 'src', 'services', 'ai', 'adaptive-system.ts'),
      forbidden: /export\s+const\s+adaptiveSystem\s*=\s*new\s+/,
      hint: 'Use getAdaptiveSystem() lazy getter instead of exporting a new singleton at module load time.',
    },
  ];

  for (const check of aiSingletonChecks) {
    const text = readText(check.file);
    assert(
      !check.forbidden.test(text),
      `Forbidden pattern found in ${path.relative(repoRoot, check.file)}. ${check.hint}`
    );
  }

  // eslint-disable-next-line no-console
  console.log('SMOKE_OK');
}

function parseMajorMinorPatch(versionLike: string): [number, number, number] | null {
  // Accept patterns like ^16.0.10, ~16.0.10, 16.0.10, >=16.0.7
  const m = versionLike.match(/(\d+)\.(\d+)\.(\d+)/);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

main();
