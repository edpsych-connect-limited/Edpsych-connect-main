import fs from 'node:fs';
import path from 'node:path';

import { HEYGEN_VIDEO_IDS } from '../src/lib/training/heygen-video-urls';
import { getVideoScriptResolution } from '../src/lib/video-scripts/registry-core';

type Evidence = {
  files?: string[];
  routes?: string[];
  apis?: string[];
  tests?: string[];
  codeSearch?: Array<{ file: string; pattern: string; isRegex?: boolean }>;
  notes?: string;
};

type ClaimStatus = 'draft' | 'needs-review' | 'verified' | 'deprecated';

type Claim = {
  id: string;
  statement: string;
  evidence: Evidence;
  kind?: 'registry-key' | 'script-transcript';
  expected?: 'present' | 'missing';
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
      kind: 'registry-key',
      expected: 'present',
      status: 'needs-review',
      lastReviewedAt: '',
      evidence: {
        files: uniqStrings(['src/lib/training/heygen-video-urls.ts', 'src/app/api/video/health/route.ts']),
        apis: [`/api/video/health?key=${encodeURIComponent(key)}`],
        codeSearch: [
          // Anchor: key is present in the canonical ID registry object.
          // Match either single or double quotes, followed by a colon (object literal key).
          { file: 'src/lib/training/heygen-video-urls.ts', pattern: `['\"]${escapeRegex(key)}['\"]\s*:`, isRegex: true },
        ],
      },
    },
    {
      id: `${key}-script-001`,
      statement: hasTranscript
        ? `A script-derived transcript exists for key '${key}', and the captions endpoint can produce script-derived WebVTT for this key.`
        : `Transcript is currently missing for key '${key}' (captions cannot be truthfully claimed until a transcript exists).`,
      kind: 'script-transcript',
      expected: hasTranscript ? 'present' : 'missing',
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
        codeSearch: [
          // Anchor: captions endpoint exists.
          { file: 'src/app/api/video/captions/route.ts', pattern: 'text/vtt' },
        ],
      },
    },
  ];

  return claims;
}

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function mergeEvidence(existing: Evidence, additions: Evidence): Evidence {
  const merged: Evidence = {
    ...existing,
    files: uniqStrings([...(existing.files ?? []), ...(additions.files ?? [])]),
    routes: uniqStrings([...(existing.routes ?? []), ...(additions.routes ?? [])]),
    apis: uniqStrings([...(existing.apis ?? []), ...(additions.apis ?? [])]),
    tests: uniqStrings([...(existing.tests ?? []), ...(additions.tests ?? [])]),
    codeSearch: [...(existing.codeSearch ?? []), ...(additions.codeSearch ?? [])],
    notes: existing.notes ?? additions.notes,
  };

  // De-dupe codeSearch by (file,pattern,isRegex)
  if (merged.codeSearch && merged.codeSearch.length > 0) {
    const seen = new Set<string>();
    merged.codeSearch = merged.codeSearch.filter(cs => {
      if (!cs || typeof cs !== 'object') return false;
      const k = `${cs.file}::${cs.pattern}::${cs.isRegex ? '1' : '0'}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }

  return merged;
}

function isBaseGeneratedId(key: string, id: string): boolean {
  return id === `${key}-registry-001` || id === `${key}-script-001`;
}

function mergeClaims(existing: Claim[], additions: Claim[]): Claim[] {
  const byId = new Map<string, Claim>();
  for (const c of existing) {
    if (!c || typeof c !== 'object') continue;
    if (!c.id || typeof c.id !== 'string') continue;
    byId.set(c.id, c);
  }

  for (const a of additions) {
    const current = byId.get(a.id);
    if (!current) {
      byId.set(a.id, a);
      continue;
    }

    // For our generated baseline claim IDs, enrich missing structured fields and
    // merge evidence without overwriting user-edited statements.
    // (User statement edits are allowed, but the kind/expected + evidence anchors
    // are required for congruence checks.)
    //
    // Note: We intentionally do NOT overwrite status/lastReviewedAt.
    // The auditor owns those.
    const keyMatch = a.id.replace(/-(registry|script)-001$/, '');
    if (isBaseGeneratedId(keyMatch, a.id)) {
      byId.set(a.id, {
        ...current,
        kind: (current.kind ?? a.kind),
        expected: (current.expected ?? a.expected),
        evidence: mergeEvidence(current.evidence ?? {}, a.evidence ?? {}),
      });
    }
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
