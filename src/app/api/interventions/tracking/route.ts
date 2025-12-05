/**
 * Intervention Tracking API Routes
 * 
 * Endpoints for managing educational and therapeutic interventions,
 * tracking progress, and measuring outcomes.
 * 
 * Supports video claims:
 * - Evidence-based interventions
 * - Progress monitoring
 * - Outcome measurement
 * - Data-driven decisions
 * 
 * @route /api/interventions/tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createInterventionTrackingService } from '@/lib/interventions/intervention-tracking.service';
import { logger } from '@/lib/logger';

// ============================================================================
// GET /api/interventions/tracking
// Get interventions, programmes, or reports
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

    const tenantId = (session.user as { tenantId?: number }).tenantId || 1;
    const service = createInterventionTrackingService(tenantId);
    
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list';

    switch (action) {
      case 'get': {
        const interventionId = searchParams.get('id');
        if (!interventionId) {
          return NextResponse.json(
            { error: 'Intervention ID is required' },
            { status: 400 }
          );
        }
        const intervention = await service.getIntervention(interventionId);
        return NextResponse.json({ intervention });
      }

      case 'list': {
        const studentId = parseInt(searchParams.get('studentId') || '0');
        if (!studentId) {
          return NextResponse.json(
            { error: 'Student ID is required' },
            { status: 400 }
          );
        }
        const status = searchParams.get('status') as any;
        const category = searchParams.get('category') as any;
        const tier = searchParams.get('tier') as any;
        
        const interventions = await service.getStudentInterventions(studentId, {
          status,
          category,
          tier,
        });
        return NextResponse.json({ interventions });
      }

      case 'sessions': {
        const interventionId = searchParams.get('interventionId');
        if (!interventionId) {
          return NextResponse.json(
            { error: 'Intervention ID is required' },
            { status: 400 }
          );
        }
        const sessions = await service.getSessionHistory(interventionId);
        return NextResponse.json({ sessions });
      }

      case 'attendance': {
        const interventionId = searchParams.get('interventionId');
        if (!interventionId) {
          return NextResponse.json(
            { error: 'Intervention ID is required' },
            { status: 400 }
          );
        }
        const attendance = await service.calculateAttendance(interventionId);
        return NextResponse.json({ attendance });
      }

      case 'progress': {
        const interventionId = searchParams.get('interventionId');
        if (!interventionId) {
          return NextResponse.json(
            { error: 'Intervention ID is required' },
            { status: 400 }
          );
        }
        const trajectory = await service.calculateProgressTrajectory(interventionId);
        return NextResponse.json({ trajectory });
      }

      case 'effectiveness': {
        const interventionId = searchParams.get('interventionId');
        if (!interventionId) {
          return NextResponse.json(
            { error: 'Intervention ID is required' },
            { status: 400 }
          );
        }
        const effectiveness = await service.calculateEffectiveness(interventionId);
        return NextResponse.json({ effectiveness });
      }

      case 'reviews': {
        const interventionId = searchParams.get('interventionId');
        if (!interventionId) {
          return NextResponse.json(
            { error: 'Intervention ID is required' },
            { status: 400 }
          );
        }
        const reviews = await service.getReviewHistory(interventionId);
        return NextResponse.json({ reviews });
      }

      case 'due-for-review': {
        const days = parseInt(searchParams.get('days') || '7');
        const dueReviews = await service.getInterventionsDueForReview(days);
        return NextResponse.json({ dueReviews });
      }

      case 'impact-report': {
        const category = searchParams.get('category') as any;
        const tier = searchParams.get('tier') as any;
        const report = await service.generateImpactReport({
          category,
          tier,
        });
        return NextResponse.json({ report });
      }

      case 'provision-map': {
        const yearGroup = searchParams.get('yearGroup');
        const map = await service.getProvisionMap(
          yearGroup ? parseInt(yearGroup) : undefined
        );
        return NextResponse.json({ provisionMap: map });
      }

      case 'programmes': {
        const category = searchParams.get('category') as any;
        const programmes = await service.getProgrammes(category);
        return NextResponse.json({ programmes });
      }

      case 'recommended-programmes': {
        const studentId = parseInt(searchParams.get('studentId') || '0');
        const needsParam = searchParams.get('needs');
        if (!studentId || !needsParam) {
          return NextResponse.json(
            { error: 'Student ID and needs are required' },
            { status: 400 }
          );
        }
        const needs = needsParam.split(',');
        const programmes = await service.getRecommendedProgrammes(studentId, needs);
        return NextResponse.json({ programmes });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('[InterventionTrackingAPI] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve intervention data' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/interventions/tracking
// Create interventions, sessions, or reviews
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

    const tenantId = (session.user as { tenantId?: number }).tenantId || 1;
    const userId = parseInt((session.user as { id?: string }).id || '0');
    const service = createInterventionTrackingService(tenantId);
    
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'create-intervention': {
        const interventionId = await service.createIntervention({
          ...data,
          createdBy: userId,
        });
        return NextResponse.json({ 
          success: true,
          interventionId,
          message: 'Intervention created successfully'
        });
      }

      case 'record-session': {
        const { interventionId, session: sessionData } = data;
        const sessionId = await service.recordSession(interventionId, sessionData);
        return NextResponse.json({ 
          success: true,
          sessionId,
          message: 'Session recorded successfully'
        });
      }

      case 'record-assessment': {
        const { interventionId, assessmentPointId, result } = data;
        await service.recordAssessment(interventionId, assessmentPointId, result);
        return NextResponse.json({ 
          success: true,
          message: 'Assessment recorded successfully'
        });
      }

      case 'record-progress': {
        const { interventionId, dataPoint } = data;
        await service.recordProgress(interventionId, dataPoint);
        return NextResponse.json({ 
          success: true,
          message: 'Progress recorded successfully'
        });
      }

      case 'create-review': {
        const { interventionId, review } = data;
        const reviewId = await service.createReview(interventionId, {
          ...review,
          createdBy: userId,
        });
        return NextResponse.json({ 
          success: true,
          reviewId,
          message: 'Review created successfully'
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('[InterventionTrackingAPI] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to process intervention data' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT /api/interventions/tracking
// Update interventions or targets
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

    const tenantId = (session.user as { tenantId?: number }).tenantId || 1;
    const service = createInterventionTrackingService(tenantId);
    
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'update-intervention': {
        const { interventionId, updates } = data;
        await service.updateIntervention(interventionId, updates);
        return NextResponse.json({ 
          success: true,
          message: 'Intervention updated successfully'
        });
      }

      case 'update-target': {
        const { interventionId, targetId, updates } = data;
        await service.updateTarget(interventionId, targetId, updates);
        return NextResponse.json({ 
          success: true,
          message: 'Target updated successfully'
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('[InterventionTrackingAPI] PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update intervention data' },
      { status: 500 }
    );
  }
}
