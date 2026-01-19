import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAdminRole } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';
import { createEvidenceTraceId, recordEvidenceEvent } from '@/lib/analytics/evidence-telemetry';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: { reviewId: string } }) {
  const startedAt = Date.now();
  const traceId = createEvidenceTraceId();

  const authResult = await authenticateRequest(request);
  if (!authResult.success) {
    return authResult.response;
  }

  const activeUser = authResult.session.user;
  if (!isAdminRole(activeUser.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { status, decisionNotes } = body as { status?: string; decisionNotes?: string };

  if (!status || !['approved', 'rejected', 'modified'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const reviewId = params.reviewId;
  const tenantIdRaw: unknown = (activeUser as any).tenant_id;
  const tenantId = typeof tenantIdRaw === 'string' ? parseInt(tenantIdRaw, 10) : (tenantIdRaw as number);
  const approverId = parseInt(activeUser.id, 10);

  const updated = await prisma.aIReview.update({
    where: { id: reviewId },
    data: {
      status,
      decisionNotes: decisionNotes || undefined,
      approvedAt: new Date(),
      approvedById: approverId || undefined,
    },
  });

  if (tenantId && !Number.isNaN(tenantId)) {
    const actionType =
      status === 'approved'
        ? 'approve_review'
        : status === 'rejected'
          ? 'reject_review'
          : 'modify_review';
    await recordEvidenceEvent({
      tenantId,
      userId: approverId || undefined,
      traceId,
      requestId: traceId,
      eventType: 'ai_review_decision',
      workflowType: 'ai_governance',
      actionType,
      status: 'ok',
      durationMs: Date.now() - startedAt,
      evidenceType: 'measured',
      metadata: {
        reviewId,
        decision: status,
      },
    });
  }

  return NextResponse.json({ review: updated });
}
