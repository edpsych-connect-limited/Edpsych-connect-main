// @ts-nocheck
import https from 'https';
import fs from 'fs';
import path from 'path';
import { ALL_VIDEO_SCRIPTS } from '../video_scripts/world_class/comprehensive-video-scripts-v4-dr-scott';
import { INNOVATION_VIDEOS } from '../video_scripts/world_class/innovation-features-v4-dr-scott';

const HEYGEN_API_KEY = 'sk_V2_hgu_knMBHTR5eZS_Fh7oPDiRF6jLhvQXFPVXnNlMNG7PkjRj';
const AVATAR_ID = 'd680604a31f34ce096c84bed708774c3';
const VOICE_ID = '50d2a2a531d049719a0debbf82e1cf4c';

// Manual scripts that aren't in the TS files yet
const MANUAL_SCRIPTS = {
  'platform-introduction': {
    id: 'platform-introduction',
    title: 'Platform Introduction',
    script: `If you are watching this, you already know the truth. The system is not just broken; it is a maze. A fragmented, chaotic maze of emails, spreadsheets, and missed deadlines. And who gets lost in that maze? The children.

I am Dr. Scott I-Patrick. In over nine years as a practicing Child and Adolescent Educational Psychologist, and over twenty years in the field across different Local Authorities and schools, I have seen brilliant teachers burn out and desperate parents give up—not because they do not care, but because they are fighting a system that fights back.

So, we stopped trying to fix the broken pieces. We built a new engine. Think of EdPsych Connect not as another database, but as an Orchestration System. It is the 'Golden Thread' that ties the school, the family, and the Local Authority together.

While you sleep, our Safety Net Engine is awake. It scans every case. It looks for stagnation. It flags the quiet child who has not made progress in six weeks. It does not just store data; it acts on it.

We have turned the maze into a map. Let me show you how.`
  }
};

// Flatten all videos into a single list
const ALL_VIDEOS = {
  ...MANUAL_SCRIPTS,
  ...ALL_VIDEO_SCRIPTS.ehcp,
  ...ALL_VIDEO_SCRIPTS.helpCentre,
  ...ALL_VIDEO_SCRIPTS.laPortal,
  ...ALL_VIDEO_SCRIPTS.parentPortal,
  ...ALL_VIDEO_SCRIPTS.compliance,
  ...ALL_VIDEO_SCRIPTS.assessment,
  ...INNOVATION_VIDEOS
};

const ID_FILE = path.join(process.cwd(), 'video-generation-ids.json');
let generatedIds = {};

if (fs.existsSync(ID_FILE)) {
  generatedIds = JSON.parse(fs.readFileSync(ID_FILE, 'utf8'));
}

function generateVideo(key, video) {
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
      caption: true, // MANDATORY CAPTIONS
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
            resolve({ key, id: json.data.video_id });
          } else {
            console.error(`FAILED: ${key}`, json);
            resolve(null); // Resolve null to continue
          }
        } catch (e) {
          console.error(`ERROR parsing response for ${key}:`, e);
          resolve(null);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`REQUEST ERROR for ${key}:`, e);
      resolve(null);
    });

    req.write(JSON.stringify(payload));
    req.end();
  });
}

async function main() {
  const keys = Object.keys(ALL_VIDEOS);
  console.log(`Found ${keys.length} videos to generate.`);

  // We will process in batches to avoid rate limits
  const BATCH_SIZE = 1; // Conservative batch size
  const DELAY_MS = 5000; // 5 seconds between requests

  for (let i = 0; i < keys.length; i += BATCH_SIZE) {
    const batch = keys.slice(i, i + BATCH_SIZE);
    
    const promises = batch.map(key => {
        // Always regenerate as requested
        return generateVideo(key, ALL_VIDEOS[key]);
    });

    const results = await Promise.all(promises);

    results.forEach(r => {
      if (r) {
        generatedIds[r.key] = r.id;
      }
    });

    // Save progress after each batch
    fs.writeFileSync(ID_FILE, JSON.stringify(generatedIds, null, 2));

    if (i + BATCH_SIZE < keys.length) {
      console.log(`Waiting ${DELAY_MS}ms...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }

  console.log('All generation requests completed.');
}

main();
