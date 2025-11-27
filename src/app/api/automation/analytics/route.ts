/**
 * Automation Analytics API
 * Get automation system analytics - Database-backed
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = parseInt(searchParams.get('timeRange') || '30'); // days
    // const interventionType = searchParams.get('type');

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeRange);

    // Fetch real analytics data from database
    const [
      interventionCount,
      completedInterventions,
      analyticsEvents,
      userActivities,
    ] = await Promise.all([
      // Total interventions in period
      prisma.interventions.count({
        where: {
          created_at: { gte: startDate },
        },
      }),
      // Completed interventions
      prisma.interventions.count({
        where: {
          created_at: { gte: startDate },
          status: 'completed',
        },
      }),
      // Analytics events (AI usage)
      prisma.analyticsEvent.findMany({
        where: {
          timestamp: { gte: startDate },
        },
        select: {
          eventType: true,
          latencyMs: true,
          cost: true,
          timestamp: true,
        },
      }),
      // User activities
      prisma.userActivity.count({
        where: {
          created_at: { gte: startDate },
        },
      }),
    ]);

    // Calculate real metrics
    const successRate = interventionCount > 0 
      ? (completedInterventions / interventionCount) 
      : 0;

    const avgLatency = analyticsEvents.length > 0
      ? analyticsEvents.reduce((sum: number, e) => sum + (e.latencyMs || 0), 0) / analyticsEvents.length
      : 0;

    const totalCost = analyticsEvents.reduce((sum: number, e) => sum + (e.cost || 0), 0);

    // Group analytics events by type
    const eventsByType = analyticsEvents.reduce((acc: Record<string, number>, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Generate real trend data from analytics events
    const dailyTrends = generateRealTrendData(analyticsEvents, timeRange);

    const analytics = {
      generatedAt: new Date().toISOString(),
      timeRange,
      dataSource: 'database',
      summary: {
        totalInterventions: interventionCount,
        successfulInterventions: completedInterventions,
        averageEffectiveness: successRate,
        totalActivities: userActivities,
        interventionTypes: eventsByType,
      },
      trends: {
        daily: dailyTrends,
      },
      effectiveness: {
        successRate,
        avgLatencyMs: Math.round(avgLatency),
        byType: eventsByType,
      },
      recommendations: generateRecommendations(successRate, interventionCount),
      cost: {
        totalCost: Math.round(totalCost * 100) / 100,
        avgCostPerEvent: analyticsEvents.length > 0 
          ? Math.round((totalCost / analyticsEvents.length) * 100) / 100 
          : 0,
      },
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Automation Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve analytics' },
      { status: 500 }
    );
  }
}

interface AnalyticsEventData {
  eventType: string;
  latencyMs: number | null;
  cost: number | null;
  timestamp: Date;
}

function generateRealTrendData(
  events: AnalyticsEventData[],
  days: number
): Record<string, number> {
  const trends: Record<string, number> = {};
  const now = new Date();

  // Initialize all days with 0
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().split('T')[0];
    trends[key] = 0;
  }

  // Count events per day
  events.forEach(event => {
    const key = event.timestamp.toISOString().split('T')[0];
    if (trends[key] !== undefined) {
      trends[key]++;
    }
  });

  return trends;
}

function generateRecommendations(
  successRate: number,
  totalInterventions: number
): Array<{ type: string; priority: string; title: string; description: string }> {
  const recommendations = [];

  if (totalInterventions === 0) {
    recommendations.push({
      type: 'getting_started',
      priority: 'high',
      title: 'Create Your First Intervention',
      description: 'No interventions recorded yet. Start by creating intervention plans for students who need support.',
    });
  } else if (successRate < 0.5) {
    recommendations.push({
      type: 'optimization',
      priority: 'high',
      title: 'Review Intervention Effectiveness',
      description: 'Success rate is below 50%. Consider reviewing intervention strategies and implementation fidelity.',
    });
  } else if (successRate < 0.75) {
    recommendations.push({
      type: 'optimization',
      priority: 'medium',
      title: 'Optimize Current Interventions',
      description: 'Success rate is improving. Consider fine-tuning intervention parameters for better outcomes.',
    });
  } else {
    recommendations.push({
      type: 'scaling',
      priority: 'low',
      title: 'Scale Successful Interventions',
      description: 'High success rate achieved. Consider expanding successful intervention patterns to more students.',
    });
  }

  return recommendations;
}
