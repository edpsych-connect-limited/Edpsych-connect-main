import { resolveRoleProfile } from '@/lib/navigation/role-journeys';

const ROUTE_TIPS: Array<{ match: string; tips: string[] }> = [
  {
    match: '/ehcp',
    tips: [
      'Keep the statutory timeline visible while drafting decisions.',
      'Use evidence packs to support every recommendation.',
    ],
  },
  {
    match: '/assessments',
    tips: [
      'Capture baseline scores early for cleaner progress tracking.',
      'Use structured notes for defensible summaries.',
    ],
  },
  {
    match: '/interventions',
    tips: [
      'Prioritize interventions aligned to primary needs.',
      'Set a review date before you deploy support.',
    ],
  },
  {
    match: '/cases',
    tips: [
      'Confirm stakeholders and roles before assigning tasks.',
      'Keep each case focused on one clear outcome.',
    ],
  },
  {
    match: '/progress',
    tips: [
      'Compare baseline and current outcomes weekly.',
      'Flag stalled progress to trigger early support.',
    ],
  },
  {
    match: '/admin/ethics',
    tips: [
      'Triage pending AI reviews first to keep approvals moving.',
      'Add decision notes to build a defensible audit trail.',
    ],
  },
  {
    match: '/admin',
    tips: [
      'Review governance alerts daily to avoid compliance drift.',
      'Audit access changes after onboarding new staff.',
    ],
  },
  {
    match: '/reports',
    tips: [
      'Capture evidence sources before finalizing recommendations.',
      'Assign responsibility and timescales for every action.',
    ],
  },
  {
    match: '/reports/create',
    tips: [
      'Draft the executive summary last to keep it consistent.',
      'Confirm recommendations map to measurable outcomes.',
    ],
  },
  {
    match: '/training',
    tips: [
      'Prioritize CPD modules tied to current case needs.',
      'Track certificate progress after each session.',
    ],
  },
  {
    match: '/marketplace/dashboard',
    tips: [
      'Confirm availability windows before accepting requests.',
      'Keep profile compliance details current.',
    ],
  },
  {
    match: '/subscription',
    tips: [
      'Review usage against plan limits before upgrading.',
      'Download invoices monthly for audit readiness.',
    ],
  },
  {
    match: '/safeguarding',
    tips: [
      'Log concerns immediately and tag relevant stakeholders.',
      'Escalate high-risk items within policy timeframes.',
    ],
  },
  {
    match: '/outcomes',
    tips: [
      'Update baseline data before logging new outcomes.',
      'Highlight stalled progress for review.',
    ],
  },
  {
    match: '/analytics',
    tips: [
      'Check p95 latency before major launches.',
      'Cross-reference trends with evidence snapshots.',
    ],
  },
  {
    match: '/onboarding',
    tips: [
      'Complete role details to unlock tailored workflows.',
      'Run the role tour before starting your first case.',
    ],
  },
  {
    match: '/marketplace/book',
    tips: [
      'Be specific about the request so the EP can scope quickly.',
      'Share preferred dates to reduce scheduling delays.',
    ],
  },
  {
    match: '/la/dashboard',
    tips: [
      'Review statutory bottlenecks first each day.',
      'Escalate at-risk timelines before day 20.',
    ],
  },
  {
    match: '/school/dashboard',
    tips: [
      'Align interventions to your SENCO priorities.',
      'Check progress updates before parent meetings.',
    ],
  },
  {
    match: '/ep/dashboard',
    tips: [
      'Queue assessments by urgency and complexity.',
      'Draft reports while evidence is fresh.',
    ],
  },
  {
    match: '/parent',
    tips: [
      'Use messaging to confirm next review dates.',
      'Keep a weekly progress note to share with staff.',
    ],
  },
];

export function getContextualQuickTips(params: {
  role?: string;
  pathname?: string;
  maxTips?: number;
}): string[] {
  const { role, pathname, maxTips = 3 } = params;
  const normalizedPath = (pathname || '').toLowerCase();
  const roleProfile = resolveRoleProfile(role);

  const matched = ROUTE_TIPS.find((entry) => normalizedPath.includes(entry.match));
  const tips: string[] = [];

  if (matched) {
    tips.push(...matched.tips);
  }

  if (tips.length < maxTips) {
    roleProfile.outcomes.forEach((outcome) => {
      if (tips.length < maxTips) {
        tips.push(`Outcome focus: ${outcome}`);
      }
    });
  }

  if (tips.length === 0) {
    tips.push(
      'Focus on one outcome at a time to avoid workflow overload.',
      'Use the guided steps card to stay on track.',
      'Check the help center if you get stuck.',
    );
  }

  return tips.slice(0, maxTips);
}
