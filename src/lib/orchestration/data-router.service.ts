/**
 * DATA ROUTER SERVICE
 *
 * PURPOSE: Route student data to the right people with the right views,
 * preserving privacy and role-based access control.
 *
 * CORE PRINCIPLE: Same student data, different views.
 * - Teachers: Daily progress, differentiation needs, quick actions
 * - Parents: Plain English, ONLY their child, home support suggestions
 * - EPs: Cross-school aggregation, EHCP-focused, clinical view
 * - Head Teachers: School-wide trends, compliance, safeguarding
 * - Secondary Form Tutors: Holistic cross-subject student profiles
 * - Secondary Subject Teachers: Subject-specific performance
 *
 * SECURITY: Every data access is logged for GDPR compliance.
 * PRIVACY: Parents can NEVER see other children's data.
 */

import { PrismaClient } from '@prisma/client';
import { logger } from "@/lib/logger";

const prisma = new PrismaClient();

// ============================================================================
// TYPES
// ============================================================================

interface TeacherDashboardView {
  class: {
    id: string;
    name: string;
    subject: string;
    year_group: string;
    total_students: number;
  };
  urgent_students: StudentCard[];
  needs_support: StudentCard[];
  on_track: StudentCard[];
  exceeding: StudentCard[];
  today_actions: {
    lessons_assigned: number;
    interventions_triggered: number;
    parent_notifications: number;
    approvals_needed: ApprovalAction[];
  };
  voice_enabled: boolean;
}

interface StudentCard {
  student_id: number;
  name: string;
  photo_url?: string;
  current_level: string;
  recent_trend: 'improving' | 'stable' | 'declining';
  engagement_score: number;
  needs_intervention: boolean;
  intervention_urgency?: 'low' | 'medium' | 'high' | 'urgent';
  days_since_struggle: number;
  lessons_completed_week: number;
  current_success_rate: number;
  quick_actions: string[];
}

interface ApprovalAction {
  id: string;
  action_type: string;
  student_name: string;
  description: string;
  urgency: string;
  created_at: Date;
}

interface ParentPortalView {
  child: {
    name: string;
    year_group: string;
    class_name: string;
    teacher_name: string;
  };
  weekly_summary: {
    lessons_completed: number;
    overall_performance: string;
    strengths_this_week: string[];
    areas_to_reinforce: string[];
  };
  celebrations: Celebration[];
  home_support_suggestions: HomeSupportSuggestion[];
  upcoming_lessons: UpcomingLesson[];
  teacher_messages: Message[];
  unread_count: number;
  actions: {
    message_teacher: boolean;
    book_meeting: boolean;
    view_full_reports: boolean;
  };
}

interface Celebration {
  type: string;
  title: string;
  description: string;
  date: Date;
}

interface HomeSupportSuggestion {
  activity: string;
  why: string;
  duration_minutes?: number;
  resources?: { title: string; url: string }[];
}

interface UpcomingLesson {
  title: string;
  subject: string;
  when: Date;
  how_to_prepare?: string;
}

interface Message {
  id: string;
  from: string;
  message: string;
  created_at: Date;
  read: boolean;
}

interface EPMultiAgencyView {
  assigned_students: EPStudentCard[];
  schools: SchoolSummary[];
  ehcps: {
    due_for_review: EHCPReview[];
    new_requests: EHCPRequest[];
    assessments_pending: AssessmentPending[];
  };
  cross_school_trends: TrendData;
}

interface EPStudentCard {
  student_id: number;
  name: string;
  school_name: string;
  year_group: string;
  ehcp_status: string;
  last_review_date?: Date;
  next_review_date?: Date;
  intervention_count: number;
  recent_concern: string | null;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
}

interface SchoolSummary {
  school_name: string;
  tenant_id: number;
  total_assigned_students: number;
  urgent_cases: number;
  ehcps_due: number;
}

interface EHCPReview {
  student_id: number;
  student_name: string;
  school_name: string;
  review_due_date: Date;
  days_until_due: number;
  progress_summary: string;
}

