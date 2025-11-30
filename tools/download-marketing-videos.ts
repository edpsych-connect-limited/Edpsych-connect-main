/**
 * Download Marketing Videos from HeyGen
 * 
 * This downloads the marketing/feature spotlight videos to local storage
 * so they work without HeyGen's servers being available.
 */

import * as fs from 'fs';
import * as path from 'path';

const API_KEY: string = process.env.HEYGEN_API_KEY || '';
if (!API_KEY) {
  console.error('❌ Error: HEYGEN_API_KEY environment variable is not set.');
  process.exit(1);
}

interface VideoMapping {
  id: string;
  heygenId: string;
  title: string;
  localPath: string;
}

const MARKETING_VIDEOS: VideoMapping[] = [
  {
    id: 'platform-introduction',
    heygenId: '4db447c48f65403e991e37ec0be981d6',
    title: 'Welcome to EdPsych Connect World',
    localPath: '/content/training_videos/marketing/platform-introduction.mp4',
  },
  {
    id: 'data-autonomy',
    heygenId: '99735ae8bf3d410fb73ee651d8fac4f7',
    title: 'Data Autonomy & Trust',
    localPath: '/content/training_videos/marketing/data-autonomy.mp4',
  },
  {
    id: 'no-child-left-behind',
    heygenId: '70ec101b44744460a79c70cee1573bb0',
    title: 'No Child Left Behind',
    localPath: '/content/training_videos/marketing/no-child-left-behind.mp4',
  },
  {
    id: 'gamification-integrity',
    heygenId: '810c3c4bdd644530b498f2dff546409a',
    title: 'Gamification Integrity',
    localPath: '/content/training_videos/marketing/gamification-integrity.mp4',
  },
];

const ONBOARDING_VIDEOS: VideoMapping[] = [
  {
    id: 'onboarding-welcome',
    heygenId: 'c66df7ae0048468b943488729aa8320b',
    title: 'Welcome to Your EdPsych Connect Journey',
    localPath: '/content/training_videos/onboarding/onboarding-welcome.mp4',
  },
  {
    id: 'onboarding-role-selection',
    heygenId: '0286cbb4759e4c1d9a8714782d2fd5d2',
    title: 'Choosing Your Role',
    localPath: '/content/training_videos/onboarding/onboarding-role-selection.mp4',
  },
  {
    id: 'onboarding-goals',
    heygenId: 'b9b5ddb775774d708f9fc3455bec5f97',
    title: 'Setting Your Goals',
    localPath: '/content/training_videos/onboarding/onboarding-goals.mp4',
  },
  {
    id: 'onboarding-platform-tour',
    heygenId: '47bb7f76c29c4cdfadfbf4fa7cfe624c',
    title: 'Your Platform Tour',
    localPath: '/content/training_videos/onboarding/onboarding-platform-tour.mp4',
  },
  {
    id: 'onboarding-knowledge-check',
    heygenId: 'c6ca50ba25044e65b0d789e54d193f0a',
    title: 'Quick Knowledge Check',
    localPath: '/content/training_videos/onboarding/onboarding-knowledge-check.mp4',
  },
  {
    id: 'onboarding-completion',
    heygenId: '264e3124a1154aaca4efd96f139732c4',
    title: "You're All Set!",
    localPath: '/content/training_videos/onboarding/onboarding-completion.mp4',
  },
];

async function getVideoStatus(videoId: string) {
  const response = await fetch(
    `https://api.heygen.com/v1/video_status.get?video_id=${videoId}`,
    {
      headers: {
        'X-Api-Key': API_KEY,
      },
    }
  );
  return response.json();
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

async function downloadVideos(videos: VideoMapping[], category: string) {
  console.log(`\n📥 Downloading ${category} Videos...`);
  console.log('='.repeat(60));

  const publicDir = path.join(process.cwd(), 'public');
  let downloaded = 0;
  let failed = 0;
  let skipped = 0;

  for (const video of videos) {
    const destPath = path.join(publicDir, video.localPath);

    // Check if already downloaded
    if (fs.existsSync(destPath)) {
      const stats = fs.statSync(destPath);
      if (stats.size > 100000) {
        console.log(`⏭️  Skipping ${video.id} (already downloaded - ${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
        skipped++;
        continue;
      }
    }

    console.log(`📥 Downloading: ${video.title}`);
    console.log(`   HeyGen ID: ${video.heygenId}`);

    try {
      const status = await getVideoStatus(video.heygenId);

      if (status.error) {
        console.log(`   ❌ API Error: ${status.error.message}`);
        failed++;
        continue;
      }

      if (status.data?.status !== 'completed') {
        console.log(`   ⚠️  Video not ready: ${status.data?.status}`);
        failed++;
        continue;
      }

      if (!status.data?.video_url) {
        console.log(`   ❌ No video URL available`);
        failed++;
        continue;
      }

      console.log(`   📥 Downloading from HeyGen...`);
      await downloadFile(status.data.video_url, destPath);

      const stats = fs.statSync(destPath);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
      console.log(`   ✅ Downloaded: ${sizeMB} MB to ${video.localPath}`);

      downloaded++;

      // Rate limit
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.log(`   ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      failed++;
    }
  }

  return { downloaded, failed, skipped };
}

async function main() {
  console.log('🎬 Marketing & Onboarding Video Downloader');
  console.log('='.repeat(60));
  console.log('This will download all marketing and onboarding videos');
  console.log('to local storage for 100% uptime (no HeyGen dependency).\n');

  // Create directories
  const publicDir = path.join(process.cwd(), 'public');
  fs.mkdirSync(path.join(publicDir, 'content/training_videos/marketing'), { recursive: true });
  fs.mkdirSync(path.join(publicDir, 'content/training_videos/onboarding'), { recursive: true });

  const marketingResults = await downloadVideos(MARKETING_VIDEOS, 'Marketing');
  const onboardingResults = await downloadVideos(ONBOARDING_VIDEOS, 'Onboarding');

  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`Marketing Videos:`);
  console.log(`  ✅ Downloaded: ${marketingResults.downloaded}`);
  console.log(`  ⏭️  Skipped: ${marketingResults.skipped}`);
  console.log(`  ❌ Failed: ${marketingResults.failed}`);
  console.log(`Onboarding Videos:`);
  console.log(`  ✅ Downloaded: ${onboardingResults.downloaded}`);
  console.log(`  ⏭️  Skipped: ${onboardingResults.skipped}`);
  console.log(`  ❌ Failed: ${onboardingResults.failed}`);
  console.log('='.repeat(60));
  
  // Update the video URLs file
  console.log('\n📝 Updating video URL mappings...');
  
  const localPaths: Record<string, string> = {};
  [...MARKETING_VIDEOS, ...ONBOARDING_VIDEOS].forEach(v => {
    localPaths[v.id] = v.localPath;
  });
  
  console.log('Local video paths:', localPaths);
}

main().catch(console.error);
