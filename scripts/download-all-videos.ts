import https from 'https';
import fs from 'fs';
import path from 'path';

const HEYGEN_API_KEY = 'sk_V2_hgu_knMBHTR5eZS_Fh7oPDiRF6jLhvQXFPVXnNlMNG7PkjRj';
const ACADEMY_ID_FILE = path.join(process.cwd(), 'academy-video-ids.json');
const PLATFORM_ID_FILE = path.join(process.cwd(), 'video-generation-ids.json');
const BASE_DIR = path.join(process.cwd(), 'public/content/training_videos');

// Load IDs
let videoIds: Record<string, string> = {};

if (fs.existsSync(ACADEMY_ID_FILE)) {
  const academyIds = JSON.parse(fs.readFileSync(ACADEMY_ID_FILE, 'utf8'));
  videoIds = { ...videoIds, ...academyIds };
}

if (fs.existsSync(PLATFORM_ID_FILE)) {
  const platformIds = JSON.parse(fs.readFileSync(PLATFORM_ID_FILE, 'utf8'));
  videoIds = { ...videoIds, ...platformIds };
}

if (Object.keys(videoIds).length === 0) {
  console.error('No video IDs found in either file.');
  process.exit(1);
}

function getTargetDir(key: string): string {
  const lowerKey = key.toLowerCase();
  
  // Academy
  if (lowerKey.includes('adhd')) return path.join(BASE_DIR, 'adhd');
  if (lowerKey.includes('autism')) return path.join(BASE_DIR, 'autism');
  if (lowerKey.includes('dyslexia')) return path.join(BASE_DIR, 'dyslexia');
  
  // Platform / Features
  if (lowerKey.includes('la-') || lowerKey.includes('admin')) return path.join(BASE_DIR, 'la-portal');
  if (lowerKey.includes('parent-')) return path.join(BASE_DIR, 'parent-portal');
  if (lowerKey.includes('ehcp-')) return path.join(BASE_DIR, 'ehcp');
  if (lowerKey.includes('help-')) return path.join(BASE_DIR, 'help-centre');
  if (lowerKey.includes('feature-')) return path.join(BASE_DIR, 'features');
  if (lowerKey.includes('compliance-')) return path.join(BASE_DIR, 'compliance');
  if (lowerKey.includes('assessment-')) return path.join(BASE_DIR, 'assessment');
  if (lowerKey.includes('innovation-')) return path.join(BASE_DIR, 'innovation');
  
  // Specific overrides based on key names in heygen-video-urls.ts
  if (key === 'platform-introduction') return BASE_DIR; // Root
  if (key === 'school-senco-portal') return path.join(BASE_DIR, 'misc');
  
  return path.join(BASE_DIR, 'misc');
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function checkStatus(videoId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.heygen.com',
      path: `/v1/video_status.get?video_id=${videoId}`,
      method: 'GET',
      headers: {
        'X-Api-Key': HEYGEN_API_KEY,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

function downloadVideo(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${destPath}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function main() {
  const entries = Object.entries(videoIds);
  console.log(`Tracking ${entries.length} videos...`);

  let pending = [...entries] as [string, string][];

  // Initial check loop
  while (pending.length > 0) {
    console.log(`\nChecking ${pending.length} pending videos...`);
    const nextPending: [string, string][] = [];

    for (const [key, id] of pending) {
      const targetDir = getTargetDir(key);
      ensureDir(targetDir);
      const destPath = path.join(targetDir, `${key}.mp4`);

      if (fs.existsSync(destPath)) {
        // console.log(`Exists: ${key}`);
        continue;
      }

      try {
        const status = await checkStatus(id);
        
        if (status.data && status.data.status === 'completed') {
          console.log(`COMPLETED: ${key}`);
          await downloadVideo(status.data.video_url, destPath);
        } else if (status.data && status.data.status === 'failed') {
          console.error(`FAILED: ${key} - ${status.data.error}`);
        } else {
          console.log(`Processing: ${key} (${status.data?.status || 'unknown'})`);
          nextPending.push([key, id]);
        }
      } catch (e) {
        console.error(`Error checking ${key}:`, e);
        nextPending.push([key, id]);
      }
      
      // Rate limit protection
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    if (nextPending.length > 0) {
      console.log('Waiting 30 seconds before next check...');
      pending = nextPending;
      await new Promise(resolve => setTimeout(resolve, 30000));
    } else {
      pending = [];
    }
  }
  
  console.log('All downloads complete!');
}

main().catch(console.error);
