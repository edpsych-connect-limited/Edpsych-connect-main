/**
 * Batch Video Generation Tool for EdPsych Connect - Dr Scott Persona
 * Generates all videos from the comprehensive V4 scripts (Dr Scott)
 * 
 * Run with: npx tsx tools/generate-dr-scott-videos.ts
 * Requires: HEYGEN_API_KEY environment variable
 */

import fs from 'fs';
import path from 'path';

// Import V4 scripts (Dr Scott Persona)
import { ALL_VIDEO_SCRIPTS } from '../video_scripts/world_class/comprehensive-video-scripts-v4-dr-scott';

const API_KEY = process.env.HEYGEN_API_KEY || 'sk_V2_hgu_kIsPOKnUIeM_Nvtt8QLs3osJMx3nQi5fYEytQNjhR4qM';
const API_URL = 'https://api.heygen.com/v2/video/generate';

// Configuration for Dr Scott (using Adrian Blue Shirt as proxy)
const CONFIG = {
  avatar: {
    id: '0d10345ca99840cdbd3103692ba55e27', // Dr Scott Custom Avatar
    style: 'normal'
  },
  voice: {
    id: 'aba5ce361bfa433480f4bf281cc4c4f9', // Oliver Bennett - Warm UK voice
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
        'X-Api-Key': API_KEY,
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
