import https from 'https';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

if (!HEYGEN_API_KEY) {
  throw new Error('HEYGEN_API_KEY environment variable is required');
}

const options = {
  hostname: 'api.heygen.com',
  path: '/v2/voices', // Using v2 endpoint which might have better metadata
  method: 'GET',
  headers: {
    'X-Api-Key': HEYGEN_API_KEY,
  },
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.data && json.data.voices) {
        console.log(`Found ${json.data.voices.length} voices.`);
        
        const scottVoices = json.data.voices.filter((v: any) => v.name.toLowerCase().includes('scott'));

        if (scottVoices.length > 0) {
          console.log('--- Scott Voices Found ---');
          console.log(JSON.stringify(scottVoices, null, 2));
        } else {
          console.log('--- No "Scott" Voices Found ---');
        }

      } else {
        console.log('No voices found or error:', json);
      }
    } catch (e) {
      console.error('Error parsing JSON:', e);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e);
});

req.end();
