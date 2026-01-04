
import { PrismaClient, CodingLanguage, CodingSkillArea, CodingDifficulty } from '@prisma/client';

const prisma = new PrismaClient();

// Static Data from EnhancedCodingCurriculum.tsx
const CODING_VIDEOS = [
  {
    id: 'intro-coding-journey',
    title: 'Welcome to Your Coding Journey',
    description: 'An introduction to the Developers of Tomorrow programme - learn why coding matters and what you\'ll achieve.',
    duration: '5:30',
    track: 'intro'
  },
  {
    id: 'blocks-intro',
    title: 'Introduction to Block Coding',
    description: 'Learn the fundamentals of programming logic using visual blocks - perfect for beginners!',
    duration: '8:15',
    track: 'blocks'
  },
  {
    id: 'blocks-events',
    title: 'Events and Actions',
    description: 'Understand how events trigger actions in your programs - the foundation of interactive coding.',
    duration: '6:45',
    track: 'blocks'
  },
  {
    id: 'blocks-loops',
    title: 'Loops and Repetition',
    description: 'Master the power of loops to make your code efficient and powerful.',
    duration: '7:20',
    track: 'blocks'
  },
  {
    id: 'python-basics',
    title: 'Python Fundamentals',
    description: 'Transition from blocks to text-based coding with Python - the world\'s most popular programming language.',
    duration: '12:00',
    track: 'python'
  },
  {
    id: 'python-variables',
    title: 'Variables and Data',
    description: 'Learn how to store and manipulate data using variables in Python.',
    duration: '9:30',
    track: 'python'
  },
  {
    id: 'python-functions',
    title: 'Functions and Reusability',
    description: 'Create your own functions to write cleaner, more powerful code.',
    duration: '11:15',
    track: 'python'
  },
  {
    id: 'react-intro',
    title: 'Introduction to React',
    description: 'Learn the basics of React - the professional framework used by companies like Facebook, Netflix, and Airbnb.',
    duration: '15:00',
    track: 'react'
  },
  {
    id: 'react-components',
    title: 'Building Components',
    description: 'Create reusable UI components - the building blocks of modern web applications.',
    duration: '13:45',
    track: 'react'
  },
  {
    id: 'react-state',
    title: 'State and Interactivity',
    description: 'Make your applications interactive with React\'s state management.',
    duration: '14:30',
    track: 'react'
  }
];

const LEVELS = [
  { 
    id: 1, 
    title: "Hello World", 
    type: "Blocks", 
    description: "Make your avatar say hello!", 
    xp: 100,
    cognitiveLoad: 'Low',
    skills: ['Sequencing', 'Basic Logic'],
    unlocked: true
  },
  { 
    id: 2, 
    title: "Movement Logic", 
    type: "Blocks", 
    description: "Program your avatar to walk.", 
    xp: 150,
    cognitiveLoad: 'Low',
    skills: ['Sequencing', 'Events'],
    unlocked: true
  },
  { 
    id: 3, 
    title: "Collect Coins", 
    type: "Blocks", 
    description: "Use loops to collect all coins.", 
    xp: 200,
    cognitiveLoad: 'Medium',
    skills: ['Loops', 'Patterns'],
    unlocked: true
  },
  { 
    id: 4, 
    title: "Maze Navigator", 
    type: "Blocks", 
    description: "Navigate through a maze with conditionals.", 
    xp: 250,
    cognitiveLoad: 'Medium',
    skills: ['Conditionals', 'Problem Solving'],
    unlocked: false
  },
  { 
    id: 5, 
    title: "Super Jump Mod", 
    type: "Python", 
    description: "Hack gravity to jump higher.", 
    xp: 300,
    cognitiveLoad: 'Medium',
    skills: ['Variables', 'Functions'],
    unlocked: false
  },
  { 
    id: 6, 
    title: "Speed Boost", 
    type: "Python", 
    description: "Create a speed multiplier power-up.", 
    xp: 350,
    cognitiveLoad: 'Medium-High',
    skills: ['Functions', 'Parameters'],
    unlocked: false
  },
  { 
    id: 7, 
    title: "Custom Shield", 
    type: "React", 
    description: "Build a shield component.", 
    xp: 500,
    cognitiveLoad: 'High',
    skills: ['Components', 'Props'],
    unlocked: false
  },
  { 
    id: 8, 
    title: "Health Bar", 
    type: "React", 
    description: "Create a dynamic health bar.", 
    xp: 600,
    cognitiveLoad: 'High',
    skills: ['State', 'Hooks'],
    unlocked: false
  }
];

