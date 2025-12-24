const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const API_KEY = process.env.HEYGEN_API_KEY;

if (!API_KEY) {
  throw new Error('HEYGEN_API_KEY environment variable is required');
}
// Truth-by-code: never hardcode real-person identity casting.
// These must be provided explicitly (e.g. from .env / secret manager).
const AVATAR_ID = process.env.HEYGEN_DR_SCOTT_AVATAR_ID;
const VOICE_ID = process.env.HEYGEN_DR_SCOTT_VOICE_ID;

if (!AVATAR_ID || !VOICE_ID) {
  throw new Error(
    'HEYGEN_DR_SCOTT_AVATAR_ID and HEYGEN_DR_SCOTT_VOICE_ID environment variables are required'
  );
}

// Video Scripts Data (Embedded to avoid TS/ESM issues)
const EHCP_VIDEOS = {
  'ehcp-application-journey': {
    id: 'ehcp-application-journey-v4',
    title: 'Your EHCP Application Journey',
    duration: '90 seconds',
    audience: 'Parents, SENCOs, Schools',
    script: `In my years as an Educational Psychologist, I've seen too many families lost in the EHCP maze. It's not just paperwork; it's a child's future. That's why I built this platform to be different.

EHCP stands for Education, Health and Care Plan. But I like to think of it as a legal safety net. It's the document that guarantees the support a child needs to thrive.

Here's the reality: the old way was broken. Chasing emails, lost reports, missed deadlines.

Our platform changes that. We use what I call the 'Golden Thread'. It connects every identified Need directly to a specific Outcome and a quantified Provision.

The journey starts here. You gather evidence—not just random documents, but structured data that proves the need. Our AI helps you draft it, ensuring you use the language that panels actually look for.

Once submitted, you're not in the dark. You track every milestone of the 20-week statutory timeline. You see exactly who is doing what, and when.

If the Local Authority agrees to assess, our system coordinates the professionals. EPs, Speech Therapists, OTs—we all work in the same digital space. No more copy-pasting from PDFs.

This isn't just about getting a plan. It's about getting a *good* plan. One that is legally defensible and actually delivers support.

Let's make this journey count.`
  },
  'ehcp-evidence-gathering': {
    id: 'ehcp-evidence-gathering-v4',
    title: 'Gathering Strong EHCP Evidence',
    duration: '75 seconds',
    audience: 'SENCOs, Teachers, Parents',
    script: `I always tell SENCOs: an EHCP application lives or dies by its evidence. But quantity isn't quality. Ten pages of waffle will lose to one page of hard data every time.

Let me show you how to build a case that's impossible to ignore using our Evidence Builder.

First, we need numbers. Standardised scores. Reading ages. Cognitive profiles. Our platform prompts you for these because they provide the objective baseline.

But numbers need context. That's where your observations come in. Don't just say "struggles with focus." Use our templates to record: "Requires one-to-one prompting every 5 minutes to stay on task." Specificity wins funding.

Crucially, you must show the 'Graduated Response'. What have you already tried? Our system pulls this directly from your intervention logs. It shows the timeline: "We tried Phonics X for 6 weeks, progress was flat. We tried Strategy Y, minimal impact."

This proves that the school has exhausted its resources. It's the legal trigger for an EHC needs assessment.

And don't forget the child's voice. We have tools to capture their views directly, whether they can write or not.

Your evidence tells the story. Let's make it a compelling one.`
  },
  'ehcp-professional-contributions': {
    id: 'ehcp-professional-contributions-v4',
    title: 'Understanding Professional EHCP Contributions',
    duration: '60 seconds',
    audience: 'Parents, SENCOs',
    script: `When an assessment kicks off, you'll see reports coming in from all angles. As an EP, I know this can be overwhelming. Let me decode who does what.

I'm the Educational Psychologist. My job is to work out *how* your child learns. I look at memory, processing speed, and cognitive strengths. My report drives Section B (Needs) and Section F (Provision).

Then you have Speech and Language Therapists. They don't just look at speech; they look at understanding. For a child with autism, their report is often the linchpin.

Occupational Therapists focus on the practical. Can they hold a pen? Can they filter out background noise? They recommend the specific equipment and environmental changes.

Here's the magic of EdPsych Connect: we don't just dump these reports on you. Our 'Merge Tool' reads them all. It extracts the key recommendations and aligns them.

It ensures that if the Speech Therapist says "needs visual support," and I say "needs dual coding," those are linked, not duplicated.

If you don't understand a report, use our 'Ask an Expert' feature. You deserve to know exactly what is being said about your child.

Every professional is a puzzle piece. We put them together.`
  },
  'ehcp-annual-review': {
    id: 'ehcp-annual-review-v4',
    title: 'The EHCP Annual Review Process',
    duration: '75 seconds',
    audience: 'SENCOs, Parents, LAs',
    script: `The Annual Review. For many, it's a tick-box exercise. For us, it's the engine of progress.

An EHCP isn't a statue; it's a living document. If it's not changing, it's probably not working.

Our 'Annual Review Scheduler' automates the admin so you can focus on the child. It pulls in the progress data from the last 12 months automatically.

Before you even walk into the meeting, you can see: Did we meet Outcome 3? If not, why? Was the provision actually delivered?

During the review, we use the 'Live Edit' feature. We project the plan on the screen. We agree on changes together. We update the outcomes in real-time.

No more "I'll write that up and send it in two weeks." It's done.

We also look at Phase Transfers. Moving to secondary school? Our system flags this 18 months in advance, ensuring the transition plan is robust.

This is a collaborative process. Parents, school, professionals—all on the same page, literally.

Let's turn the Annual Review from a chore into a celebration of progress.`
  },
  'ehcp-appeals': {
    id: 'ehcp-appeals-v4',
    title: 'Understanding EHCP Appeals',
    duration: '60 seconds',
    audience: 'Parents',
    script: `Sometimes, despite everyone's best efforts, the decision comes back 'No'. Or the plan comes back empty. I know how devastating that feels.

But 'No' isn't the end. It's often just the start of the appeal process. And you have more power than you think.

You can appeal to the SEND Tribunal if the LA refuses to assess, refuses to issue a plan, or if the content is weak.

Before you go to court, consider Mediation. Our platform connects you directly with mediation services. It's faster, less adversarial, and often resolves the issue.

If you do need to appeal, our 'Tribunal Bundle Generator' is your best friend. It compiles every piece of evidence, every email, every report into a court-ready bundle.

It highlights the gaps. It points out where the LA has failed to follow the Code of Practice. It gives you the legal footing of a solicitor, without the cost.

Appealing doesn't make you 'difficult'. It makes you an advocate. And with the right evidence, you can win.

Stay calm. Stay organised. We've got your back.`
  }
};

