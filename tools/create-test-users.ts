import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Test password for all users
const TEST_PASSWORD = 'Test123!';

async function main() {
  console.log('\n🧪 Creating/Updating Test Users...\n');

  // 1. Ensure Tenant Exists
  let tenant = await prisma.tenants.findFirst({
    where: { subdomain: 'demo' }
  });

  if (!tenant) {
    console.log('⚠️ Demo tenant not found. Creating it...');
    tenant = await prisma.tenants.create({
      data: {
        name: 'EdPsych Connect Demo School',
        subdomain: 'demo',
        tenant_type: 'SCHOOL',
        status: 'active',
        contact_email: 'admin@demo.com',
      }
    });
    console.log(`✅ Created tenant: ${tenant.name}`);
  } else {
    console.log(`✅ Using existing tenant: ${tenant.name}`);
  }

  // 2. Hash Password
  // IMPORTANT: Using same salt rounds as login verification expects (standard bcrypt)
  const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);

  // 3. Define Users
  const users = [
    // --- Existing Uppercase Roles (Legacy/Type Index) ---
    {
      email: 'admin@demo.com',
      role: 'SUPER_ADMIN',
      name: 'Demo Admin',
      firstName: 'Demo',
      lastName: 'Admin',
      permissions: ['ALL_ACCESS']
    },
    {
      email: 'teacher@demo.com',
      role: 'TEACHER',
      name: 'Demo Teacher',
      firstName: 'Demo',
      lastName: 'Teacher',
      permissions: ['VIEW_STUDENTS', 'MANAGE_LESSONS']
    },
    {
      email: 'student@demo.com',
      role: 'STUDENT',
      name: 'Demo Student',
      firstName: 'Demo',
      lastName: 'Student',
      permissions: ['VIEW_OWN_WORK']
    },
    {
      email: 'parent@demo.com',
      role: 'PARENT',
      name: 'Demo Parent',
      firstName: 'Demo',
      lastName: 'Parent',
      permissions: ['VIEW_OWN_CHILD']
    },
    {
      email: 'ep@demo.com',
      role: 'EP',
      name: 'Demo EP',
      firstName: 'Demo',
      lastName: 'EP',
      permissions: ['VIEW_ALL_STUDENTS', 'MANAGE_ASSESSMENTS']
    },

    // --- Tenant Service Roles (Lowercase) ---
    {
      email: 'super_admin@demo.com',
      role: 'super_admin',
      name: 'Super Admin User',
      firstName: 'Super',
      lastName: 'Admin',
      permissions: ['*']
    },
    {
      email: 'school_admin@demo.com',
      role: 'school_admin',
      name: 'School Admin User',
      firstName: 'School',
      lastName: 'Admin',
      permissions: ['manage_school']
    },
    {
      email: 'headteacher@demo.com',
      role: 'headteacher',
      name: 'Headteacher User',
      firstName: 'Head',
      lastName: 'Teacher',
      permissions: ['manage_school', 'view_all']
    },
    {
      email: 'deputy_head@demo.com',
      role: 'deputy_head',
      name: 'Deputy Head User',
      firstName: 'Deputy',
      lastName: 'Head',
      permissions: ['manage_school', 'view_all']
    },
    {
      email: 'subject_lead@demo.com',
      role: 'subject_lead',
      name: 'Subject Lead User',
      firstName: 'Subject',
      lastName: 'Lead',
      permissions: ['manage_subject']
    },
    {
      email: 'class_teacher@demo.com',
      role: 'class_teacher',
      name: 'Class Teacher User',
      firstName: 'Class',
      lastName: 'Teacher',
      permissions: ['manage_class']
    },
    {
      email: 'teaching_assistant@demo.com',
      role: 'teaching_assistant',
      name: 'Teaching Assistant User',
      firstName: 'Teaching',
      lastName: 'Assistant',
      permissions: ['support_class']
    },
    {
      email: 'sen_coordinator@demo.com',
      role: 'sen_coordinator',
      name: 'SEN Coordinator User',
      firstName: 'SEN',
      lastName: 'Coordinator',
      permissions: ['manage_sen']
    },
    {
      email: 'researcher@demo.com',
      role: 'researcher',
      name: 'Researcher User',
      firstName: 'Research',
      lastName: 'User',
      permissions: ['view_data']
    },
    
    // --- Auth Types Roles (Lowercase - if different) ---
    {
      email: 'edpsych@demo.com',
      role: 'edpsych',
      name: 'EdPsych User',
      firstName: 'Ed',
      lastName: 'Psych',
      permissions: ['assess_students']
    },
    {
      email: 'beta_tester@demo.com',
      role: 'beta_tester',
      name: 'Beta Tester User',
      firstName: 'Beta',
      lastName: 'Tester',
      permissions: ['test_features']
    }
  ];

  // 4. Create/Update Users
  for (const u of users) {
    const _user = await prisma.users.upsert({
      where: { email: u.email },
      update: {
        password_hash: hashedPassword, // Reset password to known value
        is_active: true,
        role: u.role, // Ensure role is correct
        permissions: u.permissions
      },
      create: {
        tenant_id: tenant.id,
        email: u.email,
        password_hash: hashedPassword,
        name: u.name,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        permissions: u.permissions,
        is_active: true,
        isEmailVerified: true
      }
    });
    console.log(`✅ User ready: ${u.email} (${u.role})`);
  }

  console.log('\n🎉 All test users updated with password: ' + TEST_PASSWORD);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
