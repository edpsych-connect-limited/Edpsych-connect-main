#!/usr/bin/env npx tsx
/**
 * EHCP Management Modules Video Generation & Cloudinary Upload
 * 
 * This script:
 * 1. Submits video scripts to HeyGen API
 * 2. Polls for video completion
 * 3. Downloads completed videos
 * 4. Uploads to Cloudinary CDN
 * 5. Updates video-mapping.json and cloudinary-video-urls.json
 * 
 * Run with: npx tsx tools/generate-ehcp-module-videos.ts
 * 
 * Required environment variables:
 * - HEYGEN_API_KEY
 * - CLOUDINARY_API_KEY
 * - CLOUDINARY_API_SECRET
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { v2 as cloudinary } from 'cloudinary';

// =============================================================================
// CONFIGURATION
// =============================================================================

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY || 'sk_V2_hgu_kIsPOKnUIeM_Nvtt8QLs3osJMx3nQi5fYEytQNjhR4qM';
const HEYGEN_API_URL = 'https://api.heygen.com/v2/video/generate';
const HEYGEN_STATUS_URL = 'https://api.heygen.com/v1/video_status.get';

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dncfu2j0r';
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '243634378544427';
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'J2CdOE3wHop90Vz0mS99biVHbnU';

// Avatar and Voice Configuration - UK Professional Style (Dr. Scott)
const AVATAR_CONFIG = {
  avatar: {
    id: 'Adrian_public_3_20240312', // Professional UK male avatar
    style: 'normal'
  },
  voice: {
    id: 'aba5ce361bfa433480f4bf281cc4c4f9', // Oliver Bennett - Warm UK voice
    speed: 1.0
  },
  background: {
    type: 'color' as const,
    value: '#1e293b' // Dark professional slate
  },
  dimension: {
    width: 1920,
    height: 1080
  }
};

// Rate limits
const HEYGEN_RATE_LIMIT_MS = 5000;  // 5 seconds between submissions
const STATUS_POLL_INTERVAL_MS = 30000;  // 30 seconds between status checks
const MAX_POLL_ATTEMPTS = 40;  // 20 minutes max wait per video

// =============================================================================
// VIDEO SCRIPTS DATA
// =============================================================================

interface VideoScript {
  id: string;
  title: string;
  lesson: string;
  script: string;
  duration: string;
}

const EHCP_MODULE_VIDEOS: VideoScript[] = [
  {
    id: 'ehcp-modules-m1-l1',
    title: 'EHCP Modules Hub Overview',
    lesson: 'Overview - Your Complete EHCP Management Toolkit',
    duration: '3-4 minutes',
    script: `Have you ever felt like you're drowning in paperwork while the children who need you most are waiting? That mountain of annual review deadlines, the tribunal anxiety, the funding calculations that never quite add up... I've been there. Every SENCO and educational psychologist I know has been there.

When I first started in this field, I genuinely believed that if I just worked harder, stayed later, organized better—I'd somehow manage it all. But here's what I learned: the problem isn't you. It's the system that expects superhuman administrators while giving you paper-based tools from the 1990s.

That's exactly why we built the EHCP Management Modules. Not because technology is exciting—though, honestly, it is—but because every minute you spend wrestling with spreadsheets is a minute you're not spending with a child who needs your expertise.

Let me show you what's possible.

Picture this: It's September, and instead of panic-scrolling through folders trying to work out which annual reviews are due when, you open your dashboard and everything's there. Colour-coded by urgency. Linked to each child's Golden Thread. One click and you see their complete picture.

Seven modules. One unified system. Every piece of the EHCP puzzle connected.

Annual Reviews—your deadline guardian. Automated reminders, standardised templates, outcome tracking across time.

Mediation and Tribunal—because sometimes relationships get complicated. Track every case, every communication, every document.

Phase Transfers—from nursery to primary, primary to secondary, secondary to post-16. Each transition mapped, every deadline tracked.

Compliance and Risk—our AI predicts where problems might emerge before they become crises.

Resource Costing—Element 1, Element 2, Element 3—calculated, tracked, justified.

The Golden Thread—needs, provisions, outcomes—all connected, all visible.

SEN2 Returns—automated data extraction, validation checks, one-click generation.

These tools won't make difficult decisions for you. They won't have that conversation with the parent who's disappointed with their child's progress. But they will clear away the administrative fog so you can see what matters.

Ready to explore? Let's start with Annual Reviews.`
  },
  {
    id: 'ehcp-modules-m1-l2',
    title: 'Annual Reviews Mastery',
    lesson: 'Mastering the Annual Review Cycle',
    duration: '4-5 minutes',
    script: `February half-term. You're supposed to be catching up on everything. But there you are, at 11pm, realising you've completely forgotten about Year 6 Sarah's annual review—the one that needed to happen before Christmas because she's transitioning to secondary.

Sound familiar?

The thing about annual reviews is they're not actually annual. They're this constantly shifting landscape of due dates, dependent on when each EHCP was finalised, when the child's birthday falls, whether there's a phase transfer coming.

It's like trying to juggle while someone keeps throwing new balls at you. And each ball is a child who deserves your full attention.

Let me show you how the Annual Reviews module changes this.

Imagine your calendar isn't a static grid anymore. It's alive. It knows that Marcus's review is in April, but because he's Year 8 and his EHCP includes preparation for adulthood outcomes, it automatically flagged him for enhanced transition review in September—six months earlier than you'd normally start planning.

That's not a reminder you set. That's the system understanding the SEND Code of Practice and applying it to your actual caseload.

The Dashboard View shows everything at once. Green dots—reviews completed on time. Amber—coming up in the next 6 weeks. Red—overdue or high priority.

The system knows if paperwork is missing, if the parent hasn't confirmed attendance, if the health professional's report still hasn't arrived.

Annual reviews must happen within 12 months of the previous review. Phase transfer reviews must be completed by specific dates—15th February for secondary transfer, 31st March for post-16. The module tracks all of this automatically and gives you early warnings.

The module generates invitation letters automatically—but they're not cold, bureaucratic templates. We worked with parents to write them.

One click sends invitations to everyone: parents, class teacher, teaching assistants, speech therapist, occupational therapist, the educational psychologist. And then it tracks responses. Accepted. Declined. No response yet.

Here's something that breaks my heart about traditional annual reviews. Each one exists in isolation. Paper in a folder. You can't easily see: Is this child actually making progress toward their EHCP outcomes across years?

This module changes that. Every review feeds into a longitudinal view. A child's journey, visible at a glance.

Every child with an EHCP deserves an annual review that genuinely reflects on their progress and plans for their future.

The Annual Reviews module won't make you a better SENCO. You're already brilliant at what you do. But it will clear away enough of the administrative burden that you can actually do it.`
  },
  {
    id: 'ehcp-modules-m1-l3',
    title: 'Mediation and Tribunal Navigation',
    lesson: 'Navigating Disputes with Confidence',
    duration: '5-6 minutes',
    script: `The letter arrives. SENDIST. Those seven letters that make even experienced SENCOs' hearts sink.

I remember the first time I received tribunal papers. I'd been working in education for years. I genuinely believed I'd done everything right for this child. But there it was—the family disagreed, fundamentally, with decisions that had been made.

And I thought: how did we get here?

Here's what I've learned since then. Tribunals and mediations aren't failures. They're part of a system designed to ensure every child gets what they need. Parents have a legal right to challenge decisions. That's not adversarial—that's accountability.

But many disputes don't need to reach tribunal. The Mediation and Tribunal module helps you catch problems before they escalate, prepare when they do, and learn from every case.

The system flags patterns that experienced SENCOs recognise but might miss when overwhelmed. Multiple emails in a short period. Requests for all documentation under Freedom of Information. Parents attending meetings with advocates.

When you see these flags, the module prompts a reflection: Have you had a recent face-to-face with this family? Would a meeting help right now?

Mediation is a gift. Seriously. It's a structured opportunity to resolve disagreements without the adversarial nature of tribunal.

The module helps you prepare a clear summary: what's been provided, what outcomes have been achieved, where you believe there's disagreement, and—critically—what flexibility might exist.

Let's talk about SENDIST tribunals properly. The tribunal bundle—a chronological collection of every relevant document.

I've seen schools scramble to assemble bundles in days. Searching through old emails. Finding reports that were never properly filed.

The Mediation and Tribunal module changes this. Because it integrates with everything else—Annual Reviews, the Golden Thread, all your documentation—the bundle essentially assembles itself. Documents already organised. Timeline already clear.

I can't prepare you for the emotional weight of a tribunal hearing in a video. It's stressful. But I can tell you this.

The SENCOs who feel most confident are the ones who can say: Every decision I made is documented. Every provision is recorded. Every conversation is captured.

Whether a mediation succeeds or fails, whether a tribunal goes your way or not, there's learning. The module captures outcomes. What was agreed? What would you do differently?

I genuinely hope you never need this module in earnest. But hope isn't a strategy. When disputes happen, you want to be prepared. Not defensive—prepared.`
  },
  {
    id: 'ehcp-modules-m1-l4',
    title: 'Phase Transfers Mastery',
    lesson: 'Supporting Children Through Educational Transitions',
    duration: '4-5 minutes',
    script: `Think about the biggest transitions in your own life. First day at a new school. Starting secondary. Leaving for college or work.

Remember how it felt? The uncertainty. The excitement mixed with fear.

Now imagine facing that with additional needs. Imagine your brain processes change differently. Imagine you rely on routines that are about to disappear.

Phase transfers are the highest-risk moments in any child's EHCP journey. More things go wrong during transitions than at any other time.

That's exactly why we built the Phase Transfers module.

In England, there are four main educational phases: Early Years to Primary, Primary to Secondary, and Secondary to Post-16. Each has different statutory timelines.

For primary to secondary transfer, the final EHCP must be issued by 15th February in Year 6. For post-16 transfer, by 31st March in Year 11.

Miss those dates, and families don't have placement certainty.

When you open the Phase Transfers module, you see a visual workflow—like a Gantt chart, but designed for children, not construction projects.

Each child in a transfer year has their own track. Milestones marked: initial review scheduled, parental preferences gathered, placement consultations sent, responses received, final EHCP issued.

Early Years transfers are special. Often, these are children whose needs are newly identified. Parents who are just beginning to understand what EHCP processes mean.

The module prompts early engagement. Multi-agency meetings in autumn term. School visits while the child is still in nursery.

We've built in templates for visual social stories. "This is my new school." "This is the classroom I'll be in."

Year 6 to Year 7. The transfer that everyone dreads.

New building. New timetable—not one classroom but eight different subjects. The module helps you plan not just the administrative transfer, but the human one.

Transition visit schedules. Key adult identification. Sensory audits of new environments. Staff training on the child's specific needs—before September, not after.

Post-16 transfers are different again. We're not just talking about educational placement. We're talking about preparing for adulthood.

The SEND Code of Practice requires that from Year 9—age 13-14—annual reviews should include preparation for adulthood discussions.

The module flags these requirements automatically.

Transitions are windows—windows of vulnerability, but also windows of opportunity. A well-managed transfer sets the tone for years to come.`
  },
  {
    id: 'ehcp-modules-m1-l5',
    title: 'Compliance and Risk AI',
    lesson: 'Predicting Problems Before They Become Crises',
    duration: '5-6 minutes',
    script: `It's Thursday afternoon. The phone rings. It's the local authority—there's been a complaint from a parent. Their child's EHCP provision hasn't been delivered properly. There might be a tribunal coming.

And you think: I had no idea there was a problem.

How many times have crises arrived like that? Not preceded by gradual warning signs you recognised, but sudden, seemingly out of nowhere?

The truth is, most EHCP problems don't come from nowhere. They build. There are patterns. Early indicators.

The Compliance and Risk module uses artificial intelligence to spot those patterns.

Let me demystify this. The system analyses patterns across your EHCP caseload. It looks at: How long since the last annual review? Are provision hours being recorded as delivered? Have outcome progress ratings been updated? Are there communication patterns suggesting parental concern?

And then it calculates a risk score. Not a judgement—a probability.

Think of it like weather forecasting. We can't tell you it will definitely storm. But we can tell you there's a 70% chance of rain—so maybe bring an umbrella.

When you open the module, you see your caseload ranked by risk score.

Red zone: High risk. Multiple indicators flashing.
Amber zone: Elevated risk. Something's not quite right.
Green zone: On track.

Through analysis of thousands of EHCP cases, we've identified seven factors most predictive of problems: Annual Review Delays, Provision Recording Gaps, Outcome Stagnation, Communication Volume Spikes, Professional Report Delays, Phase Transfer Proximity, and Historical Dispute Pattern.

Let me share a real example—anonymised, of course.

A Year 4 child with an EHCP for autism. Everything looked fine. But the system flagged elevated risk. Why?

Communication volume. The parent had sent 23 emails in three weeks—up from an average of 2 per month.

The SENCO called the parent. Just to check in. It turned out the parent had noticed their child becoming increasingly anxious.

They identified the triggers—changes in classroom support staff. Adjustments were made. No complaint. No mediation. No tribunal.

Because the system noticed what humans might have missed, and the human did what systems never could—built relationship.

Using AI to assess risk in children's education feels uncomfortable to some people. That discomfort is valid.

Here's how we've thought about it. The AI doesn't make decisions. It doesn't label children. It surfaces patterns that might otherwise go unnoticed.

We built the system to augment your expertise, not replace it. You remain the professional. The AI is just a very attentive assistant.`
  },
  {
    id: 'ehcp-modules-m1-l6',
    title: 'Resource Costing and Funding',
    lesson: 'UK Funding Elements and EHCP Financial Management',
    duration: '5-6 minutes',
    script: `Let me guess. At some point in your career, you've had a conversation that went something like this:

"We need an additional teaching assistant for this child."
"What's the cost?"
"About £15,000 per year."
"Where does that come from?"
"Um..."

Here's the uncomfortable truth about SEND provision in England. The system is complex. The funding is fragmented. And most SENCOs were trained to support children, not to navigate public sector finance.

But understanding how EHCP funding works isn't optional anymore. It's how you get resources for the children who need them.

The Resource Costing module makes this manageable.

In England, funding for children with EHCPs comes through three elements.

Element 1: Basic Per-Pupil Funding through the National Funding Formula—nothing special, same for every child.

Element 2: The Notional SEND Budget—approximately £6,000 per pupil with additional needs—to meet basic EHCP provision. "Notional" is the key word. It's not ring-fenced money that arrives separately.

Element 3: Top-Up Funding. When an EHCP specifies provision costing more than £6,000, the local authority should provide top-up funding to cover the excess.

So if a child needs £18,000 of provision: Element 1 is in normal budget, Element 2 is first £6,000 from school's notional SEND budget, Element 3 is remaining £12,000 requested as top-up from LA.

The Resource Costing module helps you calculate what provision actually costs.

Let's say an EHCP specifies 15 hours per week 1:1 TA support, 1 hour per week speech and language therapy, 2 hours per week occupational therapy.

Enter the provision hours, and it calculates annual costs automatically. TA hourly costs including on-costs like National Insurance, pension.

Suddenly, that conversation with the finance director changes:

"What's the cost?"
"£14,850 per year based on these hours at Band 3 rates plus on-costs."
"What does the LA provide?"
"Top-up covers £8,850. Our contribution is £6,000 from notional SEND budget."
"That's clear. Let's proceed."

Many local authorities use banding systems. Band A might be £3,000 top-up. Band B might be £6,000.

The module tracks both actual provision costs AND band allocation. So you can see: Are we over-resourced or under-resourced? What's the gap between allocated funding and required provision?

Local authorities audit EHCP spending. The module generates audit-ready reports. Per-child spending breakdowns. Provision delivery rates. Outcome progress linked to resource allocation.

I know money isn't why you got into education. But money is how support gets delivered. Understanding the funding system isn't selling out—it's being effective.

Knowledge is power. And when you're fighting for resources for children who need them, you want all the power you can get.`
  },
  {
    id: 'ehcp-modules-m1-l7',
    title: 'Golden Thread Coherence',
    lesson: 'The Coherence That Transforms EHCPs',
    duration: '6-7 minutes',
    script: `Let me tell you about a moment that changed how I think about EHCPs.

I was reviewing a plan for a child named Jamie—anonymised, of course. Section B listed "communication difficulties." Section F included "20 hours teaching assistant support." Section E stated the outcome: "Jamie will make progress in communication skills."

And I thought: what does that actually mean?

Which specific communication difficulties? How does a general teaching assistant address them? What does "progress" look like?

That EHCP had all the right sections. All the right words. It met every statutory requirement. And yet... it wasn't really a plan. It was paperwork.

The Golden Thread module exists to fix this.

Imagine a single thread running through an EHCP, connecting everything: This child has THIS need. Therefore they require THIS provision. Which should achieve THIS outcome. And we'll know it's working because of THIS evidence.

When that thread runs clear and unbroken, an EHCP becomes powerful. Every provision justified. Every outcome measurable.

When the thread breaks—when needs don't connect to provisions, when provisions don't connect to outcomes—the plan falls apart.

When you open the Golden Thread module, you see something beautiful. Every need linked to its relevant provisions. Every provision linked to its target outcomes. Lines connecting them—visible, traceable, logical.

Click on a need: "Difficulty with working memory affecting ability to follow multi-step instructions."

See the linked provisions: "Visual instruction cards," "Chunking of tasks," "Check-in after each step."

See the linked outcome: "Jamie will independently follow three-step instructions 80% of the time by July."

Now that's a plan. Specific. Logical. Measurable.

The module analyses connections. Not just whether things are linked—but whether the links are logical. Is this provision evidence-based for this type of need? Is this outcome specific enough to measure? Are there needs without any linked provisions? Are there provisions not linked to any needs?

Let me walk you through creating a coherent EHCP section.

Start with the need. Be specific. Not "communication difficulties" but "Expressive language delay affecting ability to construct grammatically complete sentences of more than four words."

Now, provisions. "Weekly speech and language therapy (30 minutes)." "Daily narrative retelling activities." "Visual sentence builders in classroom."

Now, outcomes. "By July 2025, Jamie will independently construct grammatically complete sentences of six or more words in 70% of recorded language samples."

See how different that is?

The Golden Thread isn't just for planning—it's for monitoring. At annual review time, you're not guessing whether the plan worked. You have evidence.

Parents read EHCPs trying to understand: What does my child need? What will they get? Will it help?

A Golden Thread EHCP answers those questions clearly. When parents understand the plan, they become partners in it.

When coherence becomes your standard, EHCPs stop being bureaucratic obligations. They become tools for transformation.`
  },
  {
    id: 'ehcp-modules-m1-l8',
    title: 'SEN2 Returns Automation',
    lesson: 'Automating Statutory Statistical Returns',
    duration: '4-5 minutes',
    script: `January. The email arrives from your local authority. SEN2 returns are due.

And your heart sinks.

Because you know what's coming. Days of extracting data. Reconciling numbers that don't match. Chasing missing information. Filling in forms that ask the same questions in slightly different ways. Checking. Rechecking. Panicking when the deadline approaches.

Every year, the same ritual. Every year, it consumes time you could have spent with children.

The SEN2 Returns module ends this. Not by making the statutory requirement disappear—but by automating the extraction, validation, and generation of everything you need.

For those who might be new to this, SEN2 returns are statistical returns to the Department for Education about special educational needs.

The returns cover: Numbers of children with EHCPs, Primary and secondary needs categories, Placement types, Age distributions, New EHCPs issued during the year, Timelines met and missed.

The data shapes national understanding of SEND provision. It influences policy. It affects funding formulae. It matters.

Every child in your EHCP caseload has a record. Primary need. Secondary need. Date EHCP finalised. Placement type. Age. Phase.

The SEN2 Returns module extracts this data automatically.

Click "Generate SEN2 Data." The system pulls everything relevant. Categorises by DfE-required codes. Groups by the breakdowns the return requires.

What used to take days happens in seconds.

But extraction isn't enough. Raw numbers often contain errors.

The module validates data before you submit. Are all primary need codes valid DfE categories? Are dates logical? Do numbers add up? Are there anomalies?

Errors flagged. Explanations required for anomalies. You submit clean data, confident it's accurate.

The module maintains a complete audit trail. Every number in your SEN2 return links to the underlying records.

One of the most useful features: automatic comparison with previous years. Are your EHCP numbers growing? Shrinking? Are certain need categories changing? Are timelines improving or worsening?

Data becomes insight. Numbers become stories.

One of the most sensitive aspects is timeline compliance. How many EHCPs were completed within the statutory 20-week timeframe?

The module handles all of this. Every EHCP has its timeline automatically calculated.

Different local authorities request data in different formats. Some want Excel files. Some have online portals.

The module generates outputs in multiple formats. Choose your authority's preferred format. Download. Submit.

Here's my challenge to you. Don't treat SEN2 returns as pure compliance. Treat them as an annual opportunity to understand your SEND population.

I'm not going to pretend SEN2 returns are exciting. They're not. But they don't have to be painful.

The SEN2 Returns module reduces what was a significant annual burden to a straightforward process. Generate. Validate. Submit. Done.

And then you can get back to what actually matters. The children. The families. The work that made you become a SENCO in the first place.`
  }
];

// =============================================================================
// HEYGEN API FUNCTIONS
// =============================================================================

interface HeyGenVideoResponse {
  error?: unknown;
  data?: {
    video_id: string;
  };
}

interface HeyGenStatusResponse {
  error?: unknown;
  data?: {
    status: string;
    video_url?: string;
    video_url_caption?: string;
  };
}

async function submitVideoToHeyGen(script: VideoScript): Promise<string | null> {
  const payload = {
    video_inputs: [{
      character: {
        type: 'avatar',
        avatar_id: AVATAR_CONFIG.avatar.id,
        avatar_style: AVATAR_CONFIG.avatar.style
      },
      voice: {
        type: 'text',
        input_text: script.script,
        voice_id: AVATAR_CONFIG.voice.id,
        speed: AVATAR_CONFIG.voice.speed
      },
      background: AVATAR_CONFIG.background
    }],
    dimension: AVATAR_CONFIG.dimension,
    aspect_ratio: '16:9',
    test: false,
    title: `EHCP Module: ${script.title}`
  };

  try {
    const response = await fetch(HEYGEN_API_URL, {
      method: 'POST',
      headers: {
        'X-Api-Key': HEYGEN_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`  ❌ HeyGen API Error ${response.status}: ${errorText}`);
      return null;
    }

    const result = await response.json() as HeyGenVideoResponse;
    
    if (result.error) {
      console.error(`  ❌ HeyGen Error:`, result.error);
      return null;
    }

    return result.data?.video_id || null;
  } catch (error) {
    console.error(`  ❌ Network Error:`, error);
    return null;
  }
}

async function checkVideoStatus(videoId: string): Promise<{ status: string; videoUrl?: string }> {
  try {
    const response = await fetch(`${HEYGEN_STATUS_URL}?video_id=${videoId}`, {
      headers: {
        'X-Api-Key': HEYGEN_API_KEY
      }
    });

    if (!response.ok) {
      return { status: 'error' };
    }

    const result = await response.json() as HeyGenStatusResponse;
    return {
      status: result.data?.status || 'unknown',
      videoUrl: result.data?.video_url
    };
  } catch {
    return { status: 'error' };
  }
}

async function downloadVideo(url: string, outputPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(outputPath);
    
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirect
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          https.get(redirectUrl, (redirectResponse) => {
            redirectResponse.pipe(file);
            file.on('finish', () => {
              file.close();
              resolve(true);
            });
          }).on('error', () => {
            fs.unlink(outputPath, () => {});
            resolve(false);
          });
        } else {
          resolve(false);
        }
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(true);
      });
    }).on('error', () => {
      fs.unlink(outputPath, () => {});
      resolve(false);
    });
  });
}

// =============================================================================
// CLOUDINARY FUNCTIONS
// =============================================================================

function initCloudinary(): boolean {
  if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return false;
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true
  });

  return true;
}

interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  bytes: number;
  duration?: number;
}

async function uploadToCloudinary(localPath: string, publicId: string): Promise<CloudinaryUploadResult | null> {
  try {
    const result = await cloudinary.uploader.upload(localPath, {
      resource_type: 'video',
      public_id: publicId,
      overwrite: true,
      eager: [
        { format: 'mp4', quality: 'auto' },
      ],
      eager_async: true,
    });

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      bytes: result.bytes,
      duration: result.duration as number | undefined,
    };
  } catch (error) {
    console.error(`  ❌ Cloudinary upload failed:`, error);
    return null;
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

interface VideoResult {
  id: string;
  title: string;
  heygenVideoId?: string;
  heygenStatus: string;
  videoUrl?: string;
  cloudinaryUrl?: string;
  error?: string;
}

async function main() {
  console.log('');
  console.log('═'.repeat(80));
  console.log('🎬 EHCP Management Modules - Video Generation & Upload');
  console.log('   EdPsych Connect - World Class Enterprise Grade');
  console.log('═'.repeat(80));
  console.log('');

  // Check environment variables
  if (!HEYGEN_API_KEY) {
    console.error('❌ HEYGEN_API_KEY environment variable is required');
    console.error('   Set it with: export HEYGEN_API_KEY="your-key-here"');
    process.exit(1);
  }

  const hasCloudinary = initCloudinary();
  if (!hasCloudinary) {
    console.warn('⚠️  Cloudinary credentials not set - videos will be generated but not uploaded to CDN');
    console.warn('   Set CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET for CDN upload');
    console.log('');
  }

  console.log('✅ HeyGen API Key configured');
  console.log(hasCloudinary ? '✅ Cloudinary configured' : '⚠️  Cloudinary not configured');
  console.log(`🎭 Avatar: ${AVATAR_CONFIG.avatar.id}`);
  console.log(`🎙️  Voice: Oliver Bennett (UK)`);
  console.log(`📐 Resolution: ${AVATAR_CONFIG.dimension.width}x${AVATAR_CONFIG.dimension.height}`);
  console.log('');
  console.log(`📊 Total videos to generate: ${EHCP_MODULE_VIDEOS.length}`);
  console.log('');

  // Create temp directory for downloads
  const tempDir = path.join(process.cwd(), 'temp_videos');
  ensureDirectoryExists(tempDir);

  // Create output directory for final videos
  const outputDir = path.join(process.cwd(), 'public', 'content', 'training_videos', 'ehcp-management-modules');
  ensureDirectoryExists(outputDir);

  const results: VideoResult[] = [];
  const cloudinaryUrls: Record<string, string> = {};

  // PHASE 1: Submit all videos to HeyGen
  console.log('─'.repeat(80));
  console.log('📤 PHASE 1: Submitting videos to HeyGen API');
  console.log('─'.repeat(80));
  console.log('');

  for (let i = 0; i < EHCP_MODULE_VIDEOS.length; i++) {
    const script = EHCP_MODULE_VIDEOS[i];
    console.log(`[${i + 1}/${EHCP_MODULE_VIDEOS.length}] ${script.title}`);
    
    const videoId = await submitVideoToHeyGen(script);
    
    if (videoId) {
      console.log(`  ✅ Submitted: ${videoId}`);
      results.push({
        id: script.id,
        title: script.title,
        heygenVideoId: videoId,
        heygenStatus: 'pending'
      });
    } else {
      console.log(`  ❌ Failed to submit`);
      results.push({
        id: script.id,
        title: script.title,
        heygenStatus: 'failed',
        error: 'Submission failed'
      });
    }

    // Rate limiting
    if (i < EHCP_MODULE_VIDEOS.length - 1) {
      await sleep(HEYGEN_RATE_LIMIT_MS);
    }
  }

  // PHASE 2: Poll for completion
  console.log('');
  console.log('─'.repeat(80));
  console.log('⏳ PHASE 2: Waiting for HeyGen to render videos');
  console.log('─'.repeat(80));
  console.log('');

  const pendingVideos = results.filter(r => r.heygenVideoId && r.heygenStatus === 'pending');
  console.log(`Videos pending: ${pendingVideos.length}`);
  console.log('Checking status every 30 seconds...');
  console.log('');

  let pollAttempt = 0;
  while (pendingVideos.some(v => v.heygenStatus === 'pending' || v.heygenStatus === 'processing') && pollAttempt < MAX_POLL_ATTEMPTS) {
    pollAttempt++;
    console.log(`Poll attempt ${pollAttempt}/${MAX_POLL_ATTEMPTS}...`);

    for (const video of pendingVideos) {
      if (video.heygenStatus !== 'pending' && video.heygenStatus !== 'processing') {
        continue;
      }

      if (!video.heygenVideoId) continue;

      const status = await checkVideoStatus(video.heygenVideoId);
      video.heygenStatus = status.status;

      if (status.status === 'completed' && status.videoUrl) {
        video.videoUrl = status.videoUrl;
        console.log(`  ✅ ${video.title}: COMPLETED`);
      } else if (status.status === 'failed') {
        console.log(`  ❌ ${video.title}: FAILED`);
      } else {
        console.log(`  ⏳ ${video.title}: ${status.status}`);
      }

      await sleep(500); // Small delay between status checks
    }

    const stillPending = pendingVideos.filter(v => v.heygenStatus === 'pending' || v.heygenStatus === 'processing');
    if (stillPending.length > 0) {
      console.log(`  ${stillPending.length} videos still rendering...`);
      await sleep(STATUS_POLL_INTERVAL_MS);
    }
  }

  // PHASE 3: Download completed videos
  console.log('');
  console.log('─'.repeat(80));
  console.log('📥 PHASE 3: Downloading completed videos');
  console.log('─'.repeat(80));
  console.log('');

  const completedVideos = results.filter(r => r.heygenStatus === 'completed' && r.videoUrl);
  console.log(`Videos to download: ${completedVideos.length}`);
  console.log('');

  for (const video of completedVideos) {
    if (!video.videoUrl) continue;

    console.log(`Downloading: ${video.title}`);
    const localPath = path.join(tempDir, `${video.id}.mp4`);
    
    const downloaded = await downloadVideo(video.videoUrl, localPath);
    if (downloaded) {
      console.log(`  ✅ Downloaded to ${localPath}`);
      video.videoUrl = localPath;
    } else {
      console.log(`  ❌ Download failed`);
    }
  }

  // PHASE 4: Upload to Cloudinary
  if (hasCloudinary) {
    console.log('');
    console.log('─'.repeat(80));
    console.log('☁️  PHASE 4: Uploading to Cloudinary CDN');
    console.log('─'.repeat(80));
    console.log('');

    for (const video of completedVideos) {
      const localPath = path.join(tempDir, `${video.id}.mp4`);
      
      if (!fs.existsSync(localPath)) {
        console.log(`  ⚠️ Skipping ${video.title}: file not found`);
        continue;
      }

      console.log(`Uploading: ${video.title}`);
      const publicId = `edpsych-connect/videos/ehcp-management-modules/${video.id}`;
      
      const uploadResult = await uploadToCloudinary(localPath, publicId);
      
      if (uploadResult) {
        video.cloudinaryUrl = uploadResult.secure_url;
        cloudinaryUrls[video.id] = uploadResult.secure_url;
        console.log(`  ✅ Uploaded: ${uploadResult.secure_url}`);
      } else {
        console.log(`  ❌ Upload failed`);
      }

      await sleep(2000); // Rate limit uploads
    }
  }

  // PHASE 5: Update mapping files
  console.log('');
  console.log('─'.repeat(80));
  console.log('📝 PHASE 5: Updating mapping files');
  console.log('─'.repeat(80));
  console.log('');

  // Update cloudinary-video-urls.json
  if (Object.keys(cloudinaryUrls).length > 0) {
    const cloudinaryUrlsPath = path.join(process.cwd(), 'cloudinary-video-urls.json');
    let existingUrls: Record<string, string> = {};
    
    if (fs.existsSync(cloudinaryUrlsPath)) {
      existingUrls = JSON.parse(fs.readFileSync(cloudinaryUrlsPath, 'utf-8'));
    }

    const updatedUrls = { ...existingUrls, ...cloudinaryUrls };
    fs.writeFileSync(cloudinaryUrlsPath, JSON.stringify(updatedUrls, null, 2));
    console.log(`✅ Updated cloudinary-video-urls.json with ${Object.keys(cloudinaryUrls).length} new URLs`);
  }

  // Update video-mapping.json
  const videoMappingPath = path.join(process.cwd(), 'video_scripts', 'video-mapping.json');
  if (fs.existsSync(videoMappingPath)) {
    const existingMapping = JSON.parse(fs.readFileSync(videoMappingPath, 'utf-8'));
    
    for (const video of results) {
      const entry = existingMapping.find((e: { lessonId: string }) => e.lessonId === video.id);
      if (entry) {
        if (video.heygenVideoId) {
          entry.videoId = video.heygenVideoId;
          entry.shareUrl = `https://app.heygen.com/share/${video.heygenVideoId}`;
        }
        if (video.cloudinaryUrl) {
          entry.cloudinaryUrl = video.cloudinaryUrl;
        }
        entry.status = video.heygenStatus === 'completed' ? 'completed' : video.heygenStatus;
      }
    }

    fs.writeFileSync(videoMappingPath, JSON.stringify(existingMapping, null, 2));
    console.log(`✅ Updated video-mapping.json`);
  }

  // Save generation log
  const logPath = path.join(process.cwd(), 'video_scripts', 'ehcp_management_modules', 'generation-log.json');
  const logContent = {
    generatedAt: new Date().toISOString(),
    config: AVATAR_CONFIG,
    results: results
  };
  fs.writeFileSync(logPath, JSON.stringify(logContent, null, 2));
  console.log(`✅ Saved generation log to ${logPath}`);

  // Summary
  console.log('');
  console.log('═'.repeat(80));
  console.log('📊 GENERATION SUMMARY');
  console.log('═'.repeat(80));
  console.log('');

  const completed = results.filter(r => r.heygenStatus === 'completed').length;
  const failed = results.filter(r => r.heygenStatus === 'failed').length;
  const pending = results.filter(r => r.heygenStatus === 'pending' || r.heygenStatus === 'processing').length;
  const uploaded = results.filter(r => r.cloudinaryUrl).length;

  console.log(`Total videos:      ${EHCP_MODULE_VIDEOS.length}`);
  console.log(`✅ Completed:      ${completed}`);
  console.log(`❌ Failed:         ${failed}`);
  console.log(`⏳ Still pending:  ${pending}`);
  console.log(`☁️  Uploaded to CDN: ${uploaded}`);
  console.log('');

  if (failed > 0) {
    console.log('Failed videos:');
    results.filter(r => r.heygenStatus === 'failed').forEach(r => {
      console.log(`  - ${r.title}: ${r.error || 'Unknown error'}`);
    });
  }

  console.log('');
  console.log('═'.repeat(80));
  console.log('✨ Video generation process complete!');
  console.log('═'.repeat(80));

  // Cleanup temp directory option
  if (completed > 0) {
    console.log('');
    console.log(`Temp videos saved in: ${tempDir}`);
    console.log('You can delete this folder after verifying the uploads.');
  }
}

main().catch(console.error);
