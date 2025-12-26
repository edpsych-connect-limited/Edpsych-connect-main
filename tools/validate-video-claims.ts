import fs from 'node:fs';
import path from 'node:path';

import { HEYGEN_VIDEO_IDS } from '../src/lib/training/heygen-video-urls';

type Evidence = {
  files?: string[];
  routes?: string[];
  apis?: string[];
  tests?: string[];
  notes?: string;
};

type Claim = {
  id: string;
  statement: string;
  evidence: Evidence;
  status?: 'draft' | 'needs-review' | 'verified' | 'deprecated';
  lastReviewedAt?: string;
};

type ClaimsManifest = {
  schemaVersion: number;
  generatedAt?: string;
  description?: string;
  keys: Record<string, { claims: Claim[] }>;
};

function isStrict(): boolean {
  return process.env.VIDEO_CLAIMS_STRICT === '1';
}

function isEnabled(): boolean {
  return process.env.VIDEO_CLAIMS_AUDIT === '1';
}

function manifestPath(): string {
  return path.join(process.cwd(), 'video_provenance', 'video-claims-manifest.json');
}

function fileExists(p: string): boolean {
  try {
    return fs.existsSync(path.join(process.cwd(), p));
  } catch {
    return false;
  }
}

function normaliseRoute(route: string): string {
  let r = route.trim();
  if (!r.startsWith('/')) r = `/${r}`;
  // strip query/hash
  r = r.split('?')[0].split('#')[0];
  return r;
}

function routeToCandidateFiles(route: string): string[] {
  const r = normaliseRoute(route);
  if (r === '/') {
    return ['src/app/page.tsx', 'src/app/[locale]/page.tsx'];
  }

  const parts = r.replace(/^\//, '').split('/').filter(Boolean);

  // Locale-aware routing: treat a 2-5 letter first segment as a locale.
  const maybeLocale = parts[0];
  const rest = maybeLocale && /^[a-z]{2,5}$/i.test(maybeLocale) ? parts.slice(1) : parts;

  const baseSegments = rest.join('/');
  if (!baseSegments) {
    return ['src/app/page.tsx', 'src/app/[locale]/page.tsx'];
  }

  return [
    `src/app/${baseSegments}/page.tsx`,
    `src/app/${baseSegments}/route.ts`,
    `src/app/[locale]/${baseSegments}/page.tsx`,
    `src/app/[locale]/${baseSegments}/route.ts`,
  ];
}

function loadManifest(): ClaimsManifest | null {
  const p = manifestPath();
  if (!fs.existsSync(p)) return null;
  const raw = fs.readFileSync(p, 'utf8');
  return JSON.parse(raw) as ClaimsManifest;
}

function hasAnyEvidence(e: Evidence): boolean {
  const lists = [e.files, e.routes, e.apis, e.tests];
  return lists.some(arr => Array.isArray(arr) && arr.length > 0);
}

function main() {
  if (!isEnabled()) {
    console.log(
      'VIDEO CLAIMS: skipped (set VIDEO_CLAIMS_AUDIT=1 to enable; VIDEO_CLAIMS_STRICT=1 to require complete coverage).',
    );
    return;
  }

  const strict = isStrict();
  const manifest = loadManifest();

  if (!manifest) {
    const msg = `VIDEO CLAIMS: no manifest found at ${path.relative(process.cwd(), manifestPath())}`;
    if (strict) {
      console.error(msg);
      process.exit(1);
    }
    console.warn(`${msg} (set VIDEO_CLAIMS_STRICT=1 to require it)`);
    return;
  }

  if (manifest.schemaVersion !== 1) {
    console.error(`VIDEO CLAIMS: unsupported schemaVersion=${manifest.schemaVersion} (expected 1)`);
    process.exit(1);
  }

  const issues: Array<{ level: 'error' | 'warning'; message: string; key?: string; claimId?: string }> = [];

  const canonicalKeys = Object.keys(HEYGEN_VIDEO_IDS);

  for (const key of canonicalKeys) {
    const entry = manifest.keys?.[key];
    if (!entry) {
      issues.push({
        level: strict ? 'error' : 'warning',
        key,
        message: `Missing claims manifest entry for key '${key}'`,
      });
      continue;
    }

    const claims = Array.isArray(entry.claims) ? entry.claims : [];
    if (claims.length === 0) {
      issues.push({
        level: strict ? 'error' : 'warning',
        key,
        message: `No claims listed for key '${key}' (expected at least one)` ,
      });
      continue;
    }

    for (const claim of claims) {
      if (!claim || typeof claim !== 'object') {
        issues.push({ level: 'error', key, message: `Invalid claim payload (non-object)` });
        continue;
      }

      if (!claim.id || typeof claim.id !== 'string' || !claim.id.trim()) {
        issues.push({ level: 'error', key, message: `Claim missing id` });
      }

      if (!claim.statement || typeof claim.statement !== 'string' || !claim.statement.trim()) {
        issues.push({ level: 'error', key, claimId: claim.id, message: `Claim '${claim.id}' has empty statement` });
      }

      if (!claim.evidence || typeof claim.evidence !== 'object') {
        issues.push({ level: 'error', key, claimId: claim.id, message: `Claim '${claim.id}' missing evidence object` });
        continue;
      }

      if (!hasAnyEvidence(claim.evidence)) {
        issues.push({
          level: strict ? 'error' : 'warning',
          key,
          claimId: claim.id,
          message: `Claim '${claim.id}' has no evidence pointers (files/routes/apis/tests)` ,
        });
      }

      for (const fp of claim.evidence.files ?? []) {
        if (!fileExists(fp)) {
          issues.push({ level: strict ? 'error' : 'warning', key, claimId: claim.id, message: `Missing evidence file: ${fp}` });
        }
      }

      for (const route of claim.evidence.routes ?? []) {
        const candidates = routeToCandidateFiles(route);
        const found = candidates.some(c => fileExists(c));
        if (!found) {
          issues.push({
            level: strict ? 'error' : 'warning',
            key,
            claimId: claim.id,
            message: `Route evidence '${route}' did not match any known app route file. Tried: ${candidates.join(', ')}`,
          });
        }
      }

      for (const test of claim.evidence.tests ?? []) {
        if (!fileExists(test)) {
          issues.push({ level: strict ? 'error' : 'warning', key, claimId: claim.id, message: `Missing evidence test file: ${test}` });
        }
      }
    }
  }

  const errors = issues.filter(i => i.level === 'error');
  const warnings = issues.filter(i => i.level === 'warning');

  if (warnings.length > 0) {
    console.warn(`VIDEO CLAIMS WARNINGS: ${warnings.length}`);
    for (const w of warnings.slice(0, 60)) {
      console.warn(`- [${w.key ?? '(global)'}${w.claimId ? `:${w.claimId}` : ''}] ${w.message}`);
    }
    if (warnings.length > 60) console.warn(`- ... (${warnings.length - 60} more)`);
  }

  if (errors.length > 0) {
    console.error(`VIDEO CLAIMS FAILED: ${errors.length} error(s)`);
    for (const e of errors.slice(0, 60)) {
      console.error(`- [${e.key ?? '(global)'}${e.claimId ? `:${e.claimId}` : ''}] ${e.message}`);
    }
    if (errors.length > 60) console.error(`- ... (${errors.length - 60} more)`);
    process.exit(1);
  }

  console.log(`VIDEO CLAIMS PASSED (keys=${canonicalKeys.length}, strict=${strict})`);
}

main();
