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
  { params }: { params: { id: string } }
) {
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
    const application = await prisma.ehcp_applications.findUnique({
      where: { id: applicationId },
      include: {
        contributions: {
          where: { status: 'SUBMITTED' },
          select: {
            id: true,
            professional_role: true,
            section: true,
            content: true,
            submitted_at: true,
            professional: {
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
    
    // Get draft content if it exists
    const draftContent = application.draft_ehcp_content as Record<string, string> | null;
    
    // Format contributions by section
    const contributionsBySection: Record<string, Array<{
      id: string;
      professionalRole: string;
      professionalName: string;
      section: string;
      content: string;
      status: string;
      submittedAt: string | null;
    }>> = {};
    
    application.contributions.forEach((c) => {
      const section = c.section || 'UNASSIGNED';
      if (!contributionsBySection[section]) {
        contributionsBySection[section] = [];
      }
      contributionsBySection[section].push({
        id: c.id,
        professionalRole: c.professional_role,
        professionalName: c.professional?.name || 'Unknown',
        section: c.section || 'UNASSIGNED',
        content: c.content || '',
        status: 'SUBMITTED',
        submittedAt: c.submitted_at?.toISOString() || null,
      });
    });
    
    return NextResponse.json({
      applicationId,
      contributions: application.contributions.map((c) => ({
        id: c.id,
        professionalRole: c.professional_role,
        professionalName: c.professional?.name || 'Unknown',
        section: c.section || 'UNASSIGNED',
        content: c.content || '',
        status: 'SUBMITTED',
        submittedAt: c.submitted_at?.toISOString() || null,
      })),
      contributionsBySection,
      mergedContent: draftContent || {},
      lastUpdated: application.updated_at?.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching EHCP draft:', error);
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
  { params }: { params: { id: string } }
) {
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
    const application = await prisma.ehcp_applications.findUnique({
      where: { id: applicationId },
    });
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    
    // Update application with draft content
    const updatedApplication = await prisma.ehcp_applications.update({
      where: { id: applicationId },
      data: {
        draft_ehcp_content: sections,
        updated_at: new Date(),
        // Update status to DRAFT_EHCP if currently gathering advice
        status: application.status === 'GATHERING_ADVICE' ? 'DRAFT_EHCP' : application.status,
      },
    });
    
    // Create timeline event
    await prisma.ehcp_timeline_events.create({
      data: {
        application_id: applicationId,
        event_type: 'DRAFT_UPDATED',
        event_date: new Date(),
        description: 'EHCP draft content updated',
        created_by_id: session.user.id,
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
    console.error('Error saving EHCP draft:', error);
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
  { params }: { params: { id: string } }
) {
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
    const application = await prisma.ehcp_applications.findUnique({
      where: { id: applicationId },
    });
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    
    if (application.status !== 'DRAFT_EHCP') {
      return NextResponse.json(
        { error: 'Application must be in DRAFT_EHCP status to finalize' },
        { status: 400 }
      );
    }
    
    // Verify all required sections have content
    const draftContent = application.draft_ehcp_content as Record<string, string> | null;
    const requiredSections = ['SECTION_B', 'SECTION_E', 'SECTION_F', 'SECTION_I'];
    const missingSections = requiredSections.filter(
      (s) => !draftContent || !draftContent[s] || draftContent[s].trim() === ''
    );
    
    if (missingSections.length > 0) {
      return NextResponse.json(
        {
          error: 'Missing required sections',
          missingSections,
          message: `The following required sections are not complete: ${missingSections.join(', ')}`,
        },
        { status: 400 }
      );
    }
    
    // Update to consultation phase
    const updatedApplication = await prisma.ehcp_applications.update({
      where: { id: applicationId },
      data: {
        status: 'CONSULTATION_PHASE',
        draft_issued_at: new Date(),
        updated_at: new Date(),
      },
    });
    
    // Create timeline event
    await prisma.ehcp_timeline_events.create({
      data: {
        application_id: applicationId,
        event_type: 'DRAFT_ISSUED',
        event_date: new Date(),
        description: 'Draft EHCP issued to parents for consultation',
        created_by_id: session.user.id,
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
    console.error('Error finalizing EHCP draft:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
