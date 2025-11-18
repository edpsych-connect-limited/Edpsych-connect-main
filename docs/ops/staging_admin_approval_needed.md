# STAGING ENVIRONMENT SETUP GUIDE – For Admin Review

**Date:** November 18, 2025  
**Status:** READY FOR YOUR APPROVAL  
**Audience:** You (Project Owner) + Team Leads  

---

## 📌 CRITICAL CONTEXT

You and I are the entire team. I handle all technical execution (CTO role with 100% autonomy). You make the business/human decisions. This guide explains what **you need to do** to enable **me to execute** the Nov 24 deployment seamlessly.

---

## 🎯 YOUR IMMEDIATE ACTIONS (By Nov 23, EOD)

### ACTION 1: Confirm Staging Database (CRITICAL)

**What:** We need a database for staging testing (separate from production)

**Options:**

**Option A: Use Neon Staging Environment (Recommended)**
```
1. Log into Neon: https://console.neon.tech
2. Create a new project: "EdpsychConnect Staging"
3. Copy the connection string (pooled): postgresql://...
4. Add to Vercel environment:
   - Variable: DATABASE_URL_STAGING
   - Value: <your-staging-connection-string>
```

**Option B: Use Production DB with Staging Branch**
```
1. Keep current DATABASE_URL
2. Create separate tenant in database for testing (tenant_id = 1)
3. Add schema prefix: staging_ (optional)
4. Note: Data will persist after tests (requires cleanup)
```

**Option C: Use Docker/Local PostgreSQL** (if available)
```
1. Spin up local PostgreSQL container
2. Create database: edpsych_staging
3. Configure connection string: postgresql://localhost/edpsych_staging
4. Add to Vercel environment
```

**Your Decision:** Which option? If unsure, go with **Option A (Neon Staging)** – it's cleanest and most secure.

---

### ACTION 2: Verify Vercel Project Configuration

**What:** Confirm Vercel project is ready for staging deployment

**Checklist:**
- [ ] Vercel project: `edpsych-connect-limited` or create new `edpsych-connect-staging`
- [ ] GitHub integration active (auto-deploys from branches)
- [ ] Production URL: https://www.edpsychconnect.com
- [ ] Preview URL: https://edpsych-connect-[branch].vercel.app
- [ ] Environment variables configured:
  - [ ] DATABASE_URL (production)
  - [ ] DATABASE_URL_STAGING (staging, if using Option A)
  - [ ] NEXT_PUBLIC_* variables (public env vars)
  - [ ] Any other secrets (API keys, auth tokens)

**How to Check:**
```bash
vercel env ls  # List all environment variables
vercel projects list  # List all projects
```

**Your Decision:** Are environment variables all set up? If not, add them now.

---

### ACTION 3: Confirm GitHub SSH/Token Authentication

**What:** Ensure git push will work on Nov 24

**Check if SSH key is configured:**
```bash
cd /mnt/c/EdpsychConnect
git push origin main --dry-run
```

**If fails:**
- **Option A:** Configure SSH key (recommended)
  ```bash
  ssh-keygen -t ed25519 -C "your-email@edpsych-connect.local"
  # Add public key to GitHub: https://github.com/settings/keys
  ```
  
- **Option B:** Use GitHub token (HTTPS)
  ```bash
  git remote set-url origin https://github.com/edpsych-connect-limited/Edpsych-connect-main.git
  # Create token: https://github.com/settings/tokens
  # Use token as password when prompted
  ```

**Your Decision:** Which method? Default to SSH key if possible.

---

### ACTION 4: Assign Team Leads (CRITICAL)

**What:** Name the people who will execute each role

| Role | Responsibility | Your Assignment |
|------|-----------------|-----------------|
| **DevOps Lead** | • GitHub push<br>• Vercel deployment<br>• Database migration<br>• Environment monitoring | Name: ________ |
| **QA Lead** | • Test fixture creation<br>• Execute 5 test scenarios<br>• Document results<br>• Evidence collection | Name: ________ |
| **Engineering Lead** | • Troubleshoot API errors<br>• Debug database issues<br>• Code fixes (if needed)<br>• Lint verification | Name: ________ |
| **Product Lead** | • Stakeholder communication<br>• Timeline tracking<br>• Workshop coordination<br>• Finance/Legal briefing | Name: ________ |

**Note:** If it's just you, that's fine – you're wearing all hats. I'll coordinate each step.

---

## 📋 YOUR APPROVAL CHECKLIST (By Nov 23, EOD)

