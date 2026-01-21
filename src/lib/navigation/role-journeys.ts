import {
  Brain,
  Building,
  FileText,
  GraduationCap,
  Home,
  LayoutDashboard,
  Mail,
  Shield,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';

export interface RoleWorkspace {
  label: string;
  description: string;
  href: string;
}

export interface RoleGuidedStep {
  title: string;
  description: string;
  href: string;
}

export interface RoleQuickAction {
  title: string;
  description: string;
  href: string;
  icon: typeof LayoutDashboard;
  color: string;
}

export interface RoleProfile {
  id: string;
  label: string;
  description: string;
  roles: string[];
  primaryWorkspace?: RoleWorkspace;
  outcomes: string[];
  guidedSteps: RoleGuidedStep[];
  quickActions: RoleQuickAction[];
}

const OWNER_ADMIN_PROFILE: RoleProfile = {
  id: 'owner-admin',
  label: 'Platform Owner',
  description: 'System governance, compliance, and platform-wide oversight.',
  roles: ['SUPERADMIN', 'SUPER_ADMIN'],
  primaryWorkspace: {
    label: 'Owner Command Center',
    description: 'Manage governance, access, and system oversight.',
    href: '/admin',
  },
  outcomes: [
    'Verify compliance status and ethics monitoring',
    'Keep statutory workflows on track',
    'Ensure teams have the right access and tools',
  ],
  guidedSteps: [
    { title: 'Invite your team', description: 'Add core roles to unlock collaboration.', href: '/admin' },
    { title: 'Validate governance', description: 'Review compliance, ethics, and security posture.', href: '/admin/ethics' },
    { title: 'Review active workloads', description: 'Monitor cases, assessments, and interventions.', href: '/cases' },
  ],
  quickActions: [
    {
      title: 'Owner Dashboard',
      description: 'Manage users, settings, and system configuration.',
      icon: Shield,
      href: '/admin',
      color: 'bg-red-100 text-red-600',
    },
    {
      title: 'LA Dashboard',
      description: 'Statutory timeline monitoring and case oversight.',
      icon: Building,
      href: '/la/dashboard',
      color: 'bg-cyan-100 text-cyan-600',
    },
    {
      title: 'Institutional Management',
      description: 'Manage multi-academy trusts and institutions.',
      icon: Building,
      href: '/institutional-management',
      color: 'bg-slate-100 text-slate-600',
    },
    {
      title: 'Analytics',
      description: 'Review performance and delivery insights.',
      icon: TrendingUp,
      href: '/analytics',
      color: 'bg-indigo-100 text-indigo-600',
    },
  ],
};

const PLATFORM_ADMIN_PROFILE: RoleProfile = {
  id: 'platform-admin',
  label: 'Platform Admin',
  description: 'Operational oversight without owner-only controls.',
  roles: ['ADMIN'],
  primaryWorkspace: {
    label: 'Admin Studio',
    description: 'Operational governance and reporting.',
    href: '/studios/admin',
  },
  outcomes: [
    'Monitor operational performance and compliance signals',
    'Coordinate workflows across teams',
    'Keep delivery on track with analytics and reports',
  ],
  guidedSteps: [
    { title: 'Open admin studio', description: 'Review operational governance views.', href: '/studios/admin' },
    { title: 'Review analytics', description: 'Inspect outcomes and delivery metrics.', href: '/analytics' },
    { title: 'Check reports', description: 'Track reporting status and exports.', href: '/reports' },
  ],
  quickActions: [
    {
      title: 'Admin Studio',
      description: 'Operational governance views and compliance insights.',
      icon: Shield,
      href: '/studios/admin',
      color: 'bg-slate-100 text-slate-600',
    },
    {
      title: 'Analytics',
      description: 'Review performance and delivery insights.',
      icon: TrendingUp,
      href: '/analytics',
      color: 'bg-indigo-100 text-indigo-600',
    },
    {
      title: 'Reports',
      description: 'Monitor reporting outputs and evidence exports.',
      icon: FileText,
      href: '/reports',
      color: 'bg-orange-100 text-orange-600',
    },
    {
      title: 'Cases',
      description: 'Monitor case load and progress signals.',
      icon: Users,
      href: '/cases',
      color: 'bg-green-100 text-green-600',
    },
  ],
};

const LA_PROFILE: RoleProfile = {
  id: 'local-authority',
  label: 'Local Authority',
  description: 'Statutory oversight and case management at scale.',
  roles: ['LA_ADMIN', 'LA_MANAGER', 'LA_CASEWORKER', 'LOCAL_AUTHORITY', 'LAA'],
  primaryWorkspace: {
    label: 'Local Authority Dashboard',
    description: 'Prioritize statutory timelines and case readiness.',
    href: '/la/dashboard',
  },
  outcomes: [
    'Keep EHCP timelines within statutory limits',
    'Identify compliance risk early',
    'Coordinate multi-agency responses',
  ],
  guidedSteps: [
    { title: 'Review open cases', description: 'See priority workflows and deadlines.', href: '/la/dashboard' },
    { title: 'Check compliance risk', description: 'Spot at-risk timelines early.', href: '/ehcp/modules/compliance-risk' },
    { title: 'Approve EHCPs', description: 'Validate applications and decisions.', href: '/ehcp' },
  ],
  quickActions: [
    {
      title: 'LA Dashboard',
      description: 'Manage SEND provision and professional panels.',
      icon: Building,
      href: '/la/dashboard',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'EHCP Review',
      description: 'Review and approve EHCP applications.',
      icon: FileText,
      href: '/ehcp',
      color: 'bg-orange-100 text-orange-600',
    },
    {
      title: 'Compliance Risk',
      description: 'Track statutory risk indicators.',
      icon: Shield,
      href: '/ehcp/modules/compliance-risk',
      color: 'bg-slate-100 text-slate-600',
    },
    {
      title: 'Analytics',
      description: 'Inspect outcomes and delivery metrics.',
      icon: TrendingUp,
      href: '/analytics',
      color: 'bg-indigo-100 text-indigo-600',
    },
  ],
};

const EP_PROFILE: RoleProfile = {
  id: 'ep',
  label: 'Educational Psychologist',
  description: 'Assessments, reporting, and evidence-led decisions.',
  roles: ['EDUCATIONAL_PSYCHOLOGIST', 'EP'],
  primaryWorkspace: {
    label: 'EP Workspace',
    description: 'Assessments, reports, and case decisions in one place.',
    href: '/ep/dashboard',
  },
  outcomes: [
    'Deliver high-quality assessments quickly',
    'Convert evidence into clear, defensible reports',
    'Coordinate intervention planning with schools',
  ],
  guidedSteps: [
    { title: 'Start an assessment', description: 'Launch a cognitive assessment quickly.', href: '/assessments' },
    { title: 'Build an EHCP report', description: 'Generate structured evidence packs.', href: '/ehcp' },
    { title: 'Assign an intervention', description: 'Deploy evidence-based support.', href: '/interventions' },
  ],
  quickActions: [
    {
      title: 'Assessments',
      description: 'Conduct cognitive assessments using the ECCA framework.',
      icon: Brain,
      href: '/assessments',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'EHCP',
      description: 'Generate and manage EHCP reports.',
      icon: FileText,
      href: '/ehcp',
      color: 'bg-orange-100 text-orange-600',
    },
    {
      title: 'Interventions',
      description: 'Access evidence-based interventions for your cases.',
      icon: Zap,
      href: '/interventions',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Cases',
      description: 'Manage your student cases and profiles.',
      icon: Users,
      href: '/cases',
      color: 'bg-green-100 text-green-600',
    },
  ],
};

const SCHOOL_PROFILE: RoleProfile = {
  id: 'school',
  label: 'School Leadership',
  description: 'Referrals, interventions, and progress monitoring.',
  roles: ['SCHOOL_ADMIN', 'SENCO'],
  primaryWorkspace: {
    label: 'School Dashboard',
    description: 'Coordinate referrals, interventions, and outcomes.',
    href: '/school/dashboard',
  },
  outcomes: [
    'Track student support plans in one place',
    'Coordinate referrals with EPs and LA',
    'Monitor intervention impact quickly',
  ],
  guidedSteps: [
    { title: 'Review referrals', description: 'Check new cases and priorities.', href: '/cases' },
    { title: 'Assign interventions', description: 'Deploy evidence-based support.', href: '/interventions' },
    { title: 'Share progress', description: 'Report outcomes to stakeholders.', href: '/progress' },
  ],
  quickActions: [
    {
      title: 'Cases',
      description: 'Manage your student cases and profiles.',
      icon: Users,
      href: '/cases',
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Interventions',
      description: 'Access evidence-based interventions for your cases.',
      icon: Zap,
      href: '/interventions',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Progress',
      description: 'Track student progress and outcomes.',
      icon: TrendingUp,
      href: '/progress',
      color: 'bg-indigo-100 text-indigo-600',
    },
    {
      title: 'Training',
      description: 'Professional development and training resources.',
      icon: GraduationCap,
      href: '/training',
      color: 'bg-pink-100 text-pink-600',
    },
  ],
};

const TEACHER_PROFILE: RoleProfile = {
  id: 'teacher',
  label: 'Teacher',
  description: 'Classroom orchestration and daily progress tracking.',
  roles: ['TEACHER', 'STAFF'],
  primaryWorkspace: {
    label: 'Teacher Cockpit',
    description: 'Plan lessons, track progress, and assign interventions.',
    href: '/teachers',
  },
  outcomes: [
    'Create class groups and lesson assignments',
    'Run baseline assessments',
    'Monitor progress weekly',
  ],
  guidedSteps: [
    { title: 'Create your class', description: 'Set up learners and timetables.', href: '/teachers' },
    { title: 'Run baseline assessment', description: 'Capture starting points.', href: '/assessments' },
    { title: 'Assign an intervention', description: 'Launch evidence-based support.', href: '/interventions' },
  ],
  quickActions: [
    {
      title: 'Classroom Cockpit',
      description: 'Manage your class, assign lessons, and track daily progress.',
      icon: LayoutDashboard,
      href: '/teachers',
      color: 'bg-indigo-100 text-indigo-600',
    },
    {
      title: 'Assessments',
      description: 'Conduct cognitive assessments using the ECCA framework.',
      icon: Brain,
      href: '/assessments',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Interventions',
      description: 'Access evidence-based interventions for your cases.',
      icon: Zap,
      href: '/interventions',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Progress',
      description: 'Track student progress and outcomes.',
      icon: TrendingUp,
      href: '/progress',
      color: 'bg-indigo-100 text-indigo-600',
    },
  ],
};

const PARENT_PROFILE: RoleProfile = {
  id: 'parent',
  label: 'Parent/Carer',
  description: 'Progress visibility and collaboration.',
  roles: ['PARENT'],
  primaryWorkspace: {
    label: 'Parent Portal',
    description: 'View progress and collaborate with your team.',
    href: '/parent/dashboard',
  },
  outcomes: [
    'Understand current goals and progress',
    'Stay informed with updates from staff',
    'Share feedback with the team',
  ],
  guidedSteps: [
    { title: 'Connect your child profile', description: 'Link your child to their learning plan.', href: '/parent/dashboard' },
    { title: 'Review progress', description: 'See goals, milestones, and outcomes.', href: '/progress' },
    { title: 'Message your team', description: 'Collaborate with teachers and staff.', href: '/collaborate' },
  ],
  quickActions: [
    {
      title: 'Parent Portal',
      description: 'View your child\'s progress and communicate with teachers.',
      icon: Home,
      href: '/parent/dashboard',
      color: 'bg-rose-100 text-rose-600',
    },
    {
      title: 'Child Progress',
      description: 'Detailed breakdown of your child\'s learning journey.',
      icon: TrendingUp,
      href: '/progress',
      color: 'bg-blue-100 text-blue-600',
    },
  ],
};

const STUDENT_PROFILE: RoleProfile = {
  id: 'student',
  label: 'Student',
  description: 'Learning missions, progress, and rewards.',
  roles: ['STUDENT'],
  primaryWorkspace: {
    label: 'Student Dashboard',
    description: 'Track progress and launch learning missions.',
    href: '/student',
  },
  outcomes: [
    'Complete learning missions',
    'Track progress and rewards',
    'Build streaks and momentum',
  ],
  guidedSteps: [
    { title: 'Start Battle Royale', description: 'Jump into competitions and challenges.', href: '/gamification' },
    { title: 'Begin a coding mission', description: 'Learn through game modding.', href: '/demo/coding' },
    { title: 'Track your progress', description: 'Celebrate your wins and streaks.', href: '/progress' },
  ],
  quickActions: [
    {
      title: 'Gamification Hub',
      description: 'Compete in Battle Royale and check the leaderboard.',
      icon: Trophy,
      href: '/gamification',
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      title: 'Coding Curriculum',
      description: 'Learn to code by modding your favourite games.',
      icon: LayoutDashboard,
      href: '/demo/coding',
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'My Progress',
      description: 'Track your own learning achievements.',
      icon: TrendingUp,
      href: '/progress',
      color: 'bg-blue-100 text-blue-600',
    },
  ],
};

const RESEARCH_PROFILE: RoleProfile = {
  id: 'researcher',
  label: 'Researcher',
  description: 'Evidence, trials, and analytics.',
  roles: ['RESEARCHER'],
  primaryWorkspace: {
    label: 'Research Hub',
    description: 'Manage studies, ethics, and evidence workflows.',
    href: '/research',
  },
  outcomes: [
    'Launch new studies with ethics oversight',
    'Track data quality and outcomes',
    'Publish insights with confidence',
  ],
  guidedSteps: [
    { title: 'Open the research hub', description: 'Manage studies and evidence workflows.', href: '/research' },
    { title: 'Request a dataset', description: 'Access anonymized data safely.', href: '/research?tab=datasets' },
    { title: 'Launch a trial', description: 'Design and track a new study.', href: '/research' },
  ],
  quickActions: [
    {
      title: 'Research Hub',
      description: 'Manage clinical trials and validate assessment frameworks.',
      icon: Brain,
      href: '/research',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Data Enclave',
      description: 'Access anonymized datasets for analysis.',
      icon: Shield,
      href: '/research?tab=datasets',
      color: 'bg-slate-100 text-slate-600',
    },
  ],
};

const DEFAULT_PROFILE: RoleProfile = {
  id: 'default',
  label: 'Professional',
  description: 'Core tools and workflows.',
  roles: ['DEFAULT'],
  outcomes: [
    'Start assessments quickly',
    'Deploy interventions at pace',
    'Organize cases effectively',
  ],
  guidedSteps: [
    { title: 'Run an assessment', description: 'Start evidence-led assessments.', href: '/assessments' },
    { title: 'Open interventions', description: 'Deploy structured support plans.', href: '/interventions' },
    { title: 'Create a case', description: 'Organize student journeys in one place.', href: '/cases' },
  ],
  quickActions: [
    {
      title: 'Assessments',
      description: 'Conduct cognitive assessments using the ECCA framework.',
      icon: Brain,
      href: '/assessments',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Interventions',
      description: 'Access evidence-based interventions for your cases.',
      icon: Zap,
      href: '/interventions',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Professional Marketplace',
      description: 'Find jobs and connect with Local Authorities.',
      icon: Users,
      href: '/marketplace',
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Inquiries',
      description: 'View messages from potential clients.',
      icon: Mail,
      href: '/dashboard/inquiries',
      color: 'bg-teal-100 text-teal-600',
    },
  ],
};

const ROLE_PROFILES: RoleProfile[] = [
  OWNER_ADMIN_PROFILE,
  PLATFORM_ADMIN_PROFILE,
  LA_PROFILE,
  EP_PROFILE,
  SCHOOL_PROFILE,
  TEACHER_PROFILE,
  PARENT_PROFILE,
  STUDENT_PROFILE,
  RESEARCH_PROFILE,
];

export function resolveRoleProfile(role?: string): RoleProfile {
  const normalized = (role || '').toUpperCase();
  return ROLE_PROFILES.find((profile) => profile.roles.includes(normalized)) ?? DEFAULT_PROFILE;
}
