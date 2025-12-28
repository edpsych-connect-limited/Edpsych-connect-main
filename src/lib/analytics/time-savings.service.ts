/**
 * Time Savings Metrics Service
 * 
 * Tracks, calculates, and reports time savings achieved through platform automation.
 * This service powers the "hours saved" metrics shown throughout the platform
 * and validates the claims made in training videos.
 * 
 * Video Claims to Support:
 * - "Save teachers 5-10 hours per week on admin"
 * - "EHCP drafting reduced from 40 hours to 4 hours"
 * - "IEP generation in minutes instead of hours"
 * - "Automated SEN2 returns save LAs 100+ hours annually"
 * 
 * Zero Gap Project - Sprint 4
 */

import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface TimeSavingsMetric {
  id?: number;
  tenantId: number;
  userId?: number;
  featureCategory: FeatureCategory;
  featureName: string;
  actionType: ActionType;
  traditionalTimeMinutes: number;
  automatedTimeMinutes: number;
  timeSavedMinutes: number;
  evidenceType: EvidenceType;
  metadata?: Record<string, unknown>;
  recordedAt: Date;
}

export type FeatureCategory =
  | 'ehcp'
  | 'iep'
  | 'assessment'
  | 'lesson_planning'
  | 'reporting'
  | 'communication'
  | 'data_entry'
  | 'sen2_returns'
  | 'progress_tracking'
  | 'resource_creation'
  | 'meeting_prep'
  | 'differentiation';

export type ActionType =
  | 'document_generation'
  | 'report_creation'
  | 'data_collection'
  | 'analysis'
  | 'communication'
  | 'form_completion'
  | 'export'
  | 'review'
  | 'collaboration';

export type EvidenceType =
  | 'measured'      // Actual tracked time
  | 'estimated'     // Based on industry benchmarks
  | 'reported'      // User self-reported
  | 'calculated';   // Algorithm-derived

export interface TimeSavingsReport {
  tenantId: number;
  periodStart: Date;
  periodEnd: Date;
  totalTimeSavedMinutes: number;
  totalTimeSavedHours: number;
  breakdownByCategory: CategoryBreakdown[];
  breakdownByUser: UserBreakdown[];
  topSavingsFeatures: FeatureSavings[];
  weeklyTrend: WeeklyTrend[];
  projectedAnnualSavingsHours: number;
  costSavingsEstimate: CostSavingsEstimate;
  comparisonToBaseline: BaselineComparison;
}

export interface CategoryBreakdown {
  category: FeatureCategory;
  totalSavedMinutes: number;
  actionCount: number;
  averageSavedPerAction: number;
  percentageOfTotal: number;
}

export interface UserBreakdown {
  userId: number;
  userName: string;
  role: string;
  totalSavedMinutes: number;
  actionCount: number;
}

export interface FeatureSavings {
  featureName: string;
  category: FeatureCategory;
  totalSavedMinutes: number;
  usageCount: number;
  averageSavedPerUse: number;
}

export interface WeeklyTrend {
  weekStart: Date;
  weekEnd: Date;
  totalSavedMinutes: number;
  actionCount: number;
}

export interface CostSavingsEstimate {
  averageHourlyRate: number;
  currency: string;
  totalCostSaved: number;
  roiMultiplier: number;
}

export interface BaselineComparison {
  baselineMinutesPerWeek: number;
  currentMinutesPerWeek: number;
  improvementPercentage: number;
  targetImprovement: number;
  onTrack: boolean;
}

// ============================================================================
// Industry Benchmarks (Research-Based)
// ============================================================================

/**
 * Traditional time estimates based on:
 * - NASEN research on SENCO workload
 * - DfE Teacher Workload Survey
 * - EHCP provider time studies
 * - Education Endowment Foundation data
 */
