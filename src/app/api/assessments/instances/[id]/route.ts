/**
 * Assessment Instance API (Single)
 * Task 3.2.2: Get/Update specific assessment instance
 *
 * GET /api/assessments/instances/[id] - Get single instance
 * PUT /api/assessments/instances/[id] - Update instance
 *
 * Uses the new AssessmentInstance model from schema extensions
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ============================================================================
// GET - Fetch single assessment instance
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const instanceId = params.id; // UUID string

    // Fetch assessment instance using new model
    const instance = await prisma.assessmentInstance.findUnique({
      where: { id: instanceId },
      include: {
        framework: {
          select: {
            id: true,
            name: true,
            abbreviation: true,
          },
        },
        domain_observations: {
          include: {
            domain: {
              select: {
                id: true,
                name: true,
                order_index: true,
              },
            },
          },
        },
        collaborations: {
          select: {
            id: true,
            contributor_type: true,
            contributor_name: true,
            status: true,
            submitted_at: true,
          },
        },
      },
    });

    if (!instance) {
      return NextResponse.json({ error: 'Assessment instance not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      instance,
    });
  } catch (error) {
    console.error('Error fetching assessment instance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment instance', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT - Update assessment instance
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const instanceId = params.id; // UUID string

    const body = await request.json();
    const {
      status,
      progress_percentage,
      ep_summary,
      ep_interpretation,
      ep_recommendations,
      assessment_date,
    } = body;

    // Fetch existing instance
    const existing = await prisma.assessmentInstance.findUnique({
      where: { id: instanceId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Assessment instance not found' }, { status: 404 });
    }

    // Update instance
    const updated = await prisma.assessmentInstance.update({
      where: { id: instanceId },
      data: {
        ...(status && { status }),
        ...(progress_percentage !== undefined && { progress_percentage }),
        ...(ep_summary && { ep_summary }),
        ...(ep_interpretation && { ep_interpretation }),
        ...(ep_recommendations && { ep_recommendations }),
        ...(assessment_date && { assessment_date: new Date(assessment_date) }),
        ...(status === 'completed' && { completed_at: new Date() }),
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Assessment instance updated successfully',
      instance: updated,
    });
  } catch (error) {
    console.error('Error updating assessment instance:', error);
    return NextResponse.json(
      { error: 'Failed to update assessment instance', details: (error as Error).message },
      { status: 500 }
    );
  }
}
