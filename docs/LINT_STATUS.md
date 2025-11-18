# ESLint Status Report (2025-11-17)

## Summary
- ESLint v9 (flat config) produced **1,707 total issues**: 211 severity-2 errors and 1,496 severity-1 warnings (2025-11-17 run prior to the latest edits).
- Top rules driving volume: `no-unused-vars` (1,425), `react/no-unescaped-entities` (121), `react-hooks/rules-of-hooks` (46), plus several additional React hook and Next.js constraints.
- A parsing failure in `src/research/foundation/citation-tracking/models/impact-metrics.ts` was resolved by exporting the missing `MetricTimePeriod` enum, preventing TypeScript/ESLint from crashing.

## Next Steps
1. Re-run ESLint across the repo to regenerate `lint-report.json` after the enum fix and capture any remaining severity-2 errors.
2. Address the remaining 211 severity-2 errors in priority order, starting with the rules that still appear in the latest report (parsed once the rerun completes).
3. Triage the 1,496 warnings (`no-unused-vars` and others) by either properly using or eliminating the unused imports/variables, and refine `eslint.config.js` to ensure future lint runs stay actionable.
4. Periodically refresh this status document when key milestones (e.g., severity-2 count reaches zero) are achieved.
