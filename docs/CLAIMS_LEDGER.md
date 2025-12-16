# Claims Ledger (Operational Truth)

This document is the living source of truth for **claims made in documentation/marketing** and the **evidence** that they are operationally true.

Statuses:
- **Verified**: Implemented + exercised by tests/gates.
- **Partial**: Some implementation exists but scope/guarantees are narrower than the claim.
- **Not implemented**: Claim is aspirational; must be reworded or built.

---

## AI Data Privacy Whitepaper (`docs/AI_DATA_PRIVACY_WHITEPAPER.md`)

| Claim | Status | Evidence | Notes / Action |
|---|---|---|---|
| PII redaction layer (“Privacy Guard”) before AI providers | **Verified (best-effort)** | `src/lib/security/pii-redaction.ts`, wired in `src/lib/ai-integration.ts` | Heuristic, not a guarantee. Covered by `tools/test-pii-redaction.ts` + release gate step. |
| “No customer data used to train foundation models” | **Partial** | Policy + provider configuration varies | Depends on provider/contract/settings. Must be validated per deployment. |
| “Audit logs immutably logged” | **Not implemented (strict immutability)** | `src/lib/security/audit-logger.ts` writes to DB | DB rows are not WORM by default. If immutability required, implement append-only constraints/triggers + external log sink. |

## LA BYOD Guide (`docs/LA-IT-BYOD-GUIDE.md`)

| Claim | Status | Evidence | Notes / Action |
|---|---|---|---|
| BYOD / customer-hosted Postgres supported | **Partial** | Schema/design exists; per-tenant routing not universally enforced | Requires explicit deployment wiring and onboarding validation; avoid absolute language until end-to-end proven. |
| “No PII persisted on our side” in BYOD | **Not implemented as a universal guarantee** | Current app logs/audit may store data depending on configuration | Must be treated as a configurable target; requires strict logging controls + verification tests. |
| TLS 1.3 enforced everywhere | **Not implemented as stated** | TLS is required; version depends on infra | Reworded to TLS-in-transit requirement; version policy agreed at onboarding. |
| SAML/OIDC supported | **Partial / configuration-dependent** | Not globally verified by automated tests | Treat as enterprise integration workstream; add implementation + tests before claiming broadly. |
