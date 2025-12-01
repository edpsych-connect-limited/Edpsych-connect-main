/**
 * CAROLINE MARRIOTT - PATHFINDER PILOT SEED SCRIPT
 * ================================================
 * Creates SUPER_ADMIN account for Head of Children's Services
 * Buckinghamshire Council - First Pathfinder Pilot
 * 
 * CRITICAL: This is the MONEY PERSON - she decides if all Buckinghamshire
 * schools subscribe. She MUST have access to EVERYTHING:
 * 
 * ✅ ALL Dashboards (Teacher, Student, Parent, EP, LA, Admin)
 * ✅ ALL Assessments & Interventions
 * ✅ ALL Marketplace features
 * ✅ ALL Training & CPD courses
 * ✅ ALL EHCP workflows
 * ✅ ALL Analytics & Reports
 * ✅ ALL User management
 * 
 * ONE CHANCE - MUST BE FLAWLESS
 * 
 * @created December 2025
 * @updated December 2025 - Upgraded to SUPER_ADMIN for complete access
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Secure temporary password
const CAROLINE_PASSWORD = 'Bucks2025!Pilot';

// COMPREHENSIVE PERMISSIONS - EVERYTHING
const ALL_PERMISSIONS = [
  // SUPER ADMIN - FULL PLATFORM ACCESS
  'SUPER_ADMIN',
  'ADMIN_FULL_ACCESS',
  'SYSTEM_ADMIN',
  
  // LA ADMINISTRATION
  'LA_FULL_ACCESS',
  'LA_ADMIN',
  'VIEW_ALL_CASES',
  'MANAGE_CASEWORKERS',
  'VIEW_COMPLIANCE_REPORTS',
  'VIEW_LA_ANALYTICS',
  'MANAGE_LA_SETTINGS',
  'VIEW_ALL_LAS',
  
  // EHCP MANAGEMENT
  'VIEW_EHCP_APPLICATIONS',
  'CREATE_EHCP_APPLICATIONS',
  'EDIT_EHCP_APPLICATIONS',
  'APPROVE_EHCP_DECISIONS',
  'VIEW_EHCP_DRAFTS',
  'MANAGE_PANEL_DECISIONS',
  'VIEW_EHCP_TIMELINE',
  'MANAGE_EHCP_WORKFLOW',
  
  // SCHOOL OVERSIGHT
  'VIEW_ALL_SCHOOLS',
  'MANAGE_SCHOOLS',
  'VIEW_SCHOOL_ANALYTICS',
  'VIEW_SCHOOL_REPORTS',
  'VIEW_INTERVENTION_DATA',
  
  // TEACHER FEATURES
  'TEACHER_DASHBOARD',
  'VIEW_STUDENTS',
  'MANAGE_STUDENTS',
  'MANAGE_LESSONS',
  'VIEW_CLASS_ANALYTICS',
  'ASSIGN_WORK',
  'VIEW_STUDENT_PROGRESS',
  'DIFFERENTIATE_LESSONS',
  
  // STUDENT FEATURES
  'STUDENT_DASHBOARD',
  'VIEW_ASSIGNMENTS',
  'SUBMIT_WORK',
  'VIEW_ACHIEVEMENTS',
  'PLAY_GAMES',
  'VIEW_PROGRESS',
  
  // PARENT FEATURES
  'PARENT_DASHBOARD',
  'VIEW_CHILD_PROGRESS',
  'VIEW_CHILD_REPORTS',
  'COMMUNICATE_WITH_SCHOOL',
  'VIEW_INTERVENTIONS',
  
  // EP FEATURES
  'EP_DASHBOARD',
  'VIEW_EP_CASES',
  'MANAGE_EP_CASES',
  'WRITE_EP_REPORTS',
  'VIEW_EP_ANALYTICS',
  'CONTRIBUTE_TO_EHCP',
  
  // ASSESSMENTS
  'VIEW_ASSESSMENTS',
  'CREATE_ASSESSMENTS',
  'EDIT_ASSESSMENTS',
  'DELETE_ASSESSMENTS',
  'ADMINISTER_ASSESSMENTS',
  'VIEW_ASSESSMENT_RESULTS',
  'EXPORT_ASSESSMENT_DATA',
  
  // INTERVENTIONS
  'VIEW_INTERVENTIONS',
  'CREATE_INTERVENTIONS',
  'EDIT_INTERVENTIONS',
  'ASSIGN_INTERVENTIONS',
  'TRACK_INTERVENTION_PROGRESS',
  'VIEW_INTERVENTION_ANALYTICS',
  
  // MARKETPLACE
  'VIEW_MARKETPLACE',
  'PURCHASE_RESOURCES',
  'SELL_RESOURCES',
  'MANAGE_MARKETPLACE_LISTINGS',
  'VIEW_MARKETPLACE_ANALYTICS',
  
  // TRAINING & CPD
  'VIEW_TRAINING',
  'ENROLL_COURSES',
  'COMPLETE_COURSES',
  'VIEW_CERTIFICATES',
  'MANAGE_TRAINING',
  'CREATE_COURSES',
  
  // HELP CENTER
  'VIEW_HELP_CENTER',
  'VIEW_DOCUMENTATION',
  'SUBMIT_TICKETS',
  'MANAGE_TICKETS',
  
  // ANALYTICS & REPORTS
  'VIEW_ANALYTICS',
  'VIEW_ALL_REPORTS',
  'EXPORT_REPORTS',
  'VIEW_RESEARCH_DATA',
  'VIEW_PLATFORM_METRICS',
  
  // USER MANAGEMENT
  'VIEW_USERS',
  'CREATE_USERS',
  'EDIT_USERS',
  'DELETE_USERS',
  'MANAGE_ROLES',
  'IMPERSONATE_USERS',
  
  // COLLABORATION
  'VIEW_COLLABORATION',
  'CREATE_MEETINGS',
  'JOIN_MEETINGS',
  'SHARE_DOCUMENTS',
  
  // SPECIAL ACCESS
  'PATHFINDER_PILOT',
  'FULL_PLATFORM_DEMO',
  'BETA_TESTER',
  'VIP_ACCESS',
];

async function main() {
  console.log('\n🏛️  Creating Caroline Marriott SUPER_ADMIN Account...\n');
  console.log('=' .repeat(70));
  console.log('⚠️  CRITICAL: This is the decision-maker account');
  console.log('   She needs access to EVERYTHING - flawlessly');
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
      console.log('\n📍 Creating Buckinghamshire Local Authority tenant...');
      bucksLA = await prisma.tenants.create({
        data: {
          name: 'Buckinghamshire Council - Children\'s Services',
          subdomain: 'buckinghamshire',
          tenant_type: 'LA',
          la_code: 'E06000060',
          postcode: 'HP20 1UA',
          contact_email: 'childrens.services@buckinghamshire.gov.uk',
          status: 'active', // Full active status
          settings: {
            pilot: true,
            pathfinder: true,
            pilot_start: new Date().toISOString(),
            pilot_contact: 'Dr Scott I-Patrick',
            confidential: true,
            full_access: true,
          }
        }
      });
      console.log('✅ Buckinghamshire LA tenant created');
    } else {
      // Update to ensure full access
      bucksLA = await prisma.tenants.update({
        where: { id: bucksLA.id },
        data: {
          status: 'active',
          settings: {
            pilot: true,
            pathfinder: true,
            full_access: true,
          }
        }
      });
      console.log(`✅ Updated existing tenant: ${bucksLA.name}`);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(CAROLINE_PASSWORD, 12);

    // Create/Update Caroline Marriott's SUPER_ADMIN account
    const caroline = await prisma.users.upsert({
      where: { email: 'caroline.marriott@edpsychconnect.com' },
      update: { 
        password_hash: hashedPassword,
        tenant_id: bucksLA.id,
        is_active: true,
        role: 'SUPER_ADMIN', // FULL ACCESS TO EVERYTHING
        permissions: ALL_PERMISSIONS,
        isEmailVerified: true,
        beta_tester: true,
        beta_code_used: 'PATHFINDER-BUCKS-2025',
        beta_joined_at: new Date(),
        onboarding_completed: true, // Skip onboarding - she's evaluating
        onboarding_step: 5,
      },
      create: {
        tenant_id: bucksLA.id,
        email: 'caroline.marriott@edpsychconnect.com',
        password_hash: hashedPassword,
        name: 'Caroline Marriott',
        firstName: 'Caroline',
        lastName: 'Marriott',
        role: 'SUPER_ADMIN', // FULL ACCESS TO EVERYTHING
        permissions: ALL_PERMISSIONS,
        isEmailVerified: true,
        is_active: true,
        beta_tester: true,
        beta_code_used: 'PATHFINDER-BUCKS-2025',
        beta_joined_at: new Date(),
        onboarding_completed: true,
        onboarding_step: 5,
      },
    });

    console.log('\n' + '=' .repeat(70));
    console.log('✅ CAROLINE MARRIOTT SUPER_ADMIN ACCOUNT READY');
    console.log('=' .repeat(70));
    console.log('\n📧 Login Credentials:');
    console.log('   Website:  https://edpsychconnect.com');
    console.log('   Email:    caroline.marriott@edpsychconnect.com');
    console.log('   Password: Bucks2025!Pilot');
    console.log('   Role:     SUPER_ADMIN (COMPLETE PLATFORM ACCESS)');
    console.log('   Tenant:   Buckinghamshire Council');
    console.log('\n📋 She can access:');
    console.log('   ✅ ALL Dashboards (Teacher, Student, Parent, EP, LA, Admin)');
    console.log('   ✅ ALL Assessments & Interventions');
    console.log('   ✅ ALL Marketplace features');
    console.log('   ✅ ALL Training & CPD courses');
    console.log('   ✅ ALL EHCP workflows');
    console.log('   ✅ ALL Analytics & Reports');
    console.log('   ✅ ALL User management');
    console.log('\n⚠️  CONFIDENTIAL - Do not share these credentials');
    console.log('=' .repeat(70));

    // Create sample demo data for Buckinghamshire
    console.log('\n📊 Creating sample demonstration data...');

    // Create sample schools under Buckinghamshire
    const sampleSchools = [
      { name: 'Aylesbury Grammar School', subdomain: 'aylesbury-grammar', postcode: 'HP21 7RP', urn: '110475' },
      { name: 'John Hampden Grammar School', subdomain: 'john-hampden', postcode: 'HP11 1SZ', urn: '110476' },
      { name: 'Holmer Green Senior School', subdomain: 'holmer-green', postcode: 'HP15 6TN', urn: '110477' },
      { name: 'Chesham Grammar School', subdomain: 'chesham-grammar', postcode: 'HP5 2HR', urn: '110478' },
      { name: 'Dr Challoner\'s Grammar School', subdomain: 'challoners', postcode: 'HP6 5HA', urn: '110479' },
    ];

    for (const school of sampleSchools) {
      await prisma.tenants.upsert({
        where: { subdomain: school.subdomain },
        update: {
          parent_tenant_id: bucksLA.id,
          status: 'active',
        },
        create: {
          name: school.name,
          subdomain: school.subdomain,
          tenant_type: 'SCHOOL',
          parent_tenant_id: bucksLA.id,
          la_code: 'E06000060',
          postcode: school.postcode,
          urn: school.urn,
          status: 'active',
          settings: {
            demo: true,
            pathfinder_pilot: true,
          }
        }
      });
    }
    console.log('✅ 5 Sample Buckinghamshire schools created/updated');

    // Create sample users for demonstration (each role)
    const demoUsers = [
      { email: 'teacher.demo@buckinghamshire.edpsych.com', name: 'Sarah Thompson', role: 'TEACHER', firstName: 'Sarah', lastName: 'Thompson' },
      { email: 'senco.demo@buckinghamshire.edpsych.com', name: 'James Wilson', role: 'SENCO', firstName: 'James', lastName: 'Wilson' },
      { email: 'parent.demo@buckinghamshire.edpsych.com', name: 'Emma Roberts', role: 'PARENT', firstName: 'Emma', lastName: 'Roberts' },
      { email: 'ep.demo@buckinghamshire.edpsych.com', name: 'Dr Michael Chen', role: 'EP', firstName: 'Michael', lastName: 'Chen' },
      { email: 'caseworker.demo@buckinghamshire.edpsych.com', name: 'Rachel Green', role: 'LA_CASEWORKER', firstName: 'Rachel', lastName: 'Green' },
    ];

    const demoPassword = await bcrypt.hash('Demo2025!', 10);
    
    for (const user of demoUsers) {
      await prisma.users.upsert({
        where: { email: user.email },
        update: {
          tenant_id: bucksLA.id,
          is_active: true,
        },
        create: {
          tenant_id: bucksLA.id,
          email: user.email,
          password_hash: demoPassword,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          permissions: [],
          isEmailVerified: true,
          is_active: true,
        }
      });
    }
    console.log('✅ Demo users created for each role');

    console.log('\n' + '=' .repeat(70));
    console.log('🎉 PATHFINDER PILOT SETUP COMPLETE!');
    console.log('=' .repeat(70));
    console.log('\n🔗 Caroline can now log in at: https://edpsychconnect.com/login');
    console.log('   She has COMPLETE access to explore ALL platform features.');
    console.log('\n💡 Demo accounts also created (password: Demo2025!):');
    demoUsers.forEach(u => console.log(`   - ${u.email} (${u.role})`));
    console.log('\n');

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
