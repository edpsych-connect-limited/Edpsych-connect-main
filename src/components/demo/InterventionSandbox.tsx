'use client'

/**
 * Intervention Sandbox
 * A client-side only version of the Intervention Library for demos.
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StudentProfileService, InterventionRecommendation } from '@/lib/student-profile/service';
import { SelfDrivingSencoAgent } from '@/lib/agents/senco-agent';
import { Sparkles, Bot, Brain, AlertCircle } from 'lucide-react';

// ============================================================================
// MOCK DATA (Subset of Intervention Library)
// ============================================================================

const MOCK_INTERVENTIONS = [
  {
    id: 'phonic-intervention-program',
    name: 'Systematic Synthetic Phonics Program',
    category: 'academic',
    subcategory: 'reading_decoding',
    description: 'Structured phonics instruction using a systematic, synthetic approach aligned with UK phonics framework.',
    evidence_level: 'tier_1',
    age_range: ['early_years', 'primary'],
    setting: ['small_group', 'one_to_one'],
    duration: '12-20 weeks',
    tags: ['reading', 'phonics', 'dyslexia']
  },
  {
    id: 'reading-fluency-repeated-reading',
    name: 'Repeated Reading for Fluency',
    category: 'academic',
    subcategory: 'reading_fluency',
    description: 'Students repeatedly read the same text aloud until fluency criteria are met. Builds automaticity and prosody.',
    evidence_level: 'tier_1',
    age_range: ['primary', 'secondary'],
    setting: ['one_to_one', 'small_group', 'home'],
    duration: '6-12 weeks',
    tags: ['reading', 'fluency', 'dyslexia']
  },
  {
    id: 'cbt-anxiety',
    name: 'CBT for Anxiety (School-Based)',
    category: 'social_emotional',
    subcategory: 'anxiety',
    description: 'Cognitive Behavioural Therapy techniques adapted for school setting to help students manage anxiety.',
    evidence_level: 'tier_2',
    age_range: ['primary', 'secondary'],
    setting: ['one_to_one', 'small_group'],
    duration: '8-10 weeks',
    tags: ['anxiety', 'mental_health', 'cbt']
  },
  {
    id: 'lego-therapy',
    name: 'LEGO®-Based Therapy',
    category: 'social_emotional',
    subcategory: 'social_skills',
    description: 'Collaborative play therapy using LEGO® to improve social communication skills in children with autism.',
    evidence_level: 'tier_2',
    age_range: ['primary', 'secondary'],
    setting: ['small_group'],
    duration: '10-12 weeks',
    tags: ['autism', 'social_skills', 'communication']
  },
  {
    id: 'zones-of-regulation',
    name: 'The Zones of Regulation',
    category: 'social_emotional',
    subcategory: 'emotional_regulation',
    description: 'Curriculum designed to foster self-regulation and emotional control.',
    evidence_level: 'tier_1',
    age_range: ['primary', 'secondary'],
    setting: ['classroom', 'small_group'],
    duration: 'Ongoing',
    tags: ['emotional_regulation', 'behaviour', 'autism']
  },
  {
    id: 'precision-teaching',
    name: 'Precision Teaching',
    category: 'academic',
    subcategory: 'general',
    description: 'Structured method of monitoring progress using daily measurement and charting.',
    evidence_level: 'tier_1',
    age_range: ['all'],
    setting: ['one_to_one'],
    duration: 'Variable',
    tags: ['monitoring', 'data_based', 'academic']
  }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function InterventionSandbox() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'library' | 'auto-agent'>('library');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedIntervention, setSelectedIntervention] = useState<any>(null);
  
  // Agent State
  const [agentRecommendations, setAgentRecommendations] = useState<InterventionRecommendation[]>([]);
  const [isAgentLoading, setIsAgentLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'auto-agent') {
      setIsAgentLoading(true);
      // Simulate fetching profile and running agent
      const runAgent = async () => {
        const profile = await StudentProfileService.getProfile('student-123');
        const recs = SelfDrivingSencoAgent.analyzeAndPrescribe(profile);
        setAgentRecommendations(recs);
        setIsAgentLoading(false);
      };
      void runAgent();
    }
  }, [activeTab]);

  const filteredInterventions = MOCK_INTERVENTIONS.filter(intervention => {
    const matchesSearch = intervention.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          intervention.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || intervention.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Intervention Library <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full ml-2">SANDBOX MODE</span>
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Explore evidence-based interventions.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 p-1 rounded-lg mr-4">
                <button
                  onClick={() => setActiveTab('library')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'library' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Library
                </button>
                <button
                  onClick={() => setActiveTab('auto-agent')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                    activeTab === 'auto-agent' ? 'bg-indigo-600 shadow text-white' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Bot className="w-4 h-4" />
                  Self-Driving SENCO
                </button>
              </div>
              <button
                onClick={() => router.push('/demo')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium"
              >
                Exit Demo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === 'auto-agent' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-indigo-900 rounded-2xl p-8 text-white mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-10">
                <Bot className="w-64 h-64" />
              </div>
              <div className="relative z-10 max-w-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-500/30 rounded-lg backdrop-blur-sm border border-indigo-400/30">
                    <Sparkles className="w-6 h-6 text-indigo-300" />
                  </div>
                  <span className="text-indigo-300 font-medium tracking-wider text-sm uppercase">Autonomous Intelligence</span>
                </div>
                <h2 className="text-3xl font-bold mb-4">Your AI SENCO Assistant</h2>
                <p className="text-indigo-200 text-lg mb-6">
                  I've analyzed the latest data from the <span className="font-bold text-white">Stealth Assessment Engine</span> and identified 
                  immediate intervention opportunities. These recommendations are based on real-time cognitive profiling.
                </p>
                <div className="flex gap-4">
                  <div className="px-4 py-2 bg-indigo-800/50 rounded-lg border border-indigo-500/30 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm">Analyzing 4 Cognitive Domains</span>
                  </div>
                  <div className="px-4 py-2 bg-indigo-800/50 rounded-lg border border-indigo-500/30 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm">3 Priority Actions Found</span>
                  </div>
                </div>
              </div>
            </div>

            {isAgentLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">Analyzing student profile...</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {agentRecommendations.map((rec) => (
                  <div key={rec.id} className="bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-6 flex items-start gap-6">
                      <div className={`p-4 rounded-full shrink-0 ${
                        rec.priority === 'HIGH' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'
                      }`}>
                        <Bot className="w-8 h-8" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{rec.title}</h3>
                            <p className="text-sm text-gray-500">Triggered by: Low {rec.domain} Score</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                            rec.priority === 'HIGH' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {rec.priority} PRIORITY
                          </span>
                        </div>
                        <p className="text-gray-700 mb-4">{rec.description}</p>
                        <div className="flex items-center gap-3">
                          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                            Approve & Provision
                          </button>
                          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                      <span>Generated automatically by Self-Driving SENCO Agent</span>
                      <span>{new Date(rec.generatedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
                
                {agentRecommendations.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500">No active recommendations. The student is performing within expected ranges.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar Filters */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {['all', 'academic', 'social_emotional', 'behavioral'].map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium capitalize ${
                      selectedCategory === category
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {category.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main List */}
          <div className="col-span-9">
            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search interventions..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Results */}
            <div className="grid gap-6">
              {filteredInterventions.map(intervention => (
                <div 
                  key={intervention.id} 
                  className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-indigo-300 transition-colors cursor-pointer"
                  onClick={() => setSelectedIntervention(intervention)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{intervention.name}</h3>
                      <div className="flex items-center gap-2 mt-1 mb-2">
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                          {intervention.category.replace('_', ' ')}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 capitalize">
                          {intervention.evidence_level.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{intervention.description}</p>
                    </div>
                    <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedIntervention && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">{selectedIntervention.name}</h2>
              <button 
                onClick={() => setSelectedIntervention(null)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close details"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h3>
                <p className="text-gray-700">{selectedIntervention.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Evidence Level</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                    {selectedIntervention.evidence_level.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Duration</h3>
                  <p className="text-gray-700 text-sm">{selectedIntervention.duration}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Setting</h3>
                  <div className="flex flex-wrap gap-1">
                    {selectedIntervention.setting.map((s: string) => (
                      <span key={s} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                        {s.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Age Range</h3>
                  <div className="flex flex-wrap gap-1">
                    {selectedIntervention.age_range.map((a: string) => (
                      <span key={a} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                        {a.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedIntervention.tags.map((tag: string) => (
                    <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-yellow-800">
                  <strong>Sandbox Note:</strong> In the full version, you can add this intervention to a student's plan, track progress, and generate implementation guides.
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setSelectedIntervention(null)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 mr-3"
              >
                Close
              </button>
              <button
                onClick={() => alert('In the full version, this would add the intervention to a case.')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Add to Plan (Demo)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
