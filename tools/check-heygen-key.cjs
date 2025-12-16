const https = require('https');

const API_KEY = process.env.HEYGEN_API_KEY;

if (!API_KEY) {
  throw new Error('HEYGEN_API_KEY environment variable is required');
}

const options = {
  hostname: 'api.heygen.com',
  path: '/v2/user/remaining_quota', // Trying to check quota/credits
  method: 'GET',
  headers: {
    'X-Api-Key': API_KEY,
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Body: ${body}`);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
