import { logger } from "@/lib/logger";
/**
 * FILE: src/lib/study-buddy/predictive-analytics.ts
 * PURPOSE: Predictive Analytics Engine for Study Buddy
 *
 * FEATURES:
 * - Student outcome predictions
 * - Early intervention identification
 * - Learning trajectory forecasting
 * - Engagement prediction
 * - Churn risk calculation
 * - Resource recommendation optimization
 * - A/B testing framework
 *
 * MODELS:
 * - Churn Prediction Model
 * - Engagement Forecasting Model
 * - Intervention Success Predictor
 * - CPD Completion Predictor
 * - Next Interest Predictor
 */

import prisma from '@/lib/prismaSafe';

// ============================================================================
// PREDICTIVE ANALYTICS ENGINE
// ============================================================================

export class PredictiveAnalyticsEngine {
  /**
   * Run all predictions for a user
   */
  static async runAllPredictions(userId: number, tenantId: number): Promise<any> {
    const results = {
      churn_risk: await this.predictChurnRisk(userId),
      engagement_forecast: await this.forecastEngagement(userId),
      intervention_success: await this.predictInterventionSuccess(userId, tenantId),
      cpd_completion: await this.predictCPDCompletion(userId),
      next_interest: await this.predictNextInterest(userId),
      learning_trajectory: await this.forecastLearningTrajectory(userId),
    };

    // Update user profile with predictions
    await this.updateProfileWithPredictions(userId, results);

    return results;
  }

  /**
   * Predict churn risk (0-1 probability)
   */
  static async predictChurnRisk(userId: number): Promise<number> {
    const profile = await (prisma as any).userLearningProfile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) return 0.5; // Neutral risk for new users

    let risk = 0;

    // Days since last active (40% weight)
    const daysSinceActive = profile.last_active_at
      ? Math.floor((Date.now() - new Date(profile.last_active_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    if (daysSinceActive > 30) risk += 0.4;
    else if (daysSinceActive > 14) risk += 0.25;
    else if (daysSinceActive > 7) risk += 0.1;

    // Engagement score (30% weight)
    const engagementFactor = (100 - profile.engagement_score) / 100;
    risk += engagementFactor * 0.3;

    // Completion rate (20% weight)
    if (profile.completion_rate < 0.2) risk += 0.2;
    else if (profile.completion_rate < 0.4) risk += 0.1;

    // Consecutive days streak (10% weight)
    if (profile.consecutive_days === 0) risk += 0.1;
    else if (profile.consecutive_days < 3) risk += 0.05;

    return Math.min(Math.max(risk, 0), 1);
  }

  /**
   * Forecast engagement trend for next 30 days
   */
  static async forecastEngagement(userId: number): Promise<any> {
    const profile = await (prisma as any).userLearningProfile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      return {
        current: 50,
        forecast_7d: 50,
        forecast_30d: 50,
        confidence: 0.5,
        trend: 'stable',
      };
    }

    // Simple linear extrapolation based on current trend
    const currentScore = profile.engagement_score;
    const trend = profile.engagement_trend;

    let forecast7d = currentScore;
    let forecast30d = currentScore;

    if (trend === 'improving') {
      forecast7d = Math.min(currentScore + 5, 100);
      forecast30d = Math.min(currentScore + 15, 100);
    } else if (trend === 'declining') {
      forecast7d = Math.max(currentScore - 5, 0);
      forecast30d = Math.max(currentScore - 15, 0);
    }

    // Confidence based on data quality
    const confidence = Math.min(
      0.5 + (profile.total_logins / 50) * 0.3 + (profile.courses_started / 10) * 0.2,
      0.95
    );

    return {
      current: currentScore,
      forecast_7d: Math.round(forecast7d),
      forecast_30d: Math.round(forecast30d),
      confidence: Math.round(confidence * 100) / 100,
      trend: trend,
    };
  }

  /**
   * Predict intervention success rate
   */
  static async predictInterventionSuccess(userId: number, tenantId: number): Promise<number> {
    // Get user's intervention history
    const interventions = await (prisma as any).interventions.findMany({
      where: {
        tenant_id: tenantId,
        OR: [{ created_by: userId }, { implemented_by: userId }],
      },
    });

    if (interventions.length === 0) return 0.7; // Optimistic default for new users

    // Calculate success rate from historical data
    const completed = interventions.filter((i: any) => i.status === 'completed').length;
    const _inProgress = interventions.filter((i: any) => i.status === 'in_progress').length;
    const total = interventions.length;

    // Historical success rate
    const historicalRate = completed / total;

    // Adjust based on engagement
    const profile = await (prisma as any).userLearningProfile.findUnique({
      where: { user_id: userId },
    });

    const engagementBonus = profile ? (profile.engagement_score / 100) * 0.2 : 0;

    const predictedRate = Math.min(historicalRate * 0.7 + engagementBonus + 0.3, 1);

    return Math.round(predictedRate * 100) / 100;
  }

  /**
   * Predict CPD completion likelihood
   */
  static async predictCPDCompletion(userId: number): Promise<number> {
    const profile = await (prisma as any).userLearningProfile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) return 0.5;

    const target = 35; // Annual CPD target
    const currentProgress = profile.total_cpd_hours;
    const completionRate = profile.completion_rate;
    const coursesInProgress = profile.courses_started - profile.courses_completed;

    // Calculate projection
    let score = 0;

    // Current progress (40% weight)
    score += (currentProgress / target) * 0.4;

    // Completion rate (30% weight)
    score += completionRate * 0.3;

    // Courses in pipeline (20% weight)
    score += Math.min(coursesInProgress / 10, 1) * 0.2;

    // Engagement (10% weight)
    score += (profile.engagement_score / 100) * 0.1;

    return Math.min(Math.max(score, 0), 1);
  }

