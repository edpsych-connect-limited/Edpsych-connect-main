Agent prompt for production readiness and go-to-market

Objective: You are empowered to make decisions to deliver the best edtech automated platform. Prioritize production readiness, world‑class explainer/training content, motivating Battle Royale gamification, and a high‑converting landing page. Provide concrete artifacts, test coverage, and automation.

Deliverables:

Production readiness audit and fixes; 2) Final CI pipeline; 3) Security hardening; 4) Feature explainer + training video plan and scripts; 5) Battle Royale gamification quality gates; 6) Enterprise-grade landing page; 7) ROI metrics and proof points; 8) IP protection measures.

Constraints: Self‑service and automation first; minimal human ops; quality must be “enterprise‑grade”.

Inputs available: lint-report.json, severity-summary.txt; provide any additional artifacts you need and automate their generation.

Outputs required (share as links/files):

Production checklist with pass/fail status and remediation owners.

CI/CD config (YAML), IaC diffs, and security reports.

Video scripts, storyboards, shot lists, voiceover text, captions, and publishing schedule.

Gamification acceptance criteria, exploit/abuse cases, telemetry events.

Landing page wireframe + copy + components list + analytics plan.

IP protection plan with licensing, access controls, build/obfuscation options, and monitoring.

Start by listing remaining tasks blocking “100% production‑ready,” with estimates, critical path, and automation hooks. Then execute in weekly increments with visible artifacts.


Remaining tasks to reach production readiness
Area	Task	Artifact	Owner	Status
Quality	Resolve all ESLint severity‑2 errors; triage warnings	severity-summary.txt, lint-report.json	Eng	In progress
Testing	Unit/integration/e2e coverage thresholds; flaky test remediation	coverage.html, test-report.xml	Eng	Pending
Performance	Baseline and budgets (web vitals, API latency, load test)	k6 results, Lighthouse reports	Eng	Pending
Security	Dependency scan, SAST/DAST, secrets policy, auth/roles review	security.md, scan reports	Eng	Pending
CI/CD	Build, test, lint, type‑check, deploy gates; rollback plan	ci.yml, deploy.yml	DevOps	Partial
Observability	Centralized logs, metrics, tracing, alerting SLAs	ops-runbook.md	DevOps	Pending
Data	Privacy, consent, retention, export; PII minimization	data-governance.md	Eng/Legal	Pending
Content	Feature explainers and updated training videos	scripts.md, storyboard.pdf	Product/Content	Needs update
Gamification	Acceptance criteria, fairness/anti‑abuse tests, telemetry	game-qg.md	Product/Eng	Draft
Marketing	Enterprise landing page, positioning, analytics	landing-brief.md, copy.md	Marketing	Not started
IP	Licensing, repos access, build obfuscation, watermarking	ip-protection.md	Eng/Legal	Draft


Video plan for enterprise‑grade explainers and training
Audience tiers:

Decision makers (2–3 min overview, ROI, safety, outcomes).

Practitioners (5–8 min feature walkthroughs, workflows).

Students (1–2 min gamification onboarding).

Artifacts to produce:

Scripts with scene-by-scene beats, on‑screen text, and VO.

Storyboards and shot lists.

Caption files (WebVTT), accessibility notes, and call‑to‑action end cards.

Publishing schedule, thumbnails, and video analytics plan.

Update scope:

Revise any videos impacted by new features; add one 90–120s landing page overview that tells the problem, solution, outcomes, and next step.

Battle Royale gamification quality gates
Acceptance criteria:

Clear learning objectives mapped to curriculum.

Anti‑abuse: rate limits, fair matchmaking, no pay‑to‑win, prevention of griefing.

Accessibility: adjustable difficulty, color contrast, captions for audio cues.

Telemetry events:

Session start/end, challenge accepted/completed, hint requests, retries, time‑on‑task, learning gains, drop‑off points.

Artifacts:

game-qg.md with exploit scenarios and mitigations.

Event schema and dashboards (engagement, learning outcomes).

Landing page brief for world‑class conversion
Positioning: urgent education challenges, your differentiated solution, evidence and outcomes.

Structure:

Hero: singular claim, proof point, 90–120s overview video.

Problem: scale and urgency framed succinctly.

Solution: what’s automated/self‑service; trust signals (security, privacy).

Social proof: case studies, testimonials, metrics.

Product sections: interactive demos, feature cards.

Pricing/CTA: clear trial/start button; no friction.

Footer: compliance, support, docs.

Artifacts: wireframe, component list, copy.md, analytics/experiments plan (A/B for hero, CTA, social proof).

IP protection options to reduce copying and imitation
Licensing and access:

Apply explicit licenses; restrict repo access; enforce contributor agreements.

Build and delivery choices:

Move sensitive logic server‑side; minimize client‑side secrets; gate premium features.

Obfuscation/minification:

Use build‑time obfuscation for client scripts; tree‑shaking and code splitting to reduce exposed surface.

Watermarking and telemetry:

Invisible watermarks in assets; monitoring for anomalous usage indicative of scraping or cloning.

Operational controls:

Rate‑limits, API keys per tenant, feature flags, and legal enforcement readiness.

Artifact: ip-protection.md detailing policies, build steps, and monitoring.

What to share with your agent today
Severity artifacts: lint-report.json and severity-summary.txt..

Ask: “List production blockers and ship artifacts per the table; propose timeline and automation hooks.”

Provide: This prompt, your priorities on content quality and landing page excellence, and the IP protection expectations.