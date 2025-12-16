import https from 'https';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const VIDEO_ID = process.argv[2];

if (!HEYGEN_API_KEY) {
  throw new Error('HEYGEN_API_KEY environment variable is required');
}

if (!VIDEO_ID) {
  console.error('Please provide a video ID as an argument.');
  process.exit(1);
}

const options = {
  hostname: 'api.heygen.com',
  path: `/v1/video_status.get?video_id=${VIDEO_ID}`,
  method: 'GET',
  headers: {
    'X-Api-Key': HEYGEN_API_KEY,
    'Content-Type': 'application/json',
  },
};

console.log(`Checking status for video ID: ${VIDEO_ID}`);

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Response:', JSON.stringify(json, null, 2));
      if (json.data && json.data.status) {
        console.log(`Status: ${json.data.status}`);
        if (json.data.video_url) {
            console.log(`Video URL: ${json.data.video_url}`);
        }
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

req.end();
