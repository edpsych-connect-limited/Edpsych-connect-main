/**
 * Ethics Incidents API
 * Manage ethics incidents and resolutions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export const dynamic = 'force-dynamic';

// Mock data - in production, would use EthicsIncidentService
const mockIncidents = [
  {
    id: 'inc_1',
    title: 'Gender bias detected in career recommendations',
    description: 'Significant disparity in career recommendations between male and female users with similar profiles',
    monitorId: 'mon_1',
    metricId: 'metric_1',
    metricValue: 0.083,
    thresholdValue: 0.05,
    detectedAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'investigating',
    severity: 'high',
    assignedTo: null,
    resolutionSteps: [
      {
        description: 'Analyze recommendation algorithm for gender-related variables',
        status: 'completed',
        createdAt: new Date(Date.now() - 82800000).toISOString(),
        completedAt: new Date(Date.now() - 79200000).toISOString()
      },
      {
        description: 'Review training data for potential biases',
        status: 'in_progress',
        createdAt: new Date(Date.now() - 75600000).toISOString(),
        completedAt: null
      }
    ],
    resolvedAt: null,
    tags: ['bias', 'gender', 'recommendations']
  },
  {
    id: 'inc_2',
    title: 'Elevated PII access rate detected',
    description: 'The rate of PII data access has exceeded thresholds by 15%',
    monitorId: 'mon_2',
    metricId: 'metric_3',
    metricValue: 11.5,
    thresholdValue: 10,
    detectedAt: new Date(Date.now() - 3600000).toISOString(),
    status: 'open',
    severity: 'critical',
    assignedTo: null,
    resolutionSteps: [],
    resolvedAt: null,
    tags: ['privacy', 'data-access', 'security']
  }
];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const limit = parseInt(searchParams.get('limit') || '50');

    let incidents = [...mockIncidents];

    // Filter by status
    if (status) {
      if (status === 'active') {
        incidents = incidents.filter(i =>
          ['open', 'investigating', 'mitigating'].includes(i.status)
        );
      } else {
        incidents = incidents.filter(i => i.status === status);
      }
    }

    // Filter by severity
    if (severity) {
      incidents = incidents.filter(i => i.severity === severity);
    }

    // Apply limit
    incidents = incidents.slice(0, limit);

    return NextResponse.json({
      incidents,
      count: incidents.length,
      summary: {
        total: mockIncidents.length,
        open: mockIncidents.filter(i => i.status === 'open').length,
        investigating: mockIncidents.filter(i => i.status === 'investigating').length,
        resolved: mockIncidents.filter(i => i.status === 'resolved').length
      }
    });
  } catch (error) {
    console.error('Ethics Incidents API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve incidents' },
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
    const { action, incidentId, ...data } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Missing required field: action' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'create':
        const { title, description, severity, monitorId, metricId } = data;
        if (!title || !description) {
          return NextResponse.json(
            { error: 'Missing required fields: title, description' },
            { status: 400 }
          );
        }

        const newIncident = {
          id: `inc_${Date.now()}`,
          title,
          description,
          monitorId: monitorId || null,
          metricId: metricId || null,
          metricValue: null,
          thresholdValue: null,
          detectedAt: new Date().toISOString(),
          status: 'open',
          severity: severity || 'medium',
          assignedTo: null,
          resolutionSteps: [],
          resolvedAt: null,
          tags: []
        };

        return NextResponse.json({
          success: true,
          incident: newIncident,
          message: 'Incident created successfully'
        });

      case 'assign':
        if (!incidentId || !data.assignedTo) {
          return NextResponse.json(
            { error: 'Missing required fields: incidentId, assignedTo' },
            { status: 400 }
          );
        }

        // In production, would use EthicsIncidentService.assignIncident()
        return NextResponse.json({
          success: true,
          message: 'Incident assigned successfully'
        });

      case 'add_resolution_step':
        if (!incidentId || !data.description) {
          return NextResponse.json(
            { error: 'Missing required fields: incidentId, description' },
            { status: 400 }
          );
        }

        // In production, would use EthicsIncidentService.addResolutionStep()
        return NextResponse.json({
          success: true,
          message: 'Resolution step added successfully'
        });

      case 'update_status':
        if (!incidentId || !data.status) {
          return NextResponse.json(
            { error: 'Missing required fields: incidentId, status' },
            { status: 400 }
          );
        }

        // In production, would use EthicsIncidentService.updateIncidentStatus()
        return NextResponse.json({
          success: true,
          message: 'Incident status updated successfully'
        });

      case 'resolve':
        if (!incidentId) {
          return NextResponse.json(
            { error: 'Missing required field: incidentId' },
            { status: 400 }
          );
        }

        // In production, would use EthicsIncidentService.resolveIncident()
        return NextResponse.json({
          success: true,
          message: 'Incident resolved successfully'
        });

      case 'dismiss':
        if (!incidentId || !data.reason) {
          return NextResponse.json(
            { error: 'Missing required fields: incidentId, reason' },
            { status: 400 }
          );
        }

        // In production, would use EthicsIncidentService.dismissIncident()
        return NextResponse.json({
          success: true,
          message: 'Incident dismissed successfully'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Incident action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform incident action' },
      { status: 500 }
    );
  }
}
