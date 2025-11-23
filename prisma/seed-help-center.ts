/**
 * Help Center Seed Data
 * Comprehensive help articles across all platform features
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Help Center...');

  // Create Categories
  const categories = await Promise.all([
    prisma.helpCategory.upsert({
      where: { slug: 'getting-started' },
      update: {},
      create: {
        name: 'Getting Started',
        slug: 'getting-started',
        description: 'Essential guides for new users',
        icon: '🚀',
        order_index: 1,
      },
    }),
    prisma.helpCategory.upsert({
      where: { slug: 'assessments' },
      update: {},
      create: {
        name: 'Assessments',
        slug: 'assessments',
        description: 'How to conduct and manage assessments',
        icon: '📋',
        order_index: 2,
      },
    }),
    prisma.helpCategory.upsert({
      where: { slug: 'interventions' },
      update: {},
      create: {
        name: 'Interventions',
        slug: 'interventions',
        description: 'Finding and implementing interventions',
        icon: '🎓',
        order_index: 3,
      },
    }),
    prisma.helpCategory.upsert({
      where: { slug: 'ehcp' },
      update: {},
      create: {
        name: 'EHCP',
        slug: 'ehcp',
        description: 'Creating and managing EHCPs',
        icon: '📄',
        order_index: 4,
      },
    }),
    prisma.helpCategory.upsert({
      where: { slug: 'training' },
      update: {},
      create: {
        name: 'Training & CPD',
        slug: 'training',
        description: 'Professional development courses',
        icon: '🏆',
        order_index: 5,
      },
    }),
    prisma.helpCategory.upsert({
      where: { slug: 'technical' },
      update: {},
      create: {
        name: 'Technical Support',
        slug: 'technical',
        description: 'Technical issues and troubleshooting',
        icon: '🔧',
        order_index: 6,
      },
    }),
  ]);

  const [gettingStarted, assessments, interventions, ehcp, training, technical] = categories;

  // Create Articles
  const articles = [
    // GETTING STARTED
    {
      category_id: gettingStarted.id,
      title: 'Welcome to EdPsych Connect World',
      slug: 'welcome-to-edpsych-connect',
      excerpt: 'Learn the basics of navigating the platform',
      content: `# Welcome to EdPsych Connect World

EdPsych Connect World is a comprehensive platform designed for educational psychologists, SENCOs, teachers, and researchers.

## Key Features

- **ECCA Assessment Framework**: Conduct comprehensive cognitive assessments
- **Intervention Library**: Access 69 evidence-based interventions
- **EHCP Support**: Streamlined EHCP creation and management
- **CPD Training**: Professional development courses
- **Battle Royale**: Gamified professional development
- **Progress Tracking**: Monitor student outcomes

## Getting Started

1. Complete your profile in Settings
2. Explore the Dashboard
3. Try the Problem Solver for quick solutions
4. Browse the Intervention Library
5. Start your first assessment

## Need Help?

Press the **?** key anywhere in the platform for context-sensitive help.`,
      search_keywords: ['welcome', 'introduction', 'getting started', 'basics'],
      page_context: ['/dashboard'],
      is_featured: true,
    },
    {
      category_id: gettingStarted.id,
      title: 'Navigating the Dashboard',
      slug: 'navigating-dashboard',
      excerpt: 'Understanding your personalized dashboard',
      content: `# Navigating the Dashboard

Your dashboard is customized based on your role and preferences.

## Dashboard Sections

### Quick Actions
Quickly start common tasks:
- Start new assessment
- Create EHCP
- Browse interventions
- Access Problem Solver

### Recent Activity
See your recent cases, assessments, and reports

### Progress Overview
Track student outcomes and intervention effectiveness

### Upcoming Tasks
View pending assessments, reviews, and deadlines

## Customization

Click the **Customize Dashboard** button to:
- Rearrange sections
- Show/hide widgets
- Set default views`,
      search_keywords: ['dashboard', 'navigation', 'layout', 'customize'],
      page_context: ['/dashboard'],
    },

    // ASSESSMENTS
    {
      category_id: assessments.id,
      title: 'Conducting an ECCA Assessment',
      slug: 'conducting-ecca-assessment',
      excerpt: 'Step-by-step guide to the ECCA framework',
      content: `# Conducting an ECCA Assessment

The EdPsych Connect Cognitive Assessment (ECCA) is a dynamic, strengths-based framework.

## 4 Cognitive Domains

1. **Working Memory & Information Processing**
   - Digit span tasks
   - Visual-spatial memory
   - Information manipulation

2. **Attention & Executive Function**
   - Sustained attention
   - Selective attention
   - Executive control

3. **Processing Speed**
   - Reaction time tasks
   - Processing efficiency
   - Cognitive fluency

4. **Learning & Memory**
   - Short-term retention
   - Long-term consolidation
   - Transfer of learning

## Assessment Workflow

1. **Overview**: Review framework and prepare
2. **Context Review**: Understand background
3. **Domain Observations**: Conduct tasks and record observations
4. **Collaborative Input**: Invite parents, teachers, child
5. **Interpretation**: Professional synthesis
6. **Recommendations**: Evidence-based provisions
7. **Report Generation**: Professional PDF report

## Tips for Success

- Use suggested tasks as starting points
- Adapt based on child's needs
- Record both successes and challenges
- Consider environmental factors
- Integrate multiple perspectives`,
      search_keywords: ['ecca', 'assessment', 'cognitive', 'framework', 'conducting'],
      page_context: ['/assessments', '/assessments/new'],
      is_featured: true,
    },
    {
      category_id: assessments.id,
      title: 'Inviting Collaborative Input',
      slug: 'collaborative-input',
      excerpt: 'How to gather multi-informant perspectives',
      content: `# Inviting Collaborative Input

Gather valuable perspectives from parents, teachers, and the child.

## Sending Invitations

1. Navigate to the Collaborative Input step
2. Click "+ Send Invitation" for each contributor
3. Enter name, email, and relationship
4. Add a personal message (optional)
5. Click "Send Invitation"

## What Contributors See

Contributors receive a professional email with:
- Secure link (valid for 30 days)
- Clear instructions
- Estimated time (15-20 minutes)
- Privacy assurance

## Managing Responses

- **Pending**: Invitation sent, awaiting response
- **Received**: Response submitted
- **Integrated**: Incorporated into assessment

## Best Practices

- Send invitations early in the assessment process
- Follow up after 1 week if no response
- Use personal messages to encourage participation
- Review all input before finalizing report`,
      search_keywords: ['collaborative', 'multi-informant', 'parent', 'teacher', 'invitation'],
      page_context: ['/assessments'],
    },
    {
      category_id: assessments.id,
      title: 'Generating Assessment Reports',
      slug: 'generating-reports',
      excerpt: 'Creating professional PDF reports',
      content: `# Generating Assessment Reports

Generate LA-compliant PDF reports with one click.

## Report Sections

1. **Cover Page**: Student and assessor information
2. **Executive Summary**: Key findings overview
3. **Background Information**: Context and referral reason
4. **Assessment Observations**: Domain-by-domain findings
5. **Test Results**: Scores and interpretations
6. **Collaborative Input**: Parent, teacher, child perspectives
7. **Professional Interpretation**: Cognitive profile synthesis
8. **Recommendations**: Evidence-based provisions
9. **Monitoring Plan**: Review and follow-up
10. **Appendices**: Additional information

## Generating the Report

1. Complete all assessment sections
2. Click "Review & Complete"
3. Click "Generate Professional PDF Report"
4. Report downloads automatically

## Report Customization

Reports automatically include:
- Your professional credentials
- Organization branding
- LA-compliant formatting
- GDPR compliance statement
- Distribution list

## Sharing Reports

- Email directly to parents/schools
- Upload to case management system
- Print for physical distribution`,
      search_keywords: ['report', 'pdf', 'generating', 'download', 'share'],
      page_context: ['/assessments'],
      is_featured: true,
    },

    // INTERVENTIONS
    {
      category_id: interventions.id,
      title: 'Finding the Right Intervention',
      slug: 'finding-interventions',
      excerpt: 'How to search and select interventions',
      content: `# Finding the Right Intervention

Access 69 evidence-based interventions across literacy, numeracy, and wellbeing.

## Browsing by Category

- **Literacy** (30 interventions): Phonics, reading comprehension, writing
- **Numeracy** (30 interventions): Number sense, calculation, problem-solving
- **Wellbeing** (9 interventions): Anxiety, attention, behavior

## Search & Filter

Use filters to narrow down:
- **Tier**: Universal, Targeted, or Specialist
- **Age Range**: Early Years, Primary, Secondary
- **Group Size**: Individual, small group, whole class
- **Duration**: 10-30 minutes per session
- **Evidence Rating**: Strong, Moderate, Promising

## Evidence Ratings

Each intervention includes:
- **Effect Size**: Statistical impact (e.g., +0.5 SD)
- **Evidence Rating**: Research quality assessment
- **Success Rate**: Percentage of students showing improvement
- **Research Citations**: Peer-reviewed studies

## Implementation Guides

Every intervention provides:
- Step-by-step instructions
- Required materials
- Session plans
- Fidelity checklists
- Parent information sheets`,
      search_keywords: ['intervention', 'finding', 'search', 'filter', 'evidence'],
      page_context: ['/interventions'],
      is_featured: true,
    },
    {
      category_id: interventions.id,
      title: 'Assigning Interventions to Students',
      slug: 'assigning-interventions',
      excerpt: 'How to assign and track interventions',
      content: `# Assigning Interventions to Students

Track implementation and monitor progress.

## Assignment Process

1. Select an intervention
2. Click "Assign to Student"
3. Choose the student
4. Set start date
5. Select who will deliver it
6. Set frequency (e.g., 3x per week)
7. Add any notes
8. Click "Assign Intervention"

## Tracking Implementation

Monitor:
- **Sessions Completed**: Track delivery
- **Fidelity**: Ensure adherence to protocol
- **Student Engagement**: Monitor participation
- **Progress Data**: Record outcomes

## Progress Monitoring

- Weekly progress checks
- Mid-intervention reviews
- End-of-intervention assessment
- Data visualization charts

## Making Adjustments

If progress is slow:
- Increase frequency
- Adjust group size
- Try alternative intervention
- Provide additional support`,
      search_keywords: ['assign', 'tracking', 'implementation', 'progress', 'monitoring'],
      page_context: ['/interventions'],
    },

    // EHCP
    {
      category_id: ehcp.id,
      title: 'Creating Your First EHCP',
      slug: 'creating-first-ehcp',
      excerpt: 'Step-by-step guide to EHCP creation',
      content: `# Creating Your First EHCP

Streamline EHCP creation with intelligent templates.

## Starting an EHCP

1. Navigate to EHCPs section
2. Click "Create New EHCP"
3. Select template (Standard, Annual Review, or Transition)
4. Enter student information
5. Begin completing sections

## EHCP Sections

### Section A: Views of Child/Young Person
Record the child's own perspective

### Section B: Special Educational Needs
Detail specific learning difficulties

### Section C: Health Needs
Include relevant health information

### Section D: Social Care Needs
Document social care requirements

### Section E: Outcomes
Set SMART outcomes (Specific, Measurable, Achievable, Relevant, Time-bound)

### Section F: Provision
Detail specific support and interventions

### Section I: Placement
Specify educational setting

## Tips for Quality EHCPs

- Use clear, specific language
- Avoid jargon
- Include quantifiable outcomes
- Link provision to needs
- Specify frequency and duration
- Include review arrangements`,
      search_keywords: ['ehcp', 'creating', 'sections', 'template', 'guide'],
      page_context: ['/ehcp', '/ehcp/new'],
      is_featured: true,
    },

    // TRAINING
    {
      category_id: training.id,
      title: 'Enrolling in CPD Courses',
      slug: 'enrolling-cpd-courses',
      excerpt: 'How to access professional development',
      content: `# Enrolling in CPD Courses

Access high-quality professional development courses.

## Course Catalog

Browse courses on:
- ADHD Understanding & Support
- Dyslexia Intervention Strategies
- Autism Spectrum Support
- Working Memory Training
- Behavior Management
- And more...

## Course Features

Each course includes:
- 8 comprehensive modules
- Interactive quizzes
- Real-world case studies
- Downloadable resources
- 12 CPD hours
- Professional certificate

## Enrollment Process

1. Browse course catalog
2. Click on a course
3. Review course outline
4. Click "Enroll Now"
5. Complete payment (if required)
6. Start learning immediately

## Earning Your Certificate

1. Complete all modules
2. Pass end-of-module quizzes (70% required)
3. Complete final assessment
4. Download your CPD certificate

Certificates are recognized by:
- British Psychological Society (BPS)
- Health and Care Professions Council (HCPC)`,
      search_keywords: ['cpd', 'training', 'courses', 'professional development', 'certificate'],
      page_context: ['/training', '/training/marketplace'],
    },

    // TECHNICAL
    {
      category_id: technical.id,
      title: 'Troubleshooting Common Issues',
      slug: 'troubleshooting',
      excerpt: 'Solutions to frequent problems',
      content: `# Troubleshooting Common Issues

Quick solutions to common problems.

## Login Issues

**Problem**: Can't log in
**Solution**:
1. Check email address is correct
2. Try password reset
3. Clear browser cache
4. Try different browser

## Report Generation Issues

**Problem**: Report won't download
**Solution**:
1. Check all sections are complete
2. Disable pop-up blocker
3. Try different browser
4. Contact support if issue persists

## Slow Performance

**Problem**: Platform is slow
**Solution**:
1. Close unnecessary browser tabs
2. Clear browser cache
3. Check internet connection
4. Try during off-peak hours

## Missing Data

**Problem**: Can't find saved work
**Solution**:
1. Check "Draft" section
2. Verify correct case selected
3. Check date filters
4. Contact support for data recovery

## Browser Compatibility

Supported browsers:
- Chrome (recommended)
- Firefox
- Safari
- Edge

Not supported:
- Internet Explorer`,
      search_keywords: ['troubleshooting', 'problems', 'issues', 'help', 'support'],
      page_context: [],
    },
  ];

  // Create all articles
  for (const article of articles) {
    await prisma.helpArticle.upsert({
      where: { slug: article.slug },
      update: {},
      create: {
        ...article,
        author: 'Dr Scott I-Patrick',
        published_at: new Date(),
      },
    });
  }

  // Create FAQs
  const faqs = [
    {
      question: 'How long does a typical assessment take?',
      answer: 'An ECCA assessment typically takes 45-60 minutes for direct observation, plus time for collaborative input and report generation. The entire process from start to final report can be completed in 2-3 hours.',
      category: 'Assessments',
      order_index: 1,
    },
    {
      question: 'Are the interventions evidence-based?',
      answer: 'Yes! All 69 interventions in our library are backed by peer-reviewed research. Each includes effect sizes, success rates, and research citations. We only include interventions with at least "Promising" evidence ratings.',
      category: 'Interventions',
      order_index: 2,
    },
    {
      question: 'Can I customize EHCP templates?',
      answer: 'Yes, all EHCP templates can be customized to match your Local Authority\'s specific requirements. Contact your account administrator to set up custom templates.',
      category: 'EHCP',
      order_index: 3,
    },
    {
      question: 'Are CPD certificates recognized?',
      answer: 'Yes, our CPD certificates are recognized by the British Psychological Society (BPS) and the Health and Care Professions Council (HCPC).',
      category: 'Training',
      order_index: 4,
    },
    {
      question: 'How secure is student data?',
      answer: 'We take data security extremely seriously. All data is encrypted at rest and in transit, we\'re GDPR compliant, and undergo regular security audits. We never share data with third parties.',
      category: 'Technical',
      order_index: 5,
    },
    {
      question: 'Can I export my data?',
      answer: 'Yes, you can export all your data in standard formats (PDF, CSV, Excel). Go to Settings > Data Export to download your complete data archive.',
      category: 'Technical',
      order_index: 6,
    },
    {
      question: 'What is Battle Royale?',
      answer: 'Battle Royale is our gamification system that makes professional development fun. Earn merits by completing tasks, join squad competitions, and unlock achievement badges. It\'s entirely optional and designed to increase engagement.',
      category: 'General',
      order_index: 7,
    },
    {
      question: 'How do I invite team members?',
      answer: 'Go to Settings > Team Management > Invite Members. Enter their email addresses and select their roles. They\'ll receive an invitation to join your organization.',
      category: 'General',
      order_index: 8,
    },
  ];

  for (const faq of faqs) {
    await prisma.helpFAQ.create({
      data: faq,
    });
  }

  console.log('✓ Help Center seeded successfully!');
  console.log(`  - ${categories.length} categories created`);
  console.log(`  - ${articles.length} articles created`);
  console.log(`  - ${faqs.length} FAQs created`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
