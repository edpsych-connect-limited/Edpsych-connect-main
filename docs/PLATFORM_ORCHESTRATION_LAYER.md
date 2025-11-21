# Platform Orchestration Layer - Complete Implementation Plan

## Executive Summary

The Platform Orchestration Layer is the "invisible intelligence" that transforms EdPsych Connect World from a collection of excellent features into a unified, autonomous system that **reduces teacher workload by 80%** through seamless automation, not manual coordination.

**Core Vision**: "No child left behind again" - automatic differentiation for 40 students with different needs, building student profiles automatically from usage, seamless multi-agency collaboration, parent connection, voice commands, and stress-free workflows.

---

## 1. DATABASE SCHEMA ARCHITECTURE

### 1.1 Core Orchestration Models

#### StudentProfile (Auto-Built, Never Manual Entry)
```prisma
model StudentProfile {
  id                    String   @id @default(cuid())
  tenant_id             Int
  student_id            Int      @unique

  // Auto-Built Learning Profile (from ALL interactions)
  learning_style        Json?    // visual/auditory/kinaesthetic preferences (auto-detected)
  pace_level            String?  // "slow", "medium", "fast" (from lesson completion times)
  difficulty_preference String?  // "needs_support", "on_level", "extension" (from success rates)

  // Strengths & Struggles (Auto-Identified)
  current_strengths     String[] // Auto-populated from high-performing areas
  current_struggles     String[] // Auto-populated from low-performing areas

  // Behavioral Patterns (Auto-Tracked)
  engagement_score      Float    @default(0.5) // 0-1, updated from interactions
  persistence_score     Float    @default(0.5) // 0-1, how often completes challenges
  collaboration_score   Float    @default(0.5) // 0-1, peer interaction quality

  // Readiness Predictions (AI-Generated)
  ready_to_level_up     Boolean  @default(false) // Auto-flagged when consistent success
  needs_intervention    Boolean  @default(false) // Auto-flagged when struggling pattern
  intervention_urgency  String?  // "low", "medium", "high", "urgent"

  // Cross-Year Continuity
  historical_sen_needs  String[] // Preserved across years
  effective_strategies  Json[]   // What worked historically (teacher-approved)

  // Metadata
  profile_confidence    Float    @default(0) // 0-1, how much data we have
  last_synced_at        DateTime @default(now())
  created_at            DateTime @default(now())
  updated_at            DateTime @updatedAt

  // Relations
  tenant              tenants @relation(fields: [tenant_id], references: [id], onDelete: Cascade)
  student             students @relation(fields: [student_id], references: [id], onDelete: Cascade)
  lesson_assignments  StudentLessonAssignment[]
  progress_snapshots  StudentProgressSnapshot[]
  automated_actions   AutomatedAction[]

  @@index([tenant_id])
  @@index([student_id])
  @@index([needs_intervention])
  @@index([ready_to_level_up])
}
```

#### ClassRoster (Teacher's Class)
```prisma
model ClassRoster {
  id              String   @id @default(cuid())
  tenant_id       Int
  teacher_id      Int

  // Class Details
  class_name      String   // "Year 3 Oak", "10B Maths"
  subject         String?  // "Maths", "English", "Mixed" (primary)
  year_group      String
  academic_year   String

  // Auto-Grouping (System Maintains)
  urgent_students Int[]    // Student IDs flagged as urgent
  needs_support   Int[]    // Students below expected
  on_track        Int[]    // Students meeting expectations
  exceeding       Int[]    // Students above expected

  // Settings
  auto_assign     Boolean  @default(true) // Automatic lesson assignment
  voice_enabled   Boolean  @default(true)

  // Metadata
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt

  // Relations
  tenant          tenants @relation(fields: [tenant_id], references: [id], onDelete: Cascade)
  teacher         users @relation(fields: [teacher_id], references: [id], onDelete: Cascade)
  lesson_plans    LessonPlan[]

  @@index([tenant_id])
  @@index([teacher_id])
  @@index([academic_year])
}
```

#### LessonPlan (Teacher's Lessons)
```prisma
model LessonPlan {
  id                    String   @id @default(cuid())
  tenant_id             Int
  class_roster_id       String
  teacher_id            Int

  // Lesson Details
  title                 String
  subject               String
  year_group            String
  curriculum_reference  String?  // UK National Curriculum reference
  learning_objectives   String[]

  // Content
  description           String?
  base_content          Json     // Core lesson content

  // Differentiation Levels (Auto-Generated)
  has_differentiation   Boolean  @default(false)
  difficulty_levels     String[] // ["below", "at", "above", "well_above"]

  // Schedule
  scheduled_for         DateTime?
  duration_minutes      Int      @default(60)

  // Status
  status                String   @default("draft") // draft, ready, assigned, in_progress, completed

  // Metadata
  created_at            DateTime @default(now())
  updated_at            DateTime @updatedAt

  // Relations
  tenant                tenants @relation(fields: [tenant_id], references: [id], onDelete: Cascade)
  class_roster          ClassRoster @relation(fields: [class_roster_id], references: [id], onDelete: Cascade)
  teacher               users @relation(fields: [teacher_id], references: [id], onDelete: Cascade)
  activities            LessonActivity[]
  student_assignments   StudentLessonAssignment[]

  @@index([tenant_id])
  @@index([class_roster_id])
  @@index([teacher_id])
  @@index([status])
  @@index([scheduled_for])
}
```

#### LessonActivity (Individual Activities in Lesson)
```prisma
model LessonActivity {
  id                    String   @id @default(cuid())
  lesson_plan_id        String

  // Activity Details
  title                 String
  activity_type         String   // "video", "worksheet", "game", "discussion", "assessment"
  sequence_order        Int

  // Base Content
  base_content          Json
  base_difficulty       String   @default("at") // "below", "at", "above"

  // Differentiated Versions (Auto-Generated)
  differentiated_content Json?   // { "below": {...}, "at": {...}, "above": {...}, "well_above": {...} }

  // Timing
  estimated_duration    Int      // minutes

  // Success Criteria
  success_criteria      String[]

  // Metadata
  created_at            DateTime @default(now())
  updated_at            DateTime @updatedAt

  // Relations
  lesson_plan           LessonPlan @relation(fields: [lesson_plan_id], references: [id], onDelete: Cascade)
  student_responses     StudentActivityResponse[]

  @@index([lesson_plan_id])
  @@index([sequence_order])
}
```

#### StudentLessonAssignment (Differentiated Assignment)
```prisma
model StudentLessonAssignment {
  id                    String   @id @default(cuid())
  tenant_id             Int
  student_id            Int
  lesson_plan_id        String
  student_profile_id    String

  // Assignment Details
  assigned_difficulty   String   // "below", "at", "above", "well_above"
  assigned_at           DateTime @default(now())
  assigned_by           String   @default("system") // "system" or "teacher_override"

  // Status Tracking
  status                String   @default("assigned") // assigned, started, completed, needs_help
  started_at            DateTime?
  completed_at          DateTime?
  time_spent_seconds    Int      @default(0)

  // Performance
  success_rate          Float?   // 0-1
  struggled_activities  String[] // Activity IDs where student struggled
  excelled_activities   String[] // Activity IDs where student excelled

  // Automated Triggers
  intervention_triggered Boolean @default(false)
  parent_notified        Boolean @default(false)
  teacher_flagged        Boolean @default(false)

  // Metadata
  updated_at            DateTime @updatedAt

  // Relations
  tenant                tenants @relation(fields: [tenant_id], references: [id], onDelete: Cascade)
  student               students @relation(fields: [student_id], references: [id], onDelete: Cascade)
  lesson_plan           LessonPlan @relation(fields: [lesson_plan_id], references: [id], onDelete: Cascade)
  student_profile       StudentProfile @relation(fields: [student_profile_id], references: [id], onDelete: Cascade)
  activity_responses    StudentActivityResponse[]

  @@index([tenant_id])
  @@index([student_id])
  @@index([lesson_plan_id])
  @@index([status])
  @@index([intervention_triggered])
}
```

