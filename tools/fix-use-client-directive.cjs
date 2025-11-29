#!/usr/bin/env node
/**
 * Fix 'use client' directive placement and remove unused logger imports
 * The 'use client' directive MUST be the first statement in a file (before any imports)
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

function findTsxFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findTsxFiles(fullPath, files);
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  
  // Check if file has 'use client'
  const useClientMatch = content.match(/['"]use client['"]\s*;?\s*\n?/);
  if (!useClientMatch) {
    return { path: filePath, changed: false, reason: 'no use client' };
  }
  
  // Check if 'use client' is already at the start (allowing for leading whitespace)
  const trimmedContent = content.trimStart();
  if (trimmedContent.startsWith("'use client'") || trimmedContent.startsWith('"use client"')) {
    // Still need to check for unused logger import
    const hasLoggerImport = /import\s*\{\s*logger\s*\}\s*from\s*['"]@\/lib\/logger['"]\s*;?\s*\n?/.test(content);
    const hasLoggerUsage = content.includes('logger.') || content.includes('logger(') || content.includes('logger,') || /\blogger\b(?!\s*\})/.test(content.replace(/import\s*\{\s*logger\s*\}/, ''));
    
    if (hasLoggerImport && !hasLoggerUsage) {
      content = content.replace(/import\s*\{\s*logger\s*\}\s*from\s*['"]@\/lib\/logger['"]\s*;?\s*\n?/g, '');
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        return { path: filePath, changed: true, reason: 'removed unused logger import' };
      }
    }
    
    return { path: filePath, changed: false, reason: 'already correct' };
  }
  
  // Extract the 'use client' directive
  const useClientDirective = useClientMatch[0].trim();
  
  // Remove the 'use client' from its current position
  content = content.replace(/['"]use client['"]\s*;?\s*\n?/, '');
  
  // Remove unused logger import if present
  const hasLoggerImport = /import\s*\{\s*logger\s*\}\s*from\s*['"]@\/lib\/logger['"]\s*;?\s*\n?/.test(content);
  const hasLoggerUsage = content.includes('logger.') || content.includes('logger(') || content.includes('logger,') || /\blogger\b(?!\s*\})/.test(content.replace(/import\s*\{\s*logger\s*\}/, ''));
  
  if (hasLoggerImport && !hasLoggerUsage) {
    content = content.replace(/import\s*\{\s*logger\s*\}\s*from\s*['"]@\/lib\/logger['"]\s*;?\s*\n?/g, '');
  }
  
  // Remove any leading JSDoc comments or other comments before imports
  // We want 'use client' to be absolutely first
  let leadingContent = '';
  const lines = content.split('\n');
  let startIndex = 0;
  
  // Skip empty lines at the start
  while (startIndex < lines.length && lines[startIndex].trim() === '') {
    startIndex++;
  }
  
  // Check if there's a copyright comment at the start - we need to preserve it but put 'use client' BEFORE it
  // Actually no - 'use client' must be FIRST, even before comments
  
  // Reconstruct content without leading empty lines
  content = lines.slice(startIndex).join('\n');
  
  // Add 'use client' at the very start
  const newContent = `'use client'\n\n${content.trimStart()}`;
  
  if (newContent !== originalContent) {
    fs.writeFileSync(filePath, newContent);
    return { path: filePath, changed: true, reason: 'moved use client to top' };
  }
  
  return { path: filePath, changed: false, reason: 'no changes needed' };
}

console.log('Scanning for files with use client directive issues...\n');

const files = findTsxFiles(srcDir);
const results = [];
let fixedCount = 0;
let skippedCount = 0;

for (const file of files) {
  try {
    const result = fixFile(file);
    if (result.changed) {
      fixedCount++;
      console.log(`✓ Fixed: ${path.relative(srcDir, result.path)} (${result.reason})`);
    } else {
      skippedCount++;
    }
    results.push(result);
  } catch (error) {
    console.error(`✗ Error processing ${file}: ${error.message}`);
  }
}

console.log(`\n========================================`);
console.log(`Total files scanned: ${files.length}`);
console.log(`Files fixed: ${fixedCount}`);
console.log(`Files skipped: ${skippedCount}`);
console.log(`========================================\n`);
