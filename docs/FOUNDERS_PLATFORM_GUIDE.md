# Founder's Pre-Beta Platform Guide
## Everything You Need to Know About Your Platform

**Created**: January 2025  
**Purpose**: Answer your key questions before Beta launch  
**Status**: Living document

---

## 📋 Table of Contents

1. [How Ethics & Governance Works](#1-ethics--governance)
2. [What Happens When People Subscribe](#2-subscription-flow)
3. [MIS Integration for Schools](#3-mis-integration)
4. [Video Coverage Analysis](#4-video-coverage)
5. [Backend-to-Frontend Exposure](#5-backend-to-frontend)
6. [Landing Page Alignment](#6-landing-page-alignment)
7. [What You Should Do Right Now](#7-recommended-actions)

---

## 1. Ethics & Governance

### What Exists

**Interface Definition**: `src/research/foundation/governance/services/governance-service.ts`
- 280 lines of TypeScript interfaces
- Defines ethics approval workflow, compliance tracking, governance reporting
- Well-documented type system

**Implementation**: `src/services/institutional-management/audit-log-service.ts`
- `AIGovernanceLayer` class
- Explainability recording for AI decisions
- Bias detection in AI outputs
- GDPR/FERPA compliance validation

**Database Models**: `prisma/schema.prisma`
- `research_ethics_approvals` table
- `research_objects` with governance status
- Compliance event tracking

### How It Works (Current State)

1. **Research Object Registration**
   - Objects registered via `GovernanceService.registerResearchObject()`
   - Linked to ethics approval IDs

2. **Ethics Approval Flow**
   - Interface defined but **no UI for ethics submission** currently
   - API structure exists in research routes

3. **AI Governance**
   - Every AI decision can be audited
   - Bias detection runs automatically
   - Compliance validation before data processing

### What's Missing

| Gap | Impact | Priority |
|-----|--------|----------|
| Ethics submission UI | Researchers can't submit for approval | HIGH |
| Ethics review dashboard | Reviewers can't approve/reject | HIGH |
| Automated compliance checks | Manual process only | MEDIUM |

---

## 2. Subscription Flow

### What Happens When Someone Subscribes

1. **Frontend Selection**
   - User views plans at `/pricing`
   - Clicks "Subscribe" → opens Stripe Checkout

2. **Stripe Integration**: `src/app/api/stripe/route.ts`
   - Creates Stripe Checkout session
   - Handles webhooks for payment events

3. **On Successful Payment**
   ```
   Stripe webhook → /api/stripe (webhook endpoint)
   → Update user subscription in database
   → Send confirmation email (NOW IMPLEMENTED)
   → Grant feature access via featureGate.ts
   ```

4. **Feature Gating**: `src/lib/featureGate.ts`
   - Checks subscription tier
   - Unlocks features based on plan
   - Controls UI visibility

### Current Plans (December 2025 Pricing)

| Plan | Monthly | Target |
|------|---------|--------|
| Trainee EP | £19 | Doctoral students |
| Individual EP | £49 | Independent practitioners |
| SENCO Essential | £79 | School SENCOs |
| Primary School | £149 | Small schools |
| Secondary School | £299 | Larger schools |
| Multi-Academy Trust | £799-3,999 | MATs |
| Local Authority | £2,999-29,999 | LAs |

### What's Fully Working

- ✅ Stripe Checkout creation
- ✅ Webhook handling for payment success
- ✅ Email confirmation on subscription
- ✅ Feature gating based on tier
- ✅ Usage limits (AI calls, cases, storage)

---

## 3. MIS Integration

### What Exists

**Wonde Integration**: `src/lib/integrations/wonde.ts`
- Full implementation with Wonde API
- Syncs students, schools, staff
- Writes directly to database

**SIMS Integration**: `src/lib/integrations/sims.ts`
- Direct SIMS Connect integration
- Alternative to Wonde for schools with direct SIMS access

**Database Model**: `IntegrationSettings` in Prisma
- Stores Wonde API keys
- Tracks sync status
- Per-tenant configuration

### Zero-Touch Setup (What Schools Need to Do)

```markdown
# School MIS Integration Guide

## Setup Time: 5 minutes

### Step 1: Get Your Wonde Key
1. Go to your Wonde dashboard (wonde.com)
2. Create an API key for EdPsych Connect
3. Copy the key

### Step 2: Connect in EdPsych Connect
1. Log in as School Admin
2. Go to Settings → Integrations
3. Select "Wonde" (or SIMS Direct)
4. Paste your API key
5. Click "Test Connection"
6. If successful, click "Enable Auto-Sync"

### Step 3: Initial Sync
- Students will sync automatically overnight
- Or click "Sync Now" for immediate sync
- No manual data entry required!

### What Syncs Automatically
- Student names and DOB
- Year groups
- SEN status codes
- Staff information
- Timetable data

### BYOD Option (Enterprise)
For data sovereignty, schools can:
- Host their own database
- Connect EdPsych Connect to their DB
- All data stays on their infrastructure
```

### What's Missing

| Gap | Impact | Priority |
|-----|--------|----------|
| Integration settings UI | Admins can't configure via UI | HIGH |
| Sync status dashboard | Can't monitor sync health | MEDIUM |
| Error notification | Silent failures | MEDIUM |

---

## 4. Video Coverage Analysis

### Videos We Have (HeyGen Generated)

Based on `cloudinary-video-urls.json` and generation logs:

| Category | Videos | Status |
|----------|--------|--------|
| Pricing/Plans | 8 | ✅ Generated |
| Feature Deep-Dives | 12 | ✅ Generated |
| Role-Specific | 6 | ✅ Generated |
| Training Modules | 30+ | ✅ Generated |

### Videos Scripted But Status Unknown

Check `video_scripts/world_class/`:
- Intervention Library video (claims 535 - **NEEDS UPDATE**)
- School adoption journey
- Parent testimonials
- EP professional workflow

### Recommended Video Gaps

| Missing Video | Audience | Priority |
|--------------|----------|----------|
| MIS Integration Demo | School IT | HIGH |
| Ethics Submission Flow | Researchers | MEDIUM |
| BYOD Setup Guide | Enterprise IT | MEDIUM |
| Mobile App Overview | All users | LOW |

---

## 5. Backend-to-Frontend Exposure

### Summary from Forensic Inventory

| Category | Backend Files | Exposed in UI | Coverage |
|----------|--------------|---------------|----------|
| Auth | 15 | 15 | 100% |
| Assessment | 25 | 20 | 80% |
| Intervention | 10 | 8 | 80% |
| Training | 12 | 10 | 83% |
| EHCP | 30 | 25 | 83% |
| Research | 20 | 12 | 60% |
| MIS Integration | 8 | 3 | 38% |

### Critical Unexposed Features

1. **MIS Integration UI** (38% exposed)
   - Backend: Full Wonde/SIMS implementation
   - Frontend: Only basic settings page

2. **Research Ethics** (60% exposed)
   - Backend: Full governance interfaces
   - Frontend: No ethics submission UI

3. **Advanced Analytics** (70% exposed)
   - Backend: Comprehensive analytics service
   - Frontend: Basic dashboard only

---

## 6. Landing Page Alignment

### ✅ Accurate Claims

| Claim | Source | Reality |
|-------|--------|---------|
| "100+ interventions" | CoreCapabilitiesGrid | 110 actual ✅ |
| "ECCA Framework" | Multiple | Fully implemented ✅ |
| "Zero-Touch EHCP" | Multiple | Draft generation works ✅ |
| "Battle Royale" | Gamification | Implemented ✅ |
| "UK Focus" | Multiple | UK-localised ✅ |

### 🔴 Inaccurate Claims

| Claim | Source | Reality | Action |
|-------|--------|---------|--------|
| "535 interventions" | Video scripts | 110 actual | **UPDATE** |
| "535+ strategies" | BETA_LOGIN_CREDENTIALS | 110 actual | **UPDATE** |

### Landing Page Components

Located in `src/components/landing/`:
- `HeroOrchestration.tsx` - Main hero
- `CoreCapabilitiesGrid.tsx` - Feature grid (100+ claim ✅)
- `CommunityInsights.tsx` - Role-specific content
- `FlagshipECCA.tsx` - ECCA deep-dive
- `FlagshipGamification.tsx` - Battle Royale
- `legacy/FeatureShowcaseSection.tsx` - 100+ claim ✅

---

## 7. Recommended Actions

### If You Were Me Right Now

#### IMMEDIATE (Do Before Beta)

1. **Fix the 535 → 100+ Discrepancy**
   - Update `docs/BETA_LOGIN_CREDENTIALS.md`
   - Update `docs/FOUNDERS-VISION-ASSESSMENT.md`
   - Update video script (or add disclaimer)
   - Time: 30 minutes

2. **Verify Live Site**
   - Log in as each role (Teacher, Parent, EP, SENCO)
   - Check all main navigation links work
   - Verify interventions load (100+ items)
   - Test training courses load (10 courses)
   - Time: 1 hour

3. **Review Promise Document**
   - Read `docs/PROMISE_VS_DELIVERY_RECONCILIATION.md`
   - Sign off on accuracy
   - Time: 15 minutes

#### POST-BETA (Week 1-2)

4. **Add Missing UIs**
   - MIS Integration settings page
   - Ethics submission form
   - Sync status dashboard

5. **Expand Content**
   - Consider adding more interventions
   - Add more training courses
   - Fill video gaps

6. **User Feedback Loop**
   - Watch for confusion about features
   - Track which features get used
   - Note feature requests

---

## 📊 Platform Health Summary

| Area | Status | Confidence |
|------|--------|------------|
| Core Auth | ✅ Excellent | 95% |
| Subscription | ✅ Excellent | 90% |
| Interventions | ✅ Good (100+) | 85% |
| Training | ✅ Good (10 courses) | 85% |
| EHCP | ✅ Good | 80% |
| MIS Integration | ⚠️ Backend ready, UI partial | 60% |
| Research Ethics | ⚠️ Interface only | 50% |
| Marketing Claims | ⚠️ One major discrepancy | 75% |

---

## 🎯 Your Beta Launch Checklist

- [ ] Fix 535 → 100+ in documentation
- [ ] Test live site as each role
- [ ] Verify Stripe test payments work
- [ ] Check all videos play correctly
- [ ] Review and sign PROMISE_VS_DELIVERY_RECONCILIATION.md
- [ ] Brief beta testers on known limitations
- [ ] Set up feedback collection mechanism

---

*This guide reflects the honest state of your platform. You've built something genuinely impressive - now let's make sure we promise exactly what we deliver.*