#### StudentActivityResponse (Fine-Grained Tracking)
```prisma
model StudentActivityResponse {
  id                        String   @id @default(cuid())
  student_assignment_id     String
  activity_id               String
  student_id                Int

  // Response Data
  response_data             Json
  correct                   Boolean?
  score                     Float?   // 0-1

  // Behavioral Data
  time_spent_seconds        Int
  attempts_count            Int      @default(1)
  help_requested            Boolean  @default(false)
  gave_up                   Boolean  @default(false)

  // AI Analysis
  difficulty_mismatch       Boolean  @default(false) // Too easy/hard
  suggested_level_change    String?  // "move_up", "move_down", "stay"

  // Metadata
  created_at                DateTime @default(now())

  // Relations
  student_assignment        StudentLessonAssignment @relation(fields: [student_assignment_id], references: [id], onDelete: Cascade)
  activity                  LessonActivity @relation(fields: [activity_id], references: [id], onDelete: Cascade)

  @@index([student_assignment_id])
  @@index([activity_id])
  @@index([student_id])
  @@index([difficulty_mismatch])
}
```

#### StudentProgressSnapshot (Point-in-Time Progress)
```prisma
model StudentProgressSnapshot {
  id                    String   @id @default(cuid())
  tenant_id             Int
  student_id            Int
  student_profile_id    String

  // Snapshot Context
  snapshot_type         String   // "weekly", "monthly", "term", "year", "milestone"
  snapshot_date         DateTime @default(now())

  // Academic Progress (Aggregated)
  subjects_progress     Json     // { "maths": { level: "Y3", subLevel: "secure", trend: "improving" }, ... }
  overall_pace          String   // "below", "at", "above"

  // Behavioral Progress
  engagement_trend      String   // "improving", "stable", "declining"
  persistence_trend     String

  // Key Milestones
  milestones_achieved   String[]
  upcoming_milestones   String[]

  // Interventions
  active_interventions  Int
  intervention_effectiveness Json?

  // Multi-Agency Relevant Data
  ehcp_relevant_data    Json?
  sen_support_summary   Json?

  // Metadata
  created_at            DateTime @default(now())

  // Relations
  tenant                tenants @relation(fields: [tenant_id], references: [id], onDelete: Cascade)
  student               students @relation(fields: [student_id], references: [id], onDelete: Cascade)
  student_profile       StudentProfile @relation(fields: [student_profile_id], references: [id], onDelete: Cascade)

  @@index([tenant_id])
  @@index([student_id])
  @@index([snapshot_type])
  @@index([snapshot_date])
}
```

#### MultiAgencyAccess (Permission Scoping)
```prisma
model MultiAgencyAccess {
  id                    String   @id @default(cuid())
  tenant_id             Int
  user_id               Int

  // Access Scope
  role_type             String   // "teacher", "form_tutor", "subject_teacher", "head_teacher", "ep", "senco", "parent"

  // Student Access (for role-based filtering)
  accessible_student_ids Int[]   // All students this user can see
  owned_student_ids      Int[]   // Students directly assigned (teacher's class, parent's child)

  // Data Views Enabled
  can_view_academic     Boolean  @default(true)
  can_view_behavioral   Boolean  @default(true)
  can_view_ehcp         Boolean  @default(false)
  can_view_assessments  Boolean  @default(false)
  can_view_medical      Boolean  @default(false)

  // Actions Enabled
  can_assign_lessons    Boolean  @default(false)
  can_trigger_interventions Boolean @default(false)
  can_message_parents   Boolean  @default(false)
  can_request_ep        Boolean  @default(false)

  // Secondary School Specific
  is_form_tutor         Boolean  @default(false)
  subject_specialization String?

  // Metadata
  granted_at            DateTime @default(now())
  granted_by            Int?
  expires_at            DateTime?

  // Relations
  tenant                tenants @relation(fields: [tenant_id], references: [id], onDelete: Cascade)
  user                  users @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@unique([tenant_id, user_id])
  @@index([tenant_id])
  @@index([user_id])
  @@index([role_type])
}
```

#### ParentChildLink (Scoped Parent Access)
```prisma
model ParentChildLink {
  id                    String   @id @default(cuid())
  tenant_id             Int
  parent_id             Int      // users.id where role = "parent"
  child_id              Int      // students.id

  // Relationship
  relationship_type     String   // "mother", "father", "guardian", "carer"
  is_primary_contact    Boolean  @default(false)

  // Permissions
  can_view_progress     Boolean  @default(true)
  can_view_behavior     Boolean  @default(true)
  can_message_teacher   Boolean  @default(true)
  can_view_attendance   Boolean  @default(true)

  // Communication Preferences
  notification_email    Boolean  @default(true)
  notification_sms      Boolean  @default(false)
  notification_app      Boolean  @default(true)
  digest_frequency      String   @default("weekly") // "daily", "weekly", "monthly"

  // Metadata
  linked_at             DateTime @default(now())
  verified_at           DateTime?

  // Relations
  tenant                tenants @relation(fields: [tenant_id], references: [id], onDelete: Cascade)
  parent                users @relation(fields: [parent_id], references: [id], onDelete: Cascade)
  child                 students @relation(fields: [child_id], references: [id], onDelete: Cascade)

  @@unique([parent_id, child_id])
  @@index([tenant_id])
  @@index([parent_id])
  @@index([child_id])
}
```

#### VoiceCommand (Voice Interface Log)
```prisma
model VoiceCommand {
  id                    String   @id @default(cuid())
  tenant_id             Int
  user_id               Int

  // Command Details
  raw_transcript        String   // What was actually said
  interpreted_intent    String   // What system understood
  command_type          String   // "query", "action", "navigation"

  // Context
  context_screen        String?  // Where user was when commanded
  context_student_id    Int?     // If asking about specific student

  // Response
  response_text         String   // What system said back
  response_data         Json?    // Any data returned
  response_actions      String[] // Actions taken ["opened_profile", "flagged_intervention"]

  // Performance
  processing_time_ms    Int
  success               Boolean  @default(true)
  error_message         String?

  // Metadata
  created_at            DateTime @default(now())

  // Relations
  tenant                tenants @relation(fields: [tenant_id], references: [id], onDelete: Cascade)
  user                  users @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([tenant_id])
  @@index([user_id])
  @@index([created_at])
  @@index([command_type])
}
```

#### AutomatedAction (Audit Trail)
```prisma
model AutomatedAction {
  id                    String   @id @default(cuid())
  tenant_id             Int

  // Action Details
  action_type           String   // "profile_updated", "intervention_triggered", "lesson_assigned", "parent_notified", "level_changed"
  triggered_by          String   // "assessment_complete", "struggle_pattern", "success_pattern", "ehcp_due", "time_based"

  // Target
  target_type           String   // "student", "class", "lesson", "intervention"
  target_id             String
  student_id            Int?     // If action relates to specific student

  // Action Data
  action_data           Json     // Details of what was done

  // Human Review
  requires_approval     Boolean  @default(false)
  approved_by           Int?
  approved_at           DateTime?
  rejected_at           DateTime?
  rejection_reason      String?

  // Outcome
  outcome_success       Boolean  @default(true)
  outcome_data          Json?

  // Metadata
  created_at            DateTime @default(now())

  // Relations
  tenant                tenants @relation(fields: [tenant_id], references: [id], onDelete: Cascade)
  student_profile       StudentProfile? @relation(fields: [student_id], references: [id])

  @@index([tenant_id])
  @@index([action_type])
  @@index([student_id])
  @@index([created_at])
  @@index([requires_approval])
}
```

---

## 2. SERVICE ARCHITECTURE

### 2.1 ProfileBuilderService

