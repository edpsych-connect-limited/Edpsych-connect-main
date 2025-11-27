/**
 * FILE: src/app/api/progress/dashboard/route.ts
 * PURPOSE: Progress dashboard data API - Database-backed
 *
 * ENDPOINT: GET /api/progress/dashboard
 * AUTH: Required (verified user)
 *
 * QUERY PARAMS:
 * - caseId: Case ID (optional)
 * - studentId: Student ID (optional)
 * - timeRange: week | month | term | year
 * - domains: Comma-separated list of domains (optional)
 *
 * RESPONSE:
 * {
 *   interventions: InterventionProgress[],
 *   outcomes: OutcomeProgress[],
 *   alerts: ProgressAlert[],
 *   summary: DashboardSummary
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/auth-service';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// ============================================================================
// TYPES
// ============================================================================

interface InterventionProgress {
  id: number;
  name: string;
  status: string;
  domain: string;
  targetBehavior: string;
  startDate: string;
  reviewDate: string;
  progressMeasure: string;
  baseline: number | null;
  current: number | null;
  target: number | null;
  progressPercentage: number;
  trend: 'improving' | 'stable' | 'declining' | 'unknown';
  sessionsCompleted: number;
  sessionsPlanned: number;
  fidelityScore: number;
  dataPoints: DataPoint[];
}

interface DataPoint {
  date: string;
  value: number;
  note?: string;
}

interface OutcomeProgress {
  id: number;
  description: string;
  domain: string;
  targetDate: string;
  status: 'not_started' | 'in_progress' | 'achieved' | 'partially_achieved' | 'not_achieved';
  progressRating: number; // 0-100
  evidence: string[];
  linkedInterventions: number[];
}

interface ProgressAlert {
  type: 'review_due' | 'declining_progress' | 'low_fidelity' | 'goal_achieved' | 'no_data';
  severity: 'critical' | 'warning' | 'info';
  interventionId: number;
  interventionName: string;
  message: string;
  actionRequired: string;
  createdAt: string;
}

interface DashboardSummary {
  totalInterventions: number;
  activeInterventions: number;
  completedInterventions: number;
  averageProgress: number;
  averageFidelity: number;
  outcomesAchieved: number;
  outcomesInProgress: number;
  alertsCount: {
    critical: number;
    warning: number;
    info: number;
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/*
function calculateTrend(dataPoints: DataPoint[]): 'improving' | 'stable' | 'declining' | 'unknown' {
  if (dataPoints.length < 3) return 'unknown';

  // Simple linear regression to determine trend
  const recentPoints = dataPoints.slice(-5); // Last 5 data points
  const n = recentPoints.length;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  recentPoints.forEach((point, index) => {
    const x = index;
    const y = point.value;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

  if (slope > 0.1) return 'improving';
  if (slope < -0.1) return 'declining';
  return 'stable';
}

function calculateProgressPercentage(baseline: number | null, current: number | null, target: number | null): number {
  if (baseline === null || current === null || target === null) return 0;
  if (target === baseline) return 100; // Edge case

  const progress = current - baseline;
  const targetProgress = target - baseline;

  return Math.min(100, Math.max(0, Math.round((progress / targetProgress) * 100)));
}
*/

