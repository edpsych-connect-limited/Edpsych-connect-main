# Manual E2E Testing - Quick Start Guide

**Date**: 2025-11-04
**Purpose**: Step-by-step manual testing using the test accounts created
**Time Required**: 30-60 minutes
**Dev Server**: http://localhost:3002

---

## Test Accounts Created ✅

Passwords are provided via secure channel (not stored in this repo).

| Role | Email | Password | Access Level |
|------|-------|----------|-------------|
| **Teacher** | teacher@test.edpsych.com | *Provided securely* | Year 3 Oak class (assigned) |
| **Student** | amara.singh@test.edpsych.com | *Provided securely* | Year 3, Student ID: 16 |
| **Parent** | priya.singh@test.edpsych.com | *Provided securely* | Mother of Amara Singh |
| **EP (Educational Psychologist)** | dr.patel@test.edpsych.com | *Provided securely* | Caseload includes Amara Singh |

**Tenant**: test-school (ID: 2)
**Database**: 50 students, 8 classes, 40 lesson plans already seeded

---

## Pre-Testing Checklist

Before you begin, verify:

- [ ] Dev server running: `http://localhost:3002`
- [ ] Database seeded with 50 students in tenant 2
- [ ] Login page accessible: `http://localhost:3002/login`
- [ ] No console errors on page load

**Quick Check**:
```bash
# Verify dev server is running
curl http://localhost:3002/api/health

# Should return: {"status":"ok"}
```

---

## Test Session 1: Teacher Workflow (15 minutes)

### Step 1.1: Login as Teacher

1. Navigate to: `http://localhost:3002/login`
2. Enter credentials:
   - Email: `teacher@test.edpsych.com`
   - Password: *Provided securely*
3. Click "Sign In"

**Expected**:
- ✅ Login successful
- ✅ Redirect to teacher dashboard
- ✅ See "Welcome, Sarah Mitchell" or similar

**If it fails**: Check that authentication system is configured and running.

---

### Step 1.2: View Class Dashboard

1. Navigate to: `http://localhost:3002/class/dashboard` or teacher dashboard
2. Select "Year 3 Oak" class (if multiple classes shown)

**Expected**:
- ✅ Class name displays: "Year 3 Oak"
- ✅ Student count shows (should show assigned students)
- ✅ Student cards render (at least a few students)
- ✅ Each card shows:
  - Student name
  - Year group
  - Some profile information

**To Test**:
- [ ] Click on a student card → Should expand or show more details
- [ ] Hover over student cards → Should show interaction (hover state)
- [ ] Check for "Actions Today" summary section
- [ ] Check for "Pending Actions" section

**Notes**:
_Write down what you see:_
- Number of students shown: ____________
- Any errors in console: ____________
- Performance (loads fast/slow): ____________

---

### Step 1.3: View Student Profile

1. From class dashboard, click on "Amara Singh" student card
2. Profile should display (modal, panel, or separate page)

**Expected**:
- ✅ Profile loads for Amara Singh
- ✅ Shows learning preferences
- ✅ Shows engagement/performance data
- ✅ Shows strengths and areas for development

**To Test**:
- [ ] Profile data displays correctly
- [ ] No "undefined" or null values
- [ ] Data looks realistic (not placeholder text)
- [ ] Can close profile and return to dashboard

---

### Step 1.4: Check Assigned Lessons (if implemented)

1. Look for "Lessons" or "Assignments" section
2. Check if any lessons are assigned to the class

**Expected**:
- ✅ See list of lesson plans (or empty state if none assigned)
- ✅ Each lesson shows: Title, Subject, Date
- ✅ Can view lesson details

**To Test**:
- [ ] Click on a lesson → Should show lesson details
- [ ] Check if "Assign to Class" button exists
- [ ] Try assigning a lesson (if feature exists)

---

### Step 1.5: Logout

1. Click user menu (top right)
2. Click "Logout" or "Sign Out"

**Expected**:
- ✅ Logged out successfully
- ✅ Redirected to login page
- ✅ Cannot access teacher dashboard without re-authenticating

---

## Test Session 2: Student Workflow (10 minutes)

### Step 2.1: Login as Student

1. Navigate to: `http://localhost:3002/login`
2. Enter credentials:
   - Email: `amara.singh@test.edpsych.com`
   - Password: *Provided securely*
3. Click "Sign In"