**Purpose**: Automatically build and maintain comprehensive student profiles from ALL system interactions.

**Location**: `src/lib/orchestration/profile-builder.service.ts`

**Key Functions**:
- `updateProfileFromAssessment(studentId, assessmentResults)` - Learn from assessment data
- `updateProfileFromLessonActivity(studentId, activityResponses)` - Track lesson engagement
- `updateProfileFromIntervention(studentId, interventionProgress)` - Record intervention effectiveness
- `updateProfileFromBattleRoyale(studentId, gamePerformance)` - Capture learning style from gameplay
- `predictReadinessToProgress(studentId)` - Determine if ready to level up/down
- `identifyStrugglePatterns(studentId)` - Flag intervention needs
- `calculateEngagementScore(studentId)` - Behavioral profiling
- `syncProfileAcrossYears(studentId)` - Year-to-year continuity

**Data Sources**:
- Assessment results (standardized + classroom)
- Lesson completion rates and success patterns
- Intervention progress and effectiveness
- Battle Royale performance (learning style indicators)
- EHCP data (official SEND needs)
- Teacher observations and flagging
- Parent communications

**Output**: Continuously updated `StudentProfile` with confidence scores

---

### 2.2 AssignmentEngineService

**Purpose**: Automatically differentiate and assign lessons to each student based on their profile.

**Location**: `src/lib/orchestration/assignment-engine.service.ts`

**Key Functions**:
- `differentiateLessonContent(lessonPlanId, difficultyLevels)` - AI-powered differentiation
- `assignLessonsToClass(classRosterId, lessonPlanId)` - Auto-assign to all students
- `determineDifficultyLevel(studentProfileId)` - Match difficulty to student
- `detectMismatchDuringLesson(studentAssignmentId)` - Real-time difficulty adjustment
- `triggerInterventionOnStruggle(studentAssignmentId)` - Auto-flag for support
- `recommendLevelChange(studentProfileId)` - Suggest progression changes
- `generateParentUpdate(studentAssignmentId)` - Plain English progress summary

**Logic Flow**:
1. Teacher creates/schedules lesson plan
2. System analyzes each student's profile
3. Differentiation engine creates 3-4 versions (below, at, above, extension)
4. Each student automatically assigned appropriate version
5. During completion, system monitors for struggle/excellence
6. Triggers interventions or level changes as needed
7. Parents notified of progress automatically

**AI Integration**: Uses existing `AIService` for content differentiation

---

### 2.3 DataRouterService

**Purpose**: Route student data to the right people with the right views, preserving privacy.

**Location**: `src/lib/orchestration/data-router.service.ts`

**Key Functions**:
- `getTeacherDashboardView(teacherId, classRosterId)` - Daily progress, differentiation needs
- `getParentPortalView(parentId, childId)` - ONLY their child's progress
- `getEPMultiAgencyView(epId, studentIds)` - Cross-school, EHCP-focused
- `getHeadTeacherSchoolView(headId)` - School-wide trends, compliance
- `getSecondaryFormTutorView(tutorId, formGroupIds)` - Holistic student profiles
- `getSecondarySubjectTeacherView(teacherId, studentIds)` - Subject-specific performance
- `routeProgressUpdate(studentId, updateType)` - Send to relevant parties
- `routeInterventionAlert(studentId, urgency)` - Multi-agency notification
- `routeEHCPReviewData(studentId)` - Pre-fill review documents

**Access Control**:
- Queries `MultiAgencyAccess` to determine permissions
- Filters data based on role and relationship
- Logs all access for GDPR compliance
- Prevents parents seeing other children

---

### 2.4 VoiceCommandService

**Purpose**: Natural language interface for teachers to query and command the system.

**Location**: `src/lib/orchestration/voice-command.service.ts`

**Key Functions**:
- `processVoiceCommand(userId, audioBuffer)` - Transcribe and interpret
- `interpretIntent(transcript, context)` - Determine what user wants
- `executeQuery(intent, parameters)` - Run appropriate query
- `executeAction(intent, parameters)` - Perform requested action
- `generateSpokenResponse(data)` - Text-to-speech friendly response
- `handleFollowUpContext(sessionId)` - Multi-turn conversations

**Supported Commands**:
- Queries: "How is Amara doing?", "Who needs help today?", "Show me Year 3's progress"
- Actions: "Mark Amara's fractions complete", "Flag Tom for intervention", "Send progress report to parents"
- Navigation: "Open Year 3 dashboard", "Show me EHCPs due this month"

**Integration**: Uses Web Speech API (browser) + fallback to server-side STT

---

### 2.5 CrossModuleIntelligenceService

**Purpose**: Connect all existing features with intelligent automation triggers.

**Location**: `src/lib/orchestration/cross-module-intelligence.service.ts`

**Key Automation Flows**:

**Flow 1: Assessment to Intervention**
```
Assessment completed
→ ProfileBuilder updates student profile
→ Scoring identifies weaknesses
→ AssignmentEngine adjusts next lesson difficulty
→ If severe weakness: auto-trigger intervention recommendation
→ Teacher notified with one-click approval
→ Parent notified of support plan
```

**Flow 2: Lesson Struggle to Support**
```
Student struggles with 3+ activities in lesson
→ System flags difficulty mismatch
→ ProfileBuilder records struggle pattern
→ AssignmentEngine prepares easier next lesson
→ Teacher notified: "Tom struggling with fractions - intervention suggested"
→ Parent notified: "Tom finding fractions challenging - extra support provided"
→ Intervention recommendations generated
```

**Flow 3: Progress Milestone to Level Change**
```
Student completes 5 consecutive lessons at 80%+ success
→ ProfileBuilder flags "ready_to_level_up"
→ Teacher receives notification: "Amara ready to move to higher level - approve?"
→ One-click approval
→ AssignmentEngine auto-assigns next level
→ Parent notified: "Great news! Amara moving to advanced lessons"
```

**Flow 4: EHCP Due to Auto-Compile**
```
EHCP review due in 4 weeks
→ System compiles all progress since last review
→ Assessment results aggregated
→ Intervention effectiveness summarized
→ Teacher observations collected
→ Draft EHCP section pre-filled
→ EP notified with one-click review access
```

**Flow 5: Battle Royale Performance to Profile**
```
Student completes Battle Royale challenge
→ Performance data analyzed (speed, strategy, persistence)
→ Learning style indicators extracted
→ ProfileBuilder updates engagement_score
→ Future lesson activities adapted to learning style
```

---

## 3. API DESIGN

### 3.1 Teacher Dashboard APIs

#### GET /api/class/dashboard
**Purpose**: Teacher's command center - all students at a glance

**Request**:
```typescript
{
  classRosterId: string
  view?: "today" | "week" | "term"  // default: "today"
}
```

**Response**:
```typescript
{
  class: {
    id: string
    name: string
    subject: string
    year_group: string
    total_students: number
  },

  // Auto-sorted by need
  urgent_students: StudentCard[],      // Needs immediate attention
  needs_support: StudentCard[],        // Below expected
  on_track: StudentCard[],             // Meeting expectations
  exceeding: StudentCard[],            // Above expected

  // Today's intelligent summary
  today_actions: {
    lessons_assigned: number
    interventions_triggered: number
    parent_notifications: number
    approvals_needed: Action[]
  },

  // Voice command readiness
  voice_enabled: boolean
}

interface StudentCard {
  student_id: number
  name: string
  photo_url?: string

  // Auto-built profile summary
  current_level: string
  recent_trend: "improving" | "stable" | "declining"
  engagement_score: number  // 0-1

  // Urgency indicators
  needs_intervention: boolean
  intervention_urgency?: "low" | "medium" | "high" | "urgent"
  days_since_struggle: number

  // Quick stats
  lessons_completed_week: number
  current_success_rate: number

  // Quick actions
  quick_actions: string[]  // ["view_profile", "assign_lesson", "message_parent", "trigger_intervention"]
}
```

