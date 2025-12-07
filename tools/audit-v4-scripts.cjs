const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', 'video_scripts', 'v4_generated');

function scanDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      scanDir(filePath, fileList);
    } else if (file.endsWith('.md')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const allFiles = scanDir(ROOT_DIR);
console.log(`Found ${allFiles.length} Markdown scripts in v4_generated.`);

const categories = {};
allFiles.forEach(f => {
  const relative = path.relative(ROOT_DIR, f);
  const category = path.dirname(relative);
  categories[category] = (categories[category] || 0) + 1;
});

console.log('Breakdown by category:');
console.log(categories);
