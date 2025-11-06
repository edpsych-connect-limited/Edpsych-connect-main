# EdPsych Connect — Implementation Pack v5
**Author:** AI Dr Patrick (Autonomous)
**Scope:** Figma-ready UX spec, example API handlers (Node/Express + FastAPI), seed narrative missions (KS1–KS3), safeguarding-aware parent messaging templates, and environment scaffolding.

---

## 1) UX Spec Pack (Figma-Ready)
**Folder:** `docs/UX/spec/`

### 1.1 Components & Names
- **Buttons**: `Btn/Primary`, `Btn/Secondary`, `Btn/Danger`, `Btn/IconOnly`
- **Inputs**: `Field/Text`, `Field/Email`, `Field/Select`, `Field/Tag`, `Field/Search`
- **Navigation**: `Nav/Side`, `Nav/Top`, `Breadcrumbs`
- **Cards**: `Card/Mission`, `Card/Class`, `Card/Alert`, `Card/Intervention`
- **Status**: `Badge/Info`, `Badge/Watch`, `Badge/Alert`, `Badge/Success`
- **Tables**: `Table/Standard`, `Table/Compact`, `Table/Heatmap`
- **Overlays**: `Modal/Standard`, `Drawer/Right`, `Tour/Coachmark`
- **A11y Helpers**: `SkipLink`, `FocusRing`, `LiveRegion/Polite`

### 1.2 States (per component)
- Focus, Hover, Active, Disabled, Loading, High-Contrast, Reduced-Motion.
- Keyboard order defined in spec, tab traps forbidden, ESC closes modals.

### 1.3 Tokens (Tailwind-aligned)
- Colour: WCAG 2.2 AA minimum (e.g., `--brand-600` on `--bg-0` ≥ 4.5:1).
- Typography: `text-base` default, large x‑height; dyslexia-friendly toggle.
- Spacing: 4/8/12/16/24/32 scale; hit area ≥ 44×44.

### 1.4 Key Screens
- **Pupil Home**: avatar/streak/house points; “Today’s mission”; accessibility bar.
- **Teacher Console**: cohort heatmap; alerts; quick actions; planning panel.
- **EP Insight Hub**: case timeline; assessment pack; recommendation composer.
- **Safeguarding Panel**: signal list; rationale; next steps; log action.

### 1.5 A11y Checklist (per screen)
- Keyboard path documented; screen reader labels for all controls.
- Captioning defaults on for videos; transcripts linked.
- Motion alternatives for all animated sequences.

---

## 2) Example API Handlers
**Folder:** `api/examples/`

### 2.1 Node/Express — `/teacher/plan`
```js
import express from 'express';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';

const router = express.Router();

const PlanReq = z.object({
  class_id: z.string().uuid(),
  topic: z.string().min(3),
  duration_mins: z.number().int().min(10).max(180),
  goals: z.array(z.string()).optional(),
  constraints: z.record(z.any()).optional()
});

router.post('/teacher/plan', async (req, res) => {
  const parse = PlanReq.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const { class_id, topic, duration_mins, goals = [], constraints = {} } = parse.data;
  // TODO: fetch class + pupils from Postgres, levels, preferences
  const plan = {
    plan_id: uuid(),
    sections: [
      { title: 'Starter (5min)', detail: `Activate prior knowledge on ${topic}` },
      { title: 'Modelling', detail: 'Teacher example + think‑aloud' },
      { title: 'Guided Practice', detail: 'Scaffolded tasks (mixed ability)' },
      { title: 'Independent', detail: 'Choice of tasks; support route available' },
      { title: 'Exit Ticket', detail: '2 questions + self‑reflection' }
    ],
    differentiation: [ /* per pupil scaffold generated here */ ],
    printable_pdf_url: null,
    parent_brief_markdown: `# Today’s learning: ${topic}\nWe practised…`,
  };
  res.json(plan);
});

export default router;
```

### 2.2 FastAPI — `/learn/mission`
```py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from uuid import uuid4

router = APIRouter()

class MissionReq(BaseModel):
    pupil_id: str
    topic: str
    pretest_score: float | None = Field(default=None, ge=0, le=1)
    prefs: dict | None = None

