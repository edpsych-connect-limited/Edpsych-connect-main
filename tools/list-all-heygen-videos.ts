import https from 'https';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

if (!HEYGEN_API_KEY) {
  throw new Error('HEYGEN_API_KEY environment variable is required');
}

async function listAllVideos() {
  // console.log('Listing all videos...');
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.heygen.com',
      path: '/v1/video.list?limit=200', // Increased limit to cover all 177+ videos
      method: 'GET',
      headers: {
        'X-Api-Key': HEYGEN_API_KEY,
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.code === 100) {
            console.log(JSON.stringify(json.data.videos, null, 2));
            resolve(json.data.videos);
          } else {
            console.error('API Error:', json);
            reject(new Error(`HeyGen API Error: ${JSON.stringify(json)}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.end();
  });
}

listAllVideos();
