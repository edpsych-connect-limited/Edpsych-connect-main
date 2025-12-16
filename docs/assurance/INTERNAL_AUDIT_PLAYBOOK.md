# Internal Audit Playbook (Auditor-Style)

Purpose: run an internal audit **as close as practical to an external audit**, so we find and fix issues before an independent reviewer does.

This playbook is about **process + evidence**, not self-certification.

## Key principles

- **Evidence-first:** every pass/fail must link to evidence in `docs/assurance/EVIDENCE_REGISTER.md`.
- **No unverifiable claims:** if we cannot prove it today, we mark it as a finding.
- **Time-boxed, repeatable:** audits must be runnable by a small team with minimal disruption.
- **Role-based sampling:** test critical user roles and sensitive flows.

## Audit scope (recommended baseline)

### Product scope
- Public pages and marketing claims
- Authentication + session management
- Role-based authorization boundaries
- Key workflows (EHCP, assessments, training)
- API routes and error handling
- Logging/monitoring behavior (at least presence/consistency)

### Non-product scope (must be included for certifications)
- Identity and access administration (MFA, access reviews)
- Secure SDLC (change control, reviews)
- Incident response readiness
- Vendor/subprocessor governance
- Backup/restore evidence and DR testing

## Evidence outputs

All results should be stored as:

- **Findings log:** `docs/assurance/FINDINGS_REGISTER.md`
- **Audit run log:** `docs/assurance/AUDIT_RUN_LOG.md`
- **Updated evidence register:** `docs/assurance/EVIDENCE_REGISTER.md`

## Audit cadence

- **Weekly (engineering):** build/lint/typecheck + basic security checks + dependency review
- **Monthly (ops/governance):** access review, vendor review, incident drill/tabletop
- **Quarterly:** restore test; role-based authorization sampling; privacy review
- **Pre-release gate:** full external-auditor-style walkthrough (see below)

## Execution steps (external-auditor-style walkthrough)

### Step 0: Freeze the target
- Choose a commit SHA/tag.
- Record environment (prod/staging), build/version, date/time in `AUDIT_RUN_LOG.md`.

### Step 1: Baseline technical gates
- Lint, typecheck, build
- Run targeted validation scripts (e.g., video registry)

**Evidence:** console output and/or CI logs + scripts referenced in `EVIDENCE_REGISTER.md`.

### Step 2: External auditor guide walkthrough
- Use `docs/EXTERNAL-AUDITOR-COMPREHENSIVE-GUIDE.md` as the functional test plan.
- Execute page-by-page checks for each role.

For each issue:
- Create a finding (template below).
- Capture URL, role, steps, expected/actual, severity.

### Step 3: Security sampling (lightweight internal)
- Verify RBAC boundaries (attempt cross-role access)
- Verify authz checks on API routes (deny by default)
- Verify secrets are not committed

### Step 4: Privacy governance check
- Update DPIA with any new processing, vendors, or features.
- Validate retention and DSAR processes exist (documented).

### Step 5: Resilience check
- Confirm backups configured
- If quarterly run: perform a restore test and record RTO/RPO

## Findings severity scale (internal)

- **Critical:** data exposure, auth bypass, payment integrity, platform unusable
- **High:** privilege boundary weakness, persistent errors in key flows
- **Medium:** incorrect behavior with workaround, partial outages
- **Low:** cosmetic, copy, minor UX

## Finding template (copy/paste)

- **Finding ID:** (e.g., INT-SEC-2025-001)
- **Date:**
- **Area:** Security / Privacy / Availability / Accessibility / Product QA
- **Severity:** Critical / High / Medium / Low
- **URL / Location:**
- **Role:**
- **Expected:**
- **Actual:**
- **Steps to reproduce:**
- **Impact:**
- **Evidence:** screenshots/logs/links
- **Root cause (if known):**
- **Fix PR/link:**
- **Retest date/result:**

Last updated: 2025-12-15
