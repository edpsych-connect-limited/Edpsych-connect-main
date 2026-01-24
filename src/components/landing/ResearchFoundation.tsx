'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Scale, ScrollText, GraduationCap, ChevronDown, ChevronUp, ExternalLink, Users, Heart, Briefcase } from 'lucide-react';

export default function ResearchFoundation() {
  const [expandedBio, setExpandedBio] = useState(false);

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
            <GraduationCap className="w-4 h-4" />
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
            We don&apos;t just guess. Every feature in EdPsych Connect is grounded in peer-reviewed research, 
            developmental psychology, and over a decade of frontline clinical practice.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left: The Credentials - Enhanced Founder Profile */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-100 relative overflow-hidden group hover:border-indigo-200 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
              
              <div className="relative z-10">
                {/* Header with Photo and Title */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-24 h-24 relative rounded-xl overflow-hidden shadow-lg border-2 border-indigo-100 flex-shrink-0">
                    <Image 
                      src="/images/dr-scott-landing.jpg" 
                      alt="Dr Scott Ighavongbe-Patrick D.Ed.Psych CPsychol"
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Dr Scott Ighavongbe-Patrick</h3>
                    <p className="text-indigo-600 font-medium">D.Ed.Psych CPsychol</p>
                    <p className="text-slate-500 text-sm">Founder & Managing Director</p>
                    <p className="text-slate-500 text-sm">EdPsych Connect Limited</p>
                  </div>
                </div>
                
                {/* Core Summary */}
                <p className="text-slate-700 mb-4 leading-relaxed font-medium">
                  Chartered Child and Adolescent Educational Psychologist and visionary founder of EdPsych Connect World-a revolutionary platform transforming how schools, families, and professionals collaborate to ensure every child reaches their full potential.
                </p>

                {/* Key Quote */}
                <div className="bg-indigo-50 rounded-lg p-4 mb-6 border-l-4 border-indigo-500">
                  <p className="text-slate-700 italic text-sm leading-relaxed">
                    &quot;My doctoral research at the University of Southampton revealed that educational challenges stem not from deficient children or inadequate teachers, but from systems not designed to accommodate the complexity and diversity of human learning. This revelation drove me to create EdPsych Connect World.&quot;
                  </p>
                </div>

                {/* Expandable Full Bio */}
                <AnimatePresence>
                  {expandedBio && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      {/* Journey Through Education */}
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Users className="w-5 h-5 text-indigo-600" />
                          <h4 className="font-bold text-slate-900">From Frontline to Innovation</h4>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed mb-3">
                          Dr Ighavongbe-Patrick&apos;s journey through education began on the frontlines-as a Behaviour Support Outreach Mentor reaching the most challenging and disengaged young people. He contributed to the groundbreaking <strong>Aim Higher</strong> national programme, widening higher education participation for disadvantaged students, and facilitated transformative summer school experiences for Children in Care.
                        </p>
                        <p className="text-slate-600 text-sm leading-relaxed mb-3">
                          For over seven years, he served as a Level One Football Coach with Chesham United FC, using sport as a vehicle for engagement, mentorship, and personal development-skills that would later inform his approach to creating engaging educational experiences.
                        </p>
                        <p className="text-slate-600 text-sm leading-relaxed">
                          His formal psychology career began at <strong>Achieving for Children</strong> (formerly Windsor and Maidenhead Educational Psychology Service) as an Assistant Psychologist, following his <strong>First Class Honours degree in Psychology</strong> from Buckinghamshire New University. After completing his doctoral training at the University of Southampton, he returned as a Maingrade Educational Psychologist (2016-2019) before advancing to Senior EP at Buckinghamshire Council.
                        </p>
                      </div>

                      {/* Professional Excellence */}
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Briefcase className="w-5 h-5 text-indigo-600" />
                          <h4 className="font-bold text-slate-900">Professional Excellence & TEAM-UP</h4>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed mb-3">
                          As <strong>Senior Educational Psychologist at Buckinghamshire Council</strong> (until 2023), Dr Ighavongbe-Patrick conceived and named <strong>TEAM-UP</strong> (Termly Early Action Multi-Agency Unified Planning)-an initiative that was developed and driven to reality through collaborative multi-agency effort with the Head of Children's Services. This project addressed systemic delays in supporting children with complex needs by fostering collaboration between agencies and school SENCOs, shifting the paradigm from reactive crisis management to proactive, timely support.
                        </p>
                        <p className="text-slate-600 text-sm leading-relaxed mb-3">
                          In 2023, he resigned to focus full-time on EdPsych Connect Limited, while continuing as a <strong>Locum Consultant EP</strong> for Suffolk, Leicestershire (Quality Assessment EP), Worcestershire, and Hertfordshire-working directly with hundreds of children, parents, educators, and multi-agency professionals.
                        </p>
                        <p className="text-slate-600 text-sm leading-relaxed">
                          As an HCPC Registered Educational Psychologist with SDS clinical supervision accreditation, his practice spans early years through college education, with expertise in exclusions, restorative justice, SEMH, autism, and trauma-informed approaches.
                        </p>
                      </div>

                      {/* The Platform Vision */}
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Heart className="w-5 h-5 text-indigo-600" />
                          <h4 className="font-bold text-slate-900">The Vision: A Complete Ecosystem</h4>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed mb-3">
                          EdPsych Connect World emerged from a decade of frontline practice and doctoral research. It represents not merely an EdTech application, but a <strong>first-of-its-kind complete ecosystem</strong>-where technology serves humanity rather than exploiting it.
                        </p>
                        <ul className="text-slate-600 text-sm space-y-2 mb-3">
                          <li><strong>For Teachers:</strong> Liberation from administrative burden, restoring time for pastoral care and inspired teaching</li>
                          <li><strong>For Students:</strong> Engaging, gamified learning differentiated to individual needs-where screen time becomes creative development time</li>
                          <li><strong>For Parents:</strong> Real-time partnership in their children&apos;s educational journey</li>
                          <li><strong>For Professionals:</strong> Marketplace, collaboration tools, and readily accessible support</li>
                          <li><strong>For Researchers:</strong> Anonymised real-world data powering continuous improvement</li>
                          <li><strong>For the Future:</strong> A coding curriculum equipping children for the AI era-building creators, not consumers</li>
                        </ul>
                      </div>

                      {/* Inspirational Note */}
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 mb-4">
                        <p className="text-slate-700 text-sm leading-relaxed italic">
                          &quot;Completing my doctorate in my late 40s reinforced my conviction that learning is a lifelong journey without barriers. This platform exists because I believe every child deserves what the wealthy can afford-world-class psychological support, engaging education, and adults who truly listen. Technology should amplify human potential, not replace it.&quot;
                        </p>
                      </div>

                      {/* Research Link */}
                      <Link 
                        href="https://www.researchgate.net/publication/369982171_What_Can_Children_and_Young_People_Tell_Us_About_School_Sanctions_and_Social_Relationships_An_Exploration_of_Exclusionary_and_Restorative_Justice_Practices"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Read Doctoral Research on ResearchGate
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Expand/Collapse Button */}
                <button
                  onClick={() => setExpandedBio(!expandedBio)}
                  className="w-full mt-4 py-2 flex items-center justify-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors border-t border-slate-100 pt-4"
                >
                  {expandedBio ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Read Full Biography
                    </>
                  )}
                </button>

                {/* Credentials Badges */}
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-md uppercase tracking-wide">D.Ed.Psych</span>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-md uppercase tracking-wide">CPsychol</span>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-md uppercase tracking-wide">HCPC Registered</span>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-md uppercase tracking-wide">SDS Clinical Supervisor</span>
                </div>
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
