/**
 * Upload V2 Intro Video to Cloudinary
 */

import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import * as path from 'path';

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  throw new Error('CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET must be set');
}

const REQUIRED_CLOUDINARY_CLOUD_NAME: string = CLOUDINARY_CLOUD_NAME;
const REQUIRED_CLOUDINARY_API_KEY: string = CLOUDINARY_API_KEY;
const REQUIRED_CLOUDINARY_API_SECRET: string = CLOUDINARY_API_SECRET;

// Cloudinary configuration
cloudinary.config({
  cloud_name: REQUIRED_CLOUDINARY_CLOUD_NAME,
  api_key: REQUIRED_CLOUDINARY_API_KEY,
  api_secret: REQUIRED_CLOUDINARY_API_SECRET,
});

const VIDEO_URL = process.argv[2] || process.env.HEYGEN_VIDEO_URL;

if (!VIDEO_URL) {
  throw new Error('Provide the video URL as argv[2] or set HEYGEN_VIDEO_URL');
}

const REQUIRED_VIDEO_URL: string = VIDEO_URL;

async function main() {
  console.log('📤 Uploading V2 Intro Video to Cloudinary...');
  
  try {
    const result = await cloudinary.uploader.upload(REQUIRED_VIDEO_URL, {
      resource_type: 'video',
      public_id: 'edpsych-connect/onboarding/platform-introduction-v2',
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
    
    urls['platform-introduction-v2'] = result.secure_url;
    fs.writeFileSync(urlsPath, JSON.stringify(urls, null, 2));
    
    console.log('📄 Updated cloudinary-video-urls.json');
  } catch (error) {
    console.error('❌ Upload failed:', error);
  }
}

main();
