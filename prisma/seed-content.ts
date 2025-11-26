import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Content Seed...');

  // ============================================================================
  // 1. PARENTAL TIPS
  // ============================================================================
  console.log('👨‍👩‍👧‍👦 Seeding Parental Tips...');

  const parentalTips = [
    {
      title: 'Establishing a Routine',
      content: 'Consistency is key. Try to maintain a regular schedule for meals, homework, and bedtime to help your child feel secure.',
      category: 'behaviour',
      ageRange: '5-11',
      isActive: true
    },
    {
      title: 'Active Listening',
      content: 'When your child talks about their day, stop what you are doing and make eye contact. This shows them that what they say matters.',
      category: 'emotional',
      ageRange: 'all',
      isActive: true
    },
    {
      title: 'Reading Together',
      content: 'Spend 15 minutes a day reading with your child. It improves literacy and strengthens your bond.',
      category: 'learning',
      ageRange: '4-9',
      isActive: true
    },
    {
      title: 'Managing Screen Time',
      content: 'Set clear boundaries for screen time. Encourage offline activities like playing outside or board games.',
      category: 'behaviour',
      ageRange: 'all',
      isActive: true
    },
    {
      title: 'Positive Reinforcement',
      content: 'Praise effort, not just results. "I can see you worked really hard on that" is more powerful than "Good job".',
      category: 'emotional',
      ageRange: 'all',
      isActive: true
    }
  ];

  for (const tip of parentalTips) {
    // We don't have a unique key for tips other than ID, so we'll just create them if they don't exist roughly matching title
    const existing = await prisma.parentalTip.findFirst({
      where: { title: tip.title }
    });

    if (!existing) {
      await prisma.parentalTip.create({
        data: tip
      });
      console.log(`   ✅ Tip created: ${tip.title}`);
    } else {
      console.log(`   ℹ️  Tip already exists: ${tip.title}`);
    }
  }

  // ============================================================================
  // 2. EDUCATIONAL CONTENT (Lesson Plans / Resources)
  // ============================================================================
  console.log('📚 Seeding Educational Content...');

  const contents = [
    {
      title: 'Introduction to Fractions',
      description: 'A visual guide to understanding basic fractions.',
      content_type: 'lesson_plan',
      tags: JSON.stringify(['math', 'fractions', 'visual']),
      is_public: true,
      url: 'https://resources.edpsychconnect.com/math/fractions-intro',
      image_url: 'https://resources.edpsychconnect.com/images/fractions.png'
    },
    {
      title: 'The Water Cycle',
      description: 'Interactive diagram explaining evaporation, condensation, and precipitation.',
      content_type: 'resource',
      tags: JSON.stringify(['science', 'geography', 'water']),
      is_public: true,
      url: 'https://resources.edpsychconnect.com/science/water-cycle',
      image_url: 'https://resources.edpsychconnect.com/images/water-cycle.png'
    },
    {
      title: 'Creative Writing Prompts',
      description: 'A collection of 50 prompts to spark imagination.',
      content_type: 'activity',
      tags: JSON.stringify(['literacy', 'writing', 'creative']),
      is_public: true,
      url: 'https://resources.edpsychconnect.com/literacy/writing-prompts',
      image_url: 'https://resources.edpsychconnect.com/images/writing.png'
    },
    {
      title: 'Mindfulness for Kids',
      description: 'Simple breathing exercises to help children relax.',
      content_type: 'video',
      tags: JSON.stringify(['wellbeing', 'mindfulness', 'health']),
      is_public: true,
      url: 'https://resources.edpsychconnect.com/wellbeing/mindfulness-video',
      image_url: 'https://resources.edpsychconnect.com/images/mindfulness.png'
    }
  ];

  for (const content of contents) {
    const existing = await prisma.content.findFirst({
      where: { title: content.title }
    });

    if (!existing) {
      await prisma.content.create({
        data: content
      });
      console.log(`   ✅ Content created: ${content.title}`);
    } else {
      console.log(`   ℹ️  Content already exists: ${content.title}`);
    }
  }

  console.log('🎉 Content Seed Completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding content:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