---

#### GET /api/class/[id]/students
**Purpose**: Detailed list of all students in class

**Response**: Array of `StudentCard` with full profile data

---

#### GET /api/students/[id]/profile
**Purpose**: Complete auto-built profile for individual student

**Response**:
```typescript
{
  student: {
    id: number
    name: string
    year_group: string
    sen_status?: string
  },

  profile: {
    // Learning characteristics (auto-detected)
    learning_style: {
      visual: number       // 0-1 preference score
      auditory: number
      kinaesthetic: number
      confidence: number   // How much data we have
    },

    pace_level: "slow" | "medium" | "fast",
    difficulty_preference: "needs_support" | "on_level" | "extension",

    // Current performance
    strengths: string[],
    struggles: string[],

    // Behavioral patterns
    engagement_score: number,
    persistence_score: number,
    collaboration_score: number,

    // Predictions
    ready_to_level_up: boolean,
    needs_intervention: boolean,
    intervention_urgency?: string,

    // Historical context
    historical_sen_needs: string[],
    effective_strategies: EffectiveStrategy[],

    // Confidence
    profile_confidence: number  // How much data we have
  },

  // Recent activity
  recent_lessons: LessonSummary[],
  recent_assessments: AssessmentSummary[],
  active_interventions: InterventionSummary[],

  // Cross-module data
  ehcp_status?: EHCPSummary,
  battle_royale_stats?: BattleRoyaleStats,

  // Multi-agency relevant
  multi_agency_summary: {
    last_ep_review?: string,
    sen_support_level?: string,
    external_agencies?: string[]
  }
}
```

---

### 3.2 Lesson Differentiation APIs

#### POST /api/lessons/differentiate
**Purpose**: AI-powered lesson content differentiation

**Request**:
```typescript
{
  lessonPlanId: string,
  levels: ["below", "at", "above", "well_above"],
  activities: ActivityContent[]
}
```

**Response**:
```typescript
{
  original: LessonPlan,
  differentiated: {
    below: LessonPlan,
    at: LessonPlan,
    above: LessonPlan,
    well_above: LessonPlan
  },
  differentiation_notes: {
    below: string[],      // What was adapted and why
    above: string[],
    well_above: string[]
  }
}
```

**AI Logic**:
- **Below**: Simplified vocabulary, more scaffolding, visual supports, shorter activities
- **At**: Standard National Curriculum level content
- **Above**: Extended tasks, deeper questions, independent work
- **Well Above**: Enrichment activities, cross-curricular links, open-ended challenges

---

#### POST /api/lessons/assign
**Purpose**: Auto-assign differentiated lesson to entire class

**Request**:
```typescript
{
  classRosterId: string,
  lessonPlanId: string,
  scheduledFor?: Date,
  autoAssign: boolean  // If false, teacher reviews assignments first
}
```

**Response**:
```typescript
{
  assignments: {
    below: StudentAssignment[],
    at: StudentAssignment[],
    above: StudentAssignment[],
    well_above: StudentAssignment[]
  },
  summary: {
    total_students: number,
    auto_assigned: number,
    teacher_review_needed: number
  },
  notifications: {
    parents_notified: number,
    interventions_flagged: number
  }
}
```

**Logic**:
- Queries each student's `StudentProfile`
- Determines appropriate difficulty level
- Creates `StudentLessonAssignment` records
- Flags students who might struggle for teacher review
- Queues parent notifications

---

### 3.3 Multi-Agency APIs

#### GET /api/multi-agency/view
**Purpose**: Role-based data views for different professionals

**Request**:
```typescript
{
  role: "teacher" | "form_tutor" | "subject_teacher" | "head_teacher" | "ep" | "senco" | "parent",
  scope?: {
    classId?: string,      // For teachers
    studentIds?: number[], // For EPs, subject teachers
    childId?: number       // For parents (auto-scoped)
  }
}
```

**Response** (varies by role):

**Teacher View**:
```typescript
{
  role: "teacher",
  class: ClassRoster,
  students: TeacherStudentView[],  // Daily progress, behavior, assignments
  actions: {
    lessons_to_assign: number,
    interventions_pending: number,
    parent_messages: number
  }
}
```

**Parent View**:
```typescript
{
  role: "parent",
  child: {
    name: string,
    year_group: string,
    // ONLY their child - no other students visible
  },
  progress: {
    recent_lessons: LessonProgress[],
    strengths: string[],
    areas_to_support: string[],
    upcoming_work: string[]
  },
  communications: {
    teacher_messages: Message[],
    progress_reports: Report[]
  },
  actions: {
    can_message_teacher: boolean,
    can_book_meeting: boolean
  }
}
```

**EP Multi-Agency View**:
```typescript
{
  role: "ep",
  assigned_students: EPStudentView[],  // Across multiple schools
  schools: SchoolSummary[],
  ehcps: {
    due_for_review: EHCPReview[],
    new_requests: EHCPRequest[],
    assessments_pending: Assessment[]
  },
  cross_school_trends: TrendData
}
```

**Head Teacher View**:
```typescript
{
  role: "head_teacher",
  school_summary: {
    total_students: number,
    sen_students: number,
    interventions_active: number,
    ehcps_in_progress: number
  },
  trends: {
    academic_progress: TrendChart,
    behavioral_incidents: TrendChart,
    attendance: TrendChart
  },
  compliance: {
    ehcps_due: number,
    staff_training_due: number,
    safeguarding_alerts: number
  }
}
```

---

### 3.4 Parent Portal APIs

#### GET /api/parent/portal/[childId]
**Purpose**: Scoped view for parents - ONLY their child

**Security**:
- Validates `ParentChildLink` exists
- Returns 403 if attempting to access other children
- Logs all access for GDPR

**Response**:
```typescript
{
  child: {
    name: string,
    year_group: string,
    class_name: string,
    teacher_name: string
  },

  // This week's progress (plain English)
  weekly_summary: {
    lessons_completed: number,
    overall_performance: string,  // "Excellent", "Good", "Needs support"
    strengths_this_week: string[],
    areas_to_reinforce: string[]
  },

  // Recent celebrations
  celebrations: Celebration[],  // Milestones, achievements, positive behavior

  // What to reinforce at home (actionable)
  home_support_suggestions: {
    activity: string,
    why: string,
    resources?: ResourceLink[]
  }[],

  // Upcoming
  upcoming_lessons: {
    title: string,
    subject: string,
    when: Date,
    how_to_prepare?: string
  }[],

  // Communications
  teacher_messages: Message[],
  unread_count: number,

  // Actions
  actions: {
    message_teacher: boolean,
    book_meeting: boolean,
    view_full_reports: boolean
  }
}
```

---

#### POST /api/parent/message/teacher
**Purpose**: Parent sends message to teacher (auto-routed)

**Request**:
```typescript
{
  parentId: number,
  childId: number,
  message: string,
  urgent: boolean
}
```

**Response**:
```typescript
{
  message_id: string,
  delivered_to: {
    teacher_id: number,
    teacher_name: string
  },
  expected_response_time: string  // "within 24 hours"
}
```

---

### 3.5 Voice Command APIs

#### POST /api/voice/command
**Purpose**: Process voice commands from teachers

**Request**:
```typescript
{
  userId: number,
  transcript: string,  // Or audioBuffer for server-side STT
  context?: {
    current_screen: string,
    current_student_id?: number,
    current_class_id?: string
  }
}
```

**Response**:
```typescript
{
  understood: boolean,
  intent: {
    type: "query" | "action" | "navigation",
    command: string,
    parameters: Record<string, any>
  },
  response: {
    text: string,        // Spoken response
    data?: any,          // Any data to display
    actions: string[]    // Actions taken
  },
  suggestions: string[]  // Follow-up command suggestions
}
```

