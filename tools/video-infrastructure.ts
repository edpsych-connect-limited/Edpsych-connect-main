#!/usr/bin/env npx tsx
/**
 * VIDEO INFRASTRUCTURE MANAGEMENT SCRIPT
 * =====================================
 * Autonomous enterprise-grade video management system
 * 
 * Primary: Cloudinary CDN (99.9% SLA)
 * Backup: Local E: drive storage
 * Fallback: HeyGen embed (ONLY when others fail)
 * 
 * Usage:
 *   npx tsx tools/video-infrastructure.ts download   # Download all videos from HeyGen
 *   npx tsx tools/video-infrastructure.ts upload     # Upload to Cloudinary
 *   npx tsx tools/video-infrastructure.ts audit      # Full audit report
 *   npx tsx tools/video-infrastructure.ts generate   # Generate missing videos
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

// =============================================================================
// CONFIGURATION
// =============================================================================
const HEYGEN_API_KEY = 'sk_V2_hgu_kIsPOKnUIeM_Nvtt8QLs3osJMx3nQi5fYEytQNjhR4qM';
const CLOUDINARY_CLOUD_NAME = 'dncfu2j0r';
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '';
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || '';

const BASE_VIDEO_DIR = path.join(process.cwd(), 'public', 'content', 'training_videos');

// December 2025 videos that need to be downloaded
const DECEMBER_2025_VIDEOS: Record<string, { heygenId: string; localPath: string; cloudinaryId: string }> = {
  // Value proposition videos
  'value-enterprise-platform': { heygenId: '52e39fee2f98437fb2a8a67c840c0836', localPath: 'pricing/value-enterprise-platform.mp4', cloudinaryId: 'training_videos/pricing/value-enterprise-platform' },
  'value-edtech-problem': { heygenId: 'f8411531c5fb4031898957be38e6b168', localPath: 'pricing/value-edtech-problem.mp4', cloudinaryId: 'training_videos/pricing/value-edtech-problem' },
  'value-complete-solution': { heygenId: '2e088cf41f434059b6cf0be15a42134a', localPath: 'pricing/value-complete-solution.mp4', cloudinaryId: 'training_videos/pricing/value-complete-solution' },
  
  // Tier videos
  'tier-parent-plus': { heygenId: '79bd4e006d504aed947ef24c7e2dcab8', localPath: 'pricing/tier-parent-plus.mp4', cloudinaryId: 'training_videos/pricing/tier-parent-plus' },
  'tier-teacher-individual': { heygenId: '174b9257fe1044cb9295777d68fe4e80', localPath: 'pricing/tier-teacher-individual.mp4', cloudinaryId: 'training_videos/pricing/tier-teacher-individual' },
  'tier-schools-overview': { heygenId: 'd65eb31cbe9c4c018362b5ff71b4baee', localPath: 'pricing/tier-schools-overview.mp4', cloudinaryId: 'training_videos/pricing/tier-schools-overview' },
  'tier-mat-enterprise': { heygenId: '636e4a41cf0a43b38e90020d4eb2defb', localPath: 'pricing/tier-mat-enterprise.mp4', cloudinaryId: 'training_videos/pricing/tier-mat-enterprise' },
  'tier-local-authority': { heygenId: '1201be5f79c04a9d9c46dcc4053d524e', localPath: 'pricing/tier-local-authority.mp4', cloudinaryId: 'training_videos/pricing/tier-local-authority' },
  'tier-researcher': { heygenId: '72635bd2217d41d9b3a88680c292ba5a', localPath: 'pricing/tier-researcher.mp4', cloudinaryId: 'training_videos/pricing/tier-researcher' },
  'tier-trainee-ep': { heygenId: 'cf96e5128cfb4af8bb4bce4f76ff372c', localPath: 'pricing/tier-trainee-ep.mp4', cloudinaryId: 'training_videos/pricing/tier-trainee-ep' },
  
  // Add-on videos
  'addon-ai-power-pack': { heygenId: '585ec6706d7349c6b42e363ee0655d5a', localPath: 'pricing/addon-ai-power-pack.mp4', cloudinaryId: 'training_videos/pricing/addon-ai-power-pack' },
  'addon-ehcp-accelerator': { heygenId: '06bf1fcb7aa04476abf0db827b5e6c6e', localPath: 'pricing/addon-ehcp-accelerator.mp4', cloudinaryId: 'training_videos/pricing/addon-ehcp-accelerator' },
  'addon-cpd-library': { heygenId: '88582eef95634801b88c0dd76c7523f6', localPath: 'pricing/addon-cpd-library.mp4', cloudinaryId: 'training_videos/pricing/addon-cpd-library' },
  'addon-api-access': { heygenId: '49faa010b2864d539969227b7b6d81de', localPath: 'pricing/addon-api-access.mp4', cloudinaryId: 'training_videos/pricing/addon-api-access' },
  'addon-white-label': { heygenId: '6132f8ab6d4246b7a184db10c9a49c9e', localPath: 'pricing/addon-white-label.mp4', cloudinaryId: 'training_videos/pricing/addon-white-label' },
  'addon-priority-support': { heygenId: 'e90201fbba1a4f789186c4d8b58dcc72', localPath: 'pricing/addon-priority-support.mp4', cloudinaryId: 'training_videos/pricing/addon-priority-support' },
  
  // Feature deep dive videos
  'feature-nclb-engine': { heygenId: '738bbcfaa87541aeb36e061c00db5ece', localPath: 'features/feature-nclb-engine.mp4', cloudinaryId: 'training_videos/features/feature-nclb-engine' },
  'feature-battle-royale-pricing': { heygenId: 'b9fa6820015c4d10971fbb9a8263cc12', localPath: 'features/feature-battle-royale-pricing.mp4', cloudinaryId: 'training_videos/features/feature-battle-royale-pricing' },
  'feature-byod-architecture': { heygenId: '9a6b8abfac524086a84d3ce64c8c5df3', localPath: 'features/feature-byod-architecture.mp4', cloudinaryId: 'training_videos/features/feature-byod-architecture' },
  'feature-intervention-library': { heygenId: '70ae2bd8eb3e41cab5dfdeb8a771fc8a', localPath: 'features/feature-intervention-library.mp4', cloudinaryId: 'training_videos/features/feature-intervention-library' },
  
  // Comparison & trust videos
  'compare-true-cost': { heygenId: '80f6551b669a4a4c804d6d19726d626e', localPath: 'pricing/compare-true-cost.mp4', cloudinaryId: 'training_videos/pricing/compare-true-cost' },
  'compare-switching': { heygenId: '35fc14cae23d4323a08150b6625dea35', localPath: 'pricing/compare-switching.mp4', cloudinaryId: 'training_videos/pricing/compare-switching' },
  'trust-security': { heygenId: 'caa20295f1164b3cb796c1e04c348c77', localPath: 'pricing/trust-security.mp4', cloudinaryId: 'training_videos/pricing/trust-security' },
  'trust-built-by-practitioners': { heygenId: '81e7ef1a1d1449a2a65187820cff7bac', localPath: 'pricing/trust-built-by-practitioners.mp4', cloudinaryId: 'training_videos/pricing/trust-built-by-practitioners' },
  
  // Onboarding: Teachers
  'onboard-teacher-welcome': { heygenId: '2a4360fa476c49ddbba8740ffa010536', localPath: 'onboarding/teacher/welcome.mp4', cloudinaryId: 'training_videos/onboarding/teacher/welcome' },
  'onboard-teacher-differentiation': { heygenId: 'c0b9a101cfd5449d87efcac0fa00267e', localPath: 'onboarding/teacher/differentiation.mp4', cloudinaryId: 'training_videos/onboarding/teacher/differentiation' },
  'onboard-teacher-assessment': { heygenId: '094207aaf81b442d993a21b716e49f8e', localPath: 'onboarding/teacher/assessment.mp4', cloudinaryId: 'training_videos/onboarding/teacher/assessment' },
  
  // Onboarding: SENCOs
  'onboard-senco-welcome': { heygenId: '3d15dfb87ce343498808f5100e276800', localPath: 'onboarding/senco/welcome.mp4', cloudinaryId: 'training_videos/onboarding/senco/welcome' },
  'onboard-senco-provision-mapping': { heygenId: '476c8c1e9a1148d7972af4058fd727c8', localPath: 'onboarding/senco/provision-mapping.mp4', cloudinaryId: 'training_videos/onboarding/senco/provision-mapping' },
  'onboard-senco-ehcp-workflow': { heygenId: '98dd9dd96a564399ba2c379e2226a2c8', localPath: 'onboarding/senco/ehcp-workflow.mp4', cloudinaryId: 'training_videos/onboarding/senco/ehcp-workflow' },
  
  // Onboarding: Educational Psychologists
  'onboard-ep-welcome': { heygenId: '11508bd5211b41d1b58d74cd2bf114fe', localPath: 'onboarding/ep/welcome.mp4', cloudinaryId: 'training_videos/onboarding/ep/welcome' },
  'onboard-ep-assessment-suite': { heygenId: 'ffd5a9a625e94fb295e1ceee17d13f06', localPath: 'onboarding/ep/assessment-suite.mp4', cloudinaryId: 'training_videos/onboarding/ep/assessment-suite' },
  'onboard-ep-report-writing': { heygenId: '99cfe04692a441cfa1d5b4c4389f1917', localPath: 'onboarding/ep/report-writing.mp4', cloudinaryId: 'training_videos/onboarding/ep/report-writing' },
  
  // Onboarding: Parents
  'onboard-parent-welcome': { heygenId: '7a23f6e01c974fbebb3ccf015a8096cf', localPath: 'onboarding/parent/welcome.mp4', cloudinaryId: 'training_videos/onboarding/parent/welcome' },
  'onboard-parent-understanding-reports': { heygenId: 'e3f23d81d1e9488bbd3cd4301d7dc9ac', localPath: 'onboarding/parent/understanding-reports.mp4', cloudinaryId: 'training_videos/onboarding/parent/understanding-reports' },
  'onboard-parent-contributing': { heygenId: 'f5fc230f548447dba95ca6eaf465868a', localPath: 'onboarding/parent/contributing.mp4', cloudinaryId: 'training_videos/onboarding/parent/contributing' },
  
  // Onboarding: Local Authority
  'onboard-la-welcome': { heygenId: 'e67669e51e8541afaf5298ba4590e945', localPath: 'onboarding/la/welcome.mp4', cloudinaryId: 'training_videos/onboarding/la/welcome' },
  'onboard-la-merge-tool': { heygenId: '43c797d441114299aaa1d48539e1a7e4', localPath: 'onboarding/la/merge-tool.mp4', cloudinaryId: 'training_videos/onboarding/la/merge-tool' },
  'onboard-la-analytics': { heygenId: 'dde9cfa221aa4ae1893eabcdb384fdb9', localPath: 'onboarding/la/analytics.mp4', cloudinaryId: 'training_videos/onboarding/la/analytics' },
};

// Research portal videos that need to be CREATED
const RESEARCH_VIDEOS_TO_CREATE = [
  {
    id: 'research-methodology',
    title: 'Research Methodology Overview',
    script: `Welcome to the EdPsych Connect Research Portal. I'm Dr Adrian, and I'll guide you through our evidence-based research methodology.

Our platform is built on rigorous educational psychology principles, integrating the latest peer-reviewed research with practical classroom application.

Every assessment, intervention, and recommendation on EdPsych Connect is grounded in the ECCA Framework - our proprietary Evidence-Centered Cognitive Assessment methodology.

This ensures that when you use our platform, you're accessing tools that have been validated through systematic research protocols and meet the highest standards of educational measurement.

Let's explore how you can leverage our research capabilities to inform your practice and contribute to the advancement of SEND support.`,
    localPath: 'research/research-methodology.mp4',
    cloudinaryId: 'training_videos/research/research-methodology'
  },
  {
    id: 'ecca-validation',
    title: 'ECCA Framework Validation',
    script: `The ECCA Framework - Evidence-Centered Cognitive Assessment - represents a paradigm shift in how we understand and support diverse learners.

Developed through extensive collaboration with educational psychologists, classroom teachers, and SEND specialists, ECCA has been validated across multiple cohorts representing thousands of students with varying learning profiles.

Our validation studies demonstrate statistically significant improvements in:
- Assessment accuracy for identifying specific learning differences
- Intervention matching effectiveness
- Progress monitoring sensitivity
- Long-term educational outcomes

The framework continues to be refined through ongoing longitudinal studies, ensuring that EdPsych Connect remains at the cutting edge of evidence-based practice.`,
    localPath: 'research/ecca-validation.mp4',
    cloudinaryId: 'training_videos/research/ecca-validation'
  },
  {
    id: 'data-ethics',
    title: 'Data Ethics and Research Governance',
    script: `At EdPsych Connect, ethical research practice isn't just a requirement - it's foundational to everything we do.

Our data governance framework ensures that all research conducted on our platform adheres to the highest ethical standards, including full GDPR compliance, the British Psychological Society's Code of Ethics, and educational research best practices.

Key principles guiding our research include:
- Informed consent and transparency
- Data minimisation and purpose limitation
- Child-centred safeguarding at all times
- Secure data handling with encryption at rest and in transit
- Clear data ownership - schools and families retain full control

When you contribute to research through EdPsych Connect, you're participating in a system designed to protect participants whilst advancing our collective understanding of effective SEND support.`,
    localPath: 'research/data-ethics.mp4',
    cloudinaryId: 'training_videos/research/data-ethics'
  },
  {
    id: 'intervention-research',
    title: 'Intervention Research Database',
    script: `Our Intervention Research Database represents one of the most comprehensive collections of evidence-based SEND interventions available anywhere.

Each intervention in our library has been systematically evaluated using the What Works Clearinghouse standards, with effect sizes, implementation requirements, and contextual factors clearly documented.

As a researcher, you can:
- Search interventions by learning profile, outcome measure, or implementation context
- Access detailed evidence summaries with links to primary research
- Compare effectiveness across different populations
- Track real-world implementation outcomes from our user community
- Contribute your own research findings to expand the knowledge base

This living database ensures that practitioners always have access to the most current and relevant evidence to inform their decision-making.`,
    localPath: 'research/intervention-research.mp4',
    cloudinaryId: 'training_videos/research/intervention-research'
  },
  {
    id: 'longitudinal-studies',
    title: 'Longitudinal Studies Programme',
    script: `Understanding the long-term impact of educational interventions requires sustained, systematic data collection. Our Longitudinal Studies Programme makes this possible at scale.

Through EdPsych Connect, participating schools can contribute to multi-year research initiatives tracking:
- Developmental trajectories of learners with specific profiles
- Long-term effectiveness of intervention programmes
- Predictive validity of assessment measures
- Factors influencing successful transitions

Schools participating in longitudinal studies receive:
- Detailed cohort progress reports
- Early access to research findings
- Professional development credits
- Direct connection with leading researchers

This collaborative approach accelerates our understanding of what works, for whom, and under what conditions.`,
    localPath: 'research/longitudinal-studies.mp4',
    cloudinaryId: 'training_videos/research/longitudinal-studies'
  },
  {
    id: 'clinical-trials',
    title: 'Clinical Trials and RCT Framework',
    script: `For the highest level of evidence, randomised controlled trials remain the gold standard. EdPsych Connect provides infrastructure for conducting rigorous RCTs in educational settings.

Our Clinical Trials Framework supports:
- Participant recruitment and randomisation
- Intervention fidelity monitoring
- Blinded outcome assessment
- Statistical analysis with appropriate corrections
- Transparent results reporting

Current and upcoming trials are examining:
- Novel assessment approaches for specific learning difficulties
- Technology-enhanced intervention delivery
- Professional development effectiveness
- Family engagement strategies

Researchers interested in conducting trials through our platform can apply through our Research Partnership Programme. Together, we're building the evidence base that will transform SEND support for generations to come.`,
    localPath: 'research/clinical-trials.mp4',
    cloudinaryId: 'training_videos/research/clinical-trials'
  },
  // ============================================================================
  // RESEARCH ETHICS VIDEOS - December 2025
  // ============================================================================
  {
    id: 'research-ethics-submission',
    title: 'Research Ethics Submission Guide',
    script: `Hello, I'm Dr Sarah Chen, and I'm delighted to guide you through the research ethics submission process on EdPsych Connect.

Our platform takes research ethics extremely seriously. As practitioners working with children and young people with special educational needs, we have a profound responsibility to ensure all research is conducted ethically and safely.

Let me walk you through the submission process:

Step one: Project Details. You'll need to provide your research title, objectives, and a clear timeline. Be specific about what you're investigating and why it matters for educational outcomes.

Step two: Methodology. Describe your research design, whether quantitative, qualitative, or mixed methods. Our platform supports various approaches, but we need to understand exactly how you'll collect and analyse data.

Step three: Participants. This is crucial. Specify age ranges, sample sizes, and how you'll recruit participants. Remember, research involving children under sixteen requires enhanced safeguarding protocols.

Step four: Data Protection. Explain how you'll store, process, and eventually dispose of data. Our platform provides UK GDPR-compliant infrastructure, but you must detail your specific data handling procedures.

Step five: Declaration. You'll confirm your understanding of ethical principles and commitment to participant welfare.

The review process typically takes five to ten working days. Our ethics committee includes educational psychologists, data protection specialists, and safeguarding leads.

Once approved, you'll receive a certificate valid for twelve months. Annual reviews ensure ongoing compliance.

Thank you for your commitment to ethical research. Together, we're building an evidence base that truly serves children and young people.`,
    localPath: 'research/ethics-submission.mp4',
    cloudinaryId: 'training_videos/research/ethics-submission'
  },
  {
    id: 'research-data-governance',
    title: 'Research Data Governance Framework',
    script: `Welcome. I'm Dr Sarah Chen, and today we'll explore our Research Data Governance Framework.

Data governance isn't just about compliance—it's about respecting the trust families place in us when they share sensitive information about their children.

Our framework operates on five key principles:

First, Data Minimisation. Collect only what you genuinely need. Every data point should serve a specific research purpose.

Second, Purpose Limitation. Data collected for one research project cannot be repurposed without explicit consent. This protects participants from scope creep.

Third, Anonymisation and Pseudonymisation. We provide robust tools for removing identifying information whilst maintaining research utility. Our techniques meet Information Commissioner's Office standards.

Fourth, Secure Storage. All research data is encrypted at rest and in transit. Access is controlled through role-based permissions that you define.

Fifth, Retention and Disposal. Set clear timelines for data retention. Our platform can automatically flag data for secure deletion when your study concludes.

For longitudinal studies, we offer extended retention with annual consent verification. Participants can withdraw at any point, and their data will be removed within forty-eight hours.

Remember, our Data Protection Officer is available for consultation. We want your research to succeed whilst maintaining the highest ethical standards.

Good data governance leads to better science. Thank you.`,
    localPath: 'research/data-governance.mp4',
    cloudinaryId: 'training_videos/research/data-governance'
  },
  // ============================================================================
  // MIS INTEGRATION VIDEOS - December 2025
  // ============================================================================
  {
    id: 'mis-wonde-setup',
    title: 'Wonde MIS Integration Setup',
    script: `Hello, I'm Marcus, and I'll guide you through connecting your school's Management Information System via Wonde.

Wonde acts as a secure bridge between your MIS and EdPsych Connect. It's used by thousands of UK schools and fully complies with Department for Education data standards.

Let's get started:

First, navigate to Settings, then Integrations. Click "Connect MIS" and select Wonde from the provider list.

You'll need your Wonde API key. If your school is already registered with Wonde, your IT administrator can provide this. If not, registration takes about five minutes on the Wonde website.

Enter your API key and click "Verify Connection". Our system will authenticate and display your school name for confirmation.

Next, configure your sync options. You can choose to sync:
- Students and their demographic data
- Staff information including roles
- Class and group assignments
- SEND status and provision information

I recommend starting with student data only. You can enable additional syncs later once you're comfortable with the process.

Set your sync frequency—daily is typical, but some schools prefer real-time updates.

Click "Save Configuration" and then "Run Initial Sync". The first sync may take several minutes depending on your school size.

Once complete, you'll see your students appear in the platform, ready for assessment and intervention tracking.

If you encounter any issues, our technical support team is available during school hours. The most common issue is API key permissions—ensure your Wonde account has read access enabled.

That's it! You're now connected. Welcome to streamlined data management.`,
    localPath: 'admin/mis-wonde-setup.mp4',
    cloudinaryId: 'training_videos/admin/mis-wonde-setup'
  },
  {
    id: 'mis-sims-integration',
    title: 'SIMS Integration Guide',
    script: `Hello, I'm Marcus. If your school uses Capita SIMS, this video will show you how to integrate it with EdPsych Connect.

SIMS is the UK's most widely used school management system, and we've built a robust integration that respects its data structure.

There are two ways to connect:

Option one: Via Wonde. If you're already using Wonde, or want the easiest setup, use our Wonde integration. It handles the SIMS connection automatically.

Option two: Direct SIMS Connect. For schools preferring direct integration, you'll need your SIMS online credentials and API access enabled by Capita.

Let me walk through the direct connection:

In Settings, Integrations, select "SIMS Direct" from the provider dropdown.

Enter your SIMS online URL—this typically looks like your school domain followed by "simsinternal".

Provide your service account credentials. Your IT team should create a dedicated account for integrations rather than using a personal login.

Click "Test Connection". If successful, you'll see a green tick and your school details.

Configure your data mapping. SIMS uses specific field names—our system automatically maps these, but you can customise if needed.

The most important mapping is SEND Status. Ensure your SIMS SEND codes align with our provision categories. We provide a mapping table in our documentation.

Enable two-way sync if you want assessment results to flow back into SIMS. This requires write permissions in your service account.

Finally, set your sync schedule and run the initial import.

Remember, SIMS data belongs to your school. We only access what you explicitly permit.

Questions? Our SIMS specialists can assist via the help desk.`,
    localPath: 'admin/mis-sims-integration.mp4',
    cloudinaryId: 'training_videos/admin/mis-sims-integration'
  },
  {
    id: 'mis-arbor-integration',
    title: 'Arbor MIS Integration',
    script: `Hello, I'm Marcus. Let's connect your Arbor MIS to EdPsych Connect.

Arbor's modern API makes integration straightforward. Most schools complete setup in under ten minutes.

Start in Settings, Integrations, and select "Arbor" from the dropdown.

You'll need to generate an API token in Arbor. Here's how:

Log into Arbor, go to School Settings, then API Access. Click "Generate New Token". Give it a descriptive name like "EdPsych Connect Integration".

Set the permissions—you'll need read access to Students, Staff, and SEND data. If you want assessment data to sync back, enable write access to Custom Fields.

Copy the generated token immediately—it won't be shown again.

Back in EdPsych Connect, paste your API token and enter your school's Arbor URL.

Click "Verify". The system checks your credentials and confirms the connection.

Now configure your sync preferences:

Student Demographics—recommended for all schools.
SEND Register—essential for intervention tracking.
Attendance Data—useful for correlating support with attendance patterns.
Assessment Data—enables round-trip sync.

Arbor excels at custom fields. You can map our assessment scores and provision data directly into your Arbor student profiles.

Set your sync frequency. Arbor handles real-time syncs efficiently, so we recommend enabling automatic updates.

Run your initial sync and verify the data matches your expectations.

One tip: Arbor's academic year structure differs from SIMS. Ensure your year groups are correctly mapped in the configuration.

That's it—you're connected to Arbor. Enjoy the seamless data flow.`,
    localPath: 'admin/mis-arbor-integration.mp4',
    cloudinaryId: 'training_videos/admin/mis-arbor-integration'
  },
  {
    id: 'mis-sync-troubleshooting',
    title: 'MIS Sync Troubleshooting',
    script: `Hello, I'm Marcus. Having issues with your MIS sync? Let's troubleshoot together.

Most sync problems fall into four categories: authentication, permissions, data mapping, and network issues.

Authentication Problems:

If you see "Invalid credentials" or "Token expired", your API key may have expired. Most keys last twelve months. Generate a new one in your MIS and update it in EdPsych Connect settings.

For SIMS, ensure your service account password hasn't been changed by IT policy.

Permission Errors:

"Access denied" usually means your API account lacks necessary permissions. In Wonde, check your app has "Read Students" enabled. In Arbor, verify your token includes the required scopes.

Remember, some sensitive data requires explicit approval from your Data Protection Officer.

Data Mapping Issues:

If students appear but data seems wrong, check your field mappings. Common issues include:
- Year group mismatches—UK years versus key stages
- SEND codes that don't translate—ensure your MIS codes match our categories
- Date formats—some systems use American date formats internally

Use our mapping preview tool to see how data will transform before syncing.

Network Problems:

Timeouts often indicate network restrictions. Your school firewall may block our API endpoints. Provide your IT team with our IP whitelist from the documentation.

If syncs start but fail partway, there may be a rate limit. Reduce sync frequency or enable batch mode.

Duplicate Records:

If you see duplicate students, check your unique identifier settings. We recommend using UPN as the primary key.

Still stuck? Our support team can access sync logs with your permission. We'll identify exactly where the process fails.

Thank you for your patience. Most issues resolve within one support ticket.`,
    localPath: 'admin/mis-sync-troubleshooting.mp4',
    cloudinaryId: 'training_videos/admin/mis-sync-troubleshooting'
  },
  // ============================================================================
  // ASSESSMENT ESSENTIALS VIDEOS - December 2025
  // ============================================================================
  {
    id: 'assess-m1-l1',
    title: 'Assessment Essentials: Understanding Learning Profiles',
    script: `Hello, I'm Dr Adrian, and welcome to Assessment Essentials Module One, Lesson One: Understanding Learning Profiles.

Every learner is unique. As educational practitioners, our role is to understand the individual profile of each child and use that understanding to inform our support.

A learning profile is more than just a list of strengths and difficulties. It's a comprehensive picture of how a child thinks, learns, processes information, and engages with their environment.

In this lesson, we'll explore the key components of a learning profile:

Cognitive Processing: How does the child take in, store, and retrieve information? Are there differences in verbal versus visual processing? What about working memory capacity?

Learning Style Preferences: While we must be careful not to oversimplify, understanding whether a child benefits from auditory, visual, or kinaesthetic approaches helps us differentiate instruction effectively.

Attention and Executive Function: Can the child sustain focus? How well do they plan, organise, and self-monitor? These skills underpin all academic learning.

Social and Emotional Factors: Learning doesn't happen in isolation. A child's emotional state, self-concept, and social relationships profoundly impact their educational progress.

Sensory Considerations: Some children have sensory processing differences that affect how they experience the classroom environment.

On EdPsych Connect, our assessment tools help you build comprehensive learning profiles systematically. The platform guides you through each domain, ensuring no important aspect is overlooked.

Remember, assessment is not about labelling children—it's about understanding them deeply so we can teach them effectively.

In our next lesson, we'll explore how to use these profiles to match interventions precisely to need.

Thank you for joining me. See you in Lesson Two.`,
    localPath: 'assessment-essentials/assess-m1-l1.mp4',
    cloudinaryId: 'training_videos/assessment-essentials/assess-m1-l1'
  },
  {
    id: 'assess-m2-l1',
    title: 'Assessment Essentials: Formative Assessment Strategies',
    script: `Welcome back. I'm Dr Adrian, and this is Assessment Essentials Module Two, Lesson One: Formative Assessment Strategies.

Formative assessment is the heartbeat of effective teaching. Unlike summative assessment, which measures what students have learned, formative assessment guides what we do next.

Think of it as assessment FOR learning, not just assessment OF learning.

Effective formative assessment has several key characteristics:

First, it's ongoing. We're not waiting for the end of a unit to discover students are struggling. We're checking understanding continuously.

Second, it informs instruction. The data we gather immediately shapes our teaching decisions. If students don't understand, we adjust our approach.

Third, it involves students. When learners understand what success looks like and can assess their own progress, they become partners in the learning process.

Let me share some powerful formative assessment strategies:

Exit Tickets: At the end of each lesson, students respond to a quick question. You immediately see who needs additional support.

Think-Pair-Share: Students think individually, discuss with a partner, then share with the class. This gives you insight into collective understanding.

Mini Whiteboards: Students show answers simultaneously. No one can hide, and you get instant whole-class data.

Hinge Questions: Multiple-choice questions where each wrong answer reveals a specific misconception. Brilliant for diagnostic purposes.

Traffic Light Self-Assessment: Students rate their confidence using red, amber, green. Those showing amber often need small-group intervention.

On EdPsych Connect, our formative assessment tools automate data collection while preserving these interactive strategies. You can see patterns across your class instantly.

For students with SEND, formative assessment is especially crucial. Their learning trajectories may not follow typical patterns, so continuous monitoring ensures we catch difficulties early and celebrate progress immediately.

In Lesson Two, we'll explore how to use formative data to differentiate instruction effectively.

Until then, try implementing one new formative strategy this week. Notice what you learn about your students.`,
    localPath: 'assessment-essentials/assess-m2-l1.mp4',
    cloudinaryId: 'training_videos/assessment-essentials/assess-m2-l1'
  },
  {
    id: 'assess-m2-l2',
    title: 'Assessment Essentials: Differentiation Through Data',
    script: `Hello again. I'm Dr Adrian, continuing Assessment Essentials Module Two with Lesson Two: Differentiation Through Data.

You've gathered formative assessment data. Now what? This lesson connects assessment to action through data-driven differentiation.

Differentiation isn't about creating thirty different lesson plans. It's about making strategic adjustments based on what your assessment data tells you.

Let's explore three dimensions of differentiation:

Content Differentiation: Adjusting what students learn. If assessment shows some students have already mastered prerequisite skills, they can access more challenging content. Those still developing foundations need scaffolded material.

Process Differentiation: Adjusting how students learn. Your formative data might reveal that some students benefit from collaborative work while others need quiet, focused time. Some need hands-on activities; others prefer written explanations.

Product Differentiation: Adjusting how students demonstrate learning. Not everyone needs to write an essay. Assessment data helps you identify appropriate ways for each student to show what they know.

Here's a practical framework for using data:

Step One: Analyse patterns. Look across your class data. Are there clusters of students with similar needs?

Step Two: Form flexible groups. Based on current data, group students who need similar support. Remember, these groups should change as students progress.

Step Three: Plan targeted interventions. For each group, what specific teaching will move them forward?

Step Four: Monitor and adjust. Use ongoing formative assessment to check your interventions are working. Be ready to change course.

EdPsych Connect excels at this process. Our analytics identify patterns you might miss. Our intervention library suggests evidence-based approaches for specific learning gaps. Our progress monitoring tracks whether differentiation is effective.

For students with SEND, differentiation is not optional—it's essential. Their Individual Education Plans should reflect data-informed decisions, not assumptions.

One crucial point: differentiation should provide appropriate challenge for everyone, including high-attaining students. It's not just about supporting struggling learners.

In our next module, we'll explore summative assessment and how it complements the formative strategies we've discussed.

Thank you for your commitment to data-informed teaching. Your students are fortunate to have such thoughtful educators.`,
    localPath: 'assessment-essentials/assess-m2-l2.mp4',
    cloudinaryId: 'training_videos/assessment-essentials/assess-m2-l2'
  },
  // ============================================================================
  // DYSLEXIA INTERVENTION STRATEGIES - 8 videos
  // ============================================================================
  {
    id: 'dys-m1-l1',
    title: 'Dyslexia Module 1: Understanding Dyslexia',
    script: `Hello, I'm Dr Sarah Chen, and welcome to our Dyslexia Intervention Strategies course. This is Module One: Understanding Dyslexia.

Dyslexia affects approximately ten percent of the population, making it one of the most common specific learning difficulties. Yet it remains widely misunderstood.

Let's start with what dyslexia actually is.

Dyslexia is a neurological difference that primarily affects reading, spelling, and writing. It's not about intelligence—many individuals with dyslexia have average or above-average cognitive abilities.

The core difficulty lies in phonological processing—the ability to identify and manipulate the sound structures of language. This affects how the brain maps sounds to letters and words.

Key characteristics include:

Difficulty with phoneme awareness—distinguishing individual sounds in words.
Slow or inaccurate word reading, particularly unfamiliar words.
Poor spelling, often with phonetically plausible but incorrect attempts.
Reading that requires significant effort and concentration.
Difficulty with rapid automatic naming of letters, numbers, or colours.

Importantly, dyslexia exists on a spectrum. Some individuals have mild difficulties; others face significant challenges. The expression varies based on the language being learned, the quality of instruction received, and individual compensatory strategies.

On EdPsych Connect, our dyslexia screening tools help identify these patterns early. Early identification leads to early intervention, which significantly improves outcomes.

In our next lesson, we'll explore evidence-based screening approaches you can implement immediately.

Thank you for beginning this important learning journey.`,
    localPath: 'dyslexia-intervention-strategies/dys-m1-l1.mp4',
    cloudinaryId: 'training_videos/dyslexia-intervention-strategies/dys-m1-l1'
  },
  {
    id: 'dys-m2-l1',
    title: 'Dyslexia Module 2: Phonological Awareness Interventions',
    script: `Welcome back. I'm Dr Sarah Chen, continuing our Dyslexia Intervention Strategies course with Module Two: Phonological Awareness Interventions.

Phonological awareness is the foundation of reading. For students with dyslexia, explicit instruction in this area is essential.

Phonological awareness encompasses several skills:

Rhyme recognition—hearing that "cat" and "hat" share an ending sound.
Syllable segmentation—breaking "elephant" into "el-e-phant."
Onset-rime awareness—recognising that "cat" starts with "c" and ends with "at."
Phoneme isolation—identifying that "fish" starts with the "f" sound.
Phoneme manipulation—changing "cat" to "bat" by substituting the first sound.

For students with dyslexia, these skills don't develop automatically. They need explicit, systematic instruction.

Effective interventions include:

Elkonin boxes—using visual boxes to represent sounds in words. Students push tokens into boxes as they segment words.

Sound sorting activities—categorising pictures or words by initial, medial, or final sounds.

Phoneme manipulation games—"What word do we get if we change the 'm' in 'mat' to 's'?"

Multisensory approaches—combining visual, auditory, and kinaesthetic elements. Tracing letters in sand while saying sounds, for example.

Research shows that phonological awareness intervention should be:
Explicit—directly teaching the skill, not hoping students discover it.
Systematic—following a logical progression from easier to harder skills.
Intensive—frequent, focused sessions rather than occasional practice.
Multisensory—engaging multiple pathways to the brain.

EdPsych Connect's intervention library includes structured phonological awareness programmes with progress monitoring built in.

In Module Three, we'll explore how to build from phonological awareness to phonics instruction.`,
    localPath: 'dyslexia-intervention-strategies/dys-m2-l1.mp4',
    cloudinaryId: 'training_videos/dyslexia-intervention-strategies/dys-m2-l1'
  },
  {
    id: 'dys-m3-l1',
    title: 'Dyslexia Module 3: Structured Literacy Approaches',
    script: `Hello again. I'm Dr Sarah Chen with Module Three of our Dyslexia Intervention Strategies course: Structured Literacy Approaches.

Structured Literacy is the gold standard for teaching reading to students with dyslexia. It's also highly effective for all learners.

Structured Literacy has several defining characteristics:

Systematic and cumulative—skills are taught in a logical sequence, building on previously mastered content.

Explicit—nothing is left to chance. Teachers directly explain concepts and model strategies.

Diagnostic—instruction responds to individual student needs, identified through ongoing assessment.

The content of Structured Literacy includes:

Phonology—the sound system of language.
Sound-symbol association—mapping sounds to letters and letter patterns.
Syllable instruction—teaching the six syllable types and how to decode multisyllabic words.
Morphology—understanding meaningful word parts like prefixes, suffixes, and roots.
Syntax—grammar and sentence structure.
Semantics—meaning at word, sentence, and text levels.

Popular Structured Literacy programmes include Orton-Gillingham, Wilson Reading System, and Barton Reading and Spelling.

Key instructional principles:

Teach one concept at a time and ensure mastery before moving on.
Provide extensive practice with immediate corrective feedback.
Use decodable texts that align with taught skills.
Incorporate multisensory techniques consistently.
Review previously taught material regularly.

For teachers, implementing Structured Literacy requires specific training. It's not intuitive—it's a learned skill set.

EdPsych Connect provides Structured Literacy resources and progress monitoring tools aligned with these principles.

Next, we'll examine fluency building strategies for dyslexic learners.`,
    localPath: 'dyslexia-intervention-strategies/dys-m3-l1.mp4',
    cloudinaryId: 'training_videos/dyslexia-intervention-strategies/dys-m3-l1'
  },
  {
    id: 'dys-m4-l1',
    title: 'Dyslexia Module 4: Building Reading Fluency',
    script: `Welcome to Module Four: Building Reading Fluency. I'm Dr Sarah Chen.

Fluency is often called the bridge between decoding and comprehension. For students with dyslexia, building fluency requires intentional, sustained effort.

Reading fluency has three components:

Accuracy—reading words correctly.
Rate—reading at an appropriate speed.
Prosody—reading with expression that reflects understanding.

Students with dyslexia often struggle with all three. They may decode accurately but so slowly that comprehension suffers. Or they may read quickly but make frequent errors.

Evidence-based fluency interventions include:

Repeated reading—reading the same passage multiple times until fluency criteria are met. Research shows this transfers to new texts.

Partner reading—pairing students to take turns reading aloud, providing immediate feedback.

Audio-assisted reading—students read along with a recorded model. This builds correct phrasing and expression.

Phrase-cued reading—marking text to show natural phrase boundaries, helping students chunk appropriately.

Reader's theatre—practising scripts for performance motivates repeated reading naturally.

Critical considerations for dyslexic learners:

Ensure the text is at an appropriate level. Frustration-level text won't build fluency.
Focus on accuracy first. Speed without accuracy isn't true fluency.
Celebrate progress. Fluency development is slow but steady with consistent practice.
Use progress monitoring. Graph words correct per minute to show growth visually.

EdPsych Connect's fluency tools include timed reading passages, progress graphs, and audio recording features for self-assessment.

In Module Five, we'll address reading comprehension strategies.`,
    localPath: 'dyslexia-intervention-strategies/dys-m4-l1.mp4',
    cloudinaryId: 'training_videos/dyslexia-intervention-strategies/dys-m4-l1'
  },
  {
    id: 'dys-m5-l1',
    title: 'Dyslexia Module 5: Comprehension Strategies',
    script: `Hello. I'm Dr Sarah Chen with Module Five: Comprehension Strategies for Students with Dyslexia.

A common misconception is that dyslexia only affects decoding. In reality, comprehension often suffers too—not because of thinking difficulties, but because so much cognitive energy goes to word reading.

When students with dyslexia are given text at their listening comprehension level, they often understand brilliantly. The barrier is accessing the text, not understanding it.

Strategies to support comprehension include:

Pre-reading activities—build background knowledge before reading. Discuss the topic, review key vocabulary, set a purpose for reading.

Graphic organisers—provide visual frameworks for organising information. Story maps, Venn diagrams, and concept webs reduce cognitive load.

Think-alouds—model your own comprehension processes. "I'm confused here, so I'm going to reread this paragraph."

Questioning strategies—teach students to generate their own questions before, during, and after reading.

Summarisation—practise identifying main ideas and condensing information into key points.

Monitoring comprehension—help students recognise when understanding breaks down and what to do about it.

Accommodations that support comprehension:

Audiobooks and text-to-speech allow access to grade-level content while decoding skills develop.
Extended time reduces the pressure that interferes with comprehension.
Reduced reading volume focuses energy on fewer, more deeply understood texts.
Discussion-based assessment reveals understanding that written responses might miss.

Remember, comprehension is the goal of reading. We must ensure decoding difficulties don't prevent students from developing higher-order thinking skills.

Module Six will cover writing support strategies.`,
    localPath: 'dyslexia-intervention-strategies/dys-m5-l1.mp4',
    cloudinaryId: 'training_videos/dyslexia-intervention-strategies/dys-m5-l1'
  },
  {
    id: 'dys-m6-l2',
    title: 'Dyslexia Module 6: Writing and Spelling Support',
    script: `Welcome to Module Six: Writing and Spelling Support. I'm Dr Sarah Chen.

For students with dyslexia, writing presents unique challenges. The same phonological processing difficulties that affect reading also impact spelling and written expression.

Spelling difficulties manifest as:

Phonetically plausible but incorrect spellings—"enuff" for "enough."
Inconsistent spelling of the same word.
Letter reversals and transpositions beyond the developmental stage.
Difficulty with irregular or exception words.

Effective spelling instruction for dyslexic learners:

Teach spelling patterns explicitly alongside reading instruction.
Use multisensory techniques—trace words, use letter tiles, spell aloud.
Focus on high-frequency words that appear often in writing.
Teach morphological awareness—understanding prefixes, suffixes, and roots helps with spelling.
Allow spell-checkers and word prediction software as tools, not crutches.

Written expression challenges include:

Getting ideas onto paper—the mechanics are so demanding that content suffers.
Organisation—sequencing ideas logically.
Revision—reading their own writing to improve it.

Strategies to support writing:

Separate the writing process into distinct stages—planning, drafting, revising, editing. Don't expect all at once.
Use graphic organisers for planning before writing begins.
Allow dictation for initial drafts to capture ideas without mechanical barriers.
Provide explicit instruction in sentence and paragraph structure.
Use assistive technology—speech-to-text, word prediction, and grammar checkers.

EdPsych Connect includes writing scaffolds and progress monitoring tools specifically designed for dyslexic learners.

Module Seven will address technology tools and accommodations.`,
    localPath: 'dyslexia-intervention-strategies/dys-m6-l2.mp4',
    cloudinaryId: 'training_videos/dyslexia-intervention-strategies/dys-m6-l2'
  },
  {
    id: 'dys-m7-l1',
    title: 'Dyslexia Module 7: Technology and Accommodations',
    script: `Hello. I'm Dr Sarah Chen with Module Seven: Technology and Accommodations for Students with Dyslexia.

Technology has transformed what's possible for dyslexic learners. Used well, it removes barriers while building skills.

Text-to-speech software reads digital text aloud, allowing students to access content at their intellectual level. Popular options include Natural Reader, Voice Dream, and built-in features on most devices.

Speech-to-text technology converts spoken words to written text. This allows students to capture ideas without the mechanical barrier of typing or handwriting. Dragon NaturallySpeaking and built-in dictation tools work well.

Audiobooks provide access to literature and informational text. Services like Learning Ally offer human-narrated audiobooks specifically for learning differences.

Reading pens scan and read printed text aloud. Useful when digital text isn't available.

Word prediction software suggests words as students type, reducing spelling demands. Co:Writer and built-in prediction features help.

Mind mapping software like MindMeister or Coggle supports planning and organisation visually.

Accommodations versus modifications:

Accommodations level the playing field without changing what's being measured. Extended time, audiobooks, and spell-checkers are accommodations.

Modifications change the expectations. Reduced word counts or simplified content are modifications.

Students with dyslexia typically need accommodations, not modifications. Their cognitive abilities match their peers; they just need different access routes.

Classroom accommodations to consider:

Preferential seating to reduce distractions.
Copies of notes or slides before lessons.
Alternative ways to demonstrate learning—oral presentations, projects, discussions.
Chunked assignments with check-in points.
Clear, consistent routines that reduce cognitive load.

Module Eight will address working with families and building self-advocacy.`,
    localPath: 'dyslexia-intervention-strategies/dys-m7-l1.mp4',
    cloudinaryId: 'training_videos/dyslexia-intervention-strategies/dys-m7-l1'
  },
  {
    id: 'dys-m8-l1',
    title: 'Dyslexia Module 8: Family Partnership and Self-Advocacy',
    script: `Welcome to our final module: Family Partnership and Self-Advocacy. I'm Dr Sarah Chen.

Supporting students with dyslexia requires a team approach. Families are essential partners.

Communicating with families:

Use clear, jargon-free language. Explain what dyslexia means in practical terms.
Focus on strengths alongside challenges. Dyslexic individuals often excel in creative thinking, problem-solving, and big-picture analysis.
Provide specific strategies families can use at home. Reading together, audiobooks, and word games all help.
Share progress regularly. Families need to see that intervention is working.

Supporting home practice:

Keep sessions short—ten to fifteen minutes of focused practice is more effective than longer, frustrating sessions.
Make it enjoyable. Games and apps can provide practice without feeling like work.
Celebrate effort, not just outcomes. The journey matters.

Building self-advocacy:

Students need to understand their own learning profile. This isn't about labelling—it's about self-knowledge.

Teach students to:
Explain their strengths and challenges.
Request accommodations appropriately.
Use their tools independently.
Advocate for themselves in new situations.

As students mature, they should lead their own IEP or support plan meetings. This builds ownership and prepares them for post-school success.

The emotional dimension:

Dyslexia impacts self-esteem. Years of struggle can lead to anxiety, avoidance, and negative self-perception.

Build in success experiences. Ensure students have opportunities to shine.
Normalise the difficulty. Many successful people are dyslexic—Richard Branson, Steven Spielberg, Keira Knightley.
Provide emotional support alongside academic intervention.

Thank you for completing this course. Your commitment to understanding and supporting dyslexic learners will change lives.`,
    localPath: 'dyslexia-intervention-strategies/dys-m8-l1.mp4',
    cloudinaryId: 'training_videos/dyslexia-intervention-strategies/dys-m8-l1'
  },
  // ============================================================================
  // EHCP MASTERY - 1 video
  // ============================================================================
  {
    id: 'ehcp-m1-l1',
    title: 'EHCP Mastery: Understanding the EHCP Process',
    script: `Hello, I'm Marcus, and welcome to EHCP Mastery Module One: Understanding the EHCP Process.

An Education, Health and Care Plan—or EHCP—is a legal document for children and young people aged zero to twenty-five who need more support than is available through standard SEN provision.

Understanding the process is essential for everyone involved—schools, families, and professionals.

The EHCP journey begins with identification.

Schools should identify and support children with SEN through their graduated approach—assess, plan, do, review. If a child isn't making adequate progress despite quality-first teaching and targeted interventions, an EHCP assessment may be appropriate.

Requesting an assessment:

Parents, schools, or other professionals can request an EHC needs assessment from the Local Authority. The request must demonstrate that the child may need provision beyond what's normally available.

The Local Authority has six weeks to decide whether to assess. They must consider whether the child has, or may have, SEN, and whether they may need provision through an EHCP.

The assessment process:

If assessment proceeds, the Local Authority gathers advice from:
Parents and the child or young person.
The school or educational setting.
An educational psychologist.
Health services.
Social care.
Any other relevant professionals.

This phase takes up to sixteen weeks. All advice should be completed within six weeks of being requested.

Drafting the plan:

The Local Authority drafts the EHCP based on all advice received. The draft is shared with parents, who have fifteen days to comment and express a preference for educational placement.

Finalising the plan:

The final EHCP must be issued within twenty weeks of the initial request. It must include:
Section A: Views of the child and parents.
Section B: Special educational needs.
Section C: Health needs related to SEN.
Section D: Social care needs related to SEN.
Section E: Outcomes sought.
Section F: Special educational provision.
Sections G, H, I, J: Health provision, social care provision, and placement.

EdPsych Connect's EHCP tools guide you through each stage with templates and timelines.

In the next lesson, we'll explore how to write effective EHCP sections.`,
    localPath: 'ehcp-mastery/ehcp-m1-l1.mp4',
    cloudinaryId: 'training_videos/ehcp-mastery/ehcp-m1-l1'
  },
  // ============================================================================
  // EVIDENCE-BASED INTERVENTIONS - 2 videos
  // ============================================================================
  {
    id: 'int-m1-l1',
    title: 'Evidence-Based Interventions Module 1: What Works in SEND',
    script: `Hello, I'm Dr Adrian, and welcome to our Evidence-Based Interventions course. This is Module One: What Works in SEND.

In education, we're surrounded by programmes, approaches, and products claiming to help students with special educational needs. How do we know what actually works?

Evidence-based practice means using interventions that have been rigorously tested and shown to be effective through research.

The hierarchy of evidence:

At the top are randomised controlled trials—where students are randomly assigned to receive an intervention or not, and outcomes are compared.

Below that are quasi-experimental studies—comparing groups without random assignment.

Then observational studies, case studies, and expert opinion.

The strongest evidence comes from meta-analyses—studies that combine results from multiple trials to identify overall effects.

Where to find evidence:

The Education Endowment Foundation's Teaching and Learning Toolkit synthesises research on various approaches and reports effect sizes.

What Works Clearinghouse in the United States evaluates intervention programmes.

The SEND Review of Research from the Department for Education summarises evidence specific to special educational needs.

Red flags for weak evidence:

Claims that seem too good to be true.
Reliance on testimonials rather than data.
Small sample sizes or lack of control groups.
Commercial interests driving the research.
Lack of peer review.

Implementing evidence-based interventions:

Fidelity matters. Programmes work when implemented as designed. Modifications may reduce effectiveness.

Context matters. What works in one setting may need adaptation for another.

Monitoring matters. Even evidence-based interventions don't work for every child. Progress monitoring identifies who's responding and who needs adjustment.

EdPsych Connect's intervention library rates programmes by evidence strength and provides implementation guidance.

Module Two will explore specific high-impact interventions across SEND categories.`,
    localPath: 'evidence-based-interventions/int-m1-l1.mp4',
    cloudinaryId: 'training_videos/evidence-based-interventions/int-m1-l1'
  },
  {
    id: 'int-m2-l1',
    title: 'Evidence-Based Interventions Module 2: High-Impact Strategies',
    script: `Welcome back. I'm Dr Adrian with Module Two: High-Impact Strategies Across SEND.

Let's examine interventions with strong evidence bases across different areas of need.

For literacy difficulties:

Phonics instruction shows strong evidence, with effect sizes around plus zero point four. Systematic synthetic phonics is particularly effective.

Reading comprehension strategies—including prediction, questioning, and summarisation—show effect sizes of plus zero point six.

One-to-one tutoring delivers significant gains, especially when delivered by trained teaching assistants using structured programmes.

For mathematics difficulties:

Explicit instruction with worked examples outperforms discovery-based approaches for struggling learners.

Concrete-pictorial-abstract progression builds conceptual understanding alongside procedural fluency.

Mastery learning—ensuring students fully understand one concept before moving on—prevents gaps from compounding.

For behaviour and attention:

Self-regulation strategies show strong evidence. Teaching students to monitor and manage their own behaviour is highly effective.

Cognitive behavioural approaches help students understand the connections between thoughts, feelings, and actions.

Environmental modifications—reducing distractions, providing movement breaks, using visual schedules—support attention difficulties.

For speech and language:

Explicit vocabulary instruction with multiple exposures in context builds word knowledge.

Narrative intervention strengthens story comprehension and production.

Collaborative approaches between speech therapists and teachers ensure consistency.

For social and emotional needs:

Social skills training delivered in structured programmes shows moderate effects.

Emotion coaching helps students identify and manage their feelings.

Peer-mediated interventions leverage the power of positive peer relationships.

Key principles across all areas:

Intensity matters. More frequent, focused sessions generally produce better outcomes than occasional, lengthy ones.

Expertise matters. Well-trained staff implementing programmes with fidelity achieve better results.

Responsiveness matters. Adjust interventions based on progress monitoring data.

EdPsych Connect helps you match learner profiles to evidence-based interventions and track their effectiveness.`,
    localPath: 'evidence-based-interventions/int-m2-l1.mp4',
    cloudinaryId: 'training_videos/evidence-based-interventions/int-m2-l1'
  },
  // ============================================================================
  // SEND FUNDAMENTALS - 3 videos
  // ============================================================================
  {
    id: 'send-fund-m1-l1',
    title: 'SEND Fundamentals Module 1: Understanding the SEND Code of Practice',
    script: `Hello, I'm Dr Adrian, and welcome to SEND Fundamentals. This is Module One: Understanding the SEND Code of Practice.

The SEND Code of Practice is the statutory guidance that governs how schools, Local Authorities, and health services identify and support children with special educational needs and disabilities.

Published in 2015, it replaced the previous 2001 Code and introduced significant changes.

Key principles of the Code:

The views, wishes and feelings of children, young people, and their parents must be considered.

Children and young people should participate in decisions about their support.

Information and support should enable participation in decisions.

Provision should support the best possible educational and other outcomes.

Who does the Code apply to?

All maintained schools, academies, and free schools.
All early years providers.
Further education colleges.
Local Authorities.
Health services.
Anyone providing services under the Equality Act.

The four areas of need:

Communication and interaction—including autism spectrum conditions and speech, language, and communication needs.

Cognition and learning—including specific learning difficulties like dyslexia, and moderate, severe, or profound learning difficulties.

Social, emotional, and mental health—including anxiety, depression, attention difficulties, and attachment disorders.

Sensory and physical—including hearing impairment, visual impairment, and physical disabilities.

These categories help with planning, but remember that many children have needs across multiple areas.

The graduated approach:

Schools must follow a cycle of assess, plan, do, review. This means:
Assessing what the child can and cannot do.
Planning targeted support.
Implementing the plan.
Reviewing whether it's working and adjusting accordingly.

This cycle continues, with increasing intensity if needed, before considering an EHCP assessment.

EdPsych Connect's tools support every stage of the graduated approach with assessment templates, intervention libraries, and review frameworks.

Module Two will explore identification and assessment in more depth.`,
    localPath: 'send-fundamentals/send-fund-m1-l1.mp4',
    cloudinaryId: 'training_videos/send-fundamentals/send-fund-m1-l1'
  },
  {
    id: 'send-fund-m2-l1',
    title: 'SEND Fundamentals Module 2: Identification and Assessment',
    script: `Welcome back. I'm Dr Adrian with Module Two of SEND Fundamentals: Identification and Assessment.

Early identification of special educational needs leads to better outcomes. But how do we identify needs accurately and fairly?

Starting points for identification:

Concerns raised by teachers who notice a child struggling despite quality-first teaching.
Concerns from parents who observe differences in their child's development.
Developmental screenings that flag potential difficulties.
Transfer information from previous settings.
Progress monitoring data showing lack of expected growth.

The importance of not labelling too quickly:

Some children develop at different rates. What looks like a difficulty at age five may resolve with maturation.

Environmental factors—including poverty, trauma, and English as an additional language—can affect learning without indicating SEN.

Quality of teaching matters. We must ensure children have received appropriate instruction before concluding they have intrinsic difficulties.

Assessment should be:

Purposeful—conducted to answer specific questions that inform intervention.
Contextual—considering the child's environment, history, and culture.
Holistic—examining strengths as well as difficulties across all developmental areas.
Ongoing—not a one-off event but continuous monitoring.

Types of assessment:

Standardised assessments compare a child's performance to age-related norms. Useful for identifying where a child sits relative to peers.

Criterion-referenced assessments check whether a child has mastered specific skills. Useful for planning next steps.

Dynamic assessment examines how a child learns with support. Reveals potential that static tests might miss.

Observation in natural contexts shows how difficulties manifest in real situations.

Involving specialists:

When school-based assessment isn't sufficient, external specialists may be needed.

Educational psychologists bring expertise in cognitive assessment, learning difficulties, and intervention.

Speech and language therapists assess communication needs.

Occupational therapists assess sensory and motor needs.

Specialist teachers provide expertise in specific areas like vision or hearing.

EdPsych Connect connects you with specialist assessment tools and helps coordinate multi-agency assessment.`,
    localPath: 'send-fundamentals/send-fund-m2-l1.mp4',
    cloudinaryId: 'training_videos/send-fundamentals/send-fund-m2-l1'
  },
  {
    id: 'send-fund-m2-l2',
    title: 'SEND Fundamentals Module 2 Lesson 2: Working with Families',
    script: `Hello again. I'm Dr Adrian, continuing Module Two with a focus on Working with Families.

Parents are experts on their own children. Effective SEND support requires genuine partnership with families.

Building positive relationships:

Start with listening. Parents have often been advocating for their child for years. They have valuable insights.

Avoid jargon. Educational terminology can be alienating. Use clear, accessible language.

Be honest but compassionate. Share concerns directly while acknowledging the emotional impact.

Focus on the child as a whole person, not just their difficulties.

Sharing difficult news:

When assessment reveals significant needs, families experience a range of emotions—grief, denial, anger, guilt, and eventually acceptance.

Allow time and space for emotional responses.

Provide written information to supplement verbal discussions. Parents may not retain everything when upset.

Connect families with support networks—parent groups, charities, and local services.

Involving families in planning:

Co-production means families are equal partners, not passive recipients of professional decisions.

Invite parents to contribute to assessments. Nobody knows a child's home functioning better than the family.

Share draft plans and genuinely incorporate feedback.

Schedule meetings at times families can attend. Provide childcare if needed.

Use formats families can engage with—not everyone communicates best in formal meetings.

Supporting families at home:

Provide specific, practical strategies families can implement.

Be realistic about family capacity. Exhausted parents can't deliver intensive programmes alongside daily life.

Celebrate home successes. When families report progress, acknowledge their contribution.

Respecting diversity:

Different cultures have different understandings of disability and different expectations for family involvement.

Use interpreters when needed—professional interpreters, not family members.

Be sensitive to family structures. Not all children live with two biological parents.

EdPsych Connect includes parent portal features that facilitate communication and co-production while respecting family preferences.

Thank you for your commitment to true partnership with families.`
,
    localPath: 'send-fundamentals/send-fund-m2-l2.mp4',
    cloudinaryId: 'training_videos/send-fundamentals/send-fund-m2-l2'
  }
];

// =============================================================================
// API HELPERS
// =============================================================================

interface HeyGenVideoStatus {
  video_id: string;
  status: 'completed' | 'processing' | 'failed' | 'pending';
  video_url?: string;
  video_url_caption?: string;
  thumbnail_url?: string;
  duration?: number;
  error?: { code: string; message: string };
}

async function fetchJSON(url: string, options: RequestInit = {}): Promise<any> {
  const headers: Record<string, string> = {
    'X-Api-Key': HEYGEN_API_KEY,
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(url, {
      method: options.method || 'GET',
      headers,
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function getVideoStatus(videoId: string): Promise<HeyGenVideoStatus> {
  const response = await fetchJSON(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`);
  return response.data;
}

async function downloadFile(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const file = fs.createWriteStream(destPath);
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const request = client.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadFile(redirectUrl, destPath).then(resolve).catch(reject);
          return;
        }
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    });
    
    request.on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

// =============================================================================
// MAIN FUNCTIONS
// =============================================================================

async function downloadVideos(): Promise<void> {
  console.log('\n' + '='.repeat(80));
  console.log('HEYGEN VIDEO DOWNLOAD - December 2025 Batch');
  console.log('='.repeat(80) + '\n');
  
  const results = { success: 0, failed: 0, skipped: 0 };
  
  for (const [videoKey, config] of Object.entries(DECEMBER_2025_VIDEOS)) {
    const localFullPath = path.join(BASE_VIDEO_DIR, config.localPath);
    
    // Check if already exists
    if (fs.existsSync(localFullPath)) {
      console.log(`✓ SKIP: ${videoKey} - Already downloaded`);
      results.skipped++;
      continue;
    }
    
    console.log(`⟳ DOWNLOADING: ${videoKey}`);
    console.log(`  HeyGen ID: ${config.heygenId}`);
    
    try {
      // Get video status and URL
      const status = await getVideoStatus(config.heygenId);
      
      if (status.status !== 'completed') {
        console.log(`  ⚠ Status: ${status.status} - Cannot download yet`);
        results.failed++;
        continue;
      }
      
      if (!status.video_url) {
        console.log(`  ✗ No video URL available`);
        results.failed++;
        continue;
      }
      
      console.log(`  URL: ${status.video_url.substring(0, 50)}...`);
      
      // Download the video
      await downloadFile(status.video_url, localFullPath);
      
      const stats = fs.statSync(localFullPath);
      console.log(`  ✓ Downloaded: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      results.success++;
      
    } catch (error: any) {
      console.log(`  ✗ Error: ${error.message}`);
      results.failed++;
    }
    
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log('\n' + '-'.repeat(80));
  console.log(`DOWNLOAD COMPLETE: ${results.success} downloaded, ${results.failed} failed, ${results.skipped} skipped`);
  console.log('-'.repeat(80) + '\n');
}

async function generateResearchVideos(): Promise<void> {
  console.log('\n' + '='.repeat(80));
  console.log('HEYGEN VIDEO GENERATION - Research Portal Videos');
  console.log('='.repeat(80) + '\n');
  
  const AVATAR_ID = 'Adrian_public_3_20240312';
  // Using Onyx - OpenAI multilingual male voice that works well for professional content
  const VOICE_ID = '26b2064088674c80b1e5fc5ab1a068ea';
  
  for (const video of RESEARCH_VIDEOS_TO_CREATE) {
    const localFullPath = path.join(BASE_VIDEO_DIR, video.localPath);
    
    if (fs.existsSync(localFullPath)) {
      console.log(`✓ SKIP: ${video.id} - Already exists`);
      continue;
    }
    
    console.log(`⟳ GENERATING: ${video.id} - "${video.title}"`);
    
    try {
      const response = await fetchJSON('https://api.heygen.com/v2/video/generate', {
        method: 'POST',
        body: JSON.stringify({
          video_inputs: [{
            character: {
              type: 'avatar',
              avatar_id: AVATAR_ID,
              avatar_style: 'normal'
            },
            voice: {
              type: 'text',
              input_text: video.script,
              voice_id: VOICE_ID,
              speed: 1.0
            },
            background: {
              type: 'color',
              value: '#1e293b' // Dark slate background matching EdPsych branding
            }
          }],
          dimension: {
            width: 1920,
            height: 1080
          },
          aspect_ratio: '16:9',
          test: false
        })
      });
      
      if (response.data?.video_id) {
        console.log(`  ✓ Video generation started: ${response.data.video_id}`);
        console.log(`  → Add to registry: '${video.id}': '${response.data.video_id}'`);
      } else {
        console.log(`  ✗ Failed: ${JSON.stringify(response)}`);
      }
      
    } catch (error: any) {
      console.log(`  ✗ Error: ${error.message}`);
    }
    
    // Delay between generation requests
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log('\n' + '-'.repeat(80));
  console.log('Generation requests submitted. Check HeyGen dashboard for status.');
  console.log('-'.repeat(80) + '\n');
}

async function auditVideos(): Promise<void> {
  console.log('\n' + '='.repeat(80));
  console.log('VIDEO INFRASTRUCTURE AUDIT');
  console.log('='.repeat(80) + '\n');
  
  // Count local files
  let localCount = 0;
  const countLocal = (dir: string) => {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        countLocal(path.join(dir, entry.name));
      } else if (entry.name.endsWith('.mp4')) {
        localCount++;
      }
    }
  };
  countLocal(BASE_VIDEO_DIR);
  
  // Check December 2025 videos
  let dec2025Downloaded = 0;
  let dec2025Missing = 0;
  for (const [key, config] of Object.entries(DECEMBER_2025_VIDEOS)) {
    const fullPath = path.join(BASE_VIDEO_DIR, config.localPath);
    if (fs.existsSync(fullPath)) {
      dec2025Downloaded++;
    } else {
      dec2025Missing++;
      console.log(`  Missing: ${key}`);
    }
  }
  
  // Check Research videos
  let researchExists = 0;
  let researchMissing = 0;
  for (const video of RESEARCH_VIDEOS_TO_CREATE) {
    const fullPath = path.join(BASE_VIDEO_DIR, video.localPath);
    if (fs.existsSync(fullPath)) {
      researchExists++;
    } else {
      researchMissing++;
    }
  }
  
  console.log('\n📊 SUMMARY:');
  console.log(`  Total local MP4 files: ${localCount}`);
  console.log(`  December 2025 videos: ${dec2025Downloaded} downloaded, ${dec2025Missing} missing`);
  console.log(`  Research portal videos: ${researchExists} exist, ${researchMissing} need creation`);
  
  console.log('\n📋 NEXT ACTIONS:');
  if (dec2025Missing > 0) {
    console.log(`  → Run "npx tsx tools/video-infrastructure.ts download" to download ${dec2025Missing} videos`);
  }
  if (researchMissing > 0) {
    console.log(`  → Run "npx tsx tools/video-infrastructure.ts generate" to create ${researchMissing} research videos`);
  }
  if (dec2025Downloaded + researchExists > 0) {
    console.log(`  → Run "npx tsx tools/video-infrastructure.ts upload" to upload to Cloudinary`);
  }
  
  console.log('\n' + '='.repeat(80) + '\n');
}

// =============================================================================
// MAIN ENTRY POINT
// =============================================================================

const command = process.argv[2] || 'audit';

switch (command) {
  case 'download':
    downloadVideos().catch(console.error);
    break;
  case 'generate':
    generateResearchVideos().catch(console.error);
    break;
  case 'upload':
    console.log('Cloudinary upload requires API credentials. Run:');
    console.log('  CLOUDINARY_API_KEY=xxx CLOUDINARY_API_SECRET=xxx npx tsx tools/video-infrastructure.ts upload');
    break;
  case 'audit':
  default:
    auditVideos().catch(console.error);
    break;
}
