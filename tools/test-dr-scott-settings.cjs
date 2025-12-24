const https = require('https');

const { assertApprovedDrScottCasting, REQUIRED_DR_SCOTT_VOICE_ID } = require('./lib/dr-scott-heygen.cjs');

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
  context: 'test-dr-scott-settings',
});

const TEST_SCRIPT = "Hello. This is a test to check the new speaking pace. I am speaking slightly slower now, at 90% speed, to ensure clarity. I hope this feels more natural.";

function makeRequest(options, payload) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`API Error: ${res.statusCode} - ${data}`));
        }
      });
    });
    req.on('error', (e) => reject(e));
    if (payload) req.write(JSON.stringify(payload));
    req.end();
  });
}

async function generateTestVideo() {
  console.log('Generating TEST video with new settings...');
  console.log(`Voice ID: ${VOICE_ID}`);
  console.log(`Required Dr Scott Voice ID: ${REQUIRED_DR_SCOTT_VOICE_ID}`);
  console.log(`Speed: 0.9`);

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
          input_text: TEST_SCRIPT,
          speed: 0.9 // Slower pace
        }
      }
    ],
    test: true, // Do not burn credits for this test
    aspect_ratio: '16:9',
    title: 'Dr Scott Pace Test'
  };

  try {
    const response = await makeRequest(options, payload);
    console.log('SUCCESS: Test video generation started.');
    console.log(`Video ID: ${response.data.video_id}`);
    console.log('Check HeyGen dashboard or status to verify.');
  } catch (error) {
    console.error('FAILED: Could not generate test video.');
    console.error(error.message);
  }
}

generateTestVideo();