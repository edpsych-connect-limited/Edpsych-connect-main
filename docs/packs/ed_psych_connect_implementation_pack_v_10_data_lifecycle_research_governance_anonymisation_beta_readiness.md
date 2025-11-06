# EdPsych Connect — Implementation Pack v10
**Author:** AI Dr Patrick (Autonomous)  
**Region:** UK (GB English)  
**Purpose:** Define end‑to‑end **data lifecycle**, **research governance**, and **anonymisation** for safe, ethical analytics; add **DUA templates**, **consent management**, **QA/Reliability ops dashboards**, and a **Beta Readiness Checklist**; provide parent‑facing explainers.

---

## 0) Contents
- Data Lifecycle Policy (collection → use → sharing → retention → deletion)
- Anonymisation & Pseudonymisation Pipeline (Postgres/Mongo/Neo4j)
- Consent & Preferences Model + APIs
- Data Use Agreement (DUA) templates & governance process
- Research Export Controller (hashes, audit trails)
- Ops Dashboards (QA & Reliability)
- Beta Readiness Checklist (tech, policy, training, evidence)
- Parent/Carer Explainer Assets (UK tone)

---

## 1) Data Lifecycle Policy
**Folder:** `docs/DATA/lifecycle.md`

### 1.1 Collection
- **Sources:** classroom interactions, missions, assessments, communications, EP notes (minimised).  
- **Principles:** data minimisation, purpose limitation, privacy by design, role‑based access (RBAC).  
- **Special category data:** only where strictly necessary; access limited to EP/SENCo with audit.

### 1.2 Use
- Teaching & learning support, safeguarding signals, SLT insights, anonymised research with consent/DUA.

### 1.3 Sharing
- **Internal:** teachers/EP/SLT per role.  
- **External:** research partners via signed DUA; only **anonymised** datasets; SFTP/object storage with time‑limited URLs.

### 1.4 Retention
- Per v6 retention schedule; nightly policy job (mark→review→purge, 30‑day grace for reversible).

### 1.5 Deletion
- Right to erasure flow: verify identity → mark for deletion → cascade deletes → log hash of record ids in audit (non‑identifying).

---

## 2) Anonymisation & Pseudonymisation
**Folder:** `docs/DATA/anonymisation-pipeline.md`

### 2.1 Goals
- Remove direct identifiers (name, email, UPN) and transform quasi‑identifiers (age/DOB, school, class) to meet **k‑anonymity ≥ 10** per extract.  
- Optionally add **ε‑differential privacy** noise to counts/means in exports.

### 2.2 Pipeline Stages
1. **Extract**: parameterised SQL/Cypher/aggregation; dedupe; snapshot id.  
2. **Pseudonymise**: stable salted hash for join keys (per project salt).  
3. **Generalise**: bucket ages/KS, coarsen location to LA level, round timestamps to day/week.  
4. **Suppress**: rare categories (<10 rows) collapsed to `OTHER`.  
5. **Noise (optional)**: Laplace noise on aggregates; report epsilon.  
6. **Validate**: k‑anon check; DP accounting; schema + hash manifest.  
7. **Package**: CSV/Parquet + `MANIFEST.json` (schema, hash, salts id, epsilon, licence, DUA id).  
8. **Audit & Sign**: write export metadata to Postgres (`research.exports`) and sign manifest (Ed25519 as in v5).

### 2.3 Example — Pseudonym Key (Node.js)
```js
import crypto from 'crypto';
export function pseudo(id, salt){
  return crypto.createHmac('sha256', salt).update(String(id)).digest('hex').slice(0,24);
}
```

### 2.4 SQL Extract (Postgres)
```sql
-- Minimal learning progress export (pseudonymised)
WITH base AS (
  SELECT p.id AS pupil_id, a.topic, a.score, a.taken_at::date AS d, s.school_la_code
  FROM assessments a
  JOIN pupils p ON p.id = a.pupil_id
  JOIN schools s ON s.id = p.school_id
  WHERE a.taken_at BETWEEN $1 AND $2
)
SELECT /* k-anon pre-buckets */
  date_trunc('week', d) AS week,
  CASE WHEN EXTRACT(YEAR FROM age(dob)) < 11 THEN 'KS2'
       WHEN EXTRACT(YEAR FROM age(dob)) < 14 THEN 'KS3' ELSE 'KS4+' END AS ks,
  topic,
  floor(score/10)*10 AS score_band,
  -- id replaced by HMAC in app layer
  COUNT(*) AS n,
  AVG(score) AS mean_score
FROM base b JOIN pupils p ON p.id = b.pupil_id
GROUP BY 1,2,3,4
HAVING COUNT(*) >= 10;
```

### 2.5 Cypher (Neo4j) Example
```cypher
// Intervention → Outcome anonymised counts
MATCH (i:Intervention)-[r:RESULTED_IN]->(o:Outcome)
WITH i.type AS intervention, date.truncate('week', r.date) AS week, avg(r.delta) AS mean_delta, count(*) AS n
WHERE n >= 10
RETURN intervention, week, round(mean_delta,2) AS mean_delta, n
```

