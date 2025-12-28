/**
 * Generate a claims → proof backlog from the script↔code audit output.
 *
 * Philosophy:
 * - We do NOT soften or remove bold claims.
 * - If a claim is not currently provable by repo evidence, we build the product/docs/tests to earn it.
 *
 * Input:  video_provenance/script-code-audit.json
 * Output: docs/CLAIMS_TO_PROOF_BACKLOG.md (+ optional machine-readable JSON)
 *
 * Run:
 *   npx tsx tools/generate-claims-to-proof-backlog.ts
 */

import fs from 'node:fs';
import path from 'node:path';

type AuditKeyReport = {
  key: string;
  resolvedKey: string;
  scriptStatus: 'found' | 'missing';
  sourceId?: string;
  title?: string;
  transcriptSha256?: string;
  transcriptLength?: number;
  claimSentences?: {
    detectedTotal: number;
    detectedHighRisk: number;
    outOfScopeIgnored: number;
    outOfScopeExamples: string[];
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
  keys: Record<string, AuditKeyReport>;
};

type BacklogItem = {
  sentence: string;
  key: string;
  resolvedKey: string;
  sourceId?: string;
  title?: string;
  recommendation: AuditKeyReport['recommendation'];
};

type Cluster = {
  clusterId: string;
  risk: 'high' | 'medium' | 'low';
  sentence: string;
  keys: Array<Pick<BacklogItem, 'key' | 'resolvedKey' | 'title' | 'sourceId'>>;
};

function readJson<T>(absPath: string): T {
  const raw = fs.readFileSync(absPath, 'utf8');
  return JSON.parse(raw) as T;
}

function normalizeSentenceForCluster(sentence: string): string {
  return sentence
    .toLowerCase()
    .replace(/[“”"'’]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function guessRisk(sentence: string): 'high' | 'medium' | 'low' {
  const s = sentence.toLowerCase();

  const high = [
    'security',
    'secure',
    'encryption',
    'encrypt',
    'penetration',
    'pen test',
    'pentest',
    'gdpr',
    'data protection',
    'nhs',
    'iso',
    'soc2',
    'cyber essentials',
    'audit',
    'immutable',
    'export',
    'privacy',
    'pii',
    'personal data',
    'sensitive',
    'breach',
    'consent',
    'retention',
    'training future ai',
    'not training',
    'compliance',
  ];

  if (high.some(k => s.includes(k))) return 'high';

  const medium = ['automate', 'automation', 'real time', 'scale never seen', 'enterprise', 'governor', 'court-ready'];
  if (medium.some(k => s.includes(k))) return 'medium';

  return 'low';
}

function sortClusters(a: Cluster, b: Cluster): number {
  const riskScore = (r: Cluster['risk']) => (r === 'high' ? 3 : r === 'medium' ? 2 : 1);
  const rs = riskScore(b.risk) - riskScore(a.risk);
  if (rs !== 0) return rs;
  const ks = b.keys.length - a.keys.length;
  if (ks !== 0) return ks;
  return a.sentence.localeCompare(b.sentence);
}

function mdEscape(text: string): string {
  // Minimal escaping for tables.
  return text.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function main() {
  const repoRoot = process.cwd();
  const auditPath = path.resolve(repoRoot, 'video_provenance', 'script-code-audit.json');
  const outMdPath = path.resolve(repoRoot, 'docs', 'CLAIMS_TO_PROOF_BACKLOG.md');
  const outJsonPath = path.resolve(repoRoot, 'video_provenance', 'claims-to-proof-backlog.json');

  const audit = readJson<AuditReport>(auditPath);

  const items: BacklogItem[] = [];

  for (const [key, kr] of Object.entries(audit.keys)) {
    if (kr.recommendation !== 'needs-review' && kr.recommendation !== 'likely-script-update') continue;

    const claim = kr.claimSentences;
    if (!claim) continue;

    const sentences = [
      ...(claim.highRiskUnevidencedExamples ?? []),
      ...(claim.unevidencedExamples ?? []),
    ].map(s => s.trim()).filter(Boolean);

    for (const sentence of sentences) {
      items.push({
        sentence,
        key,
        resolvedKey: kr.resolvedKey,
        sourceId: kr.sourceId,
        title: kr.title,
        recommendation: kr.recommendation,
      });
    }
  }

  // Cluster by normalized sentence.
  const clustersByNorm = new Map<string, Cluster>();
  let nextId = 1;

  for (const it of items) {
    const norm = normalizeSentenceForCluster(it.sentence);
    const existing = clustersByNorm.get(norm);
    if (!existing) {
      const clusterId = `CLM-${String(nextId).padStart(3, '0')}`;
      nextId += 1;
      clustersByNorm.set(norm, {
        clusterId,
        risk: guessRisk(it.sentence),
        sentence: it.sentence,
        keys: [{ key: it.key, resolvedKey: it.resolvedKey, title: it.title, sourceId: it.sourceId }],
      });
    } else {
      // Prefer the longer/originally punctuated sentence for display.
      if (it.sentence.length > existing.sentence.length) existing.sentence = it.sentence;
      existing.risk = guessRisk(existing.sentence);
      existing.keys.push({ key: it.key, resolvedKey: it.resolvedKey, title: it.title, sourceId: it.sourceId });
    }
  }

  const clusters = Array.from(clustersByNorm.values()).sort(sortClusters);

  // Emit machine-readable JSON for automation.
  fs.mkdirSync(path.dirname(outJsonPath), { recursive: true });
  fs.writeFileSync(
    outJsonPath,
    JSON.stringify(
      {
        schemaVersion: 1,
        generatedAt: new Date().toISOString(),
        sourceAuditGeneratedAt: audit.generatedAt,
        totals: {
          auditKeysTotal: audit.totals.keysTotal,
          needsReviewKeys: audit.totals.needsReview,
          likelyScriptUpdateKeys: audit.totals.likelyScriptUpdate,
          unevidencedSentenceClusters: clusters.length,
          unevidencedSentenceInstances: items.length,
        },
        clusters,
      },
      null,
      2,
    ) + '\n',
    'utf8',
  );

  // Emit markdown.
  const lines: string[] = [];
  lines.push('# Claims → Proof Backlog');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Source audit: ${audit.generatedAt}`);
  lines.push('');
  lines.push('This document converts **unevidenced in-scope claim sentences** into an engineering/documentation/test backlog.');
  lines.push('');
  lines.push('Non-negotiables:');
  lines.push('- We do **not** soften/remove bold claims to make audits pass.');
  lines.push('- If the repo cannot currently *prove* a claim, we create the proof: code, tests, docs, operational controls.');
  lines.push('');
  lines.push('## Snapshot');
  lines.push('');
  lines.push(`- Video keys audited: ${audit.totals.keysTotal}`);
  lines.push(`- Needs review keys: ${audit.totals.needsReview}`);
  lines.push(`- Likely script update keys: ${audit.totals.likelyScriptUpdate}`);
  lines.push(`- Unevidenced sentence instances (sampled): ${items.length}`);
  lines.push(`- Unevidenced sentence clusters: ${clusters.length}`);
  lines.push('');

  lines.push('## Prioritised clusters');
  lines.push('');
  lines.push('| ID | Risk | Keys | Claim sentence |');
  lines.push('|---:|:----:|-----:|---|');
  for (const c of clusters) {
    lines.push(`| ${c.clusterId} | ${c.risk.toUpperCase()} | ${c.keys.length} | ${mdEscape(c.sentence)} |`);
  }
  lines.push('');

  lines.push('## Work templates (how we “earn” a claim)');
  lines.push('');
  lines.push('For each cluster, we create proof via one or more of:');
  lines.push('- **Code**: the feature/control exists and is enforced (not just a comment).');
  lines.push('- **Tests**: e2e/unit tests proving behaviour on golden paths and abuse cases.');
  lines.push('- **Docs**: clear, accurate operational/security documentation in-repo, linked from the claim.');
  lines.push('- **CI gates**: validators that fail if proof regresses.');
  lines.push('');

  lines.push('## Cluster details');
  lines.push('');

  for (const c of clusters) {
    lines.push(`### ${c.clusterId}: ${c.risk.toUpperCase()} risk`);
    lines.push('');
    lines.push(`**Claim:** ${c.sentence}`);
    lines.push('');
    lines.push('**Affected videos:**');
    for (const k of c.keys.sort((x, y) => x.key.localeCompare(y.key))) {
      const meta = [k.title ? `title=${k.title}` : null, k.sourceId ? `source=${k.sourceId}` : null]
        .filter(Boolean)
        .join(', ');
      const suffix = meta ? ` (${meta})` : '';
      lines.push('- `' + k.key + '`' + suffix);
    }
    lines.push('');

    // Generic, but scoped guidance.
    if (c.risk === 'high') {
      lines.push('**Proof work (suggested):**');
      lines.push('- Add a dedicated in-repo security/privacy/compliance artefact proving what is true (and what is not).');
      lines.push('- Add automated checks in CI to ensure the control remains in place (configuration, headers, logging, RBAC, export tracking).');
      lines.push('- Add tests for key behaviour (e.g., export auditing, access control, redaction on AI calls).');
      lines.push('- If the claim depends on a third-party vendor policy, enforce that dependency in code/config (provider selection, endpoints) and document it explicitly.');
      lines.push('');
    } else if (c.risk === 'medium') {
      lines.push('**Proof work (suggested):**');
      lines.push('- Convert the claim into a measurable system behaviour and implement it end-to-end.');
      lines.push('- Add tests for the behaviour and a small validator/gate if feasible.');
      lines.push('- Add an evidence anchor (code/doc/test) so the script audit can recognise it next run.');
      lines.push('');
    } else {
      lines.push('**Proof work (suggested):**');
      lines.push('- Add an evidence anchor (doc/code/test) or adjust the audit scope/heuristics if this is not a meaningful product claim.');
      lines.push('');
    }

    lines.push('**Evidence anchor ideas (for the audit tool):**');
    lines.push('- Create/extend a repo file whose content is objectively checkable (e.g. a validator, schema, feature gate, route, or test).');
    lines.push('- Then add a conservative `EVIDENCE_RULES` entry in `tools/audit-video-scripts-against-code.ts` that searches for that anchor.');
    lines.push('');
  }

  fs.mkdirSync(path.dirname(outMdPath), { recursive: true });
  fs.writeFileSync(outMdPath, lines.join('\n') + '\n', 'utf8');

  // eslint-disable-next-line no-console
  console.log(`Wrote: ${path.relative(repoRoot, outMdPath)}`);
  // eslint-disable-next-line no-console
  console.log(`Wrote: ${path.relative(repoRoot, outJsonPath)}`);
}

main();
