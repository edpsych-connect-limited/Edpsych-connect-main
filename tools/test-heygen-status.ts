
import fetch from 'node-fetch';

const API_KEY = process.env.HEYGEN_API_KEY || 'sk_V2_hgu_ky346mdR1EZ_sepM85TUnIexIOSuzpiVI5gXaqMhWDo1';
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
