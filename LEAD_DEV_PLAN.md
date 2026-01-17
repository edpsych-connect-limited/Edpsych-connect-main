# EdPsych Connect - Enterprise Readiness Plan

This document is the single source of truth for the remaining work needed to
reach world-class, enterprise-grade readiness. It is designed to prevent loss
of context and to provide a clear execution checklist.

Status key: [ ] pending, [~] in progress, [x] done

Owner: Codex (Project Lead) + Scott (Sponsor)
Last updated: 2026-01-17

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

-----------------------------------------------------------------------------
2) Guided Workflows + Contextual Help
-----------------------------------------------------------------------------
[ ] Identify top 10 workflows and add guided steps
    - EHCP creation, assessment, report generation
    - EP booking and scheduling
    - Intervention selection and tracking
    - AI review and approval workflow

[ ] Add contextual help modules (inline tips, "why this matters")
    - Must be short, actionable, and tied to data entered on page

[ ] Add "next best action" prompts on key pages

-----------------------------------------------------------------------------
3) Accessibility (WCAG 2.1 AA+) - Deep Audit
-----------------------------------------------------------------------------
[ ] Run keyboard and screen-reader audits for top 15 journeys
    - Document fixes and retest

[ ] Normalize focus states and ARIA across core components

[ ] Add "skip to content" and landmark improvements where missing

[ ] Validate contrast and typography scale for readability

-----------------------------------------------------------------------------
4) Performance + Reliability (Enterprise Grade)
-----------------------------------------------------------------------------
[ ] Define SLIs/SLOs for critical workflows
    - Examples: login, dashboard, assessment submission, report generation

[ ] Add performance tracing for slow pages and API endpoints

[ ] Establish error budgets and alerting thresholds

[ ] Review and reduce heavy client bundles (core pages)

-----------------------------------------------------------------------------
5) Telemetry + Evidence + Governance UX
-----------------------------------------------------------------------------
[ ] Expand telemetry beyond AI into product usage
    - Adoption metrics, drop-off points, task completion time

[ ] Evidence dashboards for governance and audit readiness
    - Human-readable summaries for executives

[ ] Improve AI review UX for clarity (why review is required)

-----------------------------------------------------------------------------
6) Content, Language, and Product Clarity
-----------------------------------------------------------------------------
[ ] Simplify dense pages into decision-support layouts
    - Reduce "wall of text" sections

[ ] Add consistent microcopy for AI features and sensitive workflows

[ ] Standardize error and empty states

-----------------------------------------------------------------------------
7) Delivery + Validation
-----------------------------------------------------------------------------
[ ] Define rollout plan (staging -> production)
[ ] Test plan: unit, integration, E2E on critical journeys
[ ] Accessibility and performance sign-off checklist
[ ] Enterprise launch readiness sign-off
