import { NextRequest, NextResponse } from 'next/server';
import { advancedMonitoring } from '@/lib/monitoring/advanced-monitoring';

export const dynamic = 'force-dynamic';

/**
 * Advanced Monitoring Dashboard API
 * Provides real-time monitoring data and alerts
 */

export async function GET(_request: NextRequest) {
  try {
    const dashboardData = advancedMonitoring.getDashboardData();
    const summary = advancedMonitoring.getMonitoringSummary();

    return NextResponse.json({
      success: true,
      data: {
        dashboard: dashboardData,
        summary,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    });
  } catch (error) {
    console.error('Monitoring dashboard error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve monitoring data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Get monitoring alerts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, alertId } = body;

    switch (action) {
      case 'acknowledge_alert':
        // Acknowledge specific alert
        return NextResponse.json({
          success: true,
          message: `Alert ${alertId} acknowledged`
        });

      case 'get_alerts':
        // Get active alerts
        return NextResponse.json({
          success: true,
          alerts: [] // Would return actual alerts from monitoring system
        });

      case 'get_metrics':
        // Get specific metrics
        const _metrics = request.nextUrl.searchParams.get('metrics')?.split(',') || [];
        return NextResponse.json({
          success: true,
          metrics: {} // Would return actual metrics
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process monitoring request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}