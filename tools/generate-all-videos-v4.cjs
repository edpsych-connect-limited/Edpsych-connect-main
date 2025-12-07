const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const API_KEY = 'sk_V2_hgu_knMBHTR5eZS_Fh7oPDiRF6jLhvQXFPVXnNlMNG7PkjRj';
const AVATAR_ID = '0d10345ca99840cdbd3103692ba55e27';
const VOICE_ID = '50d2a2a531d049719a0debbf82e1cf4c'; // Scott Ighavongbe-Patrick (Correct Voice)

const V4_ROOT = path.join(__dirname, '..', 'video_scripts', 'v4_generated');
const STATUS_FILE = path.join(__dirname, '..', 'video_generation_status.json');

// Load status
let status = {};
if (fs.existsSync(STATUS_FILE)) {
    try {
        status = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
    } catch (e) {
        console.error('Error reading status file, starting fresh.');
    }
}

function saveStatus() {
    fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
}

function scanDir(dir, fileList = []) {
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            scanDir(filePath, fileList);
        } else if (file.endsWith('.md')) {
            fileList.push(filePath);
        }
    });
    return fileList;
}

function parseMarkdown(content) {
    const parts = content.split('---');
    if (parts.length < 3) return null;

    const frontmatter = parts[1];
    const body = parts.slice(2).join('---');

    const metadata = {};
    frontmatter.split('\n').forEach(line => {
        const [key, ...val] = line.split(':');
        if (key && val) {
            metadata[key.trim()] = val.join(':').trim();
        }
    });

    // Extract script content (everything after "## Script")
    const scriptMatch = body.split('## Script');
    let script = '';
    if (scriptMatch.length > 1) {
        script = scriptMatch[1].trim();
    } else {
        // Fallback: try to find the text after the header
        script = body.replace(/# .+\n/, '').trim();
    }

    return { metadata, script };
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

        req.on('error', (e) => reject(e));
        if (payload) {
            req.write(JSON.stringify(payload));
        }
        req.end();
    });
}

async function generateVideo(filePath) {
    let content;
    try {
        content = fs.readFileSync(filePath, 'utf8');
    } catch (e) {
        console.error(`Error reading file ${filePath}: ${e.message}`);
        return;
    }
    const parsed = parseMarkdown(content);
    
    if (!parsed || !parsed.script) {
        console.error(`Failed to parse script for ${filePath}`);
        return;
    }

    const { metadata, script } = parsed;
    const videoId = metadata.id || path.basename(filePath, '.md');

    if (status[videoId] && (status[videoId].status === 'completed' || status[videoId].status === 'pending')) {
        console.log(`Skipping ${videoId} (already submitted)`);
        return;
    }

    console.log(`Generating video for: ${videoId} (${metadata.title})`);
    console.log(`Script length: ${script.length} chars`);

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
                    input_text: script
                }
            }
        ],
        test: false, // Set to false for production
        aspect_ratio: "16:9",
        title: metadata.title || videoId
    };

    const options = {
        hostname: 'api.heygen.com',
        path: '/v2/video/generate',
        method: 'POST',
        headers: {
            'X-Api-Key': API_KEY,
            'Content-Type': 'application/json'
        }
    };

    try {
        const response = await makeRequest(options, payload);
        console.log(`Success! Video ID: ${response.data.video_id}`);
        
        status[videoId] = {
            status: 'pending', // It's processing
            heygen_id: response.data.video_id,
            title: metadata.title,
            timestamp: new Date().toISOString(),
            file_path: filePath
        };
        saveStatus();
        
    } catch (error) {
        console.error(`Error generating ${videoId}:`, error.message);
    }
}

async function main() {
    const files = scanDir(V4_ROOT);
    console.log(`Found ${files.length} V4 scripts.`);

    // Process in batches to avoid rate limits? HeyGen usually handles it, but let's be safe.
    // We'll do one by one for safety and logging.
    
    for (const file of files) {
        await generateVideo(file);
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('All generation requests submitted.');
}

main();