const HELP_CENTRE_VIDEOS = {
  'help-getting-started': {
    id: 'help-getting-started-v4',
    title: 'Getting Started with EdPsych Connect',
    duration: '90 seconds',
    audience: 'All new users',
    script: `Welcome to EdPsych Connect. I'm Dr. Scott, and I built this platform because I was tired of seeing children fail because of paperwork.

You're now looking at your Dashboard. Think of this as Mission Control for your SEND provision.

On the left, you have your toolkit. 'Assessments' for identifying needs. 'Interventions' for doing something about them. And 'Reports' for documenting it all.

The search bar up top? It's powered by our 'Universal Translator'. You can type "dyslexia help" or "reading struggles" and it understands exactly what you mean.

See those alerts? That's our 'Compliance Risk Predictor' working in the background. It's watching your deadlines so you don't have to.

My advice? Don't try to boil the ocean. Start with one child. Run one assessment. Generate one report. You'll see how much time it saves you.

If you get stuck, just ask. Our 'Voice Command System' is always listening. Just say "Help me with this assessment" and it will guide you.

You're here to make a difference. We're here to handle the rest. Let's get started.`
  },
  'help-first-assessment': {
    id: 'help-first-assessment-v4',
    title: 'Running Your First Assessment',
    duration: '75 seconds',
    audience: 'Teachers, SENCOs, EPs',
    script: `Ready to run your first assessment? This is where the science happens.

Go to the Assessment Library. We have over fifty validated tools here. Not sure which one to pick? Just ask the system: "Screen for ADHD traits" or "Check reading fluency."

Once you've chosen, you have two modes. 'Guided Mode' is for you to use with the child. 'Independent Mode' lets older students complete it themselves on a tablet.

As they answer, our 'Real-Time Analysis' engine is already working. It's not just counting ticks; it's looking for patterns.

When you finish, you don't get a raw score. You get a 'Clinical Insight'. It tells you: "This score places them in the 5th percentile, indicating a significant difficulty with working memory."

And here's the best part: it doesn't stop at the score. It immediately suggests the 'Intervention' that matches that specific profile.

Assess. Understand. Act. That's the workflow. Give it a try.`
  },
  'help-finding-interventions': {
    id: 'help-finding-interventions-v4',
    title: 'Finding the Right Intervention',
    duration: '60 seconds',
    audience: 'Teachers, SENCOs, TAs',
    script: `Identifying a need is useless if we don't do something about it. That's why our Intervention Library is the heart of this platform.

We don't just list strategies. We curate evidence-based programmes.

You can filter by 'Effect Size'—that's the research-proven impact. Or by 'Cost', or 'Time Required'.

But the real power is the 'No Child Left Behind Engine'. It automatically recommends interventions based on your assessment data.

If a child struggles with phonological awareness, it won't just suggest "reading". It will suggest "Elkonin Boxes" or "Phonics Phase 2". Specificity matters.

Click into any intervention and you get the full kit. Lesson plans, resources, progress trackers. It's all there.

And you can track it. Log every session. If it's not working after 6 weeks, the system will flag it and suggest an alternative. That's the 'Assess-Plan-Do-Review' cycle in action.

Stop guessing. Start using what works.`
  },
  'help-data-security': {
    id: 'help-data-security-v4',
    title: 'How We Protect Your Data',
    duration: '75 seconds',
    audience: 'All users, especially administrators',
    script: `I'm a psychologist, so I know that the data we hold is sensitive. It's not just numbers; it's people's lives.

That's why we built this platform with a 'Zero Trust' architecture.

Everything is encrypted. In transit, at rest, everywhere. We use AES-256 encryption—the same standard used by banks and the military.

For our Local Authority partners, we offer 'Bring Your Own Database'. This means your data stays on your infrastructure. We process it, but we don't own it. You have absolute sovereignty.

Access is strictly 'Need to Know'. A teacher sees their class. A SENCO sees their school. An LA officer sees their caseload. No accidental sharing.

And we log everything. Our 'Immutable Audit Trail' records every click, every view, every edit. If you need to know who looked at a file three years ago, we can tell you.

We are fully GDPR compliant, UK-hosted, and ISO 27001 aligned.

Your trust is our currency. We protect it like our own.`
  },
  'help-collaboration': {
    id: 'help-collaboration-v4',
    title: 'Collaborating with Your Team',
    duration: '60 seconds',
    audience: 'All users',
    script: `The days of emailing password-protected Word documents are over. Collaboration needs to be secure, and it needs to be instant.

On EdPsych Connect, you build 'Care Teams' around a child.

You can invite the Speech Therapist, the Social Worker, and the Class Teacher into a secure workspace.

You can co-author documents. I can be writing the psychological advice while the SENCO adds the school history. We see each other's edits in real-time.

But it's controlled. You decide exactly who sees what. You can share the 'Needs' section without sharing the 'Family History'.

And our 'Secure Messaging' keeps the conversation right next to the data. No more hunting through your inbox to find that one email from three months ago.

It's about working together, without the friction.`
  },
  'help-generating-reports': {
    id: 'help-generating-reports-v4',
    title: 'Generating Professional Reports',
    duration: '60 seconds',
    audience: 'EPs, SENCOs, Teachers',
    script: `I used to spend 3 hours writing a report for every 1 hour I spent with a child. That's backwards.

Our 'Report Generator' flips that ratio.

You select your template—whether it's a Statutory Advice, a School Report, or a Parent Summary.

The system pulls in all the data automatically. The scores, the background info, the intervention history. It's all pre-populated.

Then, our AI suggests the narrative. It looks at the scores and drafts the interpretation. "Thomas scored in the low average range, suggesting..."

You remain the editor. You add your professional nuance. But the grunt work is done.

We even handle the formatting. It looks professional, consistent, and branded every time.

What used to take me all evening now takes 20 minutes. That means more time for the children. And that's why we're here.`
  },
  'help-cpd-tracking': {
    id: 'help-cpd-tracking-v4',
    title: 'Tracking Your Professional Development',
    duration: '45 seconds',
    audience: 'All professional users',
    script: `You're a professional. You're constantly learning. But tracking that learning is a pain.

We've built a 'CPD Portfolio' right into the platform.

Every time you complete a training module with us, it's logged automatically. The hours, the learning outcomes, the certificate.

But you can also log external training. Went to a conference? Read a journal article? Log it here.

The system even suggests training based on your activity. If you've been assessing a lot of dyslexia lately, it might suggest our advanced literacy module.

When it's time for your appraisal or HCPC registration, you just click 'Export'. You get a verified, professional portfolio ready to go.

Your expertise is your greatest asset. We help you prove it.`
  },
  'help-troubleshooting': {
    id: 'help-troubleshooting-v4',
    title: 'Troubleshooting Common Issues',
    duration: '60 seconds',
    audience: 'All users',
    script: `Technology is great, until it isn't. If you hit a snag, don't panic. We've built a 'Self-Healing' support system.

First, try the 'Voice Command'. Just say "I can't find the report" or "The assessment is stuck." It can often fix the issue for you.

If a page isn't loading, check your connection. Our 'Offline Mode' handles spotty Wi-Fi, but you need a connection to sync.

If you're stuck on a login loop, it's usually a cache issue. A quick refresh often solves it.

But if you're really stuck, our support isn't a robot. It's a team of real people, including EPs and tech experts.

Click the 'Help' icon. You can chat with us live. We can even 'Shadow' your session (with your permission) to see exactly what you're seeing.

We're not just a software company; we're your partners. We won't leave you stranded.`
  }
};

