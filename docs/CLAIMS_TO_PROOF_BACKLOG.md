# Claims → Proof Backlog

Generated: 2025-12-27T04:36:49.601Z
Source audit: 2025-12-27T04:36:41.901Z

This document converts **unevidenced in-scope claim sentences** into an engineering/documentation/test backlog.

Non-negotiables:
- We do **not** soften/remove bold claims to make audits pass.
- If the repo cannot currently *prove* a claim, we create the proof: code, tests, docs, operational controls.

## Snapshot

- Video keys audited: 122
- Needs review keys: 26
- Likely script update keys: 0
- Unevidenced sentence instances (sampled): 41
- Unevidenced sentence clusters: 37

## Prioritised clusters

| ID | Risk | Keys | Claim sentence |
|---:|:----:|-----:|---|
| CLM-022 | MEDIUM | 1 | Our 'Research Hub' allows us to validate interventions at a scale never seen before. |
| CLM-001 | MEDIUM | 1 | The EHCP Accelerator automates everything that can be automated, so you can focus on everything that requires human insight. |
| CLM-008 | LOW | 2 | But I like to think of it as a legal safety net. |
| CLM-009 | LOW | 2 | Our platform changes that. |
| CLM-007 | LOW | 2 | That's why I built this platform to be different. |
| CLM-034 | LOW | 2 | Welcome to EdPsych Connect World. |
| CLM-003 | LOW | 1 | And finally: never let AI output become evidence. |
| CLM-032 | LOW | 1 | And our system automatically generates thirty different versions, each tailored to a specific student's needs. |
| CLM-021 | LOW | 1 | EdPsych Connect isn't just a software platform. |
| CLM-036 | LOW | 1 | EdPsych Connect was built by me. |
| CLM-025 | LOW | 1 | EdPsych Connect World was built by educational professionals for educational professionals. |
| CLM-004 | LOW | 1 | Good governance isn't anti-AI. |
| CLM-012 | LOW | 1 | Here's the magic of EdPsych Connect: we don't just dump these reports on you. |
| CLM-026 | LOW | 1 | I created this platform because I watched too many brilliant colleagues drowning in paperwork when they should have been doing what they do best: transforming children's lives. |
| CLM-020 | LOW | 1 | If a student is a 'Visual Learner', the agent explains concepts using diagrams and metaphors. |
| CLM-035 | LOW | 1 | It's a continuous process — and we build the platform to support that reality. |
| CLM-019 | LOW | 1 | Meet our AI Tutoring Agents. |
| CLM-017 | LOW | 1 | On EdPsych Connect, you build 'Care Teams' around a child. |
| CLM-029 | LOW | 1 | Our AI will give you a plain-English breakdown. |
| CLM-015 | LOW | 1 | Our Dashboard is your command centre. |
| CLM-010 | LOW | 1 | Our platform prompts you for these because they provide the objective baseline. |
| CLM-028 | LOW | 1 | Our platform visualises this for you. |
| CLM-011 | LOW | 1 | Our system pulls this directly from your intervention logs. |
| CLM-013 | LOW | 1 | Scott AI. |
| CLM-023 | LOW | 1 | Scott, and I want to introduce you to the 'Safety Net'. |
| CLM-031 | LOW | 1 | So what actually is this platform? |
| CLM-002 | LOW | 1 | Start using EdPsych Connect for new activity while your historical data remains accessible in your current system. |
| CLM-033 | LOW | 1 | Teachers using this platform tell us they're saving three to four hours every single week. |
| CLM-030 | LOW | 1 | That's exactly why I created EdPsych Connect World. |
| CLM-005 | LOW | 1 | That's the EdPsych Connect difference. |
| CLM-018 | LOW | 1 | That's why we built this platform with a 'Zero Trust' architecture. |
| CLM-016 | LOW | 1 | Their profiles, built from assessments and observations, are already in the platform. |
| CLM-006 | LOW | 1 | Then complex vowel teams (ai, ay, a-e). |
| CLM-024 | LOW | 1 | Then our system does something remarkable. |
| CLM-027 | LOW | 1 | This Parent Portal is your window into your child's support. |
| CLM-014 | LOW | 1 | We've brought that psychology into EdPsych Connect. |
| CLM-037 | LOW | 1 | When you use this platform, you're using something designed by a colleague. |

## Work templates (how we “earn” a claim)

