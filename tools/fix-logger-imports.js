
const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filepath = path.join(dir, file);
        const stats = fs.statSync(filepath);
        if (stats.isDirectory()) {
            walk(filepath, callback);
        } else if (stats.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js'))) {
            callback(filepath);
        }
    });
}

walk('./src', (filepath) => {
    if (filepath.includes('src/lib/logger.ts')) return;
    
    let content = fs.readFileSync(filepath, 'utf8');
    
    // Check if logger is used but not imported
    if (content.includes('logger.') && !content.includes('import { logger }') && !content.includes('import logger') && !content.includes('require(')) {
        
        // Determine import path
        let importPath = '@/lib/logger';
        
        // For JS files or if aliases aren't working, we might need relative paths, but let's stick to alias for now for TS
        // For JS files, we might need require if it's CJS, but this project seems to be ESM/TS mostly.
        
        const importStmt = `import { logger } from '${importPath}';\n`;
        
        // Insert after directives or comments
        const lines = content.split('\n');
        let insertIdx = 0;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith("'use client'") || line.startsWith('"use client"') || line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) {
                insertIdx = i + 1;
            } else {
                break;
            }
        }
        
        lines.splice(insertIdx, 0, importStmt);
        fs.writeFileSync(filepath, lines.join('\n'));
        console.log(`Fixed ${filepath}`);
    }
});
