# EdPsych Connect World - External Auditor Comprehensive Guide

## Document Purpose
This document provides an independent auditor with everything needed to conduct a thorough end-to-end audit of the EdPsych Connect World platform. The goal is to identify ALL issues that could affect the user experience before public launch.

---

## SECTION 1: LOGIN CREDENTIALS

### Production URL
**https://www.edpsychconnect.com**

### Founder Account (SUPER_ADMIN - Full Access)
| Field | Value |
|-------|-------|
| Email | `scott.ipatrick@edpsychconnect.com` |
| Password | *Provided via secure channel* |
| Login URL | https://www.edpsychconnect.com/en/login |

### Demo Accounts (Passwords provided via secure channel)
| Role | Email | Purpose |
|------|-------|---------|
| Teacher | teacher@demo.com | Class management, lesson planning |
| Student | student@demo.com | Learning interface, progress view |
| Parent | parent@demo.com | Parent portal, child monitoring |
| EP | ep@demo.com | Educational Psychologist workflow |
| Admin | admin@demo.com | School administration |
| Researcher | researcher@demo.com | Research tools access |
| SENCO | sen_coordinator@demo.com | SEND coordination |
| Head Teacher | headteacher@demo.com | Leadership view |

### Beta Tester Account
| Field | Value |
|-------|-------|
| Email | `beta_tester@demo.com` |
| Password | *Provided via secure channel* |

### Beta Access Codes (for /beta-login page)
- `BETA2025`
- `EDPSYCH-BETA`
- `FOUNDER-ACCESS`
- `EP-BETA-UK`

---

## SECTION 2: AUDIT METHODOLOGY

### For EACH page/feature, check:

1. **Does it load?** - No white screens, no infinite spinners
2. **Is it functional?** - Can you complete the intended action?
3. **Is data real?** - No placeholder/fake data visible
4. **Are errors handled?** - Graceful error messages, not crashes
5. **Is it responsive?** - Works on mobile, tablet, desktop
6. **Are links working?** - No 404s, no broken hrefs

### Recording Issues
For each issue found, document:
- **Page URL**: Full URL where issue occurs
- **User Role**: Which account you were logged in as
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Screenshot**: If visual issue
- **Steps to Reproduce**: Numbered steps
- **Severity**: Critical / Major / Minor / Cosmetic

---

## SECTION 3: PAGE-BY-PAGE AUDIT CHECKLIST

### 3.1 PUBLIC PAGES (No login required)

#### Landing Page - https://www.edpsychconnect.com/en
- [ ] Hero section loads with correct content
- [ ] All images display (not broken)
- [ ] Navigation menu works
- [ ] All CTA buttons link correctly
- [ ] Footer links work
- [ ] No fake testimonials or placeholder text
- [ ] Mobile responsive

#### About Page - https://www.edpsychconnect.com/en/about
- [ ] Team images display correctly (not cropped weirdly)
- [ ] Founder bio is accurate (Dr Scott I-Patrick)
- [ ] Organisation mentioned is "Buckinghamshire Council" NOT "NHS"
- [ ] ResearchGate link works: https://www.researchgate.net/profile/Scott-Ighavongbe-Patrick

#### Pricing Page - https://www.edpsychconnect.com/en/pricing
- [ ] All pricing tiers display
- [ ] Prices are in GBP (£)
- [ ] "Sign up" buttons work
- [ ] Feature lists are accurate

#### Blog Page - https://www.edpsychconnect.com/en/blog
- [ ] Posts load and display
- [ ] Author shown as "Dr Scott I-Patrick DEdPsych CPsychol" (NOT fake names)
- [ ] Categories filter works
- [ ] Individual post pages load
- [ ] Comments section works (if enabled)

#### Contact Page - https://www.edpsychconnect.com/en/contact
- [ ] Form displays correctly
- [ ] Form submission works
- [ ] Confirmation message shows

#### Privacy Policy - https://www.edpsychconnect.com/en/privacy
- [ ] Content loads
- [ ] All sections present
- [ ] Links work

#### Terms of Service - https://www.edpsychconnect.com/en/terms
- [ ] Content loads
- [ ] All sections present

### 3.2 AUTHENTICATION PAGES

#### Login Page - https://www.edpsychconnect.com/en/login
- [ ] Page loads correctly
- [ ] Email field accepts input
- [ ] Password field accepts input
- [ ] "Remember me" checkbox works
- [ ] Login with valid credentials succeeds
- [ ] Login with invalid credentials shows error message
- [ ] Redirects to appropriate dashboard after login
- [ ] "Forgot password" link works

#### Beta Login - https://www.edpsychconnect.com/en/beta-login
- [ ] Beta code validation works
- [ ] Login flow completes

#### Signup - https://www.edpsychconnect.com/en/signup
- [ ] Form displays all required fields
- [ ] Validation works (email format, password strength)
- [ ] Account creation succeeds
- [ ] Email verification (if required)

#### Forgot Password - https://www.edpsychconnect.com/en/forgot-password
- [ ] Form accepts email
- [ ] Submission shows confirmation
- [ ] Reset email is sent (check spam folder)

### 3.3 AUTHENTICATED PAGES (Login as Teacher)

#### Dashboard - https://www.edpsychconnect.com/en/dashboard
- [ ] Page loads after login
- [ ] Shows relevant widgets/data
- [ ] Navigation sidebar works
- [ ] Quick actions function

#### Assessments - https://www.edpsychconnect.com/en/assessments
- [ ] Assessment list loads
- [ ] "Schedule Assessment" button works
- [ ] ECCA Framework widget present
- [ ] Filters work
- [ ] Can start new assessment

