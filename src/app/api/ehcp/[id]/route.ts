/**
 * EHCP Individual Document API Routes - Enterprise-grade implementation
 * Phase 3.1: EHCP Support System
 *
 * Endpoints:
 * - GET /api/ehcp/[id] - Retrieve single EHCP
 * - PUT /api/ehcp/[id] - Update EHCP
 * - DELETE /api/ehcp/[id] - Delete EHCP (soft delete)
 *
 * Features:
 * - Role-based access control (RBAC)
 * - Rate limiting protection
 * - Comprehensive audit logging (GDPR-compliant)
 * - Input validation with Zod
 * - Multi-tenancy support
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';
import { authenticateRequest, authorizeRequest, Permission, canAccessTenant } from '@/lib/middleware/auth';
import { ehcpRateLimit } from '@/lib/middleware/rate-limit';
import { auditLogger, getIpAddress, getRequestId, getUserAgent } from '@/lib/security/audit-logger';

const prisma = new PrismaClient();

type PlanDetails = Record<string, any>;

const snapshotPlanDetails = (details: PlanDetails): Prisma.JsonObject =>
  JSON.parse(JSON.stringify(details));

/**
 * EHCP Update Schema - Validation
 * Allows partial updates to any section
 */
const UpdateEHCPSchema = z.object({
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
    status: z.enum(['draft', 'submitted', 'issued', 'under_review', 'amended']).optional(),
    review_date: z.string().optional(),
    issue_date: z.string().optional(),
  }).optional(),
});

