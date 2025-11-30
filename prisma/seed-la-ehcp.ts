/**
 * Seed Script: LA EHCP Demo Data
 * 
 * Creates realistic demonstration data for the LA EHCP management system.
 * Run with: npx tsx prisma/seed-la-ehcp.ts
 */

import { PrismaClient, SENPrimaryNeed } from '@prisma/client';

const prisma = new PrismaClient();

// Simple date helper functions
const addWeeks = (date: Date, weeks: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + weeks * 7);
  return result;
};

const subWeeks = (date: Date, weeks: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() - weeks * 7);
  return result;
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Generate reference numbers
const generateReferenceNumber = (index: number): string => {
  const year = new Date().getFullYear();
  return `LA-${year}-${String(index).padStart(5, '0')}`;
};

// Random item helper
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Demo data
const CHILD_FIRST_NAMES = ['Oliver', 'Amelia', 'Noah', 'Isla', 'George', 'Ava', 'Harry', 'Mia', 'Jack', 'Emily'];
const CHILD_LAST_NAMES = ['Smith', 'Jones', 'Williams', 'Brown', 'Taylor', 'Davies', 'Wilson', 'Evans', 'Thomas', 'Johnson'];
const SCHOOLS = [
  'Riverside Primary School',
  'Oak Tree Academy',
  'St Mary\'s C of E Primary',
  'Hillside Community School',
];
const PRIMARY_NEEDS: SENPrimaryNeed[] = [
  SENPrimaryNeed.SPLD,
  SENPrimaryNeed.SLCN,
  SENPrimaryNeed.SEMH,
  SENPrimaryNeed.ASD,
  SENPrimaryNeed.MLD
];

