# 5-Day LA Demo Battle Plan & E2E Audit

**Objective:** Verify 100% of platform functionality against live databases and ensure "Truth-by-Code" matches User Experience for the Local Authority demo.
**Deadline:** 5 Days.

## Day 1: Content Integrity & Video Audit (IMMEDIATE PRIORITY)
- [ ] **Fix "Care plam" Typo:** Locate and correct the typo in all registries/seeds.
- [ ] **Video Asset Audit:** 
    - Cross-reference `heygen-video-urls.ts` against `video_scripts/`.
    - Verify "Dr. Scott" avatar/voice consistency.
    - Flag any videos where the script claims functionality that doesn't exist in code.
- [ ] **Script vs. Code Gap Analysis:** 
    - If a video promises a feature (e.g., "AI-drafted advice"), verify the API endpoint exists and works.
    - Create "Gap Tickets" for any missing functionality.

## Day 2: Core LA Workflows (The "Happy Path")
- [ ] **LA Dashboard:** Verify all stats (Active Cases, Breaches) load from live DB.
- [ ] **EHCP Wizard E2E:** 
    - Create a new case -> Draft Plan -> Finalize.
    - Verify statutory timeline tracking (20-week clock).
- [ ] **Data Persistence:** Confirm all inputs are saved to Neon DB (no local state only).

## Day 3: Multi-Agency & Role Testing
- [ ] **Parent Portal:** Verify "Contributing Views" workflow.
- [ ] **School/SENCO Portal:** Verify "Request for Assessment" workflow.
- [ ] **EP Portal:** Verify "Submit Advice" workflow.
- [ ] **Permissions:** Ensure an LA Admin cannot see another LA's data (Tenancy Isolation).

## Day 4: Resilience & Polish
- [ ] **Error Handling:** Verify graceful failures (e.g., DB timeout, API error).
- [ ] **Performance:** Ensure dashboards load in < 2s.
- [ ] **Accessibility:** Quick scan for keyboard nav and screen reader blockers.

## Day 5: Dress Rehearsal
- [ ] **Full Demo Walkthrough:** Execute the exact script you will use with the LA.
- [ ] **Reset Scripts:** Create a "Reset Demo" script to clean data before the meeting.

---

## Current Blocker: "Care plam" Typo
Searching for: `Education Health and Care plam` or `means Education Health and`
