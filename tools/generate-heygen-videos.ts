
import fs from 'fs';
import path from 'path';

// CONFIGURATION
// API key must be set via environment variable for security
const API_KEY_RAW: string = process.env.HEYGEN_API_KEY || '';
const API_URL = 'https://api.heygen.com/v2/video/generate';
// const AVATARS_API_URL = 'https://api.heygen.com/v2/avatars';
// const VOICES_API_URL = 'https://api.heygen.com/v2/voices';
const WEBHOOK_URL = 'https://edpsychconnect.com/webhook';
const CSV_FILE = path.join(process.cwd(), 'video_scripts', 'all_scripts.csv');
const OUTPUT_LOG = path.join(process.cwd(), 'video_scripts', 'generation_log.txt');

// MAPPINGS
// UK Voices and Professional Avatars
const MALE_AVATARS = ['Aditya_public_4', 'Adrian_public_3_20240312'];
const FEMALE_AVATARS = ['Abigail_expressive_2024112501', 'Adriana_BizTalk_Front_public'];

let VOICES: Record<string, string> = {
  'Male': 'aba5ce361bfa433480f4bf281cc4c4f9', // Oliver Bennett (UK)
  'Female': '2d5b0e6cf36f460aa7fc47e3eee4ba54' // Sonia - Warm (UK)
};

// Helper to get random avatar
function getRandomAvatar(gender: 'Male' | 'Female'): string {
    const list = gender === 'Male' ? MALE_AVATARS : FEMALE_AVATARS;
    return list[Math.floor(Math.random() * list.length)];
}

if (!API_KEY_RAW) {
  console.error('❌ Error: HEYGEN_API_KEY environment variable is not set.');
  process.exit(1);
}

// Safe to use now - we've checked it exists
const API_KEY: string = API_KEY_RAW;

// Removed unused fetch functions to clean up
// async function fetchAvatars() { ... }
// async function fetchVoices() { ... }

async function generateVideo(script: string, gender: 'Male' | 'Female', title: string) {
  const avatarId = getRandomAvatar(gender);
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
    test: false, // Changed to false to use paid credits and avoid trial limits
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
  console.log('🎬 Starting HeyGen Video Generation...');
  
  // Re-enabling dynamic fetch to get valid IDs for this account
  // await fetchAvatars();
  // await fetchVoices();

  if (!fs.existsSync(CSV_FILE)) {
    console.error(`❌ CSV file not found: ${CSV_FILE}`);
    process.exit(1);
  }

  const content = fs.readFileSync(CSV_FILE, 'utf-8');
  const rows = content.split('\n').slice(1).filter(row => row.trim().length > 0);

  console.log(`Found ${rows.length} scripts to process.`);

  // LIMIT FOR TESTING
  // const TEST_LIMIT = 1;
  const rowsToProcess = rows; // Process all rows
  console.log(`🚀 FULL MODE: Processing all ${rows.length} scripts.`);

  for (const row of rowsToProcess) {
    const matches = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    if (!matches || matches.length < 6) continue;

    const cleanMatches = matches.map(m => m.replace(/^"|"$/g, '').replace(/""/g, '"'));
    
    const [course, module, lesson, instructor, gender, script] = cleanMatches;
    const title = `${course} - ${module} - ${lesson}`;

    console.log(`\n🎥 Generating: ${title}`);
    console.log(`   Instructor: ${instructor} (${gender})`);

    try {
      const result: any = await generateVideo(script, gender as 'Male' | 'Female', title);
      const videoId = result.data?.video_id || 'Unknown ID';
      console.log(`   ✅ Success! Video ID: ${videoId}`);
      
      fs.appendFileSync(OUTPUT_LOG, `${new Date().toISOString()} | SUCCESS | ${videoId} | ${title}\n`);
      
      // Rate limiting protection - Increased to 5 seconds
      // Moved to outside try/catch
      // console.log('   ⏳ Waiting 5 seconds before next request...');
      // await new Promise(resolve => setTimeout(resolve, 5000)); 

    } catch (error: any) {
      console.error(`   ❌ Failed: ${error.message}`);
      fs.appendFileSync(OUTPUT_LOG, `${new Date().toISOString()} | FAILED | ${error.message} | ${title}\n`);
    }
    
    // Rate limiting protection - Increased to 5 seconds (Always wait)
    console.log('   ⏳ Waiting 5 seconds before next request...');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  console.log('\n✨ Generation Process Complete!');
  console.log(`📄 Check ${OUTPUT_LOG} for details.`);
}

main();
