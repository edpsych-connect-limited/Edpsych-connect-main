/**
 * Assessment Scoring Engine
 * Task 3.2.2: Automatic Scoring Algorithms
 *
 * Features:
 * - Automatic scoring for rating scales and multiple choice
 * - Raw score calculation
 * - Standard score conversion (norm-referenced)
 * - Percentile calculation
 * - Confidence intervals
 * - Domain-level scoring
 * - Composite scores
 */

import { AssessmentTemplate, AssessmentDomain } from './assessment-library';

// ============================================================================
// TYPES
// ============================================================================

export interface ScoreResult {
  raw_scores: DomainScore[];
  standard_scores: DomainScore[];
  percentiles: DomainScore[];
  composite_scores: CompositeScore[];
  confidence_intervals?: ConfidenceInterval[];
  interpretation: string;
  strengths: string[];
  weaknesses: string[];
  primary_need?: string;
}

export interface DomainScore {
  domain: AssessmentDomain | string;
  score: number;
  max_possible: number;
  percentage: number;
}

export interface CompositeScore {
  composite_name: string;
  standard_score: number;
  percentile: number;
  classification: string;
  confidence_interval_90?: [number, number];
  confidence_interval_95?: [number, number];
}

export interface ConfidenceInterval {
  score_type: string;
  point_estimate: number;
  ci_90: [number, number];
  ci_95: [number, number];
}

// ============================================================================
// SCORING FUNCTIONS
// ============================================================================

/**
 * Calculate scores from assessment responses
 */
export function calculateScores(
  template: AssessmentTemplate,
  responses: Array<{ item_id: string; response_value: string | number | boolean }>
): ScoreResult {
  const responseMap = new Map(responses.map((r) => [r.item_id, r.response_value]));

  // Calculate raw scores by domain
  const rawScores = calculateRawScores(template, responseMap);

  // For standardized assessments, convert to standard scores
  let standardScores: DomainScore[] = [];
  let percentiles: DomainScore[] = [];
  let compositeScores: CompositeScore[] = [];

  if (template.norm_referenced) {
    standardScores = convertToStandardScores(rawScores);
    percentiles = calculatePercentiles(standardScores);
    compositeScores = calculateCompositeScores(standardScores);
  }

  // Generate interpretation
  const interpretation = generateInterpretation(template, rawScores, standardScores);

  // Identify strengths and weaknesses
  const { strengths, weaknesses } = identifyStrengthsWeaknesses(rawScores, standardScores);

  return {
    raw_scores: rawScores,
    standard_scores: standardScores,
    percentiles,
    composite_scores: compositeScores,
    interpretation,
    strengths,
    weaknesses,
  };
}

/**
 * Calculate raw scores by domain
 */
function calculateRawScores(
  template: AssessmentTemplate,
  responseMap: Map<string, string | number | boolean>
): DomainScore[] {
  const domainScores = new Map<string, { score: number; max: number }>();

  // Initialize domains
  template.domains.forEach((domain) => {
    domainScores.set(domain, { score: 0, max: 0 });
  });

  // Sum up scores by domain
  template.sections.forEach((section) => {
    section.items.forEach((item) => {
      const response = responseMap.get(item.item_id);
      if (response === undefined) return;

      const domainKey = item.domain;
      const current = domainScores.get(domainKey) || { score: 0, max: 0 };

      // Calculate item score
      let itemScore = 0;
      let itemMax = 0;

      switch (item.item_type) {
        case 'rating_scale':
          if (item.rating_scale) {
            itemScore = typeof response === 'number' ? response : 0;
            itemMax = item.rating_scale.max;
          }
          break;

        case 'yes_no':
          itemScore = response === true ? 1 : 0;
          itemMax = 1;
          break;

        case 'numeric':
          itemScore = typeof response === 'number' ? response : 0;
          itemMax = item.scoring_value || 100; // Default max for numeric
          break;

        case 'multiple_choice':
          // Scoring depends on correct answer (would need to be specified in item)
          if (item.scoring_value !== undefined) {
            itemScore = item.scoring_value;
            itemMax = item.scoring_value;
          }
          break;
      }

      domainScores.set(domainKey, {
        score: current.score + itemScore,
        max: current.max + itemMax,
      });
    });
  });

  // Convert to DomainScore array
  return Array.from(domainScores.entries()).map(([domain, data]) => ({
    domain,
    score: data.score,
    max_possible: data.max,
    percentage: data.max > 0 ? (data.score / data.max) * 100 : 0,
  }));
}

/**
 * Convert raw scores to standard scores (M=100, SD=15)
 * This is a simplified conversion - real assessments use norm tables
 */
