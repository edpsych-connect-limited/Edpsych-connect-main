# React Server Components (RSC) CVEs — Response Record

Date: 2025-12-16

## Summary
Vercel/Meta disclosed multiple RSC-related vulnerabilities impacting frameworks that implement React Server Components (including Next.js App Router). This document records our response and the mitigations we applied.

## Affected advisories (as received)
- **CVE-2025-55182** (React 19, RSC)
- **CVE-2025-66478** (Next.js 15–16, RSC)
- **CVE-2025-55184** / **CVE-2025-55183** (RSC DoS / Server Actions source exposure)

## Current dependency versions in this repo
As of this date:
- Next.js: **16.0.10**
- React: **18.3.1**
- React DOM: **18.3.1**

The advisory recommends updating Next.js to a fixed version including **16.0.7** (or newer). This repository is already on **16.0.10**.

## Actions taken
1) **CI/static guardrails**
- Added a static secret scanner (`tools/security-scan-secrets.ts`) to reduce the risk of hardcoded secrets being exposed by any class of server-side vulnerability.
- CI smoke checks should continue to enforce a safe Next.js version.

2) **Edge protection (defense-in-depth)**
- Added conservative middleware rate limiting for requests that look like RSC or Server Actions requests (identified by headers like `RSC` / `next-action` or content-type `text/x-component`).
- This mitigation is only active when Upstash Redis is configured via environment variables.

## Deployment verification
After any security patch/redeploy, verify production is on the intended commit using:
- `GET /api/version`

Recommended: run the deterministic verification script from this repo:

- Script: `tools/verify-production.ts`
- NPM scripts:
	- `verify:prod` (requires DB ok on `/api/health?deep=1`)
	- `verify:prod:optional-db` (warns if DB is down, but does not fail)

Environment variables:

- `PRODUCTION_BASE_URL` (defaults to `https://edpsychconnect.com`)
- `EXPECTED_GIT_COMMIT_SHA` (optional; prefix match)
- `REQUIRE_DEEP_DB_OK` (`true` by default)

## Configuration
To enable edge rate limiting (recommended in production):
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Optional tuning:
- `EDGE_RSC_RATE_LIMIT_ENABLED` (default enabled when Upstash is configured)
- `EDGE_RSC_RATE_LIMIT` (default 120 per window)
- `EDGE_SERVER_ACTIONS_RATE_LIMIT` (default 60 per window)
- `EDGE_RSC_RATE_LIMIT_WINDOW_SECONDS` (default 60)

## Notes
- This mitigation is intentionally narrow: it only applies to requests that strongly resemble RSC/Server Actions.
- It does not replace platform protections (WAF/bot protection); it complements them.
