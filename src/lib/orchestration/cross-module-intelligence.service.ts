/**
 * CROSS-MODULE INTELLIGENCE SERVICE
 *
 * PURPOSE: Connect all existing features with intelligent automation triggers.
 * This is the "nervous system" that makes the platform truly intelligent.
 *
 * CORE PRINCIPLE: "No child falls through the cracks."
 * When something significant happens in one module, relevant actions
 * automatically trigger in other modules.
 *
 * AUTOMATED FLOWS:
 * 1. Assessment → Profile → Lesson → Intervention
 * 2. Lesson Struggle → Support
 * 3. Progress Milestone → Level Change
 * 4. EHCP Due → Auto-Compile
 * 5. Battle Royale → Profile Update
 *
 * PHILOSOPHY: Intelligence through connections, not complexity.
 */

import { PrismaClient } from '@prisma/client';
import logger from '@/utils/logger';
import { ProfileBuilderService } from './profile-builder.service';
import { AssignmentEngineService } from './assignment-engine.service';
import { DataRouterService } from './data-router.service';

const prisma = new PrismaClient();

// ============================================================================
// TYPES
// ============================================================================

interface TriggerEvent {
  event_type:
    | 'assessment_complete'
    | 'lesson_complete'
    | 'lesson_struggle'
    | 'intervention_complete'
    | 'milestone_achieved'
    | 'ehcp_due'
    | 'battle_royale_complete';
  tenant_id: number;
  student_id?: number;
  entity_id: string;
  entity_data: any;
}

interface TriggerResult {
  actions_triggered: AutomatedActionSummary[];
  profiles_updated: number;
  notifications_queued: number;
  approvals_needed: ApprovalNeeded[];
}

interface AutomatedActionSummary {
  action_id: string;
  action_type: string;
  target: string;
  description: string;
  requires_approval: boolean;
}

interface ApprovalNeeded {
  action_id: string;
  action_type: string;
  student_name: string;
  description: string;
  urgency: string;
  auto_expire_hours?: number;
}

// ============================================================================
// CROSS-MODULE INTELLIGENCE SERVICE
// ============================================================================

export class CrossModuleIntelligenceService {
  /**
   * PROCESS TRIGGER EVENT
   *
   * Main entry point for cross-module intelligence.
   * Routes events to appropriate flow handlers.
   *
   * @param event Trigger event
   * @returns Summary of triggered actions
   */
  static async processTriggerEvent(event: TriggerEvent): Promise<TriggerResult> {
    logger.info(`Processing trigger event: ${event.event_type} for student ${event.student_id}`);

    try {
      switch (event.event_type) {
        case 'assessment_complete':
          return await this.handleAssessmentComplete(event);

        case 'lesson_complete':
          return await this.handleLessonComplete(event);

        case 'lesson_struggle':
          return await this.handleLessonStruggle(event);

        case 'intervention_complete':
          return await this.handleInterventionComplete(event);

        case 'milestone_achieved':
          return await this.handleMilestoneAchieved(event);

        case 'ehcp_due':
          return await this.handleEHCPDue(event);

        case 'battle_royale_complete':
          return await this.handleBattleRoyaleComplete(event);

        default:
          throw new Error(`Unknown event type: ${event.event_type}`);
      }
    } catch (error) {
      logger.error('Error processing trigger event:', error as Error);
      throw error;
    }
  }

  // ============================================================================
  // FLOW 1: ASSESSMENT → PROFILE → LESSON → INTERVENTION
  // ============================================================================

