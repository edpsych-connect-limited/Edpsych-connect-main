# API Testing Guide - Platform Orchestration Layer

## Overview

This guide provides comprehensive testing instructions for all 10 Phase 2 API routes with curl examples, expected responses, and troubleshooting guidance.

**Base URL (Development):** `http://localhost:3000`
**Base URL (Production):** `https://edpsych-connect.world`

---

## Authentication

All API routes require authentication. Include your JWT token in the `Authorization` header:

```bash
export TOKEN="your_jwt_token_here"
```

### Get Authentication Token

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@school.com",
    "password": "your_password"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": "user_123",
    "email": "teacher@school.com",
    "role": "teacher",
    "tenant_id": "tenant_123"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 1. Student Profile API Routes

### 1.1 GET Student Profile

Retrieve auto-built student profile with confidence scores and data sources.

```bash
curl -X GET \
  http://localhost:3000/api/students/student_123/profile \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "profileId": "profile_456",
  "studentId": "student_123",
  "studentName": "Emma Thompson",
  "confidenceScore": 0.85,
  "lastUpdated": "2025-11-03T10:30:00.000Z",
  "dataSources": {
    "assessments": 5,
    "lessons": 23,
    "interventions": 2,
    "manualAdjustments": 1
  },
  "learningProfile": {
    "primaryLearningStyle": "visual",
    "secondaryLearningStyle": "kinesthetic",
    "readingLevel": "Year 5",
    "mathLevel": "Year 4",
    "processingSpeed": "average",
    "workingMemory": "below_average"
  },
  "strengths": [
    "Creative thinking",
    "Visual spatial skills",
    "Verbal communication"
  ],
  "struggles": [
    "Written expression",
    "Time management",
    "Multi-step instructions"
  ],
  "behavioralPatterns": {
    "attentionSpan": "moderate",
    "socialInteraction": "good",
    "emotionalRegulation": "developing",
    "motivationTriggers": ["Visual rewards", "Group work", "Practical activities"]
  },
  "readinessIndicators": {
    "independentWork": 65,
    "groupWork": 85,
    "verbalTasks": 80,
    "writtenTasks": 55,
    "practicalTasks": 90
  },
  "sendSupport": {
    "hasEhcp": true,
    "primaryNeed": "Specific Learning Difficulty",
    "supportLevel": "Wave 2 - Targeted Support",
    "accommodations": ["Extra time", "Visual supports", "Scribed responses"]
  },
  "lastAssessmentDate": "2025-10-15T14:00:00.000Z",
  "lastLessonDate": "2025-11-02T09:30:00.000Z",
  "lastInterventionDate": "2025-10-20T11:00:00.000Z"
}
```

**Error Scenarios:**
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - Student doesn't exist or access denied
- `500 Internal Server Error` - Database or service error

### 1.2 PATCH Student Profile (Manual Adjustment)

Teacher manual override of auto-detected profile fields.

```bash
curl -X PATCH \
  http://localhost:3000/api/students/student_123/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "learningProfile": {
      "primaryLearningStyle": "visual",
      "readingLevel": "Year 5"
    },
    "strengths": ["Creative thinking", "Visual spatial skills", "Problem solving"],
    "struggles": ["Written expression", "Time management"],
    "behavioralPatterns": {
      "attentionSpan": "moderate",
      "motivationTriggers": ["Visual rewards", "Hands-on activities"]
    },
    "manualAdjustmentReason": "Based on recent classroom observations and parent feedback showing improved reading level"
  }'
```

**Expected Response:** Same as GET with updated fields and increased confidence score.

**Validation Errors:**
- `manualAdjustmentReason` must be at least 10 characters
- Invalid enum values for learning styles
- Strengths/struggles must be arrays of strings

### 1.3 GET Student Lessons

List all differentiated lessons assigned to student with progress tracking.

