import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgres://neondb_owner:npg_zkQMGCh0ZO8L@ep-steep-boat-abz9lg8e-pooler.eu-west-2.aws.neon.tech/neondb?connect_timeout=15&sslmode=require',
    },
  },
});

async function main() {
  console.log('Testing DB connection...');
  // console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':***@'));
  
  try {
    await prisma.$connect();
    console.log('Connected successfully!');
    const count = await prisma.users.count();
    console.log('User count:', count);
  } catch (e) {
    console.error('Connection failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
