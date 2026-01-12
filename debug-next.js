
console.log('Starting debug-next.js');
try {
  process.env.NEXT_DIST_DIR = '.next_local';
  require('next/dist/bin/next');
} catch (e) {
  console.error('CRASHED:', e);
}
