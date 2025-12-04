'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * Crisis Impact Section - The Manifesto
 * Tells the story of why EdPsych Connect exists and the crisis it solves.
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  AlertTriangle, 
  Clock, 
  Scale, 
  Heart, 
  Users, 
  Stethoscope,
  ArrowRight,
  CheckCircle,
  TrendingDown,
  Sparkles
} from 'lucide-react';

// Animated counter hook
function useAnimatedCounter(end: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!startOnView || !isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, isInView, startOnView]);

  return { count, ref };
}

// Crisis statistic card
interface CrisisStatProps {
  icon: React.ReactNode;
  crisis: string;
  statistic: string;
  statisticNumber?: number;
  statisticSuffix?: string;
  reality: string;
  solution: string;
  color: string;
  delay: number;
}

function CrisisStat({ icon, crisis, statistic, statisticNumber, statisticSuffix = '', reality, solution, color, delay }: CrisisStatProps) {
  const { count, ref } = useAnimatedCounter(statisticNumber || 0, 2500);
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay }}
      className="group relative"
    >
      <div className={`absolute inset-0 ${color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500`} />
      <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all duration-300 h-full">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl ${color} bg-opacity-20 flex items-center justify-center mb-4`}>
          <div className={`${color.replace('bg-', 'text-')}`}>
            {icon}
          </div>
        </div>

        {/* Crisis Label */}
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          {crisis}
        </div>

        {/* Statistic - Animated */}
        <div className={`text-3xl font-bold mb-3 ${color.replace('bg-', 'text-')}`}>
          {statisticNumber ? (
            <>
              {count.toLocaleString()}{statisticSuffix}
            </>
          ) : (
            statistic
          )}
        </div>

        {/* Reality */}
        <p className="text-sm text-slate-400 mb-4 leading-relaxed">
          {reality}
        </p>

        {/* Solution */}
        <div className="flex items-start gap-2 pt-4 border-t border-slate-800">
          <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-emerald-400 font-medium">
            {solution}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function CrisisImpactSection() {
  const crisisData: CrisisStatProps[] = [
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      crisis: "EHCNA Requests",
      statistic: "600,000+",
      statisticNumber: 600000,
      statisticSuffix: "+",
      reality: "Active EHCPs in England, growing 10% annually. The system is overwhelmed and children wait months for support they need today.",
      solution: "Reduce need through early intervention - support arrives before crisis",
      color: "bg-red-500",
      delay: 0
    },
    {
      icon: <Clock className="w-6 h-6" />,
      crisis: "20-Week Breaches",
      statistic: "50%+",
      statisticNumber: 50,
      statisticSuffix: "%+",
      reality: "Of Local Authorities miss statutory deadlines. Children languish while paperwork shuffles between siloed systems.",
      solution: "AI-powered workflow with evidence ready at the click of a button",
      color: "bg-amber-500",
      delay: 0.1
    },
    {
      icon: <Scale className="w-6 h-6" />,
      crisis: "Tribunal Costs",
      statistic: "£500M+",
      statisticNumber: 500,
      statisticSuffix: "M+",
      reality: "Spent annually defending poor decisions. Money that could fund actual support for children goes to legal battles.",
      solution: "Quality EHCPs from the start - fewer disputes, more resources for children",
      color: "bg-purple-500",
      delay: 0.2
    },
    {
      icon: <Heart className="w-6 h-6" />,
      crisis: "Teacher Burnout",
      statistic: "44%",
      statisticNumber: 44,
      statisticSuffix: "%",
      reality: "Leave within 5 years. Overburdened with paperwork, unable to differentiate for 30 unique learners, passion replaced by exhaustion.",
      solution: "AI differentiation saves 10+ hours weekly - time returned to teaching",
      color: "bg-rose-500",
      delay: 0.3
    },
    {
      icon: <Users className="w-6 h-6" />,
      crisis: "EBSA Crisis",
      statistic: "1.7M",
      statisticNumber: 1700000,
      statisticSuffix: "",
      reality: "Children with persistent absence. Anxiety, low self-esteem, and content they cannot access makes school feel impossible.",
      solution: "Gamification + personalised learning + early intervention support",
      color: "bg-blue-500",
      delay: 0.4
    },
    {
      icon: <Stethoscope className="w-6 h-6" />,
      crisis: "EP Shortage",
      statistic: "1:5,000",
      reality: "One EP per 5,000 children (should be 1:1,500). Schools wait months for assessments while children fall further behind.",
      solution: "EP Marketplace + AI-assisted assessment tools bridge the gap",
      color: "bg-cyan-500",
      delay: 0.5
    }
  ];

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent" />
      
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm font-medium mb-6">
            <AlertTriangle className="w-4 h-4" />
            The Crisis We&apos;re Solving
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            A System in <span className="text-red-500">Crisis</span>.
            <br />
            <span className="text-emerald-400">A Platform That Heals.</span>
          </h2>
          
          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Every statistic below represents a child waiting, a teacher struggling, a family fighting.
            We didn&apos;t build EdPsych Connect to manage paperwork.
            <span className="text-white font-semibold"> We built it to prevent the crisis from happening.</span>
          </p>
        </motion.div>

        {/* Crisis Statistics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {crisisData.map((crisis, index) => (
            <CrisisStat key={index} {...crisis} />
          ))}
        </div>

        {/* The Manifesto Statement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-indigo-600/20 rounded-3xl blur-xl" />
          <div className="relative bg-slate-900/80 backdrop-blur-sm border border-indigo-500/30 rounded-3xl p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-8 h-8 text-indigo-400" />
              <span className="text-indigo-400 font-semibold text-lg">Our Manifesto</span>
            </div>
            
            <blockquote className="text-2xl md:text-3xl font-light text-white leading-relaxed mb-8">
              &ldquo;No child ever asked to go to school. We mandate them by law with a promise of 
              <span className="text-indigo-400 font-medium"> upward social mobility</span>. 
              That promise must mean something. EdPsych Connect exists to ensure 
              <span className="text-emerald-400 font-medium"> no child is left behind </span>
              by a system that was designed for a different era.&rdquo;
            </blockquote>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  SI
                </div>
                <div>
                  <div className="font-semibold text-white">Dr Scott Ighavongbe-Patrick</div>
                  <div className="text-sm text-slate-400">Founder, DEdPsych, CPsychol | HCPC: PYL042340</div>
                </div>
              </div>
              
              <motion.a
                href="/about"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors"
              >
                Our Story
                <ArrowRight className="w-4 h-4" />
              </motion.a>
            </div>
          </div>
        </motion.div>

        {/* Before & After Transformation */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 grid md:grid-cols-2 gap-8"
        >
          {/* Before */}
          <div className="bg-red-950/30 border border-red-900/50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-red-400">Without EdPsych Connect</h3>
            </div>
            <ul className="space-y-3">
              {[
                "Teachers spend 10+ hours weekly on differentiation",
                "Schools gather evidence manually, often incomplete",
                "LAs miss 20-week deadlines, children wait",
                "Poor EHCPs lead to tribunals and wasted money",
                "Students disengage, EBSA rates climb",
                "EPs overwhelmed, support comes too late"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-400">
                  <span className="text-red-500 mt-1">✗</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* After */}
          <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-emerald-400">With EdPsych Connect</h3>
            </div>
            <ul className="space-y-3">
              {[
                "AI differentiates lessons instantly for every learner",
                "Evidence gathered in real-time, always ready",
                "Automated workflows ensure deadline compliance",
                "Quality EHCPs from AI-assisted drafting",
                "Gamification makes learning engaging again",
                "EP Marketplace connects schools with professionals"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-300">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-slate-400 mb-8">
            Join us in building an education system where <span className="text-white font-medium">every child thrives</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="/demo"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
            >
              See The Platform In Action
              <ArrowRight className="w-5 h-5" />
            </motion.a>
            <motion.a
              href="/contact"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition-all"
            >
              Talk to Our Team
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
