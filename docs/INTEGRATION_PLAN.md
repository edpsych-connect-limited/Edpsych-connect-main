# Enterprise Integration Plan & Status

This document tracks the "Vertical-by-Vertical" integration strategy to bring EdPsych Connect to a fully operational enterprise-grade standard.

## Strategy
We are moving from a "Hollow Shell" (UI without Backend connection) to a "Unified Ecosystem".
For each vertical, we will:
1.  **Audit**: Check Frontend (UI) and Backend (API/DB).
2.  **Bridge**: Create/Fix the API endpoints.
3.  **Wire**: Connect Frontend to Backend.
4.  **Verify**: Confirm end-to-end data flow.

## Vertical Status

| Vertical | Frontend | Backend | Integration | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Algorithms** | `RecommendationDashboard` | `/api/algorithms` | ✅ Wired | **DONE** | Fixed query params mismatch. |
| **EHCP** | `EHCPWizardForm` | `/api/ehcp` | ✅ Wired | **DONE** | Connected `NewEHCPPage` to API with session tenant_id. |
| **Assessments** | `AssessmentForm` | `/api/assessments` | ✅ Wired | **DONE** | Connected `NewAssessmentPage` to API with session tenant_id. |
| **Interventions** | `InterventionDesigner` | `/api/interventions` | ✅ Wired | **DONE** | Verified `handleSave` logic and API validation. |
| **Reports** | `ReportForm` | `/api/reports` | ✅ Wired | **DONE** | Created DB model, API endpoints, and connected "Save Draft". |
| **Voice/AI** | `VoiceCommandInterface` | `/api/voice`, `/api/help` | ✅ Wired | **DONE** | Appears functional. |

## Detailed Tasks

### 1. EHCP Vertical (The Core)
- [x] **Backend**: Verified `/api/ehcp` exists and matches schema.
- [x] **Frontend**: Updated `NewEHCPPage` to pass `tenant_id` from session.
- [x] **Frontend**: Verified `EHCPWizardForm` POSTs to `/api/ehcp`.

### 2. Assessments Vertical
- [x] **Backend**: Verified `/api/assessments` exists and matches schema.
- [x] **Frontend**: Updated `NewAssessmentPage` to pass `tenant_id` from session.
- [x] **Frontend**: Removed manual `tenant_id` input from `AssessmentForm`.

### 3. Interventions Vertical
- [x] **Audit**: Verified `InterventionDesigner` and `/api/interventions`.
- [x] **Wire**: Confirmed `handleSave` correctly POSTs data.

### 4. Reports Vertical
- [x] **Audit**: Identified missing DB model.
- [x] **Backend**: Created `reports` model in Prisma.
- [x] **Backend**: Updated `/api/reports/generate` to save to DB.
- [x] **Backend**: Created `/api/reports` for draft saving.
- [x] **Frontend**: Connected "Save Draft" button in `ReportForm`.
