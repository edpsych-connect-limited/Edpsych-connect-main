/**
 * Batch Video Generation Tool for EdPsych Connect - Dr Scott Persona
 * Generates all videos from the comprehensive V4 scripts (Dr Scott)
 * 
 * Run with: npx tsx tools/generate-dr-scott-videos.ts
 * Requires: HEYGEN_API_KEY, HEYGEN_DR_SCOTT_AVATAR_ID, HEYGEN_DR_SCOTT_VOICE_ID
 */

import fs from 'fs';
import path from 'path';

import { assertApprovedDrScottCasting } from './lib/dr-scott-heygen';

// Import V4 scripts (Dr Scott Persona)
import { ALL_VIDEO_SCRIPTS } from '../video_scripts/world_class/comprehensive-video-scripts-v4-dr-scott';

const API_KEY = process.env.HEYGEN_API_KEY;
const DR_SCOTT_AVATAR_ID = process.env.HEYGEN_DR_SCOTT_AVATAR_ID;
const DR_SCOTT_VOICE_ID = process.env.HEYGEN_DR_SCOTT_VOICE_ID;

if (!API_KEY) {
  throw new Error('HEYGEN_API_KEY environment variable is required');
}

if (!DR_SCOTT_AVATAR_ID) {
  throw new Error('HEYGEN_DR_SCOTT_AVATAR_ID environment variable is required');
}

if (!DR_SCOTT_VOICE_ID) {
  throw new Error('HEYGEN_DR_SCOTT_VOICE_ID environment variable is required');
}

assertApprovedDrScottCasting({
  avatarId: DR_SCOTT_AVATAR_ID,
  voiceId: DR_SCOTT_VOICE_ID,
  context: 'generate-dr-scott-videos',
});

const REQUIRED_API_KEY: string = API_KEY;
const API_URL = 'https://api.heygen.com/v2/video/generate';

// Configuration for Dr Scott (explicit IDs only; no proxy defaults)
const CONFIG = {
  avatar: {
    id: DR_SCOTT_AVATAR_ID,
    style: 'normal'
  },
  voice: {
    id: DR_SCOTT_VOICE_ID,
    speed: 1.0
  },
  background: {
    type: 'color',
    value: '#1e293b' // Dark professional slate
  },
  dimension: {
    width: 1920,
    height: 1080
  }
};

// Rate limiting - 5 seconds between requests
const RATE_LIMIT_MS = 5000;

interface VideoScript {
  id: string;
  title: string;
  duration: string;
  audience?: string;
  script: string;
}

interface GenerationResult {
  id: string;
  title: string;
  videoId?: string;
  status: 'success' | 'failed';
  error?: string;
}

async function generateVideo(script: VideoScript): Promise<GenerationResult> {
  const payload = {
    video_inputs: [{
      character: {
        type: 'avatar',
        avatar_id: CONFIG.avatar.id,
        avatar_style: CONFIG.avatar.style
      },
      voice: {
        type: 'text',
        input_text: script.script,
        voice_id: CONFIG.voice.id,
        speed: CONFIG.voice.speed
      },
      background: CONFIG.background
    }],
    dimension: CONFIG.dimension,
    aspect_ratio: '16:9',
    test: false,
    title: script.title,
    callback_url: 'https://edpsychconnect.com/webhook'
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'X-Api-Key': REQUIRED_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const result = await response.json() as { data?: { video_id?: string } };
    return {
      id: script.id,
      title: script.title,
      videoId: result.data?.video_id,
      status: 'success'
    };
  } catch (error: any) {
    return {
      id: script.id,
      title: script.title,
      status: 'failed',
      error: error.message
    };
  }
}

async function main() {
  console.log('🚀 Starting Dr Scott Video Generation...');
  console.log(`Avatar: ${CONFIG.avatar.id}`);
  console.log(`Voice: ${CONFIG.voice.id}`);

  const results: GenerationResult[] = [];
  
  // Flatten all scripts
  const allScripts: VideoScript[] = [];
  for (const [category, videos] of Object.entries(ALL_VIDEO_SCRIPTS)) {
    for (const [key, video] of Object.entries(videos)) {
      allScripts.push(video as VideoScript);
    }
  }

  console.log(`Found ${allScripts.length} videos to generate.`);

  for (const script of allScripts) {
    console.log(`\nGenerating: ${script.title} (${script.id})...`);
    const result = await generateVideo(script);
    
    if (result.status === 'success') {
      console.log(`✅ Success! Video ID: ${result.videoId}`);
    } else {
      console.error(`❌ Failed: ${result.error}`);
    }
    
    results.push(result);
    
    // Rate limit
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_MS));
  }

  // Save results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logPath = path.join(__dirname, `../logs/generation-dr-scott-${timestamp}.json`);
  
  // Ensure logs dir exists
  const logsDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  fs.writeFileSync(logPath, JSON.stringify(results, null, 2));
  console.log(`\n✨ Generation Complete! Log saved to: ${logPath}`);
  
  // Print summary
  const successCount = results.filter(r => r.status === 'success').length;
  const failCount = results.filter(r => r.status === 'failed').length;
  console.log(`Summary: ${successCount} succeeded, ${failCount} failed.`);
}

main().catch(console.error);
