/**
 * Single Assessment API Route
 * Phase 3.2: Assessment Engine
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authorizeRequest, Permission, canAccessTenant } from '@/lib/middleware/auth';
import { apiRateLimit } from '@/lib/middleware/rate-limit';
import { auditLogger, getIpAddress, getRequestId } from '@/lib/security/audit-logger';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

const UpdateAssessmentSchema = z.object({
  assessment_type: z.string().optional(),
  scheduled_date: z.string().datetime().optional(),
  status: z.string().optional(),
  completed_date: z.string().datetime().optional(),
  report_url: z.string().optional(),
});

/**
 * GET /api/assessments/[id]
 * Retrieve single assessment
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid assessment ID' }, { status: 400 });
  }

  try {
    const rateLimitResult = await apiRateLimit(request);
    if (!rateLimitResult.allowed && rateLimitResult.response) {
      return rateLimitResult.response;
    }

    const authResult = await authorizeRequest(request, Permission.VIEW_STUDENT_DATA);
    if (!authResult.success) {
      return authResult.response;
    }

    const { session } = authResult;
    const { user } = session;

    const assessment = await prisma.assessments.findUnique({
      where: { id },
      include: {
        cases: {
          include: {
            students: true,
          },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    if (!canAccessTenant(user.tenant_id, assessment.tenant_id, user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ assessment });
  } catch (_error) {
    console.error('Error fetching assessment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PUT /api/assessments/[id]
 * Update assessment
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ipAddress = getIpAddress(request);
  const requestId = getRequestId(request);
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid assessment ID' }, { status: 400 });
  }

  try {
    const rateLimitResult = await apiRateLimit(request);
    if (!rateLimitResult.allowed && rateLimitResult.response) {
      return rateLimitResult.response;
    }

    const authResult = await authorizeRequest(request, Permission.EDIT_STUDENT_DATA);
    if (!authResult.success) {
      return authResult.response;
    }

    const { session } = authResult;
    const { user } = session;

    const body = await request.json();
    const validation = UpdateAssessmentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid data', details: validation.error.issues }, { status: 400 });
    }

    const existingAssessment = await prisma.assessments.findUnique({ where: { id } });
    if (!existingAssessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    if (!canAccessTenant(user.tenant_id, existingAssessment.tenant_id, user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const updatedAssessment = await prisma.assessments.update({
      where: { id },
      data: {
        ...validation.data,
        scheduled_date: validation.data.scheduled_date ? new Date(validation.data.scheduled_date) : undefined,
        completion_date: validation.data.completed_date ? new Date(validation.data.completed_date) : undefined,
        updated_at: new Date(),
      },
    });

    await auditLogger.logDataAccess(
      user.id,
      user.email,
      'UPDATE',
      'Assessment',
      id.toString(),
      { tenant_id: existingAssessment.tenant_id },
      ipAddress,
      requestId
    );

    return NextResponse.json({ assessment: updatedAssessment });
  } catch (_error) {
    console.error('Error updating assessment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