function convertToStandardScores(rawScores: DomainScore[]): DomainScore[] {
  return rawScores.map((domainScore) => {
    // Simple z-score conversion assuming percentage is z-score proxy
    // Real implementation would use actual norm tables
    const percentage = domainScore.percentage;
    const zScore = (percentage - 50) / 20; // Approximate z-score
    const standardScore = Math.round(100 + zScore * 15);

    return {
      domain: domainScore.domain,
      score: Math.max(40, Math.min(160, standardScore)), // Constrain to typical range
      max_possible: 160,
      percentage: domainScore.percentage,
    };
  });
}

/**
 * Calculate percentiles from standard scores
 */
function calculatePercentiles(standardScores: DomainScore[]): DomainScore[] {
  return standardScores.map((domainScore) => {
    const percentile = standardScoreToPercentile(domainScore.score);

    return {
      domain: domainScore.domain,
      score: percentile,
      max_possible: 99,
      percentage: percentile,
    };
  });
}

/**
 * Convert standard score to percentile rank
 * Uses normal distribution approximation
 */
function standardScoreToPercentile(standardScore: number): number {
  // Convert to z-score (M=100, SD=15)
  const zScore = (standardScore - 100) / 15;

  // Approximate percentile using normal distribution
  // This is simplified - real implementation would use proper statistical tables
  const percentile = normalCDF(zScore) * 100;

  return Math.round(Math.max(1, Math.min(99, percentile)));
}

/**
 * Normal cumulative distribution function (approximation)
 */
function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const probability =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));

  return z > 0 ? 1 - probability : probability;
}

/**
 * Calculate composite scores from domain scores
 */
function calculateCompositeScores(standardScores: DomainScore[]): CompositeScore[] {
  const composites: CompositeScore[] = [];

  // Full Scale Composite (if multiple domains)
  if (standardScores.length > 1) {
    const avgStandardScore =
      standardScores.reduce((sum, ds) => sum + ds.score, 0) / standardScores.length;

    composites.push({
      composite_name: 'Full Scale',
      standard_score: Math.round(avgStandardScore),
      percentile: standardScoreToPercentile(avgStandardScore),
      classification: classifyScore(avgStandardScore),
      confidence_interval_90: [
        Math.round(avgStandardScore - 5),
        Math.round(avgStandardScore + 5),
      ],
      confidence_interval_95: [
        Math.round(avgStandardScore - 7),
        Math.round(avgStandardScore + 7),
      ],
    });
  }

  // Cognitive composites (if applicable)
  const verbalDomains = standardScores.filter((ds) =>
    ds.domain.includes('verbal') || ds.domain.includes('language')
  );
  if (verbalDomains.length > 0) {
    const verbalScore =
      verbalDomains.reduce((sum, ds) => sum + ds.score, 0) / verbalDomains.length;
    composites.push({
      composite_name: 'Verbal Index',
      standard_score: Math.round(verbalScore),
      percentile: standardScoreToPercentile(verbalScore),
      classification: classifyScore(verbalScore),
    });
  }

  const nonverbalDomains = standardScores.filter((ds) =>
    ds.domain.includes('perceptual') || ds.domain.includes('reasoning')
  );
  if (nonverbalDomains.length > 0) {
    const nonverbalScore =
      nonverbalDomains.reduce((sum, ds) => sum + ds.score, 0) / nonverbalDomains.length;
    composites.push({
      composite_name: 'Nonverbal Index',
      standard_score: Math.round(nonverbalScore),
      percentile: standardScoreToPercentile(nonverbalScore),
      classification: classifyScore(nonverbalScore),
    });
  }

  return composites;
}

/**
 * Classify score into descriptive category
 */
function classifyScore(standardScore: number): string {
  if (standardScore >= 130) return 'Very Superior';
  if (standardScore >= 120) return 'Superior';
  if (standardScore >= 110) return 'High Average';
  if (standardScore >= 90) return 'Average';
  if (standardScore >= 80) return 'Low Average';
  if (standardScore >= 70) return 'Borderline';
  return 'Extremely Low';
}

/**
 * Generate interpretation text
 */
