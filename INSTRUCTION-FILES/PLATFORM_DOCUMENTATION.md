# EdPsych Connect World - Platform Documentation

**Version:** 1.0.0
**Last Updated:** November 3, 2025
**Status:** 95% Complete - Final Testing Phase

---

## Table of Contents

1. [Platform Overview](#platform-overview)
2. [Architecture](#architecture)
3. [Core Features](#core-features)
4. [API Documentation](#api-documentation)
5. [Database Schema](#database-schema)
6. [Component Library](#component-library)
7. [Security & Privacy](#security--privacy)
8. [Deployment](#deployment)
9. [Testing](#testing)
10. [Maintenance](#maintenance)

---

## Platform Overview

### Mission Statement

EdPsych Connect World is an enterprise-grade platform designed to support educational psychologists in the UK with evidence-based tools for assessment, intervention planning, EHCP management, and professional development.

### Core Values

- **100% Completion Standard**: Every feature must be fully implemented with all states (loading, error, empty, success)
- **Evidence-Based Practice**: All assessments and interventions grounded in research
- **Data Protection**: Full GDPR compliance and encryption
- **Accessibility**: WCAG 2.1 AA compliance throughout
- **Professional Quality**: Enterprise-grade code and user experience

### Target Users

1. **Educational Psychologists** (Primary)
2. **SENCOs** (School Special Educational Needs Coordinators)
3. **Teachers** (Classroom practitioners)
4. **Researchers** (Academic and clinical research)
5. **Parents/Guardians** (Via collaborative input system)

---

## Architecture

### Technology Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- React Markdown (content rendering)

**Backend:**
- Next.js API Routes
- Prisma ORM
- PostgreSQL Database
- NextAuth.js (authentication)

**Services:**
- Stripe (subscriptions)
- Vercel (hosting)
- SendGrid/Resend (emails)
- Cloudflare (CDN)

### Project Structure

```
src/
├── app/                      # Next.js 14 App Router pages
│   ├── api/                 # API routes
│   ├── assessments/         # Assessment pages
│   ├── blog/                # Blog system
│   ├── ehcp/                # EHCP management
│   ├── help/                # Help center
│   ├── interventions/       # Intervention library
│   ├── training/            # CPD courses
│   └── ...
├── components/              # React components
│   ├── assessments/
│   ├── ehcp/
│   ├── interventions/
│   ├── onboarding/
│   └── ...
├── lib/                     # Utilities and services
│   ├── api/                 # API service layer
│   ├── auth/                # Authentication
│   ├── assessments/         # Assessment logic
│   └── ...
├── hooks/                   # Custom React hooks
├── utils/                   # Utility functions
└── services/               # Business logic services

prisma/
├── schema.prisma           # Database schema
├── seed-*.ts              # Seed scripts
└── migrations/            # Database migrations
```

### Design Patterns

1. **Separation of Concerns**: Clear separation between UI, business logic, and data access
2. **Component-Based Architecture**: Reusable, modular components
3. **Service Layer Pattern**: Business logic isolated in service files
4. **Repository Pattern**: Data access through Prisma models
5. **Factory Pattern**: Dynamic form generation for assessments

---

## Core Features

### 1. ECCA Assessment Framework ✅

**File**: `src/lib/assessments/ecca-framework.ts` (1,250+ lines)

**Description**: EdPsych Connect Cognitive Assessment - A proprietary, evidence-based dynamic assessment framework.

**Domains Covered:**
1. Working Memory & Information Processing
2. Attention & Executive Function
3. Processing Speed
4. Learning & Memory

**Key Features:**
- Test-Teach-Retest methodology
- Multi-informant design (parent, teacher, child input)
- Strengths-based profiling
- Context-sensitive assessment
- Professional PDF report generation
- Collaborative input system

**Evidence Base:**
- Vygotsky's Zone of Proximal Development
- Feuerstein's Mediated Learning Experience
- Diamond's Executive Function Model
- Baddeley & Hitch Working Memory Model

**Usage:**
```typescript
import { eccaFramework } from '@/lib/assessments/ecca-framework';

// Create assessment instance
const instance = await prisma.assessmentInstance.create({
  data: {
    framework_id: eccaFramework.id,
    student_name: "John Doe",
    student_age: 8,
    // ...
  }
});
```

**Report Generation:**
```typescript
import { downloadAssessmentReport } from '@/lib/assessments/report-generator';

const report: AssessmentReport = {
  student_name: "John Doe",
  // ... report data
};

await downloadAssessmentReport(report, {
  include_raw_scores: true,
  include_visual_profile: true,
});
```

### 2. Collaborative Input System ✅

**Files:**
- `src/app/api/assessments/collaborations/route.ts`
- `src/app/collaborate/[token]/page.tsx`
- `src/components/assessments/CollaborativeInputForm.tsx`

**Description**: Token-based system allowing parents, teachers, and children to contribute to assessments without platform accounts.

**Security:**
- 64-character random hex tokens
- 30-day expiration
- One-time use enforcement
- No authentication required for contributors

**Workflow:**
1. EP sends invitation via email with unique token
2. Contributor accesses public form via token URL
3. Form adapts language based on contributor type
4. Auto-save every 2 minutes
5. Submission integrated into EP's assessment
6. Thank you page confirmation

**Email Templates:**
Professional HTML emails with:
- Personalized greeting
- Clear instructions
- Direct link to form
- Deadline information
- Contact support

### 3. Intervention Library ✅

**File**: `src/lib/interventions/interventions-library.ts`

**Description**: Comprehensive library of evidence-based interventions with effect sizes, implementation guides, and fidelity monitoring.

**Categories:**
- Literacy
- Numeracy
- Social-Emotional Learning
- Behavior Management
- Executive Function
- Attention & Focus

**Each Intervention Includes:**
- Evidence rating (Strong/Moderate/Emerging)
- Effect size
- Target age range
- Implementation duration
- Required resources
- Step-by-step delivery guide
- Fidelity checklist
- Progress monitoring tools

**Example:**
```typescript
{
  id: 'phon-int-prog',
  name: 'Phonics Intervention Programme',
  category: 'literacy',
  evidence_rating: 'strong',
  effect_size: 0.54,
  target_age: [5, 11],
  duration_weeks: 12,
  frequency: 'daily',
  implementation: {
    overview: 'Systematic synthetic phonics...',
    steps: [...],
    materials: [...],
  }
}
```

### 4. EHCP Management ✅

**Files:**
- `src/app/ehcp/page.tsx`
- `src/app/api/ehcp/route.ts`

**Description**: Complete EHCP (Education, Health and Care Plan) creation, management, and annual review system.

**Features:**
- Section-by-section wizard
- SMART outcome validation
- Provision mapping
- Multi-stakeholder collaboration
- Annual review tracking
- LA-compliant PDF generation
- Version history

**EHCP Sections:**
- Section A: Child's Views
- Section B: Special Educational Needs
- Section C: Health Needs
- Section D: Social Care Needs
- Section E: Outcomes
- Section F: Provision
- Section G: Placement
- Section H: Personal Budget

### 5. Training & CPD System ✅

**Files:**
- `src/app/training/marketplace/page.tsx`
- `src/components/training/InteractiveCoursePlayer.tsx`

**Description**: Professional development courses with interactive content, quizzes, and CPD certification.

**Course Features:**
- Video lessons
- Interactive quizzes
- Downloadable resources
- Progress tracking
- CPD certificates
- Course completion badges

**Available Courses:**
- ECCA Assessment Training (12 CPD hours)
- Evidence-Based Interventions (8 CPD hours)
- EHCP Writing Excellence (10 CPD hours)
- ADHD Support Strategies (6 CPD hours)
- Dyslexia Intervention (8 CPD hours)

### 6. Help Center ✅

**Files:**
- `src/app/help/page.tsx`
- `src/app/api/help/route.ts`
- `prisma/seed-help-center.ts`

**Description**: Comprehensive self-service help system with search, categories, and FAQs.

**Content:**
- 6 categories
- 10 detailed articles
- 8 FAQs
- Full-text search
- View tracking
- Helpful ratings
- Related articles

**Categories:**
1. Getting Started
2. Assessments
3. Interventions
4. EHCP
5. Training
6. Technical Support

### 7. Blog System ✅

**Files:**
- `src/app/blog/page.tsx`
- `src/app/blog/[slug]/page.tsx`
- `src/app/api/blog/route.ts`
- `prisma/seed-blog.ts`

**Description**: Professional blog with markdown support, categories, tags, and comments.

**Content Types:**
- Platform Updates
- Educational Psychology
- Best Practices
- Case Studies

**Features:**
- Full-text search
- Category/tag filtering
- Pagination
- View tracking
- Comment system (moderated)
- Related posts
- Newsletter signup
- Author profiles
- Reading time estimates
- SEO optimization

**Current Posts:**
1. Introducing the ECCA Framework
2. The Science of Working Memory
3. Writing Effective EHCPs
4. Case Study: Dyslexia Intervention
5. Supporting ADHD Students

### 8. Onboarding System ✅

**File**: `src/components/onboarding/OnboardingWizard.tsx` (740 lines)

**Description**: 5-step guided setup with role-based personalization.

**Steps:**
1. Welcome & Role Selection
2. Profile Completion
3. Workspace Setup
4. Feature Tour
5. First Task Guidance

**Personalization:**
- Custom dashboard based on role
- Feature recommendations
- Quick start guides
- Video tutorials
- Sample data

### 9. Interactive Demos ✅

**File**: `src/components/demos/FeatureDemos.tsx`

**Description**: 6 interactive feature demonstrations with auto-play.

**Demos:**
1. ECCA Assessment (4 steps)
2. Interventions Library (3 steps)
3. EHCP Creation (3 steps)
4. Training Course (3 steps)
5. Battle Royale Gamification (3 steps)
6. Progress Tracking (3 steps)

**Features:**
- Auto-play with configurable duration
- Manual navigation
- Completion tracking
- Fullscreen mode
- Restart capability

---

## API Documentation

### Authentication APIs

**POST /api/auth/login**
- Login with email/password
- Returns: JWT tokens (access + refresh)
- Rate limited: 5 attempts per 15 minutes

**POST /api/auth/logout**
- Invalidates tokens
- Clears cookies

**POST /api/auth/refresh**
- Refresh access token using refresh token
- Returns: New access token

**GET /api/auth/me**
- Get current user profile
- Requires: Valid access token

### Assessment APIs

**GET /api/assessments**
- List all assessments for current user
- Query params: `framework`, `status`, `page`, `limit`

**POST /api/assessments**
- Create new assessment instance
- Body: `framework_id`, `student_name`, `student_age`, etc.

**GET /api/assessments/[id]**
- Get assessment details
- Includes: framework, domains, collaborations

**PUT /api/assessments/[id]**
- Update assessment data
- Body: Assessment response data

**DELETE /api/assessments/[id]**
- Soft delete assessment

**POST /api/assessments/collaborations**
- Send collaboration invitation
- Body: `instance_id`, `contributor_type`, `contributor_email`
- Sends email with token

**GET /api/assessments/collaborations/[token]**
- Get collaboration form data (public)
- Validates token and expiration

**POST /api/assessments/collaborations/[token]**
- Submit collaboration responses (public)

### EHCP APIs

**GET /api/ehcp**
- List all EHCPs
- Query params: `status`, `child_name`, `page`, `limit`

**POST /api/ehcp**
- Create new EHCP
- Body: Child details, sections data

**GET /api/ehcp/[id]**
- Get EHCP details

**PUT /api/ehcp/[id]**
- Update EHCP section
- Body: Section data

**POST /api/ehcp/[id]/annual-review**
- Create annual review

### Intervention APIs

**GET /api/interventions**
- List all interventions
- Query params: `category`, `evidence_rating`, `age`

**GET /api/interventions/[id]**
- Get intervention details

**POST /api/interventions/[id]/implement**
- Start implementation plan

### Training APIs

**GET /api/training/courses**
- List all courses
- Query params: `category`, `duration`

**GET /api/training/courses/[id]**
- Get course details

**POST /api/training/enrollments**
- Enroll in course
- Body: `course_id`

**PUT /api/training/enrollments/[id]**
- Update progress
- Body: `completed_lessons`, `quiz_scores`

**GET /api/training/certificates/[userId]**
- Get user certificates

### Help Center APIs

**GET /api/help**
- Browse help content
- Query params: `type` (categories|articles|faqs|search|featured)
- Query params: `q` (search query), `category`

**GET /api/help/[slug]**
- Get article details
- Increments view count

**POST /api/help/[slug]**
- Submit article feedback
- Body: `helpful` (boolean)

### Blog APIs

**GET /api/blog**
- Browse blog posts
- Query params: `type` (posts|categories|tags|search|featured)
- Query params: `q`, `category`, `tag`, `page`, `limit`

**GET /api/blog/[slug]**
- Get post details
- Increments view count

**POST /api/blog/[slug]**
- Submit comment
- Body: `content`, `author_name`, `author_email`

---

## Database Schema

### Core Models

**users**
- id, email, password_hash
- name, role, organization_id
- subscription_tier, stripe_customer_id
- onboarding tracking fields
- timestamps

**organizations**
- id, name, type (school|la|independent)
- subscription data
- settings

**AssessmentFramework**
- id, name, version, framework_type
- domains (JSON), description
- evidence_base, author

**AssessmentInstance**
- id, framework_id, user_id
- student details, status
- responses (JSON)
- timestamps

**AssessmentCollaboration**
- id, instance_id
- contributor details
- invitation_token, token_expires_at
- status, responses

**EHCP**
- id, user_id, organization_id
- child details
- sections A-H (JSON)
- status, annual_review_date

**Intervention**
- id, name, category
- evidence_rating, effect_size
- target_age, implementation details

**InterventionImplementation**
- id, intervention_id, student_id
- start_date, status
- fidelity_data, progress_data

**TrainingCourse**
- id, title, category
- duration, cpd_hours
- content (JSON), price

**TrainingEnrollment**
- id, user_id, course_id
- progress, completed_lessons
- certificate data

**HelpCategory, HelpArticle, HelpFAQ**
- Help center content

**BlogCategory, BlogPost, BlogTag, BlogComment**
- Blog system

### Relationships

```
users → organizations (many-to-one)
users → assessments (one-to-many)
users → ehcps (one-to-many)
users → enrollments (one-to-many)

AssessmentInstance → Framework (many-to-one)
AssessmentInstance → Collaborations (one-to-many)

EHCP → user (many-to-one)

Intervention → Implementations (one-to-many)

Course → Enrollments (one-to-many)

BlogPost → Category (many-to-one)
BlogPost → Tags (many-to-many via BlogPostTag)
BlogPost → Comments (one-to-many)
```

---

## Component Library

### Core Components

**AssessmentAdministrationWizard**
- Location: `src/components/assessments/`
- Purpose: Multi-step assessment administration
- Props: `frameworkId`, `onComplete`
- Features: Auto-save, validation, report generation

**CollaborativeInputForm**
- Location: `src/components/assessments/`
- Purpose: Public form for multi-informant input
- Props: `formData`, `onSubmit`, `onSaveDraft`
- Features: Age-appropriate language, auto-save

**OnboardingWizard**
- Location: `src/components/onboarding/`
- Purpose: First-time user setup
- Props: `userId`, `userName`, `userRole`
- Features: 5 steps, role-based customization

**InteractiveDemoPlayer**
- Location: `src/components/demos/`
- Purpose: Feature demonstration
- Props: `title`, `description`, `steps`, `onComplete`
- Features: Auto-play, manual controls, fullscreen

**SubscriptionStatus**
- Location: `src/components/subscription/`
- Purpose: Display subscription tier and usage
- Props: `userId`
- Features: Upgrade prompts, usage meters

### Reusable UI Components

**Button** - Primary, secondary, danger variants
**Input** - Text, email, password, textarea
**Select** - Dropdown with search
**Modal** - Accessible modal dialogs
**Toast** - Notification system
**LoadingSpinner** - Various sizes
**EmptyState** - For empty lists
**ErrorBoundary** - Error handling

---

## Security & Privacy

### Authentication

- JWT-based authentication
- Access tokens (15 min expiry)
- Refresh tokens (7 day expiry)
- Secure HTTP-only cookies
- Rate limiting on login attempts

### Authorization

- Role-based access control (RBAC)
- Organization-level data isolation
- Resource-level permissions
- API route protection middleware

### Data Protection

- All sensitive data encrypted at rest
- AES-256-GCM encryption for PII
- TLS 1.3 for data in transit
- Regular security audits
- GDPR compliance built-in

### Privacy Features

- Data retention policies
- Right to be forgotten
- Data export functionality
- Consent management
- Audit logging

---

## Deployment

### Environment Variables

```env
# Database
DATABASE_URL=

# Authentication
NEXTAUTH_URL=
NEXTAUTH_SECRET=
JWT_SECRET=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Email
SENDGRID_API_KEY=
EMAIL_FROM=

# Encryption
ENCRYPTION_KEY=
```

### Production Checklist

- [ ] All environment variables configured
- [ ] Database migrations run
- [ ] Seed scripts executed
- [ ] SSL certificates installed
- [ ] CDN configured
- [ ] Email service tested
- [ ] Payment processing tested
- [ ] Backup system configured
- [ ] Monitoring tools active
- [ ] Error tracking enabled

---

## Testing

### Unit Tests

Location: `__tests__/unit/`

Key areas:
- Assessment scoring algorithms
- Report generation logic
- Encryption/decryption
- Authentication flows

### Integration Tests

Location: `__tests__/integration/`

Key flows:
- Complete assessment workflow
- EHCP creation and management
- Course enrollment and completion
- Subscription management

### End-to-End Tests

Location: `__tests__/e2e/`

User journeys:
- New user onboarding
- Create and complete assessment
- Generate report
- Purchase subscription

### Performance Testing

- Load testing (1000+ concurrent users)
- Database query optimization
- Image optimization
- Bundle size analysis

---

## Maintenance

### Regular Tasks

**Daily:**
- Monitor error logs
- Check system health metrics
- Review security alerts

**Weekly:**
- Database backups verification
- User feedback review
- Performance metrics analysis

**Monthly:**
- Dependency updates
- Security patches
- Feature usage analytics
- User satisfaction surveys

### Monitoring

**Key Metrics:**
- API response times
- Error rates
- User engagement
- Conversion rates
- Subscription churn

**Tools:**
- Vercel Analytics
- Sentry (error tracking)
- PostHog (product analytics)
- Stripe Dashboard

### Support

**Response Times:**
- Critical: 1 hour
- High: 4 hours
- Medium: 24 hours
- Low: 72 hours

**Channels:**
- Email: support@edpsychconnect.world
- In-app help center
- Video tutorials
- Community forum

---

## Appendices

### A. Glossary

**ECCA**: EdPsych Connect Cognitive Assessment
**EHCP**: Education, Health and Care Plan
**EP**: Educational Psychologist
**SENCO**: Special Educational Needs Coordinator
**CPD**: Continuing Professional Development
**LA**: Local Authority

### B. References

1. Diamond, A. (2013). Executive functions. Annual Review of Psychology.
2. Feuerstein, R. (1979). The dynamic assessment of retarded performers.
3. Vygotsky, L. S. (1978). Mind in society.
4. Baddeley, A. D., & Hitch, G. (1974). Working memory.

### C. Changelog

**v1.0.0** - November 2025
- Initial platform launch
- ECCA framework complete
- Full feature set implemented
- 95% completion achieved

---

**Document prepared by**: EdPsych Connect World Development Team
**For inquiries**: dev@edpsychconnect.world
