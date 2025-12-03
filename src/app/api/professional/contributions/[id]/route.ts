/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * Individual Professional Contribution API
 * -----------------------------------------
 * Full CRUD operations for a single contribution request.
 * Enables professionals to:
 * - View contribution details and child information
 * - Start working on contribution (change status)
 * - Save draft contributions
 * - Submit final contribution
 * 
 * This is the core interface for multi-agency professionals to provide
 * their statutory advice for EHCP assessments.
 */

import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Contribution content schema (EP-focused but flexible for other professionals)
const contributionContentSchema = z.object({
  // Common fields
  assessment_date: z.string().datetime().optional(),
  assessment_context: z.string().optional(),
  
  // Section B: Description of SEN
  special_educational_needs: z.object({
    primary_area: z.enum([
      'COGNITION_AND_LEARNING',
      'COMMUNICATION_AND_INTERACTION',
      'SOCIAL_EMOTIONAL_MENTAL_HEALTH',
      'SENSORY_AND_PHYSICAL',
    ]).optional(),
    secondary_areas: z.array(z.string()).optional(),
    detailed_description: z.string().optional(),
    strengths: z.string().optional(),
    barriers_to_learning: z.string().optional(),
  }).optional(),
  
  // Cognitive assessment (EP specific)
  cognitive_profile: z.object({
    assessment_tool: z.string().optional(), // e.g., "WISC-V", "BAS3"
    verbal_comprehension: z.number().optional(),
    visual_spatial: z.number().optional(),
    fluid_reasoning: z.number().optional(),
    working_memory: z.number().optional(),
    processing_speed: z.number().optional(),
    full_scale_iq: z.number().optional(),
    confidence_interval: z.string().optional(),
    narrative: z.string().optional(),
  }).optional(),
  
  // Attainment assessment
  attainment: z.object({
    reading_accuracy: z.object({
      standard_score: z.number().optional(),
      percentile: z.number().optional(),
      age_equivalent: z.string().optional(),
    }).optional(),
    reading_comprehension: z.object({
      standard_score: z.number().optional(),
      percentile: z.number().optional(),
      age_equivalent: z.string().optional(),
    }).optional(),
    spelling: z.object({
      standard_score: z.number().optional(),
      percentile: z.number().optional(),
      age_equivalent: z.string().optional(),
    }).optional(),
    maths: z.object({
      standard_score: z.number().optional(),
      percentile: z.number().optional(),
      age_equivalent: z.string().optional(),
    }).optional(),
    narrative: z.string().optional(),
  }).optional(),
  
  // Section E: Outcomes
  recommended_outcomes: z.array(z.object({
    area: z.string(),
    outcome: z.string(),
    success_criteria: z.string(),
    timeframe: z.enum(['SHORT_TERM', 'MEDIUM_TERM', 'LONG_TERM']).optional(),
    measurable_indicators: z.array(z.string()).optional(),
  })).optional(),
  
  // Section F: Provision
  recommended_provision: z.array(z.object({
    type: z.enum([
      'SPECIALIST_TEACHING',
      'THERAPY',
      'SUPPORT_STAFF',
      'RESOURCES',
      'ENVIRONMENT',
      'CURRICULUM',
      'OTHER',
    ]),
    description: z.string(),
    frequency: z.string(), // e.g., "Weekly", "Daily"
    duration: z.string(), // e.g., "30 minutes"
    delivered_by: z.string(), // e.g., "Specialist Teacher", "SALT"
    rationale: z.string().optional(),
  })).optional(),
  
  // Health advice specific (Section C)
  health_needs: z.object({
    medical_conditions: z.array(z.string()).optional(),
    medications: z.array(z.string()).optional(),
    physical_needs: z.string().optional(),
    mental_health_needs: z.string().optional(),
    sensory_needs: z.string().optional(),
    health_provision_required: z.string().optional(),
  }).optional(),
  
  // Social care specific (Section D)
  social_care_needs: z.object({
    family_circumstances: z.string().optional(),
    safeguarding_concerns: z.boolean().optional(),
    social_care_involvement: z.string().optional(),
    respite_needs: z.string().optional(),
    transition_support: z.string().optional(),
  }).optional(),
  
  // Placement recommendation (Section I)
  placement_recommendation: z.object({
    recommended_setting: z.enum([
      'MAINSTREAM',
      'MAINSTREAM_WITH_RESOURCE',
      'SPECIAL_SCHOOL',
      'INDEPENDENT_SPECIAL',
      'ALTERNATIVE_PROVISION',
      'ELECTIVE_HOME_EDUCATION',
    ]).optional(),
    rationale: z.string().optional(),
    specific_setting: z.string().optional(),
  }).optional(),
  
  // Additional notes
  additional_observations: z.string().optional(),
  recommendations_summary: z.string().optional(),
  
  // Attachments (file references)
  attachments: z.array(z.object({
    name: z.string(),
    type: z.string(),
    url: z.string(),
  })).optional(),
});

