/**
 * Assessment Individual API Routes - Enterprise-grade implementation
 * Phase 3.2: Assessment Engine
 *
 * Endpoints:
 * - GET /api/assessments/[id] - Retrieve single assessment
 * - PUT /api/assessments/[id] - Update assessment
 * - DELETE /api/assessments/[id] - Delete assessment
 *
 * Features:
 * - Role-based access control (RBAC)
 * - Rate limiting protection
 * - Comprehensive audit logging (GDPR-compliant)
 * - Input validation with Zod
 * - Multi-tenancy support
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateRequest, authorizeRequest, Permission } from '@/lib/middleware/auth';
import { apiRateLimit } from '@/lib/middleware/rate-limit';
import { auditLogger, getIpAddress, getRequestId, getUserAgent } from '@/lib/security/audit-logger';

const prisma = new PrismaClient();

/**
 * Assessment Update Schema - Validation
 */
const UpdateAssessmentSchema = z.object({
  assessment_type: z.enum([
    'cognitive',
    'educational',
    'behavioral',
    'speech_language',
    'occupational_therapy',
    'psychological',
    'functional_skills',
    'social_emotional',
    'other',
  ]).optional(),
  scheduled_date: z.string().datetime().optional(),
  completion_date: z.string().datetime().optional(),
  status: z.enum(['pending', 'scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
});

/**
 * GET /api/assessments/[id]
 * Retrieve single assessment by ID
 *
 * Security:
 * - Authentication required
 * - Permission: VIEW_ASSESSMENTS
 * - Rate limited: 100 requests per minute
 * - Audit logged (GDPR-compliant)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ipAddress = getIpAddress(request);
  const requestId = getRequestId(request);

  try {
    const { id } = params;

    // Validate ID format
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid assessment ID' },
        { status: 400 }
      );
    }

    // 1. Rate limiting check
    const rateLimitResult = await apiRateLimit(request);
    if (!rateLimitResult.allowed && rateLimitResult.response) {
      return rateLimitResult.response;
    }

    // 2. Authentication and authorization check
    const authResult = await authorizeRequest(request, Permission.VIEW_ASSESSMENTS);
    if (!authResult.success) {
      return authResult.response;
    }

    const { session } = authResult;
    const { user } = session;

    // 3. Retrieve assessment from database
    const assessment = await prisma.assessments.findUnique({
      where: { id: parseInt(id) },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        cases: {
          select: {
            id: true,
            status: true,
            type: true,
            student_id: true,
          },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // 4. Security: Verify tenant access
    // TODO: Ensure user can only view assessments from their own tenant
    // if (!hasPermission(user.role, Permission.VIEW_ALL_DATA)) {
    //   if (assessment.tenant_id !== user.tenant_id) {
    //     await auditLogger.logUnauthorizedAccess(
    //       user.id,
    //       'VIEW_ASSESSMENT',
    //       'Assessment',
    //       id,
    //       ipAddress,
    //       getUserAgent(request),
    //       requestId
    //     );
    //     return NextResponse.json(
    //       { error: 'Access denied. You cannot view this assessment.' },
    //       { status: 403 }
    //     );
    //   }
    // }

    // 5. Audit logging (GDPR-compliant data access tracking)
    await auditLogger.logDataAccess(
      user.id,
      user.email,
      'READ',
      'Assessment',
      id,
      { tenant_id: assessment.tenant_id, case_id: assessment.case_id },
      ipAddress,
      requestId
    );

    return NextResponse.json({
      assessment,
      message: 'Assessment retrieved successfully',
    });
  } catch (error) {
    console.error('[Assessment API] Error fetching assessment:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve assessment',
        message: error instanceof Error ? error.message : 'Unknown error',
        requestId,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/assessments/[id]
 * Update existing assessment
 *
 * Security:
 * - Authentication required
 * - Permission: EDIT_ASSESSMENTS
 * - Rate limited: 100 requests per minute
 * - Audit logged (GDPR-compliant)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ipAddress = getIpAddress(request);
  const requestId = getRequestId(request);

  try {
    const { id } = params;

    // Validate ID format
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid assessment ID' },
        { status: 400 }
      );
    }

    // 1. Rate limiting check
    const rateLimitResult = await apiRateLimit(request);
    if (!rateLimitResult.allowed && rateLimitResult.response) {
      return rateLimitResult.response;
    }

    // 2. Authentication and authorization check
    const authResult = await authorizeRequest(request, Permission.EDIT_ASSESSMENTS);
    if (!authResult.success) {
      return authResult.response;
    }

    const { session } = authResult;
    const { user } = session;

    // 3. Parse and validate request body
    const body = await request.json();
    const validation = UpdateAssessmentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid assessment data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const updateData = validation.data;

    // 4. Check if assessment exists
    const existingAssessment = await prisma.assessments.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingAssessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // 5. Security: Verify tenant access
    // TODO: Ensure user can only update assessments from their own tenant
    // if (!hasPermission(user.role, Permission.VIEW_ALL_DATA)) {
    //   if (existingAssessment.tenant_id !== user.tenant_id) {
    //     await auditLogger.logUnauthorizedAccess(
    //       user.id,
    //       'EDIT_ASSESSMENT',
    //       'Assessment',
    //       id,
    //       ipAddress,
    //       getUserAgent(request),
    //       requestId
    //     );
    //     return NextResponse.json(
    //       { error: 'Access denied. You cannot edit this assessment.' },
    //       { status: 403 }
    //     );
    //   }
    // }

    // 6. Update assessment in database
    const updatedAssessment = await prisma.assessments.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        scheduled_date: updateData.scheduled_date
          ? new Date(updateData.scheduled_date)
          : undefined,
        completion_date: updateData.completion_date
          ? new Date(updateData.completion_date)
          : undefined,
        updated_at: new Date(),
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // 7. Audit logging (GDPR-compliant modification tracking)
    await auditLogger.logDataAccess(
      user.id,
      user.email,
      'UPDATE',
      'Assessment',
      id,
      {
        tenant_id: updatedAssessment.tenant_id,
        case_id: updatedAssessment.case_id,
        updated_fields: Object.keys(updateData),
      },
      ipAddress,
      requestId
    );

    return NextResponse.json({
      assessment: updatedAssessment,
      message: 'Assessment updated successfully',
    });
  } catch (error) {
    console.error('[Assessment API] Error updating assessment:', error);
    return NextResponse.json(
      {
        error: 'Failed to update assessment',
        message: error instanceof Error ? error.message : 'Unknown error',
        requestId,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/assessments/[id]
 * Delete assessment
 *
 * Security:
 * - Authentication required
 * - Permission: EDIT_ASSESSMENTS (soft delete) or DELETE_EHCP (hard delete)
 * - Rate limited: 100 requests per minute
 * - Audit logged (CRITICAL security event - GDPR-compliant)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ipAddress = getIpAddress(request);
  const requestId = getRequestId(request);

  try {
    const { id } = params;

    // Validate ID format
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid assessment ID' },
        { status: 400 }
      );
    }

    // 1. Rate limiting check
    const rateLimitResult = await apiRateLimit(request);
    if (!rateLimitResult.allowed && rateLimitResult.response) {
      return rateLimitResult.response;
    }

    // 2. Authentication and authorization check
    const authResult = await authorizeRequest(request, Permission.EDIT_ASSESSMENTS);
    if (!authResult.success) {
      return authResult.response;
    }

    const { session } = authResult;
    const { user } = session;

    // 3. Check if assessment exists
    const existingAssessment = await prisma.assessments.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingAssessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // 4. Security: Verify tenant access
    // TODO: Ensure user can only delete assessments from their own tenant
    // if (!hasPermission(user.role, Permission.VIEW_ALL_DATA)) {
    //   if (existingAssessment.tenant_id !== user.tenant_id) {
    //     await auditLogger.logUnauthorizedAccess(
    //       user.id,
    //       'DELETE_ASSESSMENT',
    //       'Assessment',
    //       id,
    //       ipAddress,
    //       getUserAgent(request),
    //       requestId
    //     );
    //     return NextResponse.json(
    //       { error: 'Access denied. You cannot delete this assessment.' },
    //       { status: 403 }
    //     );
    //   }
    // }

    // 5. Soft delete - mark as cancelled
    const deletedAssessment = await prisma.assessments.update({
      where: { id: parseInt(id) },
      data: {
        status: 'cancelled',
        updated_at: new Date(),
      },
    });

    // 6. Audit logging (CRITICAL security event - GDPR-compliant)
    await auditLogger.logDataAccess(
      user.id,
      user.email,
      'DELETE',
      'Assessment',
      id,
      {
        tenant_id: existingAssessment.tenant_id,
        case_id: existingAssessment.case_id,
        reason: 'Assessment cancelled',
      },
      ipAddress,
      requestId
    );

    return NextResponse.json({
      message: 'Assessment cancelled successfully',
      assessment: deletedAssessment,
    });
  } catch (error) {
    console.error('[Assessment API] Error deleting assessment:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete assessment',
        message: error instanceof Error ? error.message : 'Unknown error',
        requestId,
      },
      { status: 500 }
    );
  }
}
