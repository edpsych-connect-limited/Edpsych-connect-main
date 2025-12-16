import { PrismaClient } from '@prisma/client';

// Use DATABASE_URL environment variable (set it before running this script)
if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set');
  console.error('Set it using: export DATABASE_URL="your-connection-string"');
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  console.log('Checking founder account...\n');
  
  const user = await prisma.users.findUnique({
    where: { email: 'scott.ipatrick@edpsychconnect.com' },
    include: {
      tenants: true,
      professionals: true,
    },
  });
  
  if (!user) {
    console.log('❌ User NOT FOUND in database!');
    return;
  }
  
  console.log('✅ User found:');
  console.log('   ID:', user.id);
  console.log('   Email:', user.email);
  console.log('   Name:', user.name);
  console.log('   Role:', user.role);
  console.log('   Active:', user.is_active);
  console.log('   Password hash exists:', !!user.password_hash);
  console.log('   Hash length:', user.password_hash?.length || 0);
  console.log('   Hash preview:', user.password_hash?.substring(0, 20) + '...');
  console.log('\n   Note: This script does not verify/reset passwords.');
  
  await prisma.$disconnect();
}

main().catch(console.error);
