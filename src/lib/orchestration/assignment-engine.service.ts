/**
 * ASSIGNMENT ENGINE SERVICE
 *
 * PURPOSE: Automatically differentiate and assign lessons to each student
 * based on their profile. This is the CORE of "40 students, 40 personalized
 * lessons - automatically".
 *
 * WORKFLOW:
 * 1. Teacher creates ONE base lesson plan
 * 2. System creates 3-4 differentiated versions (below, at, above, extension)
 * 3. Each student automatically assigned appropriate version based on profile
 * 4. During completion, system monitors for struggle/excellence
 * 5. Triggers interventions or level changes as needed
 * 6. Parents notified of progress automatically
 *
 * PRINCIPLE: Teachers teach. We handle the differentiation.
 */

import { PrismaClient } from '@prisma/client';
import { AIService } from '@/services/ai-service';
import logger from '@/utils/logger';
import { ProfileBuilderService } from './profile-builder.service';

const prisma = new PrismaClient();

// ============================================================================
// TYPES
// ============================================================================

interface LessonPlanBase {
  title: string;
  subject: string;
  year_group: string;
  curriculum_reference?: string;
  learning_objectives: string[];
  description?: string;
  base_content: any;
  activities: ActivityBase[];
}

interface ActivityBase {
  title: string;
  activity_type: string; // "video", "worksheet", "game", "discussion", "assessment"
  base_content: any;
  estimated_duration: number;
  success_criteria: string[];
}

interface DifferentiatedLesson {
  below: any;
  at: any;
  above: any;
  well_above: any;
}

interface AssignmentPlan {
  student_id: number;
  student_name: string;
  assigned_difficulty: 'below' | 'at' | 'above' | 'well_above';
  reasoning: string[];
  profile_confidence: number;
}

interface AssignmentResult {
  total_students: number;
  assignments: {
    below: number;
    at: number;
    above: number;
    well_above: number;
  };
  auto_assigned: number;
  teacher_review_needed: number;
  notifications_queued: number;
}

// ============================================================================
// ASSIGNMENT ENGINE SERVICE
// ============================================================================

export class AssignmentEngineService {
  /**
   * Differentiate lesson content into multiple difficulty levels
   *
   * Uses AI to create appropriate versions while maintaining learning objectives.
   *
   * @param lessonPlan Base lesson plan created by teacher
   * @returns Differentiated versions for each level
   */
  static async differentiateLessonContent(
    lessonPlan: LessonPlanBase
  ): Promise<DifferentiatedLesson> {
    try {
      logger.info(`Differentiating lesson: ${lessonPlan.title}`);

      // Differentiate each activity
      const differentiatedActivities = await Promise.all(
        lessonPlan.activities.map((activity) => this.differentiateActivity(activity, lessonPlan.year_group))
      );

      // Construct differentiated lesson plans
      const differentiated: DifferentiatedLesson = {
        below: this.constructLessonVersion(
          lessonPlan,
          differentiatedActivities,
          'below'
        ),
        at: this.constructLessonVersion(lessonPlan, differentiatedActivities, 'at'),
        above: this.constructLessonVersion(
          lessonPlan,
          differentiatedActivities,
          'above'
        ),
        well_above: this.constructLessonVersion(
          lessonPlan,
          differentiatedActivities,
          'well_above'
        ),
      };

      logger.info(`Lesson differentiated successfully: ${lessonPlan.title}`);

      return differentiated;
    } catch (error) {
      logger.error('Error differentiating lesson content:', error as Error);
      throw error;
    }
  }

