/**
 * Upload V2 Intro Video to Cloudinary
 */

import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import * as path from 'path';

// Cloudinary configuration
cloudinary.config({
  cloud_name: 'dncfu2j0r',
  api_key: '243634378544427',
  api_secret: 'J2CdOE3wHop90Vz0mS99biVHbnU'
});

const VIDEO_URL = 'https://files2.heygen.ai/aws_pacific/avatar_tmp/0521ad203a684ea48881e754c046810e/ae34995e2433414dbad87db49f5d99fe.mp4?Expires=1765467126&Signature=RZV7ZmofZ9xiOMi3sTmzNSTGG~sd5VSZRh5oiBv3xlQxzgAiZFlIYYZclYDKrZuopPsEhwc4R2wwezTk2dyGNIOMCu9-UX7~ZwIx54VvJw5~6FTQnvv5XjCCjM0B0X~LDUbHro622r1K8r3yj5ZOevKeVRDnbyjO~Vd37CsDgMlmpLR8ijekpGblppIDx1rHriwFzb13wccqwLvRe6tu9UrkQ~nfpOZFN4tpamyBuquIAAUZPAX2ysoMeJTFQi3YcGFqAywu-fVQpTOdO8AuGf33F4hBneiHOq6PuSd8oPMbDwDhNjhB6T5gPHE53mo9rU96i4Q5zpELEdEhLqqe8w__&Key-Pair-Id=K38HBHX5LX3X2H';

async function main() {
  console.log('📤 Uploading V2 Intro Video to Cloudinary...');
  
  try {
    const result = await cloudinary.uploader.upload(VIDEO_URL, {
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