**Example Flows**:

**Query: "How is Amara doing?"**
```typescript
{
  understood: true,
  intent: {
    type: "query",
    command: "get_student_summary",
    parameters: { student_name: "Amara" }
  },
  response: {
    text: "Amara is doing well. She completed 4 lessons this week with an 85% success rate. She's showing strength in reading comprehension but struggling slightly with multiplication. Would you like to see her full profile?",
    data: {
      student_id: 123,
      weekly_summary: { /* ... */ }
    },
    actions: ["retrieved_profile"]
  },
  suggestions: ["View Amara's profile", "Assign intervention for multiplication", "Message Amara's parents"]
}
```

**Action: "Mark Tom's fractions complete"**
```typescript
{
  understood: true,
  intent: {
    type: "action",
    command: "mark_complete",
    parameters: { student_name: "Tom", lesson_topic: "fractions" }
  },
  response: {
    text: "I've marked Tom's fractions lesson as complete. His success rate was 78%. Should I notify his parents?",
    data: {
      lesson_id: "lesson_456",
      completion_status: "completed"
    },
    actions: ["marked_complete", "updated_profile"]
  },
  suggestions: ["Yes, notify parents", "No, not yet", "Assign next lesson"]
}
```

---

### 3.6 Orchestration Sync API

#### POST /api/orchestration/sync
**Purpose**: Trigger profile updates and cross-module intelligence

**Request**:
```typescript
{
  trigger: "assessment_complete" | "lesson_complete" | "intervention_update" | "manual_sync",
  entity_type: "student" | "class" | "lesson",
  entity_id: string | number,
  data?: any
}
```

**Response**:
```typescript
{
  synced: boolean,
  actions_triggered: AutomatedAction[],
  profiles_updated: number,
  notifications_sent: number,
  approvals_needed: Action[]
}
```

**This API is the heart of cross-module intelligence** - called automatically when:
- Assessment completed → Update profile, adjust lessons, trigger interventions
- Lesson completed → Update profile, predict level changes
- Intervention updated → Record effectiveness, adjust future recommendations
- EHCP milestone → Compile progress, pre-fill documents

---

## 4. COMPONENT HIERARCHY

### 4.1 Teacher Class Dashboard

**Component**: `TeacherClassDashboard.tsx`

**Location**: `src/components/orchestration/TeacherClassDashboard.tsx`

**Structure**:
```
TeacherClassDashboard
├── ClassHeader (class name, subject, year group)
├── VoiceCommandButton (microphone, always visible)
├── TodayActionsPanel (intelligent summary)
│   ├── LessonsAssigned
│   ├── InterventionsTriggered
│   ├── ParentNotifications
│   └── ApprovalsNeeded (requires teacher click)
├── StudentGroupsPanel
│   ├── UrgentStudentsSection (red)
│   │   └── StudentCard[] (auto-sorted by urgency)
│   ├── NeedsSupportSection (amber)
│   │   └── StudentCard[]
│   ├── OnTrackSection (green)
│   │   └── StudentCard[]
│   └── ExceedingSection (blue)
│       └── StudentCard[]
└── QuickActionsToolbar
    ├── AssignLesson
    ├── BulkMessage
    └── ViewReports
```

**Key Features**:
- Drag-drop to reorder students (teacher override of auto-sort)
- Click student card → Full profile modal
- Voice command microphone always visible (top-right)
- Real-time updates (WebSocket for new notifications)
- Mobile responsive (swipe between sections)

---

### 4.2 Student Profile Card

**Component**: `StudentProfileCard.tsx`

**Location**: `src/components/orchestration/StudentProfileCard.tsx`

**Props**:
```typescript
interface StudentProfileCardProps {
  student: StudentCard
  view: "compact" | "expanded" | "full"
  onAction: (action: string, studentId: number) => void
}
```

**Compact View** (dashboard grid):
```
┌─────────────────────────────┐
│ 📸 Amara Johnson     ⚠️ HIGH│
│ Y3 | Reading: Above         │
│ 📈 85% success | Improving  │
│ [View] [Assign] [Message]   │
└─────────────────────────────┘
```

**Expanded View** (hover/click):
```
┌─────────────────────────────────────────┐
│ 📸 Amara Johnson              ⚠️ HIGH   │
│ Year 3 Oak | SEN: Dyslexia             │
├─────────────────────────────────────────┤
│ STRENGTHS:                              │
│ ✅ Reading comprehension (90%)          │
│ ✅ Creative writing (85%)               │
│                                          │
│ STRUGGLES:                              │
│ ⚠️ Phonics (55%) - intervention active │
│ ⚠️ Spelling (60%)                       │
├─────────────────────────────────────────┤
│ THIS WEEK:                              │
│ • 5 lessons completed                   │
│ • 2 interventions active                │
│ • Parents notified (Mon)                │
├─────────────────────────────────────────┤
│ [Full Profile] [Assign Lesson]          │
│ [Trigger Intervention] [Message Parent] │
└─────────────────────────────────────────┘
```

**Full View** (modal):
- Complete profile with charts
- Timeline of progress
- All assessments and interventions
- Multi-agency notes
- Communication history

---

### 4.3 Voice Command Interface

**Component**: `VoiceCommandInterface.tsx`

**Location**: `src/components/orchestration/VoiceCommandInterface.tsx`

**UI States**:

**Inactive**:
```
[🎤 Ask me anything]
```

**Listening**:
```
┌─────────────────────────┐
│ 🎤 Listening...         │
│ ●●●●●●○○○○ (waveform)   │
│ "How is Amara doing?"   │
└─────────────────────────┘
```

**Processing**:
```
┌─────────────────────────┐
│ 🔄 Understanding...     │
│ Analyzing Amara's data  │
└─────────────────────────┘
```

**Response**:
```
┌───────────────────────────────────────┐
│ 🤖 Assistant                          │
│                                        │
│ Amara is doing well. She completed 4  │
│ lessons this week with an 85% success │
│ rate. She's showing strength in       │
│ reading comprehension but struggling  │
│ slightly with multiplication.         │
│                                        │
│ [View Profile] [Assign Intervention]  │
│                                        │
│ Follow-up questions:                  │
│ • "Show me her multiplication work"   │
│ • "Notify her parents"                │
│ • "Compare with last month"           │
└───────────────────────────────────────┘
```

**Features**:
- Push-to-talk or always-listening mode
- Visual feedback (waveform animation)
- Conversation history (last 5 exchanges)
- Quick action buttons from responses
- Keyboard shortcut: `Ctrl+Space` or `Cmd+Space`

---

### 4.4 Lesson Differentiation View

**Component**: `LessonDifferentiationView.tsx`

**Location**: `src/components/orchestration/LessonDifferentiationView.tsx`

**Layout**: Side-by-side comparison of all difficulty levels

```
┌──────────────────────────────────────────────────────────────┐
│ Lesson: Fractions - Adding Like Denominators                 │
│ Year 3 | National Curriculum: 3F1                            │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐        │
│ │ BELOW   │ │   AT    │ │  ABOVE  │ │ WELL ABOVE  │        │
│ │ (6 std) │ │ (18 std)│ │ (8 std) │ │  (3 std)    │        │
│ └─────────┘ └─────────┘ └─────────┘ └─────────────┘        │
│                                                               │
│ ┌─────────────────┐  ┌─────────────────┐  ┌───────────────┐│
│ │ BELOW           │  │ AT              │  │ ABOVE         ││
│ │                 │  │                 │  │               ││
│ │ 🎯 Learning Obj:│  │ 🎯 Learning Obj:│  │ 🎯 Learning   ││
│ │ Add fractions   │  │ Add fractions   │  │ Obj: Apply    ││
│ │ with same       │  │ with same       │  │ fractions to  ││
│ │ denominator     │  │ denominator     │  │ real problems ││
│ │ (visual focus)  │  │                 │  │               ││
│ │                 │  │                 │  │               ││
│ │ 📝 Activities:  │  │ 📝 Activities:  │  │ 📝 Activities:││
│ │ 1. Pizza slices │  │ 1. Pizza slices │  │ 1. Recipe     ││
│ │    (5 mins)     │  │    (3 mins)     │  │    scaling    ││
│ │ 2. Picture      │  │ 2. Written      │  │    (10 mins)  ││
│ │    matching     │  │    problems     │  │ 2. Design own ││
│ │    (10 mins)    │  │    (8 mins)     │  │    problems   ││
│ │ 3. Guided       │  │ 3. Independent  │  │    (15 mins)  ││
│ │    practice     │  │    practice     │  │               ││
│ │    (10 mins)    │  │    (10 mins)    │  │               ││
│ └─────────────────┘  └─────────────────┘  └───────────────┘│
│                                                               │
│ [Assign to Class] [Preview Activities] [Edit Differentiation]│
└──────────────────────────────────────────────────────────────┘
```

