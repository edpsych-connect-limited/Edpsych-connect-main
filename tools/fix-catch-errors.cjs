/**
 * Fix Catch Error Pattern
 * Finds and fixes all instances where catch(_error) uses `error` instead of `_error`
 * 
 * Run with: node tools/fix-catch-errors.cjs
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

const fixCatchErrors = () => {
  const srcPath = path.join(__dirname, '../src');
  const files = walkSync(srcPath);
  let totalFixed = 0;
  let filesFixed = 0;

  files.forEach((file) => {
    let content = fs.readFileSync(file, 'utf8');
    let fixedInFile = 0;
    
    // Pattern 1: catch (_error) { ... error (not _error)
    // This matches catch blocks that use _error but reference error
    const pattern1 = /catch\s*\(\s*_error\s*\)\s*\{([^}]*?)(?<![_a-zA-Z])error(?![_a-zA-Z])/g;
    
    // Pattern 2: catch (_err) { ... err (not _err)  
    const pattern2 = /catch\s*\(\s*_err\s*\)\s*\{([^}]*?)(?<![_a-zA-Z])err(?![_a-zA-Z])/g;

    // Replace _error catches
    let newContent = content;
    
    // More sophisticated replacement - find catch blocks and fix them
    const catchBlockRegex = /catch\s*\(\s*(_error|_err)\s*\)\s*\{/g;
    let match;
    const replacements = [];
    
    while ((match = catchBlockRegex.exec(content)) !== null) {
      const catchVar = match[1]; // _error or _err
      const expectedVar = catchVar.substring(1); // error or err
      const startIndex = match.index + match[0].length;
      
      // Find the matching closing brace
      let braceCount = 1;
      let endIndex = startIndex;
      while (braceCount > 0 && endIndex < content.length) {
        if (content[endIndex] === '{') braceCount++;
        if (content[endIndex] === '}') braceCount--;
        endIndex++;
      }
      
      const blockContent = content.substring(startIndex, endIndex - 1);
      
      // Check if block uses the wrong variable name (without underscore)
      const wrongVarPattern = new RegExp(`(?<![_a-zA-Z])${expectedVar}(?![_a-zA-Z])`, 'g');
      if (wrongVarPattern.test(blockContent)) {
        // Replace wrong var with correct var in this block
        const fixedBlock = blockContent.replace(wrongVarPattern, catchVar);
        replacements.push({
          start: startIndex,
          end: endIndex - 1,
          original: blockContent,
          fixed: fixedBlock
        });
        fixedInFile++;
      }
    }
    
    // Apply replacements in reverse order to preserve indices
    replacements.reverse().forEach(rep => {
      newContent = newContent.substring(0, rep.start) + rep.fixed + newContent.substring(rep.end);
    });
    
    if (fixedInFile > 0) {
      fs.writeFileSync(file, newContent);
      console.log(`✅ Fixed ${fixedInFile} catch block(s) in ${path.relative(srcPath, file)}`);
      filesFixed++;
      totalFixed += fixedInFile;
    }
  });

  console.log(`\n🎉 Total: Fixed ${totalFixed} catch blocks across ${filesFixed} files.`);
};

fixCatchErrors();
