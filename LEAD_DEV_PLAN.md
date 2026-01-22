# EdPsych Connect - Enterprise Readiness Plan

This document is the single source of truth for the remaining work needed to
reach world-class, enterprise-grade readiness. It is designed to prevent loss
of context and to provide a clear execution checklist.

Status key: [ ] pending, [~] in progress, [x] done

Owner: Codex (Project Lead) + Scott (Sponsor)
Last updated: 2026-01-21

-----------------------------------------------------------------------------
Execution Timeline (Target)
-----------------------------------------------------------------------------
Goal: Complete all [~] in-progress items and close remaining [ ] tasks.

Week 1 (Days 1-5)
- Close all [~] items in Sections 1-2 (journeys, dashboards, contextual help)
- Finish accessibility keyboard + screen-reader audits for top 15 journeys
- Log findings and fixes in `docs/accessibility/AUDIT_CHECKLIST.md`

Week 2 (Days 6-10)
- Bundle size review + reductions for core pages (perf signoff)
- Evidence dashboards production placement (admin governance view)
- Export formats (CSV/PDF/JSON) and audit-ready snapshots

Week 3 (Days 11-15)
- Launch readiness signoff items (Security, Compliance, Operations)
- DPIA, data retention, consent policy confirmations
- Runbook + rollback verification evidence recorded

Week 4 (Days 16-20)
- Final QA sweep, regression checks, and signoff closure
- Complete any remaining [ ] items and re-verify build

-----------------------------------------------------------------------------
Continuation Note (For New Thread)
-----------------------------------------------------------------------------
Last sprint focus: evidence dashboards and governance placement, accessibility audit planning, bundle review logging.
Latest shipped updates: evidence metrics API expanded; ethics evidence dashboard with JSON/CSV export; admin compliance dashboard shows evidence snapshot; accessibility audit execution plan + journey tracker; bundle review status log.
Immediate next actions:
1) Run keyboard + screen reader audits for top journeys; log results in `docs/accessibility/AUDIT_CHECKLIST.md`.
2) Capture bundle size baselines and reductions in `docs/performance/BUNDLE_REVIEW_STATUS.md`.
3) Close remaining launch signoff items in `docs/launch/SIGNOFF_CHECKLIST.md`.
4) Continue clearing [~] items in Sections 1-5 and update progress log.

-----------------------------------------------------------------------------
1) Navigation + Role-Based Journeys
-----------------------------------------------------------------------------
[x] Define primary journeys per role (EP, LA, School, Parent, Admin)
    - Outcomes: 3-5 primary tasks per role with entry points
    - Deliverable: Journey map + success criteria per role

[~] Redesign role dashboards to reduce surface area and improve next actions
    - EP: assessment, report, intervention, time savings
    - LA: case triage, compliance, analytics, approvals
    - School: referrals, collaboration, interventions, progress
    - Parent: child updates, portal actions, communication

[x] Standardize navigation patterns across app and admin
    - Align layout, breadcrumbing, and page titles
    - Remove duplicate or deprecated routes from navigation

