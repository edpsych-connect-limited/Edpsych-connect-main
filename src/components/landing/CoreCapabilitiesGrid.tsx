'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Brain, Library, GraduationCap, Trophy, Clock, ShieldCheck, FileCheck, Code, 
  MessageSquareText, Users, Search, Heart, Mic, BookOpen, Lock, Crown, Building2, 
  FlaskConical, LucideIcon, ClipboardList, Target, Calendar, MapPin, Handshake, 
  LineChart, AlertTriangle, Sparkles, Network, BarChart3 
} from 'lucide-react';

// Tier definitions for feature gating
type FeatureTier = 'free' | 'standard' | 'professional' | 'institution' | 'research';

interface Capability {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  bg: string;
  href: string;
  tier: FeatureTier;
  comingSoon?: boolean;
}

// Tier badge styling
const tierConfig: Record<FeatureTier, { label: string; icon: LucideIcon; className: string }> = {
  free: { label: 'Free', icon: Users, className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  standard: { label: 'Standard', icon: Crown, className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  professional: { label: 'Professional', icon: Crown, className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  institution: { label: 'Institution', icon: Building2, className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  research: { label: 'Research', icon: FlaskConical, className: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
};

export default function CoreCapabilitiesGrid() {
  const router = useRouter();
  
  const capabilities: Capability[] = [
    {
      icon: Brain,
      title: "ECCA Framework Engine",
      description: "The cognitive core. Emotion, Cognition, Context, and Application—orchestrated invisibly in real-time.",
      color: "text-indigo-400",
      bg: "bg-indigo-400/10",
      href: "/ai-agents",
      tier: "standard"
    },
    {
      icon: Library,
      title: "Intervention Designer",
      description: "Access 100+ evidence-based strategies. The system suggests the perfect intervention before you even ask.",
      color: "text-pink-400",
      bg: "bg-pink-400/10",
      href: "/interventions",
      tier: "standard"
    },
    {
      icon: FileCheck,
      title: "EHCP Management Suite",
      description: "Complete EHCP lifecycle management. Annual reviews, compliance risk AI, golden thread coherence, and automated SEN2 returns.",
      color: "text-cyan-400",
      bg: "bg-cyan-400/10",
      href: "/ehcp",
      tier: "professional"
    },
    {
      icon: Code,
      title: "Developers of Tomorrow",
      description: "Proprietary coding curriculum designed for neurodiversity. Block coding to Python to React—with cognitive load management built in.",
      color: "text-rose-400",
      bg: "bg-rose-400/10",
      href: "/demo/coding",
      tier: "standard"
    },
    {
      icon: Mic,
      title: "Voice Command System",
      description: "Hands-free operation with UK accent recognition. 'Show me Year 3 progress' or 'Who needs help today?' Teaching shouldn't require typing.",
      color: "text-sky-400",
      bg: "bg-sky-400/10",
      href: "/settings",
      tier: "professional",
      comingSoon: true
    },
    {
      icon: MessageSquareText,
      title: "Universal Translator",
      description: "Converts complex educational jargon into plain English. Parents understand reports. Teachers save hours of explanation.",
      color: "text-teal-400",
      bg: "bg-teal-400/10",
      href: "/demo/translator",
      tier: "standard"
    },
    {
      icon: Heart,
      title: "Parent Portal",
      description: "Real-time progress tracking for families. Direct messaging with support teams. Resources tailored to your child's needs.",
      color: "text-red-400",
      bg: "bg-red-400/10",
      href: "/parents",
      tier: "free"
    },
    {
      icon: BookOpen,
      title: "Knowledge Hub & Blog",
      description: "AI-curated research insights, breaking EdTech news, and evidence-based articles. Your daily dose of professional growth.",
      color: "text-lime-400",
      bg: "bg-lime-400/10",
      href: "/blog",
      tier: "free"
    },
    {
      icon: Search,
      title: "EP Marketplace",
      description: "Find vetted Educational Psychologists instantly. LA Panel approved, DBS checked, £6M insured. Book assessments in minutes.",
      color: "text-orange-400",
      bg: "bg-orange-400/10",
      href: "/marketplace",
      tier: "free"
    },
    {
      icon: Users,
      title: "Professional Forum",
      description: "Connect with 2,300+ EPs, SENCOs, and educators. Share evidence-based practices. Learn from expert contributors.",
      color: "text-violet-400",
      bg: "bg-violet-400/10",
      href: "/forum",
      tier: "free"
    },
    {
      icon: GraduationCap,
      title: "Professional Growth",
      description: "Integrated CPD library. Earn hours automatically as you work, tracking progress without the admin.",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      href: "/training",
      tier: "standard"
    },
    {
      icon: Trophy,
      title: "Gamified Engagement Engine",
      description: "Engagement that sustains itself. Battle Royale modes and live leaderboards that make learning addictive.",
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      href: "/gamification",
      tier: "standard"
    },
    {
      icon: Clock,
      title: "Zero-Touch EHCP Drafting",
      description: "Paperwork that writes itself. Our invisible intelligence drafts 80% of the report while you observe.",
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      href: "/ehcp/new",
      tier: "professional"
    },
    {
      icon: ShieldCheck,
      title: "Data Sovereignty & Ethics",
      description: "Built on rigorous standards. Enterprise clients can Bring Your Own Database (BYOD) for total data autonomy.",
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      href: "/admin/ethics",
      tier: "institution"
    },
    // Additional Professional SEND Services
    {
      icon: ClipboardList,
      title: "SENCO Dashboard",
      description: "Comprehensive SEND Register management, caseload tracking, statutory deadlines, and compliance monitoring for SENCOs.",
      color: "text-fuchsia-400",
      bg: "bg-fuchsia-400/10",
      href: "/senco",
      tier: "professional"
    },
    {
      icon: Target,
      title: "Outcome Tracking",
      description: "SMART outcome creation, progress monitoring against baselines, evidence collection, and predictive analytics.",
      color: "text-green-400",
      bg: "bg-green-400/10",
      href: "/outcomes",
      tier: "professional"
    },
    {
      icon: Calendar,
      title: "Annual Review Manager",
      description: "Statutory 12-month review cycle management, phase transfer reviews, multi-agency coordination, and document preparation.",
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      href: "/ehcp/modules/annual-reviews",
      tier: "professional"
    },
    {
      icon: MapPin,
      title: "Provision Mapping",
      description: "Wave model provision tracking (Universal, Targeted, Specialist), cost analysis, impact measurement, and gap identification.",
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
      href: "/provision",
      tier: "professional"
    },
    {
      icon: Handshake,
      title: "Transition Planning",
      description: "Comprehensive transition support for Year 6, Year 9, Year 11+. Destination tracking, PfA planning, and setting liaison.",
      color: "text-teal-400",
      bg: "bg-teal-400/10",
      href: "/transitions",
      tier: "professional"
    },
    {
      icon: Network,
      title: "Multi-Agency Hub",
      description: "Secure collaboration with Health, Social Care, and Education partners. Information sharing agreements and case conferencing.",
      color: "text-indigo-400",
      bg: "bg-indigo-400/10",
      href: "/collaborate",
      tier: "institution"
    },
    {
      icon: AlertTriangle,
      title: "Safeguarding System",
      description: "KCSIE 2023 compliant safeguarding tools. Concern logging, DSL workflows, chronology tracking, and secure referrals.",
      color: "text-red-500",
      bg: "bg-red-500/10",
      href: "/safeguarding",
      tier: "professional"
    },
    {
      icon: Sparkles,
      title: "Golden Thread Coherence",
      description: "AI-powered EHCP coherence checking. Ensures needs, provision, and outcomes align throughout the document.",
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      href: "/ehcp/modules/golden-thread",
      tier: "professional"
    },
    {
      icon: LineChart,
      title: "Time Savings Analytics",
      description: "Track time saved vs traditional methods. ROI dashboards, efficiency metrics, and impact reporting for stakeholders.",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      href: "/analytics",
      tier: "professional"
    },
    {
      icon: BarChart3,
      title: "Assessment Analytics",
      description: "Comprehensive assessment tracking, standardised score interpretation, progress comparisons, and cohort analysis.",
      color: "text-sky-400",
      bg: "bg-sky-400/10",
      href: "/assessments",
      tier: "standard"
    }
  ];

  const handleCardClick = (cap: Capability) => {
    // Navigate to the feature page - the page itself handles tier gating
    router.push(cap.href);
  };

  return (
    <section id="features" className="py-24 bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">The Full Inventory</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            A complete orchestration layer for Special Educational Needs. Every tool you need, integrated into one seamless system.
          </p>
          <p className="text-slate-500 text-sm mt-2">
            Click any feature to explore • Tier badges show required subscription level
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {capabilities.map((cap, idx) => {
            const tierInfo = tierConfig[cap.tier];
            const TierIcon = tierInfo.icon;
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                onClick={() => handleCardClick(cap)}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all group cursor-pointer relative overflow-hidden"
              >
                {/* Tier Badge */}
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1 border ${tierInfo.className}`}>
                  <TierIcon className="w-3 h-3" />
                  {tierInfo.label}
                </div>
                
                {/* Coming Soon Overlay */}
                {cap.comingSoon && (
                  <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
                    <div className="text-center">
                      <Lock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <span className="text-slate-300 font-medium">Coming Soon</span>
                    </div>
                  </div>
                )}
                
                <div className={`w-10 h-10 rounded-xl ${cap.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <cap.icon className={`w-5 h-5 ${cap.color}`} />
                </div>
                <h3 className="text-lg font-bold mb-2 text-slate-100 pr-16">{cap.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  {cap.description}
                </p>
                
                {/* Hover indicator */}
                <div className="mt-4 flex items-center text-indigo-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Explore feature</span>
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Tier Legend */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          {Object.entries(tierConfig).map(([tier, config]) => {
            const TierIcon = config.icon;
            return (
              <div key={tier} className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 border ${config.className}`}>
                <TierIcon className="w-3.5 h-3.5" />
                {config.label}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
