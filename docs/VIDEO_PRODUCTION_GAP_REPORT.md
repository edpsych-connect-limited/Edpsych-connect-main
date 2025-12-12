# Video Production Gap Report & Remediation Plan

**Date:** December 12, 2025
**Status:** Action Required

## 1. Executive Summary
We have successfully cleaned the video registry of 60+ legacy keys, reducing technical debt. However, a critical gap remains in the **"Demonstration"** layer of the platform. While Dr. Scott covers the "Vision", we are missing the "How-To" (Sarah) and "Security" (Adrian) videos required for a complete Enterprise experience.

**Current Status:**
*   **Total Videos:** 165
*   **Missing/Placeholder:** ~20
*   **Critical Gaps:** Platform Walkthroughs (Sarah), Security Deep Dives (Adrian), Coding Curriculum.

## 2. The "Sarah" Gap (Platform Walkthroughs)
*User Persona: Head of School Success (Empathetic, Practical)*

These videos are currently mapped to Dr. Scott's generic intro or are missing. They need to be replaced with "Sarah" to provide the "Day in the Life" feel.

| ID | Title | Current State | Action Required |
| :--- | :--- | :--- | :--- |
| `onboarding-platform-tour` | **The Dashboard Tour** | Mapped to Dr. Scott | **Generate Sarah Video** (Script 3 in Plan) |
| `help-getting-started` | **Getting Started Guide** | Generic | **Generate Sarah Video** |
| `help-first-assessment` | **Creating Your First Assessment** | Generic | **Generate Sarah Video** |
| `help-generating-reports` | **Generating Reports** | Generic | **Generate Sarah Video** |
| `la-dashboard-overview` | **LA Dashboard Walkthrough** | Generic | **Generate Sarah Video** |

## 3. The "Adrian" Gap (Enterprise Trust)
*User Persona: System Architect (Technical, Precise)*

These videos are critical for the "Safety Net" and "Data Autonomy" features, which are key selling points for Local Authorities.

| ID | Title | Current State | Action Required |
| :--- | :--- | :--- | :--- |
| `help-data-security` | **Data Architecture & Security** | Generic | **Generate Adrian Video** |
| `compliance-data-protection` | **GDPR & Data Autonomy** | Generic | **Generate Adrian Video** |
| `innovation-safety-net` | **The Safety Net Engine Logic** | Generic | **Generate Adrian Video** |
| `help-troubleshooting` | **System Diagnostics** | Generic | **Generate Adrian Video** |

## 4. The "Coding Curriculum" Gap
*User Persona: Dr. Maya (Research Lead) or Adrian*

The "Coding Curriculum" is a key innovation feature but is currently aliased to a single placeholder.

| ID | Title | Current State | Action Required |
| :--- | :--- | :--- | :--- |
| `intro-coding-journey` | **Introduction to Coding** | Placeholder | **Generate Video** |
| `python-basics` | **Python Basics** | Placeholder | **Generate Video** |
| `react-intro` | **React for Kids** | Placeholder | **Generate Video** |

## 5. Remediation Plan

### Phase 1: Scripting (Immediate)
We need to finalize the scripts for these 20 videos.
*   **Action:** I can generate the scripts for these missing videos based on the `VIDEO_PRODUCTION_PLAN.md` archetypes.

### Phase 2: Generation (External)
*   **Action:** Use the scripts to generate videos via HeyGen (or record placeholders).

### Phase 3: Integration
*   **Action:** Update `heygen-video-urls.ts` with the new IDs once generated.

## 6. Next Steps
1.  **Approve Script Generation:** Shall I generate the scripts for the "Sarah" and "Adrian" videos now?
2.  **Placeholder Mode:** Shall I create distinct placeholder files for these so we can test the *routing* even without the final video content?
