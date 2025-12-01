/**
 * CAROLINE MARRIOTT - PATHFINDER PILOT SEED SCRIPT
 * Creates exclusive LA_ADMIN account for Head of Children's Services
 * Buckinghamshire Council - First Pathfinder Pilot
 * 
 * CONFIDENTIAL: This account provides full platform access for evaluation
 * Account should be deleted after pilot evaluation period
 * 
 * @created December 2025
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Secure temporary password - will be sent separately
const CAROLINE_PASSWORD = 'Bucks2025!Pilot';

async function main() {
  console.log('\n🏛️  Creating Caroline Marriott Pathfinder Pilot Account...\n');
  console.log('=' .repeat(70));

  try {
    // Create or get Buckinghamshire LA tenant
    let bucksLA = await prisma.tenants.findFirst({
      where: { 
        OR: [
          { subdomain: 'buckinghamshire' },
          { name: { contains: 'Buckinghamshire' } }
        ]
      }
    });

    if (!bucksLA) {
      console.log('📍 Creating Buckinghamshire Local Authority tenant...');
      bucksLA = await prisma.tenants.create({
        data: {
          name: 'Buckinghamshire Council - Children\'s Services',
          subdomain: 'buckinghamshire',
          tenant_type: 'LA',
          la_code: 'E06000060', // Buckinghamshire LA code
          postcode: 'HP20 1UA', // County Hall
          contact_email: 'childrens.services@buckinghamshire.gov.uk',
          status: 'trial',
          settings: {
            pilot: true,
            pathfinder: true,
            pilot_start: new Date().toISOString(),
            pilot_contact: 'Dr Scott I-Patrick',
            confidential: true,
          }
        }
      });
      console.log('✅ Buckinghamshire LA tenant created');
    } else {
      console.log(`✅ Using existing tenant: ${bucksLA.name}`);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(CAROLINE_PASSWORD, 12);

    // Create Caroline Marriott's account
    const caroline = await prisma.users.upsert({
      where: { email: 'caroline.marriott@edpsychconnect.com' },
      update: { 
        password_hash: hashedPassword,
        tenant_id: bucksLA.id,
        is_active: true,
        role: 'LA_ADMIN',
        permissions: [
          // Full LA Administration
          'LA_FULL_ACCESS',
          'VIEW_ALL_CASES',
          'MANAGE_CASEWORKERS',
          'VIEW_COMPLIANCE_REPORTS',
          'VIEW_ANALYTICS',
          'MANAGE_LA_SETTINGS',
          
          // EHCP Management
          'VIEW_EHCP_APPLICATIONS',
          'APPROVE_EHCP_DECISIONS',
          'VIEW_EHCP_DRAFTS',
          'MANAGE_PANEL_DECISIONS',
          
          // School Oversight
          'VIEW_ALL_SCHOOLS',
          'VIEW_SCHOOL_ANALYTICS',
          'VIEW_INTERVENTION_DATA',
          
          // Platform Features
          'VIEW_MARKETPLACE',
          'VIEW_TRAINING',
          'VIEW_HELP_CENTER',
          'VIEW_RESEARCH_DATA',
          
          // Pilot-specific
          'PATHFINDER_PILOT',
          'FULL_PLATFORM_DEMO',
        ],
        isEmailVerified: true,
        beta_tester: true,
        beta_code_used: 'PATHFINDER-BUCKS-2025',
        beta_joined_at: new Date(),
      },
      create: {
        tenant_id: bucksLA.id,
        email: 'caroline.marriott@edpsychconnect.com',
        password_hash: hashedPassword,
        name: 'Caroline Marriott',
        firstName: 'Caroline',
        lastName: 'Marriott',
        role: 'LA_ADMIN',
        permissions: [
          // Full LA Administration
          'LA_FULL_ACCESS',
          'VIEW_ALL_CASES',
          'MANAGE_CASEWORKERS',
          'VIEW_COMPLIANCE_REPORTS',
          'VIEW_ANALYTICS',
          'MANAGE_LA_SETTINGS',
          
          // EHCP Management
          'VIEW_EHCP_APPLICATIONS',
          'APPROVE_EHCP_DECISIONS',
          'VIEW_EHCP_DRAFTS',
          'MANAGE_PANEL_DECISIONS',
          
          // School Oversight
          'VIEW_ALL_SCHOOLS',
          'VIEW_SCHOOL_ANALYTICS',
          'VIEW_INTERVENTION_DATA',
          
          // Platform Features
          'VIEW_MARKETPLACE',
          'VIEW_TRAINING',
          'VIEW_HELP_CENTER',
          'VIEW_RESEARCH_DATA',
          
          // Pilot-specific
          'PATHFINDER_PILOT',
          'FULL_PLATFORM_DEMO',
        ],
        isEmailVerified: true,
        is_active: true,
        beta_tester: true,
        beta_code_used: 'PATHFINDER-BUCKS-2025',
        beta_joined_at: new Date(),
      },
    });

    console.log('\n' + '=' .repeat(70));
    console.log('✅ CAROLINE MARRIOTT ACCOUNT CREATED SUCCESSFULLY');
    console.log('=' .repeat(70));
    console.log('\n📧 Login Credentials:');
    console.log('   Email:    caroline.marriott@edpsychconnect.com');
    console.log('   Password: Bucks2025!Pilot');
    console.log('   Role:     LA_ADMIN (Full Platform Access)');
    console.log('   Tenant:   Buckinghamshire Council');
    console.log('\n⚠️  CONFIDENTIAL - Do not share these credentials');
    console.log('=' .repeat(70));

    // Create sample demo data for Buckinghamshire
    console.log('\n📊 Creating sample demonstration data...');

    // Create a few sample schools under Buckinghamshire
    const sampleSchools = [
      { name: 'Aylesbury Grammar School', subdomain: 'aylesbury-grammar', postcode: 'HP21 7RP' },
      { name: 'John Hampden Grammar School', subdomain: 'john-hampden', postcode: 'HP11 1SZ' },
      { name: 'Holmer Green Senior School', subdomain: 'holmer-green', postcode: 'HP15 6TN' },
    ];

    for (const school of sampleSchools) {
      await prisma.tenants.upsert({
        where: { subdomain: school.subdomain },
        update: {},
        create: {
          name: school.name,
          subdomain: school.subdomain,
          tenant_type: 'SCHOOL',
          parent_tenant_id: bucksLA.id,
          la_code: 'E06000060',
          postcode: school.postcode,
          status: 'active',
          settings: {
            demo: true,
            pathfinder_pilot: true,
          }
        }
      });
    }
    console.log('✅ Sample Buckinghamshire schools created');

    console.log('\n🎉 Pathfinder Pilot setup complete!');
    console.log('\nCaroline can now log in at: https://edpsychconnect.com/login');
    console.log('She will have full access to explore all platform features.\n');

  } catch (error) {
    console.error('\n❌ Error creating account:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
