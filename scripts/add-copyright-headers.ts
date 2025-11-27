#!/usr/bin/env node
/**
 * EdPsych Connect - Copyright Header Injection Script
 * 
 * Adds copyright headers to all TypeScript/JavaScript files
 * Run with: npx tsx scripts/add-copyright-headers.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const COPYRIGHT_HEADER = `/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

`;

const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const SKIP_DIRS = ['node_modules', '.next', 'dist', '.git', 'coverage'];
const SKIP_FILES = ['next-env.d.ts', '.d.ts'];

function shouldProcess(filePath: string): boolean {
  const ext = path.extname(filePath);
  if (!EXTENSIONS.includes(ext)) return false;
  
  for (const skip of SKIP_FILES) {
    if (filePath.endsWith(skip)) return false;
  }
  
  return true;
}

function hasHeader(content: string): boolean {
  return content.includes('@copyright EdPsych Connect');
}

function addHeader(filePath: string): void {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (hasHeader(content)) {
      console.log(`⏭️  Skipping (already has header): ${filePath}`);
      return;
    }
    
    // Check if file starts with 'use client' or 'use server'
    let newContent: string;
    if (content.startsWith("'use client'") || content.startsWith('"use client"')) {
      newContent = content.replace(/^(['"]use client['"])\n?/, `$1\n\n${COPYRIGHT_HEADER}`);
    } else if (content.startsWith("'use server'") || content.startsWith('"use server"')) {
      newContent = content.replace(/^(['"]use server['"])\n?/, `$1\n\n${COPYRIGHT_HEADER}`);
    } else if (content.startsWith('/**')) {
      // Already has a JSDoc comment, skip
      console.log(`⏭️  Skipping (has existing comment): ${filePath}`);
      return;
    } else {
      newContent = COPYRIGHT_HEADER + content;
    }
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Added header: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
  }
}

function walkDirectory(dir: string): void {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.includes(entry.name)) {
        walkDirectory(fullPath);
      }
    } else if (entry.isFile() && shouldProcess(fullPath)) {
      addHeader(fullPath);
    }
  }
}

// Main execution
const srcDir = path.join(process.cwd(), 'src');

if (!fs.existsSync(srcDir)) {
  console.error('❌ src directory not found. Run from project root.');
  process.exit(1);
}

console.log('🔒 EdPsych Connect - Adding Copyright Headers\n');
console.log(`Processing files in: ${srcDir}\n`);

walkDirectory(srcDir);

console.log('\n✅ Copyright header injection complete!');
console.log('\n⚠️  Note: Review changes with `git diff` before committing.');
