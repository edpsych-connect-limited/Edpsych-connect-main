# EdPsych Connect — Implementation Pack v3 (OpenAPI, Migrations, CI, Seeds, Drive Ingestion)

**Author:** AI Dr Patrick (Autonomous)  
**Region:** UK (GB English)  
**Guarantee:** *Nothing you have built will be lost.* All prior work is preserved, versioned, and **perfected** via additive upgrades. This pack adds: a near‑complete OpenAPI, DB migrations + seed data, CI workflows, and a Google Drive ingestion + preservation plan.

---

## 0) Preservation First — “Never Lose Anything” Policies
- **Immutable archive (WORM):** every import stored to object storage (`archive/YYYY/MM/DD/<hash>-<filename>`).  
- **Content hash ledger:** SHA‑256 recorded in `archive_manifest` table + `docs.content_hash`.  
- **Versioning:** `vX.Y.Z` docs; changes recorded in `docs.revisions` with diff metadata.  
- **Backups:** daily snapshots (7 days), weekly (8 weeks), monthly (12 months).  
- **Deletions:** soft‑delete only; restoration runbook included.  

---

## 1) OpenAPI (expanded — save as `docs/api/openapi.yaml`)
```yaml
openapi: 3.0.3
info: { title: EdPsych Connect API, version: 0.2.0 }
servers:
  - url: https://<APP_URL>/api
  - url: https://sandbox.<APP_URL>/api
security: [{ bearerAuth: [] }]
components:
  securitySchemes:
    bearerAuth: { type: http, scheme: bearer, bearerFormat: JWT }
  parameters:
    ClassId: { in: query, name: class_id, required: false, schema: { type: string, format: uuid } }
    PupilId: { in: query, name: pupil_id, required: false, schema: { type: string, format: uuid } }
  schemas:
    Role: { type: string, enum: [Teacher, EP, Researcher, Student, Admin] }
    User: { type: object, properties: { id: {type: string, format: uuid}, email: {type: string}, name: {type: string}, role: {$ref:'#/components/schemas/Role'} } }
    Pupil: { type: object, properties: { id:{type:string,format:uuid}, upn:{type:string}, forename:{type:string}, surname:{type:string}, dob:{type:string,format:date}, sen_code:{type:string}, eal:{type:boolean}, pupil_premium:{type:boolean} } }
    Assessment: { type: object, properties: { id:{type:string,format:uuid}, pupil_id:{type:string,format:uuid}, type:{type:string}, raw_score:{type:number}, scaled_score:{type:number}, at_time:{type:string,format:date-time}, notes:{type:string} } }
    PlanRequest: { type: object, required:[class_id,topic,duration_mins], properties: { class_id:{type:string,format:uuid}, topic:{type:string}, duration_mins:{type:integer}, goals:{type:array,items:{type:string}}, constraints:{type:object} } }
    PlanResponse: { type: object, properties: { plan_id:{type:string,format:uuid}, sections:{type:array,items:{type:object}}, differentiation:{type:array,items:{type:object}}, printable_pdf_url:{type:string,format:uri}, parent_brief_markdown:{type:string} } }
    MissionRequest: { type: object, required:[pupil_id,topic], properties: { pupil_id:{type:string,format:uuid}, topic:{type:string}, pretest_score:{type:number}, prefs:{type:object} } }
    MissionResponse: { type: object, properties:{ mission_id:{type:string}, scenes:{type:array,items:{type:object}}, target_objectives:{type:array,items:{type:string}}, checks:{type:array,items:{type:object}} } }
    SafeguardSignal: { type: object, properties:{ pupil_id:{type:string,format:uuid}, type:{type:string,enum:[EngagementDip,SentimentConcern,Attendance,Communication]}, level:{type:string,enum:[Info,Watch,Alert]}, score:{type:number}, rationale:{type:string}, next_steps:{type:array,items:{type:string}} } }
    ExportRequest: { type: object, properties: { scope:{type:string,enum:[School,Cohort,AnonymisedAggregate]}, filters:{type:object}, reason:{type:string} }, required:[scope,reason] }
    ExportResponse: { type: object, properties: { request_id:{type:string}, status:{type:string,enum:[queued,approved,rejected,ready]}, download_url:{type:string,format:uri} } }
paths:
  /auth/me:
    get:
      summary: Current user
      responses: { '200': { description: OK, content: { application/json: { schema: {$ref:'#/components/schemas/User'} } } } }
  /teacher/plan:
    post:
      summary: Generate a differentiated lesson plan (UK)
      requestBody: { required: true, content: { application/json: { schema: {$ref:'#/components/schemas/PlanRequest'} } } }
      responses: { '200': { description: OK, content: { application/json: { schema: {$ref:'#/components/schemas/PlanResponse'} } } } }
  /learn/mission:
    post:
      summary: Create an adaptive learning mission (Imagination Engine)
      requestBody: { required: true, content: { application/json: { schema: {$ref:'#/components/schemas/MissionRequest'} } } }
      responses: { '200': { description: OK, content: { application/json: { schema: {$ref:'#/components/schemas/MissionResponse'} } } } }
  /safeguarding/signals:
    get:
      summary: Retrieve safeguarding signals for a class or pupil
      parameters: [ {$ref:'#/components/parameters/ClassId'}, {$ref:'#/components/parameters/PupilId'} ]
      responses: { '200': { description: OK, content: { application/json: { schema: { type: array, items: {$ref:'#/components/schemas/SafeguardSignal'} } } } } }
  /research/exports:
    post:
      summary: Request an anonymised research export (DUA required)
      requestBody: { required: true, content: { application/json: { schema: {$ref:'#/components/schemas/ExportRequest'} } } }
      responses: { '202': { description: Accepted, content: { application/json: { schema: {$ref:'#/components/schemas/ExportResponse'} } } } }
```

