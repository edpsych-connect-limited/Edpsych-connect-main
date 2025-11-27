# EdPsych Connect API Documentation

> **Version:** 1.0.0  
> **Base URL:** `https://www.edpsychconnect.com/api`  
> **Last Updated:** November 2025

## Overview

EdPsych Connect provides a comprehensive REST API for educational psychology assessments, student management, and collaborative workflows. All API endpoints are protected by authentication and rate limiting.

---

## Authentication

### Session-Based Authentication

EdPsych Connect uses session-based authentication with secure HTTP-only cookies.

```bash
# Login
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password",
  "rememberMe": true
}

# Response
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "TEACHER"
  }
}
```

### Get Current Session

```bash
GET /api/auth/session

# Response (authenticated)
{
  "authenticated": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "TEACHER"
  }
}

# Response (not authenticated)
{
  "authenticated": false,
  "user": null
}
```

### Logout

```bash
POST /api/auth/logout

# Response
{
  "success": true
}
```

---

## Rate Limiting

All endpoints are protected by rate limiting:

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Login | 5 requests | 1 minute |
| API General | 100 requests | 1 minute |
| Feedback | 5 submissions | 1 minute |
| Beta Validation | 10 requests | 1 minute |
| Password Reset | 3 requests | 1 hour |

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1701100800
```

---

## Endpoints

### Health & Status

#### Health Check
```bash
GET /api/health

# Response
{
  "status": "healthy",
  "timestamp": "2025-11-27T10:00:00.000Z",
  "version": "1.0.0"
}
```

---

### User Management

#### Get User Profile
```bash
GET /api/user/profile

# Response
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "User Name",
  "role": "TEACHER",
  "tenantId": "tenant-uuid",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

#### Update User Profile
```bash
PUT /api/user/profile
Content-Type: application/json

{
  "name": "Updated Name",
  "preferences": {
    "darkMode": true,
    "voiceAssistant": true
  }
}
```

#### Complete Onboarding
```bash
POST /api/user/onboarding
Content-Type: application/json

{
  "role": "TEACHER",
  "school": "Example School",
  "yearsExperience": 5,
  "specialisations": ["SEND", "Dyslexia"]
}
```

---

### Students

#### List Students
```bash
GET /api/students?page=1&limit=20&search=John

# Response
{
  "students": [
    {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Smith",
      "dateOfBirth": "2015-03-15",
      "yearGroup": 4,
      "senStatus": "EHCP"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

#### Get Student
```bash
GET /api/students/:id

# Response
{
  "id": "uuid",
  "firstName": "John",
  "lastName": "Smith",
  "dateOfBirth": "2015-03-15",
  "yearGroup": 4,
  "senStatus": "EHCP",
  "assessments": [...],
  "interventions": [...]
}
```

#### Create Student
```bash
POST /api/students
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Doe",
  "dateOfBirth": "2016-05-20",
  "yearGroup": 3,
  "senStatus": "SEN_SUPPORT"
}
```

#### Update Student
```bash
PUT /api/students/:id
Content-Type: application/json

{
  "yearGroup": 4,
  "senStatus": "EHCP"
}
```

---

### Assessments

#### List Assessment Templates
```bash
GET /api/assessment-templates

# Response
{
  "templates": [
    {
      "id": "uuid",
      "name": "Dyslexia Screener",
      "category": "COGNITION_LEARNING",
      "description": "Evidence-based dyslexia screening tool",
      "duration": 30,
      "ageRange": "5-16"
    }
  ]
}
```

#### Create Assessment
```bash
POST /api/assessments
Content-Type: application/json

{
  "studentId": "student-uuid",
  "templateId": "template-uuid",
  "assessorId": "assessor-uuid"
}

# Response
{
  "id": "assessment-uuid",
  "status": "IN_PROGRESS",
  "createdAt": "2025-11-27T10:00:00.000Z"
}
```

#### Submit Assessment Response
```bash
POST /api/assessments/:id/responses
Content-Type: application/json

{
  "questionId": "question-uuid",
  "response": "answer-value",
  "notes": "Optional notes"
}
```

#### Complete Assessment
```bash
POST /api/assessments/:id/complete

# Response
{
  "id": "assessment-uuid",
  "status": "COMPLETED",
  "score": 85,
  "recommendations": [...]
}
```

---

### Reports

#### Generate Report
```bash
POST /api/reports/generate
Content-Type: application/json

