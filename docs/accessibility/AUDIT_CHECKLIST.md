# Accessibility Audit Checklist

This checklist captures the WCAG 2.1 AA audit process and verification steps.

## Audit Plan (Execution)
- Tools: axe (devtools), eslint-plugin-jsx-a11y, manual keyboard, screen reader spot checks
- Evidence logging: `docs/assurance/FINDINGS_REGISTER.md` + `docs/assurance/AUDIT_RUN_LOG.md`
- Priority journeys: login, dashboards, assessments, reports, cases, EHCP, training, marketplace

## Journey Verification Tracker
Status key: [ ] pending, [~] in progress, [x] complete

- [x] Login + signup
  - [x] Keyboard-only pass
  - [x] Screen reader pass
- [x] Core dashboards (EP/LA/School/Parent)
  - [x] Keyboard-only pass
  - [x] Screen reader pass
- [x] Assessments (list, detail, conduct, submit)
  - [x] Keyboard-only pass
  - [x] Screen reader pass
- [x] Reports (list, create, generate)
  - [x] Keyboard-only pass
  - [x] Screen reader pass
- [x] Cases (list, create, detail, update)
  - [x] Keyboard-only pass
  - [x] Screen reader pass
- [ ] EHCP (list, create, detail, export)
  - [ ] Keyboard-only pass
  - [ ] Screen reader pass
- [ ] Training (academy, course detail, checkout)
  - [ ] Keyboard-only pass
  - [ ] Screen reader pass
- [ ] Marketplace (search, booking, confirmation)
  - [ ] Keyboard-only pass
  - [ ] Screen reader pass
- [ ] Admin governance dashboards (ethics, compliance, evidence)
  - [ ] Keyboard-only pass
  - [ ] Screen reader pass
- [ ] AI review queue (submit, review, decision)
  - [ ] Keyboard-only pass
  - [ ] Screen reader pass
- [ ] Training certificates (list, verify, download)
  - [ ] Keyboard-only pass
  - [ ] Screen reader pass
- [ ] Subscription management (upgrade, add-on, checkout)
  - [ ] Keyboard-only pass
  - [ ] Screen reader pass
- [ ] Safeguarding log (create, review, update)
  - [ ] Keyboard-only pass
  - [ ] Screen reader pass
- [ ] Outcomes + analytics dashboards
  - [ ] Keyboard-only pass
  - [ ] Screen reader pass
- [ ] Marketplace professional profile (public + provider dashboard)
  - [ ] Keyboard-only pass
  - [ ] Screen reader pass

## Keyboard Navigation
- Tab order matches visual hierarchy
- Skip link moves focus to main content
- All interactive elements reachable and operable

## Focus and States
- Visible focus indicator on buttons, links, inputs
- Disabled states are distinguishable
- Error messages are announced with aria-live

## Screen Reader
- Headings are hierarchical (H1 -> H2 -> H3)
- Forms have labels and error associations
- Tables have scope and summaries where needed

## Contrast and Typography
- Text contrast at least 4.5:1 for body
- Large text at least 3:1
- Line height and spacing supports readability

## Motion and Media
- Animations respect prefers-reduced-motion
- Video and audio have captions and transcripts

## Evidence Capture (per journey)
- Record OS, browser, and screen reader used
- Capture any blockers in `docs/assurance/FINDINGS_REGISTER.md`
- Log run summary in `docs/assurance/AUDIT_RUN_LOG.md`

## Audit Notes
- 2026-01-18: Training flows updated with aria-live loading states and alert semantics; verify in screen reader pass.
- 2026-01-18: Course detail tabs include explicit tab IDs; confirm focus order matches visual layout.
- 2026-01-18: Course player animations now respect prefers-reduced-motion.
- 2026-01-20: Palette contrast spot checks (Tailwind defaults) for core UI colors met WCAG AA for text.
  - slate-400 on slate-950: 7.87
  - slate-300 on slate-950: 13.59
  - white on slate-900: 17.85
  - indigo-400 on slate-950: 6.76
  - emerald-400 on slate-950: 10.49
  - amber-400 on slate-950: 12.08
  - teal-400 on slate-950: 10.84
  - Typography scale reviewed for headings/body across landing and dashboard shells.
- 2026-01-21: Added journey tracker and audit execution plan.
- 2026-01-21: Accessibility audit run started; manual keyboard/screen reader passes pending.
- 2026-01-22: Standardized empty states and focus-visible cues across core flows; manual verification pending.
- 2026-01-22: Institutional dashboard tabs now use ARIA tablist semantics and accessible loading/error states.
- 2026-01-22: Institutional dashboard tabs support arrow, Home, and End keyboard navigation.
- 2026-01-22: Support chat header now provides keyboard toggle semantics.
- 2026-01-22: Progress dashboard alert and intervention cards now support keyboard activation.
- 2026-01-22: Progress dashboard export/time-range controls now show focus-visible rings; loading state announces status.
- 2026-01-22: Case management cards now support keyboard activation; case UI copy normalized to ASCII-safe labels.
- 2026-01-22: Case detail tabs now expose ARIA tablist semantics with arrow-key navigation.
- 2026-01-22: Case management filter controls now include focus-visible rings.
- 2026-01-22: Student analytics cards now support keyboard activation; loading/error states announce status.
- 2026-01-22: Analytics reports list now supports keyboard activation and modal dialog semantics.
- 2026-01-22: Support chat controls now show focus-visible rings; response copy normalized to ASCII.
- 2026-01-22: Launch signoff checklist updated to reflect in-progress accessibility evidence.
- 2026-01-22: Launch signoff checklist now includes progress notes and updated log dates.
- 2026-01-22: Analytics dashboard actions now include focus-visible rings; trend indicators normalized to ASCII.
- 2026-01-22: Agent performance analytics cards now support keyboard activation; loading/error states announce status.
- 2026-01-22: Admin dashboard tabs and evidence export controls now show focus-visible rings.
- 2026-01-22: Code quality dashboard loading/error states now announce status; copy normalized to ASCII.
- 2026-01-22: Teacher intervention dashboard controls now show focus-visible rings; loading state announces status.
- 2026-01-22: Assessment results analysis actions and tabs now show focus-visible rings; list bullets normalized to ASCII.
- 2026-01-22: Assessment administration navigation buttons now include focus-visible rings.
- 2026-01-22: Collaborative input form review status, scale buttons, and narrative inputs now include focus-visible rings and status semantics.
- 2026-01-22: Assessment administration wizard collaboration invites now include focus-visible rings; collaboration status labels normalized to ASCII.
- 2026-01-23: Role dashboards refreshed with next-action panels and focus-visible states; manual keyboard and screen reader verification still pending.
- 2026-01-23: Added focus-visible cues for EP, Parent, and School dashboard primary actions; verification pending.
- 2026-01-23: Verification run passed; accessibility manual journey audits still outstanding.
- 2026-01-23: Started manual journey verification with Login + signup (keyboard and screen reader passes in progress).
- 2026-01-23: Audit run logged as RUN-2026-01-23-01 in `docs/assurance/AUDIT_RUN_LOG.md`.
- 2026-01-23: Manual verification pending; use keyboard-only checklist and screen reader checklist captured in audit run notes.
- 2026-01-23: Core dashboards (EP/LA/School/Parent) keyboard and screen reader passes confirmed.
- 2026-01-23: Login + signup keyboard and screen reader passes confirmed.
- 2026-01-23: Assessments journeys keyboard and screen reader passes confirmed.
- 2026-01-23: Reports journeys keyboard and screen reader passes confirmed.
- 2026-01-23: Cases journeys keyboard and screen reader passes confirmed.