```bash
curl -X GET \
  "http://localhost:3000/api/students/student_123/lessons?status=in_progress&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

**Query Parameters:**
- `status` - Filter by completion status: `completed`, `in_progress`, `not_started`
- `subject` - Filter by subject: `Mathematics`, `English`, `Science`, etc.
- `limit` - Number of results (default: 50)
- `offset` - Pagination offset (default: 0)

**Expected Response:**
```json
{
  "studentId": "student_123",
  "studentName": "Emma Thompson",
  "totalLessons": 23,
  "completedLessons": 18,
  "inProgressLessons": 3,
  "averageSuccessRate": 78.5,
  "recommendedNextDifficulty": "standard",
  "lessons": [
    {
      "assignmentId": "assignment_789",
      "lessonTitle": "Understanding Fractions",
      "subject": "Mathematics",
      "difficultyLevel": "supported",
      "assignedDate": "2025-11-01T09:00:00.000Z",
      "dueDate": "2025-11-08T09:00:00.000Z",
      "completionStatus": "in_progress",
      "completedDate": null,
      "successRate": null,
      "timeSpent": 45,
      "struggleAreas": ["Comparing fractions", "Word problems"],
      "teacherFeedback": null,
      "parentNotified": true,
      "parentNotificationDate": "2025-11-01T09:30:00.000Z",
      "adaptations": {
        "scaffoldingProvided": ["Fraction wall visual", "Step-by-step guide"],
        "extensionActivities": [],
        "visualSupports": ["Fraction bars", "Interactive whiteboard examples"]
      }
    }
  ],
  "struggePatternsummary": {
    "mostDifficultActivities": ["Word problems", "Multi-step calculations", "Written explanations"],
    "commonChallenges": ["Word problems", "Multi-step calculations", "Written explanations"],
    "needsSupport": ["Consider additional scaffolding", "Multiple struggle areas identified - targeted intervention recommended"]
  }
}
```

---

## 2. Lesson Management API Routes

### 2.1 POST Differentiate Lesson

Auto-differentiate lesson plan for entire class (preview before assignment).

```bash
curl -X POST \
  http://localhost:3000/api/lessons/differentiate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "classRosterId": "class_123",
    "lessonPlan": {
      "title": "Understanding Fractions",
      "subject": "Mathematics",
      "learningObjectives": [
        "Identify numerator and denominator",
        "Compare fractions with same denominator",
        "Represent fractions visually"
      ],
      "activities": [
        {
          "type": "practical",
          "description": "Use fraction bars to represent fractions",
          "duration": 20,
          "materials": ["Fraction bars", "Worksheets", "Interactive whiteboard"]
        },
        {
          "type": "written",
          "description": "Complete fraction comparison exercises",
          "duration": 15,
          "materials": ["Workbook", "Pencils"]
        }
      ],
      "resources": ["Fraction wall poster", "Interactive whiteboard", "Manipulatives"],
      "assessmentCriteria": [
        "Can identify parts of fraction",
        "Can compare fractions correctly",
        "Can represent fractions visually"
      ],
      "estimatedDuration": 60
    },
    "differentiationFocus": ["task_complexity", "scaffolding", "visual_supports"]
  }'
