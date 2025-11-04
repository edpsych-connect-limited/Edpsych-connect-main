/**
 * FILE: src/app/api/multi-agency/view/route.ts
 * PURPOSE: Role-based multi-agency data views with privacy transformations
 *
 * This route provides secure, role-appropriate views of student data for
 * multi-agency collaboration (teachers, EPs, heads, secondary teachers).
 *
 * Features:
 * - Role-based data filtering
 * - Privacy transformations based on role
 * - Cross-tenant data access (for EPs)
 * - Complete audit logging
 * - GDPR compliance
 *
 * @route GET /api/multi-agency/view - Role-based multi-agency view
 */

import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/auth-service';
import prisma from '@/lib/prisma';
import { dataRouterService } from '@/lib/orchestration/data-router.service';

/**
 * Multi-agency view response structure
 */
interface MultiAgencyViewResponse {
  userRole: string;
  accessLevel: string;
  students: any[];
  summary: {
    totalStudents: number;
    accessibleStudents: number;
    dataTransformationsApplied: string[];
  };
  allowedActions: string[];
}

/**
 * GET /api/multi-agency/view
 *
 * Provides role-appropriate multi-agency view of student data with
 * automatic privacy transformations and access controls.
 *
 * Supported roles:
 * - teacher: Full access to own class students
 * - head_teacher: School-wide access with full details
 * - educational_psychologist: Cross-school access to assigned students
 * - secondary_teacher: Transition-focused view for receiving students
 *
 * @param request - Next.js request object
 * @returns Role-based student data view
 *
 * @example Teacher view
 * curl -X GET \
 *   "http://localhost:3000/api/multi-agency/view?classId=class_123" \
 *   -H "Authorization: Bearer {teacher_token}"
 *
 * @example EP view
 * curl -X GET \
 *   "http://localhost:3000/api/multi-agency/view?assigned=true" \
 *   -H "Authorization: Bearer {ep_token}"
 *
 * @example Head Teacher view
 * curl -X GET \
 *   "http://localhost:3000/api/multi-agency/view?schoolWide=true" \
 *   -H "Authorization: Bearer {head_token}"
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<MultiAgencyViewResponse | { error: string; message?: string }>> {
  try {
    // Authentication
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      console.warn('[Multi-Agency View API] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.tenant_id;
    const userId = session.user_id;
    const userRole = session.role;

    // Query parameters
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const schoolWide = searchParams.get('schoolWide') === 'true';
    const assigned = searchParams.get('assigned') === 'true'; // For EPs
    const studentId = searchParams.get('studentId'); // Single student view

    console.log(`[Multi-Agency View API] GET request - User: ${userId}, Role: ${userRole}, Tenant: ${tenantId}`);

    // Build context for data router
    const context: any = {
      userId,
      tenantId,
      userRole,
      requestingSchoolWide: schoolWide,
      requestingAssigned: assigned,
    };

    // Call data router service to generate appropriate view
    const multiAgencyView = await dataRouterService.generateMultiAgencyView(
      userRole,
      context,
      {
        classId: classId || undefined,
        studentId: studentId || undefined,
      }
    );

    // Log data access for GDPR audit trail
    await prisma.dataAccessLog.create({
      data: {
        user_id: userId,
        tenant_id: tenantId,
        student_id: studentId || null,
        access_type: 'multi_agency_view',
        data_accessed: `Multi-agency view: ${userRole} accessed ${multiAgencyView.students?.length || 0} students`,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      },
    });

    // Build response
    const response: MultiAgencyViewResponse = {
      userRole: multiAgencyView.userRole,
      accessLevel: multiAgencyView.accessLevel,
      students: multiAgencyView.students || [],
      summary: {
        totalStudents: multiAgencyView.totalStudents || 0,
        accessibleStudents: multiAgencyView.accessibleStudents || 0,
        dataTransformationsApplied: multiAgencyView.dataTransformations || [],
      },
      allowedActions: multiAgencyView.allowedActions || [],
    };

    console.log(`[Multi-Agency View API] Generated view - Role: ${userRole}, Students: ${response.students.length}, Access Level: ${response.accessLevel}`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Multi-Agency View API] Error generating view:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