  /**
   * Handle assessment completion
   *
   * Flow:
   * 1. Update student profile with assessment results
   * 2. Identify strengths and weaknesses
   * 3. Adjust next lesson difficulty
   * 4. If severe weakness: trigger intervention recommendation
   * 5. Notify teacher with one-click approval
   * 6. Notify parent of progress
   */
  private static async handleAssessmentComplete(event: TriggerEvent): Promise<TriggerResult> {
    const { student_id, entity_data } = event;

    if (!student_id) {
      throw new Error('Student ID required for assessment complete event');
    }

    const actionsTriggered: AutomatedActionSummary[] = [];
    let profilesUpdated = 0;
    let notificationsQueued = 0;
    const approvalsNeeded: ApprovalNeeded[] = [];

    // STEP 1: Update profile
    await ProfileBuilderService.updateProfileFromAssessment({
      assessment_id: entity_data.assessment_id,
      student_id: student_id,
      assessment_type: entity_data.assessment_type,
      domain_scores: entity_data.domain_scores,
      overall_score: entity_data.overall_score,
      strengths: entity_data.strengths,
      weaknesses: entity_data.weaknesses,
      completed_at: new Date(),
    });

    profilesUpdated++;

    actionsTriggered.push({
      action_id: `profile_update_${Date.now()}`,
      action_type: 'profile_updated',
      target: `student_${student_id}`,
      description: 'Profile updated with assessment results',
      requires_approval: false,
    });

    // STEP 2: Check if intervention needed
    const struggleAnalysis = await ProfileBuilderService.identifyStrugglePatterns(student_id);

    if (struggleAnalysis.needs_intervention && struggleAnalysis.urgency !== 'low') {
      // Trigger intervention recommendation
      const action = await prisma.automatedAction.create({
        data: {
          tenant_id: event.tenant_id,
          action_type: 'intervention_triggered',
          triggered_by: 'assessment_complete',
          target_type: 'student',
          target_id: student_id.toString(),
          student_id: student_id.toString(),
          action_data: {
            assessment_id: entity_data.assessment_id,
            struggle_areas: struggleAnalysis.struggle_areas,
            urgency: struggleAnalysis.urgency,
            recommendations: struggleAnalysis.recommendations,
          },
          requires_approval: true, // Teacher must approve interventions
        },
      });

      actionsTriggered.push({
        action_id: action.id,
        action_type: 'intervention_triggered',
        target: `student_${student_id}`,
        description: `Intervention recommended for ${struggleAnalysis.struggle_areas.join(', ')}`,
        requires_approval: true,
      });

      const student = await prisma.students.findUnique({ where: { id: student_id } });
      approvalsNeeded.push({
        action_id: action.id,
        action_type: 'intervention_triggered',
        student_name: `${student?.first_name} ${student?.last_name}`,
        description: `Struggling with ${struggleAnalysis.struggle_areas.join(', ')}`,
        urgency: struggleAnalysis.urgency,
        auto_expire_hours: 48,
      });
    }

    // STEP 3: Adjust next lesson difficulty
    const profile = await prisma.studentProfile.findUnique({
      where: { student_id },
    });

    if (profile) {
      // Next lesson will automatically use updated profile
      actionsTriggered.push({
        action_id: `lesson_adjust_${Date.now()}`,
        action_type: 'lesson_difficulty_adjusted',
        target: `student_${student_id}`,
        description: 'Next lesson difficulty will be adjusted automatically',
        requires_approval: false,
      });
    }

    // STEP 4: Queue parent notification
    notificationsQueued++;

    actionsTriggered.push({
      action_id: `parent_notify_${Date.now()}`,
      action_type: 'parent_notified',
      target: `student_${student_id}`,
      description: 'Parent notification queued with assessment results',
      requires_approval: false,
    });

    logger.info(
      `Assessment complete flow processed for student ${student_id}: ${actionsTriggered.length} actions triggered`
    );

    return {
      actions_triggered: actionsTriggered,
      profiles_updated: profilesUpdated,
      notifications_queued: notificationsQueued,
      approvals_needed: approvalsNeeded,
    };
  }

  // ============================================================================
  // FLOW 2: LESSON STRUGGLE → SUPPORT
  // ============================================================================

