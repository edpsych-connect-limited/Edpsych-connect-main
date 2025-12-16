# EdPsych Connect — Product Specification (Release Baseline)

This document defines the **minimum shippable product behavior** for EdPsych Connect and serves as the reference for acceptance criteria and automated regression.

## Scope and principles

- **Primary goal:** a reliable, production-safe platform for Educational Psychology workflow, EHCP tooling, Local Authority (LA) workflows, and Parent/School portals.
- **Non-goals:** this is not a marketing narrative; it is the behavioral contract the app must meet to be considered release-ready.
- **Definition of “done”:** the behaviors below are met **and** the regression gates in `docs/REGRESSION_SUITE.md` are green.

## Users and roles

The platform supports multiple user types; at minimum we treat these as distinct roles with separate access expectations:

- **Anonymous user:** can access public pages and authentication flows.
- **Authenticated user:** can access their dashboard and protected product areas.
- **Admin / Super Admin:** can access administration routes.
- **Parent / Guardian:** can access the Parent Portal flows.
- **Local Authority user:** can access LA dashboard and application workflows.

## Cross-cutting requirements

### Authentication & session

- Login must succeed with valid credentials.
- Login must fail with invalid credentials and **display a deterministic user-facing error**.
- Protected routes (e.g., `/dashboard`, `/settings`, `/admin`) must:
  - Redirect unauthenticated users to `/login` (preserving intended return URL).
  - Enforce RBAC for admin routes (non-admin users are redirected away).

### Internationalization (i18n)

- Routes must support locale-prefixed navigation (e.g., `/en/...`, `/cy/...`).
- Locale routing must not break API routes.

### API security and CORS

- Public API routes must remain accessible without auth (e.g., `/api/auth/*`).
- Protected API routes must reject unauthenticated requests with `401`.
- CORS behavior must be consistent with configured allowlist.

### Core reliability

- `npm run type-check` must pass.
- `npm run lint` must pass with `--max-warnings 0`.
- `npm run build` must succeed.

### Environment & secrets hygiene

- Production must **fail fast** if critical secrets are missing (no silent downgrades):
  - Auth secrets: `NEXTAUTH_SECRET` and/or `JWT_SECRET*` (as required by auth modules).
  - Encryption: `ENCRYPTION_KEY` (or `SECRETS_ENCRYPTION_KEY` where applicable).
- Secrets must never be logged in plaintext; any operational logs must redact credentials.
- Secrets must not be committed to git (`.env` is local-only; use `.env.example` for placeholders).

### Audit logging (tamper-evident)

- The platform **must maintain an audit trail** for security-relevant actions and high-risk data access.
- When audit integrity is enabled, the system must produce **tamper-evident audit logs** using a per-tenant hash chain:
  - Each audit event includes an integrity envelope stored in `AuditLog.metadata.integrity`.
  - The integrity hash links to the previous event for the same `tenant_id` (including `tenant_id=null` for platform/system).
- In production, integrity **must** be configured as **HMAC-signed**:
  - `AUDIT_LOG_INTEGRITY_MODE=hmac-sha256`
  - `AUDIT_LOG_HMAC_KEY` stored in the production secret manager (never in git).
  - Optional: `AUDIT_LOG_HMAC_KEY_ID` for rotation tracking.
- Release gate must include:
  - `npm run test:audit-integrity` (deterministic, DB-free)
  - `npm run verify:audit-integrity` (DB-backed; skips when integrity is off)

### BYOD (Bring Your Own Database) tenant isolation

- The platform must support **tenant-scoped database routing**:
  - If a tenant has an active `TenantDatabaseConfig`, DB reads/writes for that tenant route to the tenant DB.
  - Otherwise, DB operations route to the platform DB.
- Admin-only BYOD management endpoints must exist:
  - `POST /api/admin/tenants/:tenantId/byod/validate` (connectivity test; may persist status)
  - `GET|PUT|DELETE /api/admin/tenants/:tenantId/byod/config` (manage config; password encrypted at rest)
- Updating BYOD config must take effect promptly (cache invalidation), not only on long polling intervals.

## Core product areas (behavioral contract)

### 1) Marketing & public pages

- Home and key public pages render without runtime errors (e.g., About, Contact, Pricing, Blog).
- Public demo flows remain accessible where intentionally enabled.

### 2) Dashboards and protected navigation

- Authenticated users can navigate to their dashboard.
- Navigation does not expose protected content to unauthenticated users.

### 3) Assessments

- Users can access assessment landing pages.
- Key assessment interactions (as covered by E2E) must load and function without fatal errors.

### 4) EHCP tooling

- EHCP pages load and allow core navigation.
- Core EHCP flows covered by automated tests must remain stable.

### 5) Parent Portal

- Parent Portal entry and primary flows covered by E2E must remain stable.

### 6) Local Authority (LA) portal

- LA dashboard loads and the core application workflow routes are reachable.

### 7) Help Centre

- Help Centre pages render.
- Help Centre chat endpoints used by the UI respond successfully in supported scenarios.

## Traceability

- Automated tests live under `cypress/e2e/`.
- A runnable regression definition is maintained in `docs/REGRESSION_SUITE.md`.

## Change control

Any behavior change that impacts the areas above must:

1. Update this spec (acceptance criteria), and
2. Add/adjust automated coverage (Cypress and/or unit/integration tests) so the change is guarded.
