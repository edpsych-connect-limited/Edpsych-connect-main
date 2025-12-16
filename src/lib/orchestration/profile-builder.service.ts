/**
 * PROFILE BUILDER SERVICE
 *
 * PURPOSE: Automatically build and maintain comprehensive student profiles
 * from ALL system interactions - NO manual data entry required.
 *
 * DATA SOURCES:
 * - Assessment results (standardized + classroom)
 * - Lesson completion rates and success patterns
 * - Intervention progress and effectiveness
 * - Battle Royale performance (learning style indicators)
 * - EHCP data (official SEND needs)
 * - Teacher observations and flagging
 *
 * OUTPUT: Continuously updated StudentProfile with confidence scores
 *
 * PRINCIPLE: The more a student uses the system, the better we understand them.
 */

import { logger } from "@/lib/logger";
import { prisma } from '@/lib/prisma';

// ============================================================================
// TYPES
// ============================================================================

interface AssessmentResult {
  assessment_id: string;
  student_id: number;
  assessment_type: string;
  domain_scores: { domain: string; score: number; max_score: number }[];
  overall_score: number;
  strengths?: string[];
  weaknesses?: string[];
  completed_at: Date;
}

interface LessonActivityData {
  student_id: number;
  lesson_id: string;
  activity_id: string;
  assigned_difficulty: string;
  success_rate: number;
  time_spent_seconds: number;
  struggled: boolean;
  excelled: boolean;
  completion_date: Date;
}

interface InterventionProgress {
  student_id: number;
  intervention_id: string;
  intervention_type: string;
  target_area: string;
  effectiveness_score: number; // 0-1
  completed: boolean;
}

interface BattleRoyalePerformance {
  student_id: number;
  game_id: string;
  speed_score: number; // How fast they complete
  strategy_score: number; // Quality of approach
  persistence_score: number; // How often they retry
  preferred_game_types: string[];
}

interface LearningStyleScores {
  visual: number; // 0-1
  auditory: number; // 0-1
  kinaesthetic: number; // 0-1
  confidence: number; // How confident are these scores
}

// ============================================================================
// PROFILE BUILDER SERVICE
// ============================================================================

