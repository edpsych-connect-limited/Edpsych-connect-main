/**
 * EdPsych Connect World - Role-Based Onboarding Video Suite
 * Zero Touch Self-Service - The Videos ARE Your Training Team
 * 
 * Each role gets a personalised onboarding journey that:
 * 1. Validates their decision to subscribe
 * 2. Shows them exactly where to start
 * 3. Builds confidence before they click anything
 * 4. Creates that "I've found my people" feeling
 */

// =============================================================================
// TEACHER ONBOARDING JOURNEY
// =============================================================================

export const TEACHER_ONBOARDING = {
  'onboard-teacher-welcome': {
    id: 'onboard-teacher-welcome',
    title: 'Welcome, Teacher! Your First Five Minutes',
    duration: '90 seconds',
    role: 'teacher',
    sequence: 1,
    script: `Welcome! You've just made one of the smartest professional decisions of your year. And I'm not just saying that.

In the next ninety seconds, I'm going to show you exactly what to do first so you're not staring at a dashboard wondering where to click.

Here's your game plan for the next five minutes.

First, head to your profile. Top right corner. Add your year group and subjects. This isn't bureaucracy. It personalises everything you'll see from now on. Secondary maths teachers don't need Early Years phonics resources clogging their view.

Second, find one student who's been on your mind. The one you've been meaning to research intervention strategies for. Search their name, or if they're not in the system yet, create a quick profile. Just name and year group for now.

Third, go to the Interventions library. Search for their main area of need. Reading? Behaviour? Emotional regulation? Browse what comes up. You'll probably find three strategies you wish you'd known about last term.

That's it. Profile. Student. Intervention search. Five minutes and you've already got something useful.

Don't try to learn everything today. The platform reveals itself as you use it. Tomorrow, try running a quick assessment. Next week, explore the differentiation engine.

One thing at a time. You're going to love this.

Now go set up that profile. I'll see you in the next video when you're ready to go deeper.`
  },

  'onboard-teacher-differentiation': {
    id: 'onboard-teacher-differentiation',
    title: 'Teachers: The Differentiation Engine in 3 Minutes',
    duration: '3 minutes',
    role: 'teacher',
    sequence: 2,
    script: `Alright, you've been exploring for a bit. Now let me show you the feature that teachers tell us genuinely changes their practice: the No Child Left Behind differentiation engine.

Here's the scenario. You've got a lesson on fractions planned for tomorrow. Your class includes Jayden who has dyslexia and needs reduced visual clutter. Amira who's working two years ahead and needs extension. Callum who has ADHD and needs chunked instructions with movement breaks. And twenty-seven others, each with their own profile.

Normally, you'd either create one lesson and hope for the best, or spend your entire evening creating variations. Neither option is sustainable.

Watch this instead.

Navigate to the Lesson Planner. Create your core lesson, or upload an existing plan you've already got. Learning objective: understand equivalent fractions. Main activity: pizza sharing investigation. Plenary: exit ticket with three questions.

Now, select the students this lesson is for. The system already knows their profiles from assessments and observations you've logged.

Click Generate Differentiated Versions.

In about fifteen seconds, you'll have thirty versions of your lesson. Jayden's has dyslexia-friendly fonts, cream background, and simplified visual layouts. Amira's has extension challenges that push her algebraic thinking. Callum's has numbered steps, built-in movement breaks, and visual timers.

You haven't done extra work. The technology has applied what it knows about each learner to adapt your professional planning.

Now here's the crucial part. Review the adaptations. The AI is good, but you know your students better. Maybe Callum's actually been managing well with longer focused periods recently. Adjust his version. Maybe Jayden needs the vocabulary pre-taught. Add a note to his version.

The technology handles the mechanical differentiation. You provide the professional refinement.

Print, share digitally, or project different versions to different table groups. However your classroom works, the differentiated content works with it.

Teachers using this consistently report saving three to four hours per week. Not by cutting corners. By letting technology do what technology is good at, so they can focus on what humans are good at.

That's the differentiation engine. That's what actually inclusive teaching can look like when you have the right tools.

Try it with tomorrow's lesson. You'll see.`
  },

  'onboard-teacher-assessment': {
    id: 'onboard-teacher-assessment',
    title: 'Teachers: Running Your First Assessment',
    duration: '2 minutes',
    role: 'teacher',
    sequence: 3,
    script: `Let's run your first assessment together. I'll walk you through it step by step so there's no guesswork.

Head to Assessments in the main navigation. You'll see our library of validated tools. Don't be overwhelmed by the choice. Use the filters.

Let's say you want to assess reading. Filter by "Reading" and your year group. You'll see options ranging from quick five-minute screeners to comprehensive diagnostic assessments.

For your first go, choose something quick. Maybe the Single Word Reading test or a Reading Fluency probe. Click into it and you'll see exactly what it measures, how long it takes, and what materials you need.

Ready? Click Start Assessment and select your student.

Now you have two options. Administer directly, where you sit with the student and record their responses in real time. Or assign independently, where older students complete it themselves on a device.

For this first one, try direct administration so you can see how it works.

The interface guides you through each item. Present the stimulus to the student exactly as shown. Record their response. The system handles timing, scoring, and flagging items that might need review.

When you're done, you get instant results. Not just a raw score, but interpretation. Where does this student sit compared to age expectations? What does this suggest about their specific difficulties? What areas need attention?

Here's the powerful part. Click "View Matching Interventions" and you'll see evidence-based strategies that directly address the identified needs. The assessment isn't just measuring. It's pointing toward action.

You can generate a summary report with one click. Share it with parents, the SENCO, or keep it for your own records. Everything's stored, so you can track progress over time.

That's assessment on this platform. Clear, efficient, and connected to what happens next.

Now go run one for real. Pick a student you're curious about. You'll have meaningful data in ten minutes.`
  },
};


