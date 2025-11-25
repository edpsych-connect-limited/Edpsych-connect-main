# Forensic Codebase Inventory: EdPsych Connect
**Date:** 2024-05-22
**Status:** Verified
**Scope:** Backend Architecture, API Surface, Data Models, Service Logic

## 1. AI & Automation Core
**Source of Truth:** `src/lib/ai-integration.ts`
The platform hosts a sophisticated multi-agent system orchestrating **24 distinct autonomous agents**, powered by a hybrid engine (Claude 3 Sonnet + GPT-4 Turbo).

### Autonomous Agent Fleet
| Agent Name | Capability | Model |
|------------|------------|-------|
| **Report Writer** | Student report generation & progress tracking | Claude |
| **Lesson Planner** | Curriculum-aligned lesson design & differentiation | Claude |
| **Behavior Analyst** | Pattern recognition & intervention planning | Claude |
| **Parent Communicator** | Professional, sensitive communication drafting | Claude |
| **Assessment Evaluator** | Analysis of assessment data & feedback generation | Hybrid |
| **Curriculum Advisor** | Personalized learning pathways & mapping | Claude |
| **Accessibility Specialist** | WCAG 2.1 AA compliance & accommodation planning | Claude |
| **Research Assistant** | Literature review & methodological support | OpenAI |
| **Wellbeing Monitor** | Stress detection & support planning | Claude |
| **Gamification Designer** | Engagement strategy & reward mechanisms | Claude |
| **Data Analyst** | Predictive modeling & trend analysis | OpenAI |
| **Content Creator** | Multimedia design & resource generation | Hybrid |
| **NeuroConnect Analyst** | Cognitive load monitoring & attention tracking | Claude |
| **Restorative Justice** | Conflict resolution & community building | Claude |
| **Multilingual Support** | Real-time translation & cultural adaptation | OpenAI |
| **Special Ed Coordinator** | IEP development & multi-agency coordination | Claude |
| **Career Guidance** | Pathway planning & skill assessment | Claude |
| **Mental Health Support** | Crisis intervention & literacy education | Claude |
| **STEM Specialist** | Inquiry-based learning & computational thinking | OpenAI |
| **Arts Integration** | Creative expression & interdisciplinary connections | Claude |
| **PE Coordinator** | Health education & physical activity planning | Claude |
| **Library Media** | Information literacy & resource curation | OpenAI |
| **Environmental Ed** | Sustainability & outdoor learning | Claude |
| **Digital Citizenship** | Online safety & digital ethics education | Claude |

### AI Infrastructure
- **Hybrid Engine**: Dynamic routing between Anthropic (Claude) and OpenAI models based on task type.
- **Smart Caching**: Redis-backed response caching with tier-based TTL (Enterprise gets fresh responses).
- **Rate Limiting**: Granular limits per subscription tier (Standard: 50/day -> Enterprise: 9999/day).
- **Cost Tracking**: Real-time token usage and cost calculation per request.

## 2. Gamification & Tokenisation Economy
**Source of Truth:** `src/lib/tokenisation/`, `src/app/api/battle-royale/`, `prisma/schema.prisma`

### Token Economy
- **Treasury Service**: Centralized management of platform currency.
- **Reward Logic**: `issueReward` and `claimReward` workflows with transactional integrity.
- **Forensic Logging**: Immutable audit trail for all token movements (`tokenisation` event type).
- **Ledger System**: Per-tenant and per-user balance tracking.

### Battle Royale Engine
- **Matchmaking**: Queue systems for solo and squad play.
- **Squad Management**: Team formation and role assignment.
- **Competitive Stats**: Tracking of Wins, Losses, XP, and Leaderboards.
- **Inventory**: Game items, equipment, and rarity systems.

## 3. Educational Core & Case Management
**Source of Truth:** `prisma/schema.prisma`, `src/app/api/cases/`, `src/app/api/ehcp/`

### Student & Case Lifecycle
- **Profiles**: Comprehensive student records including SEN status and Year Group.
- **Case Management**: End-to-end referral to closure tracking (`cases` model).
- **Assessments**: Scheduled and completed assessment tracking with domain-specific scoring.
- **Interventions**: Tracking of start/end dates, implementers, and outcomes.

### EHCP (Education, Health and Care Plans)
- **Full Lifecycle**: Drafting, Versioning, and Finalizing plans.
- **Versioning**: `ehcp_versions` table tracks all historical changes.
- **SEN Details**: Granular support plan mapping.

## 4. Institutional & Enterprise Architecture
**Source of Truth:** `prisma/schema.prisma`, `src/lib/institution-service.ts`

### Multi-Tenancy
- **Hierarchy**: Support for Local Authorities (LA), Multi-Academy Trusts (MAT), and individual Schools.
- **Isolation**: Data strictly scoped by `tenant_id`.
- **RBAC**: Role-based access for Professionals, Parents, Admins, and Researchers.

### Subscription System
- **Tiers**: 15 distinct tiers including `LA_TIER1-3`, `SCHOOL_SMALL-LARGE`, `RESEARCH_INSTITUTIONAL`.
- **Feature Gating**: Granular control over 25+ features (e.g., `PROBLEM_SOLVER`, `RESEARCH_API`).
- **Billing**: Deep integration with Stripe for subscription lifecycle management.

## 5. Research Foundation
**Source of Truth:** `src/app/api/research/`, `prisma/schema.prisma`

### Research Management
- **Study Design**: Tools for defining objectives, methodology, and ethics.
- **Ethics Approval**: Workflow for tracking IRB/Ethics board approvals.
- **Data Collection**: Integrated survey and participant response systems.
- **Collaboration**: Role-based access for research teams (`research_collaborators`).

## 6. Platform Services & Infrastructure
**Source of Truth:** `src/app/api/`, `src/lib/`

- **Voice Interface**: Command processing and quick action execution (`src/app/api/voice`).
- **Security**:
    - **GDPR Compliance**: Dedicated logic for data handling.
    - **Audit Logs**: Comprehensive `audit_logs` table tracking all critical actions.
    - **Secure Storage**: Encrypted document handling (`SecureDocument` model).
- **Communication**:
    - **Forums**: Threaded discussions with moderation tools.
    - **Messaging**: Direct parent-teacher communication channels.
- **Training & CPD**:
    - **LMS Features**: Courses, Modules, Lessons, and Quizzes.
    - **Certification**: Automated certificate issuance and verification.

## 7. API Surface Area
**Verified Endpoints (Partial List):**
- `/api/ai/*` - AI Agent interaction
- `/api/assessments/*` - Assessment management
- `/api/auth/*` - Authentication & Session
- `/api/battle-royale/*` - Game state & matchmaking
- `/api/cases/*` - Case file operations
- `/api/ehcp/*` - Statutory plan management
- `/api/gamification/*` - Achievement & Badge systems
- `/api/interventions/*` - Intervention tracking
- `/api/research/*` - Study & Data management
- `/api/tokenisation/*` - Wallet & Reward operations
- `/api/voice/*` - Voice command processing

---
**Conclusion:** The codebase represents a mature, enterprise-grade platform with deep vertical integration across educational, clinical, and research domains. The "AI" is not a wrapper but a deeply integrated multi-agent system, and the "Gamification" is a full-featured economy, not just badges.
