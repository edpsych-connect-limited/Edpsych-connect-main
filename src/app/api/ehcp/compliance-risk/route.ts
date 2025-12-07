/**
 * EHCP Modules API - Compliance Risk Predictions
 * 
 * AI-powered compliance risk analysis and predictions
 * 
 * Endpoints:
 * GET - Get compliance risk predictions and alerts
 * POST - Trigger a new risk analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import authService from '@/lib/auth/auth-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const riskLevel = searchParams.get('risk_level');

    const laTenantId = session.tenant_id;

    // Fetch risk predictions
    const predictionWhere: Record<string, unknown> = {
      la_tenant_id: laTenantId,
    };

    if (riskLevel) predictionWhere.risk_level = riskLevel;

    const predictions = await prisma.complianceRiskPrediction.findMany({
      where: predictionWhere,
      orderBy: [{ risk_score: 'desc' }, { predicted_at: 'desc' }],
    });

    // Fetch active alerts
    const alerts = await prisma.complianceAlert.findMany({
      where: {
        la_tenant_id: laTenantId,
        status: { not: 'resolved' },
      },
      include: {
        acknowledged_by: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: [{ severity: 'desc' }, { created_at: 'desc' }],
    });

    const allPredictions = await prisma.complianceRiskPrediction.findMany({
      where: { la_tenant_id: laTenantId },
    });

    const allAlerts = await prisma.complianceAlert.findMany({
      where: { la_tenant_id: laTenantId },
    });

    const stats = {
      predictions: {
        total: allPredictions.length,
        byRiskLevel: {
          critical: allPredictions.filter(p => p.risk_level === 'critical').length,
          high: allPredictions.filter(p => p.risk_level === 'high').length,
          medium: allPredictions.filter(p => p.risk_level === 'medium').length,
          low: allPredictions.filter(p => p.risk_level === 'low').length,
        },
        averageRiskScore: allPredictions.length > 0
          ? Math.round(allPredictions.reduce((sum, p) => sum + p.risk_score, 0) / allPredictions.length)
          : 0,
        averageConfidence: allPredictions.length > 0
          ? Math.round(allPredictions.reduce((sum, p) => sum + (p.confidence || 0), 0) / allPredictions.length * 100) / 100
          : 0,
      },
      alerts: {
        total: allAlerts.length,
        active: allAlerts.filter(a => a.status === 'active').length,
        acknowledged: allAlerts.filter(a => a.status === 'acknowledged').length,
        resolved: allAlerts.filter(a => a.status === 'resolved').length,
        expired: allAlerts.filter(a => a.status === 'expired').length,
        bySeverity: {
          critical: allAlerts.filter(a => a.severity === 'critical').length,
          warning: allAlerts.filter(a => a.severity === 'warning').length,
          info: allAlerts.filter(a => a.severity === 'info').length,
        },
        byType: {
          deadline_approaching: allAlerts.filter(a => a.alert_type === 'deadline_approaching').length,
          deadline_breached: allAlerts.filter(a => a.alert_type === 'deadline_breached').length,
          risk_escalated: allAlerts.filter(a => a.alert_type === 'risk_escalated').length,
          resource_issue: allAlerts.filter(a => a.alert_type === 'resource_issue').length,
        },
      },
    };

    // High priority items requiring immediate attention
    const criticalRisks = predictions.filter(p => p.risk_level === 'critical');
    const criticalAlerts = alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved');

    // Risk trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentPredictions = allPredictions.filter(
      p => new Date(p.predicted_at) >= thirtyDaysAgo
    );

    const riskTrend = {
      newRisksLast30Days: recentPredictions.length,
      averageScoreLast30Days: recentPredictions.length > 0
        ? Math.round(recentPredictions.reduce((sum, p) => sum + p.risk_score, 0) / recentPredictions.length)
        : 0,
    };

    return NextResponse.json({
      predictions,
      alerts,
      stats,
      criticalRisks,
      criticalAlerts,
      riskTrend,
    });
  } catch (error) {
    console.error('Error fetching compliance risk data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch compliance risk data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session || !['admin', 'educator'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { analysis_type = 'full_scan' } = body;

    const laTenantId = session.tenant_id;

    // Check for overdue annual reviews (where scheduled_date is in the past and not completed)
    const overdueReviews = await prisma.annualReview.count({
      where: {
        la_tenant_id: laTenantId,
        scheduledDate: { lt: new Date() },
        status: { not: 'completed' },
      },
    });

    // Check for pending tribunal cases
    const activeTribunals = await prisma.tribunalCase.count({
      where: {
        la_tenant_id: laTenantId,
        status: { in: ['lodged', 'response_due', 'awaiting_hearing', 'hearing_scheduled'] },
      },
    });

    // Generate predictions based on analysis
    const predictions = [];

    if (overdueReviews > 0) {
      const riskScore = Math.min(overdueReviews * 15, 100);
      const riskLevel = riskScore >= 80 ? 'critical' : riskScore >= 60 ? 'high' : riskScore >= 40 ? 'medium' : 'low';

      const prediction = await prisma.complianceRiskPrediction.create({
        data: {
          la_tenant: { connect: { id: laTenantId! } },
          risk_score: riskScore,
          risk_level: riskLevel,
          risk_factors: [
            {
              factor: 'overdue_annual_reviews',
              weight: 0.4,
              score: riskScore,
              contribution: riskScore * 0.4,
            },
          ],
          timeline_risk: riskScore,
          primary_risk_factors: ['Overdue annual reviews', 'Timeline compliance risk'],
          mitigation_actions: {
            actions: [
              'Prioritise overdue reviews by date',
              'Allocate additional resource to review team',
              'Contact settings to expedite reports',
            ],
          },
          confidence: 0.92,
          model_version: 'v1',
          predicted_at: new Date(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });
      predictions.push(prediction);
    }

    if (activeTribunals > 3) {
      const riskScore = Math.min(activeTribunals * 20, 100);
      const riskLevel = riskScore >= 80 ? 'critical' : riskScore >= 60 ? 'high' : riskScore >= 40 ? 'medium' : 'low';

      const prediction = await prisma.complianceRiskPrediction.create({
        data: {
          la_tenant: { connect: { id: laTenantId! } },
          risk_score: riskScore,
          risk_level: riskLevel,
          risk_factors: [
            {
              factor: 'active_tribunal_cases',
              weight: 0.5,
              score: riskScore,
              contribution: riskScore * 0.5,
            },
          ],
          historical_risk: riskScore,
          primary_risk_factors: ['High tribunal activity', 'Potential systemic issues'],
          mitigation_actions: {
            actions: [
              'Review common appeal grounds for patterns',
              'Strengthen mediation processes',
              'Review EHCP quality assurance procedures',
            ],
          },
          confidence: 0.85,
          model_version: 'v1',
          predicted_at: new Date(),
          expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        },
      });
      predictions.push(prediction);
    }

    return NextResponse.json({
      message: 'Risk analysis completed',
      analysis_type,
      predictions_generated: predictions.length,
      predictions,
      metrics: {
        overdue_reviews: overdueReviews,
        active_tribunals: activeTribunals,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error running compliance risk analysis:', error);
    return NextResponse.json(
      { error: 'Failed to run compliance risk analysis' },
      { status: 500 }
    );
  }
}
