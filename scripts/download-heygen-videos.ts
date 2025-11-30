/**
 * HeyGen Video Download Script
 * 
 * Downloads completed videos from HeyGen and prepares them for:
 * 1. Local storage (public/content/training_videos/)
 * 2. Cloudinary upload
 * 
 * Usage: npx tsx scripts/download-heygen-videos.ts
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { HEYGEN_VIDEO_IDS } from '../src/lib/training/heygen-video-urls';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY || 'sk_V2_hgu_kCXZPri8zVW_USKActgMJqFGEFzXfxRhYB1F5Jm9MqUz';

interface VideoStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  video_url?: string;
  thumbnail_url?: string;
  duration?: number;
  error?: string;
}

async function getVideoStatus(videoId: string): Promise<VideoStatus | null> {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.heygen.com',
      path: `/v1/video_status.get?video_id=${videoId}`,
      method: 'GET',
      headers: {
        'X-Api-Key': HEYGEN_API_KEY,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.code === 100 && json.data) {
            resolve(json.data);
          } else {
            console.error(`Error for ${videoId}:`, json.message);
            resolve(null);
          }
        } catch (e) {
          console.error(`Parse error for ${videoId}:`, e);
          resolve(null);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`Request error for ${videoId}:`, e);
      resolve(null);
    });

    req.end();
  });
}

async function downloadFile(url: string, destPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const file = fs.createWriteStream(destPath);
    
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        https.get(response.headers.location!, (redirectResponse) => {
          redirectResponse.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve(true);
          });
        }).on('error', () => {
          fs.unlink(destPath, () => {});
          resolve(false);
        });
      } else {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(true);
        });
      }
    }).on('error', () => {
      fs.unlink(destPath, () => {});
      resolve(false);
    });
  });
}

function getLocalPath(key: string): string {
  // Determine folder based on key prefix
  let folder = 'misc';
  if (key.startsWith('help-')) folder = 'help-centre';
  else if (key.startsWith('ehcp-')) folder = 'ehcp';
  else if (key.startsWith('parent-')) folder = 'parent-portal';
  else if (key.startsWith('feature-')) folder = 'features';
  else if (key.startsWith('error-')) folder = 'error-recovery';
  else if (key.startsWith('la-')) folder = 'la-portal';
  else if (key.startsWith('admin-')) folder = 'admin';
  else if (key.startsWith('student-')) folder = 'student';
  else if (key.startsWith('understanding-')) folder = 'conditions';
  else if (key.startsWith('compliance-') || key.startsWith('safeguarding-')) folder = 'compliance';
  else if (key.startsWith('mobile-') || key.startsWith('accessibility-')) folder = 'accessibility';
  else if (key.startsWith('marketplace-')) folder = 'marketplace';
  else if (key.startsWith('data-')) folder = 'data';
  else if (key.startsWith('subscription-')) folder = 'billing';
  else if (key.startsWith('platform-') || key.startsWith('onboarding-')) folder = 'marketing';
  else if (key.includes('-m') && key.includes('-l')) folder = 'training-courses';

  return path.join('public', 'content', 'training_videos', folder, `${key}.mp4`);
}

async function main() {
  console.log('🎬 HeyGen Video Download Script');
  console.log('================================\n');

  const videoEntries = Object.entries(HEYGEN_VIDEO_IDS);
  console.log(`Found ${videoEntries.length} videos to check\n`);

  const results: { key: string; status: string; url?: string; localPath?: string }[] = [];
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;
  let pending = 0;

  for (const [key, videoId] of videoEntries) {
    // Skip legacy aliases
    if (key.startsWith('premium-')) continue;

    process.stdout.write(`Checking ${key}... `);
    
    const status = await getVideoStatus(videoId);
    
    if (!status) {
      console.log('❌ API error');
      failed++;
      results.push({ key, status: 'api_error' });
      continue;
    }

    if (status.status !== 'completed') {
      console.log(`⏳ ${status.status}`);
      pending++;
      results.push({ key, status: status.status });
      continue;
    }

    if (!status.video_url) {
      console.log('❌ No video URL');
      failed++;
      results.push({ key, status: 'no_url' });
      continue;
    }

    const localPath = getLocalPath(key);
    
    // Check if already downloaded
    if (fs.existsSync(localPath)) {
      console.log('✅ Already exists');
      skipped++;
      results.push({ key, status: 'exists', localPath });
      continue;
    }

    // Download
    console.log('⬇️ Downloading...');
    const success = await downloadFile(status.video_url, localPath);
    
    if (success) {
      console.log(`   ✅ Saved to ${localPath}`);
      downloaded++;
      results.push({ key, status: 'downloaded', url: status.video_url, localPath });
    } else {
      console.log('   ❌ Download failed');
      failed++;
      results.push({ key, status: 'download_failed' });
    }

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n================================');
  console.log('📊 Summary:');
  console.log(`   Downloaded: ${downloaded}`);
  console.log(`   Skipped (exists): ${skipped}`);
  console.log(`   Pending/Processing: ${pending}`);
  console.log(`   Failed: ${failed}`);
  console.log('================================\n');

  // Save results to JSON for reference
  fs.writeFileSync(
    'video-download-results.json',
    JSON.stringify(results, null, 2)
  );
  console.log('Results saved to video-download-results.json');
}

main().catch(console.error);