async function main() {
  console.log('🏛️ Seeding LA EHCP Demo Data...\n');
  
  // First, ensure we have an LA tenant
  let laTenant = await prisma.tenants.findFirst({
    where: { tenant_type: 'LA' },
  });
  
  if (!laTenant) {
    console.log('Creating Local Authority tenant...');
    laTenant = await prisma.tenants.create({
      data: {
        name: 'Demo Local Authority',
        subdomain: 'demo-la',
        tenant_type: 'LA',
        la_code: 'DLA001',
        settings: {
          region: 'South East',
          ehcpConfig: {
            autoAssign: false,
            defaultDeadlines: { week6: 6, week16: 16, week20: 20 },
          },
        },
      },
    });
    console.log(`✅ Created LA tenant: ${laTenant.name} (ID: ${laTenant.id})`);
  } else {
    console.log(`✅ Using existing LA tenant: ${laTenant.name} (ID: ${laTenant.id})`);
  }
  
  // Create demo schools under the LA
  const schoolTenants: typeof laTenant[] = [];
  for (const schoolName of SCHOOLS) {
    let school = await prisma.tenants.findFirst({
      where: { name: schoolName },
    });
    
    if (!school) {
      school = await prisma.tenants.create({
        data: {
          name: schoolName,
          subdomain: schoolName.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30),
          tenant_type: 'SCHOOL',
          parent_tenant_id: laTenant.id,
          settings: { phase: schoolName.includes('Primary') ? 'PRIMARY' : 'SECONDARY' },
        },
      });
      console.log(`✅ Created school: ${school.name} (ID: ${school.id})`);
    } else {
      console.log(`✅ Using existing school: ${school.name} (ID: ${school.id})`);
    }
    schoolTenants.push(school);
  }
  
  // Create demo users
  type UserInfo = { id: number; name: string; role: string; email: string };
  const users: UserInfo[] = [];
  
  const demoUsers = [
    { name: 'Sarah Thompson', role: 'LA_CASEWORKER', email: 'sarah.thompson@demo-la.gov.uk' },
    { name: 'James Mitchell', role: 'LA_CASEWORKER', email: 'james.mitchell@demo-la.gov.uk' },
    { name: 'Emma Collins', role: 'LA_MANAGER', email: 'emma.collins@demo-la.gov.uk' },
    { name: 'Dr. Rachel Green', role: 'EP', email: 'rachel.green@ep-service.co.uk' },
    { name: 'Dr. Michael Foster', role: 'EP', email: 'michael.foster@ep-service.co.uk' },
    { name: 'Dr. Amanda Hughes', role: 'HEALTH', email: 'amanda.hughes@nhs.net' },
    { name: 'David Chen', role: 'SOCIAL_WORKER', email: 'david.chen@socialservices.gov.uk' },
    { name: 'Lisa Williams', role: 'SENCO', email: 'l.williams@riverside.edu' },
  ];
  
  for (const userData of demoUsers) {
    let user = await prisma.users.findFirst({
      where: { email: userData.email },
    });
    
    if (!user) {
      const tenantId = userData.role.startsWith('LA') || userData.role === 'LA_MANAGER' 
        ? laTenant.id 
        : userData.role === 'SENCO' 
          ? schoolTenants[0].id 
          : laTenant.id;
      
      user = await prisma.users.create({
        data: {
          name: userData.name,
          email: userData.email,
          role: userData.role,
          password_hash: '$2a$10$DemoPasswordHashForSeedingPurposesOnly',
          tenant_id: tenantId,
          isEmailVerified: true,
        },
      });
      console.log(`✅ Created user: ${user.name} (${user.role})`);
    } else {
      console.log(`✅ Using existing user: ${user.name} (${user.role})`);
    }
    users.push({ id: user.id, name: user.name || '', role: user.role || '', email: user.email || '' });
  }
  
  // Create demo student
  let demoStudent = await prisma.students.findFirst({
    where: { unique_id: 'demo-student-001' },
  });
  
  if (!demoStudent) {
    demoStudent = await prisma.students.create({
      data: {
        unique_id: 'demo-student-001',
        first_name: 'Demo',
        last_name: 'Student',
        date_of_birth: new Date('2015-05-15'),
        year_group: '5',
        tenant_id: schoolTenants[0].id,
      },
    });
    console.log(`✅ Created demo student: ${demoStudent.first_name} ${demoStudent.last_name}`);
  }
  
  // Create EHCP Applications
  console.log('\n📝 Creating EHCP applications...\n');
  
  const caseworkers = users.filter(u => u.role === 'LA_CASEWORKER');
  const eps = users.filter(u => u.role === 'EP');
  const healthPros = users.filter(u => u.role === 'HEALTH');
  const socialWorkers = users.filter(u => u.role === 'SOCIAL_WORKER');
  
  // Application configurations - using actual schema enum values
  const appConfigs = [
    { weeksOld: 1, status: 'SUBMITTED', urgency: 'STANDARD' },
    { weeksOld: 2, status: 'EVIDENCE_GATHERING', urgency: 'STANDARD' },
    { weeksOld: 5, status: 'PANEL_REVIEW_PENDING', urgency: 'URGENT_SCHOOL_PLACEMENT' },
    { weeksOld: 7, status: 'DECISION_TO_ASSESS', urgency: 'STANDARD' },
    { weeksOld: 10, status: 'AWAITING_EP_ASSESSMENT', urgency: 'STANDARD' },
    { weeksOld: 14, status: 'ALL_ADVICE_RECEIVED', urgency: 'URGENT_SCHOOL_PLACEMENT' },
    { weeksOld: 16, status: 'DRAFT_IN_PROGRESS', urgency: 'STANDARD' },
    { weeksOld: 18, status: 'CONSULTATION_PARENT_SENT', urgency: 'STANDARD' },
    { weeksOld: 7, status: 'PANEL_REVIEW_PENDING', urgency: 'URGENT_SAFEGUARDING' }, // Should have been decided
    { weeksOld: 19, status: 'AWAITING_EP_ASSESSMENT', urgency: 'URGENT_TRIBUNAL_DEADLINE' }, // Very late
  ];
  
  let createdCount = 0;
  
  for (let i = 0; i < appConfigs.length; i++) {
    const config = appConfigs[i];
    const refNum = generateReferenceNumber(1000 + i);
    
    // Check if exists
    const existing = await prisma.eHCPApplication.findFirst({
      where: { la_reference: refNum },
    });
    
    if (existing) {
      console.log(`⏭️ ${refNum} already exists`);
      continue;
    }
    
    const referralDate = subWeeks(new Date(), config.weeksOld);
    const firstName = randomItem(CHILD_FIRST_NAMES);
    const lastName = randomItem(CHILD_LAST_NAMES);
    const school = randomItem(schoolTenants);
    const caseworker = randomItem(caseworkers);
    const ep = randomItem(eps);
    const health = randomItem(healthPros);
    const social = randomItem(socialWorkers);
    
    const decisionMade = config.weeksOld >= 6 && 
      !['SUBMITTED', 'EVIDENCE_GATHERING', 'PANEL_REVIEW_PENDING'].includes(config.status);
    
    // Create application
    const app = await prisma.eHCPApplication.create({
      data: {
        la_reference: refNum,
        la_tenant_id: laTenant.id,
        school_tenant_id: school.id,
        student_id: demoStudent.id.toString(), // Convert to string as schema expects
        child_name: `${firstName} ${lastName}`,
        child_dob: new Date(2015 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), 15),
        child_upn: `A${String(1000000000 + i).padStart(12, '0')}`,
        primary_need: randomItem(PRIMARY_NEEDS),
        secondary_needs: [],
        request_type: 'initial',
        requested_by: randomItem(['parent', 'school']),
        requester_name: 'Lisa Williams',
        requester_email: 'l.williams@riverside.edu',
        request_reason: `${firstName} requires additional support due to learning difficulties.`,
        referral_date: referralDate,
        decision_due_date: addWeeks(referralDate, 6),
        draft_due_date: addWeeks(referralDate, 16),
        final_due_date: addWeeks(referralDate, 20),
        status: config.status as any,
        urgency: config.urgency as any,
        current_week: config.weeksOld,
        is_overdue: (config.status === 'PANEL_REVIEW_PENDING' && config.weeksOld > 6),
        days_overdue: config.weeksOld > 20 ? (config.weeksOld - 20) * 7 : 0,
        decision_to_assess: decisionMade ? true : null,
        decision_reason: decisionMade ? 'Assessment agreed.' : null,
        decision_actual_date: decisionMade ? addWeeks(referralDate, 6) : null,
        decision_made_by_id: decisionMade ? caseworker.id : null,
        caseworker_id: caseworker.id,
        assigned_ep_id: decisionMade ? ep.id : null,
        assigned_health_id: decisionMade ? health.id : null,
        assigned_social_id: decisionMade ? social.id : null,
        school_contribution_status: decisionMade ? 'submitted' : 'pending',
        ep_contribution_status: decisionMade && config.weeksOld >= 12 ? 'submitted' : 'pending',
        health_contribution_status: decisionMade && config.weeksOld >= 11 ? 'submitted' : 'pending',
        social_contribution_status: decisionMade && config.weeksOld >= 13 ? 'submitted' : 'pending',
        statutory_compliant: !(config.weeksOld > 6 && config.status === 'PANEL_REVIEW_PENDING'),
        created_by_id: caseworker.id,
        last_updated_by_id: caseworker.id,
      },
    });
    
    console.log(`✅ Created: ${refNum} (${config.status}, Week ${config.weeksOld})`);
    createdCount++;
    
    // Create timeline events
    await prisma.eHCPTimelineEvent.create({
      data: {
        application_id: app.id,
        event_type: 'APPLICATION_SUBMITTED',
        event_category: 'administrative',
        event_description: `Application submitted by ${school.name}`,
        triggered_by_id: caseworker.id,
        occurred_at: referralDate,
      },
    });
    
    await prisma.eHCPTimelineEvent.create({
      data: {
        application_id: app.id,
        event_type: 'CASEWORKER_ASSIGNED',
        event_category: 'administrative',
        event_description: `Assigned to ${caseworker.name}`,
        triggered_by_id: caseworker.id,
        occurred_at: addDays(referralDate, 2),
      },
    });
    
    if (decisionMade) {
      await prisma.eHCPTimelineEvent.create({
        data: {
          application_id: app.id,
          event_type: 'DECISION_TO_ASSESS',
          event_category: 'decision',
          event_description: 'Decision to assess agreed',
          triggered_by_id: caseworker.id,
          occurred_at: addWeeks(referralDate, 6),
        },
      });
    }
    
    // Create contributions for assessment phase
    if (decisionMade && ['AWAITING_EP_ASSESSMENT', 'ALL_ADVICE_RECEIVED', 'DRAFT_IN_PROGRESS', 'CONSULTATION_PARENT_SENT'].includes(config.status)) {
      await prisma.eHCPContribution.create({
        data: {
          application_id: app.id,
          contributor_type: 'ep',
          contributor_id: ep.id,
          contributor_name: ep.name,
          contributor_role: 'Educational Psychologist',
          contributor_org: 'EP Services',
          section_type: 'B',
          content: {
            cognition: 'Working memory identified as relative weakness.',
            recommendations: ['Multi-sensory teaching', 'Pre-teaching vocabulary'],
          },
          status: config.weeksOld >= 12 ? 'submitted' : 'draft',
          due_date: addWeeks(referralDate, 14),
          submitted_at: config.weeksOld >= 12 ? addWeeks(referralDate, 12) : null,
        },
      });
      
      await prisma.eHCPContribution.create({
        data: {
          application_id: app.id,
          contributor_type: 'health',
          contributor_id: health.id,
          contributor_name: health.name,
          contributor_role: 'Paediatrician',
          contributor_org: 'NHS Trust',
          section_type: 'C',
          content: {
            medical_history: 'No significant medical conditions.',
            recommendations: ['OT assessment recommended'],
          },
          status: config.weeksOld >= 11 ? 'submitted' : 'draft',
          due_date: addWeeks(referralDate, 14),
          submitted_at: config.weeksOld >= 11 ? addWeeks(referralDate, 11) : null,
        },
      });
    }
  }
  
  console.log('\n✨ LA EHCP Demo Data seeding complete!');
  console.log('\n📊 Summary:');
  console.log(`   - LA Tenant ID: ${laTenant.id}`);
  console.log(`   - ${schoolTenants.length} School tenants`);
  console.log(`   - ${users.length} Demo users`);
  console.log(`   - ${createdCount} EHCP applications created`);
  console.log('\n🔗 Access Points:');
  console.log(`   - LA Dashboard: /la/dashboard`);
  console.log(`   - Professional Portal: /professional/portal`);
  console.log(`   - School EHCP Request: /school/ehcp-request`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
