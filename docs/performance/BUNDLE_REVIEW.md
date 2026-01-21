# Bundle Review Plan

This document outlines the bundle review process for core pages.

## Targets
- Dashboard
- Assessments list and wizard
- Cases list and detail
- EHCP list and modules
- Reports creation

## Actions
- Identify top 10 largest client bundles via build stats.
- Split heavy modules behind dynamic imports where safe.
- Remove unused dependencies and duplicated utilities.
- Validate bundle size deltas and p95 load impact.
- Track reductions and evidence in `docs/performance/BUNDLE_REVIEW_STATUS.md`.

## Success Criteria
- 15% reduction on top 5 bundles
- No regression in core workflow timings
