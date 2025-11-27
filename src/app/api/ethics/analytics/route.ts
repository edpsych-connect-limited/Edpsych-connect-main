/**
 * Ethics Analytics API
 * Get analytics and metrics for the ethics monitoring system - Database-backed
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = parseInt(searchParams.get('timeRange') || '30'); // days

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeRange);

    // Fetch real data from database
    const [
      allMonitors,
      enabledMonitors,
      allIncidents,
      allAssessments,
      recentIncidents,
    ] = await Promise.all([
      // Total monitors
      prisma.ethicsMonitor.count(),
      // Active monitors
      prisma.ethicsMonitor.count({
        where: { enabled: true },
      }),
      // All incidents in timeframe
      prisma.ethicsIncident.findMany({
        where: {
          detectedAt: { gte: startDate },
        },
        select: {
          status: true,
          severity: true,
          detectedAt: true,
          resolvedAt: true,
        },
      }),
      // All assessments
      prisma.ethicsAssessment.findMany({
        where: {
          createdAt: { gte: startDate },
        },
        select: {
          status: true,
          componentType: true,
          createdAt: true,
          approvedAt: true,
        },
      }),
      // Recent incidents for trend
      prisma.ethicsIncident.findMany({
        where: {
          detectedAt: { gte: startDate },
        },
        select: {
          detectedAt: true,
        },
        orderBy: {
          detectedAt: 'asc',
        },
      }),
    ]);

    // Calculate incident stats
    const incidentsByStatus = allIncidents.reduce((acc, incident) => {
      acc[incident.status] = (acc[incident.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const incidentsBySeverity = allIncidents.reduce((acc, incident) => {
      acc[incident.severity] = (acc[incident.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate assessment stats
    const assessmentsByStatus = allAssessments.reduce((acc, assessment) => {
      acc[assessment.status] = (acc[assessment.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const assessmentsByComponent = allAssessments.reduce((acc, assessment) => {
      acc[assessment.componentType] = (acc[assessment.componentType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate average resolution time
    const resolvedIncidents = allIncidents.filter(i => i.resolvedAt);
    let averageResolutionTime = 0;
    if (resolvedIncidents.length > 0) {
      const totalTime = resolvedIncidents.reduce((sum, incident) => {
        const duration = incident.resolvedAt!.getTime() - incident.detectedAt.getTime();
        return sum + duration;
      }, 0);
      averageResolutionTime = (totalTime / resolvedIncidents.length) / (1000 * 60 * 60); // hours
    }

    // Generate trend data
    const trend = generateTrendFromIncidents(recentIncidents, timeRange);

    // Generate recommendations based on real data
    const recommendations = generateRecommendations(
      incidentsByStatus,
      assessmentsByStatus,
      enabledMonitors,
      allMonitors
    );

    const analytics = {
      generatedAt: new Date().toISOString(),
      timeRange,
      dataSource: 'database',
      summary: {
        totalMonitors: allMonitors,
        activeMonitors: enabledMonitors,
        totalIncidents: allIncidents.length,
        activeIncidents: (incidentsByStatus['open'] || 0) + (incidentsByStatus['investigating'] || 0),
        resolvedIncidents: incidentsByStatus['resolved'] || 0,
        dismissedIncidents: incidentsByStatus['dismissed'] || 0,
        totalAssessments: allAssessments.length,
        approvedAssessments: assessmentsByStatus['approved'] || 0,
        averageResolutionTime: Math.round(averageResolutionTime * 10) / 10
      },
      monitors: {
        byStatus: {
          enabled: enabledMonitors,
          disabled: allMonitors - enabledMonitors
        },
      },
      incidents: {
        byStatus: {
          open: incidentsByStatus['open'] || 0,
          investigating: incidentsByStatus['investigating'] || 0,
          mitigating: incidentsByStatus['mitigating'] || 0,
          resolved: incidentsByStatus['resolved'] || 0,
          dismissed: incidentsByStatus['dismissed'] || 0
        },
        bySeverity: {
          low: incidentsBySeverity['low'] || 0,
          medium: incidentsBySeverity['medium'] || 0,
          high: incidentsBySeverity['high'] || 0,
          critical: incidentsBySeverity['critical'] || 0
        },
        trend
      },
      assessments: {
        byStatus: {
          draft: assessmentsByStatus['draft'] || 0,
          in_review: assessmentsByStatus['in_review'] || 0,
          approved: assessmentsByStatus['approved'] || 0,
          rejected: assessmentsByStatus['rejected'] || 0,
          needs_revision: assessmentsByStatus['needs_revision'] || 0
        },
        byComponentType: assessmentsByComponent,
        completionRate: allAssessments.length > 0 
          ? (assessmentsByStatus['approved'] || 0) / allAssessments.length 
          : 0
      },
      recommendations
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

function generateTrendFromIncidents(
  incidents: Array<{ detectedAt: Date }>,
  days: number
): Record<string, number> {
  const trend: Record<string, number> = {};
  const now = new Date();

  // Initialize all days with 0
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().split('T')[0];
    trend[key] = 0;
  }

  // Count incidents per day
  incidents.forEach(incident => {
    const key = incident.detectedAt.toISOString().split('T')[0];
    if (trend[key] !== undefined) {
      trend[key]++;
    }
  });

  return trend;
}

function generateRecommendations(
  incidentsByStatus: Record<string, number>,
  assessmentsByStatus: Record<string, number>,
  enabledMonitors: number,
  totalMonitors: number
): Array<{ type: string; priority: string; title: string; description: string }> {
  const recommendations = [];

  // Check for open critical incidents
  if ((incidentsByStatus['open'] || 0) > 0) {
    recommendations.push({
      type: 'incident_resolution',
      priority: 'critical',
      title: 'Resolve Open Incidents',
      description: `${incidentsByStatus['open']} incident(s) require attention. Review and resolve to maintain ethical compliance.`
    });
  }

  // Check for assessment backlog
  const pendingAssessments = (assessmentsByStatus['draft'] || 0) + (assessmentsByStatus['in_review'] || 0);
  if (pendingAssessments > 0) {
    recommendations.push({
      type: 'assessment_backlog',
      priority: 'high',
      title: 'Address Assessment Backlog',
      description: `${pendingAssessments} assessment(s) are awaiting review. Complete reviews to maintain compliance timeline.`
    });
  }

  // Check for disabled monitors
  if (enabledMonitors < totalMonitors) {
    recommendations.push({
      type: 'monitor_optimization',
      priority: 'medium',
      title: 'Review Disabled Monitors',
      description: `${totalMonitors - enabledMonitors} monitor(s) are disabled. Consider enabling them for comprehensive coverage.`
    });
  }

  // If no data, suggest getting started
  if (totalMonitors === 0) {
    recommendations.push({
      type: 'getting_started',
      priority: 'high',
      title: 'Set Up Ethics Monitoring',
      description: 'No ethics monitors configured. Create monitors to track ethical compliance of AI systems.'
    });
  }

  return recommendations;
}