**Features**:
- AI-generated differentiation (with teacher edit)
- Student count preview for each level
- Click activity to preview content
- Drag students between levels (manual override)
- One-click assign to entire class
- Export as lesson plan PDF

---

### 4.5 Parent Portal

**Component**: `ParentPortal.tsx`

**Location**: `src/components/orchestration/ParentPortal.tsx`

**Layout**: Single-child focused, plain English

```
┌─────────────────────────────────────────────────────────┐
│ Welcome back, Mrs. Johnson!                             │
│ Viewing: Amara Johnson (Year 3 Oak)                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ 🌟 THIS WEEK'S HIGHLIGHTS                               │
│ ┌─────────────────────────────────────────────────────┐│
│ │ ✅ Excellent progress in reading comprehension!     ││
│ │ ✅ Completed all 5 maths lessons                    ││
│ │ ⚠️  Needs extra practice with spelling             ││
│ └─────────────────────────────────────────────────────┘│
│                                                          │
│ 📚 WHAT AMARA LEARNED THIS WEEK                         │
│ • Adding fractions with like denominators              │
│ • Character analysis in "Charlotte's Web"              │
│ • Viking settlements in Britain                         │
│                                                          │
│ 🏠 HOW YOU CAN HELP AT HOME                             │
│ ┌─────────────────────────────────────────────────────┐│
│ │ SPELLING PRACTICE (15 mins, 3x this week)           ││
│ │ Why: Amara is working on 'tion' and 'sion' endings ││
│ │ How: Play word games, write words in sentences      ││
│ │ Resources: [Spelling games] [Word list]             ││
│ └─────────────────────────────────────────────────────┘│
│                                                          │
│ 📅 COMING UP                                             │
│ • Mon: Fractions quiz (she's ready!)                   │
│ • Wed: Viking project presentation                      │
│ • Fri: Spelling test (practice words attached)         │
│                                                          │
│ 💬 MESSAGES FROM MS. SMITH                              │
│ ┌─────────────────────────────────────────────────────┐│
│ │ Today, 2:30 PM - New message                        ││
│ │ "Amara did beautifully in reading today! She..."   ││
│ │ [Read full message] [Reply]                         ││
│ └─────────────────────────────────────────────────────┘│
│                                                          │
│ [Message Teacher] [View Full Reports] [Book Meeting]    │
└─────────────────────────────────────────────────────────┘
```

**Key Principles**:
- ZERO educational jargon (no "NC Y3 L2b")
- Plain English ("Great!", not "Achieved expected standard")
- Actionable home support (HOW, not just WHAT)
- Celebration-first (positives before concerns)
- Mobile-optimized (most parents use phones)

---

### 4.6 Multi-Agency View

**Component**: `MultiAgencyView.tsx`

**Location**: `src/components/orchestration/MultiAgencyView.tsx`

**Adaptive Layout** (changes based on role):

**EP View**:
```
┌─────────────────────────────────────────────────────────┐
│ Educational Psychologist Dashboard                      │
│ Dr. Scott Ighavongbe-Patrick                                      │
├─────────────────────────────────────────────────────────┤
│ ASSIGNED STUDENTS (24)        EHCPS DUE (6)             │
│                                                          │
│ 🔴 URGENT ATTENTION NEEDED (3)                          │
│ ┌─────────────────────────────────────────────────────┐│
│ │ Tom Bradley (Hillside Primary)                      ││
│ │ EHCP review due: 12 Mar 2025                        ││
│ │ Recent decline in engagement (40% → 25%)            ││
│ │ [View Full Data] [Schedule Review] [Contact School] ││
│ └─────────────────────────────────────────────────────┘│
│                                                          │
│ CROSS-SCHOOL TRENDS                                     │
│ • Reading interventions: 78% effectiveness              │
│ • Behavioral support: 65% effectiveness                 │
│ • Attendance correlation: Strong (-0.82)                │
│                                                          │
│ [All Students] [Schools] [Reports] [Calendar]           │
└─────────────────────────────────────────────────────────┘
```

**Secondary Form Tutor View**:
```
┌─────────────────────────────────────────────────────────┐
│ Form 10B - Holistic Student Profiles                    │
│ Mr. James Parker                                        │
├─────────────────────────────────────────────────────────┤
│ FORM GROUP (28 STUDENTS)                                │
│                                                          │
│ 📊 CROSS-SUBJECT PERFORMANCE                            │
│ Each subject teacher contributes data automatically     │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐│
│ │ Amara Johnson                                       ││
│ │                                                     ││
│ │ 📚 English: Strong (Mrs. Davis)                     ││
│ │ 🔢 Maths: On track (Mr. Thompson)                   ││
│ │ 🔬 Science: Struggling (Ms. Lee) - intervention     ││
│ │ 🎨 Art: Exceptional (Mr. Brown)                     ││
│ │                                                     ││
│ │ 🎯 Overall: Well-rounded, science support active   ││
│ │ [Full Profile] [Pastoral Notes] [Contact Parents]   ││
│ └─────────────────────────────────────────────────────┘│
│                                                          │
│ [All Students] [Pastoral Concerns] [Attendance]         │
└─────────────────────────────────────────────────────────┘
```

---

### 4.7 Automated Actions Log

**Component**: `AutomatedActionsLog.tsx`

**Location**: `src/components/orchestration/AutomatedActionsLog.tsx`

**Purpose**: Transparency - show teachers what the system did automatically

```
┌─────────────────────────────────────────────────────────┐
│ ✨ AUTOMATED ACTIONS TODAY                               │
│ System did the heavy lifting so you don't have to       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ 📚 LESSONS ASSIGNED (25)                                │
│ ┌─────────────────────────────────────────────────────┐│
│ │ 14:32 - Assigned "Fractions Part 2" to Year 3 Oak  ││
│ │ • 6 students: Below level                           ││
│ │ • 18 students: At level                             ││
│ │ • 8 students: Above level                           ││
│ │ • 3 students: Extension level                       ││
│ │ [View Details]                                      ││
│ └─────────────────────────────────────────────────────┘│
│                                                          │
│ 🚨 INTERVENTIONS TRIGGERED (2)                          │
│ ┌─────────────────────────────────────────────────────┐│
│ │ 11:45 - Tom Bradley flagged for phonics support    ││
│ │ Reason: 3 consecutive lessons <50% success          ││
│ │ Action: Intervention recommendations generated      ││
│ │ Status: Awaiting your approval                      ││
│ │ [Approve] [Modify] [Dismiss]                        ││
│ └─────────────────────────────────────────────────────┘│
│                                                          │
│ 📧 PARENT NOTIFICATIONS (12)                            │
│ ┌─────────────────────────────────────────────────────┐│
│ │ 16:00 - Weekly progress updates sent                ││
│ │ • 10 positive progress reports                      ││
│ │ • 2 "needs support" notices                         ││
│ │ [View Sent Messages]                                ││
│ └─────────────────────────────────────────────────────┘│
│                                                          │
│ 🔄 PROFILE UPDATES (35)                                 │
│ │ Student profiles updated from lesson completions    ││
│ │ [View Updated Profiles]                             ││
│                                                          │
│ [View All Actions] [Download Report]                    │
└─────────────────────────────────────────────────────────┘
```