**Expected**:
- ✅ Login successful
- ✅ Redirect to student dashboard
- ✅ See "Welcome, Amara" or similar
- ✅ Different interface than teacher view

---

### Step 2.2: View Assigned Lessons

1. Navigate to student dashboard or "My Lessons"
2. Check for assigned lessons

**Expected**:
- ✅ See list of assigned lessons (or empty state)
- ✅ Each lesson shows: Title, Subject, Due Date, Status
- ✅ Can view lesson details

**To Test**:
- [ ] Click on a lesson → Should open lesson view
- [ ] Check if lesson content displays
- [ ] Check if activities/questions exist
- [ ] Try completing an activity (if possible)

**Notes**:
_What you see:_
- Number of lessons assigned: ____________
- Can complete activities: Yes / No
- Any errors: ____________

---

### Step 2.3: View Own Progress

1. Look for "My Progress" or "Performance" section
2. Check what progress data is shown

**Expected**:
- ✅ See own performance metrics
- ✅ Cannot see other students' data
- ✅ Progress visualized (charts, badges, scores)

**To Test**:
- [ ] Progress data displays correctly
- [ ] Only shows own data (not whole class)
- [ ] Data is understandable for a student

---

### Step 2.4: Logout

1. Click user menu
2. Logout

**Expected**:
- ✅ Logged out successfully
- ✅ Redirected to login page

---

## Test Session 3: Parent Workflow (10 minutes)

### Step 3.1: Login as Parent

1. Navigate to: `http://localhost:3002/login`
2. Enter credentials:
   - Email: `priya.singh@test.edpsych.com`
   - Password: *Provided securely*
3. Click "Sign In"

**Expected**:
- ✅ Login successful
- ✅ Redirect to parent portal
- ✅ See child's name: "Amara Singh"
- ✅ Parent-friendly interface (simple language, no jargon)

---

### Step 3.2: View Child's Progress

1. Navigate to parent portal (should be default view)
2. Check what information is shown

**Expected**:
- ✅ Child's name prominently displayed
- ✅ Section: "This Week's Wins" or recent achievements
- ✅ Section: "What We're Working On"
- ✅ Section: "How You Can Help at Home"
- ✅ Recent progress summary
- ✅ All text in plain English (no education jargon)

**To Test**:
- [ ] Information is celebration-framed (positive tone)
- [ ] Suggestions are practical and actionable
- [ ] No technical terms (no "KS2 SATs" or "Y3 curriculum")
- [ ] Data feels personal and specific to Amara

**Notes**:
_Parent portal content quality:_
- Language is parent-friendly: Yes / No
- Wins are specific: Yes / No
- Home support is actionable: Yes / No
- Any jargon spotted: ____________

---

### Step 3.3: Security Check - Try Accessing Another Child

**CRITICAL SECURITY TEST**

1. Note current URL (e.g., `http://localhost:3002/parent/portal/16`)
2. Manually change URL to another student ID: `http://localhost:3002/parent/portal/17`
3. Press Enter

**Expected**:
- ✅ Shows "Access Denied" error
- ✅ Returns 403 status code
- ✅ Cannot view other children's data
- ✅ Error message explains: "You can only view your own child's progress"

