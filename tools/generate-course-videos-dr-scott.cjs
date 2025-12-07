const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const API_KEY = 'sk_V2_hgu_knMBHTR5eZS_Fh7oPDiRF6jLhvQXFPVXnNlMNG7PkjRj';
const AVATAR_ID = '0d10345ca99840cdbd3103692ba55e27';
const VOICE_ID = '50d2a2a531d049719a0debbf82e1cf4c'; // Scott Ighavongbe-Patrick

const CSV_PATH = path.join(__dirname, '..', 'video_scripts', 'all_scripts.csv');
const OUTPUT_PATH = path.join(__dirname, '..', 'course-videos-dr-scott.json');

// Helper to parse CSV line correctly handling quotes
function parseCSVLine(text) {
  const result = [];
  let cell = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        // Escaped quote
        cell += '"';
        i++;
      } else {
        // Toggle quotes
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of cell
      result.push(cell);
      cell = '';
    } else {
      cell += char;
    }
  }
  result.push(cell);
  return result;
}

// Helper to parse the full CSV file
function parseCSV(content) {
  const lines = [];
  let currentLine = '';
  let inQuotes = false;
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    
    if (char === '"') {
      if (inQuotes && content[i + 1] === '"') {
        i++; // Skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    }
    
    if (char === '\n' && !inQuotes) {
      lines.push(currentLine);
      currentLine = '';
    } else if (char === '\r' && !inQuotes) {
      // Ignore CR
    } else {
      currentLine += char;
    }
  }
  if (currentLine) lines.push(currentLine);
  
  const headers = parseCSVLine(lines[0]);
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseCSVLine(lines[i]);
    const entry = {};
    headers.forEach((h, index) => {
      entry[h] = values[index];
    });
    data.push(entry);
  }
  
  return data;
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
  const title = `${videoData.Module}: ${videoData.Lesson}`;
  // Create a unique ID
  const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  console.log(`[${index + 1}/${total}] Generating: ${title}...`);
  
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
          input_text: videoData.Script,
          speed: 0.9
        }
      }
    ],
    test: false,
    aspect_ratio: '16:9',
    title: title
  };

  try {
    const response = await makeRequest(options, payload);
    console.log(`SUCCESS: Video ID: ${response.data.video_id}`);
    return {
      id: id,
      title: title,
      course: videoData.Course,
      module: videoData.Module,
      lesson: videoData.Lesson,
      videoId: response.data.video_id,
      status: 'pending'
    };
  } catch (error) {
    console.error(`FAILED: ${error.message}`);
    return {
      id: id,
      title: title,
      error: error.message,
      status: 'failed'
    };
  }
}

async function main() {
  console.log('Reading CSV...');
  const content = fs.readFileSync(CSV_PATH, 'utf8');
  const allVideos = parseCSV(content);
  
  console.log(`Found ${allVideos.length} videos in CSV.`);
  
  // Filter out empty scripts
  const validVideos = allVideos.filter(v => v.Script && v.Script.length > 10);
  console.log(`${validVideos.length} videos have valid scripts.`);
  
  // Load existing results to avoid duplicates
  let existingResults = [];
  if (fs.existsSync(OUTPUT_PATH)) {
    try {
      existingResults = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'));
      console.log(`Loaded ${existingResults.length} existing results.`);
    } catch (e) {
      console.log('Could not load existing results, starting fresh.');
    }
  }
  
  // Filter out already generated videos AND V4 categories
  const existingTitles = new Set(existingResults.map(r => r.title));
  
  // Categories covered by V4 scripts (High Quality) - Exclude from CSV generation
  const V4_CATEGORIES = [
    'Autism Spectrum Support', 
    'ADHD', 
    'Dyslexia', 
    'Innovation', 
    'Platform Features'
  ];

  const videosToGenerate = validVideos.filter(v => {
    // Check if already generated
    if (existingTitles.has(`${v.Module}: ${v.Lesson}`)) return false;
    
    // Check if covered by V4 (fuzzy match on Course name)
    const isV4 = V4_CATEGORIES.some(cat => v.Course.includes(cat));
    if (isV4) return false;
    
    return true;
  });
  
  console.log(`${videosToGenerate.length} new videos to generate (excluding V4 categories).`);
  
  // Limit for this run (safety) - REMOVED LIMIT FOR FULL RUN
  // const LIMIT = 5; 
  const batch = videosToGenerate; // Process ALL remaining
  
  console.log(`Processing ${batch.length} videos...`);
  
  const newResults = [];
  for (let i = 0; i < batch.length; i++) {
    const result = await generateVideo(batch[i], i, batch.length);
    newResults.push(result);
    // Save incrementally
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify([...existingResults, ...newResults], null, 2));
    
    // Rate limit
    if (i < batch.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log('Done!');
}

main().catch(console.error);
