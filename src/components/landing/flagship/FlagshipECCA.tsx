'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import { motion } from 'framer-motion';
import Link from 'next/link';
import { BrainCircuit, Microscope, FileText, CheckCircle2, Layers } from 'lucide-react';

export default function FlagshipECCA() {
  return (
    <section className="py-24 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Visual/Demo Placeholder - Left Side for Alternating Layout */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative order-2 lg:order-1"
          >
            <div className="absolute inset-0 bg-gradient-to-bl from-blue-100 to-cyan-100 rounded-3xl transform -rotate-3 scale-105 opacity-50 blur-2xl" />
            <div className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
              {/* Mock UI Header */}
              <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-300" />
                  <div className="w-3 h-3 rounded-full bg-slate-300" />
                  <div className="w-3 h-3 rounded-full bg-slate-300" />
                </div>
                <div className="text-xs font-mono text-slate-400">ecca_framework_v2.json</div>
              </div>
              
              {/* Mock UI Content - Radar Chart / Domains */}
              <div className="p-8 relative">
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                   <BrainCircuit className="w-64 h-64" />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-center">
                        <div className="text-2xl font-bold text-blue-600">7</div>
                        <div className="text-xs text-blue-800 font-medium uppercase">Core Domains</div>
                    </div>
                    <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-100 text-center">
                        <div className="text-2xl font-bold text-cyan-600">360 deg</div>
                        <div className="text-xs text-cyan-800 font-medium uppercase">Contextual View</div>
                    </div>
                </div>

                <div className="space-y-3">
                    {[
                        { label: "Cognition & Learning", val: "85%", widthClass: "w-[85%]" },
                        { label: "Communication & Interaction", val: "70%", widthClass: "w-[70%]" },
                        { label: "Social, Emotional & Mental Health", val: "90%", widthClass: "w-[90%]" },
                        { label: "Sensory & Physical", val: "60%", widthClass: "w-[60%]" }
                    ].map((d, i) => (
                        <div key={i} className="space-y-1">
                            <div className="flex justify-between text-xs font-medium text-slate-600">
                                <span>{d.label}</span>
                                <span>{d.val}</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full bg-gradient-to-r from-blue-500 to-cyan-500 ${d.widthClass}`} />
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                    <span>Analysis Complete</span>
                    <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">ID: ECCA-2024-X9</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-1 lg:order-2"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold mb-6">
              <Microscope className="w-4 h-4" />
              <span className="uppercase tracking-wide">The ECCA Framework</span>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              See The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">Whole Child.</span>
            </h2>
            
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Move beyond isolated symptoms. Our Educational Context & Capabilities Assessment (ECCA) maps a student's profile across 7 key domains, integrating teacher observations, parent insights, and environmental factors.
            </p>

            <div className="space-y-4 mb-10">
              {[
                "Holistic 7-Domain Analysis (Cognition, SEMH, etc.)",
                "Integrates Home & School Contextual Data",
                "Strengths-Based Profiling & Gap Analysis",
                "Generates Evidence-Based Intervention Plans"
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/assessments" className="px-8 py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                <Layers className="w-5 h-5" />
                Explore the Framework
              </Link>
              <div className="flex items-center gap-2 px-6 py-4 bg-blue-50 rounded-xl text-blue-700 font-medium">
                <FileText className="w-5 h-5" />
                <span>Download Sample Report</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
