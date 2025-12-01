/**
 * Intervention API Routes - Enterprise-grade implementation
 * Phase 3.3: Intervention Designer
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
import { authorizeRequest, Permission, canAccessTenant } from '@/lib/middleware/auth';
import { apiRateLimit } from '@/lib/middleware/rate-limit';
import { auditLogger, getIpAddress, getRequestId, getUserAgent } from '@/lib/security/audit-logger';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

/**
 * Intervention Query Schema - Validation
 */
const InterventionQuerySchema = z.object({
  tenant_id: z.string().optional(),
  case_id: z.string().optional(),
  status: z.enum(['planned', 'active', 'completed', 'discontinued']).optional(),
  intervention_type: z.string().optional(),
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
});

/**
 * Intervention Creation Schema - Validation
 */
const CreateInterventionSchema = z.object({
  tenant_id: z.number().positive(),
  case_id: z.number().positive(),
  intervention_type: z.enum([
    'academic_support',
    'behavioral_intervention',
    'speech_therapy',
    'occupational_therapy',
    'counseling',
    'social_skills',
    'assistive_technology',
    'curriculum_modification',
    'environmental_adjustment',
    'other',
  ]),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  status: z.enum(['planned', 'active', 'completed', 'discontinued']).default('planned'),
});

/**
 * GET /api/interventions
 * Retrieve intervention list with filters and pagination
 *
 * Security:
 * - Authentication required
 * - Permission: VIEW_INTERVENTIONS
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
    const authResult = await authorizeRequest(request, Permission.VIEW_INTERVENTIONS);
    if (!authResult.success) {
      return authResult.response;
    }

    const { session } = authResult;
    const { user } = session;

    // 3. Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const validation = InterventionQuerySchema.safeParse({
      tenant_id: searchParams.get('tenant_id'),
      case_id: searchParams.get('case_id'),
      status: searchParams.get('status'),
      intervention_type: searchParams.get('intervention_type'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { tenant_id, case_id, status, intervention_type, page, limit } = validation.data;

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
    if (intervention_type) {
      where.intervention_type = intervention_type;
    }

    // 5. Execute database query
    const [interventions, totalCount] = await Promise.all([
      prisma.interventions.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.interventions.count({ where }),
    ]);

    // 6. Audit logging (GDPR-compliant data access tracking)
    await auditLogger.logBulkDataAccess(
      user.id,
      user.email,
      'Intervention',
      totalCount,
      { tenant_id, case_id, status, intervention_type, page, limit },
      ipAddress,
      requestId
    );

    // 7. Calculate pagination
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      interventions,
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
    console._error('[Intervention API] Error fetching interventions:', _error);
    return NextResponse.json(
      {
        _error: 'Failed to retrieve interventions',
        message: _error instanceof Error ? _error.message : 'Unknown _error',
        requestId,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/interventions
 * Create new intervention
 *
 * Security:
 * - Authentication required
 * - Permission: CREATE_INTERVENTIONS
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
    const authResult = await authorizeRequest(request, Permission.CREATE_INTERVENTIONS);
    if (!authResult.success) {
      return authResult.response;
    }

    const { session } = authResult;
    const { user } = session;

    // 3. Parse and validate request body
    const body = await request.json();
    const validation = CreateInterventionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid intervention data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { tenant_id, case_id, intervention_type, start_date, end_date, status } = validation.data;

    // 4. Security: Enforce tenant isolation (GDPR compliance)
    if (!canAccessTenant(user.tenant_id, tenant_id, user.role)) {
      await auditLogger.logUnauthorizedAccess(
        user.id,
        'CREATE_INTERVENTION',
        'Intervention',
        `tenant_${tenant_id}`,
        ipAddress,
        getUserAgent(request),
        requestId
      );
      return NextResponse.json(
        { error: 'Access denied. You cannot create interventions for other institutions.' },
        { status: 403 }
      );
    }

    // 5. Create intervention in database
    const intervention = await prisma.interventions.create({
      data: {
        tenant_id,
        case_id,
        intervention_type,
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
        status,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // 6. Audit logging (GDPR-compliant creation tracking)
    await auditLogger.logDataAccess(
      user.id,
      user.email,
      'CREATE',
      'Intervention',
      intervention.id.toString(),
      {
        tenant_id,
        case_id,
        intervention_type,
        status,
      },
      ipAddress,
      requestId
    );

    return NextResponse.json(
      { intervention, message: 'Intervention created successfully' },
      { status: 201 }
    );
  } catch (_error) {
    console._error('[Intervention API] Error creating intervention:', _error);
    return NextResponse.json(
      {
        _error: 'Failed to create intervention',
        message: _error instanceof Error ? _error.message : 'Unknown _error',
        requestId,
      },
      { status: 500 }
    );
  }
}
