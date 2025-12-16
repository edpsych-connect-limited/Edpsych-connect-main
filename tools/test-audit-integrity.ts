/*
 * Lightweight deterministic tests for audit integrity hashing.
 *
 * This does NOT require a database; it validates the hash-chain/HMAC envelope
 * generation is stable and predictable.
 */

import { computeAuditIntegrityEnvelope } from '../src/lib/audit/audit-integrity';

function assert(condition: any, message: string) {
  if (!condition) throw new Error(message);
}

function run() {
  const base = {
    tenant_id: 123,
    user_id_int: 456,
    action: 'LOGIN_SUCCESS',
    resource: 'system',
    details: { foo: 'bar', count: 1 },
    metadata: { requestId: 'req_1' },
  };

  // Hash-chain deterministic
  const computedAt = '2025-01-01T00:00:00.000Z';
  const env1 = computeAuditIntegrityEnvelope({
    mode: 'hash-chain',
    prevHash: null,
    createData: base,
    computedAt,
  });

  const env2 = computeAuditIntegrityEnvelope({
    mode: 'hash-chain',
    prevHash: null,
    createData: base,
    computedAt,
  });

  assert(env1.hash === env2.hash, 'hash-chain: expected deterministic hash');
  assert(env1.prevHash === null, 'hash-chain: expected prevHash null for genesis');
  assert(env1.algo === 'sha256', 'hash-chain: expected sha256 algo');

  // Chain linking
  const envNext = computeAuditIntegrityEnvelope({
    mode: 'hash-chain',
    prevHash: env1.hash,
    createData: { ...base, action: 'DATA_READ', details: { foo: 'baz' } },
    computedAt,
  });
  assert(envNext.prevHash === env1.hash, 'hash-chain: prevHash should match previous hash');
  assert(envNext.hash !== env1.hash, 'hash-chain: next hash should differ when payload differs');

  // HMAC mode adds signature when key is present
  process.env.AUDIT_LOG_HMAC_KEY = 'test_hmac_key_32bytes_minimum________';
  process.env.AUDIT_LOG_HMAC_KEY_ID = 'test-key-1';

  const envHmac = computeAuditIntegrityEnvelope({
    mode: 'hmac-sha256',
    prevHash: null,
    createData: base,
    computedAt,
  });

  assert(envHmac.algo === 'hmac-sha256' || envHmac.algo === 'sha256', 'hmac: expected algo to be hmac-sha256 or sha256 fallback');
  assert(typeof envHmac.hash === 'string' && envHmac.hash.length > 0, 'hmac: expected hash');
  assert(typeof envHmac.signature === 'string' && envHmac.signature.length > 0, 'hmac: expected signature');
  assert(envHmac.keyId === 'test-key-1', 'hmac: expected keyId to propagate');

  console.log('OK: audit integrity envelope tests passed');
}

run();