export class ProfileBuilderService {
  /**
   * Update student profile from assessment completion
   *
   * Extracts:
   * - Strengths and weaknesses from domain scores
   * - Updates profile confidence based on assessment quality
   * - Triggers intervention if severe weaknesses identified
   */
  static async updateProfileFromAssessment(
    assessmentResult: AssessmentResult
  ): Promise<void> {
    try {
      const { student_id, domain_scores, strengths, weaknesses } = assessmentResult;

      // Get or create profile
      let profile = await prisma.studentProfile.findUnique({
        where: { student_id },
      });

      if (!profile) {
        profile = await this.createInitialProfile(student_id);
      }

      // Ensure profile exists after creation attempt
      if (!profile) {
        throw new Error(`Failed to create profile for student ${student_id}`);
      }

      // Extract strengths (domains with >80% score)
      const assessmentStrengths = domain_scores
        .filter((d) => d.score / d.max_score >= 0.8)
        .map((d) => d.domain);

      // Extract struggles (domains with <60% score)
      const assessmentStruggles = domain_scores
        .filter((d) => d.score / d.max_score < 0.6)
        .map((d) => d.domain);

      // Merge with existing (don't overwrite, accumulate evidence)
      const updatedStrengths = this.mergeUniqueStrings(
        profile.current_strengths,
        [...assessmentStrengths, ...(strengths || [])]
      );

      const updatedStruggles = this.mergeUniqueStrings(
        profile.current_struggles,
        [...assessmentStruggles, ...(weaknesses || [])]
      );

      // Check if intervention needed
      const needsIntervention = updatedStruggles.length >= 2; // 2+ areas of struggle
      const interventionUrgency = this.calculateInterventionUrgency(
        domain_scores,
        assessmentResult.overall_score
      );

      // Update profile confidence (assessments are high-quality data)
      const newConfidence = Math.min(1.0, profile.profile_confidence + 0.15);

      // Update Cognitive Profile (learning_style)
      const currentLearningStyle = (profile.learning_style as any) || {};
      const updatedLearningStyle = { ...currentLearningStyle };

      // Map domain scores to profile keys
      domain_scores.forEach(ds => {
        const normalizedScore = (ds.score / ds.max_score) * 100;
        const domainKey = this.mapDomainToKey(ds.domain);
        if (domainKey) {
          // Weighted average: 70% new score, 30% old score (if exists)
          const oldScore = updatedLearningStyle[domainKey] || 50; // Default to 50 if new
          updatedLearningStyle[domainKey] = Math.round((normalizedScore * 0.7) + (oldScore * 0.3));
        }
      });

      // Update profile
      await prisma.studentProfile.update({
        where: { student_id },
        data: {
          current_strengths: updatedStrengths,
          current_struggles: updatedStruggles,
          needs_intervention: needsIntervention,
          intervention_urgency: needsIntervention ? interventionUrgency : null,
          profile_confidence: newConfidence,
          learning_style: updatedLearningStyle, // Save updated scores
          last_synced_at: new Date(),
          updated_at: new Date(),
        },
      });

      // Log automated action
      await this.logAutomatedAction({
        tenant_id: profile.tenant_id,
        action_type: 'profile_updated',
        triggered_by: 'assessment_complete',
        target_type: 'student',
        target_id: student_id.toString(),
        student_id,
        action_data: {
          assessment_id: assessmentResult.assessment_id,
          strengths_added: assessmentStrengths,
          struggles_added: assessmentStruggles,
          intervention_triggered: needsIntervention,
        },
        requires_approval: false,
      });

      logger.info(
        `Profile updated for student ${student_id} from assessment ${assessmentResult.assessment_id}`
      );
    } catch (_error) {
      logger.error('Error updating profile from assessment:', _error as Error);
      throw _error;
    }
  }

  /**
   * Update student profile from lesson activity completion
   *
   * Tracks:
   * - Success patterns (ready to level up?)
   * - Struggle patterns (intervention needed?)
   * - Learning pace (fast, medium, slow?)
   * - Engagement (persistent or gives up easily?)
   */
  static async updateProfileFromLessonActivity(
    activityData: LessonActivityData
  ): Promise<void> {
    try {
      const { student_id, success_rate, struggled, excelled, time_spent_seconds } =
        activityData;

      const profile = await this.getOrCreateProfile(student_id);

      // Get recent lesson history (last 10 lessons)
      const recentAssignments = await prisma.studentLessonAssignment.findMany({
        where: { student_id },
        orderBy: { updated_at: 'desc' },
        take: 10,
      });

      // Calculate recent success rate
      const recentSuccessRates = recentAssignments
        .filter((a: any) => a.success_rate !== null)
        .map((a: any) => a.success_rate as number);

      const avgRecentSuccess =
        recentSuccessRates.length > 0
          ? recentSuccessRates.reduce((a: number, b: number) => a + b, 0) / recentSuccessRates.length
          : 0.5;

      // Determine if ready to level up (5+ consecutive lessons with 80%+ success)
      const consecutiveSuccess = this.countConsecutiveHighPerformance(
        recentAssignments,
        0.8
      );
      const readyToLevelUp = consecutiveSuccess >= 5;

      // Determine if needs intervention (3+ consecutive lessons with <50% success)
      const consecutiveStruggle = this.countConsecutiveLowPerformance(
        recentAssignments,
        0.5
      );
      const needsIntervention = consecutiveStruggle >= 3;

      // Calculate engagement score (based on completion rate and persistence)
      const completionRate = this.calculateCompletionRate(recentAssignments);
      const newEngagementScore = this.calculateEngagementScore(
        profile.engagement_score,
        completionRate,
        success_rate
      );

      // Calculate persistence score (do they keep trying or give up?)
      const newPersistenceScore = this.calculatePersistenceScore(
        profile.persistence_score,
        struggled,
        excelled
      );

      // Determine pace level
      const paceLevel = this.determinePaceLevel(time_spent_seconds, activityData.assigned_difficulty);

      // Update profile
      await prisma.studentProfile.update({
        where: { student_id },
        data: {
          ready_to_level_up: readyToLevelUp,
          needs_intervention: needsIntervention,
          intervention_urgency: needsIntervention ? 'medium' : profile.intervention_urgency,
          engagement_score: newEngagementScore,
          persistence_score: newPersistenceScore,
          pace_level: paceLevel,
          profile_confidence: Math.min(1.0, profile.profile_confidence + 0.05),
          last_synced_at: new Date(),
          updated_at: new Date(),
        },
      });

      // Log if significant change
      if (readyToLevelUp || needsIntervention) {
        await this.logAutomatedAction({
          tenant_id: profile.tenant_id,
          action_type: readyToLevelUp ? 'level_up_recommended' : 'intervention_triggered',
          triggered_by: 'lesson_pattern',
          target_type: 'student',
          target_id: student_id.toString(),
          student_id,
          action_data: {
            consecutive_success: consecutiveSuccess,
            consecutive_struggle: consecutiveStruggle,
            avg_recent_success: avgRecentSuccess,
          },
          requires_approval: true, // Teacher should approve level changes
        });
      }

      logger.info(`Profile updated for student ${student_id} from lesson activity`);
    } catch (_error) {
      logger.error('Error updating profile from lesson activity:', _error as Error);
      throw _error;
    }
  }