// Status update schema
const statusUpdateSchema = z.object({
  status: z.enum(['IN_PROGRESS', 'SUBMITTED']),
  notes: z.string().optional(),
});

// Type for validated contribution content (from Zod schema)
type ContributionContent = z.infer<typeof contributionContentSchema>;

// Type for contribution guidance
interface ContributionGuidance {
  title: string;
  sections: string[];
  legal_reference: string;
  deadline_guidance: string;
}

// Type for contribution template
interface ContributionTemplate {
  special_educational_needs?: {
    primary_area: string | null;
    secondary_areas: string[];
    detailed_description: string;
    strengths: string;
    barriers_to_learning: string;
  };
  cognitive_profile?: {
    assessment_tool: string;
    verbal_comprehension: number | null;
    visual_spatial: number | null;
    fluid_reasoning: number | null;
    working_memory: number | null;
    processing_speed: number | null;
    full_scale_iq: number | null;
    narrative: string;
  };
  recommended_outcomes?: unknown[];
  recommended_provision?: unknown[];
  placement_recommendation?: {
    recommended_setting: string | null;
    rationale: string;
  };
  health_needs?: {
    medical_conditions: string[];
    medications: string[];
    physical_needs: string;
    mental_health_needs: string;
    sensory_needs: string;
    health_provision_required: string;
  };
  social_care_needs?: {
    family_circumstances: string;
    safeguarding_concerns: boolean;
    social_care_involvement: string;
    respite_needs: string;
    transition_support: string;
  };
}

