# 🎬 Enterprise Video Strategy & Audit Report

**Date:** December 7, 2025
**Status:** 🔴 Critical Action Required
**Author:** GitHub Copilot (Enterprise Architect)

## 1. Executive Summary
The current video delivery infrastructure is sub-optimal for an enterprise-grade platform. Users are experiencing buffering due to the delivery of raw MP4 files rather than adaptive bitrate streams (HLS/DASH). Furthermore, the "casting" of avatars (Dr. Scott vs. Adrian) lacks a cohesive narrative strategy.

This document outlines the **Inventory**, **Casting Strategy**, and **Technical Remediation Plan** to achieve world-class video performance.

---

## 2. Casting Strategy: "The Visionary & The Architect"

To break monotony and provide context-appropriate tone, we will strictly enforce the following casting split:

### 👨‍⚕️ Dr. Scott (The Visionary)
**Role:** Chief Educational Psychologist & Founder
**Tone:** Empathetic, Authoritative, Strategic, Reassuring.
**Assignments:**
*   **Welcome & Onboarding:** First impressions, mission statements.
*   **Parent Portal:** Explaining sensitive topics (EHCP, support plans) to parents.
*   **Clinical Concepts:** Explaining "No Child Left Behind", "Data Autonomy", and psychological principles.
*   **Crisis & Safeguarding:** Topics requiring high emotional intelligence.

### 👨‍💻 Adrian (The Architect)
**Role:** Platform Specialist & Technical Lead
**Tone:** Precise, Efficient, Clear, Instructional.
**Assignments:**
*   **Feature Walkthroughs:** "How to use the dashboard", "Setting up filters".
*   **Admin & IT:** SSO configuration, MIS integration, Data Sync.
*   **Gamification Logic:** Explaining the rules of Battle Royale.
*   **Error Recovery:** Technical troubleshooting steps.

---

## 3. Technical Remediation Plan

### A. Buffering & Performance
*   **Current State:** Raw MP4 delivery via Cloudinary/HeyGen. High latency, no quality adaptation.
*   **Target State:** Adaptive Bitrate Streaming (HLS/m3u8).
*   **Immediate Fix:** Update Cloudinary URLs to use `f_auto,q_auto` transformation parameters to serve WebM/AV1 where supported and optimize bitrate.

### B. Accessibility (Captions)
*   **Current State:** Missing (`<track>` tags absent).
*   **Target State:** WebVTT (`.vtt`) sidecars for all videos.
*   **Action:** Generate VTT files for all 87+ assets using OpenAI Whisper pipeline (scheduled).

### C. Visual Engagement
*   **Strategy:** "Live Action Snapshots".
*   **Implementation:** Overlay UI screencasts on top of the avatar video at key instructional moments (e.g., when Adrian says "Click the settings icon", the video cuts to a close-up of that action).

---

## 4. Comprehensive Video Inventory & Casting Audit

| ID | Current Title | Proposed Avatar | Rationale | Status |
|----|---------------|-----------------|-----------|--------|
| `platform-introduction` | Platform Intro | **Dr. Scott** | Founder vision; establishes trust. | 🟡 Review |
| `data-autonomy` | Data Autonomy | **Dr. Scott** | Strategic/Ethical concept. | 🟡 Review |
| `no-child-left-behind` | No Child Left Behind | **Dr. Scott** | Core philosophy. | 🟡 Review |
| `gamification-integrity` | Gamification Logic | **Adrian** | Technical explanation of algorithms. | 🔴 Recast |
| `la-ehcp-portal-intro` | LA Portal Intro | **Dr. Scott** | High-stakes B2B sales pitch. | 🟡 Review |
| `help-getting-started` | Getting Started | **Dr. Scott** | Welcoming new users. | 🟡 Review |
| `help-technical-support` | Technical Support | **Adrian** | Technical domain. | 🔴 Recast |
| `ehcp-application-journey` | EHCP Journey | **Dr. Scott** | Complex/Emotional process. | 🟡 Review |
| `la-dashboard-overview` | LA Dashboard | **Adrian** | UI Walkthrough. | 🔴 Recast |
| `parent-portal-welcome` | Parent Welcome | **Dr. Scott** | Empathy for parents. | 🟡 Review |
| `feature-battle-royale` | Battle Royale Feature | **Adrian** | Explaining game mechanics. | 🔴 Recast |
| `admin-sso-configuration` | SSO Config | **Adrian** | Purely technical. | 🔴 Recast |
| `error-connection` | Connection Error | **Adrian** | Troubleshooting. | 🔴 Recast |

*(Full inventory analysis continues in database)*

---

## 5. Next Steps
1.  **Apply Casting Tags:** Update metadata to reflect the assigned avatar.
2.  **Optimize Player:** Update `CoursePlayer.tsx` and `VideoPlayer.tsx` to handle buffering states gracefully.
3.  **Generate Captions:** Execute caption generation pipeline.
