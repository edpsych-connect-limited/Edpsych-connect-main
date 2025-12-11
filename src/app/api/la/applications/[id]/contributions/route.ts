import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Define contribution interface for type safety
interface ContributionFormatted {
  id: string;
  professionalRole: string;
  professionalId: number;
  professionalName: string;
  professionalEmail: string;
  section: string;
  content: unknown;
  status: string;
  assignedAt: string | undefined;
  deadline: string | undefined;
  submittedAt: string | null;
  createdAt: string | undefined;
  updatedAt: string | undefined;
}

/**
 * GET /api/la/applications/[id]/contributions
 * Get all contributions for an application
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
    
    // Fetch application with all contributions
    const application = await prisma.eHCPApplication.findUnique({
      where: { id: applicationId },
      include: {
        contributions: {
          include: {
            contributor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { requested_at: 'desc' },
        },
      },
    });
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    
    // Format contributions - map from schema fields
    const contributions: ContributionFormatted[] = application.contributions.map((c) => ({
      id: c.id,
      professionalRole: c.contributor_role,
      professionalId: c.contributor_id,
      professionalName: c.contributor?.name || c.contributor_name || 'Unknown',
      professionalEmail: c.contributor?.email || '',
      section: c.section_type || 'UNASSIGNED',
      content: c.content || '',
      status: c.status,
      assignedAt: c.requested_at?.toISOString(),
      deadline: c.due_date?.toISOString(),
      submittedAt: c.submitted_at?.toISOString() || null,
      createdAt: c.requested_at?.toISOString(),
      updatedAt: c.submitted_at?.toISOString() || c.requested_at?.toISOString(),
    }));
    
    // Group by section for easy access
    const contributionsBySection: Record<string, ContributionFormatted[]> = {};
    contributions.forEach((c) => {
      if (!contributionsBySection[c.section]) {
        contributionsBySection[c.section] = [];
      }
      contributionsBySection[c.section].push(c);
    });
    
    // Get merged content if exists (using draft_ehcp_id to check for draft)
    const mergedContent = {};
    
    // Calculate completion stats
    const stats = {
      total: contributions.length,
      submitted: contributions.filter((c) => c.status === 'submitted').length,
      inProgress: contributions.filter((c) => c.status === 'draft').length,
      pending: contributions.filter((c) => c.status === 'draft' || !c.submittedAt).length,
      overdue: contributions.filter((c) => 
        c.status !== 'submitted' && c.deadline && new Date(c.deadline) < new Date()
      ).length,
    };
    
    return NextResponse.json({
      applicationId,
      referenceNumber: application.la_reference,
      status: application.status,
      contributions,
      contributionsBySection,
      mergedContent,
      stats,
    });
  } catch (error) {
    logger.error('Error fetching contributions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
