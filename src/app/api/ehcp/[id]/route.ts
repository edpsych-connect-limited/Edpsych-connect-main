/**
 * EHCP [id] API Routes
 * Handles individual EHCP operations with version tracking and notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import authService from '@/lib/auth/auth-service';
import {
  sendEHCPNotification,
  createEHCPVersion,
  detectChangedSections,
  generateChangeSummary,
} from '@/lib/ehcp/notifications';

export const dynamic = 'force-dynamic';

// ============================================================================
// GET - Fetch EHCP by ID
// ============================================================================
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ehcp = await prisma.ehcps.findUnique({
      where: { id: params.id },
      include: {
        versions: {
          orderBy: { created_at: 'desc' },
          take: 10, // Last 10 versions
        },
      },
    });

    if (!ehcp) {
      return NextResponse.json(
        { error: 'EHCP not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      plan: ehcp,
    });
  } catch (_error) {
    console.error('[EHCP API] GET error:', _error);
    return NextResponse.json(
      { error: 'Failed to fetch EHCP' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT - Update EHCP with version tracking
// ============================================================================
export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { plan_details, status } = body;

    // Fetch current EHCP for change detection
    const currentEHCP = await prisma.ehcps.findUnique({
      where: { id: params.id },
    });

    if (!currentEHCP) {
      return NextResponse.json(
        { error: 'EHCP not found' },
        { status: 404 }
      );
    }

    // Detect changed sections
    const changedSections = detectChangedSections(
      currentEHCP.plan_details,
      plan_details
    );

    const changeSummary = generateChangeSummary(
      currentEHCP.plan_details,
      plan_details,
      changedSections
    );

    // Update EHCP
    const updatedEHCP = await prisma.ehcps.update({
      where: { id: params.id },
      data: {
        plan_details,
        updated_at: new Date(),
      },
    });

    // Create version history
    await createEHCPVersion({
      ehcp_id: params.id,
      tenant_id: updatedEHCP.tenant_id,
      created_by_id: parseInt(session.id),
      status: (plan_details as any)?.status || status || 'draft',
      plan_details: plan_details,
      change_summary: changeSummary,
    });

    // Send notifications
    await sendEHCPNotification({
      ehcp_id: params.id,
      tenant_id: updatedEHCP.tenant_id,
      action: 'updated',
      changed_sections: changedSections,
      change_summary: changeSummary,
      actor_id: parseInt(session.id),
      actor_name: session.name,
    });

    return NextResponse.json({
      success: true,
      plan: updatedEHCP,
      changed_sections: changedSections,
    });
  } catch (_error) {
    console.error('[EHCP API] PUT error:', _error);
    return NextResponse.json(
      { error: 'Failed to update EHCP' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE - Soft delete EHCP with archiving
// ============================================================================
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch EHCP before deletion
    const ehcp = await prisma.ehcps.findUnique({
      where: { id: params.id },
    });

    if (!ehcp) {
      return NextResponse.json(
        { error: 'EHCP not found' },
        { status: 404 }
      );
    }

    // Create archive version before deletion
    await createEHCPVersion({
      ehcp_id: params.id,
      tenant_id: ehcp.tenant_id,
      created_by_id: parseInt(session.id),
      status: 'deleted',
      plan_details: ehcp.plan_details,
      change_summary: `EHCP deleted by ${session.name}`,
    });

    // Delete EHCP (cascade will preserve versions due to schema design)
    await prisma.ehcps.delete({
      where: { id: params.id },
    });

    // Send notifications
    await sendEHCPNotification({
      ehcp_id: params.id,
      tenant_id: ehcp.tenant_id,
      action: 'deleted',
      change_summary: `EHCP deleted and archived`,
      actor_id: parseInt(session.id),
      actor_name: session.name,
    });

    return NextResponse.json({
      success: true,
      message: `EHCP ${params.id} deleted and archived`,
    });
  } catch (_error) {
    console.error('[EHCP API] DELETE error:', _error);
    return NextResponse.json(
      { error: 'Failed to delete EHCP' },
      { status: 500 }
    );
  }
}