**If this test FAILS** (shows another child's data):
- 🚨 **CRITICAL SECURITY ISSUE**
- Stop testing immediately
- Document the issue
- Report to development team

---

### Step 3.4: Send Message to Teacher (if implemented)

1. Look for "Messages" or "Contact Teacher" button
2. Try sending a message

**Expected**:
- ✅ Message form accessible
- ✅ Can write message to teacher
- ✅ Message sends successfully
- ✅ Confirmation shown

**To Test**:
- [ ] Write sample message: "Question about homework"
- [ ] Click Send
- [ ] Check if message saved (look in database or teacher inbox)

---

### Step 3.5: Logout

1. Logout from parent portal

**Expected**:
- ✅ Logged out successfully

---

## Test Session 4: Educational Psychologist Workflow (15 minutes)

### Step 4.1: Login as EP

1. Navigate to: `http://localhost:3002/login`
2. Enter credentials:
   - Email: `dr.patel@test.edpsych.com`
   - Password: *Provided securely*
3. Click "Sign In"

**Expected**:
- ✅ Login successful
- ✅ Redirect to EP dashboard
- ✅ See "Welcome, Dr. Priya Patel"
- ✅ Access to wider range of students than teacher

---

### Step 4.2: View Caseload

1. Navigate to EP dashboard or "My Caseload"
2. Check students assigned to EP

**Expected**:
- ✅ See caseload of students (includes Amara Singh)
- ✅ Each student shows key information
- ✅ Can view detailed student profiles

**To Test**:
- [ ] Find Amara Singh in caseload
- [ ] Click to view full profile
- [ ] Check if EHCP data visible (if implemented)
- [ ] Check if intervention history shown

**Notes**:
_Caseload view:_
- Number of students in caseload: ____________
- Can access EHCP data: Yes / No
- Data more detailed than teacher view: Yes / No

---

### Step 4.3: View Cross-School Data (if implemented)

1. Look for "All Students" or "School Overview" section
2. Check if can see students beyond caseload

**Expected**:
- ✅ Can view all 50 students in test-school tenant
- ✅ Not limited to single class
- ✅ Can filter/search students
- ✅ Summary statistics shown

**To Test**:
- [ ] Count total students visible
- [ ] Search for a specific student
- [ ] Filter by year group or need level
- [ ] Check summary stats (total students, interventions, etc.)

---

### Step 4.4: Access Multi-Agency Data

1. Look for student profile for a student with EHCP (if any)
2. Check level of detail accessible

**Expected**:
- ✅ More detailed data than teacher view
- ✅ Can see EHCP status and details
- ✅ Can see interventions across different providers
- ✅ Can see assessment history

**To Test**:
- [ ] Compare data visible to EP vs teacher
- [ ] Check if medical/sensitive data visible
- [ ] Verify appropriate access controls

---

### Step 4.5: Logout

1. Logout from EP dashboard

---

## Test Session 5: API Endpoint Testing (15 minutes)

### Test 5.1: Student Profile API

Open browser DevTools (F12) → Network tab, then:

1. Login as teacher
2. View class dashboard
3. Click on Amara Singh's profile

**In Network Tab, check**:
- ✅ Request to `/api/students/16/profile` (or similar)
- ✅ Status: 200 OK
- ✅ Response contains profile data (JSON)
- ✅ Response time < 500ms

**Direct API Test** (in browser console):
```javascript
fetch('/api/students/16/profile')
  .then(r => r.json())
  .then(data => console.log('Profile:', data));
```

**Expected**:
- ✅ Returns student profile JSON
- ✅ No errors in console

---

### Test 5.2: Authentication Check

**Test 1: Access without login**

1. Logout completely
2. Open new incognito/private window
3. Try accessing: `http://localhost:3002/class/dashboard`

**Expected**:
- ✅ Redirected to login page
- ✅ Cannot access protected route
- ✅ Shows "Please login" message

**Test 2: API without auth**

In browser console (while logged out):
```javascript
fetch('/api/students/16/profile')
  .then(r => console.log('Status:', r.status, r.statusText));
```

**Expected**:
- ✅ Status: 401 Unauthorized (or 403 Forbidden)
- ✅ No data returned

---

### Test 5.3: Database Query Check (Optional)

If you can access the database:

```bash
# Open Prisma Studio
npx prisma studio
```

**Check**:
1. Open `users` table
   - [ ] Find teacher@test.edpsych.com
   - [ ] Find amara.singh@test.edpsych.com
   - [ ] Find priya.singh@test.edpsych.com
   - [ ] Find dr.patel@test.edpsych.com
   - [ ] All have `is_active: true`

2. Open `students` table
   - [ ] Find Amara Singh (ID: 16)
   - [ ] Check tenant_id = 2
   - [ ] Check year_group = "Year 3"

3. Open `ParentChildLink` table
   - [ ] Find link between parent and child
   - [ ] Check is_verified = true
   - [ ] Check parent_id matches priya.singh user ID
   - [ ] Check child_id = 16 (Amara)

4. Open `professionals` table
   - [ ] Find Dr. Priya Patel's professional profile
   - [ ] Check student_ids array includes 16 (Amara)

---

## Test Session 6: Performance & Usability (10 minutes)

### Performance Checks

**Page Load Times** (using browser DevTools → Network tab):

1. Login page: ____________ ms (target: < 1s)
2. Teacher dashboard: ____________ ms (target: < 2s)
3. Student profile: ____________ ms (target: < 500ms)
4. Parent portal: ____________ ms (target: < 1s)

**Interaction Response**:
- Click student card → Opens: Fast / Slow
- Navigate between pages: Smooth / Choppy
- Forms submit: Instant / Delayed

---

### Usability Checks

**Teacher View**:
- [ ] Interface intuitive (easy to navigate)
- [ ] Clear labels and buttons
- [ ] Help text where needed
- [ ] No confusing terminology

**Student View**:
- [ ] Age-appropriate interface
- [ ] Large, clear buttons
- [ ] Colorful and engaging
- [ ] Easy to understand tasks

**Parent View**:
- [ ] Simple, jargon-free language
- [ ] Clear navigation
- [ ] Focus on positive framing
- [ ] Practical suggestions

---

### Accessibility Checks

**Keyboard Navigation**:
1. Try navigating with Tab key
   - [ ] Can reach all interactive elements
   - [ ] Focus indicators visible
   - [ ] Logical tab order

**Screen Reader Test** (optional, if you have screen reader):
- [ ] Page structure announced correctly
- [ ] Buttons and links have clear labels
- [ ] Form fields have labels

---

## Test Session 7: Error Handling (5 minutes)

### Test Error States

**Test 1: Invalid Login**
1. Try logging in with wrong password
2. Expected: ✅ Clear error message ("Invalid credentials")

**Test 2: Network Error Simulation**
1. Open DevTools → Network tab
2. Change to "Offline" mode
3. Try loading a page
4. Expected: ✅ Shows network error message (not crash)

**Test 3: Invalid Student ID**
1. Try accessing: `http://localhost:3002/api/students/99999/profile`
2. Expected: ✅ 404 error with message "Student not found"

---

## Bugs & Issues Found

**Use this section to document any problems:**

### Issue 1:
- **What happened**: ___________________________________
- **Steps to reproduce**: ______________________________
- **Expected**: ________________________________________
- **Actual**: __________________________________________
- **Severity**: Critical / High / Medium / Low

### Issue 2:
- **What happened**: ___________________________________
- **Steps to reproduce**: ______________________________
- **Expected**: ________________________________________
- **Actual**: __________________________________________
- **Severity**: Critical / High / Medium / Low

### Issue 3:
- **What happened**: ___________________________________
- **Steps to reproduce**: ______________________________
- **Expected**: ________________________________________
- **Actual**: __________________________________________
- **Severity**: Critical / High / Medium / Low

---

## Testing Completion Checklist

### Core Workflows
- [ ] Teacher can login and view dashboard
- [ ] Teacher can view student profiles
- [ ] Student can login and view assignments
- [ ] Parent can login and view child progress
- [ ] EP can login and view caseload

### Security
- [ ] Authentication required for protected routes
- [ ] Parent cannot access other children's data
- [ ] Role-based permissions enforced
- [ ] API endpoints return 401/403 without auth

### Data Integrity
- [ ] All test accounts exist in database
- [ ] Parent-child link verified
- [ ] EP caseload includes correct students
- [ ] Data displays correctly in all views

### Performance
- [ ] Page loads within acceptable time
- [ ] No significant lag or freezing
- [ ] API responses fast enough

### Usability
- [ ] Interface intuitive for each user type
- [ ] No confusing error messages
- [ ] Clear navigation
- [ ] Appropriate language for each audience

---

## Final Notes & Observations

**What Worked Well**:
_Write here:_



**What Needs Improvement**:
_Write here:_



**Overall Impression**:
- [ ] Ready for more users
- [ ] Needs minor fixes
- [ ] Needs significant work
- [ ] Not ready for testing

**Next Steps**:
1. Fix any critical bugs found
2. Re-test failed scenarios
3. Proceed to full E2E testing (see E2E-TESTING-GUIDE.md for comprehensive suite)
4. Prepare for production deployment

---

## Quick Reference

### Test Account Passwords
Passwords are provided via secure channel (not stored in this repo).

### Test URLs
- Login: http://localhost:3002/login
- Teacher Dashboard: http://localhost:3002/class/dashboard
- Student Dashboard: http://localhost:3002/student/dashboard
- Parent Portal: http://localhost:3002/parent/portal
- EP Dashboard: http://localhost:3002/ep/dashboard

### Test Data
- **Tenant**: test-school (ID: 2)
- **Test Student**: Amara Singh (ID: 16)
- **Test Class**: Year 3 Oak
- **Parent-Child Link**: Verified and active

---

**Testing Date**: ___________________
**Tester Name**: ___________________
**Time Taken**: ___________________
**Status**: Pass / Fail / Partial
