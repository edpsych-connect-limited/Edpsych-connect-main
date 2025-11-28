
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Connecting to database...');
    // Check connection by counting users
    const userCount = await prisma.users.count();
    console.log(`Successfully connected! Found ${userCount} users.`);
    
    // Check if we are in production (Neon)
    const dbUrl = process.env.DATABASE_URL || '';
    if (dbUrl.includes('neon.tech')) {
      console.log('Verified: Connected to Neon DB (Production/Staging).');
    } else {
      console.log('Warning: Not connected to Neon DB.');
      console.log('URL:', dbUrl.replace(/:[^:]*@/, ':***@'));
    }
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
