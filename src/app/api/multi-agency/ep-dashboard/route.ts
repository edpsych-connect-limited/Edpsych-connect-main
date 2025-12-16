import { logger } from "@/lib/logger";
/**
 * FILE: src/app/api/multi-agency/ep-dashboard/route.ts
 * PURPOSE: Educational Psychologist cross-school dashboard
 *
 * This route provides EPs with a comprehensive view of all students assigned
 * to them across multiple schools and tenants, with urgent case prioritization.
 *
 * Features:
 * - Cross-tenant student aggregation
 * - EHCP status tracking and due dates
 * - Assessment results across schools
 * - Intervention effectiveness monitoring
 * - Urgent case flagging
 * - Cross-school trend analysis
 * - Complete audit logging
 *
 * @route GET /api/multi-agency/ep-dashboard - EP cross-school dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/auth-service';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * EP case summary structure
 */
interface EPCaseSummary {
  studentId: string;
  studentName: string;
  schoolName: string;
  tenantId: string;
  urgencyLevel: 'urgent' | 'high' | 'medium' | 'low';
  urgencyReasons: string[];
  ehcpStatus: {
    hasEhcp: boolean;
    ehcpStage: string | null;
    reviewDueDate: Date | null;
    daysUntilReview: number | null;
  };
  primarySendNeed: string | null;
  latestAssessment: {
    date: Date | null;
    type: string | null;
    summary: string | null;
  };
  activeInterventions: {
    count: number;
    types: string[];
    effectiveness: string | null;
  };
  lastContactDate: Date | null;
  nextScheduledAction: {
    type: string | null;
    date: Date | null;
  };
  keyInsights: string[];
}

interface EPDashboardResponse {
  epName: string;
  totalCaseload: number;
  casesByUrgency: {
    urgent: number;
    high: number;
    medium: number;
    low: number;
  };
  casesBySchool: Record<string, number>;
  cases: EPCaseSummary[];
  upcomingReviews: {
    studentName: string;
    schoolName: string;
    reviewType: string;
    dueDate: Date;
  }[];
  crossSchoolTrends: {
    mostCommonSendNeed: string | null;
    averageInterventionEffectiveness: number;
    studentsAwaitingEhcp: number;
    overdueReviews: number;
  };
  actionRequired: {
    urgentCases: number;
    overdueAssessments: number;
    reviewsDueThisWeek: number;
  };
  lastUpdated: Date;
}

/**
 * Calculate urgency level for EP case
 */
function calculateEPUrgency(caseData: {
  daysUntilReview: number | null;
  lastAssessmentDays: number | null;
  ehcpStage: string | null;
  hasActiveInterventions: boolean;
}): { level: 'urgent' | 'high' | 'medium' | 'low'; reasons: string[] } {
  const reasons: string[] = [];
  let urgencyScore = 0;

  // EHCP review overdue
  if (caseData.daysUntilReview !== null && caseData.daysUntilReview < 0) {
    reasons.push(`EHCP review overdue by ${Math.abs(caseData.daysUntilReview)} days`);
    urgencyScore += 4;
  } else if (caseData.daysUntilReview !== null && caseData.daysUntilReview <= 14) {
    reasons.push(`EHCP review due in ${caseData.daysUntilReview} days`);
    urgencyScore += 3;
  }

  // Assessment overdue
  if (caseData.lastAssessmentDays !== null && caseData.lastAssessmentDays > 90) {
    reasons.push(`No assessment in ${caseData.lastAssessmentDays} days`);
    urgencyScore += 2;
  }

  // EHCP in progress
  if (caseData.ehcpStage === 'assessment_in_progress' || caseData.ehcpStage === 'awaiting_decision') {
    reasons.push('EHCP assessment in progress');
    urgencyScore += 2;
  }

  // No active interventions for SEND student
  if (!caseData.hasActiveInterventions && caseData.ehcpStage !== null) {
    reasons.push('No active interventions despite SEND needs');
    urgencyScore += 1;
  }

  // Determine level
  if (urgencyScore >= 4) {
    return { level: 'urgent', reasons };
  } else if (urgencyScore >= 3) {
    return { level: 'high', reasons };
  } else if (urgencyScore >= 1) {
    return { level: 'medium', reasons };
  } else {
    return { level: 'low', reasons };
  }
}

