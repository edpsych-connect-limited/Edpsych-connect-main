# EdPsych Connect: Platform Executive Summary

**Version:** 2.0 (Pre-Launch Audit)
**Date:** January 4, 2026

---

## 1. Mission Statement
EdPsych Connect is a **sovereign, AI-enhanced Educational Psychology platform** designed to reduce the 20-week EHCP backlog, improve outcomes for children with SEND, and empower Local Authorities with data-driven insights. We replace fragmented spreadsheets and emails with a unified, secure, and intelligent workflow.

---

## 2. Core Value Proposition

### For Local Authorities
*   **Efficiency:** AI-assisted triage and drafting reduces case time by up to 40%.
*   **Compliance:** Built-in statutory clocks ensure 100% adherence to the 20-week deadline.
*   **Cost Savings:** Reduces reliance on expensive locum EPs by optimizing caseload allocation.

### For Educational Psychologists
*   **Focus:** Automates administrative tasks (scheduling, report formatting) so EPs can focus on the child.
*   **Tools:** "Professional Toolkit" provides evidence-based assessment templates and intervention libraries.

### For Schools & Families
*   **Transparency:** Real-time tracking of EHCP applications.
*   **Support:** Instant access to a curated library of training videos and interventions (e.g., "Coders of Tomorrow").

---

## 3. Key Features & Architecture

### 3.1 The Engines
*   **EHCP Engine:** A state machine that manages the statutory assessment process.
*   **Assessment Engine:** A library of standardized tests and observation frameworks.
*   **Intervention Engine:** A recommendation system for evidence-based strategies.
*   **Training Engine:** A video-first learning management system (LMS).

### 3.2 AI Governance ("Safety Net")
*   **Human-in-the-Loop:** AI generates drafts; humans approve them.
*   **No Training on User Data:** We use pre-trained models (RAG) and do not train on sensitive child data.
*   **Audit Trails:** Every AI interaction is logged and traceable.

### 3.3 Video Infrastructure
*   **Truth-by-Code:** All video content is verified and delivered via a secure CDN (Cloudinary).
*   **Dr. Scott Avatar:** Consistent, professional presentation using controlled HeyGen generation.

---

## 4. Compliance & Security
*   **Data Sovereignty:** All data resides in UK-South (London) data centers.
*   **Encryption:** AES-256 encryption at rest and TLS 1.3 in transit.
*   **Role-Based Access:** Strict segregation of duties between LA, School, and Parent users.

---

## 5. Readiness Status
*   **Codebase:** 100% TypeScript with strict type safety.
*   **Testing:** Comprehensive E2E testing suite (Cypress) covering critical paths.
*   **Infrastructure:** Scalable serverless architecture (Next.js) with robust database backing (PostgreSQL).

---

**Conclusion:** EdPsych Connect is not just a case management system; it is a transformation engine for Special Educational Needs services, ready for deployment.
