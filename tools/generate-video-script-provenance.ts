import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

import { HEYGEN_VIDEO_IDS } from '../src/lib/training/heygen-video-urls';
import { getVideoScriptResolution } from '../src/lib/video-scripts/registry-core';

type ProvenanceEntry = {
  key: string;
  resolvedKey: string;
  sourceId?: string;
  title?: string;

  // Hash of the *script-derived transcript* stored in our repo.
  scriptSha256: string;

  // Truth-by-code guardrail:
  // - false means we DO NOT claim that rendered audio exactly matches this text.
  // - true requires explicit evidence (not generated automatically).
  verifiedAudioMatch: boolean;

  generatedAt: string;
};

type ScriptProvenanceFile = {
  schemaVersion: 1;
  description: string;
  generatedAt: string;
  keys: Record<string, ProvenanceEntry>;
};

function sha256(text: string): string {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

function main() {
  const outPath = path.join(process.cwd(), 'video_provenance', 'video-script-provenance.json');

  const now = new Date().toISOString();
  const keys = Object.keys(HEYGEN_VIDEO_IDS).sort();

  const entries: Record<string, ProvenanceEntry> = {};

  for (const key of keys) {
    const res = getVideoScriptResolution(key);
    if (res.status !== 'found') {
      // Generate still fails CI elsewhere; keep file generation deterministic.
      throw new Error(`Missing script for key '${key}' (resolvedKey='${res.resolvedKey}').`);
    }

    entries[key] = {
      key,
      resolvedKey: res.resolvedKey,
      sourceId: res.sourceId,
      title: res.title,
      scriptSha256: sha256(res.transcript),
      verifiedAudioMatch: false,
      generatedAt: now,
    };
  }

  const payload: ScriptProvenanceFile = {
    schemaVersion: 1,
    description:
      'Truth-by-code script provenance. This file proves which script text is associated with each videoKey via SHA256. It does NOT assert that rendered audio matches unless verifiedAudioMatch is explicitly set true with external evidence.',
    generatedAt: now,
    keys: entries,
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n', 'utf8');

  console.log(`WROTE ${outPath}`);
  console.log(`KEYS=${keys.length}`);
}

main();
