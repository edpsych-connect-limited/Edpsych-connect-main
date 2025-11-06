# EdPsych Connect — Enterprise Completion Plan & Initial Assets (v0)

**Owner:** Tech Lead (Assistant)  
**Goal:** Bring the already‑live platform to *enterprise‑grade, world‑class* quality for a **Beta** with Teachers, EPs, Researchers, Students & Admins.  
**Guiding principles:** Don’t remove—**fix/add**. Prioritize **security, reliability, accessibility, performance, and self‑service training**.  

---

## Phase Map & Milestones

**T‑0 (Now → Week 1)**  
- Establish guardrails: CI/Security/Observability baselines; Help Center skeleton; Video pipeline; Role onboarding.
- Deliverables: CI workflows, SECURITY.md, CODEOWNERS, monitoring plan, Help Center IA, first 5 training scripts, changelog template.

**T‑1 (Weeks 2–3)**  
- Hardening passes: auth & secrets, error budgets/SLOs, test coverage baseline, perf budget, accessibility sweep (WCAG AA), data governance.
- Deliverables: threat model, SBOM policy, rate limiting/circuit breakers, A11y fixes & statement, backup/restore runbooks.

**T‑2 (Weeks 4–5)**  
- Self‑service excellence: full training playlist (Teachers/EPs/Researchers/Students/Admin), contextual in‑app “?” deep links, search‑to‑success instrumentation.
- Deliverables: all videos & transcripts, help articles, analytics dashboards, feedback loops.

**T‑3 (Week 6)**  
- Beta pilot readiness: sandbox + PII controls, consent flows, anonymised data‑lake contracts for research, rollback & incident response exercises.
- Deliverables: beta checklist signed, rehearsal drills logged, release playbook.

**Definition of Done (DoD) for Beta**  
- P0 workflows documented and tested end‑to‑end.  
- SLOs met; alerts quiet.  
- Training complete for all roles; in‑app links live.  
- Security posture documented (threat model, SBOMs, secret policy).  
- A11y AA, captions on media, transcripts downloadable.  

---

## Repository Structure Upgrades

```
.github/
  workflows/
    ci.yml
    codeql.yml
    dependency-review.yml
    sbom.yml
CODEOWNERS
SECURITY.md
docs/
  HELP-CENTER/ (articles; one .md per feature)
  TRAINING/
    VIDEO_PLAYLIST.md
    scripts/
      V01-overview.md
      V02-teacher-quickstart.md
      V03-ep-assessment-intro.md
      V04-researcher-portal.md
      V05-student-journey.md
  ONBOARDING/
    teachers.md
    eps.md
    researchers.md
    students.md
  RUNBOOKS/
    incident-major.md
    backup-restore.md
    release-playbook.md
ops/
  a11y-audit.md
  slo.md
  logging-tracing.md
  threat-model.md
scripts/
  verify-env.ps1
  generate-thumbnails.ps1
  export-sbom.ps1
```

---

## CI: Build, Test, Lint, SAST, Secrets, SBOM (GitHub Actions)

**File:** `.github/workflows/ci.yml`
```yaml
name: CI
on:
  push: { branches: [main] }
  pull_request: {}
permissions:
  contents: read
  security-events: write
jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run lint --if-present
      - run: npm run typecheck --if-present
      - run: npm test -- --ci --reporters=default --reporters=jest-junit --coverage --passWithNoTests
      - uses: actions/upload-artifact@v4
        if: always()
        with: { name: coverage, path: coverage }

  secret-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: trufflesecurity/trufflehog@v3
        with:
          extra_args: --json --no-update

  dependency-review:
    permissions: { contents: read, pull-requests: write }
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/dependency-review-action@v4

```

**File:** `.github/workflows/codeql.yml`
```yaml
name: CodeQL
on:
  push: { branches: [main] }
  pull_request: {}
  schedule: [ { cron: '0 2 * * 1' } ]
permissions:
  actions: read
  contents: read
  security-events: write
jobs:
  analyze:
    uses: github/codeql-action/.github/workflows/codeql.yml@v3
    with:
      languages: 'javascript'
```

**File:** `.github/workflows/sbom.yml`
```yaml
name: SBOM
on:
  push: { branches: [main] }
  workflow_dispatch: {}
permissions:
  contents: write
jobs:
  syft:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Generate CycloneDX SBOM
        uses: anchore/sbom-action@v0
        with:
          path: .
          format: cyclonedx-json
          output-file: sbom.cdx.json
      - uses: actions/upload-artifact@v4
        with: { name: sbom, path: sbom.cdx.json }
```

---

## Security & Ownership

**File:** `CODEOWNERS`
```text
# Require reviews from domain owners
* @edpsychconnect/tech-leads
/docs/** @edpsychconnect/docs
/.github/workflows/** @edpsychconnect/platform
```

**File:** `SECURITY.md`
```markdown
# Security Policy

## Supported Versions
Production branch: `main`.

## Reporting
Email security@edpsychconnect.app for vulnerabilities. We aim to triage within 48 hours.

## Secrets
- No plaintext secrets in repo. Use environment secret manager (Vercel/Cloud) with least privilege.
- Rotate keys every 90 days; revoke on suspicion of leakage.

## Dependencies & SBOM
- SBOM generated on each push (CycloneDX).
- Monthly review of high/critical advisories; patch SLA: 7 days (critical), 14 days (high).
```

