# Findings Register (Internal)

This register tracks issues found during internal audits and their remediation status.

## Active findings

- **Finding ID:** INT-SEC-2026-011
	- **Date discovered:** 2026-01-23
	- **Discovered by:** Internal audit (dependency scan)
	- **Audit run reference:** RUN-2026-01-23-01
	- **Area:** Security / Dependency Management
	- **Severity:** Medium
	- **Status:** Open
	- **Affected URL / Component:** `node_modules/lodash`
	- **Expected behavior:** Dependency audit should report zero known vulnerabilities in production dependencies.
	- **Actual behavior:** `npm audit --production` reports lodash prototype pollution advisory (GHSA-xxjr-mmjv-4gpg).
	- **Impact / Risk:** Potential prototype pollution risk if vulnerable lodash paths are reachable.
	- **Evidence:** `npm audit --production` output on 2026-01-23.
	- **Fix:** Apply `npm audit fix` or bump lodash to >=4.17.22 in dependency tree.
	- **Retest evidence:** TBD

- **Finding ID:** INT-PROD-2025-004
	- **Date discovered:** 2025-12-16
	- **Discovered by:** External-auditor walkthrough (production smoke checks)
	- **Audit run reference:** RUN-2025-12-15-02
	- **Area:** Product QA / SEO / Routing
	- **Severity:** Medium
	- **Status:** Closed (Fixed + Retested)
	- **Affected URL / Component:**
		- Production route: `https://www.edpsychconnect.com/en/training/courses`
		- Production metadata routes: `https://www.edpsychconnect.com/robots.txt`, `https://www.edpsychconnect.com/sitemap.xml`
		- Locale proxy: `src/proxy.ts` (next-intl middleware application)
	- **Expected behavior:**
		- Training courses list route from the external auditor guide (`/en/training/courses`) should return 200 (or a clear redirect to the canonical training catalogue).
		- `robots.txt` and `sitemap.xml` should return 200 without being redirected to a locale-prefixed path.
	- **Actual behavior:**
		- Initially: `/en/training/courses` returned 404 in production.
		- Initially: `/robots.txt` and `/sitemap.xml` returned 307 redirects; the redirected locale-prefixed endpoints (`/en/robots.txt`, `/en/sitemap.xml`) returned 404.
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
		- `docs/AUDIT/runs/RUN-2025-12-16-03/prod-public-urls-20251216_032655Z.json` (robots/sitemap fixed; training/courses redirect emitted an invalid `/undefined/...` path prior to final redirect hardening)
		- `docs/AUDIT/runs/RUN-2025-12-16-04/prod-public-urls-20251216_033034Z.json` (PASS: `/robots.txt`=200, `/sitemap.xml`=200, `/en/training/courses` redirects to `/en/training`=200)
		- **Closure note:** Production behavior now matches expected behavior; finding closed on 2025-12-16.

- **Finding ID:** INT-PRIV-2025-001
	- **Date discovered:** 2025-12-15
	- **Discovered by:** Internal audit (vendor/subprocessor review)
	- **Audit run reference:** (add next entry to `docs/assurance/AUDIT_RUN_LOG.md`)
	- **Area:** Privacy
	- **Severity:** High
	- **Status:** Fixed
	- **Affected URL / Component:** `src/app/[locale]/privacy/page.tsx`
	- **Expected behavior:** Privacy notice accurately describes international transfer safeguards (e.g., UK IDTA / UK Addendum) and avoids incorrect "adequacy" claims.
	- **Actual behavior:** Privacy notice states: "Hosting: Vercel (United States) - covered by UK adequacy regulations", which is not evidenced and may be incorrect.
	- **Impact / Risk:** Misleading privacy disclosures; potential UK GDPR compliance risk; external auditors will flag.
	- **Evidence:** `src/app/[locale]/privacy/page.tsx` (Third-Party Service Providers section)
	- **Fix:** Update privacy notice language to reflect actual transfer mechanism used for US processors (TBD until confirmed contractually).
	- **Retest evidence:** `src/app/[locale]/privacy/page.tsx` (updated subprocessor list and transfer language)