  /**
   * Update student profile from intervention progress
   *
   * Records:
   * - What interventions have been tried
   * - Which strategies are effective for this student
   * - Historical patterns for future reference
   */
  static async updateProfileFromIntervention(
    interventionProgress: InterventionProgress
  ): Promise<void> {
    try {
      const { student_id, intervention_type, target_area, effectiveness_score, completed } =
        interventionProgress;

      const profile = await this.getOrCreateProfile(student_id);

      // If intervention was effective (>0.7), add to effective strategies
      if (completed && effectiveness_score >= 0.7) {
        const effectiveStrategy = {
          intervention_type,
          target_area,
          effectiveness: effectiveness_score,
          completed_at: new Date().toISOString(),
        };

        const updatedStrategies = [
          ...(profile.effective_strategies as any[]),
          effectiveStrategy,
        ];

        await prisma.studentProfile.update({
          where: { student_id },
          data: {
            effective_strategies: updatedStrategies,
            updated_at: new Date(),
          },
        });

        logger.info(
          `Effective strategy recorded for student ${student_id}: ${intervention_type}`
        );
      }

      // If intervention addressed a struggle area, potentially remove from current_struggles
      if (completed && effectiveness_score >= 0.7) {
        const updatedStruggles = profile.current_struggles.filter(
          (struggle: string) => !struggle.toLowerCase().includes(target_area.toLowerCase())
        );

        if (updatedStruggles.length < profile.current_struggles.length) {
          await prisma.studentProfile.update({
            where: { student_id },
            data: {
              current_struggles: updatedStruggles,
              needs_intervention: updatedStruggles.length >= 2,
              updated_at: new Date(),
            },
          });

          logger.info(`Struggle area resolved for student ${student_id}: ${target_area}`);
        }
      }
    } catch (_error) {
      logger.error('Error updating profile from intervention:', _error as Error);
      throw _error;
    }
  }

