# Rollout Plan

This rollout plan defines the release flow from staging to production.

## Environments
- Staging: feature verification, integration tests, data migration checks
- Pre-prod: performance and load validation
- Production: phased rollout

## Release Steps
1. Tag release candidate on `main`.
2. Deploy to staging and run smoke tests.
3. Run E2E suite for critical workflows.
4. Validate SLO dashboards and error budget status.
5. Deploy to pre-prod for performance validation.
6. Canary deploy to 10% traffic for 30 minutes.
7. Ramp to 50% traffic for 60 minutes.
8. Full rollout after stability confirmation.

## Rollback Criteria
- Error rate exceeds 2x baseline for 10 minutes.
- p95 latency exceeds 2x baseline for 15 minutes.
- Critical workflow failure rate > 1%.
