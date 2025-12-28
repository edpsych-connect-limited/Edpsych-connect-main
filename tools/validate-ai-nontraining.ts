/**
 * Deterministic AI non-training validation.
 *
 * Goal: provide repo-enforceable evidence for the claim that end-user queries are
 * not used to train future AI models.
 *
 * This does NOT attempt to validate third-party provider policies. It validates
 * that THIS repo does not contain training/fine-tuning code paths that consume
 * user prompts, and that our explicit policy defaults remain "no training".
 */

import fs from 'fs';
import path from 'path';

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function readText(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

function walk(dir: string, includeExt: Set<string>, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip heavy/irrelevant directories
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      walk(full, includeExt, out);
      continue;
    }
    const ext = path.extname(entry.name);
    if (includeExt.has(ext)) out.push(full);
  }
  return out;
}

function main() {
  const repoRoot = path.resolve(__dirname, '..');

  // 1) Policy constant must exist and remain false.
  const policyPath = path.join(repoRoot, 'src', 'lib', 'ai', 'data-use-policy.ts');
  assert(fs.existsSync(policyPath), 'Missing policy file: src/lib/ai/data-use-policy.ts');
  const policyText = readText(policyPath);
  assert(
    /trainOnStudentQueries\s*:\s*false\b/.test(policyText),
    'AI_DATA_USE_POLICY.trainOnStudentQueries must be false'
  );

  // 2) Governance default must remain no-training.
  const govPath = path.join(repoRoot, 'src', 'lib', 'governance', 'policy-engine.ts');
  assert(fs.existsSync(govPath), 'Missing governance file: src/lib/governance/policy-engine.ts');
  const govText = readText(govPath);
  assert(
    /allowTraining\s*:\s*false\b/.test(govText),
    'Default governance must set ai.allowTraining=false'
  );

  // 3) Static scan for accidental fine-tuning/training endpoint usage.
  // Keep the scan narrow to avoid false positives from domain-language like
  // "training dataset" in research modules.
  const srcDir = path.join(repoRoot, 'src');
  const files = walk(srcDir, new Set(['.ts', '.tsx']));

  const forbiddenPatterns: Array<{ id: string; re: RegExp }> = [
    { id: 'openai-fine-tuning-client', re: /\b(openai|openaiClient)\s*\.\s*fineTuning\b/i },
    { id: 'openai-fine-tuning-endpoint', re: /\/v1\/fine_tuning\b/i },
    { id: 'openai-fine-tune-strings', re: /\bfine[-_\s]?tun(e|ing)\b/i },
  ];

  const hits: Array<{ file: string; pattern: string }> = [];

  for (const file of files) {
    const text = readText(file);

    // Ignore obviously safe contexts: comments about "fine-tuning" in non-AI operational text.
    // (We still want to catch actual API usage; so we only allow the phrase when it is not
    // adjacent to OpenAI/client usage.)

    for (const p of forbiddenPatterns) {
      if (!p.re.test(text)) continue;

      // Allow domain phrases like "fine-tuning intervention parameters" that are unrelated to LLM training.
      if (p.id === 'openai-fine-tune-strings') {
        const hasOpenAIContext = /\b(openai|OpenAI|chat\.completions|responses\.)\b/.test(text);
        if (!hasOpenAIContext) continue;
      }

      hits.push({ file: path.relative(repoRoot, file), pattern: p.id });
    }
  }

  assert(hits.length === 0, `Found potential training/fine-tuning usage:\n${hits.map(h => `- ${h.file} (${h.pattern})`).join('\n')}`);

  // 4) Existence of documentation anchor.
  const docPath = path.join(repoRoot, 'docs', 'AI_DATA_USE.md');
  assert(fs.existsSync(docPath), 'Missing documentation anchor: docs/AI_DATA_USE.md');
  const docText = readText(docPath);
  assert(
    /student queries aren\s*'\s*t training future AI models/i.test(docText),
    'docs/AI_DATA_USE.md must explicitly state the non-training claim'
  );

  // eslint-disable-next-line no-console
  console.log('OK: AI non-training posture validated');
}

main();
