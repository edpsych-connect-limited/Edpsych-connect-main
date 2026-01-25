# Remaining Tasks Handoff (For Dev With Prod Access)

Owner: Project Lead (handoff)
Last updated: 2026-01-25

This document lists the remaining tasks that require production access or external evidence, plus verification steps for the work already completed in-repo.

-----------------------------------------------------------------------------
1) Remaining Tasks (Require Prod/Vendor Access)
-----------------------------------------------------------------------------

Status key: [ ] pending, [~] in progress, [x] done

## Observability signoff (production telemetry)
- [ ] Capture SLO dashboard exports for 28-day window.
  - Evidence files: `docs/observability/SLO_STATUS_SNAPSHOT.md`
  - Update: mark SLO dashboards and p95 latency as green if targets met.
  - Sources: APM/dashboard exports (PDF/CSV) for auth, dashboard, assessments, cases, EHCP, reports, AI review, marketplace, training.
- [ ] Capture error budget snapshots.
  - Evidence files: `docs/observability/ERROR_BUDGET_SNAPSHOT.md`
  - Update: mark error budgets within thresholds if targets met.

## Legal and vendor governance
- [ ] Confirm vendor regions and data residency for active vendors.
  - Update: `docs/assurance/VENDOR_SUBPROCESSOR_AUDIT.md`
  - Vendors: Vercel, Neon, Stripe, SendGrid, Cloudinary (+ any enabled optional vendors).
- [ ] Attach DPA/SCC/IDTA references for active vendors.
  - Update: `docs/assurance/VENDOR_SUBPROCESSOR_AUDIT.md` (Contract/DPA location + transfer mechanism).
- [ ] Legal signoff on DPIA.
  - Update: `docs/legal/DPIA.md` (record legal signoff/date + any required amendments).

## Backup/restore validation (staged restore)
- [ ] Run an actual staged restore test and record results.
  - Update: `docs/ops/BACKUP_RESTORE.md`
  - Include: date, environment, core workflow checks (login, dashboard, case, assessment, EHCP export).

## Launch signoff finalization
- [ ] Update `docs/launch/SIGNOFF_CHECKLIST.md` to mark all remaining items complete once evidence is attached.
  - Performance: SLO dashboards + p95 latency.
  - Reliability: error budget thresholds.
  - Compliance: DPIA legal signoff + vendor governance.

-----------------------------------------------------------------------------
2) Verification Steps For Completed Work
-----------------------------------------------------------------------------

These steps confirm the in-repo changes already completed (no external access required).

## MFA enforcement for privileged roles
[x] Verified via logic audit (`tools/verify-mfa-implementation.ts`) and Cypress test definition (`cypress/e2e/mfa-privileged.cy.ts`)
- Files:
  - `src/app/api/auth/login/route.ts`
  - `src/app/api/auth/mfa/verify/route.ts`
  - `src/app/api/auth/mfa/resend/route.ts`
  - `src/app/[locale]/mfa/page.tsx`
  - `src/lib/email/email-service.ts`
  - `src/lib/auth/hooks.tsx`
  - `src/lib/rate-limit.ts`
  - `src/utils/encryption.ts`
- Verify:
  1) Use a privileged account (SYSTEM_ADMIN/SUPER_ADMIN/ADMIN/etc).
  2) Login should respond with `mfaRequired` and `mfaToken`.
  3) MFA code arrives by email; verify via `/api/auth/mfa/verify`.
  4) UI: `/[locale]/mfa` renders and routes to role dashboards after success.
  5) Retry throttle: MFA verify/resend rate limits enforced.

## Consent + telemetry validation
[x] Verified via logic audit (`tools/verify-consent-telemetry.ts`)
- Evidence doc: `docs/assurance/CONSENT_TELEMETRY_VALIDATION.md`
- Verify:
  1) Cookie banner/settings persist to `edpsych_cookie_consent`.
  2) Analytics scripts initialize only after consent grant.
  3) GDPR consent records are created via `src/lib/gdpr-compliance.ts`.

## AI oversight review
[x] Verified via tooling (`tools/test-ai-governance.ts`) and code review (`AdminInterface.component.tsx`)
- Evidence doc: `docs/assurance/AI_OVERSIGHT_REVIEW.md`
- Verify:
  1) Governance defaults and tests exist (`tools/test-ai-governance.ts`).
  2) Admin ethics dashboards render and show oversight guidance.

## Audit trail verification
[x] Verified via logic audit (`tools/verify-audit-logs.ts`)
- Evidence doc: `docs/assurance/AUDIT_TRAIL_VERIFICATION.md`
- Verify:
  1) Audit log utilities exist and are used in auth/API flows.
  2) Evidence telemetry emits for critical workflows.

## Ops readiness docs
- Updated docs:
  - `docs/ops/RUNBOOK.md`
  - `docs/ops/INCIDENT_PLAYBOOK.md`
  - `docs/ops/ROLLBACK_PLAN.md`
  - `docs/ops/BACKUP_RESTORE.md`
- Verify:
  1) On-call, escalation, status page are filled.
  2) Tabletop verification entries exist.

## Legal checklist
- Evidence doc: `docs/launch/LEGAL_CHECKLIST.md`
- Verify:
  1) Terms, privacy, accessibility pages exist.
  2) Pricing/subscription flows referenced and available.

## Build and verification gates
- Commands:
  - `npm run verify:ci`
  - `npm run build`
- Evidence: `docs/assurance/EVIDENCE_REGISTER.md`, `docs/launch/SIGNOFF_CHECKLIST.md`

-----------------------------------------------------------------------------
3) Files To Update When Remaining Work Is Complete
-----------------------------------------------------------------------------

- `docs/observability/SLO_STATUS_SNAPSHOT.md`
- `docs/observability/ERROR_BUDGET_SNAPSHOT.md`
- `docs/assurance/VENDOR_SUBPROCESSOR_AUDIT.md`
- `docs/legal/DPIA.md`
- `docs/ops/BACKUP_RESTORE.md`
- `docs/launch/SIGNOFF_CHECKLIST.md`

Once those are updated with real production evidence, the signoff checklist can be marked 100% complete.
