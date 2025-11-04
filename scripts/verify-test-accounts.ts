import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  console.log('\n🔍 Verifying Test Accounts...\n');
  console.log('='.repeat(70));

  const testEmails = [
    'teacher@test.edpsych.com',
    'amara.singh@test.edpsych.com',
    'priya.singh@test.edpsych.com',
    'dr.patel@test.edpsych.com'
  ];

  for (const email of testEmails) {
    const user = await prisma.users.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        is_active: true,
        tenant_id: true
      }
    });

    if (user) {
      console.log(`✅ ${user.role} | ${user.email} | Active: ${user.is_active}`);
    } else {
      console.log(`❌ ${email} - NOT FOUND`);
    }
  }

  // Check parent-child link
  const parent = await prisma.users.findUnique({ where: { email: 'priya.singh@test.edpsych.com' } });
  const child = await prisma.students.findFirst({ where: { first_name: 'Amara', last_name: 'Singh', tenant_id: 2 } });

  if (parent && child) {
    const link = await prisma.parentChildLink.findFirst({
      where: { parent_id: parent.id, child_id: child.id }
    });

    console.log('\n📎 Parent-Child Link:');
    if (link) {
      console.log(`✅ ${parent.name} → ${child.first_name} ${child.last_name} (${link.relationship_type})`);
    } else {
      console.log(`❌ No link found between parent and child`);
    }
  }

  console.log('='.repeat(70));
  console.log('\n✅ Verification Complete\n');

  await prisma.$disconnect();
}

verify();
