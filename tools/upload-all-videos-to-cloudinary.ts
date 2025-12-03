#!/usr/bin/env npx tsx
/**
 * Comprehensive Video Upload Script - Cloudinary CDN
 * 
 * This script uploads all local videos to Cloudinary for global CDN delivery
 * 
 * Usage: npx tsx tools/upload-all-videos-to-cloudinary.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { v2 as cloudinary } from 'cloudinary';

// Get credentials from environment variables (must be set before running)
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dncfu2j0r';
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error('❌ CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET must be set in environment');
  console.log('\nTo set credentials:');
  console.log('  export CLOUDINARY_API_KEY=your_api_key');
  console.log('  export CLOUDINARY_API_SECRET=your_api_secret');
  console.log('\nThen run: npx tsx tools/upload-all-videos-to-cloudinary.ts');
  process.exit(1);
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

interface UploadResult {
  public_id: string;
  secure_url: string;
  bytes: number;
  duration?: number;
  width?: number;
  height?: number;
}

interface VideoFile {
  localPath: string;
  publicId: string;
  category: string;
}

// Scan all video directories
function findAllVideos(): VideoFile[] {
  const videos: VideoFile[] = [];
  const baseDir = 'public/content/training_videos';
  
  // First scan root directory for December 2025 videos
  if (fs.existsSync(baseDir)) {
    const rootFiles = fs.readdirSync(baseDir);
    for (const file of rootFiles) {
      const filePath = path.join(baseDir, file);
      if (file.endsWith('.mp4') && fs.statSync(filePath).isFile()) {
        const publicId = `edpsych-connect/videos/${file.replace('.mp4', '')}`;
        videos.push({
          localPath: filePath,
          publicId,
          category: 'root'
        });
      }
    }
  }
  
  const categories = [
    'autism-spectrum-support',
    'adhd-understanding-support', 
    'dyslexia-intervention-strategies',
    'assessment-essentials',
    'ehcp-mastery',
    'evidence-based-interventions',
    'send-fundamentals',
    'marketing',
    'onboarding/teacher',
    'onboarding/senco',
    'onboarding/parent',
    'onboarding/la',
    'onboarding/ep',
    'la-portal',
    'help-centre',
    'ehcp',
    'pricing',
    'research',
    'features'
  ];
  
  for (const category of categories) {
    const dir = path.join(baseDir, category);
    if (!fs.existsSync(dir)) {
      console.log(`⚠️ Directory not found: ${dir}`);
      continue;
    }
    
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file.endsWith('.mp4')) {
        const localPath = path.join(dir, file);
        const publicId = `edpsych-connect/videos/${category.replace('/', '-')}/${file.replace('.mp4', '')}`;
        videos.push({
          localPath,
          publicId,
          category
        });
      }
    }
  }
  
  return videos;
}

async function uploadVideo(video: VideoFile): Promise<UploadResult | null> {
  try {
    console.log(`⟳ Uploading: ${video.localPath}`);
    
    const result = await cloudinary.uploader.upload(video.localPath, {
      resource_type: 'video',
      public_id: video.publicId,
      overwrite: true,
      eager: [
        { format: 'mp4', quality: 'auto' },
      ],
      eager_async: true,
    });
    
    console.log(`  ✓ Uploaded: ${result.secure_url}`);
    
    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      bytes: result.bytes,
      duration: result.duration,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error(`  ✗ Failed to upload ${video.localPath}:`, error);
    return null;
  }
}

async function main() {
  console.log('\n' + '='.repeat(80));
  console.log('CLOUDINARY VIDEO UPLOAD - EdPsych Connect');
  console.log('='.repeat(80) + '\n');
  
  const videos = findAllVideos();
  console.log(`Found ${videos.length} videos to upload\n`);
  
  const results: Record<string, string> = {};
  let successCount = 0;
  let failCount = 0;
  
  for (const video of videos) {
    const result = await uploadVideo(video);
    if (result) {
      // Extract video ID from path for registry key
      const pathParts = video.localPath.split('/');
      const filename = pathParts[pathParts.length - 1].replace('.mp4', '');
      const category = video.category;
      
      // Create registry key (e.g., 'autism-m1-l1', 'onboard-teacher-welcome')
      let registryKey: string;
      if (category === 'root') {
        registryKey = filename;
      } else if (category.startsWith('onboarding/')) {
        const role = category.split('/')[1];
        registryKey = `onboard-${role}-${filename}`;
      } else if (category === 'marketing') {
        registryKey = filename;
      } else if (category === 'research') {
        registryKey = `research-${filename}`;
      } else {
        registryKey = filename;
      }
      
      results[registryKey] = result.secure_url;
      successCount++;
    } else {
      failCount++;
    }
    
    // Rate limit: 1 upload per second to avoid hitting limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '-'.repeat(80));
  console.log(`Upload Summary: ${successCount} success, ${failCount} failed`);
  console.log('-'.repeat(80) + '\n');
  
  // Generate TypeScript mapping
  console.log('Generated CLOUDINARY_VIDEO_URLS mapping:\n');
  console.log('export const CLOUDINARY_VIDEO_URLS: Record<string, string> = {');
  for (const [key, url] of Object.entries(results).sort()) {
    console.log(`  '${key}': '${url}',`);
  }
  console.log('};');
  
  // Save to file
  const outputPath = 'src/lib/cloudinary-video-urls.json';
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n✓ Saved URL mapping to ${outputPath}`);
}

main().catch(console.error);
