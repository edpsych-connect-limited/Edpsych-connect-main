# Findings Register (Internal)

This register tracks issues found during internal audits and their remediation status.

## Active findings

- **Finding ID:** INT-PROD-2025-004
	- **Date discovered:** 2025-12-16
	- **Discovered by:** External-auditor walkthrough (production smoke checks)
	- **Audit run reference:** RUN-2025-12-15-02
	- **Area:** Product QA / SEO / Routing
	- **Severity:** Medium
	- **Status:** Open
	- **Affected URL / Component:**
		- Production route: `https://www.edpsychconnect.com/en/training/courses`
		- Production metadata routes: `https://www.edpsychconnect.com/robots.txt`, `https://www.edpsychconnect.com/sitemap.xml`
		- Locale proxy: `src/proxy.ts` (next-intl middleware application)
	- **Expected behavior:**
		- Training courses list route from the external auditor guide (`/en/training/courses`) should return 200 (or a clear redirect to the canonical training catalogue).
		- `robots.txt` and `sitemap.xml` should return 200 without being redirected to a locale-prefixed path.
	- **Actual behavior:**
		- `/en/training/courses` returns 404 in production.
		- `/robots.txt` and `/sitemap.xml` return 307 redirects; the redirected locale-prefixed endpoints (`/en/robots.txt`, `/en/sitemap.xml`) return 404.
	- **Impact / Risk:**
		- External auditor guide checklist cannot pass as written.
		- SEO/crawler discoverability may be degraded (missing robots/sitemap).
	- **Evidence:** `docs/AUDIT/runs/RUN-2025-12-15-02/prod-public-urls.json`
	- **Fix:**
		- Add alias page: `src/app/[locale]/training/courses/page.tsx` (redirect to `/<locale>/training`).
		- Exempt `/robots.txt` and `/sitemap.xml` from next-intl locale redirects in `src/proxy.ts`.
	- **Retest evidence:**
		- `docs/AUDIT/runs/RUN-2025-12-16-01/prod-public-urls-20251216_015106Z.json` (retest run executed; production still showing old behavior at time of capture)
		- `docs/AUDIT/runs/RUN-2025-12-16-02/prod-public-urls-20251216_022157Z.json` (retest run executed; behavior still unchanged)
		- `docs/AUDIT/runs/RUN-2025-12-16-02/prod-api-version-headers.txt` + `docs/AUDIT/runs/RUN-2025-12-16-02/prod-api-version-body.json` (deployment verification evidence: production is still serving the older `/api/version` payload shape)
		- **Deployment note:** Fixes were merged and pushed (including middleware wiring and `/api/version` deploy metadata). As of RUN-2025-12-16-02, production behavior and `/api/version` response indicate the live deployment has not yet picked up the latest commits. Next step: confirm the Vercel project is connected to the correct repo/branch and check whether recent deployments are failing or queued.

- **Finding ID:** INT-PRIV-2025-001
	- **Date discovered:** 2025-12-15
	- **Discovered by:** Internal audit (vendor/subprocessor review)
	- **Audit run reference:** (add next entry to `docs/assurance/AUDIT_RUN_LOG.md`)
	- **Area:** Privacy
	- **Severity:** High
	- **Status:** Open
	- **Affected URL / Component:** `src/app/[locale]/privacy/page.tsx`
	- **Expected behavior:** Privacy notice accurately describes international transfer safeguards (e.g., UK IDTA / UK Addendum) and avoids incorrect “adequacy” claims.
	- **Actual behavior:** Privacy notice states: “Hosting: Vercel (United States) - covered by UK adequacy regulations”, which is not evidenced and may be incorrect.
	- **Impact / Risk:** Misleading privacy disclosures; potential UK GDPR compliance risk; external auditors will flag.
	- **Evidence:** `src/app/[locale]/privacy/page.tsx` (Third-Party Service Providers section)
	- **Fix:** Update privacy notice language to reflect actual transfer mechanism used for US processors (TBD until confirmed contractually).
	- **Retest evidence:** N/A

