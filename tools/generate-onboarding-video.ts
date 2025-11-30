/**
 * Generate Onboarding Welcome Video via HeyGen API
 * 
 * This script generates a 2-minute comprehensive platform introduction video
 * featuring Dr Scott I-Patrick as the AI presenter.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.HEYGEN_API_KEY;
if (!API_KEY) {
  console.error('❌ Error: HEYGEN_API_KEY environment variable is not set.');
  console.log('Usage: HEYGEN_API_KEY=your_key npx tsx tools/generate-onboarding-video.ts');
  process.exit(1);
}

// HeyGen Avatar and Voice Configuration
// Using a professional male avatar for Dr Scott I-Patrick
const AVATAR_ID = 'josh_lite3_20230714'; // Professional male avatar
const VOICE_ID = 'en-GB-RyanNeural'; // British English male voice

// The complete 2-minute onboarding script
const ONBOARDING_SCRIPT = `Welcome to EdPsych Connect World. I'm Dr Scott I-Patrick, and in the next two minutes, I'll show you why educational psychology professionals across the UK are calling this platform transformational.

First, let's talk about what makes us different. We're not just another EdTech tool. We're a complete ecosystem designed by educational psychologists, for educational psychologists. Every feature, every workflow, every assessment was built with one mission: making your expertise reach further, faster, and with greater impact.

Let me show you three things that will change how you work.

Number one: Evidence-based assessments at your fingertips. Our platform includes over fifty validated assessment templates, from cognitive screenings to social-emotional evaluations. Each one is backed by peer-reviewed research and adapted for the UK context. No more recreating the wheel. No more hunting through folders. Everything you need is organized, standardized, and ready to use.

Number two: The 'No Child Left Behind' engine. This is our flagship innovation. When you create a lesson or intervention plan, our AI automatically generates differentiated versions for every learner profile. Dyslexia-friendly fonts for Sam. Chunked instructions for Mia. Visual supports for Leo. One plan becomes thirty personalized experiences in seconds.

Number three: Data autonomy and trust. We know you handle the most sensitive student information. That's why we built our platform with BYOD architecture - Bring Your Own Database. Your Local Authority retains complete control. We process; we never hoard. NHS-level encryption, GDPR compliant, and you keep the keys to your data.

But here's what our users love most: the time savings. Tasks that took hours now take minutes. Assessment reports that required three days of writing? Generated in thirty seconds. Multi-agency collaboration that meant endless email chains? Streamlined into a single secure workspace.

The result? More time with students. More impact per case. More families supported. More children thriving.

This isn't just software. It's a movement to transform educational psychology practice. And you're now part of it.

Ready to explore? Your personalized dashboard is waiting. Click 'Continue' to complete your profile and discover features tailored exactly to your role.

Welcome to the future of educational psychology. Welcome to EdPsych Connect World.`;

interface HeyGenVideoRequest {
  video_inputs: Array<{
    character: {
      type: string;
      avatar_id: string;
      avatar_style?: string;
    };
    voice: {
      type: string;
      voice_id: string;
      input_text: string;
    };
    background?: {
      type: string;
      value?: string;
    };
  }>;
  dimension?: {
    width: number;
    height: number;
  };
  aspect_ratio?: string;
  test?: boolean;
}

async function generateVideo(): Promise<void> {
  console.log('='.repeat(80));
  console.log('EdPsych Connect - Onboarding Video Generator');
  console.log('='.repeat(80));
  console.log('');
  console.log('📽️  Generating 2-minute platform introduction video...');
  console.log('🎭 Avatar: Professional Male (Dr Scott I-Patrick)');
  console.log('🗣️  Voice: British English (Ryan Neural)');
  console.log(`📝 Script length: ${ONBOARDING_SCRIPT.length} characters`);
  console.log('');

  const requestBody: HeyGenVideoRequest = {
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
          input_text: ONBOARDING_SCRIPT,
        },
        background: {
          type: 'color',
          value: '#1e293b', // Slate-800 to match platform branding
        },
      },
    ],
    dimension: {
      width: 1920,
      height: 1080,
    },
    aspect_ratio: '16:9',
  };

  try {
    console.log('📤 Sending request to HeyGen API...');
    
    const response = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'X-Api-Key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('❌ API Error:', data.error);
      
      // Log for retry
      const logPath = path.join(__dirname, '../video_scripts/onboarding/generation_log.txt');
      const logEntry = `${new Date().toISOString()} | FAILED | ${JSON.stringify(data.error)} | Onboarding - Platform Introduction\n`;
      fs.appendFileSync(logPath, logEntry);
      
      return;
    }

    const videoId = data.data?.video_id;
    
    if (videoId) {
      console.log('✅ Video generation started!');
      console.log(`📹 Video ID: ${videoId}`);
      console.log(`🔗 Share URL: https://app.heygen.com/share/${videoId}`);
      console.log(`🖼️  Embed URL: https://app.heygen.com/embed/${videoId}`);
      
      // Save to generation log
      const logPath = path.join(__dirname, '../video_scripts/onboarding/generation_log.txt');
      const logEntry = `${new Date().toISOString()} | SUCCESS | ${videoId} | Onboarding - Platform Introduction - Complete 2-Minute Overview\n`;
      fs.appendFileSync(logPath, logEntry);
      
      // Update the heygen-video-urls.ts file
      console.log('');
      console.log('📝 To add this video to the platform, add this to heygen-video-urls.ts:');
      console.log(`   'onboarding-welcome': '${videoId}',`);
      
    } else {
      console.error('❌ No video ID received');
      console.log('Response:', JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

generateVideo().catch(console.error);
