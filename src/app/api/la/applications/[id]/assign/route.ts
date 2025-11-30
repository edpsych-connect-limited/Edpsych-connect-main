/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * LA EHCP Professional Assignment API
 * ------------------------------------
 * Enables LA caseworkers to assign multi-agency professionals
 * to EHCP applications for statutory assessment contributions.
 * 
 * UK SEND Code of Practice 2015 Requirements:
 * - Educational Psychologist (EP) advice - MANDATORY
 * - Health advice (from designated medical officer) - MANDATORY
 * - Social Care advice - MANDATORY where applicable
 * - School/setting advice - MANDATORY
 * - Parent/carer views - MANDATORY
 * - Child/young person views - MANDATORY (age-appropriate)
 * 
 * This API supports automatic notifications and deadline tracking.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Professional assignment schema
const assignProfessionalSchema = z.object({
  professional_id: z.number().int().positive(),
  contribution_type: z.enum([
    'EDUCATIONAL_PSYCHOLOGY',
    'HEALTH_ADVICE',
    'SOCIAL_CARE',
    'SCHOOL_SETTING',
    'SPEECH_LANGUAGE',
    'OCCUPATIONAL_THERAPY',
    'PHYSIOTHERAPY',
    'VISUAL_IMPAIRMENT',
    'HEARING_IMPAIRMENT',
    'SPECIALIST_TEACHER',
    'CAMHS',
    'PAEDIATRIC',
    'OTHER',
  ]),
  deadline_days: z.number().int().min(7).max(42).default(28), // Default 4 weeks, max 6 weeks
  notes: z.string().max(1000).optional(),
  priority: z.enum(['STANDARD', 'HIGH', 'URGENT']).default('STANDARD'),
});

// Bulk assignment schema
const bulkAssignSchema = z.object({
  assignments: z.array(assignProfessionalSchema).min(1).max(10),
});