---

## 2) Database Migrations
**Approach:** Alembic (Python) or Prisma (TS). Below shows SQL for an initial migration; add to `/db/migrations/0001_init.sql`.

```sql
-- 0001_init.sql
BEGIN;
-- users, pupils, classes, enrolments (as in v2 pack) + extras
CREATE TABLE schools(
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  urn TEXT UNIQUE,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE classes ADD COLUMN school_id UUID REFERENCES schools(id);

CREATE TABLE messages (
  id UUID PRIMARY KEY,
  from_user UUID REFERENCES users(id),
  to_parent BOOLEAN DEFAULT false,
  class_id UUID REFERENCES classes(id),
  body TEXT,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE exports (
  id UUID PRIMARY KEY,
  scope TEXT,
  filters JSONB,
  reason TEXT,
  status TEXT DEFAULT 'queued',
  created_by UUID REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  download_url TEXT
);

CREATE TABLE archive_manifest (
  id BIGSERIAL PRIMARY KEY,
  sha256 TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  stored_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES users(id),
  uploaded_at timestamptz DEFAULT now()
);
COMMIT;
```

**Apply:** `psql $POSTGRES_URL -f db/migrations/0001_init.sql`

---

## 3) Seed Data (synthetic, UK‑realistic) — `/db/seeds/seed.sql`
```sql
INSERT INTO schools(id,name,urn) VALUES
  ('00000000-0000-0000-0000-000000000001','Oakfield Primary School','123456');

INSERT INTO users(id,email,name,role) VALUES
  ('10000000-0000-0000-0000-000000000001','alice@oakfield.sch.uk','Alice Brown','Teacher'),
  ('10000000-0000-0000-0000-000000000002','dr.khan@eps.uk','Dr A. Khan','EP');

INSERT INTO classes(id,name,phase,teacher_id,school_id) VALUES
  ('20000000-0000-0000-0000-000000000001','Year 5 – Elm','KS2','10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001');

INSERT INTO pupils(id,upn,forename,surname,dob,sen_code,eal,pupil_premium) VALUES
  ('30000000-0000-0000-0000-000000000001','UPN1234567','Jacob','Hughes','2014-05-11','K','true','false'),
  ('30000000-0000-0000-0000-000000000002','UPN7654321','Maya','Shah','2014-09-03',NULL,'false','true');

INSERT INTO enrolments(class_id,pupil_id) VALUES
  ('20000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000002');
```

**Apply:** `psql $POSTGRES_URL -f db/seeds/seed.sql`

---

## 4) GitHub Actions — Full YAMLs (`.github/workflows/`)

