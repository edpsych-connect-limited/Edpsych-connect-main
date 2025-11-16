# MASTER ROADMAP – EDPSYCH CONNECT (UPDATED 16 NOV 2025)

## At-a-Glance
- **Platform completion:** 68% claimed → ~50% independently verified (see FORENSIC audit). EHCP/EHCNA automation + training assets were the focus of this refresh.
- **Immediate priorities:** Finish EHCP export QA, record the refreshed training videos, stabilise lint type-safety backlog, and pilot the EPT tokenisation spine.
   Running `npm run lint` still surfaces `no-unused-vars` warnings all over the research foundation modules, AI/ops services, and shared types plus a handful of `import/no-anonymous-default-export` hits, so finalising the backlog requires cleaning every remaining lint signal.
- **Quality gates:** CI (lint/tests), docs (help links, glossary, TOC), training (18/18 scripts + thumbnails), ops reports (run, forensic, continuity, inventory) all regenerated as of this update.

## Pillar Status
| Pillar | Status | Owner | Notes |
|--------|--------|-------|-------|
| EHCP / EHCNA automation | ✅ Templates + LA dashboard shipped | Product + SEND | Needs export QA + notifications (queued). |
| Training & Tours | ⚠️ Scripts + library live; recordings pending | CX + Enablement | Training video library embedded in `/training`; thumbnails now WCAG compliant. |
| Marketplace & Billing | ✅ | Commercial | Stripe ledger + feature gating complete; waiting on feature flag automation metrics. |
| Case / Interventions / Progress | ✅ core, ⚠️ QA | SEND Ops | Progress dashboards exist; need end-to-end tests + case analytics. |
| Research Platform | ✅ governance, ⚠️ dataset automation | Research Ops | Ethics portal deployed; tokenisation incentives to follow. |
| Tokenisation (EPT) | 🆕 Planned | Finance + Engineering | Proposal published; Treasury build begins once approved. |
| Help / Docs / Marketing | ⚠️ | GTM | Landing + help centre need to mirror Session 2 capabilities; training scripts done. |

## Near-Term Delivery Plan
1. **EHCP/EHCNA Completion (Nov Week 3-4)**
   - Wire notifications + export QA evidence.
   - Add SLA analytics to LA dashboard and tie into audit logs.
2. **Training Recording & Tours (Nov Week 4 – Dec Week 1)**
   - Record refreshed scripts; upload to CDN; enable coach marks for onboarding, analytics, EHCP.
   - Update `docs/TRAINING_VIDEO_STATUS.md` with recording + integration timestamps.
3. **Lint / Type-Safety Backlog (Parallel)**
   - Own the `snity-check.md` list; run `npm run lint --max-warnings=0` in CI.
   - Document incremental wins (e.g., `TierPreviewPanel`, `analyticsRouter`, and `AutomatedInterventionEngine`) and keep systematically removing unused args/placeholders so `tools/run-lint.sh` ultimately completes cleanly.
   - This sprint the focus is on unused enums/constants inside `research/foundation` (grant proposals, licensing, security, synthetic data), the wide array of unused args in service modules (AI, institutional management, navigation, subscription features, etc.), and all anonymous default exports flagged by ESLint in `institutional-management` plus Mongo helpers.
4. **Tokenisation Pilot (Dec Week 1 onwards)**
   - Build Treasury + Rewards services per `docs/TOKENISATION_PROPOSAL.md`.
   - Kick off finance/legal workshops for accounting memo and safeguarding overlay.

## Lint Clean-up Workstream
### Current findings
- `npm run lint` still emits hundreds of `no-unused-vars` warnings across the research foundation crates (`grant-proposals`, `licensing`, `security`, `synthetic-data`), the AI/ops service layer (`ai-service`, `gamification`, `recommendation-engine`, `institutional-management`, etc.), and shared type modules that keep unused enums/flags.
- Several files also trip `import/no-anonymous-default-export` (notably `institutional-management/index.ts`, the Mongo helpers under `./src/utils`, and the recommendation-engine adapters) because ESLint wants every default export to be assigned to a named variable first.
### Action plan
- Triage the `lint.log` output by folder, then remove or consume unused constants/enums (or rename them with an `_` prefix) to satisfy `no-unused-vars` without blanket rule suppression.
- Refactor the anonymous default exports by assigning classes/objects to a `const` before exporting and document each replacement in `snity-check.md` so the team can track progress.
- Once each domain (research foundation, services, utils/types) is cleaned up, rerun `tools/run-lint.sh` and `npm run lint --max-warnings=0` so CI can declare the backlog resolved.

## Artifact Index
- **Status / Audits:** `PROJECT_STATUS.md`, `docs/FINAL_BETA_LAUNCH_AUDIT.md`, `docs/FORENSIC_E2E_AUDIT_COMPLETE.md`
- **Training:** `docs/TRAINING_VIDEO_STATUS.md`, `docs/ops/training_content_validation.md`, `src/components/training/TrainingVideoLibrary.tsx`
- **Tokenisation:** `docs/TOKENISATION_PROPOSAL.md`, `docs/PAYMENT_SYSTEM_COMPLETE_GUIDE.md` (token section)
- **Ops:** `docs/ops/gpt5_run_report.md`, `docs/ops/forensic_report.md`, `docs/ops/thumbnail_contrast.md`

## Outstanding Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Training videos still unrecorded | Marketing claim gap | Use refreshed scripts + thumbnails to batch record; embed once uploaded. |
| Feature list misalignment on landing page | Expectation mismatch | Content refresh scheduled with marketing once EHCP + training updates stabilise. |
| Tokenisation accounting complexity | Go-live slip | Finance + legal workshops booked during Phase 0; maintain cash alternative for launch. |
