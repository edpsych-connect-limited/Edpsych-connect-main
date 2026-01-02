/**
 * December 2025 Video Generation Script
 * Generates 42 new videos via HeyGen API:
 * - 27 Pricing/Feature videos
 * - 15 Role-based onboarding videos
 * 
 * Run with: npx tsx tools/generate-december-2025-videos.ts
 * 
 * API Key should be in environment: HEYGEN_API_KEY
 * Or use the development key for testing
 */

import fs from 'fs';
import path from 'path';

// Import video scripts
import { DECEMBER_2025_PRICING_VIDEOS } from '../video_scripts/world_class/december-2025-pricing-videos';
import { ROLE_BASED_ONBOARDING } from '../video_scripts/world_class/role-based-onboarding-videos';
import { assertApprovedDrScottCasting } from './lib/dr-scott-heygen';

// HeyGen API Configuration
const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

if (!HEYGEN_API_KEY) {
  throw new Error('HEYGEN_API_KEY environment variable is required');
}

const REQUIRED_HEYGEN_API_KEY: string = HEYGEN_API_KEY;
const HEYGEN_API_URL = 'https://api.heygen.com/v2/video/generate';

// Avatar and Voice Configuration - UK Professional Style
const AVATAR_ID = process.env.HEYGEN_DR_SCOTT_AVATAR_ID || '';
const VOICE_ID = process.env.HEYGEN_DR_SCOTT_VOICE_ID || '';

// Validate casting (Truth-by-code enforcement)
try {
  assertApprovedDrScottCasting({
    avatarId: AVATAR_ID,
    voiceId: VOICE_ID,
    context: 'generate-december-2025-videos'
  });
} catch (error: any) {
  console.error('❌ Dr Scott Identity Verification Failed:', error.message);
  process.exit(1);
}

