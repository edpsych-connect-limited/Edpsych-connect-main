# Cyber Essentials / CE+ Readiness (Internal)

This is an internal readiness checklist for UK **Cyber Essentials** and **Cyber Essentials Plus**.

> This does not replace certification.

## Scope

- Hosting environment(s) used for production
- Admin endpoints and staff accounts
- Developer endpoints that can impact production

## Checklist (evidence required)

### A) Firewalls & Internet gateways
- [ ] Network boundary documented
- [ ] Inbound ports justified and minimal
- [ ] WAF/CDN configuration documented (if used)

### B) Secure configuration
- [ ] Default passwords removed
- [ ] Hardened baselines documented for servers/containers
- [ ] Secrets stored in managed secret store; no hardcoded keys

### C) Access control
- [ ] MFA enforced for admin access
- [ ] Least privilege roles documented
- [ ] Joiner/mover/leaver procedure

### D) Malware protection
- [ ] Endpoint protection on staff devices
- [ ] Policy for developer machines

### E) Patch management
- [ ] OS patch policy
- [ ] Dependency vulnerability workflow (npm audit + advisories + SLAs)

## Evidence pointers

- Build/lint/typecheck gating: see `EVIDENCE_REGISTER.md (SEC-01)`
- Secret hygiene: ensure `.env.example` and production secret store alignment

Last updated: 2025-12-15
