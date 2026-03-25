/**
 * Audit log integrity helpers
 *
 * Implements a tamper-evident hash chain (optionally HMAC-signed) stored inside
 * `AuditLog.metadata.integrity`.
 *
 * NOTE: We deliberately store `canonicalPayload` in metadata so verifiers can
 * recompute the hash/signature deterministically even if DB-managed timestamps
 * differ slightly.
 */

import * as crypto from 'crypto';
import { logger } from '@/lib/logger';
import type { DbClient } from '@/lib/prisma';
import { isProductionEnv, requireEnv } from '@/lib/env/production-env';

export type AuditIntegrityMode = 'off' | 'hash-chain' | 'hmac-sha256';

export interface AuditIntegrityMetadata {
  version: 1;
  algo: 'sha256' | 'hmac-sha256';
  computedAt: string; // ISO
  prevHash: string | null;
  hash: string;
  signature?: string; // hex
  keyId?: string;
  canonicalPayload: string;
}

function stableStringify(value: unknown): string {
  const seen = new WeakSet<object>();

  const normalize = (v: any): any => {
    if (v === null || v === undefined) return null;
    if (typeof v === 'bigint') return v.toString();
    if (v instanceof Date) return v.toISOString();
    if (Array.isArray(v)) return v.map(normalize);
    if (typeof v === 'object') {
      if (seen.has(v)) return '[Circular]';
      seen.add(v);
      const out: Record<string, any> = {};
      for (const key of Object.keys(v).sort()) {
        out[key] = normalize(v[key]);
      }
      return out;
    }
    return v;
  };

  return JSON.stringify(normalize(value));
}

function sha256Hex(input: string): string {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
}

function hmacSha256Hex(key: string, input: string): string {
  return crypto.createHmac('sha256', key).update(input, 'utf8').digest('hex');
}

export function computeAuditChainHash(prevHash: string | null, canonicalPayload: string): string {
  const chainInput = `${prevHash ?? 'GENESIS'}\n${canonicalPayload}`;
  return sha256Hex(chainInput);
}

export function computeAuditHmacSignature(key: string, hash: string): string {
  return hmacSha256Hex(key, hash);
}

export function getAuditIntegrityMode(): AuditIntegrityMode {
  const raw = (process.env.AUDIT_LOG_INTEGRITY_MODE || 'off').toLowerCase();

  if (raw === 'hmac' || raw === 'hmac-sha256') return 'hmac-sha256';
  if (raw === 'hash' || raw === 'hash-chain') return 'hash-chain';
  return 'off';
}

type ProdAuditIntegrityConfigCheck =
  | { checked: false }
  | { checked: true; error: null; mode: AuditIntegrityMode; hasHmacKey: boolean }
  | { checked: true; error: Error; mode: AuditIntegrityMode; hasHmacKey: boolean };

let prodAuditIntegrityConfigCheck: ProdAuditIntegrityConfigCheck = { checked: false };

function toError(err: unknown): Error {
  if (err instanceof Error) return err;
  return new Error(typeof err === 'string' ? err : JSON.stringify(err));
}

/**
 * Fail-fast in production for missing audit-integrity configuration.
 *
 * Important: cache only a successful validation strongly. If runtime env was
 * initially stale or unavailable, we must allow later requests in the same
 * process to re-evaluate the current env truth after a redeploy/runtime refresh.
 */
export function ensureAuditIntegrityProductionConfig(mode: AuditIntegrityMode): void {
  if (!isProductionEnv()) return;

  const hasHmacKey = Boolean(process.env.AUDIT_LOG_HMAC_KEY);

  if (prodAuditIntegrityConfigCheck.checked) {
    if (
      prodAuditIntegrityConfigCheck.mode === mode &&
      prodAuditIntegrityConfigCheck.hasHmacKey === hasHmacKey &&
      prodAuditIntegrityConfigCheck.error === null
    ) {
      return;
    }

    if (
      prodAuditIntegrityConfigCheck.mode === mode &&
      prodAuditIntegrityConfigCheck.hasHmacKey === hasHmacKey &&
      prodAuditIntegrityConfigCheck.error
    ) {
      throw prodAuditIntegrityConfigCheck.error;
    }
  }

  try {
    // In production, audit logs must be cryptographically verifiable.
    // We enforce HMAC mode so integrity cannot be spoofed by a DB-only attacker.
    if (mode !== 'hmac-sha256') {
      throw new Error('AUDIT_LOG_INTEGRITY_MODE must be set to hmac-sha256 in production');
    }

    // Fail-fast if key is missing.
    requireEnv('AUDIT_LOG_HMAC_KEY');

    prodAuditIntegrityConfigCheck = {
      checked: true,
      error: null,
      mode,
      hasHmacKey,
    };
  } catch (err) {
    const error = toError(err);
    prodAuditIntegrityConfigCheck = {
      checked: true,
      error,
      mode,
      hasHmacKey,
    };
    logger.error('Audit integrity production configuration invalid', {
      error: error.message,
      mode,
      hasHmacKey,
    });
    throw error;
  }
}

