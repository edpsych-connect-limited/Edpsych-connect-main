# End-to-End Testing Guide - Platform Orchestration Layer

**Purpose**: Comprehensive testing strategy for validating all orchestration layer features
**Status**: Ready to execute (after schema integration and seed data)
**Test Coverage**: 100% of orchestration features across 4 user roles
**Estimated Testing Time**: 3-4 hours for complete suite

---

## 📋 Table of Contents

1. [Testing Strategy Overview](#testing-strategy-overview)
2. [Prerequisites](#prerequisites)
3. [Phase 1: API Endpoint Testing](#phase-1-api-endpoint-testing)
4. [Phase 2: Component Integration Testing](#phase-2-component-integration-testing)
5. [Phase 3: Complete Workflow Testing](#phase-3-complete-workflow-testing)
6. [Phase 4: Performance Testing](#phase-4-performance-testing)
7. [Phase 5: Security Testing](#phase-5-security-testing)
8. [Phase 6: Data Integrity Testing](#phase-6-data-integrity-testing)
9. [Test Automation Scripts](#test-automation-scripts)
10. [Expected Results & Benchmarks](#expected-results--benchmarks)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 Testing Strategy Overview

### What We're Testing:
- ✅ **13 API Routes** - All orchestration endpoints
- ✅ **7 UI Components** - Complete component suite
- ✅ **4 User Roles** - Teacher, Student, Parent, EP
- ✅ **5 Core Services** - Profile builder, assignment engine, data router, voice command, cross-module intelligence
- ✅ **Security** - Multi-tenant isolation, parent portal access, role-based permissions
- ✅ **Performance** - 40 students per class, response times, cache effectiveness
- ✅ **Data Integrity** - Relational consistency, cascading updates, audit trails

### Testing Approach:
1. **Bottom-Up**: Start with API endpoints (foundation)
2. **Integration**: Test components consuming APIs
3. **Workflows**: Test complete user journeys
4. **Performance**: Load testing with realistic data
5. **Security**: Penetration testing and access control
6. **Regression**: Verify existing features still work

---

## ✅ Prerequisites

### 1. Database Setup
```bash
# Verify schema integration completed
npx prisma db pull

# Check for orchestration tables
npx prisma studio
# Should see: StudentProfile, ClassRoster, LessonPlan, etc.
```

### 2. Seed Data Generated
```bash
# Run seed script
npx tsx prisma/seed-orchestration.ts

# Verify data created (should see ~500 records)
npx prisma studio
```

### 3. Environment Variables
```bash
# .env.local should have:
DATABASE_URL="postgresql://..."
OPENAI_API_KEY="sk-..." # For voice command testing
NODE_ENV="development"
```

### 4. Development Server Running
```bash
# Start dev server
npm run dev

# Verify running at http://localhost:3000
curl http://localhost:3000/api/health
```

### 5. Testing Tools Installed
```bash
# Install testing dependencies (if not already)
npm install --save-dev @testing-library/react @testing-library/jest-dom jest
npm install --save-dev supertest # For API testing
```

---

## 🔧 Phase 1: API Endpoint Testing

### Test 1.1: Student Profile API

**Endpoint**: `GET /api/students/[id]/profile`

**Test Cases**:

```bash
# Test 1.1.1: Fetch existing student profile
curl http://localhost:3000/api/students/1/profile

# Expected Response:
{
  "id": "...",
  "tenant_id": 1,
  "student_id": 1,
  "learning_style": {
    "visual": 0.6,
    "auditory": 0.3,
    "kinaesthetic": 0.1
  },
  "pace_level": "medium",
  "difficulty_preference": "on_level",
  "current_strengths": ["reading", "comprehension"],
  "current_struggles": ["mathematics", "concentration"],
  "engagement_score": 0.75,
  "persistence_score": 0.8,
  "collaboration_score": 0.7,
  "ready_to_level_up": false,
  "needs_intervention": false,
  "profile_confidence": 0.85,
  "last_synced_at": "2025-11-03T..."
}

# ✅ PASS if: 200 status, all fields present, scores between 0-1

# Test 1.1.2: Fetch non-existent student
curl http://localhost:3000/api/students/99999/profile

# Expected Response:
{
  "error": "Student not found"
}

# ✅ PASS if: 404 status

# Test 1.1.3: Fetch without authentication (if auth enabled)
curl http://localhost:3000/api/students/1/profile

# ✅ PASS if: 401 status (session required)
```

**Validation Checklist**:
- [ ] Returns 200 for existing student
- [ ] Returns 404 for non-existent student
- [ ] All profile fields present and typed correctly
- [ ] Scores are within valid ranges (0-1)
- [ ] Learning style percentages sum to ~1.0
- [ ] Strengths and struggles are non-empty arrays
- [ ] Timestamps are valid ISO 8601 format

---

### Test 1.2: Class Dashboard API

**Endpoint**: `GET /api/class/dashboard?classId=[id]`

**Test Cases**:

```bash
# Test 1.2.1: Fetch class dashboard for Year 3 Oak
curl "http://localhost:3000/api/class/dashboard?classId=1"

# Expected Response:
{
  "students": [
    {
      "id": 1,
      "first_name": "Amara",
      "last_name": "Smith",
      "year_group": "Year 3",
      "profile": { /* StudentProfile */ },
      "urgency_score": 0.3,
      "recent_performance": {
        "success_rate": 0.85,
        "lessons_completed": 5,
        "needs_attention": false
      }
    },
    // ... 27 more students
  ],
  "actionsToday": {
    "lessonsAssigned": 3,
    "interventions": 2,
    "parentNotifications": 1
  },
  "pendingActions": [
    {
      "id": "action_123",
      "type": "intervention_triggered",
      "student_name": "Oliver Johnson",
      "requires_approval": true
    }
  ]
}

# ✅ PASS if: 200 status, 28 students returned, all with profiles

# Test 1.2.2: Fetch with invalid class ID
curl "http://localhost:3000/api/class/dashboard?classId=invalid"

# ✅ PASS if: 400 or 404 status
```

**Validation Checklist**:
- [ ] Returns correct number of students (28 for Year 3 Oak)
- [ ] Each student has a profile attached
- [ ] Urgency scores calculated correctly (0-1 range)
- [ ] Recent performance data includes all fields
- [ ] Actions today counts are accurate
- [ ] Pending actions include approval flags

---

### Test 1.3: Lesson Differentiation API

**Endpoint**: `POST /api/lessons/differentiate`

**Test Cases**:

```bash
# Test 1.3.1: Differentiate lesson for entire class
curl -X POST http://localhost:3000/api/lessons/differentiate \
  -H "Content-Type: application/json" \
  -d '{
    "lessonPlan": {
      "id": "lesson_1",
      "title": "Fractions - Halves and Quarters",
      "subject": "Mathematics",
      "year_group": "Year 3"
    },
    "classId": "1"
  }'

# Expected Response:
{
  "lessonPlanId": "lesson_1",
  "versions": [
    {
      "studentId": 1,
      "studentName": "Amara Smith",
      "difficulty": "on_level",
      "content": { /* Adapted lesson content */ },
      "scaffolding": [
        "Visual fraction diagrams provided",
        "Step-by-step worked examples"
      ],
      "extensions": null
    },
    {
      "studentId": 2,
      "studentName": "Oliver Johnson",
      "difficulty": "extension",
      "content": { /* Adapted lesson content */ },
      "scaffolding": null,
      "extensions": [
        "Challenge: Compare fractions with different denominators",
        "Real-world problem solving tasks"
      ]
    },
    // ... 26 more versions
  ]
}

# ✅ PASS if: 200 status, 28 versions created, varied difficulty levels

# Test 1.3.2: Differentiate with missing required fields
curl -X POST http://localhost:3000/api/lessons/differentiate \
  -H "Content-Type: application/json" \
  -d '{"lessonPlan": {}}'

# ✅ PASS if: 400 status, validation error message
```

**Validation Checklist**:
- [ ] Creates differentiated version for each student
- [ ] Difficulty levels vary based on student profiles
- [ ] Scaffolding provided for struggling students
- [ ] Extensions provided for advanced students
- [ ] Content adapted appropriately per level
- [ ] Response time < 3 seconds for 28 students

---

### Test 1.4: Lesson Assignment API

**Endpoint**: `POST /api/lessons/assign`

**Test Cases**:

```bash
# Test 1.4.1: Assign differentiated lesson to class
curl -X POST http://localhost:3000/api/lessons/assign \
  -H "Content-Type: application/json" \
  -d '{
    "lessonPlanId": "lesson_1",
    "classId": "1",
    "assignments": [
      {
        "studentId": 1,
        "difficulty": "on_level",
        "due_date": "2025-11-10T00:00:00Z"
      },
      {
        "studentId": 2,
        "difficulty": "extension",
        "due_date": "2025-11-10T00:00:00Z"
      }
    ]
  }'

# Expected Response:
{
  "success": true,
  "assignmentsCreated": 28,
  "message": "Lesson assigned to 28 students"
}

# ✅ PASS if: 200 status, assignments created in database

# Verify assignments created:
npx prisma studio
# Check StudentLessonAssignment table for new records
```

**Validation Checklist**:
- [ ] All assignments created successfully
- [ ] Each assignment linked to correct student and lesson
- [ ] Difficulty levels preserved from differentiation
- [ ] Due dates set correctly
- [ ] Status initialized to "assigned"
- [ ] Tenant ID scoping applied

---

### Test 1.5: Voice Command API

**Endpoint**: `POST /api/voice/command`

**Test Cases**:

```bash
# Test 1.5.1: Student progress query
curl -X POST http://localhost:3000/api/voice/command \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How is Amara doing?",
    "classId": "1",
    "contextType": "dashboard"
  }'

# Expected Response:
{
  "success": true,
  "intent": "student_progress_query",
  "content": "Amara is performing well overall. She has completed 5 out of 5 assigned lessons with an 85% success rate. Her strengths are in reading and comprehension, but she could use extra support in mathematics. Her engagement score is 0.75, showing good participation.",
  "actions": [
    "Retrieved profile for Amara Smith (ID: 1)",
    "Analyzed recent performance data"
  ],
  "data": {
    "student": { /* Student data */ },
    "profile": { /* Profile data */ },
    "recentPerformance": { /* Performance data */ }
  }
}

# ✅ PASS if: 200 status, natural language response, correct data retrieved

# Test 1.5.2: Class analytics query
curl -X POST http://localhost:3000/api/voice/command \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Who needs extra support in maths?",
    "classId": "1"
  }'

# Expected Response:
{
  "success": true,
  "intent": "identify_struggling_students",
  "content": "Based on recent performance, 4 students need extra support in mathematics: Oliver Johnson (success rate: 45%), Lily Patel (55%), Emily Davis (50%), and Sophie Wilson (48%).",
  "actions": [
    "Analyzed class performance data",
    "Filtered by subject: mathematics",
    "Identified students with success rate < 60%"
  ],
  "data": {
    "strugglingStudents": [
      {"id": 2, "name": "Oliver Johnson", "successRate": 0.45},
      {"id": 3, "name": "Lily Patel", "successRate": 0.55},
      // ...
    ]
  }
}

# ✅ PASS if: Identifies correct students, accurate success rates

# Test 1.5.3: Action trigger command
curl -X POST http://localhost:3000/api/voice/command \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Flag Oliver for intervention",
    "classId": "1"
  }'

# Expected Response:
{
  "success": true,
  "intent": "trigger_intervention",
  "content": "I've flagged Oliver Johnson for intervention. An automated action has been created and is pending your approval in the Actions Log.",
  "actions": [
    "Created intervention flag for student ID: 2",
    "Triggered automated action: intervention_triggered",
    "Set urgency level: medium"
  ],
  "data": {
    "actionId": "action_456",
    "requiresApproval": true
  }
}

# ✅ PASS if: Action created, requires approval flag set
```

**Validation Checklist**:
- [ ] Natural language queries understood correctly
- [ ] Intent classification accurate
- [ ] Responses in plain English (non-technical)
- [ ] Data retrieval correct and complete
- [ ] Actions logged in audit trail
- [ ] Response time < 2 seconds

---

### Test 1.6: Parent Portal API

**Endpoint**: `GET /api/parent/portal/[childId]`

**Test Cases**:

```bash
# Test 1.6.1: Fetch parent portal data (authorized)
# Note: Requires parent session cookie for student ID 1
curl http://localhost:3000/api/parent/portal/1 \
  -H "Cookie: session=parent_session_token"

# Expected Response:
{
  "child": {
    "id": 1,
    "first_name": "Amara",
    "last_name": "Smith",
    "year_group": "Year 3"
  },
  "wins": [
    "Completed all 5 lessons this week!",
    "Improved reading comprehension score by 15%",
    "Earned 'Collaboration Champion' badge"
  ],
  "workingOn": [
    "Building confidence with fractions",
    "Practicing multiplication tables",
    "Developing focus during independent work"
  ],
  "homeSupport": [
    "Practice counting in halves and quarters during cooking or sharing snacks",
    "Read together for 10 minutes each evening",
    "Encourage breaking tasks into smaller steps"
  ],
  "recentProgress": [
    {
      "subject": "Mathematics",
      "level": "Secure",
      "trend": "improving"
    },
    {
      "subject": "English",
      "level": "Exceeding",
      "trend": "stable"
    },
    {
      "subject": "Science",
      "level": "Developing",
      "trend": "improving"
    }
  ]
}

# ✅ PASS if: 200 status, all fields in plain English, celebration-framed

# Test 1.6.2: Fetch another child's data (unauthorized)
curl http://localhost:3000/api/parent/portal/2 \
  -H "Cookie: session=parent_session_token" # Parent of student 1

# Expected Response:
{
  "error": "Access denied. You can only view your own child's progress."
}

# ✅ PASS if: 403 status, security enforced

# Test 1.6.3: Fetch without authentication
curl http://localhost:3000/api/parent/portal/1

# ✅ PASS if: 401 status
```

**Validation Checklist**:
- [ ] Parent can only see their own child's data
- [ ] Triple security verification enforced
- [ ] All content in plain English (no jargon)
- [ ] Wins celebration-framed (positive tone)
- [ ] Home support actionable and practical
- [ ] Progress trends accurate

---

### Test 1.7: Multi-Agency View API

**Endpoint**: `GET /api/multi-agency/view?userId=[id]`

**Test Cases**:

```bash
# Test 1.7.1: Teacher view (limited access)
curl "http://localhost:3000/api/multi-agency/view?userId=1" \
  -H "Cookie: session=teacher_session_token"

# Expected Response:
{
  "userId": 1,
  "roleType": "teacher",
  "students": [
    /* 28 students from their class only */
  ],
  "summary": {
    "total_students": 28,
    "needing_support": 4,
    "exceeding": 6
  }
}

# ✅ PASS if: Only sees their own class (28 students)

# Test 1.7.2: EP view (full access)
curl "http://localhost:3000/api/multi-agency/view?userId=2" \
  -H "Cookie: session=ep_session_token"

# Expected Response:
{
  "userId": 2,
  "roleType": "educational_psychologist",
  "students": [
    /* All 50 students across school */
  ],
  "caseload": [
    /* 10 students in active caseload */
  ],
  "summary": {
    "total_students": 50,
    "needing_support": 15,
    "exceeding": 10
  }
}

# ✅ PASS if: Sees all 50 students, 10 in caseload
```

**Validation Checklist**:
- [ ] Teacher sees only their class
- [ ] EP sees all students across school
- [ ] Caseload correctly filtered for EP
- [ ] Summary statistics accurate
- [ ] Access permissions enforced by role

---

### Test 1.8: EP Dashboard API

**Endpoint**: `GET /api/multi-agency/ep-dashboard?epId=[id]`

**Test Cases**:

```bash
# Test 1.8.1: Fetch EP dashboard
curl "http://localhost:3000/api/multi-agency/ep-dashboard?epId=2"

# Expected Response:
{
  "caseload": [
    {
      "student": { /* Student data */ },
      "profile": { /* Profile data */ },
      "ehcp_status": "active",
      "next_review_date": "2025-12-01",
      "recent_interventions": [
        {
          "type": "reading_support",
          "started": "2025-10-15",
          "progress": "positive"
        }
      ]
    },
    // ... 9 more students
  ],
  "alerts": [
    {
      "student_name": "Oliver Johnson",
      "alert_type": "declining_engagement",
      "urgency": "high",
      "triggered_at": "2025-11-03T10:30:00Z"
    }
  ],
  "crossSchoolInsights": {
    "total_sen_students": 15,
    "active_ehcps": 8,
    "pending_assessments": 3
  }
}

# ✅ PASS if: 200 status, 10 caseload students, alerts present
```

**Validation Checklist**:
- [ ] Caseload limited to EP's assigned students
- [ ] EHCP data included (not visible to teachers)
- [ ] Alerts prioritized by urgency
- [ ] Cross-school insights calculated correctly

---

### Test 1.9: Pending Actions API

**Endpoint**: `GET /api/class/actions/pending`

**Test Cases**:

```bash
# Test 1.9.1: Fetch pending actions
curl http://localhost:3000/api/class/actions/pending

# Expected Response:
[
  {
    "id": "action_123",
    "type": "intervention_triggered",
    "student_id": 2,
    "student_name": "Oliver Johnson",
    "triggered_by": "struggle_pattern",
    "context": {
      "subject": "mathematics",
      "consecutive_failures": 3,
      "success_rate": 0.45
    },
    "requires_approval": true,
    "created_at": "2025-11-03T10:30:00Z"
  },
  {
    "id": "action_124",
    "type": "level_change",
    "student_id": 5,
    "student_name": "Grace Brown",
    "triggered_by": "success_pattern",
    "context": {
      "current_level": "on_level",
      "proposed_level": "extension",
      "consecutive_successes": 5
    },
    "requires_approval": true,
    "created_at": "2025-11-03T11:15:00Z"
  }
]

# ✅ PASS if: 200 status, multiple actions returned, all require approval
```

**Validation Checklist**:
- [ ] All pending actions returned
- [ ] Actions include student context
- [ ] Triggered_by reasons clear
- [ ] Approval flags set correctly
- [ ] Timestamps accurate

---

### Test 1.10: Approve Action API

**Endpoint**: `POST /api/class/actions/[id]/approve`

**Test Cases**:

```bash
# Test 1.10.1: Approve intervention
curl -X POST http://localhost:3000/api/class/actions/action_123/approve

# Expected Response:
{
  "success": true,
  "message": "Action approved. Intervention has been triggered for Oliver Johnson.",
  "outcome": {
    "intervention_id": "intervention_789",
    "student_id": 2,
    "status": "active"
  }
}

# ✅ PASS if: 200 status, intervention created

# Verify action updated in database:
npx prisma studio
# Check AutomatedAction table - approved_at should be set
```

**Validation Checklist**:
- [ ] Action marked as approved
- [ ] Outcome executed (intervention created)
- [ ] Student profile updated if needed
- [ ] Audit trail logged

---

### Test 1.11: Reject Action API

**Endpoint**: `POST /api/class/actions/[id]/reject`

**Test Cases**:

```bash
# Test 1.11.1: Reject level change
curl -X POST http://localhost:3000/api/class/actions/action_124/reject \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Student needs more consolidation time at current level"
  }'

# Expected Response:
{
  "success": true,
  "message": "Action rejected. Level change will not be applied."
}

# ✅ PASS if: 200 status, action not executed

# Verify action updated in database:
npx prisma studio
# Check AutomatedAction table - rejected_at and rejection_reason should be set
```

**Validation Checklist**:
- [ ] Action marked as rejected
- [ ] Rejection reason stored
- [ ] No changes made to student
- [ ] Audit trail logged

---

### Test 1.12: Parent Messages API

**Endpoint**: `POST /api/parent/messages`

**Test Cases**:

```bash
# Test 1.12.1: Send message from parent to teacher
curl -X POST http://localhost:3000/api/parent/messages \
  -H "Content-Type: application/json" \
  -H "Cookie: session=parent_session_token" \
  -d '{
    "childId": 1,
    "subject": "Question about homework",
    "content": "Hello, Amara mentioned she found today'\''s maths homework challenging. Could you suggest some extra practice resources?"
  }'

# Expected Response:
{
  "success": true,
  "messageId": "msg_456",
  "message": "Message sent to Amara'\''s teacher"
}

# ✅ PASS if: 200 status, message created, teacher notified

# Verify message created:
npx prisma studio
# Check messages table for new record
```

**Validation Checklist**:
- [ ] Message created successfully
- [ ] Linked to correct parent-child relationship
- [ ] Teacher receives notification
- [ ] Timestamps set correctly

---

### Test 1.13: Student Lessons API

**Endpoint**: `GET /api/students/[id]/lessons`

**Test Cases**:

```bash
# Test 1.13.1: Fetch student's assigned lessons
curl http://localhost:3000/api/students/1/lessons

# Expected Response:
[
  {
    "id": "assignment_1",
    "lesson_plan": {
      "id": "lesson_1",
      "title": "Fractions - Halves and Quarters",
      "subject": "Mathematics"
    },
    "difficulty": "on_level",
    "status": "completed",
    "assigned_at": "2025-10-28T09:00:00Z",
    "completed_at": "2025-10-28T14:30:00Z",
    "success_rate": 0.85,
    "time_spent_minutes": 45
  },
  // ... more lessons
]

# ✅ PASS if: 200 status, all assigned lessons returned

# Test 1.13.2: Fetch lessons for non-existent student
curl http://localhost:3000/api/students/99999/lessons

# ✅ PASS if: 404 status
```

**Validation Checklist**:
- [ ] All assigned lessons returned
- [ ] Lessons sorted by assigned_at (newest first)
- [ ] Difficulty levels match student profile
- [ ] Completion data accurate
- [ ] Performance metrics calculated correctly

---

## 🧩 Phase 2: Component Integration Testing

### Test 2.1: TeacherClassDashboard Component

**Location**: `src/components/orchestration/TeacherClassDashboard.tsx`

**Setup**:
```tsx
// Test file: src/components/orchestration/__tests__/TeacherClassDashboard.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { OrchestrationQueryProvider } from '@/lib/orchestration/query-client';
import TeacherClassDashboard from '../TeacherClassDashboard';

test('renders class dashboard with students', async () => {
  render(
    <OrchestrationQueryProvider>
      <TeacherClassDashboard classId="1" />
    </OrchestrationQueryProvider>
  );

  // Wait for data to load
  await waitFor(() => {
    expect(screen.getByText('Year 3 Oak')).toBeInTheDocument();
  });

  // Check students rendered
  expect(screen.getByText('Amara Smith')).toBeInTheDocument();
  expect(screen.getByText('Oliver Johnson')).toBeInTheDocument();

  // Check actions summary
  expect(screen.getByText(/Lessons Assigned/)).toBeInTheDocument();
  expect(screen.getByText(/Interventions/)).toBeInTheDocument();
});
```

**Manual Testing**:
1. Navigate to `http://localhost:3000/class/1/dashboard`
2. Verify loading state appears briefly
3. Verify 28 student cards render
4. Verify actions summary shows correct counts
5. Verify pending actions section appears
6. Click student card → should expand with details
7. Hover over student card → should show urgency indicator

**Validation Checklist**:
- [ ] Loading state displays (spinner/skeleton)
- [ ] Error state handles API failures gracefully
- [ ] 28 students render for Year 3 Oak class
- [ ] Each student card shows:
  - [ ] Name, year group
  - [ ] Engagement score (visual indicator)
  - [ ] Urgency flag (if applicable)
  - [ ] Recent performance summary
- [ ] Actions summary accurate
- [ ] Pending actions render with approve/reject buttons
- [ ] Auto-refresh every 30 seconds (watch network tab)

---

### Test 2.2: StudentProfileCard Component

**Location**: `src/components/orchestration/StudentProfileCard.tsx`

**Manual Testing**:
1. View class dashboard
2. Click on student card for "Amara Smith"
3. Verify profile modal/panel opens
4. Check all profile data displays:
   - Learning style badges
   - Engagement score progress bar
   - Strengths and struggles lists
   - Intervention flags (if applicable)
   - "Ready to level up" indicator (if applicable)

**Validation Checklist**:
- [ ] Profile loads within 1 second
- [ ] Learning style percentages visualized correctly
- [ ] Engagement score color-coded:
  - [ ] Green if > 0.7
  - [ ] Yellow if 0.4-0.7
  - [ ] Red if < 0.4
- [ ] Strengths displayed as positive badges
- [ ] Struggles displayed neutrally (not negative tone)
- [ ] Intervention urgency shown correctly
- [ ] Prefetching works (hover over card, profile loads instantly)

---

### Test 2.3: VoiceCommandInterface Component

**Location**: `src/components/orchestration/VoiceCommandInterface.tsx`

**Manual Testing**:
1. Navigate to class dashboard
2. Locate voice command input
3. Type: "How is Amara doing?"
4. Press Enter or click Send
5. Verify response appears within 2 seconds
6. Check response content is in plain English
7. Verify actions taken are logged below response

**Test Scenarios**:

```
Query 1: "How is Amara doing?"
Expected: Student progress summary with strengths, struggles, and engagement

Query 2: "Who needs extra support in maths?"
Expected: List of 3-5 students with low success rates in mathematics

Query 3: "Show me today's lesson plans"
Expected: List of lesson plans scheduled for today

Query 4: "Flag Oliver for intervention"
Expected: Confirmation message + action created in pending list

Query 5: "What's the class average engagement score?"
Expected: Calculated average (e.g., "0.72 or 72%")
```

**Validation Checklist**:
- [ ] Input accepts natural language queries
- [ ] Loading indicator shows while processing
- [ ] Response appears within 2 seconds
- [ ] Response in plain English (no technical jargon)
- [ ] Actions taken listed clearly
- [ ] Error handling if query fails
- [ ] Query history saved (optional feature)

---

### Test 2.4: ParentPortal Component

**Location**: `src/components/orchestration/ParentPortal.tsx`

**Manual Testing**:
1. Log in as parent (use seed data parent account)
2. Navigate to `/parent/portal`
3. Verify child's name displays
4. Check "This Week's Wins" section
5. Check "What We're Working On" section
6. Check "How You Can Help at Home" section
7. Check recent progress cards

**Security Testing**:
1. Log in as parent of student ID 1
2. Manually change URL to `/parent/portal/2` (another child)
3. Should see "Access Denied" error
4. Verify 403 status in network tab

**Validation Checklist**:
- [ ] Parent can only see their own child
- [ ] All content in plain English
- [ ] Wins celebration-framed (positive tone)
- [ ] Home support actionable and practical
- [ ] Progress trends visualized clearly
- [ ] No technical jargon or education abbreviations
- [ ] Security enforced (can't access other children)

---

### Test 2.5: LessonDifferentiationView Component

**Location**: `src/components/orchestration/LessonDifferentiationView.tsx`

**Manual Testing**:
1. Navigate to lesson library
2. Select lesson: "Fractions - Halves and Quarters"
3. Click "Differentiate for Class"
4. Wait for differentiation to complete (2-3 seconds)
5. Verify 28 differentiated versions appear
6. Check each version shows:
   - Student name
   - Difficulty level badge
   - Scaffolding (for struggling students)
   - Extensions (for advanced students)
7. Click "Assign to All Students"
8. Verify success message
9. Check assignments created in database

**Validation Checklist**:
- [ ] Differentiation completes within 3 seconds for 28 students
- [ ] Difficulty levels vary based on profiles
- [ ] Scaffolding provided where needed
- [ ] Extensions provided for advanced students
- [ ] Each version is genuinely different (not generic)
- [ ] Assignment creates all 28 records
- [ ] Success toast notification appears

---

### Test 2.6: MultiAgencyView Component

**Location**: `src/components/orchestration/MultiAgencyView.tsx`

**Manual Testing - Teacher View**:
1. Log in as teacher
2. Navigate to multi-agency view
3. Verify sees only their class (28 students)
4. Check summary statistics accurate
5. Verify cannot see EHCP data

**Manual Testing - EP View**:
1. Log in as EP
2. Navigate to multi-agency view
3. Verify sees all 50 students across school
4. Check caseload section shows 10 students
5. Verify EHCP data visible
6. Check cross-school insights accurate

**Validation Checklist**:
- [ ] Teacher sees only their class
- [ ] EP sees all students
- [ ] Caseload correctly filtered
- [ ] EHCP data access controlled by role
- [ ] Summary statistics accurate
- [ ] Student cards show appropriate level of detail per role

---

### Test 2.7: AutomatedActionsLog Component

**Location**: `src/components/orchestration/AutomatedActionsLog.tsx`

**Manual Testing**:
1. Navigate to class dashboard
2. Locate "Pending Actions" section
3. Verify actions appear (should have 5-10 from seed data)
4. Check each action shows:
   - Action type badge
   - Student name
   - Triggered reason
   - Context (e.g., "3 consecutive failures")
   - Approve and Reject buttons
5. Click "Approve" on intervention action
6. Verify success message
7. Verify action removed from pending list
8. Check approved action in audit log

**Validation Checklist**:
- [ ] All pending actions render
- [ ] Actions auto-refresh every 15 seconds
- [ ] Action types color-coded appropriately
- [ ] Context information clear and helpful
- [ ] Approve button creates intervention/action
- [ ] Reject button requires reason
- [ ] Audit trail updated after approval/rejection
- [ ] Toast notifications on success/error

---

## 🔄 Phase 3: Complete Workflow Testing

### Workflow 3.1: Teacher Morning Routine

**Scenario**: Teacher arrives, checks class, plans day

**Steps**:
1. **Login** as teacher (Sarah Mitchell)
2. **View Dashboard** for Year 3 Oak class
   - ✅ See 28 students
   - ✅ Check actions summary (lessons assigned, interventions)
   - ✅ Review pending actions (2-3 should be waiting)
3. **Check Urgent Students**
   - ✅ Identify students with red urgency flags
   - ✅ Click student card to view profile
   - ✅ Check recent performance and struggles
4. **Use Voice Command** to get class overview
   - Query: "What's the overall class mood today?"
   - ✅ Receive summary of engagement scores
5. **Review Pending Actions**
   - ✅ Approve intervention for Oliver (struggling in maths)
   - ✅ Approve level change for Grace (ready to advance)
   - ✅ Reject level change for Lily (needs more consolidation)
6. **Plan Lesson**
   - ✅ Select "Fractions - Halves and Quarters" lesson
   - ✅ Click "Differentiate for Class"
   - ✅ Review 28 differentiated versions
   - ✅ Click "Assign to All Students"
   - ✅ Verify success message
7. **Send Parent Message** (optional)
   - ✅ Check parent messages inbox
   - ✅ Respond to parent query about homework

**Total Time**: 5-7 minutes
**Success Criteria**: All actions complete without errors

---

### Workflow 3.2: Student Learning Journey

**Scenario**: Student completes assigned lesson

**Steps**:
1. **Login** as student (Amara Smith, ID: 1)
2. **View Assigned Lessons**
   - ✅ See "Fractions - Halves and Quarters" assigned today
   - ✅ Difficulty level: "on_level"
   - ✅ Scaffolding provided: Visual fraction diagrams
3. **Complete Lesson Activities**
   - ✅ Work through 5 activities
   - ✅ Submit responses for each
   - ✅ Receive immediate feedback
4. **View Results**
   - ✅ See success rate (e.g., 85%)
   - ✅ View time spent (e.g., 45 minutes)
   - ✅ Earn achievement badge (optional)
5. **Background Processing** (verify after)
   - ✅ StudentProfile updated automatically
   - ✅ Engagement score recalculated
   - ✅ Progress snapshot created
   - ✅ If struggling → intervention trigger created
   - ✅ If succeeding → consider level up

**Total Time**: 45-60 minutes (lesson completion)
**Success Criteria**: Profile updates automatically, no manual input required

---

### Workflow 3.3: Parent Evening Check

**Scenario**: Parent checks child's progress after school

**Steps**:
1. **Login** as parent (parent of Amara, ID: 1)
2. **View Portal**
   - ✅ See "Amara's Progress" headline
   - ✅ Check "This Week's Wins" (3-5 positive highlights)
   - ✅ Review "What We're Working On" (2-3 areas)
   - ✅ Read "How You Can Help at Home" (practical suggestions)
3. **Check Recent Progress**
   - ✅ Mathematics: Secure, improving trend
   - ✅ English: Exceeding, stable trend
   - ✅ Science: Developing, improving trend
4. **Send Message to Teacher**
   - Subject: "Question about homework"
   - Content: Ask for extra practice resources
   - ✅ Verify message sent successfully
5. **Security Check** (verify access control)
   - Attempt to change URL to another child's ID
   - ✅ Should see "Access Denied" error
   - ✅ 403 status code in network tab

**Total Time**: 5-10 minutes
**Success Criteria**: Parent sees celebration-framed updates, security enforced

---

### Workflow 3.4: EP Monthly Review

**Scenario**: Educational Psychologist reviews caseload

**Steps**:
1. **Login** as EP (Dr. Priya Patel, ID: 2)
2. **View EP Dashboard**
   - ✅ See 10 students in active caseload
   - ✅ Check alerts (2-3 high urgency)
   - ✅ Review cross-school insights
3. **Review Specific Student**
   - Select Oliver Johnson (struggling)
   - ✅ View EHCP status
   - ✅ Check recent interventions
   - ✅ Review progress over 8 weeks (snapshots)
   - ✅ Identify patterns (e.g., engagement declining)
4. **Use Voice Command for Analysis**
   - Query: "Show me all students with declining engagement"
   - ✅ Receive list of 3-4 students
   - ✅ Check intervention recommendations
5. **Trigger Cross-School Alert**
   - ✅ Flag student for multi-agency review
   - ✅ Notify SENCO and teacher
6. **Generate EHCP Report** (optional)
   - ✅ Export student progress data
   - ✅ Verify data includes snapshots from last 8 weeks

**Total Time**: 20-30 minutes
**Success Criteria**: EP has full visibility across school, EHCP data accessible

---

### Workflow 3.5: Automated Intervention Trigger

**Scenario**: System detects struggling pattern, auto-triggers action

**Setup**:
1. Manually create scenario where student fails 3 consecutive assignments
2. Watch for automated action creation

**Expected System Behavior**:
1. **Pattern Detection**
   - ✅ Cross-module intelligence detects 3 consecutive failures
   - ✅ Calculates success rate < 50% threshold
   - ✅ Identifies subject: Mathematics
2. **Action Creation**
   - ✅ Automated action created: "intervention_triggered"
   - ✅ Type: Mathematics support
   - ✅ Urgency: Medium or High (based on severity)
   - ✅ Requires approval: Yes
3. **Notifications**
   - ✅ Teacher sees action in "Pending Actions"
   - ✅ EP notified if student has EHCP
   - ✅ Audit trail logged
4. **Teacher Approval**
   - ✅ Teacher reviews context
   - ✅ Approves intervention
   - ✅ System creates intervention record
   - ✅ Student profile updated
5. **Intervention Delivery**
   - ✅ Student assigned targeted support lessons
   - ✅ Difficulty level adjusted to "needs_support"
   - ✅ Extra scaffolding provided
6. **Progress Monitoring**
   - ✅ System tracks intervention effectiveness
   - ✅ After 5 lessons, checks if success rate improved
   - ✅ If improved → mark intervention successful
   - ✅ If not → escalate to EP

**Total Time**: Ongoing (automated)
**Success Criteria**: No child struggles for more than 3 consecutive lessons without intervention

---

## ⚡ Phase 4: Performance Testing

### Test 4.1: API Response Times

**Endpoints to Test**:

```bash
# Test 4.1.1: Student Profile API (target: < 200ms)
time curl http://localhost:3000/api/students/1/profile

# Test 4.1.2: Class Dashboard API (target: < 500ms for 28 students)
time curl "http://localhost:3000/api/class/dashboard?classId=1"

# Test 4.1.3: Lesson Differentiation API (target: < 3s for 28 students)
time curl -X POST http://localhost:3000/api/lessons/differentiate \
  -H "Content-Type: application/json" \
  -d '{"lessonPlan": {...}, "classId": "1"}'

# Test 4.1.4: Voice Command API (target: < 2s)
time curl -X POST http://localhost:3000/api/voice/command \
  -H "Content-Type: application/json" \
  -d '{"query": "How is Amara doing?", "classId": "1"}'
```

**Performance Benchmarks**:
- Student Profile API: < 200ms
- Class Dashboard API: < 500ms (28 students)
- Lesson Differentiation: < 3s (28 students)
- Voice Command: < 2s (simple query)
- Lesson Assignment: < 1s (28 assignments)
- Parent Portal: < 300ms

**Validation Checklist**:
- [ ] All endpoints meet target response times
- [ ] No N+1 query issues (check Prisma logs)
- [ ] Database queries optimized
- [ ] Caching working (repeat requests faster)

---

### Test 4.2: React Query Caching

**Test Scenarios**:

1. **Initial Load** (cold cache)
   - Navigate to class dashboard
   - Measure time to first meaningful paint
   - Target: < 1s

2. **Subsequent Load** (warm cache)
   - Navigate away, then back to dashboard
   - Should load instantly from cache
   - Target: < 100ms

3. **Background Refetch**
   - Load dashboard
   - Wait 30 seconds (stale time expires)
   - Watch network tab → should auto-refetch
   - UI should not flicker

4. **Prefetching**
   - Hover over student card
   - Profile should prefetch
   - Click card → profile loads instantly
   - Target: < 50ms (from cache)

**Validation Checklist**:
- [ ] Initial load < 1s
- [ ] Cached loads < 100ms
- [ ] Background refetch works every 30s
- [ ] Prefetching reduces perceived load time
- [ ] No unnecessary API calls

---

### Test 4.3: Load Testing (40 Students)

**Setup**:
```bash
# Modify seed script to create 40-student class
# Update line 229 in prisma/seed-orchestration.ts:
{ name: 'Year 5 Maple', subject: 'Mixed', year_group: 'Year 5', studentCount: 40 }

# Re-run seed script
npx tsx prisma/seed-orchestration.ts
```

**Test Cases**:

1. **Class Dashboard with 40 Students**
   - Load dashboard for 40-student class
   - Measure render time
   - Target: < 2s

2. **Differentiate Lesson for 40 Students**
   - Click "Differentiate for Class"
   - Measure processing time
   - Target: < 5s

3. **Assign Lesson to 40 Students**
   - Click "Assign to All Students"
   - Measure database insert time
   - Target: < 2s

**Validation Checklist**:
- [ ] Dashboard renders smoothly with 40 students
- [ ] No performance degradation
- [ ] Memory usage acceptable (< 100MB increase)
- [ ] No UI freezing during processing

---

### Test 4.4: Database Query Optimization

**Check for N+1 Queries**:

```bash
# Enable Prisma query logging
# .env.local
DATABASE_URL="postgresql://...?connection_limit=10&pool_timeout=10&statement_cache_size=0"

# Check logs for:
# ❌ BAD: 29 queries (1 for class + 28 for student profiles)
# ✅ GOOD: 2 queries (1 for class with includes, 1 for profiles)
```

**Expected Query Patterns**:

1. **Class Dashboard**:
   ```sql
   -- Query 1: Fetch class with students (with include)
   SELECT * FROM ClassRoster WHERE id = 1
   INNER JOIN students ON students.class_id = ClassRoster.id

   -- Query 2: Fetch all profiles for class students
   SELECT * FROM StudentProfile WHERE student_id IN (1,2,3,...,28)
   ```

2. **Student Profile**:
   ```sql
   -- Single query with all related data
   SELECT * FROM StudentProfile WHERE student_id = 1
   ```

**Validation Checklist**:
- [ ] No N+1 queries detected
- [ ] Uses `include` or `select` appropriately
- [ ] Batch queries where possible
- [ ] Indexes on foreign keys

---

## 🔒 Phase 5: Security Testing

### Test 5.1: Multi-Tenant Isolation

**Test Scenario**: Verify tenant data cannot cross boundaries

**Setup**:
```bash
# Create second tenant via seed script
# Modify prisma/seed-orchestration.ts to create tenant 2 with 10 students
```

**Test Cases**:

```bash
# Test 5.1.1: Fetch student from different tenant
# Logged in as teacher from tenant 1
curl http://localhost:3000/api/students/51/profile \
  -H "Cookie: session=tenant1_teacher_token"

# Expected: 404 or 403 (student not found / access denied)
# ✅ PASS if: Cannot access tenant 2 student from tenant 1 session

# Test 5.1.2: Class dashboard cross-tenant
curl "http://localhost:3000/api/class/dashboard?classId=tenant2_class" \
  -H "Cookie: session=tenant1_teacher_token"

# Expected: 403 or 404
# ✅ PASS if: Cannot access tenant 2 class
```

**Validation Checklist**:
- [ ] Tenant ID scoping enforced in all queries
- [ ] Cannot access other tenant's students
- [ ] Cannot access other tenant's classes
- [ ] Cannot access other tenant's lessons
- [ ] Session cookies include tenant ID

---

### Test 5.2: Parent Portal Access Control

**Test Scenario**: Verify triple security verification

**Security Layers**:
1. **Session verification**: Parent must be logged in
2. **Parent-child link verification**: Parent must have verified link to child
3. **Primary contact verification**: Only primary contact can view detailed data

**Test Cases**:

```bash
# Test 5.2.1: Access without authentication
curl http://localhost:3000/api/parent/portal/1

# Expected: 401 (unauthorized)
# ✅ PASS if: Requires session cookie

# Test 5.2.2: Access another child's data
# Parent of student 1 tries to access student 2
curl http://localhost:3000/api/parent/portal/2 \
  -H "Cookie: session=parent1_token"

# Expected: 403 (access denied)
# ✅ PASS if: Cannot access non-linked child

# Test 5.2.3: Access via modified query
# Try SQL injection or parameter tampering
curl http://localhost:3000/api/parent/portal/1?childId=2 \
  -H "Cookie: session=parent1_token"

# Expected: Still shows child 1 data (ignores parameter)
# ✅ PASS if: Route param takes precedence, no injection possible

# Test 5.2.4: Access via JWT manipulation (if using JWT)
# Try modifying JWT claims to change user ID
# Expected: 403 or 401 (invalid token)
```

**Validation Checklist**:
- [ ] Session verification enforced
- [ ] Parent-child link verified in database
- [ ] No parameter tampering possible
- [ ] No SQL injection vulnerabilities
- [ ] Audit trail logs all access attempts

---

### Test 5.3: Role-Based Access Control

**Test Scenario**: Verify each role has appropriate permissions

**Role Matrix**:

| Feature | Teacher | Student | Parent | EP | Admin |
|---------|---------|---------|--------|-----|-------|
| View student profiles | Own class | Self only | Own child | All | All |
| Edit student profiles | No | No | No | Caseload | All |
| Assign lessons | Yes | No | No | No | Yes |
| Approve interventions | Yes | No | No | Yes | Yes |
| View EHCP data | No | No | No | Yes | Yes |
| Access parent portal | No | No | Yes | No | Yes |

**Test Cases**:

```bash
# Test 5.3.1: Student tries to access teacher features
curl -X POST http://localhost:3000/api/lessons/assign \
  -H "Cookie: session=student_token" \
  -d '{"lessonPlanId": "1", "classId": "1"}'

# Expected: 403 (insufficient permissions)

# Test 5.3.2: Teacher tries to view EHCP data
curl http://localhost:3000/api/students/1/ehcp \
  -H "Cookie: session=teacher_token"

# Expected: 403 (EHCP data restricted to EP/Admin)

# Test 5.3.3: Parent tries to access class dashboard
curl "http://localhost:3000/api/class/dashboard?classId=1" \
  -H "Cookie: session=parent_token"

# Expected: 403 (class dashboard for teachers only)
```

**Validation Checklist**:
- [ ] Role verification in all protected routes
- [ ] Least privilege principle enforced
- [ ] Teacher cannot see EHCP data
- [ ] Student cannot assign lessons
- [ ] Parent cannot access class data
- [ ] EP has appropriate access to all students

---

### Test 5.4: Data Sanitization

**Test Scenario**: Verify XSS and injection protection

**Test Cases**:

```bash
# Test 5.4.1: XSS in voice command
curl -X POST http://localhost:3000/api/voice/command \
  -H "Content-Type: application/json" \
  -d '{
    "query": "<script>alert('XSS')</script>",
    "classId": "1"
  }'

# Expected: Query sanitized, script tags stripped or escaped
# ✅ PASS if: Response does not execute script

# Test 5.4.2: SQL injection in student search
curl "http://localhost:3000/api/students?search='; DROP TABLE students; --"

# Expected: Query parameterized, no SQL executed
# ✅ PASS if: 400 error or empty results (not DB error)

# Test 5.4.3: HTML in parent message
curl -X POST http://localhost:3000/api/parent/messages \
  -H "Content-Type: application/json" \
  -d '{
    "childId": 1,
    "subject": "Test",
    "content": "<img src=x onerror=alert(1)>"
  }'

# Expected: HTML escaped or sanitized
# ✅ PASS if: Message stored safely, no XSS on display
```

**Validation Checklist**:
- [ ] All user input sanitized
- [ ] SQL queries use parameterized statements (Prisma default)
- [ ] XSS protection in place (React default)
- [ ] HTML escaped in messages
- [ ] No executable code in database

---

## 🔍 Phase 6: Data Integrity Testing

### Test 6.1: Relational Consistency

**Test Scenario**: Verify foreign key relationships maintained

**Test Cases**:

1. **Cascading Deletes**:
   ```bash
   # Delete student → check assignments deleted
   # (Note: Don't actually run this in production!)

   # Step 1: Note student's assignments
   curl http://localhost:3000/api/students/1/lessons
   # Should return 5 assignments

   # Step 2: Delete student (via admin panel or Prisma Studio)
   # Check assignments for student 1
   # Expected: 0 assignments (cascaded delete)
   ```

2. **Parent-Child Link Integrity**:
   ```bash
   # Verify parent-child link required for portal access

   # Delete ParentChildLink record
   # Try accessing portal
   curl http://localhost:3000/api/parent/portal/1 \
     -H "Cookie: session=parent1_token"

   # Expected: 403 (no verified link found)
   ```

**Validation Checklist**:
- [ ] Foreign key constraints enforced
- [ ] Cascading deletes work correctly
- [ ] Orphaned records prevented
- [ ] Referential integrity maintained

---

### Test 6.2: Automated Action Audit Trail

**Test Scenario**: Verify all automated actions logged

**Test Cases**:

1. **Profile Update Triggered**:
   - Student completes lesson
   - Check AutomatedAction table
   - Should have record: "profile_updated"
   - Verify context includes lesson ID

2. **Intervention Triggered**:
   - Student fails 3 consecutive assignments
   - Check AutomatedAction table
   - Should have record: "intervention_triggered"
   - Verify requires_approval = true

3. **Level Change Triggered**:
   - Student succeeds 5 consecutive assignments
   - Check AutomatedAction table
   - Should have record: "level_changed"
   - Verify context includes old and new levels

**Validation Checklist**:
- [ ] All automated actions logged
- [ ] Timestamps accurate
- [ ] Context data complete
- [ ] Outcomes tracked
- [ ] Approved_at and rejected_at fields used correctly

---

### Test 6.3: Progress Snapshot Consistency

**Test Scenario**: Verify progress snapshots created weekly

**Test Cases**:

1. **Weekly Snapshot Creation**:
   ```bash
   # Check StudentProgressSnapshot table
   npx prisma studio

   # Verify 30 students have 8 weeks of snapshots = 240 records
   ```

2. **Snapshot Data Accuracy**:
   - Select random student (e.g., student ID 1)
   - Check snapshots from 8 weeks ago to present
   - Verify trends match actual performance:
     - If engagement score increased → trend: "improving"
     - If stable → trend: "stable"
     - If decreased → trend: "declining"

**Validation Checklist**:
- [ ] Snapshots created weekly (automated job)
- [ ] All students have snapshots
- [ ] Trends calculated correctly
- [ ] Milestones tracked accurately
- [ ] EHCP data included for SEN students only

---

## 🤖 Test Automation Scripts

### Script 1: API Health Check

**File**: `scripts/test-api-health.sh`

```bash
#!/bin/bash

echo "🔍 Testing Orchestration Layer API Endpoints..."

BASE_URL="http://localhost:3000"
PASS_COUNT=0
FAIL_COUNT=0

# Test 1: Student Profile API
echo -n "Testing Student Profile API... "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/students/1/profile")
if [ "$RESPONSE" -eq 200 ]; then
  echo "✅ PASS"
  ((PASS_COUNT++))
else
  echo "❌ FAIL (HTTP $RESPONSE)"
  ((FAIL_COUNT++))
fi

# Test 2: Class Dashboard API
echo -n "Testing Class Dashboard API... "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/class/dashboard?classId=1")
if [ "$RESPONSE" -eq 200 ]; then
  echo "✅ PASS"
  ((PASS_COUNT++))
else
  echo "❌ FAIL (HTTP $RESPONSE)"
  ((FAIL_COUNT++))
fi

# Test 3: Voice Command API
echo -n "Testing Voice Command API... "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE_URL/api/voice/command" \
  -H "Content-Type: application/json" \
  -d '{"query": "How is Amara doing?", "classId": "1"}')
if [ "$RESPONSE" -eq 200 ]; then
  echo "✅ PASS"
  ((PASS_COUNT++))
else
  echo "❌ FAIL (HTTP $RESPONSE)"
  ((FAIL_COUNT++))
fi

# Test 4: Parent Portal API (should fail without auth)
echo -n "Testing Parent Portal Security... "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/parent/portal/1")
if [ "$RESPONSE" -eq 401 ] || [ "$RESPONSE" -eq 403 ]; then
  echo "✅ PASS (correctly denied)"
  ((PASS_COUNT++))
else
  echo "❌ FAIL (should be 401/403, got $RESPONSE)"
  ((FAIL_COUNT++))
fi

# Test 5: Multi-Agency View API
echo -n "Testing Multi-Agency View API... "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/multi-agency/view?userId=1")
if [ "$RESPONSE" -eq 200 ] || [ "$RESPONSE" -eq 401 ]; then
  echo "✅ PASS"
  ((PASS_COUNT++))
else
  echo "❌ FAIL (HTTP $RESPONSE)"
  ((FAIL_COUNT++))
fi

echo ""
echo "================================================"
echo "📊 Test Results:"
echo "   ✅ Passed: $PASS_COUNT"
echo "   ❌ Failed: $FAIL_COUNT"
echo "================================================"

if [ "$FAIL_COUNT" -eq 0 ]; then
  echo "🎉 All tests passed!"
  exit 0
else
  echo "⚠️  Some tests failed. Check logs above."
  exit 1
fi
```

**Usage**:
```bash
chmod +x scripts/test-api-health.sh
./scripts/test-api-health.sh
```

---

### Script 2: Performance Benchmark

**File**: `scripts/benchmark-performance.sh`

```bash
#!/bin/bash

echo "⚡ Benchmarking Orchestration Layer Performance..."

BASE_URL="http://localhost:3000"

# Test 1: Student Profile API
echo -n "Student Profile API: "
TIME=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL/api/students/1/profile")
echo "${TIME}s (target: <0.2s)"

# Test 2: Class Dashboard API
echo -n "Class Dashboard API: "
TIME=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL/api/class/dashboard?classId=1")
echo "${TIME}s (target: <0.5s)"

# Test 3: Lesson Differentiation API
echo -n "Lesson Differentiation API: "
TIME=$(curl -s -o /dev/null -w "%{time_total}" \
  -X POST "$BASE_URL/api/lessons/differentiate" \
  -H "Content-Type: application/json" \
  -d '{
    "lessonPlan": {
      "id": "lesson_1",
      "title": "Test Lesson"
    },
    "classId": "1"
  }')
echo "${TIME}s (target: <3s)"

# Test 4: Voice Command API
echo -n "Voice Command API: "
TIME=$(curl -s -o /dev/null -w "%{time_total}" \
  -X POST "$BASE_URL/api/voice/command" \
  -H "Content-Type: application/json" \
  -d '{"query": "How is Amara doing?", "classId": "1"}')
echo "${TIME}s (target: <2s)"

echo ""
echo "✅ Benchmark complete"
```

**Usage**:
```bash
chmod +x scripts/benchmark-performance.sh
./scripts/benchmark-performance.sh
```

---

### Script 3: Data Integrity Check

**File**: `scripts/check-data-integrity.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDataIntegrity() {
  console.log('🔍 Checking Data Integrity...\n');

  let passCount = 0;
  let failCount = 0;

  // Check 1: All students have profiles
  const studentsWithoutProfiles = await prisma.students.findMany({
    where: {
      StudentProfile: null
    }
  });

  if (studentsWithoutProfiles.length === 0) {
    console.log('✅ All students have profiles');
    passCount++;
  } else {
    console.log(`❌ ${studentsWithoutProfiles.length} students missing profiles`);
    failCount++;
  }

  // Check 2: All assignments have valid student references
  const orphanedAssignments = await prisma.studentLessonAssignment.findMany({
    where: {
      students: null
    }
  });

  if (orphanedAssignments.length === 0) {
    console.log('✅ No orphaned assignments');
    passCount++;
  } else {
    console.log(`❌ ${orphanedAssignments.length} orphaned assignments found`);
    failCount++;
  }

  // Check 3: All profiles have engagement scores between 0-1
  const invalidProfiles = await prisma.studentProfile.findMany({
    where: {
      OR: [
        { engagement_score: { lt: 0 } },
        { engagement_score: { gt: 1 } }
      ]
    }
  });

  if (invalidProfiles.length === 0) {
    console.log('✅ All engagement scores valid (0-1)');
    passCount++;
  } else {
    console.log(`❌ ${invalidProfiles.length} profiles with invalid engagement scores`);
    failCount++;
  }

  // Check 4: All parent-child links verified
  const unverifiedLinks = await prisma.parentChildLink.findMany({
    where: {
      is_verified: false
    }
  });

  if (unverifiedLinks.length === 0) {
    console.log('✅ All parent-child links verified');
    passCount++;
  } else {
    console.log(`⚠️  ${unverifiedLinks.length} unverified parent-child links`);
  }

  console.log('\n================================================');
  console.log(`📊 Integrity Check Results:`);
  console.log(`   ✅ Passed: ${passCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log('================================================\n');

  if (failCount === 0) {
    console.log('🎉 All integrity checks passed!');
  } else {
    console.log('⚠️  Some integrity issues found. Review above.');
  }

  await prisma.$disconnect();
  process.exit(failCount === 0 ? 0 : 1);
}

checkDataIntegrity();
```

**Usage**:
```bash
npx tsx scripts/check-data-integrity.ts
```

---

## 📊 Expected Results & Benchmarks

### API Response Time Benchmarks

| Endpoint | Target | Acceptable | Needs Optimization |
|----------|--------|------------|-------------------|
| Student Profile | < 200ms | 200-500ms | > 500ms |
| Class Dashboard (28) | < 500ms | 500ms-1s | > 1s |
| Class Dashboard (40) | < 1s | 1-2s | > 2s |
| Lesson Differentiation (28) | < 3s | 3-5s | > 5s |
| Lesson Assignment (28) | < 1s | 1-2s | > 2s |
| Voice Command (simple) | < 2s | 2-4s | > 4s |
| Voice Command (complex) | < 4s | 4-6s | > 6s |
| Parent Portal | < 300ms | 300-600ms | > 600ms |
| Multi-Agency View | < 600ms | 600ms-1s | > 1s |

### React Query Cache Hit Rates

- **Initial Load**: 0% (cold cache)
- **Subsequent Load (within 30s)**: 100% (warm cache)
- **After 30s**: 0% (stale, refetches in background)
- **Prefetched Data**: 100% (instant load)

**Target**: > 70% cache hit rate overall

### Database Query Counts

| Operation | Expected Queries | Warning If > |
|-----------|-----------------|--------------|
| Load Class Dashboard | 2-3 | 5 |
| Load Student Profile | 1 | 3 |
| Differentiate Lesson | 3-4 | 10 |
| Assign Lesson (28) | 2-3 | 30 |
| Voice Command | 4-6 | 10 |

### Memory Usage

| Component | Expected | Warning If > |
|-----------|----------|--------------|
| Class Dashboard (28) | +20-40MB | +100MB |
| Class Dashboard (40) | +30-60MB | +150MB |
| Student Profile | +5-10MB | +30MB |
| Voice Command | +10-20MB | +50MB |

---

## 🐛 Troubleshooting

### Issue 1: API Returns 500 Error

**Symptoms**:
- API endpoint returns 500 Internal Server Error
- Error message: "Something went wrong"

**Possible Causes**:
1. Database connection failed
2. Missing environment variables
3. Prisma schema out of sync
4. Type mismatch in API handler

**Solutions**:
```bash
# Check database connection
npx prisma db pull

# Verify environment variables
cat .env.local | grep DATABASE_URL

# Regenerate Prisma client
npx prisma generate

# Check server logs
npm run dev
# Look for error stack trace in terminal
```

---

### Issue 2: React Query Returns Stale Data

**Symptoms**:
- Component shows old data after mutation
- Updates not reflected in UI

**Possible Causes**:
1. Query not invalidated after mutation
2. Stale time too long
3. Cache not cleared

**Solutions**:
```typescript
// Ensure mutation invalidates queries
const { mutate } = useMutation({
  mutationFn: updateStudent,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['students'] });
  }
});

// Or manually invalidate
const invalidateStudent = useInvalidateStudent();
invalidateStudent(studentId);

// Or force refetch
const { refetch } = useStudentProfile(studentId);
refetch();
```

---

### Issue 3: Parent Portal Shows "Access Denied"

**Symptoms**:
- Parent sees 403 error for their own child
- Error: "Access denied. You can only view your own child's progress."

**Possible Causes**:
1. Parent-child link not created
2. Link not verified (is_verified = false)
3. Session user ID mismatch

**Solutions**:
```bash
# Check ParentChildLink table
npx prisma studio
# Verify record exists for parent and child

# Check session user ID matches
# In API route, log:
console.log('Session user ID:', req.session.userId);
console.log('Parent ID from link:', link.parent_id);
# Should match

# If missing, create link:
await prisma.parentChildLink.create({
  data: {
    tenant_id: 1,
    parent_id: parentUserId,
    student_id: childId,
    is_verified: true,
    is_primary_contact: true
  }
});
```

---

### Issue 4: Voice Command Returns "Intent not recognized"

**Symptoms**:
- Voice command API returns generic error
- Intent classification fails

**Possible Causes**:
1. OpenAI API key missing or invalid
2. Query too vague or ambiguous
3. Context not provided

**Solutions**:
```bash
# Check OpenAI API key
cat .env.local | grep OPENAI_API_KEY

# Test API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# If valid, check query format
# Provide context in request:
{
  "query": "How is Amara doing?",
  "classId": "1",        // Helps narrow scope
  "contextType": "dashboard" // Provides context
}
```

---

### Issue 5: Seed Data Not Creating

**Symptoms**:
- Seed script runs but no data in database
- Error: "Table does not exist"

**Possible Causes**:
1. Schema not migrated
2. Database connection failed
3. Tenant ID mismatch

**Solutions**:
```bash
# Check schema migration status
npx prisma migrate status

# If not applied, run migration
npx prisma migrate dev --name add_orchestration_layer

# Verify tables exist
npx prisma studio
# Look for StudentProfile, ClassRoster, etc.

# Check database connection
npx prisma db pull
# Should succeed without errors

# Re-run seed script
npx tsx prisma/seed-orchestration.ts
```

---

### Issue 6: Component Not Updating After Mutation

**Symptoms**:
- Mutation succeeds but UI doesn't update
- Need to refresh page to see changes

**Possible Causes**:
1. Query not invalidated
2. Optimistic update not implemented
3. React Query cache issue

**Solutions**:
```typescript
// Solution 1: Invalidate queries in mutation
const { mutate } = useMutation({
  mutationFn: assignLesson,
  onSuccess: (data, variables) => {
    // Invalidate all related queries
    invalidateClassQueries(queryClient, variables.classId);
    invalidateStudentQueries(queryClient, variables.studentId);
  }
});

// Solution 2: Implement optimistic update
const { mutate } = useMutation({
  mutationFn: updateProfile,
  onMutate: async (newProfile) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['studentProfile', studentId] });

    // Snapshot previous value
    const previous = queryClient.getQueryData(['studentProfile', studentId]);

    // Optimistically update
    queryClient.setQueryData(['studentProfile', studentId], newProfile);

    return { previous };
  },
  onError: (err, newProfile, context) => {
    // Rollback on error
    queryClient.setQueryData(['studentProfile', studentId], context.previous);
  },
  onSettled: () => {
    // Refetch to ensure correctness
    queryClient.invalidateQueries({ queryKey: ['studentProfile', studentId] });
  }
});
```

---

## ✅ Testing Completion Checklist

### Pre-Testing Setup
- [ ] Schema integration completed
- [ ] Seed data generated (500+ records)
- [ ] React Query provider added to layout
- [ ] Development server running
- [ ] Environment variables configured
- [ ] Prisma Studio accessible

### Phase 1: API Endpoint Testing
- [ ] All 13 API routes tested
- [ ] All routes return correct status codes
- [ ] All routes return properly typed data
- [ ] Error handling works correctly
- [ ] Authentication/authorization enforced

### Phase 2: Component Integration Testing
- [ ] All 7 components tested
- [ ] Loading states work correctly
- [ ] Error states handled gracefully
- [ ] Empty states display appropriately
- [ ] React Query hooks integrated correctly

### Phase 3: Complete Workflow Testing
- [ ] Teacher morning routine completed
- [ ] Student learning journey completed
- [ ] Parent evening check completed
- [ ] EP monthly review completed
- [ ] Automated intervention trigger tested

### Phase 4: Performance Testing
- [ ] All API response times meet benchmarks
- [ ] React Query caching working correctly
- [ ] Load testing with 40 students passed
- [ ] No N+1 query issues detected

### Phase 5: Security Testing
- [ ] Multi-tenant isolation verified
- [ ] Parent portal access control enforced
- [ ] Role-based permissions working
- [ ] Data sanitization prevents XSS/injection

### Phase 6: Data Integrity Testing
- [ ] Relational consistency verified
- [ ] Audit trail logs all actions
- [ ] Progress snapshots accurate
- [ ] No orphaned records

### Test Automation
- [ ] API health check script runs successfully
- [ ] Performance benchmark script runs successfully
- [ ] Data integrity check script passes

---

## 📝 Final Notes

### Testing Timeline

- **Phase 1** (API Testing): 45-60 minutes
- **Phase 2** (Component Testing): 60-90 minutes
- **Phase 3** (Workflow Testing): 60-90 minutes
- **Phase 4** (Performance Testing): 30-45 minutes
- **Phase 5** (Security Testing): 45-60 minutes
- **Phase 6** (Data Integrity Testing): 15-30 minutes

**Total**: 3.5-5.5 hours

### Documentation

After testing, document:
- All test results (pass/fail)
- Performance benchmarks achieved
- Any issues discovered and fixes applied
- Browser compatibility (Chrome, Firefox, Safari, Edge)
- Accessibility compliance (WCAG 2.1 AA)

### Next Steps After Testing

1. **Fix any issues discovered** during testing
2. **Re-test failed scenarios** after fixes applied
3. **Prepare for production deployment** once all tests pass
4. **Set up monitoring** (Sentry, Datadog, etc.)
5. **Create user acceptance testing plan** for stakeholders

---

**Status**: ✅ Testing guide complete and ready to execute
**Dependencies**: Schema integration and seed data must be completed first
**Estimated Coverage**: 100% of orchestration layer features
**Automation**: 3 scripts provided for automated testing

**Created**: 2025-11-03
**File**: docs/E2E-TESTING-GUIDE.md (1,200+ lines)
**Ready for**: Comprehensive validation of all orchestration features
