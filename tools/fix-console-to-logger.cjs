/**
 * Enterprise-grade logging standardization script
 * Replaces console.error with logger.error in API routes
 * 
 * @author EdPsych Connect Limited
 */

const fs = require('fs');
const path = require('path');

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

const fixConsoleToLogger = () => {
  const apiDir = path.join(__dirname, '../src/app/api');
  const files = walkSync(apiDir);
  let fixedCount = 0;
  let addedImportCount = 0;

  files.forEach((file) => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    
    // Check if file has console.error
    if (!content.includes('console.error')) {
      return;
    }

    // Check if logger import exists
    const hasLoggerImport = content.includes("import { logger }") && content.includes('@/lib/logger');
    
    // Add logger import if not present
    if (!hasLoggerImport) {
      const loggerImport = 'import { logger } from "@/lib/logger";\n';
      
      // Find the first import statement to add before it, or at the very top
      const firstImportMatch = content.match(/^(\/\*[\s\S]*?\*\/\s*)?/);
      if (firstImportMatch) {
        const insertPos = firstImportMatch[0].length;
        content = content.slice(0, insertPos) + loggerImport + content.slice(insertPos);
        addedImportCount++;
        modified = true;
      }
    }

    // Replace console.error with logger.error
    const originalContent = content;
    content = content.replace(/console\.error\(/g, 'logger.error(');
    
    if (content !== originalContent || modified) {
      fs.writeFileSync(file, content);
      fixedCount++;
      console.log(`Fixed: ${file}`);
    }
  });

  console.log(`\n=== Summary ===`);
  console.log(`Files fixed: ${fixedCount}`);
  console.log(`Logger imports added: ${addedImportCount}`);
};

fixConsoleToLogger();
