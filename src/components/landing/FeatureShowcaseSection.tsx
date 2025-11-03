'use client';

import { useState } from 'react';
import {
  Brain, Target, FileText, GraduationCap, Trophy, TrendingUp,
  Users, BookOpen, ChevronRight, Play, Sparkles, Shield,
  CheckCircle, Clock, BarChart3, Award, Zap
} from 'lucide-react';

interface Feature {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  benefits: string[];
  demoLink: string;
  docsLink: string;
  color: string;
  gradient: string;
}

const features: Feature[] = [
  {
    id: 'ecca',
    icon: Brain,
    title: 'ECCA Cognitive Assessment',
    subtitle: 'Proprietary Evidence-Based Framework',
    description: 'Our flagship EdPsych Connect Cognitive Assessment (ECCA) framework combines cutting-edge research from Vygotsky, Feuerstein, and Diamond with dynamic test-teach-retest protocols for comprehensive cognitive evaluation.',
    highlights: [
      '8 comprehensive assessment domains',
      'Real-time scoring with percentiles and age equivalents',
      'Dynamic test-teach-retest protocol',
      'Professional PDF/Word report generation',
      'Collaborative input (parent/teacher/child)',
      'Longitudinal progress tracking'
    ],
    benefits: [
      '45-60 minute comprehensive assessment',
      'Identifies specific learning strengths and needs',
      'Evidence-based intervention recommendations',
      'Compliant with UK professional standards'
    ],
    demoLink: '/assessments/new',
    docsLink: '/help/ecca-framework',
    color: 'indigo',
    gradient: 'from-indigo-500 to-purple-600'
  },
  {
    id: 'interventions',
    icon: Target,
    title: '100+ Evidence-Based Interventions',
    subtitle: 'Comprehensive Intervention Library',
    description: 'Access a curated library of over 100 research-rated interventions across all SEND domains. Each intervention includes implementation guidance, fidelity monitoring tools, and evidence ratings.',
    highlights: [
      '5 intervention categories (Academic, Behavioural, Social-Emotional, Communication, Sensory)',
      'Tier 1, 2, 3 evidence ratings',
      'Age-appropriate filtering (Early Years to Post-16)',
      'Implementation planning wizards',
      'Fidelity monitoring and tracking',
      'Outcome measurement tools'
    ],
    benefits: [
      'Save 10+ hours researching interventions',
      'Evidence-based selection confidence',
      'Ready-to-implement guidance',
      'Track effectiveness systematically'
    ],
    demoLink: '/interventions/library',
    docsLink: '/help/intervention-library',
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'ehcp',
    icon: FileText,
    title: 'EHCP Lifecycle Management',
    subtitle: 'From Creation to Annual Review',
    description: 'Streamline the entire Education Health and Care Plan process with our comprehensive workflow system. Auto-populate from assessments, track amendments, manage reviews, and generate compliant documents.',
    highlights: [
      'Wizard-based EHCP creation (Sections A-I)',
      'Auto-population from ECCA assessments',
      'Amendment tracking with version control',
      'Annual review workflow automation',
      'Professional PDF generation',
      'Collaboration tools for multi-agency working'
    ],
    benefits: [
      'Reduce EHCP creation time by 85% (40 hours → 4 hours)',
      '100% UK SEND Code of Practice compliance',
      'Eliminate manual copy-paste errors',
      'Complete audit trail for legal purposes'
    ],
    demoLink: '/ehcp/new',
    docsLink: '/help/ehcp-management',
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-600'
  },
  {
    id: 'training',
    icon: GraduationCap,
    title: 'Professional Development Platform',
    subtitle: '10+ CPD Courses with Certificates',
    description: 'Comprehensive training courses covering SEND support, evidence-based practice, assessment techniques, and intervention strategies. Earn QR-verified certificates and track CPD hours automatically.',
    highlights: [
      '10+ courses (2-20 hours each)',
      'QR-verified certificates',
      'CPD hours tracking (Categories A, B, C)',
      'Interactive quizzes and assessments',
      'Video lessons with transcripts',
      'Continuing education credits'
    ],
    benefits: [
      'Meet BPS/HCPC CPD requirements',
      'Learn at your own pace',
      'Instant certificate generation',
      'Automatic CPD log maintenance'
    ],
    demoLink: '/training/marketplace',
    docsLink: '/help/training-platform',
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'gamification',
    icon: Trophy,
    title: 'Battle Royale Gamification',
    subtitle: 'Engagement Through Competition',
    description: 'Transform student engagement with our sophisticated gamification system featuring merit economies, squad competitions, achievement badges, and seasonal tournaments. Proven to increase engagement by 85%.',
    highlights: [
      'Merit system with seasonal resets',
      '6 competition types (Speed Runs, Challenges, Tournaments)',
      'Squad battles and team competitions',
      '50+ achievement badges',
      'Storm events and supply drops',
      'Leaderboards (individual and squad)'
    ],
    benefits: [
      '85% increase in student engagement',
      'Motivates consistent practice',
      'Builds collaborative skills',
      'Fun, game-based learning approach'
    ],
    demoLink: '/gamification',
    docsLink: '/help/battle-royale',
    color: 'rose',
    gradient: 'from-rose-500 to-pink-600'
  },
  {
    id: 'progress',
    icon: TrendingUp,
    title: 'Progress Tracking & Analytics',
    subtitle: 'Data-Driven Outcome Monitoring',
    description: 'Track student progress using Goal Attainment Scaling (GAS) and sophisticated analytics. Visualize intervention effectiveness, monitor outcomes over time, and generate evidence-based reports.',
    highlights: [
      'Goal Attainment Scaling (GAS) methodology',
      'Multi-case dashboard views',
      'Intervention effectiveness analysis',
      'Timeline visualization',
      'Predictive analytics',
      'Export reports for parents and professionals'
    ],
    benefits: [
      'Demonstrate intervention impact',
      'Identify what works for each student',
      'Support EHCP review evidence',
      'Data-driven decision making'
    ],
    demoLink: '/progress',
    docsLink: '/help/progress-tracking',
    color: 'violet',
    gradient: 'from-violet-500 to-purple-600'
  }
];

