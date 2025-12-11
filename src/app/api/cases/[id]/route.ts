/**
 * Case Individual API Routes - Enterprise-grade implementation
 * Phase 3: Core SEND Functionality
 *
 * Endpoints:
 * - GET /api/cases/[id] - Retrieve single case
 * - PATCH /api/cases/[id] - Update case
 * - DELETE /api/cases/[id] - Close/archive case
 *
 * Features:
 * - Role-based access control (RBAC)
 * - Rate limiting protection
 * - Comprehensive audit logging (GDPR-compliant)
 * - Input validation with Zod
 * - Multi-tenancy support with strict tenant isolation
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authorizeRequest, Permission, canAccessTenant } from '@/lib/middleware/auth';
import { apiRateLimit } from '@/lib/middleware/rate-limit';
import { auditLogger, getIpAddress, getRequestId, getUserAgent } from '@/lib/security/audit-logger';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

/**
 * Case Update Schema - Validation
 */
const UpdateCaseSchema = z.object({
  assigned_to: z.number().positive().optional(),
  status: z.enum(['new', 'assessment', 'intervention', 'review', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  type: z.enum([
    'initial_assessment',
    'statutory_assessment',
    'annual_review',
    'emergency_review',
    'safeguarding',
    'behavior_support',
    'transition',
    'other',
  ]).optional(),
  referral_date: z.string().datetime().optional(),
});

/**
 * GET /api/cases/[id]
 * Retrieve single case by ID
 *
 * Security:
 * - Authentication required
 * - Permission: VIEW_STUDENT_DATA
 * - Rate limited: 100 requests per minute
 * - Audit logged (GDPR-compliant)
 * - Tenant isolation enforced
 */
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const ipAddress = getIpAddress(request);
  const requestId = getRequestId(request);

  try {
    const { id } = params;

    // Validate ID format
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid case ID' },
        { status: 400 }
      );
    }

    // 1. Rate limiting check
    const rateLimitResult = await apiRateLimit(request);
    if (!rateLimitResult.allowed && rateLimitResult.response) {
      return rateLimitResult.response;
    }

    // 2. Authentication and authorization check
    const authResult = await authorizeRequest(request, Permission.VIEW_STUDENT_DATA);
    if (!authResult.success) {
      return authResult.response;
    }

    const { session } = authResult;
    const { user } = session;

    // 3. Retrieve case from database
    const caseRecord = await prisma.cases.findUnique({
      where: { id: parseInt(id) },
      include: {
        students: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            date_of_birth: true,
            year_group: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assessments: {
          select: {
            id: true,
            assessment_type: true,
            status: true,
            scheduled_date: true,
          },
          orderBy: { created_at: 'desc' },
          take: 5,
        },
        interventions: {
          select: {
            id: true,
            intervention_type: true,
            status: true,
            start_date: true,
          },
          orderBy: { created_at: 'desc' },
          take: 5,
        },
      },
    });

    if (!caseRecord) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // 4. Security: Enforce tenant isolation (GDPR compliance)
    if (!canAccessTenant(user.tenant_id, caseRecord.tenant_id, user.role)) {
      await auditLogger.logUnauthorizedAccess(
        user.id,
        'VIEW_CASE',
        'Case',
        id,
        ipAddress,
        getUserAgent(request),
        requestId
      );
      return NextResponse.json(
        { error: 'Access denied. You cannot view this case.' },
        { status: 403 }
      );
    }

    // 5. Audit logging (GDPR-compliant data access tracking)
    await auditLogger.logDataAccess(
      user.id,
      user.email,
      'READ',
      'Case',
      id,
      { tenant_id: caseRecord.tenant_id, student_id: caseRecord.student_id },
      ipAddress,
      requestId
    );

    return NextResponse.json({
      case: caseRecord,
      message: 'Case retrieved successfully',
    });
  } catch (_error) {
    console.error('[Case API] Error fetching case:', _error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve case',
        message: _error instanceof Error ? _error.message : 'Unknown _error',
        requestId,
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/cases/[id]
 * Update existing case
 *
 * Security:
 * - Authentication required
 * - Permission: EDIT_STUDENT_DATA
 * - Rate limited: 100 requests per minute
 * - Audit logged (GDPR-compliant)
 * - Tenant isolation enforced
 */
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const ipAddress = getIpAddress(request);
  const requestId = getRequestId(request);

  try {
    const { id } = params;

    // Validate ID format
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid case ID' },
        { status: 400 }
      );
    }

    // 1. Rate limiting check
    const rateLimitResult = await apiRateLimit(request);
    if (!rateLimitResult.allowed && rateLimitResult.response) {
      return rateLimitResult.response;
    }

    // 2. Authentication and authorization check
    const authResult = await authorizeRequest(request, Permission.EDIT_STUDENT_DATA);
    if (!authResult.success) {
      return authResult.response;
    }

    const { session } = authResult;
    const { user } = session;

    // 3. Parse and validate request body
    const body = await request.json();
    const validation = UpdateCaseSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid case data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const updateData = validation.data;

    // 4. Check if case exists
    const existingCase = await prisma.cases.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingCase) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // 5. Security: Enforce tenant isolation (GDPR compliance)
    if (!canAccessTenant(user.tenant_id, existingCase.tenant_id, user.role)) {
      await auditLogger.logUnauthorizedAccess(
        user.id,
        'EDIT_CASE',
        'Case',
        id,
        ipAddress,
        getUserAgent(request),
        requestId
      );
      return NextResponse.json(
        { error: 'Access denied. You cannot edit this case.' },
        { status: 403 }
      );
    }

    // 6. Update case in database
    const updatedCase = await prisma.cases.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        referral_date: updateData.referral_date
          ? new Date(updateData.referral_date)
          : undefined,
        updated_at: new Date(),
      },
      include: {
        students: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            date_of_birth: true,
          },
        },
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
      'Case',
      id,
      {
        tenant_id: updatedCase.tenant_id,
        student_id: updatedCase.student_id,
        updated_fields: Object.keys(updateData),
      },
      ipAddress,
      requestId
    );

    return NextResponse.json({
      case: updatedCase,
      message: 'Case updated successfully',
    });
  } catch (_error) {
    console.error('[Case API] Error updating case:', _error);
    return NextResponse.json(
      {
        error: 'Failed to update case',
        message: _error instanceof Error ? _error.message : 'Unknown _error',
        requestId,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cases/[id]
 * Close/archive case (soft delete by setting status to 'closed')
 *
 * Security:
 * - Authentication required
 * - Permission: EDIT_STUDENT_DATA
 * - Rate limited: 100 requests per minute
 * - Audit logged (CRITICAL security event - GDPR-compliant)
 * - Tenant isolation enforced
 */
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const ipAddress = getIpAddress(request);
  const requestId = getRequestId(request);

  try {
    const { id } = params;

    // Validate ID format
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid case ID' },
        { status: 400 }
      );
    }

    // 1. Rate limiting check
    const rateLimitResult = await apiRateLimit(request);
    if (!rateLimitResult.allowed && rateLimitResult.response) {
      return rateLimitResult.response;
    }

    // 2. Authentication and authorization check
    const authResult = await authorizeRequest(request, Permission.EDIT_STUDENT_DATA);
    if (!authResult.success) {
      return authResult.response;
    }

    const { session } = authResult;
    const { user } = session;

    // 3. Check if case exists
    const existingCase = await prisma.cases.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingCase) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // 4. Security: Enforce tenant isolation (GDPR compliance)
    if (!canAccessTenant(user.tenant_id, existingCase.tenant_id, user.role)) {
      await auditLogger.logUnauthorizedAccess(
        user.id,
        'DELETE_CASE',
        'Case',
        id,
        ipAddress,
        getUserAgent(request),
        requestId
      );
      return NextResponse.json(
        { error: 'Access denied. You cannot delete this case.' },
        { status: 403 }
      );
    }

    // 5. Soft delete - close the case
    const closedCase = await prisma.cases.update({
      where: { id: parseInt(id) },
      data: {
        status: 'closed',
        updated_at: new Date(),
      },
    });

    // 6. Audit logging (CRITICAL security event - GDPR-compliant)
    await auditLogger.logDataAccess(
      user.id,
      user.email,
      'DELETE',
      'Case',
      id,
      {
        tenant_id: existingCase.tenant_id,
        student_id: existingCase.student_id,
        reason: 'Case closed',
      },
      ipAddress,
      requestId
    );

    return NextResponse.json({
      message: 'Case closed successfully',
      case: closedCase,
    });
  } catch (_error) {
    console.error('[Case API] Error closing case:', _error);
    return NextResponse.json(
      {
        error: 'Failed to close case',
        message: _error instanceof Error ? _error.message : 'Unknown _error',
        requestId,
      },
      { status: 500 }
    );
  }
}
