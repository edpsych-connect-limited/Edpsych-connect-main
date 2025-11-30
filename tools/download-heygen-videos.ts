/**
 * Download HeyGen Videos to Local Storage
 * 
 * This script fetches video download URLs from HeyGen API
 * and downloads them to the appropriate local paths.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY: string = process.env.HEYGEN_API_KEY || '';
if (!API_KEY) {
  console.error('❌ Error: HEYGEN_API_KEY environment variable is not set.');
  process.exit(1);
}

interface VideoMapping {
  videoId: string;
  shareUrl: string;
  course: string;
  module: string;
  lesson: string;
  localPath: string;
  lessonId: string;
}

interface HeyGenVideoStatus {
  data: {
    video_id: string;
    status: string;
    video_url?: string;
    video_url_caption?: string;
    thumbnail_url?: string;
    duration?: number;
    error?: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

async function getVideoStatus(videoId: string): Promise<HeyGenVideoStatus> {
  const response = await fetch(
    `https://api.heygen.com/v1/video_status.get?video_id=${videoId}`,
    {
      headers: {
        'X-Api-Key': API_KEY!,
      },
    }
  );
  return response.json() as Promise<HeyGenVideoStatus>;
}

async function downloadFile(url: string, destPath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Ensure directory exists
  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(destPath, buffer);
}

async function main() {
  // Load video mapping
  const mappingPath = path.join(__dirname, '../video_scripts/video-mapping.json');
  const mappings: VideoMapping[] = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));
  
  console.log('='.repeat(80));
  console.log('HeyGen Video Downloader');
  console.log('='.repeat(80));
  console.log(`Total videos to process: ${mappings.length}`);
  console.log('');
  
  const publicDir = path.join(__dirname, '../public');
  
  let downloaded = 0;
  let failed = 0;
  let skipped = 0;
  
  for (const mapping of mappings) {
    const destPath = path.join(publicDir, mapping.localPath);
    
    // Check if file already exists and is larger than placeholder (26KB)
    if (fs.existsSync(destPath)) {
      const stats = fs.statSync(destPath);
      if (stats.size > 100000) { // Skip if > 100KB (real video)
        console.log(`⏭️  Skipping ${mapping.lessonId} (already downloaded)`);
        skipped++;
        continue;
      }
    }
    
    console.log(`📥 Processing ${mapping.lessonId}: ${mapping.lesson}`);
    
    try {
      // Get video status to get the download URL
      const status = await getVideoStatus(mapping.videoId);
      
      if (status.error) {
        console.log(`   ❌ API Error: ${status.error.message}`);
        failed++;
        continue;
      }
      
      if (status.data.status !== 'completed') {
        console.log(`   ⚠️  Video not ready: ${status.data.status}`);
        failed++;
        continue;
      }
      
      if (!status.data.video_url) {
        console.log(`   ❌ No video URL available`);
        failed++;
        continue;
      }
      
      console.log(`   📥 Downloading from: ${status.data.video_url.substring(0, 80)}...`);
      
      await downloadFile(status.data.video_url, destPath);
      
      const stats = fs.statSync(destPath);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
      console.log(`   ✅ Downloaded: ${sizeMB} MB to ${mapping.localPath}`);
      
      downloaded++;
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.log(`   ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      failed++;
    }
  }
  
  console.log('');
  console.log('='.repeat(80));
  console.log('Summary');
  console.log('='.repeat(80));
  console.log(`✅ Downloaded: ${downloaded}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${mappings.length}`);
}

main().catch(console.error);
