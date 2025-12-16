import https from 'https';
import fs from 'fs';
import path from 'path';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

if (!HEYGEN_API_KEY) {
  throw new Error('HEYGEN_API_KEY environment variable is required');
}
const ID_FILE = path.join(process.cwd(), 'academy-video-ids.json');
const BASE_DIR = path.join(process.cwd(), 'public/content/training_videos');

if (!fs.existsSync(ID_FILE)) {
  console.error('No video IDs found.');
  process.exit(1);
}

const videoIds = JSON.parse(fs.readFileSync(ID_FILE, 'utf8'));

function getTargetDir(key: string): string {
  const lowerKey = key.toLowerCase();
  if (lowerKey.includes('adhd')) return path.join(BASE_DIR, 'adhd');
  if (lowerKey.includes('autism')) return path.join(BASE_DIR, 'autism');
  if (lowerKey.includes('dyslexia')) return path.join(BASE_DIR, 'dyslexia');
  return path.join(BASE_DIR, 'academy_misc');
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

  let pending = [...entries] as [string, unknown][];

  while (pending.length > 0) {
    console.log(`\nChecking ${pending.length} pending videos...`);
    const nextPending: [string, unknown][] = [];

    for (const [key, id] of pending) {
      const targetDir = getTargetDir(key);
      ensureDir(targetDir);
      const destPath = path.join(targetDir, `${key}.mp4`);

      if (fs.existsSync(destPath)) {
        console.log(`Exists: ${key}`);
        continue;
      }

      try {
        const status = await checkStatus(id as string);
        
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
      await new Promise(resolve => setTimeout(resolve, 500));
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
