# Compliance Pack (Enterprise / Procurement)

This document is a lightweight “starter pack” for security/compliance procurement reviews. It is not legal advice.

## What this covers

- Security controls overview
- Data protection / GDPR considerations
- Audit logging and evidence integrity
- BYOD (Bring Your Own Database) risk notes

## Security overview

- Authentication: NextAuth-based session handling, protected routes, RBAC for administrative actions.
- Secrets: production fail-fast behavior for missing critical secrets; secrets stored outside git.
- Encryption:
  - Sensitive stored credentials (e.g., BYOD DB password) encrypted at rest using AES-256-GCM.
  - Encryption keys provided via environment/secret manager.

## Audit logging

- Security-relevant actions and high-risk operations should generate audit events.
- Tamper-evident integrity envelope stored in `AuditLog.metadata.integrity`.
- Production requirement:
  - `AUDIT_LOG_INTEGRITY_MODE=hmac-sha256`
  - `AUDIT_LOG_HMAC_KEY` stored in secret manager

Verification:

- Deterministic integrity tests: `npm run test:audit-integrity`
- DB-backed verification: `npm run verify:audit-integrity`

## BYOD (Bring Your Own Database)

- Tenant database routing is supported via `TenantDatabaseConfig`.
- Admin APIs exist to validate connectivity and manage configuration.

See:

- `docs/BYOD_THREAT_MODEL.md`
- `docs/BYOD_ARCHITECTURE.md`

## GDPR / data protection notes

- Data minimisation: avoid logging sensitive payloads; redact secrets.
- Access control: protected routes reject unauthenticated access; admin routes require elevated roles.
- Auditability: audit trail supports investigation and accountability.

## Evidence and release gating

Operational readiness requires passing:

- `npm run lint`
- `npm run type-check`
- `npm run build`
- `npm run gate:release`

## Related documents in this repository

- `EXTERNAL_AUDIT_READINESS_DOSSIER.md`
- `FORENSIC_AUDIT_REPORT.md`
- `docs/PRODUCT_SPEC.md`
- `docs/REGRESSION_SUITE.md`
- `docs/OWNER_RESPONSIBILITIES.md`
