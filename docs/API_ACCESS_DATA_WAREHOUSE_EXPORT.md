# Data Warehouse Export API

This document defines a **repo-verifiable** export surface that enables organisations to ingest EdpsychConnect operational data into their own **data warehouse / BI pipeline**.

> Evidence anchor for video governance: **“Feed platform data into your data warehouse for deeper analysis.”**

## Endpoint

- **GET** `/_/api/integrations/data-warehouse/export`
- Actual route path in this repository: `src/app/api/integrations/data-warehouse/export/route.ts`

> In Next.js App Router, the effective URL is:
> `GET /api/integrations/data-warehouse/export?resource=...`

## Authentication

The export endpoint accepts either:

1) **Server-to-server API key** (recommended for ETL)

- Header: `x-epc-export-key: <DATA_WAREHOUSE_EXPORT_API_KEY>`
- Env var: `DATA_WAREHOUSE_EXPORT_API_KEY`

2) **Authenticated admin session**

- An authenticated user session whose `role` is one of:
  - `admin`, `la_admin`, `school_admin`, `super_admin`

## Tenant scoping

Exports are always **tenant-scoped**.

- If called with an authenticated session, tenant scope is derived from `session.user.tenantId`.
- If called server-to-server, `tenantId` must be supplied via query parameter.

## Query parameters

- `resource` (required)
  - `assessments`
  - `time_savings_metrics`
  - `time_savings_reports`

- `tenantId` (required for API-key usage)

- `limit` (optional, default `1000`, max `5000`)

- `includePII` (optional)
  - `includePII=1` requires an authenticated `super_admin` session.
  - Server-to-server key alone **cannot** request PII.

## Response format

All exports return a JSON payload:

- `resource`
- `tenantId`
- `limit`
- `exportedAt`
- `rows` (array)

## PII-minimisation stance

By default, exports return **PII-minimised operational fields** (IDs, timestamps, status/category fields). This supports analytics while reducing privacy risk.

If you need PII for legitimate operational reasons, use `includePII=1` with a `super_admin` session and ensure you have an appropriate lawful basis and data protection controls.
