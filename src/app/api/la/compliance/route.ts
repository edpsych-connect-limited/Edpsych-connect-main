/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * LA EHCP Compliance & Analytics API
 * -----------------------------------
 * Enterprise-grade compliance reporting and analytics for Local Authorities.
 * 
 * Provides real-time visibility into:
 * - 20-week statutory compliance rates
 * - Breach analysis and trends
 * - Bottleneck identification
 * - Professional response times
 * - School application patterns
 * - Year-on-year comparisons
 * 
 * This data is critical for:
 * - Ofsted inspections
 * - DfE reporting (SEN2 census)
 * - Internal performance management
 * - Resource allocation decisions
 */

import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Type definitions for compliance analytics
interface EHCPApplicationForAnalytics {
  id: string;
  student_id: string;
  status: string;
  referral_date: Date;
  decision_actual_date?: Date | null;
  draft_actual_date?: Date | null;
  final_actual_date?: Date | null;
  decision_to_assess?: boolean | null;
  school_tenant?: { id: number; name: string } | null;
  contributions?: Array<{
    id: string;
    contributor_type: string;
    status: string;
    due_date: Date;
    submitted_at?: Date | null;
    requested_at?: Date | null;
  }>;
}

interface CaseInfo {
  id: string;
  student_id: string;
  school?: string;
  week: number;
  status: string;
}

interface BreachInfo {
  id: string;
  school?: string;
  days_overdue: number;
  resolved?: boolean;
}

interface TimelineBreakdown {
  week_0_to_6: { count: number; cases: CaseInfo[] };
  week_6_to_16: { count: number; cases: CaseInfo[] };
  week_16_to_20: { count: number; cases: CaseInfo[] };
  beyond_week_20: { count: number; cases: CaseInfo[] };
}

interface SchoolStats {
  school_id: number;
  school_name: string;
  total_applications: number;
  on_time: number;
  late: number;
  compliance_rate: number;
}

interface ProfessionalStats {
  role: string;
  total_contributions: number;
  total_response_days: number;
  average_response_days: number;
}

// Additional interfaces for compliance functions
interface ContributionData {
  id: string;
  contributor_type: string;
  status: string;
  due_date: Date;
  submitted_at?: Date | null;
  requested_at?: Date | null;
}

interface BottleneckStats {
  awaiting_decision: number;
  awaiting_ep_advice: number;
  awaiting_health_advice: number;
  awaiting_social_care: number;
  awaiting_school_input: number;
  draft_in_progress: number;
  in_consultation: number;
  awaiting_panel: number;
}

interface SchoolStatsRecord {
  id: string;
  name: string;
  total_applications: number;
  completed: number;
  in_progress: number;
  refused: number;
  average_quality_score: number;
}

interface ProfessionalStatsRecord {
  count: number;
  total_days: number;
  on_time: number;
  overdue: number;
  average_response_days?: number;
  on_time_rate?: number;
}

interface MonthlyTrend {
  month: string;
  month_name: string;
  new_applications: number;
  completed: number;
  refused: number;
}

interface RiskItem {
  id: string;
  student_id: string;
  school?: string;
  week: number;
  status: string;
  risk_factors: string[];
}

