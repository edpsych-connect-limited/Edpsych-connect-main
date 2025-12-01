import { logger } from "@/lib/logger";
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
  private logs: AIAuditLog[] = []; // In-memory buffer, would be DB in production

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
    const log: AIAuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...logData
    };

    // In a real implementation, this would write to the 'AuditLog' table in Prisma
    // or a dedicated high-volume logging service (e.g., CloudWatch, Datadog)
    this.logs.push(log);
    
    // Keep buffer size manageable
    if (this.logs.length > 1000) {
      this.logs.shift();
    }

    logger.debug(`[AI AUDIT] ${log.agentId} performed ${log.action} (Confidence: ${log.confidenceScore})`);
    
    return log.id;
  }

  /**
   * Retrieve logs for a specific tenant or user
   */
  async getLogs(filter: { tenantId?: string; userId?: string; agentId?: string }): Promise<AIAuditLog[]> {
    return this.logs.filter(log => {
      if (filter.tenantId && log.tenantId !== filter.tenantId) return false;
      if (filter.userId && log.userId !== filter.userId) return false;
      if (filter.agentId && log.agentId !== filter.agentId) return false;
      return true;
    });
  }

  /**
   * Flag a decision for human review
   */
  async flagForReview(logId: string, reason: string): Promise<boolean> {
    const log = this.logs.find(l => l.id === logId);
    if (log) {
      log.humanReviewRequired = true;
      log.humanReviewStatus = 'pending';
      log.metadata = { ...log.metadata, reviewReason: reason };
      return true;
    }
    return false;
  }
}

export const aiAuditService = AIAuditService.getInstance();
