# Comprehensive Live Site Audit & Readiness Dossier
**Date:** January 7, 2026
**Environment:** Beta Candidate (Vercel) / Local Simulation

## Executive Summary
This document outlines the findings of an autonomous audit of the EdPsych Connect application codebase and configuration. While the deployed Beta environment provides the final source of truth, this static and logic analysis highlights critical areas for immediate attention *before* wide-spread user onboarding.

### 🔴 Critical Action Items
1.  **Security Vulnerability (Rate Limiting)**: The `register` endpoint (`src/app/api/auth/register/route.ts`) lacks the rate limiting protection present in the `login` route. This exposes the platform to automated account creation spam.
2.  **Environment Instability**: Local builds are failing with `MODULE_NOT_FOUND`, indicating dependency corruption or version mismatches (Next.js internals). This risks "works on my machine" syndrome vs Vercel production.
3.  **Stripe Configuration**: The `stripe-config.ts` file currently hardcodes Test Mode IDs. A strategy for switching to Live IDs is required before production launch.

---

## 1. Functional Assessment

### A. Authentication & Onboarding
*   **Status**: ⚠️ Partial
*   **Findings**:
    *   **Login**: ✅ Secured with IP-based rate limiting (`lib/rate-limit`).
    *   **Signup**: ❌ **UNSECURED**. No rate limiting on `POST /api/auth/register`. 
    *   **Logic**: Uses `bcrypt` (good) and custom Redis sessions.
*   **Recommendation**: Apply `checkRateLimit` to the `register` route immediately.

### B. Subscription & Payments (New Beta Flow)
*   **Status**: ✅ Ready (Pending User Verify)
*   **Findings**:
    *   **Abuse Prevention**: `change-tier/route.ts` correctly checks Stripe Invoice history (`stripe.invoices.list`). Logic is sound: 0 paid invoices = 14 days trial.
    *   **UI Feedback**: `CheckoutClient` now gracefully handles missing API keys and correctly displays "Start Free Trial".
*   **Recommendation**: Verify manually that the Vercel env vars include `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.

### C. Application Health
*   **Status**: ⚠️ At Risk
*   **Findings**:
    *   **Local Build**: Fails (`npm run build` exits with code 1).
    *   **Cypress Tests**: `comprehensive-audit` confirms 50+ routes, but cannot run locally due to dev server startup issues.
*   **Recommendation**: Run a full `npm ci` (clean install) locally to fix dependency tree.

---

## 2. Security & Compliance Review

| Area | Status | Notes |
|------|--------|-------|
| **API Rate Limiting** | ⚠️ Mixed | Login defended; Register indefensible. |
| **Data Privacy** | ✅ Pass | GDPR compliance pages exist. Database schema separates PII. |
| **Payment Data** | ✅ Pass | Stripe Elements used (PCI compliant). No raw card data touches server. |
| **Access Control** | ✅ Pass | Middleware and Session checks present on protected API routes. |

## 3. Deployment Checklist (Immediate)

1.  [ ] **Apply Rate Limit to Register**: Copy logic from `login/route.ts` to `register/route.ts`.
2.  [ ] **Verify Env Vars**: Ensure Stripe keys are set in Vercel.
3.  [ ] **Manual Sanity Check**: Since automated E2E failed locally, perform manual "Happy Path" test on Vercel deployment immediately after build completes.

**Auditor Status**: Equipped and Ready for Remediation.
