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
  details?: any;
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
          userId: entry.userId,
          tenantId: entry.tenantId,
          action: entry.action,
          resource: entry.resource,
          details: entry.details ? JSON.stringify(entry.details) : undefined,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
        },
      }).catch(err => {
        console.error('Failed to write audit log:', err);
      });
    } catch (error) {
      console.error('Failed to initiate audit log:', error);
    }
  }
}
