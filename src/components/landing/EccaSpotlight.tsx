'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { motion } from 'framer-motion';
import { Brain, Heart, Zap, Map, Code2, ArrowRight } from 'lucide-react';
import { Link } from '@/navigation';

export default function EccaSpotlight() {
  const letters = [
    {
      char: 'E',
      word: 'Emotion',
      desc: "Structured observation of emotional and motivational factors affecting learning — anxiety, engagement, and self-regulation — captured as part of the EP's clinical picture.",
      icon: Heart,
      color: "text-rose-400",
      bg: "bg-rose-400/10"
    },
    {
      char: 'C',
      word: 'Cognition',
      desc: "Strengths-based assessment of working memory, processing, and executive function using EP observation and mediated learning — grounded in Vygotsky and Baddeley's frameworks.",
      icon: Brain,
      color: "text-indigo-400",
      bg: "bg-indigo-400/10"
    },
    {
      char: 'C',
      word: 'Context',
      desc: "Systematic capture of environmental, social, and curriculum factors — sensory load, peer dynamics, and classroom conditions — that shape how a child learns and responds.",
      icon: Map,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10"
    },
    {
      char: 'A',
      word: 'Application',
      desc: "Assessment findings map directly to evidence-based interventions and EP recommendations — linking clinical insight to structured provision in one connected workflow.",
      icon: Zap,
      color: "text-amber-400",
      bg: "bg-amber-400/10"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-slate-950 to-indigo-950/20 text-white relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-indigo-600 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-10 w-64 h-64 bg-rose-600 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: Narrative */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6">
              <Code2 className="w-3.5 h-3.5" />
              PROPRIETARY TECHNOLOGY
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
              The ECCA Framework
            </h2>
            
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              Standard EdTech digitises textbooks. <span className="text-white font-semibold">We digitise the Psychologist.</span>
            </p>
            
            <p className="text-slate-400 mb-8 leading-relaxed">
              Our proprietary ECCA engine runs invisibly in the background, orchestrating every interaction based on real-time psychological first principles. It doesn't just manage learning; it manages the <span className="italic">psychology of learning</span>.
            </p>

            <Link href="/ai-agents">
              <button className="group px-8 py-4 bg-white text-indigo-950 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                See ECCA In Action
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </motion.div>

          {/* Right Column: Visual Component Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {letters.map((item, idx) => (
              <motion.div
                key={item.char + idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="p-6 rounded-2xl bg-slate-900/50 border border-slate-700/50 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all backdrop-blur-sm group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center`}>
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <span className="text-4xl font-black text-slate-800 group-hover:text-slate-700 transition-colors select-none">
                    {item.char}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{item.word}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
