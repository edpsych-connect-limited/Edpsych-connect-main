import crypto from 'node:crypto';

import { getVideoScriptResolution } from '../src/lib/video-scripts/registry-core';

function sha256(text: string): string {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

function main() {
  const keys = process.argv.slice(2);
  if (!keys.length) {
    console.error('Usage: tsx tools/print-video-script-hash.ts <videoKey> [videoKey...]');
    process.exit(2);
  }

  for (const key of keys) {
    const res = getVideoScriptResolution(key);
    if (res.status !== 'found') {
      console.log(`${key}\tMISSING\tresolvedKey=${res.resolvedKey}`);
      continue;
    }

    const hash = sha256(res.transcript);
    console.log(`${key}\tFOUND\tresolvedKey=${res.resolvedKey}\thash=${hash}\tlen=${res.transcript.length}`);
  }
}

main();