/**
 * GET /api/ehcp/[id]
 * Retrieve single EHCP by ID
 *
 * Security:
 * - Authentication required
 * - Permission: VIEW_EHCP
 * - Rate limited: 50 requests per 5 minutes
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
        { error: 'Invalid EHCP ID' },
        { status: 400 }
      );
    }

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

    // 3. Retrieve EHCP from database
    const ehcp = await prisma.ehcps.findUnique({
      where: { id: id },
    });

    if (!ehcp) {
      return NextResponse.json(
        { error: 'EHCP not found' },
        { status: 404 }
      );
    }

    // 4. Security: Enforce tenant isolation (GDPR compliance)
    if (!canAccessTenant(user.tenant_id, ehcp.tenant_id, user.role)) {
      await auditLogger.logUnauthorizedAccess(
        user.id,
        'VIEW_EHCP',
        'EHCP',
        id,
        ipAddress,
        getUserAgent(request),
        requestId
      );
      return NextResponse.json(
        { error: 'Access denied. You cannot view this EHCP.' },
        { status: 403 }
      );
    }

    // 5. Audit logging (GDPR-compliant data access tracking)
    await auditLogger.logEHCPEvent(
      user.id,
      user.email,
      'VIEWED',
      id,
      { tenant_id: ehcp.tenant_id },
      ipAddress,
      requestId
    );

    return NextResponse.json({
      ehcp,
      message: 'EHCP retrieved successfully',
    });
  } catch (error) {
    console.error('[EHCP API] Error fetching EHCP:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve EHCP',
        message: error instanceof Error ? error.message : 'Unknown error',
        requestId,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/ehcp/[id]
 * Update existing EHCP
 *
 * Security:
 * - Authentication required
 * - Permission: EDIT_EHCP
 * - Rate limited: 50 requests per 5 minutes
 * - Audit logged (GDPR-compliant)
 * - Version history tracking
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
        { error: 'Invalid EHCP ID' },
        { status: 400 }
      );
    }

    // 1. Rate limiting check
    const rateLimitResult = await ehcpRateLimit(request);
    if (!rateLimitResult.allowed && rateLimitResult.response) {
      return rateLimitResult.response;
    }

    // 2. Authentication and authorization check
    const authResult = await authorizeRequest(request, Permission.EDIT_EHCP);
    if (!authResult.success) {
      return authResult.response;
    }

    const { session } = authResult;
    const { user } = session;

    // 3. Parse and validate request body
    const body = await request.json();
    const validation = UpdateEHCPSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid EHCP data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { plan_details } = validation.data;

    // 4. Check if EHCP exists
    const existingEHCP = await prisma.ehcps.findUnique({
      where: { id: id },
    });

    if (!existingEHCP) {
      return NextResponse.json(
        { error: 'EHCP not found' },
        { status: 404 }
      );
    }

    // 5. Security: Enforce tenant isolation (GDPR compliance)
    if (!canAccessTenant(user.tenant_id, existingEHCP.tenant_id, user.role)) {
      await auditLogger.logUnauthorizedAccess(
        user.id,
        'EDIT_EHCP',
        'EHCP',
        id,
        ipAddress,
        getUserAgent(request),
        requestId
      );
      return NextResponse.json(
        { error: 'Access denied. You cannot edit this EHCP.' },
        { status: 403 }
      );
    }

    // 6. Merge existing plan_details with updates (deep merge)
    const updatedPlanDetails = {
      ...(existingEHCP.plan_details as object),
      ...(plan_details as object),
    };

    // 7. Update EHCP in database
    const updatedEHCP = await prisma.ehcps.update({
      where: { id: id },
      data: {
        plan_details: updatedPlanDetails,
        updated_at: new Date(),
      },
    });

    const planDetailsSnapshot = snapshotPlanDetails(updatedPlanDetails as PlanDetails);
    const updatedSections = plan_details ? Object.keys(plan_details) : [];
    const versionStatus =
      (planDetailsSnapshot as { status?: string }).status ?? 'updated';
    const changeSummary = updatedSections.length
      ? `Updated sections: ${updatedSections.join(', ')}`
      : 'Updated EHCP metadata';

    await prisma.ehcp_versions.create({
      data: {
        ehcp_id: updatedEHCP.id,
        tenant_id: updatedEHCP.tenant_id,
        created_by_id: user.id,
        status: versionStatus,
        plan_details: planDetailsSnapshot,
        change_summary: changeSummary,
      },
    });

    // 8. Audit logging (GDPR-compliant modification tracking)
    await auditLogger.logEHCPEvent(
      user.id,
      user.email,
      'UPDATED',
      id,
      {
        tenant_id: updatedEHCP.tenant_id,
        updated_sections: Object.keys(plan_details || {}),
      },
      ipAddress,
      requestId
    );

    // TODO: Add version history
    // Create version snapshot in ehcp_versions table for audit trail

    return NextResponse.json({
      ehcp: updatedEHCP,
      message: 'EHCP updated successfully',
    });
  } catch (error) {
    console.error('[EHCP API] Error updating EHCP:', error);
    return NextResponse.json(
      {
        error: 'Failed to update EHCP',
        message: error instanceof Error ? error.message : 'Unknown error',
        requestId,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ehcp/[id]
 * Delete EHCP (soft delete - mark as archived)
 *
 * Security:
 * - Authentication required
 * - Permission: DELETE_EHCP (RESTRICTED - high-level access only)
 * - Rate limited: 50 requests per 5 minutes
 * - Audit logged (CRITICAL security event - GDPR-compliant)
 *
 * Note: Soft delete preserves data for compliance and audit purposes
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
        { error: 'Invalid EHCP ID' },
        { status: 400 }
      );
    }

    // 1. Rate limiting check
    const rateLimitResult = await ehcpRateLimit(request);
    if (!rateLimitResult.allowed && rateLimitResult.response) {
      return rateLimitResult.response;
    }

    // 2. Authentication and authorization check (STRICT)
    // Only SYSTEM_ADMIN, INSTITUTION_ADMIN can delete EHCPs
    const authResult = await authorizeRequest(request, Permission.DELETE_EHCP);
    if (!authResult.success) {
      return authResult.response;
    }

    const { session } = authResult;
    const { user } = session;

    // 3. Check if EHCP exists
    const existingEHCP = await prisma.ehcps.findUnique({
      where: { id: id },
    });

    if (!existingEHCP) {
      return NextResponse.json(
        { error: 'EHCP not found' },
        { status: 404 }
      );
    }

    // 4. Security: Enforce tenant isolation (GDPR compliance - CRITICAL)
    if (!canAccessTenant(user.tenant_id, existingEHCP.tenant_id, user.role)) {
      await auditLogger.logUnauthorizedAccess(
        user.id,
        'DELETE_EHCP',
        'EHCP',
        id,
        ipAddress,
        getUserAgent(request),
        requestId
      );
      return NextResponse.json(
        { error: 'Access denied. You cannot delete this EHCP.' },
        { status: 403 }
      );
    }

    // 5. Soft delete - update status to preserve data for compliance
    // Note: Using status field instead of archived_at (field doesn't exist in current schema)
    const archivedPlanDetails: PlanDetails = {
      ...(existingEHCP.plan_details as any),
      status: 'archived',
    };

    const archivedEHCP = await prisma.ehcps.update({
      where: { id: id },
      data: {
        plan_details: archivedPlanDetails,
        updated_at: new Date(),
      },
    });

    await prisma.ehcp_versions.create({
      data: {
        ehcp_id: archivedEHCP.id,
        tenant_id: archivedEHCP.tenant_id,
        created_by_id: user.id,
        status: 'archived',
        plan_details: snapshotPlanDetails(archivedPlanDetails),
        change_summary: 'Recorded EHCP soft delete',
      },
    });

    // 6. Audit logging (CRITICAL security event - GDPR-compliant)
    await auditLogger.logEHCPEvent(
      user.id,
      user.email,
      'DELETED',
      id,
      {
        tenant_id: existingEHCP.tenant_id,
        student_id: existingEHCP.student_id,
        reason: 'Administrative deletion',
      },
      ipAddress,
      requestId
    );

    return NextResponse.json({
      message: 'EHCP archived successfully',
      ehcp: archivedEHCP,
    });
  } catch (error) {
    console.error('[EHCP API] Error deleting EHCP:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete EHCP',
        message: error instanceof Error ? error.message : 'Unknown error',
        requestId,
      },
      { status: 500 }
    );
  }
}
