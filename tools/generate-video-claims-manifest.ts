import fs from 'node:fs';
import path from 'node:path';

import { HEYGEN_VIDEO_IDS } from '../src/lib/training/heygen-video-urls';
import { getVideoScriptResolution } from '../src/lib/video-scripts/registry-core';

type Evidence = {
  files?: string[];
  routes?: string[];
  apis?: string[];
  tests?: string[];
  notes?: string;
};

type ClaimStatus = 'draft' | 'needs-review' | 'verified' | 'deprecated';

type Claim = {
  id: string;
  statement: string;
  evidence: Evidence;
  status?: ClaimStatus;
  lastReviewedAt?: string;
};

type ClaimsManifest = {
  schemaVersion: number;
  generatedAt?: string;
  description?: string;
  keys: Record<string, { claims: Claim[] }>;
};

function manifestPath(): string {
  return path.join(process.cwd(), 'video_provenance', 'video-claims-manifest.json');
}

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

function loadExisting(): ClaimsManifest | null {
  const p = manifestPath();
  if (!fs.existsSync(p)) return null;
  const raw = fs.readFileSync(p, 'utf8');
  return JSON.parse(raw) as ClaimsManifest;
}

function uniqStrings(values: Array<string | undefined | null>): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const v of values) {
    if (!v || typeof v !== 'string') continue;
    const s = v.trim();
    if (!s) continue;
    if (seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

function baseClaimsForKey(key: string): Claim[] {
  const res = getVideoScriptResolution(key);

  const hasTranscript = res.status === 'found' && Boolean(res.transcript?.trim());

  const scriptEvidenceNotes =
    res.status === 'found'
      ? `Transcript sourceId='${res.sourceId}', resolvedKey='${res.resolvedKey}'. (Truth-by-code: transcript is script-derived; audio match is not asserted here.)`
      : `No transcript found for key='${key}' (resolvedKey='${res.resolvedKey}'). Add a script entry or alias before claiming captions/voice content.`;

  const claims: Claim[] = [
    {
      id: `${key}-registry-001`,
      statement: `Key '${key}' is present in the canonical video registry and should appear in /api/video/health candidate output.`,
      status: 'needs-review',
      lastReviewedAt: '',
      evidence: {
        files: uniqStrings(['src/lib/training/heygen-video-urls.ts', 'src/app/api/video/health/route.ts']),
        apis: [`/api/video/health?key=${encodeURIComponent(key)}`],
      },
    },
    {
      id: `${key}-script-001`,
      statement: hasTranscript
        ? `A script-derived transcript exists for key '${key}', and the captions endpoint can produce script-derived WebVTT for this key.`
        : `Transcript is currently missing for key '${key}' (captions cannot be truthfully claimed until a transcript exists).`,
      status: hasTranscript ? 'needs-review' : 'draft',
      lastReviewedAt: '',
      evidence: {
        files: uniqStrings([
          'src/lib/video-scripts/registry-core.ts',
          'src/app/api/video/captions/route.ts',
          // Script sources live under video_scripts/*; we reference the import roots.
          'video_scripts/world_class',
        ]),
        apis: [`/api/video/captions?key=${encodeURIComponent(key)}`],
        notes: scriptEvidenceNotes,
      },
    },
  ];

  return claims;
}

function mergeClaims(existing: Claim[], additions: Claim[]): Claim[] {
  const byId = new Map<string, Claim>();
  for (const c of existing) {
    if (!c || typeof c !== 'object') continue;
    if (!c.id || typeof c.id !== 'string') continue;
    byId.set(c.id, c);
  }

  for (const a of additions) {
    if (!byId.has(a.id)) byId.set(a.id, a);
  }

  return Array.from(byId.values()).sort((a, b) => a.id.localeCompare(b.id));
}

function main() {
  const existing = loadExisting();

  const canonicalKeys = Object.keys(HEYGEN_VIDEO_IDS).sort();

  const manifest: ClaimsManifest = existing ?? {
    schemaVersion: 1,
    generatedAt: '',
    description:
      'Manual claim-to-evidence mapping for each video key. This is the basis for auditing script claims against the actual codebase (truth-by-code).',
    keys: {},
  };

  if (manifest.schemaVersion !== 1) {
    // eslint-disable-next-line no-console
    console.error(`Unsupported schemaVersion=${manifest.schemaVersion} in ${path.relative(process.cwd(), manifestPath())}`);
    process.exit(1);
  }

  let addedKeys = 0;
  let updatedKeys = 0;

  for (const key of canonicalKeys) {
    const current = manifest.keys[key];
    const existingClaims = Array.isArray(current?.claims) ? current.claims : [];
    const additions = baseClaimsForKey(key);

    if (!current) {
      manifest.keys[key] = { claims: additions };
      addedKeys++;
      continue;
    }

    const merged = mergeClaims(existingClaims, additions);
    const changed = merged.length !== existingClaims.length;
    manifest.keys[key] = { claims: merged };
    if (changed) updatedKeys++;
  }

  // Leave unknown keys intact (manual entries), but we keep canonical coverage complete.
  manifest.generatedAt = new Date().toISOString();

  ensureDir(path.dirname(manifestPath()));
  fs.writeFileSync(manifestPath(), JSON.stringify(manifest, null, 2), 'utf8');

  // eslint-disable-next-line no-console
  console.log('VIDEO CLAIMS MANIFEST: generated');
  // eslint-disable-next-line no-console
  console.log(`- Path: ${path.relative(process.cwd(), manifestPath())}`);
  // eslint-disable-next-line no-console
  console.log(`- Canonical keys: ${canonicalKeys.length}`);
  // eslint-disable-next-line no-console
  console.log(`- Added keys: ${addedKeys}`);
  // eslint-disable-next-line no-console
  console.log(`- Updated keys (claims merged): ${updatedKeys}`);
}

main();
