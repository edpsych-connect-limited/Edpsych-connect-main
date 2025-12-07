
import fs from 'fs';
import path from 'path';
import { MARKETING_VIDEOS } from '../video_scripts/world_class/marketing-scripts';
import { ONBOARDING_SCRIPTS } from '../video_scripts/world_class/onboarding-scripts';

const CSV_FILE = path.join(process.cwd(), 'video_scripts', 'all_scripts.csv');

function formatForCsv(text: string): string {
  // 1. Replace newlines with spaces (to avoid breaking the simple CSV parser)
  let clean = text.replace(/[\r\n]+/g, ' ');
  // 2. Escape double quotes
  clean = clean.replace(/"/g, '""');
  return `"${clean}"`;
}

function appendScript(course: string, module: string, lesson: string, script: string) {
  const instructor = "Dr. Scott Ighavongbe-Patrick";
  const gender = "Male";
  const formattedScript = formatForCsv(script);
  
  // CSV Columns: Course,Module,Lesson,Instructor,Avatar Gender,Script
  const line = `"${course}","${module}","${lesson}","${instructor}","${gender}",${formattedScript}\n`;
  
  fs.appendFileSync(CSV_FILE, line);
  console.log(`✅ Appended: ${lesson}`);
}

async function main() {
  console.log('Checking for missing scripts...');

  // 1. Marketing Videos
  console.log('\n--- Processing Marketing Videos ---');
  Object.values(MARKETING_VIDEOS).forEach(video => {
    appendScript('Marketing', 'Platform Overview', video.title, video.script);
  });

  // 2. Onboarding Videos
  console.log('\n--- Processing Onboarding Videos ---');
  Object.values(ONBOARDING_SCRIPTS).forEach(video => {
    // Map keys to titles if needed, but the object values have title and script
    appendScript('Onboarding', 'Getting Started', video.title, video.script);
  });

  console.log('\n✨ All missing scripts appended to CSV.');
}

main();
