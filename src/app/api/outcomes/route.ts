import authService from '@/lib/auth/auth-service';
/**
 * Outcome Tracking API Routes
 * 
 * API for comprehensive SEND outcome management:
 * - Create and manage SMART outcomes
 * - Record progress entries with evidence
 * - Generate outcome reports
 * - Track review schedules
 * - Access outcome templates
 * - View analytics
 */

import { NextRequest, NextResponse } from 'next/server';


import { OutcomeTrackingService } from '@/lib/outcomes/outcome-tracking.service';
import { z } from 'zod';

const outcomeService = new OutcomeTrackingService();

// Validation schemas
const createOutcomeSchema = z.object({
  studentId: z.string().uuid(),
  title: z.string().min(5).max(200),
  description: z.string().max(1000),
  category: z.enum(['COMMUNICATION', 'COGNITION', 'SOCIAL_EMOTIONAL', 'SENSORY_PHYSICAL', 'INDEPENDENCE', 'ACADEMIC', 'PREPARATION_ADULTHOOD']),
  ehcpSection: z.string().optional(),
  ehcpOutcomeId: z.string().uuid().optional(),
  baseline: z.object({
    date: z.string().datetime(),
    description: z.string(),
    level: z.number().min(0).max(10),
    evidence: z.string().optional()
  }),
  target: z.object({
    description: z.string(),
    level: z.number().min(0).max(10),
    criteria: z.array(z.string())
  }),
  timeBound: z.string().datetime(),
  reviewSchedule: z.enum(['WEEKLY', 'FORTNIGHTLY', 'HALF_TERMLY', 'TERMLY']),
  keyWorkerId: z.string().uuid().optional(),
  linkedInterventions: z.array(z.string().uuid()).optional(),
  linkedProvisions: z.array(z.string().uuid()).optional()
});

const progressEntrySchema = z.object({
  outcomeId: z.string().uuid(),
  level: z.number().min(0).max(10),
  notes: z.string(),
  evidence: z.array(z.object({
    type: z.enum(['OBSERVATION', 'WORK_SAMPLE', 'ASSESSMENT', 'VIDEO', 'PHOTO', 'AUDIO', 'DOCUMENT', 'THIRD_PARTY']),
    description: z.string(),
    url: z.string().url().optional(),
    date: z.string().datetime(),
    collectedBy: z.string()
  })).optional(),
  setting: z.string().optional(),
  supportUsed: z.array(z.string()).optional(),
  independenceLevel: z.enum(['FULL_SUPPORT', 'PARTIAL_SUPPORT', 'PROMPTING', 'SUPERVISION', 'INDEPENDENT']).optional()
});

const reportRequestSchema = z.object({
  studentId: z.string().uuid(),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime()
});

