# EdPsych Connect — Owner Responsibilities & Accountabilities

**Audience:** Founder / Product Owner / Delivery Owner (you)

**Purpose:** This document is the “you own this” companion to the engineering roadmap. It lists what **must be owned by a human decision-maker** (risk, policy, legal, procurement, stakeholder commitments) and what can be delegated to engineering or automation.

This repo already defines:

- The release behavioral contract in `docs/PRODUCT_SPEC.md`
- The release evidence pipeline in `docs/REGRESSION_SUITE.md`
- BYOD framing for LA IT in `docs/LA-IT-BYOD-GUIDE.md`

This document turns those into **explicit responsibilities** so nothing critical is assumed.

---

## 1) What you are ultimately accountable for (the short version)

You are accountable for:

1. **Product truth**: what the system promises, to whom, and under what constraints.
2. **Risk acceptance**: security/privacy/compliance tradeoffs and the residual risk you accept.
3. **Customer commitments**: what you tell LAs/schools/parents you will do (and by when).
4. **Governance**: data autonomy/BYOD policy, access control policy, retention/deletion policy.
5. **Operational readiness**: incident response ownership, communications, and escalation.

Engineering (including automated gates) can help you **execute** these, but cannot replace the owner’s sign-off.

---

## 2) Boundaries: what the engineering agent can do vs what you must do

### 2.1 The agent can (high confidence)

- Propose and implement technical designs (BYOD connectors, policy enforcement, audit logging).
- Build repeatable release gates and test coverage.
- Produce draft documentation packs (DPIA templates, security overviews, runbooks).
- Add automated guardrails (secret scanning, env validation, logging hygiene).

### 2.2 You must (cannot be delegated to automation)

- Decide the **official** product guarantees (e.g., BYOD scope: DB-only vs DB+files vs keys).
- Approve legal/compliance artifacts (privacy policy, DPAs, DPIA, IR policy).
- Own credential/key custody in real environments (rotation, access grants, HSM/KMS decisions).
- Approve customer-facing statements (security claims, “zero retention” language, AI processing).
- Manage stakeholders: LA IT, DPO, procurement, pilot leads, external auditors.

---

## 3) Responsibilities by domain (comprehensive)

### 3.1 Product and scope control (what gets built and what is out-of-scope)

You are responsible for:

- Maintaining the **authoritative behavioral contract**:
  - Ensure changes that affect shippable behavior update `docs/PRODUCT_SPEC.md`.
  - Ensure shippable definition remains tied to `docs/REGRESSION_SUITE.md`.
- Prioritization: what is “must-have for pilot”, “must-have for procurement”, and “later”.
- Setting acceptance criteria for high-risk features:
  - BYOD (data autonomy), audit integrity, RBAC, export/erase.

Owner outputs:

- A decision log (ADR-style) for each irreversible choice:
  - BYOD topology, encryption model, AI data handling, retention.

### 3.2 Security, secrets, and access governance

You are responsible for:

- **Key custody model** decisions:
  - App-managed tenant keys vs customer-managed keys (KMS/HSM), and who can rotate.
- **Secret rotation** and incident posture:
  - If secrets may have been exposed, you own rotation and revocation.
- Access governance:
  - Define who can access production systems, under what approvals, and how it’s audited.
  - Approve “break glass” procedures and ensure they are documented.

Minimum owner checklist:

- [ ] Confirm where secrets live (password manager / vault) and who has access.
- [ ] Approve secret rotation cadence (e.g., quarterly; immediate on suspected exposure).
- [ ] Approve “no secrets in logs” policy and enforcement scope.

References:

- `docs/SECURITY-INCIDENT-REPORT.md`
- `docs/AI_DATA_PRIVACY_WHITEPAPER.md`

### 3.3 Data protection, privacy, and compliance

You are responsible for:

- Data controller/processor positioning per customer type.
- Maintaining legal/compliance artifacts:
  - DPA (Data Processing Agreement)
  - DPIA (Data Protection Impact Assessment)
  - Records of processing activities (ROPA)
  - Retention schedules and deletion policies
- Ensuring the product implements the policies you claim:
  - Export/erase, access logs, consent where required.

BYOD-specific responsibilities:

- Define what “BYOD” means contractually:
  - Does PII ever persist in your SaaS plane?
  - What metadata might still exist (tenant ids, audit digests, telemetry)?
- Approve the LA IT integration model:
  - IP allowlists, VPN/tunnel requirements, TLS requirements, certificate handling.

Reference:

- `docs/LA-IT-BYOD-GUIDE.md`
- `docs/BRING_YOUR_OWN_DATA_GUARANTEE.md`
- `docs/DATA_OWNERSHIP_FRAMEWORK.md`

### 3.4 BYOD delivery ownership (this is the “high-value engineering step”)

You are responsible for the parts that turn BYOD from “possible” to “procurable”:

1. **Pilot selection and success definition**
   - Choose the pilot LA/school/practice.
   - Define success metrics (time to onboard, uptime, auditability, export/erase confidence).

