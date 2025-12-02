/**
 * Check status of December 2025 videos
 * Run with: npx tsx tools/check-december-2025-video-status.ts
 */

import { DECEMBER_2025_VIDEO_IDS } from '../video_scripts/world_class/december-2025-video-ids';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY || 'Sk_V2_hgu_kCXZPri8zVW_USKActgMJqFGEFzXfxRhYB1F5Jm9MqUz';

async function checkStatus(videoId: string): Promise<{ status: string; video_url?: string }> {
  const response = await fetch(
    `https://api.heygen.com/v1/video_status.get?video_id=${videoId}`,
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
    
    console.log(`${icon} ${key}: ${status.status}`);
    
    if (status.status === 'completed') {
      completed++;
      if (status.video_url) {
        console.log(`   URL: ${status.video_url}`);
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
  console.log(`  Completed: ${completed}`);
  console.log(`  Processing: ${processing}`);
  console.log(`  Failed: ${failed}`);
}

main().catch(console.error);
