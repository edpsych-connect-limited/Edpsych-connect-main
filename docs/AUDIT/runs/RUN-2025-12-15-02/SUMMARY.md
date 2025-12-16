# RUN-2025-12-15-02 — External Auditor Comprehensive Walkthrough (Executed)

- **Date (UTC):** 2025-12-15
- **Scope:** Execute `docs/EXTERNAL-AUDITOR-COMPREHENSIVE-GUIDE.md` as far as possible via automated + evidence-backed checks (local E2E + production public URL availability).
- **Limitations:** No production credentials were used in this run; authenticated production page functionality was validated via route-guard behavior only (redirect/401), and via local E2E tests.

## Tooling gates

| Gate | Result | Evidence |
|---|---:|---|
| Lint | ✅ Pass | `lint.txt` |
| Typecheck | ✅ Pass | `typecheck.txt` |
| Build | ✅ Pass | `build.txt` |
| Video registry test | ✅ Pass (warnings present) | `video-registry.txt` |
| Release gate | ✅ Pass | `gate-release-2025-12-16-PASS.log` (see also `gate-release.txt` for earlier failed attempt) |

## E2E

| Suite | Result | Evidence |
|---|---:|---|
| Cypress smoke (gate) | ✅ Pass | `gate-release-2025-12-16-PASS.log` |
| Cypress regression (gate) | ✅ Pass | `gate-release-2025-12-16-PASS.log` |
| A11y/UI | ⚠️ Not executed in this run | N/A |

## Production URL checks (public routes)

- Evidence: `prod-public-urls.json`

Notes:
- Production currently returns **404** for `https://www.edpsychconnect.com/en/training/courses` (expected by the auditor guide).
- Production currently redirects `/robots.txt` and `/sitemap.xml` (307) to locale-prefixed endpoints that return 404.
- A remediation is implemented locally (alias route + proxy exemptions); retest required after deployment.

## API smoke checks

- Evidence: `prod-api-smoke.json`

Notes:
- Production API probes for `/api/status`, `/api/health`, and `/api/training/courses` returned 200.

## Findings

- See: `docs/assurance/FINDINGS_REGISTER.md`
