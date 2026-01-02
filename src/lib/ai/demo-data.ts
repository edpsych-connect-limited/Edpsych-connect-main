/**
 * Demo Data for AI Assistant
 * 
 * Rich, realistic responses for the "Invisible Brain" demo when API keys are not present.
 */

export const DEMO_RESPONSES: Record<string, {
  content: string;
  agentId: string;
  suggestedActions?: Array<{ label: string; action: string; params?: any }>;
}> = {
  'default': {
    agentId: 'coordinator',
    content: `I understand you're looking for support. As Dr. Scott AI, I can coordinate our 13 specialist agents to help you.

**I can assist with:**
• **Lesson Planning:** "Plan a Year 5 science lesson on forces"
• **Reports:** "Draft an EHCP advice section for a child with ASD"
• **Behaviour:** "Analyse a pattern of disruptive behaviour in the afternoon"
• **Interventions:** "Suggest reading interventions for a 7-year-old"

Please try one of these specific requests to see me in action!`,
    suggestedActions: [
      { label: 'Plan Lesson', action: 'prompt', params: { text: 'Plan a Year 5 science lesson' } },
      { label: 'Draft Report', action: 'prompt', params: { text: 'Draft an EHCP advice section' } }
    ]
  },
  'lesson': {
    agentId: 'curriculum-designer',
    content: `**Lesson Plan: Introduction to Fractions**

**Year Group:** Year 4
**Subject:** Mathematics
**Duration:** 60 minutes

**Learning Objectives:**
• Understand that a fraction is a part of a whole.
• Recognise and write fractions for shaded parts of shapes.

**Differentiation:**
• **Support:** Use concrete manipulatives (fraction walls, pizza slices).
• **Core:** Visual representations and matching activities.
• **Extension:** Word problems involving fractions of quantities.

**Lesson Flow:**
1.  **Starter (10 mins):** "The Pizza Problem" - Discuss sharing a pizza equally.
2.  **Main Input (15 mins):** Demonstrate numerator and denominator using visual aids.
3.  **Activity (25 mins):**
    *   *Group A:* Folding paper shapes to show halves and quarters.
    *   *Group B:* Shading shapes to match given fractions.
    *   *Group C:* Solving "fraction of a number" puzzles.
4.  **Plenary (10 mins):** "Fraction Bingo" - Match the symbol to the picture.

**Assessment:**
• Observation of use of vocabulary (numerator, denominator).
• Accuracy in the shading activity.

**Resources:**
• Paper circles/squares
• Coloured pencils
• Fraction Bingo cards`,
    suggestedActions: [
      { label: 'Adapt for Dyslexia', action: 'prompt', params: { text: 'Adapt this lesson for a student with dyslexia' } },
      { label: 'Create Worksheet', action: 'prompt', params: { text: 'Generate a worksheet for this lesson' } }
    ]
  },
  'report': {
    agentId: 'report-writer',
    content: `**Draft EHCP Advice: Communication and Interaction**

**Student:** [Name]
**Age:** [Age]

**Strengths:**
• [Name] is able to communicate needs using single words and Makaton signs.
• Enjoys social interaction with familiar adults.
• Good eye contact when engaged in preferred activities.

**Needs:**
• Significant delay in expressive language skills.
• Difficulty understanding complex instructions (3+ key information carrying words).
• Becomes frustrated when unable to make needs known, leading to withdrawal.

**Provision:**
• **Speech and Language Therapy:** Weekly sessions focusing on vocabulary development.
• **Visual Supports:** Use of a visual timetable and "Now/Next" board throughout the day.
• **Adult Support:** 1:1 support for small group activities to facilitate turn-taking.
• **Staff Training:** All staff working with [Name] to be trained in Makaton.

**Outcomes:**
• By the end of Key Stage 2, [Name] will be able to use 3-word phrases to request items.
• By the end of the year, [Name] will follow 2-step instructions with visual support 80% of the time.`,
    suggestedActions: [
      { label: 'Expand Section', action: 'prompt', params: { text: 'Expand on the provision section' } },
      { label: 'Check Compliance', action: 'prompt', params: { text: 'Check this against the Code of Practice' } }
    ]
  },
  'behaviour': {
    agentId: 'behaviour-analyst',
    content: `**Behaviour Analysis Report**

**Incident Pattern:**
• **Frequency:** 3-4 times per week.
• **Timing:** Mostly occurs after lunch break (13:00 - 13:30).
• **Triggers:** Transition from unstructured play to structured learning; sensory overload (noise in corridor).

**Function of Behaviour:**
• **Escape/Avoidance:** The behaviour (hiding under the desk, refusing to enter class) appears to serve the function of avoiding the sensory demand of the classroom entry and the transition to work.

**Strategies:**

**1. Proactive (Preventative):**
• **Meet and Greet:** Key adult to meet student at the playground gate 5 minutes early.
• **Sensory Break:** 5 minutes of "heavy work" (carrying books, wall push-ups) before entering class.
• **Visual Countdown:** Use a sand timer to show remaining break time.

**2. Reactive (In the moment):**
• **Low Arousal Approach:** Reduce language, use gesture/visuals.
• **Safe Space:** Allow access to a designated quiet corner without demand for 10 minutes.

**3. Skill Building:**
• **Emotional Regulation:** Teach "Zones of Regulation" to help student identify "Yellow Zone" feelings before they escalate.`,
    suggestedActions: [
      { label: 'Create Plan', action: 'prompt', params: { text: 'Create a formal Behaviour Support Plan' } },
      { label: 'Track Progress', action: 'navigate', params: { path: '/behaviour/tracker' } }
    ]
  },
  'intervention': {
    agentId: 'intervention-planner',
    content: `**Intervention Recommendation: Working Memory**

**Target Area:** Auditory Working Memory
**Student Profile:** Difficulty following multi-step instructions; forgets sentence to write.

**Recommended Intervention: "Memory Magic" (10 weeks)**

**Frequency:** 3 x 15 minutes per week.
**Group Size:** Small group (3-4 students).

**Session Structure:**
1.  **Warm-up (3 mins):** "I went to the market..." game (cumulative list).
2.  **Main Activity (10 mins):**
    *   *Weeks 1-4:* Repeating number sequences (forward/backward).
    *   *Weeks 5-8:* Drawing from verbal instructions ("Draw a red house with a blue door").
    *   *Weeks 9-10:* "Sentence Scramble" - holding a sentence in head and writing it down.
3.  **Review (2 mins):** Metacognition - "What strategies did we use today?" (e.g., visualization, chunking).

**Success Criteria:**
• Student can recall 4 items in a sequence.
• Student can follow a 3-step instruction without repetition.`,
    suggestedActions: [
      { label: 'Schedule This', action: 'navigate', params: { path: '/interventions/schedule' } },
      { label: 'Download Resources', action: 'prompt', params: { text: 'Download resources for Memory Magic' } }
    ]
  },
  'send': {
    agentId: 'send-specialist',
    content: `**SEND Support Advice**

**Topic:** Sensory Processing
**Context:** Classroom Environment

**Recommendations:**
1.  **Visual Clutter:** Reduce wall displays near the whiteboard to minimise visual distraction.
2.  **Lighting:** Use natural light where possible; avoid flickering fluorescent tubes.
3.  **Seating:** Position student away from high-traffic areas (doors, sinks) but with a clear view of the teacher.
4.  **Equipment:** Provide a wobble cushion and ear defenders for independent work times.

**Reasoning:**
Reducing sensory load allows the student to allocate more cognitive resources to learning tasks.`,
    suggestedActions: [
      { label: 'Audit Classroom', action: 'navigate', params: { path: '/senco/audit' } },
      { label: 'Sensory Checklist', action: 'prompt', params: { text: 'Generate a sensory audit checklist' } }
    ]
  },
  'safeguarding': {
    agentId: 'safeguarding-advisor',
    content: `**Safeguarding Guidance: KCSIE 2024**

**Topic:** Online Safety
**Concern:** Cyberbullying

**Immediate Actions:**
1.  **Secure Evidence:** Take screenshots of any messages/posts (do not delete them).
2.  **Support Student:** Reassure the student they have done the right thing by reporting.
3.  **Report:** Log the incident on CPOMS/MyConcern immediately.
4.  **Parents:** Contact parents of all involved students (victim and perpetrator) in line with school policy.

**Resources:**
• National Online Safety Guides
• CEOP Reporting Tool

*Note: If you believe a child is in immediate danger, contact the police (999) and your local MASH team.*`,
    suggestedActions: [
      { label: 'Log Incident', action: 'navigate', params: { path: '/safeguarding/log' } },
      { label: 'Policy Check', action: 'prompt', params: { text: 'Summarise our online safety policy' } }
    ]
  },
  'wellbeing': {
    agentId: 'wellbeing-monitor',
    content: `**Wellbeing Check-in**

**Focus:** Staff Resilience

**Observation:**
It's the end of a half-term. Energy levels may be lower than usual.

**Suggested Strategies:**
1.  **"No Email" Window:** Encourage staff to disconnect from email between 7pm and 7am.
2.  **Peer Support:** Set up a "Secret Angel" system for the final week (small acts of kindness).
3.  **Reflection:** Start the next staff meeting with "What went well?" rather than notices.

**Resource:**
• 5-minute desk yoga sequence
• Mindfulness breathing script for form time`,
    suggestedActions: [
      { label: 'Staff Survey', action: 'navigate', params: { path: '/wellbeing/survey' } },
      { label: 'Mindfulness Script', action: 'prompt', params: { text: 'Write a 2-minute mindfulness script' } }
    ]
  },
  'gamification': {
    agentId: 'gamification-lead',
    content: `**Gamification Strategy: Battle Royale**

**Subject:** Science (Biology)
**Topic:** Cell Structure

**Game Mode:** Battle Royale
**Duration:** 20 minutes

**Mechanics:**
• **Zone Shrink:** Every 3 minutes, the "safe zone" shrinks. Students must answer a question correctly to stay in the safe zone.
• **Loot Drops:** Bonus points for streak of 3 correct answers.
• **Revive:** Students can "revive" a teammate by answering a difficult challenge question.

**Engagement Metrics:**
• **Participation:** 100% of class active.
• **Accuracy:** 85% average on core concepts.
• **Collaboration:** High levels of peer-to-peer support observed during "Revive" phases.`,
    suggestedActions: [
      { label: 'Launch Battle', action: 'navigate', params: { path: '/teacher/gamification' } },
      { label: 'View Leaderboard', action: 'navigate', params: { path: '/teacher/gamification' } }
    ]
  }
};

