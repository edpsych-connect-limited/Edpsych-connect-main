import https from 'https';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

if (!HEYGEN_API_KEY) {
  throw new Error('HEYGEN_API_KEY environment variable is required');
}
const AVATAR_ID = 'd680604a31f34ce096c84bed708774c3';
const VOICE_ID = '50d2a2a531d049719a0debbf82e1cf4c';

const SCRIPT_TEXT = `Hello. I'm Dr. Scott. If you're here, it's because you're fighting for your child. I want you to know: you have an ally.

This Parent Portal is your window into your child's support. No more "gatekeepers." No more waiting for a letter in the post.

Here, you can see exactly what is happening. The timeline of the assessment. The reports as soon as they are uploaded. The draft plan the moment it's ready.

But it's not just for looking. It's for speaking.

You can upload your own evidence. Videos of your child at home. Reports from private therapists. Your own "Parental Views" statement.

You can message the case officer directly. Securely.

We've also included a 'Jargon Buster'. If you see a term like "Wave 3 Intervention" or "Section I", just hover over it. We explain it in plain English.

This is your space. Use it to tell your child's story.`;

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
