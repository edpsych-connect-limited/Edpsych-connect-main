
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding research studies...');

  const user = await prisma.users.findFirst();
  if (!user) {
    console.log('No user found, skipping research seed.');
    return;
  }

  const studies = [
    {
      title: "Longitudinal Impact of Gamified CBT on Anxiety",
      description: "A study tracking the effectiveness of gamified cognitive behavioral therapy interventions.",
      objective: "To measure anxiety reduction in students using the platform.",
      methodology: "Randomised Controlled Trial",
      status: "Recruiting",
      is_public: true,
      ethics_approval: true,
      ethics_reference: "ETH-2025-001",
      start_date: new Date(),
      tenant_id: user.tenant_id,
      creator_id: user.id
    },
    {
      title: "ECCA Framework Validation in Secondary Schools",
      description: "Validating the Emotional, Cognitive, Creative, and Autonomy framework.",
      objective: "To confirm the reliability of ECCA assessments.",
      methodology: "Mixed Methods Longitudinal",
      status: "Data Collection",
      is_public: true,
      ethics_approval: true,
      ethics_reference: "ETH-2024-089",
      start_date: new Date(),
      tenant_id: user.tenant_id,
      creator_id: user.id
    },
    {
      title: "AI-Driven Pattern Recognition in Dyslexia Screening",
      description: "Using AI to identify early signs of dyslexia.",
      objective: "To improve early detection rates.",
      methodology: "Machine Learning Validation",
      status: "Analysis",
      is_public: true,
      ethics_approval: true,
      ethics_reference: "ETH-2024-156",
      start_date: new Date(),
      tenant_id: user.tenant_id,
      creator_id: user.id
    }
  ];

  for (const study of studies) {
    await prisma.research_studies.create({
      data: study
    });
  }

  console.log('Research studies seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
