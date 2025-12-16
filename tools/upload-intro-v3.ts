/**
 * Upload V3 Intro Video to Cloudinary
 */

import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  throw new Error('CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET must be set');
}

if (!HEYGEN_API_KEY) {
  throw new Error('HEYGEN_API_KEY environment variable is required');
}

const REQUIRED_HEYGEN_API_KEY: string = HEYGEN_API_KEY;
const REQUIRED_CLOUDINARY_CLOUD_NAME: string = CLOUDINARY_CLOUD_NAME;
const REQUIRED_CLOUDINARY_API_KEY: string = CLOUDINARY_API_KEY;
const REQUIRED_CLOUDINARY_API_SECRET: string = CLOUDINARY_API_SECRET;

// Cloudinary configuration
cloudinary.config({
  cloud_name: REQUIRED_CLOUDINARY_CLOUD_NAME,
  api_key: REQUIRED_CLOUDINARY_API_KEY,
  api_secret: REQUIRED_CLOUDINARY_API_SECRET,
});

async function main() {
  console.log('🔍 Fetching V3 video URL from HeyGen...');
  
  const response = await fetch('https://api.heygen.com/v1/video_status.get?video_id=c080a3d9b69a40d3b1bf9bd7437c4d37', {
    headers: { 'X-Api-Key': REQUIRED_HEYGEN_API_KEY }
  });
  
  const data = await response.json() as { data: { video_url: string; duration: number } };
  
  console.log(`✅ Video ready! Duration: ${(data.data.duration / 60).toFixed(1)} minutes`);
  console.log('📤 Uploading V3 Intro Video to Cloudinary...');
  
  try {
    const result = await cloudinary.uploader.upload(data.data.video_url, {
      resource_type: 'video',
      public_id: 'edpsych-connect/onboarding/platform-introduction-v3-featured',
      folder: 'edpsych-connect/onboarding',
      overwrite: true
    });

    console.log('✅ Uploaded successfully!');
    console.log(`URL: ${result.secure_url}`);

    // Update cloudinary-video-urls.json
    const urlsPath = path.join(process.cwd(), 'cloudinary-video-urls.json');
    let urls: Record<string, string> = {};
    
    if (fs.existsSync(urlsPath)) {
      urls = JSON.parse(fs.readFileSync(urlsPath, 'utf-8'));
    }
    
    urls['platform-introduction-v3'] = result.secure_url;
    urls['platform-introduction-featured'] = result.secure_url; // This is the FEATURED intro
    fs.writeFileSync(urlsPath, JSON.stringify(urls, null, 2));
    
    console.log('\n════════════════════════════════════════════════════════════════════════════════');
    console.log('🎉 V3 FEATURED INTRO VIDEO COMPLETE!');
    console.log('════════════════════════════════════════════════════════════════════════════════');
    console.log(`Duration: ${(data.data.duration / 60).toFixed(1)} minutes`);
    console.log(`Cloudinary URL: ${result.secure_url}`);
    console.log('\n✅ Marked as "platform-introduction-featured" in cloudinary-video-urls.json');
  } catch (error) {
    console.error('❌ Upload failed:', error);
  }
}

main();
