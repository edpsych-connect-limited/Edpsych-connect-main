/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';

const testimonials = [
  {
    name: 'Year 6 Teacher',
    role: 'Primary School, West Midlands',
    quote:
      'I used to spend 12 hours every weekend planning differentiated lessons. Now the platform does it automatically, and I actually spend Sundays with my family.',
  },
  {
    name: 'SENCO',
    role: 'Secondary Academy, North West',
    quote:
      'The platform automatically builds profiles as students work. No more hunting through files wondering why a child is struggling - I just ask "How is this student doing?" and get instant answers.',
  },
  {
    name: 'Educational Psychologist',
    role: 'Local Authority EP Service',
    quote:
      'Multi-agency collaboration went from nightmare to seamless. Teachers, parents, and I all see exactly what we need. Parents finally understand their child\'s progress without jargon.',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold text-slate-900 mb-8">
          Teachers Getting Their Time Back
        </h2>
        <p className="text-lg text-slate-600 mb-12">
          Voices from the frontline of UK education*
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200 hover:shadow-xl transition-all duration-300"
            >
              <p className="text-slate-700 italic mb-6">"{t.quote}"</p>
              <div className="font-semibold text-slate-900">{t.name}</div>
              <div className="text-slate-500 text-sm">{t.role}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
