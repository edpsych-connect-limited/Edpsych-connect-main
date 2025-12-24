
import fs from 'fs';
import path from 'path';
import { COURSE_CATALOG } from '../src/lib/training/course-catalog';

const OUTPUT_DIR = path.join(process.cwd(), 'video_scripts');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

console.log('🎬 Exporting Video Scripts for HeyGen...');

const csvRows = [
  ['Course', 'Module', 'Lesson', 'Instructor', 'Avatar Gender', 'Script']
];

let totalScripts = 0;

COURSE_CATALOG.forEach(course => {
  const safeCourseTitle = course.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const courseDir = path.join(OUTPUT_DIR, safeCourseTitle);
  
  if (!fs.existsSync(courseDir)) {
    fs.mkdirSync(courseDir);
  }

  console.log(`\nProcessing Course: ${course.title}`);
  
  // Truth-by-code: avoid heuristics (e.g., inferring gender from a name).
  // Leave blank unless you have explicit, auditable metadata.
  const instructorName = course.instructor.name;
  const avatarGender = '';

  course.modules.forEach(module => {
    module.lessons.forEach(lesson => {
      if (lesson.content_text) {
        // Add to CSV
        csvRows.push([
          `"${course.title}"`,
          `"${module.title}"`,
          `"${lesson.title}"`,
          `"${instructorName}"`,
          `"${avatarGender}"`,
          `"${lesson.content_text.replace(/"/g, '""')}"` // Escape quotes
        ]);

        // Create individual text file for easy reading
        const filename = `${module.module_number}-${lesson.lesson_number}_${lesson.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
        const filePath = path.join(courseDir, filename);
        
        const fileContent = `COURSE: ${course.title}
MODULE: ${module.module_number}: ${module.title}
LESSON: ${lesson.lesson_number}: ${lesson.title}
INSTRUCTOR: ${instructorName} (${avatarGender} Avatar)
---------------------------------------------------

${lesson.content_text}
`;

        fs.writeFileSync(filePath, fileContent);
        totalScripts++;
      }
    });
  });
});

// Write CSV
const csvContent = csvRows.join('\n');
fs.writeFileSync(path.join(OUTPUT_DIR, 'all_scripts.csv'), csvContent);

console.log(`\n✅ Export Complete!`);
console.log(`📝 Total Scripts: ${totalScripts}`);
console.log(`📂 Output Directory: ${OUTPUT_DIR}`);
console.log(`📊 CSV File: ${path.join(OUTPUT_DIR, 'all_scripts.csv')}`);
