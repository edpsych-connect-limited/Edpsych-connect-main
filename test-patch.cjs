require('./scripts/patch-fs-runtime.cjs');
const fs = require('fs');

console.log('Testing PATCHED fs.readlink on current directory...');
try {
  fs.readlinkSync(process.cwd());
  console.log('readlinkSync success (unexpected for dir)');
} catch (err) {
  console.log('readlinkSync error:', err.code, err.message);
}

fs.readlink(process.cwd(), (err, link) => {
  if (err) {
    console.log('readlink error:', err.code, err.message);
  } else {
    console.log('readlink success:', link);
  }
});
