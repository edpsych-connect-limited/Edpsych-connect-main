# Accessibility Audit (WCAG 2.2 AA) – Internal Readiness

This is an internal readiness checklist for an external WCAG audit.

## Target

- Meet **WCAG 2.2 AA** for user-facing functionality.

## Audit window
- Target window: 2026-01-21 to 2026-02-07
- Evidence location: `docs/accessibility/AUDIT_CHECKLIST.md`
- Findings log: `docs/assurance/FINDINGS_REGISTER.md`

## Minimum internal evidence

### Automated checks
- [ ] axe / eslint-plugin-jsx-a11y rules (where applicable)
- [ ] Critical flows scanned (login, dashboards, core forms)

### Manual checks (must do)
- [ ] Keyboard-only navigation through critical paths
- [ ] Screen reader sanity checks (NVDA/JAWS/VoiceOver)
- [ ] Focus visibility + logical order
- [ ] Form labels, errors, and instructions
- [ ] Color contrast for text and UI controls

## Documentation outputs

- A11y issues register
- Remediation PR links
- Final conformance statement / VPAT (if needed)

Last updated: 2026-01-21
