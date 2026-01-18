# EdPsych Connect - Enterprise Readiness Plan

This document is the single source of truth for the remaining work needed to
reach world-class, enterprise-grade readiness. It is designed to prevent loss
of context and to provide a clear execution checklist.

Status key: [ ] pending, [~] in progress, [x] done

Owner: Codex (Project Lead) + Scott (Sponsor)
Last updated: 2026-01-18

-----------------------------------------------------------------------------
1) Navigation + Role-Based Journeys
-----------------------------------------------------------------------------
[~] Define primary journeys per role (EP, LA, School, Parent, Admin)
    - Outcomes: 3-5 primary tasks per role with entry points
    - Deliverable: Journey map + success criteria per role

[~] Redesign role dashboards to reduce surface area and improve next actions
    - EP: assessment, report, intervention, time savings
    - LA: case triage, compliance, analytics, approvals
    - School: referrals, collaboration, interventions, progress
    - Parent: child updates, portal actions, communication

[~] Standardize navigation patterns across app and admin
    - Align layout, breadcrumbing, and page titles
    - Remove duplicate or deprecated routes from navigation

[~] Add clear onboarding entry points and tour triggers per role

Progress log:
- 2026-01-17: Added primary workspace CTA + role-based workspace mapping on `/dashboard`.
- 2026-01-17: Centralized role journeys + outcomes in `src/lib/navigation/role-journeys.ts` and surfaced role outcomes on `/dashboard`.
- 2026-01-17: Added role-aware quick tips in contextual help via `src/lib/guidance/contextual-help-tips.ts`.
- 2026-01-17: Added guided tours for EHCP wizard and case creation workflows.
- 2026-01-17: Expanded interventions tour with search guidance and normalized intervention icons to ASCII.
- 2026-01-18: Added guided tours for report generation, AI review queue, and marketplace booking.
- 2026-01-18: Extended contextual help tips for reports, ethics reviews, and booking flows.
- 2026-01-18: Added guided tour and anchors for assessment administration wizard.
- 2026-01-18: Added assessment conduct breadcrumb trail for navigation clarity.
- 2026-01-18: Added breadcrumbs for report creation and marketplace booking.
- 2026-01-18: Added breadcrumbs for assessments and interventions list pages.
- 2026-01-18: Added breadcrumbs for cases and EHCP list pages.
- 2026-01-18: Added breadcrumb trail to case detail view.
- 2026-01-18: Added breadcrumb trail to EHCP detail view.
- 2026-01-18: Added guided tours and anchors for case and EHCP detail views.
- 2026-01-18: Added breadcrumb trail and guided tour for assessment detail view.
- 2026-01-18: Added global skip link for keyboard navigation (main content).
- 2026-01-18: Added next best action prompts across assessments, interventions, cases, and EHCP lists.
- 2026-01-18: Standardized error display for assessments and EHCP lists with retry.
- 2026-01-18: Standardized reports empty state with shared component.
- 2026-01-18: Cleaned non-ASCII control characters from cases list UI placeholders and labels.
- 2026-01-18: Standardized empty states for blog, directory, forum, training catalogs, and annual reviews.
- 2026-01-18: Added aria-live loading status for blog, marketplace, and annual reviews.
- 2026-01-18: Standardized cases list empty state with shared component.
- 2026-01-18: Authored SLI/SLO definitions, error budget policy, and tracing plan docs.
- 2026-01-18: Added rollout, test, and launch signoff checklist docs.
- 2026-01-18: Added AI review queue guidance to explain oversight requirements.
- 2026-01-18: Authored product telemetry plan and evidence dashboard requirements.
- 2026-01-18: Added bundle review plan for core pages.
- 2026-01-18: Removed non-ASCII footer marker for UI consistency.
- 2026-01-18: Standardized EHCP list empty state with shared component.
- 2026-01-18: Added error display handling for blog loading and filters.
- 2026-01-18: Added error display handling for marketplace search.
- 2026-01-18: Wired consent toggles to cookie settings and cleaned privacy copy.
- 2026-01-18: Wrapped app layout with cookie consent provider for analytics gating.
- 2026-01-18: Added consent-aware page view tracking hook.
- 2026-01-18: Added consent-aware feature usage tracking for cases and EHCP entry points.

-----------------------------------------------------------------------------
2) Guided Workflows + Contextual Help
-----------------------------------------------------------------------------
[~] Identify top 10 workflows and add guided steps
    - EHCP creation, assessment, report generation
    - EP booking and scheduling
    - Intervention selection and tracking
    - AI review and approval workflow

[~] Add contextual help modules (inline tips, "why this matters")
    - Must be short, actionable, and tied to data entered on page

[x] Add "next best action" prompts on key pages

-----------------------------------------------------------------------------
3) Accessibility (WCAG 2.1 AA+) - Deep Audit
-----------------------------------------------------------------------------
[~] Run keyboard and screen-reader audits for top 15 journeys
    - Document fixes and retest

[~] Normalize focus states and ARIA across core components
    - focus-visible applied to core button/input/empty-state controls
    - case detail tabs now use tablist/tabpanel semantics
    - EHCP section navigation marks active item
    - assessment wizard step nav and progress bar now include ARIA
    - assessment and intervention filters clarified with ARIA labels
    - loading spinners now expose role="status" where relevant
    - dashboard loading state exposes role="status"
    - table headers include scope and table labels for key grids

[x] Add "skip to content" and landmark improvements where missing

[ ] Validate contrast and typography scale for readability

-----------------------------------------------------------------------------
4) Performance + Reliability (Enterprise Grade)
-----------------------------------------------------------------------------
[x] Define SLIs/SLOs for critical workflows
    - Examples: login, dashboard, assessment submission, report generation

[~] Add performance tracing for slow pages and API endpoints

[x] Establish error budgets and alerting thresholds

[~] Review and reduce heavy client bundles (core pages)

-----------------------------------------------------------------------------
5) Telemetry + Evidence + Governance UX
-----------------------------------------------------------------------------
[~] Expand telemetry beyond AI into product usage
    - Adoption metrics, drop-off points, task completion time

[~] Evidence dashboards for governance and audit readiness
    - Human-readable summaries for executives

[~] Improve AI review UX for clarity (why review is required)

-----------------------------------------------------------------------------
6) Content, Language, and Product Clarity
-----------------------------------------------------------------------------
[ ] Simplify dense pages into decision-support layouts
    - Reduce "wall of text" sections

[ ] Add consistent microcopy for AI features and sensitive workflows

[~] Standardize error and empty states
    - error display with retry now in assessments, cases, EHCP, interventions
    - reports empty state now uses shared EmptyState component

-----------------------------------------------------------------------------
7) Delivery + Validation
-----------------------------------------------------------------------------
[x] Define rollout plan (staging -> production)
[x] Test plan: unit, integration, E2E on critical journeys
[x] Accessibility and performance sign-off checklist
[ ] Enterprise launch readiness sign-off
