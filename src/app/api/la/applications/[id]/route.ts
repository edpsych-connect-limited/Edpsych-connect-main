/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * LA EHCP Individual Application API
 * ----------------------------------
 * Full CRUD operations for individual EHCP applications
 * Supports the 20-week statutory timeline compliance
 * 
 * UK SEND Code of Practice 2015 Compliance:
 * - Week 6: Decision to assess
 * - Week 16: Draft EHCP issued
 * - Week 20: Final EHCP issued
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { LAEHCPService } from '@/lib/ehcp/la-ehcp-service';

export const dynamic = 'force-dynamic';

// Validation schema for application updates
const updateApplicationSchema = z.object({
  status: z.enum([
    'SUBMITTED', 'UNDER_REVIEW', 'ADDITIONAL_INFO_REQUESTED', 
    'DECISION_PENDING', 'ASSESSMENT_AGREED', 'ASSESSMENT_REFUSED',
    'ASSESSMENT_IN_PROGRESS', 'EP_ASSIGNED', 'EP_ASSESSMENT_COMPLETE',
    'DRAFT_EHCP_IN_PROGRESS', 'DRAFT_EHCP_ISSUED', 'CONSULTATION_PERIOD',
    'FINAL_EHCP_IN_PROGRESS', 'PANEL_REVIEW_SCHEDULED', 'PANEL_REVIEW_COMPLETE',
    'FINAL_EHCP_ISSUED', 'PLACEMENT_CONSULTATION', 'PLACEMENT_CONFIRMED',
    'MEDIATION_REQUESTED', 'TRIBUNAL_APPEAL', 'CASE_CLOSED', 'ANNUAL_REVIEW_DUE',
    'CEASED', 'TRANSFERRED'
  ]).optional(),
  urgency_level: z.enum(['STANDARD', 'PRIORITY', 'URGENT', 'EMERGENCY']).optional(),
  notes: z.string().max(2000).optional(),
  additional_info: z.record(z.unknown()).optional(),
});

/**
 * GET /api/la/applications/[id]
 * Retrieve a single EHCP application with full details
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
    const laEHCPService = new LAEHCPService(user.tenant_id!);

    const application = await laEHCPService.getApplicationById(applicationId);

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Calculate timeline metrics
    const submittedDate = new Date(application.submitted_at);
    const now = new Date();
    const daysElapsed = Math.floor((now.getTime() - submittedDate.getTime()) / (1000 * 60 * 60 * 24));
    const weeksElapsed = Math.floor(daysElapsed / 7);
    
    // Statutory deadlines
    const week6Deadline = new Date(submittedDate);
    week6Deadline.setDate(week6Deadline.getDate() + 42);
    
    const week16Deadline = new Date(submittedDate);
    week16Deadline.setDate(week16Deadline.getDate() + 112);
    
    const week20Deadline = new Date(submittedDate);
    week20Deadline.setDate(week20Deadline.getDate() + 140);

    // Determine current phase
    let currentPhase = 'Initial Review';
    if (weeksElapsed > 20) currentPhase = 'Post-Final';
    else if (weeksElapsed > 16) currentPhase = 'Final EHCP';
    else if (weeksElapsed > 6) currentPhase = 'Assessment & Draft';
    else currentPhase = 'Initial Decision';

    // Build comprehensive response
    const response = {
      application,
      timeline: {
        submitted_at: application.submitted_at,
        days_elapsed: daysElapsed,
        weeks_elapsed: weeksElapsed,
        current_phase: currentPhase,
        milestones: {
          week_6_decision: {
            deadline: week6Deadline.toISOString(),
            days_remaining: Math.max(0, Math.floor((week6Deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))),
            status: application.decision_date ? 'completed' : (now > week6Deadline ? 'overdue' : 'pending'),
            completed_at: application.decision_date,
          },
          week_16_draft: {
            deadline: week16Deadline.toISOString(),
            days_remaining: Math.max(0, Math.floor((week16Deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))),
            status: application.draft_ehcp_date ? 'completed' : (now > week16Deadline ? 'overdue' : 'pending'),
            completed_at: application.draft_ehcp_date,
          },
          week_20_final: {
            deadline: week20Deadline.toISOString(),
            days_remaining: Math.max(0, Math.floor((week20Deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))),
            status: application.final_ehcp_date ? 'completed' : (now > week20Deadline ? 'overdue' : 'pending'),
            completed_at: application.final_ehcp_date,
          },
        },
        is_overdue: application.is_overdue,
        compliance_risk: weeksElapsed > 18 ? 'high' : weeksElapsed > 12 ? 'medium' : 'low',
      },
      audit_trail: {
        created_at: application.created_at,
        updated_at: application.updated_at,
        last_activity: application.updated_at,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/la/applications/[id]
 * Update an EHCP application
 */
export async function PATCH(
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

    // Verify user has appropriate role for LA operations
    if (!['admin', 'la_caseworker', 'la_manager'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const applicationId = params.id;
    const body = await request.json();
    
    // Validate input
    const validationResult = updateApplicationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Update the application
    const updatedApplication = await prisma.ehcp_applications.update({
      where: { id: applicationId },
      data: {
        status: data.status,
        urgency_level: data.urgency_level,
        notes: data.notes,
        additional_info: data.additional_info as any,
        updated_at: new Date(),
      },
      include: {
        child: true,
        school_tenant: true,
        assigned_caseworker: true,
      },
    });

    // Record timeline event for status changes
    if (data.status) {
      await prisma.ehcp_timeline_events.create({
        data: {
          application_id: applicationId,
          event_type: 'STATUS_CHANGE',
          description: `Status changed to ${data.status}`,
          performed_by_id: user.id,
          metadata: {
            previous_status: updatedApplication.status,
            new_status: data.status,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      application: updatedApplication,
    });
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/la/applications/[id]
 * Soft delete an EHCP application (archive)
 * Only allowed for LA managers
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

    // Only LA managers can delete applications
    if (user.role !== 'la_manager' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const applicationId = params.id;

    // Soft delete by setting status to CEASED
    const archivedApplication = await prisma.ehcp_applications.update({
      where: { id: applicationId },
      data: {
        status: 'CEASED',
        updated_at: new Date(),
        archived_at: new Date(),
      },
    });

    // Record timeline event
    await prisma.ehcp_timeline_events.create({
      data: {
        application_id: applicationId,
        event_type: 'APPLICATION_ARCHIVED',
        description: 'Application archived by LA manager',
        performed_by_id: user.id,
        metadata: {
          archived_by: user.email,
          archived_at: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Application archived successfully',
      application_id: archivedApplication.id,
    });
  } catch (error) {
    console.error('Error archiving application:', error);
    return NextResponse.json(
      { error: 'Failed to archive application' },
      { status: 500 }
    );
  }
}
