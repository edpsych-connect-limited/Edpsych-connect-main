/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * LA EHCP Decision API
 * ---------------------
 * Records and manages the statutory decision to assess (or not assess)
 * This is the critical Week 6 milestone in the EHCP process.
 * 
 * UK SEND Code of Practice 2015 Requirements:
 * - Decision must be made within 6 weeks of referral
 * - Parents must be notified of decision
 * - If refusing to assess, LA must give reasons and inform of right to appeal
 * - If agreeing to assess, LA must notify all relevant parties
 * 
 * This API enforces statutory compliance and generates audit trails.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Decision schema
const decisionSchema = z.object({
  decision: z.enum(['AGREE_TO_ASSESS', 'REFUSE_TO_ASSESS']),
  reasons: z.array(z.string()).min(1, 'At least one reason must be provided'),
  detailed_rationale: z.string().min(50, 'Detailed rationale is required (minimum 50 characters)'),
  panel_date: z.string().datetime().optional(),
  panel_members: z.array(z.object({
    name: z.string(),
    role: z.string(),
  })).optional(),
  supporting_evidence_reviewed: z.array(z.string()).optional(),
  additional_info_considered: z.string().optional(),
});

// Refusal reasons per SEND Code of Practice
const VALID_REFUSAL_REASONS = [
  'INSUFFICIENT_EVIDENCE_OF_SEN',
  'NEEDS_CAN_BE_MET_FROM_SEN_SUPPORT',
  'SCHOOL_HAS_NOT_EXHAUSTED_GRADUATED_RESPONSE',
  'INSUFFICIENT_EVIDENCE_OF_INADEQUATE_PROGRESS',
  'NEEDS_DO_NOT_REQUIRE_SPECIAL_EDUCATIONAL_PROVISION',
  'PARENTAL_REQUEST_WITHDRAWN',
  'YOUNG_PERSON_REQUEST_WITHDRAWN',
  'CHILD_HAS_LEFT_LA_AREA',
  'DUPLICATE_REQUEST',
];

