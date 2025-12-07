import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting Demo Features seed data generation...\n');

  // 1. Get or create test tenant
  let tenant = await prisma.tenants.findFirst({
    where: { subdomain: 'demo' }
  });

  if (!tenant) {
    console.log('Warning: Demo tenant not found. Please run seed-orchestration.ts first.');
    return;
  }

  // 2. Seed EHCN Researcher Role
  console.log('\nSeeding EHCN Researcher Role...');
  const researcherEmail = 'researcher@edpsychconnect.com';
  let researcher = await prisma.users.findUnique({
    where: { email: researcherEmail }
  });

  if (!researcher) {
    researcher = await prisma.users.create({
      data: {
        tenant_id: tenant.id,
        email: researcherEmail,
        password_hash: '$2b$10$dummyhashforseeding', // Test1234!
        name: 'Dr. Elena Fisher',
        firstName: 'Elena',
        lastName: 'Fisher',
        role: 'researcher',
        is_active: true,
        onboarding_completed: true
      }
    });
    console.log(`Created researcher: ${researcher.name}`);
  } else {
    console.log(`Using existing researcher: ${researcher.name}`);
  }

  // Seed Researcher Profile
  const existingProfile = await prisma.researcherProfile.findUnique({
    where: { userId: researcher.id }
  });

  if (!existingProfile) {
    await prisma.researcherProfile.create({
      data: {
        userId: researcher.id,
        years_of_experience: 15,
        research_areas: ['Neurodiversity', 'Gamified Learning', 'Cognitive Interventions'],
        academic_qualifications: ['PhD Educational Psychology', 'MSc Cognitive Science']
      }
    });
    console.log(`Created researcher profile for: ${researcher.name}`);
  }

  // Seed Research Studies
  const studies = [
    {
      title: 'Impact of Gamification on ADHD Engagement',
      description: 'A longitudinal study measuring attention span improvements in students with ADHD using the Battle Royale learning mode.',
      objective: 'To quantify the effect of gamified learning environments on sustained attention.',
      status: 'active',
      methodology: 'Quantitative',
      ethics_reference: 'ETH-2024-001',
      ethics_approval: true,
      start_date: new Date('2024-01-15'),
      end_date: new Date('2024-12-15')
    },
    {
      title: 'Coding as a Cognitive Intervention',
      description: 'Analyzing the correlation between Python programming skills and logical reasoning development in KS2 students.',
      objective: 'To assess if coding curriculum improves general problem-solving abilities.',
      status: 'recruiting',
      methodology: 'Mixed Methods',
      ethics_reference: 'ETH-2024-042',
      ethics_approval: true,
      start_date: new Date('2024-03-01'),
      end_date: new Date('2025-03-01')
    }
  ];

  for (const study of studies) {
    const existingStudy = await prisma.research_studies.findFirst({
      where: { title: study.title }
    });

    if (!existingStudy) {
      await prisma.research_studies.create({
        data: {
          tenant_id: tenant.id,
          creator_id: researcher.id,
          ...study
        }
      });
      console.log(`Created study: ${study.title}`);
    }
  }

  // 3. Seed Coding Curriculum (Developers of Tomorrow)
  console.log('\nSeeding Coding Curriculum...');
  
  const curriculumName = 'Python for Problem Solvers';
  let curriculum = await prisma.nCCurriculum.findFirst({
    where: { name: curriculumName }
  });

  if (!curriculum) {
    curriculum = await prisma.nCCurriculum.create({
      data: {
        tenant_id: tenant.id,
        name: curriculumName,
        description: 'A structured introduction to Python programming focusing on computational thinking and problem-solving skills.',
        key_stage: 'KS2',
        year_groups: ['Year 5', 'Year 6'],
        age_range_min: 9,
        age_range_max: 11,
        nc_objectives: ['CS_KS2_01', 'CS_KS2_02'],
        status: 'published',
        created_by_id: researcher.id
      }
    });
    console.log(`Created curriculum: ${curriculum.name}`);

    // Create Modules/Lessons
    const lessons = [
      { title: 'Variables and Data Types', sequence: 1, content: 'Understanding how to store data.' },
      { title: 'Control Flow: If/Else', sequence: 2, content: 'Making decisions in code.' },
      { title: 'Loops and Iteration', sequence: 3, content: 'Repeating actions efficiently.' },
      { title: 'Functions', sequence: 4, content: 'Reusable code blocks.' }
    ];

    for (const lesson of lessons) {
      const createdLesson = await prisma.nCLesson.create({
        data: {
          tenant_id: tenant.id,
          curriculum_id: curriculum.id,
          title: lesson.title,
          description: lesson.content,
          lesson_number: lesson.sequence,
          language: 'PYTHON',
          skill_areas: ['PROGRAMMING', 'ALGORITHMS'],
          base_difficulty: 'FOUNDATION',
          created_by_id: researcher.id
        }
      });

      // Create Exercises
      await prisma.nCExercise.create({
        data: {
          tenant_id: tenant.id,
          lesson_id: createdLesson.id,
          title: `Practice: ${lesson.title}`,
          instructions: 'Complete the following code snippet.',
          exercise_number: 1,
          exercise_type: 'guided',
          difficulty: 'FOUNDATION',
          max_points: 10,
          starter_code: '# Write your code here\n',
          solution_code: 'print("Hello World")',
          test_cases: JSON.stringify([{ input: '', output: 'Hello World' }]),
          created_by_id: researcher.id
        }
      });
    }
    console.log(`Created ${lessons.length} lessons with exercises`);
  } else {
    console.log(`Using existing curriculum: ${curriculum.name}`);
  }

  // 4. Seed Battle Royale (Gamification)
  console.log('\nSeeding Battle Royale...');

  // Get some students
  const students = await prisma.students.findMany({
    where: { tenant_id: tenant.id },
    take: 20
  });

  if (students.length === 0) {
    console.log('Warning: No students found. Please run seed-orchestration.ts first.');
  } else {
    // Create Squads
    const squadNames = ['Cyber Ninjas', 'Logic Lords', 'Python Pioneers', 'Data Defenders'];
    
    for (const name of squadNames) {
      const squadId = name.toLowerCase().replace(' ', '-');
      
      // Assign random students to this squad
      const squadStudents = students.filter(() => Math.random() > 0.75);
      
      for (const student of squadStudents) {
        // Find user for student
        const studentEmail = `${student.first_name.toLowerCase()}.${student.last_name.toLowerCase()}@student.test-school.edu`;
        
        let studentUser = await prisma.users.findUnique({
          where: { email: studentEmail }
        });

        if (!studentUser) {
          studentUser = await prisma.users.create({
            data: {
              tenant_id: tenant.id,
              email: studentEmail,
              password_hash: '$2b$10$dummyhashforseeding',
              name: `${student.first_name} ${student.last_name}`,
              role: 'student',
              is_active: true
            }
          });
        }

        // Create Battle Stats
        const existingStats = await prisma.battle_stats.findUnique({
          where: {
            tenant_id_user_id: {
              tenant_id: tenant.id,
              user_id: studentUser.id
            }
          }
        });

        if (!existingStats) {
          await prisma.battle_stats.create({
            data: {
              tenant_id: tenant.id,
              user_id: studentUser.id,
              wins: Math.floor(Math.random() * 50),
              losses: Math.floor(Math.random() * 20),
              xp: Math.floor(Math.random() * 5000)
            }
          });
        }

        // Add to Squad
        const existingMember = await prisma.squad_members.findFirst({
          where: {
            tenant_id: tenant.id,
            user_id: studentUser.id,
            squad_id: squadId
          }
        });

        if (!existingMember) {
          await prisma.squad_members.create({
            data: {
              tenant_id: tenant.id,
              user_id: studentUser.id,
              squad_id: squadId,
              role: 'member'
            }
          });
        }
      }
    }
    console.log(`Created Battle Royale squads and stats`);
  }

  // 5. Ensure Parent-Child Links
  console.log('\nVerifying Parent-Child Links...');
  const parentLinksCount = await prisma.parentChildLink.count({
    where: { tenant_id: tenant.id }
  });

  if (parentLinksCount === 0) {
    console.log('Warning: No parent-child links found. Creating some now...');
    // Create links for the first 10 students
    const studentsToLink = await prisma.students.findMany({
      where: { tenant_id: tenant.id },
      take: 10
    });

    for (const student of studentsToLink) {
      const parentEmail = `parent.${student.unique_id}@test-school.edu`;
      let parent = await prisma.users.findUnique({ where: { email: parentEmail } });

      if (!parent) {
        parent = await prisma.users.create({
          data: {
            tenant_id: tenant.id,
            email: parentEmail,
            password_hash: '$2b$10$dummyhashforseeding',
            name: `Parent of ${student.first_name}`,
            role: 'parent',
            is_active: true
          }
        });
      }

      await prisma.parentChildLink.create({
        data: {
          tenant_id: tenant.id,
          parent_id: parent.id,
          child_id: student.id,
          relationship_type: 'guardian',
          is_primary_contact: true
        }
      });
    }
    console.log(`Created 10 emergency parent-child links`);
  } else {
    console.log(`Found ${parentLinksCount} existing parent-child links`);
  }

  console.log('\nDemo Features seed data generation complete!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
