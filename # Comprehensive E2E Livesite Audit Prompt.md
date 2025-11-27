# Comprehensive E2E Livesite Audit Prompt for EdPsych Connect

## Instructions for Independent Auditor

You are conducting an independent, comprehensive audit of **EdPsych Connect** - a UK educational psychology platform designed to support teachers, parents, educational psychologists (EPs), SENCOs, and Local Authorities in delivering evidence-based interventions for students with special educational needs (SEND).

**Live URL:** https://edpsych-connect-limited.vercel.app/
**Repository:** The codebase you have access to in this workspace

---

## PART 1: INFRASTRUCTURE & DEPLOYMENT AUDIT

### 1.1 Build & Deployment Health
- [ ] Verify the application builds successfully without TypeScript errors
- [ ] Verify ESLint passes without blocking errors
- [ ] Check Vercel deployment status and build logs
- [ ] Verify environment variables are properly configured (check `.env.example` exists)
- [ ] Verify Prisma schema is valid and migrations are up to date

### 1.2 Database Connectivity
- [ ] Verify database connection works (PostgreSQL via Neon)
- [ ] Check all Prisma models have corresponding tables
- [ ] Verify seed scripts run without errors
- [ ] Test database query performance on key endpoints

### 1.3 Security Configuration
- [ ] Verify authentication middleware is properly configured
- [ ] Check for exposed API keys or secrets in the codebase
- [ ] Verify CORS settings are appropriate
- [ ] Check Content Security Policy headers
- [ ] Verify rate limiting is implemented on sensitive endpoints

---

## PART 2: ROUTING & NAVIGATION AUDIT

### 2.1 Public Routes (No Auth Required)
Test each route loads without errors:
- [ ] `/` - Landing page (should show full platform, not "Coming Soon")
- [ ] `/en/` - English locale landing
- [ ] `/login` - Login page
- [ ] `/register` - Registration page
- [ ] `/beta-register` - Beta registration flow
- [ ] `/forgot-password` - Password reset
- [ ] `/pricing` - Pricing page
- [ ] `/demo` - Demo/tour page
- [ ] `/help` - Help center
- [ ] `/about` - About page

### 2.2 Protected Routes (Auth Required)
Login with test credentials and verify access:

**Test Accounts (if seeded):**
- Teacher: `teacher@demo.com` / `Test123!`
- Parent: `parent@demo.com` / `Test123!`
- Specialist: `specialist@demo.com` / `Test123!`
- Admin: `admin@demo.com` / `Test123!`
- Researcher: `researcher@demo.com` / `Test123!`

**Teacher Dashboard Routes:**
- [ ] `/dashboard/teacher` - Main dashboard
- [ ] `/dashboard/teacher/students` - Student list
- [ ] `/dashboard/teacher/assessments` - Assessment tools
- [ ] `/dashboard/teacher/reports` - Report generation
- [ ] `/dashboard/teacher/interventions` - Intervention plans
- [ ] `/dashboard/teacher/resources` - Resource library
- [ ] `/dashboard/teacher/messages` - Communication

**Parent Dashboard Routes:**
- [ ] `/dashboard/parent` - Parent portal
- [ ] `/dashboard/parent/children` - Child profiles
- [ ] `/dashboard/parent/progress` - Progress reports
- [ ] `/dashboard/parent/messages` - Teacher communication

**Specialist Routes:**
- [ ] `/dashboard/specialist` - EP/Specialist dashboard
- [ ] `/dashboard/specialist/cases` - Case management
- [ ] `/dashboard/specialist/assessments` - Assessment library
- [ ] `/dashboard/specialist/reports` - Report builder

**Admin Routes:**
- [ ] `/dashboard/admin` - Admin panel
- [ ] `/dashboard/admin/users` - User management
- [ ] `/dashboard/admin/settings` - Platform settings
- [ ] `/dashboard/admin/analytics` - Usage analytics

### 2.3 API Routes Health Check
Verify each API endpoint returns appropriate responses:

**Authentication APIs:**
- [ ] `POST /api/auth/login` - Returns JWT on valid credentials
- [ ] `POST /api/auth/register` - Creates new user
- [ ] `POST /api/auth/logout` - Clears session
- [ ] `POST /api/auth/forgot-password` - Initiates reset flow
- [ ] `GET /api/auth/me` - Returns current user (with valid token)

