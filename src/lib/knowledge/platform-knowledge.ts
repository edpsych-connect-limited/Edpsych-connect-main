/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * Enterprise Knowledge Base Service
 * Comprehensive platform knowledge for AI assistants
 * 
 * This service provides structured knowledge about every feature,
 * workflow, and capability of the EdPsych Connect platform.
 */

export interface KnowledgeEntry {
  id: string;
  category: string;
  subcategory?: string;
  keywords: string[];
  title: string;
  content: string;
  links?: { text: string; url: string }[];
  relatedTopics?: string[];
}

// Comprehensive Platform Knowledge Base
export const PLATFORM_KNOWLEDGE: KnowledgeEntry[] = [
  // ===== NAVIGATION & GETTING STARTED =====
  {
    id: 'nav-home',
    category: 'navigation',
    keywords: ['home', 'main', 'start', 'homepage', 'landing', 'dashboard', 'begin'],
    title: 'Getting Home / Dashboard',
    content: ` **Getting to Your Dashboard:**

1. **Click the EdPsych Connect logo** in the top-left corner
2. Or click **"Dashboard"** in the left sidebar menu
3. Or use keyboard shortcut **Cmd/Ctrl + H**

Your Dashboard is your personalised home showing:
- Recent activity and notifications
- Quick action buttons for common tasks
- Progress summaries for your students/cases
- Upcoming deadlines and reminders
- Role-specific features based on your account type`,
    links: [
      { text: 'Dashboard', url: '/dashboard' },
      { text: 'Help Centre', url: '/help' }
    ]
  },
  {
    id: 'nav-menu',
    category: 'navigation',
    keywords: ['menu', 'sidebar', 'navigation', 'nav bar', 'left menu', 'main menu'],
    title: 'Main Navigation Menu',
    content: `LIST **Main Menu (Left Sidebar):**

The sidebar contains all major platform sections:

**For Educators/Teachers:**
- **Dashboard** - Your home overview
- **Classroom Cockpit** - Class management & daily planning
- **Cases** - Student profile management
- **Assessments** - ECCA cognitive assessments
- **Interventions** - Evidence-based strategies
- **Lesson Plans** - AI-assisted planning
- **Progress** - Student progress tracking
- **Training** - CPD courses & certificates

**For Educational Psychologists:**
- **Dashboard** - Cases overview
- **Assessments** - Full ECCA battery
- **EHCP** - Plan management & reporting
- **Multi-Agency** - Collaboration tools
- **Research** - Data analysis & trials

**For Parents:**
- **Parent Portal** - Child's progress
- **Messages** - Communication with teachers
- **Reports** - Shared documents

**For LA Professionals:**
- **LA Dashboard** - SEND provision oversight
- **Panel Management** - EP allocation
- **Compliance** - Statutory monitoring`,
    links: [
      { text: 'Dashboard', url: '/dashboard' }
    ]
  },
  {
    id: 'nav-search',
    category: 'navigation',
    keywords: ['search', 'find', 'look for', 'locate', 'where', 'global search'],
    title: 'Global Search',
    content: ` **Global Search (Cmd/Ctrl + K):**

Press **Cmd+K** (Mac) or **Ctrl+K** (Windows) anywhere to open universal search.

**You can search for:**
- Students by name
- Cases by reference
- Assessments by date or student
- Interventions by type
- Training courses
- Help articles
- Reports and documents

**Pro Tips:**
- Type a student name to jump to their profile
- Use "assess:" prefix for assessment search
- Use "help:" prefix for documentation
- Results are organised by category
- Recent searches are remembered`,
    links: [
      { text: 'Help Centre', url: '/help' }
    ]
  },

  // ===== ASSESSMENTS & ECCA =====
  {
    id: 'assess-ecca',
    category: 'assessments',
    keywords: ['ecca', 'assessment', 'cognitive', 'evaluation', 'test', 'battery', 'measure'],
    title: 'ECCA Framework & Cognitive Assessments',
    content: `STATS **ECCA (Educational Cognitive & Capability Assessment) Framework:**

The ECCA is our proprietary assessment framework covering:

**Core Domains:**
1. **Working Memory** - Verbal & visuospatial capacity
2. **Attention & Executive Function** - Focus, planning, inhibition
3. **Processing Speed** - Information processing efficiency
4. **Learning & Memory** - Encoding, storage, retrieval
5. **Language & Communication** - Receptive & expressive

**Starting an Assessment:**
1. Go to **Assessments** in the sidebar
2. Click **"New Assessment"**
3. Select or create a student profile
4. Choose assessment type (Screening, Full, Follow-up)
5. Follow the guided administration

**Key Features:**
- Real-time AI interpretation
- Automatic report generation
- Progress monitoring over time
- Evidence-based recommendations
- UK standardisation norms`,
    links: [
      { text: 'Start Assessment', url: '/assessments' },
      { text: 'Assessment Guide', url: '/help?category=assessments' }
    ]
  },
  {
    id: 'assess-reports',
    category: 'assessments',
    keywords: ['report', 'generate', 'pdf', 'download', 'export', 'print'],
    title: 'Generating Assessment Reports',
    content: `DOC **Generating & Exporting Reports:**

**After completing an assessment:**
1. Review the results summary
2. Click **"Generate Report"**
3. Choose format: **PDF** (recommended) or **Word**
4. Select sections to include
5. Download or email directly

**Report Sections:**
- Executive Summary
- Assessment Background
- Cognitive Profile (with graphs)
- Strengths & Difficulties Analysis
- Recommendations (AI-generated)
- Appendices with raw data

**Finding Past Reports:**
- Go to **Cases** -> Select student -> **Reports** tab
- Or use Global Search: "report [student name]"

**Sharing Options:**
- Download to device
- Email to stakeholders
- Share via secure link (time-limited)
- Add to EHCP documentation`,
    links: [
      { text: 'View Reports', url: '/reports' }
    ]
  },

  // ===== EHCP & STATUTORY =====
  {
    id: 'ehcp-overview',
    category: 'ehcp',
    keywords: ['ehcp', 'education health care', 'plan', 'statutory', 'send', 'section'],
    title: 'EHCP Module Overview',
    content: `LIST **Education, Health and Care Plan Module:**

Our EHCP module helps you create, manage, and review EHCPs efficiently.

**Key Features:**
- Section-by-section guided completion
- SMART outcome writing assistant
- Provision mapping tools
- Annual review scheduling
- Multi-agency contribution collection
- Statutory deadline tracking

**EHCP Sections:**
- **Section A** - Views of the child/young person
- **Section B** - Special educational needs
- **Section C** - Health needs
- **Section D** - Social care needs
- **Section E** - Outcomes
- **Section F** - Educational provision
- **Section G** - Health provision
- **Section H** - Social care provision
- **Section I** - Placement
- **Section J** - Personal budget
- **Section K** - Professional advice

**Getting Started:**
1. Go to **EHCP** in the sidebar
2. Click **"New EHCP"** or select existing
3. Follow the guided workflow`,
    links: [
      { text: 'EHCP Module', url: '/ehcp' },
      { text: 'EHCP Guide', url: '/help?category=ehcp' }
    ]
  },

  // ===== INTERVENTIONS =====
  {
    id: 'interventions-library',
    category: 'interventions',
    keywords: ['intervention', 'strategy', 'strategies', 'support', 'programme', 'evidence'],
    title: 'Interventions Library',
    content: `TARGET **Evidence-Based Interventions Library:**

Access 500+ research-backed interventions for various needs.

**Browse by Category:**
- **Literacy** - Reading, writing, phonics, comprehension
- **Numeracy** - Mathematical understanding, number sense
- **Behaviour** - Self-regulation, positive behaviour support
- **Social Skills** - Peer relationships, communication
- **Emotional** - Anxiety, wellbeing, resilience
- **Attention** - Focus, organisation, ADHD strategies
- **Autism** - Sensory, communication, transitions
- **Motor Skills** - Fine motor, gross motor, coordination

**For Each Intervention:**
- Evidence rating (1-5 stars)
- Implementation guide
- Required resources
- Progress monitoring tools
- Expected timescales
- Cost indicators

**Assigning Interventions:**
1. Go to **Interventions** in sidebar
2. Browse or search for intervention
3. Click **"Assign to Student"**
4. Set duration and targets
5. Monitor progress through dashboard`,
    links: [
      { text: 'Interventions Library', url: '/interventions' }
    ]
  },

  // ===== TRAINING & CPD =====
  {
    id: 'training-overview',
    category: 'training',
    keywords: ['training', 'cpd', 'course', 'professional development', 'certificate', 'learn'],
    title: 'Training & CPD Courses',
    content: `TRAIN **Professional Development & Training:**

Access accredited CPD courses designed for education professionals.

**Course Categories:**
- SEND Fundamentals
- Assessment & Evaluation
- Intervention Design
- Mental Health First Aid
- Autism & Neurodiversity
- EHCP Writing
- Multi-Agency Working
- Research Methods
- Leadership in SEND

**Course Features:**
- Video lessons with transcripts
- Interactive quizzes
- Downloadable resources
- Discussion forums
- Progress tracking
- CPD hour certificates

**Completing a Course:**
1. Go to **Training** in sidebar
2. Browse or search courses
3. Enrol in your chosen course
4. Complete modules in order
5. Pass the final assessment
6. Download your certificate

**CPD Tracking:**
Your training hours are automatically logged for professional registration requirements.`,
    links: [
      { text: 'Training Centre', url: '/training' },
      { text: 'My Certificates', url: '/training?tab=certificates' }
    ]
  },

  // ===== MARKETPLACE =====
  {
    id: 'marketplace-overview',
    category: 'marketplace',
    keywords: ['marketplace', 'find ep', 'educational psychologist', 'book', 'hire', 'professional'],
    title: 'EP Marketplace',
    content: `ANALYZE **Educational Psychologist Marketplace:**

Find and connect with qualified Educational Psychologists.

**Search Filters:**
- Location (postcode radius)
- Specialism (autism, ADHD, literacy, etc.)
- Availability (immediate, within 2 weeks, etc.)
- LA Panel approval status
- Language capabilities
- Experience level

**EP Profiles Include:**
- Qualifications & HCPC registration
- Areas of expertise
- LA panels served
- Reviews from schools
- Availability calendar
- Contact information

**Featured Professional:**
Dr Scott Ighavongbe-Patrick (Platform Founder)
- DEdPsych, CPsychol, HCPC: PYL041054
- Senior EP experience across multiple LAs
- Creator of TEAM-UP initiative

**Booking Process:**
1. Search for EPs matching your needs
2. Review profiles and availability
3. Send enquiry through platform
4. Arrange assessment dates
5. Receive reports via platform`,
    links: [
      { text: 'Browse Marketplace', url: '/marketplace' }
    ]
  },

  // ===== ACCOUNT & SETTINGS =====
  {
    id: 'account-settings',
    category: 'account',
    keywords: ['settings', 'profile', 'account', 'preferences', 'notification', 'password'],
    title: 'Account & Settings',
    content: `SETTINGS **Managing Your Account:**

**Access Settings:**
- Click the **gear icon** SETTINGS in the top-right corner
- Or find **Settings** at the bottom of the left sidebar

**Settings Sections:**

**Profile:**
- Update your name and title
- Upload profile photo
- Set professional qualifications
- Add HCPC/registration numbers

**Notifications:**
- Email notification preferences
- In-app notification settings
- Digest frequency (daily/weekly)
- Alert priorities

**Subscription:**
- View current plan
- Upgrade/downgrade options
- Billing history
- Invoice downloads

**Integrations:**
- Connect SIMS/Bromcom
- Google Workspace sync
- Microsoft 365 integration
- API access tokens

**Privacy & Data:**
- Data export request
- Account deletion
- Cookie preferences
- Audit log access`,
    links: [
      { text: 'Settings', url: '/settings' }
    ]
  },
  {
    id: 'password-reset',
    category: 'account',
    keywords: ['password', 'reset', 'forgot', 'login', 'cant access', 'locked out'],
    title: 'Password Reset & Login Issues',
    content: ` **Password Reset:**

**Forgot Your Password?**
1. Go to the login page: **/login**
2. Click **"Forgot Password"**
3. Enter your email address
4. Check your inbox (and spam folder)
5. Click the reset link (expires in 24 hours)
6. Create a new strong password

**Password Requirements:**
- At least 8 characters
- One uppercase letter
- One lowercase letter
- One number
- One special character

**Still Can't Login?**
- Clear browser cookies and cache
- Try incognito/private browsing mode
- Check if Caps Lock is on
- Verify the correct email address

**Demo Account (for testing):**
- Email: teacher@demo.com
- Password: (provided via secure channel / local seed)

**Need Help?**
Email: support@edpsychconnect.world
Response time: Within 24 hours`,
    links: [
      { text: 'Login', url: '/login' },
      { text: 'Contact Support', url: '/contact' }
    ]
  },

  // ===== CASES & STUDENTS =====
  {
    id: 'cases-overview',
    category: 'cases',
    keywords: ['case', 'student', 'child', 'pupil', 'profile', 'add student', 'manage'],
    title: 'Managing Cases & Students',
    content: `USER **Case & Student Management:**

**Creating a New Case:**
1. Go to **Cases** in the sidebar
2. Click **"Add New Case"**
3. Enter student details (name, DOB, school, etc.)
4. Add any existing documentation
5. Link to assessments and interventions

**Case Profile Contains:**
- Personal details & demographics
- Family contacts
- Educational history
- Assessment records
- Intervention logs
- Progress monitoring
- Document storage
- Timeline view
- Multi-agency notes

**Privacy & GDPR:**
- All data is encrypted
- Role-based access control
- Audit logging enabled
- Data retention policies applied
- Parental consent tracking

**Bulk Import:**
For adding multiple students, use our CSV import tool in Settings > Import Data`,
    links: [
      { text: 'View Cases', url: '/cases' }
    ]
  },

  // ===== PARENT PORTAL =====
  {
    id: 'parent-portal',
    category: 'parents',
    keywords: ['parent', 'family', 'guardian', 'carer', 'portal', 'child progress'],
    title: 'Parent Portal & Family Access',
    content: ` **Parent Portal:**

**For Educators - Adding Parents:**
1. Open the student's case
2. Go to **"Family & Contacts"** tab
3. Click **"Add Family Member"**
4. Enter parent/carer details
5. System sends automatic login invitation

**Parents Can:**
- View their child's progress summaries
- Access shared reports and documents
- Message teachers and professionals
- Review EHCP sections (if applicable)
- Provide input for assessments
- Book appointments (if enabled)

**Parent Account Features:**
- Secure, separate login
- Mobile-friendly interface
- Push notifications for updates
- Translation options
- Accessibility features

**Privacy Note:**
Parents only see information specifically shared with them. Sensitive professional notes remain private.`,
    links: [
      { text: 'Parent Portal', url: '/parents' }
    ]
  },

  // ===== AI FEATURES =====
  {
    id: 'ai-tutoring',
    category: 'ai',
    keywords: ['tutor', 'tutoring', 'ai help', 'homework', 'learning help', 'study'],
    title: 'AI Tutoring System',
    content: `TRAIN **AI-Powered Tutoring:**

Get personalised learning support for students.

**How It Works:**
1. Go to student's profile or Dashboard
2. Click **"Get Tutoring Help"**
3. Select subject (Maths, English, Science, etc.)
4. Choose specific topic
5. Select student's learning style
6. AI provides personalised explanations

**Features:**
- Adaptive difficulty levels
- Multiple explanation styles
- Practice exercises
- Worked examples
- Visual aids where helpful
- Progress tracking

**Supported Subjects:**
- Mathematics (all levels)
- English Language & Literature
- Science (Biology, Chemistry, Physics)
- History & Geography
- Modern Foreign Languages

**Learning Styles Supported:**
- Visual learners
- Auditory learners
- Reading/writing preference
- Kinesthetic/practical learners`,
    links: [
      { text: 'Start Tutoring', url: '/dashboard' }
    ]
  },
  {
    id: 'ai-assistant',
    category: 'ai',
    keywords: ['chatbot', 'assistant', 'help bot', 'ai chat', 'support chat'],
    title: 'EdPsych AI Assistant',
    content: `AI **EdPsych AI Assistant (This Chat!):**

I'm your 24/7 platform guide. Here's what I can help with:

**Navigation Help:**
- Finding specific features
- Understanding menu options
- Keyboard shortcuts
- Quick access tips

**Feature Guidance:**
- How to use assessments
- Creating reports
- Managing cases
- Setting up interventions
- EHCP workflows

**Account Support:**
- Password and login help
- Settings configuration
- Subscription questions
- Privacy and data queries

**Training & Learning:**
- Course recommendations
- CPD tracking help
- Certificate downloads

**Technical Support:**
- Troubleshooting errors
- Browser compatibility
- Mobile access
- Integration setup

**I Can't Help With:**
- Making clinical decisions
- Individual student advice
- Legal/tribunal matters

For complex issues, contact: support@edpsychconnect.world`,
    links: [
      { text: 'Help Centre', url: '/help' }
    ]
  },

  // ===== VOICE COMMANDS =====
  {
    id: 'voice-commands',
    category: 'voice',
    keywords: ['voice', 'speak', 'command', 'hands free', 'dictate', 'voice control'],
    title: 'Voice Command System',
    content: ` **Voice Command System:**

Control the platform with your voice (where supported).

**Activating Voice:**
1. Look for the **microphone icon** 
2. Click to enable
3. Allow browser microphone access
4. Speak your command clearly

**Example Commands:**
- "Go to dashboard"
- "Show Emma Thompson's profile"
- "Start assessment for..."
- "Mark lesson as complete"
- "Flag student as urgent"
- "Show today's schedule"

**Quick Actions via Voice:**
- Mark lessons complete
- Update progress
- Add notes to cases
- Schedule meetings
- Send notifications

**Best Practices:**
- Speak clearly and naturally
- Use student full names
- Pause between commands
- Check confirmation before actions

**Note:** Voice commands work best in quiet environments with a good quality microphone.`,
    links: [
      { text: 'Voice Settings', url: '/settings?tab=accessibility' }
    ]
  },

  // ===== DATA & SECURITY =====
  {
    id: 'data-security',
    category: 'security',
    keywords: ['data', 'security', 'gdpr', 'privacy', 'secure', 'encryption', 'compliance'],
    title: 'Data Security & GDPR',
    content: ` **Data Security & Compliance:**

**Our Security Measures:**
- **Encryption** - All data encrypted at rest and in transit (AES-256)
- **UK Data Centres** - Data never leaves the UK
- **Role-Based Access** - See only what you need
- **Audit Logging** - Complete activity tracking
- **Regular Backups** - Daily encrypted backups
- **Penetration Testing** - Regular security audits

**GDPR Compliance:**
- Lawful basis for processing documented
- Data minimisation principles applied
- Right to access supported
- Right to erasure supported
- Data portability enabled
- Breach notification procedures

**Your Data Rights:**
- Request data export anytime
- Request data deletion
- View processing activities
- Update consent preferences

**For Schools/LAs:**
- Data Processing Agreement available
- Custom retention policies
- DPIA support provided
- Designated DPO contact

**Certifications:**
- Cyber Essentials Plus (in progress)
- ISO 27001 aligned
- ICO registered`,
    links: [
      { text: 'Privacy Policy', url: '/privacy' },
      { text: 'Data Request', url: '/settings?tab=privacy' }
    ]
  },

  // ===== PRICING & SUBSCRIPTION =====
  {
    id: 'pricing',
    category: 'subscription',
    keywords: ['price', 'pricing', 'cost', 'subscription', 'plan', 'free', 'pay', 'upgrade'],
    title: 'Pricing & Subscriptions',
    content: ` **Pricing Plans:**

**Free Tier:**
- 5 student profiles
- Basic assessments
- Limited report generation
- Community forum access
- Email support

**Professional (49/month):**
- Unlimited students
- Full ECCA assessment battery
- Unlimited reports
- EHCP module access
- Priority support
- API access
- Custom branding

**Enterprise (Custom pricing):**
- Everything in Professional
- Multi-site deployment
- SSO integration
- Dedicated account manager
- SLA guarantees
- Custom training
- On-premises option

**For Local Authorities:**
Contact us for volume licensing and bespoke packages.

**Discounts Available:**
- Annual billing (20% off)
- Charity/non-profit rates
- Multi-seat licences
- Educational institution rates`,
    links: [
      { text: 'View Pricing', url: '/pricing' },
      { text: 'Upgrade', url: '/settings?tab=subscription' }
    ]
  },

  // ===== SUPPORT & CONTACT =====
  {
    id: 'support-contact',
    category: 'support',
    keywords: ['support', 'help', 'contact', 'email', 'phone', 'issue', 'problem'],
    title: 'Getting Support',
    content: ` **Support Options:**

**Self-Service:**
- **Help Centre** - /help - Guides & tutorials
- **This AI Chat** - Instant answers 24/7
- **Video Tutorials** - Training section
- **FAQ** - Common questions

**Contact Support:**
- **Email:** support@edpsychconnect.world
- **Response Time:** Within 24 hours (weekdays)

**Priority Support (Professional & Enterprise):**
- Faster response times
- Phone support available
- Screen sharing assistance
- Dedicated support queue

**Bug Reports:**
Click **"Feedback"** button (bottom-right) to report issues with screenshots.

**Feature Requests:**
Email ideas@edpsychconnect.world

**Training & Onboarding:**
Book a demo or training session via /contact

**Social Media:**
- Twitter/X: @edpsychconnect
- LinkedIn: EdPsych Connect
- YouTube: EdPsych Connect (tutorials)`,
    links: [
      { text: 'Help Centre', url: '/help' },
      { text: 'Contact Us', url: '/contact' }
    ]
  },

  // ===== ABOUT & FOUNDER =====
  {
    id: 'about-platform',
    category: 'about',
    keywords: ['about', 'founder', 'dr scott', 'who made', 'company', 'mission'],
    title: 'About EdPsych Connect',
    content: ` **About EdPsych Connect:**

**Our Mission:**
Transform SEND support through technology, making expert educational psychology accessible to every child who needs it.

**Founded By:**
Dr Scott Ighavongbe-Patrick, DEdPsych, CPsychol
- HCPC Registration: PYL041054
- Doctorate in Educational Psychology (University of Southampton)
- Former Senior EP at Buckinghamshire Council
- Creator of TEAM-UP initiative
- Practising EP across multiple Local Authorities
- Specialist in autism, ADHD, and complex needs

**Our Story:**
Born from Dr Scott's experience seeing the gap between research and practice in schools, EdPsych Connect brings cutting-edge educational psychology tools to educators, parents, and professionals.

**Key Principles:**
- Evidence-based practice
- Child-centred approach
- Inclusive design
- UK education system focus
- GDPR and ethics first

**Company Details:**
EdPsych Connect Limited
Registered in England & Wales`,
    links: [
      { text: 'About Us', url: '/about' },
      { text: 'Founder Profile', url: '/marketplace?featured=true' }
    ]
  },

  // ===== CLASSROOM COCKPIT =====
  {
    id: 'classroom-cockpit',
    category: 'teachers',
    keywords: ['classroom', 'cockpit', 'teacher', 'class', 'daily', 'lesson', 'differentiation'],
    title: 'Classroom Cockpit',
    content: `TARGET **Classroom Cockpit (Teachers):**

Your daily command centre for managing your class.

**Daily Overview:**
- Today's lessons and activities
- Student alerts and flags
- Upcoming deadlines
- Recent progress updates

**Class Management:**
- Student roster with profiles
- Attendance tracking
- Grouping tools
- Seating arrangements

**Lesson Planning:**
- AI-assisted differentiation
- Resource suggestions
- Learning objective alignment
- SEN adaptations

**Real-Time Support:**
- Voice commands for quick actions
- Student lookup
- Intervention reminders
- Parent communication

**Progress at a Glance:**
- Class-wide trends
- Individual student tracking
- Assessment results
- Intervention effectiveness

**Accessing Cockpit:**
1. Go to **Teachers** in sidebar
2. Or click **"Classroom Cockpit"** on Dashboard`,
    links: [
      { text: 'Classroom Cockpit', url: '/teachers' }
    ]
  },

  // ===== RESEARCH HUB =====
  {
    id: 'research-hub',
    category: 'research',
    keywords: ['research', 'data', 'analysis', 'clinical trial', 'study', 'researcher'],
    title: 'Research Hub',
    content: ` **Research Hub (Researchers):**

For approved researchers conducting educational psychology studies.

**Features:**
- Anonymised dataset access
- Statistical analysis tools
- Clinical trial management
- Intervention validation
- Ethics compliance tracking
- Publication support

**Data Enclave:**
- Secure analysis environment
- No data leaves the platform
- Audit trail maintained
- IRB/Ethics approval required

**Available for:**
- University researchers
- PhD students (with supervisor)
- LA research teams
- Published academics

**Accessing Research Hub:**
Contact research@edpsychconnect.world with your proposal and ethics approval.`,
    links: [
      { text: 'Research Hub', url: '/research' }
    ]
  },

  // ===== GAMIFICATION =====
  {
    id: 'gamification',
    category: 'students',
    keywords: ['game', 'gamification', 'points', 'badges', 'leaderboard', 'battle royale', 'reward'],
    title: 'Gamification & Student Engagement',
    content: ` **Gamification Features:**

Engage students through game-based learning elements.

**For Students:**
- **Points** - Earn for completing activities
- **Badges** - Unlock achievements
- **Levels** - Progress through tiers
- **Leaderboards** - Friendly competition
- **Battle Royale** - Team-based challenges

**Educator Controls:**
- Enable/disable per class
- Customise point values
- Set competition boundaries
- Monitor engagement levels
- Adjust difficulty

**Battle Royale Mode:**
- Form squads with classmates
- Complete learning challenges
- Earn team rewards
- Weekly tournaments

**Research-Backed:**
Our gamification is designed based on educational psychology research to enhance intrinsic motivation without undermining learning goals.`,
    links: [
      { text: 'Gamification Hub', url: '/gamification' }
    ]
  },

  // ===== MOBILE & ACCESSIBILITY =====
  {
    id: 'mobile-access',
    category: 'accessibility',
    keywords: ['mobile', 'phone', 'tablet', 'app', 'responsive', 'accessibility', 'screen reader'],
    title: 'Mobile & Accessibility',
    content: ` **Mobile & Accessibility:**

**Mobile Access:**
- Fully responsive design
- Works on all modern browsers
- Add to home screen for app-like experience
- Touch-optimised interface
- Resilient connection handling (auto-retry on reconnect)

**Supported Devices:**
- iPhone (iOS 14+)
- Android phones (Android 10+)
- iPad and Android tablets
- Desktop browsers (Chrome, Safari, Edge, Firefox)

**Accessibility Features (WCAG 2.1 AA):**
- Screen reader compatible
- Keyboard navigation
- High contrast mode
- Adjustable text sizes
- Reduced motion option
- Alt text on all images

**Settings Location:**
Settings > Accessibility

**Report Accessibility Issues:**
accessibility@edpsychconnect.world`,
    links: [
      { text: 'Accessibility Settings', url: '/settings?tab=accessibility' }
    ]
  },

  // ===== INTEGRATIONS =====
  {
    id: 'integrations',
    category: 'integrations',
    keywords: ['integration', 'sims', 'bromcom', 'google', 'microsoft', 'sync', 'connect'],
    title: 'System Integrations',
    content: ` **System Integrations:**

Connect EdPsych Connect with your existing tools.

**School MIS:**
- SIMS (Capita)
- Bromcom
- Arbor
- Pupil Asset

**Productivity:**
- Google Workspace (Calendar, Drive)
- Microsoft 365 (Outlook, Teams, OneDrive)

**What Syncs:**
- Student demographics
- Class lists
- Attendance data
- Calendar events
- Document storage

**Setting Up:**
1. Go to **Settings > Integrations**
2. Click on the system you want to connect
3. Follow the authorisation flow
4. Configure sync preferences
5. Run initial data import

**API Access:**
For custom integrations, API documentation is available for Professional and Enterprise plans.`,
    links: [
      { text: 'Integration Settings', url: '/settings?tab=integrations' }
    ]
  },

  // ===== DEMO MODE =====
  {
    id: 'demo-mode',
    category: 'demo',
    keywords: ['demo', 'try', 'test', 'preview', 'sample', 'example'],
    title: 'Demo Mode & Testing',
    content: ` **Try Before You Buy:**

**Interactive Demos:**
- **/demo** - Feature demonstrations
- **Golden Thread Demo** - Full workflow experience
- **Assessment Sandbox** - Try our tools risk-free

**Demo Account:**
- Email: teacher@demo.com
- Password: (provided via secure channel / local seed)
- Pre-populated with sample students
- All features unlocked for testing

**What You Can Try:**
- Create sample assessments
- Generate demo reports
- Explore interventions library
- Test EHCP module
- Experience AI features

**Demo Limitations:**
- Data resets periodically
- No real student data
- Some features may use reduced datasets
- Cannot export real reports

**Ready to Go Live?**
Sign up at **/signup** with your professional email.`,
    links: [
      { text: 'Try Demo', url: '/demo' },
      { text: 'Sign Up', url: '/signup' }
    ]
  }
];

