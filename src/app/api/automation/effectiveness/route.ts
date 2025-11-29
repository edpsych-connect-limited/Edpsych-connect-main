import { logger } from "@/lib/logger";
/**
 * Automation Effectiveness API
 * Track and measure intervention effectiveness - Database-backed
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

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

    // Log the effectiveness tracking as an analytics event
    await prisma.analyticsEvent.create({
      data: {
        eventType: 'intervention_effectiveness',
        metadata: {
          interventionId,
          outcomeData,
          success: outcomeData.improved || false,
          impact: outcomeData.impact || 0.5,
        },
      },
    });

    // Calculate effectiveness metrics
    const effectiveness = {
      interventionId,
      success: outcomeData.improved || false,
      impact: outcomeData.impact || 0.5,
      duration: outcomeData.duration || 7,
      factors: outcomeData.factors || [],
      measuredAt: new Date().toISOString(),
      dataSource: 'database',
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

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeRange);

    // Fetch real effectiveness data from database
    const [
      totalInterventions,
      completedInterventions,
      effectivenessEvents,
    ] = await Promise.all([
      prisma.interventions.count({
        where: {
          created_at: { gte: startDate },
        },
      }),
      prisma.interventions.count({
        where: {
          created_at: { gte: startDate },
          status: 'completed',
        },
      }),
      prisma.analyticsEvent.findMany({
        where: {
          eventType: 'intervention_effectiveness',
          timestamp: { gte: startDate },
        },
        orderBy: {
          timestamp: 'asc',
        },
      }),
    ]);

    // Calculate real metrics
    const successRate = totalInterventions > 0 
      ? completedInterventions / totalInterventions 
      : 0;

    // Calculate average impact from effectiveness events
    let avgImpact = 0;
    if (effectivenessEvents.length > 0) {
      const totalImpact = effectivenessEvents.reduce((sum: number, event) => {
        const metadata = event.metadata as { impact?: number } | null;
        return sum + (metadata?.impact || 0);
      }, 0);
      avgImpact = totalImpact / effectivenessEvents.length;
    }

    // Group by week for breakdown
    const weeks: Record<string, { count: number; successCount: number; impactSum: number }> = {};
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    
    effectivenessEvents.forEach(event => {
      const weekNum = Math.floor((Date.now() - event.timestamp.getTime()) / weekMs);
      const key = `week_${weekNum + 1}`;
      if (!weeks[key]) {
        weeks[key] = { count: 0, successCount: 0, impactSum: 0 };
      }
      weeks[key].count++;
      const metadata = event.metadata as { success?: boolean; impact?: number } | null;
      if (metadata?.success) weeks[key].successCount++;
      weeks[key].impactSum += metadata?.impact || 0;
    });

    const breakdown = Object.entries(weeks).map(([period, data]) => ({
      period,
      successRate: data.count > 0 ? data.successCount / data.count : 0,
      interventions: data.count,
      avgImpact: data.count > 0 ? data.impactSum / data.count : 0,
    }));

    const effectivenessData = {
      templateId: templateId || 'all',
      timeRange,
      dataSource: 'database',
      overall: {
        successRate: Math.round(successRate * 100) / 100,
        averageImpact: Math.round(avgImpact * 100) / 100,
        averageDuration: 7, // Default
        totalMeasured: effectivenessEvents.length,
        totalInterventions,
      },
      breakdown: breakdown.length > 0 ? breakdown : [
        {
          period: 'current',
          successRate,
          interventions: totalInterventions,
          avgImpact,
        }
      ],
      improvements: [
        {
          metric: 'successRate',
          change: 0, // Would calculate from historical data
          trend: successRate > 0.5 ? 'improving' : 'stable'
        },
        {
          metric: 'averageImpact',
          change: 0,
          trend: avgImpact > 0.5 ? 'improving' : 'stable'
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
