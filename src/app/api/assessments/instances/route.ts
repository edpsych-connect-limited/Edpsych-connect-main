/**
 * Assessment Instances API (List & Create)
 * Task 3.2.1: Browse and create assessment instances
 *
 * GET /api/assessments/instances - List all instances
 * POST /api/assessments/instances - Create new instance
 *
 * Uses the new AssessmentInstance model from schema extensions
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ============================================================================
// GET - List assessment instances
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenant_id');
    const caseId = searchParams.get('case_id');
    const studentId = searchParams.get('student_id');
    const status = searchParams.get('status');

    // Build where clause
    const where: any = {};
    if (tenantId) where.tenant_id = parseInt(tenantId);
    if (caseId) where.case_id = parseInt(caseId);
    if (studentId) where.student_id = parseInt(studentId);
    if (status) where.status = status;

    const instances = await prisma.assessmentInstance.findMany({
      where,
      include: {
        framework: {
          select: {
            id: true,
            name: true,
            abbreviation: true,
          },
        },
        domain_observations: {
          select: {
            id: true,
            domain_id: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      instances,
      count: instances.length,
    });
  } catch (error) {
    console.error('Error fetching assessment instances:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment instances', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Create assessment instance
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tenant_id,
      framework_id,
      case_id,
      student_id,
      conducted_by,
      title,
      assessment_date,
    } = body;

    // Validate required fields
    if (!tenant_id || !framework_id || !case_id || !student_id || !conducted_by) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create assessment instance
    const instance = await prisma.assessmentInstance.create({
      data: {
        tenant_id: parseInt(tenant_id),
        framework_id,
        case_id: parseInt(case_id),
        student_id: parseInt(student_id),
        conducted_by: parseInt(conducted_by),
        title: title || null,
        assessment_date: assessment_date ? new Date(assessment_date) : null,
        status: 'draft',
        progress_percentage: 0,

        // Input tracking flags
        parent_input_requested: false,
        parent_input_received: false,
        teacher_input_requested: false,
        teacher_input_received: false,
        child_input_requested: false,
        child_input_received: false,
      },
      include: {
        framework: {
          select: {
            id: true,
            name: true,
            abbreviation: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Assessment instance created successfully',
      instance,
    });
  } catch (error) {
    console.error('Error creating assessment instance:', error);
    return NextResponse.json(
      { error: 'Failed to create assessment instance', details: (error as Error).message },
      { status: 500 }
    );
  }
}
