# Control Matrix (Internal)

This matrix maps internal controls to common assurance frameworks.

It is intentionally **framework-agnostic** but aligns to:
- **ISO/IEC 27001:2022** control families (Annex A themes)
- **SOC 2 Trust Services Criteria** (Security, Availability, Confidentiality, Processing Integrity, Privacy)

## Control families

| Family | What “good” looks like | Typical evidence |
|---|---|---|
| Identity & Access | Least privilege, strong auth, joiner/mover/leaver | RBAC model, MFA policy, access review records |
| Secure SDLC | Code review, testing gates, dependency hygiene | CI logs, lint/typecheck/build, SAST/deps reports |
| Data Protection | Minimisation, encryption, retention, audit trails | DPIA/ROPA, retention policy, key mgmt notes |
| Logging & Monitoring | Actionable logs, alerting, incident playbooks | Log schemas, dashboards, incident reports |
| Vulnerability Mgmt | Scanning cadence, patch SLAs, remediation | vuln scan outputs, ticket evidence |
| Resilience | Backups, restore tests, DR exercises | restore logs, RTO/RPO tests |
| Supplier Risk | subprocessors listed, DPAs, transfer mechanism | subprocessor register, contracts |
| Change Management | Tracked changes and approvals | PR history, release notes |
| Privacy Governance | DSAR process, DPIA updates, child safety | DPIA, DSAR SOP |
| Accessibility | WCAG 2.2 AA compliance and testing | audit report + remediation evidence |

## SOC 2 alignment (high-level)

- **Security**: Identity & Access, Secure SDLC, Logging/Monitoring, Vulnerability Mgmt
- **Availability**: Resilience, Monitoring, Incident Response
- **Confidentiality**: Access controls, encryption, data classification
- **Processing Integrity**: Testing, data validation, change control
- **Privacy**: DPIA/ROPA, DSAR, retention, notices

## ISO 27001 alignment (high-level)

ISO certification requires an operational **ISMS**. This repo should ultimately contain (or reference):
- Risk assessment + treatment plan
- Statement of Applicability (SoA)
- Internal audit records
- Corrective actions
- Management review minutes

(These are usually stored in a controlled system; we keep public-safe references here.)

Last updated: 2025-12-15
