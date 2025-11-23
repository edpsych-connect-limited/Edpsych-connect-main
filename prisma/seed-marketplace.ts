
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

  const professionalsData = [
    {
      name: 'Dr. Sarah Jenkins',
      email: 'sarah.jenkins@example.com',
      bio: 'Experienced Educational Psychologist specializing in autism and early years intervention. Over 15 years of experience working with local authorities and private schools.',
      location: 'London',
      specialties: ['Autism', 'Early Years', 'Dyslexia'],
      hourlyRate: 120,
      laPanelStatus: 'APPROVED',
      regions: ['London', 'South East'],
      rating: 4.9,
      reviews: 24
    },
    {
      name: 'Mark Thompson',
      email: 'mark.thompson@example.com',
      bio: 'Chartered Psychologist with a focus on behavioral difficulties and SEMH. I provide comprehensive assessments and staff training.',
      location: 'Manchester',
      specialties: ['SEMH', 'Behavioral Support', 'Staff Training'],
      hourlyRate: 100,
      laPanelStatus: 'PENDING',
      regions: ['North West', 'Manchester'],
      rating: 4.7,
      reviews: 15
    },
    {
      name: 'Dr. Emily Chen',
      email: 'emily.chen@example.com',
      bio: 'Specialist in cognitive assessments and exam access arrangements. I work with secondary schools and colleges to support students with learning difficulties.',
      location: 'Birmingham',
      specialties: ['Cognitive Assessments', 'Exam Access', 'Dyspraxia'],
      hourlyRate: 110,
      laPanelStatus: 'APPROVED',
      regions: ['West Midlands', 'Birmingham'],
      rating: 4.8,
      reviews: 32
    },
    {
      name: 'James Wilson',
      email: 'james.wilson@example.com',
      bio: 'Educational Psychologist with expertise in trauma-informed practice and attachment. Available for individual casework and systemic work.',
      location: 'Bristol',
      specialties: ['Trauma', 'Attachment', 'Systemic Work'],
      hourlyRate: 115,
      laPanelStatus: 'NOT_APPLIED',
      regions: ['South West', 'Bristol'],
      rating: 4.6,
      reviews: 8
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
