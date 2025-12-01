/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { prisma } from '@/lib/prisma';

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
  | 'PERMISSION_CHANGE';

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
      
      // We don't await this to avoid blocking the main request flow
      prisma.auditLog.create({
        data: {
          user_id_int: entry.userId,
          tenant_id: entry.tenantId,
          action: entry.action,
          resource: entry.resource,
          details: entry.details,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
        },
      }).catch(err => {
        console.error('Failed to write audit log:', err);
      });
    } catch (_error) {
      console.error('Failed to initiate audit log:', _error);
    }
  }
}