- **Finding ID:** INT-PRIV-2025-002
	- **Date discovered:** 2025-12-15
	- **Discovered by:** Internal audit (vendor/subprocessor review)
	- **Audit run reference:** (add next entry to `docs/assurance/AUDIT_RUN_LOG.md`)
	- **Area:** Privacy / Vendor governance
	- **Severity:** Medium
	- **Status:** Fixed
	- **Affected URL / Component:** `src/app/[locale]/privacy/page.tsx`; `docs/assurance/VENDOR_SUBPROCESSOR_AUDIT.md`
	- **Expected behavior:** Privacy notice disclosures and internal subprocessor register reflect the vendors actually integrated (or clearly mark optional/disabled vendors).
	- **Actual behavior:** The repo evidences integrations (Cloudinary, HeyGen, Upstash/Redis, optional AWS CloudWatch, optional OpenAI/Claude/Gemini/xAI, optional Sentry), but the privacy notice's processor list is incomplete.
	- **Impact / Risk:** Incomplete processor disclosures; supplier governance gaps; mismatches become audit findings.
	- **Evidence:** `.env.example`; `src/lib/cloudinary.ts`; `src/app/api/video/heygen-token/route.ts`; `src/cache/redis-client.ts`; `src/lib/ai-integration.ts`; `src/services/monitoring/cloudwatch-client.ts`; `src/instrumentation.ts`.
	- **Fix:** Align disclosures to "Active vs Optional/Conditional" and ensure DPAs exist for active vendors.
	- **Retest evidence:** `src/app/[locale]/privacy/page.tsx`; `docs/assurance/VENDOR_SUBPROCESSOR_AUDIT.md`

- **Finding ID:** INT-SEC-2026-001
	- **Date discovered:** 2026-01-17
	- **Discovered by:** Internal audit (auth surface review)
	- **Audit run reference:** (add next entry to `docs/assurance/AUDIT_RUN_LOG.md`)
	- **Area:** Security / Authentication
	- **Severity:** High
	- **Status:** Fixed
	- **Affected URL / Component:** `src/lib/auth/server-auth.ts`; multiple `src/app/api/**` routes
	- **Expected behavior:** Production API routes must rely on real session/JWT auth (no in-memory mock auth).
	- **Actual behavior:** Several API routes used `server-auth` (in-memory mock auth with placeholder password checks).
	- **Impact / Risk:** Potential auth bypass or inconsistent authorization rules.
	- **Evidence:** `src/app/api/algorithms/**`, `src/app/api/ai/**`, `src/app/api/licenses/route.ts`
	- **Fix:** Replace `server-auth` usage with `authenticateRequest` from `src/lib/middleware/auth.ts`.
	- **Retest evidence:** `src/app/api/algorithms/[id]/route.ts`; `src/app/api/ai/chat/route.ts`; `src/app/api/licenses/route.ts`

- **Finding ID:** INT-SEC-2026-002
	- **Date discovered:** 2026-01-17
	- **Discovered by:** Internal audit (signup hardening)
	- **Audit run reference:** (add next entry to `docs/assurance/AUDIT_RUN_LOG.md`)
	- **Area:** Security / Authentication
	- **Severity:** High
	- **Status:** Fixed
	- **Affected URL / Component:** `src/app/api/auth/signup/route.ts`; `src/app/api/auth/register/route.ts`
	- **Expected behavior:** Public signup must not allow privilege escalation and should be rate-limited.
	- **Actual behavior:** Role was user-supplied without validation; signup lacked rate limiting.
	- **Impact / Risk:** Privilege escalation and automated account creation risk.
	- **Evidence:** `src/app/api/auth/signup/route.ts`
	- **Fix:** Validate allowed roles and add registration rate limiting.
	- **Retest evidence:** `src/app/api/auth/signup/route.ts`; `src/app/api/auth/register/route.ts`

