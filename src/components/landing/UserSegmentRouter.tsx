'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { School, GraduationCap, BookOpen, Microscope } from 'lucide-react';

export default function UserSegmentRouter() {
  const [activeSegment, setActiveSegment] = useState<string | null>(null);

  const segments = [
    {
      id: 'ep',
      label: 'Educational Psychologist',
      icon: GraduationCap,
      message: "Amplify your expertise. Automate the paperwork and focus on the child."
    },
    {
      id: 'school',
      label: 'School / SENCO',
      icon: School,
      message: "Orchestrate your entire SEND provision from a single dashboard."
    },
    {
      id: 'teacher',
      label: 'Class Teacher',
      icon: BookOpen,
      message: "Lessons that plan themselves. Differentiation in seconds, not hours."
    },
    {
      id: 'researcher',
      label: 'Researcher',
      icon: Microscope,
      message: "Access anonymised, ethical data sets for groundbreaking studies."
    }
  ];

  return (
    <section className="py-12 bg-slate-950 border-b border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">I am a...</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {segments.map((segment) => (
            <button
              key={segment.id}
              onClick={() => setActiveSegment(segment.id)}
              className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-3 ${
                activeSegment === segment.id
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-800'
              }`}
            >
              <segment.icon className={`w-6 h-6 ${activeSegment === segment.id ? 'text-white' : 'text-indigo-400'}`} />
              <span className="font-medium text-sm">{segment.label}</span>
            </button>
          ))}
        </div>

        {activeSegment && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={activeSegment}
            className="mt-8 text-center"
          >
            <p className="text-xl text-indigo-300 font-medium">
              {segments.find(s => s.id === activeSegment)?.message}
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
