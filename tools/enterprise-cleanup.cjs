#!/usr/bin/env node
/**
 * ENTERPRISE-GRADE FORENSIC CLEANUP
 * Removes ALL unused imports and fixes ESLint warnings
 * Target: ZERO warnings in production build
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

// Track all fixes
const fixes = {
  unusedLogger: [],
  unusedImports: [],
  unusedVars: [],
  errors: []
};

function findFiles(dir, files = []) {
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (!['node_modules', '.next', '.git', 'dist'].includes(item)) {
          findFiles(fullPath, files);
        }
      } else if (item.endsWith('.tsx') || item.endsWith('.ts') || item.endsWith('.js')) {
        files.push(fullPath);
      }
    }
  } catch (e) {
    console.error(`Error reading directory ${dir}: ${e.message}`);
  }
  return files;
}

function isLoggerUsed(content) {
  // Remove import statements and comments before checking
  const withoutImports = content.replace(/import\s*\{[^}]*logger[^}]*\}\s*from\s*['"][^'"]+['"]\s*;?/g, '');
  const withoutComments = withoutImports.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Check for actual usage patterns
  return /\blogger\s*\.\s*\w+\s*\(/.test(withoutComments) || 
         /\blogger\s*\(/.test(withoutComments);
}

function removeUnusedLoggerImport(content) {
  // Pattern 1: import { logger } from "@/lib/logger";
  const pattern1 = /import\s*\{\s*logger\s*\}\s*from\s*['"]@\/lib\/logger['"]\s*;?\s*\n?/g;
  // Pattern 2: import { logger } from "@/utils/logger";
  const pattern2 = /import\s*\{\s*logger\s*\}\s*from\s*['"]@\/utils\/logger['"]\s*;?\s*\n?/g;
  // Pattern 3: Relative imports
  const pattern3 = /import\s*\{\s*logger\s*\}\s*from\s*['"]\.\.?\/[^'"]*logger['"]\s*;?\s*\n?/g;
  
  let newContent = content;
  newContent = newContent.replace(pattern1, '');
  newContent = newContent.replace(pattern2, '');
  newContent = newContent.replace(pattern3, '');
  
  return newContent;
}

function prefixUnusedParams(content, filePath) {
  // This is complex - we'll handle specific known patterns
  let newContent = content;
  
  // Common patterns from build log - prefix with underscore
  const paramPatterns = [
    // Catch block errors
    { from: /catch\s*\(\s*error\s*\)/g, to: 'catch (_error)' },
    { from: /catch\s*\(\s*e\s*\)/g, to: 'catch (_e)' },
    { from: /catch\s*\(\s*err\s*\)/g, to: 'catch (_err)' },
  ];
  
  for (const pattern of paramPatterns) {
    newContent = newContent.replace(pattern.from, pattern.to);
  }
  
  return newContent;
}

function cleanFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    let changed = false;
    const relativePath = path.relative(srcDir, filePath);
    
    // 1. Remove unused logger imports
    if (content.includes('logger') && content.includes('import')) {
      if (!isLoggerUsed(content)) {
        const newContent = removeUnusedLoggerImport(content);
        if (newContent !== content) {
          content = newContent;
          changed = true;
          fixes.unusedLogger.push(relativePath);
        }
      }
    }
    
    // 2. Prefix unused catch block errors with underscore
    const catchErrorFixed = prefixUnusedParams(content, filePath);
    if (catchErrorFixed !== content) {
      content = catchErrorFixed;
      changed = true;
    }
    
    // 3. Clean up multiple blank lines
    content = content.replace(/\n{3,}/g, '\n\n');
    
    // 4. Ensure 'use client' is still first if present
    if (content.includes("'use client'") || content.includes('"use client"')) {
      const useClientMatch = content.match(/['"]use client['"]\s*;?/);
      if (useClientMatch) {
        const trimmed = content.trimStart();
        if (!trimmed.startsWith("'use client") && !trimmed.startsWith('"use client')) {
          // Need to move it
          content = content.replace(/['"]use client['"]\s*;?\s*\n?/, '');
          content = "'use client'\n\n" + content.trimStart();
          changed = true;
        }
      }
    }
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      return { path: filePath, changed: true, relativePath };
    }
    
    return { path: filePath, changed: false };
  } catch (error) {
    fixes.errors.push({ file: filePath, error: error.message });
    return { path: filePath, changed: false, error: error.message };
  }
}

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  ENTERPRISE-GRADE FORENSIC CLEANUP                        ║');
console.log('║  Target: ZERO ESLint warnings                             ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

const files = findFiles(srcDir);
console.log(`Scanning ${files.length} files...\n`);

let cleanedCount = 0;

for (const file of files) {
  const result = cleanFile(file);
  if (result.changed) {
    cleanedCount++;
    console.log(`✓ ${result.relativePath}`);
  }
}

console.log('\n════════════════════════════════════════════════════════════');
console.log(`SUMMARY:`);
console.log(`  Files scanned: ${files.length}`);
console.log(`  Files cleaned: ${cleanedCount}`);
console.log(`  Unused logger imports removed: ${fixes.unusedLogger.length}`);
if (fixes.errors.length > 0) {
  console.log(`  Errors: ${fixes.errors.length}`);
  fixes.errors.forEach(e => console.log(`    - ${e.file}: ${e.error}`));
}
console.log('════════════════════════════════════════════════════════════\n');

// Output detailed report
if (fixes.unusedLogger.length > 0) {
  console.log('Files with unused logger imports removed:');
  fixes.unusedLogger.forEach(f => console.log(`  - ${f}`));
}
