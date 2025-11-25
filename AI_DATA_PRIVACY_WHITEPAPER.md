# 🛡️ EdPsych Connect: AI Safety & Data Sovereignty Whitepaper

## Executive Summary for Local Authorities & Trust Leaders

This document addresses the critical data privacy, security, and sovereignty architecture of the EdPsych Connect platform. It is designed to answer the due diligence questions of Data Protection Officers (DPOs) and IT Directors.

---

## 1. The "Zero-Training" AI Architecture

A primary concern for public sector bodies is whether student data is used to train third-party AI models (like ChatGPT or Claude).

**EdPsych Connect Policy:**
> **"No customer data is ever used to train foundation models."**

### How We Enforce This:
1.  **Enterprise API Usage:** We utilize the Enterprise/Business tiers of OpenAI and Anthropic APIs. Unlike the free consumer versions (ChatGPT), these commercial APIs have strict **Zero Data Retention (ZDR)** policies for training purposes.
2.  **Stateless Processing:** Data sent to the AI for analysis (e.g., "Summarize this observation") is processed in memory and discarded by the model provider immediately after the response is generated.
3.  **PII Redaction Layer:** Before any text leaves the EdPsych Connect secure environment, our "Privacy Guard" middleware detects and redacts Personally Identifiable Information (PII) such as names, dates of birth, and addresses, replacing them with tokens (e.g., `[STUDENT_NAME]`).

---

## 2. Data Sovereignty: The "BYOD" Model

For Local Authorities requiring absolute control over their data at rest, EdPsych Connect offers a **Bring Your Own Database (BYOD)** architecture.

### Standard SaaS vs. BYOD Enterprise

| Feature | Standard SaaS (Schools/EPs) | Enterprise BYOD (Local Authorities) |
| :--- | :--- | :--- |
| **Database Location** | Shared Multi-Tenant Cluster | **Dedicated Isolated Instance** |
| **Data Ownership** | EdPsych Connect (Processor) | **Local Authority (Controller & Owner)** |
| **Access Control** | Application Level | **Database Level (Physical Isolation)** |
| **Encryption** | At Rest & In Transit | **Customer-Managed Keys (Optional)** |

**Why this matters:**
If an LA decides to leave EdPsych Connect, they do not need to request a data export. They **own the database**. They can simply disconnect our application, and the data remains in their possession.

---

## 3. Compliance & Security Standards

### GDPR & UK Data Protection Act 2018
*   **Right to Erasure:** Automated workflows to permanently delete student records upon request.
*   **Audit Logs:** Every AI interaction, record view, and edit is immutably logged in the `AuditLog` table.
*   **Data Residency:** All data is hosted within **UK/EU Data Centers** (AWS London / Azure UK South).

### AI Safety Guardrails
*   **Hallucination Checks:** Our "Safety Net" system cross-references AI-generated reports against the raw data to flag potential inaccuracies.
*   **Human-in-the-Loop:** AI never finalizes a statutory report. It acts as a drafter; a qualified Educational Psychologist must review and sign off (digital signature required).

---

## 4. FAQ for Data Protection Officers

**Q: Does OpenAI store our data?**
A: No. We use the API with a zero-retention policy. Data is transient.

**Q: What happens if there is a data breach at EdPsych Connect?**
A: In the BYOD model, your data is isolated. A breach of one tenant does not compromise another.

**Q: Can we audit the AI's decisions?**
A: Yes. All prompts sent to the AI and the raw responses are stored in your dedicated audit log for review.
