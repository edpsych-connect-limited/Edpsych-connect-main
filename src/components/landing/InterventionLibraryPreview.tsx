'use client';

import { Target, Star, BookOpen, Clock, Users, TrendingUp, CheckCircle2, Filter } from 'lucide-react';
import { useState } from 'react';

export default function InterventionLibraryPreview() {
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', name: 'All Interventions', count: '100+' },
    { id: 'tier1', name: 'Tier 1 (Universal)', count: '35+' },
    { id: 'tier2', name: 'Tier 2 (Targeted)', count: '40+' },
    { id: 'tier3', name: 'Tier 3 (Specialist)', count: '25+' }
  ];

  const sampleInterventions = [
    {
      name: "Working Memory Booster Pack",
      tier: "Tier 2",
      evidenceRating: 4,
      duration: "6-8 weeks",
      sessions: "3x weekly",
      ages: "7-14",
      description: "Structured activities to strengthen working memory capacity through chunking, rehearsal, and visualization strategies"
    },
    {
      name: "Phonological Awareness Programme",
      tier: "Tier 2",
      evidenceRating: 5,
      duration: "12 weeks",
      sessions: "Daily",
      ages: "5-8",
      description: "Evidence-based phonics intervention targeting sound awareness, blending, and segmenting skills"
    },
    {
      name: "Social Communication Scaffolds",
      tier: "Tier 1",
      evidenceRating: 4,
      duration: "Ongoing",
      sessions: "As needed",
      ages: "5-16",
      description: "Visual supports and communication frameworks for students with social interaction difficulties"
    },
    {
      name: "Anxiety Management Toolkit",
      tier: "Tier 2",
      evidenceRating: 4,
      duration: "8-10 weeks",
      sessions: "Weekly",
      ages: "8-16",
      description: "CBT-informed strategies for recognizing and managing anxiety in educational settings"
    },
    {
      name: "Executive Function Support Programme",
      tier: "Tier 3",
      evidenceRating: 4,
      duration: "12-16 weeks",
      sessions: "2x weekly",
      ages: "8-16",
      description: "Intensive support for planning, organization, time management, and self-monitoring skills"
    },
    {
      name: "Precision Teaching: Reading Fluency",
      tier: "Tier 2",
      evidenceRating: 5,
      duration: "6-12 weeks",
      sessions: "Daily",
      ages: "6-14",
      description: "High-frequency practice targeting reading speed and accuracy with continuous progress monitoring"
    }
  ];

  const categories = [
    { name: "Literacy", icon: BookOpen, count: 28 },
    { name: "Numeracy", icon: Target, count: 18 },
    { name: "Behaviour", icon: Users, count: 22 },
    { name: "Wellbeing", icon: TrendingUp, count: 15 },
    { name: "Cognition", icon: Star, count: 17 }
  ];

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, idx) => (
          <Star
            key={idx}
            className={`w-4 h-4 ${
              idx < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="py-12 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-full px-5 py-2 mb-6 shadow-lg"
          >
            <Target className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-bold text-orange-900">
              100+ Evidence-Based Interventions
            </span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            Comprehensive Intervention Library
          </h2>

          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Evidence-rated interventions across literacy, numeracy, behaviour, wellbeing, and
            cognition. Each intervention includes detailed implementation guides, progress monitoring
            tools, and quality assurance protocols.
          </p>
        </div>

        {/* Evidence Rating Explanation */}
        <div
          className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-12 border-2 border-indigo-200"
        >
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Evidence-Based Rating System</h3>
              <p className="text-slate-700 mb-3">
                Every intervention is rated on a 5-star scale based on research evidence strength,
                replication studies, and real-world effectiveness data.
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white p-3 rounded-lg border border-indigo-200">
                  <div className="flex items-center mb-1">
                    {renderStars(5)}
                  </div>
                  <span className="font-semibold text-slate-900">Tier 1 Evidence:</span> Multiple RCTs, meta-analyses
                </div>
                <div className="bg-white p-3 rounded-lg border border-indigo-200">
                  <div className="flex items-center mb-1">
                    {renderStars(4)}
                  </div>
                  <span className="font-semibold text-slate-900">Tier 2 Evidence:</span> Strong quasi-experimental studies
                </div>
                <div className="bg-white p-3 rounded-lg border border-indigo-200">
                  <div className="flex items-center mb-1">
                    {renderStars(3)}
                  </div>
                  <span className="font-semibold text-slate-900">Tier 3 Evidence:</span> Promising practice, emerging evidence
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeFilter === filter.id
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg scale-105'
                  : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-orange-300'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span>{filter.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeFilter === filter.id
                  ? 'bg-white/30'
                  : 'bg-slate-100'
              }`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        {/* Sample Interventions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {sampleInterventions.map((intervention, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-6 border-2 border-slate-100 hover:border-orange-300 hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  intervention.tier === 'Tier 1' ? 'bg-green-100 text-green-700' :
                  intervention.tier === 'Tier 2' ? 'bg-blue-100 text-blue-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {intervention.tier}
                </div>
                {renderStars(intervention.evidenceRating)}
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-3">{intervention.name}</h3>

              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                {intervention.description}
              </p>

              <div className="space-y-2 text-sm text-slate-600 mb-4">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-orange-600" />
                  <span>{intervention.duration} • {intervention.sessions}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-orange-600" />
                  <span>Ages {intervention.ages}</span>
                </div>
              </div>

              <button className="w-full py-2 bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 rounded-lg font-semibold hover:from-orange-100 hover:to-red-100 transition-all border border-orange-200">
                View Full Details
              </button>
            </div>
          ))}
        </div>

        {/* Categories Overview */}
        <div
          className="bg-white rounded-2xl p-8 border-2 border-slate-100 shadow-lg mb-12"
        >
          <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Interventions Across All Areas of Need
          </h3>
          <div className="grid md:grid-cols-5 gap-6">
            {categories.map((category, idx) => (
              <div
                key={idx}
                className="text-center p-6 bg-gradient-to-br from-slate-50 to-white rounded-xl border-2 border-slate-100 hover:border-orange-300 hover:shadow-md transition-all"
              >
                <category.icon className="w-10 h-10 text-orange-600 mx-auto mb-3" />
                <div className="font-bold text-slate-900 mb-1">{category.name}</div>
                <div className="text-2xl font-bold text-orange-600">{category.count}</div>
                <div className="text-xs text-slate-500">interventions</div>
              </div>
            ))}
          </div>
        </div>

        {/* Implementation Support Callout */}
        <div
          className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200"
        >
          <div className="text-center">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Complete Implementation Packages
            </h3>
            <p className="text-lg text-slate-700 mb-6 max-w-3xl mx-auto">
              Each intervention includes detailed implementation guides, session-by-session plans,
              progress monitoring tools, staff training materials, and parent communication resources.
              Everything you need for high-fidelity delivery.
            </p>
            <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white p-4 rounded-xl border border-green-200">
                <div className="text-3xl font-bold text-green-600 mb-1">100+</div>
                <div className="text-sm text-slate-600">Interventions</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-green-200">
                <div className="text-3xl font-bold text-green-600 mb-1">3 Tiers</div>
                <div className="text-sm text-slate-600">Universal to Specialist</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-green-200">
                <div className="text-3xl font-bold text-green-600 mb-1">5 Areas</div>
                <div className="text-sm text-slate-600">All areas of need</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-green-200">
                <div className="text-3xl font-bold text-green-600 mb-1">Evidence</div>
                <div className="text-sm text-slate-600">Research-backed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
