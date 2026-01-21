# Systematic Role Testing Plan

This document outlines the test scenarios for verifying the "invisible intelligence" and role-based access control of the EdPsych Connect platform.

## 🧪 Test Environment
- **URL**: `http://localhost:3000` (or your Vercel deployment URL)
- **Passwords**: provided via secure channel (not stored in this repo)

## 👥 User Roles & Scenarios

### 1. Super Admin (`admin@demo.com`)
**Objective**: Verify full system control.
- **Login**: Should redirect to `/admin`.
- **Check**: Access to tenant management, user oversight, and global settings.
- **Key Feature**: "God-mode" view of all schools and data.

### 1a. Platform Admin (`admin-ops@demo.com`)
**Objective**: Verify operational admin without owner access.
- **Login**: Should redirect to `/dashboard`.
- **Check**: Admin Studio access without `/admin` System Administration.
- **Key Feature**: No access to owner-only controls.

### 2. Teacher (`teacher@demo.com`)
**Objective**: Verify classroom management and lesson planning.
- **Login**: Should redirect to `/dashboard`.
- **Check**:
    - Access to **Class Roster**.
    - Ability to create **Lesson Plans**.
    - View **Student Profiles** (limited to their class).
- **Invisible Intelligence**: Check if the "Differentiation Engine" suggests adjustments for SEN students in their class.

### 3. Student (`student@demo.com`)
**Objective**: Verify student engagement and accessibility.
- **Login**: Should redirect to `/dashboard`.
- **Check**:
    - Access to **My Assignments**.
    - View **Progress Tracker**.
    - **Gamification**: Check for badges/XP visibility.
- **Invisible Intelligence**: Verify if the interface adapts to their learning style (if configured).

### 4. Parent (`parent@demo.com`)
**Objective**: Verify home-school communication.
- **Login**: Should redirect to `/dashboard`.
- **Check**:
    - View **Child's Progress**.
    - Access **Messages** from teachers.
    - View **Reports** (EHCP status).

### 5. Educational Psychologist (`ep@demo.com`)
**Objective**: Verify assessment and multi-agency tools.
- **Login**: Should redirect to `/dashboard`.
- **Check**:
    - Access to **Case Management**.
    - **Assessment Tools** (ECCA framework).
    - **Report Writer** (AI-assisted).

### 6. SENCO (`sen_coordinator@demo.com`)
**Objective**: Verify strategic oversight of special needs.
- **Login**: Should redirect to `/dashboard`.
- **Check**:
    - **School-wide SEND Register**.
    - **Intervention Tracking**.
    - **Provision Mapping**.

## 🤖 Automated Smoke Test
A Cypress test suite has been created to verify these login flows automatically.

Run the following command to execute the smoke test:
```bash
npx cypress run --spec "cypress/e2e/auth/role-smoke-test.cy.ts"
```

## 4. Automated Verification

### Option A: Backend Smoke Test (Recommended)
We have created a script to verify that all test users exist in the database with the correct roles and passwords. This does not require a browser.

**Run the smoke test:**
```bash
npx tsx tools/smoke-test-api.ts
```

**Expected Output:**
```
✅ Login Validated: admin@demo.com is ready.
✅ Login Validated: teacher@demo.com is ready.
...
✅ SYSTEM HEALTHY: All roles are configured correctly.
```

### Option B: Full E2E Test (Requires Cypress Dependencies)
This test suite runs the same test scenarios as the smoke test but with full browser automation and user interaction. It is more comprehensive but requires additional setup.

Run the following command to execute the full test suite:
```bash
npx cypress run --spec "cypress/e2e/auth/role-smoke-test.cy.ts"
```
