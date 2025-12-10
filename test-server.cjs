
const http = require('http');

['exit', 'SIGINT', 'SIGTERM', 'uncaughtException'].forEach(signal => {
  process.on(signal, (err) => {
    console.log(`Received signal: ${signal}`, err);
    if (signal === 'uncaughtException') process.exit(1);
  });
});

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Hello World');
});
server.listen(3000, () => {
  console.log('Server running on port 3000');
});
