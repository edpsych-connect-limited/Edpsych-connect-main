# DATA PROTECTION IMPACT ASSESSMENT (DPIA)

**Project:** EdPsych Connect World Platform

**Document type:** Internal DPIA (auditor-ready format; not a certification)

**Owner:** (TBD)

**Version:** 1.1

**Date created:** December 5, 2025

**Last updated:** December 15, 2025

---

## 0. Purpose and scope

This DPIA assesses the privacy risks of processing personal data in EdPsych Connect World, including **children’s data** and **special category data** relevant to SEND/EHCP workflows.

This document is written in an auditor-ready style:
- avoid claims that are not evidenced;
- link to evidence where available;
- explicitly mark unknowns as **TBD**.

Related internal assurance pack:
- `docs/assurance/README.md`
- `docs/assurance/EVIDENCE_REGISTER.md`

---

## 1. Roles and responsibilities (controller/processor)

### 1.1 Data controller(s)

**TBD:** Identify whether the controller is:
- (a) EdPsych Connect (for platform operations), and/or
- (b) customer organisations (e.g., schools/LAs) as controllers for pupil data.

> Action: confirm and document controller/processor allocation per feature (EHCP, assessments, training, messaging).

### 1.2 Data processor(s)

**TBD:** List subprocessors and hosting providers that process personal data on behalf of the controller.

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

**TBD:** Document:
- age ranges and how age is determined;
- whether children have direct accounts;
- parental controls/visibility.

---

## 3. Necessity and proportionality

### 3.1 Purpose limitation

Data is processed for providing educational support workflows and platform operations.

### 3.2 Data minimisation

**TBD:** Document how we ensure we only collect data necessary for each workflow.

### 3.3 Accuracy

**TBD:** Document how users can correct inaccurate records and how corrections propagate.

### 3.4 Storage limitation (retention)

**TBD:** Define retention periods by record type (cases, assessment reports, logs, backups).

---

## 4. Lawful basis and special category condition

This section must be confirmed with legal review.

### 4.1 UK GDPR lawful basis (Art. 6)

**TBD:** Select and justify (per controller and feature):
- Public task (Art. 6(1)(e))
- Legal obligation (Art. 6(1)(c))
- Legitimate interests (Art. 6(1)(f))
- Contract (Art. 6(1)(b))

### 4.2 Special category condition (Art. 9)

**TBD:** Select and justify (per feature), e.g.:
- Art. 9(2)(g) substantial public interest,
- Art. 9(2)(h) health/social care,
- or another applicable condition.

### 4.3 Data Protection Act 2018 schedules

**TBD:** Document relevant DPA 2018 schedule condition(s), if applicable.

---

## 5. Data flows and transfers

### 5.1 Data flow overview

**TBD:** Add a simple diagram or bullet flow covering:
- user -> web app -> API -> database;
- file/video storage;
- email delivery;
- monitoring/logging;
- AI features (if used).

### 5.2 International transfers

**TBD:** Identify any processing outside UK and document:
- countries/regions;
- transfer mechanism (e.g., IDTA/SCC);
- vendor assurances.

Evidence pointer:
- `docs/assurance/VENDOR_SUBPROCESSOR_AUDIT.md`

---

## 6. Security measures (with evidence discipline)

This DPIA does not assume controls exist unless evidenced.

### 6.1 Access control

- Role-based access control (RBAC): **TBD** (link to implementation evidence)
- MFA for privileged access: **TBD** (policy + enforcement evidence)
- Audit logging: **TBD** (log schema and examples)

### 6.2 Encryption

- Encryption in transit: **TBD** (hosting/TLS configuration evidence)
- Encryption at rest: **TBD** (database/storage provider evidence)

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
| R1 | Unauthorized access | Privilege misuse or authz bug exposes sensitive data | TBD | TBD | TBD | RBAC/MFA/logging (TBD) | TBD | Link to evidence IDs |
| R2 | Data loss/corruption | DB incident or operational error | TBD | TBD | TBD | Backups/restore (TBD) | TBD | Link to restore test evidence |
| R3 | Inappropriate sharing | Misconfigured roles or sharing features | TBD | TBD | TBD | Permission boundaries (TBD) | TBD | Link to authz tests |
| R4 | Vendor exposure | Subprocessor breach or transfer risk | TBD | TBD | TBD | Vendor due diligence (TBD) | TBD | Vendor register |
| R5 | Children’s privacy | Excessive collection or unclear transparency | TBD | TBD | TBD | Minimisation + notices (TBD) | TBD | Privacy policy + DPIA updates |

---

## 8. Consultation and sign-off

### 8.1 Consultation

Prior DPIA indicated consultation with:
- educational psychologists;
- schools;
- data privacy experts.

**TBD:** Record dates, participants (or roles), and summary outcomes.

### 8.2 Sign-off

| Role | Name | Date | Outcome |
|---|---|---|---|
| Product owner | TBD | TBD | TBD |
| Data protection lead | TBD | TBD | TBD |
| Engineering lead | TBD | TBD | TBD |

---

## 9. Conclusion

The residual risk rating cannot be declared “low” until the **TBD** items are completed and linked to evidence.

This DPIA is considered **in progress** until:
- lawful basis and special category condition are confirmed;
- retention/transfers are documented;
- security measures are evidenced;
- the risk table has scored values and residual risk rationale.
