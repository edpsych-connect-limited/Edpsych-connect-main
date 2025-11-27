import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgres://neondb_owner:npg_zkQMGCh0ZO8L@ep-steep-boat-abz9lg8e-pooler.eu-west-2.aws.neon.tech/neondb?connect_timeout=15&sslmode=require'
    }
  }
});

async function main() {
  console.log('Checking founder account...\n');
  
  const user = await prisma.user.findUnique({
    where: { email: 'scott.ipatrick@edpsychconnect.com' }
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
  console.log('   Status:', user.status);
  console.log('   Password hash exists:', !!user.password);
  console.log('   Hash length:', user.password?.length || 0);
  console.log('   Hash preview:', user.password?.substring(0, 20) + '...');
  
  // Test password verification
  const testPassword = 'Founder2025!';
  const isValid = await bcrypt.compare(testPassword, user.password || '');
  console.log('\n   Password "Founder2025!" valid:', isValid);
  
  if (!isValid) {
    console.log('\n⚠️ Password mismatch - resetting password...');
    const newHash = await bcrypt.hash('Founder2025!', 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: newHash }
    });
    console.log('✅ Password reset to "Founder2025!"');
    
    const updatedUser = await prisma.user.findUnique({
      where: { email: 'scott.ipatrick@edpsychconnect.com' }
    });
    const verifyReset = await bcrypt.compare('Founder2025!', updatedUser?.password || '');
    console.log('   Verification after reset:', verifyReset);
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);
