'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import { motion } from 'framer-motion';
import { Brain, Library, GraduationCap, Trophy, Clock, ShieldCheck } from 'lucide-react';

export default function CoreCapabilitiesGrid() {
  const capabilities = [
    {
      icon: Brain,
      title: "ECCA Framework Engine",
      description: "The cognitive core. Emotion, Cognition, Context, and Application—orchestrated invisibly in real-time.",
      color: "text-indigo-400",
      bg: "bg-indigo-400/10"
    },
    {
      icon: Library,
      title: "Intervention Designer",
      description: "Access 100+ evidence-based strategies. The system suggests the perfect intervention before you even ask.",
      color: "text-pink-400",
      bg: "bg-pink-400/10"
    },
    {
      icon: GraduationCap,
      title: "Professional Growth",
      description: "Integrated CPD library. Earn hours automatically as you work, tracking progress without the admin.",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10"
    },
    {
      icon: Trophy,
      title: "Gamified Engagement Engine",
      description: "Engagement that sustains itself. Battle Royale modes and live leaderboards that make learning addictive.",
      color: "text-amber-400",
      bg: "bg-amber-400/10"
    },
    {
      icon: Clock,
      title: "Zero-Touch EHCP Drafting",
      description: "Paperwork that writes itself. Our invisible intelligence drafts 80% of the report while you observe.",
      color: "text-blue-400",
      bg: "bg-blue-400/10"
    },
    {
      icon: ShieldCheck,
      title: "Data Sovereignty & Ethics",
      description: "Built on rigorous standards. Enterprise clients can Bring Your Own Database (BYOD) for total data autonomy.",
      color: "text-purple-400",
      bg: "bg-purple-400/10"
    }
  ];

  return (
    <section id="features" className="py-24 bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">The Full Inventory</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            A complete orchestration layer for Special Educational Needs. Every tool you need, integrated into one seamless system.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {capabilities.map((cap, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl ${cap.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <cap.icon className={`w-6 h-6 ${cap.color}`} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-100">{cap.title}</h3>
              <p className="text-slate-400 leading-relaxed">
                {cap.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
