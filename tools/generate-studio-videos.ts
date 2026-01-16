import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const mode = (process.env.NODE_ENV || 'development').toLowerCase();
const root = path.join(__dirname, '..');
const candidates = [
  `.env.${mode}.local`,
  '.env.local',
  `.env.${mode}`,
  '.env',
];

for (const rel of candidates) {
  const abs = path.join(root, rel);
  if (fs.existsSync(abs)) {
    dotenv.config({ path: abs, override: false });
  }
}

const API_KEY = process.env.HEYGEN_API_KEY;

// Use approved IDs from source of truth (src/lib/video/dr-scott-heygen.ts)
const AVATAR_ID = 'd680604a31f34ce096c84bed708774c3';
const VOICE_ID = '5a4bb65a67734477a659398468c7272e';

if (!API_KEY) {
  console.error('❌ HEYGEN_API_KEY is missing');
  process.exit(1);
}

const MARKDOWN_PATH = path.join(root, 'video_scripts', 'studio_overview_scripts.md');
const LOG_FILE = path.join(root, 'video_scripts', 'generation_log_studios.json');

async function generateVideo(script: string, title: string): Promise<string | null> {
  console.log(`🎬 Generating: ${title}...`);
  
  const payload = JSON.stringify({
    video_inputs: [
      {
        character: {
          type: "avatar",
          avatar_id: AVATAR_ID,
          avatar_style: "normal"
        },
        voice: {
          type: "text",
          voice_id: VOICE_ID,
          input_text: script,
        },
      },
    ],
    test: false,
    aspect_ratio: "16:9",
    title: title
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.heygen.com',
      path: '/v2/video/generate',
      method: 'POST',
      headers: {
        'X-Api-Key': API_KEY,
        'Content-Type': 'application/json',
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          console.error(`❌ API Error (${res.statusCode}): ${data}`);
          resolve(null);
          return;
        }
        try {
          const response = JSON.parse(data);
          if (response.error) {
            console.error(`❌ HeyGen Error: ${JSON.stringify(response.error)}`);
            resolve(null);
          } else {
            const videoId = response.data?.video_id;
            console.log(`✅ Started! Video ID: ${videoId}`);
            resolve(videoId);
          }
        } catch (e) {
            console.error('❌ JSON Parse Error', e);
            resolve(null);
        }
      });
    });

    req.on('error', (e) => {
      console.error('❌ Request Error:', e);
      resolve(null);
    });

    req.write(payload);
    req.end();
  });
}

function parseMarkdown(mdContent: string): Array<{key: string, title: string, script: string}> {
    const sections = mdContent.split(/^## /gm);
    const results = [];

    for (const section of sections) {
        if (!section.trim()) continue;
        
        const lines = section.split('\n');
        const titleLine = lines[0].trim();
        const title = titleLine.replace(/^\d+\.\s*/, '').trim();

        const keyLine = lines.find(l => l.includes('**Key**:'));
        const scriptStart = lines.findIndex(l => l.includes('**[Dr. Scott]**:'));

        if (keyLine && scriptStart !== -1) {
            const keyMatches = keyLine.match(/`([^`]+)`/);
            const key = keyMatches ? keyMatches[1] : '';
            
            let scriptRaw = lines.slice(scriptStart + 1).join('\n').trim();
            scriptRaw = scriptRaw.split('---')[0].trim();
            
            if (key && scriptRaw) {
                results.push({ key, title, script: scriptRaw });
            }
        }
    }
    return results;
}

async function main() {
  console.log('🚀 Starting Studio Overview Video Generation...');
  
  if (!fs.existsSync(MARKDOWN_PATH)) {
      console.error(`❌ Script file not found: ${MARKDOWN_PATH}`);
      process.exit(1);
  }

  const content = fs.readFileSync(MARKDOWN_PATH, 'utf-8');
  const items = parseMarkdown(content);
  
  console.log(`📋 Found ${items.length} scripts to generate.`);
  
  const results: Record<string, string> = {};

  for (const item of items) {
      console.log(`\nProcessing: ${item.key}`);
      const videoId = await generateVideo(item.script, item.title);
      if (videoId) {
          results[item.key] = videoId;
      }
      await new Promise(r => setTimeout(r, 1000));
  }

  fs.writeFileSync(LOG_FILE, JSON.stringify(results, null, 2));
  console.log(`\n💾 Video IDs saved to ${LOG_FILE}`);
  
  updateCode(results);
}

function updateCode(newIds: Record<string, string>) {
    const tsPath = path.join(root, 'src', 'lib', 'training', 'heygen-video-urls.ts');
    let tsContent = fs.readFileSync(tsPath, 'utf-8');
    
    let updatedCount = 0;
    for (const [key, id] of Object.entries(newIds)) {
        const regex = new RegExp(`"${key}":\\s*"[^"]*"`, 'g');
        if (regex.test(tsContent)) {
            tsContent = tsContent.replace(regex, `"${key}": "${id}"`);
            updatedCount++;
        } else {
            console.warn(`⚠️ Could not find key "${key}" in heygen-video-urls.ts to update.`);
        }
    }
    
    fs.writeFileSync(tsPath, tsContent);
    console.log(`\n📝 Updated ${updatedCount} keys in heygen-video-urls.ts`);
}

main().catch(console.error);
