# DATA PROTECTION IMPACT ASSESSMENT (DPIA)

**Project:** EdPsych Connect World Platform

**Document type:** Internal DPIA (auditor-ready format; not a certification)

**Owner:** Scott Patrick (Sponsor) + Codex (Project Lead)

**Version:** 1.1

**Date created:** December 5, 2025

**Last updated:** January 23, 2026

---

## 0. Purpose and scope

This DPIA assesses the privacy risks of processing personal data in EdPsych Connect World, including **children’s data** and **special category data** relevant to SEND/EHCP workflows.

This document is written in an auditor-ready style:
- avoid claims that are not evidenced;
- link to evidence where available;
- record open items and assumptions with explicit follow-ups.

Related internal assurance pack:
- `docs/assurance/README.md`
- `docs/assurance/EVIDENCE_REGISTER.md`

---

## 1. Roles and responsibilities (controller/processor)

### 1.1 Data controller(s)

Working allocation (pending legal confirmation):
- Customer organisations (schools/LAs) act as **controllers** for pupil data entered into cases, assessments, EHCPs, and safeguarding workflows.
- EdPsych Connect Limited acts as **processor** for tenant-controlled pupil data, and **controller** for platform operations (accounts, telemetry, billing).

Action: legal confirmation required per feature (EHCP, assessments, training, messaging).

### 1.2 Data processor(s)

Current subprocessors and hosting providers are listed in:
- `docs/assurance/VENDOR_SUBPROCESSOR_AUDIT.md`

Active vendors include Vercel (hosting), Neon (PostgreSQL), Stripe (payments), SendGrid (email),
Cloudinary (media CDN), with optional AI providers and observability vendors.

Evidence pointer:
- Vendor register template: `docs/assurance/VENDOR_SUBPROCESSOR_AUDIT.md`

---

## 2. Description of processing

### 2.1 What we do

The platform supports SEND provision and EHCP management. It may process data about children/young people and associated professionals to:
- manage cases and assessments;
- draft and maintain EHCP-related records;
- support collaboration and reporting;
- provide training and user enablement.

### 2.2 Data subjects

Potential data subjects include (confirm for each module):
- children and young people;
- parents/guardians;
- teachers/SENCOs/school staff;
- educational psychologists and practitioners;
- administrators and researchers (where applicable).

### 2.3 Personal data categories

**Standard personal data (examples; confirm actual fields):**
- account identifiers (name, email), organisation membership, role;
- case notes metadata;
- audit trails of actions (timestamps, actor IDs).

**Special category data (likely):**
- health and education needs information;
- disability/SEND status;
- assessment outcomes.

### 2.4 Children’s data

Children’s data is in scope. This increases risk and requires heightened safeguards.

Current evidence:
- Student accounts exist for learning modules (`src/app/[locale]/student`, `src/app/[locale]/student/lessons`).
- Parent portal provides oversight and communication (`src/app/[locale]/parent/dashboard`).

Action: confirm age ranges and parent/guardian consent model with product/legal.

---

## 3. Necessity and proportionality

### 3.1 Purpose limitation

Data is processed for providing educational support workflows and platform operations.

### 3.2 Data minimisation

Data minimisation controls:
- Role-based forms collect workflow-specific fields (cases, assessments, EHCP).
- Optional fields are separated from required inputs in core workflows.

Evidence:
- `src/components/ehcp/SchoolSubmissionInterface.tsx` (required/optional EHCP inputs)
- `src/components/assessments/AssessmentAdministrationWizard.tsx`

### 3.3 Accuracy

Accuracy controls:
- Users can update case, assessment, and EHCP records via edit flows.
- Update endpoints persist corrections and are tracked in audit telemetry.

Evidence:
- `src/app/api/cases/[id]/route.ts`
- `src/app/api/assessments/[id]/route.ts`
- `src/app/api/ehcp/[id]/route.ts`

### 3.4 Storage limitation (retention)

Retention policy:
- See `docs/assurance/DATA_RETENTION_POLICY.md`.
- EHCP audit logs: 6 years (document management service note).
- Security monitoring: 30 days (default).
- Performance monitoring: 7 days (default).

---

## 4. Lawful basis and special category condition

This section must be confirmed with legal review.

### 4.1 UK GDPR lawful basis (Art. 6)

Proposed lawful basis (pending legal sign-off):
- Local Authority workflows: Public task / legal obligation (Art. 6(1)(e)/(c)).
- School and professional workflows: Contract (Art. 6(1)(b)).
- Platform operations/telemetry: Legitimate interests (Art. 6(1)(f)).

### 4.2 Special category condition (Art. 9)