/**
 * GET /api/la/applications/[id]/decision
 * Get the decision status and details for an application
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

    // Get the application
    const application = await prisma.eHCPApplication.findUnique({
      where: { id: applicationId },
      include: {
        school_tenant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Calculate Week 6 deadline
    const submittedDate = new Date(application.referral_date);
    const week6Deadline = new Date(submittedDate);
    week6Deadline.setDate(week6Deadline.getDate() + 42); // 6 weeks = 42 days

    const now = new Date();
    const daysUntilDeadline = Math.floor((week6Deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const isOverdue = now > week6Deadline && !application.decision_actual_date;

    // Get decision timeline events
    const decisionEvents = await prisma.eHCPTimelineEvent.findMany({
      where: {
        application_id: applicationId,
        event_type: {
          in: ['DECISION_TO_ASSESS', 'DECISION_REFUSED', 'PANEL_SCHEDULED', 'PANEL_COMPLETE'],
        },
      },
      orderBy: { occurred_at: 'desc' },
    });

    return NextResponse.json({
      application_id: applicationId,
      child: {
        name: application.child_name,
        dob: application.child_dob,
        upn: application.child_upn,
      },
      school: application.school_tenant,
      decision_status: {
        has_decision: !!application.decision_actual_date,
        decision: application.decision_to_assess,
        decision_date: application.decision_actual_date,
        decision_by: application.decision_made_by_id,
      },
      statutory_compliance: {
        submitted_at: application.referral_date,
        week_6_deadline: week6Deadline.toISOString(),
        days_until_deadline: daysUntilDeadline,
        is_overdue: isOverdue,
        compliance_status: isOverdue ? 'BREACH' : (daysUntilDeadline <= 7 ? 'AT_RISK' : 'ON_TRACK'),
      },
      decision_history: decisionEvents,
      valid_refusal_reasons: VALID_REFUSAL_REASONS,
    });
  } catch (error) {
    console.error('Error fetching decision status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch decision status' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/la/applications/[id]/decision
 * Record the decision to assess (or refuse to assess)
 * This is a critical statutory action with full audit trail
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

    // Verify user has appropriate role (LA panel members or managers only)
    if (!['admin', 'la_manager', 'la_panel_chair'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Only LA panel members can record decisions' },
        { status: 403 }
      );
    }

    const applicationId = params.id;
    const body = await request.json();

    // Validate input
    const validationResult = decisionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Get the application
    const application = await prisma.eHCPApplication.findUnique({
      where: { id: applicationId },
      include: {
        school_tenant: true,
        la_tenant: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Check if decision already made
    if (application.decision_actual_date) {
      return NextResponse.json(
        { error: 'Decision has already been recorded for this application' },
        { status: 400 }
      );
    }

    // Validate refusal reasons
    if (data.decision === 'REFUSE_TO_ASSESS') {
      const invalidReasons = data.reasons.filter(r => !VALID_REFUSAL_REASONS.includes(r));
      if (invalidReasons.length > 0) {
        return NextResponse.json(
          { error: 'Invalid refusal reasons', invalid: invalidReasons, valid: VALID_REFUSAL_REASONS },
          { status: 400 }
        );
      }
    }

    const decisionDate = new Date();
    const newStatus = data.decision === 'AGREE_TO_ASSESS' 
      ? 'DECISION_TO_ASSESS' 
      : 'DECISION_NOT_TO_ASSESS';

    // Update application with decision
    const updatedApplication = await prisma.eHCPApplication.update({
      where: { id: applicationId },
      data: {
        status: newStatus,
        decision_actual_date: decisionDate,
        decision_to_assess: data.decision === 'AGREE_TO_ASSESS',
        decision_made_by_id: user.id,
        decision_reason: data.detailed_rationale,
        updated_at: decisionDate,
      },
    });

    // Create comprehensive timeline event
    await prisma.eHCPTimelineEvent.create({
      data: {
        application_id: applicationId,
        event_type: data.decision === 'AGREE_TO_ASSESS' ? 'DECISION_TO_ASSESS' : 'DECISION_REFUSED',
        event_category: 'decision',
        event_description: data.decision === 'AGREE_TO_ASSESS'
          ? 'LA agreed to conduct EHC needs assessment'
          : 'LA refused to conduct EHC needs assessment',
        triggered_by_id: user.id,
        previous_status: application.status,
        new_status: newStatus,
        metadata: {
          decision: data.decision,
          reasons: data.reasons,
          rationale: data.detailed_rationale,
          panel_date: data.panel_date,
          panel_members: data.panel_members,
          evidence_reviewed: data.supporting_evidence_reviewed,
          statutory_deadline_met: isWithinStatutoryTimeline(application.referral_date, decisionDate),
        },
      },
    });

    // If agreed to assess, auto-assign mandatory advice requests
    if (data.decision === 'AGREE_TO_ASSESS') {
      // Create mandatory contribution requests
      const mandatoryContributions = [
        { type: 'ep', section: 'B', deadline_days: 42 },
        { type: 'health', section: 'C', deadline_days: 42 },
        { type: 'school', section: 'A', deadline_days: 28 },
      ];

      for (const contrib of mandatoryContributions) {
        const deadline = new Date(decisionDate);
        deadline.setDate(deadline.getDate() + contrib.deadline_days);

        await prisma.eHCPContribution.create({
          data: {
            application_id: applicationId,
            contributor_type: contrib.type,
            contributor_id: user.id,
            contributor_name: 'To be assigned',
            contributor_role: contrib.type,
            contributor_org: 'Pending',
            section_type: contrib.section,
            content: {},
            status: 'draft',
            due_date: deadline,
          },
        });
      }
    }

    // Calculate compliance
    const week6Deadline = new Date(application.referral_date);
    week6Deadline.setDate(week6Deadline.getDate() + 42);
    const withinTimeline = decisionDate <= week6Deadline;

    // Generate response with next steps
    const response = {
      success: true,
      decision: {
        outcome: data.decision,
        date: decisionDate.toISOString(),
        recorded_by: user.name,
        reasons: data.reasons,
      },
      statutory_compliance: {
        deadline: week6Deadline.toISOString(),
        decision_date: decisionDate.toISOString(),
        within_statutory_timeline: withinTimeline,
        days_early_late: Math.floor((week6Deadline.getTime() - decisionDate.getTime()) / (1000 * 60 * 60 * 24)),
      },
      next_steps: data.decision === 'AGREE_TO_ASSESS' 
        ? {
            action: 'PROCEED_TO_ASSESSMENT',
            description: 'Request advice from all relevant professionals',
            deadline: 'Week 14 (8 weeks from decision)',
            mandatory_advice: ['Educational Psychologist', 'Health', 'School/Setting'],
          }
        : {
            action: 'NOTIFY_PARENT_OF_REFUSAL',
            description: 'Send decision letter with reasons and appeal rights',
            deadline: 'Within 5 working days',
            appeal_rights: 'Parent can request mediation or appeal to SEND Tribunal',
          },
      application: updatedApplication,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error recording decision:', error);
    return NextResponse.json(
      { error: 'Failed to record decision' },
      { status: 500 }
    );
  }
}

// Helper function to check statutory timeline
function isWithinStatutoryTimeline(submittedAt: Date, decisionDate: Date): boolean {
  const deadline = new Date(submittedAt);
  deadline.setDate(deadline.getDate() + 42); // 6 weeks
  return decisionDate <= deadline;
}