```

**Expected Response:**
```json
{
  "classRosterId": "class_123",
  "className": "Year 5 Blue",
  "totalStudents": 28,
  "originalLesson": {
    "title": "Understanding Fractions",
    "subject": "Mathematics",
    "estimatedDuration": 60
  },
  "differentiatedVersions": [
    {
      "studentId": "student_123",
      "studentName": "Emma Thompson",
      "difficultyLevel": "supported",
      "profileConfidence": 0.85,
      "rationale": "Student shows visual learning preference and needs scaffolding for written tasks. Reading level indicates need for simplified instructions.",
      "adaptations": {
        "objectivesAdjusted": [
          "Identify numerator and denominator (with visual support)",
          "Compare simple fractions with same denominator"
        ],
        "activitiesModified": [
          {
            "originalActivity": "Use fraction bars to represent fractions",
            "modifiedActivity": "Use fraction bars with teacher guidance and visual examples",
            "modification": "Added visual examples and teacher support"
          }
        ],
        "scaffoldingAdded": [
          "Fraction wall on desk",
          "Step-by-step visual guide",
          "Worked examples provided"
        ],
        "extensionsAdded": [],
        "visualSupportsAdded": [
          "Color-coded fraction bars",
          "Visual fraction chart",
          "Picture representations"
        ],
        "timeAdjustment": 20
      },
      "estimatedSuccessRate": 75,
      "warnings": ["Student may need adult support for written activities"]
    }
  ],
  "summary": {
    "difficultyDistribution": {
      "highly_scaffolded": 3,
      "supported": 12,
      "standard": 10,
      "challenging": 3
    },
    "averageEstimatedSuccess": 76.8,
    "studentsRequiringSupport": 15,
    "studentsReadyForExtension": 3
  },
  "readyToAssign": true
}
```

**Best Practices:**
- Review differentiated versions before assignment
- Check warnings for students requiring extra support
- Verify difficulty distribution matches class needs
- Ensure scaffolding is appropriate for each student

### 2.2 POST Assign Lessons

Execute bulk assignment of differentiated lessons to students.

```bash
curl -X POST \
  http://localhost:3000/api/lessons/assign \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "classRosterId": "class_123",
    "assignments": [
      {
        "studentId": "student_123",
        "lessonTitle": "Understanding Fractions",
        "subject": "Mathematics",
        "difficultyLevel": "supported",
        "learningObjectives": [
          "Identify numerator and denominator (with visual support)",
          "Compare simple fractions with same denominator"
        ],
        "activities": [
          {
            "type": "practical",
            "description": "Use fraction bars with teacher guidance",
            "duration": 24,
            "materials": ["Fraction bars", "Visual guide"]
          }
        ],
        "adaptations": {
          "scaffoldingAdded": ["Fraction wall", "Step-by-step guide"],
          "visualSupportsAdded": ["Color-coded bars", "Visual chart"]
        },
        "dueDate": "2025-11-10T00:00:00.000Z",
        "notifyParent": true
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "classRosterId": "class_123",
  "className": "Year 5 Blue",
  "totalAssignments": 28,
  "successfulAssignments": 28,
  "failedAssignments": 0,
  "results": [
    {
      "studentId": "student_123",
      "studentName": "Emma Thompson",
      "success": true,
      "assignmentId": "assignment_new_456",
      "parentNotified": true
    }
  ],
  "summary": {
    "parentsNotified": 25,
    "profilesUpdated": 28,
    "averageProcessingTime": 180
  }
}
```

**Partial Failure Handling:**
If some assignments fail, response will show:
```json
{
  "successfulAssignments": 25,
  "failedAssignments": 3,
  "results": [
    {
      "studentId": "student_456",
      "studentName": "Unknown",
      "success": false,
      "error": "Student not found or access denied"
    }
  ]
}
```

---

## 3. Class Management API Routes

### 3.1 GET Class Students

Full student roster with urgency-based sorting for teacher action.

```bash
curl -X GET \
  http://localhost:3000/api/class/class_123/students \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "classId": "class_123",
  "className": "Year 5 Blue",
  "totalStudents": 28,
  "students": [
    {
      "studentId": "student_789",
      "name": "Jake Wilson",
      "urgencyLevel": "urgent",
      "urgencyReasons": [
        "3 overdue assignment(s)",
        "Low success rate (45%)",
        "Struggling in 2 subject(s)"
      ],
      "hasEhcp": true,
      "primarySendNeed": "ADHD",
      "profileConfidence": 0.72,
      "learningStyle": "kinesthetic",
      "currentReadingLevel": "Year 3",
      "currentMathLevel": "Year 4",
      "recentActivity": {
        "lastAssessmentDate": "2025-09-15T10:00:00.000Z",
        "lastLessonDate": "2025-10-28T09:00:00.000Z",
        "lastInterventionDate": "2025-10-01T11:00:00.000Z",
        "pendingAssignments": 5,
        "overdueAssignments": 3
      },
      "performanceIndicators": {
        "averageSuccessRate": 45,
        "strugglingSubjects": ["Mathematics", "English"],
        "excellingSubjects": []
      },
      "actionableInsights": [
        "Follow up on 3 overdue assignment(s)",
        "Consider intervention for Mathematics, English",
        "Schedule new assessment to update profile"
      ]
    },
    {
      "studentId": "student_123",
      "name": "Emma Thompson",
      "urgencyLevel": "on_track",
      "urgencyReasons": [],
      "hasEhcp": true,
      "primarySendNeed": "Specific Learning Difficulty",
      "profileConfidence": 0.85,
      "learningStyle": "visual",
      "currentReadingLevel": "Year 5",
      "currentMathLevel": "Year 4",
      "recentActivity": {
        "lastAssessmentDate": "2025-10-15T14:00:00.000Z",
        "lastLessonDate": "2025-11-02T09:30:00.000Z",
        "lastInterventionDate": "2025-10-20T11:00:00.000Z",
        "pendingAssignments": 3,
        "overdueAssignments": 0
      },
      "performanceIndicators": {
        "averageSuccessRate": 78,
        "strugglingSubjects": [],
        "excellingSubjects": ["Art", "Science"]
      },
      "actionableInsights": [
        "Excelling in Art, Science - consider extension activities"
      ]
    }
  ],
  "classWideStats": {
    "urgencyBreakdown": {
      "urgent": 2,
      "needs_support": 8,
      "on_track": 15,
      "exceeding": 3
    },
    "averageProfileConfidence": 0.68,
    "studentsWithEhcp": 7,
    "averageSuccessRate": 72.5,
    "mostCommonSendNeed": "Specific Learning Difficulty",
    "studentsNeedingImmediateAction": 10
  },
  "lastUpdated": "2025-11-03T14:30:00.000Z"
}
```

**Use Cases:**
- Morning class overview: "Show me urgent cases"
- Voice query: "Which students need my attention today?"
- Planning: Review students requiring support
- Parent evening prep: Identify celebration highlights

### 3.2 GET Class Automated Actions

View all automated actions with pending approvals.

```bash
curl -X GET \
  "http://localhost:3000/api/class/class_123/actions?status=pending&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

