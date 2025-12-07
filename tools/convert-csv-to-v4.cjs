const fs = require('fs');
const path = require('path');

const CSV_PATH = path.join(__dirname, '..', 'video_scripts', 'all_scripts.csv');
const V4_ROOT = path.join(__dirname, '..', 'video_scripts', 'v4_generated');

// Ensure V4 root exists
if (!fs.existsSync(V4_ROOT)) {
    fs.mkdirSync(V4_ROOT, { recursive: true });
}

// Helper to parse CSV line
function parseCSVLine(text) {
    const result = [];
    let cell = '';
    let inQuotes = false;
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"') {
            if (inQuotes && text[i + 1] === '"') {
                cell += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(cell);
            cell = '';
        } else {
            cell += char;
        }
    }
    result.push(cell);
    return result;
}

function parseCSV(content) {
    const lines = [];
    let currentLine = '';
    let inQuotes = false;
    
    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        if (char === '"') {
            if (inQuotes && content[i + 1] === '"') {
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        }
        if (char === '\n' && !inQuotes) {
            lines.push(currentLine);
            currentLine = '';
        } else if (char === '\r' && !inQuotes) {
            // ignore
        } else {
            currentLine += char;
        }
    }
    if (currentLine) lines.push(currentLine);
    
    const headers = parseCSVLine(lines[0]);
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = parseCSVLine(lines[i]);
        const entry = {};
        headers.forEach((h, index) => {
            entry[h] = values[index];
        });
        data.push(entry);
    }
    return data;
}

function slugify(text) {
    const slug = text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start
        .replace(/-+$/, '');            // Trim - from end
    
    // Truncate to 50 chars to avoid filesystem errors
    return slug.length > 50 ? slug.substring(0, 50) : slug;
}

function main() {
    console.log('Reading CSV...');
    const csvContent = fs.readFileSync(CSV_PATH, 'utf8');
    const records = parseCSV(csvContent);
    console.log(`Found ${records.length} records.`);

    let createdCount = 0;
    let skippedCount = 0;

    records.forEach(record => {
        const courseSlug = slugify(record.Course || 'uncategorized');
        const lessonSlug = slugify(record.Lesson || 'untitled');
        const dirPath = path.join(V4_ROOT, courseSlug);
        
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        const filePath = path.join(dirPath, `${lessonSlug}.md`);
        
        // Check if file already exists (we don't want to overwrite existing V4 scripts as they might be manually edited)
        if (fs.existsSync(filePath)) {
            skippedCount++;
            return;
        }

        // Create V4 Content
        const scriptContent = record.Script || '';
        const title = record.Lesson || 'Untitled';
        const category = courseSlug;
        const speaker = record.Instructor || 'Dr. Scott Ighavongbe-Patrick';
        
        // Estimate duration (avg 150 words per minute)
        const wordCount = scriptContent.split(/\s+/).length;
        const durationSeconds = Math.ceil((wordCount / 150) * 60);
        
        const fileContent = `---
id: ${lessonSlug}
title: ${title}
duration: ${durationSeconds} seconds
audience: General
category: ${category}
speaker: ${speaker}
---

# ${title}

**Speaker:** ${speaker}
**Duration:** ${durationSeconds} seconds

---

## Script

${scriptContent}
`;

        fs.writeFileSync(filePath, fileContent);
        console.log(`Created: ${filePath}`);
        createdCount++;
    });

    console.log(`\nSummary:`);
    console.log(`Created: ${createdCount}`);
    console.log(`Skipped (Already Existed): ${skippedCount}`);
}

main();