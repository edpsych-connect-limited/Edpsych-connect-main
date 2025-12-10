const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/',
  method: 'GET',
  headers: {
    'User-Agent': 'Node-Test-Script',
    'Connection': 'close'
  },
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk.substring(0, 100)}...`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.on('timeout', () => {
    console.error('Request timed out');
    req.destroy();
});

req.end();