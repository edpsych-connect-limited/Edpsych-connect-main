# Research Hub — Intervention Validation (Engineering Evidence)

This repository includes deterministic, CI-enforced proof artifacts that demonstrate the platform’s capability to **validate interventions at scale** using **privacy-preserving, anonymised, segment-level aggregation**.

> Scope note: These artifacts prove the *existence and determinism* of the analytics/validation layer and its ability to operate over “thousands+” records. They do **not** claim that any particular real-world intervention effect exists in production data.

## What exists (repo anchors)

### Deterministic aggregation module

- File: `src/lib/research/intervention-validation.ts`
- Purpose: Pure functions to aggregate anonymised intervention outcome records into segment-level summaries.
- Outputs include:
  - mean change and standard deviation of change
  - 95% confidence intervals (CI95) for the mean change
  - within-segment effect size proxy (Cohen’s d over change scores)
  - optional mean fidelity score

This module is intentionally **pure** (no DB, no network) so it can be reliably tested and validated in CI.

### CI proof: “scale + segmentation + CI95”

- File: `tools/validate-intervention-validation-scale.ts`
- Script: `npm run test:intervention-validation-scale`
- Purpose: Generate a **deterministic synthetic** anonymised dataset of **20,000 records** and assert that:
  - aggregation completes at “thousands+” scale
  - segment ranking works deterministically
  - the top segment has a valid 95% confidence interval with a positive lower bound

This script is designed to be:
- deterministic across runs
- database-independent
- safe to run in CI

## Privacy & data minimisation

The validation pipeline in this repo operates on **anonymised, non-identifying** records (segment variables like year group / working-memory level / gender codes). It does not require names, emails, or direct identifiers.

## What this proves (and what it does not)

### Proves

- A Research Hub validation layer exists in-repo.
- It can aggregate and rank intervention outcomes **at large scale** (e.g. 20,000 records) deterministically.
- It can produce **segment-level** statistical summaries including **CI95**.

### Does not prove

- That a specific intervention effect is present in production data.
- Clinical appropriateness for any specific pupil without human oversight.
- External certification or regulatory approval.

## Related files

- `prisma/schema.prisma` (research & intervention foundation models)
- `src/app/api/interventions/tracking/route.ts` (intervention tracking API endpoints)
- `src/lib/interventions/intervention-tracking.service.ts` (intervention tracking service layer; some areas may be stubbed)