function generateAlerts(interventions: InterventionProgress[]): ProgressAlert[] {
  const alerts: ProgressAlert[] = [];
  const now = new Date();

  interventions.forEach((intervention) => {
    // Review due alerts
    const reviewDate = new Date(intervention.reviewDate);
    const daysUntilReview = Math.ceil((reviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilReview <= 7 && daysUntilReview > 0) {
      alerts.push({
        type: 'review_due',
        severity: daysUntilReview <= 3 ? 'critical' : 'warning',
        interventionId: intervention.id,
        interventionName: intervention.name,
        message: `Review due in ${daysUntilReview} days`,
        actionRequired: 'Schedule and complete intervention review meeting',
        createdAt: now.toISOString(),
      });
    } else if (daysUntilReview < 0) {
      alerts.push({
        type: 'review_due',
        severity: 'critical',
        interventionId: intervention.id,
        interventionName: intervention.name,
        message: `Review overdue by ${Math.abs(daysUntilReview)} days`,
        actionRequired: 'Complete overdue review immediately',
        createdAt: now.toISOString(),
      });
    }

    // Declining progress alerts
    if (intervention.trend === 'declining') {
      alerts.push({
        type: 'declining_progress',
        severity: 'warning',
        interventionId: intervention.id,
        interventionName: intervention.name,
        message: 'Progress data shows declining trend',
        actionRequired: 'Review intervention fidelity and consider adjustments',
        createdAt: now.toISOString(),
      });
    }

    // Low fidelity alerts
    if (intervention.fidelityScore < 75) {
      alerts.push({
        type: 'low_fidelity',
        severity: intervention.fidelityScore < 60 ? 'critical' : 'warning',
        interventionId: intervention.id,
        interventionName: intervention.name,
        message: `Implementation fidelity at ${intervention.fidelityScore}%`,
        actionRequired: 'Provide additional training or support for implementers',
        createdAt: now.toISOString(),
      });
    }

    // Goal achieved alerts
    if (intervention.progressPercentage >= 100) {
      alerts.push({
        type: 'goal_achieved',
        severity: 'info',
        interventionId: intervention.id,
        interventionName: intervention.name,
        message: 'Target goal achieved!',
        actionRequired: 'Consider updating target or completing intervention',
        createdAt: now.toISOString(),
      });
    }

    // No recent data alerts
    if (intervention.dataPoints.length > 0) {
      const lastDataPoint = intervention.dataPoints[intervention.dataPoints.length - 1];
      const lastDataDate = new Date(lastDataPoint.date);
      const daysSinceLastData = Math.ceil((now.getTime() - lastDataDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSinceLastData > 14) {
        alerts.push({
          type: 'no_data',
          severity: 'warning',
          interventionId: intervention.id,
          interventionName: intervention.name,
          message: `No data recorded for ${daysSinceLastData} days`,
          actionRequired: 'Ensure data collection is ongoing',
          createdAt: now.toISOString(),
        });
      }
    }
  });

  return alerts.sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

// ============================================================================
// API HANDLER
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('caseId');
    // const studentId = searchParams.get('studentId');
    const timeRange = searchParams.get('timeRange') || 'month';
    // const domains = searchParams.get('domains')?.split(',');

    // Calculate date range based on timeRange
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'term':
        startDate.setMonth(now.getMonth() - 4);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Fetch real interventions from database
    const dbInterventions = await prisma.interventions.findMany({
      where: {
        ...(caseId ? { case_id: parseInt(caseId) } : {}),
        start_date: {
          gte: startDate,
        },
      },
      include: {
        cases: {
          include: {
            students: true,
          },
        },
        creator: true,
        implementer: true,
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 50,
    });

    // Fetch student progress snapshots for outcomes data
    const progressSnapshots = await prisma.studentProgressSnapshot.findMany({
      where: {
        snapshot_date: {
          gte: startDate,
        },
      },
      orderBy: {
        snapshot_date: 'desc',
      },
      take: 50,
    });

    // Transform database interventions to API format
    const interventions: InterventionProgress[] = dbInterventions.map((intervention) => {
      // Default progress tracking when detailed data not available
      const defaultProgress = {
        baseline: null,
        current: null,
        target: null,
        progressPercentage: 0,
        trend: 'unknown' as const,
        dataPoints: [] as DataPoint[],
      };

      // Calculate days since start for session estimates
      const startDateObj = intervention.start_date ? new Date(intervention.start_date) : new Date();
      const daysSinceStart = Math.floor((now.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24));
      const estimatedSessions = Math.floor(daysSinceStart / 2); // Assuming sessions every 2 days

      return {
        id: intervention.id,
        name: intervention.intervention_type,
        status: intervention.status,
        domain: 'General', // Extended field - would need schema update for detailed domains
        targetBehavior: intervention.intervention_type,
        startDate: intervention.start_date?.toISOString() || now.toISOString(),
        reviewDate: intervention.end_date?.toISOString() || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        progressMeasure: 'Sessions completed',
        ...defaultProgress,
        sessionsCompleted: estimatedSessions,
        sessionsPlanned: estimatedSessions + 10,
        fidelityScore: 85, // Default fidelity until tracking implemented
      };
    });

    // Transform progress snapshots to outcomes
    const outcomes: OutcomeProgress[] = progressSnapshots.slice(0, 10).map((snapshot, index) => ({
      id: index + 1,
      description: `Progress snapshot from ${snapshot.snapshot_date.toLocaleDateString()}`,
      domain: 'General',
      targetDate: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months ahead
      status: 'in_progress' as const,
      progressRating: snapshot.active_interventions > 0 ? 50 : 0,
      evidence: snapshot.milestones_achieved || [],
      linkedInterventions: [],
    }));

    const alerts = generateAlerts(interventions);

    const summary: DashboardSummary = {
      totalInterventions: interventions.length,
      activeInterventions: interventions.filter((i) => i.status === 'active').length,
      completedInterventions: interventions.filter((i) => i.status === 'completed').length,
      averageProgress: interventions.length > 0
        ? Math.round(interventions.reduce((sum, i) => sum + i.progressPercentage, 0) / interventions.length)
        : 0,
      averageFidelity: interventions.length > 0
        ? Math.round(interventions.reduce((sum, i) => sum + i.fidelityScore, 0) / interventions.length)
        : 0,
      outcomesAchieved: outcomes.filter((o) => o.status === 'achieved').length,
      outcomesInProgress: outcomes.filter((o) => o.status === 'in_progress').length,
      alertsCount: {
        critical: alerts.filter((a) => a.severity === 'critical').length,
        warning: alerts.filter((a) => a.severity === 'warning').length,
        info: alerts.filter((a) => a.severity === 'info').length,
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        interventions,
        outcomes,
        alerts,
        summary,
      },
      meta: {
        dataSource: 'database',
        timeRange,
        fetchedAt: now.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[Progress Dashboard API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch progress data',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
