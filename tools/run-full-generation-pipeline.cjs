const { spawn } = require('child_process');
const path = require('path');

function runScript(scriptName) {
  return new Promise((resolve, reject) => {
    console.log(`\n>>> STARTING: ${scriptName} <<<`);
    const scriptPath = path.join(__dirname, scriptName);
    const child = spawn('node', [scriptPath], { stdio: 'inherit' });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`>>> COMPLETED: ${scriptName} <<<`);
        resolve();
      } else {
        console.error(`>>> FAILED: ${scriptName} (Exit Code: ${code}) <<<`);
        reject(new Error(`Script ${scriptName} failed`));
      }
    });
  });
}

async function main() {
  try {
    console.log('=== STARTING MASTER VIDEO GENERATION PIPELINE ===');
    console.log('Settings: Voice=Scott (50d2...), Speed=0.9, Captions=Enabled');

    // 1. Platform Videos (23 videos)
    await runScript('generate-dr-scott-videos.cjs');

    // 2. V4 Course Videos (58 videos - High Quality)
    await runScript('generate-v4-remaining.cjs');

    // 3. CSV Course Videos (Remaining ~80 videos - Standard Quality)
    await runScript('generate-course-videos-dr-scott.cjs');

    console.log('\n=== ALL GENERATION SCRIPTS COMPLETED ===');
    console.log('Next steps: Update mapping, Download, Upload.');
  } catch (error) {
    console.error('Pipeline failed:', error);
    process.exit(1);
  }
}

main();