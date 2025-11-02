/**
 * Assessment Instance API (Single)
 * Task 3.2.2: Get/Update specific assessment instance
 *
 * GET /api/assessments/instances/[id] - Get single instance
 * PUT /api/assessments/instances/[id] - Update instance
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
    const instanceId = parseInt(params.id);
    if (isNaN(instanceId)) {
      return NextResponse.json({ error: 'Invalid instance ID' }, { status: 400 });
    }

    // Fetch assessment
    const assessment = await prisma.assessment.findUnique({
      where: { id: instanceId },
      include: {
        student: {
          select: {
            student_id: true,
            first_name: true,
            last_name: true,
            date_of_birth: true,
          },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Transform to instance format
    const instance = {
      id: assessment.id,
      student_id: assessment.student_id,
      student_name: `${assessment.student.first_name} ${assessment.student.last_name}`,
      ...(assessment.assessment_data as any),
    };

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
    const instanceId = parseInt(params.id);
    if (isNaN(instanceId)) {
      return NextResponse.json({ error: 'Invalid instance ID' }, { status: 400 });
    }

    const body = await request.json();
    const {
      completed_at,
      status,
      responses,
      scores,
      notes,
      environmental_factors,
      behavioral_observations,
    } = body;

    // Fetch existing assessment
    const existing = await prisma.assessment.findUnique({
      where: { id: instanceId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Merge with existing data
    const updatedData = {
      ...(existing.assessment_data as any),
      completed_at: completed_at || (existing.assessment_data as any).completed_at,
      status: status || (existing.assessment_data as any).status,
      responses: responses || (existing.assessment_data as any).responses,
      scores: scores || (existing.assessment_data as any).scores,
      notes: notes !== undefined ? notes : (existing.assessment_data as any).notes,
      environmental_factors:
        environmental_factors !== undefined
          ? environmental_factors
          : (existing.assessment_data as any).environmental_factors,
      behavioral_observations:
        behavioral_observations !== undefined
          ? behavioral_observations
          : (existing.assessment_data as any).behavioral_observations,
    };

    // Update assessment
    const updated = await prisma.assessment.update({
      where: { id: instanceId },
      data: {
        assessment_data: updatedData,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Assessment instance updated successfully',
      instance: {
        id: updated.id,
        ...updatedData,
      },
    });
  } catch (error) {
    console.error('Error updating assessment instance:', error);
    return NextResponse.json(
      { error: 'Failed to update assessment instance', details: (error as Error).message },
      { status: 500 }
    );
  }
}