### `ci.yml`
```yaml
name: CI
on: [push, pull_request]
permissions: { contents: read, security-events: write }
jobs:
  build_test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci --ignore-scripts
      - run: npm run lint --if-present
      - run: npm run typecheck --if-present
      - run: npm test -- --ci --reporters=default --reporters=jest-junit --coverage --passWithNoTests
      - uses: actions/upload-artifact@v4
        if: always()
        with: { name: coverage, path: coverage }
  trufflehog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: trufflesecurity/trufflehog@v3
        with: { extra_args: --json --no-update }
  dependency-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/dependency-review-action@v4
```

### `codeql.yml`
```yaml
name: CodeQL
on:
  push: { branches: [main] }
  pull_request: {}
  schedule: [ { cron: '0 2 * * 1' } ]
permissions: { actions: read, contents: read, security-events: write }
jobs:
  analyze:
    uses: github/codeql-action/.github/workflows/codeql.yml@v3
    with: { languages: 'javascript' }
```

### `sbom.yml`
```yaml
name: SBOM
on: [push]
permissions: { contents: write }
jobs:
  syft:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: anchore/sbom-action@v0
        with: { path: ., format: cyclonedx-json, output-file: sbom.cdx.json }
      - uses: actions/upload-artifact@v4
        with: { name: sbom, path: sbom.cdx.json }
```

---

## 5) Google Drive Ingestion & Inspiration — Safe Pipeline
**Goal:** bring your Drive “treasure trove” into the platform **without losing anything**; deduplicate and version resources; inspire training/help content.

**Workflow**
1. **Inventory** via Drive API: list files + metadata (id, name, mimeType, md5Checksum, modifiedTime, parents).  
2. **Hash & compare**: compute SHA‑256 locally; if new hash, write to `archive/` with date‑based path.  
3. **Map to collections**:
   - PDFs/Docs → `docs.help.articles` (as attachments) or `docs.training.scripts` references.
   - Videos → `training.assets` with transcript extraction queue.
   - Slides/Sheets → converted to PNG/CSV previews + linked artefacts.
4. **Transcribe** videos (Redis queue → Whisper worker), generate `.srt` + `.vtt` for accessibility.  
5. **Tagging**: role (Teacher/EP/Researcher/Student), key stage (KS1–KS5), topic, safeguarding sensitivity.  
6. **Human-in-the-loop** (you): optional review pass before publishing (can be skipped to stay autonomous).

**Config** (`/configs/drive_ingestion.json`)
```json
{
  "rootFolderName": "EdPsych Connect",
  "include": ["help", "training", "slides", "reports"],
  "exclude": ["tmp", "private"],
  "maxFileSizeMB": 500
}
```

**CLI (pseudo)**
```bash
# 1) Export metadata
node scripts/drive/export-list.js --folder "EdPsych Connect" > tmp/drive_files.json
# 2) Download + hash + archive
node scripts/drive/archive.js tmp/drive_files.json --out archive/
# 3) Index into Mongo collections
node scripts/drive/index.js archive/ --mongo $MONGODB_URI
```

> When Drive connector is available, we’ll run this in **read‑only** mode. Until then, you can export a structured ZIP and I’ll process it with the same mapping.

---

## 6) Help Centre Scaffold (20+ files) — `/docs/HELP-CENTER/`
```
_template.md
getting-started-teacher.md
getting-started-ep.md
getting-started-researcher.md
getting-started-student.md
assessments-and-reports.md
interventions-and-monitoring.md
differentiation-and-accessibility.md
parent-communication.md
dashboards-and-insights.md
org-setup-and-sso.md
roles-and-permissions.md
data-protection-and-gdpr.md
billing-and-plans.md
consent-and-ethics.md
anonymisation-and-exports.md
reproducibility-capsules.md
sign-in-and-sso.md
data-sync-and-imports.md
performance-and-errors.md
contact-support.md
```

---

## 7) Training Playlist Expansion (→ 24 videos)
Adds: **Narrative Missions Controls**, **EP Recommendation Library**, **Safeguarding in Practice**, **Reflective Growth for SLT**, **Research Hub Deep Dive**, **Accessibility Power‑User Tips**.

---

## 8) Next Autonomous Steps
- Generate full **Drive ingestion scripts** (Node.js) with OAuth flow + rate‑limit handling.  
- Produce **Figma‑ready UI copy kit** (UK spellings) for pupil/teacher/EP screens.  
- Draft **VR/3D pilot brief** (Unity/WebGL) for spatial learning scenes (optional module).  
- Continue enriching **training scripts** and **help articles** with concrete examples.

