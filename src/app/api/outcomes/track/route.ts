import { logger } from "@/lib/logger";
/**
 * FILE: src/app/api/outcomes/track/route.ts
 * PURPOSE: Outcome tracking system for interventions and support
 *
 * ENDPOINTS:
 * - GET: Retrieve outcome data with analytics
 * - POST: Record new outcome measurement
 *
 * FEATURES:
 * - Baseline and progress measurements
 * - Multiple measurement tools
 * - Statistical analysis (effect sizes, trends)
 * - Visual progress charts
 * - Evidence of impact for EHCP reviews
 * - SEND Code of Practice compliance
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prismaSafe';
import authService from '@/lib/auth/auth-service';

export const dynamic = 'force-dynamic';

// ============================================================================
// POST: Record Outcome Measurement
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.id);
    const body = await request.json();

    const {
      studentId,
      interventionId,
      measurementType, // 'baseline', 'progress', 'endpoint'
      measurementTool, // e.g., 'SDQ', 'WEMWBS', 'Academic Progress', 'Behavior Frequency'
      domain, // e.g., 'emotional', 'behavioral', 'academic', 'social'
      scores, // Object with specific scores
      observations,
      rater, // 'teacher', 'parent', 'self', 'ep'
      date,
    } = body;

    // Validate
    if (!studentId || !measurementType || !measurementTool || !domain || !scores) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check EP has access to student
    const studentAccess = await (prisma as any).studentAccess.findFirst({
      where: {
        studentId,
        epId: userId.toString(),
        status: 'active',
      },
    });

    if (!studentAccess) {
      return NextResponse.json(
        { success: false, error: 'No access to this student' },
        { status: 403 }
      );
    }

    // Create outcome measurement
    const outcome = await (prisma as any).outcomeMeasurement.create({
      data: {
        studentId,
        interventionId: interventionId || null,
        epId: userId.toString(),
        measurementType,
        measurementTool,
        domain,
        scores,
        observations: observations || null,
        rater,
        measuredAt: date ? new Date(date) : new Date(),
      },
    });

    // Calculate statistics if this is a progress/endpoint measurement
    let statistics = null;
    if (measurementType !== 'baseline' && interventionId) {
      statistics = await calculateOutcomeStatistics(studentId, interventionId, domain);
    }

    return NextResponse.json({
      success: true,
      outcome: {
        id: outcome.id,
        measurementType: outcome.measurementType,
        measuredAt: outcome.measuredAt,
      },
      statistics,
      message: 'Outcome measurement recorded successfully',
    });

  } catch (error: any) {
    console.error('[Outcomes Track] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to record outcome',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET: Retrieve Outcome Data with Analytics
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.id);
    const { searchParams } = new URL(request.url);

    const studentId = searchParams.get('studentId');
    const interventionId = searchParams.get('interventionId');
    const domain = searchParams.get('domain');

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Student ID required' },
        { status: 400 }
      );
    }

    // Check access
    const studentAccess = await (prisma as any).studentAccess.findFirst({
      where: {
        studentId,
        epId: userId.toString(),
        status: 'active',
      },
    });

    if (!studentAccess) {
      return NextResponse.json(
        { success: false, error: 'No access to this student' },
        { status: 403 }
      );
    }

    // Build query
    const where: any = { studentId };
    if (interventionId) where.interventionId = interventionId;
    if (domain) where.domain = domain;

    // Get all measurements
    const measurements = await (prisma as any).outcomeMeasurement.findMany({
      where,
      orderBy: {
        measuredAt: 'asc',
      },
      include: {
        intervention: {
          select: {
            name: true,
            startDate: true,
          },
        },
      },
    });

    // Group by domain and intervention
    const groupedData = groupMeasurements(measurements);

    // Calculate statistics for each intervention/domain
    const analytics = await Promise.all(
      Object.keys(groupedData).map(async (key) => {
        const [interventionId, domain] = key.split('_');
        const stats = await calculateOutcomeStatistics(studentId, interventionId, domain);
        return {
          interventionId,
          domain,
          ...stats,
        };
      })
    );

    // Generate summary report
    const summary = generateOutcomeSummary(measurements, analytics);

    return NextResponse.json({
      success: true,
      measurements: measurements.map((m: any) => ({
        id: m.id,
        measurementType: m.measurementType,
        measurementTool: m.measurementTool,
        domain: m.domain,
        scores: m.scores,
        observations: m.observations,
        rater: m.rater,
        measuredAt: m.measuredAt,
        intervention: m.intervention,
      })),
      analytics,
      summary,
    });

  } catch (error: any) {
    console.error('[Outcomes Track] GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve outcomes',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function calculateOutcomeStatistics(
  studentId: string,
  interventionId: string,
  domain: string
) {
  // Get baseline and latest measurements
  const measurements = await (prisma as any).outcomeMeasurement.findMany({
    where: {
      studentId,
      interventionId,
      domain,
    },
    orderBy: {
      measuredAt: 'asc',
    },
  });

  if (measurements.length < 2) {
    return null;
  }

  const baseline = measurements[0];
  const latest = measurements[measurements.length - 1];

  // Calculate change scores
  const changeScores: any = {};
  for (const key in baseline.scores) {
    const baselineScore = baseline.scores[key];
    const latestScore = latest.scores[key];
    if (typeof baselineScore === 'number' && typeof latestScore === 'number') {
      changeScores[key] = latestScore - baselineScore;
    }
  }

  // Calculate effect size (Cohen's d)
  // Simple approximation - in production would use proper statistical calculation
  const effectSize = calculateCohenD(measurements);

  // Determine clinical significance
  const clinicallySignificant = Math.abs(effectSize) >= 0.5;

  // Calculate trend
  const trend = calculateTrend(measurements);

  return {
    baseline: baseline.scores,
    latest: latest.scores,
    changeScores,
    effectSize: Math.round(effectSize * 100) / 100,
    clinicallySignificant,
    trend, // 'improving', 'stable', 'declining'
    measurementCount: measurements.length,
    durationWeeks: Math.floor(
      (new Date(latest.measuredAt).getTime() - new Date(baseline.measuredAt).getTime()) /
        (1000 * 60 * 60 * 24 * 7)
    ),
  };
}

function calculateCohenD(measurements: any[]): number {
  if (measurements.length < 2) return 0;

  // Get primary score from each measurement
  const scores = measurements.map((m) => {
    const scoreValues = Object.values(m.scores).filter((v) => typeof v === 'number') as number[];
    return scoreValues.reduce((sum, val) => sum + val, 0) / scoreValues.length;
  });

  const mean1 = scores[0];
  const mean2 = scores[scores.length - 1];
  const sd = calculateStandardDeviation(scores);

  if (sd === 0) return 0;

  return (mean2 - mean1) / sd;
}

function calculateStandardDeviation(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(variance);
}

function calculateTrend(measurements: any[]): 'improving' | 'stable' | 'declining' {
  if (measurements.length < 3) return 'stable';

  const scores = measurements.map((m) => {
    const scoreValues = Object.values(m.scores).filter((v) => typeof v === 'number') as number[];
    return scoreValues.reduce((sum, val) => sum + val, 0) / scoreValues.length;
  });

  // Simple linear regression slope
  const n = scores.length;
  const sumX = (n * (n + 1)) / 2;
  const sumY = scores.reduce((sum, val) => sum + val, 0);
  const sumXY = scores.reduce((sum, val, idx) => sum + val * (idx + 1), 0);
  const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  if (slope > 0.1) return 'improving';
  if (slope < -0.1) return 'declining';
  return 'stable';
}

function groupMeasurements(measurements: any[]) {
  const grouped: any = {};

  measurements.forEach((m) => {
    const key = `${m.interventionId}_${m.domain}`;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(m);
  });

  return grouped;
}

function generateOutcomeSummary(measurements: any[], analytics: any[]) {
  const totalMeasurements = measurements.length;
  const domainsTracked = new Set(measurements.map((m) => m.domain)).size;

  const improvingCount = analytics.filter((a) => a.trend === 'improving').length;
  const stableCount = analytics.filter((a) => a.trend === 'stable').length;
  const decliningCount = analytics.filter((a) => a.trend === 'declining').length;

  const clinicallySignificantCount = analytics.filter((a) => a.clinicallySignificant).length;

  return {
    totalMeasurements,
    domainsTracked,
    trendSummary: {
      improving: improvingCount,
      stable: stableCount,
      declining: decliningCount,
    },
    clinicallySignificantImprovements: clinicallySignificantCount,
    overallStatus:
      improvingCount > decliningCount
        ? 'positive_progress'
        : improvingCount === decliningCount
        ? 'mixed_progress'
        : 'requires_review',
  };
}
