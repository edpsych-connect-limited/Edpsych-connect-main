/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

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
  } catch (_error) {
    console.error('Monitoring dashboard error:', _error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve monitoring data',
        details: _error instanceof Error ? _error.message : 'Unknown _error'
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
  } catch (_error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process monitoring request',
        details: _error instanceof Error ? _error.message : 'Unknown _error'
      },
      { status: 500 }
    );
  }
}
