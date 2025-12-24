import https from 'https';
import fs from 'fs';
import path from 'path';

import { assertApprovedDrScottCasting } from '../tools/lib/dr-scott-heygen';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

if (!HEYGEN_API_KEY) {
  throw new Error('HEYGEN_API_KEY environment variable is required');
}
const AVATAR_ID = process.env.HEYGEN_DR_SCOTT_AVATAR_ID || '';
const VOICE_ID = process.env.HEYGEN_DR_SCOTT_VOICE_ID || '';

if (!AVATAR_ID) {
  throw new Error('HEYGEN_DR_SCOTT_AVATAR_ID environment variable is required');
}

if (!VOICE_ID) {
  throw new Error('HEYGEN_DR_SCOTT_VOICE_ID environment variable is required');
}

assertApprovedDrScottCasting({
  avatarId: AVATAR_ID,
  voiceId: VOICE_ID,
  context: 'scripts/generate-academy-videos',
});

const VIDEO_SCRIPTS_DIR = path.join(process.cwd(), 'video_scripts');
const ID_FILE = path.join(process.cwd(), 'academy-video-ids.json');

// Regex replacements for abbreviations
const REPLACEMENTS: [RegExp, string][] = [
  [/\bADHD\b/g, "Attention Deficit Hyperactivity Disorder"],
  [/\bASD\b/g, "Autism Spectrum Disorder"],
  [/\bSENCO\b/g, "Special Educational Needs Coordinator"],
  [/\bEHCP\b/g, "Education, Health and Care Plan"],
  [/\bEP\b/g, "Educational Psychologist"],
  [/\bLA\b/g, "Local Authority"],
  [/\bSEMH\b/g, "Social, Emotional and Mental Health"],
  [/\bSLCN\b/g, "Speech, Language and Communication Needs"],
  [/\bSpLD\b/g, "Specific Learning Difficulty"],
  [/\bMLD\b/g, "Moderate Learning Difficulty"],
  [/\bSLD\b/g, "Severe Learning Difficulty"],
  [/\bPMLD\b/g, "Profound and Multiple Learning Difficulty"],
  [/\bHI\b/g, "Hearing Impairment"],
  [/\bVI\b/g, "Visual Impairment"],
  [/\bMSI\b/g, "Multi-Sensory Impairment"],
  [/\bPD\b/g, "Physical Disability"],
  [/\bKS1\b/g, "Key Stage 1"],
  [/\bKS2\b/g, "Key Stage 2"],
  [/\bKS3\b/g, "Key Stage 3"],
  [/\bKS4\b/g, "Key Stage 4"],
  [/\bTA\b/g, "Teaching Assistant"],
  [/\bLSA\b/g, "Learning Support Assistant"],
  [/\bIEP\b/g, "Individual Education Plan"],
  [/\bPEP\b/g, "Personal Education Plan"],
  [/\bLAC\b/g, "Looked After Children"],
  [/\bEAL\b/g, "English as an Additional Language"],
  [/\bOT\b/g, "Occupational Therapy"],
  [/\bSALT\b/g, "Speech and Language Therapy"],
  [/\bCAMHS\b/g, "Child and Adolescent Mental Health Services"],
];

function refineScript(script: string): string {
  let refined = script;
  for (const [regex, replacement] of REPLACEMENTS) {
    refined = refined.replace(regex, replacement);
  }
  return refined;
}

function generateVideo(title: string, script: string): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log(`Generating: ${title}...`);

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
            input_text: script,
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
      title: title
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
            console.log(`SUCCESS: ${title} -> ${json.data.video_id}`);
            resolve(json.data.video_id);
          } else {
            console.error(`FAILED: ${title}`, json);
            reject(new Error(json.error?.message || 'Unknown error'));
          }
        } catch (e) {
          console.error(`ERROR parsing response for ${title}:`, e);
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`REQUEST ERROR for ${title}:`, e);
      reject(e);
    });

    req.write(JSON.stringify(payload));
    req.end();
  });
}

async function main() {
  let generatedIds: Record<string, string> = {};
  if (fs.existsSync(ID_FILE)) {
    generatedIds = JSON.parse(fs.readFileSync(ID_FILE, 'utf8'));
  }

  const subdirs = fs.readdirSync(VIDEO_SCRIPTS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const subdir of subdirs) {
    const dirPath = path.join(VIDEO_SCRIPTS_DIR, subdir);
    const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.txt'));

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Parse content
      const parts = content.split('---------------------------------------------------');
      if (parts.length < 2) {
        console.warn(`SKIPPING: ${file} (Invalid format)`);
        continue;
      }

      const rawScript = parts[1].trim();
      const refinedScript = refineScript(rawScript);
      
      // Generate ID from filename (remove extension)
      const videoKey = file.replace('.txt', '');
      
      if (generatedIds[videoKey]) {
        console.log(`SKIPPING: ${videoKey} (Already generated)`);
        continue;
      }

      try {
        const videoId = await generateVideo(videoKey, refinedScript);
        generatedIds[videoKey] = videoId;
        fs.writeFileSync(ID_FILE, JSON.stringify(generatedIds, null, 2));
        
        // Sleep to avoid rate limits (optional, but good practice)
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.error(`FAILED to generate ${videoKey}:`, e);
      }
    }
  }
}

main().catch(console.error);