For each cluster, we create proof via one or more of:
- **Code**: the feature/control exists and is enforced (not just a comment).
- **Tests**: e2e/unit tests proving behaviour on golden paths and abuse cases.
- **Docs**: clear, accurate operational/security documentation in-repo, linked from the claim.
- **CI gates**: validators that fail if proof regresses.

## Cluster details

### CLM-022: MEDIUM risk

**Claim:** Our 'Research Hub' allows us to validate interventions at a scale never seen before.

**Affected videos:**
- `innovation-research-hub` (title=The Research Hub: Evidence-Based Practice, source=world-class-v4-innovation)

**Proof work (suggested):**
- Convert the claim into a measurable system behaviour and implement it end-to-end.
- Add tests for the behaviour and a small validator/gate if feasible.
- Add an evidence anchor (code/doc/test) so the script audit can recognise it next run.

**Evidence anchor ideas (for the audit tool):**
- Create/extend a repo file whose content is objectively checkable (e.g. a validator, schema, feature gate, route, or test).
- Then add a conservative `EVIDENCE_RULES` entry in `tools/audit-video-scripts-against-code.ts` that searches for that anchor.

### CLM-001: MEDIUM risk

**Claim:** The EHCP Accelerator automates everything that can be automated, so you can focus on everything that requires human insight.

**Affected videos:**
- `addon-ehcp-accelerator` (title=EHCP Accelerator: Statutory Compliance Made Manageable, source=world-class-v4-pricing-2025-12)

**Proof work (suggested):**
- Convert the claim into a measurable system behaviour and implement it end-to-end.
- Add tests for the behaviour and a small validator/gate if feasible.
- Add an evidence anchor (code/doc/test) so the script audit can recognise it next run.

**Evidence anchor ideas (for the audit tool):**
- Create/extend a repo file whose content is objectively checkable (e.g. a validator, schema, feature gate, route, or test).
- Then add a conservative `EVIDENCE_RULES` entry in `tools/audit-video-scripts-against-code.ts` that searches for that anchor.

### CLM-008: LOW risk

**Claim:** But I like to think of it as a legal safety net.

**Affected videos:**
- `ehcp-application-journey` (title=Your Education, Health and Care Plan Application Journey, source=world-class-v4-core)
- `feature-deep-dive-ehcp` (title=Your Education, Health and Care Plan Application Journey, source=world-class-v4-core)

**Proof work (suggested):**
- Add an evidence anchor (doc/code/test) or adjust the audit scope/heuristics if this is not a meaningful product claim.

**Evidence anchor ideas (for the audit tool):**
- Create/extend a repo file whose content is objectively checkable (e.g. a validator, schema, feature gate, route, or test).
- Then add a conservative `EVIDENCE_RULES` entry in `tools/audit-video-scripts-against-code.ts` that searches for that anchor.

### CLM-009: LOW risk

**Claim:** Our platform changes that.

**Affected videos:**
- `ehcp-application-journey` (title=Your Education, Health and Care Plan Application Journey, source=world-class-v4-core)
- `feature-deep-dive-ehcp` (title=Your Education, Health and Care Plan Application Journey, source=world-class-v4-core)

**Proof work (suggested):**
- Add an evidence anchor (doc/code/test) or adjust the audit scope/heuristics if this is not a meaningful product claim.

**Evidence anchor ideas (for the audit tool):**
- Create/extend a repo file whose content is objectively checkable (e.g. a validator, schema, feature gate, route, or test).
- Then add a conservative `EVIDENCE_RULES` entry in `tools/audit-video-scripts-against-code.ts` that searches for that anchor.

### CLM-007: LOW risk

**Claim:** That's why I built this platform to be different.

**Affected videos:**
- `ehcp-application-journey` (title=Your Education, Health and Care Plan Application Journey, source=world-class-v4-core)
- `feature-deep-dive-ehcp` (title=Your Education, Health and Care Plan Application Journey, source=world-class-v4-core)

**Proof work (suggested):**
- Add an evidence anchor (doc/code/test) or adjust the audit scope/heuristics if this is not a meaningful product claim.

**Evidence anchor ideas (for the audit tool):**
- Create/extend a repo file whose content is objectively checkable (e.g. a validator, schema, feature gate, route, or test).
- Then add a conservative `EVIDENCE_RULES` entry in `tools/audit-video-scripts-against-code.ts` that searches for that anchor.