export const INDUSTRY_BENCHMARKS: Record<string, { 
  traditionalMinutes: number; 
  source: string;
  confidence: 'high' | 'medium' | 'low';
}> = {
  // EHCP Related
  'ehcp_draft_creation': { traditionalMinutes: 2400, source: 'IPSEA Research 2023', confidence: 'high' },
  'ehcp_annual_review': { traditionalMinutes: 480, source: 'NASEN Workload Study', confidence: 'high' },
  'ehcp_needs_analysis': { traditionalMinutes: 180, source: 'EP Assessment Guidelines', confidence: 'medium' },
  
  // IEP Related
  'iep_creation': { traditionalMinutes: 120, source: 'Teacher Workload Survey 2023', confidence: 'high' },
  'iep_review_update': { traditionalMinutes: 60, source: 'Teacher Workload Survey 2023', confidence: 'high' },
  'iep_progress_report': { traditionalMinutes: 45, source: 'Internal Benchmark', confidence: 'medium' },
  
  // Lesson Planning
  'lesson_plan_creation': { traditionalMinutes: 60, source: 'EEF Planning Study', confidence: 'high' },
  'differentiated_resources': { traditionalMinutes: 90, source: 'Teacher Survey Data', confidence: 'medium' },
  'assessment_creation': { traditionalMinutes: 120, source: 'Ofsted Workload Report', confidence: 'high' },
  
  // Reporting
  'progress_report_pupil': { traditionalMinutes: 30, source: 'DfE Teacher Survey', confidence: 'high' },
  'class_overview_report': { traditionalMinutes: 60, source: 'Internal Benchmark', confidence: 'medium' },
  'sen2_return_submission': { traditionalMinutes: 4800, source: 'LA Survey 2023', confidence: 'high' },
  
  // Communication
  'parent_update_letter': { traditionalMinutes: 20, source: 'Internal Benchmark', confidence: 'low' },
  'professional_report': { traditionalMinutes: 45, source: 'EP Guidelines', confidence: 'medium' },
  'meeting_preparation': { traditionalMinutes: 30, source: 'Teacher Survey', confidence: 'medium' },
  
  // Data Entry
  'data_import_manual': { traditionalMinutes: 120, source: 'Internal Benchmark', confidence: 'low' },
  'assessment_data_entry': { traditionalMinutes: 5, source: 'Per-pupil estimate', confidence: 'medium' },
};

// ============================================================================
// Time Savings Service Class
// ============================================================================

export class TimeSavingsService {
  private tenantId: number;

  constructor(tenantId: number) {
    this.tenantId = tenantId;
  }

  // --------------------------------------------------------------------------
  // Record Time Savings
  // --------------------------------------------------------------------------

  /**
   * Record a time savings metric
   */
  async recordTimeSavings(metric: Omit<TimeSavingsMetric, 'id' | 'timeSavedMinutes' | 'recordedAt'>): Promise<number> {
    const timeSaved = metric.traditionalTimeMinutes - metric.automatedTimeMinutes;

    const result = await prisma.timeSavingsMetric.create({
      data: {
        tenantId: this.tenantId,
        userId: metric.userId,
        featureCategory: metric.featureCategory,
        featureName: metric.featureName,
        actionType: metric.actionType,
        traditionalTimeMinutes: metric.traditionalTimeMinutes,
        automatedTimeMinutes: metric.automatedTimeMinutes,
        timeSavedMinutes: timeSaved,
        evidenceType: metric.evidenceType,
        metadata: metric.metadata ? JSON.stringify(metric.metadata) : null,
        recordedAt: new Date(),
      },
    });

    logger.info(`[TimeSavings] Recorded: ${metric.featureName} saved ${timeSaved} minutes`);
    return result.id;
  }

  /**
   * Record time savings using industry benchmark for traditional time
   */
  async recordWithBenchmark(
    benchmarkKey: string,
    actualMinutes: number,
    userId?: number,
    metadata?: Record<string, unknown>
  ): Promise<number> {
    const benchmark = INDUSTRY_BENCHMARKS[benchmarkKey];
    if (!benchmark) {
      throw new Error(`Unknown benchmark key: ${benchmarkKey}`);
    }

    const category = this.getCategoryFromBenchmark(benchmarkKey);
    const actionType = this.getActionTypeFromBenchmark(benchmarkKey);

    return this.recordTimeSavings({
      tenantId: this.tenantId,
      userId,
      featureCategory: category,
      featureName: benchmarkKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      actionType,
      traditionalTimeMinutes: benchmark.traditionalMinutes,
      automatedTimeMinutes: actualMinutes,
      // Benchmarks are never "measured"; they are estimates until backed by real timing instrumentation.
      evidenceType: 'estimated',
      metadata: {
        ...metadata,
        benchmarkSource: benchmark.source,
        benchmarkConfidence: benchmark.confidence,
      },
    });
  }

  // --------------------------------------------------------------------------
  // Generate Reports
  // --------------------------------------------------------------------------