#### Assessment Creation - https://www.edpsychconnect.com/en/assessments/new
- [ ] Form loads
- [ ] Student selection works
- [ ] Assessment type selection works
- [ ] Scheduling works
- [ ] Save/submit works

#### Interventions - https://www.edpsychconnect.com/en/interventions
- [ ] Intervention library loads
- [ ] Categories display
- [ ] Search works
- [ ] Individual intervention details load

#### EHCP Module - https://www.edpsychconnect.com/en/ehcp
- [ ] Page loads
- [ ] EHCP list displays (or empty state)
- [ ] Create new EHCP works
- [ ] Section editing works

#### Cases - https://www.edpsychconnect.com/en/cases
- [ ] Case list loads
- [ ] Case details accessible
- [ ] Case creation works

#### Progress Tracking - https://www.edpsychconnect.com/en/progress
- [ ] Student progress displays
- [ ] Charts render correctly
- [ ] Data is accurate

### 3.4 ADMIN PAGES (Login as Admin/Founder)

#### Admin Dashboard - https://www.edpsychconnect.com/en/admin
- [ ] Full admin panel loads
- [ ] User management accessible
- [ ] System settings accessible
- [ ] Reports/analytics load

### 3.5 SUPPORT FEATURES

#### Help Center - https://www.edpsychconnect.com/en/help
- [ ] Help articles load
- [ ] Search works
- [ ] Categories navigate correctly

#### AI Chatbot (bottom-right corner)
- [ ] Chat widget appears
- [ ] Can type messages
- [ ] Bot responds (NOT "offline mode" message)
- [ ] Responses are relevant and helpful

### 3.6 TRAINING MODULE

#### Training Marketplace - https://www.edpsychconnect.com/en/training/marketplace
- [ ] Courses display
- [ ] Course details load
- [ ] Pricing shows correctly

#### Training Courses - https://www.edpsychconnect.com/en/training/courses
- [ ] Course list loads
- [ ] Video content plays (if applicable)
- [ ] Progress tracking works

---

## SECTION 4: CRITICAL FUNCTIONALITY TESTS

### 4.1 Assessment Workflow (ECCA)
1. Login as EP (ep@demo.com / password provided securely)
2. Navigate to Assessments
3. Click "Start New Assessment" or "ECCA Framework" button
4. Select a student/case
5. Complete each assessment step
6. Generate report

**Expected**: Full workflow completes, report generates

### 4.2 Lesson Plan Creation
1. Login as Teacher (teacher@demo.com / password provided securely)
2. Navigate to Lesson Plans (or equivalent)
3. Create new lesson plan
4. Save and verify it appears in list

**Expected**: Lesson plan creates and saves successfully

### 4.3 Parent-Child View
1. Login as Parent (parent@demo.com / password provided securely)
2. View child's progress
3. Access child's assessments/reports

**Expected**: Parent can see their child's information

### 4.4 Multi-User Communication
1. Login as Teacher
2. Send message to Parent
3. Login as Parent
4. Verify message received

**Expected**: Messages deliver correctly

---

## SECTION 5: KNOWN ISSUES (As of 27 Nov 2025)

| Issue | Status | Notes |
|-------|--------|-------|
| Blog fake author names | FIXED | Now shows "Dr Scott I-Patrick DEdPsych CPsychol" |
| Login failures | FIXED | Production DB passwords reset |
| NHS reference on About page | FIXED | Changed to "Buckinghamshire Council" |
| ResearchGate broken link | FIXED | Corrected URL |
| Video sections placeholder | FIXED | Replaced with Training Features section |
| AI Chatbot offline mode | NEEDS FIX | Shows "offline mode" message |
| ECCA Assessment empty | NEEDS FIX | API returns empty data |

---

## SECTION 6: API ENDPOINTS TO TEST

For technical auditors, test these API endpoints:

```
POST /api/auth/login         - User authentication
POST /api/auth/signup        - User registration
GET  /api/assessments        - List assessments
POST /api/assessments        - Create assessment
GET  /api/blog               - List blog posts
GET  /api/interventions      - List interventions
GET  /api/user/profile       - Get user profile
```

Test with curl:
```bash
# Login test
curl -X POST https://www.edpsychconnect.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@demo.com","password":"<password>"}'

# Should return: {"success":true,"message":"Login successful",...}
```

---

## SECTION 7: REPORT TEMPLATE

### Issue Report Format

**ISSUE #[NUMBER]**
- **Page**: [URL]
- **Component**: [Name of feature/section]
- **Severity**: [Critical/Major/Minor/Cosmetic]
- **User Role**: [Which account used]
- **Description**: [What's wrong]
- **Expected**: [What should happen]
- **Actual**: [What happens]
- **Steps to Reproduce**:
  1. [Step 1]
  2. [Step 2]
  3. ...
- **Screenshot**: [If applicable]

---

## SECTION 8: AUDIT COMPLETION CHECKLIST

After completing the audit:

- [ ] All public pages tested
- [ ] All authenticated pages tested with each role
- [ ] All forms tested for validation
- [ ] All buttons/links clicked
- [ ] Mobile responsiveness verified
- [ ] Error handling tested
- [ ] API endpoints tested
- [ ] Issues documented with severity rating
- [ ] Screenshots captured for all issues
- [ ] Summary report prepared

---

## SECTION 9: CONTACT FOR SUPPORT

If you encounter access issues during the audit:

**Technical Contact**: scott@edpsychconnect.world

**Escalation**: If login doesn't work, the production database may need password reset. Contact the development team.

---

## Document Version
- **Version**: 1.0
- **Date**: 27 November 2025
- **Author**: EdPsych Connect Development Team
- **Next Review**: After audit completion