// GET handler
export async function GET(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const schoolId = searchParams.get('schoolId') || (session.tenant_id != null ? String(String(session.tenant_id)) : undefined);

    // Get single outcome
    if (action === 'get') {
      const outcomeId = searchParams.get('outcomeId');
      if (!outcomeId) {
        return NextResponse.json({ error: 'outcomeId required' }, { status: 400 });
      }

      const outcome = await outcomeService.getOutcome(outcomeId);
      if (!outcome) {
        return NextResponse.json({ error: 'Outcome not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: outcome
      });
    }

    // Get student outcomes
    if (action === 'studentOutcomes') {
      const studentId = searchParams.get('studentId');
      if (!studentId) {
        return NextResponse.json({ error: 'studentId required' }, { status: 400 });
      }

      const outcomes = await outcomeService.getStudentOutcomes(studentId);
      return NextResponse.json({
        success: true,
        data: outcomes
      });
    }

    // Get outcomes with filters
    if (action === 'list' || !action) {
      if (!schoolId) {
        return NextResponse.json({ error: 'schoolId required' }, { status: 400 });
      }

      const page = parseInt(searchParams.get('page') || '1');
      const studentId = searchParams.get('studentId') || undefined;
      const category = searchParams.get('category') || undefined;
      const status = searchParams.get('status') || undefined;
      const keyWorkerId = searchParams.get('keyWorkerId') || undefined;
      const ehcpOnly = searchParams.get('ehcpOnly') === 'true';
      const reviewDue = searchParams.get('reviewDue') === 'true';

      const results = await outcomeService.getOutcomes(
        schoolId,
        { studentId, category, status, keyWorkerId, ehcpOnly, reviewDue },
        page
      );

      return NextResponse.json({
        success: true,
        data: results
      });
    }

    // Get progress history
    if (action === 'progressHistory') {
      const outcomeId = searchParams.get('outcomeId');
      if (!outcomeId) {
        return NextResponse.json({ error: 'outcomeId required' }, { status: 400 });
      }

      const history = await outcomeService.getProgressHistory(outcomeId);
      return NextResponse.json({
        success: true,
        data: history
      });
    }

    // Get outcomes due for review
    if (action === 'dueForReview') {
      if (!schoolId) {
        return NextResponse.json({ error: 'schoolId required' }, { status: 400 });
      }

      const dueOutcomes = await outcomeService.getOutcomesDueForReview(schoolId);
      return NextResponse.json({
        success: true,
        data: dueOutcomes
      });
    }

    // Get outcome templates
    if (action === 'templates') {
      const category = searchParams.get('category') || undefined;
      const needType = searchParams.get('needType') || undefined;

      const templates = await outcomeService.getOutcomeTemplates(category, needType);
      return NextResponse.json({
        success: true,
        data: templates
      });
    }

    // Get analytics
    if (action === 'analytics') {
      if (!schoolId) {
        return NextResponse.json({ error: 'schoolId required' }, { status: 400 });
      }

      const analytics = await outcomeService.getOutcomeAnalytics(schoolId);
      return NextResponse.json({
        success: true,
        data: analytics
      });
    }

    return NextResponse.json(
      { error: 'Invalid action parameter' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Outcomes GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve outcome data' },
      { status: 500 }
    );
  }
}

// POST handler
export async function POST(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    // Create new outcome
    if (action === 'create' || !action) {
      const validated = createOutcomeSchema.parse(body);

      const outcome = await outcomeService.createOutcome(
        {
          ...validated,
          baseline: {
            ...validated.baseline,
            date: new Date(validated.baseline.date)
          },
          timeBound: new Date(validated.timeBound)
        },
        session.id
      );

      return NextResponse.json({
        success: true,
        data: outcome,
        message: 'Outcome created successfully'
      }, { status: 201 });
    }

    // Record progress
    if (action === 'recordProgress') {
      const validated = progressEntrySchema.parse(body);

      const outcome = await outcomeService.recordProgress(
        validated.outcomeId,
        {
          level: validated.level,
          notes: validated.notes,
          evidence: validated.evidence?.map(e => ({
            ...e,
            date: new Date(e.date)
          })),
          setting: validated.setting,
          supportUsed: validated.supportUsed,
          independenceLevel: validated.independenceLevel
        },
        session.id
      );

      return NextResponse.json({
        success: true,
        data: outcome,
        message: 'Progress recorded'
      });
    }

    // Generate report
    if (action === 'generateReport') {
      const validated = reportRequestSchema.parse(body);

      const report = await outcomeService.generateOutcomeReport(
        validated.studentId,
        new Date(validated.periodStart),
        new Date(validated.periodEnd)
      );

      return NextResponse.json({
        success: true,
        data: report
      });
    }

    // Create from template
    if (action === 'createFromTemplate') {
      const { templateId, studentId, customisations } = body;

      if (!templateId || !studentId) {
        return NextResponse.json(
          { error: 'templateId and studentId required' },
          { status: 400 }
        );
      }

      const outcome = await outcomeService.createFromTemplate(
        templateId,
        studentId,
        customisations || {},
        session.id
      );

      return NextResponse.json({
        success: true,
        data: outcome,
        message: 'Outcome created from template'
      }, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Invalid action parameter' },
      { status: 400 }
    );

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Outcomes POST error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
