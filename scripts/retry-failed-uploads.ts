/**
 * Retry Failed Cloudinary Uploads
 */
import fs from 'fs';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const failedVideos = [
  { key: 'la-dashboard-overview', path: 'public/content/training_videos/la-portal/la-dashboard-overview.mp4' },
];

async function retryUploads() {
  console.log('🔄 Retrying failed Cloudinary uploads...\n');
  
  for (const video of failedVideos) {
    // Check if file exists
    if (!fs.existsSync(video.path)) {
      console.log(`❌ File not found: ${video.path}`);
      console.log('   Checking alternative locations...');
      
      // Try finding the file
      const altPaths = [
        `public/content/training_videos/${video.key}.mp4`,
        `public/content/training_videos/onboarding/${video.key}.mp4`,
      ];
      
      let found = false;
      for (const alt of altPaths) {
        if (fs.existsSync(alt)) {
          console.log(`   ✅ Found at: ${alt}`);
          video.path = alt;
          found = true;
          break;
        }
      }
      
      if (!found) {
        console.log(`   ❌ Could not find ${video.key}.mp4 anywhere`);
        continue;
      }
    }
    
    const fileSize = fs.statSync(video.path).size;
    console.log(`📤 Uploading ${video.key} (${(fileSize / 1024 / 1024).toFixed(2)} MB)...`);
    
    try {
      const result = await cloudinary.uploader.upload(video.path, {
        resource_type: 'video',
        public_id: `edpsych-connect/videos/${video.key}`,
        overwrite: true,
        timeout: 120000, // 2 minute timeout for large files
      });
      
      console.log(`✅ SUCCESS: ${video.key}`);
      console.log(`   URL: ${result.secure_url}`);
      console.log(`   Size: ${(result.bytes / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Duration: ${result.duration}s\n`);
    } catch (error) {
      console.log(`❌ FAILED: ${video.key}`);
      if (error instanceof Error) {
        console.log(`   Error: ${error.message}`);
        // @ts-ignore - access full error details
        if (error.http_code) console.log(`   HTTP Code: ${error.http_code}`);
        // @ts-ignore
        if (error.error) console.log(`   Cloudinary Error: ${JSON.stringify(error.error)}`);
      }
      console.log(`   Full error: ${JSON.stringify(error, null, 2)}\n`);
    }
  }
  
  console.log('Done!');
}

retryUploads().catch(console.error);
