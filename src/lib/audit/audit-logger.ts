/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { getAuditIntegrityMode, withAuditIntegrity } from '@/lib/audit/audit-integrity';
import { isProductionEnv } from '@/lib/env/production-env';

let auditLoggerConfigErrorLogged = false;

function isAuditIntegrityConfigError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes('AUDIT_LOG_INTEGRITY_MODE') ||
    msg.includes('AUDIT_LOG_HMAC_KEY') ||
    msg.includes('Missing required environment variable: AUDIT_LOG_HMAC_KEY')
  );
}

export type AuditAction = 
  | 'LOGIN' 
  | 'LOGOUT' 
  | 'CREATE' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'VIEW' 
  | 'EXPORT' 
  | 'IMPORT'
  | 'SETTINGS_CHANGE'
  | 'PERMISSION_CHANGE'
  | 'MFA_CHALLENGE'
  | 'MFA_VERIFY_SUCCESS'
  | 'MFA_VERIFY_FAILURE';

export interface AuditLogEntry {
  userId?: number;
  tenantId?: number;
  action: AuditAction;
  resource: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditLogger {
  static async log(entry: AuditLogEntry) {
    try {
      // In a real enterprise app, we might want to use a message queue (e.g., Kafka, SQS)
      // to offload this write operation. For now, we write directly to DB asynchronously.

      const createData = {
        user_id_int: entry.userId ?? null,
        tenant_id: entry.tenantId ?? null,
        action: entry.action,
        resource: entry.resource,
        details: entry.details,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
      };

      const mode = getAuditIntegrityMode();

      // When integrity chaining is enabled, we must await the write so the chain remains consistent.
      if (mode !== 'off') {
        const dataWithIntegrity = await withAuditIntegrity(prisma as any, createData);
        await prisma.auditLog.create({ data: dataWithIntegrity as any });
        return;
      }

      // Otherwise, fire-and-forget to avoid blocking the main request flow.
      prisma.auditLog
        .create({
          data: createData as any,
        })
        .catch((err) => {
          logger.error('Failed to write audit log', {
            error: err instanceof Error ? err.message : String(err),
          });
        });
    } catch (_error) {
      if (isProductionEnv() && isAuditIntegrityConfigError(_error)) {
        if (!auditLoggerConfigErrorLogged) {
          auditLoggerConfigErrorLogged = true;
          logger.error('Audit integrity configuration error (production)', {
            error: _error instanceof Error ? _error.message : String(_error),
          });
        }
        throw _error;
      }

      logger.error('Failed to initiate audit log', {
        error: _error instanceof Error ? _error.message : String(_error),
      });
    }
  }
}
