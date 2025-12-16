# Owner Responsibilities (Enterprise Operations)

This document defines operational ownership boundaries for EdPsych Connect in enterprise/BYOD deployments.

## Platform owner (EdPsych Connect)

Responsible for:

- Application availability, deployment pipeline, and incident response.
- Enforcing production “fail-fast” requirements for missing critical secrets.
- Protecting audit evidence:
  - Configure `AUDIT_LOG_INTEGRITY_MODE=hmac-sha256` in production.
  - Manage `AUDIT_LOG_HMAC_KEY` rotation (using `AUDIT_LOG_HMAC_KEY_ID` for tracking).
  - Run and retain outputs of integrity verification (`npm run verify:audit-integrity`) as part of operational checks.
- Secure handling of secrets:
  - Ensure secrets are stored in a proper secret manager.
  - Ensure logs do not contain secrets.

## Customer owner (BYOD tenant)

Responsible for:

- Provisioning and maintaining the tenant database:
  - backups, maintenance windows, and access controls.
  - network allowlists permitting platform connectivity.
- Database credentials lifecycle:
  - rotate DB password/credential and coordinate updates to `TenantDatabaseConfig`.
- Data residency/compliance obligations specific to their organisation.

## Shared responsibilities

- Security reviews and change control:
  - Any change to BYOD configuration is audited.
  - Both parties agree on acceptable TLS mode and verification requirements.

## Escalation

- Security incident involving audit log tampering or credential exposure is treated as priority-1.
- BYOD connectivity incidents:
  - customer owns DB-side availability
  - platform owns application-side retry/backoff and clear error reporting
