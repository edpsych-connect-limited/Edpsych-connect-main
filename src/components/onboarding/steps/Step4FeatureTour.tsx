import { logger } from "@/lib/logger";
/**
 * FILE: src/components/onboarding/steps/Step4FeatureTour.tsx
 * PURPOSE: Step 4 - Interactive feature tour with 6 key features
 *
 * FEATURES:
 * - Tab-based interface for 6 features
 * - Feature descriptions and benefits
 * - Interactive demo modals
 * - View tracking
 * - WCAG 2.1 AA compliant
 * - Keyboard navigation
 * - Responsive design
 */

'use client';

import React, { useState } from 'react';
import {
  Brain,
  FileText,
  Target,
  TrendingUp,
  GraduationCap,
  FolderOpen,
  Check,
  Play,
  X,
  ExternalLink
} from 'lucide-react';
import { useOnboarding } from '../OnboardingProvider';
import { InteractiveDemo } from '../InteractiveDemo';

interface Feature {
  id: string;
  icon: React.ElementType;
  name: string;
  tagline: string;
  description: string;
  highlights: string[];
  benefits: string[];
  demoAvailable: boolean;
  learnMoreUrl: string;
  color: string;
}

const FEATURES: Feature[] = [
  {
    id: 'ecca',
    icon: Brain,
    name: 'ECCA Assessment',
    tagline: 'Evidence-Based Cognitive & Educational Assessments',
    description: 'Comprehensive assessment framework combining cutting-edge research with dynamic test-teach-retest protocols. 8 domains covering all aspects of cognitive and educational functioning.',
    highlights: [
      'Real-time scoring with percentiles',
      'Dynamic test-teach-retest protocol',
      'Professional PDF/Word reports',
      'Longitudinal progress tracking'
    ],
    benefits: [
      '45-60 minute comprehensive assessment',
      'Identifies specific learning strengths and needs',
      'Evidence-based intervention recommendations'
    ],
    demoAvailable: true,
    learnMoreUrl: '/help/ecca-framework',
    color: 'indigo'
  },
  {
    id: 'ehcp',
    icon: FileText,
    name: 'EHCP Management',
    tagline: 'Streamlined Education, Health & Care Plans',
    description: 'Complete EHCP lifecycle management from initial request through annual reviews. Collaborative tools for multi-agency input and statutory compliance tracking.',
    highlights: [
      '20-week statutory timeline tracking',
      'Multi-agency collaboration portal',
      'Automated section generation',
      'Annual review scheduling'
    ],
    benefits: [
      'Reduce EHCP creation time by 40%',
      'Ensure statutory compliance',
      'Improve stakeholder communication'
    ],
    demoAvailable: true,
    learnMoreUrl: '/help/ehcp-management',
    color: 'purple'
  },
  {
    id: 'interventions',
    icon: Target,
    name: 'Intervention Library',
    tagline: '69 Research-Backed Interventions',
    description: 'Curated library of evidence-based interventions for literacy, numeracy, behaviour, social-emotional learning, and executive function. Each with implementation guides and progress monitoring tools.',
    highlights: [
      '69 evidence-based interventions',
      'Fidelity checklists',
      'Progress monitoring templates',
      'Adaptation guidance'
    ],
    benefits: [
      'Save 2+ hours per intervention plan',
      'Increase intervention effectiveness',
      'Track fidelity of implementation'
    ],
    demoAvailable: true,
    learnMoreUrl: '/help/interventions',
    color: 'green'
  },
  {
    id: 'progress',
    icon: TrendingUp,
    name: 'Progress Tracking',
    tagline: 'Goal Attainment Scaling & Data Analytics',
    description: 'Sophisticated progress monitoring with Goal Attainment Scaling (GAS), visual data dashboards, and longitudinal tracking across multiple domains.',
    highlights: [
      'Goal Attainment Scaling (GAS)',
      'Visual data dashboards',
      'Multi-domain tracking',
      'Automated reports'
    ],
    benefits: [
      'Evidence outcomes for interventions',
      'Support multi-tiered systems',
      'Data-driven decision making'
    ],
    demoAvailable: false,
    learnMoreUrl: '/help/progress-tracking',
    color: 'blue'
  },
  {
    id: 'training',
    icon: GraduationCap,
    name: 'CPD Training',
    tagline: 'Professional Development & Certifications',
    description: 'Comprehensive training marketplace with courses on assessment, intervention, SEND legislation, and professional standards. Earn CPD certificates and unlock achievements.',
    highlights: [
      '50+ CPD-certified courses',
      'Video lessons & assessments',
      'Digital certificates',
      'Gamified learning paths'
    ],
    benefits: [
      'Maintain professional development',
      'Stay current with best practices',
      'Build specialist expertise'
    ],
    demoAvailable: false,
    learnMoreUrl: '/training/marketplace',
    color: 'orange'
  },
  {
    id: 'cases',
    icon: FolderOpen,
    name: 'Case Management',
    tagline: 'Centralized Student Records & Workflows',
    description: 'Secure, GDPR-compliant case management system for all student records, assessments, interventions, and communications in one place.',
    highlights: [
      'Secure, encrypted storage',
      'Timeline view of all activities',
      'Document management',
      'Stakeholder collaboration'
    ],
    benefits: [
      'Never lose track of student data',
      'GDPR & NHS-level security',
      'Quick access to complete history'
    ],
    demoAvailable: false,
    learnMoreUrl: '/help/case-management',
    color: 'pink'
  }
];

