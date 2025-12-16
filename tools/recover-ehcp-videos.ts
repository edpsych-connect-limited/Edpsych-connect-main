/**
 * Recovery Script: Check HeyGen video status and upload to Cloudinary
 * EdPsych Connect - EHCP Management Modules
 */

import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';

// Configuration
const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!HEYGEN_API_KEY) {
  throw new Error('HEYGEN_API_KEY environment variable is required');
}

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  throw new Error('CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET must be set');
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

// Video IDs from the previous run
const VIDEO_IDS = [
  { name: 'EHCP Modules Hub Overview', slug: 'ehcp-modules-hub-overview', heygenId: '4a6bb2e9083542c185cebb1609d6d1cf' },
  { name: 'Annual Reviews Mastery', slug: 'annual-reviews-mastery', heygenId: '24b893afc8f44f9c8d4813328098c87f' },
  { name: 'Mediation and Tribunal Navigation', slug: 'mediation-tribunal-navigation', heygenId: '2fb25e1c05c848c2880e52d41c21c5ef' },
  { name: 'Phase Transfers Mastery', slug: 'phase-transfers-mastery', heygenId: '74fb795821a046ed845425d9c5e53de1' },
  { name: 'Compliance and Risk AI', slug: 'compliance-risk-ai', heygenId: 'b78522c6f075420ca3e5ed52bacc225d' },
  { name: 'Resource Costing and Funding', slug: 'resource-costing-funding', heygenId: '41805d3e583d4ca4b1d3f46687f6ac76' },
  { name: 'Golden Thread Coherence', slug: 'golden-thread-coherence', heygenId: '51297c420ab84cfd99847e5b54e80e74' },
  { name: 'SEN2 Returns Automation', slug: 'sen2-returns-automation', heygenId: '3edc74c4a40548ec8866fcc19caf0126' }
];

interface VideoStatus {
  name: string;
  slug: string;
  heygenId: string;
  status: string;
  videoUrl?: string;
  cloudinaryUrl?: string;
}

async function checkVideoStatus(videoId: string): Promise<{ status: string; videoUrl?: string }> {
  try {
    const response = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': REQUIRED_HEYGEN_API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`  ❌ API error for ${videoId}: ${response.status}`);
      return { status: 'error' };
    }

    const data = await response.json() as { data: { status: string; video_url?: string } };
    return {
      status: data.data.status,
      videoUrl: data.data.video_url
    };
  } catch (error) {
    console.error(`  ❌ Error checking status for ${videoId}:`, error);
    return { status: 'error' };
  }
}

async function uploadToCloudinary(videoUrl: string, publicId: string): Promise<string | null> {
  try {
    console.log(`  📤 Uploading to Cloudinary as ${publicId}...`);
    
    const result = await cloudinary.uploader.upload(videoUrl, {
      resource_type: 'video',
      public_id: `edpsych-connect/ehcp-modules/${publicId}`,
      folder: 'edpsych-connect/ehcp-modules',
      overwrite: true,
      transformation: [
        { quality: 'auto:best' }
      ]
    });

    console.log(`  ✅ Uploaded: ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error(`  ❌ Cloudinary upload failed:`, error);
    return null;
  }
}

async function main() {
  console.log('\n════════════════════════════════════════════════════════════════════════════════');
  console.log('🔄 EHCP Video Recovery - Check Status & Upload to Cloudinary');
  console.log('   EdPsych Connect - World Class Enterprise Grade');
  console.log('════════════════════════════════════════════════════════════════════════════════\n');

  const results: VideoStatus[] = [];
  let pendingCount = 0;
  let completedCount = 0;
  let uploadedCount = 0;

  console.log('📊 Checking HeyGen status for all 8 videos...\n');

  for (const video of VIDEO_IDS) {
    console.log(`[${VIDEO_IDS.indexOf(video) + 1}/8] ${video.name}`);
    
    const statusResult = await checkVideoStatus(video.heygenId);
    const videoStatus: VideoStatus = {
      ...video,
      status: statusResult.status,
      videoUrl: statusResult.videoUrl
    };

    if (statusResult.status === 'completed' && statusResult.videoUrl) {
      console.log(`  ✅ Status: COMPLETED`);
      completedCount++;

      // Upload to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(statusResult.videoUrl, video.slug);
      if (cloudinaryUrl) {
        videoStatus.cloudinaryUrl = cloudinaryUrl;
        uploadedCount++;
      }
    } else if (statusResult.status === 'processing' || statusResult.status === 'waiting') {
      console.log(`  ⏳ Status: ${statusResult.status.toUpperCase()}`);
      pendingCount++;
    } else if (statusResult.status === 'failed') {
      console.log(`  ❌ Status: FAILED`);
    } else {
      console.log(`  ⚠️ Status: ${statusResult.status}`);
    }

    results.push(videoStatus);

    // Small delay between API calls
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  console.log('\n════════════════════════════════════════════════════════════════════════════════');
  console.log('📊 SUMMARY');
  console.log('════════════════════════════════════════════════════════════════════════════════');
  console.log(`  ✅ Completed: ${completedCount}/8`);
  console.log(`  📤 Uploaded to Cloudinary: ${uploadedCount}/8`);
  console.log(`  ⏳ Still Processing: ${pendingCount}/8`);

  // Save results
  const outputPath = path.join(process.cwd(), 'ehcp-video-status.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Results saved to: ${outputPath}`);

  // Update cloudinary-video-urls.json if we have uploads
  if (uploadedCount > 0) {
    const cloudinaryUrlsPath = path.join(process.cwd(), 'cloudinary-video-urls.json');
    let existingUrls: Record<string, string> = {};
    
    if (fs.existsSync(cloudinaryUrlsPath)) {
      existingUrls = JSON.parse(fs.readFileSync(cloudinaryUrlsPath, 'utf-8'));
    }

    for (const result of results) {
      if (result.cloudinaryUrl) {
        existingUrls[result.slug] = result.cloudinaryUrl;
      }
    }

    fs.writeFileSync(cloudinaryUrlsPath, JSON.stringify(existingUrls, null, 2));
    console.log(`📄 Updated: cloudinary-video-urls.json`);
  }

  // If still processing, provide guidance
  if (pendingCount > 0) {
    console.log('\n⏳ Some videos are still processing. Run this script again in a few minutes.');
  } else if (completedCount === 8 && uploadedCount === 8) {
    console.log('\n🎉 All 8 EHCP module videos completed and uploaded to Cloudinary!');
  }

  // Print Cloudinary URLs for completed videos
  const uploadedVideos = results.filter(r => r.cloudinaryUrl);
  if (uploadedVideos.length > 0) {
    console.log('\n────────────────────────────────────────────────────────────────────────────────');
    console.log('📹 CLOUDINARY VIDEO URLs');
    console.log('────────────────────────────────────────────────────────────────────────────────');
    for (const video of uploadedVideos) {
      console.log(`  ${video.name}:`);
      console.log(`    ${video.cloudinaryUrl}`);
    }
  }
}

main().catch(console.error);
