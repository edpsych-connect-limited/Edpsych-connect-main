# Evidence Dashboards

This document defines evidence dashboards for governance and audit readiness.

## Production Scope
- Evidence coverage snapshot (rolling 7/30/90 days)
- AI oversight queue health (pending/overdue/approved/rejected)
- Evidence event volume by workflow and status (cases, EHCP, reports, assessments)
- Policy compliance rollup by tenant

## Executive Overview
- AI model inventory
- Current approvals, pending reviews, and expirations
- Policy compliance status by tenant

## Audit Evidence
- Evidence events by type and time window
- Review decisions with rationale and reviewer
- Provenance links to source policies and artifacts

## Risk Signals
- High-risk model usage alerts
- Unverified claims or missing evidence flags
- Drift or performance regression indicators

## Data Sources
- Evidence telemetry: `src/lib/analytics/evidence-telemetry.ts`
- Review records: `AIReview`, `EvidenceEvent`, `AuditLog` models
- Governance policy defaults: `src/lib/ai-governance/policy-defaults.ts`
- Tracing coverage map: `docs/observability/TRACING_PLAN.md`
- Telemetry coverage map: `docs/observability/TELEMETRY_PLAN.md`

## Minimum Queries
- Evidence events by workflow + status (last 7/30/90 days)
- Reviews by decision outcome + time to decision
- Pending reviews by SLA window
- Tenant compliance summary (policy defaults vs overrides)

## Ownership and Cadence
- Owner: Product + Compliance
- Update cadence: weekly review, monthly executive snapshot
- Audit exports: quarterly or on demand

## Open Gaps
- Confirm UI placement (admin dashboard vs governance hub)
- Confirm SLA thresholds for review queues
- Add evidence export format (CSV/PDF) and retention window

## Access
- Role-based access for Admin, Compliance, and Executive users
- Exportable reports for audits
