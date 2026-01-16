/**
 * Upload Downloaded Videos to Cloudinary CDN
 * 
 * This script uploads all downloaded MP4 files from HeyGen to Cloudinary
 * for reliable CDN delivery with 99.9% SLA.
 * 
 * Prerequisites:
 * - .env file with CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 * - Downloaded videos in public/content/training_videos/
 * 
 * Usage: npx tsx scripts/upload-to-cloudinary.ts
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

const mode = (process.env.NODE_ENV || 'development').toLowerCase();
const candidates = [`.env.${mode}.local`, '.env.local', `.env.${mode}`, '.env'];
for (const rel of candidates) {
  const abs = path.join(process.cwd(), rel);
  if (fs.existsSync(abs)) dotenv.config({ path: abs, override: false });
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

interface UploadResult {
  key: string;
  publicId: string;
  secureUrl: string;
  duration: number;
  bytes: number;
  status: 'uploaded' | 'skipped' | 'failed';
  error?: string;
}

const VIDEO_BASE_PATH = 'public/content/training_videos';

async function getAllVideoFiles(): Promise<{ key: string; localPath: string; captionPath?: string }[]> {
  const videos: { key: string; localPath: string; captionPath?: string }[] = [];
  
  function scanDirectory(dir: string, prefix: string = '') {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath, item);
      } else if (item.endsWith('.mp4')) {
        // Generate key from filename (remove .mp4)
        const key = item.replace('.mp4', '');
        
        // Check for caption file
        const captionPath = fullPath.replace(/\.mp4$/, '.vtt');
        const hasCaption = fs.existsSync(captionPath);

        videos.push({ 
          key, 
          localPath: fullPath,
          captionPath: hasCaption ? captionPath : undefined
        });
      }
    }
  }
  
  scanDirectory(VIDEO_BASE_PATH);
  return videos;
}

async function uploadVideo(localPath: string, key: string, captionPath?: string): Promise<UploadResult> {
  try {
    // Create public ID based on key
    const publicId = `edpsych-connect/videos/${key}`;
    
    // Check if already uploaded
    try {
      const existing = await cloudinary.api.resource(publicId, { resource_type: 'video' });
      if (existing) {
        // Even if video exists, check/upload caption
        if (captionPath) {
           await cloudinary.uploader.upload(captionPath, {
            resource_type: 'raw',
            public_id: publicId + '.vtt',
            overwrite: true,
            tags: ['edpsych-connect', 'caption'],
          });
        }

        return {
          key,
          publicId: existing.public_id,
          secureUrl: existing.secure_url,
          duration: existing.duration || 0,
          bytes: existing.bytes,
          status: 'skipped',
        };
      }
    } catch {
      // Resource doesn't exist, proceed with upload
    }
    
    console.log(`  📤 Uploading ${key}...`);
    
    const result = await cloudinary.uploader.upload(localPath, {
      resource_type: 'video',
      public_id: publicId,
      overwrite: true, // Force overwrite to ensure new version
      // Optimize for web delivery
      eager: [
        { format: 'mp4', quality: 'auto:good' },
      ],
      eager_async: true,
      // Tags for organization
      tags: ['edpsych-connect', 'training-video'],
    });

    // Upload Caption (if exists)
    if (captionPath) {
      console.log(`   📝 Uploading caption for ${key}...`);
      await cloudinary.uploader.upload(captionPath, {
        resource_type: 'raw',
        public_id: publicId + '.vtt',
        overwrite: true,
        tags: ['edpsych-connect', 'caption'],
      });
    }
    
    return {
      key,
      publicId: result.public_id,
      secureUrl: result.secure_url,
      duration: result.duration || 0,
      bytes: result.bytes,
      status: 'uploaded',
    };
  } catch (error) {
    return {
      key,
      publicId: '',
      secureUrl: '',
      duration: 0,
      bytes: 0,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function main() {
  console.log('☁️  Cloudinary Video Upload Script');
  console.log('===================================\n');
  
  // Check configuration
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('❌ Missing Cloudinary configuration!');
    console.log('\nRequired environment variables:');
    console.log('  - CLOUDINARY_CLOUD_NAME');
    console.log('  - CLOUDINARY_API_KEY');
    console.log('  - CLOUDINARY_API_SECRET');
    console.log('\nSet these in your .env.local or export them before running.');
    process.exit(1);
  }
  
  console.log(`✅ Cloudinary configured for: ${process.env.CLOUDINARY_CLOUD_NAME}\n`);
  
  // Get all video files
  const videos = await getAllVideoFiles();
  console.log(`📁 Found ${videos.length} videos to process\n`);
  
  if (videos.length === 0) {
    console.log('No videos found in', VIDEO_BASE_PATH);
    console.log('Run the download script first: npx tsx scripts/download-heygen-videos.ts');
    process.exit(0);
  }
  
  const results: UploadResult[] = [];
  let uploaded = 0;
  let skipped = 0;
  let failed = 0;
  
  for (const video of videos) {
    process.stdout.write(`Processing ${video.key}... `);
    
    const result = await uploadVideo(video.localPath, video.key, video.captionPath);
    results.push(result);
    
    if (result.status === 'uploaded') {
      console.log(`✅ Uploaded (${(result.bytes / 1024 / 1024).toFixed(2)} MB)`);
      uploaded++;
    } else if (result.status === 'skipped') {
      console.log('⏭️  Already exists');
      skipped++;
    } else {
      console.log(`❌ Failed: ${result.error}`);
      failed++;
    }
    
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 200));
  }
  
  console.log('\n===================================');
  console.log('📊 Summary:');
  console.log(`   Uploaded: ${uploaded}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Failed: ${failed}`);
  console.log('===================================\n');
  
  // Generate CLOUDINARY_VIDEO_URLS mapping
  const successfulUploads = results.filter(r => r.status !== 'failed' && r.secureUrl);
  
  if (successfulUploads.length > 0) {
    console.log('📝 Cloudinary URL mapping (copy to src/lib/cloudinary.ts):\n');
    console.log('export const CLOUDINARY_VIDEO_URLS: Record<string, string> = {');
    for (const result of successfulUploads) {
      console.log(`  '${result.key}': '${result.secureUrl}',`);
    }
    console.log('};');
    
    // Save to file
    const urlMapping: Record<string, string> = {};
    for (const result of successfulUploads) {
      urlMapping[result.key] = result.secureUrl;
    }
    
    fs.writeFileSync(
      'cloudinary-video-urls.json',
      JSON.stringify(urlMapping, null, 2)
    );
    console.log('\n✅ URLs saved to cloudinary-video-urls.json');
  }
  
  // Save full results
  fs.writeFileSync(
    'cloudinary-upload-results.json',
    JSON.stringify(results, null, 2)
  );
  console.log('✅ Full results saved to cloudinary-upload-results.json');
}

main().catch(console.error);
