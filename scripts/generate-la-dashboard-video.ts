import https from 'https';

const HEYGEN_API_KEY = 'sk_V2_hgu_knMBHTR5eZS_Fh7oPDiRF6jLhvQXFPVXnNlMNG7PkjRj';
const AVATAR_ID = 'd680604a31f34ce096c84bed708774c3';
const VOICE_ID = '50d2a2a531d049719a0debbf82e1cf4c';

const SCRIPT_TEXT = `Welcome to the Command Centre. This is the Local Authority Dashboard, designed to give you total visibility over your Special Educational Needs and Disabilities landscape.

I know the pressure you're under. The 20-week deadline isn't just a target; it's the law.

That's why your dashboard is colour-coded by urgency. Green is on track. Amber is approaching deadline. Red is critical. You know exactly where to focus your energy every morning.

You can see your entire caseload at a glance. Filter by school, by stage, or by complexity.

The 'Activity Feed' on the right is your pulse check. It shows you real-time updates: "St Mary's just submitted the Annual Review," "Dr. Jones just uploaded the Educational Psychologist advice."

And for managers, the 'Compliance Analytics' are a game changer. You can see bottlenecks before they become breaches. "Why is the drafting stage taking 4 weeks on average?" Now you have the data to fix it.

This isn't just about managing cases; it's about managing capacity. It puts you back in control.`;

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
        value: '#FAFAFA', // Clean white/grey background
      },
    },
  ],
  dimension: {
    width: 1920,
    height: 1080,
  },
  aspect_ratio: '16:9',
  test: false, // Set to false to generate actual video
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
        console.log('Save this ID to check status and download later.');
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
