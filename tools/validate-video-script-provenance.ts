import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

import { HEYGEN_VIDEO_IDS } from '../src/lib/training/heygen-video-urls';
import { getVideoScriptResolution } from '../src/lib/video-scripts/registry-core';

type IssueLevel = 'error' | 'warning';

type Issue = {
  level: IssueLevel;
  key: string;
  message: string;
};

type ProvenanceEntry = {
  key: string;
  resolvedKey: string;
  sourceId?: string;
  title?: string;
  scriptSha256: string;
  verifiedAudioMatch: boolean;
  generatedAt?: string;
};

type ScriptProvenanceFile = {
  schemaVersion: 1;
  description?: string;
  generatedAt?: string;
  keys: Record<string, ProvenanceEntry>;
};

function sha256(text: string): string {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

function main() {
  const issues: Issue[] = [];
  const filePath = path.join(process.cwd(), 'video_provenance', 'video-script-provenance.json');

  if (!fs.existsSync(filePath)) {
    console.error(`Missing provenance file: ${filePath}`);
    console.error('Run: tsx tools/generate-video-script-provenance.ts');
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(raw) as ScriptProvenanceFile;

  if (!parsed || parsed.schemaVersion !== 1 || !parsed.keys) {
    console.error('Invalid provenance file schema (expected schemaVersion=1 with keys map)');
    process.exit(1);
  }

  const keys = Object.keys(HEYGEN_VIDEO_IDS).sort();

  for (const key of keys) {
    const prov = parsed.keys[key];
    if (!prov) {
      issues.push({
        level: 'error',
        key,
        message: `Missing provenance entry for key '${key}'`,
      });
      continue;
    }

    const res = getVideoScriptResolution(key);
    if (res.status !== 'found') {
      issues.push({
        level: 'error',
        key,
        message: `Registry missing transcript for key '${key}' (resolvedKey='${res.resolvedKey}')`,
      });
      continue;
    }

    const expectedHash = sha256(res.transcript);
    if (prov.scriptSha256 !== expectedHash) {
      issues.push({
        level: 'error',
        key,
        message: `scriptSha256 mismatch. Expected ${expectedHash}, got ${prov.scriptSha256}. Regenerate provenance after script changes.`,
      });
    }

    if (prov.resolvedKey !== res.resolvedKey) {
      issues.push({
        level: 'error',
        key,
        message: `resolvedKey mismatch. Expected '${res.resolvedKey}', got '${prov.resolvedKey}'. Regenerate provenance after alias changes.`,
      });
    }

    // Truth-by-code enforcement: verifiedAudioMatch can only be true if an explicit override is present.
    // We cannot validate external evidence here, but we can ensure we never mark it true by default.
    if (prov.verifiedAudioMatch === true) {
      issues.push({
        level: 'warning',
        key,
        message: `verifiedAudioMatch=true. Ensure external evidence exists (manual review) and that UI copy does not overclaim identity/audio match without provenance.`,
      });
    }
  }

  const errors = issues.filter(i => i.level === 'error');
  const warnings = issues.filter(i => i.level === 'warning');

  if (warnings.length) {
    console.warn(`SCRIPT PROVENANCE WARNINGS: ${warnings.length}`);
    for (const w of warnings.slice(0, 50)) console.warn(`- [${w.key}] ${w.message}`);
  }

  if (errors.length) {
    console.error(`SCRIPT PROVENANCE FAILED: ${errors.length} error(s)`);
    for (const e of errors) console.error(`- [${e.key}] ${e.message}`);
    process.exit(1);
  }

  console.log(`SCRIPT PROVENANCE PASSED (keys=${keys.length})`);
}

main();
