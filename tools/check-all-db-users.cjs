const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgres://neondb_owner:npg_zkQMGCh0ZO8L@ep-steep-boat-abz9lg8e-pooler.eu-west-2.aws.neon.tech/neondb?connect_timeout=15&sslmode=require'
    }
  }
});

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
        password_hash: true,
      },
      orderBy: { id: 'asc' }
    });
    
    console.log(`\nFound ${users.length} users:\n`);
    
    for (const user of users) {
      // Test password for each user
      const testPasswords = ['Test123!', 'Founder2025!'];
      let validPassword = 'UNKNOWN';
      
      for (const pwd of testPasswords) {
        if (user.password_hash) {
          const isValid = await bcrypt.compare(pwd, user.password_hash);
          if (isValid) {
            validPassword = pwd;
            break;
          }
        }
      }
      
      console.log(`ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Active: ${user.is_active}`);
      console.log(`  Password: ${validPassword}`);
      console.log('');
    }
    
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
