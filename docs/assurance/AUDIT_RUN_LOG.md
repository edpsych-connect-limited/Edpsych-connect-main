# Audit Run Log (Internal)

Each audit run records **what was tested**, **where**, and **what evidence was produced**.

## RUN-2025-12-15-01

- **Run ID:** RUN-2025-12-15-01
- **Date/time (UTC):** 2025-12-15
- **Commit SHA/tag:** TBD
- **Environment:** Local (docs + static evidence review)
- **Auditor(s):** Internal (Copilot)
- **Test accounts used:** N/A

### Tooling gates
- Lint: Not run (docs-only audit step)
- Typecheck: Not run (docs-only audit step)
- Build: Not run (docs-only audit step)
- Targeted validators: Not run

### Walkthroughs executed
- Privacy governance check: **Executed** (vendor/subprocessor evidence review)
- Supplier inventory cross-check against repo evidence: **Executed**

### Evidence produced
- Populated vendor/subprocessor register: `docs/assurance/VENDOR_SUBPROCESSOR_AUDIT.md`

### Findings created
- INT-PRIV-2025-001
- INT-PRIV-2025-002

## RUN-2025-12-15-02

- **Run ID:** RUN-2025-12-15-02
- **Date/time (UTC):** 2025-12-16
- **Commit SHA/tag:** TBD
- **Environment:** Local (production build + `next start` + Cypress E2E)
- **Auditor(s):** Internal (Copilot)
- **Test accounts used:** Demo accounts only (TEACHER/PARENT/STUDENT roles; no secrets)

### Tooling gates
- Lint: **Pass** (evidence: `docs/AUDIT/runs/RUN-2025-12-15-02/lint.txt`)
- Typecheck: **Pass** (evidence: `docs/AUDIT/runs/RUN-2025-12-15-02/typecheck.txt`)
- Build: **Pass** (evidence: `docs/AUDIT/runs/RUN-2025-12-15-02/build.txt`)
- Targeted validators: **Pass**
	- Video registry: **Pass** with warnings (evidence: `docs/AUDIT/runs/RUN-2025-12-15-02/video-registry.txt`)

### Walkthroughs executed
- External auditor guide checklist: **Partially executed via automated release gate + E2E coverage**
	- Release gate: **Pass** (evidence: `docs/AUDIT/runs/RUN-2025-12-15-02/gate-release-2025-12-16-PASS.log`)
	- Gate server logs: `docs/AUDIT/runs/RUN-2025-12-15-02/gate-server-20251216_005520.out.log` and `.err.log`

### Findings created
- INT-OPS-2025-003 (see `docs/assurance/FINDINGS_REGISTER.md`)

## RUN-2026-01-21-01 (Planned)

- **Run ID:** RUN-2026-01-21-01
- **Date/time (UTC):** 2026-01-21
- **Commit SHA/tag:** TBD
- **Environment:** Local (manual accessibility walkthroughs)
- **Auditor(s):** Internal (Codex)
- **Test accounts used:** Demo accounts only (role-based; no secrets)

### Tooling gates
- Lint: Not run (accessibility manual run)
- Typecheck: Not run (accessibility manual run)
- Build: Not run (accessibility manual run)
- Targeted validators: axe devtools (manual)

### Walkthroughs executed
- Accessibility quick checks: **Planned** (top 15 journeys, keyboard + screen reader)

### Evidence produced
- Pending: `docs/accessibility/AUDIT_CHECKLIST.md`
- Pending: `docs/assurance/FINDINGS_REGISTER.md`

### Findings created
- TBD

## RUN-2026-01-21-02

- **Run ID:** RUN-2026-01-21-02
- **Date/time (UTC):** 2026-01-21
- **Commit SHA/tag:** TBD
- **Environment:** Local (targeted access-control review + fixes)
- **Auditor(s):** Internal (Codex)
- **Test accounts used:** N/A (code review)

### Tooling gates
- Lint: Not run (targeted code hardening)
- Typecheck: Not run (targeted code hardening)
- Build: Not run (targeted code hardening)
- Targeted validators: Not run