interface EHCPRequest {
  student_id: number;
  student_name: string;
  school_name: string;
  requested_date: Date;
  current_status: string;
}

interface AssessmentPending {
  student_id: number;
  student_name: string;
  school_name: string;
  assessment_type: string;
  requested_date: Date;
}

interface TrendData {
  intervention_effectiveness: { type: string; effectiveness: number }[];
  common_struggle_areas: { area: string; count: number }[];
  attendance_correlation: number;
}

interface HeadTeacherView {
  school_summary: {
    total_students: number;
    sen_students: number;
    interventions_active: number;
    ehcps_in_progress: number;
  };
  trends: {
    academic_progress: any;
    behavioral_incidents: any;
    attendance: any;
  };
  compliance: {
    ehcps_due: number;
    staff_training_due: number;
    safeguarding_alerts: number;
  };
  urgent_attention: {
    students: StudentCard[];
    staff_actions: any[];
  };
}

interface SecondaryFormTutorView {
  form_group: {
    name: string;
    year_group: string;
    total_students: number;
  };
  students: SecondaryStudentProfile[];
  pastoral_concerns: PastoralConcern[];
  attendance_overview: AttendanceData[];
}

interface SecondaryStudentProfile {
  student_id: number;
  name: string;
  subject_performance: {
    subject: string;
    teacher: string;
    grade: string;
    trend: 'improving' | 'stable' | 'declining';
    comment?: string;
  }[];
  overall_trend: 'improving' | 'stable' | 'declining';
  pastoral_notes: string[];
  attendance_percentage: number;
}

interface PastoralConcern {
  student_id: number;
  student_name: string;
  concern_type: string;
  description: string;
  raised_by: string;
  date: Date;
  status: string;
}

interface AttendanceData {
  student_id: number;
  student_name: string;
  percentage: number;
  recent_absences: number;
  concern_level: 'none' | 'monitor' | 'concern' | 'urgent';
}

// ============================================================================
// DATA ROUTER SERVICE
// ============================================================================

export class DataRouterService {
  /**
   * GET TEACHER DASHBOARD VIEW
   *
   * Returns teacher's command center data:
   * - All students auto-sorted by need (urgent, support, on-track, exceeding)
   * - Today's automated actions summary
   * - Pending approvals
   * - Voice command interface ready
   *
   * @param teacherId User ID of teacher
   * @param classRosterId Class roster ID
   * @returns Complete dashboard view
   */
  static async getTeacherDashboardView(
    teacherId: number,
    classRosterId: string
  ): Promise<TeacherDashboardView> {
    try {
      // Verify teacher has access to this class
      const classRoster = await prisma.classRoster.findFirst({
        where: {
          id: classRosterId,
          teacher_id: teacherId,
        },
      });

      if (!classRoster) {
        throw new Error('Unauthorized: Class not found or not assigned to teacher');
      }

      // Get all students in class
      const allStudentIds = [
        ...classRoster.urgent_students,
        ...classRoster.needs_support,
        ...classRoster.on_track,
        ...classRoster.exceeding,
      ];

      const students = await prisma.students.findMany({
        where: { id: { in: allStudentIds } },
        include: {
          student_profile: true,
        },
      });

      // Build student cards
      const studentCards = await Promise.all(
        students.map((student) => this.buildStudentCard(student))
      );

      // Sort into categories based on current profile
      const urgent_students = studentCards.filter(
        (s) => s.intervention_urgency === 'urgent' || s.intervention_urgency === 'high'
      );
      const needs_support = studentCards.filter(
        (s) =>
          s.needs_intervention &&
          s.intervention_urgency !== 'urgent' &&
          s.intervention_urgency !== 'high'
      );
      const on_track = studentCards.filter(
        (s) => !s.needs_intervention && s.current_success_rate >= 0.6
      );
      const exceeding = studentCards.filter(
        (s) => !s.needs_intervention && s.current_success_rate >= 0.8
      );

      // Get today's actions summary
      const todayActions = await this.getTodayActionsSummary(
        classRoster.tenant_id,
        classRosterId
      );

      // Log data access
      await this.logDataAccess({
        tenant_id: classRoster.tenant_id,
        user_id: teacherId,
        access_type: 'teacher_dashboard',
        accessed_entity: 'class',
        entity_id: classRosterId,
        student_ids: allStudentIds,
      });

      return {
        class: {
          id: classRoster.id,
          name: classRoster.class_name,
          subject: classRoster.subject || 'Mixed',
          year_group: classRoster.year_group,
          total_students: students.length,
        },
        urgent_students,
        needs_support,
        on_track,
        exceeding,
        today_actions: todayActions,
        voice_enabled: classRoster.voice_enabled,
      };
    } catch (error) {
      logger.error('Error getting teacher dashboard view:', error as Error);
      throw error;
    }
  }

