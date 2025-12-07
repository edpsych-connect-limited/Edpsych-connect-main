/**
 * Outcome Tracking Service
 * 
 * Comprehensive outcome tracking for SEND students supporting:
 * - SMART outcome creation and management
 * - Progress monitoring against baselines
 * - EHCP outcome alignment
 * - Intervention effectiveness measurement
 * - Visual progress tracking
 * - Outcome reporting for reviews
 * - Evidence collection and linking
 * 
 * Aligned with SEND Code of Practice outcome requirements
 * 
 * @module OutcomeTrackingService
 * @version 1.0.0
 */

import { PrismaClient, Prisma } from '@prisma/client';

// Types
interface Outcome {
  id: string;
  studentId: string;
  
  // Outcome details
  title: string;
  description: string;
  category: 'COMMUNICATION' | 'COGNITION' | 'SOCIAL_EMOTIONAL' | 'SENSORY_PHYSICAL' | 'INDEPENDENCE' | 'ACADEMIC' | 'PREPARATION_ADULTHOOD';
  ehcpSection?: string;
  ehcpOutcomeId?: string;
  
  // SMART criteria
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timeBound: Date;
  
  // Baseline and target
  baseline: {
    date: Date;
    description: string;
    level: number;
    evidence?: string;
  };
  target: {
    description: string;
    level: number;
    criteria: string[];
  };
  
  // Current progress
  currentLevel: number;
  progressPercentage: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'ON_TRACK' | 'AT_RISK' | 'ACHIEVED' | 'PARTIALLY_ACHIEVED' | 'NOT_ACHIEVED' | 'DISCONTINUED';
  
  // Tracking
  progressEntries: ProgressEntry[];
  linkedInterventions: string[];
  linkedProvisions: string[];
  
  // Review
  reviewSchedule: 'WEEKLY' | 'FORTNIGHTLY' | 'HALF_TERMLY' | 'TERMLY';
  nextReviewDate: Date;
  lastReviewDate?: Date;
  
  // Ownership
  keyWorkerId?: string;
  createdById: string;
  
  createdAt: Date;
  updatedAt: Date;
}

interface ProgressEntry {
  id: string;
  date: Date;
  level: number;
  notes: string;
  evidence?: Evidence[];
  recordedBy: string;
  
  // Context
  setting?: string;
  supportUsed?: string[];
  independenceLevel?: 'FULL_SUPPORT' | 'PARTIAL_SUPPORT' | 'PROMPTING' | 'SUPERVISION' | 'INDEPENDENT';
}

interface Evidence {
  type: 'OBSERVATION' | 'WORK_SAMPLE' | 'ASSESSMENT' | 'VIDEO' | 'PHOTO' | 'AUDIO' | 'DOCUMENT' | 'THIRD_PARTY';
  description: string;
  url?: string;
  date: Date;
  collectedBy: string;
}

interface OutcomeReport {
  studentId: string;
  studentName: string;
  reportPeriod: {
    start: Date;
    end: Date;
  };
  
  // Summary
  totalOutcomes: number;
  onTrack: number;
  achieved: number;
  atRisk: number;
  notAchieved: number;
  
  // By category
  byCategory: Record<string, {
    total: number;
    onTrack: number;
    progress: number;
  }>;
  
  // Detail
  outcomes: OutcomeSummary[];
  
  // Analysis
  strengths: string[];
  areasForDevelopment: string[];
  recommendations: string[];
  
  generatedAt: Date;
}

interface OutcomeSummary {
  id: string;
  title: string;
  category: string;
  status: string;
  progressPercentage: number;
  startLevel: number;
  currentLevel: number;
  targetLevel: number;
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  keyMilestones: string[];
}

interface OutcomeTemplate {
  id: string;
  name: string;
  category: string;
  needType: string;
  ageRange: string;
  
  // Template content
  titleTemplate: string;
  descriptionTemplate: string;
  measurementCriteria: string[];
  suggestedTimeframe: number; // weeks
  evidenceTypes: string[];
  
  // Usage stats
  usageCount: number;
  successRate: number;
}

interface OutcomeFilters {
  studentId?: string;
  category?: string;
  status?: string;
  keyWorkerId?: string;
  ehcpOnly?: boolean;
  reviewDue?: boolean;
}

interface CreateOutcomeData {
  studentId: string;
  title: string;
  description: string;
  category: Outcome['category'];
  ehcpSection?: string;
  ehcpOutcomeId?: string;
  baseline: Outcome['baseline'];
  target: Outcome['target'];
  timeBound: Date;
  reviewSchedule: Outcome['reviewSchedule'];
  keyWorkerId?: string;
  linkedInterventions?: string[];
  linkedProvisions?: string[];
}

