# Accessibility Audit Checklist

This checklist captures the WCAG 2.1 AA audit process and verification steps.

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

## Audit Notes
- 2026-01-18: Training flows updated with aria-live loading states and alert semantics; verify in screen reader pass.
- 2026-01-18: Course detail tabs include explicit tab IDs; confirm focus order matches visual layout.
- 2026-01-18: Course player animations now respect prefers-reduced-motion.
- 2026-01-19: Contrast and typography validation pending for core journeys; schedule manual tooling pass (WCAG AA checks).
