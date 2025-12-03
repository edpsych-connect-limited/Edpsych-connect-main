/**
 * Sync Local Videos with Cloudinary
 * 
 * This script:
 * 1. Lists all videos in Cloudinary
 * 2. Lists all local videos
 * 3. Uploads any missing videos to Cloudinary
 * 4. Updates the cloudinary-video-urls.json mapping
 */

import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary - uses environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dncfu2j0r',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const VIDEO_DIR = path.join(__dirname, '../public/content/training_videos');
const OUTPUT_FILE = path.join(__dirname, '../cloudinary-video-urls.json');

interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  format: string;
}

async function listCloudinaryVideos(): Promise<Map<string, string>> {
  const videos = new Map<string, string>();
  let nextCursor: string | undefined;

  console.log('📡 Fetching videos from Cloudinary...');

  do {
    const result = await cloudinary.api.resources({
      resource_type: 'video',
      type: 'upload',
      prefix: 'edpsych-connect/videos/',
      max_results: 500,
      next_cursor: nextCursor,
    });

    for (const resource of result.resources as CloudinaryResource[]) {
      const name = resource.public_id.replace('edpsych-connect/videos/', '');
      videos.set(name, resource.secure_url);
    }

    nextCursor = result.next_cursor;
  } while (nextCursor);

  console.log(`✅ Found ${videos.size} videos in Cloudinary`);
  return videos;
}

function listLocalVideos(): Map<string, string> {
  const videos = new Map<string, string>();

  function scanDir(dir: string, prefix: string = '') {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDir(fullPath, `${prefix}${item}/`);
      } else if (item.endsWith('.mp4')) {
        const name = item.replace('.mp4', '');
        // Use the subdirectory as part of the key to handle duplicates
        const key = prefix ? `${prefix.replace(/\/$/, '')}/${name}` : name;
        videos.set(key, fullPath);
      }
    }
  }

  scanDir(VIDEO_DIR);
  console.log(`📂 Found ${videos.size} local video files`);
  return videos;
}

async function uploadVideo(localPath: string, name: string): Promise<string> {
  console.log(`⬆️  Uploading: ${name}`);
  
  const result = await cloudinary.uploader.upload(localPath, {
    resource_type: 'video',
    public_id: `edpsych-connect/videos/${name}`,
    overwrite: false,
    invalidate: true,
  });

  return result.secure_url;
}

async function main() {
  console.log('🎬 Cloudinary Video Sync Tool\n');

  // Check for API credentials
  if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('❌ Missing Cloudinary credentials!');
    console.error('   Set CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET environment variables');
    console.error('\n   You can find these in your Cloudinary dashboard:');
    console.error('   https://console.cloudinary.com/console\n');
    process.exit(1);
  }

  try {
    // Get current state
    const cloudinaryVideos = await listCloudinaryVideos();
    const localVideos = listLocalVideos();

    // Find missing videos
    const missing: Array<{ name: string; path: string }> = [];
    for (const [name, localPath] of localVideos) {
      const simpleName = name.split('/').pop() || name;
      if (!cloudinaryVideos.has(simpleName)) {
        missing.push({ name: simpleName, path: localPath });
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Cloudinary: ${cloudinaryVideos.size} videos`);
    console.log(`   Local: ${localVideos.size} videos`);
    console.log(`   Missing from Cloudinary: ${missing.length} videos\n`);

    if (missing.length > 0) {
      console.log('📤 Uploading missing videos...\n');
      
      for (const { name, path: localPath } of missing) {
        try {
          const url = await uploadVideo(localPath, name);
          cloudinaryVideos.set(name, url);
          console.log(`   ✅ ${name}`);
        } catch (error) {
          console.error(`   ❌ Failed: ${name}`, error);
        }
      }
    }

    // Generate updated JSON mapping
    const mapping: Record<string, string> = {};
    for (const [name, url] of cloudinaryVideos) {
      mapping[name] = url;
    }

    // Sort keys alphabetically
    const sortedMapping: Record<string, string> = {};
    for (const key of Object.keys(mapping).sort()) {
      sortedMapping[key] = mapping[key];
    }

    // Write to file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(sortedMapping, null, 2));
    console.log(`\n✅ Updated ${OUTPUT_FILE}`);
    console.log(`   Total videos: ${Object.keys(sortedMapping).length}`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
