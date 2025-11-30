/**
 * HeyGen Video Generator - World Class Edition
 * 
 * Generates all platform videos with:
 * - Professional avatars
 * - British English voice with locale support
 * - Storytelling scripts that engage and inspire
 * - Proper pacing for comprehension
 * 
 * Usage: HEYGEN_API_KEY=your_key npx tsx tools/generate-world-class-videos.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.HEYGEN_API_KEY;
if (!API_KEY) {
  console.error('❌ Error: HEYGEN_API_KEY environment variable is not set.');
  process.exit(1);
}

// ============================================================================
// CONFIGURATION
// ============================================================================

// Professional male avatar in business attire
const AVATAR_ID = 'Adrian_public_2_20240312'; // Adrian in Blue Suit - professional, warm

// Voice with British English locale support
const VOICE_ID = '453c20e1525a429080e2ad9e4b26f2cd'; // Archer - male, supports locale (full ID)
const VOICE_LOCALE = 'en-GB'; // British English

// Video settings
const VIDEO_WIDTH = 1920;
const VIDEO_HEIGHT = 1080;

// ============================================================================
// SCRIPTS - MARKETING VIDEOS
// ============================================================================

const MARKETING_SCRIPTS = {
  'platform-introduction': {
    title: 'Welcome to EdPsych Connect World',
    duration: '2 minutes',
    script: `Hello, and welcome. I'm genuinely excited to share something with you that I believe will change how you work.

You know that feeling when you're drowning in paperwork? When you've got thirty students who all need something different, and there simply aren't enough hours in the day? When you're copying and pasting the same assessment results into yet another report format?

I've been there. Every educational psychologist, every SENCO, every teacher supporting children with special educational needs has been there. And honestly? It's exhausting.

That's exactly why EdPsych Connect World was created. Not by a tech company trying to sell you another tool you don't need. But by Dr Scott Ighavongbe-Patrick, an educational psychologist who got tired of watching brilliant professionals burn out doing admin when they should be changing children's lives.

So what actually is this platform? Think of it like having an incredibly organised, infinitely patient colleague who never sleeps. Someone who remembers every assessment, knows every intervention, and can write a first draft of that report while you're having your morning coffee.

Let me show you three things that make this different.

First, evidence-based practice at your fingertips. We've got over fifty validated assessment templates and nearly seventy research-backed interventions. All adapted for the UK context. All ready to use. No more reinventing the wheel for every child.

Second, and this is the bit that gets me excited, the No Child Left Behind engine. You create one lesson plan. One. And our system automatically generates thirty different versions, each tailored to a specific student's needs. Dyslexia-friendly fonts for Sam. Chunked instructions for Mia. Visual supports for Leo. What used to take hours happens in seconds.

Third, your data stays yours. We built this with something called BYOD architecture. That's Bring Your Own Database. Your Local Authority keeps complete control. We help you work smarter, but we never hoard your sensitive information. NHS-level encryption, fully GDPR compliant. Your data sovereignty is non-negotiable.

But here's what I really want you to understand. This isn't about technology. It's about time. Time you get back with students. Time you get back with families. Time you might even get back for yourself.

Teachers using this platform tell us they're saving three to four hours every single week. Assessment reports that used to take days? Generated in minutes. Multi-agency collaboration that meant endless email chains? Streamlined into one secure workspace.

The result? More children getting the support they need, faster. More professionals feeling effective instead of overwhelmed. More families feeling heard and supported.

You're about to set up your account and explore what's possible. Take your time. Have a look around. And when you're ready, the platform will meet you exactly where you are.

Welcome to EdPsych Connect World. Welcome to working smarter. Welcome to making a bigger difference with less stress.

Let's get started.`
  },

  'data-autonomy': {
    title: 'Data Autonomy & Trust',
    duration: '90 seconds',
    script: `Let me ask you something important. When you think about the children you work with, what's more sensitive than their educational and psychological data? Their struggles, their strengths, their family situations. It's precious information. And it deserves to be protected like the treasure it is.

Here's the thing about most EdTech platforms. They want your data. They store it on their servers. They own it. And you just have to trust them.

We took a completely different approach. It's called Bring Your Own Database, or BYOD for short.

Think of it like this. Imagine you've got a brilliant assistant who helps you organise your filing cabinet. They can sort, search, and find exactly what you need. But at the end of the day, that cabinet stays in your office, locked with your key. That's what we've built.

Your Local Authority keeps complete sovereignty over every piece of sensitive student data. We process and help you work, but we never hoard. The data lives where you decide it lives. You hold the keys.

And the security? NHS-level encryption, both when data is moving and when it's stored. Fully GDPR compliant. Regular security audits. The works.

Because here's what we believe: trust isn't just a feature. It's the foundation. Without it, nothing else matters.

Your data is precious. It should be protected like family photographs, not treated like marketing fodder.

That's the EdPsych Connect difference. Your data. Your control. Always.`
  },

  'no-child-left-behind': {
    title: 'No Child Left Behind',
    duration: '90 seconds',
    script: `Picture this. You're a teacher with thirty children in your class. And you genuinely want to meet every single one of them where they are. Sam needs dyslexia-friendly fonts and extra processing time. Mia works best with instructions broken into tiny chunks. Leo needs visual supports for everything. And you've got twenty-seven others, each with their own unique profile.

Now, how long would it take you to create thirty different versions of one lesson? Hours? Days? It's virtually impossible. And that's not a criticism of teachers. It's just maths.

Until now.

The No Child Left Behind engine is, honestly, the feature that makes me most proud of this platform. Here's how it works.

You create one lesson plan. Just one. You put in your learning objectives, your content, your activities. The same way you always have.

Then our system does something remarkable. Using each student's psychological profile, their learning preferences, their support needs, it automatically generates a personalised version for every single child. In seconds.

It's like having a master tailor who can cut thirty perfectly fitted suits from one pattern. Same beautiful design. Different fit for every body.

Dyslexia-friendly formatting appears automatically for students who need it. Complex instructions get chunked for those who process better that way. Visual supports pop in where they're needed. Reading levels adjust. Scaffolding appears and disappears based on what each child requires.

And here's the magical part. You're not doing extra work. The technology handles the heavy lifting. You get to focus on what you do best, which is teaching and connecting with children.

No child left behind isn't just our name. It's our promise.`
  },

  'gamification-integrity': {
    title: 'Gamification Integrity',
    duration: '90 seconds',
    script: `I want to let you in on a little secret. You know how children will spend hours on video games? Completely focused, highly motivated, trying again and again to level up?

Now imagine if learning felt that way. Not sugary, superficial gamification that wears off after a week. But something that genuinely taps into what makes games compelling.

That's what we've built. And we call it the Battle Royale learning system.

Here's the thing though. We had a problem to solve. How do you make assessment fun and engaging without compromising the clinical validity of the data? Because if the results aren't reliable, what's the point?

Think of it like hiding vegetables in a chocolate cake. The children see the chocolate, they taste the chocolate, they're excited about the chocolate. But they're also getting their greens.

Students engage with our learning modes because they feel like games. There are leaderboards, squad competitions, merit badges, challenges. All the elements that make games irresistible.

But underneath that engaging surface, every single interaction is capturing clinical-grade data. We're measuring response times, accuracy patterns, learning trajectories. Real assessment information that you can trust and use.

The students don't feel like they're being tested. They feel like they're playing. But you're getting the robust, reliable data you need to make informed decisions.

It's not just fun. It's functional science dressed in a party outfit.

And the results speak for themselves. Engagement goes up. Anxiety around assessment goes down. And the quality of your data? Better than ever.

That's gamification with integrity. That's meeting students where they are.`
  }
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

interface HeyGenResponse {
  error: null | { code: string; message: string };
  data?: {
    video_id?: string;
  };
}

async function generateVideo(scriptId: string, script: { title: string; script: string }): Promise<string | null> {
  console.log(`\n📽️  Generating: ${script.title}`);
  console.log(`   Script length: ${script.script.length} characters`);

  const requestBody = {
    video_inputs: [
      {
        character: {
          type: 'avatar',
          avatar_id: AVATAR_ID,
          avatar_style: 'normal',
        },
        voice: {
          type: 'text',
          voice_id: VOICE_ID,
          input_text: script.script,
          locale: VOICE_LOCALE,
        },
        background: {
          type: 'color',
          value: '#1e293b', // Slate-800 - professional dark background
        },
      },
    ],
    dimension: {
      width: VIDEO_WIDTH,
      height: VIDEO_HEIGHT,
    },
    aspect_ratio: '16:9',
  };

  try {
    const response = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'X-Api-Key': API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data: HeyGenResponse = await response.json();

    if (data.error) {
      console.log(`   ❌ Error: ${data.error.message}`);
      return null;
    }

    const videoId = data.data?.video_id;
    if (videoId) {
      console.log(`   ✅ Success! Video ID: ${videoId}`);
      console.log(`   🔗 Embed: https://app.heygen.com/embed/${videoId}`);
      return videoId;
    }

    console.log(`   ❌ No video ID returned`);
    return null;

  } catch (error) {
    console.log(`   ❌ Request failed: ${error}`);
    return null;
  }
}

async function checkCredits(): Promise<number> {
  try {
    const response = await fetch('https://api.heygen.com/v1/user.remaining_credits', {
      headers: { 'X-Api-Key': API_KEY! },
    });
    const data = await response.json();
    return data.data?.remaining_credits || 0;
  } catch {
    return 0;
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('='.repeat(80));
  console.log('EdPsych Connect World - Video Generation');
  console.log('='.repeat(80));
  console.log('');
  console.log('🎭 Avatar: Adrian in Blue Suit (professional, warm)');
  console.log('🗣️  Voice: Archer with British English locale');
  console.log('🎬 Quality: 1920x1080 HD');
  console.log('');

  // Check credits
  const credits = await checkCredits();
  console.log(`💰 Available credits: ${credits.toLocaleString()}`);
  console.log('');

  if (credits < 1000) {
    console.log('⚠️  Warning: Low credits. Some videos may not generate.');
  }

  // Generate marketing videos
  console.log('='.repeat(80));
  console.log('PHASE 1: Marketing Videos');
  console.log('='.repeat(80));

  const results: Record<string, string> = {};
  const logEntries: string[] = [];

  for (const [scriptId, script] of Object.entries(MARKETING_SCRIPTS)) {
    const videoId = await generateVideo(scriptId, script);
    
    if (videoId) {
      results[scriptId] = videoId;
      logEntries.push(`${new Date().toISOString()} | SUCCESS | ${videoId} | ${script.title}`);
    } else {
      logEntries.push(`${new Date().toISOString()} | FAILED | - | ${script.title}`);
    }

    // Rate limiting - wait between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Save results
  const logPath = path.join(__dirname, '../video_scripts/world_class/generation_log.txt');
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  fs.writeFileSync(logPath, logEntries.join('\n') + '\n');

  // Generate TypeScript mapping
  const tsMapping = `// Auto-generated HeyGen video IDs
// Generated: ${new Date().toISOString()}

export const WORLD_CLASS_VIDEO_IDS = {
${Object.entries(results).map(([k, v]) => `  '${k}': '${v}',`).join('\n')}
};
`;
  
  const tsMappingPath = path.join(__dirname, '../video_scripts/world_class/video-ids.ts');
  fs.writeFileSync(tsMappingPath, tsMapping);

  // Summary
  console.log('');
  console.log('='.repeat(80));
  console.log('GENERATION SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Successful: ${Object.keys(results).length}`);
  console.log(`❌ Failed: ${Object.keys(MARKETING_SCRIPTS).length - Object.keys(results).length}`);
  console.log('');
  console.log('Generated Video IDs:');
  for (const [name, id] of Object.entries(results)) {
    console.log(`  ${name}: ${id}`);
  }
  console.log('');
  console.log(`📁 Log saved to: ${logPath}`);
  console.log(`📁 TypeScript mapping saved to: ${tsMappingPath}`);
}

main().catch(console.error);