const LA_PORTAL_VIDEOS = {
  'la-dashboard-overview': {
    id: 'la-dashboard-overview-v4',
    title: 'Your LA Dashboard Overview',
    duration: '75 seconds',
    audience: 'LA Caseworkers, SEND Managers',
    script: `Welcome to the Command Centre. This is the LA Dashboard, designed to give you total visibility over your SEND landscape.

I know the pressure you're under. The 20-week deadline isn't just a target; it's the law.

That's why your dashboard is colour-coded by urgency. Green is on track. Amber is approaching deadline. Red is critical. You know exactly where to focus your energy every morning.

You can see your entire caseload at a glance. Filter by school, by stage, or by complexity.

The 'Activity Feed' on the right is your pulse check. It shows you real-time updates: "St Mary's just submitted the Annual Review," "Dr. Jones just uploaded the EP advice."

And for managers, the 'Compliance Analytics' are a game changer. You can see bottlenecks before they become breaches. "Why is the drafting stage taking 4 weeks on average?" Now you have the data to fix it.

This isn't just about managing cases; it's about managing capacity. It puts you back in control.`
  },
  'la-professional-requests': {
    id: 'la-professional-requests-v4',
    title: 'Managing Professional Requests',
    duration: '60 seconds',
    audience: 'LA Caseworkers',
    script: `Chasing professional advice is the biggest bottleneck in the EHCP process. We've solved it with our 'Request Portal'.

Instead of sending emails into the void, you send a secure, tracked request directly from the platform.

You select the professional—EP, SALT, Social Care. You set the deadline. You add specific questions.

They get a secure link. They don't need a login. They upload their advice directly into the system.

And here's the best bit: you can see if they've opened it. You can see if they're drafting. No more "I never got the email."

The system sends automated chasers. "Your advice is due in 3 days." "Your advice is due tomorrow." It does the nagging for you.

When the advice arrives, it's automatically filed and tagged. Ready for the drafter.

It turns a chaotic chase into a streamlined workflow.`
  },
  'la-ehcp-merge-tool': {
    id: 'la-ehcp-merge-tool-v4',
    title: 'The EHCP Merge Tool Explained',
    duration: '75 seconds',
    audience: 'LA Caseworkers',
    script: `This is the feature that makes caseworkers cheer. The EHCP Merge Tool.

You have five different reports. The EP, the School, the Parent, Health, Social Care. Traditionally, you'd spend hours copy-pasting these into the draft plan.

Watch this. I click 'Generate Draft'.

The system reads all five reports. It identifies the Needs. It identifies the Provision. And it maps them into Section B and Section F.

It even spots conflicts. "The EP says 10 hours of support, the School says 15." It highlights this for you to resolve.

It doesn't replace your judgement. You still review every word. But it does the heavy lifting. It creates a structured, coherent first draft in seconds.

This frees you up to do the high-value work: quality assurance, communication with families, and problem-solving.

It's not magic, but it feels like it.`
  }
};

