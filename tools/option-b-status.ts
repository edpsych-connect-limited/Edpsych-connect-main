import fs from 'fs';
import path from 'path';

import { CLOUDINARY_VIDEO_URLS, HEYGEN_VIDEO_IDS, LOCAL_VIDEO_PATHS } from '../src/lib/training/heygen-video-urls';

type DeliveryRecommendation = 'ok' | 'needs-attention' | string;

interface DeliveryAudit {
  keys?: Record<
    string,
    {
      recommendation?: DeliveryRecommendation;
      // tools/audit-video-delivery.ts writes issues as objects: { level, message }.
      // Keep this tool tolerant to older shapes.
      issues?: unknown[];
    }
  >;
}

function toTsvSafe(s: string): string {
  // TSV: keep one row per key, avoid tabs/newlines breaking the table.
  return s.replace(/[\t\r\n]+/g, ' ').trim();
}

function stringifyIssue(issue: unknown): string {
  if (typeof issue === 'string') return issue;

  if (issue && typeof issue === 'object') {
    const asAny = issue as { level?: unknown; message?: unknown };
    const level = typeof asAny.level === 'string' ? asAny.level : undefined;
    const message = typeof asAny.message === 'string' ? asAny.message : undefined;

    if (message && level) return `${level.toUpperCase()}: ${message}`;
    if (message) return message;
  }

  try {
    return JSON.stringify(issue);
  } catch {
    return String(issue);
  }
}

function readJson<T>(p: string): T {
  return JSON.parse(fs.readFileSync(p, 'utf8')) as T;
}

function fileExists(rel: string): boolean {
  const abs = path.join(process.cwd(), rel);
  return fs.existsSync(abs);
}

function main(): void {
  const auditPath = path.join(process.cwd(), 'video_provenance', 'video-delivery-audit.json');
  if (!fs.existsSync(auditPath)) {
    throw new Error(`Missing ${path.relative(process.cwd(), auditPath)}. Run the deterministic audit first.`);
  }

  const audit = readJson<DeliveryAudit>(auditPath);
  const keys = audit.keys || {};

  const needs = Object.keys(keys)
    .filter((k) => keys[k]?.recommendation === 'needs-attention')
    .sort();

  const rows = needs.map((k) => {
    const heygenId = HEYGEN_VIDEO_IDS[k] || '';
    const cloud = CLOUDINARY_VIDEO_URLS[k] || '';
    const local = LOCAL_VIDEO_PATHS[k] || '';

    const issuesRaw = keys[k]?.issues || [];
    const issues = issuesRaw
      .map((i) => stringifyIssue(i))
      // Keep the status file focused on actionable items.
      .filter((s) => s && !s.startsWith('INFO:'))
      .map(toTsvSafe)
      .join(' | ');

    return {
      key: k,
      heygenId,
      cloudinary: cloud ? 'YES' : 'NO',
      local: local ? 'YES' : 'NO',
      notes: issues || '',
    };
  });

  // Pretty-ish column output without extra deps
  const header = ['KEY', 'HEYGEN_ID', 'CLOUDINARY', 'LOCAL', 'NOTES'];
  const lines: string[] = [];
  lines.push(header.join('\t'));
  for (const r of rows) {
    lines.push([toTsvSafe(r.key), toTsvSafe(r.heygenId), r.cloudinary, r.local, toTsvSafe(r.notes)].join('\t'));
  }

  const outRel = path.join('logs', 'option_b_status.tsv');
  fs.mkdirSync(path.dirname(path.join(process.cwd(), outRel)), { recursive: true });
  fs.writeFileSync(path.join(process.cwd(), outRel), lines.join('\n') + '\n', 'utf8');

  console.log(`Option B status: needs-attention=${needs.length}`);
  console.log(`Wrote ${outRel}`);
  if (needs.length > 0) {
    console.log('Top 10:');
    for (const k of needs.slice(0, 10)) console.log(`- ${k}`);
  }

  // Extra deterministic sanity checks (no network calls):
  console.log(`heygen_videos_list.json present: ${fileExists('heygen_videos_list.json') ? 'YES' : 'NO'}`);
  console.log(`cloudinary-upload-results.json present: ${fileExists('cloudinary-upload-results.json') ? 'YES' : 'NO'}`);
}

main();
