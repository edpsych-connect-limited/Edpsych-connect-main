# Vercel Build & E2E Test Plan

**Status:** 🚀 Pushed to Vercel
**Commit:** `ebef6467` - "Add December 2025 Audit Report"
**Previous Commit:** `c57c1334` - "Fix Next.js 15 Route Handler Type Errors..."

## Immediate Actions
1.  **Monitor Vercel:** The build should be running now.
2.  **Logs:** If the build fails, please paste the Vercel build logs here.
3.  **E2E Testing:**
    *   Once the Vercel deployment is **live** (Green), we will run the E2E tests against the *production* URL (`https://edpsych-connect-limited.vercel.app/`) or the *preview* URL.
    *   This bypasses the local file locking issues and ensures we test the actual deployed environment.

## E2E Test Command (for later)
We will use the `CYPRESS_BASE_URL` environment variable to target the live site:

```powershell
# Example command once deployed
$env:CYPRESS_BASE_URL="https://edpsych-connect-limited.vercel.app"; npx cypress run --spec "cypress/e2e/sanity.cy.ts"
```
