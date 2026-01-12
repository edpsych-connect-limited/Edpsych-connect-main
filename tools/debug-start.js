
const { spawn } = require('child_process');
const fs = require('fs');

console.log('Starting Next.js dev server...');
const child = spawn('npx', ['next', 'dev'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' }
});

child.on('error', (err) => {
  console.error('Failed to start subprocess.', err);
});

child.on('close', (code) => {
  console.log(`Child process exited with code ${code}`);
});
