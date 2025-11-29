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

const fixImports = () => {
  const files = walkSync(path.join(__dirname, '../src'));
  let fixedCount = 0;

  files.forEach((file) => {
    let content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    
    // Find all lines importing 'logger'
    const loggerImportLines = lines.filter(line => 
      (line.includes('import { logger }') || line.includes('import logger')) && 
      (line.includes('from') && (line.includes('logger') || line.includes('lib/logger') || line.includes('utils/logger')))
    );

    if (loggerImportLines.length > 1) {
      console.log(`Fixing duplicate imports in ${file}`);
      
      // Remove all logger import lines
      let newContent = content;
      loggerImportLines.forEach(line => {
        // Escape special regex characters in the line
        const escapedLine = line.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        const regex = new RegExp(escapedLine + '(\\r\\n|\\n)?', 'g');
        newContent = newContent.replace(regex, '');
      });

      // Add a single clean import at the top
      // Find the last import statement to insert after, or insert at top
      const importRegex = /^import .+ from .+;?$/gm;
      const imports = newContent.match(importRegex);
      
      const newImport = 'import { logger } from "@/lib/logger";';
      
      if (imports && imports.length > 0) {
        const lastImport = imports[imports.length - 1];
        const lastImportIndex = newContent.lastIndexOf(lastImport);
        const insertPos = lastImportIndex + lastImport.length;
        newContent = newContent.slice(0, insertPos) + '\n' + newImport + newContent.slice(insertPos);
      } else {
        newContent = newImport + '\n' + newContent;
      }

      fs.writeFileSync(file, newContent);
      fixedCount++;
    }
  });

  console.log(`Fixed duplicate imports in ${fixedCount} files.`);
};

fixImports();
