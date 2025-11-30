import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/la/applications/[id]/contributions
 * Get all contributions for an application
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
    
    // Fetch application with all contributions
    const application = await prisma.ehcp_applications.findUnique({
      where: { id: applicationId },
      include: {
        contributions: {
          include: {
            professional: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { created_at: 'desc' },
        },
      },
    });
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    
    // Format contributions
    const contributions = application.contributions.map((c) => ({
      id: c.id,
      professionalRole: c.professional_role,
      professionalId: c.professional_id,
      professionalName: c.professional?.name || 'Unknown',
      professionalEmail: c.professional?.email || '',
      section: c.section || 'UNASSIGNED',
      content: c.content || '',
      status: c.status,
      assignedAt: c.assigned_at?.toISOString(),
      deadline: c.deadline?.toISOString(),
      submittedAt: c.submitted_at?.toISOString() || null,
      createdAt: c.created_at?.toISOString(),
      updatedAt: c.updated_at?.toISOString(),
    }));
    
    // Group by section for easy access
    const contributionsBySection: Record<string, typeof contributions> = {};
    contributions.forEach((c) => {
      if (!contributionsBySection[c.section]) {
        contributionsBySection[c.section] = [];
      }
      contributionsBySection[c.section].push(c);
    });
    
    // Get merged content if exists
    const mergedContent = application.draft_ehcp_content as Record<string, string> | null;
    
    // Calculate completion stats
    const stats = {
      total: contributions.length,
      submitted: contributions.filter((c) => c.status === 'SUBMITTED').length,
      inProgress: contributions.filter((c) => c.status === 'IN_PROGRESS').length,
      pending: contributions.filter((c) => c.status === 'ASSIGNED' || c.status === 'PENDING').length,
      overdue: contributions.filter((c) => 
        c.status !== 'SUBMITTED' && c.deadline && new Date(c.deadline) < new Date()
      ).length,
    };
    
    return NextResponse.json({
      applicationId,
      referenceNumber: application.reference_number,
      status: application.status,
      contributions,
      contributionsBySection,
      mergedContent: mergedContent || {},
      stats,
    });
  } catch (error) {
    console.error('Error fetching contributions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
