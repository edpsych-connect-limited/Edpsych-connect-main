# Onboarding Wizard Architecture

## Executive Summary

The Self-Service Onboarding Wizard is a **critical** feature designed to maximize user retention, reduce time-to-value, and ensure users understand and adopt platform features. This document outlines the complete architecture for a 100% enterprise-grade implementation.

**Estimated Development Time**: 12-16 hours
**Priority**: HIGH (Critical for first impressions and retention)
**Impact**: 85% reduction in time-to-value, 60% increase in feature adoption

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Data Model](#data-model)
3. [API Architecture](#api-architecture)
4. [Frontend Components](#frontend-components)
5. [User Flow](#user-flow)
6. [Accessibility Requirements](#accessibility-requirements)
7. [Analytics & Tracking](#analytics--tracking)
8. [Testing Strategy](#testing-strategy)
9. [100% Completeness Checklist](#100-completeness-checklist)

---

## System Overview

### Goals

1. **Reduce time-to-value**: Get users to their first "aha moment" within 5 minutes
2. **Increase feature adoption**: Ensure users understand all 6 major features
3. **Personalize experience**: Tailor content based on user role
4. **Build confidence**: Guide users through quick wins with sample data
5. **Enable self-service**: Reduce support burden by 40%

### Key Metrics

- **Completion Rate**: Target 75%+ (industry average: 40-60%)
- **Time to Complete**: Target 8-12 minutes
- **Feature Adoption**: Target 80%+ trying ≥3 features within first week
- **Support Ticket Reduction**: Target 40% reduction in "how do I..." tickets

### Technical Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (existing Neon instance)
- **State Management**: React Context + Local Storage (for persistence)
- **Analytics**: Custom event tracking (ready for Mixpanel/Amplitude integration)
- **Accessibility**: WCAG 2.1 AA compliant

---

## Data Model

### Existing Schema (Already in users table)

```prisma
model users {
  // ... existing fields ...

  // Onboarding tracking (EXISTING)
  onboarding_completed    Boolean   @default(false)
  onboarding_step         Int       @default(0) // 0-6
  onboarding_started_at   DateTime?
  onboarding_completed_at DateTime?
  onboarding_skipped      Boolean   @default(false)
}
```

### New Schema (Enhanced onboarding tracking)

```prisma
model onboarding_progress {
  id      Int      @id @default(autoincrement())
  user_id Int      @unique

  // Step Completion Tracking
  step_1_welcome_completed      Boolean   @default(false)
  step_1_completed_at           DateTime?

  step_2_role_selected          String?   // Selected role
  step_2_completed_at           DateTime?

  step_3_profile_completed      Boolean   @default(false)
  step_3_photo_uploaded         Boolean   @default(false)
  step_3_hcpc_provided          Boolean   @default(false)
  step_3_organization_provided  Boolean   @default(false)
  step_3_completed_at           DateTime?

  step_4_features_viewed        String[]  @default([]) // Array of feature IDs viewed
  step_4_demos_tried            String[]  @default([]) // Array of demo IDs tried
  step_4_completed_at           DateTime?

  step_5_first_case_created     Boolean   @default(false)
  step_5_first_assessment_done  Boolean   @default(false)
  step_5_first_goal_set         Boolean   @default(false)
  step_5_completed_at           DateTime?

  step_6_certificate_viewed     Boolean   @default(false)
  step_6_tour_completed         Boolean   @default(false)
  step_6_call_booked            Boolean   @default(false)
  step_6_completed_at           DateTime?

  // Navigation Tracking
  current_step                  Int       @default(1) // 1-6
  steps_skipped                 Int[]     @default([]) // Array of step numbers skipped
  times_restarted               Int       @default(0)

  // Time Tracking
  total_time_spent_seconds      Int       @default(0)
  time_per_step                 Json?     // { "1": 120, "2": 90, ... }

  // Engagement Metrics
  video_watched                 Boolean   @default(false)
  video_watch_percentage        Int       @default(0) // 0-100
  help_articles_opened          Int       @default(0)
  back_button_uses              Int       @default(0)

  // Metadata
  created_at                    DateTime  @default(now())
  updated_at                    DateTime  @default(now())
  completed_at                  DateTime?

  // Relations
  user users @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([user_id])
  @@index([current_step])
}

// Add to users model
model users {
  // ... existing fields ...
  onboarding_progress onboarding_progress?
}
```

### Role-Specific Content Configuration

```typescript
interface RoleConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  features: string[]; // Feature IDs to highlight
  quickWins: {
    case: string; // Sample case description
    assessment: string; // Assessment type to demo
    goal: string; // Goal example
  };
  resources: {
    video?: string; // Role-specific intro video
    articles: string[]; // Help article IDs
    courses: string[]; // Recommended course IDs
  };
}

const ROLE_CONFIGS: Record<string, RoleConfig> = {
  'educational-psychologist': {
    id: 'educational-psychologist',
    name: 'Educational Psychologist',
    description: 'HCPC registered practitioner conducting assessments and consultations',
    icon: 'GraduationCap',
    features: ['ecca', 'ehcp', 'interventions', 'progress', 'training', 'cases'],
    quickWins: {
      case: 'Year 7 student with working memory difficulties',
      assessment: 'ECCA Cognitive Assessment',
      goal: 'Improve working memory strategies by 2 points on GAS scale'
    },
    resources: {
      video: '/videos/ep-intro.mp4',
      articles: ['ecca-guide', 'ehcp-creation', 'professional-standards'],
      courses: ['ecca-certification', 'advanced-assessment']
    }
  },
  'senco': {
    id: 'senco',
    name: 'SENCO',
    description: 'Special Educational Needs Coordinator managing SEND provision',
    icon: 'School',
    features: ['interventions', 'progress', 'ehcp', 'training', 'cases', 'collaboration'],
    quickWins: {
      case: 'Year 5 student needing Tier 2 literacy support',
      assessment: 'ECCA Reading Profile',
      goal: 'Increase reading fluency by 15 words per minute'
    },
    resources: {
      video: '/videos/senco-intro.mp4',
      articles: ['intervention-selection', 'progress-monitoring', 'ehcp-reviews'],
      courses: ['senco-essentials', 'intervention-planning']
    }
  },
  'teacher': {
    id: 'teacher',
    name: 'Teacher',
    description: 'Classroom teacher supporting SEND students',
    icon: 'BookOpen',
    features: ['interventions', 'progress', 'gamification', 'differentiation', 'cases'],
    quickWins: {
      case: 'Year 3 student with attention difficulties',
      assessment: 'Classroom observation checklist',
      goal: 'Increase on-task behavior from 60% to 80%'
    },
    resources: {
      video: '/videos/teacher-intro.mp4',
      articles: ['classroom-strategies', 'differentiation-guide', 'gamification-setup'],
      courses: ['send-in-the-classroom', 'behavior-strategies']
    }
  },
  'local-authority': {
    id: 'local-authority',
    name: 'Local Authority Officer',
    description: 'LA staff managing SEND services and compliance',
    icon: 'Building',
    features: ['ehcp', 'cases', 'analytics', 'compliance', 'multi-school', 'reporting'],
    quickWins: {
      case: 'EHCP annual review coordination',
      assessment: 'LA-wide SEND provision audit',
      goal: 'Reduce EHCP processing time by 20%'
    },
    resources: {
      video: '/videos/la-intro.mp4',
      articles: ['la-dashboard', 'compliance-tracking', 'multi-school-management'],
      courses: ['la-administration', 'send-legislation']
    }
  },
  'researcher': {
    id: 'researcher',
    name: 'Researcher',
    description: 'Academic or institutional researcher studying SEND interventions',
    icon: 'Search',
    features: ['analytics', 'research-api', 'data-export', 'interventions', 'outcomes'],
    quickWins: {
      case: 'Multi-school intervention effectiveness study',
      assessment: 'Research protocol setup',
      goal: 'Collect baseline data from 50 participants'
    },
    resources: {
      video: '/videos/researcher-intro.mp4',
      articles: ['research-api', 'data-export', 'ethical-approval'],
      courses: ['research-methods', 'data-analysis']
    }
  }
};
```

---

## API Architecture

### Endpoints

#### 1. GET /api/onboarding/status
**Purpose**: Get current onboarding status for logged-in user

**Authentication**: Required (JWT)

**Response**:
```typescript
{
  success: true,
  data: {
    userId: number,
    onboardingCompleted: boolean,
    currentStep: number, // 1-6
    stepsCompleted: number[],
    progress: {
      step1: { completed: boolean, completedAt: string | null },
      step2: { completed: boolean, role: string | null, completedAt: string | null },
      step3: {
        completed: boolean,
        photoUploaded: boolean,
        hcpcProvided: boolean,
        organizationProvided: boolean,
        completedAt: string | null
      },
      step4: {
        completed: boolean,
        featuresViewed: string[],
        demosTried: string[],
        completedAt: string | null
      },
      step5: {
        completed: boolean,
        caseCreated: boolean,
        assessmentDone: boolean,
        goalSet: boolean,
        completedAt: string | null
      },
      step6: {
        completed: boolean,
        certificateViewed: boolean,
        tourCompleted: boolean,
        callBooked: boolean,
        completedAt: string | null
      }
    },
    totalTimeSpentSeconds: number,
    canResume: boolean
  }
}
```

**Error Responses**:
- 401: Unauthorized
- 404: User not found
- 500: Server error

---

#### 2. POST /api/onboarding/start
**Purpose**: Initialize onboarding for a user

**Authentication**: Required (JWT)

**Request Body**: None (uses authenticated user ID)

**Response**:
```typescript
{
  success: true,
  data: {
    message: "Onboarding started successfully",
    onboardingId: number,
    currentStep: 1,
    startedAt: string
  }
}
```

**Side Effects**:
- Creates `onboarding_progress` record if not exists
- Updates `users.onboarding_step` to 1
- Sets `users.onboarding_started_at`

---

#### 3. POST /api/onboarding/update-step
**Purpose**: Update progress for a specific step

**Authentication**: Required (JWT)

**Request Body**:
```typescript
{
  step: number, // 1-6
  data: {
    // Step 1 (Welcome)
    videoWatched?: boolean,
    videoWatchPercentage?: number,

    // Step 2 (Role Selection)
    roleSelected?: string,

    // Step 3 (Profile Setup)
    photoUploaded?: boolean,
    hcpcProvided?: boolean,
    organizationProvided?: boolean,

    // Step 4 (Feature Tour)
    featureViewed?: string, // Feature ID
    demoTried?: string, // Demo ID

    // Step 5 (Quick Wins)
    caseCreated?: boolean,
    assessmentDone?: boolean,
    goalSet?: boolean,

    // Step 6 (Completion)
    certificateViewed?: boolean,
    tourCompleted?: boolean,
    callBooked?: boolean
  },
  completed?: boolean, // Mark step as completed
  timeSpentSeconds?: number // Time spent on this step
}
```

**Response**:
```typescript
{
  success: true,
  data: {
    message: "Step updated successfully",
    currentStep: number,
    stepCompleted: boolean,
    nextStep: number | null,
    overallProgress: number // 0-100
  }
}
```

**Validation**:
- Step must be 1-6
- User must be authenticated
- Step data must match expected schema
- Cannot skip steps (must complete in order, unless explicitly skipping)

---

#### 4. POST /api/onboarding/skip-step
**Purpose**: Skip a step (with tracking)

**Authentication**: Required (JWT)

**Request Body**:
```typescript
{
  step: number, // 1-6
  reason?: string // Optional reason for analytics
}
```

**Response**:
```typescript
{
  success: true,
  data: {
    message: "Step skipped",
    skippedStep: number,
    nextStep: number,
    currentProgress: number // 0-100
  }
}
```

**Side Effects**:
- Adds step to `steps_skipped` array
- Advances `current_step` by 1
- Logs skip event to analytics

---

#### 5. POST /api/onboarding/complete
**Purpose**: Mark entire onboarding as complete

**Authentication**: Required (JWT)

**Request Body**:
```typescript
{
  feedbackRating?: number, // 1-5
  feedbackComment?: string,
  nextAction?: string // "dashboard" | "first-assessment" | "training"
}
```

**Response**:
```typescript
{
  success: true,
  data: {
    message: "Onboarding completed!",
    completedAt: string,
    totalTimeSpent: number,
    stepsCompleted: number,
    stepsSkipped: number,
    certificateUrl: string, // URL to download certificate
    nextSteps: {
      recommended: string,
      actions: Array<{ label: string, url: string, icon: string }>
    }
  }
}
```

**Side Effects**:
- Sets `onboarding_completed` = true
- Sets `onboarding_completed_at` = now
- Updates `users.onboarding_step` to 6
- Generates completion certificate
- Sends completion email
- Triggers analytics event

---

#### 6. POST /api/onboarding/restart
**Purpose**: Restart onboarding (for users who want to revisit)

**Authentication**: Required (JWT)

**Request Body**: None

**Response**:
```typescript
{
  success: true,
  data: {
    message: "Onboarding restarted",
    currentStep: 1,
    timesRestarted: number
  }
}
```

**Side Effects**:
- Resets `current_step` to 1
- Increments `times_restarted`
- Preserves previous completion data (for analytics)

---

## Frontend Components

### Component Hierarchy

```
OnboardingWizard (Container)
├── OnboardingProvider (Context)
├── OnboardingProgress (Progress indicator)
├── OnboardingNavigation (Back/Skip/Next buttons)
│
├── Step 1: WelcomeScreen
│   ├── WelcomeHeader
│   ├── IntroVideo
│   ├── KeyBenefits (grid)
│   └── GetStartedButton
│
├── Step 2: RoleSelection
│   ├── RoleSelectionHeader
│   ├── RoleCard (x5 roles)
│   └── CustomRoleInput
│
├── Step 3: ProfileSetup
│   ├── ProfileForm
│   │   ├── PhotoUpload
│   │   ├── HCPCInput (conditional)
│   │   └── OrganizationInput
│   └── ValidationFeedback
│
├── Step 4: FeatureTour
│   ├── FeatureTourNavigation (tabs)
│   ├── FeatureDemo (x6 features)
│   │   ├── FeatureVideo
│   │   ├── FeatureDescription
│   │   ├── KeyHighlights
│   │   └── TryNowButton (launches demo)
│   └── InteractiveDemo (modal)
│
├── Step 5: QuickWins
│   ├── QuickWinsHeader
│   ├── CreateFirstCase
│   ├── CompleteFirstAssessment
│   └── SetFirstGoal
│
└── Step 6: Completion
    ├── CompletionAnimation
    ├── Certificate
    ├── DashboardTour
    ├── NextSteps
    └── BookCallCTA (optional)
```

### Component Specifications

#### OnboardingWizard (Main Container)

**File**: `src/components/onboarding/OnboardingWizard.tsx`

**Purpose**: Main orchestrator component

**Features**:
- Manages step transitions
- Handles data persistence
- Coordinates API calls
- Implements navigation logic
- Tracks analytics events

**Props**: None (gets user from auth context)

**State Management**:
```typescript
interface OnboardingState {
  currentStep: number; // 1-6
  userId: number;
  roleSelected: string | null;
  profileData: ProfileData | null;
  featuresViewed: string[];
  demosTried: string[];
  quickWinsCompleted: {
    case: boolean;
    assessment: boolean;
    goal: boolean;
  };
  timeStarted: Date;
  timePerStep: Record<number, number>;
  isLoading: boolean;
  error: string | null;
  canGoBack: boolean;
  canSkip: boolean;
}
```

---

#### Step 1: WelcomeScreen

**File**: `src/components/onboarding/steps/WelcomeScreen.tsx`

**Purpose**: Introduce platform and set expectations

**Content**:
1. **Header**: "Welcome to EdPsych Connect World"
2. **Subheader**: "Let's get you set up in just 5 minutes"
3. **Progress Indicator**: "Step 1 of 6"
4. **Video**: 90-second platform introduction
5. **Key Benefits Grid**:
   - Benefit 1: "Save 15+ hours per week"
   - Benefit 2: "Access 100+ evidence-based interventions"
   - Benefit 3: "HCPC/BPS compliant assessments"
   - Benefit 4: "Automated EHCP workflows"
6. **CTA Button**: "Get Started" (large, prominent)
7. **Skip Link**: "I've used this before, skip to dashboard"

**Interactions**:
- Play/pause video
- Track video watch percentage
- Click "Get Started" → advances to Step 2
- Click "Skip" → confirmation dialog, then jumps to dashboard

**Accessibility**:
- Video has captions and transcript
- All benefits have `role="list"`
- Focus management on load

---

#### Step 2: RoleSelection

**File**: `src/components/onboarding/steps/RoleSelection.tsx`

**Purpose**: Personalize experience based on user role

**Content**:
1. **Header**: "What's your role?"
2. **Subheader**: "We'll customize your experience based on your work"
3. **Progress Indicator**: "Step 2 of 6"
4. **Role Cards Grid** (2x3 on desktop, 1 col on mobile):
   - Educational Psychologist
   - SENCO
   - Teacher
   - Local Authority Officer
   - Researcher
   - Other (with text input)

**Role Card Structure**:
```typescript
<RoleCard>
  <Icon /> {/* Role-specific icon */}
  <Title>{roleName}</Title>
  <Description>{roleDescription}</Description>
  <Badge>Most Popular</Badge> {/* Conditional */}
  <SelectButton>Select</SelectButton>
</RoleCard>
```

**Interactions**:
- Click role card → highlights card, enables Next button
- "Other" role → shows text input for custom role
- Back button → returns to Step 1
- Next button (disabled until selection) → advances to Step 3

**Validation**:
- Role must be selected
- If "Other", custom text required (max 50 chars)

**Accessibility**:
- Role cards are radio buttons styled as cards
- Keyboard navigation between roles
- Selected role announced to screen readers

---

#### Step 3: ProfileSetup

**File**: `src/components/onboarding/steps/ProfileSetup.tsx`

**Purpose**: Collect essential professional information

**Content**:
1. **Header**: "Set up your profile"
2. **Subheader**: "Help us personalize your experience"
3. **Progress Indicator**: "Step 3 of 6"
4. **Form Fields**:
   - Photo Upload (optional, drag-and-drop or file picker)
   - First Name (pre-filled from signup, editable)
   - Last Name (pre-filled from signup, editable)
   - Organization (text input, optional)
   - HCPC Registration (conditional: only for EPs, text input)
   - Phone (optional, formatted)
   - Job Title (text input)
   - Years of Experience (dropdown: <1, 1-3, 3-5, 5-10, 10+)

**Photo Upload**:
- Drag-and-drop zone
- File picker fallback
- Image preview
- Crop functionality
- Max 5MB, JPG/PNG only
- Upload to cloud storage (Vercel Blob or S3)

**Validation**:
- First name required (min 2 chars)
- Last name required (min 2 chars)
- HCPC format: PYL followed by 6 digits (if EP role)
- Phone: UK format validation (if provided)
- All fields have real-time validation feedback

**Interactions**:
- Skip button → advances without saving optional fields
- Back button → returns to Step 2, preserves entered data
- Next button → validates, saves data, advances to Step 4

**Accessibility**:
- All form fields have labels
- Error messages associated with fields (aria-describedby)
- Photo upload is keyboard accessible
- Focus order logical

---

#### Step 4: FeatureTour

**File**: `src/components/onboarding/steps/FeatureTour.tsx`

**Purpose**: Introduce all 6 major platform features

**Content**:
1. **Header**: "Discover what you can do"
2. **Subheader**: "Explore the 6 core features of EdPsych Connect World"
3. **Progress Indicator**: "Step 4 of 6"
4. **Feature Navigation**: Horizontal tabs (6 features)
5. **Feature Display** (for selected tab):
   - Feature icon + name
   - 2-minute explainer video
   - Key highlights (bullet list, 5-7 items)
   - Benefits (3-5 items)
   - "Try This Feature" button → launches interactive demo

**Features to Showcase**:
1. ECCA Cognitive Assessment
2. Intervention Library (100+ interventions)
3. EHCP Lifecycle Management
4. Professional Development Platform
5. Battle Royale Gamification
6. Progress Tracking & Analytics

**Interactive Demo**:
- Opens in modal or side panel
- Guided walkthrough with sample data
- Step-by-step instructions
- "Next" prompts
- Can exit anytime
- Progress saved

**Interactions**:
- Click feature tab → switches displayed feature
- Play/pause feature videos
- Click "Try This Feature" → launches demo
- "Skip Tour" button → advances to Step 5
- "I've seen enough" button → advances to Step 5 (after viewing 3+ features)
- Back button → returns to Step 3
- Next button → advances to Step 5 (enabled after viewing 1+ features)

**Tracking**:
- Which features viewed
- Video watch percentages
- Which demos tried
- Time spent on each feature

**Accessibility**:
- Tabs implement ARIA tablist pattern
- Videos have captions
- Demo instructions are screen-reader accessible
- Keyboard shortcuts (numbers 1-6 to switch tabs)

---

#### Step 5: QuickWins

**File**: `src/components/onboarding/steps/QuickWins.tsx`

**Purpose**: Guide users to their first "aha moment"

**Content**:
1. **Header**: "Let's get your first win"
2. **Subheader**: "Complete these 3 quick tasks to see the platform in action"
3. **Progress Indicator**: "Step 5 of 6"
4. **Task Checklist**:
   - Task 1: Create your first case
   - Task 2: Complete a sample assessment
   - Task 3: Set your first goal

**Task Structure**:
```typescript
<QuickWinTask>
  <TaskNumber>1</TaskNumber>
  <TaskIcon />
  <TaskTitle>Create your first case</TaskTitle>
  <TaskDescription>
    We'll guide you through creating a sample case using our templates
  </TaskDescription>
  <TaskStatus>Not Started | In Progress | Completed</TaskStatus>
  <StartButton>Start Task</StartButton> {/* or ContinueButton / ViewButton */}
</QuickWinTask>
```

**Task 1: Create First Case**:
- Opens guided wizard
- Pre-fills with role-specific sample data
- User reviews and submits
- Case created in database (flagged as "demo" case)
- Success animation + checkmark

**Task 2: Complete Sample Assessment**:
- Based on role (e.g., ECCA for EPs, observation checklist for teachers)
- Pre-filled responses for speed
- User walks through and submits
- Assessment linked to demo case
- Success animation + checkmark

**Task 3: Set First Goal**:
- Goal Attainment Scaling (GAS) wizard
- Pre-filled sample goal
- User customizes slightly
- Goal created and linked to case
- Success animation + checkmark

**Interactions**:
- Click "Start Task" → launches task wizard (modal or inline)
- Complete task → checkmark appears, confetti animation
- Tasks can be completed in any order
- "Skip Quick Wins" button → advances to Step 6 (but tracks skip)
- Back button → returns to Step 4
- Next button → enabled when all 3 tasks complete, advances to Step 6

**Demo Data Management**:
- All created items tagged with `is_demo: true`
- User can delete demo data later
- Demo data doesn't count in analytics
- Clearly labeled as "Sample" or "Demo"

**Accessibility**:
- Task list has proper list semantics
- Status changes announced to screen readers
- Wizards are keyboard accessible
- Success animations don't rely on motion alone

---

#### Step 6: Completion

**File**: `src/components/onboarding/steps/Completion.tsx`

**Purpose**: Celebrate completion and set up next steps

**Content**:
1. **Completion Animation**: Confetti, success checkmark, or celebration graphic
2. **Header**: "You're all set! 🎉"
3. **Subheader**: "You've completed onboarding in [X] minutes"
4. **Progress Indicator**: "Step 6 of 6 - Complete"
5. **Completion Certificate**:
   - User name
   - Completion date
   - QR code (for verification)
   - "Download PDF" button
6. **Quick Stats**:
   - "Features explored: [X]/6"
   - "Time spent: [X] minutes"
   - "Quick wins completed: [X]/3"
7. **What's Next Section**:
   - Option 1: "Take a dashboard tour"
   - Option 2: "Start your first real assessment"
   - Option 3: "Browse training courses"
   - Option 4: "Explore intervention library"
8. **Optional: Book a Call**:
   - "Want personalized onboarding help?"
   - Calendar booking widget (Calendly or similar)
   - "Book a 15-minute call with our team"
9. **CTA Button**: "Go to Dashboard" (primary, large)

**Certificate Generation**:
- PDF generated server-side
- Contains:
  - EdPsych Connect World logo
  - User name
  - Completion date
  - QR code linking to verification page
  - Digital signature
- Stored in user's account
- Emailed to user

**Dashboard Tour**:
- If user clicks "Take a tour"
- Overlay guide highlighting key areas:
  - Navigation menu
  - Quick actions
  - Recent cases
  - Notifications
  - Help center
- Step-by-step with "Next" / "Previous" / "End Tour"
- Can restart tour from help menu later

**Interactions**:
- Click "Download PDF" → downloads certificate
- Click "Take a dashboard tour" → launches tour overlay
- Click "Start your first real assessment" → navigates to /assessments/new
- Click "Browse training courses" → navigates to /training/marketplace
- Click "Explore intervention library" → navigates to /interventions/library
- Click "Book a call" → opens calendar widget
- Click "Go to Dashboard" → navigates to /dashboard, ends onboarding

**Tracking**:
- Certificate downloaded (yes/no)
- Next action selected
- Call booked (yes/no)
- Tour completed (yes/no)

**Accessibility**:
- Celebration animation has reduced-motion alternative
- Certificate is accessible (screen-readable)
- All CTAs have clear labels
- Focus management when tour starts

---

## User Flow

### Flow Diagram

```
┌─────────────────┐
│  User Signs Up  │
│   or Logs In    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ Check: onboarding_      │
│   completed = true?     │
└────────┬────────────────┘
         │
         ├─ YES ──► Go to Dashboard
         │
         └─ NO ───► Start Onboarding
                    │
                    ▼
         ┌─────────────────────┐
         │  Step 1: Welcome    │
         │  - Intro video      │
         │  - Key benefits     │
         └─────────┬───────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │  Step 2: Role       │
         │  - Select role      │
         │  - Personalize      │
         └─────────┬───────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │  Step 3: Profile    │
         │  - Photo upload     │
         │  - HCPC (if EP)     │
         │  - Organization     │
         └─────────┬───────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │  Step 4: Features   │
         │  - Tour 6 features  │
         │  - Try demos        │
         └─────────┬───────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │  Step 5: Quick Wins │
         │  - Create case      │
         │  - Do assessment    │
         │  - Set goal         │
         └─────────┬───────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │  Step 6: Complete   │
         │  - Certificate      │
         │  - Dashboard tour   │
         │  - Next steps       │
         └─────────┬───────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │   Go to Dashboard   │
         │ (onboarding_completed│
         │      = true)         │
         └─────────────────────┘
```

### Navigation Rules

**Back Button**:
- Available on Steps 2-6
- Returns to previous step
- Preserves entered data
- Does NOT mark previous step as incomplete

**Skip Button**:
- Available on all steps except Step 1
- Shows confirmation dialog: "Are you sure? You'll miss important setup"
- Tracks skip in analytics
- Advances to next step OR jumps to dashboard (from Step 6)

**Next Button**:
- Enabled based on step validation:
  - Step 1: Always enabled
  - Step 2: Enabled when role selected
  - Step 3: Enabled when required fields filled
  - Step 4: Enabled after viewing 1+ features
  - Step 5: Enabled when all 3 quick wins complete (or skip button used)
  - Step 6: Always enabled
- Validates current step data
- Saves progress to database
- Advances to next step

**Progress Persistence**:
- Every step completion saved to database immediately
- User can close browser and resume where they left off
- "Resume Onboarding" banner shown on dashboard if incomplete
- Data saved in both database and localStorage (for resilience)

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance

#### Perceivable

1. **Text Alternatives**:
   - All images have alt text
   - Icons have aria-label
   - Videos have captions and transcripts

2. **Adaptable Content**:
   - Semantic HTML (headings, lists, sections)
   - Logical reading order
   - Works with screen readers (NVDA, JAWS, VoiceOver)

3. **Distinguishable**:
   - Color contrast ratio ≥ 4.5:1 for normal text
   - Color contrast ratio ≥ 3:1 for large text and UI components
   - Color is not the only visual means of conveying information
   - Text can be resized up to 200% without loss of functionality

#### Operable

1. **Keyboard Accessible**:
   - All functionality available via keyboard
   - No keyboard traps
   - Tab order is logical
   - Focus indicator always visible (at least 2px outline)

2. **Enough Time**:
   - No time limits on steps
   - Videos can be paused
   - Progress auto-saved every 30 seconds

3. **Navigable**:
   - Skip links available
   - Clear page titles
   - Focus order matches visual order
   - Link text is descriptive
   - Multiple ways to navigate (breadcrumbs, progress indicator)

4. **Input Modalities**:
   - All functionality works with mouse, keyboard, touch, and voice
   - No reliance on complex gestures

#### Understandable

1. **Readable**:
   - Language declared (lang="en-GB")
   - Reading level: Plain English (Flesch-Kincaid Grade 8-10)
   - Abbreviations explained on first use

2. **Predictable**:
   - Navigation consistent across steps
   - Components behave predictably
   - No unexpected context changes

3. **Input Assistance**:
   - Labels for all form fields
   - Error messages are specific and helpful
   - Error prevention (validation before submission)
   - Confirmation for destructive actions (e.g., skipping)

#### Robust

1. **Compatible**:
   - Valid HTML5
   - ARIA used correctly
   - Name, role, and value for all UI components
   - Status messages announced (aria-live regions)

### Specific ARIA Implementation

```typescript
// Progress Indicator
<nav aria-label="Onboarding progress">
  <ol role="list">
    <li aria-current="step">Welcome</li>
    <li>Role Selection</li>
    {/* ... */}
  </ol>
</nav>

// Step Container
<div role="region" aria-labelledby="step-heading">
  <h2 id="step-heading">Welcome to EdPsych Connect World</h2>
  {/* Step content */}
</div>

// Form Fields
<label htmlFor="hcpc-input">HCPC Registration Number</label>
<input
  id="hcpc-input"
  type="text"
  aria-required="true"
  aria-invalid={hasError}
  aria-describedby="hcpc-error hcpc-help"
/>
<div id="hcpc-help">Format: PYL followed by 6 digits</div>
<div id="hcpc-error" role="alert">{errorMessage}</div>

// Loading States
<div role="status" aria-live="polite" aria-atomic="true">
  Loading step 3 of 6...
</div>

// Success Messages
<div role="alert" aria-live="assertive">
  Profile saved successfully!
</div>

// Modal Dialogs
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <h2 id="dialog-title">Skip this step?</h2>
  <p id="dialog-description">You'll miss important setup information.</p>
  {/* Dialog content */}
</div>
```

### Keyboard Shortcuts

- `Tab` / `Shift+Tab`: Navigate between interactive elements
- `Enter` / `Space`: Activate buttons and links
- `Escape`: Close modals, cancel actions
- `Arrow keys`: Navigate within components (tabs, radio groups)
- `1-6`: Jump to specific feature tab (in Step 4)
- `Ctrl+B`: Go back to previous step (when back button available)
- `Ctrl+N`: Go to next step (when next button enabled)

---

## Analytics & Tracking

### Events to Track

#### Onboarding Lifecycle Events

```typescript
// Event 1: Onboarding Started
{
  event: "onboarding_started",
  userId: number,
  timestamp: string,
  properties: {
    userRole: string, // from signup
    referralSource: string,
    deviceType: "desktop" | "mobile" | "tablet"
  }
}

// Event 2: Step Completed
{
  event: "onboarding_step_completed",
  userId: number,
  timestamp: string,
  properties: {
    step: number, // 1-6
    stepName: string,
    timeSpentSeconds: number,
    dataEntered: boolean // Did user enter data or skip?
  }
}

// Event 3: Step Skipped
{
  event: "onboarding_step_skipped",
  userId: number,
  timestamp: string,
  properties: {
    step: number,
    stepName: string,
    skipReason: string | null,
    timeSpentSeconds: number
  }
}

// Event 4: Back Button Used
{
  event: "onboarding_back_button",
  userId: number,
  timestamp: string,
  properties: {
    fromStep: number,
    toStep: number
  }
}

// Event 5: Onboarding Completed
{
  event: "onboarding_completed",
  userId: number,
  timestamp: string,
  properties: {
    totalTimeSeconds: number,
    stepsCompleted: number,
    stepsSkipped: number,
    videoWatchPercentage: number, // Average across all videos
    featuresViewed: number,
    demosTried: number,
    quickWinsCompleted: number,
    certificateDownloaded: boolean,
    tourCompleted: boolean,
    callBooked: boolean,
    nextActionSelected: string
  }
}

// Event 6: Onboarding Abandoned
{
  event: "onboarding_abandoned",
  userId: number,
  timestamp: string,
  properties: {
    lastStepCompleted: number,
    currentStep: number,
    timeSpentSeconds: number,
    exitPoint: "closed_browser" | "clicked_skip_all" | "navigated_away"
  }
}
```

#### Step-Specific Events

```typescript
// Role Selection
{
  event: "role_selected",
  userId: number,
  properties: {
    role: string,
    timeToDecideSeconds: number
  }
}

// Profile Setup
{
  event: "profile_photo_uploaded",
  userId: number,
  properties: {
    fileSize: number,
    uploadTimeSeconds: number
  }
}

// Feature Tour
{
  event: "feature_viewed",
  userId: number,
  properties: {
    featureId: string,
    featureName: string,
    videoWatched: boolean,
    videoWatchPercentage: number,
    timeSpentSeconds: number
  }
}

{
  event: "demo_tried",
  userId: number,
  properties: {
    demoId: string,
    demoName: string,
    completed: boolean,
    timeSpentSeconds: number
  }
}

// Quick Wins
{
  event: "quick_win_completed",
  userId: number,
  properties: {
    taskNumber: 1 | 2 | 3,
    taskName: string,
    timeSpentSeconds: number,
    usedSampleData: boolean
  }
}
```

### Key Metrics to Monitor

#### Funnel Metrics

1. **Onboarding Start Rate**: `(users who started onboarding) / (total signups)`
   - Target: >95%

2. **Step Completion Rate**: `(users who completed step X) / (users who started onboarding)`
   - Target per step:
     - Step 1: >90%
     - Step 2: >85%
     - Step 3: >80%
     - Step 4: >70%
     - Step 5: >65%
     - Step 6: >75% (of those who reached it)

3. **Overall Completion Rate**: `(users who completed all steps) / (users who started)`
   - Target: >75%
   - Industry average: 40-60%

#### Engagement Metrics

4. **Average Time to Complete**: Median time from start to finish
   - Target: 8-12 minutes
   - Acceptable range: 5-20 minutes

5. **Video Watch Rate**: `(users who watched ≥50% of videos) / (users who started)`
   - Target: >60%

6. **Feature Demo Try Rate**: `(users who tried ≥1 demo) / (users who reached Step 4)`
   - Target: >50%

7. **Quick Wins Completion**: `(users who completed all 3 tasks) / (users who reached Step 5)`
   - Target: >80%

#### Quality Metrics

8. **Certificate Download Rate**: `(certificates downloaded) / (onboardings completed)`
   - Target: >60%

9. **Dashboard Tour Completion**: `(tours completed) / (tours started)`
   - Target: >70%

10. **Call Booking Rate**: `(calls booked) / (onboardings completed)`
    - Target: >15%

#### Retention Metrics (Measured 7 days post-onboarding)

11. **7-Day Retention**: `(users active on day 7) / (users who completed onboarding)`
    - Target: >70%
    - Comparison: Users who skipped onboarding (expect <40%)

12. **Feature Adoption (7 days)**: Average number of features used
    - Target: ≥3 features per user

13. **Support Ticket Rate**: `(support tickets) / (completed onboardings)`
    - Target: <10% (vs expected 25% without onboarding)

### Analytics Dashboard

Create internal dashboard showing:

1. **Funnel Visualization**: Sankey diagram showing drop-off at each step
2. **Completion Trends**: Line graph over time
3. **Average Time per Step**: Bar chart
4. **Skip Rate by Step**: Identify problematic steps
5. **Cohort Analysis**: Compare completion rates by:
   - Role
   - Referral source
   - Device type
   - Day of week / time of day
6. **Video Engagement**: Heatmap of play/pause/rewind events
7. **Feature Interest**: Which features get most views/demos?
8. **Quick Wins Performance**: Which tasks have highest completion?
9. **Impact on Retention**: Compare retention curves (completed vs abandoned)
10. **Correlation Analysis**: Which steps correlate most with long-term engagement?

---

## Testing Strategy

### Unit Tests

**Files to Test**:
- All step components
- Validation functions
- Data transformation utilities
- Analytics tracking functions

**Example Test Cases**:

```typescript
// Step2: RoleSelection.test.tsx
describe('RoleSelection', () => {
  it('renders all 5 role options', () => {
    // Assert 5 RoleCard components rendered
  });

  it('enables Next button when role selected', () => {
    // Click role card
    // Assert Next button is enabled
  });

  it('shows custom input when Other is selected', () => {
    // Click "Other" card
    // Assert text input is visible
  });

  it('validates custom role (min 2 chars)', () => {
    // Enter 1 character
    // Assert error message shown
    // Enter 2+ characters
    // Assert error cleared
  });

  it('saves selection when Next is clicked', () => {
    // Mock API call
    // Click Next
    // Assert API called with correct role
  });

  it('is keyboard accessible', () => {
    // Tab to first role
    // Press Space to select
    // Assert role selected
  });
});

// Step3: ProfileSetup.test.tsx
describe('ProfileSetup', () => {
  it('validates HCPC format for EP role', () => {
    // Set role to EP
    // Enter invalid HCPC
    // Assert error message
    // Enter valid HCPC
    // Assert no error
  });

  it('uploads photo successfully', () => {
    // Mock file upload
    // Drag and drop image
    // Assert upload initiated
    // Assert preview shown
  });

  it('shows different fields for different roles', () => {
    // Role = EP → HCPC field visible
    // Role = Teacher → HCPC field hidden
  });
});

// Validation utilities
describe('validateHCPC', () => {
  it('accepts valid format: PYL123456', () => {
    expect(validateHCPC('PYL123456')).toBe(true);
  });

  it('rejects invalid formats', () => {
    expect(validateHCPC('ABC123456')).toBe(false);
    expect(validateHCPC('PYL12345')).toBe(false); // too short
    expect(validateHCPC('PYL1234567')).toBe(false); // too long
  });
});
```

### Integration Tests

**Scenarios to Test**:

1. **Complete Onboarding Flow (Happy Path)**:
   - Start onboarding
   - Complete all 6 steps with valid data
   - Verify database updates at each step
   - Verify completion certificate generated
   - Verify redirect to dashboard
   - Verify `onboarding_completed = true`

2. **Skip Flow**:
   - Start onboarding
   - Skip Steps 3, 4, 5
   - Complete only Steps 1, 2, 6
   - Verify skips tracked in database
   - Verify completion still works

3. **Back Button Flow**:
   - Complete Steps 1-3
   - Click Back from Step 4
   - Modify data in Step 3
   - Click Next
   - Verify updated data saved
   - Verify forward progress maintained

4. **Resume Flow**:
   - Complete Steps 1-3
   - Close browser
   - Reopen, log in
   - Verify "Resume Onboarding" banner shown
   - Click resume
   - Verify starts at Step 4
   - Verify previous data preserved

5. **Error Handling**:
   - Simulate API failures at each step
   - Verify error messages shown
   - Verify retry functionality
   - Verify data not lost

### E2E Tests (Playwright/Cypress)

```typescript
// e2e/onboarding.spec.ts

describe('Onboarding Wizard E2E', () => {
  beforeEach(() => {
    // Create test user
    // Log in
  });

  it('completes full onboarding flow', () => {
    // Step 1: Welcome
    cy.visit('/onboarding');
    cy.contains('Welcome to EdPsych Connect World').should('be.visible');
    cy.get('video').should('exist');
    cy.contains('Get Started').click();

    // Step 2: Role Selection
    cy.contains('What's your role?').should('be.visible');
    cy.contains('Educational Psychologist').click();
    cy.contains('Next').click();

    // Step 3: Profile Setup
    cy.contains('Set up your profile').should('be.visible');
    cy.get('input[name="organization"]').type('Test School');
    cy.get('input[name="hcpc"]').type('PYL042340');
    cy.contains('Next').click();

    // Step 4: Feature Tour
    cy.contains('Discover what you can do').should('be.visible');
    cy.contains('ECCA Cognitive Assessment').click();
    cy.get('video').should('be.visible');
    cy.contains('Next').click();

    // Step 5: Quick Wins
    cy.contains('Let's get your first win').should('be.visible');
    cy.contains('Start Task').first().click();
    // Complete first task
    cy.contains('Submit').click();
    cy.contains('Start Task').eq(1).click();
    // Complete second task
    cy.contains('Submit').click();
    cy.contains('Start Task').eq(2).click();
    // Complete third task
    cy.contains('Submit').click();
    cy.contains('Next').click();

    // Step 6: Completion
    cy.contains('You're all set!').should('be.visible');
    cy.contains('Download PDF').should('be.visible');
    cy.contains('Go to Dashboard').click();

    // Verify redirected to dashboard
    cy.url().should('include', '/dashboard');

    // Verify no onboarding banner
    cy.contains('Resume Onboarding').should('not.exist');
  });

  it('supports skip functionality', () => {
    cy.visit('/onboarding');
    cy.contains('Get Started').click();
    cy.contains('Educational Psychologist').click();
    cy.contains('Skip').click();
    cy.contains('Are you sure?').should('be.visible');
    cy.contains('Yes, skip').click();
    cy.contains('Discover what you can do').should('be.visible');
  });

  it('supports back navigation', () => {
    cy.visit('/onboarding');
    cy.contains('Get Started').click();
    cy.contains('Educational Psychologist').click();
    cy.contains('Next').click();
    cy.contains('Back').click();
    cy.contains('What's your role?').should('be.visible');
    // Verify role still selected
    cy.contains('Educational Psychologist').parent().should('have.class', 'selected');
  });

  it('resumes from last incomplete step', () => {
    // Complete first 3 steps
    cy.visit('/onboarding');
    cy.contains('Get Started').click();
    cy.contains('Teacher').click();
    cy.contains('Next').click();
    cy.get('input[name="organization"]').type('Test School');
    cy.contains('Next').click();

    // Simulate closing browser
    cy.clearCookies();
    cy.reload();

    // Log in again
    cy.visit('/login');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.contains('Log in').click();

    // Should see resume banner
    cy.contains('Resume Onboarding').should('be.visible');
    cy.contains('Resume Onboarding').click();

    // Should be on Step 4
    cy.contains('Discover what you can do').should('be.visible');
  });
});
```

### Accessibility Tests

```typescript
// Use @axe-core/playwright or @axe-core/react

describe('Onboarding Accessibility', () => {
  it('has no WCAG 2.1 AA violations on Step 1', async () => {
    const { page } = await setupPage('/onboarding');
    const results = await runAxe(page);
    expect(results.violations).toHaveLength(0);
  });

  it('supports keyboard navigation', async () => {
    const { page } = await setupPage('/onboarding/step-2');

    // Tab to first role card
    await page.keyboard.press('Tab');
    let focused = await page.evaluate(() => document.activeElement?.textContent);
    expect(focused).toContain('Educational Psychologist');

    // Press Space to select
    await page.keyboard.press('Space');
    const selected = await page.locator('[aria-checked="true"]');
    expect(await selected.textContent()).toContain('Educational Psychologist');

    // Tab to Next button
    await page.keyboard.press('Tab'); // Skip button
    await page.keyboard.press('Tab'); // Next button
    await page.keyboard.press('Enter');

    // Should advance to Step 3
    await expect(page.locator('h1')).toContainText('Set up your profile');
  });

  it('announces status changes to screen readers', async () => {
    const { page } = await setupPage('/onboarding/step-5');

    // Complete first task
    await page.click('text=Start Task');
    await page.click('text=Submit');

    // Check for aria-live announcement
    const announcement = await page.locator('[role="status"]').textContent();
    expect(announcement).toContain('Task 1 completed');
  });
});
```

### Performance Tests

```typescript
describe('Onboarding Performance', () => {
  it('loads Step 1 in < 2 seconds', async () => {
    const startTime = Date.now();
    const { page } = await setupPage('/onboarding');
    await page.waitForSelector('text=Welcome to EdPsych Connect World');
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2000);
  });

  it('advances between steps in < 500ms', async () => {
    const { page } = await setupPage('/onboarding');
    await page.click('text=Get Started');

    const startTime = Date.now();
    await page.click('text=Educational Psychologist');
    await page.click('text=Next');
    await page.waitForSelector('text=Set up your profile');
    const transitionTime = Date.now() - startTime;

    expect(transitionTime).toBeLessThan(500);
  });

  it('handles photo upload in < 3 seconds', async () => {
    const { page } = await setupPage('/onboarding/step-3');

    const startTime = Date.now();
    const filePath = path.join(__dirname, 'fixtures', 'test-photo.jpg');
    await page.setInputFiles('input[type="file"]', filePath);
    await page.waitForSelector('[alt="Profile preview"]');
    const uploadTime = Date.now() - startTime;

    expect(uploadTime).toBeLessThan(3000);
  });
});
```

---

## 100% Completeness Checklist

### Functionality ✅

- [ ] All 6 steps fully implemented
- [ ] Step 1: Welcome screen with video and benefits
- [ ] Step 2: Role selection with 5+ roles
- [ ] Step 3: Profile setup with photo upload and validation
- [ ] Step 4: Feature tour showcasing all 6 features with demos
- [ ] Step 5: Quick wins (3 tasks) with sample data
- [ ] Step 6: Completion with certificate and next steps
- [ ] Navigation (Back, Skip, Next) works perfectly
- [ ] Progress indicator updates correctly
- [ ] Data persistence (can resume if interrupted)
- [ ] Certificate generation (PDF with QR code)
- [ ] Dashboard tour (overlay guide)
- [ ] Calendar booking widget (optional call)
- [ ] Demo data flagging (is_demo = true)
- [ ] Onboarding completion email sent

### Validation ✅

- [ ] Client-side validation for all form fields
- [ ] Server-side validation for all API endpoints
- [ ] HCPC format validation (PYL + 6 digits)
- [ ] Email format validation
- [ ] Phone format validation (UK)
- [ ] Photo file type validation (JPG/PNG only)
- [ ] Photo file size validation (max 5MB)
- [ ] Role selection required before advancing
- [ ] Profile fields validated before advancing
- [ ] At least 1 feature viewed before advancing from Step 4
- [ ] All 3 quick wins completed before advancing from Step 5
- [ ] Error messages are specific and helpful
- [ ] Retry logic for API failures

### Accessibility (WCAG 2.1 AA) ✅

- [ ] All images have alt text
- [ ] All icons have aria-label
- [ ] Videos have captions and transcripts
- [ ] Semantic HTML throughout (h1-h6, nav, section, etc.)
- [ ] Logical heading hierarchy
- [ ] Color contrast ≥ 4.5:1 for text
- [ ] Color contrast ≥ 3:1 for UI components
- [ ] Color not the only means of conveying info
- [ ] Text resizable to 200% without loss of functionality
- [ ] All functionality keyboard accessible
- [ ] No keyboard traps
- [ ] Tab order is logical
- [ ] Focus indicator always visible (≥2px outline)
- [ ] Skip links provided
- [ ] ARIA labels on all form fields
- [ ] ARIA error messages (aria-describedby)
- [ ] ARIA live regions for status updates
- [ ] ARIA roles (dialog, tablist, alert, etc.)
- [ ] Screen reader tested (NVDA, JAWS, VoiceOver)
- [ ] Keyboard shortcuts documented

### Performance ✅

- [ ] Initial load < 2 seconds
- [ ] Time to interactive < 3 seconds
- [ ] First Contentful Paint < 1 second
- [ ] Step transitions < 500ms
- [ ] Photo upload < 3 seconds (5MB file)
- [ ] API calls < 1 second (95th percentile)
- [ ] Database queries optimized (indexes, no N+1)
- [ ] Images optimized (WebP, lazy loading)
- [ ] Code splitting per step
- [ ] Lighthouse score ≥ 90

### Security ✅

- [ ] All API endpoints require authentication
- [ ] JWT tokens validated on every request
- [ ] Input sanitization (prevent XSS)
- [ ] SQL injection prevention (Prisma)
- [ ] File upload validation (type, size, malware scan)
- [ ] Rate limiting on API endpoints
- [ ] CSRF protection
- [ ] HTTPS enforced
- [ ] Sensitive data encrypted (photos, personal info)
- [ ] Password fields use type="password"
- [ ] No sensitive data in URLs or logs
- [ ] GDPR compliant (data minimization, consent)

### Error Handling ✅

- [ ] Loading states for all async operations
- [ ] Error states with user-friendly messages
- [ ] Empty states (e.g., no features viewed yet)
- [ ] Success states with confirmation
- [ ] Network error handling (retry, fallback)
- [ ] API error handling (4xx, 5xx)
- [ ] Validation error handling (client + server)
- [ ] File upload error handling
- [ ] Browser compatibility errors (graceful degradation)
- [ ] Error logging to monitoring service (Sentry)

### Documentation ✅

- [ ] Architecture document (this file)
- [ ] API documentation (endpoints, request/response)
- [ ] Component documentation (props, usage)
- [ ] JSDoc comments on all functions
- [ ] README for onboarding module
- [ ] User guide (how to complete onboarding)
- [ ] Admin guide (how to monitor/troubleshoot)
- [ ] Analytics guide (metrics to track)
- [ ] Code comments explaining complex logic
- [ ] Inline comments for ARIA usage

### Testing ✅

- [ ] Unit tests for all components (≥80% coverage)
- [ ] Integration tests for complete flow
- [ ] E2E tests (happy path + edge cases)
- [ ] Accessibility tests (axe-core, manual)
- [ ] Performance tests (load time, transitions)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile testing (iOS, Android, various sizes)
- [ ] Screen reader testing (NVDA, JAWS, VoiceOver)
- [ ] Keyboard navigation testing
- [ ] Error scenario testing
- [ ] API error simulation
- [ ] Network throttling testing (slow 3G)
- [ ] Load testing (concurrent users)

### Analytics ✅

- [ ] Event tracking implemented for all key actions
- [ ] Onboarding lifecycle events (start, complete, abandon)
- [ ] Step-specific events (role selected, feature viewed, etc.)
- [ ] Funnel metrics calculated
- [ ] Engagement metrics tracked
- [ ] Retention metrics (7-day, 30-day)
- [ ] Analytics dashboard created
- [ ] Cohort analysis enabled
- [ ] A/B testing framework ready
- [ ] Data export functionality

### Mobile Responsiveness ✅

- [ ] Works on screens ≥320px wide
- [ ] Responsive breakpoints (mobile, tablet, desktop)
- [ ] Touch-friendly (targets ≥44x44px)
- [ ] Viewport meta tag set
- [ ] Images use srcset for responsive loading
- [ ] Navigation adapted for mobile (hamburger menu if needed)
- [ ] Forms optimized for mobile (input types, autocomplete)
- [ ] Videos work on mobile (controls accessible)
- [ ] Modals/dialogs mobile-friendly
- [ ] Tested on real devices (not just DevTools)

### Integration ✅

- [ ] Integrated with auth system (JWT)
- [ ] Integrated with user profile
- [ ] Integrated with subscription system (check tier)
- [ ] Integrated with email service (completion email)
- [ ] Integrated with cloud storage (photo upload)
- [ ] Integrated with calendar service (optional call booking)
- [ ] Integrated with help center (links to articles)
- [ ] Integrated with training platform (course recommendations)
- [ ] Integrated with analytics service
- [ ] Integrated with monitoring service (Sentry)

### Content ✅

- [ ] All copy written (no placeholders)
- [ ] Copy reviewed for clarity and tone
- [ ] UK English spelling throughout
- [ ] Professional terminology used correctly
- [ ] Videos recorded (or placeholders with real content plan)
- [ ] Video captions written
- [ ] Video transcripts written
- [ ] Help articles linked
- [ ] Sample data is realistic (no "John Doe")
- [ ] Certificate template designed
- [ ] Email template designed

### Edge Cases Handled ✅

- [ ] User closes browser mid-onboarding → can resume
- [ ] User skips all steps → tracked, still marks complete
- [ ] User goes back and changes data → updates saved
- [ ] User has ad blocker → videos still work (hosted internally)
- [ ] User has slow connection → loading states shown
- [ ] User uploads large photo → warning, compression
- [ ] User uploads wrong file type → clear error
- [ ] User selects "Other" role → custom input works
- [ ] API fails → retry button, error message
- [ ] User already completed onboarding → redirects to dashboard
- [ ] User restarts onboarding → increments counter, preserves data
- [ ] Multiple browser tabs open → state synced

---

## Conclusion

This architecture document provides a complete blueprint for implementing a 100% complete, enterprise-grade Self-Service Onboarding Wizard. Every aspect has been considered:

- **User Experience**: 6 carefully designed steps guiding users from welcome to completion
- **Technical Implementation**: Robust database schema, API endpoints, and React components
- **Accessibility**: Full WCAG 2.1 AA compliance with extensive ARIA usage
- **Analytics**: Comprehensive event tracking and funnel analysis
- **Testing**: Unit, integration, E2E, accessibility, and performance tests
- **Documentation**: Complete specifications for every component and API
- **Quality Assurance**: 100% completeness checklist with 150+ items

**Estimated Development Time**: 12-16 hours
**Expected Impact**:
- 85% reduction in time-to-value
- 60% increase in feature adoption
- 40% reduction in support tickets
- 75%+ onboarding completion rate

**Next Steps**:
1. Review and approve this architecture
2. Begin implementation with Step 1: Database schema updates
3. Build API endpoints (4 hours)
4. Build frontend components (6-8 hours)
5. Implement analytics tracking (1 hour)
6. Write tests (2-3 hours)
7. QA and polish (1-2 hours)

**Commitment**: This implementation will follow the platform's commitment to NO shortcuts, 100% feature completeness, and enterprise-grade quality.