/**
 * GET /api/professional/contributions/[id]
 * Get full details of a contribution request
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
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const contributionId = params.id;

    // Get the contribution with full application details
    const contribution = await prisma.eHCPContribution.findUnique({
      where: { id: contributionId },
      include: {
        application: {
          include: {
            school_tenant: {
              select: {
                id: true,
                name: true,
              },
            },
            la_tenant: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
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

    if (!contribution) {
      return NextResponse.json({ error: 'Contribution not found' }, { status: 404 });
    }

    // Verify the user is the assigned contributor or an LA caseworker
    if (contribution.contributor_id !== user.id && !['admin', 'la_caseworker', 'la_manager'].includes(user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Calculate deadline information
    const now = new Date();
    const deadline = new Date(contribution.due_date);
    const daysRemaining = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const isOverdue = daysRemaining < 0;

    // Get existing assessments for this child (from our platform)
    const existingAssessments = await prisma.assessments.findMany({
      where: {
        id: { in: [] }, // Placeholder - we don't have student_id on assessments
      },
      orderBy: { created_at: 'desc' },
      take: 10,
    });

    // Get child's intervention history
    const interventions = await prisma.interventions.findMany({
      where: {
        id: { in: [] }, // Placeholder - need proper field mapping
      },
      orderBy: { created_at: 'desc' },
      take: 10,
    });

    // Build guidance based on contribution type
    const guidance = getContributionGuidance(contribution.contributor_type);

    return NextResponse.json({
      contribution: {
        ...contribution,
        deadline_info: {
          deadline: deadline.toISOString(),
          days_remaining: daysRemaining,
          is_overdue: isOverdue,
          urgency: isOverdue ? 'OVERDUE' : daysRemaining <= 7 ? 'URGENT' : daysRemaining <= 14 ? 'HIGH' : 'STANDARD',
        },
      },
      child: {
        name: contribution.application.child_name,
        dob: contribution.application.child_dob,
      },
      school: contribution.application.school_tenant,
      la: contribution.application.la_tenant,
      existing_data: {
        assessments: existingAssessments,
        interventions,
      },
      guidance,
      template: getContributionTemplate(contribution.contributor_type),
    });
  } catch (error) {
    logger.error('Error fetching contribution:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contribution' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/professional/contributions/[id]
 * Update contribution status or save draft content
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
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const contributionId = params.id;
    const body = await request.json();

    // Get the contribution
    const contribution = await prisma.eHCPContribution.findUnique({
      where: { id: contributionId },
    });

    if (!contribution) {
      return NextResponse.json({ error: 'Contribution not found' }, { status: 404 });
    }

    // Verify the user is the assigned contributor
    if (contribution.contributor_id !== user.id) {
      return NextResponse.json({ error: 'Only the assigned contributor can update this' }, { status: 403 });
    }

    // Determine update type
    if (body.status) {
      // Status update
      const statusResult = statusUpdateSchema.safeParse(body);
      if (!statusResult.success) {
        return NextResponse.json(
          { error: 'Invalid status update', details: statusResult.error.errors },
          { status: 400 }
        );
      }

      const updatedContribution = await prisma.eHCPContribution.update({
        where: { id: contributionId },
        data: {
          status: statusResult.data.status.toLowerCase(),
          ...(statusResult.data.status === 'SUBMITTED' && { submitted_at: new Date() }),
        },
      });

      // Record timeline event
      await prisma.eHCPTimelineEvent.create({
        data: {
          application_id: contribution.application_id,
          event_type: statusResult.data.status === 'SUBMITTED' ? 'CONTRIBUTION_SUBMITTED' : 'CONTRIBUTION_STARTED',
          event_category: 'contribution',
          event_description: `${contribution.contributor_type} ${statusResult.data.status === 'SUBMITTED' ? 'submitted' : 'in progress'}`,
          triggered_by_id: user.id,
          metadata: {
            contribution_id: contributionId,
            contributor_type: contribution.contributor_type,
          },
        },
      });

      return NextResponse.json({
        success: true,
        contribution: updatedContribution,
        message: statusResult.data.status === 'SUBMITTED' 
          ? 'Contribution submitted successfully' 
          : 'Status updated to in progress',
      });
    } else if (body.content) {
      // Content save (draft or update)
      const contentResult = contributionContentSchema.safeParse(body.content);
      if (!contentResult.success) {
        return NextResponse.json(
          { error: 'Invalid contribution content', details: contentResult.error.errors },
          { status: 400 }
        );
      }

      const updatedContribution = await prisma.eHCPContribution.update({
        where: { id: contributionId },
        data: {
          content: contentResult.data as Prisma.InputJsonValue,
          // Auto-set to in_progress if still draft
          status: contribution.status === 'draft' ? 'submitted' : contribution.status,
        },
      });

      return NextResponse.json({
        success: true,
        contribution: updatedContribution,
        message: 'Draft saved successfully',
      });
    }

    return NextResponse.json(
      { error: 'No valid update data provided' },
      { status: 400 }
    );
  } catch (error) {
    logger.error('Error updating contribution:', error);
    return NextResponse.json(
      { error: 'Failed to update contribution' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/professional/contributions/[id]
 * Submit final contribution (alternative to PATCH with status)
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
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const contributionId = params.id;
    const body = await request.json();

    // Get the contribution
    const contribution = await prisma.eHCPContribution.findUnique({
      where: { id: contributionId },
      include: { application: true },
    });

    if (!contribution) {
      return NextResponse.json({ error: 'Contribution not found' }, { status: 404 });
    }

    // Verify the user is the assigned contributor
    if (contribution.contributor_id !== user.id) {
      return NextResponse.json({ error: 'Only the assigned contributor can submit this' }, { status: 403 });
    }

    // Already submitted?
    if (contribution.status === 'submitted' || contribution.status === 'accepted') {
      return NextResponse.json(
        { error: 'Contribution has already been submitted' },
        { status: 400 }
      );
    }

    // Validate content
    const contentResult = contributionContentSchema.safeParse(body.content);
    if (!contentResult.success) {
      return NextResponse.json(
        { error: 'Invalid contribution content', details: contentResult.error.errors },
        { status: 400 }
      );
    }

    // Validate completeness based on contribution type
    const validation = validateCompleteness(contribution.contributor_type, contentResult.data);
    if (!validation.isComplete) {
      return NextResponse.json(
        { error: 'Contribution is incomplete', missing_fields: validation.missingFields },
        { status: 400 }
      );
    }

    const submittedAt = new Date();

    // Update contribution
    const updatedContribution = await prisma.eHCPContribution.update({
      where: { id: contributionId },
      data: {
        content: contentResult.data as any,
        status: 'submitted',
        submitted_at: submittedAt,
      },
    });

    // Record timeline event
    await prisma.eHCPTimelineEvent.create({
      data: {
        application_id: contribution.application_id,
        event_type: 'CONTRIBUTION_SUBMITTED',
        event_category: 'contribution',
        event_description: `${contribution.contributor_type} advice submitted by ${user.name}`,
        triggered_by_id: user.id,
        metadata: {
          contribution_id: contributionId,
          contributor_type: contribution.contributor_type,
          submitted_by: user.email,
          deadline: contribution.due_date,
          submitted_on_time: submittedAt <= new Date(contribution.due_date),
        },
      },
    });

    // Check if all mandatory contributions are now complete
    const allContributions = await prisma.eHCPContribution.findMany({
      where: { application_id: contribution.application_id },
    });

    const mandatoryComplete = allContributions
      .every(c => c.status === 'submitted' || c.status === 'accepted');

    if (mandatoryComplete) {
      // Update application status
      await prisma.eHCPApplication.update({
        where: { id: contribution.application_id },
        data: {
          status: 'ALL_ADVICE_RECEIVED',
          updated_at: submittedAt,
        },
      });

      // Record milestone
      await prisma.eHCPTimelineEvent.create({
        data: {
          application_id: contribution.application_id,
          event_type: 'ALL_ADVICE_RECEIVED',
          event_category: 'assessment',
          event_description: 'All mandatory professional advice received - ready to draft EHCP',
          triggered_by_id: user.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      contribution: updatedContribution,
      message: 'Contribution submitted successfully',
      all_mandatory_complete: mandatoryComplete,
      next_step: mandatoryComplete 
        ? 'All mandatory advice received - LA can now draft the EHCP'
        : 'Awaiting other professional contributions',
    });
  } catch (error) {
    logger.error('Error submitting contribution:', error);
    return NextResponse.json(
      { error: 'Failed to submit contribution' },
      { status: 500 }
    );
  }
}

// Helper: Get guidance based on contribution type
function getContributionGuidance(type: string): ContributionGuidance {
  const guidance: Record<string, ContributionGuidance> = {
    EDUCATIONAL_PSYCHOLOGY: {
      title: 'Educational Psychology Advice',
      sections: [
        'Cognitive assessment (standardised)',
        'Attainment assessment',
        'Analysis of special educational needs',
        'Recommended outcomes (Section E)',
        'Recommended provision (Section F)',
        'Placement considerations (Section I)',
      ],
      legal_reference: 'SEND Code of Practice 2015, para 9.49',
      deadline_guidance: '6 weeks from request',
    },
    HEALTH_ADVICE: {
      title: 'Health Advice',
      sections: [
        'Medical conditions affecting learning',
        'Physical health needs',
        'Mental health needs',
        'Sensory needs',
        'Health provision required (Section G)',
      ],
      legal_reference: 'SEND Code of Practice 2015, para 9.50-9.51',
      deadline_guidance: '6 weeks from request',
    },
    SOCIAL_CARE: {
      title: 'Social Care Advice',
      sections: [
        'Social care needs',
        'Family circumstances',
        'Safeguarding considerations',
        'Social care provision required (Section H)',
      ],
      legal_reference: 'SEND Code of Practice 2015, para 9.52-9.53',
      deadline_guidance: '6 weeks from request',
    },
    SCHOOL_SETTING: {
      title: 'School/Setting Advice',
      sections: [
        'Child\'s views',
        'Parent\'s views',
        'Current provision and interventions',
        'Progress against targets',
        'Aspirations',
      ],
      legal_reference: 'SEND Code of Practice 2015, para 9.48',
      deadline_guidance: '4 weeks from request',
    },
  };

  return guidance[type] || {
    title: `${type} Advice`,
    sections: ['Professional assessment', 'Recommendations'],
    legal_reference: 'SEND Code of Practice 2015',
    deadline_guidance: '6 weeks from request',
  };
}

// Helper: Get template structure for contribution type
function getContributionTemplate(type: string): ContributionTemplate {
  const templates: Record<string, ContributionTemplate> = {
    EDUCATIONAL_PSYCHOLOGY: {
      special_educational_needs: {
        primary_area: null,
        secondary_areas: [],
        detailed_description: '',
        strengths: '',
        barriers_to_learning: '',
      },
      cognitive_profile: {
        assessment_tool: '',
        verbal_comprehension: null,
        visual_spatial: null,
        fluid_reasoning: null,
        working_memory: null,
        processing_speed: null,
        full_scale_iq: null,
        narrative: '',
      },
      recommended_outcomes: [],
      recommended_provision: [],
      placement_recommendation: {
        recommended_setting: null,
        rationale: '',
      },
    },
    HEALTH_ADVICE: {
      health_needs: {
        medical_conditions: [],
        medications: [],
        physical_needs: '',
        mental_health_needs: '',
        sensory_needs: '',
        health_provision_required: '',
      },
    },
    SOCIAL_CARE: {
      social_care_needs: {
        family_circumstances: '',
        safeguarding_concerns: false,
        social_care_involvement: '',
        respite_needs: '',
        transition_support: '',
      },
    },
  };

  return templates[type] || {};
}

// Helper: Validate contribution completeness
function validateCompleteness(type: string, content: ContributionContent): { isComplete: boolean; missingFields: string[] } {
  const missingFields: string[] = [];

  if (type === 'EDUCATIONAL_PSYCHOLOGY') {
    if (!content.special_educational_needs?.detailed_description) {
      missingFields.push('Description of SEN');
    }
    if (!content.recommended_outcomes || content.recommended_outcomes.length === 0) {
      missingFields.push('Recommended outcomes');
    }
    if (!content.recommended_provision || content.recommended_provision.length === 0) {
      missingFields.push('Recommended provision');
    }
  }

  if (type === 'HEALTH_ADVICE') {
    if (!content.health_needs) {
      missingFields.push('Health needs section');
    }
  }

  if (type === 'SOCIAL_CARE') {
    if (!content.social_care_needs) {
      missingFields.push('Social care needs section');
    }
  }

  return {
    isComplete: missingFields.length === 0,
    missingFields,
  };
}
