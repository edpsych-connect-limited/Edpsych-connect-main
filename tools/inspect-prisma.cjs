
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Checking prisma.course...');
  try {
    // Try to find one to see the fields
    const c1 = await prisma.course.findFirst();
    console.log('prisma.course result keys:', c1 ? Object.keys(c1) : 'No data');
  } catch (e) {
    console.log('prisma.course error:', e.message);
  }

  console.log('Checking prisma.courses...');
  try {
    const c2 = await prisma.courses.findFirst();
    console.log('prisma.courses result keys:', c2 ? Object.keys(c2) : 'No data');
  } catch (e) {
    console.log('prisma.courses error:', e.message);
  }
  
  console.log('Checking prisma.Course...');
  try {
    if (prisma.Course) {
        const c3 = await prisma.Course.findFirst();
        console.log('prisma.Course result keys:', c3 ? Object.keys(c3) : 'No data');
    } else {
        console.log('prisma.Course is undefined');
    }
  } catch (e) {
    console.log('prisma.Course error:', e.message);
  }
}

main();