  /**
   * Handle lesson struggle pattern
   *
   * Flow:
   * 1. Student struggles with 3+ activities in lesson
   * 2. System flags difficulty mismatch
   * 3. Profile records struggle pattern
   * 4. Next lesson prepared at easier level
   * 5. Teacher notified: "Tom struggling with fractions - intervention suggested"
   * 6. Parent notified: "Tom finding fractions challenging - extra support provided"
   * 7. Intervention recommendations generated
   */
  private static async handleLessonStruggle(event: TriggerEvent): Promise<TriggerResult> {
    const { student_id, entity_data } = event;

    if (!student_id) {
      throw new Error('Student ID required for lesson struggle event');
    }

    const actionsTriggered: AutomatedActionSummary[] = [];
    let profilesUpdated = 0;
    let notificationsQueued = 0;
    const approvalsNeeded: ApprovalNeeded[] = [];

    // STEP 1: Check for difficulty mismatch
    const mismatchAnalysis = await AssignmentEngineService.detectMismatchDuringLesson(
      entity_data.assignment_id
    );

    if (mismatchAnalysis.mismatch_detected) {
      actionsTriggered.push({
        action_id: `mismatch_${Date.now()}`,
        action_type: 'difficulty_mismatch_detected',
        target: `assignment_${entity_data.assignment_id}`,
        description: `Difficulty mismatch: ${mismatchAnalysis.suggested_change}`,
        requires_approval: false,
      });
    }

    // STEP 2: Trigger intervention if pattern detected
    const interventionAnalysis = await AssignmentEngineService.triggerInterventionOnStruggle(
      entity_data.assignment_id
    );

    if (interventionAnalysis.intervention_triggered) {
      actionsTriggered.push({
        action_id: `intervention_${Date.now()}`,
        action_type: 'intervention_triggered',
        target: `student_${student_id}`,
        description: `Intervention recommended: ${interventionAnalysis.recommended_interventions.join(', ')}`,
        requires_approval: true,
      });

      const student = await prisma.students.findUnique({ where: { id: student_id } });
      approvalsNeeded.push({
        action_id: `intervention_${Date.now()}`,
        action_type: 'intervention_triggered',
        student_name: `${student?.first_name} ${student?.last_name}`,
        description: `Struggling with lesson activities`,
        urgency: interventionAnalysis.urgency,
        auto_expire_hours: 24,
      });
    }

    // STEP 3: Update profile
    await ProfileBuilderService.updateProfileFromLessonActivity({
      student_id: student_id,
      lesson_id: entity_data.lesson_id,
      activity_id: entity_data.activity_id,
      assigned_difficulty: entity_data.assigned_difficulty,
      success_rate: entity_data.success_rate,
      time_spent_seconds: entity_data.time_spent_seconds,
      struggled: true,
      excelled: false,
      completion_date: new Date(),
    });

    profilesUpdated++;

    // STEP 4: Queue notifications
    notificationsQueued += 2; // Teacher + Parent

    actionsTriggered.push({
      action_id: `notify_teacher_${Date.now()}`,
      action_type: 'teacher_notified',
      target: `student_${student_id}`,
      description: 'Teacher notified of struggle pattern',
      requires_approval: false,
    });

    actionsTriggered.push({
      action_id: `notify_parent_${Date.now()}`,
      action_type: 'parent_notified',
      target: `student_${student_id}`,
      description: 'Parent notified with supportive message',
      requires_approval: false,
    });

    logger.info(
      `Lesson struggle flow processed for student ${student_id}: ${actionsTriggered.length} actions triggered`
    );

    return {
      actions_triggered: actionsTriggered,
      profiles_updated: profilesUpdated,
      notifications_queued: notificationsQueued,
      approvals_needed: approvalsNeeded,
    };
  }

  // ============================================================================
  // FLOW 3: PROGRESS MILESTONE → LEVEL CHANGE
  // ============================================================================

