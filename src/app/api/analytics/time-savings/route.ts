/**
 * Time Savings Analytics API Routes
 * 
 * API endpoints for tracking and reporting time savings metrics.
 * Supports the "hours saved" displays throughout the platform.
 * 
 * Zero Gap Project - Sprint 4
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createTimeSavingsService, INDUSTRY_BENCHMARKS } from '@/lib/analytics/time-savings.service';
import { logger } from '@/lib/logger';

// ============================================================================
// GET - Get time savings reports
// ============================================================================

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session.user as any;
    const tenantId = user.tenantId;

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'report';
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const userId = searchParams.get('userId');

    // Default to last 30 days
    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    const startDate = startDateParam 
      ? new Date(startDateParam) 
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const service = createTimeSavingsService(tenantId);

    switch (type) {
      case 'report': {
        const report = await service.generateReport(startDate, endDate);
        return NextResponse.json(report);
      }

      case 'user': {
        const targetUserId = userId ? parseInt(userId, 10) : user.id;
        
        // Students can only view their own metrics
        if (user.role === 'student' && targetUserId !== user.id) {
          return NextResponse.json(
            { error: 'You can only view your own metrics' },
            { status: 403 }
          );
        }

        const userMetrics = await service.getUserTimeSavings(targetUserId, startDate, endDate);
        return NextResponse.json(userMetrics);
      }

      case 'history': {
        // Only admins can view historical reports
        if (!['admin', 'la_admin', 'school_admin'].includes(user.role)) {
          return NextResponse.json(
            { error: 'Admin access required' },
            { status: 403 }
          );
        }

        const limit = parseInt(searchParams.get('limit') || '12', 10);
        const history = await service.getHistoricalReports(limit);
        return NextResponse.json(history);
      }

      case 'benchmarks': {
        // Return available benchmarks for reference
        return NextResponse.json({
          benchmarks: INDUSTRY_BENCHMARKS,
          categories: [
            'ehcp', 'iep', 'assessment', 'lesson_planning', 
            'reporting', 'communication', 'data_entry', 
            'sen2_returns', 'progress_tracking', 'resource_creation',
            'meeting_prep', 'differentiation'
          ],
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid type. Use: report, user, history, benchmarks' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('[TimeSavings API] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time savings data' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Record time savings metric
// ============================================================================

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session.user as any;
    const tenantId = user.tenantId;

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    const body = await request.json();
    const { 
      benchmarkKey,
      actualMinutes,
      featureCategory,
      featureName,
      actionType,
      traditionalMinutes,
      metadata
    } = body;

    const service = createTimeSavingsService(tenantId);
    let metricId: number;

    if (benchmarkKey) {
      // Use industry benchmark
      if (actualMinutes === undefined) {
        return NextResponse.json(
          { error: 'actualMinutes is required when using benchmarkKey' },
          { status: 400 }
        );
      }

      metricId = await service.recordWithBenchmark(
        benchmarkKey,
        actualMinutes,
        user.id,
        metadata
      );
    } else {
      // Custom metric
      if (!featureCategory || !featureName || !actionType || 
          traditionalMinutes === undefined || actualMinutes === undefined) {
        return NextResponse.json(
          { error: 'featureCategory, featureName, actionType, traditionalMinutes, and actualMinutes are required' },
          { status: 400 }
        );
      }

      metricId = await service.recordTimeSavings({
        tenantId,
        userId: user.id,
        featureCategory,
        featureName,
        actionType,
        traditionalTimeMinutes: traditionalMinutes,
        automatedTimeMinutes: actualMinutes,
        evidenceType: 'measured',
        metadata,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Time savings recorded',
      metricId,
    });

  } catch (error) {
    logger.error('[TimeSavings API] POST error:', error);
    const message = error instanceof Error ? error.message : 'Failed to record time savings';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT - Save report snapshot
// ============================================================================

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session.user as any;
    const tenantId = user.tenantId;

    // Only admins can save reports
    if (!['admin', 'la_admin', 'school_admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Admin access required to save reports' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { startDate, endDate } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    const service = createTimeSavingsService(tenantId);
    const report = await service.generateReport(new Date(startDate), new Date(endDate));
    const reportId = await service.saveReport(report);

    return NextResponse.json({
      success: true,
      message: 'Report saved successfully',
      reportId,
      report,
    });

  } catch (error) {
    logger.error('[TimeSavings API] PUT error:', error);
    const message = error instanceof Error ? error.message : 'Failed to save report';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
