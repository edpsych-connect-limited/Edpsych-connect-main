# Unified EdPsych Platform Roadmap (Master)

> **Context:** This unified roadmap consolidates the "LinkedIn Rival" vision with the current technical implementation status.
> **Current Focus:** Phase 1 (Profiles) & Phase 4 (Pricing).

## 📊 High-Level Priority (User's Vision)

| Priority | Feature Ecosystem | Status | Technical Mapping |
|----------|-------------------|--------|-------------------|
| **1** | **Professional Profiles & Portfolios** | **✅ Complete** | `Phase 1` & `Phase 2` |
| **2** | **Endorsements & Reviews System** | ❌ Not started | `Phase 5` |
| **3** | **Commissioning Marketplace (RFP)** | ❌ Not started | Future Phase (6) |
| **4** | **Professional Feed & Activity Stream** | ❌ Not started | Future Phase (7) |
| **5** | **Community Groups & Forums** | ❌ Not started | Future Phase (8) |
| **6** | **Blog Enhancement (Peer Review AI)** | 🟡 Ongoing | Blog Engine |

---

## 🛠️ Detailed Implementation Plan

### Phase 1: Core Professional Identity (The "LinkedIn Foundation")
**Status:** ✅ Mostly Complete
- [x] **Data Architecture:** `ProfessionalProfile` schema, Experience, Education, Skills models.
- [x] **Service Layer:** `ProfessionalProfileService` for data retrieval.
- [x] **Profile View:** Read-only UI at `/marketplace/profile`.
- [x] **Navigation:** Integrated into "Marketplace Studio" sidebar.

### Phase 2: Profile Management (The "Edit" Capabilities)
**Status:** ✅ **Complete**
- [x] **Experience:** "Add Experience" Sheet & Server Action (`upsertExperience`).
- [x] **Education:** "Add Education" Sheet & Server Action (`upsertEducation`).
- [x] **Skills:** "Add Skills" UI & Server Action (`addSkill`).
- [x] **CRUD:** Edit/Delete capabilities for list items (Delete implemented).
- [x] **Media:** Profile Picture Upload (Cloudinary integration).

### Phase 3: Public Directory & Search
**Status:** ✅ **COMPLETE**
- [x] **Public View:** `/professional/[id]` (SEO optimized).
- [x] **Discovery:** Directory page with text search (`/directory`).
- [x] **Call-to-Action:** "Contact" button logic (Modal + Email + Dashboard Inbox).

## Phase 4: Monetization & Subscriptions (Prioritized)
**Status:** 🟡 **In Progress**
- [ ] **Commercial Strategy:** Define Subscription vs. Commission models.
- [x] **Infrastructure:** Stripe Connect integration (Schema & Service Layer).
- [x] **Billing:** Subscription management portal (Backend Services Ready).
- [ ] **UI:** Connect Onboarding & Subscription Pricing Page Integration.

## Phase 5: Trust & Interaction (Endorsements)
**Status:** ✅ **Partial**
- [x] **Reviews:** `ProfessionalRecommendation` model.
- [x] **UI:** "Write a Recommendation" Form & Display List.
- [ ] **Verification:** "Verified Client" tag logic.
- [ ] **Endorsements:** "Vouching" system for skills.
- [ ] **Verification:** DBS/HCPC badge verification workflow.

### Phase 6: Commissioning Marketplace (The "Revenue Engine")
**Status:** ⏳ Pending
- [ ] **RFP System:** Schools post requirements.
- [ ] **Bidding:** EPs submit proposals.
- [ ] **Contracts:** Digital contract generation.

---

## Technical Audits & Sync
- **Roadmap Synchronization:** This file `ROADMAP.md` now supersedes previous partial roadmaps.
- **Codebase State:**
  - `src/services/professional-profile-service.ts`: Active
  - `src/app/actions/professional-profile.ts`: Active
  - `src/components/marketplace/profile`: Active
- [ ] Internal Messaging
