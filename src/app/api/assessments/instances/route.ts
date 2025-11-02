/**
 * Assessment Instances API
 * Handles creation, updating, and retrieval of evidence-based assessment instances
 *
 * Security:
 * - Authentication required
 * - Role-based access control
 * - Audit logging (GDPR-compliant)
 * - Data ownership principles
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authorizeRequest, Permission } from '@/lib/middleware/auth';
import { apiRateLimit } from '@/lib/middleware/rate-limit';
import { auditLogger, getIpAddress, getRequestId } from '@/lib/security/audit-logger';

const prisma = new PrismaClient();

/**
 * Assessment Instance Creation Schema
 */
const CreateAssessmentInstanceSchema = z.object({
  tenant_id: z.number().positive(),
  framework_id: z.string(),
  case_id: z.number().positive(),
  student_id: z.number().positive(),
  conducted_by: z.number().positive(),

  // Optional fields
  title: z.string().optional(),
  assessment_date: z.string().datetime().optional(),

  // Assessment data
  context_review: z.any().optional(),
  domains: z.record(z.any()).optional(),
  collaborative_input: z.any().optional(),
  ep_summary: z.string().optional(),
  ep_interpretation: z.string().optional(),
  ep_recommendations_text: z.string().optional(),

  status: z.enum(['draft', 'in_progress', 'collaborative_input', 'interpretation', 'completed']).default('draft'),
});

/**
 * Assessment Instance Update Schema
 */
const UpdateAssessmentInstanceSchema = z.object({
  id: z.string(),

  // Updatable fields
  title: z.string().optional(),
  assessment_date: z.string().datetime().optional(),
  context_review: z.any().optional(),
  domains: z.record(z.any()).optional(),
  collaborative_input: z.any().optional(),
  ep_summary: z.string().optional(),
  ep_interpretation: z.string().optional(),
  ep_recommendations_text: z.string().optional(),
  linked_ehcp_id: z.string().optional(),

  status: z.enum(['draft', 'in_progress', 'collaborative_input', 'interpretation', 'completed']).optional(),
  completed_at: z.string().datetime().optional(),
  progress_percentage: z.number().min(0).max(100).optional(),
});

/**
 * GET /api/assessments/instances
 * List assessment instances with filters
 */
