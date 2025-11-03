/**
 * EHCP API Routes - Enterprise-grade implementation
 * Phase 3.1: EHCP Support System
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
import { authenticateRequest, authorizeRequest, Permission, canAccessTenant } from '@/lib/middleware/auth';
import { ehcpRateLimit } from '@/lib/middleware/rate-limit';
import { auditLogger, getIpAddress, getRequestId, getUserAgent } from '@/lib/security/audit-logger';

const prisma = new PrismaClient();

/**
 * EHCP Query Schema - Validation
 */
const EHCPQuerySchema = z.object({
  tenant_id: z.string().optional(),
  student_id: z.string().optional(),
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
});

/**
 * EHCP Creation Schema - Validation
 */
const CreateEHCPSchema = z.object({
  tenant_id: z.number().positive(),
  student_id: z.string().cuid(),
  plan_details: z.object({
    // Section A: The Views, Interests and Aspirations of the Child and Their Parents
    section_a: z.object({
      child_views: z.string().min(1),
      parent_views: z.string().min(1),
      aspirations: z.string().min(1),
    }).optional(),

    // Section B: Special Educational Needs
    section_b: z.object({
      primary_need: z.string().min(1),
      secondary_needs: z.array(z.string()).optional(),
      description: z.string().min(1),
    }).optional(),

    // Section C: Health Needs
    section_c: z.object({
      health_needs: z.string().optional(),
      medical_conditions: z.array(z.string()).optional(),
    }).optional(),

    // Section D: Social Care Needs
    section_d: z.object({
      social_care_needs: z.string().optional(),
    }).optional(),

    // Section E: Outcomes
    section_e: z.object({
      outcomes: z.array(z.object({
        area: z.string(),
        target: z.string(),
        success_criteria: z.string(),
      })),
    }).optional(),

    // Section F: Special Educational Provision
    section_f: z.object({
      provision: z.array(z.object({
        need: z.string(),
        provision: z.string(),
        provider: z.string(),
        frequency: z.string(),
      })),
    }).optional(),

    // Section G: Health Provision
    section_g: z.object({
      health_provision: z.array(z.object({
        need: z.string(),
        provision: z.string(),
        provider: z.string(),
      })).optional(),
    }).optional(),

    // Section H: Social Care Provision
    section_h: z.object({
      social_care_provision: z.string().optional(),
    }).optional(),

    // Section I: Placement
    section_i: z.object({
      placement_type: z.enum(['mainstream', 'special', 'independent', 'resourced']),
      school_name: z.string().optional(),
      urn: z.string().optional(),
    }).optional(),

    // Section J: Personal Budget
    section_j: z.object({
      personal_budget: z.boolean().default(false),
      budget_details: z.string().optional(),
    }).optional(),

    // Section K: Advice and Information
    section_k: z.object({
      advice_sources: z.array(z.object({
        source: z.string(),
        date: z.string(),
        summary: z.string(),
      })).optional(),
    }).optional(),

    // Metadata
    status: z.enum(['draft', 'submitted', 'issued', 'under_review', 'amended']).default('draft'),
    review_date: z.string().optional(),
    issue_date: z.string().optional(),
  }),
});

/**
 * GET /api/ehcp
 * Retrieve EHCP list with filters and pagination
 *
 * Security:
 * - Authentication required
 * - Permission: VIEW_EHCP
 * - Rate limited: 50 requests per 5 minutes
 * - Audit logged (GDPR-compliant)
 */
