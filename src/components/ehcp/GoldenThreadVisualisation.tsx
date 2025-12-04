'use client';

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * Golden Thread Visualisation
 * ----------------------------
 * PROPRIETARY INNOVATION - The most powerful feature that NO competitor has.
 * 
 * The "Golden Thread" is the critical connection between:
 * Assessment → Needs → Outcomes → Provision → Progress
 * 
 * This visualisation shows:
 * - How each need maps to specific outcomes
 * - How each outcome is supported by provision
 * - Whether progress is being made against outcomes
 * - Where gaps exist in the EHCP
 * 
 * This is what makes EHCPs legally defensible and child-centred.
 * Parents, schools, and LAs can all see the logic clearly.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Link2,
  Eye,
  Target,
  BookOpen,
  Heart,
  MessageSquare,
  Brain,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Minus,
  Lightbulb,
  AlertCircle,
} from 'lucide-react';

// Types
interface GoldenThreadData {
  ehcpId: string;
  studentName: string;
  lastUpdated: string;
  sections: SectionAnalysis[];
  overallCoherence: number; // 0-100
  gaps: GapAnalysis[];
  strengths: string[];
}

interface SectionAnalysis {
  section: EHCPSection;
  needs: Need[];
  outcomes: Outcome[];
  provisions: Provision[];
}

type EHCPSection = 
  | 'communication_interaction'
  | 'cognition_learning'
  | 'social_emotional'
  | 'sensory_physical';

interface Need {
  id: string;
  description: string;
  source: string; // Which assessment identified this
  linkedOutcomes: string[]; // IDs of outcomes addressing this need
  status: 'addressed' | 'partially_addressed' | 'unaddressed';
}

interface Outcome {
  id: string;
  description: string;
  targetDate: string;
  measurable: boolean;
  linkedNeeds: string[];
  linkedProvisions: string[];
  progress: 'on_track' | 'at_risk' | 'not_met' | 'achieved';
  progressPercentage: number;
}

interface Provision {
  id: string;
  description: string;
  type: 'education' | 'health' | 'social_care';
  quantified: boolean;
  specific: boolean;
  linkedOutcomes: string[];
  implementationStatus: 'in_place' | 'partial' | 'not_started';
}

interface GapAnalysis {
  type: 'unaddressed_need' | 'unmeasurable_outcome' | 'unlinked_provision' | 'missing_provision';
  severity: 'critical' | 'moderate' | 'minor';
  description: string;
  recommendation: string;
  section: EHCPSection;
}

// Section configuration
const SECTION_CONFIG: Record<EHCPSection, { 
  name: string; 
  fullName: string;
  icon: React.ElementType; 
  color: string;
  description: string;
}> = {
  communication_interaction: { 
    name: 'C&I', 
    fullName: 'Communication & Interaction',
    icon: MessageSquare, 
    color: 'blue',
    description: 'Speech, language, communication needs including autism'
  },
  cognition_learning: { 
    name: 'C&L', 
    fullName: 'Cognition & Learning',
    icon: Brain, 
    color: 'purple',
    description: 'Learning difficulties, dyslexia, dyscalculia'
  },
  social_emotional: { 
    name: 'SEMH', 
    fullName: 'Social, Emotional & Mental Health',
    icon: Heart, 
    color: 'pink',
    description: 'Anxiety, attachment, ADHD, mental health'
  },
  sensory_physical: { 
    name: 'S&P', 
    fullName: 'Sensory and/or Physical',
    icon: Eye, 
    color: 'green',
    description: 'Visual, hearing impairment, physical disability'
  },
};

