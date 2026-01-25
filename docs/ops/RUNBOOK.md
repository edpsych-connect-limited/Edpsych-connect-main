# Operations Runbook

This runbook captures the minimum operational steps required for launch
readiness and ongoing incident response. Update with production contacts
and tooling references before go-live.

## Scope
- Authentication and session services
- Core dashboards (EP/LA/School/Parent)
- Assessments, reports, cases, EHCP workflows
- Marketplace booking and payments
- Training and certifications

## On-call and escalation
- Primary on-call: Project Lead (Codex)
- Secondary on-call: Sponsor (Scott)
- Escalation path: Primary -> Secondary -> Vendor support (Vercel/Neon/Stripe)
- Incident comms channel: #incidents (Teams/Slack)

## Incident response checklist
1) Triage severity (S1-S4) and confirm user impact.
2) Capture timestamp, scope, and any affected workflows.
3) Check recent deploys and feature flags.
4) Review logs/metrics traces for the failing route or service.
5) Mitigate (feature flag, rollback, rate limit) if needed.
6) Communicate status updates to stakeholders.
7) Create post-incident summary with root cause and actions.

## Rollback procedure (high level)
1) Identify last known good release tag.
2) Trigger rollback in deployment platform.
3) Verify core workflows (login, dashboard, assessments).
4) Confirm monitoring returns to normal thresholds.

## Backup and restore validation
- Database backup schedule: Daily snapshots + PITR (see `docs/ops/BACKUP_RESTORE.md`).
- Restore verification cadence: Monthly (tabletop + staged restore).
- Last restore test: 2026-01-25 (tabletop).

## Monitoring and alerting
- Error budget policy: `docs/observability/ERROR_BUDGET_POLICY.md`
- SLIs/SLOs: `docs/observability/SLI_SLO.md`
- Tracing: `docs/observability/TRACING_PLAN.md`

## Status communications
- Status page URL: https://status.edpsychconnect.world
- Customer comms template: `docs/ops/OWNER_RESPONSIBILITIES.md`
