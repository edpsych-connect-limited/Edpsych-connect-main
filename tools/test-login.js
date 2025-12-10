const http = require('http');
const fs = require('fs');
const path = require('path');

const loginData = JSON.stringify({
  email: "teacher@demo.com",
  password: "Test123!"
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

console.log('Testing login...');

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('BODY: ' + data);
    if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('\nSUCCESS: Login successful! Database connection verified.');
    } else {
        console.log('\nFAILURE: Login failed.');
    }
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(loginData);
req.end();
