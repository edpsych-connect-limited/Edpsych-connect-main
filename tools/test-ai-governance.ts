/**
 * Lightweight governance enforcement check.
 *
 * This is a deterministic, environment-driven check that does not depend on a
 * seeded tenant row. It uses tenantId=0 (expected to not exist) so governance
 * falls back to default policy.
 */

import { decideAiAccess } from '../src/lib/governance/policy-engine';
import fs from 'node:fs';
import path from 'node:path';

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const originalEnableAi = process.env.ENABLE_AI;
  const originalNodeEnv = process.env.NODE_ENV;

  try {
    // Documentation anchor for governance claims used in scripts.
    const repoRoot = path.resolve(__dirname, '..');
    const whitepaperPath = path.join(repoRoot, 'docs', 'AI_DATA_PRIVACY_WHITEPAPER.md');
    const whitepaper = fs.readFileSync(whitepaperPath, 'utf8');
    assert(
      /Never let AI output become evidence/i.test(whitepaper),
      'AI_DATA_PRIVACY_WHITEPAPER.md must include the governance principle "Never let AI output become evidence"'
    );

    // When ENABLE_AI=false, AI must be denied.
    process.env.ENABLE_AI = 'false';
    (process.env as any).NODE_ENV = 'production';

    const denied = await decideAiAccess({ tenantId: 0 });
    assert(!denied.decision.allowed, 'Expected AI to be denied when ENABLE_AI=false');
    assert(denied.redactPII === true, 'Expected redactPII=true by default in production');
    assert(denied.allowTraining === false, 'Expected allowTraining=false by default');

    // When ENABLE_AI=true, AI must be allowed.
    process.env.ENABLE_AI = 'true';
    (process.env as any).NODE_ENV = 'development';

    const allowed = await decideAiAccess({ tenantId: 0 });
    assert(allowed.decision.allowed, 'Expected AI to be allowed when ENABLE_AI=true');

    // In non-production by default, redactPII should be false unless configured.
    assert(allowed.redactPII === false, 'Expected redactPII=false by default outside production');

    // Training is opt-in; default must remain false.
    assert(allowed.allowTraining === false, 'Expected allowTraining=false by default');

    // eslint-disable-next-line no-console
    console.log('OK: governance AI policy defaults validated');
  } finally {
    process.env.ENABLE_AI = originalEnableAi;
    (process.env as any).NODE_ENV = originalNodeEnv;
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('FAILED: governance AI policy defaults check', err);
  process.exit(1);
});