  /**
   * Update student profile from Battle Royale performance
   *
   * Battle Royale gameplay reveals:
   * - Visual learners (prefer visual challenges)
   * - Kinesthetic learners (prefer hands-on, interactive)
   * - Persistence (how often they retry challenges)
   * - Collaboration style (team vs solo performance)
   */
  static async updateProfileFromBattleRoyale(
    performance: BattleRoyalePerformance
  ): Promise<void> {
    try {
      const { student_id, speed_score: _speed_score, strategy_score: _strategy_score, persistence_score, preferred_game_types } =
        performance;

      const profile = await this.getOrCreateProfile(student_id);

      // Infer learning style from game preferences
      const learningStyle = this.inferLearningStyleFromGames(
        preferred_game_types,
        profile.learning_style as any
      );

      // Update persistence score
      const newPersistenceScore = (profile.persistence_score + persistence_score) / 2;

      // Update profile
      await prisma.studentProfile.update({
        where: { student_id },
        data: {
          learning_style: learningStyle as any,
          persistence_score: newPersistenceScore,
          profile_confidence: Math.min(1.0, profile.profile_confidence + 0.08),
          last_synced_at: new Date(),
          updated_at: new Date(),
        },
      });

      logger.info(`Profile updated for student ${student_id} from Battle Royale performance`);
    } catch (_error) {
      logger.error('Error updating profile from Battle Royale:', _error as Error);
      throw _error;
    }
  }

  /**
   * Predict if student is ready to progress to next level
   *
   * Criteria:
   * - 5+ consecutive lessons with 80%+ success rate
   * - Engagement score > 0.7
   * - No recent struggle patterns
   */
  static async predictReadinessToProgress(student_id: number): Promise<{
    ready: boolean;
    confidence: number;
    reasoning: string[];
  }> {
    try {
      const profile = await this.getOrCreateProfile(student_id);

      // Get recent lesson history
      const recentAssignments = await prisma.studentLessonAssignment.findMany({
        where: { student_id },
        orderBy: { updated_at: 'desc' },
        take: 10,
      });

      const consecutiveSuccess = this.countConsecutiveHighPerformance(recentAssignments, 0.8);
      const engagementHigh = profile.engagement_score >= 0.7;
      const noRecentStruggles = !profile.needs_intervention;

      const reasoning: string[] = [];

      if (consecutiveSuccess >= 5) {
        reasoning.push(`${consecutiveSuccess} consecutive high-performing lessons`);
      } else {
        reasoning.push(`Only ${consecutiveSuccess} consecutive successful lessons (need 5)`);
      }

      if (engagementHigh) {
        reasoning.push('High engagement score');
      } else {
        reasoning.push('Engagement needs improvement');
      }

      if (noRecentStruggles) {
        reasoning.push('No active intervention needs');
      } else {
        reasoning.push('Currently needs support in some areas');
      }

      const ready = consecutiveSuccess >= 5 && engagementHigh && noRecentStruggles;
      const confidence = profile.profile_confidence;

      return {
        ready,
        confidence,
        reasoning,
      };
    } catch (_error) {
      logger.error('Error predicting readiness to progress:', _error as Error);
      throw _error;
    }
  }

  /**
   * Identify struggle patterns that require intervention
   *
   * Patterns detected:
   * - Consistent low performance (<50% success for 3+ lessons)
   * - Declining engagement trend
   * - Multiple areas of struggle
   * - Low persistence (gives up easily)
   */
  static async identifyStrugglePatterns(student_id: number): Promise<{
    needs_intervention: boolean;
    urgency: 'low' | 'medium' | 'high' | 'urgent';
    struggle_areas: string[];
    recommendations: string[];
  }> {
    try {
      const profile = await this.getOrCreateProfile(student_id);

      const recentAssignments = await prisma.studentLessonAssignment.findMany({
        where: { student_id },
        orderBy: { updated_at: 'desc' },
        take: 10,
      });

      const consecutiveStruggle = this.countConsecutiveLowPerformance(recentAssignments, 0.5);
      const multipleStruggles = profile.current_struggles.length >= 2;
      const lowEngagement = profile.engagement_score < 0.4;
      const lowPersistence = profile.persistence_score < 0.4;

      let urgency: 'low' | 'medium' | 'high' | 'urgent' = 'low';

      if (consecutiveStruggle >= 5 && multipleStruggles) {
        urgency = 'urgent';
      } else if (consecutiveStruggle >= 3 && (multipleStruggles || lowEngagement)) {
        urgency = 'high';
      } else if (consecutiveStruggle >= 3 || multipleStruggles) {
        urgency = 'medium';
      }

      const needs_intervention = urgency !== 'low';

      const recommendations: string[] = [];

      if (consecutiveStruggle >= 3) {
        recommendations.push('Consider immediate targeted intervention');
      }

      if (lowEngagement) {
        recommendations.push('Focus on engagement strategies and motivation');
      }

      if (lowPersistence) {
        recommendations.push('Build resilience with shorter, achievable tasks');
      }

      if (multipleStruggles) {
        recommendations.push(
          'Prioritize most critical area first, then address others sequentially'
        );
      }

      return {
        needs_intervention,
        urgency,
        struggle_areas: profile.current_struggles,
        recommendations,
      };
    } catch (_error) {
      logger.error('Error identifying struggle patterns:', _error as Error);
      throw _error;
    }
  }

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Get existing profile or create initial one
   */
  private static async getOrCreateProfile(student_id: number): Promise<any> {
    let profile = await prisma.studentProfile.findUnique({
      where: { student_id },
    });

    if (!profile) {
      profile = await this.createInitialProfile(student_id);
    }

    return profile;
  }

