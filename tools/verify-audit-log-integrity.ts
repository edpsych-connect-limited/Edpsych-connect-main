/*
 * Verify tamper-evident audit log integrity.
 *
 * Behavior:
 * - If AUDIT_LOG_INTEGRITY_MODE=off => prints SKIP and exits 0.
 * - If enabled => verifies per-tenant hash chain ordering and (when in hmac mode)
 *   verifies HMAC signatures.
 */

import { platformPrisma } from '../src/lib/prisma';
import {
  computeAuditChainHash,
  computeAuditHmacSignature,
  getAuditIntegrityMode,
} from '../src/lib/audit/audit-integrity';

type IntegrityEnvelope = {
  version: number;
  algo: 'sha256' | 'hmac-sha256';
  computedAt: string;
  prevHash: string | null;
  hash: string;
  signature?: string;
  keyId?: string;
  canonicalPayload: string;
};

function getIntegrity(metadata: unknown): IntegrityEnvelope | null {
  if (!metadata || typeof metadata !== 'object') return null;
  const integrity = (metadata as any).integrity;
  if (!integrity || typeof integrity !== 'object') return null;
  return integrity as IntegrityEnvelope;
}

function assert(condition: any, message: string) {
  if (!condition) throw new Error(message);
}

async function main() {
  const mode = getAuditIntegrityMode();
  if (mode === 'off') {
    console.log('SKIP: AUDIT_LOG_INTEGRITY_MODE=off');
    return;
  }

  const hmacKey = process.env.AUDIT_LOG_HMAC_KEY;

  const tenants = await platformPrisma.auditLog.findMany({
    distinct: ['tenant_id'],
    select: { tenant_id: true },
  });

  const tenantIds = tenants
    .map((t) => t.tenant_id)
    .filter((t): t is number | null => t === null || typeof t === 'number');

  // Always include null tenant bucket (platform/system logs)
  if (!tenantIds.includes(null)) tenantIds.push(null);

  let checked = 0;

  for (const tenant_id of tenantIds) {
    const rows = await platformPrisma.auditLog.findMany({
      where: { tenant_id },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        tenant_id: true,
        createdAt: true,
        action: true,
        metadata: true,
      },
      take: 5000,
    });

    let prevHash: string | null = null;

    for (const row of rows) {
      const env = getIntegrity(row.metadata);
      assert(env, `Missing integrity envelope on auditLog ${row.id} (tenant_id=${tenant_id ?? 'null'})`);
      assert(env.version === 1, `Unsupported integrity version on auditLog ${row.id}: ${env.version}`);
      assert(typeof env.canonicalPayload === 'string' && env.canonicalPayload.length > 0, `Missing canonicalPayload on auditLog ${row.id}`);
      assert(env.prevHash === prevHash, `Chain break on auditLog ${row.id}: expected prevHash=${prevHash ?? 'null'} got ${env.prevHash ?? 'null'}`);

      const expectedHash = computeAuditChainHash(prevHash, env.canonicalPayload);
      assert(env.hash === expectedHash, `Hash mismatch on auditLog ${row.id}: expected ${expectedHash} got ${env.hash}`);

      if (mode === 'hmac-sha256') {
        assert(hmacKey, 'AUDIT_LOG_INTEGRITY_MODE=hmac-sha256 but AUDIT_LOG_HMAC_KEY is missing');
        const expectedSig = computeAuditHmacSignature(hmacKey!, env.hash);
        assert(env.signature === expectedSig, `Signature mismatch on auditLog ${row.id}`);
      }

      prevHash = env.hash;
      checked++;
    }
  }

  console.log(`OK: verified audit integrity for ${checked} audit log rows`);
}

main().catch((err) => {
  console.error('FAIL: audit integrity verification failed');
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
