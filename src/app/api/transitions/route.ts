import authService from '@/lib/auth/auth-service';
/**
 * Transition Planning API Routes
 * 
 * Supports all key educational transitions with comprehensive planning:
 * - EYFS -> KS1
 * - KS2 -> KS3 (Primary to Secondary)
 * - KS4 -> Post-16
 * - Post-16 -> Adult services
 * 
 * Features:
 * - Multi-phase transition management
 * - Preparation checklists
 * - Timeline coordination
 * - Stakeholder communication
 * - Document transfer
 * - Outcome tracking
 */

import { NextRequest, NextResponse } from 'next/server';


import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schemas
const transitionPlanSchema = z.object({
  studentId: z.union([z.string(), z.number()]).transform(val => Number(val)),
  transitionType: z.enum(['EYFS_KS1', 'KS1_KS2', 'KS2_KS3', 'KS3_KS4', 'KS4_POST16', 'POST16_ADULT', 'SCHOOL_CHANGE', 'SPECIALIST_PROVISION']),
  currentSettingId: z.string().uuid().optional(),
  targetSettingId: z.string().uuid().optional(),
  targetDate: z.string().datetime(),
  keyWorker: z.object({
    id: z.string().uuid(),
    name: z.string(),
    role: z.string(),
    contactEmail: z.string().email()
  }).optional(),
  preparationAreas: z.array(z.object({
    area: z.string(),
    priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
    strategies: z.array(z.string())
  })).optional(),
  supportRequirements: z.object({
    academic: z.array(z.string()),
    social: z.array(z.string()),
    emotional: z.array(z.string()),
    physical: z.array(z.string()),
    sensory: z.array(z.string())
  }).optional()
});

const transitionMeetingSchema = z.object({
  transitionPlanId: z.string().uuid(),
  meetingType: z.enum(['PLANNING', 'REVIEW', 'HANDOVER', 'FOLLOW_UP']),
  scheduledDate: z.string().datetime(),
  participants: z.array(z.object({
    name: z.string(),
    role: z.string(),
    organisation: z.string(),
    email: z.string().email().optional()
  })),
  agenda: z.array(z.string()),
  venue: z.string().optional(),
  virtualLink: z.string().url().optional()
});

const transitionDocumentSchema = z.object({
  transitionPlanId: z.string().uuid(),
  documentType: z.enum(['PASSPORT', 'ONE_PAGE_PROFILE', 'SUPPORT_PLAN', 'RISK_ASSESSMENT', 'MEDICAL_SUMMARY', 'EHCP_TRANSFER', 'SETTING_REPORT', 'PARENT_VIEWS']),
  title: z.string(),
  content: z.record(z.unknown()).optional(),
  attachmentUrl: z.string().url().optional(),
  confidential: z.boolean().default(false)
});

const transitionChecklistSchema = z.object({
  transitionPlanId: z.string().uuid(),
  phase: z.enum(['PREPARATION', 'FAMILIARISATION', 'TRANSFER', 'SETTLING', 'REVIEW']),
  items: z.array(z.object({
    task: z.string(),
    responsible: z.string(),
    dueDate: z.string().datetime(),
    notes: z.string().optional()
  }))
});

// GET: Retrieve transition plans
export async function GET(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const transitionPlanId = searchParams.get('transitionPlanId');
    const transitionType = searchParams.get('transitionType');
    const status = searchParams.get('status');
    const action = searchParams.get('action');

    // Get specific transition plan with full details
    if (transitionPlanId) {
      const plan = await prisma.transitionPlan.findUnique({
        where: { id: transitionPlanId },
        include: {
          student: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              date_of_birth: true,
              year_group: true
            }
          },
          meetings: true,
          documents: true,
          checklists: true,
          communications: true
        }
      });

      if (!plan) {
        return NextResponse.json({ error: 'Transition plan not found' }, { status: 404 });
      }

      // Calculate progress metrics
      const progress = calculateTransitionProgress(plan);

      return NextResponse.json({
        success: true,
        data: {
          ...plan,
          progress
        }
      });
    }

    // Get checklist templates by transition type
    if (action === 'checklistTemplate' && transitionType) {
      const template = getChecklistTemplate(transitionType as string);
      return NextResponse.json({
        success: true,
        data: template
      });
    }

    // Get transition timeline
    if (action === 'timeline' && studentId) {
      const timeline = await getTransitionTimeline(studentId);
      return NextResponse.json({
        success: true,
        data: timeline
      });
    }

    // List transition plans with filters
    const whereClause: Record<string, unknown> = {};
    
    if (studentId) whereClause.studentId = parseInt(studentId);
    if (transitionType) whereClause.transitionType = transitionType;
    if (status) whereClause.status = status;

    const plans = await prisma.transitionPlan.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            year_group: true
          }
        },
        _count: {
          select: {
            meetings: true,
            documents: true
          }
        }
      },
      orderBy: { targetDate: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: plans,
      meta: {
        total: plans.length
      }
    });

  } catch (error) {
    console.error('Transition GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve transition data' },
      { status: 500 }
    );
  }
}