export default function GoldenThreadVisualisation() {
  const [data, setData] = useState<GoldenThreadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<EHCPSection | 'all'>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [_showGapsOnly, setShowGapsOnly] = useState(false);
  const [highlightedThread, setHighlightedThread] = useState<string | null>(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Mock data demonstrating the Golden Thread concept
        const mockData: GoldenThreadData = {
          ehcpId: 'EHCP-2025-0234',
          studentName: 'Thomas Anderson',
          lastUpdated: '2025-11-28',
          overallCoherence: 78,
          sections: [
            {
              section: 'communication_interaction',
              needs: [
                { 
                  id: 'n1', 
                  description: 'Difficulty with receptive language - struggles to follow multi-step instructions', 
                  source: 'SALT Assessment (Oct 2024)',
                  linkedOutcomes: ['o1', 'o2'],
                  status: 'addressed'
                },
                { 
                  id: 'n2', 
                  description: 'Expressive language delay - limited vocabulary and sentence structure', 
                  source: 'SALT Assessment (Oct 2024)',
                  linkedOutcomes: ['o2'],
                  status: 'addressed'
                },
                { 
                  id: 'n3', 
                  description: 'Social communication difficulties - struggles with turn-taking and reading social cues', 
                  source: 'EP Report (Nov 2024)',
                  linkedOutcomes: [],
                  status: 'unaddressed'
                },
              ],
              outcomes: [
                { 
                  id: 'o1', 
                  description: 'Thomas will follow 2-step instructions in the classroom with 80% accuracy',
                  targetDate: '2025-07-01',
                  measurable: true,
                  linkedNeeds: ['n1'],
                  linkedProvisions: ['p1', 'p2'],
                  progress: 'on_track',
                  progressPercentage: 65
                },
                { 
                  id: 'o2', 
                  description: 'Thomas will use sentences of 4+ words to express his needs and ideas',
                  targetDate: '2025-07-01',
                  measurable: true,
                  linkedNeeds: ['n1', 'n2'],
                  linkedProvisions: ['p1', 'p3'],
                  progress: 'at_risk',
                  progressPercentage: 40
                },
              ],
              provisions: [
                { 
                  id: 'p1', 
                  description: 'Weekly 1:1 SALT session (45 minutes)',
                  type: 'health',
                  quantified: true,
                  specific: true,
                  linkedOutcomes: ['o1', 'o2'],
                  implementationStatus: 'in_place'
                },
                { 
                  id: 'p2', 
                  description: 'Visual timetable and task breakdown cards',
                  type: 'education',
                  quantified: true,
                  specific: true,
                  linkedOutcomes: ['o1'],
                  implementationStatus: 'in_place'
                },
                { 
                  id: 'p3', 
                  description: 'Daily language group with SALT-trained TA (20 mins)',
                  type: 'education',
                  quantified: true,
                  specific: true,
                  linkedOutcomes: ['o2'],
                  implementationStatus: 'in_place'
                },
              ],
            },
            {
              section: 'cognition_learning',
              needs: [
                { 
                  id: 'n4', 
                  description: 'Working memory difficulties affecting retention of new learning', 
                  source: 'EP Assessment (Nov 2024)',
                  linkedOutcomes: ['o3'],
                  status: 'addressed'
                },
                { 
                  id: 'n5', 
                  description: 'Reading comprehension below age-related expectations', 
                  source: 'School Assessment (Oct 2024)',
                  linkedOutcomes: ['o4'],
                  status: 'partially_addressed'
                },
              ],
              outcomes: [
                { 
                  id: 'o3', 
                  description: 'Thomas will use memory strategies independently when learning new information',
                  targetDate: '2025-07-01',
                  measurable: false, // This is a gap!
                  linkedNeeds: ['n4'],
                  linkedProvisions: ['p4'],
                  progress: 'on_track',
                  progressPercentage: 55
                },
                { 
                  id: 'o4', 
                  description: 'Thomas will answer inference questions about texts at his reading level with 70% accuracy',
                  targetDate: '2025-07-01',
                  measurable: true,
                  linkedNeeds: ['n5'],
                  linkedProvisions: ['p5'],
                  progress: 'at_risk',
                  progressPercentage: 35
                },
              ],
              provisions: [
                { 
                  id: 'p4', 
                  description: 'Multi-sensory learning approaches across curriculum',
                  type: 'education',
                  quantified: false, // Gap - not specific enough
                  specific: false,
                  linkedOutcomes: ['o3'],
                  implementationStatus: 'partial'
                },
                { 
                  id: 'p5', 
                  description: 'Daily 1:1 reading intervention with trained TA (15 mins)',
                  type: 'education',
                  quantified: true,
                  specific: true,
                  linkedOutcomes: ['o4'],
                  implementationStatus: 'in_place'
                },
              ],
            },
            {
              section: 'social_emotional',
              needs: [
                { 
                  id: 'n6', 
                  description: 'Anxiety in new situations and transitions', 
                  source: 'EP Report (Nov 2024)',
                  linkedOutcomes: ['o5'],
                  status: 'addressed'
                },
                { 
                  id: 'n7', 
                  description: 'Low self-esteem impacting willingness to attempt challenging tasks', 
                  source: 'School SENCO (Oct 2024)',
                  linkedOutcomes: [],
                  status: 'unaddressed'
                },
              ],
              outcomes: [
                { 
                  id: 'o5', 
                  description: 'Thomas will manage transitions between activities using his calming strategies independently',
                  targetDate: '2025-07-01',
                  measurable: true,
                  linkedNeeds: ['n6'],
                  linkedProvisions: ['p6', 'p7'],
                  progress: 'achieved',
                  progressPercentage: 100
                },
              ],
              provisions: [
                { 
                  id: 'p6', 
                  description: 'Access to calm corner with sensory resources',
                  type: 'education',
                  quantified: true,
                  specific: true,
                  linkedOutcomes: ['o5'],
                  implementationStatus: 'in_place'
                },
                { 
                  id: 'p7', 
                  description: 'Weekly check-in with ELSA (30 mins)',
                  type: 'education',
                  quantified: true,
                  specific: true,
                  linkedOutcomes: ['o5'],
                  implementationStatus: 'in_place'
                },
                { 
                  id: 'p8', 
                  description: 'Support for emotional wellbeing',
                  type: 'education',
                  quantified: false,
                  specific: false,
                  linkedOutcomes: [],
                  implementationStatus: 'not_started'
                },
              ],
            },
          ],
          gaps: [
            {
              type: 'unaddressed_need',
              severity: 'critical',
              description: 'Social communication difficulties (N3) has no linked outcomes',
              recommendation: 'Add specific, measurable outcomes for social communication skills',
              section: 'communication_interaction'
            },
            {
              type: 'unmeasurable_outcome',
              severity: 'moderate',
              description: 'Outcome O3 is not measurable - lacks specific criteria',
              recommendation: 'Rewrite to include measurable success criteria (e.g., "in 4 out of 5 opportunities")',
              section: 'cognition_learning'
            },
            {
              type: 'unlinked_provision',
              severity: 'moderate',
              description: 'Provision P8 is not linked to any specific outcome',
              recommendation: 'Either link to existing outcomes or create specific outcome for emotional wellbeing',
              section: 'social_emotional'
            },
            {
              type: 'unaddressed_need',
              severity: 'critical',
              description: 'Low self-esteem (N7) has no linked outcomes or provision',
              recommendation: 'Add outcomes and provision targeting self-esteem and resilience',
              section: 'social_emotional'
            },
            {
              type: 'missing_provision',
              severity: 'minor',
              description: 'Provision P4 lacks specificity - "multi-sensory approaches" is too vague',
              recommendation: 'Specify which approaches, when, and how often',
              section: 'cognition_learning'
            },
          ],
          strengths: [
            'Strong coherence in Communication & Interaction section',
            'All Health provisions are fully quantified',
            'Clear progress tracking against measurable outcomes',
            'Good linkage between SALT assessment and provision',
          ],
        };

        setData(mockData);
      } catch (error) {
        console.error('Error fetching golden thread data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Toggle expanded items (reserved for detail expansion in future)
  const _toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // Filter sections
  const filteredSections = useMemo(() => {
    if (!data) return [];
    if (selectedSection === 'all') return data.sections;
    return data.sections.filter(s => s.section === selectedSection);
  }, [data, selectedSection]);

  // Get gaps for section
  const getGapsForSection = (section: EHCPSection) => {
    if (!data) return [];
    return data.gaps.filter(g => g.section === section);
  };

  // Progress indicator
  const ProgressIndicator = ({ progress, percentage }: { progress: string; percentage: number }) => {
    const config = {
      achieved: { color: 'green', icon: CheckCircle, label: 'Achieved' },
      on_track: { color: 'blue', icon: TrendingUp, label: 'On Track' },
      at_risk: { color: 'amber', icon: AlertTriangle, label: 'At Risk' },
      not_met: { color: 'red', icon: XCircle, label: 'Not Met' },
    };
    const { color, icon: Icon, label } = config[progress as keyof typeof config] || config.at_risk;

    return (
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-700`}>
          <Icon className="w-3 h-3" />
          {label}
        </div>
        <div className="flex items-center gap-1">
          <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-${color}-500 rounded-full`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">{percentage}%</span>
        </div>
      </div>
    );
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Link2 className="w-12 h-12 text-indigo-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Analysing EHCP coherence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Link2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Golden Thread Visualisation</h2>
              <p className="text-amber-100">
                {data.studentName} • EHCP Coherence Analysis
              </p>
            </div>
          </div>
          
          {/* Coherence Score */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold">{data.overallCoherence}%</div>
              <div className="text-sm text-amber-100">Overall Coherence</div>
            </div>
            <div className="relative w-16 h-16">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  className="text-white/20"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${data.overallCoherence * 1.76} 176`}
                  className="text-white"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">
              {data.sections.reduce((sum, s) => sum + s.needs.length, 0)}
            </div>
            <div className="text-sm text-amber-100">Identified Needs</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">
              {data.sections.reduce((sum, s) => sum + s.outcomes.length, 0)}
            </div>
            <div className="text-sm text-amber-100">Outcomes</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">
              {data.sections.reduce((sum, s) => sum + s.provisions.length, 0)}
            </div>
            <div className="text-sm text-amber-100">Provisions</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-200">{data.gaps.length}</div>
            <div className="text-sm text-amber-100">Gaps Found</div>
          </div>
        </div>
      </div>

      {/* Gaps Alert */}
      {data.gaps.filter(g => g.severity === 'critical').length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-800 dark:text-red-200">Critical Gaps Detected</h4>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                This EHCP has <strong>{data.gaps.filter(g => g.severity === 'critical').length} critical gaps</strong> that 
                could make it vulnerable to challenge. These needs are not adequately addressed by outcomes or provision.
              </p>
              <button 
                onClick={() => setShowGapsOnly(true)}
                className="mt-2 text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                View all gaps <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Section Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedSection('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedSection === 'all'
              ? 'bg-gray-800 text-white dark:bg-white dark:text-gray-900'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200'
          }`}
        >
          All Sections
        </button>
        {Object.entries(SECTION_CONFIG).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <button
              key={key}
              onClick={() => setSelectedSection(key as EHCPSection)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedSection === key
                  ? `bg-${config.color}-600 text-white`
                  : `bg-${config.color}-50 text-${config.color}-700 dark:bg-${config.color}-900/20 dark:text-${config.color}-400 hover:bg-${config.color}-100`
              }`}
            >
              <Icon className="w-4 h-4" />
              {config.name}
            </button>
          );
        })}
      </div>

      {/* Golden Thread Visualisation */}
      {filteredSections.map((section) => {
        const config = SECTION_CONFIG[section.section];
        const Icon = config.icon;
        const sectionGaps = getGapsForSection(section.section);

        return (
          <motion.div
            key={section.section}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Section Header */}
            <div className={`bg-${config.color}-50 dark:bg-${config.color}-900/20 p-4 border-b border-${config.color}-200 dark:border-${config.color}-800`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-${config.color}-100 dark:bg-${config.color}-900/30 rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${config.color}-600`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{config.fullName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{config.description}</p>
                  </div>
                </div>
                {sectionGaps.length > 0 && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                    {sectionGaps.length} gap{sectionGaps.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            {/* Three Column Layout: Needs → Outcomes → Provisions */}
            <div className="grid md:grid-cols-3 gap-0 divide-x divide-gray-200 dark:divide-gray-700">
              {/* NEEDS Column */}
              <div className="p-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Identified Needs
                </h4>
                <div className="space-y-3">
                  {section.needs.map((need) => (
                    <div
                      key={need.id}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        highlightedThread === need.id
                          ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 shadow-md'
                          : need.status === 'unaddressed'
                            ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                            : need.status === 'partially_addressed'
                              ? 'border-amber-300 bg-amber-50 dark:bg-amber-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                      onMouseEnter={() => setHighlightedThread(need.id)}
                      onMouseLeave={() => setHighlightedThread(null)}
                    >
                      <div className="text-sm text-gray-900 dark:text-white font-medium">
                        {need.description}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{need.source}</div>
                      <div className="mt-2 flex items-center gap-2">
                        {need.status === 'addressed' && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                            <CheckCircle className="w-3 h-3" /> Addressed
                          </span>
                        )}
                        {need.status === 'partially_addressed' && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">
                            <AlertTriangle className="w-3 h-3" /> Partial
                          </span>
                        )}
                        {need.status === 'unaddressed' && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                            <XCircle className="w-3 h-3" /> Gap!
                          </span>
                        )}
                        {need.linkedOutcomes.length > 0 && (
                          <span className="text-xs text-gray-400">
                            → {need.linkedOutcomes.length} outcome{need.linkedOutcomes.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* OUTCOMES Column */}
              <div className="p-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Outcomes
                </h4>
                <div className="space-y-3">
                  {section.outcomes.map((outcome) => (
                    <div
                      key={outcome.id}
                      className={`p-3 rounded-lg border transition-all ${
                        highlightedThread && outcome.linkedNeeds.includes(highlightedThread)
                          ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 shadow-md'
                          : !outcome.measurable
                            ? 'border-amber-300 bg-amber-50 dark:bg-amber-900/20'
                            : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="text-sm text-gray-900 dark:text-white">
                        {outcome.description}
                      </div>
                      <div className="mt-2">
                        <ProgressIndicator progress={outcome.progress} percentage={outcome.progressPercentage} />
                      </div>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        {!outcome.measurable && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">
                            <AlertTriangle className="w-3 h-3" /> Not measurable
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          Target: {new Date(outcome.targetDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  ))}
                  {section.outcomes.length === 0 && (
                    <div className="p-4 border-2 border-dashed border-red-300 rounded-lg text-center">
                      <AlertTriangle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                      <p className="text-sm text-red-600 font-medium">No outcomes for this section!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* PROVISIONS Column */}
              <div className="p-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Provision
                </h4>
                <div className="space-y-3">
                  {section.provisions.map((provision) => (
                    <div
                      key={provision.id}
                      className={`p-3 rounded-lg border transition-all ${
                        highlightedThread && section.outcomes.some(o => 
                          o.linkedNeeds.includes(highlightedThread) && provision.linkedOutcomes.includes(o.id)
                        )
                          ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 shadow-md'
                          : !provision.quantified || !provision.specific
                            ? 'border-amber-300 bg-amber-50 dark:bg-amber-900/20'
                            : provision.linkedOutcomes.length === 0
                              ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                              : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="text-sm text-gray-900 dark:text-white">
                        {provision.description}
                      </div>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <span className={`px-1.5 py-0.5 rounded text-xs ${
                          provision.type === 'education' ? 'bg-blue-100 text-blue-700' :
                          provision.type === 'health' ? 'bg-purple-100 text-purple-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {provision.type.charAt(0).toUpperCase() + provision.type.slice(1)}
                        </span>
                        {provision.implementationStatus === 'in_place' && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                            <CheckCircle className="w-3 h-3" /> In place
                          </span>
                        )}
                        {provision.implementationStatus === 'partial' && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">
                            <Minus className="w-3 h-3" /> Partial
                          </span>
                        )}
                        {provision.implementationStatus === 'not_started' && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                            <XCircle className="w-3 h-3" /> Not started
                          </span>
                        )}
                      </div>
                      {(!provision.quantified || !provision.specific) && (
                        <div className="mt-2 text-xs text-amber-600">
                          ⚠️ {!provision.quantified && 'Not quantified'} {!provision.specific && 'Not specific enough'}
                        </div>
                      )}
                      {provision.linkedOutcomes.length === 0 && (
                        <div className="mt-2 text-xs text-red-600">
                          ⚠️ Not linked to any outcome
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Gaps Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          Gap Analysis & Recommendations
        </h3>
        <div className="space-y-3">
          {data.gaps.map((gap, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                gap.severity === 'critical' 
                  ? 'border-l-red-500 bg-red-50 dark:bg-red-900/20' 
                  : gap.severity === 'moderate'
                    ? 'border-l-amber-500 bg-amber-50 dark:bg-amber-900/20'
                    : 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      gap.severity === 'critical' ? 'bg-red-100 text-red-700' :
                      gap.severity === 'moderate' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {gap.severity.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">{SECTION_CONFIG[gap.section].name}</span>
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white mt-1">{gap.description}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    {gap.recommendation}
                  </div>
                </div>
                <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 whitespace-nowrap">
                  Fix this →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-green-600" />
          Strengths Identified
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          {data.strengths.map((strength, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              {strength}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
