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
    prisma.helpCategory.upsert({
      where: { slug: 'data-sovereignty' },
      update: {},
      create: {
        name: 'Data Sovereignty & Security',
        slug: 'data-sovereignty',
        description: 'BYOD, GDPR, and Enterprise Security',
        icon: '🛡️',
        order_index: 7,
      },
    }),
  ]);

  const [gettingStarted, assessments, interventions, ehcp, training, technical, sovereignty] = categories;

  // Create Articles
  const articles = [
    // DATA SOVEREIGNTY (NEW SECTION)
    {
      category_id: sovereignty.id,
      title: 'Bring Your Own Database (BYOD) for Local Authorities',
      slug: 'byod-for-local-authorities',
      excerpt: 'Complete guide to our Hybrid Cloud architecture for data sovereignty',
      content: `# Bring Your Own Database (BYOD)

For Local Authorities and Enterprise Multi-Academy Trusts, we offer a **Hybrid Cloud** deployment model that ensures 100% data sovereignty.

## What is BYOD?

"Bring Your Own Database" means that while you use the EdPsych Connect application interface and AI tools hosted in our secure cloud, **the actual database containing all student PII (Personally Identifiable Information) resides on your own infrastructure.**

This architecture allows you to:
- Keep data within your existing government-approved data centers.
- Manage your own encryption keys.
- Enforce your own backup and retention policies.
- Revoke access instantly by closing the network port.

## How It Works

1. **The Application Layer**: Runs in our AWS London (eu-west-2) environment. It handles the user interface, authentication logic, and AI orchestration.
2. **The Data Layer**: You provision a PostgreSQL database (v15+) on your servers.
3. **The Secure Tunnel**: We establish a permanent, encrypted VPN or TLS 1.3 connection between our application and your database.

## Implementation Requirements

Your IT team will need to provide:
- A PostgreSQL 15+ instance.
- A static IP or DNS hostname accessible via port 5432.
- SSL certificates for encrypted transport.

## Getting Started

To initiate a BYOD setup, please contact your Dedicated Success Manager. We will provide a detailed **Technical Implementation Guide** for your IT department.

> **Note**: This feature is available exclusively on the **Enterprise & LA** tier.`,
      search_keywords: ['byod', 'database', 'sovereignty', 'local authority', 'hosting', 'on-premise', 'hybrid'],
      page_context: ['/settings', '/admin'],
      is_featured: true,
    },
    {
      category_id: sovereignty.id,
      title: 'Data Security & Encryption Standards',
      slug: 'security-encryption',
      excerpt: 'How we protect your data at rest and in transit',
      content: `# Data Security & Encryption

Security is the foundation of EdPsych Connect World.

## Encryption

- **In Transit**: All data moving between your browser, our servers, and the database is encrypted using **TLS 1.3** (Transport Layer Security). We score an "A+" on SSL Labs tests.
- **At Rest**: All databases (Standard Tier) are encrypted using **AES-256** industry-standard encryption.
- **BYOD Tier**: If you choose the BYOD model, you control the encryption keys for data at rest.

## Compliance

We are fully compliant with:
- **UK GDPR** (General Data Protection Regulation)
- **Data Protection Act 2018**
- **Cyber Essentials Plus** (Certification pending)

## Access Control

- **Role-Based Access (RBAC)**: Strict permissions ensure users only see data relevant to their role.
- **Audit Logging**: Every view, edit, and export of sensitive data is logged in the immutable Audit Trail.
- **MFA**: Multi-Factor Authentication is enforced for all Administrator accounts.

## AI Safety

When using our AI features (e.g., Report Drafting):
- Data is processed **statelessly**.
- No student data is ever used to train our public models.
- We have strict data processing agreements with our AI providers (Microsoft Azure OpenAI UK).`,
      search_keywords: ['security', 'encryption', 'gdpr', 'compliance', 'aes-256', 'tls'],
      page_context: ['/privacy', '/settings'],
    },
    {
      category_id: sovereignty.id,
      title: 'GDPR: Right to Portability & Erasure',
      slug: 'gdpr-rights',
      excerpt: 'Managing data subject requests',
      content: `# GDPR Rights

We build compliance tools directly into the platform to help you meet your statutory obligations.

## Right to Data Portability (Article 20)

You can export data at any time:
- **Student Profiles**: Export as JSON or PDF.
- **Full Tenant Export**: Admins can request a full SQL dump or CSV archive of all school data.
- **Interoperability**: Our data structure follows the **Common Transfer File (CTF)** standards for easy import into SIMS or other MIS platforms.

## Right to Erasure (Article 17)

Also known as the "Right to be Forgotten".
1. Navigate to the Student Profile.
2. Select "Data Management".
3. Click "Request Erasure".
4. This triggers a **Hard Delete** process.
   - Database records are wiped.
   - Associated files (PDFs) are scrubbed from storage.
   - Backups are cycled out within 30 days.

> **Warning**: Erasure is permanent and cannot be undone.`,
      search_keywords: ['gdpr', 'erasure', 'portability', 'export', 'delete', 'compliance'],
      page_context: ['/settings/gdpr'],
    },

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
      excerpt: 'Comprehensive guide to the EdPsych Connect Cognitive Assessment framework',
      content: `# Conducting an ECCA Assessment

The EdPsych Connect Cognitive Assessment (ECCA) is a proprietary, dynamic, strengths-based framework designed to provide a holistic view of a child's cognitive profile. Unlike traditional static testing, ECCA emphasizes the *process* of learning and the potential for growth.

## The 4 Core Cognitive Domains

The ECCA framework evaluates four distinct but interconnected cognitive domains. Understanding these is crucial for accurate interpretation.

### 1. Working Memory & Information Processing
*The "Workbench" of the Mind*
- **Definition**: The ability to hold and manipulate information in the mind over short periods.
- **Key Subtests**:
    - **Digit Span (Forward/Backward)**: Auditory working memory.
    - **Visual-Spatial Grid**: Visual working memory.
    - **Instructional Recall**: Ability to follow multi-step directions.
- **Clinical Significance**: Deficits here often manifest as difficulty following instructions, "forgetting" what to do, or trouble with mental arithmetic.

### 2. Attention & Executive Function
*The "CEO" of the Brain*
- **Definition**: The ability to focus, shift attention, inhibit impulses, and plan/organize behaviour.
- **Key Subtests**:
    - **Sustained Attention Task**: Focusing on a boring task over time.
    - **Go/No-Go**: Impulse control and inhibition.
    - **Tower Planning**: Strategic planning and problem-solving.
- **Clinical Significance**: Weaknesses affect task initiation, organization, emotional regulation, and focus in noisy environments.

### 3. Processing Speed
*The "Engine Speed"*
- **Definition**: The efficiency and speed with which the brain processes simple information.
- **Key Subtests**:
    - **Symbol Search**: Rapid visual scanning and discrimination.
    - **Coding**: Visual-motor coordination and speed.
    - **Rapid Naming**: Retrieval speed from long-term memory.
- **Clinical Significance**: Slow processing speed can make learners appear "slow" despite high intelligence, leading to fatigue and incomplete work.

### 4. Learning & Memory
*The "Library" of Knowledge*
- **Definition**: The ability to encode, store, and retrieve information over time.
- **Key Subtests**:
    - **List Learning**: Verbal learning curve and retention.
    - **Story Recall**: Narrative memory and contextual understanding.
    - **Visual Reproduction**: Memory for visual details.
- **Clinical Significance**: Affects exam performance, vocabulary acquisition, and the ability to build on prior knowledge.

## The Assessment Workflow

1.  **Pre-Assessment Context**:
    - Review referral information.
    - Send "Collaborative Input" forms to parents and teachers via the dashboard.

2.  **Administration**:
    - Ensure a quiet, distraction-free environment.
    - Build rapport before starting.
    - Administer subtests in the standard order (unless fatigue requires adaptation).
    - **Dynamic Testing**: If a child fails a standard item, use the "Teach-Test-Retest" protocol to assess learning potential.

3.  **Scoring & Interpretation**:
    - Input raw scores into the ECCA dashboard.
    - The system automatically calculates Standard Scores (Mean=100, SD=15).
    - Look for **Discrepancies**: Is one domain significantly lower than others?
    - Analyze **Error Patterns**: *Why* did they fail? (e.g., impulsivity vs. lack of knowledge).

4.  **Reporting**:
    - Use the "Generate Report" feature to synthesize findings.
    - The system will suggest evidence-based interventions based on the lowest domain scores.

## Best Practices

- **Observe Behaviour**: Anxiety, fatigue, and motivation significantly impact scores. Note these in the "Observations" section.
- **Strengths-Based**: Always highlight what the child *can* do. Use strengths to support weaknesses.
- **Cultural Fairness**: The ECCA is designed to be culturally neutral, but always consider language barriers and cultural background.`,
      search_keywords: ['ecca', 'assessment', 'cognitive', 'framework', 'conducting', 'domains', 'working memory', 'processing speed'],
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
- **Wellbeing** (9 interventions): Anxiety, attention, behaviour

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
- Behaviour Management
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
      title: 'MIS Integration Setup & Configuration',
      slug: 'mis-integration',
      excerpt: 'Complete guide to connecting your Management Information System',
      content: `# MIS Integration Setup & Configuration

Connect EdPsych Connect World to your school's Management Information System (MIS) for seamless data sync.

## Supported MIS Platforms

We currently support integration with:
- **SIMS (Schools Information Management System)**
- **Arbor Education**
- **Bromcom**
- **ScholarPack**
- **iSAMS**

## Benefits of MIS Integration

- **Automatic student data sync**: Names, dates of birth, year groups updated daily
- **Single source of truth**: No manual data entry or duplicates
- **Real-time updates**: Changes in MIS reflected instantly
- **Timetable integration**: Staff and class schedules synced
- **Attendance data**: Track correlations with assessment outcomes
- **GDPR compliant**: Secure, encrypted data transfer

## Initial Setup (Administrator Only)

### Step 1: Generate API Credentials in Your MIS

Navigate to your MIS platform's API/Integration settings:
- SIMS: **Tools → Third Party → Configure Connections**
- Arbor: **Settings → Integrations → API Keys**
- Bromcom: **Admin → External Access → API Management**

Generate a new API key with **Read-Only** permissions.

### Step 2: Configure in EdPsych Connect

1. Go to **Settings → Integrations → MIS Integration**
2. Select your MIS platform from the dropdown
3. Enter your MIS URL (e.g., https://yourschool.sims.co.uk)
4. Paste the API Key
5. Click **Test Connection**
6. If successful, click **Enable Sync**

### Step 3: Initial Data Import

1. Click **Run Initial Sync**
2. Select data to import:
   - ☑ Students
   - ☑ Staff
   - ☑ Classes/Groups
   - ☑ Timetables (optional)
3. Click **Start Import**
4. Monitor progress (typically 2-10 minutes depending on school size)

## Ongoing Sync

Once enabled, data syncs automatically:
- **Student data**: Daily at 3:00 AM
- **Staff/timetables**: Daily at 4:00 AM
- **Attendance**: Hourly during school day

## Field Mapping

You can customize which MIS fields map to EdPsych Connect fields:
- **Settings → Integrations → Field Mapping**
- Map custom fields (e.g., EAL status, PP eligibility)

## Troubleshooting

### "Connection Failed" Error

**Cause**: Incorrect URL or API key  
**Solution**:
1. Verify API key hasn't expired
2. Check URL format (include https://)
3. Ensure your MIS has API access enabled
4. Check firewall allows outbound connections

### "Permission Denied" Error

**Cause**: API key lacks required permissions  
**Solution**:
1. Regenerate API key with **Read** permissions for:
   - Students
   - Staff
   - Classes
2. Re-enter key in EdPsych Connect

### Data Not Syncing

**Solution**:
1. Check **Sync Logs** in Settings → Integrations
2. Look for error messages
3. Click **Force Sync Now** to trigger manual sync
4. Contact support if issue persists

## Data Privacy & Security

- **Encryption**: All data transfers use TLS 1.3
- **Read-Only**: We never write back to your MIS
- **Audit Trail**: All sync events logged
- **GDPR**: Compliant with UK data protection laws

## Support

For MIS integration support:
- Email: integrations@edpsychconnect.com
- Include: MIS platform name, error message, school ID
- Response time: Within 24 hours

> **Enterprise Tier Only**: MIS integration is available exclusively on Enterprise and LA subscriptions. Contact your account manager for upgrade information.`,
      search_keywords: ['mis', 'integration', 'sims', 'arbor', 'bromcom', 'setup', 'sync', 'api', 'data', 'import'],
      page_context: ['/settings', '/settings/integrations'],
      is_featured: true,
    },
    {
      category_id: gettingStarted.id,
      title: 'Video Tutorial Library',
      slug: 'videos',
      excerpt: 'Access our comprehensive collection of video tutorials',
      content: `# Video Tutorial Library

Learn EdPsych Connect World through our extensive video tutorial library covering all platform features.

## Getting Started Videos

Perfect for new users:
- **Platform Overview** (5 min): Quick tour of main features
- **Your First Assessment** (8 min): Complete walkthrough
- **Dashboard Navigation** (4 min): Finding your way around
- **Profile Setup** (3 min): Completing your professional profile

## Assessment Videos

Master the ECCA framework:
- **Understanding ECCA** (12 min): Framework deep-dive
- **Administering Assessments** (15 min): Best practices
- **Scoring & Interpretation** (10 min): Analyzing results
- **Report Generation** (7 min): Creating professional PDFs
- **Collaborative Input** (6 min): Gathering multi-informant perspectives

## Intervention Videos

Evidence-based intervention implementation:
- **Intervention Library Tour** (5 min): Finding the right support
- **Assigning Interventions** (4 min): Setting up interventions
- **Progress Monitoring** (8 min): Tracking outcomes
- **Fidelity Checklists** (6 min): Ensuring quality implementation

## EHCP Videos

Streamline EHCP workflows:
- **Creating Your First EHCP** (10 min): Step-by-step guide
- **Section-by-Section Guide** (18 min): Completing all sections
- **Annual Reviews** (7 min): Efficient review process
- **Transition Planning** (9 min): Post-16 EHCPs

## CPD Training Videos

Professional development:
- **Course Enrollment** (3 min): Accessing CPD courses
- **Interactive Modules** (4 min): Learning platform features
- **Earning Certificates** (2 min): Completing courses

## Advanced Features

For power users:
- **AI Assistant** (6 min): Getting the most from "The Brain"
- **Voice Assessment** (5 min): Hands-free data entry
- **Battle Royale** (4 min): Gamification system
- **Data Export & Reports** (8 min): Analytics and dashboards

## Technical Setup

Platform configuration:
- **MIS Integration** (12 min): Connecting SIMS/Arbor
- **Team Management** (5 min): Inviting and managing users
- **Role-Based Permissions** (7 min): Security and access control
- **BYOD Setup** (15 min): Enterprise deployment (LA tier)

## Accessing Videos

### In-Context Help
- Look for the 📺 icon throughout the platform
- Click for context-specific video tutorials
- Videos open in a modal without leaving your work

### Video Tutorial Page
Navigate to **Help → Video Tutorials** to browse the full library

### Search Videos
Use the search bar to find tutorials by keyword

## Video Features

All videos include:
- **Professional narration**: Clear British English voice
- **Closed captions**: Accessibility support
- **Timestamps**: Jump to specific sections
- **Downloadable transcripts**: For reference
- **Speed control**: Watch at 0.5x to 2x speed
- **HD quality**: Crisp 1080p resolution

## Mobile Access

Videos are optimized for:
- Tablets (iPad, Android)
- Smartphones (iOS, Android)
- Desktop browsers
- Smart TVs (Chromecast supported)

## Video Training Paths

### **New User Path** (45 min total)
Recommended sequence for beginners:
1. Platform Overview
2. Dashboard Navigation
3. Your First Assessment
4. Report Generation
5. Finding Interventions

### **EP Professional Path** (90 min total)
For Educational Psychologists:
1. Understanding ECCA
2. Administering Assessments
3. Collaborative Input
4. Scoring & Interpretation
5. Evidence-Based Recommendations
6. Professional Report Writing

### **SENCO Path** (60 min total)
For SENCOs and teachers:
1. Dashboard Navigation
2. Intervention Library Tour
3. Assigning Interventions
4. Progress Monitoring
5. Creating EHCPs
6. Annual Reviews

### **LA Administrator Path** (75 min total)
For LA deployment:
1. Platform Overview
2. Team Management
3. Role-Based Permissions
4. MIS Integration
5. BYOD Setup (Enterprise)
6. Data Export & Reporting

## Custom Training

**Enterprise Tier**: Request custom video tutorials for your organization's specific workflows.

Contact: training@edpsychconnect.com

## Feedback

Help us improve:
- Rate videos (thumbs up/down)
- Request new topics
- Report technical issues

> **Tip**: Bookmark frequently watched videos by clicking the ⭐ icon. Access bookmarks from your profile menu.`,
      search_keywords: ['videos', 'tutorials', 'training', 'learning', 'how-to', 'guide', 'walkthrough'],
      page_context: ['/help', '/training'],
      is_featured: true,
    },
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
    {
      question: 'Can LAs host their own data?',
      answer: 'Yes. Our "Enterprise & LA" tier supports a Bring Your Own Database (BYOD) model. This allows Local Authorities to host the PostgreSQL database on their own infrastructure (on-premise or private cloud) while still using our SaaS application. This ensures 100% data sovereignty.',
      category: 'Data Sovereignty & Security',
      order_index: 9,
    },
    {
      question: 'How do I set up BYOD?',
      answer: 'BYOD setup requires coordination between your IT team and our deployment engineers. We provide a detailed "LA IT Guide" covering network requirements, firewall rules, and database provisioning. Contact your Success Manager to initiate this process.',
      category: 'Data Sovereignty & Security',
      order_index: 10,
    },
    {
      question: 'Is the AI processing secure?',
      answer: 'Absolutely. We use enterprise-grade Azure OpenAI instances hosted in the UK South region. Data sent to the AI is processed statelessly—meaning it is not stored, logged, or used to train the models. It exists in memory only for the milliseconds required to generate your response.',
      category: 'Data Sovereignty & Security',
      order_index: 11,
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