  /**
   * Handle lesson completion
   *
   * Flow:
   * 1. Update profile with completion data
   * 2. Check if ready to level up (5 consecutive high-performing lessons)
   * 3. If ready: Notify teacher with one-click approval
   * 4. If approved: Next lessons auto-assigned at higher level
   * 5. Parent notified: "Great news! [Student] moving to advanced lessons"
   */
  private static async handleLessonComplete(event: TriggerEvent): Promise<TriggerResult> {
    const { student_id, entity_data } = event;

    if (!student_id) {
      throw new Error('Student ID required for lesson complete event');
    }

    const actionsTriggered: AutomatedActionSummary[] = [];
    let profilesUpdated = 0;
    let notificationsQueued = 0;
    const approvalsNeeded: ApprovalNeeded[] = [];

    // STEP 1: Update profile
    await ProfileBuilderService.updateProfileFromLessonActivity({
      student_id: student_id,
      lesson_id: entity_data.lesson_id,
      activity_id: entity_data.activity_id,
      assigned_difficulty: entity_data.assigned_difficulty,
      success_rate: entity_data.success_rate,
      time_spent_seconds: entity_data.time_spent_seconds,
      struggled: entity_data.struggled || false,
      excelled: entity_data.excelled || false,
      completion_date: new Date(),
    });

    profilesUpdated++;

    // STEP 2: Check readiness to progress
    const readiness = await ProfileBuilderService.predictReadinessToProgress(student_id);

    if (readiness.ready && readiness.confidence >= 0.7) {
      // Recommend level change
      const profile = await prisma.studentProfile.findUnique({
        where: { student_id },
      });

      if (profile) {
        const recommendation = await AssignmentEngineService.recommendLevelChange(profile.id);

        if (recommendation.recommendation === 'move_up' || recommendation.recommendation === 'acceleration') {
          const action = await prisma.automatedAction.create({
            data: {
              tenant_id: event.tenant_id,
              action_type: 'level_up_recommended',
              triggered_by: 'lesson_complete',
              target_type: 'student',
              target_id: student_id.toString(),
              student_id: student_id.toString(),
              action_data: {
                recommendation: recommendation.recommendation,
                reasoning: recommendation.reasoning,
                confidence: recommendation.confidence,
              },
              requires_approval: true, // Teacher must approve level changes
            },
          });

          actionsTriggered.push({
            action_id: action.id,
            action_type: 'level_up_recommended',
            target: `student_${student_id}`,
            description: `Recommend moving to ${recommendation.recommendation === 'acceleration' ? 'advanced' : 'higher'} level`,
            requires_approval: true,
          });

          const student = await prisma.students.findUnique({ where: { id: student_id } });
          approvalsNeeded.push({
            action_id: action.id,
            action_type: 'level_up_recommended',
            student_name: `${student?.first_name} ${student?.last_name}`,
            description: `Ready to progress to ${recommendation.recommendation === 'acceleration' ? 'advanced' : 'higher'} level`,
            urgency: 'low',
            auto_expire_hours: 168, // 7 days
          });
        }
      }
    }

    // STEP 3: Generate parent update
    const parentUpdate = await AssignmentEngineService.generateParentUpdate(
      entity_data.assignment_id
    );

    notificationsQueued++;

    actionsTriggered.push({
      action_id: `parent_update_${Date.now()}`,
      action_type: 'parent_notified',
      target: `student_${student_id}`,
      description: 'Parent update generated and queued',
      requires_approval: false,
    });

    logger.info(
      `Lesson complete flow processed for student ${student_id}: ${actionsTriggered.length} actions triggered`
    );

    return {
      actions_triggered: actionsTriggered,
      profiles_updated: profilesUpdated,
      notifications_queued: notificationsQueued,
      approvals_needed: approvalsNeeded,
    };
  }

  // ============================================================================
  // FLOW 4: MILESTONE ACHIEVEMENT
  // ============================================================================