### Walkthroughs executed
- API access control sweep (waitlist stats + assessment submission)
- Admin UI access policy validation (platform-only dashboard)

### Evidence produced
- `src/app/api/waitlist/route.ts`
- `src/app/api/assessments/submit/route.ts`
- `src/app/[locale]/admin/page.tsx`
- `src/components/admin/AdminInterface.component.tsx`
- `src/config/navigation.ts`
- `src/proxy.ts`

### Findings created
- INT-SEC-2026-007
- INT-SEC-2026-008
- INT-SEC-2026-009
- INT-SEC-2026-010

## RUN-2026-01-21-03 (In Progress)

- **Run ID:** RUN-2026-01-21-03
- **Date/time (UTC):** 2026-01-21
- **Commit SHA/tag:** TBD
- **Environment:** Local (manual accessibility walkthroughs)
- **Auditor(s):** Internal (Codex)
- **Test accounts used:** Demo accounts only (role-based; no secrets)

### Tooling gates
- Lint: Not run (manual audit)
- Typecheck: Not run (manual audit)
- Build: Not run (manual audit)
- Targeted validators: axe devtools (manual), keyboard-only checks, screen reader

### Walkthroughs executed
- Accessibility audit kickoff: **In progress**
- Priority journeys: login, dashboards, assessments, reports, cases, EHCP, training, marketplace

### Evidence produced
- Pending: `docs/accessibility/AUDIT_CHECKLIST.md`
- Pending: `docs/assurance/FINDINGS_REGISTER.md`

### Findings created
- TBD

## RUN-2026-01-22-01

- **Run ID:** RUN-2026-01-22-01
- **Date/time (UTC):** 2026-01-22
- **Commit SHA/tag:** TBD
- **Environment:** Local (accessibility remediation sweep)
- **Auditor(s):** Internal (Codex)
- **Test accounts used:** N/A

### Tooling gates
- Lint: Not run (remediation sweep)
- Typecheck: Not run (remediation sweep)
- Build: Not run (remediation sweep)
- Targeted validators: Not run

### Walkthroughs executed
- Accessibility remediation sweep: **Executed** (empty-state standardization, focus-visible coverage)

### Evidence produced
- `docs/accessibility/AUDIT_CHECKLIST.md`
- `LEAD_DEV_PLAN.md`

### Findings created
- TBD

## RUN-2026-01-23-01 (In Progress)

- **Run ID:** RUN-2026-01-23-01
- **Date/time (UTC):** 2026-01-23
- **Commit SHA/tag:** 3d6e8fefc4d9d94f6cdaafbdf3dfb554b92a84a3
- **Environment:** Local (manual accessibility walkthroughs)
- **Auditor(s):** Internal (Codex)
- **Test accounts used:** Demo accounts only (role-based; no secrets)

### Tooling gates
- Lint: **Pass** (`npm run verify:ci`)
- Typecheck: **Pass** (`npm run verify:ci`)
- Build: **Pass** (`npm run build`)
- Targeted validators: **Pass** (`npm run verify:ci`)

### Walkthroughs executed
- Accessibility manual journeys: **In progress** (Login + signup started; keyboard and screen reader checks pending)

### Evidence produced
- Pending: `docs/accessibility/AUDIT_CHECKLIST.md`
- Pending: `docs/assurance/FINDINGS_REGISTER.md`

### Findings created
- TBD

## Run template

- **Run ID:** (e.g., RUN-2025-12-15-01)
- **Date/time (UTC):**
- **Commit SHA/tag:**
- **Environment:** Local / Staging / Production
- **Auditor(s):**
- **Test accounts used:** (roles only; no secrets)

### Tooling gates
- Lint: pass/fail + evidence link
- Typecheck: pass/fail + evidence link
- Build: pass/fail + evidence link
- Targeted validators: (e.g., video registry)

### Walkthroughs executed
- External auditor guide checklist: pass/fail + notes
- Role-based RBAC sampling: pass/fail + notes
- Accessibility quick checks: pass/fail + notes
- Privacy governance check: pass/fail + notes
- Resilience check: pass/fail + notes

### Findings created
- List finding IDs created in `FINDINGS_REGISTER.md`

Last updated: 2025-12-16
