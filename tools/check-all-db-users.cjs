const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('='.repeat(60));
  console.log('ALL USERS IN DATABASE');
  console.log('='.repeat(60));
  
  try {
    const users = await prisma.users.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        is_active: true,
      },
      orderBy: { id: 'asc' }
    });
    
    console.log(`\nFound ${users.length} users:\n`);
    
    for (const user of users) {
      console.log(`ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Active: ${user.is_active}`);
      console.log('');
    }
    
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