**Core Feature APIs:**
- [ ] `GET /api/students` - Returns student list
- [ ] `GET /api/assessments` - Returns assessment templates
- [ ] `GET /api/interventions` - Returns intervention library
- [ ] `GET /api/reports` - Returns report data
- [ ] `GET /api/help/articles` - Returns help content

**Health & Status:**
- [ ] `GET /api/health` - Returns system status

---

## PART 3: FUNCTIONALITY AUDIT

### 3.1 Authentication Flow
- [ ] User can register with valid email and password
- [ ] User receives appropriate error messages for invalid input
- [ ] User can login with correct credentials
- [ ] User is redirected to appropriate dashboard based on role
- [ ] Session persists across page refreshes
- [ ] User can logout successfully
- [ ] Password reset flow works end-to-end

### 3.2 User Onboarding
- [ ] Beta registration form captures all required fields
- [ ] User can select role during registration
- [ ] Welcome email/confirmation is triggered (check logs)
- [ ] User preferences are saved correctly

### 3.3 Dashboard Functionality
For each role, verify:
- [ ] Dashboard loads with correct role-specific content
- [ ] Navigation menu shows appropriate items for role
- [ ] Quick actions/widgets are functional
- [ ] Data displays correctly (not placeholder/mock data)
- [ ] Graphs/charts render without errors

### 3.4 Assessment System
- [ ] Assessment library loads with categorized assessments
- [ ] User can view assessment details
- [ ] User can start a new assessment
- [ ] Assessment questions display correctly
- [ ] Results are calculated and saved
- [ ] Reports are generated from assessment data

### 3.5 Intervention System
- [ ] Intervention library loads with evidence-based interventions
- [ ] Interventions are categorized by domain (cognitive, behavioural, etc.)
- [ ] User can view intervention details and implementation guides
- [ ] User can assign interventions to students
- [ ] Progress tracking works

### 3.6 Student Profile Management
- [ ] User can create new student profiles
- [ ] User can view existing student profiles
- [ ] Profile data saves correctly
- [ ] SEND information displays appropriately
- [ ] Progress history is visible

### 3.7 Report Generation
- [ ] Report templates load correctly
- [ ] User can generate reports from templates
- [ ] Reports include correct student data
- [ ] Reports can be exported (PDF if implemented)

### 3.8 Communication Features
- [ ] Messaging interface loads
- [ ] User can compose messages
- [ ] Messages are sent and received
- [ ] Notifications work (if implemented)

### 3.9 Help Center
- [ ] Help articles load correctly
- [ ] Search functionality works
- [ ] Categories are navigable
- [ ] Contextual help appears where expected

### 3.10 Gamification (Battle Royale)
- [ ] Battle Royale game loads
- [ ] Questions display correctly
- [ ] Scoring works
- [ ] Achievements are tracked
- [ ] Leaderboard displays

---

## PART 4: UI/UX AUDIT

### 4.1 Responsive Design
Test on multiple viewports:
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

For each viewport, check:
- [ ] Navigation is accessible
- [ ] Content is readable
- [ ] Forms are usable
- [ ] No horizontal scrolling issues
- [ ] Touch targets are adequate on mobile

### 4.2 Accessibility (WCAG 2.1 AA)
- [ ] All images have alt text
- [ ] Color contrast meets minimum ratios (4.5:1 for text)
- [ ] Keyboard navigation works throughout
- [ ] Focus indicators are visible
- [ ] Screen reader compatibility (test with NVDA/VoiceOver)
- [ ] Form labels are associated with inputs
- [ ] Error messages are descriptive
- [ ] No auto-playing media without controls

### 4.3 Visual Consistency
- [ ] Consistent color scheme throughout
- [ ] Typography is consistent
- [ ] Button styles are uniform
- [ ] Spacing follows design system
- [ ] Loading states are consistent
- [ ] Error states are consistent

### 4.4 Performance
- [ ] Page load time < 3 seconds on 3G
- [ ] No layout shifts during load
- [ ] Images are optimized
- [ ] No unnecessary re-renders
- [ ] Lighthouse performance score > 70

---

## PART 5: ERROR HANDLING AUDIT