**Query Parameters:**
- `type` - Filter by action type: `lesson_assigned`, `intervention_triggered`, `parent_notified`
- `status` - Filter by approval status: `pending`, `approved`, `rejected`
- `dateFrom` - Filter from date (ISO 8601)
- `dateTo` - Filter to date (ISO 8601)
- `limit` - Results per page (default: 50)
- `offset` - Pagination offset

**Expected Response:**
```json
{
  "classId": "class_123",
  "className": "Year 5 Blue",
  "totalActions": 145,
  "pendingApprovals": 3,
  "actions": [
    {
      "actionId": "action_456",
      "studentId": "student_123",
      "studentName": "Emma Thompson",
      "actionType": "lesson_assigned",
      "triggerReason": "Auto-differentiated lesson assigned based on profile",
      "actionTaken": "{\"lessonTitle\":\"Understanding Fractions\",\"difficultyLevel\":\"supported\"}",
      "success": true,
      "requiresApproval": false,
      "approvalStatus": null,
      "executedBy": "system_auto",
      "executedAt": "2025-11-01T09:00:00.000Z",
      "metadata": {}
    }
  ],
  "summary": {
    "actionsByType": {
      "lesson_assigned": 45,
      "intervention_triggered": 12,
      "parent_notified": 88
    },
    "successRate": 98.5,
    "lastActionDate": "2025-11-03T10:30:00.000Z"
  }
}
```

### 3.3 POST Approve/Reject Action

Approve or reject pending automated actions.

```bash
curl -X POST \
  http://localhost:3000/api/class/class_123/actions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "actionId": "action_456",
    "decision": "approve",
    "reason": "Lesson assignment is appropriate for student current level and learning preferences"
  }'
```

**Decision Options:**
- `approve` - Execute action as proposed
- `reject` - Cancel action
- `modify` - Approve with modifications

**With Modifications:**
```bash
curl -X POST \
  http://localhost:3000/api/class/class_123/actions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "actionId": "action_456",
    "decision": "modify",
    "reason": "Extending deadline due to student absence",
    "modifications": {
      "newDueDate": "2025-11-15T00:00:00.000Z",
      "notifyParent": true,
      "additionalNotes": "Student was absent this week"
    }
  }'
```

**Expected Response:**
```json
{
  "actionId": "action_456",
  "decision": "approve",
  "success": true,
  "message": "Action approved successfully",
  "executedAction": {
    "status": "executed",
    "message": "Lesson assignment confirmed"
  }
}
```