// POST: Create transition plan, meeting, document, or checklist
export async function POST(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    // Create new transition plan
    if (!action || action === 'plan') {
      const validated = transitionPlanSchema.parse(body);
      
      // Generate transition phases based on type
      const phases = generateTransitionPhases(validated.transitionType, new Date(validated.targetDate));

      const plan = await prisma.transitionPlan.create({
        data: {
          studentId: validated.studentId,
          transitionType: validated.transitionType,
          currentSettingId: validated.currentSettingId,
          targetSettingId: validated.targetSettingId,
          targetDate: new Date(validated.targetDate),
          keyWorker: validated.keyWorker as Record<string, unknown>,
          preparationAreas: validated.preparationAreas as Record<string, unknown>[],
          supportRequirements: validated.supportRequirements as Record<string, unknown>,
          phases: phases as Record<string, unknown>[],
          status: 'ACTIVE',
          createdById: session.id
        },
        include: {
          student: {
            select: { first_name: true, last_name: true }
          }
        }
      });

      // Create default checklists for each phase
      await createDefaultChecklists(plan.id, validated.transitionType);

      return NextResponse.json({
        success: true,
        data: plan,
        message: 'Transition plan created successfully'
      }, { status: 201 });
    }

    // Schedule transition meeting
    if (action === 'meeting') {
      const validated = transitionMeetingSchema.parse(body);

      const meeting = await prisma.transitionMeeting.create({
        data: {
          transitionPlanId: validated.transitionPlanId,
          meetingType: validated.meetingType,
          scheduledDate: new Date(validated.scheduledDate),
          participants: validated.participants as Record<string, unknown>[],
          agenda: validated.agenda,
          venue: validated.venue,
          virtualLink: validated.virtualLink,
          status: 'SCHEDULED',
          createdById: session.id
        }
      });

      // Send invitations to participants
      await sendMeetingInvitations(meeting);

      return NextResponse.json({
        success: true,
        data: meeting,
        message: 'Transition meeting scheduled'
      }, { status: 201 });
    }

    // Add transition document
    if (action === 'document') {
      const validated = transitionDocumentSchema.parse(body);

      const document = await prisma.transitionDocument.create({
        data: {
          transitionPlanId: validated.transitionPlanId,
          documentType: validated.documentType,
          title: validated.title,
          content: validated.content as Record<string, unknown>,
          attachmentUrl: validated.attachmentUrl,
          confidential: validated.confidential,
          uploadedById: session.id,
          status: 'DRAFT'
        }
      });

      return NextResponse.json({
        success: true,
        data: document,
        message: 'Document added to transition plan'
      }, { status: 201 });
    }

    // Create/update checklist
    if (action === 'checklist') {
      const validated = transitionChecklistSchema.parse(body);

      const checklist = await prisma.transitionChecklist.upsert({
        where: {
          transitionPlanId_phase: {
            transitionPlanId: validated.transitionPlanId,
            phase: validated.phase
          }
        },
        create: {
          transitionPlanId: validated.transitionPlanId,
          phase: validated.phase,
          items: validated.items as Record<string, unknown>[],
          createdById: session.id
        },
        update: {
          items: validated.items as Record<string, unknown>[],
          updatedById: session.id
        }
      });

      return NextResponse.json({
        success: true,
        data: checklist,
        message: 'Checklist updated'
      }, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Transition POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create transition data' },
      { status: 500 }
    );
  }
}

