/**
 * FILE: src/app/api/class/[id]/students/route.ts
 * PURPOSE: Full student list management for class with auto-built profiles
 *
 * This route provides comprehensive access to all students in a class with their
 * auto-built profiles, sorted by urgency for immediate teacher action.
 *
 * Features:
 * - Full student roster with profiles
 * - Urgency-based sorting (urgent → needs support → on track → exceeding)
 * - Recent activity summaries
 * - Class-wide statistical analysis
 * - Voice query optimization
 *
 * @route GET /api/class/[id]/students - List all students with profiles
 */

import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/auth-service';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Student urgency levels for prioritization
 */
type UrgencyLevel = 'urgent' | 'needs_support' | 'on_track' | 'exceeding';

/**
 * Student summary with profile data
 */
interface StudentSummary {
  studentId: string;
  name: string;
  urgencyLevel: UrgencyLevel;
  urgencyReasons: string[];
  hasEhcp: boolean;
  primarySendNeed: string | null;
  profileConfidence: number;
  learningStyle: string | null;
  currentReadingLevel: string | null;
  currentMathLevel: string | null;
  recentActivity: {
    lastAssessmentDate: Date | null;
    lastLessonDate: Date | null;
    lastInterventionDate: Date | null;
    pendingAssignments: number;
    overdueAssignments: number;
  };
  performanceIndicators: {
    averageSuccessRate: number;
    strugglingSubjects: string[];
    excellingSubjects: string[];
  };
  actionableInsights: string[];
}

interface ClassStudentsResponse {
  classId: string;
  className: string;
  totalStudents: number;
  students: StudentSummary[];
  classWideStats: {
    urgencyBreakdown: Record<UrgencyLevel, number>;
    averageProfileConfidence: number;
    studentsWithEhcp: number;
    averageSuccessRate: number;
    mostCommonSendNeed: string | null;
    studentsNeedingImmediateAction: number;
  };
  lastUpdated: Date;
}

/**
 * Determines urgency level based on student data
 */
function calculateUrgencyLevel(studentData: {
  successRate: number;
  overdueAssignments: number;
  hasEhcp: boolean;
  strugglingSubjects: number;
  lastAssessmentDays: number | null;
}): { level: UrgencyLevel; reasons: string[] } {
  const reasons: string[] = [];
  let urgencyScore = 0;

  // High urgency factors
  if (studentData.overdueAssignments > 0) {
    reasons.push(`${studentData.overdueAssignments} overdue assignment(s)`);
    urgencyScore += 3;
  }

  if (studentData.successRate < 50 && studentData.successRate > 0) {
    reasons.push(`Low success rate (${studentData.successRate}%)`);
    urgencyScore += 3;
  }

  if (studentData.strugglingSubjects >= 2) {
    reasons.push(`Struggling in ${studentData.strugglingSubjects} subject(s)`);
    urgencyScore += 2;
  }

  if (studentData.lastAssessmentDays !== null && studentData.lastAssessmentDays > 30) {
    reasons.push(`No assessment in ${studentData.lastAssessmentDays} days`);
    urgencyScore += 1;
  }

  // EHCP students need regular monitoring
  if (studentData.hasEhcp && urgencyScore > 0) {
    reasons.push('EHCP - requires immediate attention');
    urgencyScore += 1;
  }

  // Positive factors
  if (studentData.successRate >= 85) {
    reasons.push(`Excellent performance (${studentData.successRate}%)`);
  }

  // Determine level
  if (urgencyScore >= 5) {
    return { level: 'urgent', reasons };
  } else if (urgencyScore >= 3) {
    return { level: 'needs_support', reasons };
  } else if (studentData.successRate >= 85) {
    return { level: 'exceeding', reasons };
  } else {
    return { level: 'on_track', reasons };
  }
}