  /**
   * Generate comprehensive time savings report
   */
  async generateReport(startDate: Date, endDate: Date): Promise<TimeSavingsReport> {
    const metrics = await prisma.timeSavingsMetric.findMany({
      where: {
        tenantId: this.tenantId,
        recordedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    const totalSavedMinutes = metrics.reduce((sum, m) => sum + m.timeSavedMinutes, 0);

    // Category breakdown
    const categoryMap = new Map<FeatureCategory, { minutes: number; count: number }>();
    metrics.forEach(m => {
      const cat = m.featureCategory as FeatureCategory;
      const existing = categoryMap.get(cat) || { minutes: 0, count: 0 };
      categoryMap.set(cat, {
        minutes: existing.minutes + m.timeSavedMinutes,
        count: existing.count + 1,
      });
    });

    const breakdownByCategory: CategoryBreakdown[] = Array.from(categoryMap.entries()).map(
      ([category, data]) => ({
        category,
        totalSavedMinutes: data.minutes,
        actionCount: data.count,
        averageSavedPerAction: Math.round(data.minutes / data.count),
        percentageOfTotal: totalSavedMinutes > 0 
          ? Math.round((data.minutes / totalSavedMinutes) * 100) 
          : 0,
      })
    ).sort((a, b) => b.totalSavedMinutes - a.totalSavedMinutes);

    // User breakdown
    const userMap = new Map<number, { 
      name: string; 
      role: string; 
      minutes: number; 
      count: number;
    }>();
    metrics.forEach(m => {
      if (m.userId && m.user) {
        const existing = userMap.get(m.userId) || { 
          name: m.user.name || 'Unknown', 
          role: m.user.role || 'Unknown',
          minutes: 0, 
          count: 0 
        };
        userMap.set(m.userId, {
          ...existing,
          minutes: existing.minutes + m.timeSavedMinutes,
          count: existing.count + 1,
        });
      }
    });

    const breakdownByUser: UserBreakdown[] = Array.from(userMap.entries()).map(
      ([userId, data]) => ({
        userId,
        userName: data.name,
        role: data.role,
        totalSavedMinutes: data.minutes,
        actionCount: data.count,
      })
    ).sort((a, b) => b.totalSavedMinutes - a.totalSavedMinutes);

    // Top features
    const featureMap = new Map<string, { 
      category: FeatureCategory; 
      minutes: number; 
      count: number;
    }>();
    metrics.forEach(m => {
      const existing = featureMap.get(m.featureName) || { 
        category: m.featureCategory as FeatureCategory, 
        minutes: 0, 
        count: 0 
      };
      featureMap.set(m.featureName, {
        ...existing,
        minutes: existing.minutes + m.timeSavedMinutes,
        count: existing.count + 1,
      });
    });

    const topSavingsFeatures: FeatureSavings[] = Array.from(featureMap.entries())
      .map(([featureName, data]) => ({
        featureName,
        category: data.category,
        totalSavedMinutes: data.minutes,
        usageCount: data.count,
        averageSavedPerUse: Math.round(data.minutes / data.count),
      }))
      .sort((a, b) => b.totalSavedMinutes - a.totalSavedMinutes)
      .slice(0, 10);

    // Weekly trend
    const weeklyTrend = this.calculateWeeklyTrend(metrics, startDate, endDate);

    // Calculate period in days
    const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const weeksInPeriod = periodDays / 7;

    // Projected annual savings
    const projectedAnnualSavingsHours = weeksInPeriod > 0 
      ? Math.round((totalSavedMinutes / 60 / weeksInPeriod) * 52)
      : 0;

    // Cost savings estimate (using UK average educational professional rates)
    const avgHourlyRate = 35; // GBP
    const costSavingsEstimate: CostSavingsEstimate = {
      averageHourlyRate: avgHourlyRate,
      currency: 'GBP',
      totalCostSaved: Math.round((totalSavedMinutes / 60) * avgHourlyRate),
      roiMultiplier: 0, // Would need subscription cost to calculate
    };

    // Baseline comparison
    const comparisonToBaseline = await this.calculateBaselineComparison(metrics, weeksInPeriod);

    return {
      tenantId: this.tenantId,
      periodStart: startDate,
      periodEnd: endDate,
      totalTimeSavedMinutes: totalSavedMinutes,
      totalTimeSavedHours: Math.round(totalSavedMinutes / 60),
      breakdownByCategory,
      breakdownByUser,
      topSavingsFeatures,
      weeklyTrend,
      projectedAnnualSavingsHours,
      costSavingsEstimate,
      comparisonToBaseline,
    };
  }

  /**
   * Generate user-specific time savings summary
   */
  async getUserTimeSavings(userId: number, startDate: Date, endDate: Date): Promise<{
    totalSavedMinutes: number;
    totalSavedHours: number;
    topFeatures: FeatureSavings[];
    weeklyAverage: number;
    rank: number;
    totalUsers: number;
  }> {
    const metrics = await prisma.timeSavingsMetric.findMany({
      where: {
        tenantId: this.tenantId,
        userId,
        recordedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalSavedMinutes = metrics.reduce((sum, m) => sum + m.timeSavedMinutes, 0);

    // Top features for user
    const featureMap = new Map<string, { 
      category: FeatureCategory; 
      minutes: number; 
      count: number;
    }>();
    metrics.forEach(m => {
      const existing = featureMap.get(m.featureName) || { 
        category: m.featureCategory as FeatureCategory, 
        minutes: 0, 
        count: 0 
      };
      featureMap.set(m.featureName, {
        ...existing,
        minutes: existing.minutes + m.timeSavedMinutes,
        count: existing.count + 1,
      });
    });

    const topFeatures: FeatureSavings[] = Array.from(featureMap.entries())
      .map(([featureName, data]) => ({
        featureName,
        category: data.category,
        totalSavedMinutes: data.minutes,
        usageCount: data.count,
        averageSavedPerUse: Math.round(data.minutes / data.count),
      }))
      .sort((a, b) => b.totalSavedMinutes - a.totalSavedMinutes)
      .slice(0, 5);

    // Calculate weekly average
    const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const weeksInPeriod = periodDays / 7;
    const weeklyAverage = weeksInPeriod > 0 
      ? Math.round(totalSavedMinutes / weeksInPeriod) 
      : 0;

    // Calculate rank among all users
    const allUserSavings = await prisma.timeSavingsMetric.groupBy({
      by: ['userId'],
      where: {
        tenantId: this.tenantId,
        recordedAt: {
          gte: startDate,
          lte: endDate,
        },
        userId: { not: null },
      },
      _sum: { timeSavedMinutes: true },
      orderBy: { _sum: { timeSavedMinutes: 'desc' } },
    });

    const rank = allUserSavings.findIndex(u => u.userId === userId) + 1;

    return {
      totalSavedMinutes,
      totalSavedHours: Math.round(totalSavedMinutes / 60),
      topFeatures,
      weeklyAverage,
      rank: rank || allUserSavings.length + 1,
      totalUsers: allUserSavings.length,
    };
  }

  // --------------------------------------------------------------------------
  // Save Report to Database
  // --------------------------------------------------------------------------

  /**
   * Persist a report snapshot for historical tracking
   */
  async saveReport(report: TimeSavingsReport): Promise<number> {
    const result = await prisma.timeSavingsReport.create({
      data: {
        tenantId: this.tenantId,
        reportType: 'comprehensive',
        periodStart: report.periodStart,
        periodEnd: report.periodEnd,
        totalSavedMinutes: report.totalTimeSavedMinutes,
        totalSavedHours: report.totalTimeSavedHours,
        projectedAnnualHours: report.projectedAnnualSavingsHours,
        costSavings: report.costSavingsEstimate.totalCostSaved,
        currency: report.costSavingsEstimate.currency,
        reportData: JSON.stringify(report),
        generatedAt: new Date(),
      },
    });

    logger.info(`[TimeSavings] Report saved: ID ${result.id}`);
    return result.id;
  }

  /**
   * Get historical reports
   */
  async getHistoricalReports(limit: number = 12): Promise<Array<{
    id: number;
    periodStart: Date;
    periodEnd: Date;
    totalSavedHours: number;
    projectedAnnualHours: number;
    costSavings: number;
    generatedAt: Date;
  }>> {
    const reports = await prisma.timeSavingsReport.findMany({
      where: { tenantId: this.tenantId },
      orderBy: { generatedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        periodStart: true,
        periodEnd: true,
        totalSavedHours: true,
        projectedAnnualHours: true,
        costSavings: true,
        generatedAt: true,
      },
    });

    return reports;
  }

  // --------------------------------------------------------------------------
  // Helper Methods
  // --------------------------------------------------------------------------

  /**
   * Calculate weekly trend from metrics
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private calculateWeeklyTrend(metrics: any[], startDate: Date, endDate: Date): WeeklyTrend[] {
    const weeks: WeeklyTrend[] = [];
    const currentWeekStart = new Date(startDate);
    currentWeekStart.setHours(0, 0, 0, 0);
    
    // Adjust to Monday
    const dayOfWeek = currentWeekStart.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    currentWeekStart.setDate(currentWeekStart.getDate() - daysToMonday);

    while (currentWeekStart < endDate) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekMetrics = metrics.filter(m => {
        const recorded = new Date(m.recordedAt);
        return recorded >= currentWeekStart && recorded <= weekEnd;
      });

      weeks.push({
        weekStart: new Date(currentWeekStart),
        weekEnd: new Date(weekEnd),
        totalSavedMinutes: weekMetrics.reduce((sum, m) => sum + m.timeSavedMinutes, 0),
        actionCount: weekMetrics.length,
      });

      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }

    return weeks;
  }

  /**
   * Calculate baseline comparison
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async calculateBaselineComparison(metrics: any[], weeksInPeriod: number): Promise<BaselineComparison> {
    // Calculate total traditional time (what it would have taken without automation)
    const totalTraditionalMinutes = metrics.reduce((sum, m) => sum + m.traditionalTimeMinutes, 0);
    const totalAutomatedMinutes = metrics.reduce((sum, m) => sum + m.automatedTimeMinutes, 0);

    const baselinePerWeek = weeksInPeriod > 0 
      ? Math.round(totalTraditionalMinutes / weeksInPeriod) 
      : 0;
    const currentPerWeek = weeksInPeriod > 0 
      ? Math.round(totalAutomatedMinutes / weeksInPeriod) 
      : 0;

    const improvementPercentage = baselinePerWeek > 0
      ? Math.round(((baselinePerWeek - currentPerWeek) / baselinePerWeek) * 100)
      : 0;

    // Target: 60% reduction in admin time (based on video claims)
    const targetImprovement = 60;

    return {
      baselineMinutesPerWeek: baselinePerWeek,
      currentMinutesPerWeek: currentPerWeek,
      improvementPercentage,
      targetImprovement,
      onTrack: improvementPercentage >= targetImprovement,
    };
  }

  /**
   * Get category from benchmark key
   */
  private getCategoryFromBenchmark(key: string): FeatureCategory {
    if (key.startsWith('ehcp')) return 'ehcp';
    if (key.startsWith('iep')) return 'iep';
    if (key.startsWith('lesson') || key.startsWith('differentiated')) return 'lesson_planning';
    if (key.startsWith('assessment')) return 'assessment';
    if (key.includes('report')) return 'reporting';
    if (key.startsWith('sen2')) return 'sen2_returns';
    if (key.includes('parent') || key.includes('communication')) return 'communication';
    if (key.includes('data')) return 'data_entry';
    return 'reporting';
  }

  /**
   * Get action type from benchmark key
   */
  private getActionTypeFromBenchmark(key: string): ActionType {
    if (key.includes('creation') || key.includes('draft')) return 'document_generation';
    if (key.includes('report')) return 'report_creation';
    if (key.includes('entry') || key.includes('import')) return 'data_collection';
    if (key.includes('analysis') || key.includes('review')) return 'analysis';
    if (key.includes('letter') || key.includes('communication')) return 'communication';
    if (key.includes('submission')) return 'form_completion';
    if (key.includes('meeting')) return 'collaboration';
    return 'document_generation';
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createTimeSavingsService(tenantId: number): TimeSavingsService {
  return new TimeSavingsService(tenantId);
}

// ============================================================================
// Quick Recording Helpers
// ============================================================================

/**
 * Quick helper to record EHCP draft time savings
 */
export async function recordEHCPDraftSavings(
  tenantId: number,
  actualMinutes: number,
  userId?: number,
  ehcpId?: string
): Promise<number> {
  const service = createTimeSavingsService(tenantId);
  return service.recordWithBenchmark('ehcp_draft_creation', actualMinutes, userId, { ehcpId });
}

/**
 * Quick helper to record IEP creation time savings
 */
export async function recordIEPSavings(
  tenantId: number,
  actualMinutes: number,
  userId?: number,
  iepId?: string
): Promise<number> {
  const service = createTimeSavingsService(tenantId);
  return service.recordWithBenchmark('iep_creation', actualMinutes, userId, { iepId });
}

/**
 * Quick helper to record lesson plan time savings
 */
export async function recordLessonPlanSavings(
  tenantId: number,
  actualMinutes: number,
  userId?: number,
  lessonPlanId?: string
): Promise<number> {
  const service = createTimeSavingsService(tenantId);
  return service.recordWithBenchmark('lesson_plan_creation', actualMinutes, userId, { lessonPlanId });
}

/**
 * Quick helper to record SEN2 return time savings
 */
export async function recordSEN2Savings(
  tenantId: number,
  actualMinutes: number,
  userId?: number,
  returnId?: string
): Promise<number> {
  const service = createTimeSavingsService(tenantId);
  return service.recordWithBenchmark('sen2_return_submission', actualMinutes, userId, { returnId });
}