- **Finding ID:** INT-PRIV-2026-003
	- **Date discovered:** 2026-01-17
	- **Discovered by:** Internal audit (GDPR erasure workflow review)
	- **Audit run reference:** (add next entry to `docs/assurance/AUDIT_RUN_LOG.md`)
	- **Area:** Privacy / GDPR
	- **Severity:** High
	- **Status:** Fixed
	- **Affected URL / Component:** `src/lib/gdpr-compliance.ts`; `src/components/privacy/PrivacyPolicyManager.tsx`
	- **Expected behavior:** Right to erasure must execute a full PII purge/anonymization across user-linked tables and remove access.
	- **Actual behavior:** Erasure requests were queued without execution; UI used placeholder user IDs.
	- **Impact / Risk:** GDPR non-compliance; PII retained after deletion request.
	- **Evidence:** `src/lib/gdpr-compliance.ts` (pre-fix); `src/components/privacy/PrivacyPolicyManager.tsx` (placeholder IDs)
	- **Fix:** Implemented erasure execution pipeline with deletion/anonymization and updated UI to use authenticated user ID.
	- **Retest evidence:** `src/lib/gdpr-compliance.ts`; `src/components/privacy/PrivacyPolicyManager.tsx`

- **Finding ID:** INT-FIN-2026-004
	- **Date discovered:** 2026-01-17
	- **Discovered by:** Internal audit (payments hardening)
	- **Audit run reference:** (add next entry to `docs/assurance/AUDIT_RUN_LOG.md`)
	- **Area:** Financial / Payment Integrity
	- **Severity:** Medium
	- **Status:** Fixed
	- **Affected URL / Component:** `src/lib/payments/stripeSubscriptions.ts`; `src/lib/stripe-institution-service.ts`
	- **Expected behavior:** Production must not fall back to mock Stripe behavior.
	- **Actual behavior:** Mock responses were returned when Stripe keys were missing.
	- **Impact / Risk:** Silent billing failures; audit findings on financial controls.
	- **Evidence:** `src/lib/payments/stripeSubscriptions.ts`; `src/lib/stripe-institution-service.ts`
	- **Fix:** Enforced production guards against mock Stripe flows.
	- **Retest evidence:** `src/lib/payments/stripeSubscriptions.ts`; `src/lib/stripe-institution-service.ts`

- **Finding ID:** INT-FIN-2026-005
	- **Date discovered:** 2026-01-17
	- **Discovered by:** Internal audit (marketplace payments)
	- **Audit run reference:** (add next entry to `docs/assurance/AUDIT_RUN_LOG.md`)
	- **Area:** Financial / Marketplace
	- **Severity:** High
	- **Status:** Fixed
	- **Affected URL / Component:** `src/app/api/marketplace/bookings/[id]/payment-intent/route.ts`; `src/app/api/webhooks/stripe/route.ts`
	- **Expected behavior:** Marketplace payments must use Stripe Connect split payments with platform fee + provider payout.
	- **Actual behavior:** No production-grade split payment flow was implemented for EP bookings.
	- **Impact / Risk:** Revenue leakage, incorrect payouts, audit findings on marketplace controls.
	- **Evidence:** Absence of Connect payment creation in API routes.
	- **Fix:** Added Stripe Connect destination-charge payment intent creation and webhook settlement handling.
	- **Retest evidence:** `src/app/api/marketplace/bookings/[id]/payment-intent/route.ts`; `src/app/api/webhooks/stripe/route.ts`

- **Finding ID:** INT-OPS-2026-006
	- **Date discovered:** 2026-01-17
	- **Discovered by:** Internal audit (booking concurrency)
	- **Audit run reference:** (add next entry to `docs/assurance/AUDIT_RUN_LOG.md`)
	- **Area:** Operational / Booking Integrity
	- **Severity:** High
	- **Status:** Fixed
	- **Affected URL / Component:** `src/app/api/marketplace/bookings/[id]/confirm/route.ts`
	- **Expected behavior:** Booking confirmation must prevent overlapping bookings for the same professional.
	- **Actual behavior:** No server-side conflict check existed during booking confirmation.
	- **Impact / Risk:** Double-bookings under load; operational failures.
	- **Evidence:** No confirmation API enforcing overlap checks.
	- **Fix:** Added transactional overlap check with database-level time window validation.
	- **Retest evidence:** `src/app/api/marketplace/bookings/[id]/confirm/route.ts`

