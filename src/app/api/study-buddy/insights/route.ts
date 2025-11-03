/**
 * FILE: src/app/api/study-buddy/insights/route.ts
 * PURPOSE: Automated Insights & Predictive Alerts System
 *
 * ENDPOINTS:
 * - GET: Retrieve active insights and alerts
 * - POST: Generate new insights based on user activity
 * - PATCH: Update insight status (viewed, acted_upon, dismissed)
 *
 * FEATURES:
 * - Churn risk detection and prevention
 * - Intervention opportunity identification
 * - Learning plateau detection
 * - Engagement spike recognition
 * - CPD reminder automation
 * - Predictive analytics with confidence scoring
 * - Evidence-based recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prismaSafe';
import authService from '@/lib/auth/auth-service';

export const dynamic = 'force-dynamic';

// ============================================================================
// GET: Retrieve Insights
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.id);
    const { searchParams } = new URL(request.url);

    const type = searchParams.get('type'); // churn_warning, intervention_opportunity, etc.
    const severity = searchParams.get('severity'); // info, warning, critical
    const status = searchParams.get('status') || 'active'; // active, viewed, acted_upon, dismissed, expired
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build query
    const where: any = {
      user_id: userId,
    };

    if (type) where.insight_type = type;
    if (severity) where.severity = severity;
    if (status) where.status = status;

    // Get insights
    const insights = await (prisma as any).predictiveInsight.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { severity: 'desc' },
        { generated_at: 'desc' },
      ],
      take: limit,
    });

    // Get summary statistics
    const summaryStats = await getInsightSummaryStats(userId);

    return NextResponse.json({
      success: true,
      insights: insights.map((insight: any) => ({
        id: insight.id,
        type: insight.insight_type,
        title: insight.title,
        description: insight.description,
        severity: insight.severity,
        priority: insight.priority,
        confidence_score: insight.confidence_score,
        predicted_outcome: insight.predicted_outcome,
        recommended_action: insight.recommended_action,
        expected_impact: insight.expected_impact,
        is_actionable: insight.is_actionable,
        action_button_text: insight.action_button_text,
        action_url: insight.action_url,
        estimated_time: insight.estimated_time,
        status: insight.status,
        generated_at: insight.generated_at,
        expires_at: insight.expires_at,
      })),
      summary: summaryStats,
    });

  } catch (error: any) {
    console.error('[Study Buddy Insights] GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve insights',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST: Generate New Insights
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.id);
    const tenantId = session.tenant_id || 0; // Default to 0 if tenant_id not set

    // Get user's learning profile
    let profile = await (prisma as any).userLearningProfile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      // Create profile if doesn't exist
      profile = await (prisma as any).userLearningProfile.create({
        data: {
          user_id: userId,
          tenant_id: tenantId,
          role: session.role,
          engagement_score: 50,
          profile_completeness: 20,
          last_updated_by_ai: new Date(),
        },
      });
    }

    // Generate insights using multiple analyzers
    const insights = [];

    // 1. Churn Risk Analysis
    const churnInsights = await analyzeChurnRisk(userId, profile, tenantId);
    insights.push(...churnInsights);

    // 2. Intervention Opportunity Detection
    const interventionInsights = await analyzeInterventionOpportunities(userId, tenantId);
    insights.push(...interventionInsights);

    // 3. Learning Plateau Detection
    const plateauInsights = await analyzeLearningPlateau(userId, profile);
    insights.push(...plateauInsights);

    // 4. Engagement Spike Recognition
    const engagementInsights = await analyzeEngagementSpikes(userId, profile);
    insights.push(...engagementInsights);

    // 5. CPD Progress Tracking
    const cpdInsights = await analyzeCPDProgress(userId, profile);
    insights.push(...cpdInsights);

    // 6. Course Completion Tracking
    const completionInsights = await analyzeCourseCompletion(userId, profile);
    insights.push(...completionInsights);

    // 7. Profile Completeness
    const profileInsights = await analyzeProfileCompleteness(profile);
    insights.push(...profileInsights);

    // Save insights to database
    const savedInsights = await Promise.all(
      insights.map(async (insight: any) => {
        return await (prisma as any).predictiveInsight.create({
          data: {
            user_id: userId,
            tenant_id: tenantId,
            insight_type: insight.type,
            title: insight.title,
            description: insight.description,
            severity: insight.severity,
            priority: insight.priority,
            prediction_model: insight.model,
            confidence_score: insight.confidence,
            predicted_outcome: insight.predicted_outcome,
            recommended_action: insight.recommended_action,
            expected_impact: insight.expected_impact,
            evidence_data: insight.evidence,
            trend_direction: insight.trend,
            is_actionable: insight.is_actionable,
            action_button_text: insight.action_button_text,
            action_url: insight.action_url,
            estimated_time: insight.estimated_time,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          },
        });
      })
    );

    return NextResponse.json({
      success: true,
      generated_count: savedInsights.length,
      insights: savedInsights.map((i: any) => ({
        id: i.id,
        type: i.insight_type,
        title: i.title,
        severity: i.severity,
        confidence: i.confidence_score,
      })),
      message: `Generated ${savedInsights.length} personalized insights`,
    });

  } catch (error: any) {
    console.error('[Study Buddy Insights] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate insights',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH: Update Insight Status
// ============================================================================

export async function PATCH(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.id);
    const body = await request.json();
    const { insight_id, status, feedback } = body;

    if (!insight_id || !status) {
      return NextResponse.json(
        { success: false, error: 'insight_id and status are required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const insight = await (prisma as any).predictiveInsight.findFirst({
      where: {
        id: insight_id,
        user_id: userId,
      },
    });

    if (!insight) {
      return NextResponse.json(
        { success: false, error: 'Insight not found' },
        { status: 404 }
      );
    }

    // Prepare updates
    const updates: any = { status, feedback };

    if (status === 'viewed') updates.viewed_at = new Date();
    if (status === 'acted_upon') updates.acted_at = new Date();
    if (status === 'dismissed') updates.dismissed_at = new Date();

    // Update insight
    const updated = await (prisma as any).predictiveInsight.update({
      where: { id: insight_id },
      data: updates,
    });

    return NextResponse.json({
      success: true,
      insight: {
        id: updated.id,
        status: updated.status,
        feedback: updated.feedback,
      },
      message: 'Insight updated successfully',
    });

  } catch (error: any) {
    console.error('[Study Buddy Insights] PATCH Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update insight',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// INSIGHT ANALYZERS
// ============================================================================

async function analyzeChurnRisk(userId: number, profile: any, tenantId: number): Promise<any[]> {
  const insights = [];

  // High churn risk
  if (profile.churn_risk_score > 0.7) {
    const daysSinceActive = profile.last_active_at
      ? Math.floor((Date.now() - new Date(profile.last_active_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    insights.push({
      type: 'churn_warning',
      title: 'We Miss You!',
      description: `It's been ${daysSinceActive} days since you were last active. There's lots happening in EdPsych Connect World!`,
      severity: 'critical',
      priority: 90,
      model: 'churn_predictor',
      confidence: profile.churn_risk_score,
      predicted_outcome: 'Potential account inactivity and disengagement',
      recommended_action: "Explore new courses, check your Study Buddy recommendations, and see what's new in the platform.",
      expected_impact: 'Stay engaged and continue your professional development journey',
      evidence: {
        days_since_active: daysSinceActive,
        churn_risk: profile.churn_risk_score,
        engagement_score: profile.engagement_score,
      },
      trend: 'declining',
      is_actionable: true,
      action_button_text: "See What's New",
      action_url: '/dashboard',
      estimated_time: 5,
    });
  } else if (profile.churn_risk_score > 0.4) {
    // Moderate churn risk
    insights.push({
      type: 'engagement_nudge',
      title: 'Keep the Momentum Going',
      description: "Your engagement has dipped slightly. Let's get you back on track!",
      severity: 'warning',
      priority: 60,
      model: 'churn_predictor',
      confidence: profile.churn_risk_score,
      predicted_outcome: 'Engagement may continue to decline',
      recommended_action: 'Complete a course or create an assessment to boost your engagement.',
      expected_impact: 'Maintain your professional development progress',
      evidence: {
        churn_risk: profile.churn_risk_score,
        engagement_score: profile.engagement_score,
      },
      trend: 'stable',
      is_actionable: true,
      action_button_text: 'Explore Courses',
      action_url: '/training/marketplace',
      estimated_time: 10,
    });
  }

  return insights;
}

async function analyzeInterventionOpportunities(userId: number, tenantId: number): Promise<any[]> {
  const insights = [];

  // Get recent assessments
  const recentAssessments = await (prisma as any).assessments.findMany({
    where: {
      created_by: userId,
      status: 'completed',
      completion_date: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      },
    },
  });

  // Get interventions created from those assessments
  const interventions = await (prisma as any).interventions.count({
    where: {
      created_by: userId,
      created_at: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });

  if (recentAssessments.length >= 3 && interventions < 2) {
    insights.push({
      type: 'intervention_opportunity',
      title: 'Turn Assessments into Action',
      description: `You've completed ${recentAssessments.length} assessments recently. Consider creating evidence-based interventions based on your findings.`,
      severity: 'info',
      priority: 70,
      model: 'intervention_recommender',
      confidence: 0.75,
      predicted_outcome: 'Improved student outcomes with targeted interventions',
      recommended_action: 'Review your recent assessments and design tailored interventions.',
      expected_impact: 'Better support for students with SEND',
      evidence: {
        recent_assessments: recentAssessments.length,
        interventions_created: interventions,
      },
      trend: null,
      is_actionable: true,
      action_button_text: 'View Assessments',
      action_url: '/assessments',
      estimated_time: 15,
    });
  }

  return insights;
}

async function analyzeLearningPlateau(userId: number, profile: any): Promise<any[]> {
  const insights = [];

  // Check if user has stalled progress
  if (profile.courses_started > 3 && profile.completion_rate < 0.3) {
    insights.push({
      type: 'learning_plateau',
      title: 'Break Through the Plateau',
      description: `You have ${profile.courses_started - profile.courses_completed} courses in progress. Let's help you complete them!`,
      severity: 'warning',
      priority: 65,
      model: 'engagement_analyzer',
      confidence: 0.8,
      predicted_outcome: 'Continued low completion rate without intervention',
      recommended_action: 'Focus on completing 1-2 courses before starting new ones. Your Study Buddy can help!',
      expected_impact: 'Improved completion rate and CPD hours',
      evidence: {
        courses_started: profile.courses_started,
        courses_completed: profile.courses_completed,
        completion_rate: profile.completion_rate,
      },
      trend: 'stable',
      is_actionable: true,
      action_button_text: 'See My Courses',
      action_url: '/training',
      estimated_time: 20,
    });
  }

  return insights;
}

async function analyzeEngagementSpikes(userId: number, profile: any): Promise<any[]> {
  const insights = [];

  // Positive engagement trend
  if (profile.engagement_trend === 'improving' && profile.engagement_score > 70) {
    insights.push({
      type: 'engagement_spike',
      title: 'Amazing Progress!',
      description: `Your engagement score is ${Math.round(profile.engagement_score)}! You're doing fantastic work.`,
      severity: 'info',
      priority: 30,
      model: 'engagement_analyzer',
      confidence: 0.9,
      predicted_outcome: 'Continued high performance and professional growth',
      recommended_action: 'Keep up the excellent work! Consider sharing your knowledge with colleagues.',
      expected_impact: 'Sustained professional excellence',
      evidence: {
        engagement_score: profile.engagement_score,
        trend: profile.engagement_trend,
      },
      trend: 'improving',
      is_actionable: false,
      action_button_text: null,
      action_url: null,
      estimated_time: null,
    });
  }

  return insights;
}

async function analyzeCPDProgress(userId: number, profile: any): Promise<any[]> {
  const insights = [];

  const target = 35; // Annual CPD target
  const progress = profile.total_cpd_hours;
  const percentComplete = (progress / target) * 100;

  if (progress < 10) {
    insights.push({
      type: 'cpd_reminder',
      title: 'Build Your CPD Hours',
      description: `You have ${progress} CPD hours. Aim for ${target} hours annually to meet professional standards.`,
      severity: 'warning',
      priority: 75,
      model: 'cpd_tracker',
      confidence: 0.95,
      predicted_outcome: 'May not meet annual CPD requirements',
      recommended_action: 'Enroll in courses to build your CPD hours. Even 30-minute courses count!',
      expected_impact: 'Meet professional CPD standards',
      evidence: {
        current_cpd: progress,
        target: target,
        percent_complete: percentComplete,
      },
      trend: null,
      is_actionable: true,
      action_button_text: 'Browse Courses',
      action_url: '/training/marketplace',
      estimated_time: 30,
    });
  } else if (progress >= target) {
    insights.push({
      type: 'cpd_achievement',
      title: 'CPD Target Achieved!',
      description: `Congratulations! You've earned ${progress} CPD hours, exceeding your ${target}-hour target.`,
      severity: 'info',
      priority: 20,
      model: 'cpd_tracker',
      confidence: 1.0,
      predicted_outcome: 'Continued professional excellence',
      recommended_action: 'Keep learning! Consider advanced courses or specialized topics.',
      expected_impact: 'Continued professional development',
      evidence: {
        current_cpd: progress,
        target: target,
        percent_complete: percentComplete,
      },
      trend: 'improving',
      is_actionable: false,
      action_button_text: null,
      action_url: null,
      estimated_time: null,
    });
  }

  return insights;
}

async function analyzeCourseCompletion(userId: number, profile: any): Promise<any[]> {
  const insights = [];

  // Get in-progress courses
  const inProgress = profile.courses_started - profile.courses_completed;

  if (inProgress >= 5) {
    insights.push({
      type: 'completion_reminder',
      title: 'Too Many Courses in Progress',
      description: `You have ${inProgress} courses in progress. Focus on completing a few before starting more.`,
      severity: 'info',
      priority: 55,
      model: 'completion_optimizer',
      confidence: 0.85,
      predicted_outcome: 'Continued low completion rate',
      recommended_action: 'Complete 2-3 courses this week to build momentum.',
      expected_impact: 'Better learning outcomes and earned certificates',
      evidence: {
        in_progress: inProgress,
        completion_rate: profile.completion_rate,
      },
      trend: null,
      is_actionable: true,
      action_button_text: 'Continue Learning',
      action_url: '/training',
      estimated_time: 60,
    });
  }

  return insights;
}

async function analyzeProfileCompleteness(profile: any): Promise<any[]> {
  const insights = [];

  if (profile.profile_completeness < 60) {
    insights.push({
      type: 'profile_completion',
      title: 'Complete Your Profile',
      description: `Your profile is ${Math.round(profile.profile_completeness)}% complete. A complete profile helps us give you better recommendations!`,
      severity: 'info',
      priority: 40,
      model: 'profile_optimizer',
      confidence: 1.0,
      predicted_outcome: 'Suboptimal recommendations',
      recommended_action: 'Add your interests, learning preferences, and career goals.',
      expected_impact: 'More personalized Study Buddy recommendations',
      evidence: {
        completeness: profile.profile_completeness,
      },
      trend: null,
      is_actionable: true,
      action_button_text: 'Update Profile',
      action_url: '/study-buddy/profile',
      estimated_time: 5,
    });
  }

  return insights;
}

async function getInsightSummaryStats(userId: number): Promise<any> {
  const allInsights = await (prisma as any).predictiveInsight.findMany({
    where: { user_id: userId },
  });

  const active = allInsights.filter((i: any) => i.status === 'active').length;
  const viewed = allInsights.filter((i: any) => i.status === 'viewed').length;
  const actedUpon = allInsights.filter((i: any) => i.status === 'acted_upon').length;
  const dismissed = allInsights.filter((i: any) => i.status === 'dismissed').length;

  const critical = allInsights.filter((i: any) => i.severity === 'critical').length;
  const warning = allInsights.filter((i: any) => i.severity === 'warning').length;
  const info = allInsights.filter((i: any) => i.severity === 'info').length;

  return {
    total: allInsights.length,
    active,
    viewed,
    acted_upon: actedUpon,
    dismissed,
    action_rate: active > 0 ? actedUpon / active : 0,
    by_severity: {
      critical,
      warning,
      info,
    },
  };
}
