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
import { Brain, Library, GraduationCap, Trophy, Clock, ShieldCheck, FileCheck, Code, MessageSquareText, Users, Search, Heart } from 'lucide-react';

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
      icon: FileCheck,
      title: "EHCP Management Suite",
      description: "Complete EHCP lifecycle management. Annual reviews, compliance risk AI, golden thread coherence, and automated SEN2 returns.",
      color: "text-cyan-400",
      bg: "bg-cyan-400/10"
    },
    {
      icon: Code,
      title: "Developers of Tomorrow",
      description: "Proprietary coding curriculum designed for neurodiversity. Block coding to Python to React—with cognitive load management built in.",
      color: "text-rose-400",
      bg: "bg-rose-400/10"
    },
    {
      icon: MessageSquareText,
      title: "Universal Translator",
      description: "Converts complex educational jargon into plain English. Parents understand reports. Teachers save hours of explanation.",
      color: "text-teal-400",
      bg: "bg-teal-400/10"
    },
    {
      icon: Heart,
      title: "Parent Portal",
      description: "Real-time progress tracking for families. Direct messaging with support teams. Resources tailored to your child's needs.",
      color: "text-red-400",
      bg: "bg-red-400/10"
    },
    {
      icon: Search,
      title: "EP Marketplace",
      description: "Find vetted Educational Psychologists instantly. LA Panel approved, DBS checked, £6M insured. Book assessments in minutes.",
      color: "text-orange-400",
      bg: "bg-orange-400/10"
    },
    {
      icon: Users,
      title: "Professional Forum",
      description: "Connect with 2,300+ EPs, SENCOs, and educators. Share evidence-based practices. Learn from expert contributors.",
      color: "text-violet-400",
      bg: "bg-violet-400/10"
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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {capabilities.map((cap, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all group"
            >
              <div className={`w-10 h-10 rounded-xl ${cap.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <cap.icon className={`w-5 h-5 ${cap.color}`} />
              </div>
              <h3 className="text-lg font-bold mb-2 text-slate-100">{cap.title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                {cap.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
