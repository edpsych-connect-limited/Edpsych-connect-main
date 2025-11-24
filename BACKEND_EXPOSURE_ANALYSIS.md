# Backend Exposure Analysis
**Date:** November 24, 2025

## Overview
This document analyzes which backend services are currently exposed via API routes and which are "orphaned" (exist in code but not accessible via HTTP).

## Exposed Services (Healthy)
The following services have corresponding API routes and are accessible to the frontend:

*   **Authentication**: `/api/auth/*` (NextAuth)
*   **User Management**: `/api/user/*`
*   **Onboarding**: `/api/onboarding/*` (Status, Update, Complete)
*   **Assessments**:
    *   `/api/assessments/frameworks`
    *   `/api/assessments/instances`
    *   `/api/assessments/collaborations`
    *   `/api/assessments/[id]/report`
*   **Help Center**: `/api/help/*`

## Orphaned / Internal-Only Services (Action Required)
The following services exist in the `src/services` or `src/lib` folders but lack a direct API route for frontend consumption:

### 1. AI Orchestrator
*   **Service**: `src/services/orchestrator-service.ts`
*   **Method**: `processTutoringRequest`
*   **Status**: **Orphaned**. No `/api/ai/tutoring` or similar route found.
*   **Impact**: Users cannot trigger the AI tutoring/support features.

### 2. Report Generator (Direct Access)
*   **Service**: `src/lib/assessments/report-generator.ts`
*   **Status**: **Partial**. Accessed via `AssessmentAdministrationWizard` client-side logic, but server-side generation for background processing is not exposed.

## Recommendations
1.  **Create AI API Route**: Implement `src/app/api/ai/chat/route.ts` to wrap the `orchestrator-service.ts`.
2.  **Secure Endpoints**: Ensure all new API routes are protected by `getServerSession` to prevent unauthorized AI usage (cost control).
