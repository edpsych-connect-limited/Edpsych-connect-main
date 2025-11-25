
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const totalLessons = await prisma.courseLesson.count();
  const lessonsWithVideo = await prisma.courseLesson.count({
    where: {
      videoUrl: {
        not: null
      }
    }
  });

  console.log(`Total Lessons: ${totalLessons}`);
  console.log(`Lessons with Video: ${lessonsWithVideo}`);
  
  if (lessonsWithVideo < totalLessons) {
    console.log('\nMissing Videos for:');
    const missing = await prisma.courseLesson.findMany({
      where: { videoUrl: null },
      select: { title: true, module: { select: { title: true, course: { select: { title: true } } } } }
    });
    
    missing.forEach(l => {
      console.log(`- ${l.module.course.title} > ${l.module.title} > ${l.title}`);
    });
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
