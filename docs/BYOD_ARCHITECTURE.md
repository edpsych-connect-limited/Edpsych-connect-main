# BYOD Architecture & APIs

This document describes how EdPsych Connect supports tenant-scoped “Bring Your Own Database” routing.

## Data model

The platform DB stores connection details in:

- `TenantDatabaseConfig` (platform DB)
  - `tenant_id` (unique)
  - `host`, `port`, `database`, `username`, `password` (encrypted at rest)
  - `ssl_mode`
  - `is_active`
  - health fields: `last_check`, `status`, `error_message`

## Runtime routing

At runtime:

1. The request resolves a `tenantId` (via request-scoped tenant context).
2. The DB layer selects a Prisma client:
   - If the tenant has an active BYOD config, build a datasource URL and use a tenant-bound Prisma client.
   - Otherwise use the platform Prisma client.
3. Tenant clients are cached per tenant for performance.
4. When BYOD config changes, the cache is invalidated to take effect immediately.

Implementation entrypoint:

- `src/lib/prisma.ts`
  - `getPrismaForTenant(tenantId)`
  - `invalidateTenantPrismaCache(tenantId)`

## Admin APIs

These routes are **SUPER_ADMIN-only**.

### Validate connection

- `POST /api/admin/tenants/:tenantId/byod/validate`

Request body (Postgres only):

- `host` (string)
- `port` (number, default 5432)
- `database` (string)
- `username` (string)
- `password` (string)
- `ssl_mode` (string, default `require`)
- `updateStatus` (boolean, default true)
- `persistOnSuccess` (boolean, default false)

Response:

- `success` (boolean)
- `latencyMs` (number)
- `serverVersion` (string, when successful)

### Manage config

- `GET /api/admin/tenants/:tenantId/byod/config` (password redacted)
- `PUT /api/admin/tenants/:tenantId/byod/config` (upsert)
- `DELETE /api/admin/tenants/:tenantId/byod/config` (delete)

Notes:

- Password is encrypted at rest before storing.
- Config changes invalidate the tenant Prisma cache.
- Writes are audit logged.

## Operational guidance

- Prefer enabling audit integrity in production to protect audit evidence.
- BYOD connectivity tests should be performed before activation.
- Future hardening may include:
  - host allowlists / egress restrictions
  - strict TLS verification with customer-provided CA bundles
  - provider expansion beyond Postgres
