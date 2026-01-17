import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import type { ReviewSeverity } from '@/lib/governance/ai-review-policy';

export async function createAiReview(params: {
  tenantId: number;
  userId?: number;
  auditLogId?: string | null;
  evidenceEventId?: string | null;
  modelVersionId?: string | null;
  requestId?: string | null;
  useCase: string;
  agentId?: string | null;
  severity: ReviewSeverity;
  reason?: string | null;
  responsePreview?: string | null;
}): Promise<string | null> {
  try {
    const review = await prisma.aIReview.create({
      data: {
        tenantId: params.tenantId,
        userId: params.userId,
        auditLogId: params.auditLogId ?? undefined,
        evidenceEventId: params.evidenceEventId ?? undefined,
        modelVersionId: params.modelVersionId ?? undefined,
        requestId: params.requestId ?? undefined,
        useCase: params.useCase,
        agentId: params.agentId ?? undefined,
        severity: params.severity,
        reason: params.reason ?? undefined,
        responsePreview: params.responsePreview ?? undefined,
      },
    });

    return review.id;
  } catch (error) {
    logger.warn('Failed to create AI review record', { error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}
