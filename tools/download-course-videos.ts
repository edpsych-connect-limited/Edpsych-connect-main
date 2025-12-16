#!/usr/bin/env npx tsx
/**
 * Download Course Training Videos
 * Downloads all course videos from HeyGen once they're ready
 */

import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

if (!HEYGEN_API_KEY) {
  throw new Error('HEYGEN_API_KEY environment variable is required');
}
const BASE_DIR = path.join(process.cwd(), 'public', 'content', 'training_videos');

interface VideoConfig {
  id: string;
  heygenId: string;
  localPath: string;
}

const COURSE_VIDEOS: VideoConfig[] = [
  // Dyslexia Intervention Strategies
  { id: 'dys-m1-l1', heygenId: 'b9625a27b554403a98bf5b47f5f47aa6', localPath: 'dyslexia-intervention-strategies/dys-m1-l1.mp4' },
  { id: 'dys-m2-l1', heygenId: 'b500df32bc5a41c2b27234953e5c5cc5', localPath: 'dyslexia-intervention-strategies/dys-m2-l1.mp4' },
  { id: 'dys-m3-l1', heygenId: 'a6eebf76695c4054b1d9948ced31b2c8', localPath: 'dyslexia-intervention-strategies/dys-m3-l1.mp4' },
  { id: 'dys-m4-l1', heygenId: '414da24c898c436eaaf9822064e46634', localPath: 'dyslexia-intervention-strategies/dys-m4-l1.mp4' },
  { id: 'dys-m5-l1', heygenId: '9ac4c93c38d340ce8cc89b5bf4bc3678', localPath: 'dyslexia-intervention-strategies/dys-m5-l1.mp4' },
  { id: 'dys-m6-l2', heygenId: 'cb7866b5c35141cfb00c6c619fdff623', localPath: 'dyslexia-intervention-strategies/dys-m6-l2.mp4' },
  { id: 'dys-m7-l1', heygenId: 'cdc2a5baa7374d17ba9d5edb8b0d67cf', localPath: 'dyslexia-intervention-strategies/dys-m7-l1.mp4' },
  { id: 'dys-m8-l1', heygenId: 'f175dacee45e4b85bf666dcd997745b4', localPath: 'dyslexia-intervention-strategies/dys-m8-l1.mp4' },
  
  // EHCP Mastery
  { id: 'ehcp-m1-l1', heygenId: 'c69ee15cf8684ff1b68bbc83b7ddc847', localPath: 'ehcp-mastery/ehcp-m1-l1.mp4' },
  
  // Evidence-Based Interventions
  { id: 'int-m1-l1', heygenId: '81c1723b29cc4e06aed06980e0c2723f', localPath: 'evidence-based-interventions/int-m1-l1.mp4' },
  { id: 'int-m2-l1', heygenId: '3f614f3731bc4026a1ad3ef79b9d8c2c', localPath: 'evidence-based-interventions/int-m2-l1.mp4' },
  
  // SEND Fundamentals
  { id: 'send-fund-m1-l1', heygenId: '0911aab193a841d1a97974536e750f78', localPath: 'send-fundamentals/send-fund-m1-l1.mp4' },
  { id: 'send-fund-m2-l1', heygenId: '13d2d0260b2449abb4322455578fd8b7', localPath: 'send-fundamentals/send-fund-m2-l1.mp4' },
  { id: 'send-fund-m2-l2', heygenId: '796bfa38398d4404a1d1d4a1da442b33', localPath: 'send-fundamentals/send-fund-m2-l2.mp4' },
];

async function getVideoStatus(videoId: string): Promise<{ status: string; videoUrl?: string }> {
  return new Promise((resolve, reject) => {
    const req = https.get(
      `https://api.heygen.com/v1/video_status.get?video_id=${videoId}`,
      { headers: { 'X-Api-Key': HEYGEN_API_KEY } },
      (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const result = JSON.parse(data);
          resolve({
            status: result.data?.status || 'unknown',
            videoUrl: result.data?.video_url
          });
        });
      }
    );
    req.on('error', reject);
  });
}

async function downloadFile(url: string, filepath: string): Promise<void> {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (res) => {
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete partial file
      reject(err);
    });
  });
}

async function main() {
  console.log('='.repeat(80));
  console.log('COURSE VIDEO DOWNLOAD');
  console.log('='.repeat(80));
  console.log('');

  let downloaded = 0;
  let processing = 0;
  let failed = 0;
  let skipped = 0;

  for (const video of COURSE_VIDEOS) {
    const fullPath = path.join(BASE_DIR, video.localPath);
    
    // Check if already downloaded (and > 100KB = not placeholder)
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      if (stats.size > 100000) {
        console.log(`✓ SKIP: ${video.id} - Already downloaded (${(stats.size / 1024 / 1024).toFixed(1)} MB)`);
        skipped++;
        continue;
      }
    }

    // Check HeyGen status
    const status = await getVideoStatus(video.heygenId);
    
    if (status.status !== 'completed' || !status.videoUrl) {
      console.log(`⏳ PENDING: ${video.id} - Status: ${status.status}`);
      processing++;
      continue;
    }

    // Download
    console.log(`⬇️  DOWNLOADING: ${video.id}...`);
    try {
      await downloadFile(status.videoUrl, fullPath);
      const stats = fs.statSync(fullPath);
      console.log(`   ✓ Downloaded: ${(stats.size / 1024 / 1024).toFixed(1)} MB`);
      downloaded++;
    } catch (err) {
      console.log(`   ❌ Failed: ${err}`);
      failed++;
    }
  }

  console.log('');
  console.log('-'.repeat(80));
  console.log(`COMPLETE: ${downloaded} downloaded, ${processing} processing, ${failed} failed, ${skipped} skipped`);
  console.log('-'.repeat(80));
}

main().catch(console.error);
