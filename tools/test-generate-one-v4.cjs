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
    context: 'test-generate-one-v4',
});

const TEST_FILE = path.join(__dirname, '..', 'video_scripts', 'v4_generated', 'adhd-understanding-support', 'adhd-m1-l1.md');

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

    const scriptMatch = body.split('## Script');
    let script = '';
    if (scriptMatch.length > 1) {
        script = scriptMatch[1].trim();
    } else {
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

async function main() {
    console.log(`Reading test file: ${TEST_FILE}`);
    const content = fs.readFileSync(TEST_FILE, 'utf8');
    const parsed = parseMarkdown(content);
    
    if (!parsed || !parsed.script) {
        console.error(`Failed to parse script`);
        return;
    }

    const { metadata, script } = parsed;
    console.log(`Title: ${metadata.title}`);
    console.log(`Voice ID: ${VOICE_ID}`);
    console.log(`Script Preview: ${script.substring(0, 100)}...`);

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
        test: false,
        aspect_ratio: "16:9",
        title: `TEST - ${metadata.title}`
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
        console.log('Sending request to HeyGen...');
        const response = await makeRequest(options, payload);
        console.log(`Success! Video ID: ${response.data.video_id}`);
    } catch (error) {
        console.error(`Error:`, error.message);
    }
}

main();