### CLM-034: LOW risk

**Claim:** Welcome to EdPsych Connect World.

**Affected videos:**
- `platform-introduction` (title=Welcome to EdPsych Connect World, source=world-class-marketing)
- `value-enterprise-platform` (title=The £2.35 Million Platform, source=world-class-v4-pricing-2025-12)

**Proof work (suggested):**
- Add an evidence anchor (doc/code/test) or adjust the audit scope/heuristics if this is not a meaningful product claim.

**Evidence anchor ideas (for the audit tool):**
- Create/extend a repo file whose content is objectively checkable (e.g. a validator, schema, feature gate, route, or test).
- Then add a conservative `EVIDENCE_RULES` entry in `tools/audit-video-scripts-against-code.ts` that searches for that anchor.

### CLM-003: LOW risk

**Claim:** And finally: never let AI output become evidence.

**Affected videos:**
- `compliance-risk-ai` (title=Compliance Risk & AI: Practical Guardrails, source=world-class-v4-additional)

**Proof work (suggested):**
- Add an evidence anchor (doc/code/test) or adjust the audit scope/heuristics if this is not a meaningful product claim.

**Evidence anchor ideas (for the audit tool):**
- Create/extend a repo file whose content is objectively checkable (e.g. a validator, schema, feature gate, route, or test).
- Then add a conservative `EVIDENCE_RULES` entry in `tools/audit-video-scripts-against-code.ts` that searches for that anchor.

### CLM-032: LOW risk

**Claim:** And our system automatically generates thirty different versions, each tailored to a specific student's needs.

**Affected videos:**
- `platform-introduction` (title=Welcome to EdPsych Connect World, source=world-class-marketing)

**Proof work (suggested):**
- Add an evidence anchor (doc/code/test) or adjust the audit scope/heuristics if this is not a meaningful product claim.

**Evidence anchor ideas (for the audit tool):**
- Create/extend a repo file whose content is objectively checkable (e.g. a validator, schema, feature gate, route, or test).
- Then add a conservative `EVIDENCE_RULES` entry in `tools/audit-video-scripts-against-code.ts` that searches for that anchor.

### CLM-021: LOW risk

**Claim:** EdPsych Connect isn't just a software platform.

**Affected videos:**
- `innovation-research-hub` (title=The Research Hub: Evidence-Based Practice, source=world-class-v4-innovation)

**Proof work (suggested):**
- Add an evidence anchor (doc/code/test) or adjust the audit scope/heuristics if this is not a meaningful product claim.

**Evidence anchor ideas (for the audit tool):**
- Create/extend a repo file whose content is objectively checkable (e.g. a validator, schema, feature gate, route, or test).
- Then add a conservative `EVIDENCE_RULES` entry in `tools/audit-video-scripts-against-code.ts` that searches for that anchor.

### CLM-036: LOW risk

**Claim:** EdPsych Connect was built by me.

**Affected videos:**
- `trust-built-by-practitioners` (title=Built by Someone Who Actually Does This Work, source=world-class-v4-pricing-2025-12)

**Proof work (suggested):**
- Add an evidence anchor (doc/code/test) or adjust the audit scope/heuristics if this is not a meaningful product claim.

**Evidence anchor ideas (for the audit tool):**
- Create/extend a repo file whose content is objectively checkable (e.g. a validator, schema, feature gate, route, or test).
- Then add a conservative `EVIDENCE_RULES` entry in `tools/audit-video-scripts-against-code.ts` that searches for that anchor.

### CLM-025: LOW risk

**Claim:** EdPsych Connect World was built by educational professionals for educational professionals.

**Affected videos:**
- `onboarding-welcome` (title=Welcome to Your EdPsych Connect Journey, source=world-class-onboarding)

**Proof work (suggested):**
- Add an evidence anchor (doc/code/test) or adjust the audit scope/heuristics if this is not a meaningful product claim.

**Evidence anchor ideas (for the audit tool):**
- Create/extend a repo file whose content is objectively checkable (e.g. a validator, schema, feature gate, route, or test).
- Then add a conservative `EVIDENCE_RULES` entry in `tools/audit-video-scripts-against-code.ts` that searches for that anchor.

### CLM-004: LOW risk

**Claim:** Good governance isn't anti-AI.

