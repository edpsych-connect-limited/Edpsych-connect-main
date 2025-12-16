
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const VIDEOS_DIR = path.join(process.cwd(), 'public/content/training_videos');
const OUTPUT_FILE = path.join(process.cwd(), 'new_cloudinary_map.txt');

async function getAllVideoFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...(await getAllVideoFiles(fullPath)));
    } else if (item.isFile() && item.name.endsWith('.mp4')) {
      files.push(fullPath);
    }
  }
  return files;
}

async function uploadVideos() {
  console.log('Scanning for video files...');
  const videoFiles = await getAllVideoFiles(VIDEOS_DIR);
  console.log(`Found ${videoFiles.length} video files.`);

  const urlMap: Record<string, string> = {};
  const errors: string[] = [];

  for (const file of videoFiles) {
    const filename = path.basename(file, '.mp4');
    // Use filename as key. 
    // Note: If there are duplicate filenames in different folders, the last one wins.
    // Based on previous file content, keys seem to be unique filenames.
    const key = filename; 
    
    console.log(`Uploading ${key} from ${file}...`);

    try {
      const result = await cloudinary.uploader.upload(file, {
        resource_type: 'video',
        public_id: `edpsych-connect/videos/${key}`,
        overwrite: true,
      });

      console.log(`✅ Uploaded ${key}: ${result.secure_url}`);
      urlMap[key] = result.secure_url;
    } catch (error: any) {
      console.error(`❌ Failed to upload ${key}:`, error.message);
      errors.push(`${key}: ${error.message}`);
    }
  }

  console.log('\nUpload complete.');
  if (errors.length > 0) {
    console.error(`\n${errors.length} errors occurred:`);
    errors.forEach(e => console.error(e));
  }

  // Generate the map string
  const mapEntries = Object.entries(urlMap)
    .map(([key, url]) => `  "${key}": "${url}",`)
    .join('\n');

  const mapContent = `export const CLOUDINARY_VIDEO_URLS: Record<string, string> = {\n${mapEntries}\n};`;

  fs.writeFileSync(OUTPUT_FILE, mapContent);
  console.log(`\nNew map written to ${OUTPUT_FILE}`);
}

uploadVideos().catch(console.error);