const PARENT_PORTAL_VIDEOS = {
  'parent-portal-welcome': {
    id: 'parent-portal-welcome-v4',
    title: 'Welcome to the Parent Portal',
    duration: '75 seconds',
    audience: 'Parents',
    script: `Hello. I'm Dr. Scott. If you're here, it's because you're fighting for your child. I want you to know: you have an ally.

This Parent Portal is your window into your child's support. No more "gatekeepers." No more waiting for a letter in the post.

Here, you can see exactly what is happening. The timeline of the assessment. The reports as soon as they are uploaded. The draft plan the moment it's ready.

But it's not just for looking. It's for speaking.

You can upload your own evidence. Videos of your child at home. Reports from private therapists. Your own "Parental Views" statement.

You can message the case officer directly. Securely.

We've also included a 'Jargon Buster'. If you see a term like "Wave 3 Intervention" or "Section I", just hover over it. We explain it in plain English.

This is your space. Use it to tell your child's story.`
  },
  'parent-understanding-results': {
    id: 'parent-understanding-results-v4',
    title: 'Understanding Your Child\'s Assessment Results',
    duration: '60 seconds',
    audience: 'Parents',
    script: `You've received an assessment report. It's full of graphs and percentiles. It can be scary. Let me help you read it.

First, remember: these numbers are a snapshot, not a destiny.

A 'Standard Score' of 100 is average. Anything between 85 and 115 is typical.

If you see a score below 85, that indicates a difficulty. But look at the pattern. Is their verbal score high but their processing speed low? That tells us they are bright but need more time.

Our platform visualises this for you. We turn the numbers into a 'Profile Chart'. You can see the peaks and troughs.

And crucially, we link it to 'Strengths'. Every child has them. Maybe it's visual reasoning. Maybe it's verbal comprehension. We make sure those aren't lost.

If you don't understand a score, click 'Explain This'. Our AI will give you a plain-English breakdown.

Knowledge is power. We want you to feel powerful.`
  },
  'parent-contributing-views': {
    id: 'parent-contributing-views-v4',
    title: 'Contributing Your Views',
    duration: '45 seconds',
    audience: 'Parents',
    script: `Section A of the EHCP is 'The Views, Interests and Aspirations of the Child and their Parents'. It's the most important section.

Don't worry about sounding 'professional'. You are the expert on your child.

Tell us what they love. Dinosaurs? Lego? Music? That's the hook we use to teach them.

Tell us what worries you. The morning routine? The playground? The future?

And tell us your dreams for them. Not just "pass maths," but "have friends," "be happy," "get a job."

Our 'Parent Wizard' guides you through these questions. It helps you structure your thoughts so they translate directly into the legal plan.

Your voice is the heart of this process. Make it loud.`
  }
};