// PUT: Update transition plan or related entities
export async function PUT(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    // Update transition plan
    if (action === 'plan' && body.id) {
      const plan = await prisma.transitionPlan.update({
        where: { id: body.id },
        data: {
          targetSettingId: body.targetSettingId,
          targetDate: body.targetDate ? new Date(body.targetDate) : undefined,
          keyWorker: body.keyWorker,
          preparationAreas: body.preparationAreas,
          supportRequirements: body.supportRequirements,
          status: body.status,
          updatedById: session.id
        }
      });

      return NextResponse.json({
        success: true,
        data: plan,
        message: 'Transition plan updated'
      });
    }

    // Update checklist item status
    if (action === 'checklistItem') {
      const { checklistId, itemIndex, completed, completedDate, notes } = body;

      const checklist = await prisma.transitionChecklist.findUnique({
        where: { id: checklistId }
      });

      if (!checklist) {
        return NextResponse.json({ error: 'Checklist not found' }, { status: 404 });
      }

      const items = checklist.items as Record<string, unknown>[];
      if (itemIndex >= 0 && itemIndex < items.length) {
        items[itemIndex] = {
          ...items[itemIndex],
          completed,
          completedDate: completedDate || new Date().toISOString(),
          completedBy: session.id,
          notes
        };

        const updated = await prisma.transitionChecklist.update({
          where: { id: checklistId },
          data: { items: items as Record<string, unknown>[] }
        });

        return NextResponse.json({
          success: true,
          data: updated,
          message: 'Checklist item updated'
        });
      }

      return NextResponse.json({ error: 'Invalid item index' }, { status: 400 });
    }

    // Record meeting outcomes
    if (action === 'meetingOutcome') {
      const { meetingId, outcomes, actions, nextSteps, attendees } = body;

      const meeting = await prisma.transitionMeeting.update({
        where: { id: meetingId },
        data: {
          outcomes: outcomes as string[],
          actions: actions as Record<string, unknown>[],
          nextSteps,
          actualAttendees: attendees,
          status: 'COMPLETED',
          completedAt: new Date()
        }
      });

      // Create action items from meeting
      if (actions && actions.length > 0) {
        await createActionItems(meeting.transitionPlanId, actions, session.id);
      }

      return NextResponse.json({
        success: true,
        data: meeting,
        message: 'Meeting outcomes recorded'
      });
    }

    // Update phase status
    if (action === 'phaseStatus') {
      const { transitionPlanId, phase, status, notes } = body;

      const plan = await prisma.transitionPlan.findUnique({
        where: { id: transitionPlanId }
      });

      if (!plan) {
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
      }

      const phases = plan.phases as Record<string, unknown>[];
      const phaseIndex = phases.findIndex((p: Record<string, unknown>) => p.name === phase);
      
      if (phaseIndex >= 0) {
        phases[phaseIndex] = {
          ...phases[phaseIndex],
          status,
          notes,
          updatedAt: new Date().toISOString(),
          updatedBy: session.id
        };

        const updated = await prisma.transitionPlan.update({
          where: { id: transitionPlanId },
          data: { phases: phases as Record<string, unknown>[] }
        });

        return NextResponse.json({
          success: true,
          data: updated,
          message: 'Phase status updated'
        });
      }

      return NextResponse.json({ error: 'Phase not found' }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Transition PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update transition data' },
      { status: 500 }
    );
  }
}

// Helper functions

