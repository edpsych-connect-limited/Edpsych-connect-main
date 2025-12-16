# Pen Test Readiness Pack (Internal)

This document defines what we provide to a penetration testing firm and what we expect back.

## Recommended standard

- UK: **CREST** (web app + API)
- Include authenticated testing for each major role.

## Scope definition

- Public web app (unauthenticated)
- Auth flows
- API routes
- Multi-tenant / role-based access boundaries
- Admin capabilities

## What we provide

- Production/staging URL
- Test accounts for each role (least privilege)
- Feature map and key flows
- Out-of-scope list (to avoid accidental disruption)

## What we require from testers

- Findings with severity + exploit narrative
- Proof of concept where safe
- Remediation verification retest

Last updated: 2025-12-15
