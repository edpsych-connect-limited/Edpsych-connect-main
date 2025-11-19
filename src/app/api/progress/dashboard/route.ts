/**
 * FILE: src/app/api/progress/dashboard/route.ts
 * PURPOSE: Progress dashboard data API
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
import prisma from '@/lib/prismaSafe';
import authService from '@/lib/auth/auth-service';

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
    const studentId = searchParams.get('studentId');
    const timeRange = searchParams.get('timeRange') || 'month';
    const domains = searchParams.get('domains')?.split(',');

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

    // In production, this would fetch real data from database
    // For now, generating realistic mock data structure

    const mockInterventions: InterventionProgress[] = [
      {
        id: 1,
        name: 'Reading Fluency - Precision Teaching',
        status: 'active',
        domain: 'Literacy',
        targetBehavior: 'CVC word reading fluency',
        startDate: '2025-09-01',
        reviewDate: '2025-12-01',
        progressMeasure: 'Words correct per minute',
        baseline: 20,
        current: 38,
        target: 40,
        progressPercentage: 90,
        trend: 'improving',
        sessionsCompleted: 42,
        sessionsPlanned: 48,
        fidelityScore: 95,
        dataPoints: [
          { date: '2025-09-01', value: 20 },
          { date: '2025-09-08', value: 22 },
          { date: '2025-09-15', value: 25 },
          { date: '2025-09-22', value: 28 },
          { date: '2025-09-29', value: 30 },
          { date: '2025-10-06', value: 32 },
          { date: '2025-10-13', value: 34 },
          { date: '2025-10-20', value: 36 },
          { date: '2025-10-27', value: 38 },
        ],
      },
      {
        id: 2,
        name: 'Self-Regulation - Zones of Regulation',
        status: 'active',
        domain: 'Social-Emotional',
        targetBehavior: 'Independent emotion regulation',
        startDate: '2025-09-15',
        reviewDate: '2025-11-30',
        progressMeasure: 'Self-regulation episodes per day',
        baseline: 2,
        current: 5,
        target: 7,
        progressPercentage: 60,
        trend: 'improving',
        sessionsCompleted: 28,
        sessionsPlanned: 36,
        fidelityScore: 88,
        dataPoints: [
          { date: '2025-09-15', value: 2 },
          { date: '2025-09-22', value: 3 },
          { date: '2025-09-29', value: 3 },
          { date: '2025-10-06', value: 4 },
          { date: '2025-10-13', value: 4 },
          { date: '2025-10-20', value: 5 },
          { date: '2025-10-27', value: 5 },
        ],
      },
      {
        id: 3,
        name: 'Math Fluency - CPA Approach',
        status: 'active',
        domain: 'Numeracy',
        targetBehavior: 'Addition facts automaticity',
        startDate: '2025-10-01',
        reviewDate: '2025-12-15',
        progressMeasure: 'Correct responses per minute',
        baseline: 15,
        current: 15,
        target: 30,
        progressPercentage: 0,
        trend: 'stable',
        sessionsCompleted: 18,
        sessionsPlanned: 40,
        fidelityScore: 72,
        dataPoints: [
          { date: '2025-10-01', value: 15 },
          { date: '2025-10-08', value: 16 },
          { date: '2025-10-15', value: 15 },
          { date: '2025-10-22', value: 15 },
          { date: '2025-10-29', value: 15 },
        ],
      },
    ];

    const mockOutcomes: OutcomeProgress[] = [
      {
        id: 1,
        description: 'Student will read age-appropriate texts fluently',
        domain: 'Literacy',
        targetDate: '2026-07-01',
        status: 'in_progress',
        progressRating: 85,
        evidence: [
          'Reading fluency improved from 20 to 38 wcpm',
          'Now reading at age-expected level (Y3)',
          'Increased confidence in reading tasks',
        ],
        linkedInterventions: [1],
      },
      {
        id: 2,
        description: 'Student will independently manage emotions in classroom',
        domain: 'Social-Emotional',
        targetDate: '2026-07-01',
        status: 'in_progress',
        progressRating: 60,
        evidence: [
          'Using Zones of Regulation language independently',
          'Increased from 2 to 5 self-regulation episodes per day',
          'Still requires prompting in high-stress situations',
        ],
        linkedInterventions: [2],
      },
    ];

    const alerts = generateAlerts(mockInterventions);

    const summary: DashboardSummary = {
      totalInterventions: mockInterventions.length,
      activeInterventions: mockInterventions.filter((i) => i.status === 'active').length,
      completedInterventions: mockInterventions.filter((i) => i.status === 'completed').length,
      averageProgress: Math.round(
        mockInterventions.reduce((sum, i) => sum + i.progressPercentage, 0) / mockInterventions.length
      ),
      averageFidelity: Math.round(
        mockInterventions.reduce((sum, i) => sum + i.fidelityScore, 0) / mockInterventions.length
      ),
      outcomesAchieved: mockOutcomes.filter((o) => o.status === 'achieved').length,
      outcomesInProgress: mockOutcomes.filter((o) => o.status === 'in_progress').length,
      alertsCount: {
        critical: alerts.filter((a) => a.severity === 'critical').length,
        warning: alerts.filter((a) => a.severity === 'warning').length,
        info: alerts.filter((a) => a.severity === 'info').length,
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        interventions: mockInterventions,
        outcomes: mockOutcomes,
        alerts,
        summary,
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
