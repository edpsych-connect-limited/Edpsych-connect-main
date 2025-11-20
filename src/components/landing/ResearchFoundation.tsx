'use client';

import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, Scale, Award, ScrollText, University } from 'lucide-react';

export default function ResearchFoundation() {
  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900 via-transparent to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 text-sm font-semibold mb-6"
          >
            <University className="w-4 h-4" />
            Academic Rigour Meets Innovation
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-6"
          >
            Built on the <span className="text-indigo-600">Science of Learning</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed"
          >
            We don't just guess. Every feature in EdPsych Connect is grounded in peer-reviewed research, 
            developmental psychology, and over a decade of frontline clinical practice.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: The Credentials */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-100 relative overflow-hidden group hover:border-indigo-200 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Dr Scott Ighavongbe-Patrick</h3>
                    <p className="text-indigo-600 font-medium">Founder & Lead Psychologist</p>
                  </div>
                </div>
                
                <p className="text-slate-600 mb-6 leading-relaxed">
                  &quot;My doctoral research at the University of Southampton revealed a critical gap: 
                  children want to be heard, not just managed. We built this platform to scale 
                  that listening—giving every child the specialist attention they deserve, instantly.&quot;
                </p>

                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-md uppercase tracking-wide">DEdPsych</span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-md uppercase tracking-wide">CPsychol</span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-md uppercase tracking-wide">HCPC Registered</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-100 relative overflow-hidden group hover:border-purple-200 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Mentorship & Supervision</h3>
                    <p className="text-purple-600 font-medium">Dr Piers Worth, PhD</p>
                  </div>
                </div>
                
                <p className="text-slate-600 leading-relaxed">
                  Guided by one of the UK's leading voices in Positive Psychology. Our framework 
                  isn't just about fixing deficits—it's about identifying and amplifying 
                  strengths using rigorous positive psychology interventions.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right: The Frameworks */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid gap-6"
          >
            {[
              {
                icon: Scale,
                title: "The ECCA Framework",
                desc: "Our proprietary dynamic assessment model (Explore, Clarify, Create, Act) ensures no child is labeled without understanding context.",
                color: "text-blue-600",
                bg: "bg-blue-50"
              },
              {
                icon: BookOpen,
                title: "Evidence-Based Interventions",
                desc: "A library of 535+ strategies, each tagged with its research basis (e.g., CBT, Precision Teaching, Restorative Justice).",
                color: "text-emerald-600",
                bg: "bg-emerald-50"
              },
              {
                icon: ScrollText,
                title: "Statutory Compliance",
                desc: "Every report and plan is automatically aligned with the UK SEND Code of Practice (2015) and the Children and Families Act (2014).",
                color: "text-amber-600",
                bg: "bg-amber-50"
              }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4 p-6 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}