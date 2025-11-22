import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Help Center...');

  // 1. Create Categories
  const categories = [
    {
      name: 'Getting Started',
      slug: 'getting-started',
      description: 'New to EdPsych Connect? Start here.',
      icon: 'Zap',
      order_index: 1,
      articles: [
        {
          title: 'Platform Overview',
          slug: 'platform-overview',
          excerpt: 'A high-level tour of the EdPsych Connect platform features.',
          content: `
# Platform Overview

Welcome to EdPsych Connect! This platform is designed to streamline the workflow of Educational Psychologists and SENCOs.

## Key Features

### 1. Dashboard
Your central hub for all activities. View upcoming assessments, recent reports, and quick stats.

### 2. Case Management
Track students, referrals, and interventions in one place.

### 3. Report Generation
Use our AI-assisted tools to draft comprehensive reports in minutes, not hours.

### 4. Interventions
Browse our library of evidence-based interventions and track their fidelity and impact.
          `
        },
        {
          title: 'Setting up your account',
          slug: 'account-setup',
          excerpt: 'How to configure your profile and preferences.',
          content: `
# Setting Up Your Account

## Profile Settings
Navigate to Settings > Profile to update your personal information and qualifications.

## Notification Preferences
Choose how and when you want to be notified about case updates and system alerts.

## Security
Enable Two-Factor Authentication (2FA) for enhanced security.
          `
        },
        {
          title: 'Your first assessment',
          slug: 'first-assessment',
          excerpt: 'Step-by-step guide to conducting your first assessment.',
          content: `
# Your First Assessment

1. **Create a Case**: Go to Cases > New Case.
2. **Select Student**: Choose an existing student or add a new one.
3. **Schedule Assessment**: Pick a date and time.
4. **Input Data**: Use the assessment forms to record observations and test scores.
5. **Generate Report**: Click "Generate Report" to create a draft.
          `
        }
      ]
    },
    {
      name: 'Assessments & Reports',
      slug: 'assessments-reports',
      description: 'Guides for ECCA assessments and reporting.',
      icon: 'FileText',
      order_index: 2,
      articles: [
        {
          title: 'Using the ECCA Framework',
          slug: 'ecca-framework',
          excerpt: 'Understanding the ECCA assessment model.',
          content: `
# The ECCA Framework

ECCA stands for **E**motional, **C**ognitive, **C**ontextual, and **A**cademic assessment.

## Emotional
Assessing the student's emotional wellbeing and resilience.

## Cognitive
Evaluating cognitive processing, memory, and reasoning.

## Contextual
Understanding the home and school environment.

## Academic
Measuring attainment in core subjects.
          `
        },
        {
          title: 'Generating Reports',
          slug: 'generating-reports',
          excerpt: 'How to use the AI report generator.',
          content: `
# Generating Reports

Our AI report generator takes your raw data and observations and turns them into a professional report.

1. **Review Data**: Ensure all assessment data is entered correctly.
2. **Select Template**: Choose from Standard, Statutory, or Summary templates.
3. **Generate**: Click the magic wand icon.
4. **Edit**: Review the generated text and make necessary adjustments.
5. **Finalize**: Lock the report for distribution.
          `
        }
      ]
    },
    {
      name: 'Interventions',
      slug: 'interventions',
      description: 'Browse and implement interventions.',
      icon: 'Book',
      order_index: 3,
      articles: [
        {
          title: 'Intervention Library Guide',
          slug: 'intervention-library',
          excerpt: 'How to find the right intervention for your student.',
          content: `
# Intervention Library

Our library contains over 500 evidence-based interventions.

## Searching
Use filters for Age, Area of Need (e.g., Literacy, SEMH), and Tier (1, 2, or 3).

## Implementation
Each intervention comes with a "How-to" guide and resource list.
          `
        }
      ]
    },
    {
      name: 'Account & Security',
      slug: 'account-security',
      description: 'Manage your profile and security settings.',
      icon: 'Shield',
      order_index: 4,
      articles: [
        {
          title: 'Password & Security',
          slug: 'security',
          excerpt: 'Best practices for keeping your account safe.',
          content: `
# Password & Security

## Password Requirements
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, and symbols

## Session Management
You can view and revoke active sessions from the Security tab.
          `
        }
      ]
    }
  ];

  for (const cat of categories) {
    const category = await prisma.helpCategory.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        order_index: cat.order_index,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        order_index: cat.order_index,
      },
    });

    console.log(`Created category: ${category.name}`);

    for (const art of cat.articles) {
      await prisma.helpArticle.upsert({
        where: { slug: art.slug },
        update: {
          title: art.title,
          excerpt: art.excerpt,
          content: art.content,
          category_id: category.id,
          is_published: true,
        },
        create: {
          title: art.title,
          slug: art.slug,
          excerpt: art.excerpt,
          content: art.content,
          category_id: category.id,
          is_published: true,
        },
      });
      console.log(`  - Created article: ${art.title}`);
    }
  }

  // 2. Create FAQs
  const faqs = [
    {
      question: 'How do I reset my password?',
      answer: 'Go to the login page and click "Forgot Password". Follow the instructions sent to your email.',
      category: 'Account',
      order_index: 1,
    },
    {
      question: 'Can I export reports to Word?',
      answer: 'Yes, all reports can be exported to PDF or Microsoft Word formats.',
      category: 'Reports',
      order_index: 2,
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. We use bank-grade encryption and are fully GDPR compliant.',
      category: 'Security',
      order_index: 3,
    },
  ];

  for (const faq of faqs) {
    await prisma.helpFAQ.create({
      data: {
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        order_index: faq.order_index,
      },
    });
  }
  console.log(`Created ${faqs.length} FAQs`);

  console.log('✅ Help Center seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
