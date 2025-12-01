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

const fixErrors = () => {
  const files = walkSync(path.join(__dirname, '../src'));
  let fixedCount = 0;

  files.forEach((file) => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // Fix console._error -> console.error
    content = content.replace(/console\._error/g, 'console.error');
    
    // Fix logger._error -> logger.error
    content = content.replace(/logger\._error/g, 'logger.error');
    
    // Fix toast._error -> toast.error (for toast notifications)
    content = content.replace(/toast\._error/g, 'toast.error');
    
    // Fix _error: in object literals -> error:
    // Be careful with this one - only replace when it looks like an object property
    content = content.replace(/\b_error:/g, 'error:');
    content = content.replace(/"_error"/g, '"error"');
    content = content.replace(/'_error'/g, "'error'");
    
    // Fix status: "_error" -> status: "error"
    content = content.replace(/status:\s*["']_error["']/g, 'status: "error"');
    
    if (content !== originalContent) {
      console.log(`Fixed errors in ${file}`);
      fs.writeFileSync(file, content);
      fixedCount++;
    }
  });

  console.log(`\nFixed _error typos in ${fixedCount} files.`);
};

fixErrors();
