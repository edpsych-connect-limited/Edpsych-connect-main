# EdPsych Connect World - API Reference Guide

**Version:** 1.0.0
**Base URL:** `https://edpsychconnect.world/api`
**Authentication:** Bearer JWT tokens

---

## Table of Contents

1. [Authentication](#authentication)
2. [Assessments](#assessments)
3. [EHCP Management](#ehcp-management)
4. [Interventions](#interventions)
5. [Training & CPD](#training--cpd)
6. [Help Center](#help-center)
7. [Blog](#blog)
8. [Users & Organizations](#users--organizations)
9. [Error Handling](#error-handling)
10. [Rate Limiting](#rate-limiting)

---

## Authentication

### POST /api/auth/login

Authenticate user and receive JWT tokens.

**Request Body:**
```json
{
  "email": "ep@school.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "user_123",
    "email": "ep@school.com",
    "name": "Dr. Jane Smith",
    "role": "educational_psychologist",
    "organization_id": "org_456"
  },
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "expires_in": 900
}
```

**Errors:**
- `401`: Invalid credentials
- `429`: Rate limit exceeded (5 attempts per 15 minutes)

---

### POST /api/auth/logout

Invalidate current tokens.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

### POST /api/auth/refresh

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGc..."
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGc...",
  "expires_in": 900
}
```

**Errors:**
- `401`: Invalid or expired refresh token

---

### GET /api/auth/me

Get current user profile.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "id": "user_123",
  "email": "ep@school.com",
  "name": "Dr. Jane Smith",
  "role": "educational_psychologist",
  "organization": {
    "id": "org_456",
    "name": "Riverside School",
    "type": "school"
  },
  "subscription": {
    "tier": "professional",
    "status": "active",
    "expires_at": "2026-01-01T00:00:00Z"
  },
  "onboarding_completed": true
}
```

---

## Assessments

### GET /api/assessments

List all assessments for current user.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `framework` (optional): Filter by framework ID
- `status` (optional): `draft`, `in_progress`, `completed`
- `page` (optional, default: 1)
- `limit` (optional, default: 20, max: 100)

**Response (200):**
```json
{
  "assessments": [
    {
      "id": "assess_789",
      "framework_id": "ecca_v1",
      "framework_name": "ECCA Framework",
      "student_name": "John Doe",
      "student_age": 8,
      "status": "in_progress",
      "created_at": "2025-10-15T10:00:00Z",
      "updated_at": "2025-10-20T15:30:00Z",
      "progress": 45
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

---

### POST /api/assessments

Create new assessment instance.

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "framework_id": "ecca_v1",
  "student_name": "John Doe",
  "student_age": 8,
  "student_dob": "2017-03-15",
  "school_name": "Riverside Primary",
  "year_group": "Year 3",
  "reason_for_referral": "Concerns about working memory and attention",
  "context": {
    "previous_assessments": "WISC-V in Year 1",
    "current_provision": "Small group literacy support"
  }
}
```

**Response (201):**
```json
{
  "id": "assess_790",
  "framework_id": "ecca_v1",
  "student_name": "John Doe",
  "status": "draft",
  "created_at": "2025-11-03T12:00:00Z"
}
```

**Errors:**
- `400`: Invalid request data
- `404`: Framework not found

---

### GET /api/assessments/[id]

Get assessment details.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "id": "assess_789",
  "framework": {
    "id": "ecca_v1",
    "name": "ECCA Framework",
    "version": "1.0",
    "domains": [
      {
        "id": "working_memory",
        "name": "Working Memory & Information Processing",
        "indicators": [...]
      }
    ]
  },
  "student_name": "John Doe",
  "student_age": 8,
  "status": "in_progress",
  "responses": {
    "working_memory": {
      "observations": "...",
      "ratings": {...}
    }
  },
  "collaborations": [
    {
      "id": "collab_123",
      "contributor_type": "parent",
      "contributor_email": "parent@email.com",
      "status": "pending",
      "invited_at": "2025-10-16T10:00:00Z"
    }
  ],
  "created_at": "2025-10-15T10:00:00Z",
  "updated_at": "2025-10-20T15:30:00Z"
}
```

**Errors:**
- `404`: Assessment not found
- `403`: Not authorized to access this assessment

---

### PUT /api/assessments/[id]

Update assessment responses.

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "in_progress",
  "responses": {
    "working_memory": {
      "observations": "John demonstrates difficulty holding verbal instructions in mind...",
      "ratings": {
        "verbal_memory": 3,
        "visual_memory": 4,
        "dual_task": 2
      },
      "test_teach_retest": {
        "initial_score": 65,
        "taught_strategy": "Chunking and rehearsal",
        "retest_score": 82,
        "learning_potential": "high"
      }
    }
  }
}
```

**Response (200):**
```json
{
  "id": "assess_789",
  "status": "in_progress",
  "updated_at": "2025-10-20T16:00:00Z"
}
```

---

### DELETE /api/assessments/[id]

Soft delete assessment (marks as deleted, doesn't remove data).

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "message": "Assessment deleted successfully"
}
```

---

### POST /api/assessments/collaborations

Send collaboration invitation.

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "instance_id": "assess_789",
  "contributor_type": "parent",
  "contributor_name": "Sarah Doe",
  "contributor_email": "sarah.doe@email.com",
  "relationship_to_child": "Mother",
  "message": "We would value your insights about John's learning at home."
}
```

**Response (201):**
```json
{
  "id": "collab_124",
  "invitation_token": "a1b2c3d4e5f6...",
  "invitation_url": "https://edpsychconnect.world/collaborate/a1b2c3d4e5f6...",
  "expires_at": "2025-11-03T12:00:00Z",
  "email_sent": true
}
```

---

### GET /api/assessments/collaborations/[token]

Get collaboration form data (PUBLIC - no auth required).

**Response (200):**
```json
{
  "collaboration": {
    "id": "collab_124",
    "contributor_type": "parent",
    "contributor_name": "Sarah Doe",
    "student_name": "John Doe",
    "student_age": 8
  },
  "framework": {
    "name": "ECCA Framework",
    "domains": [
      {
        "id": "working_memory",
        "name": "Working Memory & Information Processing",
        "questions": [
          {
            "id": "freq_challenges",
            "question": "How often does your child forget instructions?",
            "type": "scale",
            "options": ["Never", "Rarely", "Sometimes", "Often", "Very Often"]
          }
        ]
      }
    ]
  },
  "existing_responses": {}
}
```

**Errors:**
- `404`: Invalid token
- `410`: Token expired
- `409`: Already submitted

---

### POST /api/assessments/collaborations/[token]

Submit collaboration responses (PUBLIC - no auth required).

**Request Body:**
```json
{
  "responses": {
    "working_memory": {
      "freq_challenges": "Often",
      "specific_examples": "Forgets multi-step instructions, loses track of homework tasks",
      "strengths": "Good with visual reminders and checklists"
    }
  },
  "narrative": "Overall, John struggles most with verbal instructions but responds well to visual supports..."
}
```

**Response (200):**
```json
{
  "message": "Responses submitted successfully",
  "collaboration_id": "collab_124"
}
```

---

### PUT /api/assessments/collaborations/[token]

Save draft (partial submission).

**Request Body:**
```json
{
  "responses": {
    "working_memory": {
      "freq_challenges": "Often"
    }
  }
}
```

**Response (200):**
```json
{
  "message": "Draft saved successfully"
}
```

---

## EHCP Management

### GET /api/ehcp

List all EHCPs.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `status` (optional): `draft`, `active`, `under_review`, `archived`
- `child_name` (optional): Search by name
- `page`, `limit`

**Response (200):**
```json
{
  "ehcps": [
    {
      "id": "ehcp_456",
      "child_name": "Emma Johnson",
      "child_dob": "2015-06-12",
      "status": "active",
      "annual_review_due": "2026-03-15",
      "created_at": "2024-03-15T10:00:00Z",
      "last_reviewed": "2025-03-15T10:00:00Z"
    }
  ],
  "pagination": {...}
}
```

---

### POST /api/ehcp

Create new EHCP.

**Request Body:**
```json
{
  "child_name": "Emma Johnson",
  "child_dob": "2015-06-12",
  "school": "Oakwood Primary",
  "sections": {
    "section_a_child_views": {
      "direct_quotes": ["I like art and music", "Maths is hard for me"],
      "preferences": "Small group work",
      "aspirations": "To become an artist"
    },
    "section_b_needs": {
      "cognition_learning": "Emma has specific learning difficulties affecting literacy...",
      "communication": "No significant concerns",
      "sensory_physical": "Requires visual aids",
      "social_emotional": "Benefits from structured routine"
    }
  }
}
```

**Response (201):**
```json
{
  "id": "ehcp_457",
  "child_name": "Emma Johnson",
  "status": "draft",
  "created_at": "2025-11-03T12:00:00Z"
}
```

---

### GET /api/ehcp/[id]

Get EHCP details including all sections.

**Response (200):**
```json
{
  "id": "ehcp_456",
  "child_name": "Emma Johnson",
  "child_dob": "2015-06-12",
  "status": "active",
  "sections": {
    "section_a_child_views": {...},
    "section_b_needs": {...},
    "section_c_health": {...},
    "section_d_social_care": {...},
    "section_e_outcomes": [
      {
        "id": "outcome_1",
        "area": "Literacy",
        "outcome": "Increase reading age by 6 months over academic year",
        "success_criteria": "NGRT assessment",
        "review_date": "2026-07-01"
      }
    ],
    "section_f_provision": [
      {
        "need": "Literacy difficulties",
        "provision": "20 minutes daily 1:1 phonics intervention (Read Write Inc.)",
        "provider": "Trained TA",
        "frequency": "Daily",
        "monitoring": "Termly progress reviews"
      }
    ],
    "section_g_placement": {...},
    "section_h_personal_budget": {...}
  },
  "annual_reviews": [
    {
      "date": "2025-03-15",
      "outcomes_met": true,
      "amendments": "Increased literacy support from 15 to 20 minutes"
    }
  ]
}
```

---

### PUT /api/ehcp/[id]

Update EHCP section.

**Request Body:**
```json
{
  "section": "section_e_outcomes",
  "data": {
    "outcomes": [...]
  }
}
```

**Response (200):**
```json
{
  "id": "ehcp_456",
  "updated_at": "2025-11-03T12:30:00Z"
}
```

---

### POST /api/ehcp/[id]/annual-review

Create annual review.

**Request Body:**
```json
{
  "review_date": "2026-03-15",
  "outcomes_progress": [
    {
      "outcome_id": "outcome_1",
      "met": true,
      "evidence": "Reading age increased by 8 months (exceeded target)",
      "next_steps": "Continue current provision"
    }
  ],
  "amendments_needed": true,
  "amendments": [
    {
      "section": "section_f_provision",
      "change": "Increase literacy support to 25 minutes daily"
    }
  ]
}
```

**Response (201):**
```json
{
  "review_id": "review_123",
  "ehcp_id": "ehcp_456",
  "review_date": "2026-03-15",
  "next_review_due": "2027-03-15"
}
```

---

## Interventions

### GET /api/interventions

List all interventions.

**Query Parameters:**
- `category`: `literacy`, `numeracy`, `sel`, `behavior`, `executive_function`
- `evidence_rating`: `strong`, `moderate`, `emerging`
- `age`: Target age (returns interventions suitable for this age)
- `search`: Text search

**Response (200):**
```json
{
  "interventions": [
    {
      "id": "phon-int-prog",
      "name": "Phonics Intervention Programme",
      "category": "literacy",
      "evidence_rating": "strong",
      "effect_size": 0.54,
      "target_age": [5, 11],
      "duration_weeks": 12,
      "frequency": "daily",
      "description": "Systematic synthetic phonics approach...",
      "evidence_sources": [
        "EEF Teaching and Learning Toolkit",
        "What Works Clearinghouse"
      ]
    }
  ],
  "total": 45
}
```

---

### GET /api/interventions/[id]

Get detailed intervention information.

**Response (200):**
```json
{
  "id": "phon-int-prog",
  "name": "Phonics Intervention Programme",
  "category": "literacy",
  "evidence_rating": "strong",
  "effect_size": 0.54,
  "confidence_interval": [0.42, 0.66],
  "target_age": [5, 11],
  "duration_weeks": 12,
  "frequency": "daily",
  "session_length": 20,
  "group_size": "1:1 or 1:3",
  "description": "Systematic synthetic phonics approach for struggling readers...",
  "implementation": {
    "overview": "Structured programme teaching systematic phonics...",
    "phases": [
      {
        "name": "Phase 1: Foundation",
        "weeks": "1-4",
        "focus": "CVC words, blending, segmenting",
        "activities": [...]
      }
    ],
    "materials_needed": [
      "Phonics cards",
      "Decodable books",
      "Progress tracking sheets"
    ],
    "training_required": "2-hour initial training",
    "cost": "£150 for materials"
  },
  "fidelity_checklist": [
    "Sessions delivered daily for 20 minutes",
    "Systematic progression through phases",
    "Regular assessment and adjustment"
  ],
  "progress_monitoring": {
    "frequency": "Weekly",
    "measures": ["Phonics screening check", "Reading fluency", "Comprehension"],
    "decision_rules": "If no progress after 4 weeks, consider alternative approach"
  },
  "evidence_sources": [
    {
      "study": "Torgerson et al. (2019)",
      "finding": "Effect size +0.54 for phonics interventions",
      "url": "https://..."
    }
  ]
}
```

---

### POST /api/interventions/[id]/implement

Start implementation plan.

**Request Body:**
```json
{
  "student_id": "student_789",
  "student_name": "John Doe",
  "start_date": "2025-11-10",
  "provider": "Mrs. Smith (TA)",
  "group_size": 1,
  "customizations": "Extended Phase 1 to 6 weeks due to baseline assessment",
  "baseline_data": {
    "phonics_screening": 15,
    "reading_age": "6.2 years"
  }
}
```

**Response (201):**
```json
{
  "implementation_id": "impl_456",
  "intervention_id": "phon-int-prog",
  "student_id": "student_789",
  "start_date": "2025-11-10",
  "expected_end_date": "2026-02-02",
  "status": "active"
}
```

---

## Training & CPD

### GET /api/training/courses

List all courses.

**Query Parameters:**
- `category`: `assessment`, `intervention`, `ehcp`, `cpd`, `specialist`
- `duration`: Max duration in hours
- `search`: Text search

**Response (200):**
```json
{
  "courses": [
    {
      "id": "ecca-training",
      "title": "ECCA Assessment Training",
      "category": "assessment",
      "duration_hours": 12,
      "cpd_hours": 12,
      "level": "intermediate",
      "price": 29900,
      "currency": "GBP",
      "instructor": "Dr. Scott Ighavongbe-Patrick",
      "rating": 4.8,
      "enrollments": 234,
      "description": "Comprehensive training on the ECCA framework...",
      "learning_outcomes": [
        "Administer ECCA assessment confidently",
        "Interpret results and generate reports",
        "Understand theoretical foundations"
      ]
    }
  ],
  "total": 15
}
```

---

### GET /api/training/courses/[id]

Get detailed course information.

**Response (200):**
```json
{
  "id": "ecca-training",
  "title": "ECCA Assessment Training",
  "description": "...",
  "modules": [
    {
      "id": "module_1",
      "title": "Introduction to ECCA",
      "lessons": [
        {
          "id": "lesson_1",
          "title": "Theoretical Foundations",
          "type": "video",
          "duration_minutes": 25,
          "resources": [
            {
              "title": "Vygotsky Reading",
              "type": "pdf",
              "url": "..."
            }
          ]
        }
      ],
      "quiz": {
        "id": "quiz_1",
        "questions": 10,
        "pass_mark": 80
      }
    }
  ],
  "certificate": {
    "type": "CPD Certificate",
    "cpd_hours": 12,
    "accreditation": "BPS Approved"
  }
}
```

---

### POST /api/training/enrollments

Enroll in course.

**Request Body:**
```json
{
  "course_id": "ecca-training"
}
```

**Response (201):**
```json
{
  "enrollment_id": "enroll_789",
  "course_id": "ecca-training",
  "enrolled_at": "2025-11-03T12:00:00Z",
  "expires_at": "2026-11-03T12:00:00Z",
  "progress": 0
}
```

---

### PUT /api/training/enrollments/[id]

Update progress.

**Request Body:**
```json
{
  "completed_lessons": ["lesson_1", "lesson_2"],
  "quiz_scores": {
    "quiz_1": 85
  },
  "notes": "Completed Module 1"
}
```

**Response (200):**
```json
{
  "enrollment_id": "enroll_789",
  "progress": 15,
  "next_lesson": "lesson_3",
  "certificate_eligible": false
}
```

---

### GET /api/training/certificates/[userId]

Get user certificates.

**Response (200):**
```json
{
  "certificates": [
    {
      "id": "cert_123",
      "course_title": "ECCA Assessment Training",
      "cpd_hours": 12,
      "completed_at": "2025-09-15T10:00:00Z",
      "certificate_number": "ECCA-2025-0234",
      "download_url": "https://..."
    }
  ]
}
```

---

## Help Center

### GET /api/help

Browse help content.

**Query Parameters:**
- `type`: `categories`, `articles`, `faqs`, `search`, `featured`
- `q`: Search query (when type=search)
- `category`: Filter by category slug

**Examples:**

Get all categories:
```
GET /api/help?type=categories
```

Search articles:
```
GET /api/help?type=search&q=assessment
```

Get articles in category:
```
GET /api/help?type=articles&category=getting-started
```

**Response (200) - Categories:**
```json
{
  "categories": [
    {
      "id": "cat_1",
      "name": "Getting Started",
      "slug": "getting-started",
      "icon": "🚀",
      "description": "New to the platform? Start here",
      "_count": {
        "articles": 8
      }
    }
  ]
}
```

**Response (200) - Search:**
```json
{
  "articles": [
    {
      "id": "article_1",
      "title": "How to Create Your First Assessment",
      "slug": "create-first-assessment",
      "excerpt": "Step-by-step guide...",
      "category": {
        "name": "Assessments",
        "slug": "assessments",
        "icon": "📋"
      },
      "views": 342,
      "is_featured": true
    }
  ],
  "query": "assessment"
}
```

---

### GET /api/help/[slug]

Get article details (increments view count).

**Response (200):**
```json
{
  "article": {
    "id": "article_1",
    "title": "How to Create Your First Assessment",
    "slug": "create-first-assessment",
    "content": "# How to Create Your First Assessment\n\n...",
    "excerpt": "Step-by-step guide...",
    "category": {
      "name": "Assessments",
      "icon": "📋"
    },
    "author": "Support Team",
    "views": 343,
    "helpful_yes": 45,
    "helpful_no": 2,
    "created_at": "2025-10-01T10:00:00Z",
    "updated_at": "2025-10-15T14:00:00Z"
  },
  "relatedArticles": [...]
}
```

---

### POST /api/help/[slug]

Submit article feedback.

**Request Body:**
```json
{
  "helpful": true
}
```

**Response (200):**
```json
{
  "success": true,
  "helpful_yes": 46,
  "helpful_no": 2
}
```

---

## Blog

### GET /api/blog

Browse blog posts.

**Query Parameters:**
- `type`: `posts`, `categories`, `tags`, `search`, `featured`
- `q`: Search query
- `category`: Category slug
- `tag`: Tag slug
- `page`, `limit`

**Response (200) - Posts:**
```json
{
  "posts": [
    {
      "id": "post_1",
      "title": "Introducing the ECCA Framework",
      "slug": "introducing-ecca-framework",
      "excerpt": "Discover our proprietary evidence-based...",
      "featured_image": "https://...",
      "category": {
        "name": "Platform Updates",
        "slug": "platform-updates",
        "color": "#3B82F6"
      },
      "tags": [
        {"name": "Assessment", "slug": "assessment"}
      ],
      "author_name": "Dr. Scott Ighavongbe-Patrick",
      "published_at": "2025-10-15T10:00:00Z",
      "reading_time": 5,
      "views": 1234,
      "is_featured": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 45,
    "pages": 4
  }
}
```

---

### GET /api/blog/[slug]

Get post details (increments view count).

**Response (200):**
```json
{
  "post": {
    "id": "post_1",
    "title": "Introducing the ECCA Framework",
    "content": "# Introducing the ECCA Framework\n\n...",
    "category": {...},
    "tags": [...],
    "author_name": "Dr. Scott Ighavongbe-Patrick",
    "author_bio": "Lead Educational Psychologist...",
    "author_email": "sarah.mitchell@edpsychconnect.world",
    "published_at": "2025-10-15T10:00:00Z",
    "reading_time": 5,
    "views": 1235,
    "comments": [
      {
        "id": "comment_1",
        "author_name": "John Smith",
        "content": "Great article! Very helpful.",
        "created_at": "2025-10-16T09:00:00Z",
        "is_approved": true
      }
    ]
  },
  "relatedPosts": [...]
}
```

---

### POST /api/blog/[slug]

Submit comment (requires manual approval).

**Request Body:**
```json
{
  "author_name": "Jane Doe",
  "author_email": "jane@email.com",
  "content": "Thank you for this insightful article!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Comment submitted and awaiting approval",
  "comment": {
    "id": "comment_2",
    "author_name": "Jane Doe",
    "created_at": "2025-11-03T12:00:00Z"
  }
}
```

---

## Users & Organizations

### GET /api/users/profile

Get current user profile (alias for /api/auth/me).

### PUT /api/users/profile

Update user profile.

**Request Body:**
```json
{
  "name": "Dr. Jane Smith-Jones",
  "bio": "Educational Psychologist specializing in...",
  "qualifications": "CPsychol, AFBPsS, HCPC Registered",
  "preferences": {
    "email_notifications": true,
    "newsletter": true
  }
}
```

---

### GET /api/users/onboarding

Get onboarding status.

**Response (200):**
```json
{
  "onboarding_completed": false,
  "onboarding_step": 2,
  "onboarding_started_at": "2025-11-01T10:00:00Z"
}
```

---

### PUT /api/users/onboarding

Update onboarding progress.

**Request Body:**
```json
{
  "step": 3,
  "data": {
    "role": "educational_psychologist",
    "organization_type": "school",
    "primary_focus": ["assessment", "intervention"]
  }
}
```

---

### POST /api/users/onboarding

Complete onboarding.

**Response (200):**
```json
{
  "onboarding_completed": true,
  "onboarding_completed_at": "2025-11-03T12:00:00Z"
}
```

---

## Error Handling

All API endpoints return consistent error responses:

**Error Response Format:**
```json
{
  "error": "Resource not found",
  "code": "RESOURCE_NOT_FOUND",
  "details": {
    "resource": "assessment",
    "id": "assess_999"
  },
  "timestamp": "2025-11-03T12:00:00Z"
}
```

### HTTP Status Codes

- `200`: Success
- `201`: Created
- `204`: No Content (successful deletion)
- `400`: Bad Request (invalid input)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate resource)
- `410`: Gone (expired resource)
- `422`: Unprocessable Entity (validation failed)
- `429`: Too Many Requests (rate limited)
- `500`: Internal Server Error

### Common Error Codes

- `INVALID_CREDENTIALS`: Login failed
- `TOKEN_EXPIRED`: Access token expired
- `TOKEN_INVALID`: Malformed or invalid token
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
- `PERMISSION_DENIED`: Insufficient permissions
- `VALIDATION_ERROR`: Input validation failed
- `DUPLICATE_RESOURCE`: Resource already exists

---

## Rate Limiting

Rate limits are applied per user/IP address:

**Standard Limits:**
- Authentication: 5 attempts per 15 minutes
- Read operations (GET): 100 requests per minute
- Write operations (POST/PUT): 30 requests per minute
- Delete operations: 10 requests per minute

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1699012800
```

**Rate Limit Exceeded Response (429):**
```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "retry_after": 45,
  "timestamp": "2025-11-03T12:00:00Z"
}
```

---

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response Format:**
```json
{
  "items": [...],
  "pagination": {
    "total": 145,
    "page": 2,
    "limit": 20,
    "pages": 8,
    "has_next": true,
    "has_prev": true
  }
}
```

---

## Webhooks

Stripe webhook for subscription events:

**POST /api/webhooks/stripe**
- Handles: `customer.subscription.created`, `updated`, `deleted`
- Signature verification required
- Updates user subscription status

---

## Versioning

API versioning via URL path (when v2 released):
- Current: `/api/...`
- Future: `/api/v2/...`

---

**Document Version:** 1.0.0
**Last Updated:** November 3, 2025
**Contact:** api@edpsychconnect.world