export class OutcomeTrackingService {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || new PrismaClient();
  }

  // ========================================
  // OUTCOME MANAGEMENT
  // ========================================

  /**
   * Create a new outcome
   */
  async createOutcome(data: CreateOutcomeData, createdById: string): Promise<Outcome> {
    const nextReview = this.calculateNextReviewDate(data.reviewSchedule);

    const outcome = await (this.prisma as any).outcome.create({
      data: {
        studentId: data.studentId,
        title: data.title,
        description: data.description,
        category: data.category,
        ehcpSection: data.ehcpSection,
        ehcpOutcomeId: data.ehcpOutcomeId,
        specific: data.title,
        measurable: data.target.criteria.join('; '),
        achievable: 'Based on current baseline and available support',
        relevant: data.description,
        timeBound: data.timeBound,
        baseline: data.baseline as unknown as Prisma.JsonValue,
        target: data.target as unknown as Prisma.JsonValue,
        currentLevel: data.baseline.level,
        progressPercentage: 0,
        status: 'NOT_STARTED',
        progressEntries: [] as unknown as Prisma.JsonValue,
        linkedInterventions: data.linkedInterventions || [],
        linkedProvisions: data.linkedProvisions || [],
        reviewSchedule: data.reviewSchedule,
        nextReviewDate: nextReview,
        keyWorkerId: data.keyWorkerId,
        createdById
      }
    });

    return outcome as unknown as Outcome;
  }

  /**
   * Get outcome by ID
   */
  async getOutcome(outcomeId: string): Promise<Outcome | null> {
    const outcome = await (this.prisma as any).outcome.findUnique({
      where: { id: outcomeId },
      include: {
        student: {
          select: { first_name: true, last_name: true }
        }
      }
    });

    return outcome as unknown as Outcome;
  }

  /**
   * Get outcomes with filters
   */
  async getOutcomes(
    schoolId: string,
    filters: OutcomeFilters = {},
    page: number = 1,
    limit: number = 50
  ): Promise<{ outcomes: Outcome[]; total: number }> {
    const where: any = {
      student: { schoolId }
    };

    if (filters.studentId) where.studentId = filters.studentId;
    if (filters.category) where.category = filters.category;
    if (filters.status) where.status = filters.status;
    if (filters.keyWorkerId) where.keyWorkerId = filters.keyWorkerId;
    if (filters.ehcpOnly) where.ehcpOutcomeId = { not: null };
    if (filters.reviewDue) where.nextReviewDate = { lte: new Date() };

    const [outcomes, total] = await Promise.all([
      (this.prisma as any).outcome.findMany({
        where,
        include: {
          student: {
            select: { first_name: true, last_name: true, yearGroup: true }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [
          { status: 'asc' },
          { nextReviewDate: 'asc' }
        ]
      }),
      (this.prisma as any).outcome.count({ where })
    ]);

    return {
      outcomes: outcomes as unknown as Outcome[],
      total
    };
  }

  /**
   * Get student's outcomes
   */
  async getStudentOutcomes(studentId: string): Promise<Outcome[]> {
    const outcomes = await (this.prisma as any).outcome.findMany({
      where: { 
        studentId,
        status: { not: 'DISCONTINUED' }
      },
      orderBy: [
        { category: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return outcomes as unknown as Outcome[];
  }

  // ========================================
  // PROGRESS TRACKING
  // ========================================

  /**
   * Record progress entry
   */
  async recordProgress(
    outcomeId: string,
    data: {
      level: number;
      notes: string;
      evidence?: Evidence[];
      setting?: string;
      supportUsed?: string[];
      independenceLevel?: ProgressEntry['independenceLevel'];
    },
    recordedBy: string
  ): Promise<Outcome> {
    const outcome = await (this.prisma as any).outcome.findUnique({
      where: { id: outcomeId }
    });

    if (!outcome) {
      throw new Error('Outcome not found');
    }

    const progressEntry: ProgressEntry = {
      id: crypto.randomUUID(),
      date: new Date(),
      level: data.level,
      notes: data.notes,
      evidence: data.evidence,
      recordedBy,
      setting: data.setting,
      supportUsed: data.supportUsed,
      independenceLevel: data.independenceLevel
    };

    const existingEntries = outcome.progressEntries as unknown as ProgressEntry[] || [];
    const allEntries = [...existingEntries, progressEntry];

    // Calculate progress percentage
    const baseline = (outcome.baseline as unknown as Outcome['baseline']).level;
    const target = (outcome.target as unknown as Outcome['target']).level;
    const range = target - baseline;
    const progress = range > 0 ? Math.round(((data.level - baseline) / range) * 100) : 0;

    // Determine status
    const status = this.calculateStatus(progress, outcome.timeBound);

    const updated = await (this.prisma as any).outcome.update({
      where: { id: outcomeId },
      data: {
        currentLevel: data.level,
        progressPercentage: Math.min(Math.max(progress, 0), 100),
        progressEntries: allEntries as unknown as Prisma.JsonValue,
        status,
        lastReviewDate: new Date(),
        nextReviewDate: this.calculateNextReviewDate(outcome.reviewSchedule as Outcome['reviewSchedule']),
        updatedAt: new Date()
      }
    });

    return updated as unknown as Outcome;
  }

  /**
   * Calculate outcome status based on progress
   */
  private calculateStatus(progress: number, timeBound: Date): Outcome['status'] {
    const now = new Date();
    const deadline = new Date(timeBound);
    const timeRemaining = deadline.getTime() - now.getTime();
    const totalTime = deadline.getTime() - now.getTime();
    const timeProgress = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 100;

    if (progress >= 100) return 'ACHIEVED';
    if (progress >= 80) return 'ON_TRACK';
    if (timeProgress > progress + 20) return 'AT_RISK';
    if (progress > 0) return 'IN_PROGRESS';
    return 'NOT_STARTED';
  }

  /**
   * Get progress history for an outcome
   */
  async getProgressHistory(outcomeId: string): Promise<{
    outcome: Outcome;
    progressEntries: ProgressEntry[];
    trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
    averageProgress: number;
  }> {
    const outcome = await (this.prisma as any).outcome.findUnique({
      where: { id: outcomeId }
    });

    if (!outcome) {
      throw new Error('Outcome not found');
    }

    const entries = outcome.progressEntries as unknown as ProgressEntry[] || [];
    
    // Calculate trend from last 3 entries
    let trend: 'IMPROVING' | 'STABLE' | 'DECLINING' = 'STABLE';
    if (entries.length >= 3) {
      const recent = entries.slice(-3);
      const changes = recent.slice(1).map((e, i) => e.level - recent[i].level);
      const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
      
      if (avgChange > 0.5) trend = 'IMPROVING';
      else if (avgChange < -0.5) trend = 'DECLINING';
    }

    // Calculate average progress rate
    const averageProgress = entries.length > 1
      ? (outcome.currentLevel - (outcome.baseline as unknown as Outcome['baseline']).level) / entries.length
      : 0;

    return {
      outcome: outcome as unknown as Outcome,
      progressEntries: entries,
      trend,
      averageProgress: Math.round(averageProgress * 100) / 100
    };
  }

  // ========================================
  // OUTCOME REPORTING
  // ========================================

  /**
   * Generate outcome report for student
   */
  async generateOutcomeReport(
    studentId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<OutcomeReport> {
    const student = await this.prisma.students.findUnique({
      where: { id: parseInt(studentId) },
      select: { first_name: true, last_name: true }
    });

    if (!student) {
      throw new Error('Student not found');
    }

    const outcomes = await (this.prisma as any).outcome.findMany({
      where: {
        studentId,
        status: { not: 'DISCONTINUED' },
        OR: [
          { createdAt: { gte: periodStart, lte: periodEnd } },
          { updatedAt: { gte: periodStart, lte: periodEnd } }
        ]
      }
    });

    // Calculate summary stats
    const onTrack = outcomes.filter((o: any) => ['ON_TRACK', 'IN_PROGRESS'].includes(o.status as string)).length;
    const achieved = outcomes.filter((o: any) => ['ACHIEVED', 'PARTIALLY_ACHIEVED'].includes(o.status as string)).length;
    const atRisk = outcomes.filter((o: any) => o.status === 'AT_RISK').length;
    const notAchieved = outcomes.filter((o: any) => o.status === 'NOT_ACHIEVED').length;

    // Group by category
    const byCategory: OutcomeReport['byCategory'] = {};
    outcomes.forEach((outcome: any) => {
      const cat = outcome.category as string;
      if (!byCategory[cat]) {
        byCategory[cat] = { total: 0, onTrack: 0, progress: 0 };
      }
      byCategory[cat].total++;
      if (['ON_TRACK', 'IN_PROGRESS', 'ACHIEVED'].includes(outcome.status as string)) {
        byCategory[cat].onTrack++;
      }
      byCategory[cat].progress += outcome.progressPercentage || 0;
    });

    // Calculate average progress per category
    Object.keys(byCategory).forEach(cat => {
      byCategory[cat].progress = Math.round(byCategory[cat].progress / byCategory[cat].total);
    });

    // Create outcome summaries
    const outcomeSummaries: OutcomeSummary[] = outcomes.map((outcome: any) => {
      const entries = outcome.progressEntries as unknown as ProgressEntry[] || [];
      const baseline = (outcome.baseline as unknown as Outcome['baseline']).level;
      const target = (outcome.target as unknown as Outcome['target']).level;

      // Determine trend
      let trend: OutcomeSummary['trend'] = 'STABLE';
      if (entries.length >= 2) {
        const recent = entries.slice(-2);
        if (recent[1].level > recent[0].level) trend = 'IMPROVING';
        else if (recent[1].level < recent[0].level) trend = 'DECLINING';
      }

      return {
        id: outcome.id,
        title: outcome.title,
        category: outcome.category as string,
        status: outcome.status as string,
        progressPercentage: outcome.progressPercentage || 0,
        startLevel: baseline,
        currentLevel: outcome.currentLevel || baseline,
        targetLevel: target,
        trend,
        keyMilestones: this.extractMilestones(entries)
      };
    });

    // Generate analysis
    const strengths = this.identifyStrengths(outcomeSummaries, byCategory);
    const areasForDevelopment = this.identifyAreasForDevelopment(outcomeSummaries, byCategory);
    const recommendations = this.generateRecommendations(outcomeSummaries, byCategory);

    return {
      studentId,
      studentName: `${student.first_name} ${student.last_name}`,
      reportPeriod: {
        start: periodStart,
        end: periodEnd
      },
      totalOutcomes: outcomes.length,
      onTrack,
      achieved,
      atRisk,
      notAchieved,
      byCategory,
      outcomes: outcomeSummaries,
      strengths,
      areasForDevelopment,
      recommendations,
      generatedAt: new Date()
    };
  }

  /**
   * Get outcomes due for review
   */
  async getOutcomesDueForReview(schoolId: string): Promise<{
    overdue: Outcome[];
    dueThisWeek: Outcome[];
    dueNextWeek: Outcome[];
  }> {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const [overdue, dueThisWeek, dueNextWeek] = await Promise.all([
      (this.prisma as any).outcome.findMany({
        where: {
          student: { schoolId },
          nextReviewDate: { lt: now },
          status: { notIn: ['ACHIEVED', 'DISCONTINUED', 'NOT_ACHIEVED'] }
        },
        include: { student: { select: { first_name: true, last_name: true } } }
      }),
      (this.prisma as any).outcome.findMany({
        where: {
          student: { schoolId },
          nextReviewDate: { gte: now, lt: weekFromNow },
          status: { notIn: ['ACHIEVED', 'DISCONTINUED', 'NOT_ACHIEVED'] }
        },
        include: { student: { select: { first_name: true, last_name: true } } }
      }),
      (this.prisma as any).outcome.findMany({
        where: {
          student: { schoolId },
          nextReviewDate: { gte: weekFromNow, lt: twoWeeksFromNow },
          status: { notIn: ['ACHIEVED', 'DISCONTINUED', 'NOT_ACHIEVED'] }
        },
        include: { student: { select: { first_name: true, last_name: true } } }
      })
    ]);

    return {
      overdue: overdue as unknown as Outcome[],
      dueThisWeek: dueThisWeek as unknown as Outcome[],
      dueNextWeek: dueNextWeek as unknown as Outcome[]
    };
  }

  // ========================================
  // OUTCOME TEMPLATES
  // ========================================

  /**
   * Get outcome templates
   */
  async getOutcomeTemplates(
    category?: string,
    needType?: string
  ): Promise<OutcomeTemplate[]> {
    const where: any = {};
    
    if (category) where.category = category;
    if (needType) where.needType = needType;

    const templates = await (this.prisma as any).outcomeTemplate.findMany({
      where,
      orderBy: [
        { usageCount: 'desc' },
        { successRate: 'desc' }
      ]
    });

    return templates as unknown as OutcomeTemplate[];
  }

  /**
   * Create outcome from template
   */
  async createFromTemplate(
    templateId: string,
    studentId: string,
    customisations: Partial<CreateOutcomeData>,
    createdById: string
  ): Promise<Outcome> {
    const template = await (this.prisma as any).outcomeTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      throw new Error('Template not found');
    }

    // Create outcome with template defaults and customisations
    const outcomeData: CreateOutcomeData = {
      studentId,
      title: customisations.title || template.titleTemplate,
      description: customisations.description || template.descriptionTemplate,
      category: (template.category as Outcome['category']) || 'ACADEMIC',
      baseline: customisations.baseline || {
        date: new Date(),
        description: '',
        level: 0
      },
      target: customisations.target || {
        description: '',
        level: 10,
        criteria: template.measurementCriteria as string[]
      },
      timeBound: customisations.timeBound || new Date(Date.now() + (template.suggestedTimeframe || 12) * 7 * 24 * 60 * 60 * 1000),
      reviewSchedule: customisations.reviewSchedule || 'HALF_TERMLY',
      ...customisations
    };

    const outcome = await this.createOutcome(outcomeData, createdById);

    // Update template usage
    await (this.prisma as any).outcomeTemplate.update({
      where: { id: templateId },
      data: { usageCount: { increment: 1 } }
    });

    return outcome;
  }

  // ========================================
  // ANALYTICS
  // ========================================

  /**
   * Get outcome analytics for school
   */
  async getOutcomeAnalytics(schoolId: string): Promise<{
    summary: {
      totalActive: number;
      achievementRate: number;
      onTrackRate: number;
      averageProgress: number;
    };
    byCategory: Record<string, {
      count: number;
      achieved: number;
      onTrack: number;
      atRisk: number;
    }>;
    byNeedType: Record<string, {
      count: number;
      achievementRate: number;
    }>;
    trends: {
      period: string;
      achieved: number;
      newOutcomes: number;
    }[];
  }> {
    const outcomes = await (this.prisma as any).outcome.findMany({
      where: {
        student: { schoolId },
        status: { notIn: ['DISCONTINUED'] }
      },
      include: {
        student: {
          include: {
            sendRegister: {
              select: { primaryNeed: true }
            }
          }
        }
      }
    });

    // Summary stats
    const active = outcomes.filter((o: any) => !['ACHIEVED', 'NOT_ACHIEVED'].includes(o.status as string));
    const achieved = outcomes.filter((o: any) => o.status === 'ACHIEVED');
    const onTrack = outcomes.filter((o: any) => ['ON_TRACK', 'IN_PROGRESS'].includes(o.status as string));
    const avgProgress = outcomes.reduce((sum: number, o: any) => sum + (o.progressPercentage || 0), 0) / outcomes.length;

    // By category
    const byCategory: Record<string, { count: number; achieved: number; onTrack: number; atRisk: number }> = {};
    outcomes.forEach((outcome: any) => {
      const cat = outcome.category as string;
      if (!byCategory[cat]) {
        byCategory[cat] = { count: 0, achieved: 0, onTrack: 0, atRisk: 0 };
      }
      byCategory[cat].count++;
      if (outcome.status === 'ACHIEVED') byCategory[cat].achieved++;
      if (['ON_TRACK', 'IN_PROGRESS'].includes(outcome.status as string)) byCategory[cat].onTrack++;
      if (outcome.status === 'AT_RISK') byCategory[cat].atRisk++;
    });

    // By need type
    const byNeedType: Record<string, { count: number; achievementRate: number }> = {};
    outcomes.forEach((outcome: any) => {
      const need = (outcome as unknown as { student: { sendRegister: { primaryNeed: string } | null } }).student?.sendRegister?.primaryNeed || 'Unknown';
      if (!byNeedType[need]) {
        byNeedType[need] = { count: 0, achievementRate: 0 };
      }
      byNeedType[need].count++;
    });

    // Calculate achievement rates by need
    outcomes.filter((o: any) => o.status === 'ACHIEVED').forEach((outcome: any) => {
      const need = (outcome as unknown as { student: { sendRegister: { primaryNeed: string } | null } }).student?.sendRegister?.primaryNeed || 'Unknown';
      if (byNeedType[need]) {
        byNeedType[need].achievementRate++;
      }
    });
    Object.keys(byNeedType).forEach(need => {
      byNeedType[need].achievementRate = Math.round(
        (byNeedType[need].achievementRate / byNeedType[need].count) * 100
      );
    });

    // Trends (last 6 months)
    const trends: { period: string; achieved: number; newOutcomes: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      const achievedThisMonth = outcomes.filter((o: any) => 
        o.status === 'ACHIEVED' && 
        o.updatedAt >= monthStart && 
        o.updatedAt < monthEnd
      ).length;

      const newThisMonth = outcomes.filter((o: any) =>
        o.createdAt >= monthStart && 
        o.createdAt < monthEnd
      ).length;

      trends.push({
        period: monthStart.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
        achieved: achievedThisMonth,
        newOutcomes: newThisMonth
      });
    }

    return {
      summary: {
        totalActive: active.length,
        achievementRate: Math.round((achieved.length / outcomes.length) * 100) || 0,
        onTrackRate: Math.round((onTrack.length / active.length) * 100) || 0,
        averageProgress: Math.round(avgProgress) || 0
      },
      byCategory,
      byNeedType,
      trends
    };
  }

  // ========================================
  // HELPER METHODS
  // ========================================

  private calculateNextReviewDate(schedule: Outcome['reviewSchedule']): Date {
    const next = new Date();
    switch (schedule) {
      case 'WEEKLY':
        next.setDate(next.getDate() + 7);
        break;
      case 'FORTNIGHTLY':
        next.setDate(next.getDate() + 14);
        break;
      case 'HALF_TERMLY':
        next.setDate(next.getDate() + 42); // ~6 weeks
        break;
      case 'TERMLY':
        next.setDate(next.getDate() + 84); // ~12 weeks
        break;
    }
    return next;
  }

  private extractMilestones(entries: ProgressEntry[]): string[] {
    // Extract significant progress points
    return entries
      .filter((_e, i, arr) => {
        if (i === 0) return true;
        return arr[i].level - arr[i - 1].level >= 1;
      })
      .slice(-3)
      .map(e => e.notes || `Reached level ${e.level}`);
  }

  private identifyStrengths(
    summaries: OutcomeSummary[],
    byCategory: OutcomeReport['byCategory']
  ): string[] {
    const strengths: string[] = [];

    // Find high-performing categories
    Object.entries(byCategory).forEach(([category, data]) => {
      if (data.progress >= 75) {
        strengths.push(`Strong progress in ${category.toLowerCase().replace(/_/g, ' ')}`);
      }
    });

    // Find outcomes showing improvement
    const improving = summaries.filter(s => s.trend === 'IMPROVING');
    if (improving.length > 0) {
      strengths.push(`${improving.length} outcome(s) showing consistent improvement`);
    }

    // Achieved outcomes
    const achieved = summaries.filter(s => s.status === 'ACHIEVED');
    if (achieved.length > 0) {
      strengths.push(`Successfully achieved ${achieved.length} outcome(s)`);
    }

    return strengths;
  }

  private identifyAreasForDevelopment(
    summaries: OutcomeSummary[],
    byCategory: OutcomeReport['byCategory']
  ): string[] {
    const areas: string[] = [];

    // Find low-performing categories
    Object.entries(byCategory).forEach(([category, data]) => {
      if (data.progress < 40) {
        areas.push(`Progress needed in ${category.toLowerCase().replace(/_/g, ' ')}`);
      }
    });

    // At-risk outcomes
    const atRisk = summaries.filter(s => s.status === 'AT_RISK');
    if (atRisk.length > 0) {
      areas.push(`${atRisk.length} outcome(s) require additional support`);
    }

    // Declining trends
    const declining = summaries.filter(s => s.trend === 'DECLINING');
    if (declining.length > 0) {
      areas.push(`${declining.length} outcome(s) showing regression - intervention needed`);
    }

    return areas;
  }

  private generateRecommendations(
    summaries: OutcomeSummary[],
    _byCategory: OutcomeReport['byCategory']
  ): string[] {
    const recommendations: string[] = [];

    const atRisk = summaries.filter(s => s.status === 'AT_RISK');
    if (atRisk.length > 0) {
      recommendations.push('Review and adjust strategies for at-risk outcomes');
      recommendations.push('Consider increasing review frequency for struggling areas');
    }

    const declining = summaries.filter(s => s.trend === 'DECLINING');
    if (declining.length > 0) {
      recommendations.push('Investigate causes of regression and adjust interventions');
    }

    const achieved = summaries.filter(s => s.status === 'ACHIEVED');
    if (achieved.length > 0) {
      recommendations.push('Set new targets to build on achieved outcomes');
      recommendations.push('Document successful strategies for future reference');
    }

    if (recommendations.length === 0) {
      recommendations.push('Continue current approach - progress is on track');
      recommendations.push('Consider setting more challenging targets where appropriate');
    }

    return recommendations;
  }
}



