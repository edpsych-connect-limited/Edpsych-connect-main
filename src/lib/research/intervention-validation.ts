/**
 * Research Hub — Intervention Validation (Real-World Evidence)
 *
 * Deterministic, privacy-preserving aggregation helpers for validating intervention
 * effectiveness at scale.
 *
 * This module is intentionally pure (no DB access) so it can be:
 * - unit-tested and CI-validated deterministically
 * - used by API/services once data pipelines are wired
 */

export type GenderCode = 'M' | 'F' | 'X' | 'U';

export type WorkingMemoryLevel = 'low' | 'average' | 'high' | 'unknown';

export type YearGroup = string; // e.g. "3", "Year 3", "Y3" (normalised internally)

export type InterventionValidationRecord = {
	// Intervention identity
	interventionType: string; // e.g. "Precision Teaching"

	// Segment variables (non-identifying)
	yearGroup: YearGroup;
	gender: GenderCode;
	workingMemoryLevel: WorkingMemoryLevel;

	// Measurement (non-identifying)
	baselineScore: number;
	outcomeScore: number;

	// Optional implementation-quality proxy
	fidelityScore?: number; // 0..1

	// Optional time markers (still non-identifying)
	baselineDate?: string; // ISO
	outcomeDate?: string; // ISO
};

export type ConfidenceInterval = {
	level: 0.95;
	lower: number;
	upper: number;
};

export type SegmentKeyParts = {
	yearGroup: string;
	gender: GenderCode;
	workingMemoryLevel: WorkingMemoryLevel;
};

export type SegmentSummary = {
	segment: SegmentKeyParts;
	n: number;
	meanChange: number;
	sdChange: number;
	ci95: ConfidenceInterval | null;
	effectSizeCohenD: number | null;
	meanFidelity: number | null;
};

export type InterventionSummary = {
	interventionType: string;
	totalN: number;
	bySegment: SegmentSummary[];
	topSegmentsByMeanChange: Array<{
		segment: SegmentKeyParts;
		meanChange: number;
		n: number;
	}>;
};

export type ValidationReport = {
	totalRecords: number;
	interventions: InterventionSummary[];
};

function normalizeYearGroup(yearGroup: YearGroup): string {
	const raw = String(yearGroup).trim();
	if (!raw) return 'unknown';

	// Common formats: "Year 3", "Y3", "3"
	const m = raw.match(/(\d{1,2})/);
	if (m) return m[1];
	return raw.toLowerCase();
}

function finiteNumberOrNull(n: number): number | null {
	return Number.isFinite(n) ? n : null;
}

function mean(values: number[]): number {
	if (values.length === 0) return 0;
	return values.reduce((a, b) => a + b, 0) / values.length;
}

function sampleStandardDeviation(values: number[], meanValue: number): number {
	if (values.length < 2) return 0;
	const variance = values.reduce((acc, v) => acc + (v - meanValue) ** 2, 0) / (values.length - 1);
	return Math.sqrt(variance);
}

function ci95FromSample(meanValue: number, sd: number, n: number): ConfidenceInterval | null {
	if (n < 2) return null;
	if (!Number.isFinite(meanValue) || !Number.isFinite(sd)) return null;

	// Normal approximation (z = 1.96). For small n this is approximate; we keep it deterministic.
	const z = 1.96;
	const se = sd / Math.sqrt(n);
	return {
		level: 0.95,
		lower: meanValue - z * se,
		upper: meanValue + z * se,
	};
}

function segmentKeyParts(rec: InterventionValidationRecord): SegmentKeyParts {
	return {
		yearGroup: normalizeYearGroup(rec.yearGroup),
		gender: rec.gender,
		workingMemoryLevel: rec.workingMemoryLevel,
	};
}

function segmentKey(parts: SegmentKeyParts): string {
	return `${parts.yearGroup}|${parts.gender}|${parts.workingMemoryLevel}`;
}

export function validateInterventionEffectivenessAtScale(
	records: InterventionValidationRecord[],
	options?: {
		topKSegments?: number;
		minNForRanking?: number;
	}
): ValidationReport {
	const topK = options?.topKSegments ?? 5;
	const minNForRanking = options?.minNForRanking ?? 30;

	const byIntervention = new Map<string, InterventionValidationRecord[]>();
	for (const r of records) {
		if (!byIntervention.has(r.interventionType)) byIntervention.set(r.interventionType, []);
		byIntervention.get(r.interventionType)!.push(r);
	}

	const interventions: InterventionSummary[] = [];

	for (const [interventionType, rows] of byIntervention.entries()) {
		const bySeg = new Map<string, { parts: SegmentKeyParts; changes: number[]; fidelity: number[] }>();

		for (const row of rows) {
			const parts = segmentKeyParts(row);
			const key = segmentKey(parts);
			if (!bySeg.has(key)) {
				bySeg.set(key, { parts, changes: [], fidelity: [] });
			}
			const bucket = bySeg.get(key)!;

			const change = row.outcomeScore - row.baselineScore;
			if (Number.isFinite(change)) bucket.changes.push(change);

			if (typeof row.fidelityScore === 'number' && Number.isFinite(row.fidelityScore)) {
				bucket.fidelity.push(row.fidelityScore);
			}
		}

		const bySegment: SegmentSummary[] = [];
		for (const seg of bySeg.values()) {
			const n = seg.changes.length;
			const m = mean(seg.changes);
			const sd = sampleStandardDeviation(seg.changes, m);
			const ci95 = ci95FromSample(m, sd, n);

			// Cohen's d for within-segment change (mean/SD of change)
			const d = sd > 0 ? m / sd : null;

			bySegment.push({
				segment: seg.parts,
				n,
				meanChange: m,
				sdChange: sd,
				ci95,
				effectSizeCohenD: finiteNumberOrNull(d ?? NaN),
				meanFidelity: seg.fidelity.length > 0 ? mean(seg.fidelity) : null,
			});
		}

		// Rank segments by mean improvement where we have enough n
		const ranked = [...bySegment]
			.filter(s => s.n >= minNForRanking)
			.sort((a, b) => b.meanChange - a.meanChange)
			.slice(0, topK)
			.map(s => ({ segment: s.segment, meanChange: s.meanChange, n: s.n }));

		interventions.push({
			interventionType,
			totalN: rows.length,
			bySegment: bySegment.sort((a, b) => b.n - a.n),
			topSegmentsByMeanChange: ranked,
		});
	}

	interventions.sort((a, b) => b.totalN - a.totalN);

	return {
		totalRecords: records.length,
		interventions,
	};
}
