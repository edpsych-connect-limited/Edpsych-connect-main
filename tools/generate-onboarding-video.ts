/**
 * Generate Onboarding Welcome Video via HeyGen API
 *
 * IMPORTANT (truth-by-code):
 * - This script must only make claims that are true in the current product.
 * - Avoid hard numbers/time guarantees unless they are enforced by code + measured.
 * - If the script claims a real-person identity (e.g. "I'm Dr Scott…"), the
 *   avatar + voice MUST match the approved IDs.
 */

// Load local environment variables (e.g. HEYGEN_API_KEY) from .env files.
// NOTE:
// - Next.js loads multiple env files (e.g. .env.local, .env.development.local).
// - This generator is a standalone Node script, so we mirror that precedence
//   to avoid the common “key is in .env.local but the script can’t see it” issue.
// - These files are git-ignored; do not commit real secrets.
import dotenv from 'dotenv';

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { assertApprovedDrScottCasting, REQUIRED_DR_SCOTT_VOICE_ID } from './lib/dr-scott-heygen';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnvForGenerator(): void {
  // Align with Next.js env loading (simplified):
  //   .env.{mode}.local
  //   .env.local              (except test)
  //   .env.{mode}
  //   .env
  // We do NOT override already-set process.env values.
  const mode = (process.env.NODE_ENV || 'development').toLowerCase();
  const root = path.join(__dirname, '..');

  const candidates: string[] = [
    `.env.${mode}.local`,
    ...(mode === 'test' ? [] : ['.env.local']),
    `.env.${mode}`,
    '.env',
  ];

  const loaded: string[] = [];
  for (const rel of candidates) {
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs)) continue;
    const result = dotenv.config({ path: abs, override: false });
    if (!result.error) loaded.push(rel);
  }

  // Safe diagnostics: never print secret values.
  if (loaded.length > 0) {
    console.log(`🔐 Loaded env files: ${loaded.join(', ')}`);
  } else {
    console.log('🔐 Loaded env files: (none found)');
  }
}

loadEnvForGenerator();

const API_KEY: string = process.env.HEYGEN_API_KEY || '';
if (!API_KEY) {
  console.error('❌ Error: HEYGEN_API_KEY environment variable is not set.');
  console.log(
    'Set HEYGEN_API_KEY in your shell or in one of: .env.local / .env.development.local / .env, then re-run.'
  );
  console.log('Usage: npx tsx tools/generate-onboarding-video.ts');
  process.exit(1);
}

// HeyGen Avatar and Voice Configuration
// IMPORTANT (truth-by-code): if the script claims to be a real person (e.g. "I'm Dr Scott…"),
// the avatar + voice MUST match the approved IDs for that presenter.
//
// Dr Scott (enterprise-approved allowlist)
const AVATAR_ID = process.env.HEYGEN_DR_SCOTT_AVATAR_ID || '';
const VOICE_ID = process.env.HEYGEN_DR_SCOTT_VOICE_ID || '';

if (!AVATAR_ID) {
  throw new Error('HEYGEN_DR_SCOTT_AVATAR_ID environment variable is required');
}

if (!VOICE_ID) {
  throw new Error('HEYGEN_DR_SCOTT_VOICE_ID environment variable is required');
}

assertApprovedDrScottCasting({
  avatarId: AVATAR_ID,
  voiceId: VOICE_ID,
  context: 'generate-onboarding-video',
});

// Onboarding script (keep accurate, durable, and claim-safe).
// Avoid hard numbers and performance guarantees; refer to capabilities in the feature catalog.
const ONBOARDING_SCRIPT = `Welcome to EdPsych Connect World. I'm Dr Scott I-Patrick.

This is an all-in-one workspace for educational psychology and SEND collaboration, built around a simple principle: if we claim it, we can prove it.

In a couple of minutes, here’s what you can do today.

First: onboarding and role setup. We tailor the experience to your role, so you can get to the parts of the platform you actually need.

Second: assessments and reporting. You can create assessment instances, capture structured inputs, collaborate where appropriate, and generate reports from real saved data — with clear links back to the underlying evidence.

Third: EHCP and casework workflows. You can organise case records, contribute evidence, and support core EHCP processes — including modules designed for clarity, consistency, and auditability.

Fourth: multi-agency collaboration. Parents, teachers, and professionals can contribute through dedicated portal routes and collaboration flows, so information is gathered once and stays connected to the right case.

And for institutions: data autonomy. EdPsych Connect supports institution-managed configurations, including Bring Your Own Database options, so organisations can retain control over where data lives.

Across the platform, we use privacy-aware, role-based workflows designed to support GDPR obligations.

Now, click Continue to finish your profile, open your dashboard, and start with a workflow that matches your goal — an assessment, a report, an EHCP task, or a collaboration request.

Welcome to EdPsych Connect World.`;

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

function assertNoUnverifiedIdentityClaims(params: {
  script: string;
  avatarId: string;
  voiceId: string;
}): void {
  const script = params.script.toLowerCase();

  // Guardrail: prevent generating a video that claims to be Dr Scott unless
  // the approved Dr Scott avatar + voice are used.
  const claimsDrScott =
    script.includes("i'm dr scott") ||
    script.includes('im dr scott') ||
    script.includes('i am dr scott') ||
    script.includes('dr scott i-patrick') ||
    script.includes('dr scott');

  if (claimsDrScott) {
    // The allowlist check already enforces the approved avatar IDs + required voice.
    // Keep this secondary guard to make the intent explicit for operators.
    if (params.voiceId !== REQUIRED_DR_SCOTT_VOICE_ID) {
      throw new Error(
        `Unverified identity claim blocked: script references Dr Scott but voiceId is not the approved Dr Scott voice. voiceId=${params.voiceId}`
      );
    }
  }
}

async function generateVideo(): Promise<void> {
  console.log('='.repeat(80));
  console.log('EdPsych Connect - Onboarding Video Generator');
  console.log('='.repeat(80));
  console.log('');
  console.log('📽️  Generating 2-minute platform introduction video...');
  console.log(`🎭 Avatar ID: ${AVATAR_ID} (Dr Scott)`);
  console.log(`🗣️  Voice ID: ${VOICE_ID} (Dr Scott)`);
  console.log(`📝 Script length: ${ONBOARDING_SCRIPT.length} characters`);
  console.log('');

  // Governance guardrail: refuse to generate if identity claims and IDs don't match.
  assertNoUnverifiedIdentityClaims({
    script: ONBOARDING_SCRIPT,
    avatarId: AVATAR_ID,
    voiceId: VOICE_ID,
  });

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
