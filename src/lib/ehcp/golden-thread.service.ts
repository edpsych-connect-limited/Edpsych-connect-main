/**
 * Golden Thread Coherence Analysis Service
 * 
 * Analyses and ensures coherence across EHCP sections:
 * - Section B (Needs) → Section F (Provision) → Section E (Outcomes)
 * 
 * The "Golden Thread" ensures:
 * 1. Every identified need has appropriate provision
 * 2. Every provision links to specific outcomes
 * 3. Outcomes are measurable and linked to needs
 * 4. No gaps in the need-provision-outcome chain
 * 
 * Video Claims Supported:
 * - "Automatic coherence checking between EHCP sections"
 * - "AI identifies gaps in provision mapping"
 * - "Real-time validation of need-provision-outcome threads"
 * 
 * Zero Gap Project - Sprint 5
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/logger';

// Initialize Prisma
const prisma = new PrismaClient();

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface CoherenceAnalysis {
  ehcpId: string;
  analysisDate: Date;
  overallScore: number;
  status: CoherenceStatus;
  threadCount: number;
  completeThreads: number;
  incompleteThreads: number;
  gaps: CoherenceGap[];
  recommendations: Recommendation[];
  sections: SectionAnalysis;
  timeline: TimelineCoherence;
}

export type CoherenceStatus = 
  | 'excellent'    // 90%+ coherence
  | 'good'         // 70-89% coherence
  | 'needs_work'   // 50-69% coherence
  | 'poor';        // <50% coherence

export interface CoherenceGap {
  id: string;
  type: GapType;
  severity: 'critical' | 'major' | 'minor';
  description: string;
  affectedNeed?: string;
  affectedProvision?: string;
  affectedOutcome?: string;
  suggestedAction: string;
}

export type GapType =
  | 'unmet_need'           // Need with no provision
  | 'orphan_provision'     // Provision not linked to need
  | 'missing_outcome'      // Provision with no outcome
  | 'vague_outcome'        // Outcome not measurable
  | 'disconnected_outcome' // Outcome not linked to need
  | 'duplicate_provision'  // Multiple provisions for same need
  | 'conflicting_provision';// Provisions that contradict

export interface Recommendation {
  priority: number;
  type: 'add' | 'modify' | 'remove' | 'link';
  section: 'B' | 'F' | 'E';
  description: string;
  suggestedContent?: string;
  relatedGapIds: string[];
}

export interface SectionAnalysis {
  sectionB: {
    needCount: number;
    categorisedNeeds: Record<string, number>;
    linkedToProvision: number;
    unlinkedNeeds: string[];
  };
  sectionF: {
    provisionCount: number;
    categorisedProvisions: Record<string, number>;
    linkedToNeeds: number;
    linkedToOutcomes: number;
    orphanProvisions: string[];
  };
  sectionE: {
    outcomeCount: number;
    measurableOutcomes: number;
    linkedToNeeds: number;
    vaguOutcomes: string[];
  };
}

export interface TimelineCoherence {
  shortTermOutcomes: number;  // 0-6 months
  mediumTermOutcomes: number; // 6-12 months
  longTermOutcomes: number;   // 12+ months
  reviewDatesSet: boolean;
  nextReviewDate?: Date;
}

export interface GoldenThread {
  id: string;
  needId: string;
  needDescription: string;
  needCategory: string;
  provisions: ThreadProvision[];
  outcomes: ThreadOutcome[];
  coherenceScore: number;
  isComplete: boolean;
  gaps: string[];
}

export interface ThreadProvision {
  id: string;
  description: string;
  type: string;
  frequency?: string;
  provider?: string;
  isQuantified: boolean;
}

export interface ThreadOutcome {
  id: string;
  description: string;
  timeframe: 'short' | 'medium' | 'long';
  isMeasurable: boolean;
  measurementCriteria?: string;
  targetDate?: Date;
}

// ============================================================================
// Need Categories (DfE SEN2 Standard)
// ============================================================================

export const NEED_CATEGORIES = {
  ASD: 'Autistic Spectrum Disorder',
  HI: 'Hearing Impairment',
  MLD: 'Moderate Learning Difficulty',
  MSI: 'Multi-Sensory Impairment',
  OTH: 'Other Difficulty/Disability',
  PD: 'Physical Disability',
  PMLD: 'Profound & Multiple Learning Difficulty',
  SEMH: 'Social, Emotional and Mental Health',
  SLCN: 'Speech, Language and Communication Needs',
  SLD: 'Severe Learning Difficulty',
  SpLD: 'Specific Learning Difficulty',
  VI: 'Visual Impairment',
};

// ============================================================================
// Provision Types
// ============================================================================

export const PROVISION_TYPES = {
  speech_therapy: 'Speech and Language Therapy',
  occupational_therapy: 'Occupational Therapy',
  physiotherapy: 'Physiotherapy',
  educational_psychology: 'Educational Psychology',
  specialist_teaching: 'Specialist Teaching',
  ta_support: 'Teaching Assistant Support',
  sensory_support: 'Sensory Support',
  medical_support: 'Medical/Health Support',
  social_emotional: 'Social/Emotional Support',
  curriculum_adaptation: 'Curriculum Adaptation',
  equipment: 'Specialist Equipment',
  training: 'Staff Training',
  transport: 'Transport',
  placement: 'Specialist Placement',
};

// ============================================================================
// Golden Thread Coherence Service
// ============================================================================

export class GoldenThreadService {
  private tenantId: number;

  constructor(tenantId: number) {
    this.tenantId = tenantId;
  }

  // --------------------------------------------------------------------------
  // Main Analysis Method
  // --------------------------------------------------------------------------

  /**
   * Perform comprehensive coherence analysis on an EHCP
   */
  async analyseCoherence(ehcpId: string): Promise<CoherenceAnalysis> {
    logger.info(`[GoldenThread] Analysing coherence for EHCP: ${ehcpId}`);

    // Fetch EHCP with all sections
    const ehcp = await prisma.eHCP.findUnique({
      where: { id: ehcpId },
      include: {
        needs: true,
        provisions: true,
        outcomes: true,
      },
    });

    if (!ehcp) {
      throw new Error(`EHCP not found: ${ehcpId}`);
    }

    // Build golden threads
    const threads = this.buildGoldenThreads(ehcp.needs, ehcp.provisions, ehcp.outcomes);

    // Analyse each section
    const sections = this.analyseSections(ehcp.needs, ehcp.provisions, ehcp.outcomes, threads);

    // Identify gaps
    const gaps = this.identifyGaps(threads, ehcp.needs, ehcp.provisions, ehcp.outcomes);

    // Generate recommendations
    const recommendations = this.generateRecommendations(gaps, threads);

    // Analyse timeline coherence
    const timeline = this.analyseTimelineCoherence(ehcp.outcomes);

    // Calculate overall score
    const overallScore = this.calculateOverallScore(threads, gaps);

    const analysis: CoherenceAnalysis = {
      ehcpId,
      analysisDate: new Date(),
      overallScore,
      status: this.determineStatus(overallScore),
      threadCount: threads.length,
      completeThreads: threads.filter(t => t.isComplete).length,
      incompleteThreads: threads.filter(t => !t.isComplete).length,
      gaps,
      recommendations,
      sections,
      timeline,
    };

    // Save analysis to database
    await this.saveAnalysis(analysis);

    return analysis;
  }

  // --------------------------------------------------------------------------
  // Thread Building
  // --------------------------------------------------------------------------

  /**
   * Build golden threads from needs, provisions, and outcomes
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private buildGoldenThreads(needs: any[], provisions: any[], outcomes: any[]): GoldenThread[] {
    const threads: GoldenThread[] = [];

    for (const need of needs) {
      const linkedProvisions = provisions.filter(p => 
        p.needIds?.includes(need.id) || 
        this.inferProvisionLink(need, p)
      );

      const linkedOutcomes = outcomes.filter(o => 
        o.needIds?.includes(need.id) || 
        linkedProvisions.some(p => o.provisionIds?.includes(p.id)) ||
        this.inferOutcomeLink(need, o)
      );

      const threadProvisions: ThreadProvision[] = linkedProvisions.map(p => ({
        id: p.id,
        description: p.description,
        type: p.type || 'unspecified',
        frequency: p.frequency,
        provider: p.provider,
        isQuantified: this.isProvisionQuantified(p),
      }));

      const threadOutcomes: ThreadOutcome[] = linkedOutcomes.map(o => ({
        id: o.id,
        description: o.description,
        timeframe: this.categoriseTimeframe(o.targetDate),
        isMeasurable: this.isOutcomeMeasurable(o),
        measurementCriteria: o.measurementCriteria,
        targetDate: o.targetDate,
      }));

      const gaps: string[] = [];
      if (threadProvisions.length === 0) gaps.push('No provision linked');
      if (threadOutcomes.length === 0) gaps.push('No outcome linked');
      if (threadProvisions.some(p => !p.isQuantified)) gaps.push('Unquantified provision');
      if (threadOutcomes.some(o => !o.isMeasurable)) gaps.push('Non-measurable outcome');

      const coherenceScore = this.calculateThreadScore(threadProvisions, threadOutcomes);

      threads.push({
        id: `thread_${need.id}`,
        needId: need.id,
        needDescription: need.description,
        needCategory: need.category || 'unspecified',
        provisions: threadProvisions,
        outcomes: threadOutcomes,
        coherenceScore,
        isComplete: coherenceScore >= 80 && gaps.length === 0,
        gaps,
      });
    }

    return threads;
  }

  // --------------------------------------------------------------------------
  // Gap Identification
  // --------------------------------------------------------------------------

  /**
   * Identify all coherence gaps
   */
  private identifyGaps(
    threads: GoldenThread[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    needs: any[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    provisions: any[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    outcomes: any[]
  ): CoherenceGap[] {
    const gaps: CoherenceGap[] = [];
    let gapIndex = 1;

    // Check for unmet needs
    for (const thread of threads) {
      if (thread.provisions.length === 0) {
        gaps.push({
          id: `gap_${gapIndex++}`,
          type: 'unmet_need',
          severity: 'critical',
          description: `Need "${this.truncate(thread.needDescription)}" has no linked provision`,
          affectedNeed: thread.needId,
          suggestedAction: `Add provision to address: ${thread.needDescription}`,
        });
      }

      if (thread.outcomes.length === 0 && thread.provisions.length > 0) {
        gaps.push({
          id: `gap_${gapIndex++}`,
          type: 'missing_outcome',
          severity: 'major',
          description: `No outcome defined for provision addressing "${this.truncate(thread.needDescription)}"`,
          affectedNeed: thread.needId,
          affectedProvision: thread.provisions[0]?.id,
          suggestedAction: 'Add measurable outcome for this provision',
        });
      }
    }

    // Check for orphan provisions
    const linkedProvisionIds = new Set(threads.flatMap(t => t.provisions.map(p => p.id)));
    for (const provision of provisions) {
      if (!linkedProvisionIds.has(provision.id)) {
        gaps.push({
          id: `gap_${gapIndex++}`,
          type: 'orphan_provision',
          severity: 'major',
          description: `Provision "${this.truncate(provision.description)}" is not linked to any need`,
          affectedProvision: provision.id,
          suggestedAction: 'Link this provision to a specific need or remove if no longer relevant',
        });
      }
    }

    // Check for vague outcomes
    for (const outcome of outcomes) {
      if (!this.isOutcomeMeasurable(outcome)) {
        gaps.push({
          id: `gap_${gapIndex++}`,
          type: 'vague_outcome',
          severity: 'minor',
          description: `Outcome "${this.truncate(outcome.description)}" may not be measurable`,
          affectedOutcome: outcome.id,
          suggestedAction: 'Add specific measurement criteria (e.g., "by end of Year 3, will be able to...")',
        });
      }
    }

    // Check for disconnected outcomes
    const linkedOutcomeIds = new Set(threads.flatMap(t => t.outcomes.map(o => o.id)));
    for (const outcome of outcomes) {
      if (!linkedOutcomeIds.has(outcome.id)) {
        gaps.push({
          id: `gap_${gapIndex++}`,
          type: 'disconnected_outcome',
          severity: 'major',
          description: `Outcome "${this.truncate(outcome.description)}" is not linked to any need`,
          affectedOutcome: outcome.id,
          suggestedAction: 'Link this outcome to a specific need or associated provision',
        });
      }
    }

    return gaps.sort((a, b) => {
      const severityOrder = { critical: 0, major: 1, minor: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  // --------------------------------------------------------------------------
  // Recommendation Generation
  // --------------------------------------------------------------------------

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(gaps: CoherenceGap[], threads: GoldenThread[]): Recommendation[] {
    const recommendations: Recommendation[] = [];
    let priority = 1;

    // Critical gaps first
    const criticalGaps = gaps.filter(g => g.severity === 'critical');
    for (const gap of criticalGaps) {
      if (gap.type === 'unmet_need') {
        const thread = threads.find(t => t.needId === gap.affectedNeed);
        recommendations.push({
          priority: priority++,
          type: 'add',
          section: 'F',
          description: `Add provision for: ${thread?.needDescription || 'identified need'}`,
          suggestedContent: this.suggestProvision(thread?.needCategory),
          relatedGapIds: [gap.id],
        });
      }
    }

    // Major gaps next
    const majorGaps = gaps.filter(g => g.severity === 'major');
    for (const gap of majorGaps) {
      if (gap.type === 'missing_outcome') {
        recommendations.push({
          priority: priority++,
          type: 'add',
          section: 'E',
          description: 'Add measurable outcome for the provision',
          suggestedContent: 'By [date], [child] will [specific measurable achievement] as evidenced by [measurement method]',
          relatedGapIds: [gap.id],
        });
      } else if (gap.type === 'orphan_provision') {
        recommendations.push({
          priority: priority++,
          type: 'link',
          section: 'F',
          description: 'Link provision to a specific identified need',
          relatedGapIds: [gap.id],
        });
      } else if (gap.type === 'disconnected_outcome') {
        recommendations.push({
          priority: priority++,
          type: 'link',
          section: 'E',
          description: 'Link outcome to a specific need or provision',
          relatedGapIds: [gap.id],
        });
      }
    }

    // Minor improvements last
    const minorGaps = gaps.filter(g => g.severity === 'minor');
    for (const gap of minorGaps) {
      if (gap.type === 'vague_outcome') {
        recommendations.push({
          priority: priority++,
          type: 'modify',
          section: 'E',
          description: 'Make outcome more measurable with specific criteria',
          suggestedContent: 'Include: target date, specific behaviour/skill, measurement method',
          relatedGapIds: [gap.id],
        });
      }
    }

    return recommendations;
  }

  // --------------------------------------------------------------------------
  // Section Analysis
  // --------------------------------------------------------------------------

  /**
   * Analyse individual sections
   */
  private analyseSections(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    needs: any[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    provisions: any[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    outcomes: any[],
    threads: GoldenThread[]
  ): SectionAnalysis {
    // Section B analysis
    const categorisedNeeds: Record<string, number> = {};
    needs.forEach(n => {
      const cat = n.category || 'unspecified';
      categorisedNeeds[cat] = (categorisedNeeds[cat] || 0) + 1;
    });

    const linkedNeedIds = new Set(threads.filter(t => t.provisions.length > 0).map(t => t.needId));
    const unlinkedNeeds = needs.filter(n => !linkedNeedIds.has(n.id)).map(n => n.id);

    // Section F analysis
    const categorisedProvisions: Record<string, number> = {};
    provisions.forEach(p => {
      const type = p.type || 'unspecified';
      categorisedProvisions[type] = (categorisedProvisions[type] || 0) + 1;
    });

    const linkedProvisionIds = new Set(threads.flatMap(t => t.provisions.map(p => p.id)));
    const provisionsWithOutcomes = new Set(
      threads.filter(t => t.outcomes.length > 0).flatMap(t => t.provisions.map(p => p.id))
    );
    const orphanProvisions = provisions.filter(p => !linkedProvisionIds.has(p.id)).map(p => p.id);

    // Section E analysis
    const measurableOutcomes = outcomes.filter(o => this.isOutcomeMeasurable(o)).length;
    const linkedOutcomeIds = new Set(threads.flatMap(t => t.outcomes.map(o => o.id)));
    const vaguOutcomes = outcomes.filter(o => !this.isOutcomeMeasurable(o)).map(o => o.id);

    return {
      sectionB: {
        needCount: needs.length,
        categorisedNeeds,
        linkedToProvision: linkedNeedIds.size,
        unlinkedNeeds,
      },
      sectionF: {
        provisionCount: provisions.length,
        categorisedProvisions,
        linkedToNeeds: linkedProvisionIds.size,
        linkedToOutcomes: provisionsWithOutcomes.size,
        orphanProvisions,
      },
      sectionE: {
        outcomeCount: outcomes.length,
        measurableOutcomes,
        linkedToNeeds: linkedOutcomeIds.size,
        vaguOutcomes,
      },
    };
  }

  // --------------------------------------------------------------------------
  // Timeline Analysis
  // --------------------------------------------------------------------------

  /**
   * Analyse timeline coherence of outcomes
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private analyseTimelineCoherence(outcomes: any[]): TimelineCoherence {
    const now = new Date();
    const sixMonths = new Date(now.getTime() + 6 * 30 * 24 * 60 * 60 * 1000);
    const twelveMonths = new Date(now.getTime() + 12 * 30 * 24 * 60 * 60 * 1000);

    let shortTerm = 0;
    let mediumTerm = 0;
    let longTerm = 0;
    let nextReview: Date | undefined;

    for (const outcome of outcomes) {
      if (outcome.targetDate) {
        const target = new Date(outcome.targetDate);
        if (target <= sixMonths) shortTerm++;
        else if (target <= twelveMonths) mediumTerm++;
        else longTerm++;

        if (!nextReview || target < nextReview) {
          nextReview = target;
        }
      } else {
        // Default to medium-term if no date specified
        mediumTerm++;
      }
    }

    return {
      shortTermOutcomes: shortTerm,
      mediumTermOutcomes: mediumTerm,
      longTermOutcomes: longTerm,
      reviewDatesSet: outcomes.some(o => o.targetDate),
      nextReviewDate: nextReview,
    };
  }

  // --------------------------------------------------------------------------
  // Score Calculation
  // --------------------------------------------------------------------------

  /**
   * Calculate overall coherence score
   */
  private calculateOverallScore(threads: GoldenThread[], gaps: CoherenceGap[]): number {
    if (threads.length === 0) return 0;

    // Base score from thread completion
    const threadScore = threads.reduce((sum, t) => sum + t.coherenceScore, 0) / threads.length;

    // Penalty for gaps
    const criticalGaps = gaps.filter(g => g.severity === 'critical').length;
    const majorGaps = gaps.filter(g => g.severity === 'major').length;
    const minorGaps = gaps.filter(g => g.severity === 'minor').length;

    const gapPenalty = (criticalGaps * 15) + (majorGaps * 8) + (minorGaps * 3);

    return Math.max(0, Math.round(threadScore - gapPenalty));
  }

  /**
   * Calculate individual thread score
   */
  private calculateThreadScore(provisions: ThreadProvision[], outcomes: ThreadOutcome[]): number {
    let score = 0;

    // Has at least one provision: 40 points
    if (provisions.length > 0) score += 40;

    // Provisions are quantified: 15 points
    if (provisions.length > 0 && provisions.every(p => p.isQuantified)) score += 15;

    // Has at least one outcome: 30 points
    if (outcomes.length > 0) score += 30;

    // Outcomes are measurable: 15 points
    if (outcomes.length > 0 && outcomes.every(o => o.isMeasurable)) score += 15;

    return score;
  }

  /**
   * Determine status from score
   */
  private determineStatus(score: number): CoherenceStatus {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'needs_work';
    return 'poor';
  }

  // --------------------------------------------------------------------------
  // Helper Methods
  // --------------------------------------------------------------------------

  /**
   * Infer provision link from content similarity
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private inferProvisionLink(need: any, provision: any): boolean {
    // Simple keyword matching - would use NLP in production
    const needWords = need.description?.toLowerCase().split(/\s+/) || [];
    const provWords = provision.description?.toLowerCase().split(/\s+/) || [];
    
    const commonWords = needWords.filter((w: string) => 
      provWords.includes(w) && w.length > 4
    );
    
    return commonWords.length >= 2;
  }

  /**
   * Infer outcome link from content similarity
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private inferOutcomeLink(need: any, outcome: any): boolean {
    const needWords = need.description?.toLowerCase().split(/\s+/) || [];
    const outcomeWords = outcome.description?.toLowerCase().split(/\s+/) || [];
    
    const commonWords = needWords.filter((w: string) => 
      outcomeWords.includes(w) && w.length > 4
    );
    
    return commonWords.length >= 2;
  }

  /**
   * Check if provision is quantified
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private isProvisionQuantified(provision: any): boolean {
    const desc = provision.description?.toLowerCase() || '';
    
    // Check for time quantities
    const hasTime = /\d+\s*(hour|minute|session|per\s*(week|day|term))/i.test(desc);
    
    // Check for frequency
    const hasFrequency = /(daily|weekly|fortnightly|monthly|termly|annually)/i.test(desc);
    
    return hasTime || hasFrequency || !!provision.frequency;
  }

  /**
   * Check if outcome is measurable (SMART criteria)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private isOutcomeMeasurable(outcome: any): boolean {
    const desc = outcome.description?.toLowerCase() || '';
    
    // Check for specific targets
    const hasTarget = /will\s+(be able to|achieve|demonstrate|complete|show)/i.test(desc);
    
    // Check for measurement criteria
    const hasMeasurement = /(as evidenced by|measured by|shown by|demonstrated through)/i.test(desc);
    
    // Check for timeline
    const hasTimeline = /by\s+(end of|beginning of|year|term|month|age)/i.test(desc);
    
    return (hasTarget && (hasMeasurement || hasTimeline)) || !!outcome.measurementCriteria;
  }

  /**
   * Categorise outcome timeframe
   */
  private categoriseTimeframe(targetDate?: Date): 'short' | 'medium' | 'long' {
    if (!targetDate) return 'medium';
    
    const now = new Date();
    const monthsDiff = (targetDate.getTime() - now.getTime()) / (30 * 24 * 60 * 60 * 1000);
    
    if (monthsDiff <= 6) return 'short';
    if (monthsDiff <= 12) return 'medium';
    return 'long';
  }

  /**
   * Suggest provision based on need category
   */
  private suggestProvision(category?: string): string {
    const suggestions: Record<string, string> = {
      ASD: 'Structured visual schedule and social communication support [frequency] per week',
      SLCN: 'Direct speech and language therapy intervention, [x] sessions per week',
      SEMH: 'Targeted social/emotional support programme delivered by trained staff',
      SpLD: 'Specialist literacy/numeracy intervention using evidence-based approaches',
      MLD: 'Differentiated curriculum with additional adult support in core subjects',
      HI: 'Specialist teacher of the deaf support and FM system provision',
      VI: 'Specialist teacher of the visually impaired support and adapted materials',
      PD: 'Occupational therapy and physiotherapy as specified, with equipment provision',
    };

    return suggestions[category || ''] || 
      'Specific provision to address identified need, delivered by [provider] at [frequency]';
  }

  /**
   * Truncate text for display
   */
  private truncate(text: string, maxLength: number = 50): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  // --------------------------------------------------------------------------
  // Database Operations
  // --------------------------------------------------------------------------

  /**
   * Save analysis to database
   */
  private async saveAnalysis(analysis: CoherenceAnalysis): Promise<void> {
    await prisma.eHCPCoherenceAnalysis.upsert({
      where: { ehcpId: analysis.ehcpId },
      create: {
        ehcpId: analysis.ehcpId,
        tenantId: this.tenantId,
        overallScore: analysis.overallScore,
        status: analysis.status,
        threadCount: analysis.threadCount,
        completeThreads: analysis.completeThreads,
        incompleteThreads: analysis.incompleteThreads,
        gapCount: analysis.gaps.length,
        criticalGaps: analysis.gaps.filter(g => g.severity === 'critical').length,
        majorGaps: analysis.gaps.filter(g => g.severity === 'major').length,
        minorGaps: analysis.gaps.filter(g => g.severity === 'minor').length,
        analysisData: JSON.stringify(analysis),
        analysedAt: analysis.analysisDate,
      },
      update: {
        overallScore: analysis.overallScore,
        status: analysis.status,
        threadCount: analysis.threadCount,
        completeThreads: analysis.completeThreads,
        incompleteThreads: analysis.incompleteThreads,
        gapCount: analysis.gaps.length,
        criticalGaps: analysis.gaps.filter(g => g.severity === 'critical').length,
        majorGaps: analysis.gaps.filter(g => g.severity === 'major').length,
        minorGaps: analysis.gaps.filter(g => g.severity === 'minor').length,
        analysisData: JSON.stringify(analysis),
        analysedAt: analysis.analysisDate,
      },
    });
  }

  /**
   * Get latest analysis for an EHCP
   */
  async getLatestAnalysis(ehcpId: string): Promise<CoherenceAnalysis | null> {
    const stored = await prisma.eHCPCoherenceAnalysis.findUnique({
      where: { ehcpId },
    });

    if (!stored) return null;

    return JSON.parse(stored.analysisData as string);
  }

  /**
   * Get coherence summary for multiple EHCPs
   */
  async getCoherenceSummary(): Promise<{
    totalEHCPs: number;
    analysedEHCPs: number;
    averageScore: number;
    statusBreakdown: Record<CoherenceStatus, number>;
    commonGapTypes: Array<{ type: GapType; count: number }>;
  }> {
    const analyses = await prisma.eHCPCoherenceAnalysis.findMany({
      where: { tenantId: this.tenantId },
    });

    const totalEHCPs = await prisma.eHCP.count({
      where: { tenantId: this.tenantId },
    });

    const statusBreakdown: Record<CoherenceStatus, number> = {
      excellent: 0,
      good: 0,
      needs_work: 0,
      poor: 0,
    };

    const gapTypeCounts: Record<string, number> = {};
    let totalScore = 0;

    for (const analysis of analyses) {
      statusBreakdown[analysis.status as CoherenceStatus]++;
      totalScore += analysis.overallScore;

      // Parse gaps from stored data
      const data = JSON.parse(analysis.analysisData as string);
      for (const gap of data.gaps || []) {
        gapTypeCounts[gap.type] = (gapTypeCounts[gap.type] || 0) + 1;
      }
    }

    const commonGapTypes = Object.entries(gapTypeCounts)
      .map(([type, count]) => ({ type: type as GapType, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalEHCPs,
      analysedEHCPs: analyses.length,
      averageScore: analyses.length > 0 ? Math.round(totalScore / analyses.length) : 0,
      statusBreakdown,
      commonGapTypes,
    };
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createGoldenThreadService(tenantId: number): GoldenThreadService {
  return new GoldenThreadService(tenantId);
}