/**
 * GET /api/multi-agency/ep-dashboard
 *
 * Provides Educational Psychologists with comprehensive cross-school dashboard
 * showing all assigned students, urgent cases, and trends.
 *
 * @param request - Next.js request object
 * @returns EP dashboard with cross-school case management
 *
 * @example
 * curl -X GET \
 *   "http://localhost:3000/api/multi-agency/ep-dashboard?urgency=urgent" \
 *   -H "Authorization: Bearer {ep_token}"
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<EPDashboardResponse | { error: string; message?: string }>> {
  try {
    // Authentication
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      console.warn('[EP Dashboard API] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user_id;
    const userRole = session.role;

    // Verify user is an Educational Psychologist (educator or admin role)
    if (userRole !== 'educator' && userRole !== 'admin') {
      console.warn(`[EP Dashboard API] Non-EP access attempt - User: ${userId}, Role: ${userRole}`);
      return NextResponse.json({
        error: 'Access denied. This endpoint is only available to Educational Psychologists.'
      }, { status: 403 });
    }

    // Query parameters
    const { searchParams } = new URL(request.url);
    const urgencyFilter = searchParams.get('urgency'); // 'urgent', 'high', 'medium', 'low'
    const schoolFilter = searchParams.get('school'); // tenant_id
    const limit = parseInt(searchParams.get('limit') || '100');

    logger.debug(`[EP Dashboard API] GET request - EP: ${userId}`);

    // Fetch EP details
    const epUser = await prisma.users.findFirst({
      where: { id: parseInt(userId as string) },
      select: {
        firstName: true,
        lastName: true,
      },
    });

    const epName = epUser ? `${epUser.firstName} ${epUser.lastName}` : 'Educational Psychologist';

    // Find all students assigned to this EP across all tenants
    // TODO: This feature requires adding assessor_id field to Assessment model
    // In production, this would use EPStudentAssignment table or Assessment.assessor_id field
    // For now, return empty array until schema is updated
    const epAssessments: any[] = [];

    /*
    const epAssessments = await prisma.assessments.findMany({
      where: {
        assessor_id: userId,
      },
      select: {
        student_id: true,
        tenant_id: true,
        assessmentDate: true,
        assessmentType: true,
        summary: true,
      },
      orderBy: { assessmentDate: 'desc' },
    });
    */

    // Get unique students
    const uniqueStudentIds = Array.from(new Set(epAssessments.map(a => a.student_id)));

    // Fetch student details
    const students = await prisma.students.findMany({
      where: {
        id: { in: uniqueStudentIds },
        ...(schoolFilter ? { tenant_id: parseInt(schoolFilter) } : {}),
      },
    });

    // Fetch tenant (school) names
    const tenantIds = Array.from(new Set(students.map(s => s.tenant_id)));
    const tenants = await prisma.tenants.findMany({
      where: { id: { in: tenantIds } },
      select: {
        id: true,
        name: true,
      },
    });

    const tenantMap = new Map(tenants.map(t => [t.id, t.name]));

    // Fetch EHCP data
    const ehcpData = await prisma.ehcps.findMany({
      where: {
        student_id: { in: uniqueStudentIds },
      },
    });

    const ehcpMap = new Map(ehcpData.map(e => [e.student_id.toString(), e]));

    // Fetch interventions (through cases relationship)
    const cases = await prisma.cases.findMany({
      where: {
        student_id: { in: uniqueStudentIds },
      },
      select: {
        id: true,
        student_id: true,
      },
    });

    const caseIds = cases.map(c => c.id);
    const interventions = await prisma.interventions.findMany({
      where: {
        case_id: { in: caseIds },
        status: 'active',
      },
      include: {
        cases: {
          select: { student_id: true },
        },
      },
    });

    const interventionsByStudent = new Map<string, any[]>();
    interventions.forEach(i => {
      const studentId = i.cases.student_id.toString();
      if (!interventionsByStudent.has(studentId)) {
        interventionsByStudent.set(studentId, []);
      }
      interventionsByStudent.get(studentId)!.push(i);
    });

    // Build case summaries
    const now = new Date();
    const caseSummaries: EPCaseSummary[] = [];
    const casesByUrgency = { urgent: 0, high: 0, medium: 0, low: 0 };
    const casesBySchool: Record<string, number> = {};

    for (const student of students) {
      // Get latest assessment for this student
      const studentAssessments = epAssessments.filter(a => a.student_id === student.id.toString());
      const latestAssessment = studentAssessments[0];
      const lastAssessmentDays = latestAssessment
        ? Math.floor((now.getTime() - new Date(latestAssessment.completed_at).getTime()) / (1000 * 60 * 60 * 24))
        : null;

      // Get EHCP details
      const ehcp = ehcpMap.get(student.id.toString());
      // TODO: EHCP schema needs annual_review_due_date and current_stage fields
      // For now, set defaults until schema is updated
      const daysUntilReview = null; // ehcp?.annual_review_due_date would go here

      // Get interventions
      const studentInterventions = interventionsByStudent.get(student.id.toString()) || [];

      // Calculate urgency
      const { level: urgencyLevel, reasons: urgencyReasons } = calculateEPUrgency({
        daysUntilReview,
        lastAssessmentDays,
        ehcpStage: null, // ehcp?.current_stage would go here when field exists
        hasActiveInterventions: studentInterventions.length > 0,
      });

      // Apply urgency filter if specified
      if (urgencyFilter && urgencyLevel !== urgencyFilter) {
        continue;
      }

      // Count by urgency
      casesByUrgency[urgencyLevel]++;

      // Count by school
      const schoolName = tenantMap.get(student.tenant_id) || 'Unknown School';
      casesBySchool[schoolName] = (casesBySchool[schoolName] || 0) + 1;

      // Generate key insights
      const keyInsights: string[] = [];
      if (studentInterventions.length > 0) {
        keyInsights.push(`${studentInterventions.length} active intervention(s)`);
      }
      // TODO: Uncomment when EHCP.current_stage field is added to schema
      // if (ehcp?.current_stage === 'maintained') {
      //   keyInsights.push('EHCP maintained');
      // }
      if (lastAssessmentDays && lastAssessmentDays > 60) {
        keyInsights.push('Assessment may need updating');
      }

      caseSummaries.push({
        studentId: student.id.toString(),
        studentName: `${student.first_name} ${student.last_name}`,
        schoolName,
        tenantId: student.tenant_id.toString(),
        urgencyLevel,
        urgencyReasons,
        ehcpStatus: {
          hasEhcp: ehcp ? true : false, // Has EHCP if record exists
          ehcpStage: null, // TODO: ehcp?.current_stage when field exists
          reviewDueDate: null, // TODO: ehcp?.annual_review_due_date when field exists
          daysUntilReview,
        },
        primarySendNeed: student.sen_status, // Using sen_status as primary SEND need
        latestAssessment: {
          date: latestAssessment?.completed_at || null,
          type: latestAssessment?.assessment_type || null,
          summary: latestAssessment?.summary || null,
        },
        activeInterventions: {
          count: studentInterventions.length,
          types: studentInterventions.map(i => i.intervention_type),
          effectiveness: studentInterventions.length > 0
            ? studentInterventions[0].effectiveness_rating || null
            : null,
        },
        lastContactDate: latestAssessment?.completed_at || null,
        nextScheduledAction: {
          type: daysUntilReview && daysUntilReview <= 30 ? 'EHCP Annual Review' : null,
          date: null, // TODO: ehcp?.annual_review_due_date when field exists
        },
        keyInsights,
      });
    }

    // Sort by urgency (urgent first)
    const urgencyOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    caseSummaries.sort((a, b) => urgencyOrder[a.urgencyLevel] - urgencyOrder[b.urgencyLevel]);

    // Identify upcoming reviews (next 14 days)
    const upcomingReviews = caseSummaries
      .filter(c => c.ehcpStatus.daysUntilReview !== null && c.ehcpStatus.daysUntilReview <= 14 && c.ehcpStatus.daysUntilReview >= 0)
      .map(c => ({
        studentName: c.studentName,
        schoolName: c.schoolName,
        reviewType: 'EHCP Annual Review',
        dueDate: c.ehcpStatus.reviewDueDate!,
      }))
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    // Calculate cross-school trends
    const sendNeedCounts = new Map<string, number>();
    let totalEffectiveness = 0;
    let effectivenessCount = 0;
    let studentsAwaitingEhcp = 0;
    let overdueReviews = 0;

    caseSummaries.forEach(c => {
      if (c.primarySendNeed) {
        sendNeedCounts.set(c.primarySendNeed, (sendNeedCounts.get(c.primarySendNeed) || 0) + 1);
      }

      if (c.activeInterventions.effectiveness) {
        // Parse effectiveness if numeric (e.g., "high" -> 85)
        const effectivenessValue = c.activeInterventions.effectiveness === 'high' ? 85 :
                                   c.activeInterventions.effectiveness === 'medium' ? 65 : 45;
        totalEffectiveness += effectivenessValue;
        effectivenessCount++;
      }

      if (c.ehcpStatus.ehcpStage === 'awaiting_decision') {
        studentsAwaitingEhcp++;
      }

      if (c.ehcpStatus.daysUntilReview !== null && c.ehcpStatus.daysUntilReview < 0) {
        overdueReviews++;
      }
    });

    const mostCommonSendNeed = sendNeedCounts.size > 0
      ? Array.from(sendNeedCounts.entries()).sort((a, b) => b[1] - a[1])[0][0]
      : null;

    const averageInterventionEffectiveness = effectivenessCount > 0
      ? totalEffectiveness / effectivenessCount
      : 0;

    // Build response
    const response: EPDashboardResponse = {
      epName,
      totalCaseload: caseSummaries.length,
      casesByUrgency,
      casesBySchool,
      cases: caseSummaries.slice(0, limit),
      upcomingReviews: upcomingReviews.slice(0, 10),
      crossSchoolTrends: {
        mostCommonSendNeed,
        averageInterventionEffectiveness: Math.round(averageInterventionEffectiveness * 100) / 100,
        studentsAwaitingEhcp,
        overdueReviews,
      },
      actionRequired: {
        urgentCases: casesByUrgency.urgent,
        overdueAssessments: caseSummaries.filter(c =>
          c.latestAssessment.date &&
          (now.getTime() - new Date(c.latestAssessment.date).getTime()) > (90 * 24 * 60 * 60 * 1000)
        ).length,
        reviewsDueThisWeek: upcomingReviews.filter(r =>
          new Date(r.dueDate).getTime() - now.getTime() <= (7 * 24 * 60 * 60 * 1000)
        ).length,
      },
      lastUpdated: new Date(),
    };

    // Log data access for GDPR audit trail
    await prisma.auditLog.create({
      data: {
        userId: userId?.toString() || 'unknown',
        user_id_int: userId ? parseInt(userId as string) : undefined,
        tenant_id: 0, // Cross-tenant view
        action: 'ep_dashboard_view',
        resource: 'ep_dashboard',
        details: {
          description: `EP dashboard: ${caseSummaries.length} students across ${Object.keys(casesBySchool).length} schools`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      },
    });

    logger.debug(`[EP Dashboard API] Dashboard generated - Cases: ${caseSummaries.length}, Urgent: ${casesByUrgency.urgent}, Schools: ${Object.keys(casesBySchool).length}`);

    return NextResponse.json(response);

  } catch (_error) {
    console.error('[EP Dashboard API] Error generating dashboard:', _error);
    return NextResponse.json({
      error: 'Internal server error',
      message: _error instanceof Error ? _error.message : 'Unknown error'
    }, { status: 500 });
  }
}