const CONFIG = {
  avatar: {
    id: AVATAR_ID,
    style: 'normal'
  },
  voice: {
    id: VOICE_ID,
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

// Rate limiting - 5 seconds between requests to respect API limits
const RATE_LIMIT_MS = 5000;

interface VideoScript {
  id: string;
  title: string;
  duration: string;
  script: string;
  audience?: string;
  placement?: string[];
  role?: string;
  sequence?: number;
}

interface GenerationResult {
  id: string;
  title: string;
  videoId?: string;
  status: 'success' | 'failed' | 'pending';
  error?: string;
  timestamp: string;
}

// Extract all video scripts into flat array
function getAllScripts(): VideoScript[] {
  const scripts: VideoScript[] = [];

  // Add pricing videos
  const pricingCategories = [
    DECEMBER_2025_PRICING_VIDEOS.valueProposition,
    DECEMBER_2025_PRICING_VIDEOS.tierPricing,
    DECEMBER_2025_PRICING_VIDEOS.addons,
    DECEMBER_2025_PRICING_VIDEOS.features,
    DECEMBER_2025_PRICING_VIDEOS.comparison,
    DECEMBER_2025_PRICING_VIDEOS.trust,
  ];

  for (const category of pricingCategories) {
    for (const video of Object.values(category)) {
      scripts.push(video as VideoScript);
    }
  }

  // Add onboarding videos
  const onboardingCategories = [
    ROLE_BASED_ONBOARDING.teacher,
    ROLE_BASED_ONBOARDING.senco,
    ROLE_BASED_ONBOARDING.educationalPsychologist,
    ROLE_BASED_ONBOARDING.parent,
    ROLE_BASED_ONBOARDING.localAuthority,
  ];

  for (const category of onboardingCategories) {
    for (const video of Object.values(category)) {
      scripts.push(video as VideoScript);
    }
  }

  return scripts;
}

async function generateVideo(script: VideoScript): Promise<GenerationResult> {
  const timestamp = new Date().toISOString();
  
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
    callback_url: 'https://edpsychconnect.com/api/webhook/heygen'
  };

  try {
    console.log(`  📤 Submitting: ${script.title}`);
    
    const response = await fetch(HEYGEN_API_URL, {
      method: 'POST',
      headers: {
        'X-Api-Key': REQUIRED_HEYGEN_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const result = await response.json() as { data?: { video_id?: string } };
    
    if (result.data?.video_id) {
      return {
        id: script.id,
        title: script.title,
        videoId: result.data.video_id,
        status: 'pending', // Videos are pending until HeyGen completes rendering
        timestamp
      };
    } else {
      throw new Error('No video_id in response');
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      id: script.id,
      title: script.title,
      status: 'failed',
      error: errorMessage,
      timestamp
    };
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('');
  console.log('🎬 ═══════════════════════════════════════════════════════════════');
  console.log('   EdPsych Connect - December 2025 Video Generation');
  console.log('   World Class Enterprise Grade - Zero Touch Self-Service');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('');

  if (!HEYGEN_API_KEY || HEYGEN_API_KEY === '') {
    console.error('❌ HEYGEN_API_KEY environment variable is required');
    console.error('   Set it with: export HEYGEN_API_KEY="your-key-here"');
    process.exit(1);
  }

  console.log('✅ API Key configured');
  console.log(`🎭 Avatar: ${CONFIG.avatar.id}`);
  console.log(`🎙️  Voice: Oliver Bennett (UK)`);
  console.log(`📐 Resolution: ${CONFIG.dimension.width}x${CONFIG.dimension.height}`);
  console.log('');

  const allScripts = getAllScripts();
  const totalVideos = allScripts.length;
  
  console.log(`📊 Total videos to generate: ${totalVideos}`);
  console.log(`⏱️  Estimated API submission time: ~${Math.ceil((totalVideos * RATE_LIMIT_MS) / 60000)} minutes`);
  console.log(`📦 Note: HeyGen rendering takes 2-5 minutes per video after submission`);
  console.log('');

  // Group videos by category for clearer logging
  const categories = {
    'Value Proposition': allScripts.filter(s => s.id.startsWith('value-')),
    'Tier Pricing': allScripts.filter(s => s.id.startsWith('tier-')),
    'Add-ons': allScripts.filter(s => s.id.startsWith('addon-')),
    'Features': allScripts.filter(s => s.id.startsWith('feature-')),
    'Comparison': allScripts.filter(s => s.id.startsWith('compare-')),
    'Trust': allScripts.filter(s => s.id.startsWith('trust-')),
    'Onboarding - Teacher': allScripts.filter(s => s.id.startsWith('onboard-teacher-')),
    'Onboarding - SENCO': allScripts.filter(s => s.id.startsWith('onboard-senco-')),
    'Onboarding - EP': allScripts.filter(s => s.id.startsWith('onboard-ep-')),
    'Onboarding - Parent': allScripts.filter(s => s.id.startsWith('onboard-parent-')),
    'Onboarding - LA': allScripts.filter(s => s.id.startsWith('onboard-la-')),
  };

  console.log('📁 Videos by category:');
  for (const [name, scripts] of Object.entries(categories)) {
    console.log(`   ${name}: ${scripts.length} videos`);
  }
  console.log('');

  // Confirm before proceeding
  console.log('⚠️  Ready to submit videos to HeyGen API.');
  console.log('   Press Ctrl+C within 5 seconds to cancel...');
  await sleep(5000);

  console.log('');
  console.log('🚀 Starting video generation...');
  console.log('─'.repeat(70));

  const results: GenerationResult[] = [];
  const videoIds: Record<string, string> = {};
  let successCount = 0;
  let failCount = 0;

  for (const [categoryName, scripts] of Object.entries(categories)) {
    if (scripts.length === 0) continue;
    
    console.log('');
    console.log(`📂 ${categoryName}`);
    console.log('─'.repeat(40));

    for (let i = 0; i < scripts.length; i++) {
      const script = scripts[i];
      const overallIndex = results.length + 1;
      
      console.log(`[${overallIndex}/${totalVideos}] ${script.title}`);
      
      const result = await generateVideo(script);
      results.push(result);

      if (result.status === 'pending' && result.videoId) {
        videoIds[result.id] = result.videoId;
        successCount++;
        console.log(`    ✅ Submitted: ${result.videoId}`);
      } else {
        failCount++;
        console.log(`    ❌ Failed: ${result.error}`);
      }

      // Rate limiting between requests
      if (overallIndex < totalVideos) {
        process.stdout.write(`    ⏳ Waiting ${RATE_LIMIT_MS/1000}s...`);
        await sleep(RATE_LIMIT_MS);
        process.stdout.write(' ✓\n');
      }
    }
  }

  // Generation Summary
  console.log('');
  console.log('═'.repeat(70));
  console.log('📊 GENERATION SUMMARY');
  console.log('═'.repeat(70));
  console.log(`✅ Submitted successfully: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log('');

  if (failCount > 0) {
    console.log('⚠️  Failed videos:');
    const failed = results.filter(r => r.status === 'failed');
    for (const f of failed) {
      console.log(`   - ${f.title}`);
      console.log(`     Error: ${f.error}`);
    }
    console.log('');
  }

  // Save video IDs to TypeScript file for integration
  const outputPath = path.join(process.cwd(), 'video_scripts', 'world_class', 'december-2025-video-ids.ts');
  const tsContent = `/**
 * December 2025 Video IDs - Auto-generated
 * Generated: ${new Date().toISOString()}
 * 
 * These IDs are returned from HeyGen API and represent pending/processing videos.
 * Videos typically take 2-5 minutes to render after submission.
 * 
 * Use these IDs to:
 * 1. Check video status: GET https://api.heygen.com/v1/video_status.get?video_id={id}
 * 2. Embed videos: https://app.heygen.com/embed/{id}
 * 3. Share videos: https://app.heygen.com/share/{id}
 */

export const DECEMBER_2025_VIDEO_IDS: Record<string, string> = ${JSON.stringify(videoIds, null, 2)};

// Helper functions
export function getEmbedUrl(videoKey: string): string | null {
  const videoId = DECEMBER_2025_VIDEO_IDS[videoKey];
  return videoId ? \`https://app.heygen.com/embed/\${videoId}\` : null;
}

export function getShareUrl(videoKey: string): string | null {
  const videoId = DECEMBER_2025_VIDEO_IDS[videoKey];
  return videoId ? \`https://app.heygen.com/share/\${videoId}\` : null;
}

// Integration with main video URLs file
export function getLocalVideoPath(videoKey: string): string {
  // Define category based on video key prefix
  let category = 'pricing';
  if (videoKey.startsWith('onboard-teacher')) category = 'onboarding/teacher';
  else if (videoKey.startsWith('onboard-senco')) category = 'onboarding/senco';
  else if (videoKey.startsWith('onboard-ep')) category = 'onboarding/ep';
  else if (videoKey.startsWith('onboard-parent')) category = 'onboarding/parent';
  else if (videoKey.startsWith('onboard-la')) category = 'onboarding/la';
  else if (videoKey.startsWith('value-')) category = 'pricing/value';
  else if (videoKey.startsWith('tier-')) category = 'pricing/tiers';
  else if (videoKey.startsWith('addon-')) category = 'pricing/addons';
  else if (videoKey.startsWith('feature-')) category = 'pricing/features';
  else if (videoKey.startsWith('compare-')) category = 'pricing/comparison';
  else if (videoKey.startsWith('trust-')) category = 'pricing/trust';
  
  return \`/content/training_videos/\${category}/\${videoKey}.mp4\`;
}

// Video count summary
export const VIDEO_COUNTS = {
  total: ${Object.keys(videoIds).length},
  pricing: ${Object.keys(videoIds).filter(k => !k.startsWith('onboard-')).length},
  onboarding: ${Object.keys(videoIds).filter(k => k.startsWith('onboard-')).length},
  generated: '${new Date().toISOString()}'
};
`;

  fs.writeFileSync(outputPath, tsContent);
  console.log(`📄 Video IDs saved to: ${outputPath}`);

  // Save detailed log
  const logPath = path.join(process.cwd(), 'video_scripts', 'world_class', 'december-2025-generation-log.json');
  const logContent = {
    generatedAt: new Date().toISOString(),
    config: CONFIG,
    summary: {
      total: totalVideos,
      submitted: successCount,
      failed: failCount
    },
    results: results
  };
  fs.writeFileSync(logPath, JSON.stringify(logContent, null, 2));
  console.log(`📝 Full log saved to: ${logPath}`);

  // Create video status check script
  const statusScriptPath = path.join(process.cwd(), 'tools', 'check-december-2025-video-status.ts');
  const statusScript = `/**
 * Check status of December 2025 videos
 * Run with: npx tsx tools/check-december-2025-video-status.ts
 */

import { DECEMBER_2025_VIDEO_IDS } from '../video_scripts/world_class/december-2025-video-ids';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

if (!HEYGEN_API_KEY) {
  throw new Error('HEYGEN_API_KEY environment variable is required');
}

async function checkStatus(videoId: string): Promise<{ status: string; video_url?: string }> {
  const response = await fetch(
    \`https://api.heygen.com/v1/video_status.get?video_id=\${videoId}\`,
    {
      headers: { 'X-Api-Key': HEYGEN_API_KEY }
    }
  );
  const data = await response.json() as { data?: { status: string; video_url?: string } };
  return data.data || { status: 'unknown' };
}

async function main() {
  console.log('🔍 Checking December 2025 video status...');
  console.log('');

  let completed = 0;
  let processing = 0;
  let failed = 0;

  for (const [key, videoId] of Object.entries(DECEMBER_2025_VIDEO_IDS)) {
    const status = await checkStatus(videoId);
    const icon = status.status === 'completed' ? '✅' : 
                 status.status === 'processing' ? '⏳' : '❌';
    
    console.log(\`\${icon} \${key}: \${status.status}\`);
    
    if (status.status === 'completed') {
      completed++;
      if (status.video_url) {
        console.log(\`   URL: \${status.video_url}\`);
      }
    } else if (status.status === 'processing' || status.status === 'pending') {
      processing++;
    } else {
      failed++;
    }

    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('');
  console.log('Summary:');
  console.log(\`  Completed: \${completed}\`);
  console.log(\`  Processing: \${processing}\`);
  console.log(\`  Failed: \${failed}\`);
}

main().catch(console.error);
`;

  fs.writeFileSync(statusScriptPath, statusScript);
  console.log(`🔧 Status check script saved to: ${statusScriptPath}`);

  console.log('');
  console.log('═'.repeat(70));
  console.log('✨ Generation process complete!');
  console.log('');
  console.log('📋 Next steps:');
  console.log('   1. Wait 5-10 minutes for HeyGen to render videos');
  console.log('   2. Run: npx tsx tools/check-december-2025-video-status.ts');
  console.log('   3. Once complete, download videos and update heygen-video-urls.ts');
  console.log('');
  console.log('🔗 Manual status check:');
  console.log('   curl -s "https://api.heygen.com/v1/video_status.get?video_id=VIDEO_ID"');
  console.log('        -H "X-Api-Key: $HEYGEN_API_KEY"');
  console.log('═'.repeat(70));
}

main().catch(console.error);