/**
 * GET /api/la/applications/[id]/assign
 * Get current professional assignments for an application
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      include: { tenants: true },
    });

    if (!user?.tenants) {
      return NextResponse.json({ error: 'User or tenant not found' }, { status: 404 });
    }

    const applicationId = params.id;

    // Get the application with its contributions
    const application = await prisma.ehcp_applications.findUnique({
      where: { id: applicationId },
      include: {
        contributions: {
          include: {
            contributor: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Calculate contribution statistics
    const contributionStats = {
      total_required: getRequiredContributions(application),
      total_assigned: application.contributions.length,
      total_completed: application.contributions.filter(c => c.status === 'SUBMITTED' || c.status === 'ACCEPTED').length,
      total_pending: application.contributions.filter(c => c.status === 'REQUESTED' || c.status === 'IN_PROGRESS').length,
      total_overdue: application.contributions.filter(c => c.status === 'OVERDUE').length,
    };

    // Group contributions by type
    const contributionsByType = application.contributions.reduce((acc, c) => {
      if (!acc[c.contribution_type]) {
        acc[c.contribution_type] = [];
      }
      acc[c.contribution_type].push(c);
      return acc;
    }, {} as Record<string, typeof application.contributions>);

    // Identify missing mandatory contributions
    const mandatoryTypes = ['EDUCATIONAL_PSYCHOLOGY', 'HEALTH_ADVICE', 'SCHOOL_SETTING'];
    const missingMandatory = mandatoryTypes.filter(type => !contributionsByType[type]);

    return NextResponse.json({
      application_id: applicationId,
      application_status: application.status,
      contributions: application.contributions,
      contributions_by_type: contributionsByType,
      statistics: contributionStats,
      missing_mandatory: missingMandatory,
      all_mandatory_assigned: missingMandatory.length === 0,
      ready_for_draft: contributionStats.total_completed >= contributionStats.total_required,
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/la/applications/[id]/assign
 * Assign a professional to provide advice for an EHCP application
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      include: { tenants: true },
    });

    if (!user?.tenants) {
      return NextResponse.json({ error: 'User or tenant not found' }, { status: 404 });
    }

    // Verify user has appropriate role
    if (!['admin', 'la_caseworker', 'la_manager'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const applicationId = params.id;
    const body = await request.json();

    // Check if it's a bulk assignment
    const isBulk = body.assignments && Array.isArray(body.assignments);
    
    if (isBulk) {
      const validationResult = bulkAssignSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          { error: 'Invalid input', details: validationResult.error.errors },
          { status: 400 }
        );
      }

      const results = await Promise.all(
        validationResult.data.assignments.map(assignment => 
          assignProfessional(applicationId, assignment, user.id)
        )
      );

      return NextResponse.json({
        success: true,
        assignments: results,
        message: `${results.length} professional(s) assigned successfully`,
      });
    } else {
      const validationResult = assignProfessionalSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          { error: 'Invalid input', details: validationResult.error.errors },
          { status: 400 }
        );
      }

      const result = await assignProfessional(applicationId, validationResult.data, user.id);

      return NextResponse.json({
        success: true,
        assignment: result,
        message: 'Professional assigned successfully',
      });
    }
  } catch (error) {
    console.error('Error assigning professional:', error);
    return NextResponse.json(
      { error: 'Failed to assign professional' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/la/applications/[id]/assign
 * Remove a professional assignment (before contribution is submitted)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      include: { tenants: true },
    });

    if (!user?.tenants) {
      return NextResponse.json({ error: 'User or tenant not found' }, { status: 404 });
    }

    // Verify user has appropriate role
    if (!['admin', 'la_caseworker', 'la_manager'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const contributionId = searchParams.get('contribution_id');

    if (!contributionId) {
      return NextResponse.json(
        { error: 'contribution_id is required' },
        { status: 400 }
      );
    }

    // Get the contribution
    const contribution = await prisma.ehcp_contributions.findUnique({
      where: { id: contributionId },
    });

    if (!contribution) {
      return NextResponse.json({ error: 'Contribution not found' }, { status: 404 });
    }

    // Can only remove if not yet submitted
    if (contribution.status === 'SUBMITTED' || contribution.status === 'ACCEPTED') {
      return NextResponse.json(
        { error: 'Cannot remove assignment after contribution has been submitted' },
        { status: 400 }
      );
    }

    // Delete the contribution request
    await prisma.ehcp_contributions.delete({
      where: { id: contributionId },
    });

    // Record timeline event
    await prisma.ehcp_timeline_events.create({
      data: {
        application_id: params.id,
        event_type: 'ASSIGNMENT_REMOVED',
        description: `Professional assignment removed: ${contribution.contribution_type}`,
        performed_by_id: user.id,
        metadata: {
          contribution_type: contribution.contribution_type,
          contributor_id: contribution.contributor_id,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Assignment removed successfully',
    });
  } catch (error) {
    console.error('Error removing assignment:', error);
    return NextResponse.json(
      { error: 'Failed to remove assignment' },
      { status: 500 }
    );
  }
}

// Helper function to assign a professional
async function assignProfessional(
  applicationId: string,
  data: z.infer<typeof assignProfessionalSchema>,
  assignedById: number
) {
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + data.deadline_days);

  // Create the contribution request
  const contribution = await prisma.ehcp_contributions.create({
    data: {
      application_id: applicationId,
      contributor_id: data.professional_id,
      contribution_type: data.contribution_type,
      status: 'REQUESTED',
      deadline,
      priority: data.priority,
      notes: data.notes,
      assigned_by_id: assignedById,
      assigned_at: new Date(),
    },
    include: {
      contributor: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  // Record timeline event
  await prisma.ehcp_timeline_events.create({
    data: {
      application_id: applicationId,
      event_type: 'PROFESSIONAL_ASSIGNED',
      description: `${data.contribution_type} professional assigned`,
      performed_by_id: assignedById,
      metadata: {
        contribution_id: contribution.id,
        contribution_type: data.contribution_type,
        professional_id: data.professional_id,
        deadline: deadline.toISOString(),
        priority: data.priority,
      },
    },
  });

  // TODO: Send email notification to professional
  // await sendProfessionalAssignmentNotification(contribution);

  return contribution;
}

// Helper function to determine required contributions based on needs
function getRequiredContributions(application: any): number {
  // Minimum 3 mandatory contributions: EP, Health, School
  let required = 3;
  
  // Add social care if relevant
  if (application.has_social_care_needs) {
    required++;
  }
  
  // Add specialist services based on needs
  const specialistNeeds = application.specialist_needs || [];
  required += specialistNeeds.length;
  
  return required;
}