// =============================================================================
// SENCO ONBOARDING JOURNEY
// =============================================================================

export const SENCO_ONBOARDING = {
  'onboard-senco-welcome': {
    id: 'onboard-senco-welcome',
    title: 'Welcome, SENCO! Your Command Centre Awaits',
    duration: '2 minutes',
    role: 'senco',
    sequence: 1,
    script: `Welcome. If you're watching this, you're probably juggling more than any one person should reasonably juggle. Provision mapping, annual reviews, parent meetings, staff training, external agency liaison, individual student casework, and somehow also teaching.

Let me show you how this platform becomes your command centre rather than another thing to manage.

First, the dashboard. When you log in, you see your school at a glance. Students on the SEND register with their provision status. Upcoming reviews with days remaining. Interventions currently running and their progress indicators. Staff training completion rates.

This isn't data for data's sake. It's early warning. That amber indicator means something needs attention before it becomes red.

Second, the provision map. Navigate to SEND Overview. You'll see every student, their primary need, current provision, and outcomes. Filter by year group, need type, or status. Export to any format your governors or LA need.

Third, and this is what SENCOs tell us they love most, the evidence trail. Every assessment, every intervention, every review, every communication. All logged. All searchable. When Ofsted asks about the impact of your provision, you're not scrambling through emails and paper files. You're generating reports.

For your first session, I'd suggest focusing on three things. Import your SEND register if you haven't already. We accept CSV from most MIS systems. Run through one student's profile to see how information flows together. Then check the staff training section to see what CPD you can assign to your team.

The deeper features, EHCP workflows, multi-agency collaboration, detailed analytics, those come naturally once you're comfortable navigating.

You're not alone in this role anymore. You've got infrastructure. Let's use it.`
  },

  'onboard-senco-provision-mapping': {
    id: 'onboard-senco-provision-mapping',
    title: 'SENCOs: Provision Mapping That Actually Works',
    duration: '2 minutes 30 seconds',
    role: 'senco',
    sequence: 2,
    script: `Provision mapping. Two words that probably make you sigh. Because traditional provision maps are either beautiful spreadsheets that nobody maintains, or living documents that look like chaos.

Let me show you provision mapping that maintains itself.

Navigate to SEND Overview, then Provision Map. You'll see your current picture, automatically generated from the data already in the system.

Every intervention you log appears on the map. Every assessment result informs need categorisation. Every review updates the status. You're not entering information twice. You're not reconciling documents. The map reflects reality because it draws from the same data as everything else.

Here's how to read it. Students are grouped by primary need. Within each group, you see the provision they're receiving, colour-coded by type: targeted intervention, specialist support, environmental adjustment, one-to-one provision.

Click any student to drill into their individual profile. What assessments have been done? What interventions are running? What progress has been recorded? All there.

The costing view shows you resource allocation. How much teaching assistant time is allocated to each year group? How do your intervention groups break down by cost per student? When you need to justify budget requests, this data already exists.

Now here's the game-changer. Gap analysis. The system identifies students whose needs might not be fully met by current provision. Maybe Lily has an identified working memory difficulty but isn't in any intervention addressing it. Maybe Year 4 has a cluster of social communication needs but limited group provision. The platform surfaces these gaps so you can act on them.

Export the provision map in any format. Visual map for governors. Detailed spreadsheet for the LA. Summary report for your own records.

This isn't extra work. It's the work you already do, made visible and coherent.

Update your provision mapping habits. Log interventions when they start. Record outcomes when they end. Let the system do the aggregation.

Your provision map becomes a genuine strategic tool, not a compliance document you dread updating.`
  },

  'onboard-senco-ehcp-workflow': {
    id: 'onboard-senco-ehcp-workflow',
    title: 'SENCOs: Managing EHCPs Without the Chaos',
    duration: '2 minutes',
    role: 'senco',
    sequence: 3,
    script: `EHCP management. The thing that can consume your entire term if you let it. Tracking requests, coordinating evidence, chasing professional contributions, preparing for panels, managing reviews.

Let me show you how the platform transforms this from chaos to workflow.

Navigate to EHCP Management. If you have students currently in the assessment process, they'll appear here with their status and timeline.

For each application, you see exactly where you are. Request submitted. Assessment decision made. EP advice received. SALT advice pending. OT contribution due in twelve days.

No more mental tracking of who's done what. No more calendar reminders that you forget to update. The workflow shows reality.

When you need to submit evidence for an application, everything's already organised. Assessments you've run are here. Intervention logs are here. Progress data is here. One click compiles it into the format the LA expects.

For requesting professional contributions, you don't need to write individual emails. Select the professionals needed, add any specific questions, and the system sends structured requests with secure contribution portals. Contributors submit directly into the workflow. You see when they've viewed the request, started drafting, and completed.

Annual reviews? The system generates pre-populated review documents drawing on the latest data. You edit and refine rather than starting from scratch.

Here's what makes this powerful. Visibility. Your headteacher can see EHCP status without asking you. Your LA caseworker can see contribution status without chasing. Everyone works from the same information.

Time saved on administration is time available for the work that actually matters: advocating for children, supporting families, and ensuring provision meets need.

If you have a current EHCP application in progress, add it to the system today. Watch how the workflow transforms your experience.

This is how EHCP management should always have worked.`
  },
};


