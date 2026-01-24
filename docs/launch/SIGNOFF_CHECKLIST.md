# Launch Signoff Checklist

This checklist defines the minimum signoff criteria for enterprise launch.

Status key: [ ] pending, [~] in progress, [x] done

## Accessibility
- [~] WCAG 2.1 AA audit complete
- [~] Keyboard navigation verified for top 15 journeys
- [~] Screen reader verification for top 10 flows

## Performance
- [ ] SLO dashboards green
- [ ] p95 latency within targets for critical workflows
- [~] Bundle size review complete

## Reliability
- [ ] Error budgets within thresholds
- [ ] Incident response playbook verified
- [ ] Rollback plan tested

## Security
- [x] Secret scanning clean (CI `security:scan` passes)
- [ ] Dependency audit complete
- [ ] Privacy and data retention reviewed

## Compliance and Governance
- [ ] DPIA reviewed and signed off
- [ ] AI oversight review completed for automated features
- [ ] Evidence retention and audit trails verified
- [ ] Consent and telemetry policies validated

## Operations
- [ ] On-call rota confirmed for launch window
- [ ] Incident escalation contacts verified
- [ ] Runbooks updated for critical workflows
- [ ] Backup and restore validation complete

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
| YYYY-MM-DD | Accessibility | Codex | Pending | docs/accessibility/AUDIT_CHECKLIST.md |
| YYYY-MM-DD | Performance | Codex | Pending | docs/performance/BUNDLE_REVIEW_STATUS.md |
| YYYY-MM-DD | Reliability | Codex | Pending | docs/observability/SLI_SLO.md |
| YYYY-MM-DD | Security | Codex | Pending | docs/assurance/FINDINGS_REGISTER.md |
| YYYY-MM-DD | Compliance | Codex | Pending | docs/assurance/VENDOR_SUBPROCESSOR_AUDIT.md |
| YYYY-MM-DD | Operations | Codex | Pending | docs/ops/RUNBOOK.md |
| YYYY-MM-DD | Commercial | Codex | Pending | docs/launch/LEGAL_CHECKLIST.md |
| 2026-01-21 | Performance | Codex | In Progress | docs/performance/build-stats-2026-01-21.txt |
| 2026-01-22 | Accessibility | Codex | In Progress | docs/accessibility/AUDIT_CHECKLIST.md |
| 2026-01-22 | Performance | Codex | In Progress | docs/performance/BUNDLE_REVIEW_STATUS.md |
