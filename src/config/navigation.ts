/**
 * @copyright EdPsych Connect Limited 2026
 * @license Proprietary - All Rights Reserved
 * 
 * Navigation Configuration
 * 
 * Defines the "Studio" based navigation structure for the application.
 * strict UK English enforcement.
 */

export type UserRole = 
  | 'ADMIN' 
  | 'SUPERADMIN' 
  | 'TEACHER' 
  | 'STAFF' 
  | 'PARENT' 
  | 'STUDENT' 
  | 'RESEARCHER' 
  | 'LAA' 
  | 'LOCAL_AUTHORITY' 
  | 'EP' 
  | 'EDUCATIONAL_PSYCHOLOGIST' 
  | 'SENCO'
  | 'GUEST'
  | 'EXTERNAL_TESTER';

export interface NavItem {
  href: string;
  label: string;
  icon?: string; // Icon name from lucide-react
  roles?: UserRole[]; // If undefined, accessible by all (or controlled by parent)
  beta?: boolean;
}

export interface NavGroup {
  id: string;
  label: string; // The "Studio" Name
  items: NavItem[];
  roles?: UserRole[];
}

export const NAVIGATION_CONFIG: NavGroup[] = [
  {
    id: 'clinical_studio',
    label: 'Clinical Studio',
    roles: ['ADMIN', 'SUPERADMIN', 'TEACHER', 'STAFF', 'EP', 'EDUCATIONAL_PSYCHOLOGIST', 'SENCO', 'LAA', 'LOCAL_AUTHORITY'],
    items: [
      { href: '/studios/clinical', label: 'Studio Overview' },
      { href: '/ehcp', label: 'EHCP Management' },
      { href: '/assessments', label: 'Assessments' },
      { href: '/interventions', label: 'Interventions Library' },
      { href: '/cases', label: 'Case Files' },
      { href: '/professional/portal', label: 'Contribution Portal', roles: ['EP', 'EDUCATIONAL_PSYCHOLOGIST'] },
    ]
  },
  {
    id: 'classroom_studio',
    label: 'Classroom Studio',
    roles: ['ADMIN', 'SUPERADMIN', 'TEACHER', 'STAFF', 'SENCO'],
    items: [
      { href: '/studios/classroom', label: 'Studio Overview' },
      { href: '/teachers', label: 'Classroom Management' },
      { href: '/progress', label: 'Pupil Progress' },
      { href: '/behaviour/tracker', label: 'Behaviour Tracker' },
      { href: '/networking', label: 'Staff Community' },
    ]
  },
  {
    id: 'engagement_studio',
    label: 'Engagement Studio',
    roles: ['ADMIN', 'SUPERADMIN', 'TEACHER', 'STAFF', 'STUDENT'],
    items: [
      { href: '/studios/engagement', label: 'Studio Overview' },
      { href: '/gamification', label: 'Gamification Zone' },
      { href: '/tokenisation', label: 'Rewards & Tokens' },
      { href: '/training', label: 'Training Centre' },
      { href: '/ai-agents', label: 'AI Companions', beta: true },
    ]
  },
  {
    id: 'admin_studio',
    label: 'Admin Studio',
    roles: ['ADMIN', 'SUPERADMIN', 'LAA', 'LOCAL_AUTHORITY'],
    items: [
      { href: '/studios/admin', label: 'Studio Overview' },
      { href: '/institutional-management', label: 'Institutional Management', roles: ['SUPERADMIN'] },
      { href: '/admin', label: 'System Administration', roles: ['SUPERADMIN'] },
      { href: '/la/dashboard', label: 'LA Dashboard', roles: ['LAA', 'LOCAL_AUTHORITY'] },
      { href: '/la/compliance', label: 'Compliance & Audits', roles: ['LAA', 'LOCAL_AUTHORITY'] },
    ]
  },
  {
    id: 'research_studio',
    label: 'Research Studio',
    roles: ['RESEARCHER', 'SUPERADMIN', 'EP', 'EDUCATIONAL_PSYCHOLOGIST'],
    items: [
      { href: '/research', label: 'Research Hub' },
      { href: '/research?tab=datasets', label: 'Data Enclave' },
    ]
  },
  {
    id: 'marketplace_studio',
    label: 'Marketplace Studio',
    roles: ['ADMIN', 'SUPERADMIN', 'EP', 'EDUCATIONAL_PSYCHOLOGIST', 'LAA', 'LOCAL_AUTHORITY'],
    items: [
      { href: '/marketplace', label: 'EP Marketplace' },
      { href: '/marketplace/dashboard', label: 'Professional Dashboard', roles: ['EP', 'EDUCATIONAL_PSYCHOLOGIST'] },
      { href: '/marketplace/profile', label: 'My Professional Profile', roles: ['EP', 'EDUCATIONAL_PSYCHOLOGIST'] },
      { href: '/marketplace/la-panel', label: 'LA Panel', roles: ['LAA', 'LOCAL_AUTHORITY'] },
    ]
  },
  {
    id: 'family_studio',
    label: 'Family Studio',
    roles: ['PARENT'],
    items: [
      { href: '/parents', label: 'Parent Portal' },
      { href: '/progress', label: 'Child Progress' },
    ]
  },
  {
    id: 'student_studio',
    label: 'Student Studio',
    roles: ['STUDENT'],
    items: [
      { href: '/progress', label: 'My Progress' },
      { href: '/gamification', label: 'My Learning' },
    ]
  },
  {
    id: 'resources',
    label: 'Resources',
    items: [
      { href: '/help', label: 'Help Centre' },
      { href: '/blog', label: 'Professional Blog' },
    ]
  },
  {
    id: 'guest_access',
    label: 'Guest Access',
    roles: ['GUEST'],
    items: [
      { href: '/demo', label: 'Platform Demo' },
      { href: '/login', label: 'Login' }
    ]
  }
];

export function getNavigationForRole(role: string): NavGroup[] {
  const normalizeRole = role.toUpperCase() as UserRole;
  
  return NAVIGATION_CONFIG.map(group => {
    // Check if group is accessible
    if (group.roles && !group.roles.includes(normalizeRole)) {
      return null;
    }

    // Filter items
    const visibleItems = group.items.filter(item => {
      if (!item.roles) return true;
      return item.roles.includes(normalizeRole);
    });

    if (visibleItems.length === 0) return null;

    return {
      ...group,
      items: visibleItems
    };
  }).filter((g): g is NavGroup => g !== null);
}
