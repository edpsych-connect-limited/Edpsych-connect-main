# EdPsych Connect — Implementation Pack v2 (APIs, Data Models, Safeguarding, Training)

**Author:** AI Dr Patrick (Autonomous)\
**Region:** UK (GB English, UK education terminology)\
**Objective:** Produce concrete, drop‑in implementation assets to elevate the live platform to enterprise‑grade Beta. No removals — only improvements and additions.

---

## 1) OpenAPI (extracts) — Core Services

**Conventions**: JWT bearer auth; all timestamps ISO‑8601; idempotent POSTs carry `Idempotency-Key` header; rate‑limits enforced.

```yaml
openapi: 3.0.3
info: { title: EdPsych Connect API, version: 0.1.0 }
servers:
  - url: https://<APP_URL>/api
security: [{ bearerAuth: [] }]
components:
  securitySchemes:
    bearerAuth: { type: http, scheme: bearer, bearerFormat: JWT }
  headers:
    Request-Id: { description: Correlation id, schema: { type: string } }
  schemas:
    Role: { type: string, enum: [Teacher, EP, Researcher, Student, Admin] }
    PlanRequest:
      type: object
      required: [class_id, topic, duration_mins]
      properties:
        class_id: { type: string, format: uuid }
        topic: { type: string, example: "Fractions – comparing and ordering" }
        duration_mins: { type: integer, minimum: 10, maximum: 180 }
        goals: { type: array, items: { type: string } }
        constraints: { type: object }
    PlanResponse:
      type: object
      properties:
        plan_id: { type: string, format: uuid }
        sections: { type: array, items: { type: object } }
        differentiation: { type: array, items: { type: object } }
        printable_pdf_url: { type: string, format: uri }
        parent_brief_markdown: { type: string }
    MissionRequest:
      type: object
      required: [pupil_id, topic]
      properties:
        pupil_id: { type: string, format: uuid }
        topic: { type: string, example: "Ratios KS3" }
        pretest_score: { type: number, minimum: 0, maximum: 1 }
        prefs: { type: object }
    MissionResponse:
      type: object
      properties:
        mission_id: { type: string }
        scenes: { type: array, items: { type: object } }
        target_objectives: { type: array, items: { type: string } }
        checks: { type: array, items: { type: object } }
    SafeguardSignal:
      type: object
      properties:
        pupil_id: { type: string, format: uuid }
        type: { type: string, enum: [EngagementDip, SentimentConcern, Attendance, Communication] }
        level: { type: string, enum: [Info, Watch, Alert] }
        score: { type: number, minimum: 0, maximum: 1 }
        rationale: { type: string }
        next_steps: { type: array, items: { type: string } }
paths:
  /teacher/plan:
    post:
      summary: Generate a differentiated lesson plan (UK)
      requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/PlanRequest' } } } }
      responses:
        '200': { description: OK, headers: { Request-Id: { $ref: '#/components/headers/Request-Id' } }, content: { application/json: { schema: { $ref: '#/components/schemas/PlanResponse' } } } }
  /learn/mission:
    post:
      summary: Create an adaptive learning mission (Imagination Engine)
      requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/MissionRequest' } } } }
      responses:
        '200': { description: OK, content: { application/json: { schema: { $ref: '#/components/schemas/MissionResponse' } } } }
  /safeguarding/signals:
    get:
      summary: Retrieve safeguarding signals for a class or pupil
      parameters:
        - in: query; name: class_id; schema: { type: string, format: uuid }
        - in: query; name: pupil_id; schema: { type: string, format: uuid }
      responses:
        '200': { description: OK, content: { application/json: { schema: { type: array, items: { $ref: '#/components/schemas/SafeguardSignal' } } } } }
  /research/exports:
    post:
      summary: Request an anonymised research export (DUA required)
      responses:
        '202': { description: Accepted (queued); headers: { Request-Id: { $ref: '#/components/headers/Request-Id' } } }
```

---