- **Finding ID:** INT-SEC-2026-007
	- **Date discovered:** 2026-01-21
	- **Discovered by:** Internal audit (access-control sweep)
	- **Audit run reference:** RUN-2026-01-21-02
	- **Area:** Security / Access Control
	- **Severity:** Medium
	- **Status:** Fixed
	- **Affected URL / Component:** `src/app/api/waitlist/route.ts`
	- **Expected behavior:** Waitlist statistics are restricted to authenticated platform admins.
	- **Actual behavior:** Waitlist statistics endpoint allowed unauthenticated access.
	- **Impact / Risk:** Exposure of operational metrics and user metadata to anonymous callers.
	- **Evidence:** `src/app/api/waitlist/route.ts` (pre-fix)
	- **Fix:** Enforced authentication and admin role checks for GET stats.
	- **Retest evidence:** `src/app/api/waitlist/route.ts`

- **Finding ID:** INT-SEC-2026-008
	- **Date discovered:** 2026-01-21
	- **Discovered by:** Internal audit (access-control sweep)
	- **Audit run reference:** RUN-2026-01-21-02
	- **Area:** Security / Access Control
	- **Severity:** High
	- **Status:** Fixed
	- **Affected URL / Component:** `src/app/api/assessments/submit/route.ts`
	- **Expected behavior:** Assessment submissions require authenticated sessions for audit and tenant integrity.
	- **Actual behavior:** Assessment submissions could be posted without authentication.
	- **Impact / Risk:** Unauthenticated data injection and evidence telemetry gaps.
	- **Evidence:** `src/app/api/assessments/submit/route.ts` (pre-fix)
	- **Fix:** Required authenticated request and normalized tenant context before processing submissions.
	- **Retest evidence:** `src/app/api/assessments/submit/route.ts`

- **Finding ID:** INT-SEC-2026-009
	- **Date discovered:** 2026-01-21
	- **Discovered by:** Internal audit (admin surface review)
	- **Audit run reference:** RUN-2026-01-21-02
	- **Area:** Security / Access Control
	- **Severity:** Low
	- **Status:** Fixed
	- **Affected URL / Component:** `src/app/[locale]/admin/page.tsx`; `src/components/admin/AdminInterface.component.tsx`; `src/config/navigation.ts`
	- **Expected behavior:** Platform owner dashboard is visible only to SUPER_ADMIN.
	- **Actual behavior:** ADMIN role could access the system admin dashboard.
	- **Impact / Risk:** Over-broad access to platform governance UI.
	- **Evidence:** `src/app/[locale]/admin/page.tsx` (pre-fix)
	- **Fix:** Restricted System Administration UI to SUPER_ADMIN and hid nav link for non-owner roles.
	- **Retest evidence:** `src/app/[locale]/admin/page.tsx`; `src/config/navigation.ts`

- **Finding ID:** INT-SEC-2026-010
	- **Date discovered:** 2026-01-21
	- **Discovered by:** Internal audit (edge RBAC review)
	- **Audit run reference:** RUN-2026-01-21-02
	- **Area:** Security / Access Control
	- **Severity:** Medium
	- **Status:** Fixed
	- **Affected URL / Component:** `src/proxy.ts`
	- **Expected behavior:** `/admin` route should be restricted to SUPER_ADMIN only.
	- **Actual behavior:** Edge proxy allowed ADMIN role to pass `/admin` gate.
	- **Impact / Risk:** Platform owner dashboard could be reached by non-owner admins.
	- **Evidence:** `src/proxy.ts` (pre-fix)
	- **Fix:** Updated edge gate to require SUPER_ADMIN for `/admin`.
	- **Retest evidence:** `src/proxy.ts`

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

Last updated: 2026-01-17