### 5.1 Client-Side Errors
- [ ] 404 page displays for non-existent routes
- [ ] Form validation provides clear error messages
- [ ] API errors are handled gracefully
- [ ] No unhandled promise rejections in console
- [ ] Error boundaries prevent full app crashes

### 5.2 Server-Side Errors
- [ ] Invalid API requests return appropriate status codes
- [ ] Database errors don't expose sensitive information
- [ ] Rate limiting returns 429 with helpful message
- [ ] Auth failures return 401/403 appropriately

### 5.3 Edge Cases
- [ ] Empty states are handled (no data to display)
- [ ] Long content is handled (truncation, scrolling)
- [ ] Special characters are handled in inputs
- [ ] Network timeout scenarios are handled

---

## PART 6: DATA INTEGRITY AUDIT

### 6.1 Mock Data vs Real Data
Identify and flag any:
- [ ] Hardcoded placeholder data that should be dynamic
- [ ] Mock API responses that bypass database
- [ ] Lorem ipsum or test data visible to users
- [ ] Non-functional buttons/features with "coming soon" that aren't labeled

### 6.2 Data Persistence
- [ ] User-created data persists across sessions
- [ ] Settings changes are saved
- [ ] Draft content is preserved
- [ ] Data is correctly associated with user accounts

### 6.3 Data Validation
- [ ] Required fields are enforced
- [ ] Data types are validated (email format, etc.)
- [ ] SQL injection is prevented
- [ ] XSS is prevented in user inputs

---

## PART 7: INTEGRATION AUDIT

### 7.1 External Services
Check integration status of:
- [ ] Stripe (payment processing) - Test mode functional?
- [ ] HeyGen (AI avatars) - API configured?
- [ ] Email service (transactional emails) - Configured?
- [ ] Sentry (error monitoring) - Receiving errors?
- [ ] Analytics (if implemented) - Tracking events?

### 7.2 Third-Party Libraries
- [ ] All npm packages are up to date (check for security vulnerabilities)
- [ ] No deprecated packages in use
- [ ] License compliance verified

---

## PART 8: DOCUMENTATION AUDIT

### 8.1 User-Facing Documentation
- [ ] Help center content is accurate and complete
- [ ] Onboarding guidance is clear
- [ ] Feature descriptions are accurate
- [ ] Contact/support information is visible

### 8.2 Developer Documentation
- [ ] README has setup instructions
- [ ] API documentation exists
- [ ] Environment variable documentation exists
- [ ] Deployment guide exists

---

## AUDIT DELIVERABLES

Please provide:

1. **Executive Summary** - Overall platform readiness assessment (Ready/Not Ready/Conditional)

2. **Critical Issues** - Any blocking issues that must be fixed before beta launch
   - Severity: Critical, High, Medium, Low
   - Location: Route/component/file
   - Description: What's wrong
   - Recommended Fix: How to resolve

3. **Broken Links Report** - List of any 404s or dead links found

4. **Mock Data Report** - List of any hardcoded/placeholder data that should be dynamic

5. **Accessibility Report** - WCAG compliance issues found

6. **Performance Report** - Lighthouse scores and recommendations

7. **Security Concerns** - Any vulnerabilities identified

8. **Recommendations** - Priority-ordered list of improvements for post-beta

---

## TESTING METHODOLOGY

1. **Manual Testing** - Walk through all user flows as each role type
2. **Automated Testing** - Run existing Cypress tests: `npx cypress run`
3. **API Testing** - Test all endpoints with curl or Postman
4. **Code Review** - Review key files for quality and security
5. **Build Verification** - Run `npm run build` and check for errors

---

## CONTACT

If you encounter issues or need clarification:
- Check `/docs` folder for existing documentation
- Review `/CLAUDE.md` for project context
- Check existing test files in `/cypress/e2e/` for expected behaviors

---

*This audit prompt was generated to ensure independent verification of EdPsych Connect platform readiness for UK beta launch. The platform serves educational psychologists, teachers, parents, and Local Authorities in supporting children with special educational needs.*

**Platform Mission:** "No Child Left Behind - Teaching That Adapts Itself"

**Founder:** Dr. Scott Ighavongbe-Aihie, HCPC Registered Educational Psychologist (PYL042340)