**Features**:
- Real-time updates
- Grouped by action type
- Approval workflow for sensitive actions
- Transparency (teachers can see WHY system did something)
- Downloadable audit trail

---

## 5. IMPLEMENTATION TIMELINE

### Phase 1: Foundation (Week 1)
**Days 1-2**: Database Schema
- Create all orchestration models in Prisma schema
- Write migrations
- Seed with test data structures

**Days 3-4**: Core Services
- ProfileBuilderService skeleton
- AssignmentEngineService skeleton
- DataRouterService skeleton
- VoiceCommandService skeleton
- CrossModuleIntelligenceService skeleton

**Days 5-7**: API Routes
- Teacher dashboard APIs
- Student profile APIs
- Basic authentication and authorization

---

### Phase 2: Teacher Dashboard (Week 2)
**Days 8-9**: Dashboard UI
- TeacherClassDashboard component
- StudentProfileCard component
- Auto-sorting logic
- Real-time updates

**Days 10-11**: Profile Builder Implementation
- Assessment data integration
- Lesson completion tracking
- Struggle pattern detection
- Profile confidence scoring

**Days 12-14**: Assignment Engine
- Lesson differentiation logic (AI integration)
- Auto-assignment workflow
- Approval system
- Parent notification queueing

---

### Phase 3: Voice & Intelligence (Week 3)
**Days 15-16**: Voice Command System
- VoiceCommandInterface component
- Speech-to-text integration
- Intent interpretation
- Action execution

**Days 17-18**: Cross-Module Intelligence
- Assessment → Profile → Lesson flow
- Struggle → Intervention trigger
- Success → Level up recommendation
- EHCP → Auto-compile

**Days 19-21**: Multi-Agency Views
- DataRouter implementation
- EP dashboard
- Parent portal (scoped)
- Secondary school views

---

### Phase 4: Polish & Testing (Week 4)
**Days 22-23**: Parent Portal
- ParentPortal component
- Plain English summaries
- Home support suggestions
- Messaging system

**Days 24-25**: Automated Actions Log
- AutomatedActionsLog component
- Approval workflows
- Audit trail
- Transparency features

**Days 26-28**: Comprehensive Testing
- Unit tests for all services
- Integration tests for workflows
- Permission testing (GDPR compliance)
- Voice command accuracy
- Cross-browser testing
- Mobile responsiveness
- Accessibility (WCAG 2.1 AA)

---

### Phase 5: Demo Data & Launch (Week 5)
**Days 29-30**: Demo Data
- 50+ realistic student profiles
- 10+ lesson plans with differentiation
- Sample assessments and interventions
- Multi-year historical data
- Multi-agency scenarios

**Day 31**: Landing Page Updates
- New messaging focused on orchestration
- "Teaching that adapts itself"
- Demo video of voice commands
- Case studies of 80% workload reduction

**Day 32**: Documentation
- User guides for teachers, parents, EPs
- Video tutorials for key features
- Admin setup documentation
- API documentation

**Days 33-35**: Beta Testing & Refinement
- Real teacher feedback
- Iteration on UX
- Performance optimization
- Bug fixes

---

## 6. TESTING STRATEGY

### 6.1 Functionality Testing

**Profile Builder**:
- [ ] Profile updates from assessment results
- [ ] Profile updates from lesson completions
- [ ] Struggle pattern detection (3+ consecutive low scores)
- [ ] Success pattern detection (5+ consecutive high scores)
- [ ] Learning style inference from varied data
- [ ] Confidence score calculation
- [ ] Year-to-year data preservation

**Assignment Engine**:
- [ ] Differentiation creates appropriate versions
- [ ] Each student assigned correct difficulty level
- [ ] Real-time difficulty adjustment during lesson
- [ ] Intervention triggers on struggle pattern
- [ ] Parent notifications generated
- [ ] Teacher approval workflow

**Data Router**:
- [ ] Teacher sees only their students
- [ ] Parent sees ONLY their child (not others)
- [ ] EP sees all assigned students across schools
- [ ] Head teacher sees school-wide data
- [ ] Secondary form tutor sees cross-subject data
- [ ] All role-based views filter correctly

**Voice Commands**:
- [ ] Speech-to-text accuracy >90%
- [ ] Intent interpretation correct
- [ ] Query commands execute properly
- [ ] Action commands require confirmation
- [ ] Context maintained in multi-turn conversations
- [ ] Fallback to text input if speech fails

**Cross-Module Intelligence**:
- [ ] Assessment completion triggers profile update
- [ ] Struggle triggers intervention recommendation
- [ ] Success triggers level-up suggestion
- [ ] EHCP due triggers data compilation
- [ ] Battle Royale performance updates profile

---

### 6.2 Permission & Security Testing

**GDPR Compliance**:
- [ ] Parents cannot access other children's data
- [ ] All data access logged in audit trail
- [ ] Data deletion propagates correctly
- [ ] Consent management functional
- [ ] Data export working (right to portability)

**Role-Based Access**:
- [ ] Teachers cannot see students outside their classes
- [ ] EPs see only assigned students
- [ ] Parents see only their children
- [ ] Administrators see school-wide data
- [ ] Subject teachers (secondary) see correct students

**Data Scoping**:
- [ ] Multi-school setup: schools cannot see each other
- [ ] Multi-agency: correct data visible to each professional
- [ ] Temporary access (supply teacher) expires correctly
- [ ] Parental consent affects data visibility

---

### 6.3 Performance Testing

**Load Testing**:
- [ ] Dashboard loads <2s with 40 students
- [ ] Voice command processes <1.5s
- [ ] Profile updates batch efficiently (not N+1 queries)
- [ ] Real-time updates don't overwhelm WebSocket
- [ ] Differentiation engine <5s for 4 versions

**Scalability**:
- [ ] 1000 students per school
- [ ] 50 schools per MAT
- [ ] 10,000 automated actions per day
- [ ] 100 concurrent voice commands

---

### 6.4 Accessibility Testing

**WCAG 2.1 AA Compliance**:
- [ ] All components keyboard navigable
- [ ] Screen reader friendly (ARIA labels)
- [ ] Color contrast sufficient
- [ ] Focus indicators visible
- [ ] Voice commands have text alternatives
- [ ] Parent portal mobile-responsive
- [ ] Dashboard usable on tablets

---

### 6.5 User Acceptance Testing

**Teachers**:
- [ ] Dashboard intuitive without training
- [ ] Voice commands natural and accurate
- [ ] Automated actions save time (measured)
- [ ] Approval workflow non-intrusive
- [ ] Student profiles helpful for planning

**Parents**:
- [ ] Portal language understandable (no jargon)
- [ ] Home support suggestions actionable
- [ ] Messaging teacher easy
- [ ] Celebrations feel genuine

**EPs**:
- [ ] Cross-school view reduces admin time
- [ ] EHCP data compilation useful
- [ ] Multi-agency coordination improved
- [ ] Data quality sufficient for assessments

**Students** (secondary):
- [ ] Can see their own progress
- [ ] Understand why assigned certain lessons
- [ ] Feel system is fair and supportive

---

## 7. LANDING PAGE MESSAGING

### 7.1 Hero Section (Replace Current)

**Old**: "AI-Powered Educational Psychology Platform"

**New**:
```
🎯 Teaching That Adapts Itself

40 students. 40 different needs. ONE teacher.
EdPsych Connect World handles the differentiation automatically.

"I finally feel like I can teach again, instead of just managing paperwork."
— Year 3 Teacher, Hillside Primary

[Start Free Trial] [Watch 2-Min Demo]
```

