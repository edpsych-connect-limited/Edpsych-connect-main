# Landing Page Video Scripts
## Production Brief — Dr Scott Ighavongbe-Patrick

**Avatar:** Dr Scott (HEYGEN_DR_SCOTT_AVATAR_ID)
**Style:** Direct to camera. Calm, authoritative, warm. Clinical expert tone — not a salesperson.
**Each video:** 90–120 seconds. Structured: Problem → What we do → What you can do.
**Register:** EP speaking to EPs and school leaders. Not teachers speaking to children.

---

## Video 1: Platform Overview
**HeyGen key:** `landing-platform-overview`
**Placement:** Hero section — first video a visitor sees
**Thumbnail:** Professional headshot of Dr Scott, platform dashboard visible behind
**Duration target:** 90 seconds

---

### SCRIPT

Hello. I'm Dr Scott Ighavongbe-Patrick — Chartered Educational Psychologist, HCPC registered.

I built EdPsych Connect because I kept seeing the same thing in my practice.

Children waiting months for support. EPs drowning in paperwork instead of spending time with children. SENCOs managing EHCP processes across dozens of students on spreadsheets. Schools doing their best with fragmented tools that don't talk to each other.

So I built the platform I wished existed.

EdPsych Connect connects every part of the SEND workflow — from the moment a school makes a referral, through the EP assessment, the intervention planning, all the way to the statutory report and EHCP.

Every decision is traceable. Every intervention is linked to the assessment that informed it. Every report is built on evidence, not memory.

It's not about replacing the EP's clinical judgment. It's about removing everything that gets in the way of it.

If you're an EP, a SENCO, or a school leader — this platform was built for you.

Come and see what it does.

---

## Video 2: The EHCP Workflow
**HeyGen key:** `landing-ehcp-workflow`
**Placement:** After CoreCapabilities section, near EHCP feature card
**Thumbnail:** EHCP timeline diagram or Dr Scott at desk with documents
**Duration target:** 100 seconds

---

### SCRIPT

The EHCP process is one of the most important — and most stressful — things a SEND team manages.

Six weeks to decide whether to assess. Sixteen weeks to draft the plan. Twenty weeks to finalise. Multiple professionals contributing from different organisations. Parents expecting answers. And everything needs to be evidenced, compliant, and traceable.

Most teams manage this with spreadsheets, email chains, and a lot of anxiety about deadlines.

EdPsych Connect changes that.

When a school submits a referral, the statutory timeline starts automatically. Deadline dates are calculated. Caseworkers are assigned. Professional contributions — from EPs, health, social care — are coordinated through the platform.

The EP's assessment feeds directly into the EHCP sections. The golden thread — the connection between a child's needs, outcomes, provision, and placement — is tracked and validated throughout.

When it's time to export, the system generates a compliant, structured document ready for the LA.

No more chasing emails. No more missed deadlines. No more starting the draft from scratch.

The process is the same. The admin is not.

---

## Video 3: Interventions — The Clinical Core
**HeyGen key:** `landing-intervention-engine`
**Placement:** After UnifiedEcosystem section, reinforcing the workflow narrative
**Thumbnail:** Dr Scott with intervention plan visible, or a child in a classroom setting
**Duration target:** 100 seconds

---

### SCRIPT

As an Educational Psychologist, the most important thing I do is help schools understand a child well enough to support them properly.

The assessment tells us what's happening. The intervention is what we do about it.

In practice, interventions often get disconnected from the assessment that informed them. A plan gets written. It sits in a folder. No one tracks whether it's working. The next EP visit starts from scratch.

EdPsych Connect fixes that.

When the EP completes an assessment, they create an intervention plan directly linked to it. The goals are structured. The delivery frequency is set. A review date is scheduled. The person responsible is named.

SENCOs and teachers can see what's planned and add progress reviews. The EP can see whether things are on track between visits.

When it's time to write the report, the intervention history is already there — what was tried, what the reviews said, what the outcome was.

This isn't just better admin. It's better evidence. It's a clearer picture of the child. And it's what good practice looks like when the system supports it.

---

## Production Notes

### HeyGen Setup
- Avatar: Dr Scott (use `HEYGEN_DR_SCOTT_AVATAR_ID` from environment)
- Voice: Use `HEYGEN_DR_SCOTT_VOICE_ID` for consistency
- Background: Professional setting — light, clean, credible. Not clinical.
- Subtitles: Yes, auto-generated + reviewed

### After Recording
1. Upload completed videos to HeyGen
2. Add new IDs to `HEYGEN_VIDEO_IDS` in `src/lib/training/heygen-video-urls.ts`:
   - `landing-platform-overview`: [new HeyGen ID]
   - `landing-ehcp-workflow`: [new HeyGen ID]
   - `landing-intervention-engine`: [new HeyGen ID]
3. The `VideoPremiereSection` component is already wired to pick these up automatically.

### Tone guidance
- Speak as the expert you are. Not a marketer.
- The problems you name are real — let that come through.
- "I built this" carries more weight than "we built this". You did.
- Calm confidence. Not urgency. Schools trust calm.