---

## 4. Voice Command API Routes

### 4.1 POST Process Voice Command

Natural language query processing for teachers.

```bash
curl -X POST \
  http://localhost:3000/api/voice/command \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Which students in my Year 5 class are struggling with reading?",
    "inputType": "text",
    "classContext": "class_123"
  }'
```

**Example Queries:**
- "Which students need my attention today?"
- "Show me Emma Thompson progress this week"
- "Who has overdue assignments?"
- "List students with EHCP reviews due this month"
- "What are Jake Wilson strengths?"

**Expected Response:**
```json
{
  "success": true,
  "query": "Which students in my Year 5 class are struggling with reading?",
  "intent": "identify_struggling_students",
  "response": {
    "text": "I found 5 students in Year 5 Blue who are currently struggling with reading:\n\n1. Jake Wilson (Year 3 reading level) - Working on phonics and comprehension\n2. Sarah Ahmed (Year 4 reading level) - Needs support with fluency\n3. Tom Jenkins (Year 4 reading level) - Struggling with inference skills\n\nAll three students have active reading interventions. Would you like more details about their progress?",
    "spoken": "I found 5 students struggling with reading. Jake Wilson, Sarah Ahmed, and Tom Jenkins need your attention. All have active interventions.",
    "data": {
      "students": [
        {
          "id": "student_789",
          "name": "Jake Wilson",
          "readingLevel": "Year 3",
          "struggles": ["Phonics", "Comprehension"],
          "hasIntervention": true
        }
      ]
    }
  },
  "actions": [],
  "suggestions": [
    "Show me Jake Wilson's intervention progress",
    "Schedule reading assessment for these students",
    "Notify parents about reading support"
  ],
  "conversationId": "conv_1730642400000_user_123",
  "processingTime": 245
}
```

**Voice Input Example:**
```bash
curl -X POST \
  http://localhost:3000/api/voice/command \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Show me Emma Thompson progress this week",
    "inputType": "voice",
    "classContext": "class_123",
    "studentContext": "student_123"
  }'
```

### 4.2 POST Quick Actions

Execute instant actions via voice commands.

```bash
curl -X POST \
  http://localhost:3000/api/voice/quick-actions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "actionType": "mark_complete",
    "targetType": "lesson",
    "targetId": "assignment_789",
    "studentId": "student_123",
    "voiceCommand": "Mark Emma maths lesson as complete"
  }'
```

**Quick Action Types:**
- `mark_complete` - Mark lesson/assignment complete
- `mark_in_progress` - Update status to in progress
- `flag_urgent` - Flag student for urgent attention
- `remove_flag` - Remove urgent flag
- `assign_intervention` - Quick intervention assignment
- `schedule_assessment` - Schedule assessment
- `notify_parent` - Send parent notification
- `add_note` - Add teacher note
- `update_difficulty` - Change lesson difficulty
- `extend_deadline` - Extend assignment deadline

**Flag Student as Urgent:**
```bash
curl -X POST \
  http://localhost:3000/api/voice/quick-actions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "actionType": "flag_urgent",
    "targetType": "student",
    "targetId": "student_789",
    "studentId": "student_789",
    "parameters": {
      "urgencyReason": "Multiple overdue assignments and declining performance in core subjects"
    },
    "voiceCommand": "Flag Jake as urgent"
  }'
```

**Extend Deadline:**
```bash
curl -X POST \
  http://localhost:3000/api/voice/quick-actions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "actionType": "extend_deadline",
    "targetType": "lesson",
    "targetId": "assignment_789",
    "studentId": "student_123",
    "parameters": {
      "daysToExtend": 3
    },
    "voiceCommand": "Extend Emma deadline by 3 days"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "actionType": "mark_complete",
  "targetType": "lesson",
  "targetId": "assignment_789",
  "studentName": "Emma Thompson",
  "message": "Marked Understanding Fractions as complete for Emma Thompson",
  "confirmationSpoken": "Understanding Fractions marked complete for Emma",
  "updatedData": {
    "id": "assignment_789",
    "completion_status": "completed",
    "completed_date": "2025-11-03T14:30:00.000Z"
  },
  "nextSuggestions": [
    "Add feedback for Emma",
    "Assign next Mathematics lesson",
    "View Emma's progress"
  ]
}
```

