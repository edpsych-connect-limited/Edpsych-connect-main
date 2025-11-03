/**
 * Automation Effectiveness API
 * Track and measure intervention effectiveness
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { interventionId, outcomeData } = body;

    if (!interventionId || !outcomeData) {
      return NextResponse.json(
        { error: 'Missing required fields: interventionId, outcomeData' },
        { status: 400 }
      );
    }

    // Mock effectiveness tracking
    const effectiveness = {
      interventionId,
      success: outcomeData.improved || false,
      impact: outcomeData.impact || 0.5,
      duration: outcomeData.duration || 7,
      factors: outcomeData.factors || [],
      measuredAt: new Date().toISOString()
    };

    const insights = [
      effectiveness.success ? 'Intervention successfully improved student outcomes' : 'Intervention had limited impact',
      effectiveness.impact > 0.7 ? 'High impact - consider scaling this approach' : 'Moderate impact - review and optimize',
      effectiveness.duration < 7 ? 'Quick results - effective for immediate needs' : 'Sustained intervention - suitable for long-term support'
    ];

    const recommendations = [];
    if (!effectiveness.success) {
      recommendations.push({
        type: 'intervention_optimisation',
        priority: 'medium',
        title: 'Review Intervention Strategy',
        description: 'Consider alternative approaches or timing for this intervention type'
      });
    }

    if (effectiveness.impact < 0.5) {
      recommendations.push({
        type: 'impact_improvement',
        priority: 'high',
        title: 'Enhance Intervention Impact',
        description: 'Modify intervention to increase effectiveness and student engagement'
      });
    }

    return NextResponse.json({
      success: true,
      effectiveness,
      insights,
      recommendations,
      message: 'Effectiveness tracked successfully'
    });
  } catch (error) {
    console.error('Track effectiveness error:', error);
    return NextResponse.json(
      { error: 'Failed to track effectiveness' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('templateId');
    const timeRange = parseInt(searchParams.get('timeRange') || '30');

    // Mock effectiveness data
    const effectivenessData = {
      templateId: templateId || 'all',
      timeRange,
      overall: {
        successRate: 0.76,
        averageImpact: 0.68,
        averageDuration: 9.2,
        totalMeasured: 189
      },
      breakdown: [
        {
          period: 'week_1',
          successRate: 0.72,
          interventions: 48,
          avgImpact: 0.65
        },
        {
          period: 'week_2',
          successRate: 0.78,
          interventions: 52,
          avgImpact: 0.70
        },
        {
          period: 'week_3',
          successRate: 0.74,
          interventions: 45,
          avgImpact: 0.67
        },
        {
          period: 'week_4',
          successRate: 0.80,
          interventions: 44,
          avgImpact: 0.72
        }
      ],
      improvements: [
        {
          metric: 'successRate',
          change: +0.08,
          trend: 'improving'
        },
        {
          metric: 'averageImpact',
          change: +0.07,
          trend: 'improving'
        }
      ]
    };

    return NextResponse.json(effectivenessData);
  } catch (error) {
    console.error('Get effectiveness error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve effectiveness data' },
      { status: 500 }
    );
  }
}
