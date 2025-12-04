/**
 * EHCP Module Seed Data
 * 
 * Comprehensive production-ready seed data for all EHCP LA modules:
 * - Mediation Cases
 * - Tribunal Cases
 * - Phase Transfers
 * - Annual Reviews
 * - Compliance Risk Predictions
 * - Provision Costs
 * - Funding Bands
 * - EHCP Cost Calculations
 * - Golden Thread Analyses
 * - SEN2 Return Data
 * 
 * All data based on realistic UK SEND Code of Practice scenarios.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to generate dates
const daysFromNow = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

async function seedFundingBands(laTenantId: number) {
  console.log('  Seeding Funding Bands...');
  
  const bands = [
    {
      la_tenant_id: laTenantId,
      band_code: 'A',
      band_name: 'Band A - Low Support',
      description: 'For children requiring minimal additional support above universal provision',
      annual_value: 6000,
      element_1: 4000,
      element_2: 2000,
      element_3: 0,
      typical_needs: ['MLD', 'SLCN'],
      complexity_level: 'low',
      academic_year: '2024-25',
      is_active: true,
    },
    {
      la_tenant_id: laTenantId,
      band_code: 'B',
      band_name: 'Band B - Moderate Support',
      description: 'For children requiring regular specialist input and targeted interventions',
      annual_value: 12000,
      element_1: 4000,
      element_2: 6000,
      element_3: 2000,
      typical_needs: ['SpLD', 'SEMH', 'SLCN'],
      complexity_level: 'medium',
      academic_year: '2024-25',
      is_active: true,
    },
    {
      la_tenant_id: laTenantId,
      band_code: 'C',
      band_name: 'Band C - Significant Support',
      description: 'For children requiring substantial additional support and specialist provision',
      annual_value: 18000,
      element_1: 4000,
      element_2: 6000,
      element_3: 8000,
      typical_needs: ['ASD', 'SEMH', 'SpLD'],
      complexity_level: 'high',
      academic_year: '2024-25',
      is_active: true,
    },
    {
      la_tenant_id: laTenantId,
      band_code: 'D',
      band_name: 'Band D - High Support',
      description: 'For children requiring intensive support, often including 1:1 provision',
      annual_value: 28000,
      element_1: 4000,
      element_2: 6000,
      element_3: 18000,
      typical_needs: ['ASD', 'PMLD', 'SLD', 'VI', 'HI'],
      complexity_level: 'very_high',
      academic_year: '2024-25',
      is_active: true,
    },
    {
      la_tenant_id: laTenantId,
      band_code: 'E',
      band_name: 'Band E - Exceptional Support',
      description: 'For children with most complex needs requiring exceptional packages',
      annual_value: 45000,
      element_1: 4000,
      element_2: 6000,
      element_3: 35000,
      typical_needs: ['PMLD', 'MSI', 'ASD'],
      complexity_level: 'very_high',
      academic_year: '2024-25',
      is_active: true,
    },
  ];

  for (const band of bands) {
    await prisma.fundingBand.upsert({
      where: {
        la_tenant_id_band_code_academic_year: {
          la_tenant_id: band.la_tenant_id,
          band_code: band.band_code,
          academic_year: band.academic_year,
        },
      },
      create: band,
      update: band,
    });
  }
  console.log('    ✓ Created 5 funding bands');
}

async function seedProvisionCosts(laTenantId: number) {
  console.log('  Seeding Provision Costs...');
  
  const provisions = [
    // Educational Psychology
    {
      la_tenant_id: laTenantId,
      provision_type: 'ep_assessment',
      provision_name: 'Educational Psychology Assessment',
      description: 'Statutory EP assessment for EHCP process',
      cost_model: 'per_session',
      unit_cost: 750,
      min_units: 1,
      max_units: 3,
      typical_units: 2,
      provider_type: 'la_internal',
      typical_providers: ['LA EP Service', 'Commissioned EP'],
      effective_from: new Date('2024-04-01'),
      is_active: true,
    },
    {
      la_tenant_id: laTenantId,
      provision_type: 'ep_consultation',
      provision_name: 'EP Consultation/Review',
      description: 'EP consultation for annual reviews or specific concerns',
      cost_model: 'hourly',
      unit_cost: 95,
      min_units: 1,
      max_units: 6,
      typical_units: 2,
      provider_type: 'la_internal',
      typical_providers: ['LA EP Service'],
      effective_from: new Date('2024-04-01'),
      is_active: true,
    },
    // Speech and Language
    {
      la_tenant_id: laTenantId,
      provision_type: 'salt_assessment',
      provision_name: 'Speech & Language Assessment',
      description: 'Comprehensive SALT assessment',
      cost_model: 'per_session',
      unit_cost: 420,
      min_units: 1,
      max_units: 2,
      typical_units: 1,
      provider_type: 'health',
      typical_providers: ['NHS SALT', 'Independent SALT'],
      effective_from: new Date('2024-04-01'),
      is_active: true,
    },
    {
      la_tenant_id: laTenantId,
      provision_type: 'salt_therapy',
      provision_name: 'Speech & Language Therapy (Direct)',
      description: 'Direct SALT intervention sessions',
      cost_model: 'hourly',
      unit_cost: 75,
      min_units: 0.5,
      max_units: 3,
      typical_units: 1,
      provider_type: 'health',
      typical_providers: ['NHS SALT', 'Independent SALT'],
      effective_from: new Date('2024-04-01'),
      is_active: true,
    },
    // Occupational Therapy
    {
      la_tenant_id: laTenantId,
      provision_type: 'ot_assessment',
      provision_name: 'Occupational Therapy Assessment',
      description: 'Comprehensive OT assessment',
      cost_model: 'per_session',
      unit_cost: 380,
      min_units: 1,
      max_units: 2,
      typical_units: 1,
      provider_type: 'health',
      typical_providers: ['NHS OT', 'Independent OT'],
      effective_from: new Date('2024-04-01'),
      is_active: true,
    },
    {
      la_tenant_id: laTenantId,
      provision_type: 'ot_therapy',
      provision_name: 'Occupational Therapy Sessions',
      description: 'Direct OT intervention',
      cost_model: 'hourly',
      unit_cost: 68,
      min_units: 0.5,
      max_units: 2,
      typical_units: 1,
      provider_type: 'health',
      typical_providers: ['NHS OT', 'Independent OT'],
      effective_from: new Date('2024-04-01'),
      is_active: true,
    },
    // Teaching Assistant Support
    {
      la_tenant_id: laTenantId,
      provision_type: 'ta_1to1',
      provision_name: '1:1 Teaching Assistant Support',
      description: 'Full-time 1:1 TA support in mainstream',
      cost_model: 'annual',
      unit_cost: 22000,
      min_units: 0.5,
      max_units: 1,
      typical_units: 1,
      provider_type: 'la_internal',
      typical_providers: ['School TA'],
      effective_from: new Date('2024-04-01'),
      is_active: true,
    },
    {
      la_tenant_id: laTenantId,
      provision_type: 'ta_small_group',
      provision_name: 'Small Group TA Support',
      description: 'Shared TA support (1:3 or 1:4)',
      cost_model: 'annual',
      unit_cost: 8000,
      min_units: 0.25,
      max_units: 0.5,
      typical_units: 0.33,
      provider_type: 'la_internal',
      typical_providers: ['School TA'],
      effective_from: new Date('2024-04-01'),
      is_active: true,
    },
    // Specialist Teaching
    {
      la_tenant_id: laTenantId,
      provision_type: 'specialist_literacy',
      provision_name: 'Specialist Literacy Teaching',
      description: 'Specialist dyslexia/literacy intervention',
      cost_model: 'hourly',
      unit_cost: 55,
      min_units: 1,
      max_units: 5,
      typical_units: 3,
      provider_type: 'la_internal',
      typical_providers: ['Specialist Teacher Service', 'School SENCO'],
      effective_from: new Date('2024-04-01'),
      is_active: true,
    },
    {
      la_tenant_id: laTenantId,
      provision_type: 'specialist_asd',
      provision_name: 'ASD Specialist Support',
      description: 'Autism advisory and support service',
      cost_model: 'hourly',
      unit_cost: 65,
      min_units: 1,
      max_units: 4,
      typical_units: 2,
      provider_type: 'la_internal',
      typical_providers: ['Autism Advisory Service'],
      effective_from: new Date('2024-04-01'),
      is_active: true,
    },
    // Sensory Support
    {
      la_tenant_id: laTenantId,
      provision_type: 'vi_support',
      provision_name: 'Visual Impairment Support',
      description: 'Qualified Teacher of VI support',
      cost_model: 'hourly',
      unit_cost: 72,
      min_units: 1,
      max_units: 10,
      typical_units: 4,
      provider_type: 'la_internal',
      typical_providers: ['Sensory Support Service'],
      effective_from: new Date('2024-04-01'),
      is_active: true,
    },
    {
      la_tenant_id: laTenantId,
      provision_type: 'hi_support',
      provision_name: 'Hearing Impairment Support',
      description: 'Qualified Teacher of Deaf support',
      cost_model: 'hourly',
      unit_cost: 72,
      min_units: 1,
      max_units: 10,
      typical_units: 4,
      provider_type: 'la_internal',
      typical_providers: ['Sensory Support Service'],
      effective_from: new Date('2024-04-01'),
      is_active: true,
    },
    // Social Care
    {
      la_tenant_id: laTenantId,
      provision_type: 'social_worker',
      provision_name: 'Social Worker Support',
      description: 'Social care involvement for EHCP',
      cost_model: 'hourly',
      unit_cost: 45,
      min_units: 1,
      max_units: 5,
      typical_units: 2,
      provider_type: 'social_care',
      typical_providers: ['LA Social Care'],
      effective_from: new Date('2024-04-01'),
      is_active: true,
    },
    {
      la_tenant_id: laTenantId,
      provision_type: 'short_breaks',
      provision_name: 'Short Breaks / Respite',
      description: 'Short breaks provision for families',
      cost_model: 'hourly',
      unit_cost: 28,
      min_units: 2,
      max_units: 20,
      typical_units: 8,
      provider_type: 'social_care',
      typical_providers: ['Short Breaks Provider'],
      effective_from: new Date('2024-04-01'),
      is_active: true,
    },
    // Transport
    {
      la_tenant_id: laTenantId,
      provision_type: 'sen_transport',
      provision_name: 'SEN Transport',
      description: 'Specialist transport to school/provision',
      cost_model: 'annual',
      unit_cost: 8500,
      min_units: 1,
      max_units: 1,
      typical_units: 1,
      provider_type: 'la_internal',
      typical_providers: ['Transport Provider'],
      effective_from: new Date('2024-04-01'),
      is_active: true,
    },
  ];

  for (const provision of provisions) {
    await prisma.provisionCost.create({
      data: provision,
    });
  }
  console.log(`    ✓ Created ${provisions.length} provision cost records`);
}

async function seedMediationCases(laTenantId: number) {
  console.log('  Seeding Mediation Cases...');
  
  const mediations = [
    {
      la_tenant_id: laTenantId,
      case_reference: 'MED-2024-001',
      child_name: 'Emily Thompson',
      parent_guardian_name: 'Sarah Thompson',
      parent_email: 'sarah.thompson@example.com',
      parent_phone: '07700 900123',
      mediation_type: 'ehcp_content',
      requested_by: 'parent',
      request_date: daysAgo(45),
      certificate_due_date: daysAgo(15),
      certificate_issued: daysAgo(20),
      mediation_date: daysAgo(5),
      status: 'completed',
      outcome: 'resolved',
      resolution_summary: 'Agreement reached on increasing SALT provision from 30 minutes to 1 hour weekly. LA agreed to fund additional specialist literacy support of 2 hours per week.',
      mediation_service: 'SEND Mediation UK',
      mediator_name: 'Dr. Helen Richards',
      agreements: [
        { area: 'SALT', agreed_change: 'Increase from 30 mins to 1 hour weekly', deadline: daysFromNow(14).toISOString() },
        { area: 'Literacy', agreed_change: 'Add 2 hours specialist literacy per week', deadline: daysFromNow(21).toISOString() },
      ],
      implementation_deadline: daysFromNow(30),
      implementation_status: 'in_progress',
      mediation_cost: 1200,
    },
    {
      la_tenant_id: laTenantId,
      case_reference: 'MED-2024-002',
      child_name: 'James Wilson',
      parent_guardian_name: 'Mark Wilson',
      parent_email: 'mark.wilson@example.com',
      parent_phone: '07700 900456',
      mediation_type: 'placement',
      requested_by: 'advocate',
      request_date: daysAgo(30),
      certificate_due_date: daysFromNow(0),
      status: 'certificate_issued',
      mediation_service: 'Independent SEND Mediation',
      mediation_cost: 0,
    },
    {
      la_tenant_id: laTenantId,
      case_reference: 'MED-2024-003',
      child_name: 'Olivia Chen',
      parent_guardian_name: 'Wei Chen',
      parent_email: 'wei.chen@example.com',
      mediation_type: 'ehcp_decision',
      requested_by: 'parent',
      request_date: daysAgo(60),
      certificate_due_date: daysAgo(30),
      certificate_issued: daysAgo(35),
      mediation_date: daysAgo(25),
      status: 'escalated_to_tribunal',
      outcome: 'unresolved',
      resolution_summary: 'Parents and LA unable to reach agreement on need for assessment. Parents proceeding to tribunal.',
      mediation_service: 'SEND Mediation UK',
      mediator_name: 'Michael Foster',
      mediation_cost: 1200,
    },
    {
      la_tenant_id: laTenantId,
      case_reference: 'MED-2024-004',
      child_name: 'Sophie Brown',
      parent_guardian_name: 'Emma Brown',
      parent_email: 'emma.brown@example.com',
      mediation_type: 'provision',
      requested_by: 'solicitor',
      request_date: daysAgo(10),
      certificate_due_date: daysFromNow(20),
      status: 'requested',
      mediation_service: 'Global Mediation',
    },
    {
      la_tenant_id: laTenantId,
      case_reference: 'MED-2024-005',
      child_name: 'Harry Patel',
      parent_guardian_name: 'Priya Patel',
      parent_email: 'priya.patel@example.com',
      mediation_type: 'ehcp_content',
      requested_by: 'parent',
      request_date: daysAgo(25),
      certificate_due_date: daysFromNow(5),
      certificate_issued: daysAgo(3),
      mediation_date: daysFromNow(14),
      status: 'scheduled',
      mediation_service: 'SEND Mediation UK',
      mediator_name: 'Dr. Susan Clarke',
    },
  ];

  for (const mediation of mediations) {
    await prisma.mediationCase.create({
      data: mediation,
    });
  }
  console.log(`    ✓ Created ${mediations.length} mediation cases`);
}

async function seedTribunalCases(laTenantId: number, mediationCaseId?: string) {
  console.log('  Seeding Tribunal Cases...');
  
  const tribunals = [
    {
      la_tenant_id: laTenantId,
      mediation_case_id: mediationCaseId,
      tribunal_reference: 'TRIB-2024-001',
      sendist_reference: 'SE/2024/00123',
      child_name: 'Olivia Chen',
      appeal_type: 'refusal_to_assess',
      grounds_for_appeal: 'The LA refused to conduct an EHC needs assessment despite evidence of significant SEMH and learning difficulties. The child has been excluded twice and is significantly below age-related expectations. School has evidenced 3 cycles of assess-plan-do-review with limited progress.',
      registration_date: daysAgo(50),
      response_due_date: daysAgo(20),
      response_submitted: daysAgo(22),
      working_document_due: daysFromNow(14),
      hearing_date: daysFromNow(45),
      hearing_location: 'Manchester Tribunal Centre',
      hearing_type: 'in_person',
      status: 'hearing_scheduled',
      la_legal_rep: 'LA Legal Services',
      parent_legal_rep: 'IPSEA',
      legal_costs: 5500,
    },
    {
      la_tenant_id: laTenantId,
      tribunal_reference: 'TRIB-2024-002',
      sendist_reference: 'SE/2024/00089',
      child_name: 'Daniel Moore',
      appeal_type: 'ehcp_content',
      grounds_for_appeal: 'The EHCP fails to specify provision quantified in terms of hours. Section F lists therapies without specifying frequency or duration. The plan does not accurately reflect the assessment advice.',
      registration_date: daysAgo(90),
      response_due_date: daysAgo(60),
      response_submitted: daysAgo(58),
      working_document_due: daysAgo(30),
      working_document_sent: daysAgo(28),
      hearing_date: daysAgo(15),
      hearing_location: 'London Tribunal Centre',
      hearing_type: 'video',
      decision_date: daysAgo(3),
      decision_outcome: 'partially_upheld',
      decision_summary: 'The tribunal orders the LA to amend Section F to specify: SALT 1 hour weekly direct therapy, OT 45 minutes fortnightly, specialist teaching 3 hours weekly. Section B to be amended to accurately reflect EP assessment.',
      ordered_changes: [
        { section: 'F', change: 'Specify SALT 1 hour weekly direct therapy' },
        { section: 'F', change: 'Specify OT 45 minutes fortnightly' },
        { section: 'F', change: 'Specify specialist teaching 3 hours weekly' },
        { section: 'B', change: 'Amend to reflect EP assessment findings' },
      ],
      implementation_deadline: daysFromNow(35),
      implementation_status: 'pending',
      status: 'closed',
      la_legal_rep: 'LA Legal Services',
      parent_legal_rep: 'SOS!SEN',
      legal_costs: 8500,
      tribunal_costs: 0,
      total_costs: 8500,
    },
    {
      la_tenant_id: laTenantId,
      tribunal_reference: 'TRIB-2024-003',
      sendist_reference: 'SE/2024/00156',
      child_name: 'Amelia Khan',
      appeal_type: 'placement',
      grounds_for_appeal: 'Parents request specialist ASD provision (Oak Academy) rather than resourced provision named by LA. Evidence shows child requires highly specialist ASD environment that mainstream resourced provision cannot provide.',
      registration_date: daysAgo(40),
      response_due_date: daysAgo(10),
      status: 'response_submitted',
      response_submitted: daysAgo(8),
      la_legal_rep: 'Browne Jacobson LLP',
      parent_legal_rep: 'Maxwell Gillott Solicitors',
      legal_costs: 12000,
    },
    {
      la_tenant_id: laTenantId,
      tribunal_reference: 'TRIB-2024-004',
      sendist_reference: 'SE/2024/00201',
      child_name: 'Thomas Wright',
      appeal_type: 'ceasing',
      grounds_for_appeal: 'LA proposes to cease EHCP on grounds child no longer requires specialist provision. Parents dispute this as child still requires significant SEN support and is only making progress due to current EHCP provisions.',
      registration_date: daysAgo(20),
      response_due_date: daysFromNow(10),
      status: 'registered',
      la_legal_rep: 'LA Legal Services',
    },
  ];

  for (const tribunal of tribunals) {
    await prisma.tribunalCase.create({
      data: tribunal,
    });
  }
  console.log(`    ✓ Created ${tribunals.length} tribunal cases`);
}

async function seedPhaseTransfers(laTenantId: number) {
  console.log('  Seeding Phase Transfers...');
  
  const transfers = [
    {
      la_tenant_id: laTenantId,
      child_id: 'STU-2019-001',
      child_name: 'Joshua Green',
      date_of_birth: new Date('2013-07-15'),
      current_phase: 'primary',
      current_setting_name: 'Riverside Primary School',
      target_phase: 'secondary',
      transfer_year: 2024,
      transfer_date: new Date('2024-09-01'),
      consultation_start: daysAgo(90),
      final_plan_deadline: daysFromNow(45),
      placement_confirmed: daysAgo(30),
      consultation_status: 'completed',
      settings_consulted: [
        { setting: 'Oakwood Academy', response: 'can_meet_needs', date: daysAgo(60).toISOString() },
        { setting: 'Hillcrest Secondary', response: 'cannot_meet_needs', reason: 'No ASD provision', date: daysAgo(55).toISOString() },
        { setting: 'Central High School', response: 'can_meet_needs', date: daysAgo(50).toISOString() },
      ],
      parent_preferences: [
        { rank: 1, setting_name: 'Oakwood Academy', reason: 'Strong ASD unit, sibling attends' },
        { rank: 2, setting_name: 'Central High School', reason: 'Good SEND provision, closer to home' },
      ],
      proposed_setting_name: 'Oakwood Academy',
      placement_decision_date: daysAgo(30),
      placement_agreed: true,
      ehcp_amendments_required: [
        { section: 'I', change: 'Update placement to Oakwood Academy Secondary Department' },
        { section: 'F', change: 'Add transition support 10 hours over summer term' },
      ],
      amended_plan_sent: daysAgo(10),
      status: 'plan_amended',
      risk_level: 'standard',
      notes: 'Smooth transition. Parents happy with placement. School confirmed readiness for September.',
    },
    {
      la_tenant_id: laTenantId,
      child_id: 'STU-2017-042',
      child_name: 'Isabella Murphy',
      date_of_birth: new Date('2008-03-22'),
      current_phase: 'secondary',
      current_setting_name: 'St Matthews Secondary School',
      target_phase: 'post_16',
      transfer_year: 2024,
      transfer_date: new Date('2024-09-01'),
      consultation_start: daysAgo(120),
      final_plan_deadline: daysFromNow(30),
      consultation_status: 'in_progress',
      settings_consulted: [
        { setting: 'City College - SEND Pathway', response: 'can_meet_needs', date: daysAgo(45).toISOString() },
        { setting: 'Specialist Further Education College', response: 'awaiting_response', date: daysAgo(30).toISOString() },
      ],
      parent_preferences: [
        { rank: 1, setting_name: 'Specialist Further Education College', reason: 'Residential, independent living skills focus' },
        { rank: 2, setting_name: 'City College - SEND Pathway', reason: 'Closer to home, good vocational options' },
      ],
      status: 'consultations_sent',
      risk_level: 'at_risk',
      notes: 'Awaiting response from first choice. May need to escalate.',
    },
    {
      la_tenant_id: laTenantId,
      child_id: 'STU-2020-015',
      child_name: 'Ethan Roberts',
      date_of_birth: new Date('2019-11-08'),
      current_phase: 'early_years',
      current_setting_name: 'Sunshine Nursery',
      target_phase: 'primary',
      transfer_year: 2024,
      transfer_date: new Date('2024-09-01'),
      consultation_start: daysAgo(60),
      final_plan_deadline: daysFromNow(60),
      consultation_status: 'not_started',
      status: 'identified',
      risk_level: 'high_risk',
      notes: 'Complex PMLD. Will require specialist school. Limited local options. Transport will be significant factor.',
    },
    {
      la_tenant_id: laTenantId,
      child_id: 'STU-2006-088',
      child_name: 'Chloe Davies',
      date_of_birth: new Date('2006-05-30'),
      current_phase: 'post_16',
      current_setting_name: 'Greenfield College',
      target_phase: 'post_19',
      transfer_year: 2025,
      transfer_date: new Date('2025-09-01'),
      consultation_start: daysFromNow(60),
      final_plan_deadline: daysFromNow(180),
      consultation_status: 'not_started',
      status: 'identified',
      risk_level: 'standard',
      notes: 'Planning for supported internship or day services. Social care team already involved.',
    },
  ];

  for (const transfer of transfers) {
    await prisma.phaseTransfer.create({
      data: transfer,
    });
  }
  console.log(`    ✓ Created ${transfers.length} phase transfer records`);
}

async function seedAnnualReviews(laTenantId: number) {
  console.log('  Seeding Annual Reviews...');
  
  const reviews = [
    {
      la_tenant_id: laTenantId,
      ehcp_id: 'EHCP-2022-001',
      child_id: 'STU-2015-023',
      child_name: 'Ruby Anderson',
      review_period_start: new Date('2024-01-01'),
      review_period_end: new Date('2024-12-31'),
      scheduled_date: daysFromNow(14),
      review_type: 'standard',
      setting_name: 'Meadowbrook Primary School',
      paperwork_due: daysFromNow(0),
      decision_due: daysFromNow(42),
      final_plan_due: daysFromNow(70),
      invitees: [
        { role: 'Parent', name: 'Helen Anderson', email: 'helen.anderson@example.com', invited: true, attending: true },
        { role: 'SENCO', name: 'Mrs J. Collins', email: 'senco@meadowbrook.sch.uk', invited: true, attending: true },
        { role: 'Class Teacher', name: 'Mr P. Williams', email: 'p.williams@meadowbrook.sch.uk', invited: true, attending: true },
        { role: 'EP', name: 'Dr S. Patel', email: 's.patel@la.gov.uk', invited: true, attending: false },
        { role: 'SALT', name: 'Ms R. Turner', email: 'r.turner@nhs.uk', invited: true, attending: true },
      ],
      meeting_location: 'Meadowbrook Primary School',
      meeting_format: 'in_person',
      status: 'paperwork_requested',
      parent_views_received: true,
      child_views_received: true,
      setting_advice_received: false,
    },
    {
      la_tenant_id: laTenantId,
      ehcp_id: 'EHCP-2021-045',
      child_id: 'STU-2013-067',
      child_name: 'Oscar Taylor',
      review_period_start: new Date('2024-01-01'),
      review_period_end: new Date('2024-12-31'),
      scheduled_date: daysAgo(30),
      review_type: 'phase_transfer',
      setting_name: 'Silverdale Primary School',
      paperwork_due: daysAgo(44),
      decision_due: daysAgo(2),
      final_plan_due: daysFromNow(26),
      invitees: [
        { role: 'Parent', name: 'David Taylor', email: 'david.taylor@example.com', invited: true, attending: true },
        { role: 'Parent', name: 'Lisa Taylor', email: 'lisa.taylor@example.com', invited: true, attending: true },
        { role: 'SENCO (Current)', name: 'Ms A. Hughes', email: 'senco@silverdale.sch.uk', invited: true, attending: true },
        { role: 'SENCO (Receiving)', name: 'Mr D. Brown', email: 'senco@westfield.sch.uk', invited: true, attending: true },
        { role: 'EP', name: 'Dr M. Johnson', email: 'm.johnson@la.gov.uk', invited: true, attending: true },
      ],
      meeting_location: 'Virtual (Teams)',
      meeting_format: 'video',
      status: 'decision_made',
      outcome: 'amend',
      outcome_date: daysAgo(5),
      outcome_summary: 'EHCP to be amended for secondary transfer. Additional transition support to be specified. Placement confirmed at Westfield Academy (ASD Resourced Provision).',
      parent_views_received: true,
      child_views_received: true,
      setting_advice_received: true,
      amendments_required: [
        { section: 'B', change: 'Update developmental levels and current presentation' },
        { section: 'F', change: 'Add 10 hours transition support over 2 terms' },
        { section: 'I', change: 'Update placement to Westfield Academy' },
      ],
    },
    {
      la_tenant_id: laTenantId,
      ehcp_id: 'EHCP-2023-012',
      child_id: 'STU-2018-089',
      child_name: 'Lily Singh',
      review_period_start: new Date('2024-01-01'),
      review_period_end: new Date('2024-12-31'),
      scheduled_date: daysAgo(60),
      review_type: 'standard',
      setting_name: 'Park View Special School',
      paperwork_due: daysAgo(74),
      decision_due: daysAgo(32),
      final_plan_due: daysAgo(4),
      meeting_location: 'Park View Special School',
      meeting_format: 'hybrid',
      status: 'completed',
      outcome: 'maintain',
      outcome_date: daysAgo(35),
      outcome_summary: 'EHCP to be maintained. Good progress towards outcomes. Current provision remains appropriate. No changes required.',
      parent_views_received: true,
      child_views_received: true,
      setting_advice_received: true,
      amended_plan_issued: daysAgo(4),
    },
    {
      la_tenant_id: laTenantId,
      ehcp_id: 'EHCP-2020-078',
      child_id: 'STU-2012-034',
      child_name: 'George Hall',
      review_period_start: new Date('2024-01-01'),
      review_period_end: new Date('2024-12-31'),
      scheduled_date: daysFromNow(45),
      review_type: 'early_review',
      setting_name: 'Hillside Academy',
      paperwork_due: daysFromNow(31),
      decision_due: daysFromNow(73),
      final_plan_due: daysFromNow(101),
      meeting_location: 'Hillside Academy',
      meeting_format: 'in_person',
      status: 'scheduled',
      parent_views_received: false,
      child_views_received: false,
      setting_advice_received: false,
    },
  ];

  for (const review of reviews) {
    await prisma.annualReview.create({
      data: review,
    });
  }
  console.log(`    ✓ Created ${reviews.length} annual review records`);
}

async function seedComplianceRiskPredictions(laTenantId: number) {
  console.log('  Seeding Compliance Risk Predictions...');
  
  const predictions = [
    {
      la_tenant_id: laTenantId,
      risk_score: 85,
      risk_level: 'high',
      risk_factors: [
        { factor: 'time_elapsed', weight: 0.35, score: 90, contribution: 31.5 },
        { factor: 'ep_availability', weight: 0.25, score: 80, contribution: 20 },
        { factor: 'complexity', weight: 0.20, score: 85, contribution: 17 },
        { factor: 'workload', weight: 0.20, score: 82, contribution: 16.4 },
      ],
      timeline_risk: 90,
      complexity_risk: 85,
      resource_risk: 80,
      historical_risk: 75,
      primary_risk_factors: ['Decision deadline in 5 days', 'EP report pending', 'Complex multi-agency case'],
      mitigation_actions: [
        { action: 'Escalate to EP Service Manager', priority: 'urgent' },
        { action: 'Consider interim decision with conditions', priority: 'high' },
        { action: 'Request extension from family', priority: 'medium' },
      ],
      confidence: 0.85,
      decision_breach_prob: 0.78,
      draft_breach_prob: 0.45,
      final_breach_prob: 0.35,
      model_version: 'v1.2',
    },
    {
      la_tenant_id: laTenantId,
      risk_score: 45,
      risk_level: 'medium',
      risk_factors: [
        { factor: 'time_elapsed', weight: 0.35, score: 50, contribution: 17.5 },
        { factor: 'ep_availability', weight: 0.25, score: 40, contribution: 10 },
        { factor: 'complexity', weight: 0.20, score: 45, contribution: 9 },
        { factor: 'workload', weight: 0.20, score: 42, contribution: 8.4 },
      ],
      timeline_risk: 50,
      complexity_risk: 45,
      resource_risk: 40,
      historical_risk: 35,
      primary_risk_factors: ['Health advice delayed', 'Multiple professionals involved'],
      mitigation_actions: [
        { action: 'Chase health advice', priority: 'high' },
        { action: 'Schedule coordination meeting', priority: 'medium' },
      ],
      confidence: 0.82,
      decision_breach_prob: 0.25,
      draft_breach_prob: 0.30,
      final_breach_prob: 0.20,
      model_version: 'v1.2',
    },
    {
      la_tenant_id: laTenantId,
      risk_score: 20,
      risk_level: 'low',
      risk_factors: [
        { factor: 'time_elapsed', weight: 0.35, score: 20, contribution: 7 },
        { factor: 'ep_availability', weight: 0.25, score: 15, contribution: 3.75 },
        { factor: 'complexity', weight: 0.20, score: 25, contribution: 5 },
        { factor: 'workload', weight: 0.20, score: 22, contribution: 4.4 },
      ],
      timeline_risk: 20,
      complexity_risk: 25,
      resource_risk: 15,
      historical_risk: 18,
      primary_risk_factors: ['Standard case progressing well'],
      confidence: 0.90,
      decision_breach_prob: 0.05,
      draft_breach_prob: 0.08,
      final_breach_prob: 0.05,
      model_version: 'v1.2',
    },
    {
      la_tenant_id: laTenantId,
      risk_score: 95,
      risk_level: 'critical',
      risk_factors: [
        { factor: 'time_elapsed', weight: 0.35, score: 100, contribution: 35 },
        { factor: 'ep_availability', weight: 0.25, score: 95, contribution: 23.75 },
        { factor: 'complexity', weight: 0.20, score: 90, contribution: 18 },
        { factor: 'workload', weight: 0.20, score: 92, contribution: 18.4 },
      ],
      timeline_risk: 100,
      complexity_risk: 90,
      resource_risk: 95,
      historical_risk: 88,
      primary_risk_factors: ['Deadline breached', 'Multiple outstanding advices', 'Legal challenge threatened'],
      mitigation_actions: [
        { action: 'Immediate escalation to SEND Manager', priority: 'critical' },
        { action: 'Issue statutory apology letter', priority: 'urgent' },
        { action: 'Expedited panel consideration', priority: 'urgent' },
        { action: 'Engage with legal services', priority: 'high' },
      ],
      confidence: 0.92,
      decision_breach_prob: 1.0,
      draft_breach_prob: 0.85,
      final_breach_prob: 0.70,
      model_version: 'v1.2',
    },
  ];

  for (const prediction of predictions) {
    await prisma.complianceRiskPrediction.create({
      data: prediction,
    });
  }
  console.log(`    ✓ Created ${predictions.length} risk prediction records`);
}

async function seedComplianceAlerts(laTenantId: number) {
  console.log('  Seeding Compliance Alerts...');
  
  const alerts = [
    {
      la_tenant_id: laTenantId,
      alert_type: 'deadline_approaching',
      severity: 'warning',
      title: 'Decision Deadline in 5 Days',
      message: 'EHCP application for Child A requires decision by 15th January. EP advice still pending.',
      deadline_date: daysFromNow(5),
      days_remaining: 5,
      status: 'active',
    },
    {
      la_tenant_id: laTenantId,
      alert_type: 'deadline_breached',
      severity: 'critical',
      title: 'Statutory Timeline Breached',
      message: 'EHCP application for Child B has exceeded 20-week statutory timeline. Final EHCP was due 5 days ago.',
      deadline_date: daysAgo(5),
      days_remaining: -5,
      status: 'active',
    },
    {
      la_tenant_id: laTenantId,
      alert_type: 'risk_escalated',
      severity: 'warning',
      title: 'Risk Level Increased to High',
      message: 'EHCP application for Child C risk score increased from 45 to 78 due to EP availability issues.',
      status: 'active',
    },
    {
      la_tenant_id: laTenantId,
      alert_type: 'resource_issue',
      severity: 'info',
      title: 'EP Capacity Concern',
      message: '3 applications currently awaiting EP assessment. Average wait time increased to 4 weeks.',
      status: 'acknowledged',
      acknowledged_at: daysAgo(2),
    },
    {
      la_tenant_id: laTenantId,
      alert_type: 'deadline_approaching',
      severity: 'warning',
      title: 'Multiple Reviews Due This Month',
      message: '8 annual reviews scheduled this month, exceeding typical capacity of 6.',
      status: 'resolved',
      resolved_at: daysAgo(1),
      actions_taken: [
        { action: 'Additional SEND officer assigned', date: daysAgo(3).toISOString() },
        { action: 'Two reviews rescheduled with family agreement', date: daysAgo(2).toISOString() },
      ],
    },
  ];

  for (const alert of alerts) {
    await prisma.complianceAlert.create({
      data: alert,
    });
  }
  console.log(`    ✓ Created ${alerts.length} compliance alert records`);
}

async function seedGoldenThreadAnalyses(laTenantId: number) {
  console.log('  Seeding Golden Thread Analyses...');
  
  const analyses = [
    {
      la_tenant_id: laTenantId,
      ehcp_id: 'EHCP-2024-001',
      analysis_version: 1,
      overall_coherence: 78,
      overall_quality: 82,
      section_scores: {
        section_a: 85,
        section_b: 80,
        section_c: 75,
        section_d: 72,
        section_e: 80,
        section_f: 68,
        section_g: 90,
        section_h: 88,
        section_i: 95,
      },
      needs_identified: [
        { id: 1, category: 'SLCN', description: 'Significant receptive and expressive language delay', severity: 'high' },
        { id: 2, category: 'SpLD', description: 'Phonological processing difficulties impacting literacy', severity: 'medium' },
        { id: 3, category: 'SEMH', description: 'Anxiety related to communication difficulties', severity: 'medium' },
      ],
      needs_categories: { SLCN: 1, SpLD: 1, SEMH: 1 },
      needs_clarity_score: 80,
      outcomes_extracted: [
        { id: 1, outcome: 'Child will use full sentences of 5+ words 80% of the time', need_linked: 1, is_smart: true },
        { id: 2, outcome: 'Improve reading comprehension', need_linked: 2, is_smart: false },
        { id: 3, outcome: 'Child will access the curriculum with reduced anxiety', need_linked: 3, is_smart: false },
      ],
      outcomes_smart_score: 65,
      outcomes_linked_to_needs: true,
      provisions_mapped: [
        { id: 1, provision: 'SALT 1 hour weekly', outcome_linked: [1], is_quantified: true },
        { id: 2, provision: 'Specialist literacy teaching', outcome_linked: [2], is_quantified: false },
        { id: 3, provision: 'ELSA support', outcome_linked: [3], is_quantified: false },
      ],
      provisions_linked: true,
      provision_gaps: [
        { gap: 'ELSA support not quantified', severity: 'medium' },
        { gap: 'Literacy teaching hours not specified', severity: 'high' },
      ],
      need_outcome_links: [
        { need_id: 1, outcome_id: 1, strength: 'strong' },
        { need_id: 2, outcome_id: 2, strength: 'moderate' },
        { need_id: 3, outcome_id: 3, strength: 'weak' },
      ],
      outcome_provision_links: [
        { outcome_id: 1, provision_id: 1, strength: 'strong' },
        { outcome_id: 2, provision_id: 2, strength: 'moderate' },
        { outcome_id: 3, provision_id: 3, strength: 'moderate' },
      ],
      broken_links: [
        { type: 'outcome_to_provision', description: 'Outcome 3 provision not clearly linked' },
      ],
      recommendations: [
        { priority: 'high', recommendation: 'Quantify literacy teaching provision (e.g., 3 hours weekly)' },
        { priority: 'high', recommendation: 'Specify ELSA frequency and duration' },
        { priority: 'medium', recommendation: 'Make outcome 2 SMART - specify reading level targets' },
        { priority: 'medium', recommendation: 'Strengthen link between anxiety need and provision' },
      ],
      priority_issues: [
        'Section F provisions not fully quantified',
        'Some outcomes not SMART',
        'Weak outcome-provision linkage for SEMH',
      ],
      ai_model_used: 'claude-3.5-sonnet',
      ai_confidence: 0.85,
      status: 'completed',
    },
    {
      la_tenant_id: laTenantId,
      ehcp_id: 'EHCP-2024-002',
      analysis_version: 1,
      overall_coherence: 92,
      overall_quality: 95,
      section_scores: {
        section_a: 95,
        section_b: 94,
        section_c: 90,
        section_d: 88,
        section_e: 92,
        section_f: 96,
        section_g: 90,
        section_h: 92,
        section_i: 98,
      },
      needs_identified: [
        { id: 1, category: 'ASD', description: 'Autism with significant social communication differences', severity: 'high' },
        { id: 2, category: 'SEMH', description: 'High anxiety in unstructured situations', severity: 'high' },
        { id: 3, category: 'Sensory', description: 'Sensory processing differences requiring environmental modifications', severity: 'medium' },
      ],
      needs_categories: { ASD: 1, SEMH: 1, Sensory: 1 },
      needs_clarity_score: 95,
      outcomes_extracted: [
        { id: 1, outcome: 'Child will initiate peer interactions 3 times daily by end of year', need_linked: 1, is_smart: true },
        { id: 2, outcome: 'Child will use taught strategies to manage anxiety in 90% of unstructured times', need_linked: 2, is_smart: true },
        { id: 3, outcome: 'Child will independently request sensory break when needed', need_linked: 3, is_smart: true },
      ],
      outcomes_smart_score: 95,
      outcomes_linked_to_needs: true,
      provisions_mapped: [
        { id: 1, provision: 'ASD specialist teacher support 2 hours weekly', outcome_linked: [1], is_quantified: true },
        { id: 2, provision: 'Zones of Regulation programme 3 x 30 mins weekly', outcome_linked: [2], is_quantified: true },
        { id: 3, provision: 'OT sensory programme reviewed termly', outcome_linked: [3], is_quantified: true },
      ],
      provisions_linked: true,
      need_outcome_links: [
        { need_id: 1, outcome_id: 1, strength: 'strong' },
        { need_id: 2, outcome_id: 2, strength: 'strong' },
        { need_id: 3, outcome_id: 3, strength: 'strong' },
      ],
      outcome_provision_links: [
        { outcome_id: 1, provision_id: 1, strength: 'strong' },
        { outcome_id: 2, provision_id: 2, strength: 'strong' },
        { outcome_id: 3, provision_id: 3, strength: 'strong' },
      ],
      recommendations: [
        { priority: 'low', recommendation: 'Consider adding specific social skills group provision' },
      ],
      priority_issues: [],
      ai_model_used: 'claude-3.5-sonnet',
      ai_confidence: 0.92,
      status: 'completed',
    },
  ];

  for (const analysis of analyses) {
    await prisma.goldenThreadAnalysis.create({
      data: analysis,
    });
  }
  console.log(`    ✓ Created ${analyses.length} golden thread analysis records`);
}

async function seedSEN2ReturnData(laTenantId: number) {
  console.log('  Seeding SEN2 Return Data...');
  
  const sen2Data = {
    la_tenant_id: laTenantId,
    academic_year: '2023-24',
    census_date: new Date('2024-01-18'),
    submission_deadline: new Date('2024-03-28'),
    status: 'submitted',
    submitted_at: new Date('2024-03-25'),
    dfe_reference: 'SEN2-2024-SW-12345',
    ehcps_by_age: {
      under5: 245,
      age_5_to_10: 1820,
      age_11_to_15: 1650,
      age_16_to_19: 890,
      age_20_plus: 420,
    },
    ehcps_by_need: {
      ASD: 1850,
      SEMH: 1420,
      SLCN: 980,
      MLD: 650,
      SpLD: 420,
      SLD: 380,
      PMLD: 180,
      PD: 145,
      VI: 85,
      HI: 72,
      MSI: 28,
      Other: 815,
    },
    ehcps_by_placement: {
      mainstream: 2850,
      resourced_provision: 680,
      special_school_maintained: 1250,
      special_school_academy: 420,
      independent_special: 380,
      alternative_provision: 125,
      post_16_fe: 720,
      other: 600,
    },
    new_ehcps_in_year: 580,
    initial_requests: 920,
    requests_refused: 185,
    assessments_completed_20_weeks: 485,
    assessments_completed_over_20: 95,
    timeliness_percentage: 83.6,
    mediations_held: 42,
    tribunals_registered: 28,
    tribunals_decided: 22,
    personal_budgets_active: 145,
    direct_payments_active: 89,
    validation_warnings: [
      { field: 'ehcps_by_placement.other', message: 'Higher than expected - verify data' },
    ],
    last_validated: new Date('2024-03-24'),
  };

  await prisma.sEN2ReturnData.upsert({
    where: {
      la_tenant_id_academic_year: {
        la_tenant_id: laTenantId,
        academic_year: '2023-24',
      },
    },
    create: sen2Data,
    update: sen2Data,
  });
  console.log('    ✓ Created SEN2 return data for 2023-24');
}

async function main() {
  console.log('🌱 Starting EHCP Module Seed...\n');
  
  // Find or create an LA tenant
  let laTenant = await prisma.tenants.findFirst({
    where: { tenant_type: 'LA' },
  });

  if (!laTenant) {
    console.log('  Creating LA tenant...');
    laTenant = await prisma.tenants.create({
      data: {
        name: 'South Western LA',
        subdomain: 'southwest-la',
        tenant_type: 'LA',
        la_code: 'E09000001',
        postcode: 'SW1A 1AA',
        contact_email: 'send@southwest-la.gov.uk',
        contact_phone: '020 7946 0958',
        status: 'active',
        settings: {
          features: ['ehcp_management', 'mediation_tracking', 'tribunal_management', 'sen2_returns'],
        },
      },
    });
    console.log(`    ✓ Created LA tenant: ${laTenant.name}`);
  } else {
    console.log(`  Using existing LA tenant: ${laTenant.name}`);
  }

  const laTenantId = laTenant.id;

  // Seed all EHCP modules
  await seedFundingBands(laTenantId);
  await seedProvisionCosts(laTenantId);
  await seedMediationCases(laTenantId);
  
  // Get a mediation case for tribunal linking
  const mediationCase = await prisma.mediationCase.findFirst({
    where: { la_tenant_id: laTenantId, status: 'escalated_to_tribunal' },
  });
  await seedTribunalCases(laTenantId, mediationCase?.id);
  
  await seedPhaseTransfers(laTenantId);
  await seedAnnualReviews(laTenantId);
  await seedComplianceRiskPredictions(laTenantId);
  await seedComplianceAlerts(laTenantId);
  await seedGoldenThreadAnalyses(laTenantId);
  await seedSEN2ReturnData(laTenantId);

  console.log('\n✅ EHCP Module Seed Complete!');
  console.log(`\n📊 Summary for LA: ${laTenant.name}`);
  console.log('   - 5 Funding Bands (A-E)');
  console.log('   - 15 Provision Cost Types');
  console.log('   - 5 Mediation Cases');
  console.log('   - 4 Tribunal Cases');
  console.log('   - 4 Phase Transfer Records');
  console.log('   - 4 Annual Reviews');
  console.log('   - 4 Risk Predictions');
  console.log('   - 5 Compliance Alerts');
  console.log('   - 2 Golden Thread Analyses');
  console.log('   - 1 SEN2 Return (2023-24)');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
