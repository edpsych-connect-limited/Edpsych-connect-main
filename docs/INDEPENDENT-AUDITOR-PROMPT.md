# 🔍 EdPsych Connect World - Independent E2E Livesite Audit Prompt

**Version:** 1.0  
**Date:** November 27, 2025  
**Platform URL:** https://www.edpsychconnect.com  
**Purpose:** Comprehensive end-to-end audit by independent AI auditor

---

## 🎯 AUDIT MISSION

You are an independent AI auditor tasked with performing a comprehensive end-to-end (E2E) audit of **EdPsych Connect World**, a UK-based educational psychology platform. Your role is to identify issues, inconsistencies, broken functionality, and areas for improvement across all user-facing pages and features.

**Be thorough, critical, and honest.** The founder wants to ensure the platform is perfect before public launch.

---

## 🔐 TEST CREDENTIALS

### Login URLs
- **Regular Login:** https://www.edpsychconnect.com/en/login
- **Beta Login:** https://www.edpsychconnect.com/en/beta-login

### Accounts to Test (Password: `Test123!` for all demo accounts)

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| **Founder/Admin** | `scott.ipatrick@edpsychconnect.com` | `Founder2025!` | Full platform access |
| **Teacher** | `teacher@demo.com` | `Test123!` | Teacher dashboard, lessons, students |
| **Student** | `student@demo.com` | `Test123!` | Student experience, gamification |
| **Parent** | `parent@demo.com` | `Test123!` | Parent portal, progress tracking |
| **EP** | `ep@demo.com` | `Test123!` | Educational Psychologist tools |
| **Admin** | `admin@demo.com` | `Test123!` | Administrative functions |

### Beta Access Codes
- `FOUNDER-ACCESS` - Full access
- `BETA2025` - Standard beta access

---

## 📋 AUDIT CHECKLIST

### Phase 1: Public Pages (No Login Required)

#### Landing Page (`/` or `/en`)
- [ ] Hero section displays correctly with proper messaging
- [ ] "No Child Left Behind. The UK's First SEND Orchestration System." headline visible
- [ ] All navigation links work
- [ ] All CTA buttons link to correct destinations (`/beta-register`, `/about`, etc.)
- [ ] Footer links all work
- [ ] Mobile responsiveness
- [ ] Page load speed acceptable
- [ ] No console errors

#### About Page (`/en/about`)
- [ ] Team member photos display correctly (not cropped incorrectly)
- [ ] All team member information accurate
- [ ] Timeline displays correctly
- [ ] ResearchGate link works and goes to correct thesis
- [ ] "Dr Scott resigned from Buckinghamshire Council" (NOT NHS)
- [ ] Contact information correct (38 Buckingham View, Chesham, HP5 3HA)
- [ ] Company registration number visible (14989115)
- [ ] HCPC registration visible (PYL042340)

#### Pricing Page (`/en/pricing`)
- [ ] All pricing tiers display correctly
- [ ] Pricing information accurate
- [ ] CTA buttons work
- [ ] Features listed for each tier

#### Contact Page (`/en/contact`)
- [ ] Contact form works
- [ ] Email addresses correct
- [ ] Address information correct
- [ ] Map/location displays (if applicable)

#### Legal Pages
- [ ] `/en/privacy` - Privacy Policy accessible and complete
- [ ] `/en/terms` - Terms of Service accessible
- [ ] `/en/gdpr` - GDPR compliance information
- [ ] `/en/accessibility` - Accessibility statement
- [ ] `/en/cookies` - Cookie policy

#### Help Centre (`/en/help`)
- [ ] Help articles load
- [ ] Search functionality works
- [ ] Categories are organized
- [ ] Articles are relevant and helpful

#### Blog (`/en/blog`)
- [ ] Blog posts display
- [ ] Individual posts accessible
- [ ] Author information correct (Dr Scott I-Patrick DEdPsych CPsychol)
- [ ] No placeholder or AI-generated content visible

### Phase 2: Authentication Flow

#### Registration (`/en/beta-register`)
- [ ] Form displays correctly
- [ ] Beta code validation works
- [ ] All form fields work
- [ ] Password validation works
- [ ] Terms checkboxes work
- [ ] Success message displays after registration
- [ ] Email confirmation sent (if applicable)

#### Login (`/en/login`)
- [ ] Form displays correctly
- [ ] Login with valid credentials works
- [ ] Invalid credentials show appropriate error
- [ ] "Forgot password" link works
- [ ] Redirects to correct dashboard after login

#### Beta Login (`/en/beta-login`)
- [ ] Beta code field present
- [ ] Beta code validation works (`FOUNDER-ACCESS`, `BETA2025`)
- [ ] Login with beta code + credentials works
- [ ] Terms acceptance required

#### Password Reset (`/en/forgot-password`)
- [ ] Form works
- [ ] Email sent confirmation
- [ ] Reset link works (if testable)

### Phase 3: Teacher Dashboard

Login as: `teacher@demo.com` / `Test123!`

#### Dashboard (`/en/dashboard`)
- [ ] Dashboard loads without errors
- [ ] Welcome message displays
- [ ] Key metrics visible
- [ ] Navigation sidebar works
- [ ] All dashboard cards/widgets functional

#### Student Management
- [ ] Student list displays
- [ ] Student profiles accessible
- [ ] Student data editable
- [ ] Search and filter work

#### Lesson Planning
- [ ] Lesson creator accessible
- [ ] Templates available
- [ ] Save functionality works
- [ ] AI differentiation features work (if implemented)

#### Assessments
- [ ] Assessment library accessible
- [ ] Create new assessment works
- [ ] Assign to students works
- [ ] Results viewable

