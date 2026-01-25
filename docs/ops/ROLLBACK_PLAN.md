# Rollback Plan

This plan documents the steps to rollback production safely.

## Preconditions
- Identify last known good release tag.
- Confirm rollback permissions in deployment platform.

## Ownership
- Primary owner: Project Lead (Codex)
- Secondary owner: Sponsor (Scott)

## Rollback steps
1) Trigger rollback to last known good release.
2) Verify authentication and dashboard loads.
3) Validate assessments list and case detail pages.
4) Monitor error rates and latency for 30 minutes.

## Post-rollback
- Record incident timeline and corrective actions.
- Re-open change control review for the failed release.

## Verification log
- Last tested: 2026-01-25 (tabletop rollback drill).
- Result: Pass (rollback checklist confirmed).
