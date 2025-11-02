/**
 * Assessment API Routes - Enterprise-grade implementation
 * Phase 3.2: Assessment Engine
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
import { auditLogger, getIpAddress, getRequestId } from '@/lib/security/audit-logger';

const prisma = new PrismaClient();

/**
 * Assessment Query Schema - Validation
 */
const AssessmentQuerySchema = z.object({
  tenant_id: z.string().optional(),
  case_id: z.string().optional(),
  status: z.enum(['pending', 'scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
  assessment_type: z.string().optional(),
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
});

/**
 * Assessment Creation Schema - Validation
 */
const CreateAssessmentSchema = z.object({
  tenant_id: z.number().positive(),
  case_id: z.number().positive(),
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
  ]),
  scheduled_date: z.string().datetime().optional(),
  status: z.enum(['pending', 'scheduled', 'in_progress', 'completed', 'cancelled']).default('pending'),
  created_by: z.number().optional(),
});

/**
 * GET /api/assessments
 * Retrieve assessment list with filters and pagination
 *
 * Security:
 * - Authentication required
 * - Permission: VIEW_ASSESSMENTS
 * - Rate limited: 100 requests per minute
 * - Audit logged (GDPR-compliant)
 */
export async function GET(request: NextRequest) {
  const ipAddress = getIpAddress(request);
  const requestId = getRequestId(request);

  try {
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

    // 3. Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const validation = AssessmentQuerySchema.safeParse({
      tenant_id: searchParams.get('tenant_id'),
      case_id: searchParams.get('case_id'),
      status: searchParams.get('status'),
      assessment_type: searchParams.get('assessment_type'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { tenant_id, case_id, status, assessment_type, page, limit } = validation.data;

    // 4. Build where clause with tenant filtering
    const where: any = {};
    if (tenant_id) {
      where.tenant_id = parseInt(tenant_id);
    }
    if (case_id) {
      where.case_id = parseInt(case_id);
    }
    if (status) {
      where.status = status;
    }
    if (assessment_type) {
      where.assessment_type = assessment_type;
    }

    // 5. Execute database query
    const [assessments, totalCount] = await Promise.all([
      prisma.assessments.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.assessments.count({ where }),
    ]);

    // 6. Audit logging (GDPR-compliant data access tracking)
    await auditLogger.logBulkDataAccess(
      user.id,
      user.email,
      'Assessment',
      totalCount,
      { tenant_id, case_id, status, assessment_type, page, limit },
      ipAddress,
      requestId
    );

    // 7. Calculate pagination
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      assessments,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error('[Assessment API] Error fetching assessments:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve assessments',
        message: error instanceof Error ? error.message : 'Unknown error',
        requestId,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/assessments
 * Create new assessment
 *
 * Security:
 * - Authentication required
 * - Permission: CREATE_ASSESSMENTS
 * - Rate limited: 100 requests per minute
 * - Audit logged (GDPR-compliant)
 */
export async function POST(request: NextRequest) {
  const ipAddress = getIpAddress(request);
  const requestId = getRequestId(request);

  try {
    // 1. Rate limiting check
    const rateLimitResult = await apiRateLimit(request);
    if (!rateLimitResult.allowed && rateLimitResult.response) {
      return rateLimitResult.response;
    }

    // 2. Authentication and authorization check
    const authResult = await authorizeRequest(request, Permission.CREATE_ASSESSMENTS);
    if (!authResult.success) {
      return authResult.response;
    }

    const { session } = authResult;
    const { user } = session;

    // 3. Parse and validate request body
    const body = await request.json();
    const validation = CreateAssessmentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid assessment data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { tenant_id, case_id, assessment_type, scheduled_date, status, created_by } = validation.data;

    // 4. Security: Verify tenant access
    // TODO: Ensure user can only create assessments for their own tenant
    // if (!hasPermission(user.role, Permission.VIEW_ALL_DATA)) {
    //   if (tenant_id !== user.tenant_id) {
    //     return NextResponse.json(
    //       { error: 'Access denied. You cannot create assessments for other institutions.' },
    //       { status: 403 }
    //     );
    //   }
    // }

    // 5. Create assessment in database
    const assessment = await prisma.assessments.create({
      data: {
        tenant_id,
        case_id,
        assessment_type,
        scheduled_date: scheduled_date ? new Date(scheduled_date) : null,
        status,
        created_by: created_by || parseInt(user.id),
        created_at: new Date(),
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

    // 6. Audit logging (GDPR-compliant creation tracking)
    await auditLogger.logDataAccess(
      user.id,
      user.email,
      'CREATE',
      'Assessment',
      assessment.id.toString(),
      {
        tenant_id,
        case_id,
        assessment_type,
        status,
      },
      ipAddress,
      requestId
    );

    return NextResponse.json(
      { assessment, message: 'Assessment created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Assessment API] Error creating assessment:', error);
    return NextResponse.json(
      {
        error: 'Failed to create assessment',
        message: error instanceof Error ? error.message : 'Unknown error',
        requestId,
      },
      { status: 500 }
    );
  }
}