---

## 5. Parent Portal API Routes

### 5.1 GET Parent Portal View

Secure parent access to their child's progress (plain English).

```bash
curl -X GET \
  http://localhost:3000/api/parent/portal/student_123 \
  -H "Authorization: Bearer $PARENT_TOKEN"
```

**CRITICAL:** Only parents with verified parent-child relationship can access. Any unauthorized attempt is logged as security violation.

**Expected Response:**
```json
{
  "childId": "student_123",
  "childName": "Emma Thompson",
  "parentName": "Sarah Thompson",
  "progressSummary": {
    "overallMessage": "Emma is making good, steady progress. She's working hard and developing her skills well.",
    "recentAchievements": [
      "Excellent work in Science: Understanding States of Matter",
      "Excellent work in Art: Perspective Drawing",
      "Completed 18 lessons with dedication"
    ],
    "currentFocus": "Building confidence with written expression",
    "areasOfGrowth": [
      "Working on: learns best through hands-on activities",
      "Working on: sometimes needs reminders for multi-step tasks"
    ]
  },
  "recentLessons": [
    {
      "subject": "Mathematics",
      "title": "Understanding Fractions",
      "completedDate": null,
      "successLevel": "good",
      "teacherComment": null
    }
  ],
  "strengthsAndSupport": {
    "strengths": [
      "learns best by seeing and observing",
      "Verbal communication",
      "Problem solving"
    ],
    "workingOn": [
      "Developing learns best through hands-on activities",
      "Developing sometimes needs reminders for multi-step tasks"
    ],
    "supportProvided": [
      "Tailored support plan in place",
      "Classroom adjustments to support learning",
      "Regular progress monitoring"
    ]
  },
  "homeReinforcement": {
    "suggestedActivities": [
      "Read together for 10-15 minutes daily",
      "Practice counting and number games",
      "Encourage questions and curiosity"
    ],
    "practiceAreas": [
      "Gentle practice with written expression",
      "Gentle practice with time management"
    ],
    "celebrationHighlights": [
      "Excellent work in Science: Understanding States of Matter",
      "Excellent work in Art: Perspective Drawing"
    ]
  },
  "upcomingMilestones": [
    {
      "type": "Lesson",
      "description": "English: Creative Writing Workshop",
      "date": "2025-11-08T00:00:00.000Z"
    }
  ],
  "teacherContact": {
    "teacherName": "Ms. Roberts",
    "lastMessageDate": "2025-10-28T15:00:00.000Z",
    "unreadMessages": 2
  },
  "lastUpdated": "2025-11-03T14:30:00.000Z"
}
```

**Security Features:**
- Parent-child relationship verified before ANY data returned
- Education jargon translated to plain English
- Celebration-focused framing
- No data leakage from other students
- All access logged for GDPR audit

### 5.2 GET Parent Messages

View message thread with teacher.

```bash
curl -X GET \
  "http://localhost:3000/api/parent/messages?childId=student_123&limit=20" \
  -H "Authorization: Bearer $PARENT_TOKEN"
```

**Expected Response:**
```json
{
  "totalMessages": 15,
  "unreadCount": 2,
  "messages": [
    {
      "messageId": "msg_456",
      "from": {
        "userId": "teacher_789",
        "name": "Ms. Roberts",
        "role": "teacher"
      },
      "to": {
        "userId": "parent_123",
        "name": "Sarah Thompson",
        "role": "parent"
      },
      "subject": "Emma's Progress in Mathematics",
      "body": "Hi Sarah, I wanted to let you know that Emma is making excellent progress with fractions. She's really engaged with the practical activities and her confidence is growing. Keep up the great work with practice at home!",
      "sentAt": "2025-10-28T15:00:00.000Z",
      "isRead": false,
      "readAt": null,
      "childName": "Emma Thompson"
    }
  ]
}
```

### 5.3 POST Send Message to Teacher

Parent sends message about their child.

