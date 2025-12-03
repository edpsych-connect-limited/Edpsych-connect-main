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
    } catch (_error) {
      logger.error('Error getting teacher dashboard view:', _error as Error);
      throw _error;
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
      const messages = await this.getTeacherMessages(childId, parentId);

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
          class_name: await this.getChildClassName(childId) || 'Class Name',
          teacher_name: teacher
            ? `${teacher.firstName} ${teacher.lastName}`
            : 'Class Teacher',
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
          book_meeting: parentChildLink.can_book_meeting ?? true,
          view_full_reports: parentChildLink.can_view_reports ?? true,
        },
      };
    } catch (_error) {
      logger.error('Error getting parent portal view:', _error as Error);
      throw _error;
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
    } catch (_error) {
      logger.error('Error getting EP multi-agency view:', _error as Error);
      throw _error;
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

      const ehcpsInProgress = await prisma.ehcps.count({
        where: {
          tenant_id: headTeacher.tenant_id,
          status: { in: ['draft', 'submitted', 'under_review', 'in_progress'] },
        },
      });

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
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const ehcpsDue = await prisma.ehcps.count({
        where: {
          tenant_id: headTeacher.tenant_id,
          next_review_date: { lte: thirtyDaysFromNow },
        },
      });

      const staffTrainingDue = await prisma.enrollments.count({
        where: {
          tenant_id: headTeacher.tenant_id,
          status: { in: ['enrolled', 'in_progress'] },
          course: {
            deadline: { lte: thirtyDaysFromNow },
          },
        },
      });

      const safeguardingAlerts = await prisma.cases.count({
        where: {
          tenant_id: headTeacher.tenant_id,
          case_type: { contains: 'safeguard' },
          status: 'open',
        },
      });

      const compliance = {
        ehcps_due: ehcpsDue,
        staff_training_due: staffTrainingDue,
        safeguarding_alerts: safeguardingAlerts,
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

      // Get trends data
      const academicProgress = await this.getAcademicProgressTrends(headTeacher.tenant_id);
      const behaviouralIncidents = await this.getBehaviouralIncidentsTrends(headTeacher.tenant_id);
      const attendanceData = await this.getAttendanceTrends(headTeacher.tenant_id);

      return {
        school_summary: {
          total_students: totalStudents,
          sen_students: senStudents,
          interventions_active: interventionsActive,
          ehcps_in_progress: ehcpsInProgress,
        },
        trends: {
          academic_progress: academicProgress,
          behavioral_incidents: behaviouralIncidents,
          attendance: attendanceData,
        },
        compliance,
        urgent_attention: {
          students: urgentStudents,
          staff_actions: [],
        },
      };
    } catch (_error) {
      logger.error('Error getting head teacher school view:', _error as Error);
      throw _error;
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
      // Verify tutor has access to this form group
      const formGroup = await prisma.classRoster.findFirst({
        where: {
          id: formGroupId,
          teacher_id: tutorId,
        },
      });

      if (!formGroup) {
        throw new Error('Unauthorised: Form group not found or not assigned to tutor');
      }

      // Get all students in form group
      const allStudentIds = [
        ...formGroup.urgent_students,
        ...formGroup.needs_support,
        ...formGroup.on_track,
        ...formGroup.exceeding,
      ];

      const students = await prisma.students.findMany({
        where: { id: { in: allStudentIds } },
        include: {
          student_profile: true,
        },
      });

      // Build student profiles with cross-subject performance
      const studentProfiles = await Promise.all(
        students.map(async (student) => {
          // Get subject performance from lesson assignments
          const assignments = await prisma.studentLessonAssignment.findMany({
            where: { student_id: student.id },
            include: {
              lesson_plan: {
                select: { subject: true, teacher_id: true },
              },
            },
            orderBy: { updated_at: 'desc' },
            take: 50,
          });

          // Group by subject
          const subjectMap = new Map<string, { grades: number[]; teacher_id: number | null }>();
          for (const assignment of assignments) {
            const subject = assignment.lesson_plan.subject;
            if (!subjectMap.has(subject)) {
              subjectMap.set(subject, { grades: [], teacher_id: assignment.lesson_plan.teacher_id });
            }
            if (assignment.success_rate !== null) {
              subjectMap.get(subject)!.grades.push(assignment.success_rate);
            }
          }

          // Get teacher names
          const teacherIds = [...new Set(Array.from(subjectMap.values()).map(v => v.teacher_id).filter(Boolean))] as number[];
          const teachers = await prisma.users.findMany({
            where: { id: { in: teacherIds } },
            select: { id: true, firstName: true, lastName: true },
          });
          const teacherMap = new Map(teachers.map(t => [t.id, `${t.firstName} ${t.lastName}`]));

          const subjectPerformance = Array.from(subjectMap.entries()).map(([subject, data]) => {
            const avgGrade = data.grades.length > 0
              ? data.grades.reduce((a, b) => a + b, 0) / data.grades.length
              : 0.5;
            
            // Calculate trend
            let trend: 'improving' | 'stable' | 'declining' = 'stable';
            if (data.grades.length >= 4) {
              const firstHalf = data.grades.slice(0, Math.floor(data.grades.length / 2));
              const secondHalf = data.grades.slice(Math.floor(data.grades.length / 2));
              const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
              const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
              if (secondAvg > firstAvg + 0.05) trend = 'improving';
              else if (secondAvg < firstAvg - 0.05) trend = 'declining';
            }

            return {
              subject,
              teacher: data.teacher_id ? teacherMap.get(data.teacher_id) || 'Unknown' : 'Unknown',
              grade: this.gradeFromPercentage(avgGrade),
              trend,
            };
          });

          // Calculate overall trend
          const allGrades = assignments.filter(a => a.success_rate !== null).map(a => a.success_rate!);
          let overallTrend: 'improving' | 'stable' | 'declining' = 'stable';
          if (allGrades.length >= 10) {
            const firstHalf = allGrades.slice(0, Math.floor(allGrades.length / 2));
            const secondHalf = allGrades.slice(Math.floor(allGrades.length / 2));
            const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
            const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
            if (secondAvg > firstAvg + 0.05) overallTrend = 'improving';
            else if (secondAvg < firstAvg - 0.05) overallTrend = 'declining';
          }

          return {
            student_id: student.id,
            name: `${student.first_name} ${student.last_name}`,
            subject_performance: subjectPerformance,
            overall_trend: overallTrend,
            pastoral_notes: student.student_profile?.notes || [],
            attendance_percentage: student.student_profile?.engagement_score 
              ? Math.round(student.student_profile.engagement_score * 100) 
              : 95,
          };
        })
      );

      // Get pastoral concerns from cases
      const pastoralConcerns = await prisma.cases.findMany({
        where: {
          student_id: { in: allStudentIds },
          case_type: { in: ['pastoral', 'safeguarding', 'welfare', 'behavioural'] },
          status: { not: 'resolved' },
        },
        include: {
          student: { select: { first_name: true, last_name: true } },
          created_by: { select: { firstName: true, lastName: true } },
        },
        orderBy: { created_at: 'desc' },
        take: 20,
      });

      const concerns: PastoralConcern[] = pastoralConcerns.map(c => ({
        student_id: c.student_id,
        student_name: `${c.student.first_name} ${c.student.last_name}`,
        concern_type: c.case_type,
        description: c.description || 'No description provided',
        raised_by: c.created_by ? `${c.created_by.firstName} ${c.created_by.lastName}` : 'System',
        date: c.created_at,
        status: c.status,
      }));

      // Build attendance overview from profiles
      const attendanceOverview: AttendanceData[] = students.map(s => {
        const engagement = s.student_profile?.engagement_score || 0.95;
        const percentage = Math.round(engagement * 100);
        let concernLevel: 'none' | 'monitor' | 'concern' | 'urgent' = 'none';
        if (percentage < 85) concernLevel = 'urgent';
        else if (percentage < 90) concernLevel = 'concern';
        else if (percentage < 95) concernLevel = 'monitor';

        return {
          student_id: s.id,
          student_name: `${s.first_name} ${s.last_name}`,
          percentage,
          recent_absences: Math.round((1 - engagement) * 20), // Estimate recent absences
          concern_level: concernLevel,
        };
      }).sort((a, b) => a.percentage - b.percentage);

      // Log data access
      await this.logDataAccess({
        tenant_id: formGroup.tenant_id,
        user_id: tutorId,
        access_type: 'secondary_form_tutor',
        accessed_entity: 'form_group',
        entity_id: formGroupId,
        student_ids: allStudentIds,
      });

      return {
        form_group: {
          name: formGroup.class_name,
          year_group: formGroup.year_group,
          total_students: students.length,
        },
        students: studentProfiles,
        pastoral_concerns: concerns,
        attendance_overview: attendanceOverview,
      };
    } catch (_error) {
      logger.error('Error getting secondary form tutor view:', _error as Error);
      throw _error;
    }
  }

  /**
   * Convert percentage to UK grade
   */
  private static gradeFromPercentage(percentage: number): string {
    if (percentage >= 0.9) return '9';
    if (percentage >= 0.8) return '8';
    if (percentage >= 0.7) return '7';
    if (percentage >= 0.6) return '6';
    if (percentage >= 0.5) return '5';
    if (percentage >= 0.4) return '4';
    if (percentage >= 0.3) return '3';
    if (percentage >= 0.2) return '2';
    return '1';
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
    _updateData: any
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
      await this.notifyTeacher(student.tenant_id, studentId, updateType);

      // Route to parent (if linked)
      const parentLinks = await prisma.parentChildLink.findMany({
        where: { child_id: studentId },
      });

      for (const link of parentLinks) {
        if (link.notification_app) {
          await this.queueParentNotification(link.parent_id, studentId, updateType);
          logger.info(`Parent notification queued for student ${studentId}`);
        }
      }

      // Route to EP if EHCP student or intervention urgent
      if (
        student.student_profile?.needs_intervention &&
        student.student_profile.intervention_urgency === 'urgent'
      ) {
        await this.notifyAssignedEP(studentId, updateType);
        logger.info(`EP notification queued for urgent student ${studentId}`);
      }

      logger.info(`Progress update routed for student ${studentId}: ${updateType}`);
    } catch (_error) {
      logger.error('Error routing progress update:', _error as Error);
      throw _error;
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

    // Get intervention count from database
    const interventionCount = await prisma.interventions.count({
      where: { student_id: student.id },
    });

    // Get school name from tenant
    const tenant = await prisma.tenants.findUnique({
      where: { id: student.tenant_id },
      select: { name: true },
    });

    // Get EHCP status from database
    const ehcp = await prisma.ehcps.findFirst({
      where: { student_id: student.id },
      orderBy: { updated_at: 'desc' },
      select: {
        status: true,
        last_review_date: true,
        next_review_date: true,
      },
    });

    // Determine recent concern
    let recentConcern: string | null = null;
    if (profile?.needs_intervention) {
      recentConcern = profile.current_struggles?.[0] || 'General support needed';
    }

    // Determine urgency
    const urgency = profile?.intervention_urgency || 'low';

    return {
      student_id: student.id,
      name: `${student.first_name} ${student.last_name}`,
      school_name: tenant?.name || 'Unknown School',
      year_group: student.year_group || 'Unknown',
      ehcp_status: ehcp?.status || 'No EHCP',
      last_review_date: ehcp?.last_review_date || undefined,
      next_review_date: ehcp?.next_review_date || undefined,
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
    _classRosterId: string
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

    const approvalsNeeded: ApprovalAction[] = await Promise.all(
      todayActions
        .filter((a) => a.requires_approval && !a.approved_at && !a.rejected_at)
        .map(async (a) => {
          // Get student name from action data or lookup
          let studentName = 'Unknown Student';
          if (a.action_data && typeof a.action_data === 'object') {
            const actionData = a.action_data as Record<string, unknown>;
            if (actionData.student_id) {
              const student = await prisma.students.findUnique({
                where: { id: Number(actionData.student_id) },
                select: { first_name: true, last_name: true },
              });
              if (student) {
                studentName = `${student.first_name} ${student.last_name}`;
              }
            }
          }
          return {
            id: a.id,
            action_type: a.action_type,
            student_name: studentName,
            description: JSON.stringify(a.action_data),
            urgency: 'medium',
            created_at: a.created_at,
          };
        })
    );

    return {
      lessons_assigned: lessonsAssigned,
      interventions_triggered: interventionsTriggered,
      parent_notifications: parentNotifications,
      approvals_needed: approvalsNeeded,
    };
  }

  /**
   * Get recent celebrations for student
   * Includes achievements, badges, and progress milestones
   */
  private static async getRecentCelebrations(studentId: number): Promise<Celebration[]> {
    const celebrations: Celebration[] = [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get recent achievements
    const achievements = await prisma.gamification_achievements.findMany({
      where: {
        user_id: studentId,
        achieved_at: { gte: thirtyDaysAgo },
      },
      orderBy: { achieved_at: 'desc' },
      take: 5,
    });

    for (const achievement of achievements) {
      celebrations.push({
        type: 'achievement',
        title: achievement.achievement_name || 'Achievement Unlocked',
        description: achievement.description || 'Well done on reaching this milestone!',
        date: achievement.achieved_at,
      });
    }

    // Get recent badges
    const badges = await prisma.gamification_badges.findMany({
      where: {
        user_id: studentId,
        awarded_at: { gte: thirtyDaysAgo },
      },
      orderBy: { awarded_at: 'desc' },
      take: 5,
    });

    for (const badge of badges) {
      celebrations.push({
        type: 'badge',
        title: badge.badge_name || 'Badge Earned',
        description: badge.description || 'Fantastic work!',
        date: badge.awarded_at,
      });
    }

    // Sort by date descending
    celebrations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return celebrations.slice(0, 5);
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

    // Get tenant names in one query
    const tenantIds = [...new Set(students.map(s => s.tenant_id))];
    const tenants = await prisma.tenants.findMany({
      where: { id: { in: tenantIds } },
      select: { id: true, name: true },
    });
    const tenantMap = new Map(tenants.map(t => [t.id, t.name]));

    // Get EHCP counts by tenant
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const schoolMap = new Map<number, SchoolSummary>();

    for (const student of students) {
      if (!schoolMap.has(student.tenant_id)) {
        // Count EHCPs due for this tenant
        const ehcpsDue = await prisma.ehcps.count({
          where: {
            tenant_id: student.tenant_id,
            next_review_date: { lte: thirtyDaysFromNow },
          },
        });

        schoolMap.set(student.tenant_id, {
          school_name: tenantMap.get(student.tenant_id) || 'Unknown School',
          tenant_id: student.tenant_id,
          total_assigned_students: 0,
          urgent_cases: 0,
          ehcps_due: ehcpsDue,
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
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    // Get EHCPs due for review
    const ehcpsDue = await prisma.ehcps.findMany({
      where: {
        student_id: { in: studentIds },
        next_review_date: { lte: thirtyDaysFromNow },
      },
      include: {
        student: {
          select: { first_name: true, last_name: true, tenant_id: true },
        },
      },
    });

    // Get tenant names
    const tenantIds = [...new Set(ehcpsDue.map(e => e.student.tenant_id))];
    const tenants = await prisma.tenants.findMany({
      where: { id: { in: tenantIds } },
      select: { id: true, name: true },
    });
    const tenantMap = new Map(tenants.map(t => [t.id, t.name]));

    const due_for_review: EHCPReview[] = ehcpsDue.map(ehcp => ({
      student_id: ehcp.student_id,
      student_name: `${ehcp.student.first_name} ${ehcp.student.last_name}`,
      school_name: tenantMap.get(ehcp.student.tenant_id) || 'Unknown School',
      review_due_date: ehcp.next_review_date || new Date(),
      days_until_due: Math.ceil((new Date(ehcp.next_review_date || new Date()).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      progress_summary: ehcp.progress_summary || 'No progress summary available',
    }));

    // Get new EHCP requests (applications submitted in last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const newRequests = await prisma.ehcps.findMany({
      where: {
        student_id: { in: studentIds },
        status: { in: ['submitted', 'under_review'] },
        created_at: { gte: ninetyDaysAgo },
      },
      include: {
        student: {
          select: { first_name: true, last_name: true, tenant_id: true },
        },
      },
    });

    const new_requests: EHCPRequest[] = newRequests.map(ehcp => ({
      student_id: ehcp.student_id,
      student_name: `${ehcp.student.first_name} ${ehcp.student.last_name}`,
      school_name: tenantMap.get(ehcp.student.tenant_id) || 'Unknown School',
      requested_date: ehcp.created_at,
      current_status: ehcp.status,
    }));

    // Get pending assessments
    const pendingAssessments = await prisma.assessments.findMany({
      where: {
        student_id: { in: studentIds },
        status: { in: ['scheduled', 'in_progress'] },
      },
      include: {
        student: {
          select: { first_name: true, last_name: true, tenant_id: true },
        },
      },
    });

    const assessments_pending: AssessmentPending[] = pendingAssessments.map(assessment => ({
      student_id: assessment.student_id,
      student_name: `${assessment.student.first_name} ${assessment.student.last_name}`,
      school_name: tenantMap.get(assessment.student.tenant_id) || 'Unknown School',
      assessment_type: assessment.assessment_type,
      requested_date: assessment.created_at,
    }));

    return {
      due_for_review,
      new_requests,
      assessments_pending,
    };
  }

  /**
   * Get cross-school trends for EP analysis
   */
  private static async getCrossSchoolTrends(studentIds: number[]): Promise<TrendData> {
    // Get intervention effectiveness data
    const interventions = await prisma.interventions.findMany({
      where: {
        student_id: { in: studentIds },
        status: 'completed',
      },
      select: {
        intervention_type: true,
        effectiveness_rating: true,
      },
    });

    // Group by intervention type and calculate average effectiveness
    const effectivenessMap = new Map<string, { total: number; count: number }>();
    for (const intervention of interventions) {
      const type = intervention.intervention_type || 'Unknown';
      const rating = intervention.effectiveness_rating || 0;
      if (!effectivenessMap.has(type)) {
        effectivenessMap.set(type, { total: 0, count: 0 });
      }
      const data = effectivenessMap.get(type)!;
      data.total += rating;
      data.count++;
    }

    const intervention_effectiveness = Array.from(effectivenessMap.entries())
      .map(([type, data]) => ({
        type,
        effectiveness: data.count > 0 ? data.total / data.count : 0,
      }))
      .sort((a, b) => b.effectiveness - a.effectiveness)
      .slice(0, 10);

    // Get common struggle areas from student profiles
    const profiles = await prisma.studentProfile.findMany({
      where: {
        student_id: { in: studentIds },
      },
      select: {
        current_struggles: true,
      },
    });

    const struggleMap = new Map<string, number>();
    for (const profile of profiles) {
      const struggles = profile.current_struggles as string[] || [];
      for (const struggle of struggles) {
        struggleMap.set(struggle, (struggleMap.get(struggle) || 0) + 1);
      }
    }

    const common_struggle_areas = Array.from(struggleMap.entries())
      .map(([area, count]) => ({ area, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate attendance correlation with intervention needs
    // (This would require attendance data integration - returning placeholder for now)
    const attendance_correlation = 0.65; // Typical correlation value

    return {
      intervention_effectiveness,
      common_struggle_areas,
      attendance_correlation,
    };
  }

  /**
   * Log data access for GDPR compliance
   * Uses AuditLog table for enterprise-grade audit trail
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
      await prisma.auditLog.create({
        data: {
          tenant_id: data.tenant_id,
          user_id_int: data.user_id,
          action: 'DATA_ACCESS',
          resource: data.accessed_entity,
          entityType: data.accessed_entity,
          entityId: data.entity_id,
          description: `${data.access_type} access to ${data.accessed_entity}`,
          details: {
            access_type: data.access_type,
            student_ids: data.student_ids,
            timestamp: new Date().toISOString(),
          },
          metadata: {
            gdpr_relevant: true,
            data_subject_count: data.student_ids.length,
          },
        },
      });
      logger.info(`Data access logged: ${data.access_type} by user ${data.user_id}`);
    } catch (_error) {
      logger.error('Error logging data access:', _error as Error);
      // Don't throw - logging failure shouldn't break the flow
    }
  }

  // ============================================================================
  // ADDITIONAL HELPER METHODS
  // ============================================================================

  /**
   * Get teacher messages for parent portal
   */
  private static async getTeacherMessages(
    childId: number,
    parentId: number
  ): Promise<Message[]> {
    const messages = await prisma.parentTeacherMessage.findMany({
      where: {
        OR: [
          { student_id: childId, recipient_id: parentId },
          { student_id: childId, sender_id: parentId },
        ],
      },
      orderBy: { created_at: 'desc' },
      take: 20,
      include: {
        sender: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    return messages.map((msg) => ({
      id: msg.id,
      from: msg.sender ? `${msg.sender.firstName} ${msg.sender.lastName}` : 'Unknown',
      message: msg.message_content,
      created_at: msg.created_at,
      read: msg.read_at !== null,
    }));
  }

  /**
   * Get child's class name from class roster
   */
  private static async getChildClassName(childId: number): Promise<string | null> {
    const roster = await prisma.classRoster.findFirst({
      where: {
        OR: [
          { urgent_students: { has: childId } },
          { needs_support: { has: childId } },
          { on_track: { has: childId } },
          { exceeding: { has: childId } },
        ],
      },
      select: { class_name: true },
    });
    return roster?.class_name || null;
  }

  /**
   * Get academic progress trends for head teacher view
   */
  private static async getAcademicProgressTrends(tenantId: number): Promise<Record<string, unknown>> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const progressSnapshots = await prisma.studentProgressSnapshot.findMany({
      where: {
        tenant_id: tenantId,
        snapshot_date: { gte: thirtyDaysAgo },
      },
      select: {
        average_success_rate: true,
        engagement_score: true,
        snapshot_date: true,
      },
      orderBy: { snapshot_date: 'asc' },
    });

    // Calculate weekly averages
    const weeklyData: Record<string, { success: number[]; engagement: number[] }> = {};
    for (const snapshot of progressSnapshots) {
      const week = this.getWeekKey(snapshot.snapshot_date);
      if (!weeklyData[week]) {
        weeklyData[week] = { success: [], engagement: [] };
      }
      if (snapshot.average_success_rate) {
        weeklyData[week].success.push(snapshot.average_success_rate);
      }
      if (snapshot.engagement_score) {
        weeklyData[week].engagement.push(snapshot.engagement_score);
      }
    }

    const trends = Object.entries(weeklyData).map(([week, data]) => ({
      week,
      avg_success_rate: data.success.length > 0 
        ? data.success.reduce((a, b) => a + b, 0) / data.success.length 
        : 0,
      avg_engagement: data.engagement.length > 0 
        ? data.engagement.reduce((a, b) => a + b, 0) / data.engagement.length 
        : 0,
    }));

    return {
      trends,
      overall_improvement: trends.length >= 2 
        ? trends[trends.length - 1].avg_success_rate - trends[0].avg_success_rate 
        : 0,
    };
  }

  /**
   * Get behavioural incidents trends for head teacher view
   */
  private static async getBehaviouralIncidentsTrends(tenantId: number): Promise<Record<string, unknown>> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get cases that might be behavioural incidents
    const incidents = await prisma.cases.findMany({
      where: {
        tenant_id: tenantId,
        case_type: { contains: 'behavio' }, // Matches both behaviour and behavioral
        created_at: { gte: thirtyDaysAgo },
      },
      select: {
        created_at: true,
        status: true,
        priority: true,
      },
    });

    // Group by week
    const weeklyIncidents: Record<string, number> = {};
    for (const incident of incidents) {
      const week = this.getWeekKey(incident.created_at);
      weeklyIncidents[week] = (weeklyIncidents[week] || 0) + 1;
    }

    return {
      total_incidents: incidents.length,
      weekly_breakdown: Object.entries(weeklyIncidents).map(([week, count]) => ({ week, count })),
      resolved_count: incidents.filter(i => i.status === 'resolved').length,
      high_priority_count: incidents.filter(i => i.priority === 'high' || i.priority === 'urgent').length,
    };
  }

  /**
   * Get attendance trends for head teacher view
   */
  private static async getAttendanceTrends(tenantId: number): Promise<Record<string, unknown>> {
    // Get student profiles with engagement data as proxy for attendance
    const profiles = await prisma.studentProfile.findMany({
      where: { tenant_id: tenantId },
      select: {
        engagement_score: true,
        updated_at: true,
      },
    });

    const avgEngagement = profiles.length > 0
      ? profiles.reduce((sum, p) => sum + (p.engagement_score || 0), 0) / profiles.length
      : 0;

    return {
      average_engagement: avgEngagement,
      students_monitored: profiles.length,
      concern_threshold: 0.6,
      students_below_threshold: profiles.filter(p => (p.engagement_score || 0) < 0.6).length,
    };
  }

  /**
   * Get week key for grouping data
   */
  private static getWeekKey(date: Date): string {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().split('T')[0];
  }

  // ============================================================================
  // NOTIFICATION HELPER METHODS
  // ============================================================================

  /**
   * Notify teacher of student progress update
   */
  private static async notifyTeacher(
    tenantId: number,
    studentId: number,
    updateType: string
  ): Promise<void> {
    try {
      // Find the class roster containing this student
      const roster = await prisma.classRoster.findFirst({
        where: {
          tenant_id: tenantId,
          OR: [
            { urgent_students: { has: studentId } },
            { needs_support: { has: studentId } },
            { on_track: { has: studentId } },
            { exceeding: { has: studentId } },
          ],
        },
        select: { teacher_id: true },
      });

      if (roster?.teacher_id) {
        // Create automated action for teacher notification
        await prisma.automatedAction.create({
          data: {
            tenant_id: tenantId,
            action_type: 'teacher_notified',
            trigger_type: 'progress_update',
            action_data: {
              student_id: studentId,
              update_type: updateType,
              teacher_id: roster.teacher_id,
              timestamp: new Date().toISOString(),
            },
            requires_approval: false,
          },
        });
        logger.info(`Teacher ${roster.teacher_id} notified about student ${studentId}`);
      }
    } catch (error) {
      logger.error('Error notifying teacher:', error as Error);
    }
  }

  /**
   * Queue parent notification for student progress
   */
  private static async queueParentNotification(
    parentId: number,
    studentId: number,
    updateType: string
  ): Promise<void> {
    try {
      // Get student's tenant
      const student = await prisma.students.findUnique({
        where: { id: studentId },
        select: { tenant_id: true, first_name: true, last_name: true },
      });

      if (!student) return;

      // Create automated action for parent notification
      await prisma.automatedAction.create({
        data: {
          tenant_id: student.tenant_id,
          action_type: 'parent_notified',
          trigger_type: 'progress_update',
          action_data: {
            parent_id: parentId,
            student_id: studentId,
            student_name: `${student.first_name} ${student.last_name}`,
            update_type: updateType,
            timestamp: new Date().toISOString(),
            notification_channel: 'app',
          },
          requires_approval: false,
        },
      });
    } catch (error) {
      logger.error('Error queuing parent notification:', error as Error);
    }
  }

  /**
   * Notify assigned Educational Psychologist about urgent student
   */
  private static async notifyAssignedEP(
    studentId: number,
    updateType: string
  ): Promise<void> {
    try {
      // Find EP with access to this student
      const epAccess = await prisma.multiAgencyAccess.findFirst({
        where: {
          role_type: 'ep',
          accessible_student_ids: { has: studentId },
        },
        select: { user_id: true, tenant_id: true },
      });

      if (!epAccess) {
        logger.info(`No EP assigned to student ${studentId}`);
        return;
      }

      // Get student details
      const student = await prisma.students.findUnique({
        where: { id: studentId },
        select: { first_name: true, last_name: true },
      });

      // Create automated action for EP notification
      await prisma.automatedAction.create({
        data: {
          tenant_id: epAccess.tenant_id,
          action_type: 'ep_notified',
          trigger_type: 'urgent_intervention',
          action_data: {
            ep_user_id: epAccess.user_id,
            student_id: studentId,
            student_name: student ? `${student.first_name} ${student.last_name}` : 'Unknown',
            update_type: updateType,
            urgency: 'urgent',
            timestamp: new Date().toISOString(),
          },
          requires_approval: false,
        },
      });

      logger.info(`EP ${epAccess.user_id} notified about urgent student ${studentId}`);
    } catch (error) {
      logger.error('Error notifying EP:', error as Error);
    }
  }
}

// Export singleton instance for use in API routes
export const dataRouterService = new DataRouterService();
