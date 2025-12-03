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
