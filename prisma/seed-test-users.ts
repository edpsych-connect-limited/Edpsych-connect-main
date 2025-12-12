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

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_rSnga68XPqve@ep-delicate-grass-abi62lhk-pooler.eu-west-2.aws.neon.tech/neondb?connect_timeout=15&sslmode=require',
    },
  },
});

// Test password (same for all test accounts for convenience)
const TEST_PASSWORD = 'Test123!';

async function main() {
  console.log('\n🧪 Creating Test Users for E2E Testing...\n');
  console.log('=' .repeat(70));

  try {
    // Get the test-school tenant (where orchestration data was seeded)
    const tenant = await prisma.tenants.findFirst({
      where: { subdomain: 'demo' }
    });

    if (!tenant) {
      console.error('❌ No tenant found. Please run: npx tsx prisma/seed-admin.ts first');
      process.exit(1);
    }

    console.log(`✅ Using tenant: ${tenant.name} (ID: ${tenant.id})\n`);

    // Hash password once for all users
    const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);
    const demoPassword = await bcrypt.hash('Test123!', 10);

    // ========================================================================
    // 0. CREATE DEMO USERS (Requested by User)
    // ========================================================================
    console.log('🧪 Creating Requested Demo Users...');

    // Demo Teacher
    const demoTeacher = await prisma.users.upsert({
      where: { email: 'teacher@demo.com' },
      update: { 
        password_hash: demoPassword,
        tenant_id: tenant.id,
        is_active: true
      },
      create: {
        tenant_id: tenant.id,
        email: 'teacher@demo.com',
        password_hash: demoPassword,
        name: 'Demo Teacher',
        firstName: 'Demo',
        lastName: 'Teacher',
        role: 'TEACHER',
        permissions: ['VIEW_STUDENTS', 'MANAGE_LESSONS', 'VIEW_REPORTS', 'ASSIGN_WORK'],
        isEmailVerified: true,
        is_active: true,
      },
    });
    console.log('✅ Demo Teacher created: teacher@demo.com / Test123!');

    // Create Demo Class for Demo Teacher
    const existingDemoClass = await prisma.classRoster.findFirst({
      where: {
        tenant_id: tenant.id,
        class_name: 'Demo Class 1A'
      }
    });

    let demoClass;
    if (existingDemoClass) {
      demoClass = await prisma.classRoster.update({
        where: { id: existingDemoClass.id },
        data: { teacher_id: demoTeacher.id }
      });
      console.log('✅ Demo Class updated and assigned to Demo Teacher');
    } else {
      demoClass = await prisma.classRoster.create({
        data: {
          tenant_id: tenant.id,
          teacher_id: demoTeacher.id,
          class_name: 'Demo Class 1A',
          year_group: 'Year 1',
          subject: 'General',
          academic_year: '2024-2025',
          urgent_students: [],
          needs_support: [],
          on_track: [],
          exceeding: [],
          voice_enabled: true
        }
      });
      console.log('✅ Demo Class created and assigned to Demo Teacher');
    }

    // Demo Parent
    await prisma.users.upsert({
      where: { email: 'parent@demo.com' },
      update: { 
        password_hash: demoPassword,
        tenant_id: tenant.id,
        is_active: true,
        onboarding_completed: true
      },
      create: {
        tenant_id: tenant.id,
        email: 'parent@demo.com',
        password_hash: demoPassword,
        name: 'Demo Parent',
        firstName: 'Demo',
        lastName: 'Parent',
        role: 'PARENT',
        permissions: ['VIEW_OWN_CHILD', 'MESSAGE_TEACHER', 'VIEW_CHILD_PROGRESS'],
        isEmailVerified: true,
        is_active: true,
        onboarding_completed: true,
      },
    });
    console.log('✅ Demo Parent created: parent@demo.com / Test123!');

    // Demo Student
    await prisma.users.upsert({
      where: { email: 'student@demo.com' },
      update: { 
        password_hash: demoPassword,
        tenant_id: tenant.id,
        is_active: true
      },
      create: {
        tenant_id: tenant.id,
        email: 'student@demo.com',
        password_hash: demoPassword,
        name: 'Demo Student',
        firstName: 'Demo',
        lastName: 'Student',
        role: 'STUDENT',
        permissions: ['VIEW_OWN_WORK', 'SUBMIT_WORK', 'VIEW_OWN_PROGRESS'],
        isEmailVerified: true,
        is_active: true,
      },
    });
    console.log('✅ Demo Student created: student@demo.com / Test123!');

    // Demo EP
    await prisma.users.upsert({
      where: { email: 'ep@demo.com' },
      update: { 
        password_hash: demoPassword,
        tenant_id: tenant.id,
        is_active: true
      },
      create: {
        tenant_id: tenant.id,
        email: 'ep@demo.com',
        password_hash: demoPassword,
        name: 'Demo EP',
        firstName: 'Demo',
        lastName: 'EP',
        role: 'EP',
        permissions: ['VIEW_ALL_STUDENTS', 'MANAGE_ASSESSMENTS', 'VIEW_EHCP'],
        isEmailVerified: true,
        is_active: true,
      },
    });
    console.log('✅ Demo EP created: ep@demo.com / Test123!');

    // Demo Admin
    await prisma.users.upsert({
      where: { email: 'admin@demo.com' },
      update: { 
        password_hash: demoPassword,
        tenant_id: tenant.id,
        is_active: true
      },
      create: {
        tenant_id: tenant.id,
        email: 'admin@demo.com',
        password_hash: demoPassword,
        name: 'Demo Admin',
        firstName: 'Demo',
        lastName: 'Admin',
        role: 'ADMIN',
        permissions: ['ALL_ACCESS'],
        isEmailVerified: true,
        is_active: true,
      },
    });
    console.log('✅ Demo Admin created: admin@demo.com / Test123!');

    // Demo Researcher
    await prisma.users.upsert({
      where: { email: 'researcher@demo.com' },
      update: { 
        password_hash: demoPassword,
        tenant_id: tenant.id,
        is_active: true
      },
      create: {
        tenant_id: tenant.id,
        email: 'researcher@demo.com',
        password_hash: demoPassword,
        name: 'Demo Researcher',
        firstName: 'Demo',
        lastName: 'Researcher',
        role: 'RESEARCHER',
        permissions: ['VIEW_ANALYTICS', 'MANAGE_STUDIES', 'VIEW_DATASETS', 'ETHICS_SUBMISSION'],
        isEmailVerified: true,
        is_active: true,
      },
    });
    console.log('✅ Demo Researcher created: researcher@demo.com / Test123!');

    // ========================================================================
    // 0.1 LINK DEMO PARENT TO DEMO STUDENT
    // ========================================================================
    console.log('🔗 Linking Demo Parent to Demo Student...');

    // 1. Ensure "Demo Student" exists in `students` table (Academic Record)
    const demoStudentRecord = await prisma.students.upsert({
      where: {
        tenant_id_unique_id: {
          tenant_id: tenant.id,
          unique_id: 'DEMO-STUDENT-001'
        }
      },
      update: {},
      create: {
        tenant_id: tenant.id,
        unique_id: 'DEMO-STUDENT-001',
        first_name: 'Demo',
        last_name: 'Student',
        date_of_birth: new Date('2015-01-01'),
        year_group: 'Year 4',
        sen_status: 'SEN Support'
      }
    });

    // 2. Get the Demo Parent User ID
    const demoParentUser = await prisma.users.findUnique({ 
      where: { email: 'parent@demo.com' } 
    });

    if (demoParentUser) {
      // 3. Create the link
      await prisma.parentChildLink.upsert({
        where: {
          parent_id_child_id: {
            parent_id: demoParentUser.id,
            child_id: demoStudentRecord.id
          }
        },
        update: {},
        create: {
          tenant_id: tenant.id,
          parent_id: demoParentUser.id,
          child_id: demoStudentRecord.id,
          relationship_type: 'Parent',
          is_primary_contact: true,
          can_view_progress: true,
          can_view_behavior: true,
          can_message_teacher: true,
          can_view_attendance: true,
          verified_at: new Date()
        }
      });
      console.log('✅ Linked Demo Parent (parent@demo.com) to Demo Student (Academic Record)');
    }

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
      console.log(`   ⚠️  Amara Singh not found in students table - Creating her now...`);
      student = await prisma.students.create({
        data: {
          tenant_id: tenant.id,
          unique_id: 'STU-AMARA-001',
          first_name: 'Amara',
          last_name: 'Singh',
          date_of_birth: new Date('2017-05-15'), // Year 3 age approx
          year_group: 'Year 3',
          sen_status: 'SEN Support'
        }
      });
      
      // Create profile for her
      await prisma.studentProfile.create({
        data: {
          tenant_id: tenant.id,
          student_id: student.id,
          learning_style: { visual: 0.8, auditory: 0.2, confidence: 0.9 },
          pace_level: 'medium',
          difficulty_preference: 'on_level',
          current_strengths: ['creativity', 'collaboration'],
          current_struggles: ['mathematics'],
          engagement_score: 0.85,
          persistence_score: 0.7,
          collaboration_score: 0.9,
          ready_to_level_up: true,
          needs_intervention: false,
          profile_confidence: 0.9,
          last_synced_at: new Date()
        }
      });
      console.log(`   ✅ Created student record for Amara Singh`);
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
