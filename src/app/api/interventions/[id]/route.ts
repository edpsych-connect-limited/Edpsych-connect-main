/**
 * Intervention Individual API Routes - Enterprise-grade implementation
 * Phase 3.3: Intervention Designer
 *
 * Endpoints:
 * - GET /api/interventions/[id] - Retrieve single intervention
 * - PATCH /api/interventions/[id] - Update intervention
 * - DELETE /api/interventions/[id] - Delete/discontinue intervention
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
 * Intervention Update Schema - Validation
 */
const UpdateInterventionSchema = z.object({
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
  ]).optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  status: z.enum(['planned', 'active', 'completed', 'discontinued']).optional(),
});

/**
 * GET /api/interventions/[id]
 * Retrieve single intervention by ID
 *
 * Security:
 * - Authentication required
 * - Permission: VIEW_INTERVENTIONS
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
        { error: 'Invalid intervention ID' },
        { status: 400 }
      );
    }

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

    // 3. Retrieve intervention from database
    const intervention = await prisma.interventions.findUnique({
      where: { id: parseInt(id) },
      include: {
        cases: {
          select: {
            id: true,
            status: true,
            type: true,
            student_id: true,
            students: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
              },
            },
          },
        },
      },
    });

    if (!intervention) {
      return NextResponse.json(
        { error: 'Intervention not found' },
        { status: 404 }
      );
    }

    // 4. Security: Enforce tenant isolation (GDPR compliance)
    if (!canAccessTenant(user.tenant_id, intervention.tenant_id, user.role)) {
      await auditLogger.logUnauthorizedAccess(
        user.id,
        'VIEW_INTERVENTION',
        'Intervention',
        id,
        ipAddress,
        getUserAgent(request),
        requestId
      );
      return NextResponse.json(
        { error: 'Access denied. You cannot view this intervention.' },
        { status: 403 }
      );
    }

    // 5. Audit logging (GDPR-compliant data access tracking)
    await auditLogger.logDataAccess(
      user.id,
      user.email,
      'READ',
      'Intervention',
      id,
      { tenant_id: intervention.tenant_id, case_id: intervention.case_id },
      ipAddress,
      requestId
    );

    return NextResponse.json({
      intervention,
      message: 'Intervention retrieved successfully',
    });
  } catch (_error) {
    console._error('[Intervention API] Error fetching intervention:', _error);
    return NextResponse.json(
      {
        _error: 'Failed to retrieve intervention',
        message: _error instanceof Error ? _error.message : 'Unknown _error',
        requestId,
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/interventions/[id]
 * Update existing intervention
 *
 * Security:
 * - Authentication required
 * - Permission: EDIT_INTERVENTIONS
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
        { error: 'Invalid intervention ID' },
        { status: 400 }
      );
    }

    // 1. Rate limiting check
    const rateLimitResult = await apiRateLimit(request);
    if (!rateLimitResult.allowed && rateLimitResult.response) {
      return rateLimitResult.response;
    }

    // 2. Authentication and authorization check
    const authResult = await authorizeRequest(request, Permission.EDIT_INTERVENTIONS);
    if (!authResult.success) {
      return authResult.response;
    }

    const { session } = authResult;
    const { user } = session;

    // 3. Parse and validate request body
    const body = await request.json();
    const validation = UpdateInterventionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid intervention data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const updateData = validation.data;

    // 4. Check if intervention exists
    const existingIntervention = await prisma.interventions.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingIntervention) {
      return NextResponse.json(
        { error: 'Intervention not found' },
        { status: 404 }
      );
    }

    // 5. Security: Enforce tenant isolation (GDPR compliance)
    if (!canAccessTenant(user.tenant_id, existingIntervention.tenant_id, user.role)) {
      await auditLogger.logUnauthorizedAccess(
        user.id,
        'EDIT_INTERVENTION',
        'Intervention',
        id,
        ipAddress,
        getUserAgent(request),
        requestId
      );
      return NextResponse.json(
        { error: 'Access denied. You cannot edit this intervention.' },
        { status: 403 }
      );
    }

    // 6. Update intervention in database
    const updatedIntervention = await prisma.interventions.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        start_date: updateData.start_date
          ? new Date(updateData.start_date)
          : undefined,
        end_date: updateData.end_date
          ? new Date(updateData.end_date)
          : undefined,
        updated_at: new Date(),
      },
      include: {
        cases: {
          select: {
            id: true,
            status: true,
            students: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
              },
            },
          },
        },
      },
    });

    // 7. Audit logging (GDPR-compliant modification tracking)
    await auditLogger.logDataAccess(
      user.id,
      user.email,
      'UPDATE',
      'Intervention',
      id,
      {
        tenant_id: updatedIntervention.tenant_id,
        case_id: updatedIntervention.case_id,
        updated_fields: Object.keys(updateData),
      },
      ipAddress,
      requestId
    );

    return NextResponse.json({
      intervention: updatedIntervention,
      message: 'Intervention updated successfully',
    });
  } catch (_error) {
    console._error('[Intervention API] Error updating intervention:', _error);
    return NextResponse.json(
      {
        _error: 'Failed to update intervention',
        message: _error instanceof Error ? _error.message : 'Unknown _error',
        requestId,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/interventions/[id]
 * Delete intervention (soft delete - mark as discontinued)
 *
 * Security:
 * - Authentication required
 * - Permission: EDIT_INTERVENTIONS
 * - Rate limited: 100 requests per minute
 * - Audit logged (CRITICAL security event - GDPR-compliant)
 * - Tenant isolation enforced
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
        { error: 'Invalid intervention ID' },
        { status: 400 }
      );
    }

    // 1. Rate limiting check
    const rateLimitResult = await apiRateLimit(request);
    if (!rateLimitResult.allowed && rateLimitResult.response) {
      return rateLimitResult.response;
    }

    // 2. Authentication and authorization check
    const authResult = await authorizeRequest(request, Permission.EDIT_INTERVENTIONS);
    if (!authResult.success) {
      return authResult.response;
    }

    const { session } = authResult;
    const { user } = session;

    // 3. Check if intervention exists
    const existingIntervention = await prisma.interventions.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingIntervention) {
      return NextResponse.json(
        { error: 'Intervention not found' },
        { status: 404 }
      );
    }

    // 4. Security: Enforce tenant isolation (GDPR compliance)
    if (!canAccessTenant(user.tenant_id, existingIntervention.tenant_id, user.role)) {
      await auditLogger.logUnauthorizedAccess(
        user.id,
        'DELETE_INTERVENTION',
        'Intervention',
        id,
        ipAddress,
        getUserAgent(request),
        requestId
      );
      return NextResponse.json(
        { error: 'Access denied. You cannot delete this intervention.' },
        { status: 403 }
      );
    }

    // 5. Soft delete - mark as discontinued
    const discontinuedIntervention = await prisma.interventions.update({
      where: { id: parseInt(id) },
      data: {
        status: 'discontinued',
        updated_at: new Date(),
      },
    });

    // 6. Audit logging (CRITICAL security event - GDPR-compliant)
    await auditLogger.logDataAccess(
      user.id,
      user.email,
      'DELETE',
      'Intervention',
      id,
      {
        tenant_id: existingIntervention.tenant_id,
        case_id: existingIntervention.case_id,
        reason: 'Intervention discontinued',
      },
      ipAddress,
      requestId
    );

    return NextResponse.json({
      message: 'Intervention discontinued successfully',
      intervention: discontinuedIntervention,
    });
  } catch (_error) {
    console._error('[Intervention API] Error discontinuing intervention:', _error);
    return NextResponse.json(
      {
        _error: 'Failed to discontinue intervention',
        message: _error instanceof Error ? _error.message : 'Unknown _error',
        requestId,
      },
      { status: 500 }
    );
  }
}
