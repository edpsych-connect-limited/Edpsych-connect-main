# 🔧 VERCEL DEPLOYMENT SETUP – ACTION REQUIRED

**Status:** ✅ Code ready, ⏳ Awaiting Vercel token configuration  
**Date:** November 18, 2025  
**Issue:** GitHub Actions workflow needs Vercel API token in GitHub Secrets

---

## 🎯 WHAT'S HAPPENING

### Current State ✅
- ✅ All code committed to GitHub
- ✅ GitHub Actions workflow created (`.github/workflows/deploy-to-vercel.yml`)
- ✅ Vercel project linked locally
- ⏳ **Deployment blocked:** Vercel token not in GitHub Secrets

### Why It's Blocked
The GitHub Actions workflow is configured but needs:
1. **VERCEL_TOKEN** (your Vercel API token)
2. **VERCEL_ORG_ID** (team ID: `team_Gm0c4kafxDYK5Pi6ksfvCW1I`)
3. **VERCEL_PROJECT_ID** (project ID: `prj_lkWl7nKkELhz1WD6RuhI8myWiCCG`)

---

## 📋 YOUR ACTION REQUIRED (5 Minutes)

### Step 1: Generate Vercel API Token

**Go to:** https://vercel.com/account/tokens

**Create new token:**
- Token name: "GitHub Actions Deployment"
- Scope: Full Account (or EdPsych Connect Limited team)
- Expiration: 30 days (or longer)

**Copy the token** (you'll only see it once)

### Step 2: Add GitHub Secrets

**Go to:** https://github.com/edpsych-connect-limited/Edpsych-connect-main/settings/secrets/actions

**Create 3 new secrets:**

1. **Secret Name:** `VERCEL_TOKEN`
   - **Value:** (paste your token from Step 1)

2. **Secret Name:** `VERCEL_ORG_ID`
   - **Value:** `team_5w4WlbG1wuQCrvi6Irp9GLbH`

3. **Secret Name:** `VERCEL_PROJECT_ID`
   - **Value:** `prj_QF0sNGVBMfIbzFy6lasTfx2V09TW`

### Step 3: Trigger Deployment

**Option A (Automatic):** 
- Push any code to main branch
- GitHub Actions will automatically deploy

**Option B (Manual):**
- Go to https://github.com/edpsych-connect-limited/Edpsych-connect-main/actions
- Select "Deploy to Vercel" workflow
- Click "Run workflow" → "Run workflow"

---

## 📊 WHAT THESE SECRETS DO

| Secret | Purpose | Value |
|--------|---------|-------|
| `VERCEL_TOKEN` | Authenticates to Vercel | Your API token |
| `VERCEL_ORG_ID` | Specifies team | `team_5w4WlbG1wuQCrvi6Irp9GLbH` |
| `VERCEL_PROJECT_ID` | Specifies project | `prj_QF0sNGVBMfIbzFy6lasTfx2V09TW` |

Once set, GitHub Actions can automatically deploy to Vercel on every push to main.

---

## ⏳ EXPECTED FLOW (After Secrets Configured)

1. You push code to GitHub main branch
2. GitHub Actions workflow triggers automatically
3. Workflow runs `npx vercel --prod --token $VERCEL_TOKEN`
4. Vercel receives deployment request (authenticated)
5. Build starts (ESLint + Next.js)
6. Application deployed to production
7. Vercel production URL updated

**Total time:** ~10-15 minutes from push to live

---

## 🔗 DIRECT LINKS

**Generate Vercel Token:**
https://vercel.com/account/tokens

**Add GitHub Secrets:**
https://github.com/edpsych-connect-limited/Edpsych-connect-main/settings/secrets/actions

**View GitHub Actions:**
https://github.com/edpsych-connect-limited/Edpsych-connect-main/actions

**Vercel Project:**
https://vercel.com/ed-psych-connect-team/edpsych-connect

---

## ✅ VERIFICATION CHECKLIST

After you add the secrets:

- [ ] Vercel token created and copied
- [ ] `VERCEL_TOKEN` added to GitHub Secrets
- [ ] `VERCEL_ORG_ID` added to GitHub Secrets  
- [ ] `VERCEL_PROJECT_ID` added to GitHub Secrets
- [ ] All 3 secrets visible in GitHub Secrets list

**After all secrets are set:**
- [ ] Trigger workflow manually (or push new code)
- [ ] Watch GitHub Actions logs
- [ ] Wait for "Deploy to Vercel" step to complete
- [ ] Visit Vercel dashboard to confirm deployment
- [ ] Test production URL

---

## 🎯 TIMELINE

**NOW:** Add 3 secrets to GitHub (5 minutes)  
**THEN:** Trigger workflow (automatic or manual)  
**RESULT:** Vercel deployment in 10-15 minutes  

---

## 📞 IF SOMETHING GOES WRONG

### "Token is invalid or has expired"
- Regenerate token at https://vercel.com/account/tokens
- Update `VERCEL_TOKEN` secret with new token

### "Permission denied for team"
- Verify token has team access
- Try generating token with "Full Account" scope

### "Workflow not running"
- Check GitHub Actions tab: https://github.com/edpsych-connect-limited/Edpsych-connect-main/actions
- Look for "Deploy to Vercel" workflow
- Click it to see detailed logs

---

**STATUS:** Code ready, awaiting GitHub Secrets configuration  
**YOUR ACTION:** Add 3 secrets to GitHub  
**EXPECTED RESULT:** Automatic Vercel deployments from GitHub  

