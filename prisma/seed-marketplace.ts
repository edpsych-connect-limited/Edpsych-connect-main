
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Marketplace Professionals...');

  // Create a tenant for professionals if not exists
  let tenant = await prisma.tenants.findFirst({
    where: { name: 'Marketplace Professionals' }
  });

  if (!tenant) {
    tenant = await prisma.tenants.create({
      data: {
        name: 'Marketplace Professionals',
        subdomain: 'marketplace-pros',
        tenant_type: 'SCHOOL', // Using SCHOOL as generic type for now
      }
    });
  }

  // IMPORTANT: Only real, verified professionals should be listed in production
  // Dr Scott Ighavongbe-Patrick is the platform founder and featured professional
  // Other entries are marked as [DEMO DATA] for beta testing purposes only
  const professionalsData = [
    {
      name: 'Dr Scott Ighavongbe-Patrick',
      email: 'scott@edpsychconnect.world',
      bio: 'Dr Scott Ighavongbe-Patrick DEdPsych CPsychol is the founder of EdPsych Connect World. First Class Honours in Psychology (Buckinghamshire New University), Doctorate in Educational Psychology (University of Southampton). Former Senior Educational Psychologist at Buckinghamshire Council (until 2023), where he conceived and named TEAM-UP (Termly Early Action Multi-Agency Unified Planning)—an initiative developed through collaborative multi-agency effort. Currently practising as Locum Consultant EP for Suffolk, Leicestershire (Quality Assessment EP), Worcestershire, and Hertfordshire. Previously Maingrade EP at Achieving for Children (2016-2019). HCPC Registered with SDS clinical supervision accreditation. Expertise spans exclusions, restorative justice, SEMH, autism, and trauma-informed practice across early years to college education.',
      location: 'Buckinghamshire',
      specialties: ['Restorative Justice', 'Exclusions', 'SEMH', 'Autism', 'Trauma-Informed Practice', 'EHCP Assessments', 'Multi-Agency Working'],
      hourlyRate: 150,
      laPanelStatus: 'APPROVED',
      regions: ['Buckinghamshire', 'Hertfordshire', 'Leicestershire', 'Worcestershire', 'Suffolk', 'London', 'South East'],
      rating: 5.0,
      reviews: 127,
      imageUrl: '/images/dr-scott-marketplace.jpg',
      isFeatured: true,
      isVerified: true
    },
    {
      name: '[DEMO] EP Profile Example - London',
      email: 'demo-london@example.test',
      bio: '[DEMO DATA - For Beta Testing Only] This is a demonstration profile showing how Educational Psychologists appear in the marketplace. Real professionals will have verified credentials and genuine reviews.',
      location: 'London',
      specialties: ['Autism', 'Early Years', 'Dyslexia'],
      hourlyRate: 120,
      laPanelStatus: 'PENDING',
      regions: ['London', 'South East'],
      rating: 0,
      reviews: 0,
      isDemo: true
    },
    {
      name: '[DEMO] EP Profile Example - Manchester',
      email: 'demo-manchester@example.test',
      bio: '[DEMO DATA - For Beta Testing Only] This is a demonstration profile showing how Educational Psychologists appear in the marketplace. Real professionals will have verified credentials and genuine reviews.',
      location: 'Manchester',
      specialties: ['SEMH', 'Behavioural Support', 'Staff Training'],
      hourlyRate: 100,
      laPanelStatus: 'PENDING',
      regions: ['North West', 'Manchester'],
      rating: 0,
      reviews: 0,
      isDemo: true
    },
    {
      name: '[DEMO] EP Profile Example - Birmingham',
      email: 'demo-birmingham@example.test',
      bio: '[DEMO DATA - For Beta Testing Only] This is a demonstration profile showing how Educational Psychologists appear in the marketplace. Real professionals will have verified credentials and genuine reviews.',
      location: 'Birmingham',
      specialties: ['Cognitive Assessments', 'Exam Access', 'Dyspraxia'],
      hourlyRate: 110,
      laPanelStatus: 'PENDING',
      regions: ['West Midlands', 'Birmingham'],
      rating: 0,
      reviews: 0,
      isDemo: true
    }
  ];

  for (const pro of professionalsData) {
    const passwordHash = await hash('Password123!', 12);
    
    // Create or update user
    const user = await prisma.users.upsert({
      where: { email: pro.email },
      update: {},
      create: {
        email: pro.email,
        name: pro.name,
        password_hash: passwordHash,
        role: 'PROFESSIONAL',
        tenant_id: tenant.id,
        is_active: true,
        onboarding_completed: true
      }
    });

    // Create or update Marketplace Profile
    await prisma.marketplaceProfessional.upsert({
      where: { userId: user.id },
      update: {
        bio: pro.bio,
        specialties: pro.specialties,
        hourlyRate: pro.hourlyRate,
        la_panel_status: pro.laPanelStatus,
        la_panel_regions: pro.regions,
        rating: pro.rating,
        reviewCount: pro.reviews
      },
      create: {
        userId: user.id,
        bio: pro.bio,
        specialties: pro.specialties,
        hourlyRate: pro.hourlyRate,
        la_panel_status: pro.laPanelStatus,
        la_panel_regions: pro.regions,
        rating: pro.rating,
        reviewCount: pro.reviews
      }
    });

    // Ensure compliance record exists
    await prisma.professionalCompliance.upsert({
      where: { userId: user.id },
      update: {
        verificationStatus: pro.laPanelStatus === 'APPROVED' ? 'VERIFIED' : 'PENDING'
      },
      create: {
        userId: user.id,
        verificationStatus: pro.laPanelStatus === 'APPROVED' ? 'VERIFIED' : 'PENDING'
      }
    });

    console.log(`Seeded professional: ${pro.name}`);
  }

  console.log('Marketplace seeding completed.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
