import authService from '@/lib/auth/auth-service';
/**
 * Assessment Analytics API Routes
 * 
 * Endpoints for assessment tracking, analysis, and visualization.
 * 
 * Supports video claims:
 * - Assessment progress tracking
 * - Data-driven insights
 * - Learning gap identification
 * - National benchmark comparison
 * 
 * @route /api/assessment/analytics
 */

import { NextRequest, NextResponse } from 'next/server';


import { createAssessmentAnalyticsService } from '@/lib/assessment/assessment-analytics.service';
import { logger } from '@/lib/logger';

// ============================================================================
// GET /api/assessment/analytics
// Retrieve assessment data, reports, and visualizations
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorised' },
        { status: 401 }
      );
    }

    const tenantId = (session as { tenantId?: number }).tenantId || 1;
    const service = createAssessmentAnalyticsService(tenantId);
    
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'student-profile';

    switch (action) {
      case 'assessment': {
        const assessmentId = searchParams.get('id');
        if (!assessmentId) {
          return NextResponse.json(
            { error: 'Assessment ID is required' },
            { status: 400 }
          );
        }
        const assessment = await service.getAssessment(assessmentId);
        return NextResponse.json({ assessment });
      }

      case 'student-profile': {
        const studentId = parseInt(searchParams.get('studentId') || '0');
        if (!studentId) {
          return NextResponse.json(
            { error: 'Student ID is required' },
            { status: 400 }
          );
        }
        const profile = await service.getStudentProfile(studentId);
        return NextResponse.json({ profile });
      }

      case 'student-history': {
        const studentId = parseInt(searchParams.get('studentId') || '0');
        if (!studentId) {
          return NextResponse.json(
            { error: 'Student ID is required' },
            { status: 400 }
          );
        }
        const subject = searchParams.get('subject') as any;
        const type = searchParams.get('type') as any;
        const academicYear = searchParams.get('academicYear') || undefined;
        
        const history = await service.getStudentAssessmentHistory(studentId, {
          subject,
          type,
          academicYear,
        });
        return NextResponse.json({ history });
      }

      case 'compare': {
        const baselineId = searchParams.get('baselineId');
        const currentId = searchParams.get('currentId');
        if (!baselineId || !currentId) {
          return NextResponse.json(
            { error: 'Baseline and current assessment IDs are required' },
            { status: 400 }
          );
        }
        const comparison = await service.compareAssessments(baselineId, currentId);
        return NextResponse.json({ comparison });
      }

      case 'flight-path': {
        const studentId = parseInt(searchParams.get('studentId') || '0');
        const subject = searchParams.get('subject') as any;
        if (!studentId || !subject) {
          return NextResponse.json(
            { error: 'Student ID and subject are required' },
            { status: 400 }
          );
        }
        const flightPath = await service.generateFlightPath(studentId, subject);
        return NextResponse.json({ flightPath });
      }

      case 'learning-gaps': {
        const studentId = parseInt(searchParams.get('studentId') || '0');
        if (!studentId) {
          return NextResponse.json(
            { error: 'Student ID is required' },
            { status: 400 }
          );
        }
        const gaps = await service.identifyLearningGaps(studentId);
        return NextResponse.json({ gaps });
      }

      case 'cohort-analytics': {
        const yearGroup = parseInt(searchParams.get('yearGroup') || '0');
        const academicYear = searchParams.get('academicYear');
        if (!yearGroup || !academicYear) {
          return NextResponse.json(
            { error: 'Year group and academic year are required' },
            { status: 400 }
          );
        }
        const analytics = await service.getCohortAnalytics(yearGroup, academicYear);
        return NextResponse.json({ analytics });
      }

      case 'national-comparison': {
        const yearGroup = parseInt(searchParams.get('yearGroup') || '0');
        const subject = searchParams.get('subject') as any;
        if (!yearGroup || !subject) {
          return NextResponse.json(
            { error: 'Year group and subject are required' },
            { status: 400 }
          );
        }
        const comparison = await service.compareToNational(yearGroup, subject);
        return NextResponse.json({ comparison });
      }

      case 'gap-analysis': {
        const yearGroup = parseInt(searchParams.get('yearGroup') || '0');
        const subject = searchParams.get('subject') as any;
        const groups = searchParams.get('groups')?.split(',') || ['PP', 'SEND', 'EAL'];
        if (!yearGroup || !subject) {
          return NextResponse.json(
            { error: 'Year group and subject are required' },
            { status: 400 }
          );
        }
        const analysis = await service.getGapAnalysis(yearGroup, subject, groups);
        return NextResponse.json({ analysis });
      }

      case 'students-at-risk': {
        const yearGroup = searchParams.get('yearGroup') ? parseInt(searchParams.get('yearGroup')!) : undefined;
        const threshold = searchParams.get('threshold') as any || 'below';
        const students = await service.getStudentsAtRisk(yearGroup, threshold);
        return NextResponse.json({ students });
      }

      case 'progress-report': {
        const studentId = parseInt(searchParams.get('studentId') || '0');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        if (!studentId || !startDate || !endDate) {
          return NextResponse.json(
            { error: 'Student ID, start date, and end date are required' },
            { status: 400 }
          );
        }
        const report = await service.generateProgressReport(studentId, {
          start: new Date(startDate),
          end: new Date(endDate),
        });
        return NextResponse.json({ report });
      }

      case 'governors-report': {
        const academicYear = searchParams.get('academicYear');
        if (!academicYear) {
          return NextResponse.json(
            { error: 'Academic year is required' },
            { status: 400 }
          );
        }
        const report = await service.generateGovernorsReport(academicYear);
        return NextResponse.json({ report });
      }

      case 'progress-chart': {
        const studentId = parseInt(searchParams.get('studentId') || '0');
        const subjects = searchParams.get('subjects')?.split(',') as any[];
        if (!studentId || !subjects) {
          return NextResponse.json(
            { error: 'Student ID and subjects are required' },
            { status: 400 }
          );
        }
        const chartData = await service.getProgressChartData(studentId, subjects);
        return NextResponse.json({ chartData });
      }

      case 'distribution-chart': {
        const yearGroup = parseInt(searchParams.get('yearGroup') || '0');
        const subject = searchParams.get('subject') as any;
        if (!yearGroup || !subject) {
          return NextResponse.json(
            { error: 'Year group and subject are required' },
            { status: 400 }
          );
        }
        const chartData = await service.getDistributionChartData(yearGroup, subject);
        return NextResponse.json({ chartData });
      }

      case 'progress-quadrant': {
        const yearGroup = parseInt(searchParams.get('yearGroup') || '0');
        if (!yearGroup) {
          return NextResponse.json(
            { error: 'Year group is required' },
            { status: 400 }
          );
        }
        const quadrantData = await service.getProgressQuadrantData(yearGroup);
        return NextResponse.json({ quadrantData });
      }

      case 'predict': {
        const studentId = parseInt(searchParams.get('studentId') || '0');
        const subject = searchParams.get('subject') as any;
        if (!studentId || !subject) {
          return NextResponse.json(
            { error: 'Student ID and subject are required' },
            { status: 400 }
          );
        }
        const prediction = await service.predictOutcomes(studentId, subject);
        return NextResponse.json({ prediction });
      }

      case 'ai-insights': {
        const scope = searchParams.get('scope') as any || 'student';
        const id = searchParams.get('id') || '';
        const insights = await service.getAIInsights(scope, id);
        return NextResponse.json({ insights });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('[AssessmentAnalyticsAPI] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve assessment data' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/assessment/analytics
// Record assessments or generate reports
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorised' },
        { status: 401 }
      );
    }

    const tenantId = (session as { tenantId?: number }).tenantId || 1;
    const userId = parseInt((session as { id?: string }).id || '0');
    const service = createAssessmentAnalyticsService(tenantId);
    
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'record-assessment': {
        const assessmentId = await service.recordAssessment({
          ...data.assessment,
          assessedBy: userId,
        });
        return NextResponse.json({ 
          success: true,
          assessmentId,
          message: 'Assessment recorded successfully'
        });
      }

      case 'bulk-import': {
        const result = await service.bulkImportAssessments(data.assessments);
        return NextResponse.json({ 
          success: true,
          ...result
        });
      }

      case 'submit-moderation': {
        const { assessmentIds } = data;
        await service.submitForModeration(assessmentIds);
        return NextResponse.json({ 
          success: true,
          message: 'Assessments submitted for moderation'
        });
      }

      case 'record-moderation': {
        const { assessmentId, outcome } = data;
        await service.recordModeration(assessmentId, userId, outcome);
        return NextResponse.json({ 
          success: true,
          message: 'Moderation recorded'
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('[AssessmentAnalyticsAPI] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to process assessment data' },
      { status: 500 }
    );
  }
}