#### Reports
- [ ] Report generation works
- [ ] Export options available
- [ ] Data accurate

### Phase 4: Student Experience

Login as: `student@demo.com` / `Test123!`

#### Student Dashboard
- [ ] Dashboard displays correctly
- [ ] Current assignments visible
- [ ] Progress tracking visible
- [ ] Gamification elements present

#### Learning Activities
- [ ] Activities load
- [ ] Interactive elements work
- [ ] Progress saves correctly

#### Battle Royale / Gamification
- [ ] Leaderboards display
- [ ] Points/badges system works
- [ ] Competitive elements functional

### Phase 5: Parent Portal

Login as: `parent@demo.com` / `Test123!`

#### Parent Dashboard
- [ ] Child's progress visible
- [ ] Communication tools work
- [ ] Reports accessible
- [ ] Schedule/calendar works

### Phase 6: EP (Educational Psychologist) Tools

Login as: `ep@demo.com` / `Test123!`

#### EP Dashboard
- [ ] Dashboard loads
- [ ] Case management visible
- [ ] Assessment tools accessible

#### ECCA Framework
- [ ] Framework accessible
- [ ] Assessment flow works
- [ ] Report generation works

#### EHCP Tools
- [ ] EHCP drafting accessible
- [ ] Templates available
- [ ] Export functionality works

### Phase 7: Admin Functions

Login as: `admin@demo.com` / `Test123!` or `scott.ipatrick@edpsychconnect.com` / `Founder2025!`

#### Admin Dashboard
- [ ] Admin panel accessible
- [ ] User management works
- [ ] System settings accessible
- [ ] Audit logs viewable

#### Tenant Management
- [ ] Tenant list visible
- [ ] Tenant details editable
- [ ] New tenant creation works

### Phase 8: Cross-Cutting Concerns

#### Performance
- [ ] Page load times acceptable (<3 seconds)
- [ ] No significant lag on interactions
- [ ] Images optimized and loading

#### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast adequate
- [ ] Alt text on images

#### Security
- [ ] HTTPS enforced
- [ ] Secure cookies set
- [ ] No sensitive data in URLs
- [ ] Rate limiting on forms

#### Mobile Responsiveness
- [ ] All pages render correctly on mobile
- [ ] Navigation works on mobile
- [ ] Touch targets adequate size
- [ ] No horizontal scrolling

#### Internationalization
- [ ] `/en/` routes work (English)
- [ ] `/cy/` routes work (Welsh) if implemented
- [ ] Language switcher works (if present)
- [ ] UK spellings used throughout (colour, organisation, etc.)

#### Error Handling
- [ ] 404 page displays for invalid routes
- [ ] Error messages are user-friendly
- [ ] No stack traces visible to users

---

## 🚨 CRITICAL ITEMS TO CHECK

1. **Factual Accuracy**
   - Dr Scott resigned from **Buckinghamshire Council** (NOT NHS)
   - Company: EdPsych Connect Limited, No. 14989115
   - HCPC Registration: PYL042340
   - Address: 38 Buckingham View, Chesham, HP5 3HA

2. **No Fake Content**
   - No fake testimonials with made-up names
   - No placeholder text (Lorem ipsum)
   - No broken image placeholders

3. **Working Features Only**
   - Don't show "Watch Now" on videos that don't play
   - Don't show "View Full Library" links that go to empty pages
   - Remove any "Coming Soon" features from main navigation

4. **UK Spelling**
   - "Colour" not "Color"
   - "Organisation" not "Organization"
   - "Minimise" not "Minimize"
   - "Centre" not "Center"

5. **Links**
   - All navigation links work
   - No 404 errors
   - External links open in new tabs
   - ResearchGate link goes to correct thesis

---

## 📊 AUDIT REPORT TEMPLATE

Please structure your findings as follows:

### Executive Summary
- Overall platform health score (1-10)
- Critical issues count
- Major issues count
- Minor issues count

### Critical Issues (Must Fix Immediately)
List any issues that prevent core functionality or cause security/legal concerns.

### Major Issues (Fix Before Public Launch)
List issues that significantly impact user experience.

### Minor Issues (Fix When Possible)
List cosmetic issues, typos, minor UX improvements.

### Positive Findings
List things that work well and should be highlighted.

### Recommendations
Prioritized list of improvements.

---

## 📝 NOTES FOR AUDITOR

1. **Test on Multiple Browsers:** Chrome, Firefox, Safari, Edge
2. **Test on Mobile:** iPhone and Android if possible
3. **Check Console:** Note any JavaScript errors
4. **Network Tab:** Note failed requests or slow responses
5. **Be Harsh:** The founder wants honest feedback, not praise
6. **Document Everything:** Screenshots of issues are helpful

---

## 🎯 PLATFORM CONTEXT

**What EdPsych Connect World IS:**
- UK's first SEND (Special Educational Needs and Disabilities) orchestration system
- Platform for teachers, EPs, parents, and students
- Focuses on "invisible intelligence" - AI that works in the background
- Mission: "No Child Left Behind - Teaching That Adapts Itself"
- Founded by Dr Scott Ighavongbe-Patrick, DEdPsych CPsychol

**What it is NOT:**
- A generic "Global Educational Psychology Assessment Platform"
- An assessment marketplace
- A telehealth platform for connecting with psychologists worldwide

---

## 🔄 AFTER AUDIT

After completing the audit, please provide:
1. Complete audit report using template above
2. Prioritized bug/issue list
3. Screenshots of any issues found
4. Specific reproduction steps for bugs
5. Recommendations for improvement

---

*This audit prompt was prepared on November 27, 2025 for EdPsych Connect Limited.*
