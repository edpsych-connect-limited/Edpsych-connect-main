/**
 * FILE: src/app/api/study-buddy/recommendations/route.ts
 * PURPOSE: Study Buddy intelligent recommendation system
 *
 * ENDPOINTS:
 * - GET: Retrieve personalized recommendations
 * - POST: Generate new recommendations
 * - PATCH: Update recommendation status (clicked, dismissed, completed)
 *
 * FEATURES:
 * - Multi-strategy recommendations (content-based, interest-based, popularity, assessment-based, colleague-based, predictive)
 * - Real-time personalization based on user learning profile
 * - Confidence scoring and priority ranking
 * - Expected value calculations (time savings, engagement improvements)
 * - Feedback loop for continuous improvement
 * - "Invisible AI philosophy" - friendly, approachable suggestions
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prismaSafe';
import authService from '@/lib/auth/auth-service';

export const dynamic = 'force-dynamic';

// ============================================================================
// GET: Retrieve Personalized Recommendations
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
    const { searchParams } = new URL(request.url);

    const type = searchParams.get('type'); // Filter by recommendation type
    const status = searchParams.get('status') || 'active'; // active, clicked, dismissed, expired, completed
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query
    const where: any = {
      user_id: userId,
    };

    if (type) where.type = type;
    if (status) where.status = status;

    // Get recommendations with ordering by priority and confidence
    const recommendations = await (prisma as any).studyBuddyRecommendation.findMany({
      where,
      orderBy: [
        { priority: 'desc' }, // urgent > high > medium > low
        { confidence: 'desc' },
        { generated_at: 'desc' },
      ],
      take: limit,
    });

    // Get user's learning profile to enhance recommendations
    let learningProfile = await (prisma as any).userLearningProfile.findUnique({
      where: { user_id: userId },
    });

    // If no profile exists, create one
    if (!learningProfile) {
      learningProfile = await createLearningProfile(userId, tenantId);
    }

    // Enrich recommendations with context
    const enrichedRecommendations = await Promise.all(
      recommendations.map(async (rec: any) => {
        return {
          id: rec.id,
          type: rec.type,
          title: rec.title,
          description: rec.description,
          reason: rec.reason,
          priority: rec.priority,
          confidence: rec.confidence,
          expected_value: rec.expected_value,
          resource_url: rec.resource_url,
          generated_by_agent: rec.generated_by_agent,
          generated_at: rec.generated_at,
          expires_at: rec.expires_at,
        };
      })
    );

    // Get summary stats
    const totalActive = await (prisma as any).studyBuddyRecommendation.count({
      where: { user_id: userId, status: 'active' },
    });

    const totalClicked = await (prisma as any).studyBuddyRecommendation.count({
      where: { user_id: userId, status: 'clicked' },
    });

    const totalCompleted = await (prisma as any).studyBuddyRecommendation.count({
      where: { user_id: userId, status: 'completed' },
    });

    return NextResponse.json({
      success: true,
      recommendations: enrichedRecommendations,
      summary: {
        total_active: totalActive,
        total_clicked: totalClicked,
        total_completed: totalCompleted,
        completion_rate: totalCompleted > 0 ? totalCompleted / (totalCompleted + totalClicked) : 0,
      },
      learning_profile: {
        engagement_score: learningProfile.engagement_score,
        interest_areas: learningProfile.interest_areas,
        preferred_formats: learningProfile.preferred_formats,
      },
    });

  } catch (error: any) {
    console.error('[Study Buddy Recommendations] GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve recommendations',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST: Generate New Recommendations
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

    // Get or create user learning profile
    let learningProfile = await (prisma as any).userLearningProfile.findUnique({
      where: { user_id: userId },
    });

    if (!learningProfile) {
      learningProfile = await createLearningProfile(userId, tenantId);
    }

    // Update learning profile with latest activity
    learningProfile = await updateLearningProfile(userId);

    // Generate recommendations using multiple strategies
    const recommendations = [];

    // Strategy 1: Interest-based recommendations (courses in areas of interest)
    const interestRecs = await generateInterestBasedRecommendations(userId, learningProfile, tenantId);
    recommendations.push(...interestRecs);

    // Strategy 2: Assessment-based recommendations (based on recent assessment performance)
    const assessmentRecs = await generateAssessmentBasedRecommendations(userId, tenantId);
    recommendations.push(...assessmentRecs);

    // Strategy 3: Popularity-based recommendations (trending content)
    const popularityRecs = await generatePopularityBasedRecommendations(userId, tenantId);
    recommendations.push(...popularityRecs);

    // Strategy 4: Completion-based recommendations (next logical steps)
    const completionRecs = await generateCompletionBasedRecommendations(userId, learningProfile, tenantId);
    recommendations.push(...completionRecs);

    // Strategy 5: Predictive recommendations (AI-powered predictions)
    const predictiveRecs = await generatePredictiveRecommendations(userId, learningProfile, tenantId);
    recommendations.push(...predictiveRecs);

    // Store recommendations in database
    const savedRecommendations = await Promise.all(
      recommendations.map(async (rec: any) => {
        return await (prisma as any).studyBuddyRecommendation.create({
          data: {
            user_id: userId,
            tenant_id: tenantId,
            type: rec.type,
            title: rec.title,
            description: rec.description,
            reason: rec.reason,
            priority: rec.priority,
            confidence: rec.confidence,
            expected_value: rec.expected_value,
            resource_type: rec.resource_type,
            resource_id: rec.resource_id,
            resource_url: rec.resource_url,
            strategy: rec.strategy,
            strategy_details: rec.strategy_details,
            generated_by_agent: rec.generated_by_agent || 'Study Buddy Recommendation Engine',
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in 7 days
          },
        });
      })
    );

    return NextResponse.json({
      success: true,
      generated_count: savedRecommendations.length,
      recommendations: savedRecommendations.map((r: any) => ({
        id: r.id,
        type: r.type,
        title: r.title,
        priority: r.priority,
        confidence: r.confidence,
      })),
      message: `Generated ${savedRecommendations.length} personalized recommendations`,
    });

  } catch (error: any) {
    console.error('[Study Buddy Recommendations] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate recommendations',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH: Update Recommendation Status
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
    const { recommendation_id, status, feedback } = body;

    if (!recommendation_id || !status) {
      return NextResponse.json(
        { success: false, error: 'recommendation_id and status are required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const recommendation = await (prisma as any).studyBuddyRecommendation.findFirst({
      where: {
        id: recommendation_id,
        user_id: userId,
      },
    });

    if (!recommendation) {
      return NextResponse.json(
        { success: false, error: 'Recommendation not found' },
        { status: 404 }
      );
    }

    // Update recommendation
    const updates: any = { status, feedback };

    if (status === 'clicked') updates.clicked_at = new Date();
    if (status === 'dismissed') updates.dismissed_at = new Date();
    if (status === 'completed') updates.completed_at = new Date();

    const updated = await (prisma as any).studyBuddyRecommendation.update({
      where: { id: recommendation_id },
      data: updates,
    });

    // Update user learning profile based on this interaction
    await updateProfileFromRecommendationFeedback(userId, recommendation, status, feedback);

    return NextResponse.json({
      success: true,
      recommendation: {
        id: updated.id,
        status: updated.status,
        feedback: updated.feedback,
      },
      message: 'Recommendation updated successfully',
    });

  } catch (error: any) {
    console.error('[Study Buddy Recommendations] PATCH Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update recommendation',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS - Recommendation Generation
// ============================================================================

async function generateInterestBasedRecommendations(
  userId: number,
  learningProfile: any,
  _tenantId: number
): Promise<any[]> {
  const recommendations = [];
  const interestAreas = learningProfile.interest_areas || [];

  if (interestAreas.length === 0) return [];

  // Find courses matching user's interests
  for (const interest of interestAreas.slice(0, 2)) { // Top 2 interests
    const courses = await (prisma as any).course.findMany({
      where: {
        category: interest,
        status: 'published',
      },
      take: 2,
      orderBy: { createdAt: 'desc' },
    });

    for (const course of courses) {
      recommendations.push({
        type: 'course',
        title: course.title,
        description: course.description || `Learn more about ${interest}`,
        reason: `Based on your interest in ${interest}`,
        priority: 'medium',
        confidence: 0.75,
        expected_value: `${course.cpdHours} CPD hours`,
        resource_type: 'Course',
        resource_id: course.id,
        resource_url: `/training/marketplace?course=${course.id}`,
        strategy: 'interest_based',
        strategy_details: { matched_interest: interest },
        generated_by_agent: 'Learning Companion',
      });
    }
  }

  return recommendations;
}

async function generateAssessmentBasedRecommendations(
  userId: number,
  _tenantId: number
): Promise<any[]> {
  const recommendations = [];

  // Get user's recent assessments
  const recentAssessments = await (prisma as any).assessments.findMany({
    where: {
      created_by: userId,
      status: 'completed',
    },
    orderBy: { completion_date: 'desc' },
    take: 5,
  });

  if (recentAssessments.length > 0) {
    // Recommend follow-up assessments or interventions
    recommendations.push({
      type: 'assessment',
      title: 'Review Your Recent Assessments',
      description: 'Analyze patterns and plan next steps based on your latest ${recentAssessments.length} completed assessments',
      reason: 'You have completed assessments that could benefit from review',
      priority: 'high',
      confidence: 0.85,
      expected_value: 'Identify intervention opportunities',
      resource_type: 'Assessment',
      resource_id: 'assessment_review',
      resource_url: '/assessments',
      strategy: 'assessment_based',
      strategy_details: { assessment_count: recentAssessments.length },
      generated_by_agent: 'Assessment Evaluator',
    });
  }

  return recommendations;
}

async function generatePopularityBasedRecommendations(
  _userId: number,
  _tenantId: number
): Promise<any[]> {
  const recommendations = [];

  // Get most enrolled courses (popular)
  const popularCourses = await (prisma as any).course.findMany({
    where: {
      status: 'published',
    },
    include: {
      enrollments: {
        select: { id: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  // Sort by enrollment count
  const sortedCourses = popularCourses
    .map((course: any) => ({
      ...course,
      enrollment_count: course.enrollments.length,
    }))
    .sort((a: any, b: any) => b.enrollment_count - a.enrollment_count)
    .slice(0, 2);

  for (const course of sortedCourses) {
    if (course.enrollment_count >= 10) { // Only recommend if genuinely popular
      recommendations.push({
        type: 'course',
        title: course.title,
        description: course.description || `Popular course with ${course.enrollment_count} enrollments`,
        reason: `${course.enrollment_count} colleagues have enrolled in this course`,
        priority: 'medium',
        confidence: 0.65,
        expected_value: `${course.cpdHours} CPD hours`,
        resource_type: 'Course',
        resource_id: course.id,
        resource_url: `/training/marketplace?course=${course.id}`,
        strategy: 'popularity_based',
        strategy_details: { enrollment_count: course.enrollment_count },
        generated_by_agent: 'Trending Tracker',
      });
    }
  }

  return recommendations;
}

async function generateCompletionBasedRecommendations(
  _userId: number,
  learningProfile: any,
  _tenantId: number
): Promise<any[]> {
  const recommendations = [];

  // Check if user has low CPD hours
  if (learningProfile.total_cpd_hours < 20) {
    recommendations.push({
      type: 'training',
      title: 'Boost Your CPD Hours',
      description: `You have ${learningProfile.total_cpd_hours} CPD hours. Explore courses to reach your professional development goals.`,
      reason: 'Stay on track with your CPD requirements',
      priority: 'high',
      confidence: 0.9,
      expected_value: 'Meet your annual CPD target',
      resource_type: 'Course',
      resource_id: 'cpd_courses',
      resource_url: '/training/marketplace',
      strategy: 'completion_based',
      strategy_details: { current_cpd: learningProfile.total_cpd_hours, target: 35 },
      generated_by_agent: 'CPD Companion',
    });
  }

  // Check completion rate
  if (learningProfile.completion_rate < 0.5 && learningProfile.courses_started > 2) {
    recommendations.push({
      type: 'training',
      title: 'Complete Your Started Courses',
      description: `You have ${learningProfile.courses_started - learningProfile.courses_completed} courses in progress. Let's finish them!`,
      reason: 'Boost your completion rate and earn CPD hours',
      priority: 'medium',
      confidence: 0.8,
      expected_value: 'Earn certificates and CPD hours',
      resource_type: 'Course',
      resource_id: 'in_progress',
      resource_url: '/training',
      strategy: 'completion_based',
      strategy_details: {
        in_progress: learningProfile.courses_started - learningProfile.courses_completed,
        completion_rate: learningProfile.completion_rate,
      },
      generated_by_agent: 'Progress Tracker',
    });
  }

  return recommendations;
}

async function generatePredictiveRecommendations(
  _userId: number,
  learningProfile: any,
  _tenantId: number
): Promise<any[]> {
  const recommendations = [];

  // Check churn risk
  if (learningProfile.churn_risk_score > 0.6) {
    recommendations.push({
      type: 'engagement',
      title: 'Stay Connected with EdPsych Connect World',
      description: 'We noticed you haven\'t been active lately. Check out what\'s new!',
      reason: 'Keep building your professional skills',
      priority: 'high',
      confidence: 0.7,
      expected_value: 'Discover new features and courses',
      resource_type: 'Dashboard',
      resource_id: 'dashboard',
      resource_url: '/dashboard',
      strategy: 'predictive',
      strategy_details: { churn_risk: learningProfile.churn_risk_score },
      generated_by_agent: 'Engagement Specialist',
    });
  }

  // Predict next interest area
  if (learningProfile.predicted_next_interest) {
    const courses = await (prisma as any).course.findMany({
      where: {
        category: learningProfile.predicted_next_interest,
        status: 'published',
      },
      take: 1,
      orderBy: { createdAt: 'desc' },
    });

    if (courses.length > 0) {
      const course = courses[0];
      recommendations.push({
        type: 'course',
        title: course.title,
        description: course.description || `Predicted to interest you: ${learningProfile.predicted_next_interest}`,
        reason: `AI predicts you'll be interested in ${learningProfile.predicted_next_interest}`,
        priority: 'medium',
        confidence: 0.6,
        expected_value: `${course.cpdHours} CPD hours`,
        resource_type: 'Course',
        resource_id: course.id,
        resource_url: `/training/marketplace?course=${course.id}`,
        strategy: 'predictive',
        strategy_details: { predicted_interest: learningProfile.predicted_next_interest },
        generated_by_agent: 'Insight Engine',
      });
    }
  }

  return recommendations;
}

// ============================================================================
// HELPER FUNCTIONS - Learning Profile Management
// ============================================================================

async function createLearningProfile(userId: number, tenantId: number): Promise<any> {
  // Get user details
  const user = await (prisma as any).users.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error('User not found');

  // Create initial learning profile
  const profile = await (prisma as any).userLearningProfile.create({
    data: {
      user_id: userId,
      tenant_id: tenantId,
      role: user.role,
      interest_areas: [],
      preferred_formats: [],
      engagement_score: 50, // Start at neutral
      total_logins: 1,
      consecutive_days: 1,
      longest_streak: 1,
      last_active_at: new Date(),
      profile_completeness: 30, // Initial profile is 30% complete
      last_updated_by_ai: new Date(),
    },
  });

  return profile;
}

async function updateLearningProfile(userId: number): Promise<any> {
  // Get current profile
  const profile = await (prisma as any).userLearningProfile.findUnique({
    where: { user_id: userId },
  });

  if (!profile) throw new Error('Profile not found');

  // Get enrollment data
  const enrollments = await (prisma as any).courseEnrollment.findMany({
    where: { user_id: userId.toString() },
  });

  const coursesStarted = enrollments.length;
  const coursesCompleted = enrollments.filter((e: any) => e.status === 'completed').length;
  const completionRate = coursesStarted > 0 ? coursesCompleted / coursesStarted : 0;

  // Calculate total CPD hours
  const completedEnrollments = await (prisma as any).courseEnrollment.findMany({
    where: {
      user_id: userId.toString(),
      status: 'completed',
    },
    include: {
      course: {
        select: { cpdHours: true },
      },
    },
  });

  const totalCpdHours = completedEnrollments.reduce(
    (sum: number, e: any) => sum + (e.course?.cpdHours || 0),
    0
  );

  // Get assessments created
  const assessmentsCreated = await (prisma as any).assessments.count({
    where: { created_by: userId },
  });

  // Get interventions used
  const interventionsUsed = await (prisma as any).interventions.count({
    where: { tenant_id: profile.tenant_id },
  });

  // Calculate engagement score (0-100)
  const engagementScore = calculateEngagementScore({
    courses_started: coursesStarted,
    courses_completed: coursesCompleted,
    completion_rate: completionRate,
    total_cpd_hours: totalCpdHours,
    assessments_created: assessmentsCreated,
    interventions_used: interventionsUsed,
    consecutive_days: profile.consecutive_days,
  });

  // Calculate churn risk (0-1)
  const daysSinceActive = profile.last_active_at
    ? Math.floor((Date.now() - new Date(profile.last_active_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const churnRiskScore = calculateChurnRisk(daysSinceActive, engagementScore, completionRate);

  // Determine engagement trend
  const engagementTrend = determineEngagementTrend(
    engagementScore,
    profile.engagement_score
  );

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
      churn_risk_score: churnRiskScore,
      engagement_trend: engagementTrend,
      last_updated_by_ai: new Date(),
      profile_completeness: calculateProfileCompleteness(profile, {
        coursesStarted,
        coursesCompleted,
        assessmentsCreated,
      }),
    },
  });

  return updated;
}

async function updateProfileFromRecommendationFeedback(
  userId: number,
  recommendation: any,
  status: string,
  _feedback: string | null
): Promise<void> {
  const profile = await (prisma as any).userLearningProfile.findUnique({
    where: { user_id: userId },
  });

  if (!profile) return;

  const updates: any = {};

  if (status === 'clicked') {
    updates.recommendations_clicked = profile.recommendations_clicked + 1;
  } else if (status === 'dismissed') {
    updates.recommendations_dismissed = profile.recommendations_dismissed + 1;
  } else if (status === 'completed') {
    updates.recommendations_completed = profile.recommendations_completed + 1;
  }

  updates.total_buddy_interactions = profile.total_buddy_interactions + 1;

  if (recommendation.generated_by_agent) {
    updates.favorite_buddy_agent = recommendation.generated_by_agent;
  }

  await (prisma as any).userLearningProfile.update({
    where: { user_id: userId },
    data: updates,
  });
}

function calculateEngagementScore(data: any): number {
  let score = 0;

  // Course completion contributes 40%
  score += Math.min(data.courses_completed * 5, 40);

  // CPD hours contribute 30%
  score += Math.min(data.total_cpd_hours, 30);

  // Completion rate contributes 20%
  score += data.completion_rate * 20;

  // Activity (assessments, interventions) contributes 10%
  score += Math.min((data.assessments_created + data.interventions_used) * 2, 10);

  return Math.min(Math.round(score), 100);
}

function calculateChurnRisk(daysSinceActive: number, engagementScore: number, completionRate: number): number {
  let risk = 0;

  // Days since last active contributes heavily
  if (daysSinceActive > 30) risk += 0.5;
  else if (daysSinceActive > 14) risk += 0.3;
  else if (daysSinceActive > 7) risk += 0.1;

  // Low engagement score increases risk
  if (engagementScore < 30) risk += 0.3;
  else if (engagementScore < 50) risk += 0.1;

  // Low completion rate increases risk
  if (completionRate < 0.3) risk += 0.2;

  return Math.min(risk, 1);
}

function determineEngagementTrend(
  currentScore: number,
  previousScore: number
): 'improving' | 'stable' | 'declining' {
  const difference = currentScore - previousScore;

  if (difference > 5) return 'improving';
  if (difference < -5) return 'declining';
  return 'stable';
}

function calculateProfileCompleteness(profile: any, additionalData: any): number {
  let completeness = 30; // Base

  if (profile.interest_areas?.length > 0) completeness += 15;
  if (profile.preferred_formats?.length > 0) completeness += 10;
  if (profile.career_goals?.length > 0) completeness += 15;
  if (additionalData.coursesStarted > 0) completeness += 10;
  if (additionalData.coursesCompleted > 0) completeness += 10;
  if (additionalData.assessmentsCreated > 0) completeness += 10;

  return Math.min(completeness, 100);
}
