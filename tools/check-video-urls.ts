
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const lessons = await prisma.courseLesson.findMany({
    where: {
      videoUrl: { not: null }
    },
    select: {
      title: true,
      videoUrl: true
    }
  });
  console.log(`Lessons with video URL: ${lessons.length}`);
  lessons.forEach(l => console.log(` - ${l.title}: ${l.videoUrl?.substring(0, 50)}...`));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
