'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { motion } from 'framer-motion';
import { 
  Brain, 
  ArrowRight, 
  Database, 
  Sparkles, 
  Users, 
  LineChart, 
  Code, 
  GraduationCap,
  Network,
  ShieldCheck
} from 'lucide-react';

const ecosystemSteps = [
  {
    id: 'input',
    title: '1. Intelligent Intake',
    description: 'Teachers and EPs input observations, assessments, and EHCP data. The system instantly structures this unstructured data.',
    icon: Database,
    color: 'blue',
    features: ['Assessment Engine', 'EHCP Manager', 'Case History']
  },
  {
    id: 'process',
    title: '2. AI Orchestration',
    description: 'Our "Invisible Intelligence" analyzes the profile against 100+ evidence-based strategies to design the perfect intervention.',
    icon: Brain,
    color: 'purple',
    features: ['Intervention Designer', 'ECCA Framework', 'AI Plan Generator']
  },
  {
    id: 'action',
    title: '3. Personalized Action',
    description: 'The child receives bespoke support—from specific classroom strategies to gamified coding lessons that build missing skills.',
    icon: Sparkles,
    color: 'amber',
    features: ['Coding Curriculum', 'Bespoke Assignments', 'Accessibility Tools']
  },
  {
    id: 'feedback',
    title: '4. Community Loop',
    description: 'Progress is tracked in real-time. Parents see growth, teachers see impact, and the system learns what works best.',
    icon: Network,
    color: 'green',
    features: ['Parent Portal', 'Analytics Dashboard', 'Professional Network']
  }
];

export default function UnifiedEcosystem() {
  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-slate-950 to-slate-950" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
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
            One Platform. <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Infinite Connections.</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 max-w-3xl mx-auto"
          >
            We don't just build features. We build a cohesive ecosystem where every action informs the next, creating a continuous cycle of improvement for every child.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-green-500/30 z-0" />

          {ecosystemSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative z-10"
              >
                <div className={`w-24 h-24 mx-auto bg-slate-900 rounded-2xl border-2 border-${step.color}-500/30 flex items-center justify-center mb-8 shadow-lg shadow-${step.color}-500/20 group hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-10 h-10 text-${step.color}-400`} />
                </div>
                
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors h-full">
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                    {step.description}
                  </p>
                  
                  <div className="space-y-2">
                    {step.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                        <div className={`w-1.5 h-1.5 rounded-full bg-${step.color}-500`} />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile Arrow */}
                {index < ecosystemSteps.length - 1 && (
                  <div className="lg:hidden flex justify-center my-4">
                    <ArrowRight className="w-6 h-6 text-slate-600 rotate-90" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-20 text-center"
        >
          <div className="inline-flex flex-col md:flex-row items-center gap-8 p-4 md:p-1 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md max-w-full">
            <div className="px-4 md:px-8 py-2 md:py-4">
              <div className="text-3xl font-bold text-white">47+</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">Hours Saved / Mo</div>
            </div>
            <div className="hidden md:block w-px h-12 bg-slate-800" />
            <div className="w-full h-px bg-slate-800 md:hidden" />
            <div className="px-4 md:px-8 py-2 md:py-4">
              <div className="text-3xl font-bold text-white">100%</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">Ofsted Compliant</div>
            </div>
            <div className="hidden md:block w-px h-12 bg-slate-800" />
            <div className="w-full h-px bg-slate-800 md:hidden" />
            <div className="px-4 md:px-8 py-2 md:py-4">
              <div className="text-3xl font-bold text-white">Zero</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">Children Left Behind</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
