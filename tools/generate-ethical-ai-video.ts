import { ADDITIONAL_V4_SCRIPTS } from '../video_scripts/world_class/additional-scripts-v4-dr-scott';
import { loadLocalEnv } from './lib/load-local-env';
import { pickApprovedDrScottAvatarId, pickRequiredDrScottVoiceId } from './lib/dr-scott-heygen';

loadLocalEnv({ rootDir: process.cwd(), silent: true });

const API_KEY = process.env.HEYGEN_API_KEY || '';
if (!API_KEY) {
  console.error('HEYGEN_API_KEY is missing.');
  process.exit(1);
}

const avatarId = pickApprovedDrScottAvatarId(
  process.env.HEYGEN_DR_SCOTT_AVATAR_ID || '',
  'generate-ethical-ai-video'
);
const voiceId = pickRequiredDrScottVoiceId(
  process.env.HEYGEN_DR_SCOTT_VOICE_ID || '',
  'generate-ethical-ai-video'
);

const key = 'ethical-ai-oversight';
const scriptEntry = (ADDITIONAL_V4_SCRIPTS as Record<string, { title: string; script: string }>)[key];
if (!scriptEntry) {
  console.error(`Missing script for key: ${key}`);
  process.exit(1);
}

async function generateVideo() {
  const payload = {
    video_inputs: [
      {
        character: {
          type: 'avatar',
          avatar_id: avatarId,
          avatar_style: 'normal',
        },
        voice: {
          type: 'text',
          voice_id: voiceId,
          input_text: scriptEntry.script,
        },
        background: {
          type: 'color',
          value: '#111827',
        },
      },
    ],
    dimension: {
      width: 1920,
      height: 1080,
    },
    aspect_ratio: '16:9',
    test: false,
    title: scriptEntry.title,
  };

  const response = await fetch('https://api.heygen.com/v2/video/generate', {
    method: 'POST',
    headers: {
      'X-Api-Key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HeyGen API error: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as { error?: { message?: string }; data?: { video_id?: string } };
  if (data.error) {
    throw new Error(`HeyGen response error: ${data.error.message || 'unknown error'}`);
  }

  const videoId = data.data?.video_id;
  if (!videoId) {
    throw new Error('HeyGen response missing video_id');
  }

  console.log(`HeyGen Video ID: ${videoId}`);
  console.log(`Share URL: https://app.heygen.com/share/${videoId}`);
}

generateVideo().catch((error) => {
  console.error(`Failed to generate ethical AI video: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
