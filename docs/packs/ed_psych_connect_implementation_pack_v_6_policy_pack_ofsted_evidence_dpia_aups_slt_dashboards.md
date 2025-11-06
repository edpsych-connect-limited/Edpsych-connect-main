# EdPsych Connect — Implementation Pack v6
**Author:** AI Dr Patrick (Autonomous)  
**Region:** UK (GB English)  
**Purpose:** Deliver an enterprise‑grade **Policy Pack** aligned to UK standards (Ofsted, DfE, ICO/GDPR), with ready‑to‑adopt templates and **SLT dashboards**. Additive only — preserves and perfects previous work.

---

## 0) Contents
- **Ofsted Evidence Map** (Quality of Education, Behaviour & Attitudes, Personal Development, Leadership & Management)
- **DPIA** (template + worked example for EdPsych Connect)
- **Records of Processing Activities (ROPA)** & **Data Map**
- **Lawful Basis & Consent** matrix (incl. Research Hub)
- **Retention Schedule** (education context)
- **Incident Response & SAR/Parent Rights** playbooks
- **Acceptable Use Policies (AUPs)**: Pupils, Parents/Carers, Staff
- **Data Processing Agreement (DPA)** template (school ↔ vendor)
- **SLT Dashboards** spec (metrics, calculations, API & SQL/Cypher/aggregation notes)
- **Roll‑out & CPD**: training plan and success criteria

---

## 1) Ofsted Evidence Map (EIF‑aligned)
**Folder:** `docs/POLICY/ofsted-evidence-map.md`

### 1.1 Quality of Education
- **Curriculum intent →** Narrative Missions catalogue per KS; teacher plan rationale; SEN differentiation options recorded in assignment metadata.
- **Implementation →** Lesson plan generator logs (plan id; resources attached; accessibility toggles used); EP‑authored recommendations linked to class tasks.
- **Impact →** Assessment timelines; progress heatmaps; exit‑ticket mastery curves; intervention impact deltas (Neo4j `RESULTED_IN.delta`).

### 1.2 Behaviour & Attitudes
- Engagement trend signals (Watch/Alert) + actions taken; attendance integrations; positive reinforcement (streaks/house points) with fairness checks.

### 1.3 Personal Development
- Missions tagged for oracy, resilience, metacognition; reflection prompts logged; pupil voice captured via short surveys.

### 1.4 Leadership & Management
- CPD nudges delivered; policy attestations; data protection training completion; audit trail of key decisions.

**Evidence Pack Export (auto)**  
`/research/exports` includes `evidence_pack=true` to bundle anonymised cohort trends, plan‑to‑impact links, safeguarding activity logs, and CPD completion.

---

## 2) DPIA — Template & Worked Example
**Folder:** `docs/POLICY/DPIA/`

### 2.1 `DPIA-template.md`
```markdown
# Data Protection Impact Assessment (DPIA)

## A. Project Overview
- Name: EdPsych Connect
- Sponsor: School SLT / Trust
- Purpose: Teaching & learning support; EP collaboration; anonymised research.

## B. Nature, Scope, Context
- Data subjects: Pupils, parents/carers, staff, EPs, researchers.
- Categories: Identification (UPN), attendance, assessment, interventions, communications.
- Special category data: Possible SEN notes (minimised; role‑based access).

## C. Lawful Basis (Art. 6 GDPR)
- Public task/legitimate interests for core teaching support; consent where required for research.

## D. Necessity & Proportionality
- Pseudonymisation, minimisation, role‑based access, encryption at rest/in transit, audit logs.

## E. Risks & Mitigations
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|-----------|
| Unauthorised access | Low | High | SSO, RBAC, 2FA, least privilege, audit alerts |
| Excess data retention | Med | Med | Retention schedule enforcement + reviews |
| Inaccurate records | Med | Med | Correction flow; staff training |

## F. Consultation
- DPO consulted; staff & pupil voice gathered; EP professional standards considered.

## G. Approval
- DPO sign‑off; SLT approval; review annually or upon major change.
```

### 2.2 `DPIA-worked-example.md` (pre‑filled to your stack)
- References your **Postgres/Mongo/Redis/Neo4j** usage, exports queue, and safeguarding signals; includes data flows and controls.

---

## 3) ROPA & Data Map
**Folder:** `docs/POLICY/ROPA/`

### 3.1 `data-map.csv` (extract)
```
System,Table/Collection,Fields,Purpose,Lawful Basis,Retention,Access Roles
Postgres,users,id,email,name,role,Account & auth,Public task,6y,Admin
Postgres,pupils,id,upn,names,dob,Core education,Public task,Until leaving + 1y,Teacher/EP
Mongo,training.scripts,_id,title,Training content,Legitimate interests,Life of service,Staff
Neo4j,Intervention graph,nodes/edges,Impact modelling,Public task,Life of case,EP/SLT
Redis,session,token/session,Auth/session mgmt,Legitimate interests,24h,Platform
```

### 3.2 `ropa.md`
- Controller/Processor details; categories; recipients; transfers; safeguards; technical & organisational measures (TOMs).

---

## 4) Lawful Basis & Consent Matrix
**Folder:** `docs/POLICY/lawful-basis-consent.md`

