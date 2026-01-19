/**
 * Cases API Routes - Enterprise-grade implementation
 * Phase 3: Core SEND Functionality
 *
 * Features:
 * - Role-based access control (RBAC)
 * - Rate limiting protection
 * - Comprehensive audit logging (GDPR-compliant)
 * - Input validation with Zod
 * - Multi-tenancy support with strict tenant isolation
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authorizeRequest, Permission, canAccessTenant } from '@/lib/middleware/auth';
import { apiRateLimit } from '@/lib/middleware/rate-limit';
import { auditLogger, getIpAddress, getRequestId, getUserAgent } from '@/lib/security/audit-logger';
import { prisma } from '@/lib/prisma';
import { createEvidenceTraceId, recordEvidenceEvent, type EvidenceStatus } from '@/lib/analytics/evidence-telemetry';

export const dynamic = 'force-dynamic';

/**
 * Case Query Schema - Validation
 */
const CaseQuerySchema = z.object({
  tenant_id: z.string().optional(),
  student_id: z.string().optional(),
  status: z.enum(['new', 'assessment', 'intervention', 'review', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  type: z.string().optional(),
  assigned_to: z.string().optional(),
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
});

/**
 * Case Creation Schema - Validation
 */
const CreateCaseSchema = z.object({
  tenant_id: z.number().positive(),
  student_id: z.number().positive(),
  assigned_to: z.number().positive().optional(),
  status: z.enum(['new', 'assessment', 'intervention', 'review', 'closed']).default('new'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  type: z.enum([
    'initial_assessment',
    'statutory_assessment',
    'annual_review',
    'emergency_review',
    'safeguarding',
    'behavior_support',
    'transition',
    'other',
  ]),
  referral_date: z.string().datetime(),
});

/**
 * GET /api/cases
 * Retrieve case list with filters and pagination
 *
 * Security:
 * - Authentication required
 * - Permission: VIEW_STUDENT_DATA
 * - Rate limited: 100 requests per minute
 * - Audit logged (GDPR-compliant)
 * - Tenant isolation enforced
 */
export async function GET(request: NextRequest) {
  const ipAddress = getIpAddress(request);
  const requestId = getRequestId(request);
  const startedAt = Date.now();
  const traceId = createEvidenceTraceId();

  try {
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
    const recordTrace = async (
      status: EvidenceStatus,
      tenantId: number | undefined,
      userId: string,
      metadata?: Record<string, unknown>
    ) => {
      if (!tenantId) {
        return;
      }
      await recordEvidenceEvent({
        tenantId,
        userId: parseInt(userId, 10),
        traceId,
        requestId: requestId ?? traceId,
        eventType: 'case_list',
        workflowType: 'case_management',
        actionType: 'list_cases',
        status,
        durationMs: Date.now() - startedAt,
        evidenceType: 'measured',
        metadata,
      });
    };

    // 3. Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const validation = CaseQuerySchema.safeParse({
      tenant_id: searchParams.get('tenant_id'),
      student_id: searchParams.get('student_id'),
      status: searchParams.get('status'),
      priority: searchParams.get('priority'),
      type: searchParams.get('type'),
      assigned_to: searchParams.get('assigned_to'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    });

    if (!validation.success) {
      await recordTrace('error', user.tenant_id, user.id, { reason: 'validation_failed' });
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { tenant_id, student_id, status, priority, type, assigned_to, page, limit } = validation.data;

    // 4. Build where clause with tenant filtering (GDPR compliance)
    const where: any = {};

    // Enforce tenant isolation
    if (!canAccessTenant(user.tenant_id, tenant_id ? parseInt(tenant_id) : user.tenant_id, user.role)) {
      await auditLogger.logUnauthorizedAccess(
        user.id,
        'VIEW_CASES',
        'Case',
        tenant_id ? `tenant_${tenant_id}` : undefined,
        ipAddress,
        getUserAgent(request),
        requestId
      );
      await recordTrace('blocked', user.tenant_id, user.id, {
        reason: 'forbidden',
        tenant_id: tenant_id ? parseInt(tenant_id) : user.tenant_id,
      });
      return NextResponse.json(
        { error: 'Access denied. You cannot view cases from other institutions.' },
        { status: 403 }
      );
    }

    if (tenant_id) {
      where.tenant_id = parseInt(tenant_id);
    } else {
      // Default to user's tenant if not specified
      where.tenant_id = user.tenant_id;
    }

    if (student_id) where.student_id = parseInt(student_id);
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (type) where.type = type;
    if (assigned_to) where.assigned_to = parseInt(assigned_to);

    // 5. Execute database query
    const [cases, totalCount] = await Promise.all([
      prisma.cases.findMany({
        where,
        orderBy: { referral_date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
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
          _count: {
            select: { interventions: true },
          },
        },
      }),
      prisma.cases.count({ where }),
    ]);

    // 6. Audit logging (GDPR-compliant data access tracking)
    await auditLogger.logBulkDataAccess(
      user.id,
      user.email,
      'Case',
      totalCount,
      { tenant_id, student_id, status, priority, type, page, limit },
      ipAddress,
      requestId
    );

    await recordTrace('ok', user.tenant_id, user.id, {
      totalCount,
      page,
      limit,
      status,
      priority,
      type,
    });

    // 7. Calculate pagination
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      cases,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (_error) {
    console.error('[Case API] Error fetching cases:', _error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve cases',
        message: _error instanceof Error ? _error.message : 'Unknown error',
        requestId,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cases
 * Create new case
 *
 * Security:
 * - Authentication required
 * - Permission: EDIT_STUDENT_DATA
 * - Rate limited: 100 requests per minute
 * - Audit logged (GDPR-compliant)
 * - Tenant isolation enforced
 */
export async function POST(request: NextRequest) {
  const ipAddress = getIpAddress(request);
  const requestId = getRequestId(request);
  const startedAt = Date.now();
  const traceId = createEvidenceTraceId();
  const recordTrace = async (
    status: EvidenceStatus,
    tenantId: number,
    userId: string,
    metadata?: Record<string, unknown>
  ) => {
    await recordEvidenceEvent({
      tenantId,
      userId: parseInt(userId, 10),
      traceId,
      requestId: requestId ?? traceId,
      eventType: 'case_create',
      workflowType: 'case_management',
      actionType: 'create_case',
      status,
      durationMs: Date.now() - startedAt,
      evidenceType: 'measured',
      metadata,
    });
  };

  try {
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
    const validation = CreateCaseSchema.safeParse(body);

    if (!validation.success) {
      if (body?.tenant_id && user?.id) {
        await recordTrace('error', body.tenant_id, user.id, { reason: 'validation_failed' });
      }
      return NextResponse.json(
        { error: 'Invalid case data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { tenant_id, student_id, assigned_to, status, priority, type, referral_date } = validation.data;

    // 4. Security: Enforce tenant isolation (GDPR compliance)
    if (!canAccessTenant(user.tenant_id, tenant_id, user.role)) {
      await auditLogger.logUnauthorizedAccess(
        user.id,
        'CREATE_CASE',
        'Case',
        `tenant_${tenant_id}`,
        ipAddress,
        getUserAgent(request),
        requestId
      );
      await recordTrace('error', tenant_id, user.id, { reason: 'forbidden' });
      return NextResponse.json(
        { error: 'Access denied. You cannot create cases for other institutions.' },
        { status: 403 }
      );
    }

    // 5. Verify student exists and belongs to the same tenant
    const student = await prisma.students.findUnique({
      where: { id: student_id },
      select: { id: true, tenant_id: true },
    });

    if (!student) {
      await recordTrace('error', tenant_id, user.id, { reason: 'student_not_found', studentId: student_id });
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    if (student.tenant_id !== tenant_id) {
      await recordTrace('error', tenant_id, user.id, { reason: 'tenant_mismatch', studentId: student_id });
      return NextResponse.json(
        { error: 'Access denied. Student belongs to a different institution.' },
        { status: 403 }
      );
    }

    // 6. Create case in database
    const caseRecord = await prisma.cases.create({
      data: {
        tenant_id,
        student_id,
        assigned_to,
        status,
        priority,
        type,
        referral_date: new Date(referral_date),
        created_at: new Date(),
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

    // 7. Audit logging (GDPR-compliant creation tracking)
    await auditLogger.logDataAccess(
      user.id,
      user.email,
      'CREATE',
      'Case',
      caseRecord.id.toString(),
      {
        tenant_id,
        student_id,
        type,
        status,
        priority,
      },
      ipAddress,
      requestId
    );

    await recordTrace('ok', tenant_id, user.id, {
      caseId: caseRecord.id,
      studentId: student_id,
      status,
      priority,
      type,
    });

    return NextResponse.json(
      { case: caseRecord, message: 'Case created successfully' },
      { status: 201 }
    );
  } catch (_error) {
    console.error('[Case API] Error creating case:', _error);
    return NextResponse.json(
      {
        error: 'Failed to create case',
        message: _error instanceof Error ? _error.message : 'Unknown error',
        requestId,
      },
      { status: 500 }
    );
  }
}