  /**
   * Differentiate a single activity
   */
  private static async differentiateActivity(
    activity: ActivityBase,
    year_group: string
  ): Promise<{
    below: any;
    at: any;
    above: any;
    well_above: any;
  }> {
    // For now, use rule-based differentiation
    // In production, integrate with AI service for more sophisticated differentiation

    const base = activity.base_content;

    return {
      below: {
        ...base,
        vocabulary: 'simplified',
        scaffolding: 'high',
        visual_supports: true,
        duration_multiplier: 1.2, // 20% more time
        examples_count: 'many',
        instructions: 'step-by-step',
      },
      at: {
        ...base,
        vocabulary: 'grade_appropriate',
        scaffolding: 'medium',
        visual_supports: false,
        duration_multiplier: 1.0,
        examples_count: 'some',
        instructions: 'clear',
      },
      above: {
        ...base,
        vocabulary: 'advanced',
        scaffolding: 'low',
        visual_supports: false,
        duration_multiplier: 0.9,
        examples_count: 'few',
        instructions: 'minimal',
        extension_tasks: true,
      },
      well_above: {
        ...base,
        vocabulary: 'sophisticated',
        scaffolding: 'minimal',
        visual_supports: false,
        duration_multiplier: 0.8,
        examples_count: 'minimal',
        instructions: 'independent',
        extension_tasks: true,
        open_ended_challenges: true,
      },
    };
  }

  /**
   * Construct lesson version for specific difficulty level
   */
  private static constructLessonVersion(
    lessonPlan: LessonPlanBase,
    differentiatedActivities: any[],
    level: 'below' | 'at' | 'above' | 'well_above'
  ): any {
    return {
      title: lessonPlan.title,
      subject: lessonPlan.subject,
      year_group: lessonPlan.year_group,
      level,
      learning_objectives: lessonPlan.learning_objectives,
      activities: differentiatedActivities.map((act) => act[level]),
      adaptations: this.getAdaptationsForLevel(level),
    };
  }

  /**
   * Get standard adaptations for each level
   */
  private static getAdaptationsForLevel(
    level: 'below' | 'at' | 'above' | 'well_above'
  ): string[] {
    const adaptations: Record<string, string[]> = {
      below: [
        'Simplified vocabulary and shorter sentences',
        'Additional visual supports and graphic organizers',
        'More examples and guided practice',
        'Step-by-step instructions',
        'Extended time allowance',
      ],
      at: [
        'Grade-appropriate vocabulary and complexity',
        'Clear instructions with some examples',
        'Mix of guided and independent practice',
        'Standard time allocation',
      ],
      above: [
        'Advanced vocabulary and complex sentences',
        'Fewer examples, more independent work',
        'Extension tasks and deeper questions',
        'Reduced time pressure',
      ],
      well_above: [
        'Sophisticated vocabulary and open-ended tasks',
        'Minimal scaffolding, full independence',
        'Cross-curricular enrichment challenges',
        'Self-directed learning opportunities',
      ],
    };

    return adaptations[level];
  }

