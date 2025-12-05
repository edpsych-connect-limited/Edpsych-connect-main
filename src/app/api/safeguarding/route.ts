/**
 * Safeguarding API Routes
 * 
 * Secure endpoints for safeguarding concerns, referrals, and reporting.
 * Compliant with KCSIE 2023 and Working Together 2018.
 * 
 * SECURITY: All access is logged and audited.
 * 
 * @route /api/safeguarding
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createSafeguardingService } from '@/lib/safeguarding/safeguarding.service';
import { logger } from '@/lib/logger';

// ============================================================================
// Helper: Check Safeguarding Permissions
// ============================================================================

function hasSafeguardingAccess(role: string): boolean {
  const authorisedRoles = [
    'admin', 'super_admin', 'dsl', 'deputy_dsl', 
    'senco', 'headteacher', 'safeguarding_officer'
  ];
  return authorisedRoles.includes(role.toLowerCase());
}

function isDSL(role: string): boolean {
  return ['dsl', 'deputy_dsl', 'headteacher', 'admin', 'super_admin'].includes(role.toLowerCase());
}

// ============================================================================
// GET /api/safeguarding
// Get concerns, dashboard, or reports
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorised' },
        { status: 401 }
      );
    }

    const userRole = (session.user as { role?: string }).role || '';
    const userId = parseInt((session.user as { id?: string }).id || '0');
    
    // Check safeguarding access
    if (!hasSafeguardingAccess(userRole)) {
      logger.warn(`[SafeguardingAPI] Unauthorised access attempt by user ${userId} with role ${userRole}`);
      return NextResponse.json(
        { error: 'Insufficient permissions for safeguarding access' },
        { status: 403 }
      );
    }

    const tenantId = (session.user as { tenantId?: number }).tenantId || 1;
    const service = createSafeguardingService(tenantId);
    
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'dashboard';

    switch (action) {
      case 'dashboard': {
        if (!isDSL(userRole)) {
          return NextResponse.json(
            { error: 'DSL dashboard requires DSL role' },
            { status: 403 }
          );
        }
        const dashboard = await service.getDSLDashboard();
        return NextResponse.json({ dashboard });
      }

      case 'concern': {
        const concernId = searchParams.get('id');
        if (!concernId) {
          return NextResponse.json(
            { error: 'Concern ID is required' },
            { status: 400 }
          );
        }
        const concern = await service.getConcern(concernId, userId);
        return NextResponse.json({ concern });
      }

      case 'pending-review': {
        if (!isDSL(userRole)) {
          return NextResponse.json(
            { error: 'Review access requires DSL role' },
            { status: 403 }
          );
        }
        const concerns = await service.getConcernsForReview();
        return NextResponse.json({ concerns });
      }

      case 'overdue-actions': {
        if (!isDSL(userRole)) {
          return NextResponse.json(
            { error: 'Action management requires DSL role' },
            { status: 403 }
          );
        }
        const actions = await service.getOverdueActions();
        return NextResponse.json({ actions });
      }

      case 'student-chronology': {
        const studentId = parseInt(searchParams.get('studentId') || '0');
        if (!studentId) {
          return NextResponse.json(
            { error: 'Student ID is required' },
            { status: 400 }
          );
        }
        const chronology = await service.getStudentChronology(studentId);
        return NextResponse.json({ chronology });
      }

      case 'cp-plans': {
        if (!isDSL(userRole)) {
          return NextResponse.json(
            { error: 'CP plan access requires DSL role' },
            { status: 403 }
          );
        }
        const plans = await service.getActiveCPPlans();
        return NextResponse.json({ plans });
      }

      case 'training-status': {
        if (!isDSL(userRole)) {
          return NextResponse.json(
            { error: 'Training status requires DSL role' },
            { status: 403 }
          );
        }
        const trainingStatus = await service.getStaffTrainingStatus();
        return NextResponse.json({ trainingStatus });
      }

      case 'indicators': {
        const category = searchParams.get('category') as any;
        if (!category) {
          return NextResponse.json(
            { error: 'Category is required' },
            { status: 400 }
          );
        }
        const indicators = service.getIndicators(category);
        return NextResponse.json({ indicators });
      }

      case 'guidance': {
        const severity = searchParams.get('severity') as any;
        if (!severity) {
          return NextResponse.json(
            { error: 'Severity is required' },
            { status: 400 }
          );
        }
        const guidance = service.getReferralGuidance(severity);
        return NextResponse.json({ guidance });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('[SafeguardingAPI] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve safeguarding data' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/safeguarding
// Create concerns, actions, or referrals
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorised' },
        { status: 401 }
      );
    }

    const userRole = (session.user as { role?: string }).role || '';
    const userId = parseInt((session.user as { id?: string }).id || '0');
    
    // All staff can report concerns
    const tenantId = (session.user as { tenantId?: number }).tenantId || 1;
    const service = createSafeguardingService(tenantId);
    
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'report-concern': {
        // Any staff member can report a concern
        const concernId = await service.reportConcern(data.concern, userId);
        logger.info(`[SafeguardingAPI] Concern ${concernId} reported by user ${userId}`);
        return NextResponse.json({ 
          success: true,
          concernId,
          message: 'Safeguarding concern reported. DSL will review.'
        });
      }

      case 'create-action': {
        if (!isDSL(userRole)) {
          return NextResponse.json(
            { error: 'Creating actions requires DSL role' },
            { status: 403 }
          );
        }
        const { concernId, actionData } = data;
        const actionId = await service.createAction(concernId, actionData, userId);
        return NextResponse.json({ 
          success: true,
          actionId,
          message: 'Action created successfully'
        });
      }

      case 'mash-referral': {
        if (!isDSL(userRole)) {
          return NextResponse.json(
            { error: 'MASH referrals require DSL role' },
            { status: 403 }
          );
        }
        const { concernId, referralDetails } = data;
        const referralId = await service.makeMASHReferral(concernId, referralDetails, userId);
        logger.info(`[SafeguardingAPI] MASH referral ${referralId} made by user ${userId}`);
        return NextResponse.json({ 
          success: true,
          referralId,
          message: 'MASH referral submitted'
        });
      }

      case 'lado-referral': {
        if (!isDSL(userRole)) {
          return NextResponse.json(
            { error: 'LADO referrals require DSL role' },
            { status: 403 }
          );
        }
        const referralId = await service.makeLADOReferral(data.details);
        logger.info(`[SafeguardingAPI] LADO referral ${referralId} made by user ${userId}`);
        return NextResponse.json({ 
          success: true,
          referralId,
          message: 'LADO referral submitted'
        });
      }

      case 'prevent-referral': {
        if (!isDSL(userRole)) {
          return NextResponse.json(
            { error: 'Prevent referrals require DSL role' },
            { status: 403 }
          );
        }
        const { studentId, concerns } = data;
        const referralId = await service.makePreventReferral(studentId, concerns, userId);
        return NextResponse.json({ 
          success: true,
          referralId,
          message: 'Prevent referral submitted'
        });
      }

      case 'record-cp-plan': {
        if (!isDSL(userRole)) {
          return NextResponse.json(
            { error: 'Recording CP plans requires DSL role' },
            { status: 403 }
          );
        }
        const planId = await service.recordCPPlan(data.plan);
        return NextResponse.json({ 
          success: true,
          planId,
          message: 'CP plan recorded'
        });
      }

      case 'add-chronology': {
        if (!isDSL(userRole)) {
          return NextResponse.json(
            { error: 'Adding chronology requires DSL role' },
            { status: 403 }
          );
        }
        const { concernId, entry } = data;
        await service.addChronologyEntry(concernId, entry, userId);
        return NextResponse.json({ 
          success: true,
          message: 'Chronology entry added'
        });
      }

      case 'record-training': {
        if (!isDSL(userRole)) {
          return NextResponse.json(
            { error: 'Recording training requires DSL role' },
            { status: 403 }
          );
        }
        const { staffUserId, training } = data;
        await service.recordStaffTraining(staffUserId, training);
        return NextResponse.json({ 
          success: true,
          message: 'Training recorded'
        });
      }

      case 'generate-report': {
        if (!isDSL(userRole)) {
          return NextResponse.json(
            { error: 'Generating reports requires DSL role' },
            { status: 403 }
          );
        }
        const { reportType, period } = data;
        const report = await service.generateReport(reportType, period);
        return NextResponse.json({ 
          success: true,
          report
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('[SafeguardingAPI] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to process safeguarding request' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT /api/safeguarding
// Update concerns or complete actions
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorised' },
        { status: 401 }
      );
    }

    const userRole = (session.user as { role?: string }).role || '';
    const userId = parseInt((session.user as { id?: string }).id || '0');
    
    if (!isDSL(userRole)) {
      return NextResponse.json(
        { error: 'Updating safeguarding records requires DSL role' },
        { status: 403 }
      );
    }

    const tenantId = (session.user as { tenantId?: number }).tenantId || 1;
    const service = createSafeguardingService(tenantId);
    
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'update-status': {
        const { concernId, status, notes } = data;
        await service.updateConcernStatus(concernId, status, userId, notes);
        return NextResponse.json({ 
          success: true,
          message: 'Concern status updated'
        });
      }

      case 'review-concern': {
        const { concernId, decision } = data;
        await service.reviewConcern(concernId, userId, decision);
        return NextResponse.json({ 
          success: true,
          message: 'Concern reviewed'
        });
      }

      case 'complete-action': {
        const { actionId, outcome } = data;
        await service.completeAction(actionId, outcome, userId);
        return NextResponse.json({ 
          success: true,
          message: 'Action completed'
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('[SafeguardingAPI] PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update safeguarding record' },
      { status: 500 }
    );
  }
}