// =============================================================================
// EDUCATIONAL PSYCHOLOGIST ONBOARDING
// =============================================================================

export const EP_ONBOARDING = {
  'onboard-ep-welcome': {
    id: 'onboard-ep-welcome',
    title: 'Welcome, Educational Psychologist',
    duration: '2 minutes',
    role: 'educational_psychologist',
    sequence: 1,
    script: `Welcome, colleague. This platform was designed by an EP for EPs, and you'll notice that immediately. The tools aren't approximations of what we do. They're built from understanding how we actually work.

Let me orient you to what matters most.

First, the assessment library. Navigate to Assessments and you'll find over fifty validated tools covering cognitive, academic, social-emotional, and behavioural domains. Not simplified versions. Proper assessment instruments with scoring, interpretation, and norm-referenced data.

The ECCA framework, Ecological-Contextual-Clinical Assessment, structures how the platform organises information. You'll recognise the approach: understanding the child within their systems, gathering multiple perspectives, integrating quantitative and qualitative data.

Second, report generation. This is the feature that will give you hours back. Run your assessments, and the platform captures everything. When you're ready to write up, click Generate Report Draft.

You don't get a finished report. You get a structured draft with your data organised appropriately. Background information from school. Assessment results with interpretation frameworks. Observations you've recorded. You edit, refine, add your clinical reasoning, and finalise. What used to take six hours takes two.

Third, the intervention recommendations. After assessment, the platform suggests evidence-based interventions matched to identified needs. You're not Googling for strategies. You're selecting from a curated, evidence-rated library and adapting to context.

For your first session, run a familiar assessment using the platform. Experience how the data flows. Then generate a draft report and see the time difference.

The learning curve is short because the platform respects how you already work. It just removes the friction.

Welcome to infrastructure that actually supports professional practice.`
  },

  'onboard-ep-assessment-suite': {
    id: 'onboard-ep-assessment-suite',
    title: 'EPs: The Assessment Suite Deep Dive',
    duration: '3 minutes',
    role: 'educational_psychologist',
    sequence: 2,
    script: `Let's go deep on the assessment capabilities. This is where you'll spend most of your time on the platform, and there's more here than you might initially see.

Navigate to Assessments. The library is organised by domain: cognitive abilities, academic attainment, social-emotional functioning, behaviour and adaptive skills, speech and language screening.

Let me highlight some specifics.

Cognitive assessment tools include working memory measures, processing speed tasks, and verbal and non-verbal reasoning screeners. These aren't substitutes for full cognitive batteries, but they're powerful for generating hypotheses and monitoring change over time.

Academic attainment covers single word reading, reading comprehension, spelling, and mathematical reasoning. Standardised against UK norms, with standard scores and percentile ranks.

Social-emotional tools include anxiety and depression screeners, self-concept measures, and peer relationship assessments. Both self-report and informant versions where appropriate.

Now here's the functionality that matters. Dynamic assessment mode. For certain tools, you can switch to a test-teach-retest format that captures learning potential, not just current performance. The platform handles the additional data points and generates meaningful interpretation.

Cross-assessment analysis. When you've run multiple assessments on one student, the platform identifies patterns. Is there a consistent gap between verbal and non-verbal abilities? Does processing speed explain both the reading difficulty and the maths performance? The analysis doesn't replace your clinical reasoning, but it surfaces patterns you might investigate.

Assessment batteries. For comprehensive evaluations, save assessment combinations you use regularly. One click initiates your standard cognitive-academic-social battery with consistent protocols.

And critically, everything feeds into report generation. Assessment data populates automatically. Interpretation frameworks apply. You write the clinical synthesis, but you don't re-type the numbers.

Take an afternoon to explore the full library. You'll find assessments you wish you'd had access to years ago.

This is what comprehensive assessment tools should look like. Built for professional practice, not simplified for mass market.`
  },

  'onboard-ep-report-writing': {
    id: 'onboard-ep-report-writing',
    title: 'EPs: Report Writing Transformed',
    duration: '2 minutes',
    role: 'educational_psychologist',
    sequence: 3,
    script: `Let's talk about the thing that consumes more EP time than almost anything else: report writing. And specifically, how to get that time back.

You've conducted assessments. You've observed. You've consulted. You have all the information. Now you need to communicate it effectively. That takes hours. Except now it doesn't have to.

Navigate to Reports and click Create New Report. Select the student and choose your template. We have formats for statutory EP advice, consultation summary reports, full psychological assessment reports, and more.

The system populates what it already knows. Background information from school referral. Assessment results you've run on the platform. Observation notes you've recorded. Previous assessment history if it exists.

You see a structured draft. Not a finished product. A starting point that's already eighty percent organised.

Now you do what only you can do. Add your clinical formulation. Connect the assessment findings into a coherent understanding of the child. Write the analysis that explains why these results matter in this context for this individual.

The platform handles mechanical tasks: formatting tables, calculating confidence intervals, generating visual representations of results. You handle clinical reasoning and professional judgement.

For recommendations, the system suggests evidence-based interventions that match the assessment profile. You select, adapt, and specify how they apply to this child's particular circumstances.

When you're satisfied, one click generates a professionally formatted document. Export as Word for further editing, or PDF for sharing.

What used to take six hours now takes two. And those four hours? That's another child you can see. Another school you can consult with. Or, honestly, an evening you get back.

Report writing transformed. Not because the platform writes your reports, but because it handles everything except the parts that require your expertise.

Try it with your next case. You'll wonder how you managed before.`
  },
};