  /**
   * Create initial profile for new student
   */
  private static async createInitialProfile(student_id: number): Promise<any> {
    const student = await prisma.students.findUnique({
      where: { id: student_id },
    });

    if (!student) {
      throw new Error(`Student not found: ${student_id}`);
    }

    return await prisma.studentProfile.create({
      data: {
        tenant_id: student.tenant_id,
        student_id,
        learning_style: {
          visual: 0.5,
          auditory: 0.5,
          kinaesthetic: 0.5,
          confidence: 0,
        },
        pace_level: 'medium',
        difficulty_preference: 'on_level',
        profile_confidence: 0.1,
      },
    });
  }

  /**
   * Merge unique strings from two arrays
   */
  private static mergeUniqueStrings(arr1: string[], arr2: string[]): string[] {
    return Array.from(new Set([...arr1, ...arr2]));
  }

  /**
   * Calculate intervention urgency based on assessment scores
   */
  private static calculateInterventionUrgency(
    domain_scores: { domain: string; score: number; max_score: number }[],
    overall_score: number
  ): 'low' | 'medium' | 'high' | 'urgent' {
    const lowestDomainPercentage = Math.min(
      ...domain_scores.map((d) => d.score / d.max_score)
    );

    if (lowestDomainPercentage < 0.3 || overall_score < 0.4) {
      return 'urgent';
    } else if (lowestDomainPercentage < 0.5 || overall_score < 0.6) {
      return 'high';
    } else if (lowestDomainPercentage < 0.7) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Count consecutive high-performance lessons
   */
  private static countConsecutiveHighPerformance(
    assignments: any[],
    threshold: number
  ): number {
    let count = 0;
    for (const assignment of assignments) {
      if (assignment.success_rate && assignment.success_rate >= threshold) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }

  /**
   * Count consecutive low-performance lessons
   */
  private static countConsecutiveLowPerformance(
    assignments: any[],
    threshold: number
  ): number {
    let count = 0;
    for (const assignment of assignments) {
      if (assignment.success_rate && assignment.success_rate < threshold) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }

  /**
   * Calculate completion rate from recent assignments
   */
  private static calculateCompletionRate(assignments: any[]): number {
    if (assignments.length === 0) return 0.5;

    const completed = assignments.filter((a: any) => a.status === 'completed').length;
    return completed / assignments.length;
  }

  /**
   * Calculate new engagement score (weighted moving average)
   */
  private static calculateEngagementScore(
    current: number,
    completionRate: number,
    successRate: number
  ): number {
    // Engagement = 60% completion + 40% success
    const newScore = completionRate * 0.6 + successRate * 0.4;

    // Weighted moving average (70% current, 30% new)
    return current * 0.7 + newScore * 0.3;
  }

  /**
   * Calculate new persistence score
   */
  private static calculatePersistenceScore(
    current: number,
    struggled: boolean,
    excelled: boolean
  ): number {
    // If struggled but completed, increase persistence
    // If excelled, maintain
    // If gave up (neither), decrease

    let adjustment = 0;

    if (struggled) {
      adjustment = 0.05; // Completed despite struggle = persistence
    } else if (excelled) {
      adjustment = 0.02; // Doing well = maintain
    } else {
      adjustment = -0.03; // Mediocre = slight decrease
    }

    return Math.max(0, Math.min(1, current + adjustment));
  }

  /**
   * Determine pace level from time spent
   */
  private static determinePaceLevel(
    time_spent_seconds: number,
    assigned_difficulty: string
  ): 'slow' | 'medium' | 'fast' {
    // Expected times by difficulty (in seconds)
    const expectedTimes: Record<string, number> = {
      below: 600, // 10 mins
      at: 900, // 15 mins
      above: 1200, // 20 mins
      well_above: 1500, // 25 mins
    };

    const expected = expectedTimes[assigned_difficulty] || 900;

    if (time_spent_seconds < expected * 0.7) {
      return 'fast';
    } else if (time_spent_seconds > expected * 1.3) {
      return 'slow';
    } else {
      return 'medium';
    }
  }

  /**
   * Infer learning style from game preferences
   */
  private static inferLearningStyleFromGames(
    preferred_game_types: string[],
    currentStyle: LearningStyleScores | null
  ): LearningStyleScores {
    const baseStyle: LearningStyleScores = currentStyle || {
      visual: 0.5,
      auditory: 0.5,
      kinaesthetic: 0.5,
      confidence: 0,
    };

    // Game type mappings
    const visualGames = ['puzzle', 'matching', 'memory'];
    const auditoryGames = ['word', 'spelling', 'story'];
    const kinaestheticGames = ['action', 'building', 'simulation'];

    let visualScore = baseStyle.visual;
    let auditoryScore = baseStyle.auditory;
    let kinaestheticScore = baseStyle.kinaesthetic;

    preferred_game_types.forEach((gameType) => {
      if (visualGames.some((v) => gameType.toLowerCase().includes(v))) {
        visualScore += 0.05;
      }
      if (auditoryGames.some((a) => gameType.toLowerCase().includes(a))) {
        auditoryScore += 0.05;
      }
      if (kinaestheticGames.some((k) => gameType.toLowerCase().includes(k))) {
        kinaestheticScore += 0.05;
      }
    });

    // Normalize to 0-1
    visualScore = Math.max(0, Math.min(1, visualScore));
    auditoryScore = Math.max(0, Math.min(1, auditoryScore));
    kinaestheticScore = Math.max(0, Math.min(1, kinaestheticScore));

    return {
      visual: visualScore,
      auditory: auditoryScore,
      kinaesthetic: kinaestheticScore,
      confidence: Math.min(1, baseStyle.confidence + 0.1),
    };
  }

  /**
   * Map assessment domain string to profile key
   */
  private static mapDomainToKey(domain: string): string | null {
    const d = domain.toLowerCase();
    if (d.includes('working memory')) return 'workingMemory';
    if (d.includes('attention')) return 'attention';
    if (d.includes('processing speed')) return 'processingSpeed';
    if (d.includes('learning') || d.includes('memory')) return 'learningMemory';
    if (d.includes('communication') || d.includes('language')) return 'communication';
    if (d.includes('semh') || d.includes('emotional')) return 'semh';
    if (d.includes('sensory') || d.includes('physical') || d.includes('motor')) return 'sensoryPhysical';
    return null;
  }

  /**
   * Log automated action to audit trail
   */
  private static async logAutomatedAction(data: {
    tenant_id: number;
    action_type: string;
    triggered_by: string;
    target_type: string;
    target_id: string;
    student_id?: number;
    action_data: any;
    requires_approval: boolean;
  }): Promise<void> {
    try {
      const { student_id, ...restData } = data;
      await prisma.automatedAction.create({
        data: {
          ...restData,
          student_id: student_id ? Number(student_id) : undefined,
          outcome_success: true,
        },
      });
    } catch (_error) {
      logger.error('Error logging automated action:', _error as Error);
      // Don't throw - logging failure shouldn't break the flow
    }
  }
}