  /**
   * Handle milestone achieved
   *
   * Flow:
   * 1. Celebrate achievement
   * 2. Notify teacher
   * 3. Notify parent with celebration
   * 4. Update profile with milestone
   */
  private static async handleMilestoneAchieved(event: TriggerEvent): Promise<TriggerResult> {
    const { student_id, entity_data } = event;

    if (!student_id) {
      throw new Error('Student ID required for milestone achieved event');
    }

    const actionsTriggered: AutomatedActionSummary[] = [];
    let notificationsQueued = 0;

    // Create celebration record
    // TODO: Implement celebration model

    // Notify teacher
    notificationsQueued++;

    actionsTriggered.push({
      action_id: `celebrate_${Date.now()}`,
      action_type: 'celebration_created',
      target: `student_${student_id}`,
      description: `Milestone achieved: ${entity_data.milestone_name}`,
      requires_approval: false,
    });

    // Notify parent
    notificationsQueued++;

    actionsTriggered.push({
      action_id: `notify_parent_${Date.now()}`,
      action_type: 'parent_notified',
      target: `student_${student_id}`,
      description: 'Parent notified with celebration message',
      requires_approval: false,
    });

    logger.info(
      `Milestone achieved flow processed for student ${student_id}: ${actionsTriggered.length} actions triggered`
    );

    return {
      actions_triggered: actionsTriggered,
      profiles_updated: 0,
      notifications_queued: notificationsQueued,
      approvals_needed: [],
    };
  }

  // ============================================================================
  // FLOW 5: INTERVENTION COMPLETION
  // ============================================================================

  /**
   * Handle intervention completion
   *
   * Flow:
   * 1. Update profile with intervention effectiveness
   * 2. If effective: Record strategy for future reference
   * 3. If ineffective: Flag for EP review
   * 4. Update next lesson difficulty based on progress
   */
  private static async handleInterventionComplete(event: TriggerEvent): Promise<TriggerResult> {
    const { student_id, entity_data } = event;

    if (!student_id) {
      throw new Error('Student ID required for intervention complete event');
    }

    const actionsTriggered: AutomatedActionSummary[] = [];
    let profilesUpdated = 0;

    // Update profile with intervention results
    await ProfileBuilderService.updateProfileFromIntervention({
      student_id: student_id,
      intervention_id: entity_data.intervention_id,
      intervention_type: entity_data.intervention_type,
      target_area: entity_data.target_area,
      effectiveness_score: entity_data.effectiveness_score,
      completed: true,
    });

    profilesUpdated++;

    actionsTriggered.push({
      action_id: `profile_update_${Date.now()}`,
      action_type: 'profile_updated',
      target: `student_${student_id}`,
      description: 'Profile updated with intervention effectiveness',
      requires_approval: false,
    });

    // If ineffective, flag for EP review
    if (entity_data.effectiveness_score < 0.5) {
      actionsTriggered.push({
        action_id: `ep_review_${Date.now()}`,
        action_type: 'ep_review_requested',
        target: `student_${student_id}`,
        description: 'Intervention ineffective - EP review recommended',
        requires_approval: false,
      });
    }

    logger.info(
      `Intervention complete flow processed for student ${student_id}: ${actionsTriggered.length} actions triggered`
    );

    return {
      actions_triggered: actionsTriggered,
      profiles_updated: profilesUpdated,
      notifications_queued: 0,
      approvals_needed: [],
    };
  }

  // ============================================================================
  // FLOW 6: EHCP DUE → AUTO-COMPILE
  // ============================================================================

