/**
 * Fix String Literals with _error typos
 * These were introduced accidentally by an overzealous underscore-prefixing script
 */

const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Fix string literals only - not variable names
    let newContent = content
      .replace(/'Internal server _error'/g, "'Internal server error'")
      .replace(/"Internal server _error"/g, '"Internal server error"')
      .replace(/'Unknown _error'/g, "'Unknown error'")
      .replace(/"Unknown _error"/g, '"Unknown error"')
      .replace(/'An _error occurred'/g, "'An error occurred'")
      .replace(/"An _error occurred"/g, '"An error occurred"')
      .replace(/'_error occurred'/g, "'error occurred'")
      .replace(/"_error occurred"/g, '"error occurred"')
      .replace(/'_error'/g, "'error'")  // standalone 'error' strings
      .replace(/: '_error'/g, ": 'error'");  // object property values
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      return true;
    }
    return false;
  } catch (err) {
    console.error(`Error processing ${filePath}: ${err.message}`);
    return false;
  }
}

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      // Skip node_modules and .next
      if (file !== 'node_modules' && file !== '.next') {
        walkDir(filePath, callback);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      callback(filePath);
    }
  });
}

let fixedCount = 0;
const fixedFiles = [];

walkDir('src', (filePath) => {
  if (fixFile(filePath)) {
    fixedFiles.push(filePath);
    fixedCount++;
  }
});

console.log(`\nFixed ${fixedCount} files:`);
fixedFiles.forEach(f => console.log(`  - ${f}`));