export async function GET(request: NextRequest) {
  const ipAddress = getIpAddress(request);
  const requestId = getRequestId(request);

  try {
    // 1. Rate limiting
    const rateLimitResult = await apiRateLimit(request);
    if (!rateLimitResult.allowed && rateLimitResult.response) {
      return rateLimitResult.response;
    }

    // 2. Authentication and authorization
    const authResult = await authorizeRequest(request, Permission.VIEW_ASSESSMENTS);
    if (!authResult.success) {
      return authResult.response;
    }

    const { session } = authResult;
    const { user } = session;

    // 3. Parse query parameters
    const { searchParams } = new URL(request.url);
    const tenant_id = searchParams.get('tenant_id');
    const case_id = searchParams.get('case_id');
    const student_id = searchParams.get('student_id');
    const status = searchParams.get('status');
    const framework_id = searchParams.get('framework_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // 4. Build where clause
    const where: any = {};
    if (tenant_id) where.tenant_id = parseInt(tenant_id);
    if (case_id) where.case_id = parseInt(case_id);
    if (student_id) where.student_id = parseInt(student_id);
    if (status) where.status = status;
    if (framework_id) where.framework_id = framework_id;

    // 5. Execute query
    const [instances, totalCount] = await Promise.all([
      prisma.assessmentInstance.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          framework: {
            select: {
              name: true,
              abbreviation: true,
              domain: true,
            },
          },
        },
      }),
      prisma.assessmentInstance.count({ where }),
    ]);

    // 6. Audit logging
    await auditLogger.logBulkDataAccess(
      user.id,
      user.email,
      'AssessmentInstance',
      totalCount,
      { tenant_id, case_id, student_id, status, framework_id },
      ipAddress,
      requestId
    );

    // 7. Calculate pagination
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      instances,
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
    console.error('[Assessment Instances API] Error fetching instances:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve assessment instances',
        message: error instanceof Error ? error.message : 'Unknown error',
        requestId,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/assessments/instances
 * Create new assessment instance
 */
export async function POST(request: NextRequest) {
  const ipAddress = getIpAddress(request);
  const requestId = getRequestId(request);

  try {
    // 1. Rate limiting
    const rateLimitResult = await apiRateLimit(request);
    if (!rateLimitResult.allowed && rateLimitResult.response) {
      return rateLimitResult.response;
    }

    // 2. Authentication and authorization
    const authResult = await authorizeRequest(request, Permission.CREATE_ASSESSMENTS);
    if (!authResult.success) {
      return authResult.response;
    }

    const { session } = authResult;
    const { user } = session;

    // 3. Parse and validate request body
    const body = await request.json();
    const validation = CreateAssessmentInstanceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid assessment instance data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const data = validation.data;

    // 4. Security: Verify tenant access (TODO: implement tenant check)

    // 5. Create assessment instance
    const instance = await prisma.assessmentInstance.create({
      data: {
        tenant_id: data.tenant_id,
        framework_id: data.framework_id,
        case_id: data.case_id,
        student_id: data.student_id,
        conducted_by: data.conducted_by,
        title: data.title,
        assessment_date: data.assessment_date ? new Date(data.assessment_date) : null,
        status: data.status,
        progress_percentage: 0,

        // Assessment data (stored as JSON)
        context_review: data.context_review || {},
        domains: data.domains || {},
        collaborative_input: data.collaborative_input || {},
        ep_summary: data.ep_summary,
        ep_interpretation: data.ep_interpretation,
        ep_recommendations_text: data.ep_recommendations_text,

        // Input tracking flags
        parent_input_requested: false,
        parent_input_received: false,
        teacher_input_requested: false,
        teacher_input_received: false,
        child_input_requested: false,
        child_input_received: false,

        created_at: new Date(),
        updated_at: new Date(),
      },
      include: {
        framework: {
          select: {
            name: true,
            abbreviation: true,
          },
        },
      },
    });

    // 6. Audit logging
    await auditLogger.logDataAccess(
      user.id,
      user.email,
      'CREATE',
      'AssessmentInstance',
      instance.id,
      {
        framework_id: data.framework_id,
        case_id: data.case_id,
        student_id: data.student_id,
      },
      ipAddress,
      requestId
    );

    return NextResponse.json(
      { instance, message: 'Assessment instance created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Assessment Instances API] Error creating instance:', error);
    return NextResponse.json(
      {
        error: 'Failed to create assessment instance',
        message: error instanceof Error ? error.message : 'Unknown error',
        requestId,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/assessments/instances
 * Update existing assessment instance
 */
export async function PUT(request: NextRequest) {
  const ipAddress = getIpAddress(request);
  const requestId = getRequestId(request);

  try {
    // 1. Rate limiting
    const rateLimitResult = await apiRateLimit(request);
    if (!rateLimitResult.allowed && rateLimitResult.response) {
      return rateLimitResult.response;
    }

    // 2. Authentication and authorization
    const authResult = await authorizeRequest(request, Permission.EDIT_ASSESSMENTS);
    if (!authResult.success) {
      return authResult.response;
    }

    const { session } = authResult;
    const { user } = session;

    // 3. Parse and validate request body
    const body = await request.json();
    const validation = UpdateAssessmentInstanceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid assessment instance data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { id, ...updateData } = validation.data;

    // 4. Security: Verify user owns this instance (TODO: implement ownership check)

    // 5. Calculate progress percentage if not provided
    let progress_percentage = updateData.progress_percentage;
    if (progress_percentage === undefined) {
      // Simple calculation based on completed sections
      let completed = 0;
      let total = 5; // context, domains, collaborative, interpretation, recommendations

      if (updateData.context_review && Object.keys(updateData.context_review).length > 0) completed++;
      if (updateData.domains && Object.keys(updateData.domains).length > 0) completed++;
      if (updateData.collaborative_input && Object.keys(updateData.collaborative_input).length > 0) completed++;
      if (updateData.ep_interpretation) completed++;
      if (updateData.ep_recommendations_text) completed++;

      progress_percentage = Math.round((completed / total) * 100);
    }

    // 6. Update assessment instance
    const instance = await prisma.assessmentInstance.update({
      where: { id },
      data: {
        ...updateData,
        progress_percentage,
        assessment_date: updateData.assessment_date ? new Date(updateData.assessment_date) : undefined,
        completed_at: updateData.completed_at ? new Date(updateData.completed_at) : undefined,
        updated_at: new Date(),
      },
      include: {
        framework: {
          select: {
            name: true,
            abbreviation: true,
          },
        },
      },
    });

    // 7. Audit logging
    await auditLogger.logDataAccess(
      user.id,
      user.email,
      'UPDATE',
      'AssessmentInstance',
      instance.id,
      { status: updateData.status, progress_percentage },
      ipAddress,
      requestId
    );

    return NextResponse.json({
      instance,
      message: 'Assessment instance updated successfully',
    });
  } catch (error) {
    console.error('[Assessment Instances API] Error updating instance:', error);
    return NextResponse.json(
      {
        error: 'Failed to update assessment instance',
        message: error instanceof Error ? error.message : 'Unknown error',
        requestId,
      },
      { status: 500 }
    );
  }
}
