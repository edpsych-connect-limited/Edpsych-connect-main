/**
 * Generate Premium Videos v2.0 - With Soul
 * 
 * These scripts are designed for HUMAN connection:
 * - Stories, not bullet points
 * - Analogies that create understanding
 * - Emotional beats that resonate
 * - Pacing that breathes
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.HEYGEN_API_KEY;

if (!API_KEY) {
  console.error('❌ HEYGEN_API_KEY environment variable required');
  console.log('\nUsage:');
  console.log('  export HEYGEN_API_KEY="your_key_here"');
  console.log('  npx tsx tools/generate-premium-videos-v2.ts');
  process.exit(1);
}

// Premium scripts with soul
const PREMIUM_SCRIPTS = {
  'onboarding-welcome-v2': {
    title: 'Platform Introduction',
    duration: '2:00',
    script: `You know that moment... when you're drowning in paperwork, and somewhere in the back of your mind, there's a child waiting? Waiting for the assessment that could unlock their potential. Waiting for the intervention that could change their life. And you're stuck... formatting a report.

I've been there. Twenty years as an educational psychologist, and I spent more time wrestling with systems than actually helping children. That's not why any of us got into this work.

So we built something different.

EdPsych Connect World isn't software. It's a philosophy wrapped in technology. Think of it like this: You know how a really good teaching assistant seems to anticipate what you need before you ask? That's what we've created - but for your entire practice.

Here's what changes:

That assessment you've been putting off because the admin is overwhelming? Done in minutes, not days. Fifty research-validated templates, ready when you are.

That lesson you're planning for a class where every child learns differently? Our system doesn't just accommodate differences - it celebrates them. One lesson becomes thirty personalized experiences. We call it No Child Left Behind and we mean it literally.

And your data - the sensitive, precious information about the children in your care? It never leaves your control. Ever. We built this with the same security standards as the NHS. Because trust isn't a feature; it's the foundation.

But here's what our users say matters most: Time. Time to actually sit with a struggling student. Time to call a worried parent back. Time to do the work that made you become an educational psychologist in the first place.

This isn't about working faster. It's about working on what actually matters.

Ready to see what's possible? Let's explore together.`
  },
  
  'data-autonomy-v2': {
    title: 'Data Autonomy & Trust',
    duration: '1:00',
    script: `Let me tell you about the elephant in every staffroom: data breaches. You've seen the headlines. Schools exposed. Student records leaked. Trust shattered.

Here's what kept me up at night: we ask families to share their children's most vulnerable moments - learning struggles, behavioral challenges, mental health concerns. That's sacred information.

So we built something different. Imagine your data is a family photo album - precious, irreplaceable, deeply personal. 

Most platforms? They want you to hand over the album. Trust them to keep it safe. Hope for the best.

We said no. 

With EdPsych Connect, you keep the album in your own vault. We provide the tools to organize it, search it, share what you choose. But the vault? The keys? Always yours.

It's called BYOD - Bring Your Own Database. Your Local Authority keeps complete control. We process; we never possess.

NHS-level encryption. GDPR compliant. But more than that - built by people who understand that behind every data point is a child who trusted us with their story.

Your trust. Our responsibility. That's not a tagline. That's our promise.`
  },
  
  'no-child-left-behind-v2': {
    title: 'No Child Left Behind',
    duration: '1:00',
    script: `Picture Mrs. Chen's Year 4 class. Thirty-two children. Thirty-two completely different minds.

There's Aiden, who thinks in pictures and gets lost in walls of text. Sofia, who needs instructions broken into bite-sized pieces or she freezes. Marcus, who's three years ahead in maths but struggles to sit still.

Traditional teaching asks Mrs. Chen to somehow create thirty-two lesson plans. That's not dedication - that's impossible.

So we asked: what if the technology did the heavy lifting?

Here's how it works. Mrs. Chen creates one lesson on fractions. She clicks a button. And something magical happens.

Aiden's version blooms with visual representations - fraction bars, pie charts, colour-coded steps. Sofia's version chunks the content into clear, numbered stages with check-boxes. Marcus gets extension challenges that let him race ahead while his classmates catch up.

Same learning objective. Same classroom. But every child - and I mean every child - gets a version designed for how their brain actually works.

We didn't call it No Child Left Behind as marketing. We called it that because we watched it happen. Child after child, clicking that lightbulb moment because finally - finally - the learning met them where they were.

That's not just differentiation. That's dignity.`
  },
  
  'gamification-integrity-v2': {
    title: 'Gamification Integrity',
    duration: '1:00',
    script: `I need to be honest with you about something. When I first heard gamification in education, I cringed. Really. Another gimmick to make learning fun while watering down rigour?

Then I watched a fourteen-year-old who hadn't engaged with any assessment in two years... complete a comprehensive emotional literacy evaluation. Because it felt like a game.

Here's the thing nobody tells you about reluctant learners: It's not that they can't engage. It's that traditional formats feel like traps. Another test. Another opportunity to fail. Another adult proving they're not good enough.

Games flip that script entirely. Low stakes. Immediate feedback. Progress you can see. Control over your own journey.

But here's where we drew an absolute line in the sand: Not. One. Compromise. On validity.

Every single game-based assessment on this platform captures the same clinical-grade data as traditional tools. The psychometric properties? Preserved. The research base? Intact. The diagnostic value? Identical.

We just wrapped it in something a fourteen-year-old would actually want to do.

Think of it like this: We didn't lower the mountain. We built a more inviting path to the summit.

The destination matters. But so does whether students are willing to start the journey.`
  }
};

// HeyGen configuration for warm, human delivery
const AVATAR_CONFIG = {
  // Looking for avatars that feel warm and approachable
  // Not corporate anchor types
  avatar_id: 'josh_lite3_20230714', // Will need to test different avatars
  avatar_style: 'normal',
};

// Voice configuration for natural British delivery
const VOICE_CONFIG = {
  voice_id: 'en-GB-RyanNeural', // British English, warm male
  // Alternative: 'en-GB-SoniaNeural' for female
};

// Background colors that feel inviting
const BACKGROUNDS: Record<string, string> = {
  'onboarding-welcome-v2': '#1e293b', // Slate-800 (navy gradient feel)
  'data-autonomy-v2': '#1e3a5f', // Deep blue
  'no-child-left-behind-v2': '#78350f', // Amber-900 warm
  'gamification-integrity-v2': '#064e3b', // Emerald-900
};

async function testApiKey(): Promise<boolean> {
  console.log('🔑 Testing API key...');
  
  try {
    const response = await fetch('https://api.heygen.com/v2/avatars', {
      headers: { 'X-Api-Key': API_KEY! },
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.error(`❌ API Error: ${data.error.message}`);
      return false;
    }
    
    console.log('✅ API key valid');
    return true;
  } catch (error) {
    console.error('❌ Connection error:', error);
    return false;
  }
}

async function generateVideo(videoId: string): Promise<string | null> {
  const script = PREMIUM_SCRIPTS[videoId as keyof typeof PREMIUM_SCRIPTS];
  if (!script) {
    console.error(`❌ Script not found: ${videoId}`);
    return null;
  }
  
  console.log(`\n📽️  Generating: ${script.title} (${script.duration})`);
  console.log(`📝 Script: ${script.script.substring(0, 100)}...`);
  
  const requestBody = {
    video_inputs: [{
      character: {
        type: 'avatar',
        ...AVATAR_CONFIG,
      },
      voice: {
        type: 'text',
        ...VOICE_CONFIG,
        input_text: script.script,
      },
      background: {
        type: 'color',
        value: BACKGROUNDS[videoId] || '#1e293b',
      },
    }],
    dimension: {
      width: 1920,
      height: 1080,
    },
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
    
    const data = await response.json();
    
    if (data.error) {
      console.error(`❌ Error: ${data.error.message}`);
      return null;
    }
    
    const heygenVideoId = data.data?.video_id;
    
    if (heygenVideoId) {
      console.log(`✅ Video ID: ${heygenVideoId}`);
      console.log(`🔗 Share: https://app.heygen.com/share/${heygenVideoId}`);
      console.log(`📺 Embed: https://app.heygen.com/embed/${heygenVideoId}`);
      return heygenVideoId;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Request failed:', error);
    return null;
  }
}

async function main() {
  console.log('═'.repeat(70));
  console.log('  EdPsych Connect - Premium Video Generator v2.0');
  console.log('  "Videos with Soul - Stories, Not Scripts"');
  console.log('═'.repeat(70));
  
  // Test API key first
  const keyValid = await testApiKey();
  if (!keyValid) {
    console.log('\n⚠️  API key issue detected.');
    console.log('Please verify your HeyGen API key at:');
    console.log('https://app.heygen.com/settings/api');
    process.exit(1);
  }
  
  // Log directory
  const logDir = path.join(__dirname, '../video_scripts/premium_v2');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  const results: Record<string, string> = {};
  
  // Generate each video
  for (const videoId of Object.keys(PREMIUM_SCRIPTS)) {
    const heygenId = await generateVideo(videoId);
    if (heygenId) {
      results[videoId] = heygenId;
      
      // Log success
      const logEntry = `${new Date().toISOString()} | SUCCESS | ${heygenId} | ${videoId}\n`;
      fs.appendFileSync(path.join(logDir, 'generation_log.txt'), logEntry);
    }
    
    // Rate limiting delay
    await new Promise(r => setTimeout(r, 2000));
  }
  
  // Summary
  console.log('\n' + '═'.repeat(70));
  console.log('  GENERATION SUMMARY');
  console.log('═'.repeat(70));
  console.log(`✅ Generated: ${Object.keys(results).length}/${Object.keys(PREMIUM_SCRIPTS).length}`);
  
  if (Object.keys(results).length > 0) {
    console.log('\n📋 Video IDs for heygen-video-urls.ts:');
    for (const [videoId, heygenId] of Object.entries(results)) {
      console.log(`  '${videoId}': '${heygenId}',`);
    }
  }
}

main().catch(console.error);
