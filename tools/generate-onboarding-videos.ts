/**
 * HeyGen Video Generator - Onboarding Videos
 * World Class Edition
 * 
 * Generates the 6 onboarding flow videos with storytelling quality
 * 
 * Usage: HEYGEN_API_KEY=your_key npx tsx tools/generate-onboarding-videos.ts
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

// Configuration - Same as marketing videos for consistency
const AVATAR_ID = 'Adrian_public_2_20240312'; // Adrian in Blue Suit
const VOICE_ID = '453c20e1525a429080e2ad9e4b26f2cd'; // Archer - full ID
const VOICE_LOCALE = 'en-GB';
const VIDEO_WIDTH = 1920;
const VIDEO_HEIGHT = 1080;

// Onboarding Scripts
const ONBOARDING_SCRIPTS: Record<string, { title: string; script: string }> = {
  'onboarding-welcome': {
    title: 'Welcome to Your EdPsych Connect Journey',
    script: `Hello! I'm so pleased you've decided to join us. Let me share something important before we begin.

You know that feeling when you walk into a new building for the first time? Everything looks a bit unfamiliar, you're not quite sure which corridor leads where, and you just want someone friendly to show you around? That's exactly what I'm here for.

EdPsych Connect World was built by educational professionals for educational professionals. Dr Scott Ighavongbe-Patrick created this platform because he watched too many brilliant colleagues drowning in paperwork when they should have been doing what they do best: transforming children's lives.

Over the next few minutes, I'll walk you through everything you need to know. We'll set up your profile, explore the tools that'll save you hours every week, and show you exactly how to hit the ground running.

But here's what I really want you to understand: this isn't just another platform to learn. This is your new headquarters. A place designed to make your work easier, your impact greater, and your days a little less overwhelming.

Ready to begin? Let's make this journey together.`
  },

  'onboarding-role-selection': {
    title: 'Choosing Your Role',
    script: `Right, let's get you properly set up. And this matters more than you might think.

Think of your role selection like choosing your adventure path. Are you an educational psychologist who needs comprehensive assessment tools and detailed reporting? A SENCO managing a whole school's additional needs provision? Perhaps a class teacher looking for practical strategies and differentiated resources? Or maybe you're a parent wanting to understand and support your child better?

Each role unlocks a different set of tools, resources, and workflows specifically designed for your needs. A SENCO dashboard looks very different from a parent portal, and that's intentional.

If you're wearing multiple hats, perhaps you're a teacher who also coordinates SEND, don't worry. You can access features from different roles. But your primary role shapes your home dashboard and the recommendations we'll make.

Take a moment to think about your main responsibilities. What do you spend most of your working day doing? That's likely your role.

Choose wisely, but don't overthink it. You can always adjust this later as your needs change.`
  },

  'onboarding-goals': {
    title: 'Setting Your Goals',
    script: `Now, let's talk about what you actually want to achieve. This is one of my favourite parts.

Goals might sound like corporate jargon, but they're really just a way for us to understand what success looks like for you. Some people come here desperate to reduce their report writing time. Others want to expand their intervention toolkit. Some are looking to upskill in specific areas like autism support or trauma-informed practice.

Here's why this matters: when you tell us your priorities, we can highlight the features that'll help you most. If you're drowning in EHCP paperwork, we'll show you our assessment-to-report workflow first. If you're keen on professional development, we'll guide you towards our training courses and CPD tracking.

Think of it like telling a sat-nav your destination. Without knowing where you want to go, we can only offer generic directions. But with clear goals, we can show you the fastest route to exactly where you need to be.

What's the one thing that would make your working life significantly better? Start there.`
  },

  'onboarding-platform-tour': {
    title: 'Your Platform Tour',
    script: `Let me show you around your new headquarters. I promise it'll take less time than making a cup of tea.

First, your Dashboard. This is mission control. Everything you need to see at a glance: upcoming assessments, pending reports, student progress alerts, and your professional development journey. It adapts to your role, so what you see is genuinely relevant.

On your left, the main navigation. Think of it as your toolkit drawer. Assessments, Interventions, Reports, Resources, and Training. Each section is designed to flow naturally into the next. Assess a student, find matching interventions, generate a report. It's all connected.

Now, here's something clever. The Search bar at the top isn't just for finding files. It's intelligent. Type anxiety strategies year three and it'll find assessments, interventions, resources, and research articles. Type a student's name and their complete profile appears.

Over here, your Notifications bell. This isn't spam. These are genuinely useful: assessment reminders, intervention reviews due, new resources matching your interests, and colleague collaboration requests.

Finally, your Profile. Settings, preferences, CPD log, and subscription details all live here.

The best way to learn is by exploring. Don't worry about breaking anything. We've designed everything to be intuitive. And if you ever get stuck, our help section has everything you need.`
  },

  'onboarding-knowledge-check': {
    title: 'Quick Knowledge Check',
    script: `Brilliant! You've made it through the tour. Before we set you loose, let's do a quick confidence check.

This isn't a test. There's no pass or fail, and honestly, the questions are quite straightforward. It's really just a way for us to confirm you've got the essentials covered.

If anything trips you up, that's actually useful information. It tells us where we might need to offer a bit more guidance. Think of it like those you are here maps in shopping centres. Sometimes you need to know where you're standing before you can navigate confidently.

Take your time with each question. If you're not sure, make your best guess. The answers aren't just marked right or wrong. We'll explain the reasoning behind each one.

Ready? Let's see what you've picked up.`
  },

  'onboarding-completion': {
    title: 'You\'re All Set!',
    script: `Congratulations! You've completed your onboarding. But honestly? This is where the real journey begins.

Here's what I want you to take away: this platform is designed to grow with you. Start with the features that address your most pressing needs. As you get comfortable, explore further. There's always something new to discover.

If you're feeling a bit overwhelmed, that's completely normal. You've just been introduced to a comprehensive toolkit. Nobody masters everything on day one. My advice? Pick one thing to try this week. Maybe run an assessment, explore an intervention strategy, or start a CPD module. Small steps lead to big transformations.

Remember, you're not alone in this. Our help centre has detailed guides for everything. Our training courses will deepen your skills. And our community is full of professionals just like you, sharing insights and supporting each other.

Thank you for choosing EdPsych Connect World. I genuinely believe it will make a positive difference to your work, and more importantly, to the children and families you support.

Now go on. Make some magic happen.`
  }
};

interface GeneratedVideo {
  id: string;
  videoId: string;
  title: string;
  embedUrl: string;
}

async function checkCredits(): Promise<number> {
  try {
    const response = await fetch('https://api.heygen.com/v2/user/remaining_quota', {
      method: 'GET',
      headers: { 'X-Api-Key': API_KEY! }
    });
    const data = await response.json();
    return data.data?.remaining_quota || 0;
  } catch {
    return 0;
  }
}

async function generateVideo(key: string, videoData: { title: string; script: string }): Promise<{ success: boolean; videoId?: string; error?: string }> {
  const payload = {
    video_inputs: [{
      character: {
        type: 'avatar',
        avatar_id: AVATAR_ID,
        avatar_style: 'normal',
      },
      voice: {
        type: 'text',
        input_text: videoData.script,
        voice_id: VOICE_ID,
        locale: VOICE_LOCALE,
        speed: 0.95, // Slightly slower for warmth
      },
      background: {
        type: 'color',
        value: '#1E293B', // Slate-800 for professional look
      }
    }],
    dimension: {
      width: VIDEO_WIDTH,
      height: VIDEO_HEIGHT
    },
    test: false, // Production quality
    title: videoData.title,
  };

  try {
    const response = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'X-Api-Key': API_KEY!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (data.error) {
      return { success: false, error: data.error.message || JSON.stringify(data.error) };
    }

    if (data.data?.video_id) {
      return { success: true, videoId: data.data.video_id };
    }

    return { success: false, error: 'No video ID returned' };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

async function main() {
  console.log('================================================================================');
  console.log('EdPsych Connect World - Onboarding Video Generation');
  console.log('================================================================================\n');
  
  console.log(`🎭 Avatar: Adrian in Blue Suit`);
  console.log(`🗣️  Voice: Archer with British English locale`);
  console.log(`🎬 Quality: ${VIDEO_WIDTH}x${VIDEO_HEIGHT} HD\n`);

  const credits = await checkCredits();
  console.log(`💰 Available credits: ${credits}`);
  
  if (credits < 1000) {
    console.log('\n⚠️  Warning: Low credits. Some videos may not generate.');
  }
  
  const results: GeneratedVideo[] = [];
  const errors: Array<{ key: string; title: string; error: string }> = [];
  
  console.log('\n================================================================================');
  console.log('Generating Onboarding Videos');
  console.log('================================================================================\n');
  
  for (const [key, videoData] of Object.entries(ONBOARDING_SCRIPTS)) {
    console.log(`📽️  Generating: ${videoData.title}`);
    console.log(`   Script length: ${videoData.script.length} characters`);
    
    const result = await generateVideo(key, videoData);
    
    if (result.success && result.videoId) {
      console.log(`   ✅ Success! Video ID: ${result.videoId}`);
      console.log(`   🔗 Embed: https://app.heygen.com/embed/${result.videoId}\n`);
      results.push({
        id: key,
        videoId: result.videoId,
        title: videoData.title,
        embedUrl: `https://app.heygen.com/embed/${result.videoId}`
      });
    } else {
      console.log(`   ❌ Error: ${result.error}\n`);
      errors.push({ key, title: videoData.title, error: result.error || 'Unknown error' });
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Summary
  console.log('================================================================================');
  console.log('GENERATION SUMMARY');
  console.log('================================================================================');
  console.log(`✅ Successful: ${results.length}`);
  console.log(`❌ Failed: ${errors.length}\n`);
  
  if (results.length > 0) {
    console.log('Generated Video IDs:');
    results.forEach(r => {
      console.log(`  ${r.id}: ${r.videoId}`);
    });
  }
  
  // Save results
  const logDir = path.join(__dirname, '..', 'video_scripts', 'world_class');
  
  // Update log file
  const logContent = `
Onboarding Video Generation - ${new Date().toISOString()}
========================================
${results.map(r => `${r.id}: ${r.videoId} (${r.title})`).join('\n')}
${errors.length > 0 ? '\nErrors:\n' + errors.map(e => `${e.key}: ${e.error}`).join('\n') : ''}
`;
  fs.appendFileSync(path.join(logDir, 'generation_log.txt'), logContent);
  
  // Generate TypeScript mapping for onboarding videos
  const tsContent = `// Onboarding Video IDs - Generated ${new Date().toISOString()}
export const ONBOARDING_VIDEO_IDS = {
${results.map(r => `  '${r.id}': '${r.videoId}',`).join('\n')}
} as const;

export const ONBOARDING_EMBED_URLS = {
${results.map(r => `  '${r.id}': '${r.embedUrl}',`).join('\n')}
} as const;
`;
  fs.writeFileSync(path.join(logDir, 'onboarding-video-ids.ts'), tsContent);
  
  console.log(`\n📁 Log updated: ${path.join(logDir, 'generation_log.txt')}`);
  console.log(`📁 TypeScript mapping saved: ${path.join(logDir, 'onboarding-video-ids.ts')}`);
}

main().catch(console.error);
