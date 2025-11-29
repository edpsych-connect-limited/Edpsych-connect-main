#!/usr/bin/env node
/**
 * Enterprise-Grade Cleanup: Remove ALL unused logger imports
 * This script scans every .ts/.tsx file and removes logger imports that are never used
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

function findFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!['node_modules', '.next', '.git', 'dist'].includes(item)) {
        findFiles(fullPath, files);
      }
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

function isLoggerUsed(content, importLine) {
  // Remove the import line itself before checking usage
  const contentWithoutImport = content.replace(importLine, '');
  
  // Check for actual logger usage patterns
  const usagePatterns = [
    /\blogger\.info\s*\(/,
    /\blogger\.error\s*\(/,
    /\blogger\.warn\s*\(/,
    /\blogger\.debug\s*\(/,
    /\blogger\.log\s*\(/,
    /\blogger\s*\.\s*\w+\s*\(/,  // logger.anyMethod()
    /\blogger\s*,/,              // logger passed as argument
    /:\s*logger\b/,              // logger as value in object
    /=\s*logger\b/,              // logger assigned
  ];
  
  for (const pattern of usagePatterns) {
    if (pattern.test(contentWithoutImport)) {
      return true;
    }
  }
  
  return false;
}

function cleanFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  
  // Match various logger import patterns
  const loggerImportPatterns = [
    /import\s*\{\s*logger\s*\}\s*from\s*['"]@\/lib\/logger['"]\s*;?\s*\n?/g,
    /import\s*\{\s*logger\s*\}\s*from\s*['"]@\/utils\/logger['"]\s*;?\s*\n?/g,
    /import\s*\{\s*logger\s*\}\s*from\s*['"]\.\.?\/.*logger['"]\s*;?\s*\n?/g,
    /import\s+logger\s+from\s*['"]@\/lib\/logger['"]\s*;?\s*\n?/g,
    /import\s+logger\s+from\s*['"]@\/utils\/logger['"]\s*;?\s*\n?/g,
  ];
  
  let hasChanges = false;
  
  for (const pattern of loggerImportPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      for (const match of matches) {
        if (!isLoggerUsed(content, match)) {
          content = content.replace(match, '');
          hasChanges = true;
        }
      }
    }
  }
  
  // Clean up any resulting double blank lines
  content = content.replace(/\n{3,}/g, '\n\n');
  
  // Ensure file starts correctly (no leading blank line after 'use client')
  content = content.replace(/^('use client'\s*;?\s*)\n{2,}/m, "'use client'\n\n");
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    return { path: filePath, changed: true };
  }
  
  return { path: filePath, changed: false };
}

console.log('========================================');
console.log('ENTERPRISE CLEANUP: Removing unused imports');
console.log('========================================\n');

const files = findFiles(srcDir);
let cleanedCount = 0;
const cleanedFiles = [];

for (const file of files) {
  try {
    const result = cleanFile(file);
    if (result.changed) {
      cleanedCount++;
      cleanedFiles.push(path.relative(srcDir, result.path));
      console.log(`✓ Cleaned: ${path.relative(srcDir, result.path)}`);
    }
  } catch (error) {
    console.error(`✗ Error: ${file} - ${error.message}`);
  }
}

console.log('\n========================================');
console.log(`Total files scanned: ${files.length}`);
console.log(`Files cleaned: ${cleanedCount}`);
console.log('========================================\n');

if (cleanedCount > 0) {
  console.log('Cleaned files:');
  cleanedFiles.forEach(f => console.log(`  - ${f}`));
}
