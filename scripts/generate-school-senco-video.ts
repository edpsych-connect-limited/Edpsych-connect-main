import https from 'https';

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
  context: 'scripts/generate-school-senco-video',
});

const SCRIPT_TEXT = `Welcome to EdPsych Connect. I'm Dr. Scott, and I built this platform because I was tired of seeing children fail because of paperwork.

You're now looking at your Dashboard. Think of this as Mission Control for your Special Educational Needs and Disabilities provision.

On the left, you have your toolkit. 'Assessments' for identifying needs. 'Interventions' for doing something about them. And 'Reports' for documenting it all.

The search bar up top? It's powered by our 'Universal Translator'. You can type "dyslexia help" or "reading struggles" and it understands exactly what you mean.

See those alerts? That's our 'Compliance Risk Predictor' working in the background. It's watching your deadlines so you don't have to.

My advice? Don't try to boil the ocean. Start with one child. Run one assessment. Generate one report. You'll see how much time it saves you.

If you get stuck, just ask. Our 'Voice Command System' is always listening. Just say "Help me with this assessment" and it will guide you.

You're here to make a difference. We're here to handle the rest. Let's get started.`;

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
        input_text: SCRIPT_TEXT,
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

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Response:', JSON.stringify(json, null, 2));
      
      if (json.data && json.data.video_id) {
        console.log(`\nSUCCESS! Video ID: ${json.data.video_id}`);
      }
    } catch (e) {
      console.error('Error parsing response:', e);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e);
});

req.write(JSON.stringify(payload));
req.end();
