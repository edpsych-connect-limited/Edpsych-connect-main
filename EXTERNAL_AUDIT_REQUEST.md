# REQUEST FOR PROPOSAL: INDEPENDENT SYSTEMS AUDIT

**Date:** January 17, 2026  
**To:** Independent External Audit Firm  
**From:** Scott Patrick, Founder - EdPsych Connect Limited  
**Subject:** Engagement Letter for Independent Verification of "EdPsych Connect" Platform

---

## 1. Introduction & Context
EdPsych Connect Limited has completed a 3-year intensive development cycle of our core product, **EdPsych Connect** - an enterprise-grade SaaS platform connecting Educational Psychologists with schools, Local Authorities, and parents.

The platform has been built using a "Human-in-the-Loop" AI-assisted development methodology. As we approach our Beta launch, we adhere to the principle that "Developer verification is insufficient for enterprise compliance." We require an independent, fresh-eyes audit to validate our internal "Production Ready" claims.

## 2. Scope of Engagement
We invite you to conduct a comprehensive **Forensic & Operational Audit** of the platform code v1.0.0.

**Repository Access:** Provided under NDA via secure channel  
**Documentation:** See `EXTERNAL_AUDIT_READINESS_DOSSIER.md` (root directory)

We specifically request validation of the following four pillars:

### Pillar A: Security & Data Integrity
*   **Authentication Flow:** Verification of the "Safety Net" logic in `src/lib/auth`. Verify that no bypasses exist for the multi-role system (Admin, EP, School, Parent).
*   **Database Schema:** Review of the 8,000+ line `prisma.schema` for relational integrity, orphan prevention, and index optimization.
*   **Script Provenance:** Validate our cryptographic ledger implementation (`video-script-provenance.json`) to confirm that sensitive content strings cannot be tampered with without detection.

### Pillar B: Financial & Marketplace Logic
*   **Stripe Connect Integration:** Audit the transaction flows for "split payments" between the platform and service providers.
*   **Booking Concurrency:** Stress-test the booking engine to ensure double-bookings are mathematically impossible under high load.

### Pillar C: Compliance (GDPR & Accessibility)
*   **Right to Erasure:** Audit the cascading delete rules in the database to ensure a "Delete User" action truly purges PII across all 60+ related tables.
*   **Accessibility:** Validate our WCAG 2.1 AA self-assessment. Does the `onboarding` flow truly support screen readers as claimed?

### Pillar D: Infrastructure Robustness
*   Review our "Video Robustness" architecture (HeyGen to Cloudinary failover).
*   Validate the independence of our "Audit Readiness Dossier" – does the code actually do what the dossier claims?

## 3. Deliverables
We request a formal **Independent Service Auditor's Report (ISAR)** including:
1.  **Gap Analysis:** Discrepancies between our `EXTERNAL_AUDIT_READINESS_DOSSIER.md` and your findings.
2.  **Risk Matrix:** Categorization of any vulnerabilities found (Critical/High/Medium/Low).
3.  **Certification of Readiness:** A final "Go/No-Go" recommendation for public sector deployment (Local Authority integration).

## 4. Timeline
We are operationally ready for this audit immediately. We request a preliminary report within 10 business days.

## 5. Contact
Please direct all technical inquiries to the Lead Architect via the repository secure channel.

Sincerely,

**Scott Patrick**  
Founder, EdPsych Connect Limited
