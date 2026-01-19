import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { createEvidenceTraceId, recordEvidenceEvent } from '@/lib/analytics/evidence-telemetry';
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
  const startedAt = Date.now();
  const traceId = createEvidenceTraceId();

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

    await recordEvidenceEvent({
      tenantId: params.tenantId,
      userId: params.userId,
      traceId,
      requestId: params.requestId ?? traceId,
      eventType: 'ai_review_submit',
      workflowType: 'ai_governance',
      actionType: 'submit_review',
      status: 'ok',
      durationMs: Date.now() - startedAt,
      evidenceType: 'measured',
      metadata: {
        reviewId: review.id,
        severity: params.severity,
        useCase: params.useCase,
        agentId: params.agentId ?? undefined,
      },
    });

    return review.id;
  } catch (error) {
    await recordEvidenceEvent({
      tenantId: params.tenantId,
      userId: params.userId,
      traceId,
      requestId: params.requestId ?? traceId,
      eventType: 'ai_review_submit',
      workflowType: 'ai_governance',
      actionType: 'submit_review',
      status: 'error',
      durationMs: Date.now() - startedAt,
      evidenceType: 'measured',
      metadata: {
        severity: params.severity,
        useCase: params.useCase,
        agentId: params.agentId ?? undefined,
      },
    });
    logger.warn('Failed to create AI review record', { error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}