2. **BYOD readiness inputs you must secure**
   - A named LA IT contact and escalation path.
   - A DPO sign-off path (or at least pre-read).
   - Network requirements validated (firewalls, certs, IP allowlists, tunnel).

3. **Operational ownership**
   - Who receives alerts when BYOD connectivity drops?
   - Who approves emergency access or temporary whitelist changes?

4. **Decision ownership**
   - Confirm which data classes are allowed for AI processing.
   - Confirm “zero retention” language and ensure it matches vendor contracts.

### 3.5 Reliability and release governance (how you keep it shippable)

You are responsible for:

- Holding the line that releases must meet:
  - Type-check + lint + build + production-start E2E.
- Declaring “stop-ship” criteria:
  - auth regressions, PII leakage, audit integrity breaks, export/erase failures.
- Approving release cadence and maintenance windows (especially for enterprise/BYOD).

Owner checklist per release:

- [ ] Confirm release notes are accurate and non-misleading.
- [ ] Confirm any policy/behavior change updated `docs/PRODUCT_SPEC.md`.
- [ ] Confirm `npm run gate:release` (or CI equivalent) is green.

References:

- `docs/REGRESSION_SUITE.md`
- `tools/gate-release.ps1`

### 3.6 Incident response and communications

You are responsible for:

- Being the final decision-maker for:
  - Severity classification
  - Customer notification timing and content
  - Regulatory reporting threshold decisions
- Maintaining an on-call / escalation plan (even if it’s just you initially).

Minimum incident pack (owner-approved):

- [ ] Incident severity rubric
- [ ] Contact list (internal + customer + vendors)
- [ ] “First 60 minutes” runbook
- [ ] Customer comms templates

### 3.7 Vendor and third-party risk management

You are responsible for:

- Knowing which vendors process data and under what terms:
  - hosting, database, email, analytics, AI/LLM provider.
- Ensuring contracts align with the claims you make:
  - retention, training use, sub-processors, region.

Owner checklist:

- [ ] Maintain a vendor register (what data, region, retention, DPA link).
- [ ] Approve “approved vendors” for sensitive processing.

### 3.8 Procurement readiness (selling to LAs without death by paperwork)

You are responsible for:

- A coherent procurement narrative supported by evidence:
  - BYOD architecture + guarantees
  - audit logging + access controls
  - testing evidence + release gate
- Maintaining the compliance pack in a current state.

Practical outputs to own:

- Security overview (1–2 pages)
- Data flow diagrams (control plane vs data plane)
- BYOD onboarding guide and responsibilities matrix

---

## 4) RACI-style responsibilities matrix (who owns what)

Legend: **R** = Responsible (does the work), **A** = Accountable (sign-off), **C** = Consulted, **I** = Informed

| Area | You (Owner) | Engineering | LA IT | DPO/Legal |
|---|---:|---:|---:|---:|
| Product promises / guarantees | A | C | I | C |
| Release gate green (evidence) | A | R | I | I |
| Secret rotation & custody | A | R | I | C |
| BYOD network provisioning | C | C | A/R | I |
| BYOD data residency decisions | A | C | C | C |
| DPIA / DPA / privacy artifacts | A | C | C | A/R |
| Incident communications | A/R | R | I | C |
| Audit log integrity approach | A | R | I | C |

---

## 5) Your recurring responsibilities (cadence)

### Weekly

- Review release gate outcomes and open blockers.
- Confirm any customer-facing changes have an owner-approved statement.
- Review security signals (errors, auth failures, suspicious access).

### Monthly

- Review secrets/keys access list (least privilege).
- Review vendor register and sub-processor changes.
- Review “BYOD pilot learnings” and update onboarding docs.

### Quarterly

- Rotate high-value credentials (or confirm rotation policy is being executed).
- Run tabletop incident exercise (even a lightweight one).
- Update DPIA/ROPA as features evolve.

---

## 6) Practical checklists you can run immediately

### 6.1 “Are we safe to run a BYOD pilot?”

- [ ] Named pilot sponsor and LA IT owner
- [ ] Written success criteria
- [ ] Network path validated (TLS, firewall, certificate handling)
- [ ] DPO pre-read scheduled
- [ ] Export/erase processes demonstrated
- [ ] Audit logging demonstrated
- [ ] Release gate green on the intended release commit

### 6.2 “Can we answer procurement questions in one meeting?”

- [ ] Data flow diagram ready
- [ ] BYOD scope clearly defined
- [ ] Vendor/subprocessor list ready
- [ ] Incident response summary ready
- [ ] Evidence of testing (release gate + E2E report) ready

---

## 7) Notes and disclaimers

- This document is not legal advice.
- Where legal/compliance sign-off is required, you (the owner) remain accountable even if drafts are prepared by engineering.

---

## 8) Where this fits in the repo

- Shippable behavior: `docs/PRODUCT_SPEC.md`
- How we prove it: `docs/REGRESSION_SUITE.md`
- BYOD technical guide for LA IT: `docs/LA-IT-BYOD-GUIDE.md`