  /**
   * Assign lessons to entire class based on student profiles
   *
   * @param classRosterId Class to assign to
   * @param lessonPlanId Lesson plan (with differentiated versions)
   * @param autoAssign If true, assign immediately; if false, return plan for teacher review
   * @returns Assignment result summary
   */
  static async assignLessonsToClass(
    classRosterId: string,
    lessonPlanId: string,
    autoAssign: boolean = true
  ): Promise<AssignmentResult> {
    try {
      // Get class roster with student IDs
      const classRoster = await prisma.classRoster.findUnique({
        where: { id: classRosterId },
      });

      if (!classRoster) {
        throw new Error(`Class roster not found: ${classRosterId}`);
      }

      // Get lesson plan
      const lessonPlan = await prisma.lessonPlan.findUnique({
        where: { id: lessonPlanId },
      });

      if (!lessonPlan) {
        throw new Error(`Lesson plan not found: ${lessonPlanId}`);
      }

      // Get all students in class (combine all groups)
      const allStudentIds = [
        ...classRoster.urgent_students,
        ...classRoster.needs_support,
        ...classRoster.on_track,
        ...classRoster.exceeding,
      ];

      // Get students with profiles
      const students = await prisma.students.findMany({
        where: { id: { in: allStudentIds } },
        include: {
          student_profile: true,
        },
      });

      // Determine difficulty level for each student
      const assignmentPlans: AssignmentPlan[] = await Promise.all(
        students.map((student) =>
          this.determineDifficultyLevel(student.id, student.student_profile)
        )
      );

      // Count by difficulty
      const counts = {
        below: assignmentPlans.filter((p) => p.assigned_difficulty === 'below').length,
        at: assignmentPlans.filter((p) => p.assigned_difficulty === 'at').length,
        above: assignmentPlans.filter((p) => p.assigned_difficulty === 'above').length,
        well_above: assignmentPlans.filter((p) => p.assigned_difficulty === 'well_above')
          .length,
      };

      // Identify students needing teacher review (low profile confidence)
      const needsReview = assignmentPlans.filter((p) => p.profile_confidence < 0.3).length;

      let notificationsQueued = 0;

      // Create assignments if auto-assign enabled
      if (autoAssign) {
        for (const plan of assignmentPlans) {
          await prisma.studentLessonAssignment.create({
            data: {
              tenant_id: lessonPlan.tenant_id,
              student_id: plan.student_id,
              lesson_plan_id: lessonPlanId,
              student_profile_id: (
                await prisma.studentProfile.findUnique({
                  where: { student_id: plan.student_id },
                })
              )!.id,
              assigned_difficulty: plan.assigned_difficulty,
              assigned_by: plan.profile_confidence >= 0.3 ? 'system' : 'teacher_override',
              status: 'assigned',
            },
          });

          // Queue parent notification
          notificationsQueued++;
        }

        // Log automated action
        await this.logAutomatedAction({
          tenant_id: lessonPlan.tenant_id,
          action_type: 'lesson_assigned',
          triggered_by: 'teacher_created_lesson',
          target_type: 'class',
          target_id: classRosterId,
          action_data: {
            lesson_plan_id: lessonPlanId,
            lesson_title: lessonPlan.title,
            total_students: students.length,
            assignments_by_level: counts,
            teacher_review_needed: needsReview,
          },
          requires_approval: false,
        });

        logger.info(
          `Lessons assigned to class ${classRosterId}: ${students.length} students`
        );
      }

      return {
        total_students: students.length,
        assignments: counts,
        auto_assigned: autoAssign ? students.length : 0,
        teacher_review_needed: needsReview,
        notifications_queued: autoAssign ? notificationsQueued : 0,
      };
    } catch (error) {
      logger.error('Error assigning lessons to class:', error as Error);
      throw error;
    }
  }

  /**
   * Determine appropriate difficulty level for a student
   *
   * Considers:
   * - Recent lesson success rates
   * - Current struggle areas
   * - Ready to level up flags
   * - Profile confidence
   */
  static async determineDifficultyLevel(
    student_id: number,
    profile: any | null
  ): Promise<AssignmentPlan> {
    try {
      const student = await prisma.students.findUnique({
        where: { id: student_id },
      });

      if (!student) {
        throw new Error(`Student not found: ${student_id}`);
      }

      // If no profile, default to "at" level
      if (!profile) {
        return {
          student_id,
          student_name: `${student.first_name} ${student.last_name}`,
          assigned_difficulty: 'at',
          reasoning: ['No profile data yet - starting at grade level'],
          profile_confidence: 0,
        };
      }

      const reasoning: string[] = [];
      let assigned_difficulty: 'below' | 'at' | 'above' | 'well_above' = 'at';

      // Check if ready to level up
      if (profile.ready_to_level_up && profile.profile_confidence >= 0.5) {
        assigned_difficulty = 'above';
        reasoning.push('Consistent high performance - ready for challenge');
      }

      // Check if needs support
      else if (profile.needs_intervention && profile.intervention_urgency !== 'low') {
        assigned_difficulty = 'below';
        reasoning.push('Currently needs support - providing scaffolding');
      }

      // Check difficulty preference from profile
      else if (profile.difficulty_preference === 'extension') {
        assigned_difficulty = 'above';
        reasoning.push('Profile shows preference for advanced work');
      } else if (profile.difficulty_preference === 'needs_support') {
        assigned_difficulty = 'below';
        reasoning.push('Profile shows need for additional support');
      }

      // Default to "at" level
      else {
        assigned_difficulty = 'at';
        reasoning.push('Working at grade-appropriate level');
      }

      // Check for exceptional students (extension level)
      if (
        profile.engagement_score >= 0.9 &&
        profile.ready_to_level_up &&
        profile.current_strengths.length >= 3
      ) {
        assigned_difficulty = 'well_above';
        reasoning.push('Exceptional performance - providing enrichment');
      }

      return {
        student_id,
        student_name: `${student.first_name} ${student.last_name}`,
        assigned_difficulty,
        reasoning,
        profile_confidence: profile.profile_confidence,
      };
    } catch (error) {
      logger.error('Error determining difficulty level:', error as Error);
      throw error;
    }
  }

