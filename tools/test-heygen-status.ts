
import fetch from 'node-fetch';

// API key must be set via environment variable for security
const API_KEY_RAW = process.env.HEYGEN_API_KEY;
if (!API_KEY_RAW) {
  console.error('❌ Error: HEYGEN_API_KEY environment variable is not set.');
  process.exit(1);
}
const API_KEY: string = API_KEY_RAW;
const VIDEO_ID = 'f498119a59da483dab6117c0457a10e9';

async function checkStatus() {
  console.log(`Checking status for video: ${VIDEO_ID}`);
  
  try {
    const response = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${VIDEO_ID}`, {
      headers: {
        'X-Api-Key': API_KEY
      }
    });

    const data = await response.json();
    console.log('Status Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

checkStatus();
