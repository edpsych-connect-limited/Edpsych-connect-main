/**
 * Ethics Analytics API
 * Get analytics and metrics for the ethics monitoring system
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = parseInt(searchParams.get('timeRange') || '30'); // days

    // Mock analytics data - in production, would aggregate from services
    const analytics = {
      generatedAt: new Date().toISOString(),
      timeRange,
      summary: {
        totalMonitors: 4,
        activeMonitors: 3,
        totalIncidents: 24,
        activeIncidents: 2,
        resolvedIncidents: 18,
        dismissedIncidents: 4,
        totalAssessments: 12,
        approvedAssessments: 8,
        averageResolutionTime: 36.5 // hours
      },
      monitors: {
        byStatus: {
          enabled: 3,
          disabled: 1
        },
        bySeverity: {
          low: 0,
          medium: 2,
          high: 1,
          critical: 1
        },
        byCategory: {
          fairness: 2,
          privacy: 2,
          transparency: 1,
          compliance: 1
        }
      },
      incidents: {
        byStatus: {
          open: 1,
          investigating: 1,
          mitigating: 0,
          resolved: 18,
          dismissed: 4
        },
        bySeverity: {
          low: 2,
          medium: 8,
          high: 10,
          critical: 4
        },
        trend: generateTrendData(timeRange),
        averageTimeToResolution: {
          critical: 12.5,
          high: 24.3,
          medium: 48.7,
          low: 72.1
        }
      },
      assessments: {
        byStatus: {
          draft: 2,
          in_review: 2,
          approved: 8,
          rejected: 0,
          needs_revision: 0
        },
        byComponentType: {
          algorithm: 5,
          feature: 4,
          data_process: 2,
          module: 1
        },
        completionRate: 0.85,
        averageReviewTime: 5.2 // days
      },
      metrics: {
        totalMetricsMonitored: 18,
        thresholdViolations: 3,
        falsePositiveRate: 0.12,
        detectionAccuracy: 0.88
      },
      recommendations: [
        {
          type: 'monitor_optimization',
          priority: 'medium',
          title: 'Increase Monitoring Frequency',
          description: 'Consider increasing monitoring frequency for high-severity monitors to enable faster incident detection'
        },
        {
          type: 'assessment_backlog',
          priority: 'high',
          title: 'Address Assessment Backlog',
          description: '2 assessments are awaiting review. Assign reviewers to maintain compliance timeline'
        },
        {
          type: 'incident_resolution',
          priority: 'critical',
          title: 'Resolve Critical Incidents',
          description: '1 critical incident has been open for over 24 hours. Immediate attention required'
        }
      ]
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Ethics Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve analytics' },
      { status: 500 }
    );
  }
}

function generateTrendData(days: number): Record<string, number> {
  const trend: Record<string, number> = {};
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().split('T')[0];

    // Generate realistic incident trend
    const baseIncidents = 1;
    const variation = Math.floor(Math.random() * 3);
    trend[key] = baseIncidents + variation;
  }

  return trend;
}
