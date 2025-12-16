const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Refusing to connect.');
}

const prisma = new PrismaClient();

async function main() {
  console.log('Checking founder account in USERS table...\n');
  
  try {
    const email = process.env.FOUNDER_EMAIL || 'scott.ipatrick@edpsychconnect.com';

    const user = await prisma.users.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.log('❌ User NOT FOUND in database!');
      console.log('\nLet me search for all users with scott in email...');
      const scottUsers = await prisma.users.findMany({
        where: { email: { contains: 'scott' } }
      });
      console.log('Found:', scottUsers.map(u => u.email));
      return;
    }
    
    console.log('✅ User found:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Name:', user.name);
    console.log('   Role:', user.role);
    console.log('   is_active:', user.is_active);
    console.log('   Password hash exists:', !!user.password_hash);
    console.log('   Hash length:', user.password_hash?.length || 0);
    const shouldReset = process.env.CONFIRM_PASSWORD_RESET === 'YES';
    const newPassword = process.env.FOUNDER_NEW_PASSWORD;

    if (shouldReset) {
      if (!newPassword) {
        throw new Error('CONFIRM_PASSWORD_RESET=YES requires FOUNDER_NEW_PASSWORD');
      }

      console.log('\n⚠️  Resetting password (not printing plaintext)...');
      const newHash = await bcrypt.hash(newPassword, 12);

      await prisma.users.update({
        where: { id: user.id },
        data: { password_hash: newHash, is_active: true }
      });
      console.log('✅ Password reset complete');
    } else {
      console.log('\nℹ️  No password reset performed. To reset, set CONFIRM_PASSWORD_RESET=YES and FOUNDER_NEW_PASSWORD.');
    }
    
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
