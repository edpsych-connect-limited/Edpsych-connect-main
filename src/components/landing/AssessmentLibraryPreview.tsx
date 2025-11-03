'use client';

import { FileText, CheckCircle2, Star, Users, MessageSquare, Brain, TrendingUp } from 'lucide-react';
import { useState } from 'react';

export default function AssessmentLibraryPreview() {
  const [activeCategory, setActiveCategory] = useState('cognitive');

  const categories = [
    { id: 'cognitive', name: 'Cognitive', icon: Brain, count: 15 },
    { id: 'educational', name: 'Educational', icon: FileText, count: 18 },
    { id: 'behavioral', name: 'Behavioural', icon: Users, count: 12 },
    { id: 'speech', name: 'Speech & Language', icon: MessageSquare, count: 8 }
  ];

  const sampleAssessments = {
    cognitive: [
      { name: "Working Memory Assessment Battery", age: "5-16", time: "45 min", qualification: "EP" },
      { name: "Executive Function Profile", age: "7-18", time: "60 min", qualification: "EP/SENCO" },
      { name: "Processing Speed Evaluation", age: "6-16", time: "30 min", qualification: "EP" },
      { name: "Attention & Concentration Screen", age: "5-14", time: "25 min", qualification: "Teacher" }
    ],
    educational: [
      { name: "Reading Comprehension Analysis", age: "6-16", time: "40 min", qualification: "Teacher" },
      { name: "Numeracy Skills Profile", age: "5-14", time: "35 min", qualification: "Teacher" },
      { name: "Spelling & Phonics Assessment", age: "5-11", time: "30 min", qualification: "Teacher" },
      { name: "Writing Skills Evaluation", age: "7-16", time: "45 min", qualification: "Teacher" }
    ],
    behavioral: [
      { name: "Social-Emotional Wellbeing Screen", age: "5-16", time: "20 min", qualification: "Any" },
      { name: "Anxiety & Stress Indicator", age: "8-18", time: "15 min", qualification: "Any" },
      { name: "Peer Relationships Assessment", age: "7-14", time: "25 min", qualification: "Teacher" },
      { name: "Classroom Engagement Profile", age: "5-16", time: "30 min", qualification: "Teacher" }
    ],
    speech: [
      { name: "Expressive Language Screen", age: "4-12", time: "30 min", qualification: "SLT/SENCO" },
      { name: "Receptive Language Assessment", age: "4-12", time: "35 min", qualification: "SLT/SENCO" },
      { name: "Articulation & Phonology Screen", age: "3-10", time: "25 min", qualification: "SLT" },
      { name: "Pragmatic Language Skills", age: "6-16", time: "40 min", qualification: "SLT/Teacher" }
    ]
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-full px-5 py-2 mb-6 shadow-lg"
          >
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-bold text-blue-900">
              50+ Copyright-Safe Templates
            </span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            Professional Assessment Library
          </h2>

          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive, age-appropriate assessment templates across cognitive, educational,
            behavioural, and speech/language domains. All UK-specific, qualification-tiered,
            and ready for immediate use.
          </p>
        </div>

        {/* Key Benefits */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            { icon: CheckCircle2, title: "Copyright-Safe", desc: "No licensing fees" },
            { icon: Star, title: "UK-Specific", desc: "Aligned with National Curriculum" },
            { icon: Users, title: "Age-Appropriate", desc: "EYFS through Key Stage 4" },
            { icon: TrendingUp, title: "Evidence-Based", desc: "Research-backed measures" }
          ].map((benefit, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-xl border-2 border-slate-100 text-center"
            >
              <benefit.icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <div className="font-bold text-slate-900 mb-1">{benefit.title}</div>
              <div className="text-sm text-slate-600">{benefit.desc}</div>
            </div>
          ))}
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg scale-105'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <category.icon className="w-5 h-5" />
              <span>{category.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeCategory === category.id
                  ? 'bg-white/30'
                  : 'bg-slate-200'
              }`}>
                {category.count}
              </span>
            </button>
          ))}
        </div>

        {/* Sample Assessments */}
        <div
          key={activeCategory}
          className="grid md:grid-cols-2 gap-6 mb-12"
        >
          {sampleAssessments[activeCategory as keyof typeof sampleAssessments].map((assessment, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-xl border-2 border-slate-100 hover:border-blue-300 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-slate-900 text-lg">{assessment.name}</h3>
                <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                  {assessment.qualification}
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-slate-600">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {assessment.age}
                </div>
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {assessment.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ROI Callout */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200 text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">
            Massive Time Savings for Busy Educational Psychologists
          </h3>
          <p className="text-lg text-slate-700 mb-6 max-w-3xl mx-auto">
            Each assessment template includes scoring algorithms, interpretation guidance, and
            report generation—reducing assessment administration time by 40-60%.
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl border border-green-200">
              <div className="text-4xl font-bold text-green-600 mb-2">970%</div>
              <div className="text-sm text-slate-600">Minimum ROI for LAs</div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-green-200">
              <div className="text-4xl font-bold text-green-600 mb-2">40-60%</div>
              <div className="text-sm text-slate-600">Time savings per assessment</div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-green-200">
              <div className="text-4xl font-bold text-green-600 mb-2">50+</div>
              <div className="text-sm text-slate-600">Templates ready to use</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
