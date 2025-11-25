
import fs from 'fs';
import path from 'path';

const CSV_FILE = path.join(process.cwd(), 'video_scripts', 'all_scripts.csv');
const LOG_FILE = path.join(process.cwd(), 'video_scripts', 'generation_log.txt');

function main() {
  const csvContent = fs.readFileSync(CSV_FILE, 'utf-8');
  const csvRows = csvContent.split('\n').slice(1).filter(row => row.trim().length > 0);
  
  const allTitles = new Set<string>();
  csvRows.forEach(row => {
    const matches = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    if (!matches || matches.length < 6) return;
    const cleanMatches = matches.map(m => m.replace(/^"|"$/g, '').replace(/""/g, '"'));
    const [course, module, lesson] = cleanMatches;
    allTitles.add(`${course} - ${module} - ${lesson}`);
  });

  const logContent = fs.readFileSync(LOG_FILE, 'utf-8');
  const logLines = logContent.split('\n').filter(line => line.trim());
  
  const successTitles = new Set<string>();
  logLines.forEach(line => {
    if (line.includes('| SUCCESS |')) {
      const parts = line.split(' | ');
      if (parts.length >= 4) {
        successTitles.add(parts[3].trim());
      }
    }
  });

  console.log(`Total Scripts: ${allTitles.size}`);
  console.log(`Successful Generations: ${successTitles.size}`);
  
  const missing = [...allTitles].filter(t => !successTitles.has(t));
  console.log(`Missing Videos: ${missing.length}`);
  missing.forEach(t => console.log(` - ${t}`));
}

main();
