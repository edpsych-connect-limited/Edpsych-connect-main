# BYOD Threat Model (Bring Your Own Database)

This document describes the threat model for EdPsych Connect’s BYOD feature (tenant-scoped database routing via `TenantDatabaseConfig`). It is written to be actionable for engineering and reviewable by customers and auditors.

## Scope

In-scope:

- Platform stores a per-tenant DB connection config in the platform DB (`TenantDatabaseConfig`).
- Runtime selects platform DB vs tenant DB on a per-request/per-tenant basis.
- Admin-only APIs manage and validate BYOD connectivity.

Out-of-scope (for this version):

- Customer-managed CA bundles / strict TLS verification.
- Cross-cloud key management integrations (AWS KMS / Azure Key Vault) beyond metadata fields.

## Assets

- Tenant data in customer-managed DB.
- Platform data in platform DB.
- BYOD credentials (host/user/password) stored in `TenantDatabaseConfig.password` (encrypted).
- Audit log integrity key (`AUDIT_LOG_HMAC_KEY`) used to sign integrity envelopes.

## Actors

- Legitimate platform operators (SUPER_ADMIN).
- Tenant administrators.
- External attackers without credentials.
- Compromised tenant account.
- Compromised platform database (read-only or read-write).

## Trust boundaries

1. Browser/client → Platform API (auth boundary)
2. Platform API → Platform DB
3. Platform API → Tenant DB (BYOD boundary)
4. CI/CD + secrets store → Runtime configuration

## Key threats and mitigations

### 1) Credential leakage (BYOD password)

Threats:

- Password logged via request/exception logging.
- Password returned in API responses.

Mitigations:

- BYOD endpoints redact password fields in responses.
- Logging must never include raw connection objects.
- Password stored encrypted at rest in platform DB.

### 2) Lateral data access across tenants

Threats:

- Request-scoped tenant context incorrect or missing.
- Cached Prisma client reused across tenants.

Mitigations:

- Tenant routing uses tenant ID from request-scoped context.
- Per-tenant Prisma clients are cached by tenant ID.
- Cache invalidation is performed on BYOD config changes.

### 3) SSRF / network pivot via BYOD host

Threats:

- Admin provides host pointing to internal services.

Mitigations:

- BYOD endpoints require SUPER_ADMIN.
- Future hardening: host allowlists / CIDR blocks, deny private ranges by default, outbound egress restrictions.

### 4) Tampering with audit evidence

Threats:

- Platform DB attacker edits/removes audit rows.

Mitigations:

- Audit logs include per-tenant hash-chain in `AuditLog.metadata.integrity`.
- Production requires HMAC signature (`AUDIT_LOG_INTEGRITY_MODE=hmac-sha256`) to prevent an attacker who only controls the DB from forging valid integrity metadata.
- Integrity can be verified via `npm run verify:audit-integrity`.

### 5) Misconfiguration leading to silent degradation

Threats:

- Production starts without required keys.

Mitigations:

- Fail-fast production checks for critical secrets.
- Release gate runs verification scripts and build checks.

## Residual risks / roadmap

- Concurrency: hash chaining is sensitive to concurrent audit writes; future work may add DB-level serialization per tenant.
- TLS verification strictness: add CA bundle support and `rejectUnauthorized=true` for `verify-full`.
- Egress controls: enforce host allowlists and deny internal IP ranges.
