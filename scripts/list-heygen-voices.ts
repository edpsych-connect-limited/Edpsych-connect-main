import https from 'https';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

if (!HEYGEN_API_KEY) {
  throw new Error('HEYGEN_API_KEY environment variable is required');
}

const options = {
  hostname: 'api.heygen.com',
  path: '/v1/voice.list',
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
      if (json.data && json.data.list) {
        console.log('Voices found:', json.data.list.length);
        
        // Check if any voice has a name
        const voiceWithName = json.data.list.find((v: any) => v.name);
        if (voiceWithName) {
            console.log('Found a voice with name:', voiceWithName);
        } else {
            console.log('No voices have a "name" property.');
        }

        // Filter for cloned voices
        const clonedVoices = json.data.list.filter((v: any) => v.user_voice_clone_id || v.source_type === 'clone' || v.is_shared === false);
        console.log('Cloned/Private voices:', clonedVoices.length);
        if (clonedVoices.length > 0) {
             console.log('Cloned voices:', JSON.stringify(clonedVoices, null, 2));
        } else {
             console.log('No cloned voices found.');
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