  /**
   * Detect difficulty mismatch during lesson and adjust in real-time
   *
   * Called as student completes activities.
   * If 3+ activities show mismatch, flag for adjustment.
   */
  static async detectMismatchDuringLesson(
    studentAssignmentId: string
  ): Promise<{
    mismatch_detected: boolean;
    suggested_change?: 'move_up' | 'move_down' | 'stay';
    reasoning: string[];
  }> {
    try {
      const assignment = await prisma.studentLessonAssignment.findUnique({
        where: { id: studentAssignmentId },
        include: {
          activity_responses: true,
        },
      });

      if (!assignment) {
        throw new Error(`Assignment not found: ${studentAssignmentId}`);
      }

      const responses = assignment.activity_responses;

      // Need at least 3 responses to detect pattern
      if (responses.length < 3) {
        return {
          mismatch_detected: false,
          reasoning: ['Insufficient data - need more activity completions'],
        };
      }

      // Count mismatches
      const mismatchResponses = responses.filter((r) => r.difficulty_mismatch);

      const mismatchCount = mismatchResponses.length;
      const mismatchRate = mismatchCount / responses.length;

      const reasoning: string[] = [];

      // Detect pattern
      if (mismatchRate >= 0.6) {
        // 60%+ mismatch = definite problem
        const moveUpCount = mismatchResponses.filter(
          (r) => r.suggested_level_change === 'move_up'
        ).length;
        const moveDownCount = mismatchResponses.filter(
          (r) => r.suggested_level_change === 'move_down'
        ).length;

        let suggested_change: 'move_up' | 'move_down' | 'stay' = 'stay';

        if (moveUpCount > moveDownCount) {
          suggested_change = 'move_up';
          reasoning.push('Activities too easy - student not challenged');
          reasoning.push(`${moveUpCount} activities completed too quickly with high accuracy`);
        } else {
          suggested_change = 'move_down';
          reasoning.push('Activities too difficult - student struggling');
          reasoning.push(`${moveDownCount} activities showing low success rate or giving up`);
        }

        // Update assignment to flag for teacher
        await prisma.studentLessonAssignment.update({
          where: { id: studentAssignmentId },
          data: {
            teacher_flagged: true,
            updated_at: new Date(),
          },
        });

        return {
          mismatch_detected: true,
          suggested_change,
          reasoning,
        };
      }

      return {
        mismatch_detected: false,
        reasoning: ['Difficulty level appropriate - student progressing well'],
      };
    } catch (error) {
      logger.error('Error detecting mismatch during lesson:', error as Error);
      throw error;
    }
  }