```bash
curl -X POST \
  http://localhost:3000/api/parent/messages \
  -H "Authorization: Bearer $PARENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "childId": "student_123",
    "subject": "Question about homework",
    "body": "Hi Ms. Roberts, I wanted to ask about the maths homework due next week. Emma is finding the fraction word problems quite challenging. Could you provide some guidance on how to help at home? Thank you!"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "messageId": "msg_new_789",
  "sentTo": {
    "teacherName": "Ms. Roberts",
    "role": "teacher"
  },
  "message": "Your message has been sent to Ms. Roberts. They will respond as soon as possible."
}
```

**Auto-Routing:** Message automatically routed to child's current class teacher.

---

## 6. Multi-Agency API Routes

### 6.1 GET Multi-Agency View

Role-based view for multi-agency collaboration.

**Teacher View:**
```bash
curl -X GET \
  "http://localhost:3000/api/multi-agency/view?classId=class_123" \
  -H "Authorization: Bearer $TEACHER_TOKEN"
```

**EP View (Cross-School):**
```bash
curl -X GET \
  "http://localhost:3000/api/multi-agency/view?assigned=true" \
  -H "Authorization: Bearer $EP_TOKEN"
```

**Head Teacher View (School-Wide):**
```bash
curl -X GET \
  "http://localhost:3000/api/multi-agency/view?schoolWide=true" \
  -H "Authorization: Bearer $HEAD_TOKEN"
```

**Expected Response:**
```json
{
  "userRole": "teacher",
  "accessLevel": "class_level",
  "students": [
    {
      "id": "student_123",
      "name": "Emma Thompson",
      "sendNeed": "Specific Learning Difficulty",
      "ehcpStatus": "maintained",
      "profileSummary": {
        "learningStyle": "visual",
        "readingLevel": "Year 5",
        "recentProgress": "good"
      }
    }
  ],
  "summary": {
    "totalStudents": 28,
    "accessibleStudents": 28,
    "dataTransformationsApplied": [
      "Full detail view for class teacher",
      "Assessment results included",
      "Intervention data accessible"
    ]
  },
  "allowedActions": [
    "view_profile",
    "assign_lesson",
    "update_progress",
    "message_parent",
    "schedule_assessment"
  ]
}
```

**Privacy Transformations by Role:**
- **Teacher:** Full access to own class students
- **Head Teacher:** School-wide access with sensitive data
- **EP:** Cross-school access to assigned students only
- **Secondary Teacher:** Transition-focused view (receiving students)

### 6.2 GET EP Dashboard

Educational Psychologist cross-school dashboard.

```bash
curl -X GET \
  "http://localhost:3000/api/multi-agency/ep-dashboard?urgency=urgent" \
  -H "Authorization: Bearer $EP_TOKEN"
```

**Query Parameters:**
- `urgency` - Filter by urgency: `urgent`, `high`, `medium`, `low`
- `school` - Filter by tenant_id
- `limit` - Results limit (default: 100)

**Expected Response:**
```json
{
  "epName": "Dr. James Patterson",
  "totalCaseload": 45,
  "casesByUrgency": {
    "urgent": 3,
    "high": 12,
    "medium": 25,
    "low": 5
  },
  "casesBySchool": {
    "Oakwood Primary": 18,
    "Riverside Academy": 15,
    "St. Mary's School": 12
  },
  "cases": [
    {
      "studentId": "student_789",
      "studentName": "Jake Wilson",
      "schoolName": "Oakwood Primary",
      "tenantId": "tenant_123",
      "urgencyLevel": "urgent",
      "urgencyReasons": [
        "EHCP review overdue by 15 days",
        "No assessment in 120 days"
      ],
      "ehcpStatus": {
        "hasEhcp": true,
        "ehcpStage": "maintained",
        "reviewDueDate": "2025-10-15T00:00:00.000Z",
        "daysUntilReview": -15
      },
      "primarySendNeed": "ADHD",
      "latestAssessment": {
        "date": "2025-06-10T10:00:00.000Z",
        "type": "Cognitive Assessment",
        "summary": "Working memory below average, processing speed average"
      },
      "activeInterventions": {
        "count": 2,
        "types": ["Attention Training", "Social Skills Group"],
        "effectiveness": "high"
      },
      "lastContactDate": "2025-09-20T14:00:00.000Z",
      "nextScheduledAction": {
        "type": "EHCP Annual Review",
        "date": "2025-10-15T00:00:00.000Z"
      },
      "keyInsights": [
        "2 active intervention(s)",
        "EHCP maintained",
        "Assessment may need updating"
      ]
    }
  ],
  "upcomingReviews": [
    {
      "studentName": "Sarah Ahmed",
      "schoolName": "Riverside Academy",
      "reviewType": "EHCP Annual Review",
      "dueDate": "2025-11-08T00:00:00.000Z"
    }
  ],
  "crossSchoolTrends": {
    "mostCommonSendNeed": "Specific Learning Difficulty",
    "averageInterventionEffectiveness": 72.5,
    "studentsAwaitingEhcp": 8,
    "overdueReviews": 3
  },
  "actionRequired": {
    "urgentCases": 3,
    "overdueAssessments": 5,
    "reviewsDueThisWeek": 2
  },
  "lastUpdated": "2025-11-03T14:30:00.000Z"
}
```