export function getDemoResponse(query: string) {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('lesson') || lowerQuery.includes('plan') || lowerQuery.includes('teach')) {
    return DEMO_RESPONSES['lesson'];
  }
  if (lowerQuery.includes('report') || lowerQuery.includes('ehcp') || lowerQuery.includes('advice')) {
    return DEMO_RESPONSES['report'];
  }
  if (lowerQuery.includes('behav') || lowerQuery.includes('incident')) {
    return DEMO_RESPONSES['behaviour'];
  }
  if (lowerQuery.includes('intervention') || lowerQuery.includes('support') || lowerQuery.includes('memory') || lowerQuery.includes('reading')) {
    return DEMO_RESPONSES['intervention'];
  }
  if (lowerQuery.includes('send') || lowerQuery.includes('sensory') || lowerQuery.includes('autism') || lowerQuery.includes('adhd')) {
    return DEMO_RESPONSES['send'];
  }
  if (lowerQuery.includes('safe') || lowerQuery.includes('protect') || lowerQuery.includes('bullying')) {
    return DEMO_RESPONSES['safeguarding'];
  }
  if (lowerQuery.includes('wellbeing') || lowerQuery.includes('health') || lowerQuery.includes('stress')) {
    return DEMO_RESPONSES['wellbeing'];
  }
  if (lowerQuery.includes('game') || lowerQuery.includes('battle') || lowerQuery.includes('play') || lowerQuery.includes('quiz')) {
    return DEMO_RESPONSES['gamification'];
  }
  
  return DEMO_RESPONSES['default'];
}