/**
 * GET /api/la/compliance
 * Comprehensive compliance and analytics dashboard data
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      include: { tenants: true },
    });

    if (!user?.tenants) {
      return NextResponse.json({ error: 'User or tenant not found' }, { status: 404 });
    }

    // Verify user has LA role
    if (!['admin', 'la_manager', 'la_caseworker'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const laTenantId = user.tenant_id;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const periodMonths = parseInt(searchParams.get('period') || '12');
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - periodMonths);

    // Fetch all applications for this LA
    const applications = await prisma.eHCPApplication.findMany({
      where: {
        la_tenant_id: laTenantId!,
        referral_date: { gte: startDate },
      },
      include: {
        school_tenant: {
          select: { id: true, name: true },
        },
        contributions: {
          select: {
            id: true,
            contributor_type: true,
            status: true,
            due_date: true,
            submitted_at: true,
          },
        },
      },
    });

    const now = new Date();

    // ===== OVERALL COMPLIANCE METRICS =====
    const complianceMetrics = calculateComplianceMetrics(applications, now);

    // ===== TIMELINE BREAKDOWN =====
    const timelineBreakdown = calculateTimelineBreakdown(applications, now);

    // ===== BREACH ANALYSIS =====
    const breachAnalysis = analyseBreaches(applications, now);

    // ===== BOTTLENECK IDENTIFICATION =====
    const bottlenecks = identifyBottlenecks(applications, now);

    // ===== SCHOOL PERFORMANCE =====
    const schoolPerformance = analyseSchoolPerformance(applications);

    // ===== PROFESSIONAL RESPONSE TIMES =====
    const professionalMetrics = analyseProfessionalResponseTimes(applications);

    // ===== MONTHLY TRENDS =====
    const monthlyTrends = calculateMonthlyTrends(applications, periodMonths);

    // ===== SEN2 CENSUS PREPARATION =====
    const sen2Data = prepareSEN2Data(applications);

    // ===== RISK REGISTER =====
    const riskRegister = buildRiskRegister(applications, now);

    return NextResponse.json({
      generated_at: now.toISOString(),
      period: {
        start: startDate.toISOString(),
        end: now.toISOString(),
        months: periodMonths,
      },
      summary: {
        total_applications: applications.length,
        overall_compliance_rate: complianceMetrics.overall_compliance_rate,
        current_active_cases: complianceMetrics.active_cases,
        cases_at_risk: riskRegister.high_risk.length,
        cases_overdue: complianceMetrics.overdue_cases,
      },
      compliance_metrics: complianceMetrics,
      timeline_breakdown: timelineBreakdown,
      breach_analysis: breachAnalysis,
      bottlenecks,
      school_performance: schoolPerformance,
      professional_metrics: professionalMetrics,
      monthly_trends: monthlyTrends,
      sen2_preparation: sen2Data,
      risk_register: riskRegister,
    });
  } catch (error) {
    logger.error('Error generating compliance report:', error);
    return NextResponse.json(
      { error: 'Failed to generate compliance report' },
      { status: 500 }
    );
  }
}

// ===== HELPER FUNCTIONS =====

function calculateComplianceMetrics(applications: EHCPApplicationForAnalytics[], now: Date) {
  const completed = applications.filter(a => a.status === 'FINAL_EHCP_ISSUED' || a.status === 'CEASED');
  const active = applications.filter(a => !['FINAL_EHCP_ISSUED', 'CEASED', 'DECISION_NOT_TO_ASSESS'].includes(a.status));
  const overdue = active.filter(a => {
    const deadline = new Date(a.referral_date);
    deadline.setDate(deadline.getDate() + 140); // 20 weeks
    return now > deadline;
  });

  // Calculate compliance for completed cases
  const completedOnTime = completed.filter(a => {
    if (!a.final_actual_date) return false;
    const deadline = new Date(a.referral_date);
    deadline.setDate(deadline.getDate() + 140);
    return new Date(a.final_actual_date) <= deadline;
  });

  // Week 6 decision compliance
  const decisionsMade = applications.filter(a => a.decision_actual_date);
  const decisionsOnTime = decisionsMade.filter(a => {
    const deadline = new Date(a.referral_date);
    deadline.setDate(deadline.getDate() + 42);
    return new Date(a.decision_actual_date!) <= deadline;
  });

  // Week 16 draft compliance
  const draftsMade = applications.filter(a => a.draft_actual_date);
  const draftsOnTime = draftsMade.filter(a => {
    const deadline = new Date(a.referral_date);
    deadline.setDate(deadline.getDate() + 112);
    return new Date(a.draft_actual_date!) <= deadline;
  });

  return {
    overall_compliance_rate: completed.length > 0 
      ? Math.round((completedOnTime.length / completed.length) * 100) 
      : 100,
    week_6_compliance_rate: decisionsMade.length > 0
      ? Math.round((decisionsOnTime.length / decisionsMade.length) * 100)
      : 100,
    week_16_compliance_rate: draftsMade.length > 0
      ? Math.round((draftsOnTime.length / draftsMade.length) * 100)
      : 100,
    total_applications: applications.length,
    active_cases: active.length,
    completed_cases: completed.length,
    overdue_cases: overdue.length,
    refused_cases: applications.filter(a => a.status === 'DECISION_NOT_TO_ASSESS').length,
    average_completion_days: calculateAverageCompletionDays(completed),
  };
}

function calculateTimelineBreakdown(applications: EHCPApplicationForAnalytics[], now: Date): TimelineBreakdown {
  const active = applications.filter(a => 
    !['FINAL_EHCP_ISSUED', 'CEASED', 'DECISION_NOT_TO_ASSESS'].includes(a.status)
  );

  const breakdown: TimelineBreakdown = {
    week_0_to_6: { count: 0, cases: [] },
    week_6_to_16: { count: 0, cases: [] },
    week_16_to_20: { count: 0, cases: [] },
    beyond_week_20: { count: 0, cases: [] },
  };

  active.forEach(app => {
    const weekNum = Math.floor((now.getTime() - new Date(app.referral_date).getTime()) / (7 * 24 * 60 * 60 * 1000));
    const caseInfo: CaseInfo = {
      id: app.id,
      student_id: app.student_id,
      school: app.school_tenant?.name,
      week: weekNum,
      status: app.status,
    };

    if (weekNum <= 6) {
      breakdown.week_0_to_6.count++;
      breakdown.week_0_to_6.cases.push(caseInfo);
    } else if (weekNum <= 16) {
      breakdown.week_6_to_16.count++;
      breakdown.week_6_to_16.cases.push(caseInfo);
    } else if (weekNum <= 20) {
      breakdown.week_16_to_20.count++;
      breakdown.week_16_to_20.cases.push(caseInfo);
    } else {
      breakdown.beyond_week_20.count++;
      breakdown.beyond_week_20.cases.push(caseInfo);
    }
  });

  return breakdown;
}

function analyseBreaches(applications: EHCPApplicationForAnalytics[], now: Date) {
  const breaches: {
    week_6_breaches: BreachInfo[];
    week_16_breaches: BreachInfo[];
    week_20_breaches: BreachInfo[];
    total_breach_count: number;
    breach_rate: number;
  } = {
    week_6_breaches: [],
    week_16_breaches: [],
    week_20_breaches: [],
    total_breach_count: 0,
    breach_rate: 0,
  };

  applications.forEach(app => {
    const referralDate = new Date(app.referral_date);
    
    // Week 6 breach
    const week6Deadline = new Date(referralDate);
    week6Deadline.setDate(week6Deadline.getDate() + 42);
    if (now > week6Deadline && !app.decision_actual_date) {
      breaches.week_6_breaches.push({
        id: app.id,
        school: app.school_tenant?.name,
        days_overdue: Math.floor((now.getTime() - week6Deadline.getTime()) / (24 * 60 * 60 * 1000)),
      });
    } else if (app.decision_actual_date && new Date(app.decision_actual_date) > week6Deadline) {
      breaches.week_6_breaches.push({
        id: app.id,
        school: app.school_tenant?.name,
        days_overdue: Math.floor((new Date(app.decision_actual_date).getTime() - week6Deadline.getTime()) / (24 * 60 * 60 * 1000)),
        resolved: true,
      });
    }

    // Week 16 breach (only if decision was to assess)
    if (app.decision_to_assess === true) {
      const week16Deadline = new Date(referralDate);
      week16Deadline.setDate(week16Deadline.getDate() + 112);
      if (now > week16Deadline && !app.draft_actual_date) {
        breaches.week_16_breaches.push({
          id: app.id,
          school: app.school_tenant?.name,
          days_overdue: Math.floor((now.getTime() - week16Deadline.getTime()) / (24 * 60 * 60 * 1000)),
        });
      }
    }

    // Week 20 breach
    if (app.decision_to_assess === true) {
      const week20Deadline = new Date(referralDate);
      week20Deadline.setDate(week20Deadline.getDate() + 140);
      if (now > week20Deadline && !app.final_actual_date) {
        breaches.week_20_breaches.push({
          id: app.id,
          school: app.school_tenant?.name,
          days_overdue: Math.floor((now.getTime() - week20Deadline.getTime()) / (24 * 60 * 60 * 1000)),
        });
      }
    }
  });

  breaches.total_breach_count = breaches.week_6_breaches.length + 
    breaches.week_16_breaches.length + breaches.week_20_breaches.length;
  breaches.breach_rate = applications.length > 0
    ? Math.round((breaches.total_breach_count / applications.length) * 100)
    : 0;

  return breaches;
}

function identifyBottlenecks(applications: EHCPApplicationForAnalytics[], now: Date) {
  const bottlenecks: BottleneckStats = {
    awaiting_decision: applications.filter(a => 
      a.status === 'SUBMITTED' || a.status === 'EVIDENCE_GATHERING' || a.status === 'PANEL_REVIEW_PENDING'
    ).length,
    awaiting_ep_advice: 0,
    awaiting_health_advice: 0,
    awaiting_social_care: 0,
    awaiting_school_input: 0,
    draft_in_progress: applications.filter(a => a.status === 'DRAFT_IN_PROGRESS').length,
    in_consultation: applications.filter(a => a.status === 'CONSULTATION_PARENT_SENT' || a.status === 'CONSULTATION_SCHOOL_SENT').length,
    awaiting_panel: applications.filter(a => a.status === 'PANEL_REVIEW_PENDING').length,
  };

  // Count professional contribution delays
  applications.forEach(app => {
    if (app.contributions) {
      app.contributions.forEach((c: ContributionData) => {
        if (c.status === 'draft') {
          const _isOverdue = new Date(c.due_date) < now;
          if (c.contributor_type === 'ep') {
            bottlenecks.awaiting_ep_advice++;
          } else if (c.contributor_type === 'health') {
            bottlenecks.awaiting_health_advice++;
          } else if (c.contributor_type === 'social_care') {
            bottlenecks.awaiting_social_care++;
          } else if (c.contributor_type === 'school') {
            bottlenecks.awaiting_school_input++;
          }
        }
      });
    }
  });

  // Identify biggest bottleneck
  const sorted = Object.entries(bottlenecks)
    .filter(([_, v]) => typeof v === 'number')
    .sort((a, b) => (b[1] as number) - (a[1] as number));

  return {
    ...bottlenecks,
    primary_bottleneck: sorted[0] ? { stage: sorted[0][0], count: sorted[0][1] } : null,
    recommendations: generateBottleneckRecommendations(bottlenecks),
  };
}

function analyseSchoolPerformance(applications: EHCPApplicationForAnalytics[]): SchoolStatsRecord[] {
  const schoolStats: Record<string, SchoolStatsRecord> = {};

  applications.forEach(app => {
    const schoolId = app.school_tenant?.id?.toString() || 'unknown';
    const schoolName = app.school_tenant?.name || 'Unknown School';

    if (!schoolStats[schoolId]) {
      schoolStats[schoolId] = {
        id: schoolId,
        name: schoolName,
        total_applications: 0,
        completed: 0,
        in_progress: 0,
        refused: 0,
        average_quality_score: 0,
      };
    }

    schoolStats[schoolId].total_applications++;
    if (app.status === 'FINAL_EHCP_ISSUED') schoolStats[schoolId].completed++;
    else if (app.status === 'DECISION_NOT_TO_ASSESS') schoolStats[schoolId].refused++;
    else schoolStats[schoolId].in_progress++;
  });

  return Object.values(schoolStats).sort((a, b) => b.total_applications - a.total_applications);
}

function analyseProfessionalResponseTimes(applications: EHCPApplicationForAnalytics[]): Record<string, ProfessionalStatsRecord> {
  const professionalStats: Record<string, ProfessionalStatsRecord> = {
    ep: { count: 0, total_days: 0, on_time: 0, overdue: 0 },
    health: { count: 0, total_days: 0, on_time: 0, overdue: 0 },
    social_care: { count: 0, total_days: 0, on_time: 0, overdue: 0 },
    school: { count: 0, total_days: 0, on_time: 0, overdue: 0 },
  };

  applications.forEach(app => {
    if (app.contributions) {
      app.contributions.forEach((c) => {
        if (c.status === 'submitted' || c.status === 'accepted') {
          const type = c.contributor_type;
          if (professionalStats[type]) {
            professionalStats[type].count++;
            if (c.submitted_at && c.requested_at) {
              const days = Math.floor(
                (new Date(c.submitted_at).getTime() - new Date(c.requested_at).getTime()) / (24 * 60 * 60 * 1000)
              );
              professionalStats[type].total_days += days;
              if (new Date(c.submitted_at) <= new Date(c.due_date)) {
                professionalStats[type].on_time++;
              } else {
                professionalStats[type].overdue++;
              }
            }
          }
        }
      });
    }
  });

  // Calculate averages
  Object.values(professionalStats).forEach((stats) => {
    stats.average_response_days = stats.count > 0 ? Math.round(stats.total_days / stats.count) : 0;
    stats.on_time_rate = stats.count > 0 ? Math.round((stats.on_time / stats.count) * 100) : 100;
  });

  return professionalStats;
}

function calculateMonthlyTrends(applications: EHCPApplicationForAnalytics[], months: number): MonthlyTrend[] {
  const trends: MonthlyTrend[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    const monthApps = applications.filter(a => {
      const referral = new Date(a.referral_date);
      return referral >= monthStart && referral <= monthEnd;
    });

    const completed = monthApps.filter(a => a.status === 'FINAL_EHCP_ISSUED');
    const refused = monthApps.filter(a => a.status === 'DECISION_NOT_TO_ASSESS');

    trends.push({
      month: monthStart.toISOString().slice(0, 7),
      month_name: monthStart.toLocaleString('en-GB', { month: 'short', year: 'numeric' }),
      new_applications: monthApps.length,
      completed: completed.length,
      refused: refused.length,
    });
  }

  return trends;
}

function prepareSEN2Data(applications: EHCPApplicationForAnalytics[]) {
  // SEN2 census data preparation
  const currentYear = new Date().getFullYear();
  const censusDate = new Date(currentYear, 0, 19); // Third Thursday of January approximation

  const activeOnCensus = applications.filter(a => {
    const referral = new Date(a.referral_date);
    return referral <= censusDate && 
      !['CEASED', 'TRANSFERRED'].includes(a.status);
  });

  return {
    census_date: censusDate.toISOString(),
    ehc_plans_maintained: activeOnCensus.filter(a => a.status === 'FINAL_EHCP_ISSUED').length,
    new_ehc_plans_issued: applications.filter(a => {
      const issued = a.final_actual_date ? new Date(a.final_actual_date) : null;
      return issued && issued.getFullYear() === currentYear;
    }).length,
    initial_requests: applications.filter(a => {
      const referral = new Date(a.referral_date);
      return referral.getFullYear() === currentYear;
    }).length,
    assessments_completed_20_weeks: applications.filter(a => {
      if (!a.final_actual_date) return false;
      const weeks = Math.floor(
        (new Date(a.final_actual_date).getTime() - new Date(a.referral_date).getTime()) / (7 * 24 * 60 * 60 * 1000)
      );
      return weeks <= 20;
    }).length,
  };
}

function buildRiskRegister(applications: EHCPApplicationForAnalytics[], now: Date) {
  const highRisk: RiskItem[] = [];
  const mediumRisk: RiskItem[] = [];
  const lowRisk: RiskItem[] = [];

  applications.forEach(app => {
    if (['FINAL_EHCP_ISSUED', 'CEASED', 'DECISION_NOT_TO_ASSESS'].includes(app.status)) {
      return;
    }

    const weekNum = Math.floor(
      (now.getTime() - new Date(app.referral_date).getTime()) / (7 * 24 * 60 * 60 * 1000)
    );

    const riskItem: RiskItem = {
      id: app.id,
      student_id: app.student_id,
      school: app.school_tenant?.name,
      week: weekNum,
      status: app.status,
      risk_factors: [],
    };

    // Determine risk level
    if (weekNum > 20) {
      riskItem.risk_factors.push('Past 20-week deadline');
      highRisk.push(riskItem);
    } else if (weekNum > 18) {
      riskItem.risk_factors.push('Within 2 weeks of deadline');
      highRisk.push(riskItem);
    } else if (weekNum > 14 && !app.draft_actual_date) {
      riskItem.risk_factors.push('No draft EHCP after week 14');
      highRisk.push(riskItem);
    } else if (weekNum > 6 && !app.decision_actual_date) {
      riskItem.risk_factors.push('No decision after week 6');
      highRisk.push(riskItem);
    } else if (weekNum > 12) {
      mediumRisk.push(riskItem);
    } else {
      lowRisk.push(riskItem);
    }
  });

  return {
    high_risk: highRisk,
    medium_risk: mediumRisk,
    low_risk: lowRisk,
    summary: {
      high: highRisk.length,
      medium: mediumRisk.length,
      low: lowRisk.length,
    },
  };
}

function calculateAverageCompletionDays(completed: EHCPApplicationForAnalytics[]): number {
  if (completed.length === 0) return 0;
  
  const totalDays = completed.reduce((sum, app) => {
    if (app.final_actual_date) {
      const days = Math.floor(
        (new Date(app.final_actual_date).getTime() - new Date(app.referral_date).getTime()) / (24 * 60 * 60 * 1000)
      );
      return sum + days;
    }
    return sum;
  }, 0);

  return Math.round(totalDays / completed.length);
}

function generateBottleneckRecommendations(bottlenecks: BottleneckStats): string[] {
  const recommendations: string[] = [];

  if (bottlenecks.awaiting_ep_advice > 5) {
    recommendations.push('Consider commissioning additional EP capacity');
  }
  if (bottlenecks.awaiting_health_advice > 5) {
    recommendations.push('Escalate health advice delays to Designated Medical Officer');
  }
  if (bottlenecks.awaiting_decision > 10) {
    recommendations.push('Schedule additional panel meetings to clear decision backlog');
  }
  if (bottlenecks.draft_in_progress > 5) {
    recommendations.push('Allocate caseworker time for draft EHCP completion');
  }

  return recommendations;
}