// =============================================================================
// PARENT ONBOARDING JOURNEY
// =============================================================================

export const PARENT_ONBOARDING = {
  'onboard-parent-welcome': {
    id: 'onboard-parent-welcome',
    title: 'Welcome, Parent - You Belong Here',
    duration: '90 seconds',
    role: 'parent',
    sequence: 1,
    script: `Hello, and welcome. Before we go any further, I want you to know something important: you belong here.

The language used around special educational needs can feel excluding. Acronyms everywhere. Professional jargon. Systems that weren't designed with parents in mind.

This platform is different. You're not an afterthought. You're a partner.

Let me show you around.

Your dashboard shows you what matters: your child's current support, upcoming meetings or reviews, documents that have been shared with you, and any actions that need your input.

You don't need to understand everything immediately. The platform explains as it goes. See that little question mark icon? It's everywhere. Click it for plain English explanations of anything that isn't clear.

Your first step? Complete your family profile. Tell us about your child from your perspective. What are their strengths at home? What challenges do you see? What are your hopes for them?

This isn't a form that disappears into a void. Your input becomes part of the official record. It influences decisions. Professionals will read what you write.

You'll also find resources designed specifically for parents. Guides to the EHCP process. Explanations of assessment reports. Strategies you can use at home.

You're not meant to become an expert overnight. You're meant to feel informed enough to participate meaningfully in decisions about your child's education.

Take your time exploring. Nothing you click can break anything. This is your space too.

Welcome to the partnership.`
  },

  'onboard-parent-understanding-reports': {
    id: 'onboard-parent-understanding-reports',
    title: 'Parents: Understanding Your Child\'s Reports',
    duration: '2 minutes',
    role: 'parent',
    sequence: 2,
    script: `You've received an assessment report about your child. It's full of numbers and terms you don't recognise. Let me help you make sense of it.

First, don't panic. Every parent finds these reports overwhelming initially. That's not a failure on your part. It's technical documentation that wasn't written for a general audience.

Here's how to approach it.

Start with the summary. Most reports begin or end with a summary section. This tells you, in more accessible language, what was assessed and what the main findings are. Read this first.

Now let's decode the numbers. You'll often see something called a standard score. The average standard score is 100, and most people score between 85 and 115. A score of 100 doesn't mean your child got 100 out of 100. It means they performed at the average level for their age.

Percentile ranks tell you something slightly different. If your child scored at the 25th percentile, it means 75% of children their age scored higher, and 25% scored the same or lower. The 50th percentile is average.

Terms like "significantly below average" or "well above expectations" have specific statistical meanings. Ask the professional who conducted the assessment to explain exactly what they mean in your child's case.

Focus on patterns, not individual numbers. Is reading consistently lower than other skills? Is there a gap between understanding and expressing? These patterns tell the story.

Most importantly, look at the recommendations. What does this assessment suggest should happen next? This is the actionable part. The numbers diagnose; the recommendations direct.

If you don't understand something, ask. Request a meeting with the professional who wrote the report. Ask them to explain it in plain English. This is your right. Professionals expect these conversations.

You don't need to become a psychologist to be an effective advocate for your child. You just need to understand enough to participate in decisions.

And now you're on your way.`
  },

  'onboard-parent-contributing': {
    id: 'onboard-parent-contributing',
    title: 'Parents: Making Your Voice Count',
    duration: '90 seconds',
    role: 'parent',
    sequence: 3,
    script: `Your voice matters more than you might think. And this platform gives you structured ways to make it count.

Navigate to Contribute Your Views. You'll find a form that asks about your child from your perspective.

This isn't busywork. What you write here becomes part of the official record. It's seen by teachers, SENCOs, and if your child has an EHCP, by the Local Authority professionals making decisions about provision.

So what should you include?

Strengths. Every child has them. Maybe your child is kind, creative, persistent, funny, good with animals, brilliant at building things. Professionals need to know what works, not just what's difficult. Strengths inform how support is designed.

Challenges. What do you see at home that school might not see? Exhaustion after holding it together all day? Meltdowns over homework? Difficulty sleeping before school days? Your observations fill in pictures that school can't see.

History. What has your child's journey been like? When did you first notice difficulties? What has been tried before? What helped, even partially? Context matters enormously.

Aspirations. Where do you want your child to be in a year? What does success look like to your family? These goals should guide planning.

If your child can contribute their own views, that's even better. They might draw pictures, answer simple questions, or write their own statement depending on age and ability. Their voice should be heard directly when possible.

Be specific. "Struggles with reading" is less helpful than "takes twice as long as siblings to finish a page, often guesses words, and frequently says they hate books."

Your perspective completes the picture. Never underestimate its value.

Now go contribute. Your child is counting on your voice.`
  },
};


