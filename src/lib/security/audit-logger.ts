/**
 * Enterprise-grade audit logging system
 * GDPR-compliant audit trail for all data access and modifications
 *
 * @module security/audit-logger
 */

import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';

const prisma = new PrismaClient();

/**
 * Audit event types for tracking different security events
 */
export enum AuditEventType {
  // Authentication events
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  SESSION_EXPIRED = 'SESSION_EXPIRED',

  // Authorization events
  UNAUTHORIZED_ACCESS_ATTEMPT = 'UNAUTHORIZED_ACCESS_ATTEMPT',
  ACCESS_DENIED = 'ACCESS_DENIED',

  // Data access events (GDPR compliance)
  DATA_READ = 'DATA_READ',
  DATA_CREATE = 'DATA_CREATE',
  DATA_UPDATE = 'DATA_UPDATE',
  DATA_DELETE = 'DATA_DELETE',
  DATA_EXPORT = 'DATA_EXPORT',
  BULK_DATA_ACCESS = 'BULK_DATA_ACCESS',

  // EHCP-specific events
  EHCP_CREATED = 'EHCP_CREATED',
  EHCP_UPDATED = 'EHCP_UPDATED',
  EHCP_DELETED = 'EHCP_DELETED',
  EHCP_VIEWED = 'EHCP_VIEWED',
  EHCP_EXPORTED = 'EHCP_EXPORTED',

  // Security events
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED',
}

/**
 * Severity levels for audit events
 */
export enum AuditSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

/**
 * Audit log entry structure
 */
export interface AuditLogEntry {
  eventType: AuditEventType;
  severity: AuditSeverity;
  performedBy: string; // User ID
  performedByEmail?: string;
  entityType?: string; // e.g., 'EHCP', 'Assessment', 'User'
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  success: boolean;
  errorMessage?: string;
}

/**
 * Audit Logger Service
 */
class AuditLogger {
  /**
   * Log an audit event
   */
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          action: entry.eventType,
          performedById: entry.performedBy,
          entityType: entry.entityType,
          entityId: entry.entityId,
          details: {
            ...(entry.details || {}),
            severity: entry.severity,
            performedByEmail: entry.performedByEmail,
            requestId: entry.requestId,
            success: entry.success,
            errorMessage: entry.errorMessage,
          } as any,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      // Log to console if database logging fails (don't throw to prevent cascading failures)
      console.error('[AUDIT LOG] Failed to write audit log:', error);
    }
  }

  /**
   * Log data access event (GDPR compliance)
   */
  async logDataAccess(
    userId: string,
    userEmail: string,
    action: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE',
    entityType: string,
    entityId: string,
    details?: Record<string, any>,
    ipAddress?: string,
    requestId?: string
  ): Promise<void> {
    const eventTypeMap = {
      READ: AuditEventType.DATA_READ,
      CREATE: AuditEventType.DATA_CREATE,
      UPDATE: AuditEventType.DATA_UPDATE,
      DELETE: AuditEventType.DATA_DELETE,
    };

    await this.log({
      eventType: eventTypeMap[action],
      severity: action === 'DELETE' ? AuditSeverity.WARNING : AuditSeverity.INFO,
      performedBy: userId,
      performedByEmail: userEmail,
      entityType,
      entityId,
      details,
      ipAddress,
      requestId,
      success: true,
    });
  }

  /**
   * Log EHCP-specific events
   */
  async logEHCPEvent(
    userId: string,
    userEmail: string,
    action: 'CREATED' | 'UPDATED' | 'DELETED' | 'VIEWED' | 'EXPORTED',
    ehcpId: string,
    details?: Record<string, any>,
    ipAddress?: string,
    requestId?: string
  ): Promise<void> {
    const eventTypeMap = {
      CREATED: AuditEventType.EHCP_CREATED,
      UPDATED: AuditEventType.EHCP_UPDATED,
      DELETED: AuditEventType.EHCP_DELETED,
      VIEWED: AuditEventType.EHCP_VIEWED,
      EXPORTED: AuditEventType.EHCP_EXPORTED,
    };

    await this.log({
      eventType: eventTypeMap[action],
      severity: action === 'DELETED' ? AuditSeverity.WARNING : AuditSeverity.INFO,
      performedBy: userId,
      performedByEmail: userEmail,
      entityType: 'EHCP',
      entityId: ehcpId,
      details,
      ipAddress,
      requestId,
      success: true,
    });
  }

  /**
   * Log bulk data access (GDPR compliance)
   */
  async logBulkDataAccess(
    userId: string,
    userEmail: string,
    entityType: string,
    count: number,
    filters?: Record<string, any>,
    ipAddress?: string,
    requestId?: string
  ): Promise<void> {
    await this.log({
      eventType: AuditEventType.BULK_DATA_ACCESS,
      severity: AuditSeverity.INFO,
      performedBy: userId,
      performedByEmail: userEmail,
      entityType,
      details: { count, filters },
      ipAddress,
      requestId,
      success: true,
    });
  }

  /**
   * Log unauthorized access attempt (CRITICAL security event)
   */
  async logUnauthorizedAccess(
    userId: string | null,
    attemptedAction: string,
    entityType?: string,
    entityId?: string,
    ipAddress?: string,
    userAgent?: string,
    requestId?: string
  ): Promise<void> {
    await this.log({
      eventType: AuditEventType.UNAUTHORIZED_ACCESS_ATTEMPT,
      severity: AuditSeverity.CRITICAL,
      performedBy: userId || 'anonymous',
      entityType,
      entityId,
      details: { attemptedAction },
      ipAddress,
      userAgent,
      requestId,
      success: false,
      errorMessage: 'Unauthorized access attempt detected',
    });
  }
}

/**
 * Singleton audit logger instance
 */
export const auditLogger = new AuditLogger();

/**
 * Helper functions to extract request metadata
 */

export function getIpAddress(request: NextRequest): string | undefined {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    undefined
  );
}

export function getUserAgent(request: NextRequest): string | undefined {
  return request.headers.get('user-agent') || undefined;
}

export function getRequestId(request: NextRequest): string | undefined {
  return request.headers.get('x-request-id') || undefined;
}
