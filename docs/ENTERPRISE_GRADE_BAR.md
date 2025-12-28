# Enterprise-grade bar (repo-anchored)

This document defines what “enterprise-grade” means **in this repository**: measurable acceptance criteria that must be satisfied by code, configuration, tests, and operational docs.

The goal is simple:
- **No broken workflows**: the critical journeys work end-to-end.
- **No unverifiable promises**: bold claims stay bold, and we **build proof** until the repo can justify them.

## Non‑negotiables (definition of done)

### 1) Reproducible quality gate
**Required evidence (must pass):**
- `npm run verify:ci` (lint, type-check, provenance/claims/video registry checks, smoke checks, secret scan)
- `npm run gate:release` for release readiness (where used)

**Repo anchors:** `package.json` scripts: `verify:ci`, `gate:release`, `build:vercel`.

### 2) Identity, tenancy, and RBAC are enforced
**Acceptance criteria:**
- Every protected route has an auth gate.
- Role checks are enforced server-side (not only in UI).
- Tenant boundaries are explicit and testable.

**Evidence types:** middleware checks, server auth utilities, route-level checks, e2e “role smoke tests”.

### 3) Auditability and accountability
**Acceptance criteria:**
- Sensitive actions (view/edit/export) are auditable.
- Audit data has integrity guarantees (tamper-evidence or integrity checks).

**Evidence types:** audit logging utilities, tests that verify integrity and coverage.

### 4) Data protection by design
**Acceptance criteria:**
- Minimisation, least-privilege, and purpose limitation are implemented in the product.
- Secrets are never hardcoded; production requires env vars.
- PII/PHI handling has explicit redaction/controls where applicable.

**Evidence types:** secret scans, PII redaction tests, auth/permission checks.

### 5) Operational readiness
**Acceptance criteria:**
- Health + version endpoints exist and are stable.
- Failures are observable (structured logging; error reporting hooks).
- Build and runtime are stable on pinned Node version.

**Evidence types:** API routes for health/version, smoke checks, build validation.

## Critical workflows (must never regress)

These are the **golden paths** we guard with automation (unit checks + smoke + e2e):

1. **Authentication & session**
   - login/logout, session persistence, role-based access

2. **Onboarding**
   - first-run flow, account state, route protection

3. **EHCP journey**
   - create/track case, evidence upload/association, professional contributions

4. **Local Authority (LA) portal**
   - dashboard, applications list/detail, workflow actions

5. **Training / courses**
   - marketplace → course → lesson → progress tracking

6. **Reporting**
   - generate reports, export/download flows, permissions

7. **Help centre / support**
   - help content access, feedback submission, troubleshooting paths

## How we prove “bold claims” without rewriting them

When scripts/marketing copy makes a claim, the acceptable outcomes are:

- **Already provable** → keep claim; keep CI green.
- **Not provable yet** → keep claim; create a work item to add:
  1) missing capability (code),
  2) missing proof (tests),
  3) missing documentation (docs/policies),
  4) missing guardrail (CI check).

## Evidence sources (preferred)

Ordered by strength:
1. Tests that assert behavior (e2e/integration/unit)
2. Enforced checks in CI (`verify:ci`, secret scans, provenance)
3. Runtime controls (server-side authorization, validation, logging)
4. Documentation that is specific, scoped, and linked to code

## Checklist (living)

| Area | Pass criteria | Repo evidence |
|---|---|---|
| CI gate | `verify:ci` passes | `package.json` scripts |
| Node pin | CI uses Node 20.x | `.nvmrc`, `smoke-ci.ts` |
| Auth | server-side enforcement | auth utilities + route guards |
| RBAC | least privilege | role checks + e2e |
| Audit | meaningful + integrity | audit utilities + tests |
| Secrets | no hardcoded secrets | `security:scan` |

---

If this file changes, it should be because we raised the bar, made it measurable, or linked it more tightly to code/tests.
