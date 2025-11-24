
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up invalid SecureDocument entries...');
  
  try {
    // Delete rows where path or content is null
    // We use executeRaw because the Prisma Client might be strict about the schema
    // and we want to bypass the model validation if possible, or just use raw SQL
    // to be safe against schema mismatches.
    
    // Note: In raw SQL, we need to be careful with table names if they are mapped.
    // In the schema, it is 'SecureDocument'. Prisma usually maps this to "SecureDocument" (case sensitive in some DBs)
    // or "SecureDocument" if not mapped.
    
    const result = await prisma.$executeRaw`DELETE FROM "SecureDocument" WHERE "path" IS NULL OR "content" IS NULL`;
    
    console.log(`Deleted ${result} invalid SecureDocument entries.`);
  } catch (e) {
    console.error('Error cleaning up SecureDocument:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
