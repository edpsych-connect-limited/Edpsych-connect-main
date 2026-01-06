import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

/**
 * AI Audit Service
 * Provides forensic logging for all AI decisions to ensure "Zero-Oversight" safety.
 */

export interface AIAuditLog {
  id: string;
  timestamp: Date;
  agentId: string;
  userId: string;
  tenantId: string;
  action: string;
  input: string;
  output: string;
  reasoningTrace?: string;
  confidenceScore?: number;
  autonomyLevel: 'advisory' | 'autonomous';
  humanReviewRequired: boolean;
  humanReviewStatus?: 'pending' | 'approved' | 'rejected' | 'modified';
  metadata?: any;
}

class AIAuditService {
  private static instance: AIAuditService;

  private constructor() {}

  public static getInstance(): AIAuditService {
    if (!AIAuditService.instance) {
      AIAuditService.instance = new AIAuditService();
    }
    return AIAuditService.instance;
  }

  /**
   * Log an AI decision or action
   */
  async logDecision(logData: Omit<AIAuditLog, 'id' | 'timestamp'>): Promise<string> {
    const details = {
      agentId: logData.agentId,
      input: logData.input,
      output: logData.output,
      reasoningTrace: logData.reasoningTrace,
      confidenceScore: logData.confidenceScore,
      autonomyLevel: logData.autonomyLevel,
      humanReviewRequired: logData.humanReviewRequired,
      humanReviewStatus: logData.humanReviewStatus,
      ...logData.metadata
    };

    try {
      const log = await prisma.auditLog.create({
        data: {
          action: logData.action,
          userId: logData.userId,
          tenant_id: parseInt(logData.tenantId) || undefined,
          resource: 'AI_AGENT',
          entityType: 'AI_INTERACTION',
          entityId: logData.agentId,
          details: details as any,
          description: `AI Agent ${logData.agentId} performed ${logData.action}`,
          timestamp: new Date(),
        }
      });
      
      logger.debug(`[AI AUDIT] ${logData.agentId} performed ${logData.action} (Confidence: ${logData.confidenceScore})`);
      return log.id;
    } catch (error) {
      logger.error('Failed to write AI audit log to DB', error);
      return `fallback_${Date.now()}`;
    }
  }

  /**
   * Retrieve logs for a specific tenant or user
   */
  async getLogs(filter: { tenantId?: string; userId?: string; agentId?: string }): Promise<AIAuditLog[]> {
    try {
      const where: any = {
        resource: 'AI_AGENT',
        entityType: 'AI_INTERACTION'
      };
      
      if (filter.tenantId) where.tenant_id = parseInt(filter.tenantId);
      if (filter.userId) where.userId = filter.userId;
      if (filter.agentId) where.entityId = filter.agentId;

      const logs = await prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: 100
      });

      return logs.map(log => {
        const details = log.details as any || {};
        return {
          id: log.id,
          timestamp: log.timestamp,
          agentId: log.entityId || 'unknown',
          userId: log.userId || 'unknown',
          tenantId: log.tenant_id?.toString() || 'unknown',
          action: log.action,
          input: details.input || '',
          output: details.output || '',
          reasoningTrace: details.reasoningTrace,
          confidenceScore: details.confidenceScore,
          autonomyLevel: details.autonomyLevel || 'advisory',
          humanReviewRequired: details.humanReviewRequired || false,
          humanReviewStatus: details.humanReviewStatus,
          metadata: details
        };
      });
    } catch (error) {
      logger.error('Failed to fetch AI audit logs', error);
      return [];
    }
  }

  /**
   * Flag a decision for human review
   */
  async flagForReview(logId: string, reason: string): Promise<boolean> {
    try {
      const log = await prisma.auditLog.findUnique({ where: { id: logId } });
      if (!log) return false;

      const details = log.details as any || {};
      details.humanReviewRequired = true;
      details.humanReviewStatus = 'pending';
      details.reviewReason = reason;

      await prisma.auditLog.update({
        where: { id: logId },
        data: { details }
      });
      return true;
    } catch (error) {
      logger.error('Failed to flag AI audit log for review', error);
      return false;
    }
  }
}

export const aiAuditService = AIAuditService.getInstance();
