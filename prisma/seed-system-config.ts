import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting System Configuration Seed...');

  // ============================================================================
  // 1. TIER CONFIGURATION
  // ============================================================================
  console.log('📦 Seeding Tier Configurations...');

  const tiers = [
    {
      tier: 'FREE',
      maxSchools: 1,
      maxUsers: 1,
      maxStorage: 100, // 100MB
      features: [
        'BASIC_ANALYTICS',
        'PARENT_PORTAL',
        'EMAIL_SUPPORT'
      ],
      limits: {
        ai_requests_per_day: 10,
        students_per_user: 30,
        storage_gb: 0.1
      }
    },
    {
      tier: 'PRO',
      maxSchools: 1,
      maxUsers: 5,
      maxStorage: 1024, // 1GB
      features: [
        'BASIC_ANALYTICS',
        'ADVANCED_ANALYTICS',
        'PARENT_PORTAL',
        'EMAIL_SUPPORT',
        'PRIORITY_SUPPORT',
        'CUSTOM_REPORTS',
        'INTERVENTION_TRACKING'
      ],
      limits: {
        ai_requests_per_day: 100,
        students_per_user: 100,
        storage_gb: 1.0
      }
    },
    {
      tier: 'INSTITUTIONAL',
      maxSchools: 10,
      maxUsers: 100,
      maxStorage: 10240, // 10GB
      features: [
        'BASIC_ANALYTICS',
        'ADVANCED_ANALYTICS',
        'PARENT_PORTAL',
        'EMAIL_SUPPORT',
        'PRIORITY_SUPPORT',
        'PHONE_SUPPORT',
        'CUSTOM_REPORTS',
        'INTERVENTION_TRACKING',
        'TEAM_COLLABORATION',
        'API_ACCESS',
        'SINGLE_SIGN_ON'
      ],
      limits: {
        ai_requests_per_day: 1000,
        students_per_user: 1000,
        storage_gb: 10.0
      }
    },
    {
      tier: 'LA_ENTERPRISE',
      maxSchools: 1000, // Unlimited effectively
      maxUsers: 10000,
      maxStorage: 102400, // 100GB
      features: [
        'ALL_FEATURES',
        'BYOD_DATABASE',
        'DEDICATED_CSM',
        'SLA_GOLD',
        'MARKETPLACE_DISCOUNT',
        'WHITE_LABEL',
        'CUSTOM_AI_MODELS'
      ],
      limits: {
        ai_requests_per_day: 10000,
        students_per_user: 10000,
        storage_gb: 100.0
      }
    }
  ];

  for (const tier of tiers) {
    await prisma.tierConfiguration.upsert({
      where: { tier: tier.tier },
      update: {
        maxSchools: tier.maxSchools,
        maxUsers: tier.maxUsers,
        maxStorage: tier.maxStorage,
        features: tier.features,
        limits: tier.limits
      },
      create: {
        tier: tier.tier,
        maxSchools: tier.maxSchools,
        maxUsers: tier.maxUsers,
        maxStorage: tier.maxStorage,
        features: tier.features,
        limits: tier.limits
      }
    });
    console.log(`   ✅ Tier seeded: ${tier.tier}`);
  }

  // ============================================================================
  // 2. SYSTEM CONFIGURATION (AI Templates & Global Settings)
  // ============================================================================
  console.log('⚙️  Seeding System Configuration...');

  const systemConfigs = [
    {
      key: 'ai_challenge_templates',
      description: 'Templates for AI-generated challenges',
      value: {
        templates: [
          {
            id: 'math_challenge_001',
            type: 'math',
            difficulty: 'medium',
            template: 'Create a math problem involving {topic} suitable for year {yearGroup}.'
          },
          {
            id: 'literacy_challenge_001',
            type: 'literacy',
            difficulty: 'hard',
            template: 'Write a short story starter about {topic} using {vocabulary_list}.'
          },
          {
            id: 'science_challenge_001',
            type: 'science',
            difficulty: 'easy',
            template: 'Explain {concept} in simple terms for a {yearGroup} student.'
          }
        ]
      }
    },
    {
      key: 'global_settings',
      description: 'Global system settings',
      value: {
        maintenance_mode: false,
        allow_registrations: true,
        default_language: 'en',
        support_email: 'support@edpsychconnect.com'
      }
    },
    {
      key: 'feature_flags',
      description: 'Global feature flags',
      value: {
        enable_ai_chat: true,
        enable_battle_royale: true,
        enable_marketplace: false
      }
    }
  ];

  for (const config of systemConfigs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: {
        value: config.value,
        description: config.description
      },
      create: {
        key: config.key,
        value: config.value,
        description: config.description
      }
    });
    console.log(`   ✅ Config seeded: ${config.key}`);
  }

  console.log('🎉 System Configuration Seed Completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding system config:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
