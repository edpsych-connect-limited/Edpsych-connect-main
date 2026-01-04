# Livesite Audit Findings - December 2025

## 1. Executive Summary
The audit of the live environment (`https://www.edpsychconnect.com`) against the current codebase revealed a significant discrepancy in role management. While the core features (Parent Portal, Researcher Hub, Safety Net) are functional, the Local Authority (LA) Dashboard is inaccessible to the `LA_ADMIN` role due to an outdated deployment.

## 2. Critical Findings

### 2.1 Codebase Drift (LA Dashboard)
- **Issue**: The `LA_ADMIN` role receives a `403 Forbidden` error when accessing the LA Dashboard API (`/api/la/compliance`).
- **Root Cause**: The live site's backend code does not include `LA_ADMIN` in the `allowedRoles` list, whereas the local codebase does.
- **Frontend Issue**: The local frontend code (`src/app/[locale]/dashboard/page.tsx`) was also missing `LA_ADMIN` in the dashboard link logic (Fixed locally).
- **Verification**: 
    - Failed with `LA_ADMIN` (403).
    - Passed when seeded user was temporarily changed to `admin` role.

### 2.2 Verified Features
The following features were successfully verified against the live site (using appropriate roles):
- ✅ **Parent Portal**: Demo access and authenticated login working.
- ✅ **Researcher Hub**: Login and dashboard access working.
- ✅ **Safety Net**: Golden Thread dashboard and simulation data working.
- ✅ **LA Dashboard**: Working (when accessed with `admin` role).

## 3. Recommendations
1. **Deploy Latest Code**: Trigger a new deployment to Vercel to push the backend changes that support `LA_ADMIN`.
2. **Merge Frontend Fix**: Commit and merge the fix for `src/app/[locale]/dashboard/page.tsx` to ensure the dashboard link appears for `LA_ADMIN` users.
3. **Database Sync**: Ensure the production database schema matches the codebase (Prisma migrations).

## 4. Test Evidence
- `cypress/e2e/la-dashboard.cy.ts`: Failed (403) with `LA_ADMIN`.
- `cypress/e2e/la-portal.cy.ts`: Passed with `admin` role.
- `cypress/e2e/parent-portal.cy.ts`: Passed.
- `cypress/e2e/researcher.cy.ts`: Passed.
- `cypress/e2e/safety-net.cy.ts`: Passed.
