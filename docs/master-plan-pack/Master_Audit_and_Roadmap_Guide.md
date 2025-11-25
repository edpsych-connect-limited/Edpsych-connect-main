# 🧭 Master Audit & Roadmap Guide for Project Agents

This document is the **mandatory reference** for any agent (Claude, OpenAI, Gemini, Copilot, etc.) working on this platform.  
The goal is to ensure a **100% independent, robust review** of the project’s current state and a **clear roadmap to completion**.

---

## 📌 Scope of Work

Agents must perform a **ground-up audit** covering:

1. **Feature Inventory**
   - List **all features** in the platform.
   - Describe each feature’s **function** in plain language.
   - Mark its **completion state**:
     - ✅ Working
     - ⚠️ Partial / Incomplete
     - ❌ Broken / Missing

2. **Backend Audit**
   - Review **codebase** directly (no reliance on prior notes).
   - Identify all **functions, APIs, and services**.
   - Document **data models** (entities, fields, relationships).
   - Note whether backend logic is complete, partial, or broken.

3. **Front‑end Audit**
   - Review **UI components and exposed features**.
   - Confirm which backend functions are visible in the front‑end.
   - Note any **missing or hidden features**.

4. **Database Review**
   - List all **data models/entities**.
   - Confirm fields, relationships, and whether they are exposed in the frontend.
   - Identify **unused or missing tables**.
   - Flag mismatches (e.g., frontend expects a field that doesn’t exist).

5. **AI Integration Review**
   - Identify all **AI‑powered features** (Claude, OpenAI, Gemini, Copilot APIs).
   - Confirm whether:
     - API calls are implemented.
     - Responses are handled correctly in frontend.
     - Data models support AI outputs.
   - Flag **missing integrations** or **stubbed code**.

6. **Alignment Check**
   - Compare backend, data models, and front‑end exposure.
   - Flag mismatches (e.g., backend function exists but no UI, or UI references missing backend).

---

## 📊 Required Output Format

Agents must present findings in **tables and plain language summaries**.

### Feature Inventory Table
| Feature | Function | Backend Status | Front‑end Status | Alignment | Notes |
|---------|----------|----------------|------------------|-----------|-------|
| Example: User Login | Allows users to log in | ✅ Complete | ✅ Exposed | ✅ Aligned | Fully functional |

### Data Model Table
| Entity | Fields | Relationships | Used in Front‑end? | Status | Gaps |
|--------|--------|---------------|--------------------|--------|------|
| Example: User | id, name, email | Linked to Auth | Yes | ✅ Complete | None |

### AI Integration Table
| AI Feature | API Used | Backend Status | Front‑end Status | Alignment | Gaps |
|------------|----------|----------------|------------------|-----------|------|
| Example: Chat Assistant | OpenAI GPT API | ⚠️ Partial | ❌ Missing | ❌ Misaligned | API call implemented but not exposed in UI |

---

## 📑 Evidence Requirement

For every finding, agents must **show their work**:
- Reference **specific files, functions, or components** reviewed.
- Provide **schema snippets or route names** where relevant.
- Include **screenshots or structured descriptions** of front‑end components.

---

## 🚫 Independence Rule

- **Do not rely on previous reports.**  
- Generate a **fresh inventory** from scratch.  
- If findings differ from past documentation, **highlight discrepancies**.

---

## ✅ Deployment Readiness Checklist

Agents must confirm:
- ✅ Backend stable (no critical errors).  
- ✅ Frontend aligned with backend features.  
- ✅ Database models complete and consistent.  
- ✅ AI integrations functional and exposed.  
- ✅ Documentation exists for setup and usage.  

If any item is ❌, deployment is **not ready**.

---

## 🛠️ Roadmap to 100% Completion

Agents must produce a **step‑by‑step roadmap**:

| Step | Task | Owner | Priority | Estimated Effort | Dependencies |
|------|------|-------|----------|------------------|--------------|
| 1 | Fix backend gaps (list specific functions) | Dev Team | High | 2 days | None |
| 2 | Expose missing frontend features | Dev Team | High | 3 days | Step 1 |
| 3 | Align database models (add/remove fields, relationships) | DB Engineer | Medium | 2 days | Step 1 |
| 4 | Finalize AI integrations (test each API) | AI Engineer | High | 4 days | Step 3 |
| 5 | QA & Testing (unit, integration, UAT) | QA Team | High | 5 days | Steps 1–4 |
| 6 | Deployment validation (staging → production) | DevOps | High | 2 days | Step 5 |

---

## 🎯 Success Criteria

The audit is **complete** when:
- Every feature is listed with function + completion state.  
- Backend and front‑end are explicitly compared.  
- Database models are documented and mapped to usage.  
- AI integrations are reviewed and gaps flagged.  
- Evidence is provided for each finding.  
- A **roadmap table** is delivered with tasks, priorities, and dependencies.  

---

## 🗣️ Communication Style

- Use **plain language** so non‑technical readers can understand.  
- Avoid jargon unless explained.  
- Structure findings clearly with headings, tables, and bullet points.  

---

## 📌 Final Note

This audit is intended to give a **non‑technical project owner** a clear, reliable overview of the platform’s current state.  
Agents must treat this as a **fresh, independent review** — not a continuation of prior reports.

---

# ✅ Agent Audit Checklist (Quick Reference)

This checklist ensures every agent delivers a **complete, independent audit + roadmap**.  
Use it to confirm whether the agent has followed the **Master Audit & Roadmap Guide**.

---

## 🔍 Audit Requirements

- [ ] **Feature Inventory** (all features listed, functions described, completion state marked)  
- [ ] **Backend Audit** (functions, APIs, data models documented)  
- [ ] **Front‑end Audit** (UI components listed, backend features exposed, missing features flagged)  
- [ ] **Database Review** (entities, fields, relationships, gaps flagged)  
- [ ] **AI Integration Review** (all AI features checked, alignment confirmed or gaps flagged)  
- [ ] **Alignment Check** (backend ↔ database ↔ frontend compared, misalignments flagged)  

---

## 📊 Output Format

- [ ] Tables provided (features, data models, AI integrations, roadmap)  
- [ ] Plain language summaries included  
- [ ] Evidence shown (file references, schema snippets, screenshots)  

---

## 🚫 Independence Rule

- [ ] No reliance on past reports  
- [ ] Fresh inventory generated  
- [ ] Discrepancies vs. old docs highlighted  

---

## 🛠️ Roadmap to Completion

- [ ] Step‑by‑step roadmap delivered  
- [ ] Tasks assigned with owner, priority, effort, dependencies  
- [ ] QA + testing included  
- [ ] Deployment validation included  

---

## 🎯 Success Criteria

- [ ] Every feature documented with completion state  
- [ ] Backend, frontend, database, AI integrations reviewed  
- [ ] Evidence provided for findings  
- [ ] Roadmap table delivered  
- [ ] Plain language explanations for non‑technical readers  

---

## 📌 Final Note

If **any box is unchecked**, the audit is **incomplete** and deployment is **not ready**.
