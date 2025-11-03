/**
 * FILE: src/app/api/study-buddy/profile/route.ts
 * PURPOSE: User Learning Profile Management
 *
 * ENDPOINTS:
 * - GET: Retrieve user's learning profile with analytics
 * - PATCH: Update learning preferences and goals
 * - POST: Refresh profile with latest activity data
 *
 * FEATURES:
 * - Comprehensive learning behavior tracking
 * - AI-powered insights and predictions
 * - Engagement score calculations
 * - Churn risk assessment
 * - Personalized learning recommendations
 * - Study Buddy interaction history
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prismaSafe';
import authService from '@/lib/auth/auth-service';

export const dynamic = 'force-dynamic';

// ============================================================================
// GET: Retrieve Learning Profile
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
    const tenantId = session.tenant_id || 0; // Default to 0 if tenant_id not set

    // Get or create learning profile
    let profile = await (prisma as any).userLearningProfile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      profile = await createLearningProfile(userId, tenantId, session.role);
    }

    // Get Study Buddy interaction history
    const interactions = await (prisma as any).studyBuddyInteraction.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 10,
    });

    // Get recommendation statistics
    const recommendationStats = await getRecommendationStats(userId);

    // Get recent activity summary
    const activitySummary = await getActivitySummary(userId, tenantId);

    // Calculate insights
    const insights = generateProfileInsights(profile, activitySummary);

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        role: profile.role,

        // Learning preferences
        learning_style: profile.learning_style,
        preferred_formats: profile.preferred_formats,
        preferred_duration: profile.preferred_duration,
        preferred_time: profile.preferred_time,

        // Interests & expertise
        interest_areas: profile.interest_areas,
        expertise_level: profile.expertise_level,
        career_goals: profile.career_goals,
        current_projects: profile.current_projects,

        // Engagement metrics
        engagement_score: profile.engagement_score,
        engagement_trend: profile.engagement_trend,
        last_active_at: profile.last_active_at,
        total_logins: profile.total_logins,
        consecutive_days: profile.consecutive_days,
        longest_streak: profile.longest_streak,
        avg_session_duration: profile.avg_session_duration,
        most_active_day: profile.most_active_day,
        most_active_hour: profile.most_active_hour,

        // Learning behavior
        courses_started: profile.courses_started,
        courses_completed: profile.courses_completed,
        completion_rate: profile.completion_rate,
        avg_quiz_score: profile.avg_quiz_score,
        total_cpd_hours: profile.total_cpd_hours,
        interventions_used: profile.interventions_used,
        assessments_created: profile.assessments_created,

        // Study Buddy interaction
        recommendations_received: profile.recommendations_received,
        recommendations_clicked: profile.recommendations_clicked,
        recommendations_completed: profile.recommendations_completed,
        recommendations_dismissed: profile.recommendations_dismissed,
        total_buddy_interactions: profile.total_buddy_interactions,
        favorite_buddy_agent: profile.favorite_buddy_agent,

        // Predictive scores
        churn_risk_score: profile.churn_risk_score,
        intervention_success_score: profile.intervention_success_score,
        cpd_completion_score: profile.cpd_completion_score,
        predicted_next_interest: profile.predicted_next_interest,

        // Metadata
        profile_completeness: profile.profile_completeness,
        last_updated_by_ai: profile.last_updated_by_ai,
      },
      recommendation_stats: recommendationStats,
      recent_interactions: interactions.map((i: any) => ({
        id: i.id,
        type: i.interaction_type,
        agent: i.agent_used,
        satisfaction_rating: i.satisfaction_rating,
        created_at: i.created_at,
      })),
      activity_summary: activitySummary,
      insights: insights,
    });

  } catch (error: any) {
    console.error('[Study Buddy Profile] GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve learning profile',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH: Update Learning Preferences
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
    const tenantId = session.tenant_id || 0; // Default to 0 if tenant_id not set
    const body = await request.json();

    // Get current profile
    let profile = await (prisma as any).userLearningProfile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      profile = await createLearningProfile(userId, tenantId, session.role);
    }

    // Prepare updates
    const updates: any = {};

    // User-editable fields
    if (body.learning_style !== undefined) updates.learning_style = body.learning_style;
    if (body.preferred_formats !== undefined) updates.preferred_formats = body.preferred_formats;
    if (body.preferred_duration !== undefined) updates.preferred_duration = body.preferred_duration;
    if (body.preferred_time !== undefined) updates.preferred_time = body.preferred_time;
    if (body.interest_areas !== undefined) updates.interest_areas = body.interest_areas;
    if (body.career_goals !== undefined) updates.career_goals = body.career_goals;
    if (body.current_projects !== undefined) updates.current_projects = body.current_projects;

    // Recalculate profile completeness
    const updatedProfile = { ...profile, ...updates };
    updates.profile_completeness = calculateProfileCompleteness(updatedProfile);

    // Update profile
    const updated = await (prisma as any).userLearningProfile.update({
      where: { user_id: userId },
      data: updates,
    });

    return NextResponse.json({
      success: true,
      profile: {
        id: updated.id,
        learning_style: updated.learning_style,
        preferred_formats: updated.preferred_formats,
        interest_areas: updated.interest_areas,
        career_goals: updated.career_goals,
        profile_completeness: updated.profile_completeness,
      },
      message: 'Learning profile updated successfully',
    });

  } catch (error: any) {
    console.error('[Study Buddy Profile] PATCH Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update learning profile',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST: Refresh Profile with Latest Activity
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

    // Refresh profile with latest activity data
    const updatedProfile = await refreshLearningProfile(userId, tenantId);

    // Generate new recommendations based on updated profile
    const newRecommendationsCount = await generateRecommendations(userId, tenantId);

    return NextResponse.json({
      success: true,
      profile: {
        engagement_score: updatedProfile.engagement_score,
        completion_rate: updatedProfile.completion_rate,
        total_cpd_hours: updatedProfile.total_cpd_hours,
        churn_risk_score: updatedProfile.churn_risk_score,
        engagement_trend: updatedProfile.engagement_trend,
      },
      new_recommendations_generated: newRecommendationsCount,
      message: 'Learning profile refreshed successfully',
    });

  } catch (error: any) {
    console.error('[Study Buddy Profile] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to refresh learning profile',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function createLearningProfile(userId: number, tenantId: number, role: string): Promise<any> {
  const profile = await (prisma as any).userLearningProfile.create({
    data: {
      user_id: userId,
      tenant_id: tenantId,
      role: role,
      interest_areas: [],
      preferred_formats: [],
      learning_style: [],
      engagement_score: 50,
      total_logins: 1,
      consecutive_days: 1,
      longest_streak: 1,
      last_active_at: new Date(),
      profile_completeness: 20,
      last_updated_by_ai: new Date(),
    },
  });

  return profile;
}

async function refreshLearningProfile(userId: number, tenantId: number): Promise<any> {
  const profile = await (prisma as any).userLearningProfile.findUnique({
    where: { user_id: userId },
  });

  if (!profile) {
    return await createLearningProfile(userId, tenantId, 'ep');
  }

  // Get enrollment data
  const enrollments = await (prisma as any).courseEnrollment.findMany({
    where: { user_id: userId.toString() },
    include: {
      course: {
        select: { cpdHours: true },
      },
    },
  });

  const coursesStarted = enrollments.length;
  const coursesCompleted = enrollments.filter((e: any) => e.status === 'completed').length;
  const completionRate = coursesStarted > 0 ? coursesCompleted / coursesStarted : 0;

  // Calculate total CPD hours
  const totalCpdHours = enrollments
    .filter((e: any) => e.status === 'completed')
    .reduce((sum: number, e: any) => sum + (e.course?.cpdHours || 0), 0);

  // Get assessments
  const assessmentsCreated = await (prisma as any).assessments.count({
    where: { created_by: userId },
  });

  // Get interventions
  const interventionsUsed = await (prisma as any).interventions.count({
    where: {
      tenant_id: tenantId,
      OR: [
        { created_by: userId },
        { implemented_by: userId },
      ],
    },
  });

  // Get Study Buddy interactions
  const totalBuddyInteractions = await (prisma as any).studyBuddyInteraction.count({
    where: { user_id: userId },
  });

  // Get recommendation stats
  const recommendations = await (prisma as any).studyBuddyRecommendation.findMany({
    where: { user_id: userId },
  });

  const recommendationsReceived = recommendations.length;
  const recommendationsClicked = recommendations.filter((r: any) => r.status === 'clicked').length;
  const recommendationsCompleted = recommendations.filter((r: any) => r.status === 'completed').length;
  const recommendationsDismissed = recommendations.filter((r: any) => r.status === 'dismissed').length;

  // Calculate engagement score
  const engagementScore = calculateEngagementScore({
    courses_started: coursesStarted,
    courses_completed: coursesCompleted,
    completion_rate: completionRate,
    total_cpd_hours: totalCpdHours,
    assessments_created: assessmentsCreated,
    interventions_used: interventionsUsed,
    consecutive_days: profile.consecutive_days,
  });

  // Calculate churn risk
  const daysSinceActive = profile.last_active_at
    ? Math.floor((Date.now() - new Date(profile.last_active_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const churnRiskScore = calculateChurnRisk(daysSinceActive, engagementScore, completionRate);

  // Determine trend
  const engagementTrend = determineEngagementTrend(engagementScore, profile.engagement_score);

  // Calculate CPD completion score (assuming 35 hours annual target)
  const cpdCompletionScore = Math.min(totalCpdHours / 35, 1);

  // Find favorite agent
  const interactions = await (prisma as any).studyBuddyInteraction.findMany({
    where: { user_id: userId },
    select: { agent_used: true },
  });

  const agentCounts: any = {};
  interactions.forEach((i: any) => {
    agentCounts[i.agent_used] = (agentCounts[i.agent_used] || 0) + 1;
  });

  const agentKeys = Object.keys(agentCounts);
  const favoriteAgent = agentKeys.length > 0
    ? agentKeys.reduce((a, b) => agentCounts[a] > agentCounts[b] ? a : b)
    : null;

  // Update profile
  const updated = await (prisma as any).userLearningProfile.update({
    where: { user_id: userId },
    data: {
      courses_started: coursesStarted,
      courses_completed: coursesCompleted,
      completion_rate: completionRate,
      total_cpd_hours: totalCpdHours,
      assessments_created: assessmentsCreated,
      interventions_used: interventionsUsed,
      engagement_score: engagementScore,
      engagement_trend: engagementTrend,
      churn_risk_score: churnRiskScore,
      cpd_completion_score: cpdCompletionScore,
      recommendations_received: recommendationsReceived,
      recommendations_clicked: recommendationsClicked,
      recommendations_completed: recommendationsCompleted,
      recommendations_dismissed: recommendationsDismissed,
      total_buddy_interactions: totalBuddyInteractions,
      favorite_buddy_agent: favoriteAgent,
      last_updated_by_ai: new Date(),
      last_active_at: new Date(),
      total_logins: profile.total_logins + 1,
    },
  });

  return updated;
}

async function getRecommendationStats(userId: number): Promise<any> {
  const recommendations = await (prisma as any).studyBuddyRecommendation.findMany({
    where: { user_id: userId },
  });

  const total = recommendations.length;
  const active = recommendations.filter((r: any) => r.status === 'active').length;
  const clicked = recommendations.filter((r: any) => r.status === 'clicked').length;
  const completed = recommendations.filter((r: any) => r.status === 'completed').length;
  const dismissed = recommendations.filter((r: any) => r.status === 'dismissed').length;

  return {
    total,
    active,
    clicked,
    completed,
    dismissed,
    click_through_rate: total > 0 ? clicked / total : 0,
    completion_rate: clicked > 0 ? completed / clicked : 0,
  };
}

async function getActivitySummary(userId: number, tenantId: number): Promise<any> {
  // Get recent courses
  const recentCourses = await (prisma as any).courseEnrollment.findMany({
    where: { user_id: userId.toString() },
    include: {
      course: {
        select: { title: true, cpdHours: true },
      },
    },
    orderBy: { started_at: 'desc' },
    take: 5,
  });

  // Get recent assessments
  const recentAssessments = await (prisma as any).assessments.findMany({
    where: { created_by: userId },
    orderBy: { created_at: 'desc' },
    take: 5,
    select: {
      id: true,
      assessment_type: true,
      status: true,
      created_at: true,
    },
  });

  // Get recent interventions
  const recentInterventions = await (prisma as any).interventions.findMany({
    where: {
      tenant_id: tenantId,
      OR: [
        { created_by: userId },
        { implemented_by: userId },
      ],
    },
    orderBy: { created_at: 'desc' },
    take: 5,
    select: {
      id: true,
      intervention_type: true,
      status: true,
      created_at: true,
    },
  });

  return {
    recent_courses: recentCourses.map((e: any) => ({
      title: e.course?.title,
      status: e.status,
      cpd_hours: e.course?.cpdHours,
      started_at: e.started_at,
    })),
    recent_assessments: recentAssessments,
    recent_interventions: recentInterventions,
  };
}

function generateProfileInsights(profile: any, activitySummary: any): any[] {
  const insights = [];

  // Engagement insights
  if (profile.engagement_score < 40) {
    insights.push({
      type: 'engagement',
      title: 'Boost Your Engagement',
      description: 'Your engagement score could be higher. Try completing a course or creating an assessment!',
      priority: 'high',
      action_url: '/training/marketplace',
    });
  } else if (profile.engagement_score > 80) {
    insights.push({
      type: 'celebration',
      title: 'Excellent Engagement!',
      description: `You're highly engaged with an engagement score of ${Math.round(profile.engagement_score)}. Keep it up!`,
      priority: 'low',
    });
  }

  // CPD insights
  if (profile.total_cpd_hours < 10) {
    insights.push({
      type: 'cpd',
      title: 'Build Your CPD Hours',
      description: `You have ${profile.total_cpd_hours} CPD hours. Aim for 35 hours annually!`,
      priority: 'medium',
      action_url: '/training/marketplace',
    });
  } else if (profile.total_cpd_hours >= 35) {
    insights.push({
      type: 'achievement',
      title: 'CPD Target Achieved!',
      description: `Congratulations! You've earned ${profile.total_cpd_hours} CPD hours.`,
      priority: 'low',
    });
  }

  // Completion rate insights
  if (profile.completion_rate < 0.5 && profile.courses_started > 2) {
    insights.push({
      type: 'completion',
      title: 'Complete Your Courses',
      description: `You have ${profile.courses_started - profile.courses_completed} courses in progress. Finish them to earn CPD hours!`,
      priority: 'medium',
      action_url: '/training',
    });
  }

  // Churn risk insights
  if (profile.churn_risk_score > 0.7) {
    insights.push({
      type: 'retention',
      title: 'We Miss You!',
      description: "It's been a while since you were last active. Check out what's new!",
      priority: 'high',
      action_url: '/dashboard',
    });
  }

  // Profile completeness insights
  if (profile.profile_completeness < 60) {
    insights.push({
      type: 'profile',
      title: 'Complete Your Profile',
      description: `Your profile is ${Math.round(profile.profile_completeness)}% complete. Add your interests and goals for better recommendations!`,
      priority: 'medium',
      action_url: '/study-buddy/profile',
    });
  }

  return insights;
}

async function generateRecommendations(userId: number, tenantId: number): Promise<number> {
  // This would call the recommendation generation endpoint
  // For now, return 0 (would be implemented by calling POST /api/study-buddy/recommendations)
  return 0;
}

function calculateEngagementScore(data: any): number {
  let score = 0;

  score += Math.min(data.courses_completed * 5, 40);
  score += Math.min(data.total_cpd_hours, 30);
  score += data.completion_rate * 20;
  score += Math.min((data.assessments_created + data.interventions_used) * 2, 10);

  return Math.min(Math.round(score), 100);
}

function calculateChurnRisk(daysSinceActive: number, engagementScore: number, completionRate: number): number {
  let risk = 0;

  if (daysSinceActive > 30) risk += 0.5;
  else if (daysSinceActive > 14) risk += 0.3;
  else if (daysSinceActive > 7) risk += 0.1;

  if (engagementScore < 30) risk += 0.3;
  else if (engagementScore < 50) risk += 0.1;

  if (completionRate < 0.3) risk += 0.2;

  return Math.min(risk, 1);
}

function determineEngagementTrend(currentScore: number, previousScore: number): 'improving' | 'stable' | 'declining' {
  const difference = currentScore - previousScore;

  if (difference > 5) return 'improving';
  if (difference < -5) return 'declining';
  return 'stable';
}

function calculateProfileCompleteness(profile: any): number {
  let completeness = 20; // Base

  if (profile.interest_areas?.length > 0) completeness += 15;
  if (profile.preferred_formats?.length > 0) completeness += 10;
  if (profile.learning_style?.length > 0) completeness += 10;
  if (profile.career_goals?.length > 0) completeness += 15;
  if (profile.current_projects?.length > 0) completeness += 10;
  if (profile.courses_started > 0) completeness += 10;
  if (profile.courses_completed > 0) completeness += 10;

  return Math.min(completeness, 100);
}
