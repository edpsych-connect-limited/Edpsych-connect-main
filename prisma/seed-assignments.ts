import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Student Assignments...');

  // 1. Find Tenant
  const tenant = await prisma.tenants.findFirst({
    where: { subdomain: 'demo' }
  });

  if (!tenant) {
    console.error('❌ Demo tenant not found');
    return;
  }

  // 2. Find User (for email reference)
  const user = await prisma.users.findFirst({
    where: { email: 'student@demo.com', tenant_id: tenant.id }
  });

  if (!user) {
    console.error('❌ Demo student user (student@demo.com) not found');
    return;
  }

  // 3. Find or Create Student Record (students table)
  let student = await prisma.students.findFirst({
    where: { 
      tenant_id: tenant.id,
      first_name: 'Demo',
      last_name: 'Student'
    }
  });

  if (!student) {
    console.log('⚠️ Demo Student not found in students table. Creating...');
    student = await prisma.students.create({
      data: {
        tenant_id: tenant.id,
        unique_id: 'STU-DEMO-001',
        first_name: 'Demo',
        last_name: 'Student',
        date_of_birth: new Date('2015-01-01'), // Approx Year 5
        year_group: 'Year 5',
        sen_status: 'None'
      }
    });
    console.log(`✅ Created student record: ${student.first_name} ${student.last_name} (ID: ${student.id})`);
  } else {
    console.log(`✅ Found student record: ${student.first_name} ${student.last_name} (ID: ${student.id})`);
  }

  // 4. Find or Create Student Profile
  let studentProfile = await prisma.studentProfile.findUnique({
    where: { student_id: student.id }
  });

  if (!studentProfile) {
    console.log('⚠️ Student Profile not found. Creating...');
    studentProfile = await prisma.studentProfile.create({
      data: {
        tenant_id: tenant.id,
        student_id: student.id,
        // user_id: user.id, // Removed as it does not exist on StudentProfile
        learning_style: { visual: 0.5, auditory: 0.5, confidence: 0.8 },
        pace_level: 'medium',
        difficulty_preference: 'on_level',
        current_strengths: ['gaming'],
        current_struggles: [],
        engagement_score: 0.9,
        persistence_score: 0.8,
        collaboration_score: 0.7,
        ready_to_level_up: false,
        needs_intervention: false,
        profile_confidence: 0.8,
        last_synced_at: new Date()
      }
    });
    console.log(`✅ Created Student Profile (ID: ${studentProfile.id})`);
  } else {
    // user_id check removed
    console.log(`✅ Found Student Profile (ID: ${studentProfile.id})`);
  }

  // 5. Find Battle Royale Lesson Plan
  const battleRoyaleLesson = await prisma.lessonPlan.findFirst({
    where: { title: 'Battle Royale: Maths Mastery', tenant_id: tenant.id }
  });

  if (battleRoyaleLesson) {
    // Check if already assigned
    const existingAssignment = await prisma.studentLessonAssignment.findFirst({
        where: {
            student_id: student.id,
            lesson_plan_id: battleRoyaleLesson.id
        }
    });

    if (!existingAssignment) {
        await prisma.studentLessonAssignment.create({
            data: {
              student_id: student.id,
              lesson_plan_id: battleRoyaleLesson.id,
              student_profile_id: studentProfile.id,
              tenant_id: tenant.id,
              status: 'assigned',
              assigned_at: new Date(),
              assigned_difficulty: 'at',
            }
          });
        console.log(`✅ Assigned "Battle Royale" to Demo Student`);
    } else {
        console.log(`ℹ️ "Battle Royale" already assigned`);
    }
  } else {
    console.error('❌ Battle Royale lesson not found');
  }

  // 6. Find Coding Curriculum Lesson Plan
  const codingLesson = await prisma.lessonPlan.findFirst({
    where: { title: 'Developers of Tomorrow Curriculum', tenant_id: tenant.id }
  });

  if (codingLesson) {
     // Check if already assigned
     const existingAssignment = await prisma.studentLessonAssignment.findFirst({
        where: {
            student_id: student.id,
            lesson_plan_id: codingLesson.id
        }
    });

    if (!existingAssignment) {
        await prisma.studentLessonAssignment.create({
            data: {
              student_id: student.id,
              lesson_plan_id: codingLesson.id,
              student_profile_id: studentProfile.id,
              tenant_id: tenant.id,
              status: 'in_progress',
              assigned_at: new Date(),
              assigned_difficulty: 'at',
            }
          });
        console.log(`✅ Assigned "Coding Curriculum" to Demo Student`);
    } else {
        console.log(`ℹ️ "Coding Curriculum" already assigned`);
    }
  } else {
    console.error('❌ Coding Curriculum lesson not found');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