**Affected videos:**
- `compliance-risk-ai` (title=Compliance Risk & AI: Practical Guardrails, source=world-class-v4-additional)

**Proof work (suggested):**
- Add an evidence anchor (doc/code/test) or adjust the audit scope/heuristics if this is not a meaningful product claim.

**Evidence anchor ideas (for the audit tool):**
- Create/extend a repo file whose content is objectively checkable (e.g. a validator, schema, feature gate, route, or test).
- Then add a conservative `EVIDENCE_RULES` entry in `tools/audit-video-scripts-against-code.ts` that searches for that anchor.

### CLM-012: LOW risk

**Claim:** Here's the magic of EdPsych Connect: we don't just dump these reports on you.

**Affected videos:**
- `ehcp-professional-contributions` (title=Understanding Professional Education, Health and Care Plan Contributions, source=world-class-v4-core)

**Proof work (suggested):**
- Add an evidence anchor (doc/code/test) or adjust the audit scope/heuristics if this is not a meaningful product claim.

**Evidence anchor ideas (for the audit tool):**
- Create/extend a repo file whose content is objectively checkable (e.g. a validator, schema, feature gate, route, or test).
- Then add a conservative `EVIDENCE_RULES` entry in `tools/audit-video-scripts-against-code.ts` that searches for that anchor.

### CLM-026: LOW risk

**Claim:** I created this platform because I watched too many brilliant colleagues drowning in paperwork when they should have been doing what they do best: transforming children's lives.

**Affected videos:**
- `onboarding-welcome` (title=Welcome to Your EdPsych Connect Journey, source=world-class-onboarding)

**Proof work (suggested):**
- Add an evidence anchor (doc/code/test) or adjust the audit scope/heuristics if this is not a meaningful product claim.

**Evidence anchor ideas (for the audit tool):**
- Create/extend a repo file whose content is objectively checkable (e.g. a validator, schema, feature gate, route, or test).
- Then add a conservative `EVIDENCE_RULES` entry in `tools/audit-video-scripts-against-code.ts` that searches for that anchor.

### CLM-020: LOW risk

**Claim:** If a student is a 'Visual Learner', the agent explains concepts using diagrams and metaphors.

**Affected videos:**
- `innovation-ai-agents` (title=AI Tutoring Agents: Personalised Learning, source=world-class-v4-innovation)

**Proof work (suggested):**
- Add an evidence anchor (doc/code/test) or adjust the audit scope/heuristics if this is not a meaningful product claim.

**Evidence anchor ideas (for the audit tool):**
- Create/extend a repo file whose content is objectively checkable (e.g. a validator, schema, feature gate, route, or test).
- Then add a conservative `EVIDENCE_RULES` entry in `tools/audit-video-scripts-against-code.ts` that searches for that anchor.

### CLM-035: LOW risk

**Claim:** It's a continuous process — and we build the platform to support that reality.

**Affected videos:**
- `security-deep-dive` (title=Security Deep Dive: Designed for Sensitive SEND Data, source=world-class-v4-additional)

**Proof work (suggested):**
- Add an evidence anchor (doc/code/test) or adjust the audit scope/heuristics if this is not a meaningful product claim.

**Evidence anchor ideas (for the audit tool):**
- Create/extend a repo file whose content is objectively checkable (e.g. a validator, schema, feature gate, route, or test).
- Then add a conservative `EVIDENCE_RULES` entry in `tools/audit-video-scripts-against-code.ts` that searches for that anchor.

### CLM-019: LOW risk

**Claim:** Meet our AI Tutoring Agents.

**Affected videos:**
- `innovation-ai-agents` (title=AI Tutoring Agents: Personalised Learning, source=world-class-v4-innovation)

**Proof work (suggested):**
- Add an evidence anchor (doc/code/test) or adjust the audit scope/heuristics if this is not a meaningful product claim.

**Evidence anchor ideas (for the audit tool):**
- Create/extend a repo file whose content is objectively checkable (e.g. a validator, schema, feature gate, route, or test).
- Then add a conservative `EVIDENCE_RULES` entry in `tools/audit-video-scripts-against-code.ts` that searches for that anchor.

### CLM-017: LOW risk

**Claim:** On EdPsych Connect, you build 'Care Teams' around a child.

**Affected videos:**
- `help-collaboration` (title=Collaborating with Your Team, source=world-class-v4-core)