| Activity | Data | Lawful Basis | Consent? | Notes |
|---|---|---|---|---|
| Classroom planning & differentiation | pupil profiles, attainment | Public task/Legitimate interests | No | Strict minimisation, RBAC |
| Parent messaging | contact details | Public task | No | Opt‑out for non‑essential updates |
| Research Hub aggregated exports | anonymised metrics | Consent / Legitimate interests (with DUA) | Usually Yes | Pseudonymisation + DUA required |

---

## 5) Retention Schedule (education‑suitable)
**Folder:** `docs/POLICY/retention-schedule.md`

- **Pupil account data:** active enrolment + 1 year (default).  
- **Assessment records:** end of key stage + 1 year (unless statutory).  
- **Intervention logs:** end of academic year + 2 years.  
- **Safeguarding logs (meta only):** per school policy; the platform stores minimal indicators and escalations with timestamps.  
- **Audit events:** 6 years.  
- **Research exports:** per DUA; default 12 months then purge unless renewed.

Automated enforcement: nightly job checks timestamps and marks items for purge; admin review queue; irreversible delete after 30 days (grace window) with WORM archive for non‑personal artefacts.

---

## 6) Incident Response + SAR/Parent Rights Playbooks
**Folder:** `docs/POLICY/playbooks/`

### 6.1 `incident-response.md`
- 24/72‑hour timelines; severity levels; containment; evidence capture; ICO notification decision tree; comms templates (parents/staff/trust).

### 6.2 `subject-access-request.md`
- Verify identity; scope search; export formatted pack (PDF + CSV); redact third‑party data; respond within one month; extensions procedure.

---

## 7) Acceptable Use Policies (AUPs)
**Folder:** `docs/POLICY/AUP/`

### 7.1 `aup-pupils.md` (KS‑appropriate language)
- Be kind online; keep passwords private; report concerns; use school‑approved devices/sites; no sharing of others’ information.

### 7.2 `aup-parents.md`
- Support respectful communication; use messages for school matters; do not forward pupil data beyond carers; consent & privacy reminders.

### 7.3 `aup-staff.md`
- Use work accounts/devices; follow safeguarding & data protection; export only with approval; no shadow IT; report incidents within 24 hours.

---

## 8) Data Processing Agreement (DPA) Template
**Folder:** `docs/POLICY/DPA/dpa-template.md`
- Roles & definitions; processing instructions; confidentiality; sub‑processors; security; breach notification; audit; termination & deletion; UK GDPR clauses with SCCs addendum placeholder.

---

## 9) SLT Dashboards — Spec & Metrics
**Folder:** `docs/SLT/dashboards-spec.md`

### 9.1 KPIs
- **Quality of Learning**: mastery progression (pupil & cohort), reasoning vs fluency balance, mission completion rate.
- **Equity & Inclusion**: gaps by SEN/EAL/PP; accessibility toggle utilisation; intervention access vs impact.
- **Engagement & Wellbeing**: streaks, session duration patterns, EngagementDip/Alert counts, response time to alerts.
- **Operational Health**: message response times; assessment lag; export turnaround; system latency & error budget (SLOs).

### 9.2 Data Sources & Queries
- **Postgres**: assessments (window functions for progress deltas), messages (response time), enrolments.
- **Neo4j**: intervention → outcome patterns (`avg(r.delta)`), similar‑pupil suggestions.
- **Mongo**: training usage, help article reads.
- **Redis**: recent activity hot counters.

### 9.3 API Endpoints (read‑only)
- `/slt/kpi?school_id=...&term=...` → aggregates  
- `/slt/alerts?window=7d` → safeguarding & operational alerts  
- `/slt/equity?dimension=sen_code` → gap analysis

### 9.4 Visuals
- Heatmaps, small multiples, spark lines, “gap bridges” (before/after intervention), Ofsted evidence mode (print‑ready).

---

## 10) Roll‑out & CPD
**Folder:** `docs/POLICY/rollout-cpd.md`
- **Wave 1 (SLT & Champions)**: 90‑min session; DPIA sign‑off, dashboards; safeguarding run‑through.
- **Wave 2 (Teachers & TAs)**: 2×45‑min: quick start + differentiation; interventions & monitoring.
- **Wave 3 (EPs & SENCo)**: 60‑min: case timelines, recommendations, evidence packs.
- **Measure**: usage targets; engagement deltas; Ofsted evidence exports; staff confidence surveys.

---

## 11) Implementation Notes
- All documents formatted for GitHub (Markdown) and Drive; can be referenced in `_index.json` with hashes.
- Use UI Copy Kit (UK) for all on‑screen policy messaging; parent letters draw from templates.
- No removals: if a school already has equivalents, we map & merge.

---

## 12) Next Autonomous Steps
- **v7**: KS4–KS5 mission seeds (+ teacher notes & rubrics), SLT dashboard endpoint samples (SQL/Cypher), and printable Ofsted evidence export templates.
- **v8**: QA automation pack (Playwright/Cypress flows), accessibility testing scripts, and performance budgets with SLO alerts.
- **v9**: Deployment hardening (IaC snippets, WAF rules, backup drills) and training video scripts V31–V36.