**EP Dashboard Features:**
- Cross-tenant student aggregation
- Urgent case prioritization
- EHCP due date tracking
- Intervention effectiveness monitoring
- Cross-school trend analysis

---

## Testing Checklist

### Authentication & Authorization
- [ ] Valid token returns 200
- [ ] Missing token returns 401
- [ ] Expired token returns 401
- [ ] Wrong role returns 403
- [ ] Cross-tenant access blocked

### Student Profile Routes
- [ ] GET profile returns complete data
- [ ] PATCH profile updates successfully
- [ ] Manual adjustments logged
- [ ] Confidence score increases
- [ ] GET lessons filters correctly
- [ ] Struggle patterns calculated

### Lesson Management
- [ ] Differentiation generates for all students
- [ ] Difficulty distribution appropriate
- [ ] Assignment executes successfully
- [ ] Partial failures handled
- [ ] Parent notifications sent

### Class Management
- [ ] Students sorted by urgency
- [ ] Class stats accurate
- [ ] Actions filtered correctly
- [ ] Approval executes action
- [ ] Rejection cancels action

### Voice Commands
- [ ] Natural language processed
- [ ] Intent detected correctly
- [ ] Data returned accurate
- [ ] Quick actions execute
- [ ] Suggestions relevant

### Parent Portal
- [ ] Parent-child link verified
- [ ] Unauthorized access blocked
- [ ] Jargon translated
- [ ] Messages routed correctly
- [ ] Auto-route to teacher

### Multi-Agency
- [ ] Role-based filtering applied
- [ ] EP cross-school access works
- [ ] Data transformations correct
- [ ] Urgent cases prioritized
- [ ] Trends calculated accurately

### GDPR & Audit
- [ ] All access logged
- [ ] Security violations logged
- [ ] PII handling compliant
- [ ] Audit trail complete

### Performance
- [ ] Response time < 2s
- [ ] Bulk operations < 5s
- [ ] Database queries optimized
- [ ] No N+1 queries

---

## Common Issues & Troubleshooting

### 401 Unauthorized
**Cause:** Invalid or expired token
**Solution:** Re-authenticate and get fresh token

### 403 Forbidden
**Cause:** Insufficient role permissions
**Solution:** Verify user role matches endpoint requirements

### 404 Not Found
**Cause:** Resource doesn't exist or cross-tenant access
**Solution:** Verify IDs and tenant ownership

### 400 Validation Failed
**Cause:** Invalid request body
**Solution:** Check required fields and data types

### 500 Internal Server Error
**Cause:** Database or service error
**Solution:** Check logs, verify Prisma connection

---

## Next Steps

1. Set up automated API testing with Jest
2. Implement rate limiting (10 req/min for parent portal)
3. Add response caching for frequently accessed data
4. Implement WebSocket for real-time updates
5. Add email notifications for parent messages
6. Create Postman collection for easier testing

---

**Last Updated:** 2025-11-03
**Phase:** 2 Block 2
**Status:** COMPLETE
