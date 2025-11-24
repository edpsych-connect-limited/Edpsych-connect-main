
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.studentProfile.count();
  console.log(`StudentProfile count: ${count}`);
  
  const students = await prisma.students.count();
  console.log(`Students count: ${students}`);
  
  const assignments = await prisma.studentLessonAssignment.count();
  console.log(`Assignments count: ${assignments}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
