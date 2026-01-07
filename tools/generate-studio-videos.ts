/**
 * Generate Studio Overview Videos via HeyGen API
 *
 * Scenarios:
 * 1. Clinical Studio Overview
 * 2. Engagement Studio Overview
 * 3. Classroom Studio Overview
 * 4. Admin Studio Overview
 */

import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { pickApprovedDrScottAvatarId, pickRequiredDrScottVoiceId } from './lib/dr-scott-heygen';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnvForGenerator(): void {
  const mode = (process.env.NODE_ENV || 'development').toLowerCase();
  const root = path.join(__dirname, '..');
  const candidates: string[] = [
    `.env.${mode}.local`,
    ...(mode === 'test' ? [] : ['.env.local']),
    `.env.${mode}`,
    '.env',
  ];

  for (const rel of candidates) {
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs)) continue;
    const result = dotenv.config({ path: abs, override: false });
  }
}

loadEnvForGenerator();

const API_KEY: string = process.env.HEYGEN_API_KEY || '';
if (!API_KEY) {
  console.error('❌ Error: HEYGEN_API_KEY environment variable is not set.');
  process.exit(1);
}

const rawAvatarId = process.env.HEYGEN_DR_SCOTT_AVATAR_ID || '';
const rawVoiceId = process.env.HEYGEN_DR_SCOTT_VOICE_ID || '';

if (!rawAvatarId || !rawVoiceId) {
  throw new Error('HEYGEN_DR_SCOTT_AVATAR_ID and HEYGEN_DR_SCOTT_VOICE_ID environment variables are required');
}

const AVATAR_ID = pickApprovedDrScottAvatarId(rawAvatarId, 'generate-studio-videos');
const VOICE_ID = pickRequiredDrScottVoiceId(rawVoiceId, 'generate-studio-videos');

const VIDEOS = [
  {
    key: 'clinical-studio-overview',
    title: 'Clinical Studio Overview',
    script: `Welcome to the Clinical Studio. I'm Dr Scott I-Patrick. This is your statutory command centre for EHCP management, assessments, and case files. Here, we operationalise the Code of Practice. You can track statutory timelines, manage multi-agency contributions, and generate high-fidelity reports that stand up to tribunal scrutiny. Security and audit trails are built-in, ensuring every decision is evidenced.`
  },
  {
    key: 'engagement-studio-overview',
    title: 'Engagement Studio Overview',
    script: `Welcome to the Engagement Studio. Motivation is the engine of progress. This studio brings together our Tokenisation and Gamification systems. You can configure reward schedules, track engagement metrics, and deploy AI companions to support learning journeys. It's about turning passive participation into active ownership.`
  },
  {
    key: 'classroom-studio-overview',
    title: 'Classroom Studio Overview',
    script: `Welcome to the Classroom Studio. This is where strategy meets practice. For teachers and SENCOs, this workspace provides real-time behaviour tracking, intervention logging, and progress monitoring. It connects the dots between the statutory plan and the daily reality of the classroom.`
  },
  {
    key: 'admin-studio-overview',
    title: 'Admin Studio Overview',
    script: `Welcome to the Admin Studio. This is the control tower for Local Authorities and School Leaders. From here, you manage institutional settings, compliance audits, and user permissions. It provides a macroscopic view of your entire educational estate, ensuring data autonomy and operational integrity.`
  }
];

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

async function generateSingleVideo(video: { key: string; title: string; script: string }) {
  console.log(`🎬 Generating: ${video.title} (${video.key})`);
  console.log(`📝 Script length: ${video.script.length} characters`);

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
          input_text: video.script,
        },
        background: {
          type: 'color',
          value: '#1e293b',
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
      console.error(`❌ FAILED: ${video.key}`, data.error);
      return null;
    }

    const videoId = data.data?.video_id;
    if (videoId) {
      console.log(`✅ SUCCESS: ${video.key} -> ${videoId}`);
      return { key: video.key, id: videoId };
    } else {
      console.error(`❌ FAILED: No video ID returned for ${video.key}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ ERROR: ${video.key}`, error);
    return null;
  }
}

async function run() {
  console.log('='.repeat(80));
  console.log('EdPsych Connect - Studio Video Generator');
  console.log('='.repeat(80));

  const results = [];

  for (const video of VIDEOS) {
    const result = await generateSingleVideo(video);
    if (result) {
      results.push(result);
    }
    // Wait 2 seconds to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n\n' + '='.repeat(80));
  console.log('GENERATION COMPLETE');
  console.log('Update src/lib/training/heygen-video-urls.ts with these IDs:');
  console.log('='.repeat(80));
  
  results.forEach(r => {
    console.log(`  "${r.key}": "${r.id}",`);
  });
}

run().catch(console.error);