/**
 * GET /api/class/[id]/students
 *
 * Retrieves complete student list for class with auto-built profiles,
 * sorted by urgency for immediate teacher action.
 *
 * @param request - Next.js request object
 * @param params - Route parameters containing class roster ID
 * @returns Full student roster with profiles and class statistics
 *
 * @example
 * curl -X GET \
 *   http://localhost:3000/api/class/class_123/students \
 *   -H "Authorization: Bearer {token}"
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ClassStudentsResponse | { error: string; message?: string }>> {
  try {
    // Authentication
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      console.warn('[Class Students API] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: classId } = params;
    const tenantId = session.tenant_id;
    const userId = session.user_id;

    console.log(`[Class Students API] GET request - Class: ${classId}, User: ${userId}, Tenant: ${tenantId}`);

    // Verify class roster belongs to tenant
    const classRoster = await prisma.classRoster.findFirst({
      where: {
        id: classId,
        tenant_id: tenantId,
      },
      select: {
        id: true,
        class_name: true,
        urgent_students: true,
        needs_support: true,
        on_track: true,
        exceeding: true,
      },
    });

    if (!classRoster) {
      console.warn(`[Class Students API] Class roster not found - Class: ${classId}, Tenant: ${tenantId}`);
      return NextResponse.json({
        error: 'Class roster not found or access denied'
      }, { status: 404 });
    }

    // Aggregate student IDs from all arrays
    const studentIds = [
      ...classRoster.urgent_students,
      ...classRoster.needs_support,
      ...classRoster.on_track,
      ...classRoster.exceeding
    ];

    console.log(`[Class Students API] Processing ${studentIds.length} students in class: ${classRoster.class_name}`);

    // Fetch students and their associated data
    const [students, profiles, assessments, lessons, cases, interventions] = await Promise.all([
      prisma.students.findMany({
        where: { id: { in: studentIds } },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          sen_status: true,
          year_group: true,
        },
      }),
      prisma.studentProfile.findMany({
        where: { student_id: { in: studentIds } },
      }),
      prisma.assessments.findMany({
        where: { cases: { student_id: { in: studentIds } } },
        orderBy: { created_at: 'desc' },
        include: { cases: true },
      }),
      prisma.studentLessonAssignment.findMany({
        where: { student_id: { in: studentIds } },
        orderBy: { assigned_at: 'desc' },
        include: { lesson_plan: true },
      }),
      prisma.cases.findMany({
        where: { student_id: { in: studentIds } },
        select: { id: true, student_id: true },
      }),
      prisma.interventions.findMany({
        where: {
          cases: {
            student_id: { in: studentIds }
          }
        },
        orderBy: { start_date: 'desc' },
        include: {
          cases: {
            select: { student_id: true }
          }
        }
      }),
    ]);

    // Create lookup maps
    const profileMap = new Map(profiles.map(p => [p.student_id, p]));
    const assessmentsByStudent = new Map<number, any[]>();
    const lessonsByStudent = new Map<number, any[]>();
    const interventionsByStudent = new Map<number, any[]>();

    // Map assessments by converting string IDs back to numbers for lookup
    assessments.forEach(a => {
      const studentIdNum = a.cases.student_id;
      if (!assessmentsByStudent.has(studentIdNum)) {
        assessmentsByStudent.set(studentIdNum, []);
      }
      assessmentsByStudent.get(studentIdNum)!.push(a);
    });

    lessons.forEach(l => {
      if (!lessonsByStudent.has(l.student_id)) {
        lessonsByStudent.set(l.student_id, []);
      }
      lessonsByStudent.get(l.student_id)!.push(l);
    });

    // Map interventions by student through case relationship
    interventions.forEach(i => {
      const studentIdNum = i.cases.student_id;
      if (!interventionsByStudent.has(studentIdNum)) {
        interventionsByStudent.set(studentIdNum, []);
      }
      interventionsByStudent.get(studentIdNum)!.push(i);
    });

    // Build student summaries
    const studentSummaries: StudentSummary[] = [];
    const now = new Date();

    for (const student of students) {
      const studentId = student.id;
      const profile = profileMap.get(studentId);
      const studentAssessments = assessmentsByStudent.get(studentId) || [];
      const studentLessons = lessonsByStudent.get(studentId) || [];
      const studentInterventions = interventionsByStudent.get(studentId) || [];

      // Calculate recent activity
      const lastAssessment = studentAssessments[0];
      const lastLesson = studentLessons[0];
      const lastIntervention = studentInterventions[0];

      const pendingAssignments = studentLessons.filter(
        l => l.status !== 'completed'
      ).length;

      const overdueAssignments = studentLessons.filter(
        l => l.completed_at === null && l.assigned_at && new Date(l.assigned_at) < new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // Overdue if not completed and assigned >7 days ago
      ).length;

      // Calculate performance indicators
      const completedLessons = studentLessons.filter(l => l.success_rate !== null);
      const averageSuccessRate = completedLessons.length > 0
        ? completedLessons.reduce((sum, l) => sum + (l.success_rate || 0), 0) / completedLessons.length
        : 0;

      // Analyze struggling/excelling subjects
      const subjectPerformance = new Map<string, number[]>();
      completedLessons.forEach(lesson => {
        const subject = lesson.lesson_plan?.subject || 'Unknown';
        if (!subjectPerformance.has(subject)) {
          subjectPerformance.set(subject, []);
        }
        subjectPerformance.get(subject)!.push(lesson.success_rate || 0);
      });

      const strugglingSubjects: string[] = [];
      const excellingSubjects: string[] = [];

      subjectPerformance.forEach((rates, subject) => {
        const avgRate = rates.reduce((sum, r) => sum + r, 0) / rates.length;
        if (avgRate < 60) {
          strugglingSubjects.push(subject);
        } else if (avgRate >= 85) {
          excellingSubjects.push(subject);
        }
      });

      // Calculate days since last assessment
      const lastAssessmentDays = lastAssessment && lastAssessment.created_at
        ? Math.floor((now.getTime() - new Date(lastAssessment.created_at).getTime()) / (1000 * 60 * 60 * 24))
        : null;

      // Determine urgency level
      const hasEhcp = student.sen_status?.toUpperCase().includes('EHCP') || false;
      const { level: urgencyLevel, reasons: urgencyReasons } = calculateUrgencyLevel({
        successRate: averageSuccessRate,
        overdueAssignments,
        hasEhcp,
        strugglingSubjects: strugglingSubjects.length,
        lastAssessmentDays,
      });

      // Generate actionable insights
      const actionableInsights: string[] = [];
      if (overdueAssignments > 0) {
        actionableInsights.push(`Follow up on ${overdueAssignments} overdue assignment(s)`);
      }
      if (strugglingSubjects.length > 0) {
        actionableInsights.push(`Consider intervention for ${strugglingSubjects.join(', ')}`);
      }
      if (profile && profile.profile_confidence < 0.3) {
        actionableInsights.push('Profile confidence low - needs more assessment data');
      }
      if (lastAssessmentDays && lastAssessmentDays > 30) {
        actionableInsights.push('Schedule new assessment to update profile');
      }
      if (excellingSubjects.length > 0) {
        actionableInsights.push(`Excelling in ${excellingSubjects.join(', ')} - consider extension activities`);
      }

      // Get learning style data
      const learningProfile = profile?.learning_style as any || {};

      studentSummaries.push({
        studentId: student.id.toString(),
        name: `${student.first_name} ${student.last_name}`,
        urgencyLevel,
        urgencyReasons,
        hasEhcp,
        primarySendNeed: student.sen_status,
        profileConfidence: profile?.profile_confidence || 0,
        learningStyle: learningProfile.primaryLearningStyle || null,
        currentReadingLevel: learningProfile.readingLevel || null,
        currentMathLevel: learningProfile.mathLevel || null,
        recentActivity: {
          lastAssessmentDate: lastAssessment?.created_at || null,
          lastLessonDate: lastLesson?.assigned_at || null,
          lastInterventionDate: lastIntervention?.start_date || null,
          pendingAssignments,
          overdueAssignments,
        },
        performanceIndicators: {
          averageSuccessRate: Math.round(averageSuccessRate * 100) / 100,
          strugglingSubjects,
          excellingSubjects,
        },
        actionableInsights,
      });
    }

    // Sort by urgency (urgent first, then needs_support, on_track, exceeding)
    const urgencyOrder: Record<UrgencyLevel, number> = {
      urgent: 0,
      needs_support: 1,
      on_track: 2,
      exceeding: 3,
    };

    studentSummaries.sort((a, b) => urgencyOrder[a.urgencyLevel] - urgencyOrder[b.urgencyLevel]);

    // Calculate class-wide statistics
    const urgencyBreakdown: Record<UrgencyLevel, number> = {
      urgent: studentSummaries.filter(s => s.urgencyLevel === 'urgent').length,
      needs_support: studentSummaries.filter(s => s.urgencyLevel === 'needs_support').length,
      on_track: studentSummaries.filter(s => s.urgencyLevel === 'on_track').length,
      exceeding: studentSummaries.filter(s => s.urgencyLevel === 'exceeding').length,
    };

    const averageProfileConfidence = studentSummaries.length > 0
      ? studentSummaries.reduce((sum, s) => sum + s.profileConfidence, 0) / studentSummaries.length
      : 0;

    const studentsWithEhcp = studentSummaries.filter(s => s.hasEhcp).length;

    const averageSuccessRate = studentSummaries.length > 0
      ? studentSummaries.reduce((sum, s) => sum + s.performanceIndicators.averageSuccessRate, 0) / studentSummaries.length
      : 0;

    // Find most common SEND need
    const sendNeedCounts = new Map<string, number>();
    studentSummaries.forEach(s => {
      if (s.primarySendNeed) {
        sendNeedCounts.set(s.primarySendNeed, (sendNeedCounts.get(s.primarySendNeed) || 0) + 1);
      }
    });

    const mostCommonSendNeed = sendNeedCounts.size > 0
      ? Array.from(sendNeedCounts.entries()).sort((a, b) => b[1] - a[1])[0][0]
      : null;

    const studentsNeedingImmediateAction = urgencyBreakdown.urgent + urgencyBreakdown.needs_support;

    // Build response
    const response: ClassStudentsResponse = {
      classId: classRoster.id,
      className: classRoster.class_name,
      totalStudents: studentSummaries.length,
      students: studentSummaries,
      classWideStats: {
        urgencyBreakdown,
        averageProfileConfidence: Math.round(averageProfileConfidence * 100) / 100,
        studentsWithEhcp,
        averageSuccessRate: Math.round(averageSuccessRate * 100) / 100,
        mostCommonSendNeed,
        studentsNeedingImmediateAction,
      },
      lastUpdated: new Date(),
    };

    // Log data access for GDPR audit trail
    await prisma.auditLog.create({
      data: {
        userId: userId,
        tenantId: tenantId,
        action: 'class_students_view',
        resource: 'class_roster',
        details: {
          description: `Class roster with ${studentSummaries.length} student profiles`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      },
    });

    console.log(`[Class Students API] Retrieved ${studentSummaries.length} students - Urgent: ${urgencyBreakdown.urgent}, Needs Support: ${urgencyBreakdown.needs_support}`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Class Students API] Error retrieving students:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
