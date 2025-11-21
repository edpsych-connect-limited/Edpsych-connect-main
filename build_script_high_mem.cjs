const { spawn } = require('child_process');
const fs = require('fs');

const logStream = fs.createWriteStream('build_high_mem_log.txt');

console.log('Starting high memory build...');

const build = spawn('npx', ['next', 'build'], {
  env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' },
  shell: true
});

build.stdout.pipe(logStream);
build.stderr.pipe(logStream);

build.stdout.on('data', (data) => {
  console.log(data.toString());
});

build.stderr.on('data', (data) => {
  console.error(data.toString());
});

build.on('close', (code) => {
  console.log(`Build process exited with code ${code}`);
  fs.appendFileSync('build_high_mem_log.txt', `\nEXIT CODE: ${code}`);
});
