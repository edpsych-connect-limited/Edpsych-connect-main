# Security by Design (Engineering Evidence)

This document exists to make our security posture **provable by repo**: the claims in our marketing/training scripts must be supported by concrete code, configuration, tests, and CI checks.

## The principles (as stated in the scripts)

- **Here's what we mean by "security by design".**
- **Security is not a one-off checklist.**
- **Security isn't a feature you see.**
- **It's a continuous process — and we build the platform to support that reality.**
- When you're working with Special Educational Needs and Disabilities data, security isn't a feature — it's the foundation.

These are not abstract slogans in this repository: they map to specific controls that are implemented and validated.

## What "security by design" means in this repo

"Security by design" means security controls are designed into the platform from the start, and we keep them from silently regressing by using deterministic checks.

### Controls and anchors

- **Role-based access control (RBAC) and permissions**
  - Implementation: `src/lib/middleware/auth.ts` (`Permission`, `ROLE_PERMISSIONS`, and route protection helpers)

- **Audit logging with tamper-evident integrity**
  - Implementation: `src/lib/security/audit-logger.ts` (GDPR-oriented audit events)
  - Integrity envelope: `src/lib/audit/audit-integrity.ts` (hash-chain / HMAC modes)
  - Verification tooling: `tools/verify-audit-log-integrity.ts`

- **Encryption at rest for sensitive stored secrets/credentials (AES-256-GCM)**
  - Implementation: `src/lib/security/encryption.ts` (AES-256-GCM authenticated encryption)

- **Defense-in-depth request throttling**
  - Middleware integration: `middleware.ts` calls `maybeRateLimitRsc(...)`

- **Security headers and hardening primitives (CSP/HSTS/etc.)**
  - Implementation: `src/services/security-hardening.ts`

## What we mean by "Zero Trust architecture"

When our scripts say **"Zero Trust architecture"**, we mean a **deny-by-default** posture where:

- there is **no implicit trust** based on network location,
- every request is **explicitly authenticated and authorised**,
- access is **least-privilege** (RBAC permissions),
- sensitive access is **audited**, and
- sensitive values are **encrypted at rest**.

In this repo, those principles map to concrete controls:

- **Deny-by-default + least privilege (RBAC)**
  - `src/lib/middleware/auth.ts` (`Permission`, `ROLE_PERMISSIONS`, and route protection helpers)

- **Auditability for access/change events**
  - `src/lib/security/audit-logger.ts` (GDPR-oriented audit events)
  - `src/lib/audit/audit-integrity.ts` (integrity envelope)

- **Encryption at rest for sensitive stored secrets/credentials**
  - `src/lib/security/encryption.ts` (AES-256-GCM)

- **Defense in depth**
  - `middleware.ts` (`maybeRateLimitRsc(...)`)
  - `src/services/security-hardening.ts` (CSP/HSTS)

## What we mean by "NHS-level data security"

When we say **"NHS-level data security"** in our scripts, we mean an engineering baseline appropriate for sensitive health/education-related data:

- encryption for sensitive values at rest (AES-256-GCM),
- access control and least-privilege authorization (RBAC permissions),
- auditability for access and change events (audit trail + integrity envelope),
- defense-in-depth controls like request rate limiting and security headers,
- production secrets configured via environment/secret management (not committed to git).

This repo provides **enforceable evidence** of these baseline controls.

## CI enforcement

The following deterministic check must pass:

- `npm run test:security-by-design` → `tools/validate-security-by-design.ts`

If any required anchor disappears (e.g., audit integrity removed, AES-256-GCM replaced, rate limiting removed), CI fails.
