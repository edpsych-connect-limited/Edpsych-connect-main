'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 */

import { motion } from 'framer-motion';
import { Link } from '@/navigation';
import {
  Brain, FileCheck, Target, ClipboardList, Users, BarChart3,
  Shield, GraduationCap, BookOpen, Trophy, Search, MessageSquareText,
  Layers, Heart, Building2, FlaskConical, Crown, LucideIcon,
} from 'lucide-react';

type FeatureTier = 'free' | 'standard' | 'professional' | 'institution' | 'research';

interface Capability {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  bg: string;
  href: string;
  tier: FeatureTier;
}

const tierConfig: Record<FeatureTier, { label: string; className: string }> = {
  free:         { label: 'Free',         className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  standard:     { label: 'Standard',     className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  professional: { label: 'Professional', className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  institution:  { label: 'Institution',  className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  research:     { label: 'Research',     className: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
};

const capabilities: Capability[] = [
  {
    icon: Brain,
    title: 'ECCA Assessment Framework',
    description: 'The proprietary Emotion-Cognition-Context-Application framework for conducting EP-grade cognitive assessments. Structured domain observations, clinical interpretation, and recommendations captured in one instance.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-400/10',
    href: '/assessments',
    tier: 'professional',
  },
  {
    icon: Target,
    title: 'Structured Intervention Engine',
    description: 'Create interventions directly linked to assessment instances. Set goals, frequency, responsible person, and review dates. Track progress through a structured review cycle — from planned to completed.',
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
    href: '/interventions',
    tier: 'standard',
  },
  {
    icon: FileCheck,
    title: 'EHCP Management Suite',
    description: 'Full statutory EHCP lifecycle — from EHC needs assessment request through to finalised plan. Statutory timeline tracking (6/16/20-week gates), multi-agency contributions, golden thread coherence, and LA-compliant PDF export.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    href: '/ehcp',
    tier: 'professional',
  },
  {
    icon: ClipboardList,
    title: 'Case Management',
    description: 'Manage student cases from first referral to closure. Priority triage, case type classification, assessment and intervention history, consent tracking, and safeguarding flags — all in one place.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    href: '/cases',
    tier: 'standard',
  },
  {
    icon: BarChart3,
    title: 'Progress & Outcomes Tracking',
    description: 'Track student outcomes at the assessment instance level. Baseline and outcome dates, impact ratings, and evidence data — giving EPs and schools a clear picture of what is working.',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    href: '/progress',
    tier: 'standard',
  },
  {
    icon: Users,
    title: 'Multi-Role Platform',
    description: 'Purpose-built for every stakeholder: Educational Psychologists, SENCOs, School Admins, Teachers, and Parents — each with a tailored dashboard, appropriate permissions, and relevant workflows.',
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
    href: '/signup',
    tier: 'free',
  },
  {
    icon: Layers,
    title: 'Differentiated Learning',
    description: 'Lesson content differentiated across learning profiles — visual, auditory, kinesthetic, and cognitive load-adjusted. Designed so every child in a year group can access the same objective, their way.',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    href: '/demo/differentiation',
    tier: 'standard',
  },
  {
    icon: Trophy,
    title: 'Gamified Engagement Engine',
    description: "For children who learn better through play — lessons delivered as challenges, quests, and achievements. Gamification as a differentiation tool, not a distraction. Same learning objective, different access route.",
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    href: '/gamification',
    tier: 'standard',
  },
  {
    icon: Shield,
    title: 'Safeguarding & Compliance',
    description: 'GDPR-compliant audit logging at every step. Tenant isolation ensures no data crosses school or LA boundaries. Safeguarding flags, consent management, and data export rights built in by design.',
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    href: '/about',
    tier: 'institution',
  },
  {
    icon: Heart,
    title: 'Parent Portal',
    description: "Real-time visibility of a child's support plan, intervention progress, and upcoming reviews. Direct communication with the school team. Parents as partners, not afterthoughts.",
    color: 'text-rose-400',
    bg: 'bg-rose-400/10',
    href: '/parent',
    tier: 'free',
  },
  {
    icon: GraduationCap,
    title: 'CPD & Professional Growth',
    description: 'Integrated CPD tracking for EPs and SENCOs. Earn and log professional development hours as part of your normal workflow — not as a separate admin task.',
    color: 'text-lime-400',
    bg: 'bg-lime-400/10',
    href: '/training',
    tier: 'standard',
  },
  {
    icon: Search,
    title: 'EP Marketplace',
    description: 'Schools and LAs find and commission Educational Psychologists. EPs manage availability and referrals. DBS verification and insurance evidence collection built in.',
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
    href: '/marketplace',
    tier: 'free',
  },
  {
    icon: MessageSquareText,
    title: 'Professional Network & Forum',
    description: "Connect with other EPs, SENCOs, and educators. Share evidence-based practice, ask questions, and stay current. A community built around what actually helps children.",
    color: 'text-teal-400',
    bg: 'bg-teal-400/10',
    href: '/forum',
    tier: 'free',
  },
  {
    icon: BookOpen,
    title: 'Knowledge Hub',
    description: 'Curated research, case law updates, SEND Code of Practice guidance, and EdPsych practice articles. Kept current. Relevant to what you actually do.',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    href: '/blog',
    tier: 'free',
  },
  {
    icon: Building2,
    title: 'LA Dashboard & SEN2 Returns',
    description: 'Local Authority oversight of statutory timelines across all schools. SEN2 returns generated automatically from live case data. No more spreadsheet reconciliation.',
    color: 'text-indigo-300',
    bg: 'bg-indigo-300/10',
    href: '/la/dashboard',
    tier: 'institution',
  },
  {
    icon: FlaskConical,
    title: 'Research Foundation',
    description: 'Contribute anonymised outcome data to the evidence base. Validate interventions at scale. Built for EPs who want their practice to contribute to the wider field.',
    color: 'text-cyan-300',
    bg: 'bg-cyan-300/10',
    href: '/research',
    tier: 'research',
  },
];

export default function CoreCapabilitiesGrid() {
  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 mb-6"
          >
            <Crown className="w-4 h-4" />
            <span className="text-sm font-medium">Full Platform Capabilities</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Everything a SEND Team Needs.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Nothing They Don't.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 max-w-3xl mx-auto"
          >
            Every capability below is live and in production — built from real EP practice, refined for real schools.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {capabilities.map((cap, index) => {
            const Icon = cap.icon;
            const tier = tierConfig[cap.tier];
            return (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (index % 4) * 0.05 }}
              >
                <Link
                  href={cap.href}
                  className="group flex flex-col h-full bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl ${cap.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${cap.color}`} />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tier.className}`}>
                      {tier.label}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">{cap.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed flex-1">{cap.description}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center text-sm text-slate-500 mt-10"
        >
          Free tier available · No credit card required to start
        </motion.p>
      </div>
    </section>
  );
}