const COMPLIANCE_VIDEOS = {
  'compliance-data-protection': {
    id: 'compliance-data-protection-v4',
    title: 'Data Protection for Educators',
    duration: '75 seconds',
    audience: 'All educational staff',
    script: `Data protection isn't just about fines. It's about trust.

When a parent hands over their child's medical report, they are trusting us with their secrets. We have to honour that.

Our platform enforces 'Data Minimisation'. You only see what you need to see.

If you're a subject teacher, you see the 'Need to Know' info—strategies, medical alerts. You don't necessarily see the full family history.

We also handle 'Retention'. We automatically archive data when a student leaves, and delete it when the statutory period expires. You don't have to remember to shred the files.

And 'Subject Access Requests'. If a parent asks for their data, our 'SAR Generator' compiles it in minutes, redacted and ready.

Security is built in. But it relies on you. Don't share passwords. Don't leave screens unlocked.

Treat this data like it belongs to your own child.`
  },
  'compliance-consent': {
    id: 'compliance-consent-v4',
    title: 'Managing Consent Properly',
    duration: '60 seconds',
    audience: 'SENCOs, Teachers, Administrators',
    script: `Consent is the foundation of everything we do. You can't assess a child without it.

Our 'Consent Manager' makes this watertight.

When you want to refer a child to an EP, you click 'Request Consent'. The parent gets a secure link on their phone. They sign with their finger.

It's instantly logged. We know who signed, when, and exactly what they agreed to.

If they withdraw consent? The system locks the data immediately. You can't accidentally process it.

We also handle 'Competency'. For older students, the system prompts you to consider if they can give their own consent.

This protects you. It protects the school. And most importantly, it respects the family's rights.`
  }
};

