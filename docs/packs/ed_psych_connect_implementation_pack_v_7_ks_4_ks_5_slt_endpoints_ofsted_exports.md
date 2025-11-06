# EdPsych Connect — Implementation Pack v7
**Author:** AI Dr Patrick (Autonomous)  
**Region:** UK (GB English)  
**Purpose:** Extend the learning and leadership layers by adding KS4–KS5 mission seeds, teacher rubrics, SLT API samples, and printable Ofsted evidence exports. Builds directly upon v6 without overwriting.

---

## 1  Curriculum Extensions — KS4 & KS5 Mission Seeds
**Folder:** `content/seeds/missions-ks4-ks5.json`
```json
[
  {
    "id": "KS4-english-media-bias",
    "key_stage": "KS4",
    "topic": "English Language – Analysing Media Bias",
    "scenes": [
      { "type": "intro", "copy": "Compare how two headlines frame the same event." },
      { "type": "task", "copy": "Identify emotive language and omission." },
      { "type": "reflection", "copy": "How can writers influence audience beliefs?" }
    ],
    "objectives": ["critical reading", "evaluation", "evidence use"],
    "teacher_notes": "Link to Ofqual GCSE English Language AO2/AO4.",
    "assessment_rubric": "Marks clarity of analysis, use of terminology, balanced argument."
  },
  {
    "id": "KS4-science-genetics-ethics",
    "key_stage": "KS4",
    "topic": "Science – Genetics & Ethics",
    "scenes": [
      { "type": "story", "copy": "Investigate how gene editing affects society." },
      { "type": "task", "copy": "List ethical advantages and risks." },
      { "type": "challenge", "copy": "Create a balanced policy proposal." }
    ],
    "objectives": ["evaluation", "communication", "ethics"],
    "teacher_notes": "Maps to AQA GCSE Biology B7; encourage debate skills.",
    "assessment_rubric": "AO1 knowledge, AO2 application, AO3 evaluation."
  },
  {
    "id": "KS5-economics-behavioural",
    "key_stage": "KS5",
    "topic": "Economics – Behavioural Economics",
    "scenes": [
      { "type": "intro", "copy": "How do psychological biases affect decision‑making?" },
      { "type": "task", "copy": "Simulate market choices under different nudges." },
      { "type": "analysis", "copy": "Plot demand curves before and after nudge." }
    ],
    "objectives": ["analysis", "application", "evaluation"],
    "teacher_notes": "Links to Edexcel A‑Level Economics Theme 3; use with data‑handling tools.",
    "assessment_rubric": "Level 1–4 descriptors mirroring AQA mark bands."
  }
]
```

---

## 2  Teacher Notes & Rubrics Template
**Folder:** `content/templates/teacher‑rubric.md`
```markdown
# Teacher Rubric Template
| Criterion | Emerging | Developing | Secure | Mastery |
|------------|-----------|-------------|----------|-----------|
| Knowledge | Recall is fragmented. | Understands key facts. | Applies concepts consistently. | Explains connections across topics. |
| Reasoning | Rarely justifies answers. | Some explanation. | Logical reasoning. | Sophisticated evaluation. |
| Communication | Limited clarity. | Mostly clear. | Cohesive and structured. | Insightful and persuasive. |

**Export format:** CSV via `/teacher/rubric/export` → auto‑populate Ofsted evidence pack.
```

---

## 3  SLT Dashboard Endpoints — Samples
**Folder:** `api/examples/slt‑endpoints/`
```py
# FastAPI — SLT KPIs sample
from fastapi import APIRouter, Query
router = APIRouter()
@router.get('/slt/kpi')
async def get_kpi(school_id:str, term:str="Autumn 2025"):
  return {
    "school_id": school_id,
    "term": term,
    "quality_of_learning": 0.84,
    "equity_gap": {"SEN": 0.07, "EAL": 0.04},
    "engagement_index": 78.4,
    "incident_count": 3
  }
```
```sql
-- Postgres view: slt_equity_view
CREATE VIEW slt_equity_view AS
SELECT school_id,
    dimension,
    AVG(progress_delta) AS mean_delta,
    STDDEV(progress_delta) AS spread
FROM assessment_progress
WHERE term=current_term()
GROUP BY school_id, dimension;
```

---

## 4  Printable Ofsted Evidence Export
**Folder:** `exports/templates/ofsted‑evidence‑pack.docx`
- Header: school logo + report metadata.
- Sections: Curriculum Intent (links to Missions), Implementation (logs of plan→impact), Impact (assessment graphs), Behaviour & Attitudes (alert logs), Personal Development (pupil voice quotes), Leadership & Management (CPD records).
- Auto‑populates from API `/research/exports?evidence_pack=true`.

---

## 5  Analytics Integration — KS4–KS5 
- Connect Postgres assessment tables → Neo4j intervention graphs via ETL (`etl/interventions_ks45.sql`).
- Tag missions with subject code (e.g., ENG4, SCI4, ECO5) and map to SLT KPIs.
- Teacher rubrics feed aggregates for "Quality of Learning" metric.

---

## 6  Next Autonomous Steps
1. Implementation Pack v8 — QA automation (Playwright/Cypress), accessibility tests, performance budgets + SLO alerts.  
2. Implementation Pack v9 — Deployment hardening (IaC, WAF, backups) + training scripts V31–V36.  
3. Add cross‑references in Drive index for packs v6–v7 and attach SHA‑256 hashes when exported.