[x] Add clear onboarding entry points and tour triggers per role

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
- 2026-01-18: Added consent-aware feature usage tracking for assessment entry points.
- 2026-01-18: Added consent-aware feature usage tracking for interventions entry points.
- 2026-01-18: Added consent-aware report workflow tracking in report form.
- 2026-01-18: Added consent-aware marketplace search tracking.
- 2026-01-18: Added consent-aware blog search and filter tracking.
- 2026-01-18: Added accessibility audit checklist document.
- 2026-01-18: Added consent-aware training catalogue usage tracking.
- 2026-01-18: Added consent-aware usage tracking for training academy and marketplace flows.
- 2026-01-18: Added consent-aware usage tracking for training course detail view and tab engagement.
- 2026-01-18: Normalized training UI copy to ASCII-safe text for deployment stability.
- 2026-01-18: Added consent-aware usage tracking for training dashboard, certificates, and checkout flows.
- 2026-01-18: Normalized training dashboard, certificates, and checkout copy to ASCII-safe text.
- 2026-01-18: Fixed checkout hook dependency warning and training course header copy parsing issue.
- 2026-01-18: Added explicit tab IDs for training course detail tablist accessibility.
- 2026-01-18: Stabilized training course detail analytics hook dependencies.
- 2026-01-18: Added aria-live loading status for training academy, marketplace, and checkout.
- 2026-01-18: Fixed training course detail Tailwind class typo for consistent hover transitions.
- 2026-01-18: Added aria-live loading status for training catalogue spinner.
- 2026-01-18: Expanded launch signoff checklist to enterprise coverage areas.
- 2026-01-18: Stabilized training dashboard analytics hook dependencies.
- 2026-01-18: Added training academy, marketplace, and certificates view tracking with stable hook dependencies.
- 2026-01-18: Added consent-aware tracking and loading status for the training course player.
- 2026-01-18: Added alert semantics for training checkout error messaging.
- 2026-01-18: Added aria-live loading status for course player fallback state.
- 2026-01-18: Added evidence telemetry for training checkout payment intent creation.
- 2026-01-18: Added evidence telemetry for training enrollment creation.
- 2026-01-18: Added evidence telemetry for training course completion events.
- 2026-01-18: Logged accessibility audit notes for training flows and course tabs.
- 2026-01-18: Added evidence telemetry for marketplace booking payment intents and confirmations.
- 2026-01-18: Expanded tracing plan to include training workflows.
- 2026-01-18: Added dialog and status semantics to course player celebration and merit animation.
- 2026-01-18: Added observability evidence entry and refreshed evidence register date.
- 2026-01-18: Expanded marketplace payment intent tracing to cover common error paths.
- 2026-01-18: Expanded marketplace booking confirmation tracing for invalid date and missing booking cases.
- 2026-01-18: Added evidence telemetry for report generation API.
- 2026-01-18: Added evidence telemetry for assessment report upload flow.
- 2026-01-18: Added evidence telemetry for EHCP export generation.
- 2026-01-18: Updated course player animations to respect prefers-reduced-motion.
- 2026-01-18: Added evidence telemetry for EHCP evidence pack generation.
- 2026-01-18: Expanded tracing plan to include EHCP evidence pack workflow.
- 2026-01-18: Added evidence telemetry for assessment update endpoint.
- 2026-01-18: Expanded tracing plan to include assessment report uploads.
- 2026-01-18: Added evidence telemetry for case creation workflow.
- 2026-01-18: Added evidence telemetry for assessment creation workflow.
- 2026-01-18: Added evidence telemetry for intervention generation workflow.
- 2026-01-18: Expanded tracing plan to include intervention workflows.
- 2026-01-19: Added evidence telemetry for case list and case detail workflows.
- 2026-01-19: Added evidence telemetry for case update and close workflows.
- 2026-01-19: Added evidence telemetry for interventions tracking API.
- 2026-01-19: Added evidence telemetry for report draft save and report list workflows.
- 2026-01-19: Tracked follow-up to fix evidence telemetry typing for case endpoints after TS build failure.
- 2026-01-19: Added evidence telemetry for AI review submission and decision workflows.
- 2026-01-19: Added evidence telemetry for interventions list, detail, update, and discontinue workflows.
- 2026-01-19: Added evidence telemetry for authentication login, refresh, and logout workflows.
- 2026-01-19: Added evidence telemetry for progress dashboard load workflow.
- 2026-01-19: Added evidence telemetry for LA dashboard load workflow.
- 2026-01-19: Added evidence telemetry for assessment submission workflow.
- 2026-01-19: Added evidence telemetry for core EHCP list, create, update, delete, and export workflows.
- 2026-01-19: Added evidence telemetry for assessment instance create and update workflows.
- 2026-01-19: Added evidence telemetry for marketplace dashboard load workflow.
- 2026-01-19: Added evidence telemetry for assessment instance detail workflow.
- 2026-01-19: Added evidence telemetry for outcomes tracking record and analytics workflows.
- 2026-01-19: Expanded tracing plan to include outcomes workflows.
- 2026-01-19: Logged contrast/typography audit as pending manual pass in accessibility checklist.
- 2026-01-19: Added AI microcopy guidance to tutoring and ethics review experiences.
- 2026-01-19: Added decision support summary panel to outcomes page to reduce dense content.
- 2026-01-19: Added report workflow microcopy and decision support panel in report generator.
- 2026-01-19: Added decision support panel to progress tracking page.
- 2026-01-19: Added AI microcopy guidance to the problem solver experience.
- 2026-01-19: Added decision support panel to safeguarding concerns view and removed control character from header.
- 2026-01-19: Added decision support summary to EHCP list page.
- 2026-01-19: Added decision support panel to cases list page.
- 2026-01-19: Added decision support panel to interventions list page.
- 2026-01-19: Added report list microcopy and decision support panel.
- 2026-01-19: Normalized marketplace copy to ASCII-safe currency and separators.
- 2026-01-19: Clarified marketplace professional registration compliance copy and normalized currency label.
- 2026-01-19: Normalized marketplace dashboard currency and removed non-ASCII emoji for deployment stability.
- 2026-01-19: Normalized login and signup UI copy to ASCII-safe characters and cleaned placeholders.
- 2026-01-19: Normalized beta login copy, lists, and placeholders to ASCII-safe content.
- 2026-01-19: Normalized subscription add-on pricing copy and removed non-ASCII currency markers.
- 2026-01-19: Normalized subscription management copy and card masking to ASCII-safe content.
- 2026-01-19: Normalized forum category icons and separators to ASCII-safe labels.
- 2026-01-19: Normalized careers salary and benefit copy to ASCII-safe currency formatting.
- 2026-01-19: Normalized help article view copy and feedback labels to ASCII-safe text.
- 2026-01-19: Normalized about page punctuation to ASCII-safe separators.
- 2026-01-19: Normalized contact page call-to-action arrow to ASCII-safe text.
- 2026-01-19: Escaped CTA arrows in about/contact and pricing back-link for JSX safety.
- 2026-01-19: Escaped remaining "Back to Home" CTA arrows for about/contact build fix.
- 2026-01-19: Normalized terms, privacy, blog, teachers, tokenisation, provision, reset-password, SENCO audit, and admin copy to ASCII-safe text.
- 2026-01-19: Normalized remaining locale pages (dashboards, EHCP modules, safeguarding, and marketplace) to ASCII-safe text.
- 2026-01-19: Added decision support panel to tokenisation page to reduce dense scanning.
- 2026-01-19: Added decision support panel to subscription management page.
- 2026-01-19: Added decision support panel to teacher gamification dashboard.
- 2026-01-19: Added decision support panel to EP dashboard.
- 2026-01-19: Added decision support panel to case detail view.
- 2026-01-19: Added decision support panel to intervention detail view.
- 2026-01-19: Added decision support panel to EHCP detail view.
- 2026-01-19: Added decision support panel to LA dashboard.
- 2026-01-19: Added decision support panel to marketplace profile view.
- 2026-01-19: Added decision support panel to LA panel dashboard.
- 2026-01-19: Added decision support panel to parent dashboard.
- 2026-01-19: Added decision support panel to multi-agency collaboration hub.
- 2026-01-19: Added decision support panel to behaviour tracker.
- 2026-01-19: Added decision support panel to intervention scheduler.
- 2026-01-19: Added decision support panel to safeguarding log.
- 2026-01-19: Added decision support panel to SENCO dashboard.
- 2026-01-19: Added decision support panel to public professional profile.
- 2026-01-19: Added decision support panel to marketplace professional dashboard.
- 2026-01-19: Added decision support panel to wellbeing survey dashboard.
- 2026-01-19: Added decision support panel to certificate verification page.
- 2026-01-20: Added decision support panel to transitions planning page.
- 2026-01-20: Added decision support panel to assessment detail view.
- 2026-01-20: Added decision support panel to report creation page.
- 2026-01-20: Added decision support panel to subscription add-on page.
- 2026-01-20: Added decision support panel to training academy page.
- 2026-01-20: Added decision support panel to training course detail page.
- 2026-01-20: Added decision support panel to training dashboard page.
- 2026-01-20: Added decision support panel to training marketplace page.
- 2026-01-20: Added decision support panel to training certificates page.
- 2026-01-20: Added decision support panel to training checkout page.
- 2026-01-20: Added decision support panel to assessment creation page.
- 2026-01-20: Added decision support panel to case creation page.
- 2026-01-20: Added decision support panel to EHCP creation page.
- 2026-01-20: Added decision support panel to intervention creation page.
- 2026-01-20: Added decision support panel to marketplace booking request page.
- 2026-01-20: Added decision support panel to marketplace registration page.
- 2026-01-20: Added decision support panel to subscription checkout page.
- 2026-01-20: Added decision support panel to provision mapping page.
- 2026-01-20: Added AI guidance microcopy to the AI agents experience.
- 2026-01-20: Added AI governance microcopy to the algorithm marketplace.
- 2026-01-20: Added AI orchestration notice to the digit-span assessment task.
- 2026-01-20: Added AI demo notice to the interactive demo landing page.
- 2026-01-20: Added AI translation notice to the demo translator experience.
- 2026-01-20: Added AI sandbox notice to the assessment demo.
- 2026-01-20: Added AI sandbox notice to the EHCP demo.
- 2026-01-20: Added AI audit notice to the onboarding demo.
- 2026-01-20: Added decision support panel to analytics dashboard.
- 2026-01-20: Added decision support panel to research hub page.
- 2026-01-20: Added decision support panel to research ethics submission page.
- 2026-01-20: Added decision support panel to professional networking page.
- 2026-01-20: Added decision support panel to institutional management page.
- 2026-01-20: Added decision support panel to the help centre landing page.
- 2026-01-20: Added decision support panel to GDPR guidance page.
- 2026-01-20: Added decision support panel to privacy policy page.
- 2026-01-20: Added decision support panel to terms of service page.
- 2026-01-20: Polished landing hero and crisis section punctuation and corrected GBP currency display.
- 2026-01-20: Refined landing ecosystem headline punctuation and normalized crisis currency label.
- 2026-01-20: Normalized landing pricing defaults to GBP labels for front-of-house polish.
- 2026-01-20: Logged palette contrast checks and typography review in accessibility audit checklist.
- 2026-01-20: Updated tracing and telemetry plans with coverage status across core workflows.
- 2026-01-20: Completed decision-support layout coverage across dense pages.
- 2026-01-20: Standardized AI guidance microcopy across AI-powered workflows and demos.
- 2026-01-20: Added launch signoff evidence references and security scan status.
- 2026-01-20: Expanded launch readiness breakdown to prevent context loss.
- 2026-01-20: Defined evidence dashboard production scope, data sources, and ownership.
- 2026-01-20: Standardized SENCO needs breakdown empty state with shared EmptyState styling.
- 2026-01-20: Expanded ethics admin evidence tab with production coverage snapshot and queue health.
- 2026-01-20: Expanded evidence metrics API with workflow/status/aging and added JSON export.
- 2026-01-20: Added CSV export for evidence dashboard snapshots.
- 2026-01-21: Added accessibility audit execution plan and journey tracker.
- 2026-01-21: Added bundle review status log to track reductions and evidence.
- 2026-01-21: Added evidence snapshot panel to admin compliance dashboard.
- 2026-01-21: Hardened algorithm creation API to require authenticated creator ID.
- 2026-01-21: Restricted waitlist statistics endpoint to authenticated admin roles.
- 2026-01-21: Enforced authentication on assessment submission API and normalized tenant context.
- 2026-01-21: Restricted system admin dashboard to SUPER_ADMIN and hid link from non-owner roles.
- 2026-01-21: Documented platform owner vs tenant admin role boundaries.
- 2026-01-21: Expanded client role hierarchy to include tenant admin roles.
- 2026-01-21: Hardened edge proxy to require SUPER_ADMIN for /admin access.
- 2026-01-21: Updated login redirects so only SUPER_ADMIN routes to /admin.
- 2026-01-21: Updated systematic role testing plan to include platform admin scenario.
- 2026-01-21: Aligned admin studio CTA to non-owner landing route.
- 2026-01-21: Split owner vs platform admin role journeys to avoid /admin links for ADMIN.
- 2026-01-21: Attempted bundle baseline build; capture timed out before stats emitted.
- 2026-01-21: Completed bundle build; bundle sizes not emitted, analyzer still required.
- 2026-01-21: Generated bundle analyzer reports (client/edge/node) for baseline sizing.
- 2026-01-21: Enabled bundle analyzer in next.config.mjs (ANALYZE=true).
- 2026-01-21: Analyzer reports generated but bundle parsing was limited; manual review still required.
- 2026-01-21: Captured top client chunk sizes from build output for baseline bundle review.
- 2026-01-21: Started accessibility audit run (RUN-2026-01-21-03).
- 2026-01-21: Logged performance signoff entry for bundle review evidence.
- 2026-01-21: Logged accessibility audit run status in checklist.
- 2026-01-21: Lazy-loaded jsPDF invoice generation and split training dashboard chart into a dynamic chunk; documented bundle reduction plan.
- 2026-01-21: Deferred institutional performance charts via dynamic import to keep recharts off the main bundle.
- 2026-01-21: Deferred assessment PDF report generation and type-only report imports to reduce client jsPDF exposure.
- 2026-01-21: Captured post-reduction bundle chunk sizes and route map evidence after build.
- 2026-01-21: Post-assessment-report build completed; top chunk sizes unchanged from prior reduction run.
- 2026-01-21: Deferred EHCP PDF export to lazy-load jsPDF on demand.
- 2026-01-21: Replaced non-ASCII trend arrows with ASCII-safe copy in institutional dashboards.
- 2026-01-21: Post-EHCP build completed; top chunk sizes unchanged from prior reduction run.
- 2026-01-21: Documented role journeys and success criteria in `docs/ROLE_JOURNEYS.md`.
- 2026-01-21: Standardized navigation links for parent/student studios and added role-specific tours + onboarding checkpoint on the dashboard.
- 2026-01-21: Documented top workflows and tours in `docs/guidance/GUIDED_WORKFLOWS.md`; expanded contextual help tips for key routes.
- 2026-01-21: Clarified AI review queue with "why this review matters" checklist in ethics admin.
- 2026-01-21: Standardized ethics review empty state using shared EmptyState component.
- 2026-01-21: Standardized ethics admin monitors, incidents, and assessments empty states with shared EmptyState.
- 2026-01-21: Deferred intervention, assessment, and course catalogs in school/parent dashboards via dynamic import to reduce initial bundles.
- 2026-01-22: Captured bundle analyzer outputs and top client chunk sizes after dashboard library deferral (`docs/performance/chunk-sizes-2026-01-22.txt`).
- 2026-01-22: Deferred gamification battle royale and coding dojo engines via dynamic import to keep Three.js off initial gamification bundle.
- 2026-01-22: Deferred intervention library dataset loading to on-demand import for `/interventions/library`.
- 2026-01-22: Deferred intervention library and designer components via dynamic import on interventions pages to reduce initial bundle load.
- 2026-01-22: Captured post-intervention deferral bundle evidence (`docs/performance/chunk-sizes-2026-01-22-post-interventions.txt`).
- 2026-01-22: Replaced beta register FontAwesome react-icons with lucide-react to shrink the beta register bundle.
- 2026-01-22: Replaced battle royale react-icons with lucide-react to reduce gamification chunk size.
- 2026-01-22: Captured post-beta icon swap bundle evidence (`docs/performance/chunk-sizes-2026-01-22-post-beta-icons.txt`).
- 2026-01-22: Captured post-battle icon swap bundle evidence (`docs/performance/chunk-sizes-2026-01-22-post-battle-icons.txt`).

