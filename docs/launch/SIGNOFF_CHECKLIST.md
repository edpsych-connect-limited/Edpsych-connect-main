# Launch Signoff Checklist

This checklist defines the minimum signoff criteria for enterprise launch.

Status key: [ ] pending, [x] done

## Accessibility
- [ ] WCAG 2.1 AA audit complete
- [ ] Keyboard navigation verified for top 15 journeys
- [ ] Screen reader verification for top 10 flows

## Performance
- [ ] SLO dashboards green
- [ ] p95 latency within targets for critical workflows
- [ ] Bundle size review complete

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
