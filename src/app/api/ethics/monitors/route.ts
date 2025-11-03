/**
 * Ethics Monitors API
 * Manage ethics monitoring configurations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export const dynamic = 'force-dynamic';

// Mock data - in production, would use EthicsMonitoringService
const mockMonitors = [
  {
    id: 'mon_1',
    name: 'Bias in AI Recommendations',
    description: 'Monitors for potential bias in AI recommendations across different demographic groups',
    metrics: [
      { id: 'metric_1', name: 'Gender Recommendation Disparity', category: 'fairness' },
      { id: 'metric_2', name: 'Age Group Recommendation Disparity', category: 'fairness' }
    ],
    thresholds: {
      metric_1: { type: 'max', value: 0.05 },
      metric_2: { type: 'max', value: 0.05 }
    },
    enabled: true,
    frequency: 'daily',
    severity: 'high',
    tags: ['fairness', 'bias', 'recommendations'],
    lastRunAt: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'mon_2',
    name: 'Data Privacy Compliance',
    description: 'Monitors for compliance with data privacy regulations and potential data leakage',
    metrics: [
      { id: 'metric_3', name: 'PII Access Rate', category: 'privacy' },
      { id: 'metric_4', name: 'Data Retention Compliance', category: 'compliance' }
    ],
    thresholds: {
      metric_3: { type: 'max', value: 10 },
      metric_4: { type: 'min', value: 0.98 }
    },
    enabled: true,
    frequency: 'hourly',
    severity: 'critical',
    tags: ['privacy', 'compliance', 'data'],
    lastRunAt: new Date(Date.now() - 1800000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const enabled = searchParams.get('enabled');
    const severity = searchParams.get('severity');

    let monitors = [...mockMonitors];

    // Filter by enabled status
    if (enabled !== null) {
      const isEnabled = enabled === 'true';
      monitors = monitors.filter(m => m.enabled === isEnabled);
    }

    // Filter by severity
    if (severity) {
      monitors = monitors.filter(m => m.severity === severity);
    }

    return NextResponse.json({
      monitors,
      count: monitors.length,
      categories: ['fairness', 'privacy', 'transparency', 'compliance']
    });
  } catch (error) {
    console.error('Ethics Monitors API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve monitors' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, metrics, thresholds, frequency, severity } = body;

    if (!name || !description || !metrics || !thresholds) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, metrics, thresholds' },
        { status: 400 }
      );
    }

    // Validate monitor configuration
    if (!Array.isArray(metrics) || metrics.length === 0) {
      return NextResponse.json(
        { error: 'Metrics must be a non-empty array' },
        { status: 400 }
      );
    }

    // In production, this would use EthicsMonitoringService.addMonitor()
    const newMonitor = {
      id: `mon_${Date.now()}`,
      name,
      description,
      metrics,
      thresholds,
      enabled: true,
      frequency: frequency || 'daily',
      severity: severity || 'medium',
      tags: [],
      lastRunAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notificationTargets: []
    };

    return NextResponse.json({
      success: true,
      monitor: newMonitor,
      message: 'Monitor created successfully'
    });
  } catch (error) {
    console.error('Create monitor error:', error);
    return NextResponse.json(
      { error: 'Failed to create monitor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, enabled } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    // In production, would use EthicsMonitoringService.enableMonitor() or disableMonitor()
    return NextResponse.json({
      success: true,
      message: `Monitor ${enabled ? 'enabled' : 'disabled'} successfully`
    });
  } catch (error) {
    console.error('Update monitor error:', error);
    return NextResponse.json(
      { error: 'Failed to update monitor' },
      { status: 500 }
    );
  }
}