  /**
   * GET PARENT PORTAL VIEW
   *
   * CRITICAL: Parents can ONLY see their own child's data.
   * This function enforces strict parent-child scoping.
   *
   * @param parentId User ID of parent
   * @param childId Student ID of child
   * @returns Scoped parent portal view
   */
  static async getParentPortalView(
    parentId: number,
    childId: number
  ): Promise<ParentPortalView> {
    try {
      // SECURITY: Verify parent-child link
      const parentChildLink = await prisma.parentChildLink.findFirst({
        where: {
          parent_id: parentId,
          child_id: childId,
        },
      });

      if (!parentChildLink) {
        throw new Error('Unauthorized: Parent-child relationship not found');
      }

      // Get child data
      const child = await prisma.students.findUnique({
        where: { id: childId },
        include: {
          student_profile: true,
        },
      });

      if (!child) {
        throw new Error('Child not found');
      }

      // Get teacher info (assume single teacher for now)
      // In production, handle multiple teachers for secondary schools
      const teacher = await prisma.users.findFirst({
        where: {
          tenant_id: child.tenant_id,
          role: 'teacher',
        },
      });

      // Get recent lesson completions (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const recentAssignments = await prisma.studentLessonAssignment.findMany({
        where: {
          student_id: childId,
          completed_at: {
            gte: weekAgo,
          },
        },
        include: {
          lesson_plan: true,
        },
        orderBy: {
          completed_at: 'desc',
        },
      });

      // Calculate weekly summary
      const lessonsCompleted = recentAssignments.length;
      const avgSuccessRate =
        recentAssignments.length > 0
          ? recentAssignments
              .filter((a) => a.success_rate !== null)
              .reduce((sum, a) => sum + (a.success_rate || 0), 0) / lessonsCompleted
          : 0;

      let overallPerformance = 'Making good progress';
      if (avgSuccessRate >= 0.8) overallPerformance = 'Excellent progress!';
      else if (avgSuccessRate < 0.6) overallPerformance = 'Working hard - needs extra support';

      const strengthsThisWeek = child.student_profile?.current_strengths || [];
      const areasToReinforce = child.student_profile?.current_struggles || [];

      // Get celebrations (milestones, achievements)
      const celebrations = await this.getRecentCelebrations(childId);

      // Generate home support suggestions
      const homeSupportSuggestions = await this.generateHomeSupportSuggestions(
        child,
        areasToReinforce
      );

      // Get upcoming lessons
      const upcomingLessons = await this.getUpcomingLessons(childId);

      // Get teacher messages
      const messages: Message[] = []; // TODO: Implement messaging system

      // Log data access
      await this.logDataAccess({
        tenant_id: child.tenant_id,
        user_id: parentId,
        access_type: 'parent_portal',
        accessed_entity: 'student',
        entity_id: childId.toString(),
        student_ids: [childId],
      });