### 2.6 Manifest Example — `MANIFEST.json`
```json
{
  "export_id": "exp_2025_11_06_001",
  "created_at": "2025-11-06T12:22:00Z",
  "dua_id": "DUA-2025-001",
  "salts_ref": "research_salt_v1",
  "k_anonymity": 10,
  "epsilon": 1.0,
  "files": ["progress.parquet"],
  "sha256": {"progress.parquet": "<hex>"},
  "signature": "<base64>"
}
```

---

## 3) Consent & Preferences Model
**Folder:** `docs/DATA/consent-model.md`

### 3.1 Schema (Postgres)
```sql
CREATE TABLE consent_subject (
  id UUID PRIMARY KEY,
  subject_type TEXT CHECK (subject_type IN ('pupil','parent','staff')),
  pupil_id UUID NULL REFERENCES pupils(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE consent_record (
  id UUID PRIMARY KEY,
  subject_id UUID REFERENCES consent_subject(id),
  kind TEXT CHECK (kind IN ('research','messaging','cookies')),
  status TEXT CHECK (status IN ('granted','denied','withdrawn')),
  method TEXT,       -- portal_form / email / paper
  captured_by UUID NULL REFERENCES users(id),
  captured_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NULL
);
```

### 3.2 API (Node/Express)
```js
app.post('/consent', requireAuth, zBody(ConsentReq), async (req,res)=>{/* upsert consent */});
app.get('/consent/:subject_id', requireAuth, async (req,res)=>{/* list */});
app.post('/consent/withdraw', requireAuth, async (req,res)=>{/* withdraw */});
```

### 3.3 Parent Portal Copy (UK)
- “You’re in control of how information is used. You can change your choice at any time.”

---

## 4) Data Use Agreements (DUA)
**Folder:** `docs/RESEARCH/DUA/`

### 4.1 `DUA-template.md`
- Parties, purpose, data description (anonymised only), security measures, IP & publication, retention & deletion, breach handling, review, termination.

### 4.2 `governance-process.md`
- Submission → DPO review → Governance board sign‑off → Export job → Audit check → Time‑boxed access → Deletion certificate.

### 4.3 Governance Board
- Roles: SLT lead, DPO, SENCo/EP representative, Teacher champion, Researcher liaison.

---

## 5) Research Export Controller
**Folder:** `api/examples/research-exports/`

### 5.1 Endpoint
```ts
// Node/Express
router.post('/research/exports', requireScope('research:export'), async (req,res)=>{
  // 1) validate DUA & consent scope
  // 2) run pipeline stages (extract→pseudo→bucket→suppress→validate)
  // 3) write MANIFEST.json + signatures
  // 4) upload package to signed URL
  // 5) insert audit row {export_id, dua_id, sha256, signer, k, epsilon}
  res.json({ status: 'queued', export_id });
});
```

### 5.2 Audit Table
```sql
CREATE TABLE research_exports (
  export_id TEXT PRIMARY KEY,
  dua_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  sha256 JSONB NOT NULL,
  k_anonymity INT NOT NULL,
  epsilon NUMERIC NULL,
  signer TEXT NOT NULL,
  storage_url TEXT NOT NULL
);
```

---

## 6) Ops Dashboards (QA & Reliability)
**Folder:** `docs/SLT/ops-dashboards.md`

- **QA**: pass rate per suite (unit/integration/E2E/a11y/perf), flake index, a11y debt trend.  
- **Reliability**: availability, API p95, error rate, WAF blocks, backup status, export throughput.  
- **Drill status**: last restore drill date; DR exercise score.

**Endpoints:** `/ops/qa`, `/ops/reliability`, `/ops/drills` (read‑only JSON for dashboards).

---

## 7) Beta Readiness Checklist
**Folder:** `docs/BETA/readiness-checklist.md`

### 7.1 Technical
- ✅ CI green (v8 gates)  
- ✅ Backups + restore drill completed in last 30 days  
- ✅ WAF active + headers validated  
- ✅ Privacy controls & consent UI live  
- ✅ Observability SLOs within target for 2 weeks

### 7.2 Policy & Governance
- ✅ DPIA signed, DPA countersigned  
- ✅ AUPs published  
- ✅ DUA process documented; governance board named  
- ✅ Retention schedule enforced

### 7.3 Training & Support
- ✅ V1–V36 scripts available; top‑task clips recorded  
- ✅ Parent/carer templates live  
- ✅ SLT/Teacher/EP quick‑start guides exported

### 7.4 Evidence
- ✅ Ofsted export prints correctly  
- ✅ Anonymised research export passes k‑anon checks

---

## 8) Parent/Carer Explainers (Assets)
**Folder:** `docs/COMMUNICATION/parent-explainers.md`

### 8.1 “How this helps my child” (short leaflet)
- Clear language; no AI jargon; privacy assurances; how to opt out of research.

### 8.2 “Your Data Choices” (one‑pager)
- What we collect, why, for how long; your rights; how to change your preferences.

### 8.3 “Safeguarding & Safety Online”
- Contact routes; reporting; respectful conduct; signposts to school policy.

---

## 9) Next Autonomous Steps
- Prepare **v11**: Parent & Pupil Experience polish — final IA, copy pass with UK tone, and micro‑interaction library; record top‑task video scripts V37–V42.  
- Wire **research export controller** into CI smoke (dry‑run) and add dashboard tiles.  
- Add Drive index entries for v10 and stamp SHA‑256 upon export.

