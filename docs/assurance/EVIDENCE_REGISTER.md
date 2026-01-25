# Evidence Register (Internal)

This register is the **index of evidence** that supports internal assurance claims.

Guiding principle: **If it isn’t evidenced, it isn’t true.**

> NOTE: Some evidence is already present in `docs/` and build/test artefacts committed during audits. This register points to them and identifies gaps.

## Evidence IDs

Each item has an ID so external auditors can reference it unambiguously.

| ID | Domain | Claim supported | Evidence location | How to verify | Status |
|---:|---|---|---|---|---|
| SEC-01 | Security | Repeatable build / typecheck / lint gates | `package.json` scripts; CI/task outputs | Run `npm run lint`, `npm run type-check`, `npm run build` | ✅ Present |
| SEC-02 | Security | Video registry integrity checks | `tools/validate-video-registry.ts` + `npm run test:video-registry` | Run `npm run test:video-registry` | ✅ Present |
| SEC-03 | Security | End-to-end audit methodology exists | `docs/EXTERNAL-AUDITOR-COMPREHENSIVE-GUIDE.md` | Follow page-by-page checklist | ✅ Present |
| SEC-04 | Security | Security-oriented API tests exist | `docs/API-TESTING-FINDINGS.md` (and related) | Re-run flows in staging/prod | ✅ Present |
| SEC-05 | Security | Secret configuration documented | `.env.example` | Compare required vars to deployment secret store | ✅ Present |
| OPS-01 | Ops/Gov | Audit evidence bundle index exists | `docs/ops/AUDIT_INDEX.md` | Follow the index and verify referenced artefacts | ✅ Present |
| OPS-02 | Ops/Gov | External-auditor-style walkthrough run executed with captured gate + server + E2E evidence | `docs/AUDIT/runs/RUN-2025-12-15-02/` | Review `gate-release-2025-12-16-PASS.log`; optionally re-run `npm run gate:release` | ✅ Present |
| GOV-01 | Governance | Master audit findings maintained | `docs/reports/MASTER_AUDIT_FINDINGS.md` | Review gaps and remediation trail | ✅ Present |
| PRIV-01 | Privacy | DPIA exists | `docs/legal/DPIA.md` | Review + sign-off + updates | ⚠️ Needs legal signoff |
| PRIV-02 | Privacy | AI privacy stance documented | `docs/AI_DATA_PRIVACY_WHITEPAPER.md` | Validate against actual integrations and contracts | ✅ Present |
| A11Y-01 | Accessibility | Accessibility audit readiness checklist exists | `docs/assurance/ACCESSIBILITY_WCAG22AA.md` | Perform and record manual + automated checks | ✅ Draft template |
| BCP-01 | Resilience | Backup/restore + DR audit template exists | `docs/assurance/BCP_DR_AUDIT.md` | Execute a restore test and attach evidence | ✅ Draft template |
| OBS-01 | Observability | Tracing plan and evidence telemetry paths documented | `docs/observability/TRACING_PLAN.md` + `src/lib/analytics/evidence-telemetry.ts` | Review targets and verify emitted evidence records | ? Present |
| OBS-02 | Observability | SLO and error budget snapshots captured | `docs/observability/SLO_STATUS_SNAPSHOT.md` + `docs/observability/ERROR_BUDGET_SNAPSHOT.md` | Attach dashboard exports for 28-day window | ⚠️ Pending telemetry |
| VEND-01 | Vendor risk | Subprocessor register maintained (evidence-backed) | `docs/assurance/VENDOR_SUBPROCESSOR_AUDIT.md` | Review vendor list; confirm regions + DPAs; keep in sync with `.env.example` + integrations | ✅ Present (populated draft; TBDs remain) |
| SEC-06 | Security | MFA enforced for privileged access | `src/app/api/auth/login/route.ts` + `src/app/api/auth/mfa/verify/route.ts` | Attempt privileged login and verify MFA challenge | ✅ Present |
| GOV-02 | Governance | AI oversight review documented | `docs/assurance/AI_OVERSIGHT_REVIEW.md` | Review controls + dashboards | ✅ Present |
| PRIV-03 | Privacy | Consent and telemetry validation documented | `docs/assurance/CONSENT_TELEMETRY_VALIDATION.md` | Review consent gating and telemetry hooks | ✅ Present |
| OPS-03 | Ops | Backup/restore validation documented | `docs/ops/BACKUP_RESTORE.md` | Review schedule + tabletop evidence | ✅ Present |
| PEN-01 | Security | Pen test readiness pack exists | `docs/assurance/PEN_TEST_READINESS.md` | Define scope + provide test accounts | ✅ Draft template |
| CE-01 | Security | Cyber Essentials readiness checklist exists | `docs/assurance/CYBER_ESSENTIALS_READINESS.md` | Populate checklist + evidence links | ✅ Draft template |
| ISO-01 | Security/Gov | ISO 27001 readiness checklist exists | `docs/assurance/ISO27001_READINESS.md` | Create ISMS artefacts + internal audit trail | ✅ Draft template |
| SOC-01 | Security/Gov | SOC 2 readiness checklist exists | `docs/assurance/SOC2_READINESS.md` | Define controls + evidence window | ✅ Draft template |

## Where to add new evidence

- Prefer stable links to source files under `docs/` or `tools/`.
- For generated outputs, prefer committing **summaries** under `docs/reports/` and keep raw logs out of git unless needed.

Last updated: 2026-01-25
