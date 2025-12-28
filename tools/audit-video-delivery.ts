/**
 * Video Delivery Audit (deterministic, repo-verifiable)
 *
 * Answers, by canonical key:
 * - Is there a transcript/script in the registry? (truth-by-code)
 * - Do we have script provenance pinned? (video_provenance/video-script-provenance.json)
 * - Is there a Cloudinary/local/live-demo mapping? Does the local file exist?
 * - Does the HeyGen video ID appear in a captured HeyGen inventory list (if present)?
 * - Is the key referenced anywhere in product source code (literal embedding signals)?
 *
 * This does NOT make network calls. It is designed to be stable in CI and to
 * create a "what is left" checklist without hand-wavy claims.
 *
 * Run:
 *   npx tsx tools/audit-video-delivery.ts
 */

import fs from 'node:fs';
import path from 'node:path';

import {
  CLOUDINARY_VIDEO_URLS,
  HEYGEN_VIDEO_IDS,
  LIVE_DEMO_VIDEO_URLS,
  LOCAL_VIDEO_PATHS,
} from '../src/lib/training/heygen-video-urls';
import { getVideoScriptResolution } from '../src/lib/video-scripts/registry-core';

type HeyGenListEntry = {
  video_id?: unknown;
  status?: unknown;
  video_title?: unknown;
  created_at?: unknown;
  type?: unknown;
};

type ProvenanceEntry = {
  key?: unknown;
  resolvedKey?: unknown;
  sourceId?: unknown;
  title?: unknown;
  scriptSha256?: unknown;
  verifiedAudioMatch?: unknown;
  generatedAt?: unknown;
};

type ScriptProvenanceFile = {
  schemaVersion?: unknown;
  generatedAt?: unknown;
  keys?: Record<string, ProvenanceEntry>;
};

type IssueLevel = 'error' | 'warning' | 'info';

type KeyAudit = {
  key: string;
  resolvedKey: string;
  scriptStatus: 'found' | 'missing';
  provenance: {
    present: boolean;
    verifiedAudioMatch: boolean;
  };
  sources: {
    heygenId: string;
    heygenStatus?: string;
    cloudinaryUrl?: string;
    liveDemoUrl?: string;
    localPath?: string;
    localFileExists: boolean;
  };
  embedding: {
    literalReferenceCount: number;
    sampleFiles: string[];
  };
  issues: Array<{ level: IssueLevel; message: string }>;
  recommendation: 'ok' | 'needs-attention';
};

type DeliveryAudit = {
  schemaVersion: 1;
  generatedAt: string;
  totals: {
    keysTotal: number;
    scriptsMissing: number;
    provenanceMissing: number;
    heygenMissingFromInventory: number;
    heygenCompleted: number;
    heygenNotCompleted: number;
    cloudinaryMapped: number;
    liveDemoMapped: number;
    localMapped: number;
    localFilesPresent: number;
    embeddedLiteral: number;
    embedMissingLiteral: number;
    needsAttention: number;
  };
  keys: Record<string, KeyAudit>;
};

function readJsonFile<T>(filePath: string): T | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

function listTextFilesUnder(rootDir: string): string[] {
  const out: string[] = [];
  const allowedExt = new Set(['.ts', '.tsx', '.md', '.mdx']);

  function walk(dir: string) {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (ent.name === 'node_modules' || ent.name === '.next' || ent.name === '.git') continue;
        walk(full);
        continue;
      }

      if (!ent.isFile()) continue;
      const ext = path.extname(ent.name);
      if (!allowedExt.has(ext)) continue;
      out.push(full);
    }
  }

  walk(rootDir);
  return out;
}