// =============================================================================
// LOCAL AUTHORITY ONBOARDING
// =============================================================================

export const LA_ONBOARDING = {
  'onboard-la-welcome': {
    id: 'onboard-la-welcome',
    title: 'Welcome, LA Professional: Your EHCP Command Centre',
    duration: '2 minutes',
    role: 'la_admin',
    sequence: 1,
    script: `Welcome. If you're responsible for EHCP casework, you already know the challenges. Twenty-week statutory deadlines that slip. Professional contributions that arrive late or never. Families frustrated by lack of visibility. Caseloads that exceed what's humanly manageable.

This platform addresses each of those challenges architecturally.

Your dashboard shows your caseload at a glance. Active applications by stage. Cases approaching deadline, colour-coded by urgency. Pending contributions and their status. Panel-ready cases.

You're not mentally tracking timelines anymore. The system tracks them and alerts you where attention is needed.

For each application, you see the complete picture. Request date. Assessment decision. Professional contributions received and pending. Draft EHCP status. Parent views. Child views. Everything in one place, not scattered across email and shared drives.

The workflow automation means you're not manually sending reminders. When a contribution is due, the system sends structured requests. When deadlines approach, escalation follows your configured rules.

For your first session, I'd recommend three things.

One: familiarise yourself with the dashboard layout. Click through a few existing cases to see how information is organised.

Two: check the professional contributor setup. Make sure your commonly used EPs, SALTs, OTs and others are registered so you can request contributions seamlessly.

Three: review the deadline tracking configuration. Ensure alert thresholds match your working patterns.

The deeper features, the merge tool, analytics, compliance reporting, those become powerful once you're comfortable with daily workflow.

You've got enterprise infrastructure now. Let's use it to hit those twenty-week targets.`
  },

  'onboard-la-merge-tool': {
    id: 'onboard-la-merge-tool',
    title: 'LA Professionals: The EHCP Merge Tool',
    duration: '2 minutes 30 seconds',
    role: 'la_admin',
    sequence: 2,
    script: `The merge tool is probably the feature that will save you the most time. Let me show you exactly how it works.

You've got an application where all professional contributions are now received. EP advice, SALT assessment, OT recommendations, school evidence, parent views, child views. Six different documents, each with valuable information, none of them organised by EHCP section.

Traditionally, you'd spend hours reading each contribution, highlighting key points, then manually compiling them into coherent sections. Sections B, F, the whole framework. Copy, paste, paraphrase, reconcile.

Watch this instead.

Navigate to the application and click Generate EHCP Draft.

The merge tool reads every contribution. It identifies information relevant to each EHCP section. Section A: views, interests, aspirations from child and parent contributions. Section B: special educational needs identified across all professional assessments. Section F: educational provision recommended by each contributor.

Where professionals agree, the tool consolidates their recommendations into coherent statements. Where they disagree or identify different aspects, it highlights this for your review.

The output is a structured draft. Every section pre-populated with relevant content from the source documents. Source attribution showing where each piece of information originated.

You're not starting from scratch. You're reviewing and refining.

Now here's the critical part. This is a draft, not a final document. You apply your caseworker expertise. You ensure consistency. You resolve contradictions. You add context that professionals couldn't know. You make it read as one coherent plan, not a patchwork of contributions.

The mechanical compilation that used to take hours now takes minutes. The professional review and refinement that requires your expertise? That's where you spend your time.

For your first merge, choose a case where you've just received the final contribution. Run the tool and compare the output to how you would have approached it manually.

You'll see the time difference immediately.

This is EHCP management designed for the reality of casework volume.`
  },

  'onboard-la-analytics': {
    id: 'onboard-la-analytics',
    title: 'LA Professionals: Compliance Analytics',
    duration: '2 minutes',
    role: 'la_admin',
    sequence: 3,
    script: `Data matters. Not data for its own sake, but data that helps you manage performance, identify problems, and demonstrate compliance.

Navigate to Analytics. This is where the platform shows you your LA's EHCP performance.

Start with the compliance dashboard. What percentage of assessments are completing within twenty weeks? What's the trend over the past six months? How does performance vary by need type or area?

These aren't numbers you need to calculate manually. The system generates them from actual casework data.

Bottleneck analysis shows where delays occur. Is assessment decision-making slow? Are specific professional contributions consistently late? Does panel scheduling create backlogs? The data identifies patterns so you can address root causes.

Forecasting models predict future demand and capacity requirements. Based on current request rates and average processing times, what's your likely caseload in three months? Do you have capacity? Where will pressure points emerge?

For DfE reporting, the platform generates compliant data extracts. You're not compiling spreadsheets manually. You're exporting structured data that matches reporting requirements.

Here's what makes this powerful. You can drill down. That overall compliance rate is 72%? Click it. Which cases missed deadline? What were the common factors? Was it a specific professional contributor consistently late? A particular type of assessment taking longer?

Analysis without action is pointless. The platform shows you where to intervene.

For team management, you can see individual caseworker performance. Not as surveillance, but as support identification. Who's managing timeline well? Who's struggling with specific case types? Where does training or reallocation make sense?

Take fifteen minutes to explore the analytics dashboard. Look at your current compliance data. Identify one pattern you didn't know before.

That's the first step to data-informed improvement.`
  },
};


// =============================================================================
// EXPORT ALL ONBOARDING VIDEOS
// =============================================================================

export const ROLE_BASED_ONBOARDING = {
  teacher: TEACHER_ONBOARDING,
  senco: SENCO_ONBOARDING,
  educationalPsychologist: EP_ONBOARDING,
  parent: PARENT_ONBOARDING,
  localAuthority: LA_ONBOARDING,
};

export const ONBOARDING_VIDEO_COUNTS = {
  teacher: Object.keys(TEACHER_ONBOARDING).length,
  senco: Object.keys(SENCO_ONBOARDING).length,
  educationalPsychologist: Object.keys(EP_ONBOARDING).length,
  parent: Object.keys(PARENT_ONBOARDING).length,
  localAuthority: Object.keys(LA_ONBOARDING).length,
  total: 
    Object.keys(TEACHER_ONBOARDING).length +
    Object.keys(SENCO_ONBOARDING).length +
    Object.keys(EP_ONBOARDING).length +
    Object.keys(PARENT_ONBOARDING).length +
    Object.keys(LA_ONBOARDING).length,
};

export default ROLE_BASED_ONBOARDING;
