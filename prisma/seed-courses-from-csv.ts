
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const CSV_FILE = path.join(process.cwd(), 'video_scripts', 'all_scripts.csv');

async function main() {
  console.log('🌱 Seeding Courses from CSV...');

  if (!fs.existsSync(CSV_FILE)) {
    console.error(`❌ CSV file not found: ${CSV_FILE}`);
    process.exit(1);
  }

  // Get or create tenant
  let tenant = await prisma.tenants.findFirst({
    where: { subdomain: 'demo' }
  });

  if (!tenant) {
    tenant = await prisma.tenants.create({
      data: {
        name: 'Demo School',
        subdomain: 'demo',
        tenant_type: 'SCHOOL'
      }
    });
    console.log('   ✅ Created demo tenant');
  }

  const content = fs.readFileSync(CSV_FILE, 'utf-8');
  const rows = content.split('\n').slice(1).filter(row => row.trim().length > 0);

  console.log(`   Found ${rows.length} lessons to process.`);

  // Group by Course -> Module -> Lesson
  const courses: any = {};

  for (const row of rows) {
    const matches = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    if (!matches || matches.length < 6) continue;

    const cleanMatches = matches.map(m => m.replace(/^"|"$/g, '').replace(/""/g, '"'));
    const [courseTitle, moduleTitle, lessonTitle, instructor, gender, script] = cleanMatches;

    if (!courses[courseTitle]) {
      courses[courseTitle] = {
        title: courseTitle,
        description: `Course by ${instructor}`,
        modules: {}
      };
    }

    if (!courses[courseTitle].modules[moduleTitle]) {
      courses[courseTitle].modules[moduleTitle] = {
        title: moduleTitle,
        lessons: []
      };
    }

    courses[courseTitle].modules[moduleTitle].lessons.push({
      title: lessonTitle,
      content: script,
      instructor: instructor
    });
  }

  // Insert into DB
  for (const courseTitle in courses) {
    const courseData = courses[courseTitle];
    
    // Create Course (Uppercase model)
    let course = await prisma.course.findFirst({
      where: { title: courseData.title }
    });

    if (!course) {
      course = await prisma.course.create({
        data: {
          title: courseData.title,
          description: courseData.description,
          category: 'Professional Development',
          level: 'Intermediate',
          duration: 60,
          status: 'published'
        }
      });
      console.log(`   ✅ Created Course: ${course.title}`);
    } else {
      console.log(`   ℹ️  Course exists: ${course.title}`);
    }

    let moduleIndex = 0;
    for (const moduleTitle in courseData.modules) {
      const moduleData = courseData.modules[moduleTitle];
      
      let module = await prisma.courseModule.findFirst({
        where: { courseId: course.id, title: moduleTitle }
      });

      if (!module) {
        module = await prisma.courseModule.create({
          data: {
            courseId: course.id,
            title: moduleTitle,
            description: `Module ${moduleIndex + 1}`,
            orderIndex: moduleIndex
          }
        });
        console.log(`      ✅ Created Module: ${module.title}`);
      }

      let lessonIndex = 0;
      for (const lessonData of moduleData.lessons) {
        let lesson = await prisma.courseLesson.findFirst({
          where: { moduleId: module.id, title: lessonData.title }
        });

        if (!lesson) {
          lesson = await prisma.courseLesson.create({
            data: {
              moduleId: module.id,
              title: lessonData.title,
              content: lessonData.content,
              orderIndex: lessonIndex,
              duration: 5 // Default duration
            }
          });
          console.log(`         ✅ Created Lesson: ${lesson.title}`);
        }
        lessonIndex++;
      }
      moduleIndex++;
    }
  }

  console.log('🎉 Course Seeding Completed!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
