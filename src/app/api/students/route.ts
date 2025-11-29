/**
 * Students API Routes - Enterprise-grade implementation
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
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authorizeRequest, Permission, canAccessTenant } from '@/lib/middleware/auth';
import { apiRateLimit } from '@/lib/middleware/rate-limit';
import { auditLogger, getIpAddress, getRequestId, getUserAgent } from '@/lib/security/audit-logger';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

/**
 * Student Query Schema - Validation
 */
const StudentQuerySchema = z.object({
  tenant_id: z.string().optional(),
  year_group: z.string().optional(),
  sen_status: z.enum(['none', 'support', 'support_plus', 'ehcp']).optional(),
  search: z.string().optional(), // For name search
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
});

/**
 * Student Creation Schema - Validation
 */
const CreateStudentSchema = z.object({
  tenant_id: z.number().positive(),
  unique_id: z.string().min(1).max(50),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  date_of_birth: z.string().datetime(),
  year_group: z.string().min(1).max(20),
  sen_status: z.enum(['none', 'support', 'support_plus', 'ehcp']).optional(),
});

/**
 * GET /api/students
 * Retrieve student list with filters and pagination
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

    // 3. Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const validation = StudentQuerySchema.safeParse({
      tenant_id: searchParams.get('tenant_id'),
      year_group: searchParams.get('year_group'),
      sen_status: searchParams.get('sen_status'),
      search: searchParams.get('search'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { tenant_id, year_group, sen_status, search, page, limit } = validation.data;

    // 4. Build where clause with tenant filtering (GDPR compliance)
    const where: any = {};

    // Enforce tenant isolation
    if (!canAccessTenant(user.tenant_id, tenant_id ? parseInt(tenant_id) : user.tenant_id, user.role)) {
      await auditLogger.logUnauthorizedAccess(
        user.id,
        'VIEW_STUDENTS',
        'Student',
        tenant_id ? `tenant_${tenant_id}` : undefined,
        ipAddress,
        getUserAgent(request),
        requestId
      );
      return NextResponse.json(
        { error: 'Access denied. You cannot view students from other institutions.' },
        { status: 403 }
      );
    }

    if (tenant_id) {
      where.tenant_id = parseInt(tenant_id);
    } else {
      // Default to user's tenant if not specified
      where.tenant_id = user.tenant_id;
    }

    if (year_group) where.year_group = year_group;
    if (sen_status) where.sen_status = sen_status;

    // Name search
    if (search) {
      where.OR = [
        { first_name: { contains: search, mode: 'insensitive' } },
        { last_name: { contains: search, mode: 'insensitive' } },
        { unique_id: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 5. Execute database query
    const [students, totalCount] = await Promise.all([
      prisma.students.findMany({
        where,
        orderBy: [
          { year_group: 'asc' },
          { last_name: 'asc' },
          { first_name: 'asc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          cases: {
            select: {
              id: true,
              status: true,
              type: true,
              referral_date: true,
            },
            orderBy: { referral_date: 'desc' },
            take: 1, // Most recent case
          },
        },
      }),
      prisma.students.count({ where }),
    ]);

    // 6. Audit logging (GDPR-compliant data access tracking)
    await auditLogger.logBulkDataAccess(
      user.id,
      user.email,
      'Student',
      totalCount,
      { tenant_id, year_group, sen_status, search, page, limit },
      ipAddress,
      requestId
    );

    // 7. Calculate pagination
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      students,
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
    console.error('[Student API] Error fetching students:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve students',
        message: error instanceof Error ? error.message : 'Unknown error',
        requestId,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/students
 * Create new student
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
    const validation = CreateStudentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid student data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { tenant_id, unique_id, first_name, last_name, date_of_birth, year_group, sen_status } = validation.data;

    // 4. Security: Enforce tenant isolation (GDPR compliance)
    if (!canAccessTenant(user.tenant_id, tenant_id, user.role)) {
      await auditLogger.logUnauthorizedAccess(
        user.id,
        'CREATE_STUDENT',
        'Student',
        `tenant_${tenant_id}`,
        ipAddress,
        getUserAgent(request),
        requestId
      );
      return NextResponse.json(
        { error: 'Access denied. You cannot create students for other institutions.' },
        { status: 403 }
      );
    }

    // 5. Check if student with same unique_id already exists in this tenant
    const existingStudent = await prisma.students.findUnique({
      where: {
        tenant_id_unique_id: {
          tenant_id,
          unique_id,
        },
      },
    });

    if (existingStudent) {
      return NextResponse.json(
        { error: 'A student with this unique ID already exists in your institution.' },
        { status: 409 } // Conflict
      );
    }

    // 6. Create student in database
    const student = await prisma.students.create({
      data: {
        tenant_id,
        unique_id,
        first_name,
        last_name,
        date_of_birth: new Date(date_of_birth),
        year_group,
        sen_status: sen_status || 'none',
        created_at: new Date(),
        updated_at: new Date(),
      },
      include: {
        cases: {
          select: {
            id: true,
            status: true,
            type: true,
          },
        },
      },
    });

    // 7. Audit logging (GDPR-compliant creation tracking)
    await auditLogger.logDataAccess(
      user.id,
      user.email,
      'CREATE',
      'Student',
      student.id.toString(),
      {
        tenant_id,
        unique_id,
        first_name,
        last_name,
        sen_status,
      },
      ipAddress,
      requestId
    );

    return NextResponse.json(
      { student, message: 'Student created successfully' },
      { status: 201 }
    );
  } catch (_error) {
    console.error('[Student API] Error creating student:', error);
    return NextResponse.json(
      {
        error: 'Failed to create student',
        message: error instanceof Error ? error.message : 'Unknown error',
        requestId,
      },
      { status: 500 }
    );
  }
}