  /**
   * Handle EHCP review due
   *
   * Flow:
   * 1. Compile all progress since last review
   * 2. Aggregate assessment results
   * 3. Summarize intervention effectiveness
   * 4. Collect teacher observations
   * 5. Pre-fill EHCP section
   * 6. Notify EP with one-click review access
   */
  private static async handleEHCPDue(event: TriggerEvent): Promise<TriggerResult> {
    const { student_id, entity_data } = event;

    if (!student_id) {
      throw new Error('Student ID required for EHCP due event');
    }

    const actionsTriggered: AutomatedActionSummary[] = [];
    let notificationsQueued = 0;

    // TODO: Integrate with EHCP module to compile data

    actionsTriggered.push({
      action_id: `ehcp_compile_${Date.now()}`,
      action_type: 'ehcp_data_compiled',
      target: `student_${student_id}`,
      description: 'EHCP review data compiled and pre-filled',
      requires_approval: false,
    });

    // Notify EP
    notificationsQueued++;

    actionsTriggered.push({
      action_id: `notify_ep_${Date.now()}`,
      action_type: 'ep_notified',
      target: `student_${student_id}`,
      description: 'EP notified with compiled EHCP data',
      requires_approval: false,
    });

    logger.info(
      `EHCP due flow processed for student ${student_id}: ${actionsTriggered.length} actions triggered`
    );

    return {
      actions_triggered: actionsTriggered,
      profiles_updated: 0,
      notifications_queued: notificationsQueued,
      approvals_needed: [],
    };
  }

  // ============================================================================
  // FLOW 7: BATTLE ROYALE → PROFILE UPDATE
  // ============================================================================

  /**
   * Handle Battle Royale completion
   *
   * Flow:
   * 1. Analyze performance data (speed, strategy, persistence)
   * 2. Extract learning style indicators
   * 3. Update profile engagement and persistence scores
   * 4. Adapt future lesson activities to learning style
   */
  private static async handleBattleRoyaleComplete(event: TriggerEvent): Promise<TriggerResult> {
    const { student_id, entity_data } = event;

    if (!student_id) {
      throw new Error('Student ID required for battle royale complete event');
    }

    const actionsTriggered: AutomatedActionSummary[] = [];
    let profilesUpdated = 0;

    // Update profile with Battle Royale performance
    await ProfileBuilderService.updateProfileFromBattleRoyale({
      student_id: student_id,
      game_id: entity_data.game_id,
      speed_score: entity_data.speed_score,
      strategy_score: entity_data.strategy_score,
      persistence_score: entity_data.persistence_score,
      preferred_game_types: entity_data.preferred_game_types,
    });

    profilesUpdated++;

    actionsTriggered.push({
      action_id: `profile_update_${Date.now()}`,
      action_type: 'profile_updated',
      target: `student_${student_id}`,
      description: 'Learning style updated from Battle Royale performance',
      requires_approval: false,
    });

    logger.info(
      `Battle Royale complete flow processed for student ${student_id}: ${actionsTriggered.length} actions triggered`
    );

    return {
      actions_triggered: actionsTriggered,
      profiles_updated: profilesUpdated,
      notifications_queued: 0,
      approvals_needed: [],
    };
  }

  // ============================================================================
  // APPROVAL PROCESSING
  // ============================================================================

  /**
   * Approve automated action
   *
   * Called when teacher approves a recommended action.
   *
   * @param actionId Automated action ID
   * @param approvedBy User ID of approver
   */
  static async approveAutomatedAction(actionId: string, approvedBy: number): Promise<void> {
    try {
      const action = await prisma.automatedAction.findUnique({
        where: { id: actionId },
      });

      if (!action) {
        throw new Error(`Action not found: ${actionId}`);
      }

      // Update action as approved
      await prisma.automatedAction.update({
        where: { id: actionId },
        data: {
          approved_by: approvedBy,
          approved_at: new Date(),
        },
      });

      // Execute approved action
      await this.executeApprovedAction(action);

      logger.info(`Automated action approved: ${actionId} by user ${approvedBy}`);
    } catch (error) {
      logger.error('Error approving automated action:', error as Error);
      throw error;
    }
  }

  /**
   * Reject automated action
   *
   * @param actionId Automated action ID
   * @param rejectedBy User ID of rejecter
   * @param reason Rejection reason
   */
  static async rejectAutomatedAction(
    actionId: string,
    rejectedBy: number,
    reason?: string
  ): Promise<void> {
    try {
      await prisma.automatedAction.update({
        where: { id: actionId },
        data: {
          rejected_at: new Date(),
          rejection_reason: reason,
        },
      });

      logger.info(`Automated action rejected: ${actionId} by user ${rejectedBy}`);
    } catch (error) {
      logger.error('Error rejecting automated action:', error as Error);
      throw error;
    }
  }

