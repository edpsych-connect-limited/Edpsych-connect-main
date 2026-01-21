import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  if (!authResult.success) {
    return authResult.response;
  }

  const activeUser = authResult.session.user;
  const tenantIdRaw: unknown = (activeUser as any).tenant_id;
  const tenantId = typeof tenantIdRaw === 'string' ? parseInt(tenantIdRaw, 10) : (tenantIdRaw as number);
  if (!tenantId || Number.isNaN(tenantId)) {
    return NextResponse.json({ error: 'Missing tenant context' }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const timeRange = parseInt(searchParams.get('timeRange') || '30', 10);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeRange);

  try {
    const [eventCounts, reviewCounts, latencyAgg, evidenceTypes, uniqueUsers, workflowCounts, statusCounts, pendingReviews] = await Promise.all([
      prisma.evidenceEvent.groupBy({
        by: ['eventType'],
        where: { tenantId, createdAt: { gte: startDate } },
        _count: { _all: true },
      }),
      prisma.aIReview.groupBy({
        by: ['status'],
        where: { tenantId, createdAt: { gte: startDate } },
        _count: { _all: true },
      }),
      prisma.evidenceEvent.aggregate({
        where: { tenantId, createdAt: { gte: startDate }, durationMs: { not: null } },
        _avg: { durationMs: true },
        _max: { durationMs: true },
      }),
      prisma.evidenceEvent.groupBy({
        by: ['evidenceType'],
        where: { tenantId, createdAt: { gte: startDate } },
        _count: { _all: true },
      }),
      prisma.evidenceEvent.groupBy({
        by: ['userId'],
        where: { tenantId, createdAt: { gte: startDate }, userId: { not: null } },
        _count: { _all: true },
      }),
      prisma.evidenceEvent.groupBy({
        by: ['workflowType'],
        where: { tenantId, createdAt: { gte: startDate } },
        _count: { _all: true },
      }),
      prisma.evidenceEvent.groupBy({
        by: ['status'],
        where: { tenantId, createdAt: { gte: startDate } },
        _count: { _all: true },
      }),
      prisma.aIReview.findMany({
        where: { tenantId, status: 'pending', createdAt: { gte: startDate } },
        select: { createdAt: true },
      }),
    ]);

    const countsByEvent: Record<string, number> = {};
    eventCounts.forEach((row) => {
      countsByEvent[row.eventType] = row._count._all;
    });

    const reviewsByStatus: Record<string, number> = {};
    reviewCounts.forEach((row) => {
      reviewsByStatus[row.status] = row._count._all;
    });

    const reviewsTotal = Object.values(reviewsByStatus).reduce((sum, v) => sum + v, 0);

    const byWorkflow = workflowCounts
      .map((row) => ({
        workflow: row.workflowType || 'unclassified',
        count: row._count._all,
      }))
      .sort((a, b) => b.count - a.count);

    const evidenceStatusCounts: Record<string, number> = {};
    statusCounts.forEach((row) => {
      evidenceStatusCounts[row.status] = row._count._all;
    });

    const reviewAging = pendingReviews.reduce(
      (acc, review) => {
        const ageMs = Date.now() - review.createdAt.getTime();
        const ageHours = ageMs / (1000 * 60 * 60);
        if (ageHours < 24) {
          acc.lt24 += 1;
        } else if (ageHours < 72) {
          acc.between24And72 += 1;
        } else {
          acc.gt72 += 1;
        }
        return acc;
      },
      { lt24: 0, between24And72: 0, gt72: 0 }
    );

    const byType = evidenceTypes.map((row) => ({
      type: row.evidenceType,
      count: row._count._all,
    }));

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      timeRangeDays: timeRange,
      summary: {
        totalEvents: Object.values(countsByEvent).reduce((sum, v) => sum + v, 0),
        events30d: Object.values(countsByEvent).reduce((sum, v) => sum + v, 0),
        aiRequests: countsByEvent.ai_request || 0,
        aiResponses: countsByEvent.ai_response || 0,
        reviewsRequired: countsByEvent.review_required || 0,
        avgLatencyMs: latencyAgg._avg.durationMs ? Math.round(latencyAgg._avg.durationMs) : 0,
        maxLatencyMs: latencyAgg._max.durationMs || 0,
        uniqueUsers30d: uniqueUsers.length,
        reviews30d: reviewsTotal,
      },
      events: countsByEvent,
      reviews: reviewsByStatus,
      reviewAging,
      statuses: evidenceStatusCounts,
      workflows: byWorkflow,
      byType,
    });
  } catch (error) {
    console.error('Evidence metrics API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve evidence metrics' }, { status: 500 });
  }
}