async function main() {
  console.log('🌱 Seeding Coding Curriculum...');

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

  // 2. Find or Create Class Roster (Year 7 Coding Club)
  let roster = await prisma.classRoster.findFirst({
    where: { class_name: 'Year 7 Coding Club', tenant_id: tenant.id }
  });

  if (!roster) {
    roster = await prisma.classRoster.create({
      data: {
        class_name: 'Year 7 Coding Club',
        tenant_id: tenant.id,
        academic_year: '2024-2025',
        year_group: '7',
        teacher_id: teacher.id
      }
    });
    console.log('✅ Created Class Roster: Year 7 Coding Club');
  }

  // 3. Create Lesson Plan
  const lessonPlan = await prisma.lessonPlan.create({
    data: {
      title: 'Developers of Tomorrow Curriculum',
      subject: 'Computing',
      year_group: '7',
      curriculum_reference: 'KS3 Computing',
      learning_objectives: ['Understand algorithms', 'Write code in Python', 'Build UIs with React'],
      description: 'A comprehensive coding curriculum taking students from block-based coding to professional React development.',
      base_content: {
        videos: CODING_VIDEOS
      },
      tenant_id: tenant.id,
      teacher_id: teacher.id,
      class_roster_id: roster.id,
      status: 'published'
    }
  });

  console.log(`✅ Created Lesson Plan: ${lessonPlan.title}`);

  // 4. Create Activities (Levels)
  for (const level of LEVELS) {
    await prisma.lessonActivity.create({
      data: {
        lesson_plan_id: lessonPlan.id,
        title: level.title,
        activity_type: 'coding_level',
        sequence_order: level.id,
        base_content: {
          type: level.type,
          description: level.description,
          xp: level.xp,
          cognitiveLoad: level.cognitiveLoad,
          skills: level.skills,
          unlocked: level.unlocked
        },
        estimated_duration: 30,
        success_criteria: ['Code compiles', 'Tests pass']
      }
    });
  }

  console.log(`✅ Created ${LEVELS.length} Coding Levels`);

  // 5. Assign to Students (Optional - assign to all students in roster)
  // For now, we'll just ensure the lesson plan exists so we can fetch it.

  // 6. Create NCCurriculum (Enterprise Grade)
  // Check if it already exists
  const existingCurriculum = await prisma.nCCurriculum.findFirst({
    where: { tenant_id: tenant.id, name: 'Coders of Tomorrow' }
  });

  if (!existingCurriculum) {
    const curriculum = await prisma.nCCurriculum.create({
      data: {
        tenant_id: tenant.id,
        name: 'Coders of Tomorrow',
        description: 'A comprehensive coding curriculum taking students from block-based coding to professional React development.',
        key_stage: 'KS3',
        year_groups: ['Year 7', 'Year 8', 'Year 9'],
        age_range_min: 11,
        age_range_max: 14,
        nc_objectives: ['KS3-01', 'KS3-02'],
        status: 'published',
        created_by_id: teacher.id,
        lessons: {
          create: LEVELS.map(level => ({
            tenant_id: tenant.id,
            title: level.title,
            description: level.description,
            lesson_number: level.id,
            duration_minutes: 45,
            language: level.type.toUpperCase() === 'BLOCKS' ? CodingLanguage.SCRATCH : level.type.toUpperCase() === 'PYTHON' ? CodingLanguage.PYTHON : CodingLanguage.JAVASCRIPT,
            skill_areas: [CodingSkillArea.PROGRAMMING],
            base_difficulty: level.cognitiveLoad === 'Low' ? CodingDifficulty.FOUNDATION : level.cognitiveLoad === 'Medium' ? CodingDifficulty.DEVELOPING : CodingDifficulty.ADVANCED,
            status: 'published'
          }))
        }
      }
    });
    console.log(`✅ Created NCCurriculum: ${curriculum.name} with ${LEVELS.length} lessons`);
  } else {
    console.log('ℹ️ NCCurriculum already exists');
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
