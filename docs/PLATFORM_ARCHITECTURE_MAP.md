# Platform Architecture & Feature Map

This document provides a graphical representation of the EdPsych Connect platform features, their organization, and data flow.

## High-Level Architecture

```mermaid
graph TD
    User[User / Professional] --> Frontend[Next.js Frontend]
    Frontend --> API[Next.js API Routes]
    API --> Auth[Auth Service]
    API --> Prisma[Prisma ORM]
    API --> AI[AI Integration Service]
    
    Prisma --> DB[(PostgreSQL Database)]
    AI --> OpenAI[OpenAI API]
    AI --> Claude[Anthropic API]
    AI --> Redis[Upstash Redis Cache]
    
    subgraph "Core Modules"
        Auth
        Tenant[Tenant Management]
        UserMgmt[User Management]
    end
    
    subgraph "Educational Modules"
        Assessments[Assessment System]
        Cases[Case Management]
        Interventions[Intervention Tracking]
        Reports[Report Generation]
    end
    
    subgraph "Platform Orchestration"
        Orchestrator[Orchestration Layer]
        StudentProfile[Student Profiles]
        LessonPlans[Lesson Planning]
        ClassRoster[Class Rosters]
    end
    
    subgraph "AI Agents (Study Buddy)"
        ReportWriter[Report Writer]
        LessonPlanner[Lesson Planner]
        BehaviorAnalyst[Behavior Analyst]
        ParentComm[Parent Communicator]
        AssessmentEval[Assessment Evaluator]
    end
    
    API --> Tenant
    API --> UserMgmt
    API --> Assessments
    API --> Cases
    API --> Interventions
    API --> Orchestrator
    
    Orchestrator --> StudentProfile
    Orchestrator --> LessonPlans
    Orchestrator --> ClassRoster
    
    AI --> ReportWriter
    AI --> LessonPlanner
    AI --> BehaviorAnalyst
    AI --> ParentComm
    AI --> AssessmentEval
```

## Feature Organization

```mermaid
mindmap
  root((EdPsych Connect))
    Core Platform
      Authentication
      Tenant Management
      User Roles & Permissions
      Subscription & Billing
    Educational Tools
      Case Management
      Assessments
        ECCA Framework
        Dynamic Assessment
        Standardized Tests
      Interventions
      Report Generation
    Platform Orchestration
      Student Profiles
        Learning Styles
        Strengths & Struggles
      Class Management
        Rosters
        Grouping
      Lesson Planning
        Differentiation
        Curriculum Alignment
    AI Study Buddy
      24 Autonomous Agents
      Report Writer
      Lesson Planner
      Behavior Analyst
      Parent Communicator
    Community & Support
      Forums & Networking
      Help Center
      Training Academy
      Gamification
    Research Foundation
      Data Collection
      Analysis Tools
      Ethics Approval
      Publication
```

## Data Flow: Assessment Process

```mermaid
sequenceDiagram
    participant EP as Ed Psych
    participant UI as Dashboard
    participant API as Assessment API
    participant DB as Database
    participant AI as AI Agent

    EP->>UI: Create New Assessment
    UI->>API: POST /api/assessments
    API->>DB: Create Record (Status: Pending)
    DB-->>API: Assessment ID
    API-->>UI: Success

    EP->>UI: Input Observations
    UI->>API: PUT /api/assessments/[id]
    API->>DB: Update Data

    EP->>UI: Request AI Analysis
    UI->>API: POST /api/ai/chat
    API->>AI: Analyze Data & Generate Report
    AI-->>API: Analysis Result
    API-->>UI: Display Draft Report

    EP->>UI: Finalize Report
    UI->>API: PUT /api/assessments/[id] (Status: Complete)
    API->>DB: Save Final Report
```

## Module Dependencies

```mermaid
graph LR
    Assessments --> Cases
    Interventions --> Cases
    Cases --> Students
    Students --> Tenants
    
    LessonPlans --> ClassRoster
    ClassRoster --> Students
    StudentProfile --> Students
    
    Reports --> Assessments
    Reports --> Interventions
    
    AI_Agents --> StudentProfile
    AI_Agents --> Assessments
    AI_Agents --> LessonPlans
```
