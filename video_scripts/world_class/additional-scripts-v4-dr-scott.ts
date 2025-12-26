/**
 * Additional/patch scripts to ensure full key coverage.
 *
 * IMPORTANT (truth-by-code): These scripts are the canonical text source for
 * the corresponding `videoKey`s in the registry.
 *
 * If a rendered video's audio differs from the script here, treat this as a
 * mismatch and update either:
 * - the rendered asset (regenerate), or
 * - the script + provenance (with explicit approval).
 */

export const ADDITIONAL_V4_SCRIPTS = {
  // ---------------------------------------------------------------------------
  // SCHOOL / SENCO
  // ---------------------------------------------------------------------------
  'school-senco-portal': {
    id: 'school-senco-portal-v4',
    title: 'The SENCO Portal: Coordinating Support',
    duration: '75 seconds',
    audience: 'SENCOs, Inclusion Leads, Support Staff',
    script: `I'm Dr. Scott, and this is a quick tour of the SENCO Portal.

The SENCO role is about coordination: turning information into action. The portal is designed to make that coordination easier.

First, it gives you a single view of need. You can see the student profile, the current plan, and the evidence that sits behind it — all in one place.

Second, it supports consistent decision-making. Whether you're planning classroom adjustments, selecting interventions, or preparing documentation for an Education, Health, and Care Plan process, the workflow stays structured.

Third, it makes collaboration visible. You can track who has contributed, what has been agreed, and what still needs doing — so nothing falls through the cracks.

The goal is simple: reduce admin, increase clarity, and keep the focus where it belongs — on the child.`
  },

  // ---------------------------------------------------------------------------
  // SECURITY
  // ---------------------------------------------------------------------------
  'security-deep-dive': {
    id: 'security-deep-dive-v4',
    title: 'Security Deep Dive: Designed for Sensitive SEND Data',
    duration: '90 seconds',
    audience: 'Local Authorities, Senior Leaders, Compliance Officers',
    script: `When you're working with Special Educational Needs and Disabilities data, security isn't a feature — it's the foundation.

I'm Dr. Scott. Here's what we mean by "security by design".

First, access control. The platform is built around role-based permissions. Users only see what they need for their role, and we follow the principle of least privilege.

Second, auditability. Key actions are logged so that you can evidence appropriate access and decision-making, and investigate issues quickly.

Third, secure transport. Data is transmitted over encrypted connections, and we avoid exposing sensitive information in URLs or client-side state.

Finally, operational discipline. We treat secrets as configuration, not code. That means environment variables for keys, and guardrails in our CI to prevent accidental leakage.

Security is not a one-off checklist. It's a continuous process — and we build the platform to support that reality.`
  },

  // ---------------------------------------------------------------------------
  // CODING CURRICULUM (non-placeholder intros)
  // ---------------------------------------------------------------------------
  'python-basics': {
    id: 'python-basics-v4',
    title: 'Python Basics: The Building Blocks',
    duration: '90 seconds',
    audience: 'Students, Teachers, Parents',
    script: `Python is a brilliant first language because it reads like English.

I'm Dr. Scott. Let's cover the foundations.

In Python, your program runs from top to bottom. You can store information in variables — like a labelled box.

For example, you might store a student's name, a score, or the number of attempts. Then you can use that information to make decisions.

You can print messages to see what's happening, which is how we learn to debug.

And you can use simple data types: text, numbers, and true-or-false values.

The key point is this: coding is about logic, not typing speed. We teach the logic first, with accessibility built in, so every learner can succeed.`
  },

  'react-intro': {
    id: 'react-intro-v4',
    title: 'React Intro: Building Interfaces as Components',
    duration: '90 seconds',
    audience: 'Students, Teachers, Parents',
    script: `React is a way to build modern user interfaces by breaking them into reusable pieces called components.

I'm Dr. Scott. Think of components like Lego blocks.

A button is a component. A navigation bar is a component. A lesson card is a component.

Each component can have data — we call that props — and it can change over time — we call that state.

When the state changes, React automatically updates what you see on screen.

This approach is powerful because it keeps big projects manageable. You build small, testable pieces, then assemble them into a complete application.

In our coding curriculum, we introduce React once learners are confident with logic, so the interface layer becomes exciting — not overwhelming.`
  },

  // ---------------------------------------------------------------------------
  // EHCP MODULES (content-focused, not feature claims)
  // ---------------------------------------------------------------------------
  'ehcp-modules-hub-overview': {
    id: 'ehcp-modules-hub-overview-v4',
    title: 'EHCP Modules Hub: What You’ll Learn',
    duration: '75 seconds',
    audience: 'SENCOs, Local Authorities, Educational Psychologists, Parents',
    script: `I'm Dr. Scott. This short overview explains what the EHCP modules cover.

These modules are designed as practical, step-by-step guidance for navigating the Education, Health and Care Plan process.

We focus on the realities people face in practice: keeping documentation coherent, managing statutory timescales, and coordinating contributions from education, health, and social care.

You'll see guidance on key pressure points — like annual reviews, phase transfers, and mediation or tribunal routes — alongside a clear emphasis on evidence, outcomes, and the child's lived experience.

One important note: the captions provided with these videos are script-derived transcripts. They are not time-aligned, and they are not a guarantee that the rendered audio matches word-for-word unless explicitly marked as verified in provenance.

Use the modules as a structured reference, and pair them with your local policies and statutory guidance.`
  },

  'annual-reviews-mastery': {
    id: 'annual-reviews-mastery-v4',
    title: 'Annual Reviews: Mastery Through Structure',
    duration: '90 seconds',
    audience: 'SENCOs, Local Authorities, Educational Psychologists',
    script: `Annual reviews are where plans stay alive — or quietly drift.

I'm Dr. Scott. Here’s a simple structure that makes annual reviews more reliable.

Start with outcomes. What was the intended change for the child, and what evidence shows progress or lack of progress?

Next, interrogate provision. Which elements were delivered as specified, what adaptations were made, and what impact did that have?

Then update needs and context. Children develop, families’ circumstances change, and school environments change. The plan must reflect reality.

Finally, make decisions explicit: what stays, what changes, who is responsible, and by when.

Mastery isn’t about paperwork. It’s about turning an annual review into a clear, accountable decision that improves a child’s day-to-day experience.`
  },

  'phase-transfers-mastery': {
    id: 'phase-transfers-mastery-v4',
    title: 'Phase Transfers: Reducing Risk at Transitions',
    duration: '90 seconds',
    audience: 'SENCOs, Local Authorities, Educational Psychologists, Parents',
    script: `Phase transfers are high-risk moments for children with SEND.

I'm Dr. Scott. The goal is to reduce uncertainty and prevent support gaps.

Begin early. Identify the new setting’s demands and map them to the child’s needs and current provision.

Make the essentials explicit: what support must be in place on day one, what training adults need, and what adjustments are non-negotiable.

Use evidence, not assumptions. What has worked in the current setting? What triggers difficulty? What helps the child regulate, engage, and learn?

And communicate in a way that travels: a concise summary of need, provision, and effective strategies is often more useful than a long document.

Good transitions are planned, not hoped for.`
  },

  'mediation-tribunal-navigation': {
    id: 'mediation-tribunal-navigation-v4',
    title: 'Mediation & Tribunal: Navigating Disagreement Constructively',
    duration: '90 seconds',
    audience: 'Parents, Local Authorities, SENCOs, Educational Psychologists',
    script: `Disagreement in the EHCP process is common — and it’s emotionally costly.

I'm Dr. Scott. This overview is about staying structured when things escalate.

First, clarify what is being disputed: needs, provision, placement, or wording.

Second, separate evidence from interpretation. Often both sides have evidence, but they’re drawing different conclusions about what it means.

Third, define what would resolve the dispute. Is it a change to provision? A different placement? Additional assessment? Or clearer specification?

Mediation can help when the issue is communication and alignment. Tribunal is a formal route when agreement isn’t possible.

Whichever route applies, the safest approach is clarity: evidence, rationale, and a focus on outcomes for the child.`
  },

  'resource-costing-funding': {
    id: 'resource-costing-funding-v4',
    title: 'Resource Costing & Funding: Making Provision Explicit',
    duration: '90 seconds',
    audience: 'Local Authorities, SENCOs, Finance Leads, Educational Psychologists',
    script: `When provision is vague, funding conversations become conflict.

I'm Dr. Scott. The answer is to make provision explicit enough to be understood and costed.

Start with the components: frequency, duration, group size, and the skills required of the adult delivering it.

Be clear about what is universal classroom support, what is targeted school-based intervention, and what is specialist provision.

Then connect cost to function: what need is this provision addressing, and what outcome is it expected to improve?

Costing isn't about reducing support. It's about specifying support clearly enough that everyone can plan, deliver, and evaluate it.

Clarity protects the child, the family, and the professionals involved.`
  },

  'golden-thread-coherence': {
    id: 'golden-thread-coherence-v4',
    title: 'The Golden Thread: Coherence From Needs to Outcomes',
    duration: '90 seconds',
    audience: 'Educational Psychologists, SENCOs, Local Authorities',
    script: `In good EHCP work, there’s a golden thread.

I'm Dr. Scott. The thread is coherence: needs lead to provision, and provision leads to outcomes.

If needs are described vaguely, provision becomes generic. If provision is generic, outcomes become wishful.

A strong plan does three things.

One: it states needs in observable terms.
Two: it specifies provision with enough detail that it can be delivered consistently.
Three: it defines outcomes as measurable change in the child's experience — not just activity.

When the golden thread is intact, reviews are easier, disagreements reduce, and support is more likely to be delivered as intended.

Coherence is the difference between a document and a plan.`
  },

  'sen2-returns-automation': {
    id: 'sen2-returns-automation-v4',
    title: 'SEN2 Returns: Automation Without Losing Accuracy',
    duration: '90 seconds',
    audience: 'Local Authorities, Data Teams, SEND Leaders',
    script: `SEN2 returns are high-stakes reporting — and they’re often time-consuming.

I'm Dr. Scott. The goal of automation here is simple: reduce manual errors while preserving data quality.

Start by standardising definitions. If teams interpret categories differently, automation just scales inconsistency.

Next, validate inputs early. Clean data at the point of entry is far cheaper than reconciliation at deadline.

Then build a clear audit trail: when something changes, who changed it, and why.

Automation should support professional judgement, not replace it.

The best systems make the right thing easy: consistent coding, clear checks, and reporting you can defend.`
  },

  'compliance-risk-ai': {
    id: 'compliance-risk-ai-v4',
    title: 'Compliance Risk & AI: Practical Guardrails',
    duration: '90 seconds',
    audience: 'Local Authorities, School Leaders, Compliance Officers',
    script: `AI can be useful — and it can create compliance risk if it’s deployed carelessly.

I'm Dr. Scott. Here are practical guardrails.

First: data minimisation. Only send what is necessary, and avoid sharing personal data where it isn’t required.

Second: transparency. Be clear when AI is used to assist drafting or summarisation, and keep a human accountable for decisions.

Third: auditability. You need a record of what was generated, what was accepted, and what was changed.

Fourth: vendor and configuration discipline. Secrets belong in environment variables, not code. Access should be role-based.

And finally: never let AI output become evidence. Treat it as a draft that must be checked against real records.

Good governance isn't anti-AI. It's pro-safety.`
  },
};

export default ADDITIONAL_V4_SCRIPTS;
