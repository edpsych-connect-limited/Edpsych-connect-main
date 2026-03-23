/**
 * Intervention Reviews API
 * Phase 2D: Structured Intervention Engine
 *
 * GET  /api/interventions/[id]/reviews  — list reviews for an intervention
 * POST /api/interventions/[id]/reviews  — add a progress review
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authorizeRequest, Permission, canAccessTenant } from '@/lib/middleware/auth';
import { apiRateLimit } from '@/lib/middleware/rate-limit';
import { auditLogger, getIpAddress, getRequestId } from '@/lib/security/audit-logger';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const CreateReviewSchema = z.object({
  review_date: z.string().datetime(),
  progress_rating: z.enum(['on_track', 'concern', 'completed', 'discontinued']),
  notes: z.string().optional(),
  next_review_date: z.string().datetime().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ipAddress = getIpAddress(request);
  const requestId = getRequestId(request);

  try {
    const rateLimitResult = await apiRateLimit(request);
    if (!rateLimitResult.allowed && rateLimitResult.response) return rateLimitResult.response;

    const authResult = await authorizeRequest(request, Permission.VIEW_INTERVENTIONS);
    if (!authResult.success) return authResult.response;
    const { session } = authResult;
    const { user } = session;

    const interventionId = parseInt(params.id, 10);
    if (isNaN(interventionId)) {
      return NextResponse.json({ error: 'Invalid intervention ID' }, { status: 400 });
    }

    // Verify intervention exists and belongs to user's tenant
    const intervention = await prisma.interventions.findUnique({
      where: { id: interventionId },
      select: { id: true, tenant_id: true },
    });

    if (!intervention) {
      return NextResponse.json({ error: 'Intervention not found' }, { status: 404 });
    }

    if (!canAccessTenant(user.tenant_id, intervention.tenant_id, user.role)) {
      await auditLogger.logUnauthorizedAccess(user.id, 'VIEW_INTERVENTION_REVIEWS', 'InterventionReview', `intervention_${interventionId}`, ipAddress, undefined, requestId);
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const reviews = await prisma.interventionReview.findMany({
      where: { intervention_id: interventionId },
      orderBy: { review_date: 'desc' },
      include: {
        reviewer: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    return NextResponse.json({ reviews });
  } catch (_error) {
    console.error('[InterventionReviews] GET error:', _error);
    return NextResponse.json({ error: 'Failed to retrieve reviews' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ipAddress = getIpAddress(request);
  const requestId = getRequestId(request);

  try {
    const rateLimitResult = await apiRateLimit(request);
    if (!rateLimitResult.allowed && rateLimitResult.response) return rateLimitResult.response;

    const authResult = await authorizeRequest(request, Permission.EDIT_INTERVENTIONS);
    if (!authResult.success) return authResult.response;
    const { session } = authResult;
    const { user } = session;

    const interventionId = parseInt(params.id, 10);
    if (isNaN(interventionId)) {
      return NextResponse.json({ error: 'Invalid intervention ID' }, { status: 400 });
    }

    // Verify intervention exists and belongs to user's tenant
    const intervention = await prisma.interventions.findUnique({
      where: { id: interventionId },
      select: { id: true, tenant_id: true },
    });

    if (!intervention) {
      return NextResponse.json({ error: 'Intervention not found' }, { status: 404 });
    }

    if (!canAccessTenant(user.tenant_id, intervention.tenant_id, user.role)) {
      await auditLogger.logUnauthorizedAccess(user.id, 'CREATE_INTERVENTION_REVIEW', 'InterventionReview', `intervention_${interventionId}`, ipAddress, undefined, requestId);
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const validation = CreateReviewSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid review data', details: validation.error.issues }, { status: 400 });
    }

    const { review_date, progress_rating, notes, next_review_date } = validation.data;

    const review = await prisma.interventionReview.create({
      data: {
        tenant_id: intervention.tenant_id,
        intervention_id: interventionId,
        reviewed_by: parseInt(user.id, 10),
        review_date: new Date(review_date),
        progress_rating,
        notes: notes ?? null,
        next_review_date: next_review_date ? new Date(next_review_date) : null,
      },
      include: {
        reviewer: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    // If review marks intervention complete/discontinued, update status
    if (progress_rating === 'completed' || progress_rating === 'discontinued') {
      await prisma.interventions.update({
        where: { id: interventionId },
        data: { status: progress_rating, updated_at: new Date() },
      });
    }

    // If next review date provided, update intervention's review_date
    if (next_review_date) {
      await prisma.interventions.update({
        where: { id: interventionId },
        data: { review_date: new Date(next_review_date), updated_at: new Date() },
      });
    }

    await auditLogger.logDataAccess(user.id, user.email, 'CREATE', 'InterventionReview', review.id, { interventionId, progress_rating }, ipAddress, requestId);

    return NextResponse.json({ review, message: 'Review added successfully' }, { status: 201 });
  } catch (_error) {
    console.error('[InterventionReviews] POST error:', _error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
