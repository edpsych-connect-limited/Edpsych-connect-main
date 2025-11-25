
import fs from 'fs';
import path from 'path';

// CONFIGURATION
const API_KEY = process.env.HEYGEN_API_KEY || 'sk_V2_hgu_ky346mdR1EZ_sepM85TUnIexIOSuzpiVI5gXaqMhWDo1';
const API_URL = 'https://api.heygen.com/v2/video/generate';
const WEBHOOK_URL = 'https://edpsychconnect.com/webhook';
const CSV_FILE = path.join(process.cwd(), 'video_scripts', 'all_scripts.csv');
const OUTPUT_LOG = path.join(process.cwd(), 'video_scripts', 'generation_log.txt');

// MAPPINGS
let AVATARS: Record<string, string> = {
  'Male': 'Aditya_public_4', 
  'Female': 'Abigail_expressive_2024112501' 
};

let VOICES: Record<string, string> = {
  'Male': 'f38a635bee7a4d1f9b0a654a31d050d2',
  'Female': 'e0cc82c22f414c95b1f25696c732f058'
};

const MISSING_TITLES = [
  'Dyslexia Intervention Strategies - Structured Literacy Approach: Principles and Framework - Multisensory Teaching: Engaging All Pathways',
  'Dyslexia Intervention Strategies - Phonological Awareness: Foundation for Reading - What is Phonological Awareness? Continuum of Skills',
  'Dyslexia Intervention Strategies - Reading Comprehension: Beyond Decoding - Simple View of Reading: Decoding × Comprehension'
];

async function generateVideo(script: string, gender: 'Male' | 'Female', title: string) {
  const avatarId = AVATARS[gender] || AVATARS['Female'];
  const voiceId = VOICES[gender] || VOICES['Female'];

  const payload = {
    video_inputs: [
      {
        character: {
          type: 'avatar',
          avatar_id: avatarId,
          scale: 1.0
        },
        voice: {
          type: 'text',
          input_text: script,
          voice_id: voiceId
        }
      }
    ],
    test: false,
    aspect_ratio: "16:9",
    title: title,
    callback_url: WEBHOOK_URL
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'X-Api-Key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

async function main() {
  console.log('🎬 Retrying Missing Videos...');

  const content = fs.readFileSync(CSV_FILE, 'utf-8');
  const rows = content.split('\n').slice(1).filter(row => row.trim().length > 0);

  for (const row of rows) {
    const matches = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    if (!matches || matches.length < 6) continue;

    const cleanMatches = matches.map(m => m.replace(/^"|"$/g, '').replace(/""/g, '"'));
    const [course, module, lesson, _instructor, gender, script] = cleanMatches;
    const title = `${course} - ${module} - ${lesson}`;

    if (!MISSING_TITLES.includes(title)) continue;

    console.log(`\n🎥 Retrying: ${title}`);

    try {
      const result: any = await generateVideo(script, gender as 'Male' | 'Female', title);
      const videoId = result.data?.video_id || 'Unknown ID';
      console.log(`   ✅ Success! Video ID: ${videoId}`);
      
      fs.appendFileSync(OUTPUT_LOG, `${new Date().toISOString()} | SUCCESS | ${videoId} | ${title}\n`);
      
      console.log('   ⏳ Waiting 5 seconds...');
      await new Promise(resolve => setTimeout(resolve, 5000)); 

    } catch (error: any) {
      console.error(`   ❌ Failed: ${error.message}`);
      fs.appendFileSync(OUTPUT_LOG, `${new Date().toISOString()} | FAILED | ${error.message} | ${title}\n`);
    }
  }
}

main();
