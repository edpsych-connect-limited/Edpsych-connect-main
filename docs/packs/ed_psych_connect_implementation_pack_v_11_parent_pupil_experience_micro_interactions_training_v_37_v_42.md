# EdPsych Connect — Implementation Pack v11
**Author:** AI Dr Patrick (Autonomous)  
**Region:** UK (GB English)  
**Purpose:** Finalise the **Parent & Pupil Experience** layer, unify tone & micro‑interactions for engagement, add micro‑interaction component library, copy pass (UK spellings), and generate training video scripts **V37–V42**.

---

## 0) Objectives
- Elevate learner and parent UX to world‑class standard.  
- Ensure every component feels intuitive, inclusive, and joyful.  
- Align copy and interactions with UK safeguarding and inclusive‑education language.  
- Prepare Beta polish and engagement toolkit.

---

## 1) Information Architecture (IA) — Parent & Pupil
**Folder:** `docs/UX/ia-parent-pupil.md`

### 1.1 Parent Portal IA
| Section | Description |
|----------|--------------|
| Dashboard | Overview of attendance, engagement, wellbeing notes, progress. |
| Communication | Secure messages from teachers/EPs; push notifications optional. |
| Reports | Downloadable Ofsted‑style progress reports. |
| Resources | Training videos, FAQs, printable guides. |
| Data & Privacy | Manage consents, opt‑ins, view retention policies. |

### 1.2 Pupil Portal IA
| Section | Description |
|----------|--------------|
| My Missions | gamified lessons, progress wheel, achievement badges. |
| My Journal | reflections, goals, voice notes (moderated). |
| Rewards | safe digital rewards, points, achievements. |
| Support | anonymous wellbeing check‑ins, EP/teacher link. |
| Accessibility | font, colour, and motion preferences (saved per user). |

---

## 2) Micro‑Interaction Library
**Folder:** `frontend/ui/micro-interactions/`

### 2.1 Design Principles
- **Emotionally intelligent**: celebrate success, encourage effort.  
- **Inclusive**: accessible, minimal cognitive load, gender‑neutral tone.  
- **Consistent motion**: easing curve `ease‑out‑quad`, duration ≤ 200 ms.  
- **Feedback clarity**: every interaction produces visible/audible response.

### 2.2 Example Components (React)
```tsx
// components/ui/MicroConfetti.tsx
import { useEffect } from 'react';
import confetti from 'canvas-confetti';
export default function MicroConfetti({ trigger }: { trigger: boolean }) {
  useEffect(()=>{ if(trigger) confetti({ particleCount: 60, spread: 45, origin:{ y:0.7 } }); }, [trigger]);
  return null;
}
```
```tsx
// components/ui/FocusPulse.tsx
export default function FocusPulse({ active }: { active: boolean }) {
  return <span className={`inline-block rounded-full transition-all duration-200 ${active?'ring-4 ring-indigo-300 scale-110':'ring-0 scale-100'}`}></span>;
}
```

### 2.3 Animations Catalogue
| Trigger | Effect | Description |
|----------|---------|-------------|
| Mission Complete | Confetti | subtle celebratory burst |
| Save Success | Pulse | highlight button with green accent |
| Loading | Progress shimmer | gradient motion consistent with accessibility guidelines |
| Notification | Gentle bounce | once only, no motion fatigue |

---

## 3) UX Copy Guidelines — UK English
**Folder:** `docs/UX/copy-style-guide.md`

- **Tone:** warm, competent, encouraging, not overly formal.  
- **Spelling:** UK (colour, behaviour, organisation).  
- **Reading age:** aim for 10–12 for pupil content, 12–14 for parent comms.  
- **Safeguarding language:** clear reporting routes, avoid euphemism.  
- **Inclusive phrasing:** avoid gendered pronouns, cultural bias, or idioms unfamiliar to EAL pupils.

### Examples
| Context | Avoid | Prefer |
|----------|--------|--------|
| Feedback | “Good job!” | “You’ve shown real persistence—well done.” |
| Error | “Something went wrong.” | “We couldn’t save that just now. Try again, or let your teacher know.” |

---

## 4) Engagement Enhancements
**Folder:** `docs/UX/engagement-toolkit.md`

### 4.1 Game Mechanics (lightweight)
- Achievement badges (per mission category).  
- Streak tracker for daily study (optional).  
- Pupil avatars (selectable, not custom‑upload).  
- Positive reinforcement: praise screens summarising progress weekly.

### 4.2 AI Companion (“Study Buddy”)
- Non‑chatbot; contextual prompts (“Need a hint?”, “Shall we review this bit?”).  
- Voice option (text‑to‑speech UK accent; reading speed adjustable).  
- Safety: no open input from pupils; pre‑vetted scripted interactions only.

---

## 5) Accessibility Deep Pass
**Folder:** `docs/UX/a11y-parent-pupil.md`

- Focus indicators visible at all times.  
- Colour contrast ≥ 4.5:1; dynamic contrast toggle.  
- Screen reader landmarks per WAI‑ARIA.  
- Caption/transcript mandatory for video/audio.  
- “Reduce motion” mode disables transitions and confetti effects.  
- Keyboard nav audit: every control reachable in ≤ 3 tabs.

---

## 6) Training Videos V37–V42
**Folder:** `docs/TRAINING/VIDEO_PLAYLIST.md` (append)
| ID | Title | Focus |
|----|--------|--------|
| V37 | Navigating the Pupil Dashboard | Missions, progress wheel, rewards. |
| V38 | Setting Accessibility Preferences | Fonts, colours, motion control. |
| V39 | Parents’ Overview | Dashboard, messages, privacy. |
| V40 | Managing Consents | Data & privacy section walkthrough. |
| V41 | Encouraging Independent Learning | Using missions & journals at home. |
| V42 | Feedback & Support | How to reach teachers, report issues, send praise. |

**Example Script (V39)**
```markdown
### V39 – Parents’ Overview
Welcome to your Parent Dashboard. Here, you’ll see your child’s progress and wellbeing insights at a glance.
Messages from teachers or educational psychologists appear here—just click to reply securely.
Your privacy settings live under “Data & Privacy”; you’re always in control of what’s shared.
```

---

## 7) QA Hooks & Metrics
- **Playwright a11y suite** expanded to cover new micro‑interactions.  
- **UX telemetry:** engagement rate, dwell time, accessibility toggles usage, parental logins frequency.  
- **Feedback loop:** termly sentiment survey integrated into parent portal.

---

## 8) Next Autonomous Steps
1. **v12** – Beta consolidation & release candidate: deployment checklist, monitoring, release notes, documentation site build.  
2. Begin **Figma/Design System sync**: update component tokens + link to confetti, focus pulse, motion catalogue.  
3. Generate **video scripts V43–V48** for staff CPD & EP tools advanced use.

