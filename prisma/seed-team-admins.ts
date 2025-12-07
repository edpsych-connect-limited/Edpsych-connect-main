/**
 * TEAM ADMINS SEED SCRIPT
 * Creates Super Admin accounts for the core team
 *
 * @copyright EdPsych Connect Limited 2025
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const TEAM_MEMBERS = [
  { name: 'Dr Piers Worth', email: 'piers.worth@edpsychconnect.com' },
  { name: 'Hayley Baverstock', email: 'hayley.baverstock@edpsychconnect.com' },
  { name: 'Hannah Patrick', email: 'hannah.patrick@edpsychconnect.com' },
  { name: 'Louis Young', email: 'louis.young@edpsychconnect.com' },
  { name: 'George Randall', email: 'george.randall@edpsychconnect.com' },
  { name: 'Cora Sargent', email: 'cora.sargent@edpsychconnect.com' },
  { name: 'Bevan Givens', email: 'bevan.givens@edpsychconnect.com' },
  { name: 'Sue Podolska', email: 'sue.podolska@edpsychconnect.com' },
];

async function main() {
  console.log('\n🔑 Creating Team Admin Accounts...\n');
  console.log('='.repeat(70));

  try {
    // Get the demo tenant (or create if missing, though founder seed should have created it)
    let tenant = await prisma.tenants.findFirst({
      where: { subdomain: 'demo' }
    });

    if (!tenant) {
      console.log('⚠️ Demo tenant not found. Creating one...');
      tenant = await prisma.tenants.create({
        data: {
          name: 'EdPsych Connect Demo',
          subdomain: 'demo',
          tenant_type: 'SCHOOL',
          status: 'active',
          settings: {},
        }
      });
    }

    // Hash password
    const defaultPassword = 'Team2025!';
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);

    for (const member of TEAM_MEMBERS) {
      const [firstName, ...lastNameParts] = member.name.split(' ');
      const lastName = lastNameParts.join(' ');

      const user = await prisma.users.upsert({
        where: { email: member.email },
        update: {
          password_hash: hashedPassword,
          tenant_id: tenant.id,
          is_active: true,
          role: 'SUPER_ADMIN',
          permissions: ['*'],
          isEmailVerified: true,
          onboarding_completed: true,
        },
        create: {
          tenant_id: tenant.id,
          email: member.email,
          password_hash: hashedPassword,
          name: member.name,
          firstName: firstName,
          lastName: lastName,
          role: 'SUPER_ADMIN',
          permissions: ['*'],
          isEmailVerified: true,
          is_active: true,
          onboarding_completed: true,
        },
      });

      console.log(`✅ Created/Updated: ${member.name} (${member.email})`);
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ All team accounts ready!');
    console.log(`   Default Password: ${defaultPassword}`);
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('❌ Error creating team accounts:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
