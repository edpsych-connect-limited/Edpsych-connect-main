/**
 * TEST USER SEED SCRIPT
 * Creates test accounts for manual E2E testing
 *
 * ROLES CREATED:
 * - Teacher (Sarah Mitchell)
 * - Student (Amara Smith)
 * - Parent (Lisa Smith - parent of Amara)
 * - Educational Psychologist (Dr. Priya Patel)
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Test password (same for all test accounts for convenience)
const TEST_PASSWORD = 'Test123!';

async function main() {
  console.log('\n🧪 Creating Test Users for E2E Testing...\n');
  console.log('=' .repeat(70));

  try {
    // Get the test-school tenant (where orchestration data was seeded)
    const tenant = await prisma.tenants.findFirst({
      where: { subdomain: 'test-school' }
    });

    if (!tenant) {
      console.error('❌ No tenant found. Please run: npx tsx prisma/seed-admin.ts first');
      process.exit(1);
    }

    console.log(`✅ Using tenant: ${tenant.name} (ID: ${tenant.id})\n`);

    // Hash password once for all users
    const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);

    // ========================================================================
    // 1. CREATE TEACHER ACCOUNT
    // ========================================================================
    console.log('👩‍🏫 Creating Teacher Account...');

    const teacher = await prisma.users.upsert({
      where: { email: 'teacher@test.edpsych.com' },
      update: {},
      create: {
        tenant_id: tenant.id,
        email: 'teacher@test.edpsych.com',
        password_hash: hashedPassword,
        name: 'Sarah Mitchell',
        firstName: 'Sarah',
        lastName: 'Mitchell',
        role: 'TEACHER',
        permissions: [
          'VIEW_STUDENTS',
          'MANAGE_LESSONS',
          'VIEW_REPORTS',
          'ASSIGN_WORK'
        ],
        isEmailVerified: true,
        is_active: true,
      },
    });

    // Get Year 3 Oak class (ID should be from seed-orchestration.ts)
    const year3Class = await prisma.classRoster.findFirst({
      where: {
        tenant_id: tenant.id,
        class_name: 'Year 3 Oak'
      }
    });

    if (year3Class) {
      // Update class to have Sarah as teacher
      await prisma.classRoster.update({
        where: { id: year3Class.id },
        data: { teacher_id: teacher.id }
      });
      console.log(`✅ Teacher created: ${teacher.email}`);
      console.log(`   Assigned to: ${year3Class.class_name}`);
    } else {
      console.log(`✅ Teacher created: ${teacher.email}`);
      console.log(`   ⚠️  No class roster found - run orchestration seed first`);
    }

    // ========================================================================
    // 2. CREATE STUDENT ACCOUNT
    // ========================================================================
    console.log('\n👨‍🎓 Creating Student Account...');

    // Get Amara Singh from students table (Year 3 student from orchestration seed)
    let student = await prisma.students.findFirst({
      where: {
        tenant_id: tenant.id,
        first_name: 'Amara',
        last_name: 'Singh',
        year_group: 'Year 3'
      }
    });

    if (!student) {
      console.log(`   ⚠️  Amara Smith not found in students table`);
      console.log(`   💡 Run orchestration seed first: npx tsx prisma/seed-orchestration.ts`);
      throw new Error('Student not found - run orchestration seed first');
    }

    const studentUser = await prisma.users.upsert({
      where: { email: 'amara.singh@test.edpsych.com' },
      update: {},
      create: {
        tenant_id: tenant.id,
        email: 'amara.singh@test.edpsych.com',
        password_hash: hashedPassword,
        name: 'Amara Singh',
        firstName: 'Amara',
        lastName: 'Singh',
        role: 'STUDENT',
        permissions: [
          'VIEW_OWN_WORK',
          'SUBMIT_WORK',
          'VIEW_OWN_PROGRESS'
        ],
        isEmailVerified: true,
        is_active: true,
      },
    });

    console.log(`✅ Student created: ${studentUser.email}`);
    console.log(`   Student record ID: ${student.id}`);

    // ========================================================================
    // 3. CREATE PARENT ACCOUNT
    // ========================================================================
    console.log('\n👨‍👩‍👧 Creating Parent Account...');

    const parent = await prisma.users.upsert({
      where: { email: 'priya.singh@test.edpsych.com' },
      update: {},
      create: {
        tenant_id: tenant.id,
        email: 'priya.singh@test.edpsych.com',
        password_hash: hashedPassword,
        name: 'Priya Singh',
        firstName: 'Priya',
        lastName: 'Singh',
        role: 'PARENT',
        permissions: [
          'VIEW_OWN_CHILD',
          'MESSAGE_TEACHER',
          'VIEW_CHILD_PROGRESS'
        ],
        isEmailVerified: true,
        is_active: true,
      },
    });

    // Create parent-child link
    const parentLink = await prisma.parentChildLink.upsert({
      where: {
        parent_id_child_id: {
          parent_id: parent.id,
          child_id: student.id
        }
      },
      update: {},
      create: {
        tenant_id: tenant.id,
        parent_id: parent.id,
        child_id: student.id,
        relationship_type: 'Mother',
        is_primary_contact: true,
        verified_at: new Date(),
        can_view_progress: true,
        can_view_behavior: true,
        can_message_teacher: true,
        can_view_attendance: true,
      }
    });

    console.log(`✅ Parent created: ${parent.email}`);
    console.log(`   Linked to child: ${student.first_name} ${student.last_name}`);
    console.log(`   Relationship: ${parentLink.relationship_type}`);

    // ========================================================================
    // 4. CREATE EDUCATIONAL PSYCHOLOGIST ACCOUNT
    // ========================================================================
    console.log('\n🧠 Creating Educational Psychologist Account...');

    const ep = await prisma.users.upsert({
      where: { email: 'dr.patel@test.edpsych.com' },
      update: {},
      create: {
        tenant_id: tenant.id,
        email: 'dr.patel@test.edpsych.com',
        password_hash: hashedPassword,
        name: 'Dr. Priya Patel',
        firstName: 'Priya',
        lastName: 'Patel',
        role: 'EP',
        permissions: [
          'VIEW_ALL_STUDENTS',
          'MANAGE_ASSESSMENTS',
          'VIEW_EHCP',
          'MANAGE_INTERVENTIONS',
          'VIEW_ANALYTICS'
        ],
        isEmailVerified: true,
        is_active: true,
      },
    });

    // Create professional profile
    const epProfile = await prisma.professionals.upsert({
      where: { user_id: ep.id },
      update: {},
      create: {
        user_id: ep.id,
        tenant_id: tenant.id,
        professional_type: 'Educational Psychologist',
        specialisation: 'SEND Assessment & Support',
        qualifications: [
          'DEdPsych',
          'CPsychol',
          'HCPC Registered'
        ],
        student_ids: [student.id], // Add Amara to caseload
      },
    });

    // Create multi-agency access record
    await prisma.multiAgencyAccess.upsert({
      where: {
        tenant_id_user_id: {
          tenant_id: tenant.id,
          user_id: ep.id
        }
      },
      update: {},
      create: {
        tenant_id: tenant.id,
        user_id: ep.id,
        role_type: 'educational_psychologist',
        accessible_student_ids: [student.id],
        owned_student_ids: [student.id],
        can_view_ehcp: true,
        can_view_assessments: true,
        can_view_medical: true,
        can_trigger_interventions: true,
        can_request_ep: true,
      }
    });

    console.log(`✅ EP created: ${ep.email}`);
    console.log(`   Professional type: Educational Psychologist`);
    console.log(`   Caseload: 1 student (${student.first_name} ${student.last_name})`);

    // ========================================================================
    // SUMMARY
    // ========================================================================
    console.log('\n' + '='.repeat(70));
    console.log('🎉 TEST USER CREATION COMPLETE!');
    console.log('='.repeat(70));
    console.log('\n📋 TEST ACCOUNT CREDENTIALS:');
    console.log('='.repeat(70));

    console.log('\n👩‍🏫 TEACHER ACCOUNT:');
    console.log(`   Email:    ${teacher.email}`);
    console.log(`   Password: ${TEST_PASSWORD}`);
    console.log(`   Role:     Teacher`);
    if (year3Class) {
      console.log(`   Class:    ${year3Class.class_name}`);
    }

    console.log('\n👨‍🎓 STUDENT ACCOUNT:');
    console.log(`   Email:    ${studentUser.email}`);
    console.log(`   Password: ${TEST_PASSWORD}`);
    console.log(`   Role:     Student`);
    console.log(`   Name:     ${student.first_name} ${student.last_name}`);

    console.log('\n👨‍👩‍👧 PARENT ACCOUNT:');
    console.log(`   Email:    ${parent.email}`);
    console.log(`   Password: ${TEST_PASSWORD}`);
    console.log(`   Role:     Parent`);
    console.log(`   Child:    ${student.first_name} ${student.last_name}`);

    console.log('\n🧠 EDUCATIONAL PSYCHOLOGIST ACCOUNT:');
    console.log(`   Email:    ${ep.email}`);
    console.log(`   Password: ${TEST_PASSWORD}`);
    console.log(`   Role:     Educational Psychologist`);
    console.log(`   Caseload: ${student.first_name} ${student.last_name}`);

    console.log('\n' + '='.repeat(70));
    console.log('🔗 TEST URL: http://localhost:3002/login');
    console.log('='.repeat(70));

    console.log('\n✅ Ready for E2E Testing!');
    console.log('   Follow the testing guide in: docs/E2E-TESTING-GUIDE.md\n');

  } catch (error) {
    console.error('\n❌ Error creating test users:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('✅ Database connection closed\n');
  })
  .catch(async (e) => {
    console.error('❌ Fatal error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
