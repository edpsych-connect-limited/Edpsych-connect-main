const fs = require('fs');
const path = require('path');

console.log('Starting cleanup script...');

const walkSync = (dir, filelist = []) => {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        filelist = walkSync(filepath, filelist);
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        filelist.push(filepath);
      }
    }
  });
  return filelist;
};

const removeUnusedLogger = () => {
  const files = walkSync(path.join(__dirname, '../src'));
  let fixedCount = 0;

  files.forEach((file) => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if logger is imported
    if (content.includes('import { logger }') || content.includes('import logger')) {
      // Check if logger is used elsewhere
      // We strip comments to avoid false positives, but simple check first
      // Remove the import lines to check for usage in the rest of the file
      const lines = content.split('\n');
      const nonImportLines = lines.filter(line => !line.includes('import { logger }') && !line.includes('import logger'));
      const remainingContent = nonImportLines.join('\n');
      
      // Check for usage of 'logger'
      // This is a simple regex, might have false positives if 'logger' is used in strings, but good enough for cleanup
      const isUsed = /\blogger\b/.test(remainingContent);
      
      if (!isUsed) {
        console.log(`Removing unused logger import in ${file}`);
        
        // Remove the import line(s)
        const newLines = lines.filter(line => !((line.includes('import { logger }') || line.includes('import logger')) && line.includes('from')));
        
        // If we removed lines, save the file
        if (newLines.length < lines.length) {
            fs.writeFileSync(file, newLines.join('\n'));
            fixedCount++;
        }
      }
    }
  });

  console.log(`Removed unused logger imports in ${fixedCount} files.`);
};

removeUnusedLogger();