-----------------------------------------------------------------------------
2) Guided Workflows + Contextual Help
-----------------------------------------------------------------------------
[x] Identify top 10 workflows and add guided steps
    - EHCP creation, assessment, report generation
    - EP booking and scheduling
    - Intervention selection and tracking
    - AI review and approval workflow

[x] Add contextual help modules (inline tips, "why this matters")
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

[x] Validate contrast and typography scale for readability

-----------------------------------------------------------------------------
4) Performance + Reliability (Enterprise Grade)
-----------------------------------------------------------------------------
[x] Define SLIs/SLOs for critical workflows
    - Examples: login, dashboard, assessment submission, report generation

[x] Add performance tracing for slow pages and API endpoints

[x] Establish error budgets and alerting thresholds

[~] Review and reduce heavy client bundles (core pages)
    - Bundle review status log: `docs/performance/BUNDLE_REVIEW_STATUS.md`

-----------------------------------------------------------------------------
5) Telemetry + Evidence + Governance UX
-----------------------------------------------------------------------------
[x] Expand telemetry beyond AI into product usage
    - Adoption metrics, drop-off points, task completion time

[~] Evidence dashboards for governance and audit readiness
    - Production scope, data sources, and ownership documented
    - Human-readable summaries for executives
    - Ethics admin evidence tab aligned to production snapshot
    - CSV export enabled for evidence snapshots
    - Compliance dashboard now shows evidence governance snapshot

