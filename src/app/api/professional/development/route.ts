import authService from '@/lib/auth/auth-service';
/**
 * Professional Development API Routes
 * 
 * API endpoints for CPD tracking, skills assessment, and professional growth.
 * 
 * Zero Gap Project - Sprint 7
 */

import { NextRequest, NextResponse } from 'next/server';


import { createProfessionalDevelopmentService, CORE_SKILLS_FRAMEWORK } from '@/lib/professional/cpd-tracking.service';
import { logger } from '@/lib/logger';

// ============================================================================
// GET - Get professional development data
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session as any;
    const tenantId = user.tenantId;

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'profile';
    const userId = searchParams.get('userId');
    const targetUserId = userId ? parseInt(userId, 10) : user.id;

    // Check permissions for viewing other users' data
    if (targetUserId !== user.id && !['admin', 'headteacher', 'deputy_head'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to view other users\' development data' },
        { status: 403 }
      );
    }

    const service = createProfessionalDevelopmentService(tenantId);

    switch (type) {
      case 'profile': {
        const profile = await service.getProfile(targetUserId);
        if (!profile) {
          return NextResponse.json(
            { error: 'Profile not found' },
            { status: 404 }
          );
        }
        return NextResponse.json(profile);
      }

      case 'cpd_report': {
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        
        const reportStartDate = startDate 
          ? new Date(startDate) 
          : new Date(new Date().getFullYear(), 0, 1); // Start of year
        const reportEndDate = endDate 
          ? new Date(endDate) 
          : new Date();

        const report = await service.getCPDReport(targetUserId, reportStartDate, reportEndDate);
        return NextResponse.json(report);
      }

      case 'skills_gap': {
        const analysis = await service.getSkillsGapAnalysis(targetUserId);
        return NextResponse.json(analysis);
      }

      case 'recommended_training': {
        const training = await service.getRecommendedTraining(targetUserId);
        return NextResponse.json(training);
      }

      case 'certifications_renewal': {
        const renewals = await service.getCertificationsNeedingRenewal(targetUserId);
        return NextResponse.json(renewals);
      }

      case 'team_dashboard': {
        // Only managers can view team dashboard
        if (!['admin', 'headteacher', 'deputy_head', 'phase_leader'].includes(user.role)) {
          return NextResponse.json(
            { error: 'Manager access required' },
            { status: 403 }
          );
        }
        const dashboard = await service.getTeamDashboard();
        return NextResponse.json(dashboard);
      }

      case 'skills_heatmap': {
        if (!['admin', 'headteacher', 'deputy_head', 'phase_leader'].includes(user.role)) {
          return NextResponse.json(
            { error: 'Manager access required' },
            { status: 403 }
          );
        }
        const heatmap = await service.getSkillsHeatmap();
        return NextResponse.json(heatmap);
      }

      case 'framework': {
        return NextResponse.json(CORE_SKILLS_FRAMEWORK);
      }

      case 'search_training': {
        const trainingType = searchParams.get('trainingType');
        const format = searchParams.get('format');
        const skillCategory = searchParams.get('skillCategory');
        const maxCost = searchParams.get('maxCost');
        
        const training = await service.searchTraining({
          type: trainingType as any || undefined,
          format: format as any || undefined,
          skillCategory: skillCategory as any || undefined,
          maxCost: maxCost ? parseFloat(maxCost) : undefined,
        });
        return NextResponse.json(training);
      }

      default:
        return NextResponse.json(
          { error: 'Invalid type' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('[ProfDev API] GET error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch data';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Record CPD, create goals, add certifications
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session as any;
    const tenantId = user.tenantId;

    const body = await request.json();
    const { action } = body;

    const service = createProfessionalDevelopmentService(tenantId);

    switch (action) {
      case 'record_cpd': {
        const { training } = body;
        if (!training || !training.title) {
          return NextResponse.json(
            { error: 'Training details required' },
            { status: 400 }
          );
        }
        const id = await service.recordCPD(user.id, training);
        return NextResponse.json({
          success: true,
          message: 'CPD recorded',
          id,
        });
      }

      case 'create_goal': {
        const { goal } = body;
        if (!goal || !goal.title) {
          return NextResponse.json(
            { error: 'Goal details required' },
            { status: 400 }
          );
        }
        const id = await service.createGoal(user.id, goal);
        return NextResponse.json({
          success: true,
          message: 'Goal created',
          id,
        });
      }

      case 'add_certification': {
        const { certification } = body;
        if (!certification || !certification.name) {
          return NextResponse.json(
            { error: 'Certification details required' },
            { status: 400 }
          );
        }
        const id = await service.addCertification(user.id, certification);
        return NextResponse.json({
          success: true,
          message: 'Certification added',
          id,
        });
      }

      case 'self_assessment': {
        const { assessments } = body;
        if (!assessments || !Array.isArray(assessments)) {
          return NextResponse.json(
            { error: 'Assessments array required' },
            { status: 400 }
          );
        }
        await service.submitSelfAssessment(user.id, assessments);
        return NextResponse.json({
          success: true,
          message: 'Self-assessment submitted',
        });
      }

      case 'enrol_training': {
        const { trainingId } = body;
        if (!trainingId) {
          return NextResponse.json(
            { error: 'trainingId required' },
            { status: 400 }
          );
        }
        const enrolmentId = await service.enrollInTraining(user.id, trainingId);
        return NextResponse.json({
          success: true,
          message: 'Enrolled in training',
          enrolmentId,
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('[ProfDev API] POST error:', error);
    const message = error instanceof Error ? error.message : 'Action failed';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT - Update progress, complete milestones
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session as any;
    const tenantId = user.tenantId;

    const body = await request.json();
    const { action } = body;

    const service = createProfessionalDevelopmentService(tenantId);

    switch (action) {
      case 'update_goal_progress': {
        const { goalId, progress, notes } = body;
        if (!goalId || progress === undefined) {
          return NextResponse.json(
            { error: 'goalId and progress required' },
            { status: 400 }
          );
        }
        await service.updateGoalProgress(goalId, progress, notes);
        return NextResponse.json({
          success: true,
          message: 'Goal progress updated',
        });
      }

      case 'complete_milestone': {
        const { goalId, milestoneId, evidenceUrl } = body;
        if (!goalId || !milestoneId) {
          return NextResponse.json(
            { error: 'goalId and milestoneId required' },
            { status: 400 }
          );
        }
        await service.completeMilestone(goalId, milestoneId, evidenceUrl);
        return NextResponse.json({
          success: true,
          message: 'Milestone completed',
        });
      }

      case 'update_profile': {
        const { updates } = body;
        if (!updates) {
          return NextResponse.json(
            { error: 'Updates required' },
            { status: 400 }
          );
        }
        await service.updateProfile(user.id, updates);
        return NextResponse.json({
          success: true,
          message: 'Profile updated',
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('[ProfDev API] PUT error:', error);
    const message = error instanceof Error ? error.message : 'Update failed';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
