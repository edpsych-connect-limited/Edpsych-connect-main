# Error Budgets

This document defines error budgets aligned to the SLOs in `docs/observability/SLI_SLO.md`.

## Policy
- Review burn rates weekly and after major releases.
- If error budget burn exceeds 2x in a 7-day window, freeze feature releases.
- If error budget burn exceeds 4x in a 1-day window, initiate incident response.

## Budgets (28-day window)
- 99.95% availability = 0.05% budget = 21.6 minutes downtime
- 99.9% success rate = 0.1% budget = 43.2 minutes equivalent failures
- 99.5% success rate = 0.5% budget = 216 minutes equivalent failures
- 99.0% success rate = 1.0% budget = 432 minutes equivalent failures

## Release Gates
- Block releases if any critical workflow consumes > 50% budget in 7 days.
- Require incident postmortem for any 4x burn event.
