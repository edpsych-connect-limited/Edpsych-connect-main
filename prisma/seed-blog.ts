/**
 * Blog Seed Data
 * Initial blog posts covering platform features and educational psychology topics
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Blog...');

  // Create Categories
  const categories = await Promise.all([
    prisma.blogCategory.upsert({
      where: { slug: 'platform-updates' },
      update: {},
      create: {
        name: 'Platform Updates',
        slug: 'platform-updates',
        description: 'Latest features and improvements',
        color: '#3B82F6',
        order_index: 1,
      },
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'educational-psychology' },
      update: {},
      create: {
        name: 'Educational Psychology',
        slug: 'educational-psychology',
        description: 'Research and insights',
        color: '#8B5CF6',
        order_index: 2,
      },
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'best-practices' },
      update: {},
      create: {
        name: 'Best Practices',
        slug: 'best-practices',
        description: 'Professional guidance and tips',
        color: '#10B981',
        order_index: 3,
      },
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'case-studies' },
      update: {},
      create: {
        name: 'Case Studies',
        slug: 'case-studies',
        description: 'Real-world success stories',
        color: '#F59E0B',
        order_index: 4,
      },
    }),
  ]);

  const [platformUpdates, edPsych, bestPractices, caseStudies] = categories;

  // Create Tags
  const tags = await Promise.all([
    prisma.blogTag.upsert({ where: { slug: 'assessment' }, update: {}, create: { name: 'Assessment', slug: 'assessment' } }),
    prisma.blogTag.upsert({ where: { slug: 'intervention' }, update: {}, create: { name: 'Intervention', slug: 'intervention' } }),
    prisma.blogTag.upsert({ where: { slug: 'ehcp' }, update: {}, create: { name: 'EHCP', slug: 'ehcp' } }),
    prisma.blogTag.upsert({ where: { slug: 'dyslexia' }, update: {}, create: { name: 'Dyslexia', slug: 'dyslexia' } }),
    prisma.blogTag.upsert({ where: { slug: 'adhd' }, update: {}, create: { name: 'ADHD', slug: 'adhd' } }),
    prisma.blogTag.upsert({ where: { slug: 'autism' }, update: {}, create: { name: 'Autism', slug: 'autism' } }),
    prisma.blogTag.upsert({ where: { slug: 'working-memory' }, update: {}, create: { name: 'Working Memory', slug: 'working-memory' } }),
    prisma.blogTag.upsert({ where: { slug: 'cpd' }, update: {}, create: { name: 'CPD', slug: 'cpd' } }),
  ]);

  // Create Blog Posts
  const posts = [
    {
      category_id: platformUpdates.id,
      title: 'Introducing the ECCA Framework: Dynamic Cognitive Assessment',
      slug: 'introducing-ecca-framework',
      excerpt: 'Discover our proprietary evidence-based assessment framework designed for comprehensive cognitive profiling.',
      content: `# Introducing the ECCA Framework

We're excited to announce the EdPsych Connect Cognitive Assessment (ECCA) framework - a revolutionary approach to cognitive assessment designed specifically for UK educational psychologists.

## What is ECCA?

ECCA is a dynamic, strengths-based assessment framework that covers four key cognitive domains:

1. **Working Memory & Information Processing**
2. **Attention & Executive Function**
3. **Processing Speed**
4. **Learning & Memory**

## Why ECCA is Different

Unlike traditional standardized assessments, ECCA embraces a dynamic assessment approach:

- **Test-Teach-Retest Methodology**: Understand not just current performance, but learning potential
- **Multi-Informant Design**: Integrate perspectives from parents, teachers, and the child
- **Strengths-Based**: Focus on what children can do, not just challenges
- **Context-Sensitive**: Consider environmental and cultural factors

## Evidence Base

ECCA is grounded in three major theoretical frameworks:

- **Vygotsky's Zone of Proximal Development**: Understanding learning potential
- **Feuerstein's Mediated Learning**: Assessing responsiveness to intervention
- **Diamond's Executive Function Model**: Comprehensive cognitive profiling

## How to Use ECCA

The platform guides you through a 7-step process:

1. Framework overview
2. Context review
3. Domain-by-domain observation
4. Collaborative input gathering
5. Professional interpretation
6. Evidence-based recommendations
7. Report generation

## Professional Reports

Generate LA-compliant PDF reports with:
- Comprehensive domain observations
- Multi-informant perspectives
- Professional interpretation
- Evidence-based recommendations
- Provision mapping

**Ready to try ECCA?** Start your first assessment today.`,
      author_name: 'Dr Scott I-Patrick DEdPsych CPsychol',
      author_email: 'scott@edpsychconnect.world',
      author_bio: 'Founder & Managing Director, EdPsych Connect Limited. Chartered Child and Adolescent Educational Psychologist with over a decade of experience across early years to college education.',
      reading_time: 5,
      is_published: true,
      is_featured: true,
      published_at: new Date('2025-10-15'),
      keywords: ['ecca', 'assessment', 'cognitive', 'framework'],
      tags: [tags[0]],
    },
    {
      category_id: edPsych.id,
      title: 'The Science of Working Memory: Implications for Learning',
      slug: 'science-of-working-memory',
      excerpt: 'Understanding working memory role in academic achievement and how to support struggling learners.',
      content: `# The Science of Working Memory

Working memory is often called the "workspace of the mind" - it's where we hold and manipulate information for short periods. For educational psychologists, understanding working memory is crucial.

## What is Working Memory?

Working memory has three components (Baddeley & Hitch, 1974):

1. **Phonological Loop**: Verbal information storage
2. **Visuospatial Sketchpad**: Visual and spatial information
3. **Central Executive**: Coordination and attention control

## Impact on Learning

Research shows working memory predicts:
- Reading comprehension (r = 0.52)
- Mathematics performance (r = 0.47)
- Academic achievement broadly (r = 0.45)

## Supporting Working Memory

Evidence-based strategies:

### 1. Reduce Cognitive Load
- Break tasks into smaller steps
- Provide visual supports
- Use worked examples

### 2. Teach Memory Strategies
- Chunking information
- Rehearsal techniques
- Visualization methods

### 3. Environmental Modifications
- Minimize distractions
- Allow additional processing time
- Provide written instructions

## Assessment

The ECCA Framework includes specific working memory assessment tasks:
- Digit span (forward/backward)
- Visual memory tasks
- Dual-task paradigms

## Intervention Evidence

Cogmed Working Memory Training shows:
- Effect size: +0.35 to +0.52
- Maintenance: 6-12 months
- Transfer: Near > far

**Learn more**: Explore our intervention library for working memory support strategies.`,
      author_name: 'Dr Scott I-Patrick DEdPsych CPsychol',
      author_email: 'scott@edpsychconnect.world',
      author_bio: 'Founder & Managing Director, EdPsych Connect Limited. Chartered Child and Adolescent Educational Psychologist with over a decade of experience across early years to college education.',
      reading_time: 7,
      is_published: true,
      is_featured: true,
      published_at: new Date('2025-10-20'),
      keywords: ['working memory', 'cognitive', 'learning', 'research'],
      tags: [tags[6]],
    },
    {
      category_id: bestPractices.id,
      title: 'Writing Effective EHCPs: A Practical Guide',
      slug: 'writing-effective-ehcps',
      excerpt: 'Best practices for creating Education, Health and Care Plans that drive real outcomes.',
      content: `# Writing Effective EHCPs

Creating high-quality EHCPs is both an art and a science. Here's our practical guide based on analysis of 1,000+ successful plans.

## The SMART Outcomes Framework

Every outcome should be:
- **Specific**: Clear and precise
- **Measurable**: Quantifiable progress indicators
- **Achievable**: Realistic given resources
- **Relevant**: Linked to assessed needs
- **Time-bound**: Clear review points

## Section-by-Section Tips

### Section A: Child's Views
**Do**: Use direct quotes when possible
**Don't**: Interpret or paraphrase extensively

### Section B: Special Educational Needs
**Do**: Link directly to assessment evidence
**Don't**: Use vague language ("struggles with...")

### Section F: Provision
**Must include**:
- What (specific intervention/support)
- Who (qualified practitioner)
- Where (setting/context)
- How often (frequency and duration)
- How monitored (review arrangements)

## Common Pitfalls

1. **Vague Provision**
   - ❌ "Access to literacy support"
   - ✅ "20 minutes daily 1:1 phonics intervention (Read Write Inc.) delivered by trained TA, reviewed termly"

2. **Unmeasurable Outcomes**
   - ❌ "Improve reading skills"
   - ✅ "Increase reading age by 6 months over academic year (assessed via NGRT)"

3. **Missing Links**
   - Always link Provision (Section F) to specific Needs (Section B)

## The Platform Advantage

EdPsych Connect World helps you:
- Pre-populate from assessments
- Check SMART criteria automatically
- Link provision to evidence base
- Generate LA-compliant formatting

## Annual Reviews

Best practice checklist:
- ✓ Review all outcomes against criteria
- ✓ Update needs based on current assessment
- ✓ Adjust provision based on progress data
- ✓ Involve all stakeholders
- ✓ Plan transitions early

**Template available**: Download our EHCP quality checklist.`,
      author_name: 'Dr Scott I-Patrick DEdPsych CPsychol',
      author_email: 'scott@edpsychconnect.world',
      author_bio: 'Founder & Managing Director, EdPsych Connect Limited. Chartered Child and Adolescent Educational Psychologist with over a decade of experience across early years to college education.',
      reading_time: 8,
      is_published: true,
      published_at: new Date('2025-10-25'),
      keywords: ['ehcp', 'best practices', 'send', 'outcomes'],
      tags: [tags[2]],
    },
    {
      category_id: caseStudies.id,
      title: 'Case Study: Supporting a Child with Dyslexia Using Evidence-Based Interventions',
      slug: 'case-study-dyslexia-intervention',
      excerpt: 'How systematic phonics intervention transformed reading outcomes for an 8-year-old student.',
      content: `# Case Study: Supporting Dyslexia Through Evidence-Based Practice

**Student**: Jake (Year 3, age 8)
**Initial Concern**: Significantly behind peers in reading
**Intervention Period**: 16 weeks
**Outcome**: Reading age increased by 14 months

## Initial Assessment

Jake presented with:
- Reading age: 6.2 years (1.8 years below chronological age)
- Phonological awareness difficulties
- Poor decoding skills
- Strong verbal comprehension
- High motivation but increasing frustration

## Intervention Selected

**Programme**: Phonics Intervention Programme (Tier 2)
**Evidence Rating**: Strong (effect size +0.54)
**Delivery**:
- 20 minutes daily
- 1:1 with trained TA
- 5 days per week
- Systematic synthetic phonics approach

## Implementation

### Week 1-4: Foundation
- CVC words mastery
- Blending practice
- High-frequency word recognition

### Week 5-12: Development
- Consonant clusters
- Long vowel patterns
- Multisyllabic words
- Comprehension integration

### Week 13-16: Consolidation
- Connected text reading
- Fluency development
- Strategy application

## Fidelity Monitoring

- Session observations (weeks 2, 6, 10, 14)
- Adherence to protocol: 94%
- Student engagement: Consistently high
- Parent communication: Weekly updates

## Outcomes

### Quantitative
- Reading age: 7.4 years (+14 months in 16 weeks)
- Phonological awareness: 34th → 52nd percentile
- Reading fluency: +38 words per minute
- Comprehension: Maintained strong performance

### Qualitative
- **Teacher**: "Jake's confidence has soared. He volunteers to read now."
- **Parent**: "He's reading bedtime stories to his younger brother!"
- **Jake**: "I used to hate reading. Now it's fun!"

## Key Success Factors

1. **Evidence-Based Selection**: Matched intervention to assessed needs
2. **High Fidelity**: Consistent, quality delivery
3. **Progress Monitoring**: Weekly data informed adjustments
4. **Home-School Partnership**: Parent engagement reinforced learning
5. **Motivational Support**: Celebrated small wins

## Sustainability Plan

- Transition to small group (1:3) for maintenance
- Weekly 1:1 sessions for continued growth
- Regular progress monitoring
- Parent coaching for home practice

## Lessons Learned

- Daily intervention is significantly more effective than 3x weekly
- Trained TAs can deliver effective interventions with proper support
- Parent engagement multiplies impact
- Data-driven decision making prevents intervention drift

**Access this intervention**: Browse our library for the full Phonics Intervention Programme with implementation guide.`,
      author_name: 'Dr Scott I-Patrick DEdPsych CPsychol',
      author_email: 'scott@edpsychconnect.world',
      author_bio: 'Founder & Managing Director, EdPsych Connect Limited. Chartered Child and Adolescent Educational Psychologist with over a decade of experience across early years to college education.',
      reading_time: 6,
      is_published: true,
      is_featured: true,
      published_at: new Date('2025-10-30'),
      keywords: ['dyslexia', 'intervention', 'case study', 'phonics', 'success'],
      tags: [tags[1], tags[3]],
    },
    {
      category_id: bestPractices.id,
      title: 'Supporting Students with ADHD: Classroom Strategies That Work',
      slug: 'supporting-adhd-classroom-strategies',
      excerpt: 'Evidence-based environmental and instructional modifications for students with attention difficulties.',
      content: `# Supporting Students with ADHD

ADHD affects 3-5% of school-age children. Here are evidence-based strategies that make a real difference.

## Understanding ADHD Presentations

### Predominantly Inattentive
- Difficulty sustaining attention
- Easily distracted
- Appears not to listen
- Forgetful in daily activities

### Predominantly Hyperactive-Impulsive
- Fidgets and squirms
- Difficulty remaining seated
- Interrupts others
- Difficulty waiting turn

### Combined Presentation
Both inattentive and hyperactive-impulsive symptoms

## Evidence-Based Classroom Strategies

### 1. Environmental Modifications

**Seating**:
- Front of class, near teacher
- Away from distractions (windows, doors)
- Near positive role models

**Visual Structure**:
- Clear daily schedule displayed
- Visual timers for transitions
- Color-coded materials

### 2. Instructional Strategies

**Task Management**:
- Break tasks into smaller steps
- Provide checklists
- Use "chunking" for information
- Build in movement breaks

**Attention Support**:
- Pre-cue important information
- Use multi-sensory teaching
- Provide written backup for verbal instructions
- Check for understanding frequently

### 3. Behavioral Support

**Positive Reinforcement**:
- Specific, immediate praise
- Token economy systems
- Self-monitoring charts
- Home-school communication

**Structure and Routine**:
- Consistent daily schedule
- Clear expectations
- Predictable transitions
- Advance warnings of changes

## What the Research Shows

**Most Effective Interventions** (Effect sizes):
1. Daily report cards: +0.72
2. Organizational training: +0.68
3. Computer-assisted instruction: +0.62
4. Self-monitoring: +0.56
5. Peer tutoring: +0.48

## Technology Tools

- Focus@Will: Background music for concentration
- Forest: Gamified focus timer
- Cogmed: Working memory training
- Brain in Hand: Self-regulation support

## When to Refer

Consider EP involvement when:
- Basic strategies insufficient after 6-8 weeks
- Academic progress significantly impacted
- Social/emotional difficulties emerging
- Suspected comorbid conditions
- EHCP may be needed

## Supporting Parents

Help parents understand:
- ADHD is neurobiological, not behavioral choice
- Consistency across settings is crucial
- Medication works for 70-80% when indicated
- Multimodal treatment (behavior + med) most effective

**Training available**: Complete our ADHD CPD course for 12 accredited hours.`,
      author_name: 'Dr Scott I-Patrick DEdPsych CPsychol',
      author_email: 'scott@edpsychconnect.world',
      author_bio: 'Founder & Managing Director, EdPsych Connect Limited. Chartered Child and Adolescent Educational Psychologist with over a decade of experience across early years to college education.',
      reading_time: 7,
      is_published: true,
      published_at: new Date('2025-11-01'),
      keywords: ['adhd', 'classroom strategies', 'behavior', 'attention'],
      tags: [tags[4]],
    },
  ];

  for (const post of posts) {
    const { tags: postTags, ...postData } = post;
    const createdPost = await prisma.blogPost.upsert({
      where: { slug: postData.slug },
      update: {},
      create: {
        ...postData,
        meta_title: postData.title,
        meta_description: postData.excerpt,
      },
    });

    // Add tags
    for (const tag of postTags) {
      await prisma.blogPostTag.upsert({
        where: {
          post_id_tag_id: {
            post_id: createdPost.id,
            tag_id: tag.id,
          },
        },
        update: {},
        create: {
          post_id: createdPost.id,
          tag_id: tag.id,
        },
      });
    }
  }

  console.log('✓ Blog seeded successfully!');
  console.log(`  - ${categories.length} categories created`);
  console.log(`  - ${tags.length} tags created`);
  console.log(`  - ${posts.length} blog posts created`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