## 2) Postgres — DDL (core)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('Teacher','EP','Researcher','Student','Admin')) NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE pupils (
  id UUID PRIMARY KEY,
  upn TEXT UNIQUE,
  forename TEXT, surname TEXT,
  dob DATE, sen_code TEXT, eal BOOLEAN DEFAULT false, pupil_premium BOOLEAN DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE classes (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  phase TEXT, -- KS1..KS5
  teacher_id UUID REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE enrolments (
  class_id UUID REFERENCES classes(id),
  pupil_id UUID REFERENCES pupils(id),
  PRIMARY KEY (class_id, pupil_id)
);

CREATE TABLE assessments (
  id UUID PRIMARY KEY,
  pupil_id UUID REFERENCES pupils(id),
  type TEXT,
  raw_score NUMERIC,
  scaled_score NUMERIC,
  at_time timestamptz DEFAULT now(),
  notes TEXT
);

CREATE TABLE interventions (
  id UUID PRIMARY KEY,
  pupil_id UUID REFERENCES pupils(id),
  name TEXT,
  fidelity JSONB,
  started_at timestamptz,
  ended_at timestamptz
);

CREATE TABLE reports (
  id UUID PRIMARY KEY,
  pupil_id UUID REFERENCES pupils(id),
  author_id UUID REFERENCES users(id),
  content_md TEXT,
  status TEXT CHECK (status IN ('draft','final')) DEFAULT 'draft',
  version INT DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE consent_records (
  id UUID PRIMARY KEY,
  subject TEXT CHECK (subject IN ('Research','DataShare','Media')),
  pupil_id UUID REFERENCES pupils(id),
  granted BOOLEAN,
  recorded_at timestamptz DEFAULT now(),
  actor_id UUID REFERENCES users(id)
);

CREATE TABLE audit_events (
  id BIGSERIAL PRIMARY KEY,
  actor_id UUID, action TEXT, entity TEXT, entity_id UUID,
  role TEXT, ip INET,
  occurred_at timestamptz DEFAULT now()
);

CREATE INDEX idx_assess_pupil_time ON assessments(pupil_id, at_time DESC);
CREATE INDEX idx_interventions_pupil ON interventions(pupil_id);
CREATE INDEX idx_audit_time ON audit_events(occurred_at DESC);
```

---

## 3) MongoDB — Content & Training Schemas

```jsonc
// help.articles
{
  "_id": "help/teacher-quick-start",
  "title": "Teacher Quick Start",
  "audience": ["Teacher"],
  "updatedAt": "2025-11-06T10:00:00Z",
  "body": "# Quick Start...",
  "video": { "url": "https://...", "timestamps": [{"t":"00:30","label":"Create class"}] },
  "related": ["help/differentiation", "help/parent-communication"]
}

// training.scripts
{
  "_id": "V02-teacher-quickstart",
  "title": "V02 – Teacher Quick Start",
  "version": "1.0.0",
  "targets": ["Teacher"],
  "sections": [
    { "heading": "Sign in", "narration": "Welcome...", "shots": ["landing.png"] },
    { "heading": "Create a class", "narration": "...", "shots": [] }
  ],
  "assets": { "thumbnail": "V02.png", "captions": "V02.srt" }
}

// tours (in‑app guided steps)
{
  "_id": "tour/teacher/onboarding",
  "audience": "Teacher",
  "steps": [
    { "selector": "#create-class", "copy": "Create your first class.", "placement": "right" },
    { "selector": "#assign-work", "copy": "Assign differentiated work.", "placement": "bottom" }
  ]
}
```

---

## 4) Redis — Keys & Queues

```
session:{userId}                -> { json }
q:transcribe:jobs               -> list (LPUSH job ids)
q:transcribe:job:{id}           -> { status, src_url, srt_url, error }
rate:{userId}:{route}:{minute}  -> count (fixed window)
```

---

## 5) Neo4j — Graph Model & Queries

```cypher
CREATE CONSTRAINT pupil_id IF NOT EXISTS FOR (p:Pupil) REQUIRE p.id IS UNIQUE;
CREATE CONSTRAINT need_name IF NOT EXISTS FOR (n:Need) REQUIRE n.name IS UNIQUE;
CREATE CONSTRAINT intervention_id IF NOT EXISTS FOR (i:Intervention) REQUIRE i.id IS UNIQUE;

// Example relationships
MATCH (p:Pupil {id:$pupilId}), (n:Need {name:$need})
MERGE (p)-[:HAS_NEED {confidence:$c}]->(n);

// What worked for similar pupils?
MATCH (p:Pupil {id:$pupil})-[:HAS_NEED]->(n)<-[:TARGETS]-(i:Intervention)
MATCH (i)-[r:RESULTED_IN]->(o:Outcome)
RETURN i.name, avg(r.delta) AS avgImpact
ORDER BY avgImpact DESC LIMIT 5;
```

---

## 6) Observability & Security

- **OpenTelemetry**: propagate `traceparent`; capture spans for `/teacher/plan`, `/learn/mission`.
- **Structured logs**: `{ request_id, user_role, route, status, latency_ms }`.
- **Alerts**: p95 latency > 800ms (10m), error rate > 2% (5m), queue backlog > 100 jobs (10m).
- **Secrets**: only via Vercel/Railway env vars; rotate 90 days; no secrets in code.

**Env checklist**

```
APP_ENV=production
JWT_SECRET=...
POSTGRES_URL=...
MONGODB_URI=...
REDIS_URL=...
NEO4J_URI=...
NEO4J_USER=...
NEO4J_PASSWORD=...
STORAGE_BUCKET=...
```

---

## 7) Safeguarding — Thresholds & Language Guide

**Signal thresholds (tunable)**

- **EngagementDip (Watch)**: 3 sessions with >40% incomplete tasks or >2× pause time vs baseline.
- **EngagementDip (Alert)**: 5 consecutive sessions meeting Watch + negative sentiment trend.
- **SentimentConcern (Watch)**: 2+ instances of frustration cues (rapid retries, abandon within 30s).
- **SentimentConcern (Alert)**: sustained frustration across 3 days or explicit concerning language (filtered, anonymised).

**Language guidance (never diagnostic, always supportive)**

- ✅ “We’ve noticed it’s been harder to finish tasks recently. A short break or a simpler first step might help. Would you like suggestions?”
- ✅ “Today’s instructions seemed busy. Shall we try a calmer layout or read‑aloud?”
- 🚫 Avoid labels: “lazy”, “non‑compliant”, “disorder”.

**Escalation runbook (summary)**

1. **Detect & log** signal with rationale + trace id.
2. **Teacher view**: shows pattern + recommended next steps (classroom strategies, time adjustments).
3. **If Alert**: prompt safeguarding lead; provide evidence pack (timeline, interactions, anonymised excerpts).
4. **Record action** in audit log; set review checkpoint (1–2 weeks).

---

## 8) Wireframe Specs (narrative; ready for Figma build)

**Pupil Home (KS2/KS3)**

- Header: avatar, house points, streak.
- Main: “Today’s mission” card (topic + friendly blurb); secondary cards for “Practise”, “Create”, “Explore”.
- Footer: accessibility toggles (read‑aloud, font, contrast, motion).

**Teacher Console**

- Left nav: Classes, Planning, Interventions, Reports, Messages, Safeguarding.
- Dashboard: cohorts with heatmap; alerts panel; quick actions (plan lesson, assign, message parents).

**EP Insight Hub**

- Case list; assessment timeline; recommendation composer; school heatmap (anonymised); export request button.

---

## 9) Training — Final Scripts (Educator Top 5)

### V01 – Platform Overview (All)

**Length:** 4–5 mins\
**Narration (extract):** “Welcome to EdPsych Connect — a UK learning platform built with psychology at its heart. Today, we’ll tour the essentials: how pupils learn through story‑led missions, how teachers plan in minutes, and how EPs and researchers gain ethical, anonymised insights.” **Chapters:** Home • Classes • Missions • Interventions • Reports • Help & Training

### V02 – Teacher Quick Start (Final)

**Length:** 5–6 mins\
**Chapters:** Sign‑in • Create a class • Assign differentiated work • Track progress • Message parents • Where to get help\
**Notes:** Use UK spellings; show data privacy panel when messaging.

### V03 – EP: Assessment & Reporting Intro (Final)

**Length:** 6–7 mins\
**Chapters:** Intake • Select assessment • Record observations • Draft report • Recommendations • Share & sign‑off\
**Notes:** Safeguarding boundaries; no diagnostic language.

### V04 – Researcher Portal & Consent (Final)

**Length:** 6–7 mins\
**Chapters:** Request approval • DUA • Pseudonymisation • Query dashboards • Export capsule\
**Notes:** Consent lifecycle; audit trail preview.

### V05 – Interventions & Monitoring (Final)

**Length:** 6–7 mins\
**Chapters:** Choose strategy • Fidelity checklist • Session log • Decision rules • Review\
**Notes:** Link to evidence base; show impact graph.

---

## 10) Help Centre — Draft Articles (5)

- **Teacher Quick Start** — step‑by‑step, screenshots, video timestamps.
- **Differentiation & Accessibility** — UDL options, read‑aloud, fonts, contrast, motion.
- **Interventions & Monitoring** — selecting strategies, logging sessions, decision rules.
- **Safeguarding & Signals** — what you’ll see, thresholds, language guidance, escalation.
- **EP Insight Hub** — timelines, assessment packs, recommendations, evidence packs.

---

## 11) Next Autonomous Steps (will proceed without pause)

1. Produce **full OpenAPI spec** (complete paths & schemas) and deposit into `/docs/api/openapi.yaml`.
2. Generate **database migration scripts** (Postgres Alembic / Prisma equivalent).
3. Create **seed data** for Beta sandbox (synthetic, UK‑realistic).
4. Prepare **GitHub Actions** full YAMLs (CI, CodeQL, dependency review, SBOM).
5. Deliver **Help Centre** 20+ articles scaffold as Markdown files.
6. Extend **training scripts** to 12 videos (next set) + thumbnail templates.
7. Draft **VR/3D pilot** brief (optional module) for spatial learning scenes.

> I will continue generating these assets in subsequent drops until complete, keeping UK usage, safeguarding, accessibility, and enterprise standards at the core.

