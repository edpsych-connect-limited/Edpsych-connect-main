const https = require('https');

const API_KEY = process.env.HEYGEN_API_KEY;

if (!API_KEY) {
  throw new Error('HEYGEN_API_KEY environment variable is required');
}

function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`Request failed with status code ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', (error) => reject(error));
    req.end();
  });
}

async function listVoices() {
  console.log('Fetching voices...');
  
  const options = {
    hostname: 'api.heygen.com',
    path: '/v2/voices',
    method: 'GET',
    headers: {
      'X-Api-Key': API_KEY,
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await makeRequest(options);
    if (response.data && response.data.voices) {
        const voices = response.data.voices;
        console.log(`Found ${voices.length} voices.`);
        
        // Filter for likely candidates
        const candidates = voices.filter(v => 
            v.name.toLowerCase().includes('scott') || 
            v.name.toLowerCase().includes('personal') ||
            v.name.toLowerCase().includes('clone') ||
            v.is_clone === true
        );

        console.log('Potential matches for Dr. Scott:');
        candidates.forEach(v => {
            console.log(`- Name: ${v.name}, ID: ${v.voice_id}, Language: ${v.language}, Gender: ${v.gender}, Is Clone: ${v.is_clone}`);
        });

        // Also list first 10 just in case
        console.log('\nFirst 10 voices:');
        voices.slice(0, 10).forEach(v => {
             console.log(`- Name: ${v.name}, ID: ${v.voice_id}`);
        });

    } else {
        console.log('No voices found in response:', JSON.stringify(response, null, 2));
    }
  } catch (error) {
    console.error(`FAILED: ${error.message}`);
  }
}

listVoices();