const { PrismaClient } = require('@prisma/client');

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Refusing to connect.');
  }

  const prisma = new PrismaClient();
  
  console.log('Checking founder account...\n');
  
  try {
    const email = process.env.FOUNDER_EMAIL || 'scott.ipatrick@edpsychconnect.com';

    const user = await prisma.users.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        is_active: true,
        password_hash: true,
      },
    });
    
    if (!user) {
      console.log('❌ User NOT FOUND in database!');
      return;
    }
    
    console.log('✅ User found:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Password hash exists:', !!user.password_hash);
    console.log('   Hash length:', user.password_hash?.length || 0);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
