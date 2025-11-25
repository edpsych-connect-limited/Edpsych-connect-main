'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, Wand2, Clock, CheckCircle2 } from 'lucide-react';
import { FeatureSpotlightVideo } from '@/components/features/FeatureSpotlightVideo';

export default function FlagshipDifferentiation() {
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold mb-6">
              <Wand2 className="w-4 h-4" />
              <span className="uppercase tracking-wide">Differentiation Engine</span>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              Lessons That <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Plan Themselves.</span>
            </h2>
            
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Input a single lesson objective. Instantly receive 40 personalised versions—scaffolded for support, extended for mastery, and adapted for every unique need in your classroom.
            </p>

            <div className="space-y-4 mb-10">
              {[
                "Instantly adapts to 40+ unique student profiles",
                "Generates specific scaffolding & extension resources",
                "Maps directly to UK National Curriculum standards",
                "Saves 5-10 hours of planning time per week"
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup" className="px-8 py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                See It In Action
              </Link>
              <div className="flex items-center gap-2 px-6 py-4 bg-indigo-50 rounded-xl text-indigo-700 font-medium">
                <Clock className="w-5 h-5" />
                <span>Saves ~45 mins per lesson</span>
              </div>
            </div>
          </motion.div>

          {/* Visual/Demo Placeholder */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 to-purple-100 rounded-3xl transform rotate-3 scale-105 opacity-50 blur-2xl" />
            <FeatureSpotlightVideo
              videoId="c22596d70c16427e87f9ab8bc9d1d8e5"
              title="No Child Left Behind"
              description="See how our engine instantly adapts one lesson plan for 30 unique student profiles."
              icon="differentiation"
              className="relative z-10"
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
