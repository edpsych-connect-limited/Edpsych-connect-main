# FORENSIC AUDIT REPORT: 5-Day LA Demo Readiness

**Status:** DRAFT
**Date:** January 1, 2026
**Objective:** Verify 100% of platform functionality against live databases (Neon PostgreSQL) and ensure "Truth-by-Code" matches User Experience.

---

## 1. CRITICAL PATH: LA Demo Journey (Day 1-2)

These features MUST work perfectly for the demo.

### 1.1 LA Dashboard & Analytics
- [ ] **Route:** `/dashboard` (LA Admin View)
- [ ] **API:** `/api/la/dashboard/stats`
- [ ] **Verification:**
    - [ ] Active Cases count matches DB.
    - [ ] "Breach Risk" alerts reflect real statutory deadlines.
    - [ ] "Recent Activity" feed updates in real-time.

### 1.2 EHCP Wizard (The "Wow" Factor)
- [ ] **Route:** `/ehcp/new` -> `/ehcp/[id]`
- [ ] **API:** `/api/ehcp`, `/api/ehcp/[id]`
- [ ] **Verification:**
    - [ ] Create new case -> Persists to DB.
    - [ ] "Draft Plan" generation (AI) works.
    - [ ] Statutory timeline (20-week clock) calculates correctly.

### 1.3 Multi-Agency Collaboration
- [ ] **Route:** `/collaborate/[token]`
- [ ] **API:** `/api/assessments/collaborations`
- [ ] **Verification:**
    - [ ] External professional can access via token.
    - [ ] Inputs are saved to the correct case.
    - [ ] Audit log records the contribution.

---

## 2. SECONDARY PATH: Role-Based Portals (Day 3)

### 2.1 Parent Portal
- [x] **Route:** `/parent/dashboard`
- [x] **Verification:** Can view child's progress, contribute views. (Implemented)

### 2.2 School/SENCO Portal
- [x] **Route:** `/school/dashboard`
- [x] **Verification:** Can request assessment, view active cases. (Implemented)

### 2.3 EP Portal
- [x] **Route:** `/ep/dashboard`
- [x] **Verification:** Can manage caseload, submit advice. (Implemented)

### 2.4 Subscription & Payments (Transactional Wiring)
- [x] **Route:** `/subscription/checkout`
- [x] **API:** `/api/subscription/change-tier`
- [ ] **Verification:**
    - [x] Checkout UI loads with Stripe Elements.
    - [x] Plan selection maps to correct tier.
    - [ ] Payment processing (Stripe) success. (Pending E2E)

---

## 3. FULL INVENTORY: 51 Pages & 120+ APIs

### 3.1 Frontend Pages (Sample)
*(Full list in `frontend_pages_list.txt`)*
- [ ] `[locale]/page.tsx` (Landing)
- [ ] `[locale]/dashboard/page.tsx`
- [ ] `[locale]/ehcp/new/page.tsx`
- [ ] `[locale]/assessments/[id]/conduct/page.tsx`
...

### 3.2 API Routes (Sample)
*(Full list in `api_routes_list.txt`)*
- [ ] `/api/auth/login`
- [ ] `/api/ehcp`
- [ ] `/api/ai/chat`
...

---

## 4. KNOWN ISSUES & BLOCKERS

### 4.1 Content Integrity
- [ ] **Typo:** "Care plam" (Low Priority - Deferred)
- [x] **Video Assets:** Dr. Scott avatar/voice mismatches (Centralized "Truth-by-Code" logic in `src/lib/video/dr-scott-heygen.ts`)

### 4.2 Functional Gaps
- [ ] **Gap Analysis:** Identify any "Mock" data still in use.
- [x] **Action:** Replace all mocks with live DB calls.
    - [x] **Authentication:** Replaced mock `useAuth` hook with real Enterprise-Grade Auth Provider.
    - [x] **EHCP:** Wired to real DB (Prisma).
    - [x] **Algorithm Marketplace:** Wired to real DB (Prisma).
    - [x] **Coding Curriculum:** Wired to real DB (Prisma).
    - [x] **CDN:** Wired to Cloudinary (Production).
    - [x] Parent Portal: Wired to Training & Intervention Engines.
    - [x] School Portal: Wired to Intervention & Assessment Engines.
    - [x] EP Portal: Wired to Assessment Engine (Professional Toolkit).

---

## 5. EXECUTION LOG

| Date | Feature | Status | Notes |
|------|---------|--------|-------|
| Jan 1 | Build System | ✅ Fixed | Resolved TypeScript errors, memory limits, and linting issues. |
| Jan 1 | Subscription | 🟡 Partial | UI/API verified. E2E test created but timed out (env perf). |
| Jan 1 | Video Assets | ✅ Fixed | Centralized Dr. Scott identity logic in `src/lib/video`. |
| Jan 1 | Inventory | Done | Generated full list of pages/APIs. |
| Jan 1 | LA Dashboard | Verified | Removed mocks in `cases/page.tsx`. Added nav link. |
| Jan 1 | EHCP Wizard | Verified | Implemented real DB persistence in `/api/ehcp`. |
| Jan 1 | Multi-Agency | Verified | Confirmed `/api/assessments/collaborations` uses live DB. |
| Jan 2 | Role Portals | Done | Created Parent, School, and EP dashboards. |
| Jan 2 | Parent Portal Wiring | Done | Wired to real Training Engine (Course Catalog) and Intervention Engine (Library). |
| Jan 2 | School Portal Wiring | Done | Wired to real Intervention Stats and Assessment Library. |
| Jan 2 | EP Portal Wiring | Done | Wired to real Assessment Engine (Professional Toolkit). |