Proposed special category condition (pending legal sign-off):
- Art. 9(2)(g) substantial public interest and/or
- Art. 9(2)(h) health/social care (as applicable to EHCP and assessment workflows).

### 4.3 Data Protection Act 2018 schedules

Action: confirm DPA 2018 schedule condition(s) with legal review.

---

## 5. Data flows and transfers

### 5.1 Data flow overview

Data flow summary (current evidence):
- User -> Next.js app -> API routes -> Postgres (Neon) via Prisma.
- Media delivery via Cloudinary CDN (training and video assets).
- Email delivery via SendGrid.
- Observability via Vercel logs and internal telemetry (see `docs/observability/TRACING_PLAN.md`).
- AI features (optional) via provider APIs (OpenAI/Anthropic/Gemini/xAI) when enabled.

### 5.2 International transfers

International transfers (pending confirmation):
- Hosting/CDN/AI providers may process data outside the UK depending on account region.
- Until regions are confirmed, treat as potential international transfers requiring IDTA/SCC.

Evidence pointer:
- `docs/assurance/VENDOR_SUBPROCESSOR_AUDIT.md`

Evidence pointer:
- `docs/assurance/VENDOR_SUBPROCESSOR_AUDIT.md`

---

## 6. Security measures (with evidence discipline)

This DPIA does not assume controls exist unless evidenced.

### 6.1 Access control

- Role-based access control (RBAC): implemented in auth middleware and role checks.
  Evidence: `src/lib/middleware/auth.ts`, `src/lib/auth/hooks.tsx`, `src/proxy.ts`
- MFA for privileged access: not enforced in code; requires policy and implementation.
- Audit logging: evidence telemetry implemented (see `docs/observability/TRACING_PLAN.md` and telemetry plans).

### 6.2 Encryption

- Encryption in transit: HTTPS/TLS enforced by hosting providers (evidence to be attached from vendor consoles).
- Encryption at rest: provider-managed storage encryption (evidence to be attached from vendor consoles).

> Note: prior versions referenced specific algorithms (e.g., “AES-256”). This version requires an evidence link before naming algorithms.

### 6.3 Vulnerability management

- Dependency scanning and remediation workflow: evidence via build tooling and audit reports.

Evidence pointers:
- `docs/assurance/EVIDENCE_REGISTER.md` (SEC-01)
- `docs/reports/MASTER_AUDIT_FINDINGS.md`
- `docs/API-TESTING-FINDINGS.md`

---

## 7. Risks to rights and freedoms (risk register)

Scoring approach (simple):
- Likelihood: 1 (Low) to 5 (High)
- Severity: 1 (Low) to 5 (High)
- Risk score: $Likelihood \times Severity$

| Risk | Scenario | Likelihood | Severity | Score | Existing controls | Residual risk | Evidence |
|---|---|---:|---:|---:|---|---|---|
| R1 | Unauthorized access | Privilege misuse or authz bug exposes sensitive data | 2 | 5 | 10 | RBAC, auth middleware, telemetry | Medium | `src/lib/middleware/auth.ts` |
| R2 | Data loss/corruption | DB incident or operational error | 2 | 4 | 8 | Backup/restore plan (draft) | Medium | `docs/ops/BACKUP_RESTORE.md` |
| R3 | Inappropriate sharing | Misconfigured roles or sharing features | 2 | 4 | 8 | Role boundaries, audits | Medium | `src/proxy.ts`, `src/config/navigation.ts` |
| R4 | Vendor exposure | Subprocessor breach or transfer risk | 2 | 4 | 8 | Vendor register + DPAs (pending) | Medium | `docs/assurance/VENDOR_SUBPROCESSOR_AUDIT.md` |
| R5 | Children's privacy | Excessive collection or unclear transparency | 3 | 5 | 15 | Minimisation + notices | High | `src/app/[locale]/privacy/page.tsx` |

---

## 8. Consultation and sign-off

### 8.1 Consultation

Prior DPIA indicated consultation with:
- educational psychologists;
- schools;
- data privacy experts.

Consultation status: not yet completed for this DPIA revision. Record dates and participants after review.

### 8.2 Sign-off

| Role | Name | Date | Outcome |
|---|---|---|---|
| Product owner | Scott Patrick | Pending | Pending |
| Data protection lead | Pending | Pending | Pending |
| Engineering lead | Codex | Pending | Pending |

---

## 9. Conclusion

Residual risk cannot be declared "low" until legal basis, transfer evidence, and MFA policy are confirmed.

This DPIA is considered **in progress** until:
- lawful basis and special category conditions are confirmed by legal;
- international transfer evidence is attached to vendor register;
- MFA policy is defined or compensating controls approved;
- backup restore tests are executed and logged.