Print this out and check off each item:

- [ ] **Staging database** chosen (Option A, B, or C)
- [ ] **Staging DB connection string** obtained
- [ ] **Vercel environment variables** updated
- [ ] **GitHub authentication** tested (SSH or token)
- [ ] **Team leads assigned** (or confirmed you're doing all roles)
- [ ] **Dec 1 workshop** scheduled with Finance/Legal (calendar invite sent)
- [ ] **Team briefing** scheduled for Nov 24, 7:30 AM (30 min before deployment)

**Once all checked:** Reply with "✅ READY" and I execute Nov 24 deployment

---

## 🚀 NOV 24 EXECUTION FLOW (For Your Awareness)

**8:00 AM:** Deployment kickoff
- I push code to GitHub
- Vercel automatically triggers build
- GitHub Actions runs CI/CD

**8:45 AM:** Database migration
- I deploy Prisma migration to staging DB
- Schema created (4 tables, 15 indexes)
- Test tenant created

**9:15 AM:** API smoke tests
- I verify endpoints are responding
- Initial curl tests show HTTP 200s
- Team briefed on Nov 25 readiness

**10:00 AM:** Sign-off
- Staging environment READY
- Document saved: `nov24_deployment_checklist.md`
- Nov 25 test scenarios confirmed

**Timeline:** All done by 11:00 AM (Ready for Nov 25 kickoff)

---

## ⚠️ POTENTIAL BLOCKERS (For You to Anticipate)

| Blocker | Likelihood | Your Prep |
|---------|-----------|-----------|
| **GitHub SSH fails** | Medium | Test SSH key now or set up token |
| **Vercel build times out** | Low | Ensure package.json deps are locked |
| **Database not accessible** | Medium | Verify Neon account + credentials |
| **Environment vars missing** | Medium | Pre-populate all vars in Vercel |
| **Team members unavailable** | High | Confirm all team members can attend Nov 24 |

**Mitigation:** Do all your prep by Nov 23 EOD. Every check now = smoother Nov 24.

---

## 🎯 SUCCESS = THIS BY NOV 24, 11:00 AM

- ✅ Code committed to GitHub
- ✅ Vercel staging build complete
- ✅ Database migration deployed
- ✅ API endpoints responding
- ✅ Test fixtures created
- ✅ Team ready for Nov 25 scenarios
- ✅ Evidence collection started

**If all 7 are TRUE:** We proceed to 5-scenario testing (Nov 25-26)  
**If any are FALSE:** CTO determines fix/rollback (same-day)

---

## 📞 COMMUNICATION DURING NOV 24

**You should receive:**
- **8:00 AM:** "Deployment started, pushing code now"
- **8:30 AM:** "Build in progress (expected 15 min)"
- **8:45 AM:** "Build complete, running database migration"
- **9:15 AM:** "Migration complete, API smoke tests running"
- **9:45 AM:** "All checks passed, staging environment READY"
- **10:00 AM:** "Team briefing for Nov 25, next checkpoint"

**If anything fails:**
- Immediate escalation message
- Root cause analysis in 5 min
- Decision: FIX / ROLLBACK / RESCHEDULE

---

## 📂 DOCUMENTATION REFERENCES

- **Detailed Roadmap:** `docs/ops/EXECUTION_ROADMAP_STAGING_VALIDATION.md` (Nov 24-30 plan)
- **Deployment Checklist:** `docs/ops/nov24_deployment_checklist.md` (step-by-step)
- **Database Schema:** `prisma/schema.prisma` (4 new tables)
- **Test Scenarios:** `docs/ops/staging_validation_plan_nov24.md` (5 scenarios)
- **Workshop Materials:** `docs/ops/audit_evidence_bundle.md` (finance/legal package)

---

## ✨ BOTTOM LINE

**Your Job (By Nov 23 EOD):**
1. Choose staging database option
2. Confirm Vercel setup
3. Test GitHub authentication
4. Assign team leads
5. Schedule Dec 1 workshop
6. Reply "✅ READY"

**My Job (Nov 24, 8:00 AM):**
- Execute flawless deployment
- Keep you updated every 30 min
- Resolve any blockers same-day
- Deliver staging READY for testing

**Result:** Nov 25 you execute 5 test scenarios with confidence

---

**Status:** AWAITING YOUR APPROVAL  
**Target:** Complete by Nov 23, 5:00 PM GMT  
**Next Message:** Your confirmation + decisions above