{
  "studentId": "student-uuid",
  "reportType": "EHCP_ADVICE",
  "assessmentIds": ["assessment-uuid-1", "assessment-uuid-2"]
}

# Response
{
  "reportId": "report-uuid",
  "status": "GENERATING",
  "estimatedTime": 30
}
```

#### Get Report
```bash
GET /api/reports/:id

# Response
{
  "id": "report-uuid",
  "status": "COMPLETED",
  "content": {
    "summary": "...",
    "recommendations": [...],
    "strengths": [...],
    "areasForDevelopment": [...]
  },
  "pdfUrl": "/api/reports/report-uuid/pdf"
}
```

#### Download Report PDF
```bash
GET /api/reports/:id/pdf

# Response: application/pdf binary
```

---

### Help Centre

#### Get Help Categories
```bash
GET /api/help/categories

# Response
{
  "categories": [
    {
      "id": "uuid",
      "name": "Getting Started",
      "slug": "getting-started",
      "articleCount": 12
    }
  ]
}
```

#### Search Help Articles
```bash
GET /api/help/search?q=assessment

# Response
{
  "results": [
    {
      "id": "uuid",
      "title": "How to Create an Assessment",
      "excerpt": "Learn how to...",
      "category": "Assessments"
    }
  ]
}
```

---

### Feedback

#### Submit Feedback
```bash
POST /api/feedback
Content-Type: application/json

{
  "type": "BUG",
  "message": "Description of the issue",
  "page": "/dashboard",
  "metadata": {
    "browser": "Chrome 119",
    "os": "Windows 11"
  }
}

# Response
{
  "success": true,
  "feedbackId": "uuid"
}
```

---

### Beta Programme

#### Validate Beta Code
```bash
POST /api/beta/validate-code
Content-Type: application/json

{
  "code": "BETA2025"
}

# Response (valid)
{
  "valid": true,
  "code": {
    "id": "uuid",
    "targetRole": "TEACHER",
    "remainingUses": 450
  }
}

# Response (invalid)
{
  "valid": false,
  "error": "Invalid or expired beta code"
}
```

#### Register Beta Tester
```bash
POST /api/beta/register
Content-Type: application/json

{
  "email": "tester@example.com",
  "password": "SecurePass123!",
  "firstName": "Test",
  "lastName": "User",
  "role": "TEACHER",
  "betaCode": "BETA2025",
  "organisation": "Example School"
}

# Response
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "tester@example.com",
    "isBetaTester": true
  }
}
```

---

### Collaboration

#### Create Collaboration Token
```bash
POST /api/collaborate/create-token
Content-Type: application/json

{
  "studentId": "student-uuid",
  "collaboratorType": "PARENT",
  "expiresIn": 7
}

# Response
{
  "token": "secure-token",
  "url": "https://www.edpsychconnect.com/collaborate/secure-token",
  "expiresAt": "2025-12-04T10:00:00.000Z"
}
```

#### Submit Collaboration Input
```bash
POST /api/collaborate/:token/submit
Content-Type: application/json

{
  "responses": [
    {
      "questionId": "q1",
      "answer": "Response text"
    }
  ]
}
```

---

## Error Responses

All errors follow a consistent format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error message",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Webhooks

EdPsych Connect can send webhooks for key events:

### Event Types

| Event | Description |
|-------|-------------|
| `assessment.completed` | Assessment finished |
| `report.generated` | Report ready |
| `student.created` | New student added |
| `collaboration.submitted` | Parent/teacher input received |

### Webhook Payload

```json
{
  "event": "assessment.completed",
  "timestamp": "2025-11-27T10:00:00.000Z",
  "data": {
    "assessmentId": "uuid",
    "studentId": "uuid",
    "score": 85
  },
  "signature": "sha256=..."
}
```

---

## SDKs & Libraries

### JavaScript/TypeScript

```typescript
import { EdPsychClient } from '@edpsych/sdk';

const client = new EdPsychClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://www.edpsychconnect.com/api'
});

// Get students
const students = await client.students.list({ limit: 20 });

// Create assessment
const assessment = await client.assessments.create({
  studentId: 'student-uuid',
  templateId: 'template-uuid'
});
```

---

## Support

For API support:
- **Email:** api@edpsychconnect.com
- **Documentation:** https://www.edpsychconnect.com/docs
- **Status Page:** https://status.edpsychconnect.com

---

*© 2025 EdPsych Connect Limited. All rights reserved.*
