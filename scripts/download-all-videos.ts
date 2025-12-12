import https from 'https';
import fs from 'fs';
import path from 'path';

const HEYGEN_API_KEY = 'sk_V2_hgu_knMBHTR5eZS_Fh7oPDiRF6jLhvQXFPVXnNlMNG7PkjRj';
const ID_FILE = path.join(process.cwd(), 'video-generation-ids.json');
const BASE_DIR = path.join(process.cwd(), 'public/content/training_videos');

if (!fs.existsSync(ID_FILE)) {
  console.error('No video IDs found.');
  process.exit(1);
}

const videoIds = JSON.parse(fs.readFileSync(ID_FILE, 'utf8'));

function getTargetDir(key) {
  if (key === 'platform-introduction') return BASE_DIR;
  if (key.startsWith('ehcp-')) return path.join(BASE_DIR, 'ehcp');
  if (key.startsWith('help-')) return path.join(BASE_DIR, 'help-centre');
  if (key.startsWith('la-')) return path.join(BASE_DIR, 'la-portal');
  if (key.startsWith('parent-')) return path.join(BASE_DIR, 'parent-portal');
  if (key.startsWith('compliance-')) return path.join(BASE_DIR, 'compliance');
  if (key.startsWith('assessment-')) return path.join(BASE_DIR, 'assessment');
  if (key.startsWith('innovation-')) return path.join(BASE_DIR, 'innovation');
  return path.join(BASE_DIR, 'misc');
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function checkStatus(videoId) {
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

function downloadVideo(url, destPath) {
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

  let pending = [...entries];

  while (pending.length > 0) {
    console.log(`\nChecking ${pending.length} pending videos...`);
    const nextPending = [];

    for (const [key, id] of pending) {
      const targetDir = getTargetDir(key);
      ensureDir(targetDir);
      const destPath = path.join(targetDir, `${key}.mp4`);

      // Skip if already exists (optional, but good for resuming)
      // if (fs.existsSync(destPath)) {
      //   console.log(`[${key}] Already downloaded.`);
      //   continue;
      // }

      try {
        const result = await checkStatus(id);
        const status = result.data?.status;
        
        if (status === 'completed') {
          const url = result.data.video_url;
          if (url) {
            console.log(`[${key}] Completed. Downloading...`);
            await downloadVideo(url, destPath);
          } else {
            console.error(`[${key}] Completed but no URL!`);
          }
        } else if (status === 'failed') {
          console.error(`[${key}] FAILED: ${result.data?.error}`);
        } else {
          console.log(`[${key}] ${status}`);
          nextPending.push([key, id]);
        }
      } catch (e) {
        console.error(`[${key}] Error:`, e.message);
        nextPending.push([key, id]);
      }
    }

    pending = nextPending;
    if (pending.length > 0) {
      console.log('Waiting 30 seconds...');
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
  }

  console.log('All downloads complete.');
}

main();