- **Finding ID:** INT-PRIV-2025-002
	- **Date discovered:** 2025-12-15
	- **Discovered by:** Internal audit (vendor/subprocessor review)
	- **Audit run reference:** (add next entry to `docs/assurance/AUDIT_RUN_LOG.md`)
	- **Area:** Privacy / Vendor governance
	- **Severity:** Medium
	- **Status:** Open
	- **Affected URL / Component:** `src/app/[locale]/privacy/page.tsx`; `docs/assurance/VENDOR_SUBPROCESSOR_AUDIT.md`
	- **Expected behavior:** Privacy notice disclosures and internal subprocessor register reflect the vendors actually integrated (or clearly mark optional/disabled vendors).
	- **Actual behavior:** The repo evidences integrations (Cloudinary, HeyGen, Upstash/Redis, optional AWS CloudWatch, optional OpenAI/Claude/Gemini/xAI, optional Sentry), but the privacy notice’s processor list is incomplete.
	- **Impact / Risk:** Incomplete processor disclosures; supplier governance gaps; mismatches become audit findings.
	- **Evidence:** `.env.example`; `src/lib/cloudinary.ts`; `src/app/api/video/heygen-token/route.ts`; `src/cache/redis-client.ts`; `src/lib/ai-integration.ts`; `src/services/monitoring/cloudwatch-client.ts`; `src/instrumentation.ts`.
	- **Fix:** Align disclosures to “Active vs Optional/Conditional” and ensure DPAs exist for active vendors.
	- **Retest evidence:** N/A

## Closed findings

- **Finding ID:** INT-OPS-2025-003
	- **Date discovered:** 2025-12-16
	- **Discovered by:** Internal audit (release gate execution)
	- **Audit run reference:** RUN-2025-12-15-02
	- **Area:** Availability / Release engineering
	- **Severity:** Medium
	- **Status:** Closed (Fixed + Retested)
	- **Affected URL / Component:** Release gate server start (`tools/gate-release.ps1`), Next build output directory selection (`next.config.mjs`)
	- **Expected behavior:** `npm run gate:release` should build and then start the production server successfully, so E2E suites can run against `http://localhost:3000`.
	- **Actual behavior:** Gate previously timed out waiting for `http://localhost:3000` due to `next start` selecting a distDir without a production `BUILD_ID` (build fell back to a different distDir than start).
	- **Impact / Risk:** Automated auditor-style walkthrough could not complete; E2E evidence could not be generated from the gate.
	- **Evidence:**
		- Failure server stderr: `logs/gate-server-20251216_003358.err.log` ("Could not find a production build...")
		- Prior failed run log: `docs/AUDIT/runs/RUN-2025-12-15-02/gate-release.txt`
	- **Fix:** Updated `next.config.mjs` to prefer distDirs that contain `BUILD_ID` when running `next start` (while keeping the writability probe for `next build`).
	- **Retest evidence:** `docs/AUDIT/runs/RUN-2025-12-15-02/gate-release-2025-12-16-PASS.log` ("ALL RELEASE GATES PASSED")

---

## Finding template

- **Finding ID:** (e.g., INT-SEC-2025-001)
- **Date discovered:**
- **Discovered by:**
- **Audit run reference:** (link to `AUDIT_RUN_LOG.md` entry)
- **Area:** Security / Privacy / Availability / Accessibility / Product QA
- **Severity:** Critical / High / Medium / Low
- **Status:** Open / In Progress / Fixed / Retested / Closed
- **Affected URL / Component:**
- **Role / Permissions context:**
- **Expected behavior:**
- **Actual behavior:**
- **Steps to reproduce:**
- **Impact / Risk:**
- **Evidence:** screenshots, logs, code links
- **Fix:** PR/commit link
- **Retest evidence:**
- **Notes:**

Last updated: 2025-12-16
