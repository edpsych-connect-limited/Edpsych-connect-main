/**
 * Automation Analytics API
 * Get automation system analytics
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
    const interventionType = searchParams.get('type');

    // Mock analytics data
    const analytics = {
      generatedAt: new Date().toISOString(),
      timeRange,
      summary: {
        totalInterventions: 247,
        successfulInterventions: 189,
        averageEffectiveness: 0.765,
        interventionTypes: {
          engagement: 98,
          academic_support: 72,
          motivation: 77
        }
      },
      trends: {
        daily: generateTrendData(timeRange, 'daily'),
        weekly: generateTrendData(Math.ceil(timeRange / 7), 'weekly')
      },
      effectiveness: {
        successRate: 0.765,
        averageImpact: 0.68,
        byType: {
          engagement: { total: 98, successful: 72, rate: 0.73 },
          academic_support: { total: 72, successful: 61, rate: 0.85 },
          motivation: { total: 77, successful: 56, rate: 0.68 }
        },
        byRiskLevel: {
          high: { total: 89, successful: 78, rate: 0.88 },
          medium: { total: 124, successful: 89, rate: 0.72 },
          low: { total: 34, successful: 22, rate: 0.65 }
        }
      },
      recommendations: [
        {
          type: 'optimization',
          priority: 'medium',
          title: 'Optimize Engagement Interventions',
          description: 'Success rate below target. Consider reviewing timing and messaging.'
        },
        {
          type: 'scaling',
          priority: 'high',
          title: 'Scale Academic Support Success',
          description: 'High success rate (85%). Consider increasing usage for at-risk students.'
        }
      ],
      timeSavings: {
        hoursPerWeek: 12.5,
        automatedTasks: 247,
        manualEquivalent: 494 // hours
      }
    };

    // Filter by intervention type if specified
    if (interventionType && analytics.effectiveness.byType[interventionType]) {
      analytics.summary.totalInterventions = analytics.effectiveness.byType[interventionType].total;
      analytics.summary.successfulInterventions = analytics.effectiveness.byType[interventionType].successful;
    }

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Automation Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve analytics' },
      { status: 500 }
    );
  }
}

function generateTrendData(periods: number, type: 'daily' | 'weekly'): Record<string, number> {
  const trends: Record<string, number> = {};
  const now = new Date();

  for (let i = 0; i < periods; i++) {
    const date = new Date(now);
    if (type === 'daily') {
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      trends[key] = Math.floor(Math.random() * 15) + 3;
    } else {
      date.setDate(date.getDate() - (i * 7));
      const week = Math.ceil((date.getDate() - date.getDay() + 1) / 7);
      const key = `${date.getFullYear()}-W${week}`;
      trends[key] = Math.floor(Math.random() * 50) + 20;
    }
  }

  return trends;
}