export function extractIntegrityHash(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== 'object') return null;
  const integrity = (metadata as any).integrity;
  if (!integrity || typeof integrity !== 'object') return null;
  const hash = (integrity as any).hash;
  return typeof hash === 'string' && hash.length > 0 ? hash : null;
}

function buildCanonicalPayload(data: Record<string, unknown>): string {
  // Avoid accidental inclusion of integrity metadata when hashing.
  const { metadata, ...rest } = data;
  const sanitizedMetadata =
    metadata && typeof metadata === 'object'
      ? (() => {
          const { integrity: _integrity, ...metaRest } = metadata as any;
          return metaRest;
        })()
      : metadata;

  return stableStringify({ ...rest, metadata: sanitizedMetadata });
}

export function computeAuditIntegrityEnvelope(params: {
  mode: AuditIntegrityMode;
  prevHash: string | null;
  createData: Record<string, unknown>;
  computedAt?: string;
}): AuditIntegrityMetadata {
  const { mode, prevHash, createData } = params;

  ensureAuditIntegrityProductionConfig(mode);

  const computedAt = params.computedAt || new Date().toISOString();
  const canonicalPayload = buildCanonicalPayload({ ...createData, computedAt });
  const chainInput = `${prevHash ?? 'GENESIS'}\n${canonicalPayload}`;
  const hash = sha256Hex(chainInput);

  const integrity: AuditIntegrityMetadata = {
    version: 1,
    algo: mode === 'hmac-sha256' ? 'hmac-sha256' : 'sha256',
    computedAt,
    prevHash,
    hash,
    canonicalPayload,
  };

  if (mode === 'hmac-sha256') {
    const key = process.env.AUDIT_LOG_HMAC_KEY;
    const keyId = process.env.AUDIT_LOG_HMAC_KEY_ID;

    if (!key) {
      // In production, assertAuditIntegrityProductionConfig already throws.
      // In non-production, we avoid breaking local dev but we DO NOT pretend we have HMAC integrity.
      logger.warn('AUDIT_LOG_INTEGRITY_MODE=hmac-sha256 but AUDIT_LOG_HMAC_KEY is missing; falling back to hash-chain');
      integrity.algo = 'sha256';
    } else {
      integrity.signature = hmacSha256Hex(key, hash);
      if (keyId) integrity.keyId = keyId;
    }
  }

  return integrity;
}

/**
 * Add a tamper-evident integrity envelope to a Prisma auditLog.create({ data }).
 */
export async function withAuditIntegrity(
  prisma: DbClient,
  createData: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const mode = getAuditIntegrityMode();
  ensureAuditIntegrityProductionConfig(mode);
  if (mode === 'off') return createData;

  const tenant_id = (createData as any).tenant_id ?? null;

  let prevHash: string | null = null;
  try {
    const prev = await prisma.auditLog.findFirst({
      where: { tenant_id },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: { metadata: true },
    });
    prevHash = extractIntegrityHash(prev?.metadata) || null;
  } catch (_error) {
    // Integrity is best-effort; never block core flows.
    logger.warn('Audit integrity: unable to fetch previous hash', {
      tenant_id,
      error: _error instanceof Error ? _error.message : String(_error),
    });
  }

  const integrity = computeAuditIntegrityEnvelope({
    mode,
    prevHash,
    createData,
  });

  const currentMetadata = (createData as any).metadata;
  const mergedMetadata = {
    ...(currentMetadata && typeof currentMetadata === 'object' ? currentMetadata : {}),
    integrity,
  };

  return {
    ...createData,
    metadata: mergedMetadata,
  };
}