function main() {
  const repoRoot = process.cwd();
  const now = new Date().toISOString();

  const keys = Object.keys(HEYGEN_VIDEO_IDS).sort();

  // Optional: captured inventory from HeyGen API (helps answer "generated" without network calls).
  const heygenListPath = path.join(repoRoot, 'heygen_videos_list.json');
  const heygenList = readJsonFile<unknown>(heygenListPath);
  const heygenStatusById = new Map<string, string>();
  if (Array.isArray(heygenList)) {
    for (const row of heygenList as HeyGenListEntry[]) {
      const id = typeof row?.video_id === 'string' ? row.video_id : undefined;
      const status = typeof row?.status === 'string' ? row.status : undefined;
      if (id && status) heygenStatusById.set(id, status);
    }
  }

  const provenancePath = path.join(repoRoot, 'video_provenance', 'video-script-provenance.json');
  const provenanceFile = readJsonFile<ScriptProvenanceFile>(provenancePath);
  const provenanceKeys = (provenanceFile && typeof provenanceFile === 'object' && provenanceFile)
    ? (provenanceFile.keys ?? {})
    : {};

  // Literal embedding signals: scan src/** once and count key occurrences.
  const srcRoot = path.join(repoRoot, 'src');
  const srcFiles = fs.existsSync(srcRoot) ? listTextFilesUnder(srcRoot) : [];

  const literalCountByKey = new Map<string, number>();
  const literalFilesByKey = new Map<string, string[]>();
  for (const k of keys) {
    literalCountByKey.set(k, 0);
    literalFilesByKey.set(k, []);
  }

  for (const fp of srcFiles) {
    let text: string;
    try {
      text = fs.readFileSync(fp, 'utf8');
    } catch {
      continue;
    }

    for (const k of keys) {
      const idx = text.indexOf(k);
      if (idx === -1) continue;

      literalCountByKey.set(k, (literalCountByKey.get(k) ?? 0) + 1);
      const list = literalFilesByKey.get(k) ?? [];
      if (list.length < 8) {
        list.push(path.relative(repoRoot, fp));
        literalFilesByKey.set(k, list);
      }
    }
  }

  const report: DeliveryAudit = {
    schemaVersion: 1,
    generatedAt: now,
    totals: {
      keysTotal: keys.length,
      scriptsMissing: 0,
      provenanceMissing: 0,
      heygenMissingFromInventory: 0,
      heygenCompleted: 0,
      heygenNotCompleted: 0,
      cloudinaryMapped: 0,
      liveDemoMapped: 0,
      localMapped: 0,
      localFilesPresent: 0,
      embeddedLiteral: 0,
      embedMissingLiteral: 0,
      needsAttention: 0,
    },
    keys: {},
  };

  for (const key of keys) {
    const issues: Array<{ level: IssueLevel; message: string }> = [];

    const scriptRes = getVideoScriptResolution(key);
    if (scriptRes.status === 'missing') {
      report.totals.scriptsMissing += 1;
      issues.push({ level: 'error', message: `Missing script/transcript for key (resolvedKey='${scriptRes.resolvedKey}')` });
    }

    const prov = provenanceKeys?.[key];
    const provPresent = Boolean(prov);
    const verifiedAudioMatch = Boolean((prov as ProvenanceEntry | undefined)?.verifiedAudioMatch === true);
    if (!provPresent) {
      report.totals.provenanceMissing += 1;
      issues.push({ level: 'warning', message: `No provenance entry found in video_provenance/video-script-provenance.json` });
    }

    const cloudinaryUrl = CLOUDINARY_VIDEO_URLS[key];
    if (cloudinaryUrl) report.totals.cloudinaryMapped += 1;

    const liveDemoUrl = LIVE_DEMO_VIDEO_URLS[key];
    if (liveDemoUrl) report.totals.liveDemoMapped += 1;

    const localPath = LOCAL_VIDEO_PATHS[key];
    const localFile = localPath ? path.join(repoRoot, 'public', localPath.replace(/^\//, '')) : undefined;
    const localFileExists = Boolean(localFile && fs.existsSync(localFile));
    if (localPath) report.totals.localMapped += 1;
    if (localFileExists) report.totals.localFilesPresent += 1;

    if (localPath && !localFileExists) {
      issues.push({ level: 'warning', message: `Local fallback path mapped but file is missing on disk: public${localPath}` });
    }

    // Only warn about HeyGen inventory drift / non-completion when the key depends
    // on HeyGen at runtime (i.e., no Cloudinary/local/live fallback is available).
    const hasFallback = Boolean(cloudinaryUrl || localPath || liveDemoUrl);
    const heygenId = HEYGEN_VIDEO_IDS[key];
    const heygenStatus = heygenStatusById.get(heygenId);
    if (heygenStatusById.size > 0) {
      if (!heygenStatus) {
        report.totals.heygenMissingFromInventory += 1;
        if (!hasFallback) {
          issues.push({ level: 'warning', message: `HeyGen ID '${heygenId}' not found in heygen_videos_list.json (inventory drift?)` });
        }
      } else if (heygenStatus === 'completed') {
        report.totals.heygenCompleted += 1;
      } else {
        report.totals.heygenNotCompleted += 1;
        if (!hasFallback) {
          issues.push({ level: 'warning', message: `HeyGen status is '${heygenStatus}' for id='${heygenId}'` });
        }
      }
    } else {
      issues.push({ level: 'info', message: `No heygen_videos_list.json inventory loaded (skipping generation status checks)` });
    }

    const literalCount = literalCountByKey.get(key) ?? 0;
    const sampleFiles = literalFilesByKey.get(key) ?? [];
    if (literalCount > 0) report.totals.embeddedLiteral += 1;
    else report.totals.embedMissingLiteral += 1;

    // Heuristic: if it has neither Cloudinary nor local nor live-demo mapping, it relies entirely on HeyGen embed.
    // That's acceptable for early-stage, but it is still a deploy-time dependency.
    if (!cloudinaryUrl && !localPath && !liveDemoUrl) {
      issues.push({ level: 'warning', message: `No Cloudinary/local/live-demo mapping; playback depends on HeyGen embed only` });
    }

    const needsAttention = issues.some(i => i.level === 'error' || i.level === 'warning');
    if (needsAttention) report.totals.needsAttention += 1;

    report.keys[key] = {
      key,
      resolvedKey: scriptRes.resolvedKey,
      scriptStatus: scriptRes.status,
      provenance: {
        present: provPresent,
        verifiedAudioMatch,
      },
      sources: {
        heygenId,
        heygenStatus,
        cloudinaryUrl,
        liveDemoUrl,
        localPath,
        localFileExists,
      },
      embedding: {
        literalReferenceCount: literalCount,
        sampleFiles,
      },
      issues,
      recommendation: needsAttention ? 'needs-attention' : 'ok',
    };
  }

  const outDir = path.join(repoRoot, 'video_provenance');
  ensureDir(outDir);

  const jsonOutPath = path.join(outDir, 'video-delivery-audit.json');
  fs.writeFileSync(jsonOutPath, JSON.stringify(report, null, 2) + '\n', 'utf8');

  const mdOutPath = path.join(repoRoot, 'docs', 'VIDEO_DELIVERY_AUDIT_SUMMARY.md');
  ensureDir(path.dirname(mdOutPath));

  const needsAttentionKeys = keys.filter(k => report.keys[k]?.recommendation === 'needs-attention');

  const lines: string[] = [];
  lines.push('# Video Delivery Audit Summary');
  lines.push('');
  lines.push(`Generated: ${now}`);
  lines.push('');
  lines.push('This report is deterministic (no network calls). It uses repository evidence only:');
  lines.push('- Canonical keys: `src/lib/training/heygen-video-urls.ts` (`HEYGEN_VIDEO_IDS`)');
  lines.push('- Scripts/transcripts: `src/lib/video-scripts/registry-core.ts`');
  lines.push('- Provenance: `video_provenance/video-script-provenance.json`');
  lines.push('- Optional HeyGen inventory snapshot: `heygen_videos_list.json`');
  lines.push('- Embedding signals: literal key references in `src/**/*.{ts,tsx,md,mdx}`');
  lines.push('');
  lines.push('## Totals');
  lines.push('');
  lines.push(`- Keys total: **${report.totals.keysTotal}**`);
  lines.push(`- Scripts missing: **${report.totals.scriptsMissing}**`);
  lines.push(`- Provenance missing: **${report.totals.provenanceMissing}**`);
  if (heygenStatusById.size > 0) {
    lines.push(`- HeyGen inventory loaded: **${heygenStatusById.size}** video id(s)`);
    lines.push(`- HeyGen completed (in inventory): **${report.totals.heygenCompleted}**`);
    lines.push(`- HeyGen not completed (in inventory): **${report.totals.heygenNotCompleted}**`);
    lines.push(`- HeyGen IDs missing from inventory: **${report.totals.heygenMissingFromInventory}**`);
  } else {
    lines.push('- HeyGen inventory loaded: **0** (skipped generation status checks)');
  }
  lines.push(`- Cloudinary mapped: **${report.totals.cloudinaryMapped}**`);
  lines.push(`- Live demo mapped: **${report.totals.liveDemoMapped}**`);
  lines.push(`- Local fallback mapped: **${report.totals.localMapped}**`);
  lines.push(`- Local fallback files present on disk: **${report.totals.localFilesPresent}**`);
  lines.push(`- Keys with literal embedding references: **${report.totals.embeddedLiteral}**`);
  lines.push(`- Keys with no literal embedding references: **${report.totals.embedMissingLiteral}**`);
  lines.push(`- Keys needing attention (warnings/errors): **${report.totals.needsAttention}**`);
  lines.push('');
  lines.push('## What is left (top issues)');
  lines.push('');
  if (needsAttentionKeys.length === 0) {
    lines.push('- ✅ No keys flagged by this audit.');
  } else {
    for (const k of needsAttentionKeys.slice(0, 60)) {
      const entry = report.keys[k];
      const warnErr = entry.issues.filter(i => i.level !== 'info');
      const notes = warnErr.map(i => `${i.level.toUpperCase()}: ${i.message}`).join(' | ');
      lines.push(`- \`${k}\`: ${notes}`);
    }
    if (needsAttentionKeys.length > 60) {
      lines.push(`- … plus ${needsAttentionKeys.length - 60} more (see JSON for full list)`);
    }
  }
  lines.push('');
  lines.push('## Where this is recorded');
  lines.push('');
  lines.push('- Machine-readable: `video_provenance/video-delivery-audit.json`');
  lines.push('- Human summary: `docs/VIDEO_DELIVERY_AUDIT_SUMMARY.md`');
  lines.push('');
  lines.push('## Notes on interpretation');
  lines.push('');
  lines.push('- “Embedded (literal)” means the key string appears in source code. Keys can still be embedded indirectly via dynamic registries; treat missing literal references as a prompt to verify routing/UI wiring.');
  lines.push('- This audit does not assert rendered audio matches scripts; for that you must set `verifiedAudioMatch: true` with external evidence in provenance.');

  fs.writeFileSync(mdOutPath, lines.join('\n') + '\n', 'utf8');

  // eslint-disable-next-line no-console
  console.log(`Wrote ${path.relative(repoRoot, jsonOutPath)} and ${path.relative(repoRoot, mdOutPath)}`);
  // eslint-disable-next-line no-console
  console.log(`Keys total=${report.totals.keysTotal}, needsAttention=${report.totals.needsAttention}`);
}

main();