export default function FeatureShowcaseSection() {
  const [selectedFeature, setSelectedFeature] = useState<Feature>(features[0]);

  return (
    <section id="features" className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-full px-6 py-2 mb-6">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Complete Platform Features
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Everything You Need for SEND Support
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            From evidence-based assessment to intervention implementation, professional training to compliance management—all integrated into one powerful platform.
          </p>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-12">
          {features.map((feature) => (
            <button
              key={feature.id}
              onClick={() => setSelectedFeature(feature)}
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                selectedFeature.id === feature.id
                  ? `border-${feature.color}-500 bg-${feature.color}-50`
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <feature.icon className={`w-8 h-8 mx-auto mb-2 ${
                selectedFeature.id === feature.id ? `text-${feature.color}-600` : 'text-slate-400'
              }`} />
              <div className={`text-sm font-semibold text-center ${
                selectedFeature.id === feature.id ? `text-${feature.color}-900` : 'text-slate-600'
              }`}>
                {feature.title.split(' ').slice(0, 2).join(' ')}
              </div>
            </button>
          ))}
        </div>

        {/* Selected Feature Display */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Feature Header */}
          <div className={`bg-gradient-to-r ${selectedFeature.gradient} p-8 text-white`}>
            <div className="flex items-start gap-6">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <selectedFeature.icon className="w-12 h-12" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium opacity-90 mb-2">{selectedFeature.subtitle}</div>
                <h3 className="text-3xl font-bold mb-3">{selectedFeature.title}</h3>
                <p className="text-lg opacity-95 leading-relaxed">
                  {selectedFeature.description}
                </p>
              </div>
            </div>
          </div>

          {/* Feature Content */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Key Features */}
              <div>
                <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  Key Features
                </h4>
                <ul className="space-y-3">
                  {selectedFeature.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className={`w-5 h-5 text-${selectedFeature.color}-600 flex-shrink-0 mt-0.5`} />
                      <span className="text-slate-700">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benefits */}
              <div>
                <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-500" />
                  Benefits
                </h4>
                <ul className="space-y-3">
                  {selectedFeature.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full bg-${selectedFeature.color}-100 flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <span className={`text-sm font-bold text-${selectedFeature.color}-600`}>{index + 1}</span>
                      </div>
                      <span className="text-slate-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href={selectedFeature.demoLink}
                className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${selectedFeature.gradient} text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200`}
              >
                <Play className="w-5 h-5" />
                Try {selectedFeature.title.split(' ')[0]} Now
              </a>
              <a
                href={selectedFeature.docsLink}
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:border-slate-300 hover:bg-slate-50 transition-all duration-200"
              >
                <BookOpen className="w-5 h-5" />
                Read Documentation
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="text-3xl font-bold text-indigo-600 mb-2">17+</div>
            <div className="text-sm text-slate-600">Assessment Models</div>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="text-3xl font-bold text-emerald-600 mb-2">100+</div>
            <div className="text-sm text-slate-600">Interventions</div>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="text-3xl font-bold text-amber-600 mb-2">10+</div>
            <div className="text-sm text-slate-600">CPD Courses</div>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="text-3xl font-bold text-rose-600 mb-2">50+</div>
            <div className="text-sm text-slate-600">Achievement Badges</div>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mt-12 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Shield className="w-6 h-6 text-indigo-600" />
            <span className="text-slate-700 font-medium">
              UK GDPR Compliant • HCPC Registered • BPS Aligned • SEND Code of Practice Compliant
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