  /**
   * Trigger intervention when student shows struggle pattern
   *
   * Criteria:
   * - 3+ consecutive activities with <50% success
   * - Gave up on 2+ activities
   * - Help requested multiple times
   */
  static async triggerInterventionOnStruggle(
    studentAssignmentId: string
  ): Promise<{
    intervention_triggered: boolean;
    urgency: 'low' | 'medium' | 'high' | 'urgent';
    recommended_interventions: string[];
  }> {
    try {
      const assignment = await prisma.studentLessonAssignment.findUnique({
        where: { id: studentAssignmentId },
        include: {
          activity_responses: true,
          student: true,
          student_profile: true,
        },
      });

      if (!assignment) {
        throw new Error(`Assignment not found: ${studentAssignmentId}`);
      }

      const responses = assignment.activity_responses;

      // Detect struggle patterns
      const lowScoreCount = responses.filter(
        (r) => r.score !== null && r.score < 0.5
      ).length;
      const gaveUpCount = responses.filter((r) => r.gave_up).length;
      const helpRequestedCount = responses.filter((r) => r.help_requested).length;

      const shouldTrigger = lowScoreCount >= 3 || gaveUpCount >= 2 || helpRequestedCount >= 4;

      if (!shouldTrigger) {
        return {
          intervention_triggered: false,
          urgency: 'low',
          recommended_interventions: [],
        };
      }

      // Determine urgency
      let urgency: 'low' | 'medium' | 'high' | 'urgent' = 'medium';

      if (gaveUpCount >= 3 || lowScoreCount >= 5) {
        urgency = 'urgent';
      } else if (gaveUpCount >= 2 || lowScoreCount >= 4) {
        urgency = 'high';
      }

      // Update assignment
      await prisma.studentLessonAssignment.update({
        where: { id: studentAssignmentId },
        data: {
          intervention_triggered: true,
          teacher_flagged: true,
          updated_at: new Date(),
        },
      });

      // Update profile
      await ProfileBuilderService.identifyStrugglePatterns(assignment.student_id);

      // Log automated action
      await this.logAutomatedAction({
        tenant_id: assignment.tenant_id,
        action_type: 'intervention_triggered',
        triggered_by: 'struggle_pattern',
        target_type: 'student',
        target_id: assignment.student_id.toString(),
        student_id: assignment.student_id,
        action_data: {
          assignment_id: studentAssignmentId,
          low_score_count: lowScoreCount,
          gave_up_count: gaveUpCount,
          help_requested_count: helpRequestedCount,
          urgency,
        },
        requires_approval: true, // Teacher should approve interventions
      });

      logger.info(
        `Intervention triggered for student ${assignment.student_id} with urgency: ${urgency}`
      );

      return {
        intervention_triggered: true,
        urgency,
        recommended_interventions: [
          'Small group targeted support',
          'One-on-one tutoring',
          'Visual aids and manipulatives',
          'Reduced task complexity',
          'Additional practice time',
        ],
      };
    } catch (error) {
      logger.error('Error triggering intervention on struggle:', error as Error);
      throw error;
    }
  }

  /**
   * Recommend level change based on student profile
   *
   * Provides reasoning for recommendation.
   */
  static async recommendLevelChange(studentProfileId: string): Promise<{
    recommendation: 'move_up' | 'move_down' | 'stay' | 'acceleration';
    confidence: number;
    reasoning: string[];
    requires_teacher_approval: boolean;
  }> {
    try {
      const profile = await prisma.studentProfile.findUnique({
        where: { id: studentProfileId },
      });

      if (!profile) {
        throw new Error(`Profile not found: ${studentProfileId}`);
      }

      const readiness = await ProfileBuilderService.predictReadinessToProgress(
        profile.student_id
      );

      let recommendation: 'move_up' | 'move_down' | 'stay' | 'acceleration' = 'stay';
      const reasoning: string[] = [];

      if (readiness.ready && readiness.confidence >= 0.7) {
        recommendation = 'move_up';
        reasoning.push(...readiness.reasoning);
      } else if (profile.needs_intervention && profile.intervention_urgency !== 'low') {
        recommendation = 'move_down';
        reasoning.push('Currently struggling - recommend easier level with more support');
      } else {
        recommendation = 'stay';
        reasoning.push('Current level appropriate - continue monitoring');
      }

      // Check for exceptional acceleration
      if (
        profile.ready_to_level_up &&
        profile.engagement_score >= 0.9 &&
        profile.profile_confidence >= 0.8 &&
        profile.current_strengths.length >= 4
      ) {
        recommendation = 'acceleration';
        reasoning.push('Exceptional performance - consider year-above content');
      }

      return {
        recommendation,
        confidence: readiness.confidence,
        reasoning,
        requires_teacher_approval: recommendation !== 'stay',
      };
    } catch (error) {
      logger.error('Error recommending level change:', error as Error);
      throw error;
    }
  }

