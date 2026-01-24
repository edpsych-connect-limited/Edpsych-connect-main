'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import { Brain, Target, Zap, BookOpen, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ECCAFrameworkShowcase() {
  const domains = [
    {
      icon: Brain,
      name: "Working Memory & Attention",
      description: "Dynamic assessment of cognitive load capacity and attentional control",
      color: "from-purple-500 to-indigo-600"
    },
    {
      icon: Target,
      name: "Executive Function",
      description: "Planning, inhibition, cognitive flexibility, and problem-solving assessment",
      color: "from-indigo-500 to-blue-600"
    },
    {
      icon: Zap,
      name: "Processing Speed",
      description: "Efficiency of information processing and response execution",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: BookOpen,
      name: "Learning & Memory",
      description: "Encoding, consolidation, and retrieval across modalities",
      color: "from-cyan-500 to-teal-600"
    }
  ];

  const evidenceBase = [
    "Vygotsky's Zone of Proximal Development",
    "Feuerstein's Mediated Learning Experience",
    "Diamond's Executive Function Framework"
  ];

  return (
    <section className="py-12 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-2 bg-white border-2 border-purple-300 rounded-full px-5 py-2 mb-6 shadow-lg">
            <Brain className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-bold text-purple-900">
              Proprietary Assessment System
            </span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            EdPsych Connect Cognitive Assessment{' '}
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              (ECCA)
            </span>
          </h2>

          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Our proprietary dynamic assessment framework combines evidence-based psychological theory
            with practical educational psychology practice-copyright-safe, UK-specific, and designed
            for real-world EP workflows.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {domains.map((domain, idx) => (
            <div
              key={idx}
              className="group bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-100 hover:border-purple-300 hover:shadow-2xl transition-all duration-300"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${domain.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md`}>
                <domain.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{domain.name}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{domain.description}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-purple-100">
            <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
              <BookOpen className="w-6 h-6 text-purple-600 mr-3" />
              Research Foundations
            </h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              ECCA is grounded in three cornerstone theories of cognitive development and assessment:
            </p>
            <div className="space-y-3">
              {evidenceBase.map((theory, idx) => (
                <div key={idx} className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">{theory}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <p className="text-sm text-purple-900 font-medium">
                <strong>Dynamic Assessment:</strong> Test-Teach-Retest methodology reveals learning
                potential, not just current performance. Identifies both strengths and areas for growth.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-8 shadow-xl text-white">
            <h3 className="text-2xl font-bold mb-6">What Makes ECCA Unique</h3>
            <div className="space-y-4">
              {[
                {
                  title: "Multi-Informant Design",
                  desc: "Integrated input from EPs, teachers, parents, and the child themselves"
                },
                {
                  title: "Collaborative Workflow",
                  desc: "Email invitations, structured forms, and consolidated observations"
                },
                {
                  title: "Strengths-Based Approach",
                  desc: "Always begins with what the child CAN do-building from strengths"
                },
                {
                  title: "LA-Compliant Reports",
                  desc: "Professional PDF reports ready for EHCP processes and statutory work"
                },
                {
                  title: "UK-Specific Content",
                  desc: "Aligned with BPS, HCPC standards, National Curriculum, and UK SEND framework"
                },
                {
                  title: "Copyright-Safe",
                  desc: "Proprietary framework-no licensing fees for standardised test materials"
                }
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-1 mr-3 text-amber-300" />
                  <div>
                    <div className="font-bold mb-1">{feature.title}</div>
                    <div className="text-sm text-purple-100">{feature.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <a
            href="#pricing"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-2xl transition-all duration-200 group"
          >
            Explore ECCA Assessment System
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <p className="mt-4 text-sm text-slate-600">
            Available in all Local Authority and School subscription tiers
          </p>
        </div>
      </div>
    </section>
  );
}
