import https from 'https';

const HEYGEN_API_KEY = 'sk_V2_hgu_knMBHTR5eZS_Fh7oPDiRF6jLhvQXFPVXnNlMNG7PkjRj';
const AVATAR_ID = 'd680604a31f34ce096c84bed708774c3';
const VOICE_ID = '50d2a2a531d049719a0debbf82e1cf4c';

const SCRIPT_TEXT = `If you are watching this, you already know the truth. The system is not just broken; it is a maze. A fragmented, chaotic maze of emails, spreadsheets, and missed deadlines. And who gets lost in that maze? The children.

I am Dr. Scott I-Patrick. In over nine years as a practicing Child and Adolescent Educational Psychologist, and over twenty years in the field across different Local Authorities and schools, I have seen brilliant teachers burn out and desperate parents give up—not because they do not care, but because they are fighting a system that fights back.

So, we stopped trying to fix the broken pieces. We built a new engine. Think of EdPsych Connect not as another database, but as an Orchestration System. It is the 'Golden Thread' that ties the school, the family, and the Local Authority together.

While you sleep, our Safety Net Engine is awake. It scans every case. It looks for stagnation. It flags the quiet child who has not made progress in six weeks. It does not just store data; it acts on it.

We have turned the maze into a map. Let me show you how.`;

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
        value: '#1e293b',
      },
    },
  ],
  test: false,
  aspect_ratio: '16:9',
  caption: true,
  title: 'Platform Introduction - Dr. Scott',
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

console.log('Generating video with payload:', JSON.stringify(payload, null, 2));

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Response:', JSON.stringify(json, null, 2));
      if (json.data && json.data.video_id) {
        console.log(`Video generation started! Video ID: ${json.data.video_id}`);
        console.log('You can check the status using the video_id.');
      } else {
        console.error('Failed to start video generation.');
      }
    } catch (e) {
      console.error('Error parsing JSON:', e);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e);
});

req.write(JSON.stringify(payload));
req.end();
