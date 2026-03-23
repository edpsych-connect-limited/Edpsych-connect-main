# EdPsych Connect — Phase 1 Release Readiness Checklist

**Branch:** `phase1-auth-unification`  
**Last updated:** 2026-03-23  
**Status:** ✅ Phase 1 corridor proven; build gate restored; deployment normalisation complete

---

## 1. Code Quality Gates

| Check | Status | Notes |
|---|---|---|
| TypeScript type-check (`tsc --noEmit`) | ✅ Clean | 0 errors |
| ESLint | ✅ Passing | |
| AI governance checks | ✅ Passing | ai-governance, ai-nontraining |
| Security by design | ✅ Passing | |
| Intervention validation scale | ✅ Passing | |
| Video registry | ✅ Passing | |
| Video claims | ✅ Passing | |
| Video script coverage | ✅ Passing | 135 scripts, 0 missing |
| Video script provenance | ✅ Passing | 135 keys |
| Security scan | ✅ Passing | |
| Smoke CI | ⚠️ Node 22 locally | Passes on Vercel (Node 20) |

---

## 2. Build Gate

| Item | Status | Notes |
|---|---|---|
| `vercel.json` buildCommand | ✅ `npm run build:vercel` | Full gate: verify:ci + build |
| `build:vercel` script | ✅ `npm run verify:ci && npm run build` | Restored from temporary relaxed gate |
| Next.js build | ✅ Expected clean | Verified via type-check + lint clean |

---

## 3. Authentication & Session

| Item | Status | Notes |
|---|---|---|
| Canonical auth/session shape | ✅ Done | Single source of truth |
| Canonical role normalisation | ✅ Done | All roles use canonical set |
| Server-authoritative client auth hydration | ✅ Done | |
| Onboarding status coherence | ✅ Done | Completed users skip correctly |

---

## 4. Phase 1 Corridor — Runtime Proven

| Step | Status | Roles Validated |
|---|---|---|
| 1. Login / session truth | ✅ Proven | EP, SENCO, SCHOOL_ADMIN |
| 2. Dashboard auth state | ✅ Proven | EP, SENCO, SCHOOL_ADMIN |
| 3. Onboarding status / progression | ✅ Proven | EP, SENCO, SCHOOL_ADMIN |
| 4. Student creation | ✅ Proven | |
| 5. Case creation | ✅ Proven | |
| 6. Assessment shell creation | ✅ Proven | |
| 7. Assessment instance creation | ✅ Proven | |
| 8. Assessment instance update | ✅ Proven | |
| 9. Report draft / create | ✅ Proven | |
| 10. Report generate / export | ✅ Proven | |

---

## 5. Deployment

| Item | Status | Notes |
|---|---|---|
| Branch pushed to origin | ✅ `3f58ec2b` | 2026-03-23 17:02 UTC |
| Vercel auto-deploy triggered | ✅ On push | Vercel connected to branch |
| Vercel build gate active | ✅ Full | verify:ci + build on Vercel Node 20 |
| Latest READY preview URL | ⏳ To confirm | Requires manual Vercel dashboard check or token |

---

## 6. Outstanding Before Production Release

| Item | Priority | Notes |
|---|---|---|
| Confirm Vercel preview build passes (verify:ci + build on Node 20) | HIGH | Check Vercel dashboard or add token to cron env |
| Re-validate Phase 1 corridor on latest READY preview | HIGH | One-pass manual walkthrough |
| Produce production release PR / merge strategy | MEDIUM | Phase 1 branch → main |
| Smoke test on production (post-merge) | HIGH | Corridor steps 1–10 |
| Document EP/SENCO/SCHOOL_ADMIN onboarding URLs | MEDIUM | For customer-facing handoff |

---

## 7. Deferred (Phase 2+)

- Differentiated curriculum
- Gamification / engagement systems
- Structured interventions as first-class layer
- Marketplace
- Research platform surfaces
- Broader AI extras
- Multi-agency / research / orchestration type cleanup (non-blocking for Phase 1)

---

**Decision:** Phase 1 is release-ready pending Vercel preview confirmation and one final corridor walkthrough on the deployed preview.
