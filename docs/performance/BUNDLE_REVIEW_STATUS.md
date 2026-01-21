# Bundle Review Status

This log tracks bundle size review evidence and reductions for core pages.

Status key: [ ] pending, [~] in progress, [x] done

## Scope
- Dashboard
- Assessments list + wizard
- Cases list + detail
- EHCP list + modules
- Reports creation

## Evidence Log
- [ ] Baseline build stats recorded (top 10 bundles)
- [ ] Top 5 bundles identified and prioritized
- [ ] Reduction plan documented (dynamic imports, dependency removal)
- [ ] Build stats updated after reductions
- [ ] p95 impact verified against `docs/observability/SLI_SLO.md`

## Notes
- Keep deltas in KB and % with date stamps.

## Capture Method (Baseline + After)
1) Record build stats output (top 10 bundles) and store evidence file path.
2) List the top 5 bundles with size, page association, and suspected causes.
3) Document planned reductions with owners and target dates.
4) Re-run build stats and record deltas in the log below.

## Bundle Log (Fill In)
| Date | Page/Route | Bundle/Chunk | Size (KB) | Delta (KB / %) | Notes | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| YYYY-MM-DD | Dashboard | app/dashboard.js | 000 | 0 / 0% | baseline | docs/performance/build-stats-YYYY-MM-DD.txt |
| YYYY-MM-DD | Assessments | app/assessments.js | 000 | -0 / -0% | after reduction | docs/performance/build-stats-YYYY-MM-DD.txt |
