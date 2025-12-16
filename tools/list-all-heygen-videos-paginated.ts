import https from 'https';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

if (!HEYGEN_API_KEY) {
  throw new Error('HEYGEN_API_KEY environment variable is required');
}

async function fetchPage(token?: string): Promise<{ videos: any[], nextToken?: string }> {
  return new Promise((resolve, reject) => {
    const path = `/v1/video.list?limit=100${token ? `&token=${token}` : ''}`;
    const options = {
      hostname: 'api.heygen.com',
      path,
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
            resolve({
              videos: json.data.videos,
              nextToken: json.data.token
            });
          } else {
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

async function listAllVideos() {
  // console.log('Listing all videos...');
  let allVideos: any[] = [];
  let nextToken: string | undefined = undefined;
  
  try {
    do {
      const result = await fetchPage(nextToken);
      allVideos = allVideos.concat(result.videos);
      nextToken = result.nextToken;
      // console.error(`Fetched ${result.videos.length} videos. Total: ${allVideos.length}`);
    } while (nextToken);
    
    console.log(JSON.stringify(allVideos, null, 2));
  } catch (error) {
    console.error('Error fetching videos:', error);
    process.exit(1);
  }
}

listAllVideos();
