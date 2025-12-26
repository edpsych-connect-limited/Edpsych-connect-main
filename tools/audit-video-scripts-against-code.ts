/**
 * Audit video scripts (script-derived transcripts) against code evidence.
 *
 * Goal: produce a repo-verifiable, repeatable triage report:
 * - which canonical video keys have transcripts
 * - which transcripts contain claim-like sentences
 * - which of those sentences have *some* code evidence anchor (heuristic map)
 * - which are high-risk / unevidenced and likely require script adjustment (and thus re-generation)
 *
 * IMPORTANT: This tool is intentionally conservative.
 * - “Unevidenced” does NOT prove a claim is false; it means we have no code anchor configured.
 * - “Evidenced” means a code anchor pattern matched; it does NOT prove the implementation fully satisfies a claim.
 *
 * Run:
 *   npx tsx tools/audit-video-scripts-against-code.ts
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

import { HEYGEN_VIDEO_IDS } from '../src/lib/training/heygen-video-urls';
import { getVideoScriptResolution } from '../src/lib/video-scripts/registry-core';

type CodeSearch = {
  file: string;
  pattern: string;
  isRegex?: boolean;
};

type EvidenceRule = {
  id: string;
  label: string;
  sentenceRe: RegExp;
  code: CodeSearch[];
  notes?: string;
};

type KeyReport = {
  key: string;
  resolvedKey: string;
  scriptStatus: 'found' | 'missing';
  sourceId?: string;
  title?: string;
  transcriptSha256?: string;
  transcriptLength?: number;
  claimSentences?: {
    total: number;
    highRisk: number;
    evidenced: number;
    unevidenced: number;
    highRiskUnevidencedExamples: string[];
    unevidencedExamples: string[];
  };
  recommendation: 'ok' | 'needs-review' | 'likely-script-update';
  notes: string[];
};

type AuditReport = {
  schemaVersion: 1;
  generatedAt: string;
  totals: {
    keysTotal: number;
    scriptsMissing: number;
    ok: number;
    needsReview: number;
    likelyScriptUpdate: number;
    regenCandidatesEstimate: number;
  };
  keys: Record<string, KeyReport>;
};

function sha256(text: string): string {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function sentenceSplit(text: string): string[] {
  const t = normalizeWhitespace(text);
  if (!t) return [];
  // A pragmatic split for narration-style scripts. We keep punctuation.
  const parts = t
    .split(/(?<=[.!?])\s+(?=[A-Z0-9“"(])/)
    .map(s => s.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [t];
}

function safeReadFile(absPath: string): string | null {
  try {
    return fs.readFileSync(absPath, 'utf8');
  } catch {
    return null;
  }
}

function matchesCodeSearch(cs: CodeSearch): boolean {
  const abs = path.resolve(process.cwd(), cs.file);
  const content = safeReadFile(abs);
  if (content == null) return false;
  if (cs.isRegex) {
    try {
      const re = new RegExp(cs.pattern, 'm');
      return re.test(content);
    } catch {
      return false;
    }
  }
  return content.includes(cs.pattern);
}

function anyEvidenceMatches(rule: EvidenceRule): boolean {
  // ANY-of semantics: if at least one anchor hits, we treat as “some evidence exists”.
  return rule.code.some(matchesCodeSearch);
}

// Sentences that are likely “product claims” (not pure narration).
const CLAIMY_SENTENCE_RE =
  /\b(we|our|the platform|edpsych|the system|this tool|this feature|you can|you\'ll|automatically|in real\s*time|audit|compliance|gdpr|safeguard|security|encryption|ai|agent|predict|flag|detect|integrate|dashboard|report|export|workflow)\b/i;

// Sentences that create legal/technical risk if wrong.
const HIGH_RISK_RE =
  /\b(guarantee|always|never|100%|fully compliant|gdpr compliant|uk\s*gdpr|iso\s*27001|hipaa|soc\s*2|aes-?256|end-to-end encryption|penetration tested|legal requirement|automatically flags every|scans every case)\b/i;

// Evidence rules: small-but-real set of code anchors. Expand over time.
// (This is the part that makes the audit “provable by repo”.)
const EVIDENCE_RULES: EvidenceRule[] = [
  {
    id: 'captions-api',
    label: 'Captions endpoint exists',
    sentenceRe: /\b(captions?|subtitles?|webvtt|vtt)\b/i,
    code: [
      { file: 'src/app/api/video/captions/route.ts', pattern: 'export async function GET' },
      { file: 'src/app/api/video/captions/route.ts', pattern: 'WEBVTT' },
    ],
  },
  {
    id: 'heygen-url-api',
    label: 'HeyGen URL fetch route exists',
    sentenceRe: /\b(heygen|embed|video_url|video status)\b/i,
    code: [
      { file: 'src/app/api/video/heygen-url/route.ts', pattern: 'video_status.get' },
      { file: 'src/app/api/video/heygen-url/route.ts', pattern: 'HEYGEN_VIDEO_IDS' },
    ],
  },
  {
    id: 'video-source-priority',
    label: 'Video source priority ordering exists',
    sentenceRe: /\b(cloudinary|cdn|fallback|local file|priorit(y|ise))\b/i,
    code: [
      { file: 'src/lib/training/heygen-video-urls.ts', pattern: 'getVideoSourceCandidates' },
      { file: 'src/lib/cloudinary.ts', pattern: 'getBestVideoSourceWithCloudinary' },
    ],
  },
  {
    id: 'audit-log-integrity',
    label: 'Audit log integrity tooling exists',
    sentenceRe: /\b(audit log|tamper|integrity|immutable)\b/i,
    code: [
      { file: 'tools/verify-audit-log-integrity.ts', pattern: 'verify' },
      { file: 'tools/test-audit-integrity.ts', pattern: 'audit' },
    ],
  },
  {
    id: 'pii-redaction',
    label: 'PII redaction tooling exists',
    sentenceRe: /\b(pii|redact|redaction|personal data)\b/i,
    code: [{ file: 'tools/test-pii-redaction.ts', pattern: 'redact' }],
  },
  {
    id: 'byod-db',
    label: 'BYOD/DB URL test tooling exists',
    sentenceRe: /\b(byod|bring your own database|database url|postgres|neon)\b/i,
    code: [{ file: 'tools/test-byod-db-url.ts', pattern: 'DATABASE_URL' }],
  },
  {
    id: 'safety-net',
    label: 'Safety Net exists (basic evidence)',
    sentenceRe: /\b(safety\s*net)\b/i,
    code: [
      { file: 'cypress/e2e/safety-net.cy.ts', pattern: 'safety' },
      { file: 'src/scripts/final-deployment-validation.ts', pattern: 'Safety Net', isRegex: false },
    ],
    notes: 'This only proves there is code/tests referring to Safety Net; it does not prove feature semantics.',
  },
];

function collectEvidence(sentence: string): { evidenced: boolean; matchedRuleIds: string[] } {
  const matched = EVIDENCE_RULES.filter(r => r.sentenceRe.test(sentence));
  const matchedIds = matched.map(m => m.id);
  const evidenced = matched.some(anyEvidenceMatches);
  return { evidenced, matchedRuleIds: matchedIds };
}

function pickExamples(items: string[], max: number): string[] {
  const out: string[] = [];
  for (const s of items) {
    if (out.length >= max) break;
    out.push(truncate(s, 180));
  }
  return out;
}

function truncate(text: string, max: number): string {
  const t = normalizeWhitespace(text);
  if (t.length <= max) return t;
  return t.slice(0, Math.max(0, max - 1)).trimEnd() + '…';
}

function main() {
  const keys = Object.keys(HEYGEN_VIDEO_IDS).sort();

  const report: AuditReport = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    totals: {
      keysTotal: keys.length,
      scriptsMissing: 0,
      ok: 0,
      needsReview: 0,
      likelyScriptUpdate: 0,
      regenCandidatesEstimate: 0,
    },
    keys: {},
  };

  for (const key of keys) {
    const res = getVideoScriptResolution(key);

    const kr: KeyReport = {
      key,
      resolvedKey: res.resolvedKey,
      scriptStatus: res.status,
      recommendation: 'needs-review',
      notes: [],
    };

    if (res.status === 'missing') {
      report.totals.scriptsMissing += 1;
      kr.recommendation = 'likely-script-update';
      kr.notes.push(
        "Missing script-derived transcript. If you want the replacement video to be script-governed, you must add a script (or alias) and then re-render/regenerate the video to match it.",
      );
      report.keys[key] = kr;
      continue;
    }

    kr.sourceId = res.sourceId;
    kr.title = res.title;
    kr.transcriptLength = res.transcript.length;
    kr.transcriptSha256 = sha256(res.transcript);

    const sentences = sentenceSplit(res.transcript);
    const claimy = sentences.filter(s => CLAIMY_SENTENCE_RE.test(s));

    let evidenced = 0;
    let highRisk = 0;
    const unevidencedSentences: string[] = [];
    const highRiskUnevidenced: string[] = [];

    for (const s of claimy) {
      const isHighRisk = HIGH_RISK_RE.test(s);
      if (isHighRisk) highRisk += 1;

      const ev = collectEvidence(s);
      if (ev.evidenced) {
        evidenced += 1;
      } else {
        unevidencedSentences.push(s);
        if (isHighRisk) highRiskUnevidenced.push(s);
      }
    }

    kr.claimSentences = {
      total: claimy.length,
      highRisk,
      evidenced,
      unevidenced: unevidencedSentences.length,
      highRiskUnevidencedExamples: pickExamples(highRiskUnevidenced, 6),
      unevidencedExamples: pickExamples(unevidencedSentences, 8),
    };

    // Triage rules:
    // - high-risk unevidenced => likely script update (or add explicit evidence anchors)
    // - many unevidenced => needs review
    // - otherwise ok
    if (highRiskUnevidenced.length > 0) {
      kr.recommendation = 'likely-script-update';
      kr.notes.push(
        `Found ${highRiskUnevidenced.length} high-risk claim sentence(s) with no configured code evidence anchor. Recommend adjusting script text or adding evidence mapping before any regeneration.`,
      );
    } else if (unevidencedSentences.length > 0) {
      kr.recommendation = 'needs-review';
      kr.notes.push(
        `Found ${unevidencedSentences.length} claim-like sentence(s) with no configured code evidence anchor. This does not prove falsehood; it indicates missing evidence mapping or script wording that is hard to verify.`,
      );
    } else {
      kr.recommendation = 'ok';
      kr.notes.push('All detected claim-like sentences matched at least one configured code evidence anchor.');
    }

    report.keys[key] = kr;
  }

  // Totals
  for (const k of Object.keys(report.keys)) {
    const rec = report.keys[k].recommendation;
    if (rec === 'ok') report.totals.ok += 1;
    if (rec === 'needs-review') report.totals.needsReview += 1;
    if (rec === 'likely-script-update') report.totals.likelyScriptUpdate += 1;
  }

  report.totals.regenCandidatesEstimate = report.totals.scriptsMissing + report.totals.likelyScriptUpdate;

  const outDir = path.resolve(process.cwd(), 'video_provenance');
  fs.mkdirSync(outDir, { recursive: true });

  const jsonPath = path.join(outDir, 'script-code-audit.json');
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2) + '\n', 'utf8');

  // Small human-readable summary
  const summaryLines: string[] = [];
  summaryLines.push(`# Script ↔ Code Audit Summary`);
  summaryLines.push('');
  summaryLines.push(`Generated: ${report.generatedAt}`);
  summaryLines.push('');
  summaryLines.push(`Canonical keys audited: ${report.totals.keysTotal}`);
  summaryLines.push(`Scripts missing: ${report.totals.scriptsMissing}`);
  summaryLines.push(`OK (heuristically evidenced): ${report.totals.ok}`);
  summaryLines.push(`Needs review (unevidenced sentences): ${report.totals.needsReview}`);
  summaryLines.push(`Likely script update (high-risk unevidenced OR missing transcript): ${report.totals.likelyScriptUpdate}`);
  summaryLines.push('');
  summaryLines.push(`Estimated videos requiring regeneration IF you choose to enforce script-governance for all keys: ${report.totals.regenCandidatesEstimate}`);
  summaryLines.push('');
  summaryLines.push(`## Notes`);
  summaryLines.push('');
  summaryLines.push('- “Unevidenced” means the audit tool has no configured repo anchor for that sentence; it is not a proof the claim is wrong.');
  summaryLines.push('- The evidence rules are intentionally strict and small. Expand `EVIDENCE_RULES` to reduce false positives and to make more claims checkable.');
  summaryLines.push('');
  summaryLines.push('## Top 20 likely-script-update keys');
  summaryLines.push('');

  const likely = Object.values(report.keys)
    .filter(r => r.recommendation === 'likely-script-update')
    .sort((a, b) => {
      const ah = a.claimSentences?.highRisk ?? 0;
      const bh = b.claimSentences?.highRisk ?? 0;
      if (bh !== ah) return bh - ah;
      const au = a.claimSentences?.unevidenced ?? 0;
      const bu = b.claimSentences?.unevidenced ?? 0;
      return bu - au;
    })
    .slice(0, 20);

  for (const r of likely) {
    const hi = r.claimSentences?.highRisk ?? 0;
    const un = r.claimSentences?.unevidenced ?? 0;
    summaryLines.push(
      '- `' +
        r.key +
        '` (highRisk=' +
        String(hi) +
        ', unevidenced=' +
        String(un) +
        ', source=' +
        String(r.sourceId ?? 'n/a') +
        ')',
    );
  }

  const docsDir = path.resolve(process.cwd(), 'docs');
  fs.mkdirSync(docsDir, { recursive: true });
  const mdPath = path.join(docsDir, 'SCRIPT_CODE_AUDIT_SUMMARY.md');
  fs.writeFileSync(mdPath, summaryLines.join('\n') + '\n', 'utf8');

  // eslint-disable-next-line no-console
  console.log(`Wrote: ${path.relative(process.cwd(), jsonPath)}`);
  // eslint-disable-next-line no-console
  console.log(`Wrote: ${path.relative(process.cwd(), mdPath)}`);
  // eslint-disable-next-line no-console
  console.log(`Totals: keys=${report.totals.keysTotal}, missing=${report.totals.scriptsMissing}, ok=${report.totals.ok}, review=${report.totals.needsReview}, likelyUpdate=${report.totals.likelyScriptUpdate}`);
  // eslint-disable-next-line no-console
  console.log(`Regen candidates estimate (policy-dependent): ${report.totals.regenCandidatesEstimate}`);
}

main();
