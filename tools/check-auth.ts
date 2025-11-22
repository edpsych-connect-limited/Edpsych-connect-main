
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkUser(email: string, passwordToCheck: string) {
  console.log(`Checking user: ${email}`);
  
  const user = await prisma.users.findUnique({
    where: { email: email.toLowerCase() },
    include: { tenants: true }
  });

  if (!user) {
    console.log('❌ User NOT FOUND in database.');
    return;
  }

  console.log('✅ User FOUND:');
  console.log(`   ID: ${user.id}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Role: ${user.role}`);
  console.log(`   Active: ${user.is_active}`);
  console.log(`   Tenant ID: ${user.tenant_id}`);
  console.log(`   Tenant Name: ${user.tenants?.name}`);
  console.log(`   Password Hash: ${user.password_hash.substring(0, 20)}...`);

  const isMatch = await bcrypt.compare(passwordToCheck, user.password_hash);
  console.log(`\n🔐 Password Check ('${passwordToCheck}'): ${isMatch ? '✅ MATCH' : '❌ MISMATCH'}`);

  if (!isMatch) {
    console.log('   Attempting to re-hash and update...');
    const newHash = await bcrypt.hash(passwordToCheck, 10);
    await prisma.users.update({
        where: { id: user.id },
        data: { password_hash: newHash }
    });
    console.log('   ✅ Password updated to match provided password.');
  }
}

async function main() {
    await checkUser('teacher@demo.com', 'Test123!');
    await checkUser('parent@demo.com', 'Test123!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
