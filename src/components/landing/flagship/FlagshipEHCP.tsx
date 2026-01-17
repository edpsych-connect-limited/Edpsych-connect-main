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
import { FileText, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

export default function FlagshipEHCP() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-semibold mb-6">
              <FileText className="w-4 h-4" />
              <span className="uppercase tracking-wide">EHCP Automation</span>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              Paperwork That <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">Writes Itself.</span>
            </h2>
            
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              End-to-end EHCP orchestration designed for UK workflows. From evidence gathering to final PDF export, we streamline the admin so you can focus on the child.
            </p>

            <div className="space-y-6 mb-10">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Reduce Admin Time</h4>
                  <p className="text-slate-600">Automated evidence collection and report generation reduce repetitive drafting.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Compliance-Ready Checks</h4>
                  <p className="text-slate-600">Built-in validation supports UK Code of Practice alignment and internal QA.</p>
                </div>
              </div>
            </div>

            <Link href="/signup" className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-200 transition-all flex items-center justify-center gap-2 group">
              Calculate Your ROI
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Visual/Demo Placeholder */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-green-100 to-emerald-100 rounded-3xl transform rotate-3 scale-105 opacity-50 blur-2xl" />
            
            {/* Document Stack Visual */}
            <div className="relative">
              {/* Back Document */}
              <div className="absolute top-4 left-4 right-4 h-64 bg-white border border-slate-200 rounded-xl shadow-sm transform -rotate-2 opacity-60" />
              {/* Middle Document */}
              <div className="absolute top-2 left-2 right-2 h-64 bg-white border border-slate-200 rounded-xl shadow-md transform rotate-1 opacity-80" />
              
              {/* Front Document (Active) */}
              <div className="relative bg-white border border-slate-200 rounded-xl shadow-xl p-8">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-lg" />
                  <div className="text-right">
                    <div className="h-4 w-32 bg-slate-100 rounded mb-2 ml-auto" />
                    <div className="h-3 w-24 bg-slate-100 rounded ml-auto" />
                  </div>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="h-6 w-3/4 bg-slate-100 rounded" />
                  <div className="h-4 w-full bg-slate-50 rounded" />
                  <div className="h-4 w-full bg-slate-50 rounded" />
                  <div className="h-4 w-5/6 bg-slate-50 rounded" />
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Section F Complete
                  </div>
                  <div className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded uppercase tracking-wider">
                    Export PDF
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

// Helper icon for the visual
function CheckCircle2({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