[x] Improve AI review UX for clarity (why review is required)

-----------------------------------------------------------------------------
6) Content, Language, and Product Clarity
-----------------------------------------------------------------------------
[x] Simplify dense pages into decision-support layouts
    - Reduce "wall of text" sections

[x] Add consistent microcopy for AI features and sensitive workflows

[~] Standardize error and empty states
    - error display with retry now in assessments, cases, EHCP, interventions
    - reports empty state now uses shared EmptyState component
    - SENCO needs breakdown now uses shared EmptyState component
    - ethics admin monitors/incidents/assessments empty states use shared EmptyState

-----------------------------------------------------------------------------
7) Delivery + Validation
-----------------------------------------------------------------------------
[x] Define rollout plan (staging -> production)
[x] Test plan: unit, integration, E2E on critical journeys
[x] Accessibility and performance sign-off checklist
[~] Enterprise launch readiness sign-off
    - Source of truth: `docs/launch/SIGNOFF_CHECKLIST.md`
    - Accessibility: WCAG audit, keyboard, screen reader verification
    - Performance: SLO dashboards, p95 latency, bundle review
    - Reliability: error budgets, incident playbook, rollback test
    - Security: dependency audit, privacy/data retention review
    - Compliance: DPIA, AI oversight, evidence retention, consent policy
    - Operations: on-call, escalation, runbooks, backups
    - Commercial: legal links, pricing/billing flows, comms approval

-----------------------------------------------------------------------------
Outstanding Focus (Next)
-----------------------------------------------------------------------------
[ ] Close enterprise launch readiness checklist (`docs/launch/SIGNOFF_CHECKLIST.md`)
[ ] Complete keyboard + screen reader audits and log fixes
[ ] Finish bundle review for core pages and record targets
[ ] Implement evidence dashboard production scope (governance admin view + exports)
[ ] Standardize remaining error + empty states in edge flows
