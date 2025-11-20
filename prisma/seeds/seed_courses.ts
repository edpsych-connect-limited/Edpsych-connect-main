import { PrismaClient } from '@prisma/client';
import { COURSE_CATALOG } from '../../src/lib/training/course-catalog';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Course Catalog...');

  for (const courseData of COURSE_CATALOG) {
    console.log(`Processing course: ${courseData.title}`);

    // 1. Create or Update Course
    const course = await prisma.course.upsert({
      where: { id: courseData.id },
      update: {
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        level: courseData.level,
        duration: courseData.duration_minutes,
        imageUrl: courseData.image_url,
        cpdHours: courseData.cpd_hours,
        status: 'published', // Set to published
      },
      create: {
        id: courseData.id,
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        level: courseData.level,
        duration: courseData.duration_minutes,
        imageUrl: courseData.image_url,
        cpdHours: courseData.cpd_hours,
        status: 'published',
      },
    });

    // 2. Create or Update Instructor
    if (courseData.instructor) {
      await prisma.courseInstructor.upsert({
        where: { courseId: course.id },
        update: {
          name: courseData.instructor.name,
          title: courseData.instructor.title,
          bio: courseData.instructor.credentials, // Mapping credentials to bio for now
          imageUrl: courseData.instructor.avatar_url,
        },
        create: {
          courseId: course.id,
          name: courseData.instructor.name,
          title: courseData.instructor.title,
          bio: courseData.instructor.credentials,
          imageUrl: courseData.instructor.avatar_url,
        },
      });
    }

    // 3. Process Modules
    for (const moduleData of courseData.modules) {
      const courseModule = await prisma.courseModule.upsert({
        where: { id: moduleData.id },
        update: {
          courseId: course.id,
          title: moduleData.title,
          description: moduleData.description,
          orderIndex: moduleData.module_number,
        },
        create: {
          id: moduleData.id,
          courseId: course.id,
          title: moduleData.title,
          description: moduleData.description,
          orderIndex: moduleData.module_number,
        },
      });

      // 4. Process Lessons
      for (const lessonData of moduleData.lessons) {
        await prisma.courseLesson.upsert({
          where: { id: lessonData.id },
          update: {
            moduleId: courseModule.id,
            title: lessonData.title,
            content: lessonData.content_text || '', // Use content_text if available
            videoUrl: lessonData.content_url,
            duration: lessonData.duration_minutes,
            orderIndex: lessonData.lesson_number,
          },
          create: {
            id: lessonData.id,
            moduleId: courseModule.id,
            title: lessonData.title,
            content: lessonData.content_text || '',
            videoUrl: lessonData.content_url,
            duration: lessonData.duration_minutes,
            orderIndex: lessonData.lesson_number,
          },
        });
      }

      // 5. Process Quiz (if exists)
      if (moduleData.quiz) {
        const quiz = await prisma.courseQuiz.upsert({
          where: { id: moduleData.quiz.id },
          update: {
            courseId: course.id,
            moduleId: courseModule.id,
            title: moduleData.quiz.title,
            passingScore: moduleData.quiz.passing_score,
            orderIndex: 999, // Put quiz at the end
          },
          create: {
            id: moduleData.quiz.id,
            courseId: course.id,
            moduleId: courseModule.id,
            title: moduleData.quiz.title,
            passingScore: moduleData.quiz.passing_score,
            orderIndex: 999,
          },
        });

        // 6. Process Quiz Questions
        for (let i = 0; i < moduleData.quiz.questions.length; i++) {
          const qData = moduleData.quiz.questions[i];
          await prisma.quizQuestion.upsert({
            where: { id: qData.id },
            update: {
              quizId: quiz.id,
              questionText: qData.question,
              questionType: qData.type,
              options: qData.options ? JSON.stringify(qData.options) : undefined,
              correctAnswer: Array.isArray(qData.correct_answer) 
                ? JSON.stringify(qData.correct_answer) 
                : JSON.stringify([qData.correct_answer]),
              explanation: qData.explanation,
              points: qData.points,
              orderIndex: i,
            },
            create: {
              id: qData.id,
              quizId: quiz.id,
              questionText: qData.question,
              questionType: qData.type,
              options: qData.options ? JSON.stringify(qData.options) : undefined,
              correctAnswer: Array.isArray(qData.correct_answer) 
                ? JSON.stringify(qData.correct_answer) 
                : JSON.stringify([qData.correct_answer]),
              explanation: qData.explanation,
              points: qData.points,
              orderIndex: i,
            },
          });
        }
      }
    }
  }

  console.log('✅ Course Catalog seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