---

## Observability Plan (Logs, Metrics, Traces)

**File:** `ops/logging-tracing.md`
```markdown
# Logging & Tracing
- Structured JSON logs with request_id, user_role, route, latency_ms.
- 4 Golden Signals dashboards: latency, traffic, errors, saturation.
- Correlate logs ↔ traces via trace_id headers (W3C Trace Context).
- P0 alerts: error rate > 2% for 5 min; p95 latency > 800ms for 10 min.
```

**File:** `ops/slo.md`
```markdown
# SLOs & Error Budgets
- Availability: 99.9% monthly
- p95 API latency: < 500ms
- Support response: < 1 business day
- Training completion (new teacher): > 85% within 7 days
```

---

## Help Center Information Architecture (IA)

**Folder:** `docs/HELP-CENTER/`

```markdown
- Getting Started
  - Quick Start (Teacher)
  - Quick Start (EP)
  - Quick Start (Researcher)
  - Quick Start (Student)
- Core Workflows
  - Assessments & Reports
  - Interventions & Tracking
  - Parent Communication
  - Researcher Portal & Consent
  - Student Journey & Engagement
- Admin & Privacy
  - Roles & Permissions
  - Data Protection & GDPR
  - Billing & Plans
- Troubleshooting
  - Common Errors
  - FAQ
```

**Template (copy per article)**  
`docs/HELP-CENTER/template.md`
```markdown
# <Article Title>
**Audience:** Teacher | EP | Researcher | Student | Admin
**Updated:** 2025‑11‑06  

## Overview
What this covers and value.

## Steps
1. …
2. …

## Video
- Primary: <link + timestamps>

## Screenshots
- …

## Related
- …
```

---

## Training Playlist & Initial Scripts

**File:** `docs/TRAINING/VIDEO_PLAYLIST.md`
```markdown
# Training Playlist (v0)

V01 – Platform Overview (All Roles)
V02 – Teacher Quick Start
V03 – EP: Assessment & Reporting Intro
V04 – Researcher Portal & Consent
V05 – Student Journey: Motivation & Progress
V06 – Parent Communication
V07 – Interventions & Monitoring
V08 – Data Privacy & Roles
V09 – Admin Console
V10 – Troubleshooting & Support
```

**Example Script:** `docs/TRAINING/scripts/V02-teacher-quickstart.md`
```markdown
# V02 – Teacher Quick Start
**Objective:** Be productive in <15 minutes; create class, assign content, review progress, contact parents.
**Length:** 4–6 minutes  
**Assets:** 1080p capture, captions (.srt), transcript, thumbnail.

## Outline & Talking Points
1) Sign in & landing (10s) — What you can do here.
2) Create class & roster (45s) — CSV/import and manual add. Tips for safeguarding.
3) Assign differentiated content (90s) — Levels, accommodations, evidence base.
4) Track progress (60s) — Dashboards, flags, interventions.
5) Communicate with parents (45s) — Templates, language tone, audit trail.
6) Where to get help (20s) — “?” buttons link to this video’s timestamps.

## On‑screen Cues
- Zooms on primary actions; highlight role labels.
- Callouts for consent boundaries.

## Assessment
- 5‑question check at the end (auto‑graded).
```

**Example Script:** `docs/TRAINING/scripts/V04-researcher-portal.md`
```markdown
# V04 – Researcher Portal & Consent
Objective: Navigate datasets ethically; request access; run approved exports; view anonymised dashboards.
Key Points: consent flows, DUA, pseudonymisation, audit logs, reproducibility.
```

**Example Script:** `docs/TRAINING/scripts/V05-student-journey.md`
```markdown
# V05 – Student Journey: Motivation & Progress
Objective: Re‑engage learners via gamified goals, progress badges, and feedback loops.
Key Points: accessibility, neurodiversity‑friendly visuals, low‑friction navigation, privacy of peer data.
```

---

## Runbooks

**File:** `docs/RUNBOOKS/incident-major.md`
```markdown
# Major Incident Runbook
- Declare severity; paging policy; comms template.
- First 30 min: stabilize, rollback, feature flags.
- Stakeholders: teachers, admins, researchers; status page updates.
- Postmortem: timeline, contributing factors, action items with owners.
```

**File:** `docs/RUNBOOKS/release-playbook.md`
```markdown
# Release Playbook
- Pre‑flight: tests green, SBOM generated, secrets checked.
- Deploy: canary 10% → 50% → 100%.
- Verify: smoke tests; analytics and logs; roll‑forward plan.
- Comms: changelog entry; “What’s new” banner; updated help links.
```

---

## Next Actions (What I’ll do once repo files are analyzable here)
1) Parse your code & configs; map gaps to the plan above.
2) Populate each template with your actual routes, components, and screenshots.
3) Generate remaining training scripts (full set) + thumbnails + captions.
4) Wire contextual “?” links and search to success.
5) Final Beta sign‑off drill with acceptance criteria.

> If you paste your top‑level repo tree (or enable the connector later), I’ll fill in concrete file paths, package scripts, and live routes immediately.

