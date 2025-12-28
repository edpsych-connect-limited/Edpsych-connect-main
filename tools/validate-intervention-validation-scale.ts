/**
 * Research Hub proof: validate that intervention effectiveness aggregation
 * supports large ("thousands+") anonymised datasets and can produce
 * segment-level summaries with 95% confidence intervals.
 *
 * This is intentionally synthetic and deterministic so it can run in CI
 * without requiring a database.
 */

import { validateInterventionEffectivenessAtScale, type InterventionValidationRecord } from '../src/lib/research/intervention-validation';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

/**
 * Very small deterministic PRNG (LCG).
 */
function makeRng(seed: number) {
  let state = seed >>> 0;
  return () => {
    // Numerical Recipes LCG constants
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

function normalish(rng: () => number): number {
  // Box-Muller transform (deterministic given rng)
  const u1 = Math.max(rng(), 1e-12);
  const u2 = Math.max(rng(), 1e-12);
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function run() {
  const rng = makeRng(123456789);

  const total = 20000; // comfortably "thousands" while remaining CI-friendly

  const records: InterventionValidationRecord[] = [];

  const interventionTypes = ['Precision Teaching', 'Cogmed Working Memory Training'];
  const yearGroups = ['2', '3', '4', '5'];
  const workingMemoryLevels: InterventionValidationRecord['workingMemoryLevel'][] = ['low', 'average', 'high'];
  const genders: InterventionValidationRecord['gender'][] = ['M', 'F'];

  for (let i = 0; i < total; i++) {
    const interventionType = interventionTypes[i % interventionTypes.length];

    const yearGroup = yearGroups[Math.floor(rng() * yearGroups.length)];
    const workingMemoryLevel = workingMemoryLevels[Math.floor(rng() * workingMemoryLevels.length)];
    const gender = genders[Math.floor(rng() * genders.length)];

    const baseline = 50 + normalish(rng) * 10;

    // Controlled effect: Precision Teaching works best for Year 3 boys with low working memory.
    const isTargetSegment =
      interventionType === 'Precision Teaching' &&
      yearGroup === '3' &&
      gender === 'M' &&
      workingMemoryLevel === 'low';

    const meanDelta = isTargetSegment ? 12 : interventionType === 'Precision Teaching' ? 4 : 2;
    const delta = meanDelta + normalish(rng) * 4;

    // Fidelity score: slightly higher in the target segment, but still realistic.
    const fidelityBase = isTargetSegment ? 0.85 : 0.75;
    const fidelity = Math.min(1, Math.max(0, fidelityBase + normalish(rng) * 0.05));

    records.push({
      interventionType,
      yearGroup,
      gender,
      workingMemoryLevel,
      baselineScore: baseline,
      outcomeScore: baseline + delta,
      fidelityScore: fidelity,
    });
  }

  const report = validateInterventionEffectivenessAtScale(records, {
    topKSegments: 5,
    minNForRanking: 50,
  });

  assert(report.totalRecords === total, `Expected ${total} records, got ${report.totalRecords}`);

  const precision = report.interventions.find(i => i.interventionType === 'Precision Teaching');
  assert(precision, 'Missing Precision Teaching summary');

  const top = precision.topSegmentsByMeanChange[0];
  assert(top, 'No top segment produced for Precision Teaching');

  assert(
    top.segment.yearGroup === '3' && top.segment.gender === 'M' && top.segment.workingMemoryLevel === 'low',
    `Expected top segment to be Year 3 M low WM, got ${JSON.stringify(top.segment)}`
  );

  const targetSummary = precision.bySegment.find(
    s => s.segment.yearGroup === '3' && s.segment.gender === 'M' && s.segment.workingMemoryLevel === 'low'
  );
  assert(targetSummary, 'Missing target segment summary');

  assert(targetSummary.n >= 50, `Expected target segment n>=50, got ${targetSummary.n}`);
  assert(targetSummary.ci95, 'Expected 95% CI for target segment');
  assert(
    targetSummary.ci95.lower > 0,
    `Expected positive lower CI bound; got ${JSON.stringify(targetSummary.ci95)}`
  );

  process.stdout.write(
    `OK: intervention validation scale check passed (records=${total}, topSegment=${JSON.stringify(top.segment)})\n`
  );
}

run();
