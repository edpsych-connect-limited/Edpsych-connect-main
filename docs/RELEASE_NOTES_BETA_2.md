# Beta Release Notes (Sprint 2) - AI & Voice Capabilities

**Date:** January 4, 2026
**Focus:** Enhancing the "Brain" and Accessibility.

## 🧠 AI Assistant Deep Context
The AI assistant is no longer a generic chatbot. It is now "Context Aware".
*   **Feature:** `platformContext` Injection.
*   **How it works:** When a user chats with the AI, the backend automatically receives:
    *   User Role (e.g., "SENCO", "EP")
    *   Current Screen (e.g., "/assessment/123")
    *   Active Student ID (if applicable)
*   **Benefit:** The AI provides tailored answers without needing to be told "I am a SENCO".

## 🎙️ Voice Observations
The `VoiceCommandService` has been upgraded to support qualitative data capture.
*   **New Command:** "Add observation for [Student Name] [Content]"
*   **Example:** "Add observation for Tom He seemed distracted during the math lesson today."
*   **Behavior:**
    1.  System parses the student name ("Tom").
    2.  System extracts the content ("He seemed distracted...").
    3.  Data is persisted to the `AutomatedAction` log (searchable audit trail).
    4.  Audible confirmation: "Observation recorded for Tom."

## 🔧 Technical Details
*   **Files Modified:**
    *   `src/lib/ai-integration.ts`
    *   `src/app/api/ai/chat/route.ts`
    *   `src/lib/orchestration/voice-command.service.ts`
*   **Database:** Utilizing `AutomatedAction` table for observation storage (safe fallback).

## ✅ Verification
*   **AI Context:** Tested via API route modification.
*   **Voice:** Logic verified in service layer. Frontend integration verified in `VoiceCommandInterface.tsx`.
