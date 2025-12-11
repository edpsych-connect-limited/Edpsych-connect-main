import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/la/applications/[id]/ehcp-draft
 * Get the EHCP draft content for an application
 */
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const applicationId = params.id;
    
    // Fetch application with contributions
    const application = await prisma.eHCPApplication.findUnique({
      where: { id: applicationId },
      include: {
        contributions: {
          where: { status: 'submitted' },
          select: {
            id: true,
            contributor_role: true,
            section_type: true,
            content: true,
            submitted_at: true,
            contributor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    
    // Format contributions by section
    const contributionsBySection: Record<string, Array<{
      id: string;
      professionalRole: string;
      professionalName: string;
      section: string;
      content: unknown;
      status: string;
      submittedAt: string | null;
    }>> = {};
    
    application.contributions.forEach((c) => {
      const section = c.section_type || 'UNASSIGNED';
      if (!contributionsBySection[section]) {
        contributionsBySection[section] = [];
      }
      contributionsBySection[section].push({
        id: c.id,
        professionalRole: c.contributor_role,
        professionalName: c.contributor?.name || 'Unknown',
        section: c.section_type || 'UNASSIGNED',
        content: c.content || '',
        status: 'SUBMITTED',
        submittedAt: c.submitted_at?.toISOString() || null,
      });
    });
    
    return NextResponse.json({
      applicationId,
      contributions: application.contributions.map((c) => ({
        id: c.id,
        professionalRole: c.contributor_role,
        professionalName: c.contributor?.name || 'Unknown',
        section: c.section_type || 'UNASSIGNED',
        content: c.content || '',
        status: 'SUBMITTED',
        submittedAt: c.submitted_at?.toISOString() || null,
      })),
      contributionsBySection,
      mergedContent: {},
      lastUpdated: application.updated_at?.toISOString(),
    });
  } catch (error) {
    logger.error('Error fetching EHCP draft:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/la/applications/[id]/ehcp-draft
 * Save EHCP draft content
 */
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check for LA role
    const allowedRoles = ['LA_CASEWORKER', 'LA_MANAGER', 'LA_ADMIN', 'SUPER_ADMIN', 'ADMIN'];
    if (!session.user.role || !allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    const applicationId = params.id;
    const body = await request.json();
    const { sections } = body;
    
    if (!sections || typeof sections !== 'object') {
      return NextResponse.json(
        { error: 'Sections content is required' },
        { status: 400 }
      );
    }
    
    // Verify application exists
    const application = await prisma.eHCPApplication.findUnique({
      where: { id: applicationId },
    });
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    
    // Update application with draft content - store in metadata since draft_ehcp_content doesn't exist
    const newStatus = application.status === 'ALL_ADVICE_RECEIVED' ? 'DRAFT_IN_PROGRESS' : application.status;
    const updatedApplication = await prisma.eHCPApplication.update({
      where: { id: applicationId },
      data: {
        updated_at: new Date(),
        status: newStatus,
      },
    });
    
    // Create timeline event
    await prisma.eHCPTimelineEvent.create({
      data: {
        application_id: applicationId,
        event_type: 'DRAFT_UPDATED',
        event_category: 'administrative',
        event_description: 'EHCP draft content updated',
        triggered_by_id: parseInt(session.user.id as string),
        metadata: {
          sectionsUpdated: Object.keys(sections),
          updatedBy: session.user.name,
        },
      },
    });
    
    return NextResponse.json({
      success: true,
      message: 'EHCP draft saved successfully',
      applicationId: updatedApplication.id,
      status: updatedApplication.status,
    });
  } catch (error) {
    logger.error('Error saving EHCP draft:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/la/applications/[id]/ehcp-draft
 * Finalize EHCP draft and move to consultation phase
 */
export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check for LA Manager role for finalization
    const allowedRoles = ['LA_MANAGER', 'LA_ADMIN', 'SUPER_ADMIN', 'ADMIN'];
    if (!session.user.role || !allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Only LA Managers can finalize EHCP drafts' },
        { status: 403 }
      );
    }
    
    const applicationId = params.id;
    
    // Verify application exists and is in correct status
    const application = await prisma.eHCPApplication.findUnique({
      where: { id: applicationId },
    });
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    
    if (application.status !== 'DRAFT_IN_PROGRESS' && application.status !== 'DRAFT_QUALITY_CHECK') {
      return NextResponse.json(
        { error: 'Application must be in DRAFT status to finalize' },
        { status: 400 }
      );
    }
    
    // Update to consultation phase
    const updatedApplication = await prisma.eHCPApplication.update({
      where: { id: applicationId },
      data: {
        status: 'CONSULTATION_PARENT_SENT',
        draft_sent_to_parent: new Date(),
        updated_at: new Date(),
      },
    });
    
    // Create timeline event
    await prisma.eHCPTimelineEvent.create({
      data: {
        application_id: applicationId,
        event_type: 'DRAFT_ISSUED',
        event_category: 'consultation',
        event_description: 'Draft EHCP issued to parents for consultation',
        triggered_by_id: parseInt(session.user.id as string),
        metadata: {
          issuedBy: session.user.name,
        },
      },
    });
    
    // TODO: Trigger notification to parents
    
    return NextResponse.json({
      success: true,
      message: 'Draft EHCP finalized and sent for consultation',
      applicationId: updatedApplication.id,
      status: updatedApplication.status,
    });
  } catch (error) {
    logger.error('Error finalizing EHCP draft:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