function generateInterpretation(
  template: AssessmentTemplate,
  rawScores: DomainScore[],
  standardScores: DomainScore[]
): string {
  let interpretation = `Assessment: ${template.name}\n\n`;

  if (template.norm_referenced && standardScores.length > 0) {
    interpretation += 'STANDARDIZED SCORES:\n';
    interpretation += 'Standard scores are reported with a mean of 100 and standard deviation of 15.\n';
    interpretation += 'The average range is 85-115, encompassing approximately 68% of the population.\n\n';

    standardScores.forEach((ds) => {
      const percentile = standardScoreToPercentile(ds.score);
      const classification = classifyScore(ds.score);
      interpretation += `${ds.domain}: ${ds.score} (${percentile}th percentile) - ${classification}\n`;
    });
  } else {
    interpretation += 'RAW SCORES:\n';
    rawScores.forEach((ds) => {
      interpretation += `${ds.domain}: ${ds.score}/${ds.max_possible} (${Math.round(ds.percentage)}%)\n`;
    });
  }

  interpretation += '\n' + template.interpretation_guidelines.join('\n');

  return interpretation;
}

/**
 * Identify relative strengths and weaknesses
 */
function identifyStrengthsWeaknesses(
  rawScores: DomainScore[],
  standardScores: DomainScore[]
): { strengths: string[]; weaknesses: string[] } {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  const scoresToAnalyze = standardScores.length > 0 ? standardScores : rawScores;

  if (scoresToAnalyze.length < 2) {
    return { strengths, weaknesses };
  }

  // Calculate mean
  const mean =
    scoresToAnalyze.reduce((sum, ds) => sum + ds.score, 0) / scoresToAnalyze.length;

  // Identify scores significantly above/below mean
  const threshold = standardScores.length > 0 ? 10 : 15; // Points for standard scores, percentage for raw

  scoresToAnalyze.forEach((ds) => {
    if (ds.score > mean + threshold) {
      strengths.push(`${ds.domain}: Relative strength`);
    } else if (ds.score < mean - threshold) {
      weaknesses.push(`${ds.domain}: Area of difficulty`);
    }
  });

  return { strengths, weaknesses };
}

/**
 * Calculate discrepancy between two scores
 */
export function calculateDiscrepancy(
  score1: number,
  score2: number
): {
  difference: number;
  significant: boolean;
  interpretation: string;
} {
  const difference = Math.abs(score1 - score2);
  const significant = difference >= 15; // Clinically significant for standard scores

  let interpretation = '';
  if (significant) {
    interpretation = `Significant discrepancy of ${difference} points suggests uneven profile of abilities.`;
  } else {
    interpretation = `Difference of ${difference} points is within normal variation.`;
  }

  return {
    difference,
    significant,
    interpretation,
  };
}

/**
 * Calculate age equivalent from raw score
 * This is a simplified version - real implementation would use norm tables
 */
export function calculateAgeEquivalent(
  rawScore: number,
  maxScore: number,
  chronologicalAge: number
): string {
  const percentage = (rawScore / maxScore) * 100;

  // Simple linear approximation
  // Real implementation would use actual age norm tables
  const ageModifier = (percentage - 50) / 10; // +/- 5 years per 50 percentage points
  const ageEquivalent = chronologicalAge + ageModifier;

  const years = Math.floor(ageEquivalent);
  const months = Math.round((ageEquivalent - years) * 12);

  return `${years}:${months.toString().padStart(2, '0')}`;
}

/**
 * Calculate reading age from standardized reading test
 */
export function calculateReadingAge(rawScore: number): string {
  // Simplified calculation - real implementation would use test-specific norms
  // Example based on common single word reading tests
  const ageInMonths = Math.min(192, Math.max(60, 60 + rawScore * 2)); // 5-16 years range

  const years = Math.floor(ageInMonths / 12);
  const months = ageInMonths % 12;

  return `${years}:${months.toString().padStart(2, '0')}`;
}

/**
 * Generate score summary for reports
 */
export function generateScoreSummary(scoreResult: ScoreResult): string {
  let summary = 'ASSESSMENT RESULTS SUMMARY\n\n';

  if (scoreResult.composite_scores.length > 0) {
    summary += 'COMPOSITE SCORES:\n';
    scoreResult.composite_scores.forEach((comp) => {
      summary += `${comp.composite_name}: ${comp.standard_score} (${comp.percentile}th percentile) - ${comp.classification}\n`;
      if (comp.confidence_interval_95) {
        summary += `  95% CI: ${comp.confidence_interval_95[0]}-${comp.confidence_interval_95[1]}\n`;
      }
    });
    summary += '\n';
  }

  if (scoreResult.strengths.length > 0) {
    summary += 'RELATIVE STRENGTHS:\n';
    scoreResult.strengths.forEach((strength) => {
      summary += `• ${strength}\n`;
    });
    summary += '\n';
  }

  if (scoreResult.weaknesses.length > 0) {
    summary += 'AREAS OF DIFFICULTY:\n';
    scoreResult.weaknesses.forEach((weakness) => {
      summary += `• ${weakness}\n`;
    });
    summary += '\n';
  }

  return summary;
}