**Proof work (suggested):**
- Add an evidence anchor (doc/code/test) or adjust the audit scope/heuristics if this is not a meaningful product claim.

**Evidence anchor ideas (for the audit tool):**
- Create/extend a repo file whose content is objectively checkable (e.g. a validator, schema, feature gate, route, or test).
- Then add a conservative `EVIDENCE_RULES` entry in `tools/audit-video-scripts-against-code.ts` that searches for that anchor.

### CLM-029: LOW risk

**Claim:** Our AI will give you a plain-English breakdown.

**Affected videos:**
- `parent-understanding-results` (title=Understanding Your Child's Assessment Results, source=world-class-v4-core)

**Proof work (suggested):**
- Add an evidence anchor (doc/code/test) or adjust the audit scope/heuristics if this is not a meaningful product claim.

**Evidence anchor ideas (for the audit tool):**
- Create/extend a repo file whose content is objectively checkable (e.g. a validator, schema, feature gate, route, or test).
- Then add a conservative `EVIDENCE_RULES` entry in `tools/audit-video-scripts-against-code.ts` that searches for that anchor.

### CLM-015: LOW risk

**Claim:** Our Dashboard is your command centre.

**Affected videos:**
- `feature-la-dashboard` (title=The Local Authority Dashboard, source=world-class-v4-training)

**Proof work (suggested):**
- Add an evidence anchor (doc/code/test) or adjust the audit scope/heuristics if this is not a meaningful product claim.

**Evidence anchor ideas (for the audit tool):**
- Create/extend a repo file whose content is objectively checkable (e.g. a validator, schema, feature gate, route, or test).
- Then add a conservative `EVIDENCE_RULES` entry in `tools/audit-video-scripts-against-code.ts` that searches for that anchor.

### CLM-010: LOW risk

**Claim:** Our platform prompts you for these because they provide the objective baseline.

**Affected videos:**
- `ehcp-evidence-gathering` (title=Gathering Strong Education, Health and Care Plan Evidence, source=world-class-v4-core)

**Proof work (suggested):**
- Add an evidence anchor (doc/code/test) or adjust the audit scope/heuristics if this is not a meaningful product claim.

**Evidence anchor ideas (for the audit tool):**
- Create/extend a repo file whose content is objectively checkable (e.g. a validator, schema, feature gate, route, or test).
- Then add a conservative `EVIDENCE_RULES` entry in `tools/audit-video-scripts-against-code.ts` that searches for that anchor.

### CLM-028: LOW risk

**Claim:** Our platform visualises this for you.

**Affected videos:**
- `parent-understanding-results` (title=Understanding Your Child's Assessment Results, source=world-class-v4-core)

**Proof work (suggested):**
- Add an evidence anchor (doc/code/test) or adjust the audit scope/heuristics if this is not a meaningful product claim.

**Evidence anchor ideas (for the audit tool):**
- Create/extend a repo file whose content is objectively checkable (e.g. a validator, schema, feature gate, route, or test).
- Then add a conservative `EVIDENCE_RULES` entry in `tools/audit-video-scripts-against-code.ts` that searches for that anchor.

### CLM-011: LOW risk

**Claim:** Our system pulls this directly from your intervention logs.

**Affected videos:**
- `ehcp-evidence-gathering` (title=Gathering Strong Education, Health and Care Plan Evidence, source=world-class-v4-core)

**Proof work (suggested):**
- Add an evidence anchor (doc/code/test) or adjust the audit scope/heuristics if this is not a meaningful product claim.

**Evidence anchor ideas (for the audit tool):**
- Create/extend a repo file whose content is objectively checkable (e.g. a validator, schema, feature gate, route, or test).
- Then add a conservative `EVIDENCE_RULES` entry in `tools/audit-video-scripts-against-code.ts` that searches for that anchor.

### CLM-013: LOW risk

**Claim:** Scott AI.

**Affected videos:**
- `feature-ai-agents` (title=Meet Dr. Scott AI, source=world-class-v4-training)

**Proof work (suggested):**
- Add an evidence anchor (doc/code/test) or adjust the audit scope/heuristics if this is not a meaningful product claim.

**Evidence anchor ideas (for the audit tool):**
- Create/extend a repo file whose content is objectively checkable (e.g. a validator, schema, feature gate, route, or test).
- Then add a conservative `EVIDENCE_RULES` entry in `tools/audit-video-scripts-against-code.ts` that searches for that anchor.

### CLM-023: LOW risk

**Claim:** Scott, and I want to introduce you to the 'Safety Net'.

**Affected videos:**
- `innovation-safety-net` (title=The Safety Net: AI Risk Prediction, source=world-class-v4-innovation)

**Proof work (suggested):**
- Add an evidence anchor (doc/code/test) or adjust the audit scope/heuristics if this is not a meaningful product claim.

**Evidence anchor ideas (for the audit tool):**
- Create/extend a repo file whose content is objectively checkable (e.g. a validator, schema, feature gate, route, or test).
- Then add a conservative `EVIDENCE_RULES` entry in `tools/audit-video-scripts-against-code.ts` that searches for that anchor.

### CLM-031: LOW risk

**Claim:** So what actually is this platform?

**Affected videos:**
- `platform-introduction` (title=Welcome to EdPsych Connect World, source=world-class-marketing)

**Proof work (suggested):**
- Add an evidence anchor (doc/code/test) or adjust the audit scope/heuristics if this is not a meaningful product claim.

**Evidence anchor ideas (for the audit tool):**
- Create/extend a repo file whose content is objectively checkable (e.g. a validator, schema, feature gate, route, or test).
- Then add a conservative `EVIDENCE_RULES` entry in `tools/audit-video-scripts-against-code.ts` that searches for that anchor.

### CLM-002: LOW risk

**Claim:** Start using EdPsych Connect for new activity while your historical data remains accessible in your current system.

**Affected videos:**
- `compare-switching` (title=Switching Platforms Without the Pain, source=world-class-v4-pricing-2025-12)

**Proof work (suggested):**
- Add an evidence anchor (doc/code/test) or adjust the audit scope/heuristics if this is not a meaningful product claim.

**Evidence anchor ideas (for the audit tool):**
- Create/extend a repo file whose content is objectively checkable (e.g. a validator, schema, feature gate, route, or test).
- Then add a conservative `EVIDENCE_RULES` entry in `tools/audit-video-scripts-against-code.ts` that searches for that anchor.

### CLM-033: LOW risk

**Claim:** Teachers using this platform tell us they're saving three to four hours every single week.

**Affected videos:**
- `platform-introduction` (title=Welcome to EdPsych Connect World, source=world-class-marketing)

**Proof work (suggested):**
- Add an evidence anchor (doc/code/test) or adjust the audit scope/heuristics if this is not a meaningful product claim.

**Evidence anchor ideas (for the audit tool):**
- Create/extend a repo file whose content is objectively checkable (e.g. a validator, schema, feature gate, route, or test).
- Then add a conservative `EVIDENCE_RULES` entry in `tools/audit-video-scripts-against-code.ts` that searches for that anchor.

### CLM-030: LOW risk

**Claim:** That's exactly why I created EdPsych Connect World.

**Affected videos:**
- `platform-introduction` (title=Welcome to EdPsych Connect World, source=world-class-marketing)

**Proof work (suggested):**
- Add an evidence anchor (doc/code/test) or adjust the audit scope/heuristics if this is not a meaningful product claim.

**Evidence anchor ideas (for the audit tool):**
- Create/extend a repo file whose content is objectively checkable (e.g. a validator, schema, feature gate, route, or test).
- Then add a conservative `EVIDENCE_RULES` entry in `tools/audit-video-scripts-against-code.ts` that searches for that anchor.

### CLM-005: LOW risk

**Claim:** That's the EdPsych Connect difference.

**Affected videos:**
- `data-autonomy` (title=Data Autonomy & Trust, source=world-class-marketing)

**Proof work (suggested):**
- Add an evidence anchor (doc/code/test) or adjust the audit scope/heuristics if this is not a meaningful product claim.

**Evidence anchor ideas (for the audit tool):**
- Create/extend a repo file whose content is objectively checkable (e.g. a validator, schema, feature gate, route, or test).
- Then add a conservative `EVIDENCE_RULES` entry in `tools/audit-video-scripts-against-code.ts` that searches for that anchor.

### CLM-018: LOW risk

**Claim:** That's why we built this platform with a 'Zero Trust' architecture.

**Affected videos:**
- `help-data-security` (title=How We Protect Your Data, source=world-class-v4-core)

**Proof work (suggested):**
- Add an evidence anchor (doc/code/test) or adjust the audit scope/heuristics if this is not a meaningful product claim.

**Evidence anchor ideas (for the audit tool):**
- Create/extend a repo file whose content is objectively checkable (e.g. a validator, schema, feature gate, route, or test).
- Then add a conservative `EVIDENCE_RULES` entry in `tools/audit-video-scripts-against-code.ts` that searches for that anchor.

### CLM-016: LOW risk

**Claim:** Their profiles, built from assessments and observations, are already in the platform.

**Affected videos:**
- `feature-nclb-engine` (title=No Child Left Behind: The Differentiation Revolution, source=world-class-v4-pricing-2025-12)

**Proof work (suggested):**
- Add an evidence anchor (doc/code/test) or adjust the audit scope/heuristics if this is not a meaningful product claim.

**Evidence anchor ideas (for the audit tool):**
- Create/extend a repo file whose content is objectively checkable (e.g. a validator, schema, feature gate, route, or test).
- Then add a conservative `EVIDENCE_RULES` entry in `tools/audit-video-scripts-against-code.ts` that searches for that anchor.

### CLM-006: LOW risk

**Claim:** Then complex vowel teams (ai, ay, a-e).

**Affected videos:**
- `dys-m4-l1` (title=Teaching Phonics Systematically, source=world-class-v4-training)

**Proof work (suggested):**
- Add an evidence anchor (doc/code/test) or adjust the audit scope/heuristics if this is not a meaningful product claim.

**Evidence anchor ideas (for the audit tool):**
- Create/extend a repo file whose content is objectively checkable (e.g. a validator, schema, feature gate, route, or test).
- Then add a conservative `EVIDENCE_RULES` entry in `tools/audit-video-scripts-against-code.ts` that searches for that anchor.

### CLM-024: LOW risk

**Claim:** Then our system does something remarkable.

**Affected videos:**
- `no-child-left-behind` (title=No Child Left Behind, source=world-class-marketing)

**Proof work (suggested):**
- Add an evidence anchor (doc/code/test) or adjust the audit scope/heuristics if this is not a meaningful product claim.

**Evidence anchor ideas (for the audit tool):**
- Create/extend a repo file whose content is objectively checkable (e.g. a validator, schema, feature gate, route, or test).
- Then add a conservative `EVIDENCE_RULES` entry in `tools/audit-video-scripts-against-code.ts` that searches for that anchor.

### CLM-027: LOW risk

**Claim:** This Parent Portal is your window into your child's support.

**Affected videos:**
- `parent-portal-welcome` (title=Welcome to the Parent Portal, source=world-class-v4-core)

**Proof work (suggested):**
- Add an evidence anchor (doc/code/test) or adjust the audit scope/heuristics if this is not a meaningful product claim.

**Evidence anchor ideas (for the audit tool):**
- Create/extend a repo file whose content is objectively checkable (e.g. a validator, schema, feature gate, route, or test).
- Then add a conservative `EVIDENCE_RULES` entry in `tools/audit-video-scripts-against-code.ts` that searches for that anchor.

### CLM-014: LOW risk

**Claim:** We've brought that psychology into EdPsych Connect.

**Affected videos:**
- `feature-gamification` (title=Gamification: Engagement by Design, source=world-class-v4-training)

**Proof work (suggested):**
- Add an evidence anchor (doc/code/test) or adjust the audit scope/heuristics if this is not a meaningful product claim.

**Evidence anchor ideas (for the audit tool):**
- Create/extend a repo file whose content is objectively checkable (e.g. a validator, schema, feature gate, route, or test).
- Then add a conservative `EVIDENCE_RULES` entry in `tools/audit-video-scripts-against-code.ts` that searches for that anchor.

### CLM-037: LOW risk

**Claim:** When you use this platform, you're using something designed by a colleague.

**Affected videos:**
- `trust-built-by-practitioners` (title=Built by Someone Who Actually Does This Work, source=world-class-v4-pricing-2025-12)

**Proof work (suggested):**
- Add an evidence anchor (doc/code/test) or adjust the audit scope/heuristics if this is not a meaningful product claim.

**Evidence anchor ideas (for the audit tool):**
- Create/extend a repo file whose content is objectively checkable (e.g. a validator, schema, feature gate, route, or test).
- Then add a conservative `EVIDENCE_RULES` entry in `tools/audit-video-scripts-against-code.ts` that searches for that anchor.