  /**
   * Predict user's next area of interest
   */
  static async predictNextInterest(userId: number): Promise<string | null> {
    const profile = await (prisma as any).userLearningProfile.findUnique({
      where: { user_id: userId },
    });

    if (!profile || !profile.interest_areas || profile.interest_areas.length === 0) {
      return null;
    }

    // Get user's course history
    const enrollments = await (prisma as any).courseEnrollment.findMany({
      where: { user_id: userId.toString() },
      include: {
        course: {
          select: { category: true },
        },
      },
    });

    if (enrollments.length === 0) return null;

    // Count categories
    const categoryCounts: any = {};
    enrollments.forEach((e: any) => {
      const cat = e.course?.category;
      if (cat) categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    // Find most common category
    const sortedCategories = Object.entries(categoryCounts)
      .sort(([, a]: any, [, b]: any) => b - a)
      .map(([cat]) => cat);

    // Predict related interest
    const relatedInterests: any = {
      ADHD: ['Behavior Management', 'Executive Function', 'Attention Strategies'],
      Dyslexia: ['Phonological Awareness', 'Reading Comprehension', 'Literacy Support'],
      Autism: ['Social Communication', 'Sensory Processing', 'Structured Teaching'],
      'Behavior Management': ['Restorative Justice', 'PBIS', 'Trauma-Informed Practice'],
      'Mental Health': ['Wellbeing', 'Anxiety Support', 'Resilience Building'],
    };

    const currentInterest = sortedCategories[0];
    const related = relatedInterests[currentInterest];

    if (related) {
      // Return first related interest not already in user's interests
      for (const rel of related) {
        if (!profile.interest_areas.includes(rel)) {
          return rel;
        }
      }
    }

    return null;
  }

  /**
   * Forecast learning trajectory
   */
  static async forecastLearningTrajectory(userId: number): Promise<any> {
    const profile = await (prisma as any).userLearningProfile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      return {
        current_level: 'beginner',
        projected_level_30d: 'beginner',
        projected_level_90d: 'intermediate',
        confidence: 0.5,
      };
    }

    // Determine current level
    const currentLevel = this.determineSkillLevel(profile);

    // Project future levels based on current trajectory
    let projected30d = currentLevel;
    let projected90d = currentLevel;

    if (profile.engagement_trend === 'improving' && profile.engagement_score > 60) {
      if (currentLevel === 'beginner') {
        projected30d = 'intermediate';
        projected90d = 'advanced';
      } else if (currentLevel === 'intermediate') {
        projected30d = 'intermediate';
        projected90d = 'expert';
      }
    } else if (profile.engagement_trend === 'stable' && profile.engagement_score > 50) {
      if (currentLevel === 'beginner') {
        projected30d = 'beginner';
        projected90d = 'intermediate';
      } else if (currentLevel === 'intermediate') {
        projected30d = 'intermediate';
        projected90d = 'advanced';
      }
    }

    return {
      current_level: currentLevel,
      projected_level_30d: projected30d,
      projected_level_90d: projected90d,
      confidence: 0.75,
      factors: {
        engagement: profile.engagement_score,
        completion_rate: profile.completion_rate,
        cpd_hours: profile.total_cpd_hours,
      },
    };
  }

  /**
   * Update user profile with predictions
   */
  private static async updateProfileWithPredictions(userId: number, predictions: any): Promise<void> {
    await (prisma as any).userLearningProfile.update({
      where: { user_id: userId },
      data: {
        churn_risk_score: predictions.churn_risk,
        intervention_success_score: predictions.intervention_success,
        cpd_completion_score: predictions.cpd_completion,
        predicted_next_interest: predictions.next_interest,
        engagement_trend: predictions.engagement_forecast.trend,
        last_updated_by_ai: new Date(),
      },
    });
  }

  /**
   * Determine user's current skill level
   */
  private static determineSkillLevel(profile: any): string {
    const score =
      profile.courses_completed * 10 +
      profile.total_cpd_hours * 2 +
      profile.assessments_created * 5 +
      profile.interventions_used * 3;

    if (score < 50) return 'beginner';
    if (score < 150) return 'intermediate';
    if (score < 300) return 'advanced';
    return 'expert';
  }
}

// ============================================================================
// BATCH PREDICTION RUNNER (For Cron Jobs)
// ============================================================================

export class BatchPredictionRunner {
  /**
   * Run predictions for all active users
   */
  static async runForAllUsers(tenantId?: number): Promise<any> {
    const where: any = {};
    if (tenantId) where.tenant_id = tenantId;

    // Get all users with learning profiles
    const profiles = await (prisma as any).userLearningProfile.findMany({
      where,
      select: { user_id: true, tenant_id: true },
    });

    logger.debug(`[Batch Predictions] Running for ${profiles.length} users...`);

    const results = [];

    for (const profile of profiles) {
      try {
        const prediction = await PredictiveAnalyticsEngine.runAllPredictions(
          profile.user_id,
          profile.tenant_id
        );

        results.push({
          user_id: profile.user_id,
          success: true,
          predictions: prediction,
        });
      } catch (error: any) {
        console.error(`[Batch Predictions] Error for user ${profile.user_id}:`, error.message);
        results.push({
          user_id: profile.user_id,
          success: false,
          error: error.message,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    logger.debug(`[Batch Predictions] Completed: ${successCount}/${profiles.length} successful`);

    return {
      total: profiles.length,
      successful: successCount,
      failed: profiles.length - successCount,
      results,
    };
  }

  /**
   * Run predictions for high-risk users only
   */
  static async runForHighRiskUsers(): Promise<any> {
    const profiles = await (prisma as any).userLearningProfile.findMany({
      where: {
        OR: [
          { churn_risk_score: { gte: 0.6 } },
          { engagement_score: { lte: 40 } },
          { cpd_completion_score: { lte: 0.3 } },
        ],
      },
      select: { user_id: true, tenant_id: true, churn_risk_score: true },
    });

    logger.debug(`[High Risk Predictions] Found ${profiles.length} high-risk users`);

    const results = [];

    for (const profile of profiles) {
      try {
        const prediction = await PredictiveAnalyticsEngine.runAllPredictions(
          profile.user_id,
          profile.tenant_id
        );

        // Generate urgent insights for high-risk users
        await this.generateUrgentInsights(profile.user_id, profile.tenant_id, prediction);

        results.push({
          user_id: profile.user_id,
          success: true,
          churn_risk: prediction.churn_risk,
        });
      } catch (error: any) {
        console.error(`[High Risk Predictions] Error for user ${profile.user_id}:`, error.message);
        results.push({
          user_id: profile.user_id,
          success: false,
          error: error.message,
        });
      }
    }

    return {
      high_risk_users: profiles.length,
      processed: results.length,
      results,
    };
  }

  /**
   * Generate urgent insights for high-risk users
   */
  private static async generateUrgentInsights(
    userId: number,
    tenantId: number,
    predictions: any
  ): Promise<void> {
    const insights = [];

    if (predictions.churn_risk > 0.7) {
      insights.push({
        user_id: userId,
        tenant_id: tenantId,
        insight_type: 'churn_warning',
        title: 'Urgent: Re-Engagement Needed',
        description: "Your activity has significantly decreased. Let's get you back on track!",
        severity: 'critical',
        priority: 95,
        prediction_model: 'churn_predictor',
        confidence_score: predictions.churn_risk,
        predicted_outcome: 'Account inactivity imminent',
        recommended_action: 'Check your Study Buddy recommendations and explore new features.',
        expected_impact: 'Renewed engagement and professional development',
        is_actionable: true,
        action_button_text: 'See Recommendations',
        action_url: '/study-buddy/recommendations',
        estimated_time: 5,
      });
    }

    if (predictions.cpd_completion < 0.3) {
      insights.push({
        user_id: userId,
        tenant_id: tenantId,
        insight_type: 'cpd_at_risk',
        title: 'CPD Target at Risk',
        description: 'You may not meet your annual CPD target at this pace.',
        severity: 'warning',
        priority: 80,
        prediction_model: 'cpd_predictor',
        confidence_score: predictions.cpd_completion,
        predicted_outcome: 'Annual CPD target not met',
        recommended_action: 'Enroll in 2-3 courses this month to get back on track.',
        expected_impact: 'Meet professional CPD standards',
        is_actionable: true,
        action_button_text: 'Browse Courses',
        action_url: '/training/marketplace',
        estimated_time: 30,
      });
    }

    // Save insights
    for (const insight of insights) {
      await (prisma as any).predictiveInsight.create({
        data: insight,
      });
    }
  }
}

// ============================================================================
// A/B TESTING FRAMEWORK
// ============================================================================

export class ABTestingFramework {
  /**
   * Assign user to test variant
   */
  static assignVariant(userId: number, testName: string, variants: string[]): string {
    // Deterministic assignment based on user ID
    const hash = userId % variants.length;
    return variants[hash];
  }

  /**
   * Track test outcome
   */
  static async trackOutcome(
    userId: number,
    testName: string,
    variant: string,
    outcome: string,
    value?: number
  ): Promise<void> {
    // Would integrate with analytics system
    logger.debug(`[A/B Test] ${testName} - ${variant} - ${outcome}:`, value);
  }

  /**
   * Get test results
   */
  static async getTestResults(testName: string): Promise<any> {
    // Would aggregate results from analytics
    return {
      test_name: testName,
      variants: [],
      winner: null,
      confidence: 0,
    };
  }
}
