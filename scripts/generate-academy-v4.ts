import https from 'https';
import fs from 'fs';
import path from 'path';
import { COMPREHENSIVE_TRAINING_VIDEOS } from '../video_scripts/world_class/comprehensive-training-scripts-v4-dr-scott';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

if (!HEYGEN_API_KEY) {
  throw new Error('HEYGEN_API_KEY environment variable is required');
}
const AVATAR_ID = 'd680604a31f34ce096c84bed708774c3'; // Dr. Scott
const VOICE_ID = '50d2a2a531d049719a0debbf82e1cf4c'; // Dr. Scott Voice

const ID_FILE = path.join(process.cwd(), 'academy-video-ids.json');
let generatedIds: Record<string, string> = {};

if (fs.existsSync(ID_FILE)) {
  generatedIds = JSON.parse(fs.readFileSync(ID_FILE, 'utf8'));
}

function generateVideo(key: string, video: { title: string, script: string }): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log(`Generating: ${video.title} (${key})...`);

    const payload = {
      video_inputs: [
        {
          character: {
            type: 'avatar',
            avatar_id: AVATAR_ID,
            avatar_style: 'normal',
          },
          voice: {
            type: 'text',
            voice_id: VOICE_ID,
            input_text: video.script,
          },
          background: {
            type: 'color',
            value: '#FAFAFA',
          },
        },
      ],
      dimension: {
        width: 1920,
        height: 1080,
      },
      aspect_ratio: '16:9',
      test: false,
      caption: true,
      title: video.title
    };

    const options = {
      hostname: 'api.heygen.com',
      path: '/v2/video/generate',
      method: 'POST',
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
          if (json.data && json.data.video_id) {
            console.log(`SUCCESS: ${key} -> ${json.data.video_id}`);
            resolve(json.data.video_id);
          } else {
            console.error(`FAILED: ${key}`, json);
            reject(new Error(json.error?.message || 'Unknown error'));
          }
        } catch (e) {
          console.error(`ERROR parsing response for ${key}:`, e);
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`REQUEST ERROR for ${key}:`, e);
      reject(e);
    });

    req.write(JSON.stringify(payload));
    req.end();
  });
}

async function main() {
  const entries = Object.entries(COMPREHENSIVE_TRAINING_VIDEOS);
  console.log(`Found ${entries.length} Academy videos to generate.`);

  for (const [key, video] of entries) {
    if (generatedIds[key]) {
      console.log(`SKIPPING: ${key} (Already generated)`);
      continue;
    }

    try {
      const videoId = await generateVideo(key, video);
      generatedIds[key] = videoId;
      fs.writeFileSync(ID_FILE, JSON.stringify(generatedIds, null, 2));
      
      // Rate limit protection (HeyGen is strict)
      console.log('Waiting 5000ms...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (e) {
      console.error(`Failed to generate ${key}:`, e);
    }
  }
  
  console.log('Academy generation complete!');
}

main().catch(console.error);
