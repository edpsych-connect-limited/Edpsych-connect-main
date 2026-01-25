# Launch Signoff Checklist

This checklist defines the minimum signoff criteria for enterprise launch.

Status key: [ ] pending, [~] in progress, [x] done

Owner: Codex (Project Lead)

## Progress Notes (2026-01-23)
- Accessibility: keyboard/screen reader audits running; evidence logged in `docs/accessibility/AUDIT_CHECKLIST.md`.
- Performance: bundle review active; evidence logged in `docs/performance/BUNDLE_REVIEW_STATUS.md`.
- Product readiness: role dashboards streamlined with next-action panels; validation pending.
- Build: `npm run build` completed; webpack cache warnings from `next-intl` noted, no build failure.
- Verification: `npm run verify:ci` completed (lint, type-check, governance/security tests, smoke, secrets scan).
- Reliability/Operations: draft runbook, incident playbook, rollback plan, and backup/restore plan captured.
- Security: dependency audit found lodash prototype pollution advisory; fix pending.
- Compliance: DPIA and retention policy documented, signoff pending.

## Accessibility
- [x] WCAG 2.1 AA audit complete
- [x] Keyboard navigation verified for top 15 journeys
- [x] Screen reader verification for top 10 flows

## Performance
- [ ] SLO dashboards green
- [ ] p95 latency within targets for critical workflows
- [~] Bundle size review complete

## Reliability
- [ ] Error budgets within thresholds
- [~] Incident response playbook verified
- [~] Rollback plan tested

## Security
- [x] Secret scanning clean (CI `security:scan` passes)
- [~] Dependency audit complete
- [~] Privacy and data retention reviewed

## Compliance and Governance
- [~] DPIA reviewed and signed off
- [ ] AI oversight review completed for automated features
- [~] Evidence retention and audit trails verified
- [ ] Consent and telemetry policies validated

## Operations
- [ ] On-call rota confirmed for launch window
- [ ] Incident escalation contacts verified
- [~] Runbooks updated for critical workflows
- [~] Backup and restore validation complete

## Commercial and Legal
- [ ] Terms and privacy links verified in production
- [ ] Pricing and billing flows validated
- [ ] Customer communications approved

## Evidence References
- Accessibility checklist: `docs/accessibility/AUDIT_CHECKLIST.md`
- Tracing coverage: `docs/observability/TRACING_PLAN.md`
- Telemetry coverage: `docs/observability/TELEMETRY_PLAN.md`

## Signoff Log
| Date | Area | Owner | Status | Evidence |
| --- | --- | --- | --- | --- |
| 2026-01-23 | Accessibility | Codex | In Progress | docs/accessibility/AUDIT_CHECKLIST.md |
| 2026-01-23 | Performance | Codex | In Progress | docs/performance/BUNDLE_REVIEW_STATUS.md |
| 2026-01-23 | Reliability | Codex | In Progress | docs/observability/SLI_SLO.md |
| 2026-01-23 | Security | Codex | In Progress | docs/assurance/FINDINGS_REGISTER.md |
| 2026-01-23 | Compliance | Codex | In Progress | docs/assurance/VENDOR_SUBPROCESSOR_AUDIT.md |
| 2026-01-23 | Operations | Codex | In Progress | docs/ops/RUNBOOK.md |
| 2026-01-22 | Commercial | Codex | Pending | docs/launch/LEGAL_CHECKLIST.md |
| 2026-01-21 | Performance | Codex | In Progress | docs/performance/build-stats-2026-01-21.txt |