export function Step4FeatureTour() {
  const { state, updateStep } = useOnboarding();
  const [activeFeature, setActiveFeature] = useState<string>(FEATURES[0].id);
  const [viewedFeatures, setViewedFeatures] = useState<string[]>(state.step4Data.featuresViewed || []);
  const [triedDemos, setTriedDemos] = useState<string[]>(state.step4Data.demosTried || []);
  const [showDemoModal, setShowDemoModal] = useState(false);

  const handleFeatureView = (featureId: string) => {
    setActiveFeature(featureId);

    if (!viewedFeatures.includes(featureId)) {
      const updated = [...viewedFeatures, featureId];
      setViewedFeatures(updated);

      // Update context state
      updateStep(4, { featureViewed: featureId }, false);
    }
  };

  const handleTryDemo = (featureId: string) => {
    setShowDemoModal(true);

    if (!triedDemos.includes(featureId)) {
      const updated = [...triedDemos, featureId];
      setTriedDemos(updated);

      // Update context state
      updateStep(4, { demoTried: featureId }, false);
    }
  };

  const activeFeatureData = FEATURES.find(f => f.id === activeFeature) || FEATURES[0];

  const getColorClasses = (color: string) => {
    const colors: Record<string, {
      tab: string;
      tabActive: string;
      tabBorder: string;
      icon: string;
      iconBg: string;
      badge: string;
      checkBg: string;
    }> = {
      indigo: {
        tab: 'text-gray-600 hover:text-indigo-600',
        tabActive: 'text-indigo-600 border-indigo-600 bg-indigo-50',
        tabBorder: 'border-transparent hover:border-indigo-200',
        icon: 'text-indigo-600',
        iconBg: 'bg-indigo-100',
        badge: 'bg-indigo-100 text-indigo-600',
        checkBg: 'bg-indigo-600'
      },
      purple: {
        tab: 'text-gray-600 hover:text-purple-600',
        tabActive: 'text-purple-600 border-purple-600 bg-purple-50',
        tabBorder: 'border-transparent hover:border-purple-200',
        icon: 'text-purple-600',
        iconBg: 'bg-purple-100',
        badge: 'bg-purple-100 text-purple-600',
        checkBg: 'bg-purple-600'
      },
      green: {
        tab: 'text-gray-600 hover:text-green-600',
        tabActive: 'text-green-600 border-green-600 bg-green-50',
        tabBorder: 'border-transparent hover:border-green-200',
        icon: 'text-green-600',
        iconBg: 'bg-green-100',
        badge: 'bg-green-100 text-green-600',
        checkBg: 'bg-green-600'
      },
      blue: {
        tab: 'text-gray-600 hover:text-blue-600',
        tabActive: 'text-blue-600 border-blue-600 bg-blue-50',
        tabBorder: 'border-transparent hover:border-blue-200',
        icon: 'text-blue-600',
        iconBg: 'bg-blue-100',
        badge: 'bg-blue-100 text-blue-600',
        checkBg: 'bg-blue-600'
      },
      orange: {
        tab: 'text-gray-600 hover:text-orange-600',
        tabActive: 'text-orange-600 border-orange-600 bg-orange-50',
        tabBorder: 'border-transparent hover:border-orange-200',
        icon: 'text-orange-600',
        iconBg: 'bg-orange-100',
        badge: 'bg-orange-100 text-orange-600',
        checkBg: 'bg-orange-600'
      },
      pink: {
        tab: 'text-gray-600 hover:text-pink-600',
        tabActive: 'text-pink-600 border-pink-600 bg-pink-50',
        tabBorder: 'border-transparent hover:border-pink-200',
        icon: 'text-pink-600',
        iconBg: 'bg-pink-100',
        badge: 'bg-pink-100 text-pink-600',
        checkBg: 'bg-pink-600'
      }
    };
    return colors[color] || colors.indigo;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-3">
          Explore Key Features
        </h2>
        <p className="text-lg text-gray-600">
          Discover the tools that will transform your SEND practice
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
              {viewedFeatures.length}
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {viewedFeatures.length} of {FEATURES.length} features explored
              </p>
              <p className="text-sm text-gray-600">
                Explore at least 1 feature to continue
              </p>
            </div>
          </div>
          {viewedFeatures.length >= 1 && (
            <Check className="w-6 h-6 text-green-600" aria-label="Requirement met" />
          )}
        </div>
      </div>

      {/* Feature Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="flex gap-2 min-w-max" role="tablist" aria-label="Feature tabs">
          {FEATURES.map((feature) => {
            const isActive = activeFeature === feature.id;
            const isViewed = viewedFeatures.includes(feature.id);
            const colors = getColorClasses(feature.color);
            const Icon = feature.icon;

            return (
              <button
                key={feature.id}
                onClick={() => handleFeatureView(feature.id)}
                role="tab"
                {...(isActive ? { 'aria-selected': 'true' } : { 'aria-selected': 'false' })}
                aria-controls={`panel-${feature.id}`}
                className={`
                  relative flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-all
                  focus:outline-none focus:ring-2 focus:ring-indigo-300 rounded-t-lg
                  ${isActive
                    ? `${colors.tabActive}`
                    : `${colors.tab} ${colors.tabBorder} border-transparent`
                  }
                `}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span>{feature.name}</span>
                {isViewed && (
                  <Check className="w-4 h-4 text-green-600" aria-label="Viewed" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Active Feature Content */}
      <div
        id={`panel-${activeFeatureData.id}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeFeatureData.id}`}
        className="space-y-6"
      >
        {/* Feature Header */}
        <div className="flex items-start gap-4">
          {(() => {
            const colors = getColorClasses(activeFeatureData.color);
            const Icon = activeFeatureData.icon;
            return (
              <>
                <div className={`w-16 h-16 ${colors.iconBg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-8 h-8 ${colors.icon}`} aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {activeFeatureData.name}
                  </h3>
                  <p className="text-lg text-gray-600">
                    {activeFeatureData.tagline}
                  </p>
                </div>
              </>
            );
          })()}
        </div>

        {/* Description */}
        <p className="text-gray-700 leading-relaxed">
          {activeFeatureData.description}
        </p>

        {/* Highlights & Benefits Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Highlights */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Check className="w-5 h-5 text-indigo-600" aria-hidden="true" />
              Key Highlights
            </h4>
            <ul className="space-y-2" role="list">
              {activeFeatureData.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Benefits */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" aria-hidden="true" />
              Benefits
            </h4>
            <ul className="space-y-2" role="list">
              {activeFeatureData.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          {activeFeatureData.demoAvailable && (
            <button
              onClick={() => handleTryDemo(activeFeatureData.id)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all shadow-md hover:shadow-lg"
            >
              <Play className="w-4 h-4" aria-hidden="true" />
              Try Interactive Demo
            </button>
          )}

          <a
            href={activeFeatureData.learnMoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all"
          >
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
            Learn More
          </a>
        </div>
      </div>

      {/* Demo Modal */}
      {showDemoModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="demo-modal-title"
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 id="demo-modal-title" className="text-2xl font-bold text-gray-900">
                Interactive Demo: {activeFeatureData.name}
              </h3>
              <button
                onClick={() => setShowDemoModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                aria-label="Close demo modal"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="mb-4">
              <InteractiveDemo featureId={activeFeatureData.id} />
            </div>

            <button
              onClick={() => setShowDemoModal(false)}
              className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all"
            >
              Close Demo
            </button>
          </div>
        </div>
      )}

      {/* Screen Reader Instructions */}
      <div className="sr-only" aria-live="polite">
        {viewedFeatures.length >= 1
          ? `You have viewed ${viewedFeatures.length} features. You can continue to the next step.`
          : 'Please explore at least 1 feature to continue. Use the tab buttons to switch between features.'
        }
      </div>
    </div>
  );
}
