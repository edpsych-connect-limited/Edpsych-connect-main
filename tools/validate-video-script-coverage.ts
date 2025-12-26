import {
  CLOUDINARY_VIDEO_URLS,
  HEYGEN_VIDEO_IDS,
  LIVE_DEMO_VIDEO_URLS,
  LOCAL_VIDEO_PATHS,
} from '../src/lib/training/heygen-video-urls';

import { getVideoScriptResolution, listKnownScriptKeys } from '../src/lib/video-scripts/registry-core';

type IssueLevel = 'error' | 'warning';

type Issue = {
  level: IssueLevel;
  key: string;
  message: string;
};

type Scope = 'ai' | 'all';

function getScope(): Scope {
  const raw = (process.env.VIDEO_SCRIPT_COVERAGE_SCOPE ?? 'ai').toLowerCase();
  if (raw === 'all') return 'all';
  return 'ai';
}

function shouldAllowMissing(): boolean {
  return process.env.SCRIPT_COVERAGE_ALLOW_MISSING === '1';
}

function addAllKeys(out: Set<string>, keys: string[]) {
  for (const k of keys) {
    const key = k.trim();
    if (!key) continue;
    out.add(key);
  }
}

function main() {
  const scope = getScope();
  const allowMissing = shouldAllowMissing();

  const keys = new Set<string>();

  // "AI" scope is intentionally strict: these are the primary explainer keys
  // and must be fully transcript-backed to satisfy truth-by-code.
  addAllKeys(keys, Object.keys(HEYGEN_VIDEO_IDS));

  if (scope === 'all') {
    // Optional: extend to other registries (Cloudinary/local/live).
    addAllKeys(keys, Object.keys(CLOUDINARY_VIDEO_URLS));
    addAllKeys(keys, Object.keys(LOCAL_VIDEO_PATHS));
    addAllKeys(keys, Object.keys(LIVE_DEMO_VIDEO_URLS));
  }

  const issues: Issue[] = [];

  const sortedKeys = Array.from(keys).sort();
  const missing: string[] = [];
  const resolvedViaAlias: Array<{ key: string; resolvedKey: string }> = [];

  for (const key of sortedKeys) {
    const res = getVideoScriptResolution(key);
    if (res.status === 'missing') {
      missing.push(key);
      issues.push({
        level: allowMissing ? 'warning' : 'error',
        key,
        message: `Missing script transcript for key '${key}' (resolvedKey='${res.resolvedKey}'). Add a script or an explicit alias in src/lib/video-scripts/registry-core.ts`,
      });
      continue;
    }

    if (res.resolvedKey !== key) {
      resolvedViaAlias.push({ key, resolvedKey: res.resolvedKey });
    }

    if (!res.transcript.trim()) {
      issues.push({
        level: allowMissing ? 'warning' : 'error',
        key,
        message: `Empty transcript for key '${key}' (resolvedKey='${res.resolvedKey}', sourceId='${res.sourceId}')`,
      });
    }
  }

  // Additional signal: scripts that exist but are not referenced by the chosen keyspace.
  // This is a warning only.
  const knownScriptKeys = new Set(listKnownScriptKeys());
  const referencedKeys = new Set(sortedKeys.map(k => getVideoScriptResolution(k).resolvedKey));

  const orphaned = Array.from(knownScriptKeys)
    .filter(k => !referencedKeys.has(k))
    .sort()
    .slice(0, 50);

  if (orphaned.length > 0) {
    issues.push({
      level: 'warning',
      key: '(registry)',
      message: `Found ${orphaned.length}+ script keys not referenced by VIDEO_SCRIPT_COVERAGE_SCOPE='${scope}'. This can be normal during migration. First 50: ${orphaned.join(', ')}`,
    });
  }

  const errors = issues.filter(i => i.level === 'error');
  const warnings = issues.filter(i => i.level === 'warning');

  if (resolvedViaAlias.length > 0) {
    console.log(`SCRIPT COVERAGE: ${resolvedViaAlias.length} key(s) resolve via explicit alias.`);
    for (const a of resolvedViaAlias.slice(0, 40)) {
      console.log(`- ${a.key} -> ${a.resolvedKey}`);
    }
    if (resolvedViaAlias.length > 40) {
      console.log(`- ... (${resolvedViaAlias.length - 40} more)`);
    }
  }

  if (warnings.length > 0) {
    console.warn(`SCRIPT COVERAGE WARNINGS: ${warnings.length}`);
    for (const w of warnings.slice(0, 80)) {
      console.warn(`- [${w.key}] ${w.message}`);
    }
    if (warnings.length > 80) {
      console.warn(`- ... (${warnings.length - 80} more)`);
    }
  }

  if (errors.length > 0) {
    console.error(`SCRIPT COVERAGE FAILED: ${errors.length} error(s)`);
    for (const e of errors) {
      console.error(`- [${e.key}] ${e.message}`);
    }
    process.exit(1);
  }

  console.log(`SCRIPT COVERAGE PASSED (scope='${scope}', keys=${sortedKeys.length}, missing=${missing.length})`);
}

main();
