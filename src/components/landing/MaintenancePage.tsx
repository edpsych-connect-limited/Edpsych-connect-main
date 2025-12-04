'use client';

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * Enhanced Maintenance/Coming Soon Page
 * Features the manifesto and crisis messaging to build anticipation
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2,
  Heart,
  AlertTriangle,
  Shield,
  Users,
  Zap,
  Clock,
  TrendingUp,
  BookOpen,
  Target,
  Lightbulb,
  ChevronDown,
  X,
} from 'lucide-react';

// The Crisis Statistics
const CRISIS_STATS = [
  { value: '1 in 5', label: 'UK children have a mental health condition', icon: AlertTriangle },
  { value: '18 months', label: 'Average wait for CAMHS assessment', icon: Clock },
  { value: '60%', label: 'Educational psychologist vacancies unfilled', icon: Users },
  { value: '2.4M', label: 'Children waiting for SEND support', icon: Heart },
];

// Without EdPsych Connect
const WITHOUT_US = [
  'Children wait 18+ months for assessment while struggling',
  'Teachers lack specialist support for diverse learners',
  'Parents fight exhausting battles for basic provision',
  'Schools rely on outdated, paper-based processes',
  'Early warning signs go unnoticed until crisis point',
  'Rural areas have virtually no EP access',
];

// With EdPsych Connect
const WITH_US = [
  'AI-powered early identification catches issues in weeks',
  'Evidence-based interventions delivered instantly',
  'Seamless collaboration between schools, parents, and specialists',
  'Digital EHCP management saves hundreds of hours',
  'Every child gets personalised support pathways',
  'Equal access regardless of location or resources',
];

// Manifesto Points
const MANIFESTO = [
  {
    title: 'Every Child Deserves to Thrive',
    description: 'Not just survive school, but flourish. We believe neurodiversity is a strength, not a deficit.',
    icon: Heart,
  },
  {
    title: 'Early Intervention Changes Lives',
    description: 'Catching difficulties at 5 rather than 15 transforms outcomes. AI helps us identify needs before crisis.',
    icon: Zap,
  },
  {
    title: 'Technology Amplifies Expertise',
    description: 'We don\'t replace educational psychologists—we multiply their impact 100-fold.',
    icon: Brain,
  },
  {
    title: 'Parents Are Partners',
    description: 'Families deserve transparency, not bureaucracy. Every parent should understand their child\'s needs.',
    icon: Users,
  },
  {
    title: 'Evidence Over Intuition',
    description: 'Our assessments are grounded in peer-reviewed research and clinical best practice.',
    icon: BookOpen,
  },
  {
    title: 'Access Is a Right',
    description: 'Geography and wealth should never determine whether a child gets support.',
    icon: Shield,
  },
];

export default function MaintenancePage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showScrollHint, setShowScrollHint] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollHint(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // In production, this would call the waitlist API
      try {
        await fetch('/api/waitlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
      } catch {
        // Silent fail - still show success to user
      }
      setIsSubmitted(true);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 right-1/4 w-[20%] h-[20%] bg-amber-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-20 max-w-5xl mx-auto text-center">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-8 flex justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 animate-pulse" />
              <div className="w-24 h-24 bg-slate-900/50 backdrop-blur-xl border border-indigo-500/30 rounded-2xl flex items-center justify-center shadow-2xl">
                <Brain className="w-12 h-12 text-indigo-400" />
              </div>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-400">
              EdPsych Connect
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-slate-400 mb-4 max-w-3xl mx-auto"
          >
            We&apos;re building something extraordinary.
          </motion.p>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-indigo-400 mb-12 font-medium"
          >
            The platform that will transform how we support every child&apos;s learning journey.
          </motion.p>

          {/* Email Capture */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="max-w-md mx-auto mb-16"
          >
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500" />
                <div className="relative flex bg-slate-900 rounded-xl p-1.5 border border-slate-800">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email for launch updates..."
                    className="flex-1 bg-transparent text-white placeholder-slate-500 px-4 py-3 outline-none rounded-lg"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    Notify Me <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            ) : (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center justify-center gap-3 text-green-400"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">You&apos;re on the list! We&apos;ll notify you at launch.</span>
              </motion.div>
            )}
          </motion.div>

          {/* Scroll Hint */}
          <AnimatePresence>
            {showScrollHint && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
              >
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex flex-col items-center gap-2 text-slate-500"
                >
                  <span className="text-sm">Discover our mission</span>
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* The Crisis Section */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-red-950/10 to-slate-950" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium mb-6">
              <AlertTriangle className="w-4 h-4" />
              The Crisis We&apos;re Solving
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Our Children Are{' '}
              <span className="text-red-400">Struggling</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              The UK&apos;s educational psychology and SEND system is in crisis. 
              Children are falling through the cracks every single day.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CRISIS_STATS.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 text-center"
              >
                <stat.icon className="w-8 h-8 text-red-400 mx-auto mb-4" />
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <p className="text-slate-400 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Without vs With Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Without */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-red-950/30 to-slate-900/50 backdrop-blur-sm border border-red-900/30 rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <X className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-red-400">Without EdPsych Connect</h3>
              </div>
              <ul className="space-y-4">
                {WITHOUT_US.map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 text-slate-300"
                  >
                    <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* With */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-green-950/30 to-slate-900/50 backdrop-blur-sm border border-green-900/30 rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-green-400">With EdPsych Connect</h3>
              </div>
              <ul className="space-y-4">
                {WITH_US.map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 text-slate-300"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Manifesto Section */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-indigo-950/10 to-slate-950" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
              <Lightbulb className="w-4 h-4" />
              Our Manifesto
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              What We{' '}
              <span className="text-indigo-400">Believe</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              These aren&apos;t just words. They&apos;re the principles that guide every feature we build.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MANIFESTO.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 hover:border-indigo-500/30 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:bg-indigo-500/20 transition-colors">
                  <item.icon className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-sm border border-indigo-500/30 rounded-3xl p-12"
          >
            <Sparkles className="w-12 h-12 text-indigo-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Join Us in Building an Education System Where{' '}
              <span className="text-indigo-400">Every Child Thrives</span>
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              We&apos;re not just building software. We&apos;re building hope. 
              Be part of the movement that transforms educational support in the UK.
            </p>
            
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    Join the Movement <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 inline-flex items-center gap-3 text-green-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Thank you! You&apos;ll be among the first to know.</span>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-800">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="w-6 h-6 text-indigo-400" />
            <span className="font-semibold text-white">EdPsych Connect</span>
          </div>
          <p className="text-slate-500 text-sm mb-4">
            Transforming educational psychology for the digital age.
          </p>
          <p className="text-slate-600 text-xs">
            &copy; {new Date().getFullYear()} EdPsych Connect Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
