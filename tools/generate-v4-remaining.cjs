const https = require('https');
const fs = require('fs');
const path = require('path');

const { assertApprovedDrScottCasting } = require('./lib/dr-scott-heygen.cjs');

// Configuration
const API_KEY = process.env.HEYGEN_API_KEY;

if (!API_KEY) {
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
  context: 'generate-v4-remaining',
});

const V4_DIR = path.join(__dirname, '..', 'video_scripts', 'v4_generated');
const OUTPUT_PATH = path.join(__dirname, '..', 'dr-scott-course-results.json');

// Categories to process (excluding the ones we already did)
const TARGET_CATEGORIES = [
  'autism-spectrum-support',
  'adhd-understanding-support',
  'dyslexia',
  'dyslexia-intervention-strategies',
  'innovation',
  'platform-features'
];

function parseMarkdownScript(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const scriptMatch = content.match(/## Script\s+([\s\S]+)/);
  const titleMatch = content.match(/title:\s*(.+)/);
  const idMatch = content.match(/id:\s*(.+)/);
  
  if (!scriptMatch) return null;
  
  return {
    id: idMatch ? idMatch[1].trim() : path.basename(filePath, '.md'),
    title: titleMatch ? titleMatch[1].trim() : 'Untitled',
    script: scriptMatch[1].trim(),
    path: filePath
  };
}

function scanDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      // Only scan if it's in our target categories
      const relative = path.relative(V4_DIR, filePath);
      const rootCat = relative.split(path.sep)[0];
      if (TARGET_CATEGORIES.includes(rootCat) || TARGET_CATEGORIES.includes(path.basename(filePath))) {
         scanDir(filePath, fileList);
      }
    } else if (file.endsWith('.md')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

function makeRequest(options, payload) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`Request failed with status code ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', (error) => reject(error));
    if (payload) req.write(JSON.stringify(payload));
    req.end();
  });
}

async function generateVideo(videoData, index, total) {
  console.log(`[${index + 1}/${total}] Generating: ${videoData.title}...`);
  
  const options = {
    hostname: 'api.heygen.com',
    path: '/v2/video/generate',
    method: 'POST',
    headers: {
      'X-Api-Key': API_KEY,
      'Content-Type': 'application/json'
    }
  };

  const payload = {
    video_inputs: [
      {
        character: {
          type: 'avatar',
          avatar_id: AVATAR_ID,
          avatar_style: 'normal'
        },
        voice: {
          type: 'text',
          voice_id: VOICE_ID,
          input_text: videoData.script,
          speed: 0.9
        }
      }
    ],
    test: false,
    aspect_ratio: '16:9',
    title: videoData.title
  };

  try {
    const response = await makeRequest(options, payload);
    console.log(`SUCCESS: Video ID: ${response.data.video_id}`);
    return {
      id: videoData.id,
      title: videoData.title,
      videoId: response.data.video_id,
      status: 'pending'
    };
  } catch (error) {
    console.error(`FAILED: ${error.message}`);
    return {
      id: videoData.id,
      title: videoData.title,
      error: error.message,
      status: 'failed'
    };
  }
}

async function main() {
  console.log('Scanning for v4 scripts...');
  const files = scanDir(V4_DIR);
  
  const videosToGenerate = [];
  for (const file of files) {
    const data = parseMarkdownScript(file);
    if (data) {
      // Double check category
      const relative = path.relative(V4_DIR, file);
      const category = relative.split(path.sep)[0];
      if (TARGET_CATEGORIES.includes(category)) {
        videosToGenerate.push(data);
      }
    }
  }
  
  console.log(`Found ${videosToGenerate.length} course videos to generate.`);
  
  // Load existing results
  let existingResults = [];
  if (fs.existsSync(OUTPUT_PATH)) {
    try {
      existingResults = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'));
    } catch (e) {}
  }
  
  // Filter duplicates
  const existingIds = new Set(existingResults.map(r => r.id));
  const finalList = videosToGenerate.filter(v => !existingIds.has(v.id));
  
  console.log(`${finalList.length} new videos to generate.`);
  
  // Process
  const results = [];
  for (let i = 0; i < finalList.length; i++) {
    const result = await generateVideo(finalList[i], i, finalList.length);
    results.push(result);
    
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify([...existingResults, ...results], null, 2));
    
    // Rate limit
    if (i < finalList.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log('Done!');
}

main().catch(console.error);