      return {
        child: {
          name: `${child.first_name} ${child.last_name}`,
          year_group: child.year_group || 'Unknown',
          class_name: 'Class Name', // TODO: Get from class roster
          teacher_name: teacher
            ? `${teacher.firstName} ${teacher.lastName}`
            : 'Unknown Teacher',
        },
        weekly_summary: {
          lessons_completed: lessonsCompleted,
          overall_performance: overallPerformance,
          strengths_this_week: strengthsThisWeek.slice(0, 3), // Top 3
          areas_to_reinforce: areasToReinforce.slice(0, 2), // Top 2
        },
        celebrations,
        home_support_suggestions: homeSupportSuggestions,
        upcoming_lessons: upcomingLessons,
        teacher_messages: messages,
        unread_count: messages.filter((m) => !m.read).length,
        actions: {
          message_teacher: parentChildLink.can_message_teacher,
          book_meeting: true, // TODO: Implement meeting booking
          view_full_reports: true,
        },
      };
    } catch (error) {
      logger.error('Error getting parent portal view:', error as Error);
      throw error;
    }
  }

  /**
   * GET EP MULTI-AGENCY VIEW
   *
   * Educational Psychologist view across multiple schools.
   * Shows all assigned students with EHCP focus.
   *
   * @param epId User ID of Educational Psychologist
   * @returns Cross-school aggregated view
   */
  static async getEPMultiAgencyView(epId: number): Promise<EPMultiAgencyView> {
    try {
      // Get EP's multi-agency access
      const epAccess = await prisma.multiAgencyAccess.findFirst({
        where: {
          user_id: epId,
          role_type: 'ep',
        },
      });

      if (!epAccess) {
        throw new Error('Unauthorized: EP access not found');
      }

      // Get all assigned students
      const assignedStudentIds = epAccess.accessible_student_ids;

      const students = await prisma.students.findMany({
        where: { id: { in: assignedStudentIds } },
        include: {
          student_profile: true,
        },
      });

      // Build EP student cards
      const epStudentCards = await Promise.all(
        students.map((student) => this.buildEPStudentCard(student))
      );

      // Get school summaries
      const schoolSummaries = await this.getSchoolSummaries(assignedStudentIds);

      // Get EHCP data
      const ehcps = await this.getEHCPData(assignedStudentIds);

      // Get cross-school trends
      const crossSchoolTrends = await this.getCrossSchoolTrends(assignedStudentIds);

      // Log data access
      await this.logDataAccess({
        tenant_id: epAccess.tenant_id,
        user_id: epId,
        access_type: 'ep_multi_agency',
        accessed_entity: 'multiple_students',
        entity_id: 'ep_dashboard',
        student_ids: assignedStudentIds,
      });

      return {
        assigned_students: epStudentCards,
        schools: schoolSummaries,
        ehcps,
        cross_school_trends: crossSchoolTrends,
      };
    } catch (error) {
      logger.error('Error getting EP multi-agency view:', error as Error);
      throw error;
    }
  }

  /**
   * GET HEAD TEACHER SCHOOL VIEW
   *
   * School-wide overview for head teacher.
   * Focus on compliance, trends, and urgent attention items.
   *
   * @param headId User ID of head teacher
   * @returns School-wide view
   */
  static async getHeadTeacherSchoolView(headId: number): Promise<HeadTeacherView> {
    try {
      // Get head teacher's tenant
      const headTeacher = await prisma.users.findUnique({
        where: { id: headId },
      });

      if (!headTeacher || headTeacher.role !== 'head_teacher') {
        throw new Error('Unauthorized: Not a head teacher');
      }

      // Get school summary stats
      const totalStudents = await prisma.students.count({
        where: { tenant_id: headTeacher.tenant_id },
      });

      const senStudents = await prisma.students.count({
        where: {
          tenant_id: headTeacher.tenant_id,
          sen_status: { not: null },
        },
      });

      const interventionsActive = await prisma.studentProfile.count({
        where: {
          tenant_id: headTeacher.tenant_id,
          needs_intervention: true,
        },
      });

      const ehcpsInProgress = 0; // TODO: Count from EHCP module

      // Get urgent attention students
      const urgentProfiles = await prisma.studentProfile.findMany({
        where: {
          tenant_id: headTeacher.tenant_id,
          intervention_urgency: { in: ['urgent', 'high'] },
        },
        include: {
          student: true,
        },
      });

      const urgentStudents = await Promise.all(
        urgentProfiles.map((profile) => this.buildStudentCard(profile.student))
      );

      // Get compliance data
      const compliance = {
        ehcps_due: 0, // TODO: Count EHCPs due for review
        staff_training_due: 0, // TODO: Implement staff training tracking
        safeguarding_alerts: 0, // TODO: Implement safeguarding module
      };

      // Log data access
      await this.logDataAccess({
        tenant_id: headTeacher.tenant_id,
        user_id: headId,
        access_type: 'head_teacher_school_view',
        accessed_entity: 'school',
        entity_id: headTeacher.tenant_id.toString(),
        student_ids: [],
      });

      return {
        school_summary: {
          total_students: totalStudents,
          sen_students: senStudents,
          interventions_active: interventionsActive,
          ehcps_in_progress: ehcpsInProgress,
        },
        trends: {
          academic_progress: {}, // TODO: Aggregate progress data
          behavioral_incidents: {}, // TODO: Aggregate behavior data
          attendance: {}, // TODO: Aggregate attendance data
        },
        compliance,
        urgent_attention: {
          students: urgentStudents,
          staff_actions: [],
        },
      };
    } catch (error) {
      logger.error('Error getting head teacher school view:', error as Error);
      throw error;
    }
  }

  /**
   * GET SECONDARY FORM TUTOR VIEW
   *
   * Holistic view of form group students across all subjects.
   * Each subject teacher contributes data automatically.
   *
   * @param tutorId User ID of form tutor
   * @param formGroupId Form group identifier
   * @returns Cross-subject holistic profiles
   */
  static async getSecondaryFormTutorView(
    tutorId: number,
    formGroupId: string
  ): Promise<SecondaryFormTutorView> {
    try {
      // TODO: Implement form group model
      // For now, return placeholder structure

      return {
        form_group: {
          name: 'Form 10B',
          year_group: 'Year 10',
          total_students: 0,
        },
        students: [],
        pastoral_concerns: [],
        attendance_overview: [],
      };
    } catch (error) {
      logger.error('Error getting secondary form tutor view:', error as Error);
      throw error;
    }
  }

  /**
   * ROUTE PROGRESS UPDATE
   *
   * Send progress updates to relevant parties based on context.
   *
   * @param studentId Student ID
   * @param updateType Type of update
   * @param updateData Update data
   */
  static async routeProgressUpdate(
    studentId: number,
    updateType: string,
    updateData: any
  ): Promise<void> {
    try {
      // Get student and profile
      const student = await prisma.students.findUnique({
        where: { id: studentId },
        include: {
          student_profile: true,
        },
      });

      if (!student) {
        throw new Error(`Student not found: ${studentId}`);
      }

      // Route to teacher (via class roster)
      // TODO: Implement teacher notification

      // Route to parent (if linked)
      const parentLinks = await prisma.parentChildLink.findMany({
        where: { child_id: studentId },
      });

      for (const link of parentLinks) {
        if (link.notification_app) {
          // TODO: Queue parent notification
          logger.info(`Parent notification queued for student ${studentId}`);
        }
      }

      // Route to EP if EHCP student or intervention urgent
      if (
        student.student_profile?.needs_intervention &&
        student.student_profile.intervention_urgency === 'urgent'
      ) {
        // TODO: Notify assigned EP
        logger.info(`EP notification queued for urgent student ${studentId}`);
      }

      logger.info(`Progress update routed for student ${studentId}: ${updateType}`);
    } catch (error) {
      logger.error('Error routing progress update:', error as Error);
      throw error;
    }
  }

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Build student card from student data
   */
  private static async buildStudentCard(student: any): Promise<StudentCard> {
    const profile = student.student_profile;

    // Get recent assignments to calculate success rate
    const recentAssignments = await prisma.studentLessonAssignment.findMany({
      where: { student_id: student.id },
      orderBy: { updated_at: 'desc' },
      take: 10,
    });

    const completedThisWeek = recentAssignments.filter((a) => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return a.completed_at && a.completed_at >= weekAgo;
    }).length;

    const avgSuccessRate =
      recentAssignments.length > 0
        ? recentAssignments
            .filter((a) => a.success_rate !== null)
            .reduce((sum, a) => sum + (a.success_rate || 0), 0) / recentAssignments.length
        : 0.5;

    // Calculate days since last struggle
    const lastStruggle = recentAssignments.find((a) => a.success_rate && a.success_rate < 0.5);
    const daysSinceStruggle = lastStruggle
      ? Math.floor(
          (Date.now() - new Date(lastStruggle.updated_at).getTime()) / (1000 * 60 * 60 * 24)
        )
      : 999;

    // Determine trend
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (recentAssignments.length >= 5) {
      const firstHalf = recentAssignments.slice(0, Math.floor(recentAssignments.length / 2));
      const secondHalf = recentAssignments.slice(Math.floor(recentAssignments.length / 2));

      const firstAvg =
        firstHalf.filter((a) => a.success_rate !== null).reduce((sum, a) => sum + (a.success_rate || 0), 0) /
        firstHalf.length;
      const secondAvg =
        secondHalf.filter((a) => a.success_rate !== null).reduce((sum, a) => sum + (a.success_rate || 0), 0) /
        secondHalf.length;

      if (secondAvg > firstAvg + 0.1) trend = 'improving';
      else if (secondAvg < firstAvg - 0.1) trend = 'declining';
    }

    return {
      student_id: student.id,
      name: `${student.first_name} ${student.last_name}`,
      photo_url: undefined,
      current_level: profile?.difficulty_preference || 'on_level',
      recent_trend: trend,
      engagement_score: profile?.engagement_score || 0.5,
      needs_intervention: profile?.needs_intervention || false,
      intervention_urgency: profile?.intervention_urgency || undefined,
      days_since_struggle: daysSinceStruggle,
      lessons_completed_week: completedThisWeek,
      current_success_rate: avgSuccessRate,
      quick_actions: ['view_profile', 'assign_lesson', 'message_parent', 'trigger_intervention'],
    };
  }

  /**
   * Build EP student card
   */
  private static async buildEPStudentCard(student: any): Promise<EPStudentCard> {
    const profile = student.student_profile;

    // Get intervention count
    const interventionCount = 0; // TODO: Count from intervention module

    // Determine recent concern
    let recentConcern: string | null = null;
    if (profile?.needs_intervention) {
      recentConcern = profile.current_struggles[0] || 'General support needed';
    }

    // Determine urgency
    const urgency = profile?.intervention_urgency || 'low';

    return {
      student_id: student.id,
      name: `${student.first_name} ${student.last_name}`,
      school_name: 'School Name', // TODO: Get from tenant
      year_group: student.year_group || 'Unknown',
      ehcp_status: 'Active', // TODO: Get from EHCP module
      last_review_date: undefined,
      next_review_date: undefined,
      intervention_count: interventionCount,
      recent_concern: recentConcern,
      urgency: urgency as 'low' | 'medium' | 'high' | 'urgent',
    };
  }

  /**
   * Get today's actions summary
   */
  private static async getTodayActionsSummary(
    tenantId: number,
    classRosterId: string
  ): Promise<{
    lessons_assigned: number;
    interventions_triggered: number;
    parent_notifications: number;
    approvals_needed: ApprovalAction[];
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayActions = await prisma.automatedAction.findMany({
      where: {
        tenant_id: tenantId,
        created_at: { gte: today },
      },
    });

    const lessonsAssigned = todayActions.filter((a) => a.action_type === 'lesson_assigned').length;
    const interventionsTriggered = todayActions.filter(
      (a) => a.action_type === 'intervention_triggered'
    ).length;
    const parentNotifications = todayActions.filter(
      (a) => a.action_type === 'parent_notified'
    ).length;

    const approvalsNeeded: ApprovalAction[] = todayActions
      .filter((a) => a.requires_approval && !a.approved_at && !a.rejected_at)
      .map((a) => ({
        id: a.id,
        action_type: a.action_type,
        student_name: 'Student Name', // TODO: Join with student
        description: JSON.stringify(a.action_data),
        urgency: 'medium',
        created_at: a.created_at,
      }));

    return {
      lessons_assigned: lessonsAssigned,
      interventions_triggered: interventionsTriggered,
      parent_notifications: parentNotifications,
      approvals_needed: approvalsNeeded,
    };
  }

  /**
   * Get recent celebrations for student
   */
  private static async getRecentCelebrations(studentId: number): Promise<Celebration[]> {
    // TODO: Implement celebration tracking
    return [];
  }

  /**
   * Generate home support suggestions based on student needs
   */
  private static async generateHomeSupportSuggestions(
    student: any,
    areasToReinforce: string[]
  ): Promise<HomeSupportSuggestion[]> {
    const suggestions: HomeSupportSuggestion[] = [];

    // Generic reading suggestion
    suggestions.push({
      activity: 'Read together for 15 minutes each day',
      why: `Helps ${student.first_name} build vocabulary and comprehension`,
      duration_minutes: 15,
    });

    // Area-specific suggestions
    for (const area of areasToReinforce.slice(0, 2)) {
      suggestions.push({
        activity: `Practice ${area.toLowerCase()} with everyday examples`,
        why: `Reinforces classroom learning in ${area}`,
        duration_minutes: 20,
      });
    }

    return suggestions;
  }

  /**
   * Get upcoming lessons for student
   */
  private static async getUpcomingLessons(studentId: number): Promise<UpcomingLesson[]> {
    const upcomingAssignments = await prisma.studentLessonAssignment.findMany({
      where: {
        student_id: studentId,
        status: 'assigned',
      },
      include: {
        lesson_plan: true,
      },
      orderBy: {
        assigned_at: 'asc',
      },
      take: 5,
    });

    return upcomingAssignments.map((assignment) => ({
      title: assignment.lesson_plan.title,
      subject: assignment.lesson_plan.subject,
      when: assignment.lesson_plan.scheduled_for || new Date(),
      how_to_prepare: undefined,
    }));
  }

  /**
   * Get school summaries for EP view
   */
  private static async getSchoolSummaries(studentIds: number[]): Promise<SchoolSummary[]> {
    // Group students by tenant
    const students = await prisma.students.findMany({
      where: { id: { in: studentIds } },
      include: {
        student_profile: true,
      },
    });

    const schoolMap = new Map<number, SchoolSummary>();

    for (const student of students) {
      if (!schoolMap.has(student.tenant_id)) {
        schoolMap.set(student.tenant_id, {
          school_name: 'School Name', // TODO: Get from tenant
          tenant_id: student.tenant_id,
          total_assigned_students: 0,
          urgent_cases: 0,
          ehcps_due: 0,
        });
      }

      const summary = schoolMap.get(student.tenant_id)!;
      summary.total_assigned_students++;

      if (
        student.student_profile?.needs_intervention &&
        student.student_profile.intervention_urgency === 'urgent'
      ) {
        summary.urgent_cases++;
      }
    }

    return Array.from(schoolMap.values());
  }

  /**
   * Get EHCP data for EP view
   */
  private static async getEHCPData(
    studentIds: number[]
  ): Promise<{
    due_for_review: EHCPReview[];
    new_requests: EHCPRequest[];
    assessments_pending: AssessmentPending[];
  }> {
    // TODO: Integrate with EHCP module
    return {
      due_for_review: [],
      new_requests: [],
      assessments_pending: [],
    };
  }

  /**
   * Get cross-school trends
   */
  private static async getCrossSchoolTrends(studentIds: number[]): Promise<TrendData> {
    // TODO: Implement trend analysis
    return {
      intervention_effectiveness: [],
      common_struggle_areas: [],
      attendance_correlation: 0,
    };
  }

  /**
   * Log data access for GDPR compliance
   */
  private static async logDataAccess(data: {
    tenant_id: number;
    user_id: number;
    access_type: string;
    accessed_entity: string;
    entity_id: string;
    student_ids: number[];
  }): Promise<void> {
    try {
      // TODO: Implement data access audit log table
      logger.info(`Data access logged: ${data.access_type} by user ${data.user_id}`);
    } catch (error) {
      logger.error('Error logging data access:', error as Error);
      // Don't throw - logging failure shouldn't break the flow
    }
  }
}

// Export singleton instance for use in API routes
export const dataRouterService = new DataRouterService();