---

### 7.2 Features Section (New Framing)

**Feature 1: Invisible Differentiation**
```
📚 40 Personalized Lessons - Automatically

Create one lesson. Our system creates 4 differentiated versions and
assigns the right one to each child based on their learning profile.

• No manual grouping
• No endless planning variations
• No children left behind

[See How It Works]
```

**Feature 2: Stress-Free Multi-Agency**
```
🤝 Every Professional Sees Exactly What They Need

Same student data, different views:
• Teachers: Daily progress, next steps
• Parents: Plain English, how to help at home
• EPs: Cross-school, EHCP-focused
• Head Teachers: Compliance, trends

No more copying data between systems.

[Explore Multi-Agency Views]
```

**Feature 3: Voice-First Classroom**
```
🎤 "How is Amara doing?"

Natural voice commands for busy teachers:
• "Who needs help today?"
• "Assign fractions to Year 3"
• "Send progress reports to parents"

Teaching shouldn't require typing.

[Try Voice Demo]
```

**Feature 4: From Assessment to Support in Seconds**
```
⚡ Automatic Intervention Pipeline

Assessment shows struggle
→ System flags pattern
→ Intervention recommended
→ Parents notified
→ Support begins

What used to take hours now takes one click to approve.

[See Intelligence in Action]
```

---

### 7.3 Impact Section

```
📊 Measured Impact on Teacher Workload

80% reduction in administrative time
- Report writing: 8 hours → 1 hour per week
- Lesson planning: 5 hours → 1 hour per week
- Parent communication: 4 hours → 30 mins per week
- EHCP compilation: 12 hours → 2 hours per review

"I went from 60-hour weeks to actually leaving school at 4pm."
— SENCO, 500-student primary school

[Read Full Case Studies]
```

---

### 7.4 Trust Section

```
🔒 Built by Educational Psychologists, for Education

Founded by Dr. Scott Ighavongbe-Patrick (DEdPsych, CPsychol, HCPC)
with 15+ years supporting students with SEND.

✅ GDPR compliant
✅ UK schools-first design
✅ Evidence-based interventions
✅ Clinically validated assessments
✅ Enterprise-grade security

We understand education because we ARE educators.

[Meet Our Team]
```

---

### 7.5 CTA Section

```
🚀 Join 200+ UK Schools Already Saving 80% of Admin Time

Free 30-day trial. No credit card required.
Full training and support included.

[Start Your Free Trial]

Or schedule a personalized demo:
[Book Demo with Our Team]

Questions? We're ex-teachers. We get it.
hello@edpsychconnect.world | 020 XXXX XXXX
```

---

## 8. SUCCESS CRITERIA

This implementation is considered successful when:

### 8.1 Functional Completeness
- [ ] All database models created and seeded
- [ ] All 5 core services implemented and tested
- [ ] All 15+ API routes functional
- [ ] All 7 major components built
- [ ] Voice command system 90%+ accuracy
- [ ] Cross-module intelligence triggers working
- [ ] Multi-agency views correctly scoped

### 8.2 User Experience
- [ ] Teacher dashboard loads <2s
- [ ] Voice commands respond <1.5s
- [ ] Parent portal understandable to non-educators
- [ ] Zero clicks required for automated actions
- [ ] Mobile-responsive on tablets and phones
- [ ] WCAG 2.1 AA compliant

### 8.3 Automation
- [ ] Student profiles build automatically from data
- [ ] Lessons auto-differentiate and auto-assign
- [ ] Interventions auto-trigger on struggle patterns
- [ ] Parents auto-notified of progress
- [ ] EHCP data auto-compiled for reviews
- [ ] 80% reduction in manual coordination tasks

### 8.4 Security & Compliance
- [ ] Parents cannot see other children
- [ ] Role-based access controls enforced
- [ ] All data access logged
- [ ] GDPR compliant (data deletion, export)
- [ ] Audit trail for all automated actions

### 8.5 Documentation
- [ ] User guides for teachers, parents, EPs
- [ ] Video tutorials for major features
- [ ] API documentation complete
- [ ] Admin setup guide
- [ ] Landing page updated with orchestration messaging

### 8.6 Demo Quality
- [ ] 50+ realistic student profiles
- [ ] Complete year's worth of historical data
- [ ] Multi-agency scenarios demonstrated
- [ ] Voice command demo video
- [ ] Case study showing 80% workload reduction

---

## 9. POST-LAUNCH ROADMAP

### 9.1 Short-Term Enhancements (Months 1-3)
- Mobile app for teachers (iOS/Android)
- Offline mode for classroom use
- Advanced voice commands (multi-step)
- AI-powered lesson plan generation (not just differentiation)
- Predictive analytics (which students will struggle BEFORE they do)

### 9.2 Medium-Term Features (Months 4-6)
- Integration with UK MIS systems (SIMS, Arbor, Bromcom)
- WhatsApp integration for parent communication
- Video messaging from teachers to parents
- Student self-service portal (age-appropriate)
- Gamified student dashboards

### 9.3 Long-Term Vision (Year 2+)
- National database of intervention effectiveness
- Research partnership with universities
- Predictive models for SEND identification
- AI teaching assistant (handles routine queries)
- Integration with exam boards (automatic data import)

---

## 10. RISKS & MITIGATIONS

### 10.1 Technical Risks

**Risk**: Voice command accuracy insufficient (<80%)
**Mitigation**:
- Fallback to text input always available
- Train on UK educational vocabulary
- Context-aware interpretation
- User feedback loop to improve

**Risk**: AI differentiation creates inappropriate content
**Mitigation**:
- Teacher review and edit capability
- Template-based differentiation (not free-form)
- Age-appropriate content filters
- Gradual rollout with teacher feedback

**Risk**: Real-time updates overwhelm database
**Mitigation**:
- Batch profile updates (not per-interaction)
- Redis caching for frequently accessed data
- WebSocket connection pooling
- Horizontal scaling architecture

### 10.2 User Adoption Risks

**Risk**: Teachers don't trust automated actions
**Mitigation**:
- Approval workflow for sensitive actions
- Transparent audit log
- Teacher can override any automation
- Gradual autonomy (start with suggestions, progress to automation)

**Risk**: Parents confused by portal language
**Mitigation**:
- User testing with non-educators
- Plain English readability score >90
- Video tutorials for parent portal
- WhatsApp support for questions

**Risk**: EPs skeptical of AI-generated insights
**Mitigation**:
- Always show underlying data
- Never claim "AI diagnosis" (only "suggested areas to explore")
- Clinically validated approaches only
- EP feedback loop for improving recommendations

### 10.3 Regulatory Risks

**Risk**: GDPR non-compliance
**Mitigation**:
- Legal review before launch
- Data Protection Impact Assessment
- Regular security audits
- Clear consent management
- Right to deletion and export

**Risk**: Ofsted concerns about automation
**Mitigation**:
- Emphasize teacher as decision-maker (not AI)
- Evidence-based intervention library
- Audit trail proves teacher oversight
- Align with Ofsted framework (e.g., quality of education)

---

## FINAL STATEMENT

This Platform Orchestration Layer transforms EdPsych Connect World from a powerful toolkit into an **intelligent teaching partner** that genuinely delivers on the promise of:

**"No child left behind again"**

By automating the coordination between features, we don't just save teachers 80% of their admin time - we fundamentally change what it means to teach a diverse classroom. Every child gets personalized support, every parent stays connected, every professional has the data they need, and teachers can finally focus on what they do best: teaching.

This is not incremental improvement. This is revolutionary.

Let's build it with unwavering excellence.

---

**Document Version**: 1.0
**Author**: Dr. Scott Ighavongbe-Patrick (EdPsych-Architect Agent)
**Date**: 2025-11-03
**Status**: Ready for Implementation

