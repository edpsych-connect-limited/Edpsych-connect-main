/**
 * Batch Video Generation Tool for EdPsych Connect
 * Generates all videos from the comprehensive scripts
 * 
 * Run with: npx tsx tools/generate-all-videos.ts
 * Requires: HEYGEN_API_KEY environment variable
 */

import fs from 'fs';
import path from 'path';

// Import all scripts
import { ALL_VIDEO_SCRIPTS } from '../video_scripts/world_class/comprehensive-video-scripts';

const API_KEY = process.env.HEYGEN_API_KEY || '';
const API_URL = 'https://api.heygen.com/v2/video/generate';

// Configuration for world-class UK videos
const CONFIG = {
  avatar: {
    id: 'Adrian_public_3_20240312', // Professional UK male avatar
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      id: script.id,
      title: script.title,
      status: 'failed',
      error: errorMessage
    };
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  if (!API_KEY) {
    console.error('❌ HEYGEN_API_KEY environment variable is required');
    process.exit(1);
  }

  console.log('🎬 EdPsych Connect - Batch Video Generation');
  console.log('==========================================\n');

  // Collect all scripts from all categories
  const allScripts: { category: string; scripts: VideoScript[] }[] = [];
  
  for (const [categoryName, categoryScripts] of Object.entries(ALL_VIDEO_SCRIPTS)) {
    const scripts = Object.values(categoryScripts) as VideoScript[];
    allScripts.push({ category: categoryName, scripts });
    console.log(`📁 ${categoryName}: ${scripts.length} videos`);
  }

  const totalVideos = allScripts.reduce((sum, cat) => sum + cat.scripts.length, 0);
  console.log(`\n📊 Total videos to generate: ${totalVideos}`);
  console.log(`⏱️  Estimated time: ~${Math.ceil(totalVideos * 7 / 60)} minutes\n`);

  // Generate all videos
  const results: GenerationResult[] = [];
  const videoIds: Record<string, string> = {};
  let videoCount = 0;

  for (const { category, scripts } of allScripts) {
    console.log(`\n🎥 Generating ${category} videos...`);
    console.log('─'.repeat(40));

    for (const script of scripts) {
      videoCount++;
      console.log(`  [${videoCount}/${totalVideos}] ${script.title}...`);
      
      const result = await generateVideo(script);
      results.push(result);

      if (result.status === 'success' && result.videoId) {
        videoIds[result.id] = result.videoId;
        console.log(`    ✅ Success: ${result.videoId}`);
      } else {
        console.log(`    ❌ Failed: ${result.error}`);
      }

      // Rate limiting
      if (videoCount < totalVideos) {
        await sleep(RATE_LIMIT_MS);
      }
    }
  }

  // Summary
  console.log('\n\n📊 GENERATION SUMMARY');
  console.log('='.repeat(40));
  
  const successful = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status === 'failed');
  
  console.log(`✅ Successful: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log('\n⚠️  Failed videos:');
    failed.forEach(f => console.log(`   - ${f.title}: ${f.error}`));
  }

  // Generate video IDs TypeScript file
  const outputPath = path.join(process.cwd(), 'video_scripts', 'world_class', 'all-video-ids.ts');
  const tsContent = `// Auto-generated Video IDs
// Generated: ${new Date().toISOString()}

export const ALL_VIDEO_IDS = ${JSON.stringify(videoIds, null, 2)};

// Embed URLs
export const ALL_EMBED_URLS = Object.fromEntries(
  Object.entries(ALL_VIDEO_IDS).map(([key, id]) => [
    key,
    \`https://app.heygen.com/embed/\${id}\`
  ])
);
`;

  fs.writeFileSync(outputPath, tsContent);
  console.log(`\n📄 Video IDs saved to: ${outputPath}`);

  // Generate log file
  const logPath = path.join(process.cwd(), 'video_scripts', 'world_class', 'batch-generation-log.txt');
  const logContent = [
    `Batch Video Generation - ${new Date().toISOString()}`,
    '='.repeat(50),
    '',
    `Total: ${totalVideos}`,
    `Successful: ${successful.length}`,
    `Failed: ${failed.length}`,
    '',
    'Results:',
    ...results.map(r => `${r.status === 'success' ? '✅' : '❌'} ${r.id}: ${r.videoId || r.error}`)
  ].join('\n');

  fs.appendFileSync(logPath, logContent + '\n\n');
  console.log(`📝 Log saved to: ${logPath}`);

  console.log('\n✨ Generation complete!');
}

main().catch(console.error);
