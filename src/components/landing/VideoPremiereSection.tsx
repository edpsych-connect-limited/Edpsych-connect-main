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
import Link from 'next/link';
import { GraduationCap, BookOpen, Users, Award } from 'lucide-react';

export default function VideoPremiereSection() {
  const trainingFeatures = [
    {
      icon: GraduationCap,
      title: "CPD Accredited Courses",
      description: "Professional development courses approved for Continuing Professional Development hours.",
      color: "text-indigo-400",
      bg: "bg-indigo-400/10"
    },
    {
      icon: BookOpen,
      title: "Evidence-Based Content",
      description: "All training materials grounded in peer-reviewed research and best practice.",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10"
    },
    {
      icon: Users,
      title: "Expert Presenters",
      description: "Learn from practising Educational Psychologists and SEND specialists.",
      color: "text-amber-400",
      bg: "bg-amber-400/10"
    },
    {
      icon: Award,
      title: "Certificates Included",
      description: "Receive verified certificates upon completion of each training module.",
      color: "text-purple-400",
      bg: "bg-purple-400/10"
    }
  ];

  return (
    <section className="py-24 bg-slate-900 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 mb-6"
          >
            <GraduationCap className="w-4 h-4" />
            <span className="text-sm font-medium">Professional Development</span>
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Training & Professional Development</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Comprehensive CPD courses covering SEND assessment, intervention strategies, and evidence-based practice.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {trainingFeatures.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-6 rounded-2xl bg-slate-800 border border-slate-700 hover:border-indigo-500/50 transition-all text-center"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 mx-auto`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link 
            href="/demo/training"
            className="inline-block px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors"
          >
            Explore Training Courses
          </Link>
        </div>
      </div>
    </section>
  );
}
