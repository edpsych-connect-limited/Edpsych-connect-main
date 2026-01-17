import { randomUUID, createHash } from 'crypto';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export type EvidenceStatus = 'ok' | 'blocked' | 'error';
export type EvidenceType = 'measured' | 'estimated' | 'reported' | 'calculated' | 'system';

export interface EvidenceEventInput {
  tenantId: number;
  userId?: number;
  traceId?: string;
  eventType: string;
  workflowType?: string;
  actionType?: string;
  status?: EvidenceStatus;
  durationMs?: number;
  evidenceType: EvidenceType;
  modelVersionId?: string;
  requestId?: string;
  inputHash?: string;
  outputHash?: string;
  summary?: string;
  metadata?: Record<string, unknown>;
}

export function hashEvidenceText(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

export async function recordEvidenceEvent(input: EvidenceEventInput): Promise<string | null> {
  try {
    const record = await prisma.evidenceEvent.create({
      data: {
        tenantId: input.tenantId,
        userId: input.userId,
        traceId: input.traceId,
        eventType: input.eventType,
        workflowType: input.workflowType,
        actionType: input.actionType,
        status: input.status ?? 'ok',
        durationMs: input.durationMs,
        evidenceType: input.evidenceType,
        modelVersionId: input.modelVersionId,
        requestId: input.requestId,
        inputHash: input.inputHash,
        outputHash: input.outputHash,
        summary: input.summary,
        metadata: input.metadata ?? undefined,
      },
    });

    return record.id;
  } catch (error) {
    logger.warn('Failed to record evidence event', { error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

export function createEvidenceTraceId(): string {
  return randomUUID();
}