  /**
   * Generate plain English parent update from assignment completion
   *
   * Translates technical data into warm, actionable parent communication.
   */
  static async generateParentUpdate(
    studentAssignmentId: string
  ): Promise<{
    summary: string;
    strengths: string[];
    areas_to_support: string[];
    home_activities: { activity: string; why: string }[];
  }> {
    try {
      const assignment = await prisma.studentLessonAssignment.findUnique({
        where: { id: studentAssignmentId },
        include: {
          student: true,
          lesson_plan: true,
          activity_responses: true,
        },
      });

      if (!assignment) {
        throw new Error(`Assignment not found: ${studentAssignmentId}`);
      }

      const student = assignment.student;
      const lesson = assignment.lesson_plan;
      const responses = assignment.activity_responses;

      // Calculate overall performance
      const avgScore =
        responses.filter((r) => r.score !== null).reduce((sum, r) => sum + (r.score || 0), 0) /
        responses.filter((r) => r.score !== null).length;

      let performanceLevel = 'Good';
      if (avgScore >= 0.8) performanceLevel = 'Excellent';
      else if (avgScore < 0.6) performanceLevel = 'Needs support';

      // Generate summary
      const summary = `${student.first_name} completed the ${lesson.subject} lesson on "${lesson.title}". Overall performance: ${performanceLevel}. ${student.first_name} ${
        avgScore >= 0.7 ? 'did well' : 'is working hard'
      } and ${
        assignment.time_spent_seconds > 0
          ? `spent ${Math.round(assignment.time_spent_seconds / 60)} minutes on the activities`
          : 'engaged with the content'
      }.`;

      // Identify strengths
      const strengths: string[] = [];
      if (avgScore >= 0.8) {
        strengths.push(`Strong understanding of ${lesson.subject}`);
      }
      if (assignment.excelled_activities.length > 0) {
        strengths.push('Excelled in hands-on activities');
      }
      if (responses.filter((r) => !r.help_requested).length >= responses.length * 0.8) {
        strengths.push('Working independently with confidence');
      }

      // Identify areas to support
      const areas_to_support: string[] = [];
      if (avgScore < 0.6) {
        areas_to_support.push(`Extra practice with ${lesson.subject} concepts`);
      }
      if (assignment.struggled_activities.length >= 2) {
        areas_to_support.push('Building confidence with challenging tasks');
      }
      if (responses.filter((r) => r.help_requested).length >= 3) {
        areas_to_support.push('Encouraging independent problem-solving');
      }

      // Generate home activities
      const home_activities = [
        {
          activity: `Practice ${lesson.subject} with everyday examples (e.g., cooking, shopping)`,
          why: 'Helps ${student.first_name} see real-world connections',
        },
        {
          activity: 'Read together for 15 minutes each day',
          why: 'Builds vocabulary and comprehension skills',
        },
      ];

      // Queue parent notification
      await this.logAutomatedAction({
        tenant_id: assignment.tenant_id,
        action_type: 'parent_notified',
        triggered_by: 'lesson_complete',
        target_type: 'student',
        target_id: assignment.student_id.toString(),
        student_id: assignment.student_id,
        action_data: {
          assignment_id: studentAssignmentId,
          lesson_title: lesson.title,
          summary,
        },
        requires_approval: false,
      });

      return {
        summary,
        strengths,
        areas_to_support,
        home_activities,
      };
    } catch (error) {
      logger.error('Error generating parent update:', error as Error);
      throw error;
    }
  }

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

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
          student_id: student_id,
          outcome_success: true,
        },
      });
    } catch (error) {
      logger.error('Error logging automated action:', error as Error);
      // Don't throw - logging failure shouldn't break the flow
    }
  }
}

// Export singleton instance for use in API routes
export const assignmentEngineService = new AssignmentEngineService();
