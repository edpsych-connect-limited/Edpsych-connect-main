
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const KS2_MATHS_QUESTIONS = [
  // Easy
  { id: 'ks2-m1', text: 'What is 7 x 8?', options: ['54', '56', '58', '62'], correctIndex: 1, points: 100, category: 'Maths KS2', difficulty: 'easy', curriculumLink: 'Multiplication tables' },
  { id: 'ks2-m2', text: 'What is 120 ÷ 10?', options: ['10', '12', '1200', '20'], correctIndex: 1, points: 100, category: 'Maths KS2', difficulty: 'easy', curriculumLink: 'Division by 10' },
  { id: 'ks2-m3', text: 'What is half of 50?', options: ['20', '25', '30', '15'], correctIndex: 1, points: 100, category: 'Maths KS2', difficulty: 'easy', curriculumLink: 'Fractions' },
  
  // Medium
  { id: 'ks2-m4', text: 'What is 15% of 200?', options: ['20', '30', '40', '15'], correctIndex: 1, points: 200, category: 'Maths KS2', difficulty: 'medium', curriculumLink: 'Percentages' },
  { id: 'ks2-m5', text: 'Simplify the fraction 12/16', options: ['2/3', '3/4', '4/5', '6/8'], correctIndex: 1, points: 200, category: 'Maths KS2', difficulty: 'medium', curriculumLink: 'Simplifying fractions' },
  { id: 'ks2-m6', text: 'What is the perimeter of a square with side 5cm?', options: ['20cm', '25cm', '10cm', '15cm'], correctIndex: 0, points: 200, category: 'Maths KS2', difficulty: 'medium', curriculumLink: 'Perimeter' },

  // Hard
  { id: 'ks2-m7', text: 'If 3x + 5 = 20, what is x?', options: ['3', '4', '5', '6'], correctIndex: 2, points: 300, category: 'Maths KS2', difficulty: 'hard', curriculumLink: 'Algebra' },
  { id: 'ks2-m8', text: 'What is the area of a triangle with base 10cm and height 5cm?', options: ['50cm²', '25cm²', '15cm²', '100cm²'], correctIndex: 1, points: 300, category: 'Maths KS2', difficulty: 'hard', curriculumLink: 'Area of triangle' },
  { id: 'ks2-m9', text: 'What is 2.5 x 4.2?', options: ['10.5', '10.0', '8.5', '12.5'], correctIndex: 0, points: 300, category: 'Maths KS2', difficulty: 'hard', curriculumLink: 'Decimals' }
];

async function main() {
  console.log('🌱 Seeding Battle Royale Content...');

  // 1. Find Tenant and Teacher
  const tenant = await prisma.tenants.findFirst({
    where: { subdomain: 'demo' }
  });

  if (!tenant) {
    console.error('❌ Demo tenant not found');
    return;
  }

  const teacher = await prisma.users.findFirst({
    where: { email: 'teacher@demo.com', tenant_id: tenant.id }
  });

  if (!teacher) {
    console.error('❌ Demo teacher not found');
    return;
  }

  // 2. Find or Create Class Roster
  let roster = await prisma.classRoster.findFirst({
    where: { class_name: 'Year 6 Maths Warriors', tenant_id: tenant.id }
  });

  if (!roster) {
    roster = await prisma.classRoster.create({
      data: {
        class_name: 'Year 6 Maths Warriors',
        tenant_id: tenant.id,
        academic_year: '2024-2025',
        year_group: '6',
        teacher_id: teacher.id
      }
    });
    console.log('✅ Created Class Roster: Year 6 Maths Warriors');
  }

  // 3. Create Lesson Plan
  const lessonPlan = await prisma.lessonPlan.create({
    data: {
      title: 'Battle Royale: Maths Mastery',
      subject: 'Maths',
      year_group: '6',
      curriculum_reference: 'KS2 Maths',
      learning_objectives: ['Master multiplication', 'Understand fractions', 'Solve algebraic equations'],
      description: 'A high-stakes battle royale game to test your maths skills.',
      base_content: {
        gameType: 'battle-royale',
        settings: {
          timeLimit: 600,
          lives: 3
        }
      },
      tenant_id: tenant.id,
      teacher_id: teacher.id,
      class_roster_id: roster.id,
      status: 'published'
    }
  });

  console.log(`✅ Created Lesson Plan: ${lessonPlan.title}`);

  // 4. Create Activities (Questions grouped by difficulty)
  // We'll create one activity per difficulty level to simulate "rounds" or "zones"
  
  const difficulties = ['easy', 'medium', 'hard'];

  for (const difficulty of difficulties) {
    const questions = KS2_MATHS_QUESTIONS.filter(q => q.difficulty === difficulty);
    
    await prisma.lessonActivity.create({
      data: {
        lesson_plan_id: lessonPlan.id,
        title: `Round: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`,
        activity_type: 'quiz',
        sequence_order: difficulties.indexOf(difficulty) + 1,
        base_content: {
          questions: questions
        },
        estimated_duration: 10,
        success_criteria: ['Survive the round']
      }
    });
  }

  console.log(`✅ Created ${difficulties.length} Battle Royale Rounds`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
