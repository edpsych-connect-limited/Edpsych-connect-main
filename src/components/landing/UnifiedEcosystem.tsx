'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 */

import { motion } from 'framer-motion';
import {
  ClipboardList,
  Brain,
  Target,
  FileText,
  Network,
} from 'lucide-react';

const workflowSteps = [
  {
    id: 'referral',
    step: '01',
    title: 'Referral & Case Creation',
    description: 'A school refers a child. A case is created with student profile, presenting concerns, and consent tracking. The EP is assigned. Everything is in one place from day one.',
    icon: ClipboardList,
    color: 'blue',
    features: ['Student profile', 'Case priority triage', 'Consent management'],
  },
  {
    id: 'assessment',
    step: '02',
    title: 'EP Assessment',
    description: "The EP conducts the assessment using the ECCA framework — cognitive, emotional, contextual. Observations, strengths, needs, and the EP's clinical interpretation are all captured in the instance.",
    icon: Brain,
    color: 'purple',
    features: ['ECCA framework', 'Domain observations', 'EP recommendations'],
  },
  {
    id: 'intervention',
    step: '03',
    title: 'Intervention Planning',
    description: 'Based on the assessment, structured interventions are created — with goals, frequency, responsible person, and review dates. Directly linked to the assessment that informed them.',
    icon: Target,
    color: 'amber',
    features: ['Linked to assessment', 'Structured goals', 'Progress reviews'],
  },
  {
    id: 'report',
    step: '04',
    title: 'Report & EHCP',
    description: 'The EP generates a statutory report from the case data. If the child needs an EHCP, the full application workflow is built in — with statutory deadlines, multi-agency contributions, and export.',
    icon: FileText,
    color: 'green',
    features: ['Assessment report', 'EHCP lifecycle', 'Statutory deadlines'],
  },
];

const colourMap: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  blue:   { border: 'border-blue-500/30',   bg: 'bg-blue-500/10',   text: 'text-blue-400',   badge: 'bg-blue-500/20 text-blue-300' },
  purple: { border: 'border-purple-500/30', bg: 'bg-purple-500/10', text: 'text-purple-400', badge: 'bg-purple-500/20 text-purple-300' },
  amber:  { border: 'border-amber-500/30',  bg: 'bg-amber-500/10',  text: 'text-amber-400',  badge: 'bg-amber-500/20 text-amber-300' },
  green:  { border: 'border-green-500/30',  bg: 'bg-green-500/10',  text: 'text-green-400',  badge: 'bg-green-500/20 text-green-300' },
};

export default function UnifiedEcosystem() {
  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-slate-950 to-slate-950" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 mb-6"
          >
            <Network className="w-4 h-4" />
            <span className="text-sm font-medium">The Golden Thread</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            One Workflow.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Every Step Connected.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 max-w-3xl mx-auto"
          >
            From the moment a child is referred to the day their EHCP is finalised — every decision, every intervention, every piece of evidence lives in one traceable system.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connecting line desktop */}
          <div className="hidden lg:block absolute top-14 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-500/30 via-purple-500/30 via-amber-500/30 to-green-500/30 z-0" />

          {workflowSteps.map((step, index) => {
            const Icon = step.icon;
            const c = colourMap[step.color];
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-slate-900/80 border ${c.border} rounded-2xl p-6 z-10`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${c.text}`} />
                  </div>
                  <span className={`text-3xl font-black ${c.text} opacity-30`}>{step.step}</span>
                </div>

                <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">{step.description}</p>

                <div className="flex flex-wrap gap-1.5">
                  {step.features.map((f) => (
                    <span key={f} className={`text-xs px-2 py-0.5 rounded-full ${c.badge}`}>{f}</span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-slate-500 mt-10"
        >
          Every step is tenant-isolated, audit-logged, and GDPR-compliant by design.
        </motion.p>
      </div>
    </section>
  );
}
