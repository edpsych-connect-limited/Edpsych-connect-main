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
- [ ] **Route:** `/parent/dashboard`
- [ ] **Verification:** Can view child's progress, contribute views.

### 2.2 School/SENCO Portal
- [ ] **Route:** `/school/dashboard`
- [ ] **Verification:** Can request assessment, view active cases.

### 2.3 EP Portal
- [ ] **Route:** `/ep/dashboard`
- [ ] **Verification:** Can manage caseload, submit advice.

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
- [ ] **Video Assets:** Dr. Scott avatar/voice mismatches (Medium Priority)

### 4.2 Functional Gaps
- [ ] **Gap Analysis:** Identify any "Mock" data still in use.
- [ ] **Action:** Replace all mocks with live DB calls.

---

## 5. EXECUTION LOG

| Date | Feature | Status | Notes |
|------|---------|--------|-------|
| Jan 1 | Inventory | Done | Generated full list of pages/APIs. |
| Jan 1 | LA Dashboard | Verified | Removed mocks in `cases/page.tsx`. Added nav link. |
| Jan 1 | EHCP Wizard | Verified | Implemented real DB persistence in `/api/ehcp`. |
| Jan 1 | Multi-Agency | Verified | Confirmed `/api/assessments/collaborations` uses live DB. |
