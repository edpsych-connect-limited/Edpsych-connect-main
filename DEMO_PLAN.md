# EdPsych Connect: Local Authority Demonstration Plan

**Date:** January 4, 2026
**Audience:** Local Authority Board
**Objective:** Demonstrate a seamless, end-to-end workflow that proves the platform's readiness, compliance, and value.

---

## 1. Executive Introduction (5 Minutes)
*   **Hook:** "The current EHCP process takes 20 weeks and costs thousands. We reduce administrative burden by 40% and improve outcomes using AI-driven workflows."
*   **Key Pillars:**
    1.  **Compliance:** Statutory timelines built-in.
    2.  **Collaboration:** Multi-agency input in real-time.
    3.  **Efficiency:** AI-assisted drafting and triage.
    4.  **Sovereignty:** Data stays within the UK (NeonDB/AWS London).

---

## 2. The "Happy Path" Demonstration (20 Minutes)

### Scene 1: The LA Admin (The "Control Tower")
*   **Persona:** Sarah, SEN Case Officer.
*   **Action:** Log in to `/dashboard`.
*   **Highlight:**
    *   **Live Analytics:** Show "Active Cases" and "Breach Risk" (Real DB data).
    *   **Triage:** Click on a high-priority case.
    *   **Narrative:** "Sarah sees exactly which cases need attention before they breach statutory deadlines."

### Scene 2: The New Request (The "Trigger")
*   **Persona:** Sarah (or School SENCO).
*   **Action:** Navigate to `/ehcp/new`.
*   **Highlight:**
    *   **Intelligent Form:** Show how the form adapts to the child's needs (Primary Need: Autism).
    *   **Submission:** Submit the request.
    *   **Verification:** Show the case appear instantly in the Dashboard.

### Scene 3: Multi-Agency Collaboration (The "Network")
*   **Persona:** Dr. Scott (EP) or External Specialist.
*   **Action:** Access `/collaborate/[token]` (Simulated via "Copy Link").
*   **Highlight:**
    *   **Secure Access:** No login required for external contributors (Token-based).
    *   **Contribution:** Submit an observation ("Child struggles with sensory overload").
    *   **Real-time Sync:** Switch back to Sarah's view to see the contribution appear instantly.

### Scene 4: AI-Assisted Drafting (The "Magic")
*   **Persona:** Sarah.
*   **Action:** Click "Generate Draft Plan" on the case file.
*   **Highlight:**
    *   **Synthesis:** AI combines the application + external evidence.
    *   **Human-in-the-Loop:** Sarah reviews and edits the draft. "AI suggests, Human decides."
    *   **Output:** A structured EHCP draft ready for panel.

### Scene 5: The Parent Experience (The "Loop")
*   **Persona:** Parent.
*   **Action:** Log in to `/parent/dashboard`.
*   **Highlight:**
    *   **Transparency:** View the status of the application.
    *   **Support:** Access the "Training Library" (Show a video).
    *   **Narrative:** "Parents are kept informed, reducing anxiety and phone calls to the LA."

---

## 3. Technical Deep Dive (Optional / Q&A)
*   **Data Security:** Explain the "Safety Net" and UK-hosting.
*   **Integration:** Mention MIS integration capabilities (Wonde/SIMS).
*   **Scalability:** Cloud-native architecture.

---

## 4. Pre-Demo Checklist (The "Safety Net")
1.  [ ] **Database Seed:** Run `npm run seed:demo` to ensure clean data.
2.  [ ] **Video Check:** Verify Dr. Scott videos load in the Parent Portal.
3.  [ ] **User Accounts:** Ensure `admin@la.gov.uk`, `parent@demo.com`, and `senco@school.edu` are active.
4.  [ ] **Browser:** Use a clean Chrome profile with no extensions.
5.  [ ] **Backup:** Have a recorded video of the workflow ready in case of internet failure.

---

## 5. Handling Objections
*   **"Is AI safe?"** -> "We use a 'Human-in-the-Loop' model. AI never makes decisions, only recommendations."
*   **"What about GDPR?"** -> "All data is encrypted and hosted in the UK. We are fully GDPR compliant."
*   **"Video Accuracy?"** -> "All content is verified by Senior EPs. The avatars are strictly controlled via our 'Truth-by-Code' governance."