const ASSESSMENT_VIDEOS = {
  'assessment-choosing': {
    id: 'assessment-choosing-v4',
    title: 'Choosing the Right Assessment',
    duration: '60 seconds',
    audience: 'Teachers, SENCOs, EPs',
    script: `We have over 50 assessments in our library. Choosing the right one is critical.

Ask yourself: What is the question?

If you're asking "Is this dyslexia?", use our 'Phonological Screener'.
If you're asking "Why are they behaving like this?", use the 'SEMH Profiler'.
If you're asking "Are they ready for exams?", use the 'Access Arrangements Screener'.

Our 'Assessment Finder' helps you. You can filter by Age, Area of Need, or Time Required.

You can also see the 'Reliability Rating'. We only use tools that are statistically robust.

And remember, assessment isn't a label. It's a roadmap. Choose the tool that gives you the best map.`
  },
  'assessment-interpreting': {
    id: 'assessment-interpreting-v4',
    title: 'Interpreting Assessment Results',
    duration: '75 seconds',
    audience: 'Teachers, SENCOs, EPs',
    script: `You've received an assessment report. It's full of graphs and percentiles. It can be scary. Let me help you read it.

Don't just look at the total. Look at the profile.

A flat profile (all low) suggests a general learning difficulty.
A spiky profile (some high, some low) suggests a specific difficulty, like dyslexia or ADHD.

Our 'AI Analysis' highlights these spikes for you. It says: "Look here. Verbal skills are high, but working memory is low. This is the bottleneck."

It also gives you 'Confidence Intervals'. It reminds you that a score of 85 is an estimate, not a precise coordinate.

And finally, it translates scores into strategies. "Because working memory is low, use chunking. Use visual supports."

The score is the 'What'. The interpretation is the 'So What'. And the strategy is the 'Now What'.`
  }
};

const ALL_VIDEO_SCRIPTS = {
  ehcp: EHCP_VIDEOS,
  helpCentre: HELP_CENTRE_VIDEOS,
  laPortal: LA_PORTAL_VIDEOS,
  parentPortal: PARENT_PORTAL_VIDEOS,
  compliance: COMPLIANCE_VIDEOS,
  assessment: ASSESSMENT_VIDEOS,
};

// Helper function to make API requests
function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve(body);
          }
        } else {
          reject(new Error(`Request failed with status code ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function generateVideo(key, videoData) {
  console.log(`Generating video: ${videoData.title} (${key})...`);
  
  const options = {
    hostname: 'api.heygen.com',
    path: '/v2/video/generate',
    method: 'POST',
    headers: {
      'X-Api-Key': API_KEY,
      'Content-Type': 'application/json'
    }
  };

  const payload = {
    video_inputs: [
      {
        character: {
          type: 'avatar',
          avatar_id: AVATAR_ID,
          avatar_style: 'normal'
        },
        voice: {
          type: 'text',
          voice_id: VOICE_ID,
          input_text: videoData.script,
          speed: 0.9
        }
      }
    ],
    test: false,
    aspect_ratio: '16:9',
    title: videoData.title
  };

  try {
    const response = await makeRequest(options, payload);
    console.log(`SUCCESS: Video generation started for ${key}`);
    console.log(`Video ID: ${response.data.video_id}`);
    return {
      key,
      id: videoData.id,
      title: videoData.title,
      videoId: response.data.video_id,
      status: 'pending'
    };
  } catch (error) {
    console.error(`FAILED: Could not generate video for ${key}`);
    console.error(error.message);
    return {
      key,
      id: videoData.id,
      title: videoData.title,
      error: error.message,
      status: 'failed'
    };
  }
}

async function main() {
  console.log('Starting Dr. Scott Video Generation Batch...');
  console.log(`Avatar ID: ${AVATAR_ID}`);
  console.log(`Voice ID: ${VOICE_ID}`);
  
  const results = [];
  
  // Flatten the structure to iterate easily
  const allVideos = [];
  for (const [category, videos] of Object.entries(ALL_VIDEO_SCRIPTS)) {
    for (const [key, videoData] of Object.entries(videos)) {
      allVideos.push({ key, videoData, category });
    }
  }
  
  console.log(`Found ${allVideos.length} videos to generate.`);
  
  // Process in batches to avoid rate limits
  const BATCH_SIZE = 3;
  for (let i = 0; i < allVideos.length; i += BATCH_SIZE) {
    const batch = allVideos.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1} of ${Math.ceil(allVideos.length/BATCH_SIZE)}...`);
    
    const batchPromises = batch.map(item => generateVideo(item.key, item.videoData));
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Wait a bit between batches
    if (i + BATCH_SIZE < allVideos.length) {
      console.log('Waiting 5 seconds before next batch...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  // Save results
  const outputPath = path.join(__dirname, '..', 'dr-scott-generation-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`All done! Results saved to ${outputPath}`);
  
  // Print summary
  const successCount = results.filter(r => r.status === 'pending').length;
  const failCount = results.filter(r => r.status === 'failed').length;
  console.log(`Summary: ${successCount} succeeded, ${failCount} failed.`);
}

main().catch(console.error);
