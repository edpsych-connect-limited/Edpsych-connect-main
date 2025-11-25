# E2E Functionality Assessment Plan

## Objective
To verify the end-to-end functionality of the EdPsych Connect platform across all user roles, identifying "prototype" behaviors, broken flows, and missing features to ensure an Enterprise-Grade experience.

## Roles & Scenarios

### 1. Teacher (`teacher@demo.com`)
- [x] **Login**: Verify successful login and redirection to Classroom Dashboard.
- [x] **Dashboard**:
    - [x] Verify "Classroom Cockpit" loads real data (not just demo mock).
        - *Fix Applied*: Assigned "Demo Class 1A" to `teacher@demo.com` in seed script.
        - *Fix Applied*: Updated API route to transform data to match frontend expectations.
    - [ ] Check "Urgency Sorting" logic.
    - [ ] Test "Voice Assistant" (UI only, as voice input is browser-dependent).
- [ ] **Student Profile**:
    - [ ] Click on a student (e.g., Amara Singh).
    - [ ] View "Progress Snapshot".
    - [ ] View "Interventions".
- [ ] **Interventions**:
    - [ ] Create a new intervention.
    - [ ] Verify it appears in the list.
- [ ] **Reports**:
    - [ ] Generate a class report.

### 2. Educational Psychologist (`ep@demo.com`)
- [ ] **Login**: Verify redirection to EP Dashboard.
- [ ] **Dashboard**:
    - [ ] View "Caseload".
    - [ ] Check "Pending Referrals".
- [ ] **Marketplace Profile**:
    - [ ] Edit Profile (Bio, Specialties).
    - [ ] Set Availability.
- [ ] **Assessment**:
    - [ ] Start a new assessment (e.g., ECCA).
    - [ ] Save draft.
    - [ ] Generate Report.

### 3. Parent (`parent@demo.com`)
- [ ] **Login**: Verify redirection to Parent Portal.
- [ ] **Dashboard**:
    - [ ] View Child's Progress.
    - [ ] View Upcoming Events/Meetings.
- [ ] **Messaging**:
    - [ ] Send message to Teacher/EP.

### 4. Admin (`admin@demo.com`)
- [ ] **Login**: Verify redirection to Admin Dashboard.
- [ ] **User Management**:
    - [ ] List users.
    - [ ] Edit user permissions.
- [ ] **Marketplace**:
    - [ ] Approve/Reject Professional applications.

### 5. Student (`student@demo.com`)
- [ ] **Login**: Verify redirection to Student Dashboard.
- [ ] **Gamification**:
    - [ ] View Leaderboard.
    - [ ] Access "Battle Royale".

## Technical Audit Checklist
- [ ] **Authentication**: Are protected routes actually protected?
- [ ] **Data Loading**: Are loading states handled gracefully (skeletons vs. spinners)?
- [ ] **Error Handling**: Do API failures show user-friendly toasts or crash the page?
- [ ] **Performance**: Are there N+1 query issues or massive bundle payloads?
- [ ] **Responsiveness**: Does the layout break on mobile/tablet?

## Execution Plan
1.  **Code Review**: Analyze route handlers and components for each scenario.
2.  **Simulation**: Use `curl` or test scripts to verify API endpoints.
3.  **Reporting**: Update this document with findings (Pass/Fail/Notes).
