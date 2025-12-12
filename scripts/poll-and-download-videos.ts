import https from 'https';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

const HEYGEN_API_KEY = 'sk_V2_hgu_knMBHTR5eZS_Fh7oPDiRF6jLhvQXFPVXnNlMNG7PkjRj';

const VIDEOS = [
  {
    id: 'ae4b2badfefb4fbca7acf1f97f60a67a',
    name: 'la-dashboard-overview',
    dir: 'public/content/training_videos/la-portal'
  },
  {
    id: '7a6420de424a477eba6a29ad99a3271d',
    name: 'school-senco-portal',
    dir: 'public/content/training_videos/help-centre'
  },
  {
    id: '534e819672fe4a8c996f9ace67e58c3d',
    name: 'parent-portal-welcome',
    dir: 'public/content/training_videos/parent-portal'
  }
];

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
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

async function poll() {
  console.log('Starting polling for 3 videos...');
  
  // Ensure directories exist
  VIDEOS.forEach(v => ensureDir(v.dir));

  let pending = [...VIDEOS];

  while (pending.length > 0) {
    console.log(`\nChecking ${pending.length} pending videos...`);
    
    const nextPending = [];

    for (const video of pending) {
      try {
        const result = await checkStatus(video.id);
        const status = result.data?.status;
        
        console.log(`[${video.name}] Status: ${status}`);

        if (status === 'completed') {
          const url = result.data.video_url;
          if (url) {
            const destPath = path.join(video.dir, `${video.name}.mp4`);
            console.log(`Downloading ${video.name} from ${url}...`);
            await downloadVideo(url, destPath);
          } else {
            console.error(`[${video.name}] Completed but no URL found!`);
          }
        } else if (status === 'failed') {
          console.error(`[${video.name}] FAILED: ${result.data?.error}`);
        } else {
          nextPending.push(video);
        }
      } catch (e) {
        console.error(`[${video.name}] Error checking status:`, e);
        nextPending.push(video); // Retry on error
      }
    }

    pending = nextPending;

    if (pending.length > 0) {
      console.log('Waiting 30 seconds...');
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
  }

  console.log('\nAll videos processed.');
}

poll();
