/**
 * Canonical Phase 1 Assessment Collection Route
 *
 * Phase 1 uses:
 * - GET /api/assessments           -> list assessments
 * - POST /api/assessments          -> create assessment shell
 * - GET /api/assessments/[id]      -> retrieve assessment
 * - PUT /api/assessments/[id]      -> update assessment shell metadata
 * - POST /api/assessments/instances -> create conduct instance
 * - PUT /api/assessments/instances  -> update conduct instance
 * - GET /api/assessments/instances/[id] -> retrieve conduct instance
 *
 * Legacy multiplexed paths are intentionally quarantined from the Phase 1 corridor.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authorizeRequest, Permission } from '@/lib/middleware/auth';
import { createEvidenceTraceId, recordEvidenceEvent } from '@/lib/analytics/evidence-telemetry';

export const dynamic = 'force-dynamic';

const CreateAssessmentSchema = z.object({
  case_id: z.union([z.number().int().positive(), z.string().min(1)]),
  assessment_type: z.string().min(1),
  status: z.string().optional(),
  scheduled_date: z.string().datetime().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await authorizeRequest(request, Permission.VIEW_ASSESSMENTS);
    if (!authResult.success) {
      return authResult.response;
    }

    const tenantId = authResult.session.user.tenant_id;
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant context is required' }, { status: 400 });
    }

    const assessments = await prisma.assessments.findMany({
      where: { tenant_id: tenantId },
      include: {
        cases: {
          include: {
            students: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({
      success: true,
      assessments,
      pagination: {
        page: 1,
        limit: 20,
        totalCount: assessments.length,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      total: assessments.length,
    });
  } catch (_error) {
    console.error('Error fetching assessments:', _error);
    return NextResponse.json({ error: 'Failed to fetch assessments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  const traceId = createEvidenceTraceId();

  try {
    const authResult = await authorizeRequest(request, Permission.CREATE_ASSESSMENTS);
    if (!authResult.success) {
      return authResult.response;
    }

    const { session } = authResult;
    const tenantId = session.user.tenant_id;
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant context is required' }, { status: 400 });
    }

    const body = await request.json();
    const validation = CreateAssessmentSchema.safeParse(body);

    if (!validation.success) {
      await recordEvidenceEvent({
        tenantId,
        userId: parseInt(session.user.id, 10),
        traceId,
        requestId: traceId,
        eventType: 'assessment_create',
        workflowType: 'assessment',
        actionType: 'create_assessment',
        status: 'error',
        durationMs: Date.now() - startedAt,
        evidenceType: 'measured',
        metadata: { reason: 'invalid_payload' },
      });

      return NextResponse.json({ error: 'Invalid assessment payload', details: validation.error.issues }, { status: 400 });
    }

    const caseId = typeof validation.data.case_id === 'string'
      ? Number.parseInt(validation.data.case_id, 10)
      : validation.data.case_id;

    const existingCase = await prisma.cases.findUnique({ where: { id: caseId } });
    if (!existingCase || existingCase.tenant_id !== tenantId) {
      return NextResponse.json({ error: 'Case not found in tenant scope' }, { status: 404 });
    }

    const assessment = await prisma.assessments.create({
      data: {
        tenant_id: tenantId,
        case_id: caseId,
        assessment_type: validation.data.assessment_type,
        status: validation.data.status ?? 'pending',
        scheduled_date: validation.data.scheduled_date ? new Date(validation.data.scheduled_date) : undefined,
        created_by: parseInt(session.user.id, 10),
      },
    });

    await recordEvidenceEvent({
      tenantId,
      userId: parseInt(session.user.id, 10),
      traceId,
      requestId: traceId,
      eventType: 'assessment_create',
      workflowType: 'assessment',
      actionType: 'create_assessment',
      status: 'ok',
      durationMs: Date.now() - startedAt,
      evidenceType: 'measured',
      metadata: {
        assessmentId: assessment.id,
        caseId,
        assessmentType: assessment.assessment_type,
      },
    });

    return NextResponse.json({ success: true, assessment }, { status: 201 });
  } catch (_error) {
    console.error('Error creating assessment:', _error);
    return NextResponse.json({ error: 'Failed to create assessment' }, { status: 500 });
  }
}

export async function PUT(_request: NextRequest) {
  return NextResponse.json(
    { error: 'Deprecated Phase 1 path. Use /api/assessments/[id] for assessment updates.' },
    { status: 410 }
  );
}

export async function DELETE(_request: NextRequest) {
  return NextResponse.json(
    { error: 'Deprecated Phase 1 path. Use /api/assessments/[id] for assessment deletion.' },
    { status: 410 }
  );
}

export async function OPTIONS(_request: NextRequest) {
  return NextResponse.json({}, { status: 200 });
}