@router.post('/learn/mission')
async def create_mission(req: MissionReq):
    if len(req.topic) < 3:
        raise HTTPException(status_code=400, detail='Invalid topic')
    mission = {
        'mission_id': str(uuid4()),
        'scenes': [
            { 'type': 'intro', 'copy': f"Today we’ll explore {req.topic} with a quick warm‑up." },
            { 'type': 'task', 'copy': 'Try this puzzle…', 'assistive': {'read_aloud': True} },
            { 'type': 'reflection', 'copy': 'What helped you most today?' }
        ],
        'target_objectives': ['reasoning', 'fluency'],
        'checks': [{ 'kind': 'exit', 'items': 2 }]
    }
    return mission
```

---

## 3) Seed Narrative Missions (KS1–KS3)
**Folder:** `content/seeds/missions.json`
```json
[
  {
    "id": "KS1-literacy-seaside",
    "key_stage": "KS1",
    "topic": "Literacy – Seaside Senses",
    "scenes": [
      { "type": "intro", "copy": "Let’s visit the seaside. What can you see, hear, and smell?" },
      { "type": "task", "copy": "Match words to pictures: waves, shells, gulls.", "supports": ["read_aloud", "picture_cues"] },
      { "type": "create", "copy": "Write a short sentence about your favourite seaside sound." }
    ],
    "objectives": ["vocabulary", "sentence formation"],
    "a11y": { "font": "dyslexia", "contrast": "high" }
  },
  {
    "id": "KS2-maths-fractions-bakery",
    "key_stage": "KS2",
    "topic": "Maths – Fractions at the Bakery",
    "scenes": [
      { "type": "story", "copy": "Help the baker share buns fairly." },
      { "type": "task", "copy": "Which is greater: 1/2 or 2/3? Use the number line.", "supports": ["manipulatives"] },
      { "type": "challenge", "copy": "Create two different ways to make 1 using fractions." }
    ],
    "objectives": ["compare fractions", "reasoning"],
    "a11y": { "read_aloud": true }
  },
  {
    "id": "KS3-science-forces-skatepark",
    "key_stage": "KS3",
    "topic": "Science – Forces at the Skatepark",
    "scenes": [
      { "type": "intro", "copy": "Design a safe ramp using friction and normal force." },
      { "type": "task", "copy": "Predict how surface changes affect speed.", "supports": ["graph_helper"] },
      { "type": "investigate", "copy": "Adjust variables and record your results." }
    ],
    "objectives": ["hypothesis", "data handling"],
    "a11y": { "reduced_motion": true }
  }
]
```

---

## 4) Parent Messaging Templates (UK Tone & Safeguarding)
**Folder:** `docs/COMMUNICATION/parent-templates.md`
```markdown
# Parent/Carer Messaging Templates

## Progress Update (Primary)
Hello, this is a quick update about {{pupil_first_name}}’s learning this week. We’ve been working on {{topic}}. {{pupil_first_name}} particularly enjoyed {{highlight}}. You can encourage learning at home by {{suggestion}}. Please let us know if you have any questions.

## Consent Reminder (Research)
We’re inviting families to take part in a school‑approved research project. All pupil data is anonymised and used to improve learning. Taking part is optional. If you’re happy to consent, please follow this link: {{consent_url}}. You can withdraw at any time.

## Support Offer
We’ve noticed some tasks have felt harder recently. We’ll try a different approach in class this week. If you’d like to talk it through, we’re happy to arrange a quick call.

## Meeting Confirmation
Thank you for arranging a meeting about {{pupil_first_name}}. We look forward to speaking with you on {{date}} at {{time}}. We’ll discuss what’s going well and where we can offer more support.
```

---

## 5) Environment Scaffolding
**Folder:** `configs/.env.example`
```
APP_ENV=production
JWT_SECRET=changeme
POSTGRES_URL=postgres://user:pass@host/db
MONGODB_URI=mongodb+srv://user:pass@cluster/db
REDIS_URL=redis://user:pass@host:6379
NEO4J_URI=neo4j+s://host
NEO4J_USER=neo4j
NEO4J_PASSWORD=changeme
STORAGE_BUCKET=s3://bucket
VERCEL_WEB_ORIGIN=https://app.example.com
```

---

## 6) Next Autonomous Steps
- Produce **Figma component redlines** (spacing, sizes, contrast values) and a11y annotations per screen.
- Extend **mission seeds** to KS4–KS5 and embed teacher notes + assessment rubrics.
- Provide **policy pack** (Ofsted‑ready evidence packs; DPIA template; AUP for pupils/parents).
- Draft **SLT dashboards** (copy + metrics).