/**
 * Find the best matching knowledge entry for a user query
 */
export function findBestMatch(query: string): KnowledgeEntry | null {
  const lowerQuery = query.toLowerCase();
  
  // Score each entry based on keyword matches
  const scored = PLATFORM_KNOWLEDGE.map(entry => {
    let score = 0;
    
    // Check keywords
    for (const keyword of entry.keywords) {
      if (lowerQuery.includes(keyword)) {
        score += 10;
      }
    }
    
    // Check title
    if (entry.title.toLowerCase().split(' ').some(word => lowerQuery.includes(word))) {
      score += 5;
    }
    
    // Check category
    if (lowerQuery.includes(entry.category)) {
      score += 3;
    }
    
    return { entry, score };
  });
  
  // Sort by score and return best match
  scored.sort((a, b) => b.score - a.score);
  
  return scored[0]?.score > 0 ? scored[0].entry : null;
}

/**
 * Find multiple relevant entries for a query
 */
export function findRelevantEntries(query: string, limit: number = 3): KnowledgeEntry[] {
  const lowerQuery = query.toLowerCase();
  
  const scored = PLATFORM_KNOWLEDGE.map(entry => {
    let score = 0;
    
    for (const keyword of entry.keywords) {
      if (lowerQuery.includes(keyword)) {
        score += 10;
      }
    }
    
    if (entry.title.toLowerCase().split(' ').some(word => lowerQuery.includes(word))) {
      score += 5;
    }
    
    if (lowerQuery.includes(entry.category)) {
      score += 3;
    }
    
    return { entry, score };
  });
  
  scored.sort((a, b) => b.score - a.score);
  
  return scored
    .filter(s => s.score > 0)
    .slice(0, limit)
    .map(s => s.entry);
}

/**
 * Get entries by category
 */
export function getEntriesByCategory(category: string): KnowledgeEntry[] {
  return PLATFORM_KNOWLEDGE.filter(entry => entry.category === category);
}

/**
 * Get all categories
 */
export function getCategories(): string[] {
  return [...new Set(PLATFORM_KNOWLEDGE.map(entry => entry.category))];
}