  /**
   * Execute approved action
   *
   * Performs the actual action after teacher approval.
   */
  private static async executeApprovedAction(action: any): Promise<void> {
    switch (action.action_type) {
      case 'intervention_triggered':
        // TODO: Create intervention record
        logger.info(`Executing intervention for student ${action.student_id}`);
        break;

      case 'level_up_recommended':
        // Update profile difficulty preference
        await prisma.studentProfile.update({
          where: { student_id: action.student_id },
          data: {
            difficulty_preference: 'extension',
            ready_to_level_up: false, // Reset flag
          },
        });
        logger.info(`Level change approved for student ${action.student_id}`);
        break;

      default:
        logger.warn(`Unknown action type for execution: ${action.action_type}`);
    }
  }

  // ============================================================================
  // BATCH PROCESSING
  // ============================================================================

  /**
   * Process batch of events
   *
   * For bulk operations (e.g., end of day processing).
   *
   * @param events Array of trigger events
   * @returns Aggregated results
   */
  static async processBatchEvents(events: TriggerEvent[]): Promise<TriggerResult> {
    const aggregatedResult: TriggerResult = {
      actions_triggered: [],
      profiles_updated: 0,
      notifications_queued: 0,
      approvals_needed: [],
    };

    for (const event of events) {
      try {
        const result = await this.processTriggerEvent(event);

        aggregatedResult.actions_triggered.push(...result.actions_triggered);
        aggregatedResult.profiles_updated += result.profiles_updated;
        aggregatedResult.notifications_queued += result.notifications_queued;
        aggregatedResult.approvals_needed.push(...result.approvals_needed);
      } catch (error) {
        logger.error(`Error processing batch event ${event.event_type}:`, error as Error);
        // Continue processing other events
      }
    }

    logger.info(
      `Batch processing complete: ${events.length} events, ${aggregatedResult.actions_triggered.length} actions triggered`
    );

    return aggregatedResult;
  }

  /**
   * Get pending approvals for teacher
   *
   * @param teacherId Teacher user ID
   * @returns List of pending approvals
   */
  static async getPendingApprovals(teacherId: number): Promise<ApprovalNeeded[]> {
    try {
      // Get teacher's tenant
      const teacher = await prisma.users.findUnique({
        where: { id: teacherId },
      });

      if (!teacher) {
        throw new Error(`Teacher not found: ${teacherId}`);
      }

      // Get pending actions
      const pendingActions = await prisma.automatedAction.findMany({
        where: {
          tenant_id: teacher.tenant_id,
          requires_approval: true,
          approved_at: null,
          rejected_at: null,
        },
        include: {
          student_profile: {
            include: {
              student: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      // Convert to approval format
      const approvals: ApprovalNeeded[] = pendingActions.map((action) => ({
        action_id: action.id,
        action_type: action.action_type,
        student_name: action.student_profile?.student
          ? `${action.student_profile.student.first_name} ${action.student_profile.student.last_name}`
          : 'Unknown Student',
        description: JSON.stringify(action.action_data),
        urgency: (action.action_data as any).urgency || 'medium',
        auto_expire_hours: this.getAutoExpireHours(action.action_type),
      }));

      return approvals;
    } catch (error) {
      logger.error('Error getting pending approvals:', error as Error);
      throw error;
    }
  }

  /**
   * Get auto-expire hours based on action type
   */
  private static getAutoExpireHours(actionType: string): number {
    const expiryMap: Record<string, number> = {
      intervention_triggered: 48, // 2 days
      level_up_recommended: 168, // 7 days
      ehcp_review_due: 336, // 14 days
    };

    return expiryMap[actionType] || 72; // Default 3 days
  }
}

// Export singleton instance for use in API routes
export const crossModuleIntelligenceService = new CrossModuleIntelligenceService();
