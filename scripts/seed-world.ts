
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting World Seeding...');

  // 1. Create or Update Demo Tenant
  const demoTenant = await prisma.tenants.upsert({
    where: { subdomain: 'demo-school' },
    update: {},
    create: {
      name: "St. Mary's Demo School",
      subdomain: 'demo-school',
      tenant_type: 'SCHOOL',
      status: 'active',
      settings: {
        theme: 'blue',
        features: ['GAMIFICATION', 'PARENT_PORTAL', 'AI_AGENTS']
      }
    }
  });

  console.log(`🏫 Tenant Ready: ${demoTenant.name}`);

  // 2. Create Teacher User
  const teacherPassword = await hash('demo123', 12);
  const teacher = await prisma.users.upsert({
    where: { email: 'teacher@demo.com' },
    update: {},
    create: {
      email: 'teacher@demo.com',
      name: 'Sarah Jenkins',
      password_hash: teacherPassword,
      role: 'TEACHER',
      tenant_id: demoTenant.id,
      is_active: true,
      firstName: 'Sarah',
      lastName: 'Jenkins'
    }
  });

  console.log(`👩‍🏫 Teacher Ready: ${teacher.name}`);

  // 3. Create Parent User
  const parentPassword = await hash('demo123', 12);
  const parentUser = await prisma.users.upsert({
    where: { email: 'parent@demo.com' },
    update: {},
    create: {
      email: 'parent@demo.com',
      name: 'John Smith',
      password_hash: parentPassword,
      role: 'PARENT',
      tenant_id: demoTenant.id,
      is_active: true,
      firstName: 'John',
      lastName: 'Smith'
    }
  });

  // Link to Parents model
  const parentProfile = await prisma.parents.upsert({
    where: { user_id: parentUser.id },
    update: {},
    create: {
      user_id: parentUser.id,
      notification_preferences: { email: true, sms: false }
    }
  });

  console.log(`👨‍👩‍👧 Parent Ready: ${parentUser.name}`);

  // 4. Create Students
  const studentsData = [
    { firstName: 'Leo', lastName: 'Smith', year: 'Year 5', sen: 'Dyslexia' },
    { firstName: 'Mia', lastName: 'Wong', year: 'Year 5', sen: null },
    { firstName: 'Noah', lastName: 'Khan', year: 'Year 5', sen: 'ADHD' },
    { firstName: 'Ava', lastName: 'Johnson', year: 'Year 5', sen: null },
    { firstName: 'Lucas', lastName: 'Silva', year: 'Year 5', sen: 'Autism' },
  ];

  const createdStudents = [];

  for (const s of studentsData) {
    const student = await prisma.students.upsert({
      where: { 
        tenant_id_unique_id: {
          tenant_id: demoTenant.id,
          unique_id: `DEMO-${s.firstName.toUpperCase()}`
        }
      },
      update: {},
      create: {
        tenant_id: demoTenant.id,
        unique_id: `DEMO-${s.firstName.toUpperCase()}`,
        first_name: s.firstName,
        last_name: s.lastName,
        date_of_birth: new Date('2014-01-01'),
        year_group: s.year,
        sen_status: s.sen
      }
    });
    createdStudents.push(student);
  }

  console.log(`🎓 ${createdStudents.length} Students Created`);

  // Link Leo to Parent
  const leo = createdStudents.find(s => s.first_name === 'Leo');
  if (leo) {
    await prisma.parents.update({
      where: { id: parentProfile.id },
      data: {
        child_ids: { push: leo.id }
      }
    });
    
    // Create Parent-Child Link in Platform Layer
    await prisma.parentChildLink.create({
      data: {
        tenant_id: demoTenant.id,
        parent_id: parentUser.id,
        child_id: leo.id,
        relationship_type: 'Father'
      }
    }).catch(() => {}); // Ignore if exists
  }

  // 5. Create Class Roster
  const roster = await prisma.classRoster.create({
    data: {
      tenant_id: demoTenant.id,
      teacher_id: teacher.id,
      class_name: '5B - Ms. Jenkins',
      year_group: 'Year 5',
      academic_year: '2024-2025',
      subject: 'General',
      urgent_students: createdStudents.filter(s => s.sen_status).map(s => s.id),
      needs_support: [],
      on_track: createdStudents.filter(s => !s.sen_status).map(s => s.id),
      exceeding: []
    }
  });

  console.log(`📚 Class Roster Created: ${roster.class_name}`);

  // 6. Create Gamification Data (Battle Royale)
  // Create Houses
  const houses = ['Dragons', 'Phoenix', 'Griffin', 'Hydra'];
  for (const h of houses) {
    await prisma.houses.create({
      data: {
        tenant_id: demoTenant.id,
        name: h,
        color: 'Red' // Simplified
      }
    }).catch(() => {});
  }

  // Create Battle Stats for Students (Simulate Users for them)
  // Note: In this schema, battle_stats links to users, but students are separate.
  // For the demo, we might need dummy users for students if we want to show them on leaderboard.
  // Let's create dummy users for the students to link gamification stats.
  
  for (const s of createdStudents) {
    const studentUser = await prisma.users.upsert({
      where: { email: `${s.first_name.toLowerCase()}@demo.school` },
      update: {},
      create: {
        email: `${s.first_name.toLowerCase()}@demo.school`,
        name: `${s.first_name} ${s.last_name}`,
        password_hash: await hash('student123', 10),
        role: 'STUDENT',
        tenant_id: demoTenant.id,
        firstName: s.first_name,
        lastName: s.last_name
      }
    });

    await prisma.battle_stats.upsert({
      where: {
        tenant_id_user_id: {
          tenant_id: demoTenant.id,
          user_id: studentUser.id
        }
      },
      update: {},
      create: {
        tenant_id: demoTenant.id,
        user_id: studentUser.id,
        wins: Math.floor(Math.random() * 50),
        losses: Math.floor(Math.random() * 20),
        xp: Math.floor(Math.random() * 5000)
      }
    });
  }

  console.log(`🎮 Gamification Stats Generated`);

  // 7. Create Parent Portal Activities
  if (leo) {
    await prisma.parent_portal_activities.createMany({
      data: [
        {
          parent_id: parentProfile.id,
          child_id: leo.id,
          activity_type: 'ACHIEVEMENT',
          activity_data: { title: 'Math Whiz', description: 'Scored 100% in Algebra', icon: 'Calculator' },
          status: 'unread'
        },
        {
          parent_id: parentProfile.id,
          child_id: leo.id,
          activity_type: 'HOMEWORK',
          activity_data: { title: 'History Essay', due: 'Tomorrow', status: 'Pending' },
          status: 'unread'
        },
        {
          parent_id: parentProfile.id,
          child_id: leo.id,
          activity_type: 'BEHAVIOR',
          activity_data: { title: 'Great Teamwork', points: 5, teacher: 'Ms. Jenkins' },
          status: 'read'
        }
      ]
    });
  }

  console.log(`📱 Parent Portal Activities Seeded`);
  console.log('✅ World Seeding Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