export async function GET(request: NextRequest) {
  const ipAddress = getIpAddress(request);
  const requestId = getRequestId(request);

  try {
    // 1. Rate limiting check
    const rateLimitResult = await ehcpRateLimit(request);
    if (!rateLimitResult.allowed && rateLimitResult.response) {
      return rateLimitResult.response;
    }

    // 2. Authentication and authorization check
    const authResult = await authorizeRequest(request, Permission.VIEW_EHCP);
    if (!authResult.success) {
      return authResult.response;
    }

    const { session } = authResult;
    const { user } = session;

    // 3. Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const validation = EHCPQuerySchema.safeParse({
      tenant_id: searchParams.get('tenant_id'),
      student_id: searchParams.get('student_id'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { tenant_id, student_id, page, limit } = validation.data;

    // 4. Build where clause with tenant filtering (GDPR compliance)
    // Users can only see EHCPs from their own tenant (unless SYSTEM_ADMIN)
    const where: any = {};

    // Enforce tenant isolation
    if (!canAccessTenant(user.tenant_id, tenant_id ? parseInt(tenant_id) : user.tenant_id, user.role)) {
      await auditLogger.logUnauthorizedAccess(
        user.id,
        'VIEW_EHCP',
        'EHCP',
        tenant_id ? `tenant_${tenant_id}` : undefined,
        ipAddress,
        getUserAgent(request),
        requestId
      );
      return NextResponse.json(
        { error: 'Access denied. You cannot view EHCPs from other institutions.' },
        { status: 403 }
      );
    }

    if (tenant_id) {
      where.tenant_id = parseInt(tenant_id);
    } else {
      // Default to user's tenant if not specified
      where.tenant_id = user.tenant_id;
    }

    if (student_id) where.student_id = student_id;

    // 5. Execute database query
    const [ehcps, totalCount] = await Promise.all([
      prisma.ehcps.findMany({
        where,
        orderBy: { updated_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.ehcps.count({ where }),
    ]);

    // 6. Audit logging (GDPR-compliant data access tracking)
    await auditLogger.logBulkDataAccess(
      user.id,
      user.email,
      'EHCP',
      totalCount,
      { tenant_id, student_id, page, limit },
      ipAddress,
      requestId
    );

    // 7. Calculate pagination
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      ehcps,
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
    console.error('[EHCP API] Error fetching EHCPs:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve EHCPs',
        message: error instanceof Error ? error.message : 'Unknown error',
        requestId,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ehcp
 * Create new EHCP
 *
 * Security:
 * - Authentication required
 * - Permission: CREATE_EHCP
 * - Rate limited: 50 requests per 5 minutes
 * - Audit logged (GDPR-compliant)
 */
export async function POST(request: NextRequest) {
  const ipAddress = getIpAddress(request);
  const requestId = getRequestId(request);

  try {
    // 1. Rate limiting check
    const rateLimitResult = await ehcpRateLimit(request);
    if (!rateLimitResult.allowed && rateLimitResult.response) {
      return rateLimitResult.response;
    }

    // 2. Authentication and authorization check
    const authResult = await authorizeRequest(request, Permission.CREATE_EHCP);
    if (!authResult.success) {
      return authResult.response;
    }

    const { session } = authResult;
    const { user } = session;

    // 3. Parse and validate request body
    const body = await request.json();
    const validation = CreateEHCPSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid EHCP data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { tenant_id, student_id, plan_details } = validation.data;

    // 4. Security: Enforce tenant isolation (GDPR compliance)
    if (!canAccessTenant(user.tenant_id, tenant_id, user.role)) {
      await auditLogger.logUnauthorizedAccess(
        user.id,
        'CREATE_EHCP',
        'EHCP',
        `tenant_${tenant_id}`,
        ipAddress,
        getUserAgent(request),
        requestId
      );
      return NextResponse.json(
        { error: 'Access denied. You cannot create EHCPs for other institutions.' },
        { status: 403 }
      );
    }

    // 5. Create EHCP in database
    const ehcp = await prisma.ehcps.create({
      data: {
        tenant_id,
        student_id,
        plan_details,
        issued_at: new Date(),
        updated_at: new Date(),
      },
    });

    // 6. Audit logging (GDPR-compliant creation tracking)
    await auditLogger.logEHCPEvent(
      user.id,
      user.email,
      'CREATED',
      ehcp.id.toString(),
      {
        tenant_id,
        student_id,
        status: plan_details.status,
      },
      ipAddress,
      requestId
    );

    return NextResponse.json(
      { ehcp, message: 'EHCP created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('[EHCP API] Error creating EHCP:', error);
    return NextResponse.json(
      {
        error: 'Failed to create EHCP',
        message: error instanceof Error ? error.message : 'Unknown error',
        requestId,
      },
      { status: 500 }
    );
  }
}
