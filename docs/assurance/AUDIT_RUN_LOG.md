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
