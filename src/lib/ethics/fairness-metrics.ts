export interface FairnessRecord {
  group: string;
  predictedPositive: boolean;
  actualPositive?: boolean;
}

export interface FairnessMetricsResult {
  demographicParityGap: number;
  disparateImpact: number;
  equalOpportunityGap: number | null;
  groupRates: Record<string, { positiveRate: number; tpr?: number | null }>;
}

function safeRate(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return numerator / denominator;
}

export function computeFairnessMetrics(records: FairnessRecord[]): FairnessMetricsResult {
  const byGroup: Record<string, { total: number; predictedPositive: number; actualPositive: number; truePositive: number }> = {};

  records.forEach((record) => {
    const group = record.group || 'unknown';
    if (!byGroup[group]) {
      byGroup[group] = { total: 0, predictedPositive: 0, actualPositive: 0, truePositive: 0 };
    }
    const entry = byGroup[group];
    entry.total += 1;
    if (record.predictedPositive) {
      entry.predictedPositive += 1;
    }
    if (record.actualPositive) {
      entry.actualPositive += 1;
      if (record.predictedPositive) {
        entry.truePositive += 1;
      }
    }
  });

  const groupRates: Record<string, { positiveRate: number; tpr?: number | null }> = {};
  const positiveRates: number[] = [];
  const tprs: number[] = [];

  Object.entries(byGroup).forEach(([group, stats]) => {
    const positiveRate = safeRate(stats.predictedPositive, stats.total);
    const tpr = stats.actualPositive > 0 ? safeRate(stats.truePositive, stats.actualPositive) : null;
    groupRates[group] = { positiveRate, tpr };
    positiveRates.push(positiveRate);
    if (tpr !== null) tprs.push(tpr);
  });

  const maxPositive = positiveRates.length ? Math.max(...positiveRates) : 0;
  const minPositive = positiveRates.length ? Math.min(...positiveRates) : 0;
  const demographicParityGap = maxPositive - minPositive;
  const disparateImpact = maxPositive > 0 ? minPositive / maxPositive : 0;

  let equalOpportunityGap: number | null = null;
  if (tprs.length >= 2) {
    equalOpportunityGap = Math.max(...tprs) - Math.min(...tprs);
  }

  return {
    demographicParityGap,
    disparateImpact,
    equalOpportunityGap,
    groupRates
  };
}

export interface FairnessThresholds {
  maxDemographicParityGap: number;
  minDisparateImpact: number;
  maxEqualOpportunityGap: number;
}

export function evaluateFairness(metrics: FairnessMetricsResult, thresholds: FairnessThresholds): { passed: boolean; failures: string[] } {
  const failures: string[] = [];
  if (metrics.demographicParityGap > thresholds.maxDemographicParityGap) {
    failures.push('demographic_parity_gap_exceeded');
  }
  if (metrics.disparateImpact < thresholds.minDisparateImpact) {
    failures.push('disparate_impact_below_threshold');
  }
  if (metrics.equalOpportunityGap !== null && metrics.equalOpportunityGap > thresholds.maxEqualOpportunityGap) {
    failures.push('equal_opportunity_gap_exceeded');
  }

  return {
    passed: failures.length === 0,
    failures
  };
}
