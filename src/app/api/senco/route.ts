import authService from '@/lib/auth/auth-service';
/**
 * SENCO Dashboard API Routes
 * 
 * Comprehensive API for SENCO functionality:
 * - Dashboard metrics and overview
 * - SEND Register management
 * - Compliance monitoring
 * - Action items management
 * - Staff training needs
 * - Parent engagement
 */

import { NextRequest, NextResponse } from 'next/server';


import { SENCODashboardService } from '@/lib/senco/senco-dashboard.service';
import { z } from 'zod';

const sencoService = new SENCODashboardService();

// Validation schemas
const registerEntrySchema = z.object({
  studentId: z.string().uuid(),
  sendStatus: z.enum(['MONITORING', 'SEN_SUPPORT', 'EHCP', 'EHCP_ASSESSMENT', 'GRADUATED']),
  primaryNeed: z.string(),
  secondaryNeeds: z.array(z.string()).optional(),
  needLevel: z.enum(['UNIVERSAL', 'TARGETED', 'SPECIALIST', 'HIGHLY_SPECIALIST']),
  identifiedBy: z.string(),
  reason: z.string()
});

const updateEntrySchema = z.object({
  entryId: z.string().uuid(),
  sendStatus: z.enum(['MONITORING', 'SEN_SUPPORT', 'EHCP', 'EHCP_ASSESSMENT', 'GRADUATED']).optional(),
  primaryNeed: z.string().optional(),
  secondaryNeeds: z.array(z.string()).optional(),
  needLevel: z.enum(['UNIVERSAL', 'TARGETED', 'SPECIALIST', 'HIGHLY_SPECIALIST']).optional(),
  progressRAG: z.enum(['RED', 'AMBER', 'GREEN']).optional(),
  requiresUrgentAction: z.boolean().optional(),
  nextReviewDate: z.string().datetime().optional()
});

const actionItemUpdateSchema = z.object({
  itemId: z.string().uuid(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  notes: z.string().optional()
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
    const schoolId = searchParams.get('schoolId') || (session.tenant_id != null ? String(session.tenant_id) : undefined);

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID required' },
        { status: 400 }
      );
    }

    // Get dashboard overview
    if (action === 'dashboard' || !action) {
      const metrics = await sencoService.getDashboardMetrics(schoolId);
      return NextResponse.json({
        success: true,
        data: metrics
      });
    }

    // Get SEND register
    if (action === 'register') {
      const page = parseInt(searchParams.get('page') || '1');
      const yearGroup = searchParams.get('yearGroup') || undefined;
      const sendStatus = searchParams.get('sendStatus') || undefined;
      const primaryNeed = searchParams.get('primaryNeed') || undefined;
      const progressRAG = searchParams.get('progressRAG') || undefined;
      const keyWorker = searchParams.get('keyWorker') || undefined;
      const hasOverdueReview = searchParams.get('hasOverdueReview') === 'true';
      const requiresUrgentAction = searchParams.get('requiresUrgentAction') === 'true';

      const register = await sencoService.getSENDRegister(
        schoolId,
        { yearGroup, sendStatus, primaryNeed, progressRAG, keyWorker, hasOverdueReview, requiresUrgentAction },
        page
      );

      return NextResponse.json({
        success: true,
        data: register
      });
    }

    // Get caseload summary
    if (action === 'caseload') {
      const summary = await sencoService.getCaseloadSummary(schoolId);
      return NextResponse.json({
        success: true,
        data: summary
      });
    }

    // Get compliance status
    if (action === 'compliance') {
      const compliance = await sencoService.getComplianceStatus(schoolId);
      return NextResponse.json({
        success: true,
        data: compliance
      });
    }

    // Get statutory deadlines
    if (action === 'deadlines') {
      const deadlines = await sencoService.getStatutoryDeadlines(schoolId);
      return NextResponse.json({
        success: true,
        data: deadlines
      });
    }

    // Get action items
    if (action === 'actions') {
      const priority = searchParams.get('priority') || undefined;
      const type = searchParams.get('type') || undefined;
      const status = searchParams.get('status') || undefined;

      const actions = await sencoService.getActionItems(
        schoolId,
        session.id,
        { priority, type, status }
      );

      return NextResponse.json({
        success: true,
        data: actions
      });
    }

    // Get staff training needs
    if (action === 'training') {
      const trainingNeeds = await sencoService.getStaffTrainingNeeds(schoolId);
      return NextResponse.json({
        success: true,
        data: trainingNeeds
      });
    }

    // Get parent engagement metrics
    if (action === 'parentEngagement') {
      const engagement = await sencoService.getParentEngagementMetrics(schoolId);
      return NextResponse.json({
        success: true,
        data: engagement
      });
    }

    return NextResponse.json(
      { error: 'Invalid action parameter' },
      { status: 400 }
    );

  } catch (error) {
    console.error('SENCO GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve SENCO data' },
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
    const schoolId = searchParams.get('schoolId') || (session.tenant_id != null ? String(session.tenant_id) : undefined);

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID required' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Add student to SEND register
    if (action === 'addToRegister') {
      const validated = registerEntrySchema.parse(body);
      
      const entry = await sencoService.addToRegister(schoolId, validated.studentId, {
        sendStatus: validated.sendStatus,
        primaryNeed: validated.primaryNeed,
        secondaryNeeds: validated.secondaryNeeds,
        needLevel: validated.needLevel,
        identifiedBy: validated.identifiedBy,
        reason: validated.reason
      });

      return NextResponse.json({
        success: true,
        data: entry,
        message: 'Student added to SEND register'
      }, { status: 201 });
    }

    // Generate action items from compliance
    if (action === 'generateActions') {
      const count = await sencoService.generateActionItems(schoolId);
      return NextResponse.json({
        success: true,
        data: { itemsCreated: count },
        message: `${count} action items generated`
      });
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
    console.error('SENCO POST error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// PUT handler
export async function PUT(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    // Update register entry
    if (action === 'updateEntry') {
      const validated = updateEntrySchema.parse(body);
      
      const entry = await sencoService.updateRegisterEntry(validated.entryId, {
        sendStatus: validated.sendStatus,
        primaryNeed: validated.primaryNeed,
        secondaryNeeds: validated.secondaryNeeds,
        needLevel: validated.needLevel,
        progressRAG: validated.progressRAG,
        requiresUrgentAction: validated.requiresUrgentAction,
        nextReviewDate: validated.nextReviewDate ? new Date(validated.nextReviewDate) : undefined
      } as Record<string, unknown>);

      return NextResponse.json({
        success: true,
        data: entry,
        message: 'Register entry updated'
      });
    }

    // Update action item
    if (action === 'updateAction') {
      const validated = actionItemUpdateSchema.parse(body);
      
      const item = await sencoService.updateActionItem(
        validated.itemId,
        session.id,
        { status: validated.status, notes: validated.notes }
      );

      return NextResponse.json({
        success: true,
        data: item,
        message: 'Action item updated'
      });
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
    console.error('SENCO PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update' },
      { status: 500 }
    );
  }
}
