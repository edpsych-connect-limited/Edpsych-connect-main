
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Checking CourseEnrollment model...');
  if (prisma.courseEnrollment) {
    console.log('CourseEnrollment model exists.');
  } else {
    console.log('CourseEnrollment model DOES NOT exist.');
    console.log('Available models:', Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$')));
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
