
import fs from 'fs';
import path from 'path';
import https from 'https';

// CONFIGURATION
const API_KEY = process.env.HEYGEN_API_KEY;
const API_URL = 'https://api.heygen.com/v2/video/generate';
const CSV_FILE = path.join(process.cwd(), 'video_scripts', 'all_scripts.csv');
const OUTPUT_LOG = path.join(process.cwd(), 'video_scripts', 'generation_log.txt');

// AVATAR MAPPING (You can customize these IDs)
// These are placeholder IDs. You should replace them with your preferred Avatar IDs from HeyGen.
const AVATARS = {
  'Male': 'avatar_id_male_placeholder', 
  'Female': 'avatar_id_female_placeholder' 
};

// VOICE MAPPING
const VOICES = {
  'Male': 'en-US-ChristopherNeural',
  'Female': 'en-US-JennyNeural'
};

if (!API_KEY) {
  console.error('❌ Error: HEYGEN_API_KEY environment variable is not set.');
  console.error('   Please run: export HEYGEN_API_KEY="your_api_key" && npx tsx tools/generate-heygen-videos.ts');
  process.exit(1);
}

async function generateVideo(script: string, gender: 'Male' | 'Female', title: string) {
  return new Promise((resolve, reject) => {
    const avatarId = AVATARS[gender] || AVATARS['Female'];
    const voiceId = VOICES[gender] || VOICES['Female'];

    const payload = JSON.stringify({
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
      test: true, // Set to false for production (credits will be deducted)
      aspect_ratio: "16:9",
      title: title
    });

    const options = {
      method: 'POST',
      headers: {
        'X-Api-Key': API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': payload.length
      }
    };

    const req = https.request(API_URL, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const response = JSON.parse(data);
            resolve(response);
          } catch (_e) {
            reject(new Error('Failed to parse response'));
          }
        } else {
          reject(new Error(`API Error: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(payload);
    req.end();
  });
}

async function main() {
  console.log('🎬 Starting HeyGen Video Generation...');
  
  if (!fs.existsSync(CSV_FILE)) {
    console.error(`❌ CSV file not found: ${CSV_FILE}`);
    console.error('   Please run: npx tsx tools/export-course-scripts.ts first');
    process.exit(1);
  }

  const content = fs.readFileSync(CSV_FILE, 'utf-8');
  // Simple CSV parser (assumes no newlines in quoted fields for simplicity, though our export handles it reasonably well)
  // For robustness, we skip the header
  const rows = content.split('\n').slice(1).filter(row => row.trim().length > 0);

  console.log(`Found ${rows.length} scripts to process.`);

  for (const row of rows) {
    // Basic CSV parsing logic to handle quoted strings
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
      
      // Rate limiting protection
      await new Promise(resolve => setTimeout(resolve, 1000)); 

    } catch (error: any) {
      console.error(`   ❌ Failed: ${error.message}`);
      fs.appendFileSync(OUTPUT_LOG, `${new Date().toISOString()} | FAILED | ${error.message} | ${title}\n`);
    }
  }

  console.log('\n✨ Generation Process Complete!');
  console.log(`📄 Check ${OUTPUT_LOG} for details.`);
}

main();
