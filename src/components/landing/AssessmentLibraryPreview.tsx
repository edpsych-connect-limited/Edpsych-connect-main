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
import { FileText, Clock, CheckCircle, ArrowRight, Search } from 'lucide-react';
import { Link } from '@/navigation';

export default function AssessmentLibraryPreview() {
  const assessments = [
    {
      title: "Dyslexia Screener (Primary)",
      category: "Cognition & Learning",
      time: "15 mins",
      questions: 24,
      color: "bg-blue-50 text-blue-700 border-blue-100"
    },
    {
      title: "Sensory Processing Audit",
      category: "Physical & Sensory",
      time: "20 mins",
      questions: 35,
      color: "bg-purple-50 text-purple-700 border-purple-100"
    },
    {
      title: "Social Skills Profile",
      category: "Communication",
      time: "10 mins",
      questions: 18,
      color: "bg-emerald-50 text-emerald-700 border-emerald-100"
    },
    {
      title: "Emotional Regulation Scale",
      category: "SEMH",
      time: "12 mins",
      questions: 20,
      color: "bg-amber-50 text-amber-700 border-amber-100"
    }
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-semibold text-slate-600 mb-6 shadow-sm"
          >
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>Assessment Library</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold text-slate-900 mb-6"
          >
            50+ Professional Templates. <br />
            <span className="text-indigo-600">Ready to Deploy.</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-600"
          >
            Stop reinventing the wheel. Access our bank of standardized, evidence-based assessment templates. 
            Valid for EHCP applications and instantly scorable.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {assessments.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg hover:border-indigo-200 transition-all group cursor-pointer"
            >
              <div className={`inline-block px-3 py-1 rounded-lg text-xs font-bold mb-4 border ${item.color}`}>
                {item.category}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">
                {item.title}
              </h3>
              <div className="flex items-center justify-between text-sm text-slate-500 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {item.time}
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  {item.questions} Qs
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center">
          <Link 
            href="/assessments" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:border-indigo-600 hover:text-indigo-600 transition-all"
          >
            <Search className="w-5 h-5" />
            Browse Full Library
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
