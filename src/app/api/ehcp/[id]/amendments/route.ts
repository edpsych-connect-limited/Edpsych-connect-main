/**
 * EHCP Amendments API Endpoint
 * Task 3.1.4: Review Workflow - Amendment Requests
 *
 * GET /api/ehcp/[id]/amendments - Get all amendments for an EHCP
 * POST /api/ehcp/[id]/amendments - Submit a new amendment request
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ============================================================================
// GET - Fetch all amendments for an EHCP
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ehcpId = params.id;
    if (!ehcpId) {
      return NextResponse.json({ error: 'Invalid EHCP ID' }, { status: 400 });
    }

    // Verify EHCP exists
    const ehcp = await prisma.ehcps.findUnique({
      where: { id: ehcpId },
    });

    if (!ehcp) {
      return NextResponse.json({ error: 'EHCP not found' }, { status: 404 });
    }

    // Fetch amendments from EHCP plan_details
    const planDetails = ehcp.plan_details as any;
    const amendments = planDetails?.amendments || [];

    return NextResponse.json({
      success: true,
      amendments,
      count: amendments.length,
    });
  } catch (error) {
    console.error('Error fetching amendments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch amendments', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Submit a new amendment request
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ehcpId = params.id;
    if (!ehcpId) {
      return NextResponse.json({ error: 'Invalid EHCP ID' }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    const {
      requested_by,
      section_affected,
      change_description,
      justification,
    } = body;

    // Validation
    if (!requested_by || !section_affected || !change_description || !justification) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!['A', 'B', 'E', 'F', 'I'].includes(section_affected)) {
      return NextResponse.json(
        { error: 'Invalid section specified' },
        { status: 400 }
      );
    }

    // Fetch existing EHCP
    const ehcp = await prisma.ehcps.findUnique({
      where: { id: ehcpId },
    });

    if (!ehcp) {
      return NextResponse.json({ error: 'EHCP not found' }, { status: 404 });
    }

    // Create new amendment object
    const newAmendment = {
      id: Date.now(), // Simple ID for now
      ehcp_id: ehcpId,
      requested_by,
      request_date: new Date().toISOString(),
      section_affected,
      change_description,
      justification,
      status: 'requested',
      created_at: new Date().toISOString(),
    };

    // Update EHCP with new amendment
    const planDetails = ehcp.plan_details as any || {};
    const amendments = planDetails.amendments || [];
    amendments.push(newAmendment);

    // Update the EHCP
    await prisma.ehcps.update({
      where: { id: ehcpId },
      data: {
        plan_details: {
          ...planDetails,
          amendments,
        },
      },
    });

    // TODO: Send notifications to stakeholders
    // - Email LA SEND team
    // - Email SENCO
    // - Email parent/carer (if appropriate)

    return NextResponse.json({
      success: true,
      message: 'Amendment request submitted successfully',
      amendment: newAmendment,
    });
  } catch (error) {
    console.error('Error submitting amendment:', error);
    return NextResponse.json(
      { error: 'Failed to submit amendment', details: (error as Error).message },
      { status: 500 }
    );
  }
}