function calculateTransitionProgress(plan: Record<string, unknown>): Record<string, unknown> {
  const checklists = plan.checklists as Record<string, unknown>[];
  let totalItems = 0;
  let completedItems = 0;

  checklists?.forEach(checklist => {
    const items = checklist.items as Record<string, unknown>[];
    totalItems += items?.length || 0;
    completedItems += items?.filter((item: Record<string, unknown>) => item.completed).length || 0;
  });

  const phases = plan.phases as Record<string, unknown>[];
  const completedPhases = phases?.filter((p: Record<string, unknown>) => p.status === 'COMPLETED').length || 0;

  return {
    overallPercentage: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
    checklistProgress: {
      total: totalItems,
      completed: completedItems
    },
    phaseProgress: {
      total: phases?.length || 0,
      completed: completedPhases
    },
    daysUntilTarget: Math.ceil(
      (new Date(plan.targetDate as string).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
  };
}

function generateTransitionPhases(transitionType: string, targetDate: Date): Record<string, unknown>[] {
  const phases: Record<string, unknown>[] = [];
  const target = new Date(targetDate);

  // Standard transition phases with timing relative to target date
  const phaseTemplates: Record<string, { name: string; monthsBefore: number }[]> = {
    'EYFS_KS1': [
      { name: 'Initial Planning', monthsBefore: 6 },
      { name: 'Information Sharing', monthsBefore: 4 },
      { name: 'Visits and Familiarisation', monthsBefore: 2 },
      { name: 'Handover', monthsBefore: 0 },
      { name: 'Settling In Review', monthsBefore: -1 }
    ],
    'KS2_KS3': [
      { name: 'Initial Planning', monthsBefore: 12 },
      { name: 'School Selection', monthsBefore: 9 },
      { name: 'Enhanced Transition Support', monthsBefore: 6 },
      { name: 'Visits and Taster Days', monthsBefore: 3 },
      { name: 'Document Transfer', monthsBefore: 1 },
      { name: 'Handover Meeting', monthsBefore: 0 },
      { name: 'Settling Period', monthsBefore: -1 },
      { name: 'Review', monthsBefore: -3 }
    ],
    'KS4_POST16': [
      { name: 'Initial Career Guidance', monthsBefore: 18 },
      { name: 'Pathway Planning', monthsBefore: 12 },
      { name: 'Provider Research', monthsBefore: 9 },
      { name: 'Applications', monthsBefore: 6 },
      { name: 'Transition Preparation', monthsBefore: 3 },
      { name: 'Induction', monthsBefore: 0 },
      { name: 'Support Review', monthsBefore: -2 }
    ],
    'POST16_ADULT': [
      { name: 'Preparing for Adulthood Planning', monthsBefore: 24 },
      { name: 'Adult Services Referral', monthsBefore: 18 },
      { name: 'Needs Assessment', monthsBefore: 12 },
      { name: 'Support Planning', monthsBefore: 9 },
      { name: 'Provider Selection', monthsBefore: 6 },
      { name: 'Trial Placements', monthsBefore: 3 },
      { name: 'Handover', monthsBefore: 0 },
      { name: 'Review and Adjustment', monthsBefore: -3 }
    ]
  };

  const template = phaseTemplates[transitionType] || phaseTemplates['KS2_KS3'];

  template.forEach(phase => {
    const startDate = new Date(target);
    startDate.setMonth(startDate.getMonth() - phase.monthsBefore);

    phases.push({
      name: phase.name,
      startDate: startDate.toISOString(),
      status: 'NOT_STARTED',
      tasks: []
    });
  });

  return phases;
}

function getChecklistTemplate(transitionType: string): Record<string, unknown> {
  const templates: Record<string, Record<string, unknown>> = {
    'KS2_KS3': {
      PREPARATION: [
        { task: 'Identify key transition contact at receiving school', responsible: 'SENCO', priority: 'HIGH' },
        { task: 'Review and update EHCP/support plan', responsible: 'SENCO', priority: 'HIGH' },
        { task: 'Gather pupil views on transition concerns', responsible: 'Class Teacher', priority: 'HIGH' },
        { task: 'Gather parent/carer views and concerns', responsible: 'SENCO', priority: 'HIGH' },
        { task: 'Identify peer buddy from Year 7', responsible: 'Receiving SENCO', priority: 'MEDIUM' },
        { task: 'Create transition passport/one-page profile', responsible: 'SENCO', priority: 'HIGH' },
        { task: 'Plan additional visits if needed', responsible: 'SENCO', priority: 'MEDIUM' }
      ],
      FAMILIARISATION: [
        { task: 'Attend standard transition day', responsible: 'Pupil', priority: 'HIGH' },
        { task: 'Additional familiarisation visits (3-5)', responsible: 'SENCO', priority: 'HIGH' },
        { task: 'Meet key staff including form tutor', responsible: 'Pupil', priority: 'HIGH' },
        { task: 'Practise journey to school', responsible: 'Parent/Carer', priority: 'MEDIUM' },
        { task: 'Receive map and timetable in advance', responsible: 'Receiving School', priority: 'HIGH' },
        { task: 'Visit at quiet times to learn layout', responsible: 'Receiving SENCO', priority: 'MEDIUM' }
      ],
      TRANSFER: [
        { task: 'Transfer pupil files and records', responsible: 'Admin', priority: 'HIGH' },
        { task: 'Share EHCP and annual review', responsible: 'SENCO', priority: 'HIGH' },
        { task: 'Handover meeting with receiving school', responsible: 'SENCO', priority: 'HIGH' },
        { task: 'Share successful strategies', responsible: 'Class Teacher', priority: 'HIGH' },
        { task: 'Transfer medical information', responsible: 'Admin', priority: 'HIGH' }
      ],
      SETTLING: [
        { task: 'Daily check-ins for first week', responsible: 'Form Tutor', priority: 'HIGH' },
        { task: 'Identify safe space and key adult', responsible: 'SENCO', priority: 'HIGH' },
        { task: 'Review timetable and support', responsible: 'SENCO', priority: 'MEDIUM' },
        { task: 'Parent feedback call', responsible: 'Form Tutor', priority: 'MEDIUM' }
      ],
      REVIEW: [
        { task: '6-week transition review meeting', responsible: 'SENCO', priority: 'HIGH' },
        { task: 'Adjust support plan if needed', responsible: 'SENCO', priority: 'HIGH' },
        { task: 'Gather pupil feedback on transition', responsible: 'Form Tutor', priority: 'MEDIUM' },
        { task: 'Update EHCP if significant changes', responsible: 'SENCO', priority: 'MEDIUM' }
      ]
    },
    'POST16_ADULT': {
      PREPARATION: [
        { task: 'Year 9 Annual Review with PfA focus', responsible: 'SENCO', priority: 'HIGH' },
        { task: 'Invite adult services to annual reviews', responsible: 'SENCO', priority: 'HIGH' },
        { task: 'Career guidance and pathway planning', responsible: 'Careers Adviser', priority: 'HIGH' },
        { task: 'Identify health needs for transition', responsible: 'School Nurse', priority: 'HIGH' },
        { task: 'Begin Care Act assessment referral', responsible: 'Social Worker', priority: 'HIGH' }
      ],
      FAMILIARISATION: [
        { task: 'Visit potential adult provision/placement', responsible: 'Young Person', priority: 'HIGH' },
        { task: 'Trial days at preferred provider', responsible: 'Provider', priority: 'HIGH' },
        { task: 'Meet adult support workers', responsible: 'Young Person', priority: 'MEDIUM' },
        { task: 'Travel training if needed', responsible: 'Travel Trainer', priority: 'MEDIUM' }
      ],
      TRANSFER: [
        { task: 'Final EHCP review before ceasing', responsible: 'LA SEND', priority: 'HIGH' },
        { task: 'Adult Care and Support Plan in place', responsible: 'Social Worker', priority: 'HIGH' },
        { task: 'Health transition passport complete', responsible: 'GP', priority: 'HIGH' },
        { task: 'Benefits and finances transferred', responsible: 'Family', priority: 'HIGH' }
      ],
      SETTLING: [
        { task: 'Initial support review', responsible: 'Key Worker', priority: 'HIGH' },
        { task: 'Adjust support as needed', responsible: 'Provider', priority: 'MEDIUM' }
      ],
      REVIEW: [
        { task: '3-month review of adult placement', responsible: 'Social Worker', priority: 'HIGH' },
        { task: 'Annual review of care plan', responsible: 'Social Worker', priority: 'HIGH' }
      ]
    }
  };

  return templates[transitionType] || templates['KS2_KS3'];
}

async function getTransitionTimeline(studentId: string): Promise<Record<string, unknown>[]> {
  const plans = await prisma.transitionPlan.findMany({
    where: { studentId: parseInt(studentId) },
    include: {
      meetings: {
        select: { scheduledDate: true, meetingType: true, status: true }
      }
    },
    orderBy: { targetDate: 'asc' }
  });

  const timeline: Record<string, unknown>[] = [];

  plans.forEach(plan => {
    const phases = (plan.phases as Record<string, unknown>[]) || [];
    phases.forEach((phase: Record<string, unknown>) => {
      timeline.push({
        type: 'phase',
        planId: plan.id,
        transitionType: plan.transitionType,
        name: phase.name,
        date: phase.startDate,
        status: phase.status
      });
    });

    plan.meetings.forEach(meeting => {
      timeline.push({
        type: 'meeting',
        planId: plan.id,
        transitionType: plan.transitionType,
        name: meeting.meetingType,
        date: meeting.scheduledDate,
        status: meeting.status
      });
    });
  });

  return timeline.sort((a, b) => 
    new Date(a.date as string).getTime() - new Date(b.date as string).getTime()
  );
}

async function createDefaultChecklists(planId: string, transitionType: string): Promise<void> {
  const template = getChecklistTemplate(transitionType);
  
  for (const [phase, items] of Object.entries(template)) {
    await prisma.transitionChecklist.create({
      data: {
        transitionPlanId: planId,
        phase,
        items: (items as Record<string, unknown>[]).map((item: Record<string, unknown>) => ({
          ...item,
          completed: false,
          completedDate: null,
          completedBy: null
        }))
      }
    });
  }
}

async function sendMeetingInvitations(_meeting: Record<string, unknown>): Promise<void> {
  // In production, this would integrate with email/calendar services
  // For now, log the invitation
  console.log('Meeting invitations would be sent:', _meeting);
}

async function createActionItems(
  transitionPlanId: string, 
  actions: Record<string, unknown>[], 
  userId: string
): Promise<void> {
  for (const action of actions) {
    await prisma.transitionAction.create({
      data: {
        transitionPlanId,
        description: action.description as string,
        assignedTo: action.assignedTo as string,
        dueDate: action.dueDate ? new Date(action.dueDate as string) : null,
        priority: action.priority as string || 'MEDIUM',
        status: 'PENDING',
        createdById: userId
      }
    });
  }
}
