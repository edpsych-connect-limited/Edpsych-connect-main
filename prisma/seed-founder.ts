/**
 * FOUNDER USER SEED SCRIPT
 * Creates Dr Scott's founder account with full admin access
 *
 * @copyright EdPsych Connect Limited 2025
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SEED_FOUNDER_PASSWORD = process.env.SEED_FOUNDER_PASSWORD;

if (!SEED_FOUNDER_PASSWORD) {
  throw new Error('SEED_FOUNDER_PASSWORD environment variable is required');
}

const REQUIRED_SEED_FOUNDER_PASSWORD: string = SEED_FOUNDER_PASSWORD;

async function main() {
  console.log('\n🔑 Creating Founder Account...\n');
  console.log('='.repeat(70));

  try {
    // Get or create the demo tenant
    let tenant = await prisma.tenants.findFirst({
      where: { subdomain: 'demo' }
    });

    if (!tenant) {
      tenant = await prisma.tenants.create({
        data: {
          name: 'EdPsych Connect Demo',
          subdomain: 'demo',
          tenant_type: 'SCHOOL',
          status: 'active',
          settings: {},
        }
      });
      console.log('✅ Created demo tenant');

      // Create subscription
      await prisma.subscriptions.create({
        data: {
          tenant_id: tenant.id,
          tier: 'ENTERPRISE_CUSTOM',
          start_date: new Date(),
          end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 100)), // Lifetime
          is_active: true,
          plan_type: 'founder_lifetime',
          payment_status: 'active',
          amount_paid: 0,
        }
      });
      console.log('✅ Created founder subscription');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(REQUIRED_SEED_FOUNDER_PASSWORD, 12);

    // Create founder account
    const founder = await prisma.users.upsert({
      where: { email: 'scott.ipatrick@edpsychconnect.com' },
      update: {
        password_hash: hashedPassword,
        tenant_id: tenant.id,
        is_active: true,
        role: 'SUPER_ADMIN',
        permissions: ['*'], // All permissions
        isEmailVerified: true,
        onboarding_completed: true,
      },
      create: {
        tenant_id: tenant.id,
        email: 'scott.ipatrick@edpsychconnect.com',
        password_hash: hashedPassword,
        name: 'Dr Scott Ighavongbe-Patrick',
        firstName: 'Scott',
        lastName: 'Ighavongbe-Patrick',
        role: 'SUPER_ADMIN',
        permissions: ['*'],
        isEmailVerified: true,
        is_active: true,
        onboarding_completed: true,
      },
    });
    
    console.log('✅ Founder account created/updated:');
    console.log('   Email: scott.ipatrick@edpsychconnect.com');
    console.log('   Password: (set via SEED_FOUNDER_PASSWORD)');
    console.log('   Role: SUPER_ADMIN');
    console.log('   User ID:', founder.id);

    // Also create a valid beta code for FOUNDER-ACCESS
    try {
      // Check if beta_codes table exists
      await prisma.$queryRaw`SELECT 1 FROM beta_codes LIMIT 1`;
      
      await prisma.$executeRaw`
        INSERT INTO beta_codes (code, max_uses, current_uses, is_active, role_restriction, created_at)
        VALUES ('FOUNDER-ACCESS', 1000, 0, true, 'SUPER_ADMIN', NOW())
        ON CONFLICT (code) DO UPDATE SET is_active = true, max_uses = 1000
      `;
      console.log('✅ Beta code FOUNDER-ACCESS activated');
    } catch (e) {
      console.log('⚠️  Beta codes table may not exist, skipping beta code creation');
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ Founder account ready!');
    console.log('\nLogin credentials:');
    console.log('  Email: scott.ipatrick@edpsychconnect.com');
    console.log('  Password: (set via SEED_FOUNDER_PASSWORD)');
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('❌ Error creating founder account:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
