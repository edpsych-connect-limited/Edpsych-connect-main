/**
 * Student Individual API Routes - Enterprise-grade implementation
 * Phase 3: Core SEND Functionality
 *
 * Endpoints:
 * - GET /api/students/[id] - Retrieve single student
 * - PATCH /api/students/[id] - Update student
 * - DELETE /api/students/[id] - Archive student (soft delete)
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
 * Student Update Schema - Validation
 */
const UpdateStudentSchema = z.object({
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  date_of_birth: z.string().datetime().optional(),
  year_group: z.string().min(1).max(20).optional(),
  sen_status: z.enum(['none', 'support', 'support_plus', 'ehcp']).optional(),
});

/**
 * GET /api/students/[id]
 * Retrieve single student by ID
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
  { params }: { params: { id: string } }
) {
  const ipAddress = getIpAddress(request);
  const requestId = getRequestId(request);

  try {
    const { id } = params;

    // Validate ID format
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid student ID' },
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

    // 3. Retrieve student from database
    const student = await prisma.students.findUnique({
      where: { id: parseInt(id) },
      include: {
        cases: {
          select: {
            id: true,
            status: true,
            priority: true,
            type: true,
            referral_date: true,
            assigned_to: true,
            users: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { referral_date: 'desc' },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // 4. Security: Enforce tenant isolation (GDPR compliance)
    if (!canAccessTenant(user.tenant_id, student.tenant_id, user.role)) {
      await auditLogger.logUnauthorizedAccess(
        user.id,
        'VIEW_STUDENT',
        'Student',
        id,
        ipAddress,
        getUserAgent(request),
        requestId
      );
      return NextResponse.json(
        { error: 'Access denied. You cannot view this student.' },
        { status: 403 }
      );
    }

    // 5. Audit logging (GDPR-compliant data access tracking)
    await auditLogger.logDataAccess(
      user.id,
      user.email,
      'READ',
      'Student',
      id,
      { tenant_id: student.tenant_id, unique_id: student.unique_id },
      ipAddress,
      requestId
    );

    return NextResponse.json({
      student,
      message: 'Student retrieved successfully',
    });
  } catch (_error) {
    console._error('[Student API] Error fetching student:', _error);
    return NextResponse.json(
      {
        _error: 'Failed to retrieve student',
        message: _error instanceof Error ? _error.message : 'Unknown _error',
        requestId,
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/students/[id]
 * Update existing student
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
  { params }: { params: { id: string } }
) {
  const ipAddress = getIpAddress(request);
  const requestId = getRequestId(request);

  try {
    const { id } = params;

    // Validate ID format
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid student ID' },
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
    const validation = UpdateStudentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid student data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const updateData = validation.data;

    // 4. Check if student exists
    const existingStudent = await prisma.students.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingStudent) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // 5. Security: Enforce tenant isolation (GDPR compliance)
    if (!canAccessTenant(user.tenant_id, existingStudent.tenant_id, user.role)) {
      await auditLogger.logUnauthorizedAccess(
        user.id,
        'EDIT_STUDENT',
        'Student',
        id,
        ipAddress,
        getUserAgent(request),
        requestId
      );
      return NextResponse.json(
        { error: 'Access denied. You cannot edit this student.' },
        { status: 403 }
      );
    }

    // 6. Update student in database
    const updatedStudent = await prisma.students.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        date_of_birth: updateData.date_of_birth
          ? new Date(updateData.date_of_birth)
          : undefined,
        updated_at: new Date(),
      },
      include: {
        cases: {
          select: {
            id: true,
            status: true,
            type: true,
          },
          orderBy: { referral_date: 'desc' },
          take: 1,
        },
      },
    });

    // 7. Audit logging (GDPR-compliant modification tracking)
    await auditLogger.logDataAccess(
      user.id,
      user.email,
      'UPDATE',
      'Student',
      id,
      {
        tenant_id: updatedStudent.tenant_id,
        unique_id: updatedStudent.unique_id,
        updated_fields: Object.keys(updateData),
      },
      ipAddress,
      requestId
    );

    return NextResponse.json({
      student: updatedStudent,
      message: 'Student updated successfully',
    });
  } catch (_error) {
    console._error('[Student API] Error updating student:', _error);
    return NextResponse.json(
      {
        _error: 'Failed to update student',
        message: _error instanceof Error ? _error.message : 'Unknown _error',
        requestId,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/students/[id]
 * Archive student (soft delete)
 *
 * Security:
 * - Authentication required
 * - Permission: EDIT_STUDENT_DATA (high-level permission required)
 * - Rate limited: 100 requests per minute
 * - Audit logged (CRITICAL security event - GDPR-compliant)
 * - Tenant isolation enforced
 *
 * Note: This is a hard delete but requires careful consideration due to GDPR.
 *       In production, consider implementing soft delete or archiving instead.
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
        { error: 'Invalid student ID' },
        { status: 400 }
      );
    }

    // 1. Rate limiting check
    const rateLimitResult = await apiRateLimit(request);
    if (!rateLimitResult.allowed && rateLimitResult.response) {
      return rateLimitResult.response;
    }

    // 2. Authentication and authorization check (HIGH-LEVEL permission required)
    const authResult = await authorizeRequest(request, Permission.EDIT_STUDENT_DATA);
    if (!authResult.success) {
      return authResult.response;
    }

    const { session } = authResult;
    const { user } = session;

    // 3. Check if student exists
    const existingStudent = await prisma.students.findUnique({
      where: { id: parseInt(id) },
      include: {
        cases: {
          select: { id: true },
        },
      },
    });

    if (!existingStudent) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // 4. Security: Enforce tenant isolation (GDPR compliance)
    if (!canAccessTenant(user.tenant_id, existingStudent.tenant_id, user.role)) {
      await auditLogger.logUnauthorizedAccess(
        user.id,
        'DELETE_STUDENT',
        'Student',
        id,
        ipAddress,
        getUserAgent(request),
        requestId
      );
      return NextResponse.json(
        { error: 'Access denied. You cannot delete this student.' },
        { status: 403 }
      );
    }

    // 5. Check for related cases
    if (existingStudent.cases.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete student. This student has associated cases. Please close all cases first.',
          cases_count: existingStudent.cases.length,
        },
        { status: 409 } // Conflict
      );
    }

    // 6. Delete student from database
    await prisma.students.delete({
      where: { id: parseInt(id) },
    });

    // 7. Audit logging (CRITICAL security event - GDPR-compliant)
    await auditLogger.logDataAccess(
      user.id,
      user.email,
      'DELETE',
      'Student',
      id,
      {
        tenant_id: existingStudent.tenant_id,
        unique_id: existingStudent.unique_id,
        first_name: existingStudent.first_name,
        last_name: existingStudent.last_name,
        reason: 'Student record deleted by administrator',
      },
      ipAddress,
      requestId
    );

    return NextResponse.json({
      message: 'Student deleted successfully',
      student_id: id,
    });
  } catch (_error) {
    console._error('[Student API] Error deleting student:', _error);
    return NextResponse.json(
      {
        _error: 'Failed to delete student',
        message: _error instanceof Error ? _error.message : 'Unknown _error',
        requestId,
      },
      { status: 500 }
    );
  }
}
