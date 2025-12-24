
import fs from 'fs';
import path from 'path';
import glob from 'glob';

const V4_DIR = path.join(process.cwd(), 'video_scripts', 'v4_generated');
const CSV_FILE = path.join(process.cwd(), 'video_scripts', 'all_scripts.csv');

// Mapping from folder name to Course Title
const COURSE_MAPPING: Record<string, string> = {
  'autism-spectrum-support': 'Autism Spectrum Support: Complete Guide',
  'adhd-understanding-support': 'ADHD Understanding & Support',
  'dyslexia-intervention-strategies': 'Dyslexia Intervention Strategies',
  'platform-features': 'Platform Features & Tutorials',
  'ehcp': 'EHCP Mastery: Complete Process Guide',
  'laPortal': 'Local Authority Portal Training',
  'parentPortal': 'Parent Portal Guide',
  'compliance': 'Compliance & Safety',
  'assessment': 'Assessment Essentials',
  'innovation': 'Innovation in EdPsych',
  'helpCentre': 'Help Centre Tutorials'
};

// Mapping from mX to Module Title (Generic fallback)
const MODULE_MAPPING: Record<string, string> = {
  'm1': 'Module 1: Foundations',
  'm2': 'Module 2: Core Concepts',
  'm3': 'Module 3: Advanced Strategies',
  'm4': 'Module 4: Practical Application',
  'm5': 'Module 5: Case Studies',
  'm6': 'Module 6: Assessment',
  'm7': 'Module 7: Interventions',
  'm8': 'Module 8: Review & Next Steps'
};

function parseMarkdown(content: string) {
  const frontmatterRegex = /---\n([\s\S]*?)\n---/;
  const scriptRegex = /## Script\s*([\s\S]*)/;

  const frontmatterMatch = content.match(frontmatterRegex);
  const scriptMatch = content.match(scriptRegex);

  const metadata: any = {};
  if (frontmatterMatch) {
    const lines = frontmatterMatch[1].split('\n');
    lines.forEach(line => {
      const [key, ...value] = line.split(':');
      if (key && value) {
        metadata[key.trim()] = value.join(':').trim();
      }
    });
  }

  const script = scriptMatch ? scriptMatch[1].trim() : '';
  
  // Clean script: remove newlines and escape quotes
  const cleanScript = script.replace(/"/g, '""').replace(/\n/g, ' ');

  return { metadata, script: cleanScript };
}

function main() {
  console.log('🔄 Merging V4 Scripts into CSV...');

  if (!fs.existsSync(V4_DIR)) {
    console.error(`❌ V4 Directory not found: ${V4_DIR}`);
    return;
  }

  const files = glob.sync('**/*.md', { cwd: V4_DIR });
  console.log(`   Found ${files.length} Markdown files.`);

  let csvContent = fs.readFileSync(CSV_FILE, 'utf-8');
  // Ensure we end with a newline
  if (!csvContent.endsWith('\n')) csvContent += '\n';

  let addedCount = 0;

  files.forEach(file => {
    const filePath = path.join(V4_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { metadata, script } = parseMarkdown(content);

    if (!script) {
      console.warn(`   ⚠️  No script found in ${file}`);
      return;
    }

    const folder = path.dirname(file).split(path.sep)[0];
    const filename = path.basename(file, '.md');
    
    // Determine Course
    const courseTitle = COURSE_MAPPING[folder] || metadata.category || 'General Training';

    // Determine Module
    // Try to extract mX from filename (e.g., autism-m1-l1)
    const moduleMatch = filename.match(/-m(\d+)-/);
    const moduleKey = moduleMatch ? `m${moduleMatch[1]}` : 'm1';
    const moduleTitle = MODULE_MAPPING[moduleKey] || 'Core Module';

    // Determine Lesson
    const lessonTitle = metadata.title || filename;

    // Determine Instructor / Avatar Gender
    // Truth-by-code: do NOT default to a real person's identity or gender when metadata is missing.
    // Leave blank unless explicitly provided in frontmatter.
    const instructor = metadata.speaker || metadata.instructor || '';
    const gender = metadata.gender || '';

    // Check if this script is already in the CSV (simple check by title)
    // This is a bit loose, but prevents exact duplicates if run multiple times
    if (csvContent.includes(`"${lessonTitle}"`)) {
        // console.log(`   ℹ️  Skipping existing lesson: ${lessonTitle}`);
        // return;
    }

    // Format CSV Row
    // Course,Module,Lesson,Instructor,Avatar Gender,Script
    const row = `"${courseTitle}","${moduleTitle}","${lessonTitle}","${instructor}","${gender}","${script}"\n`;
    
    csvContent += row;
    addedCount++;
  });

  fs.writeFileSync(CSV_FILE, csvContent);
  console.log(`✅ Added ${addedCount} new scripts to ${CSV_FILE}`);
}

main();
