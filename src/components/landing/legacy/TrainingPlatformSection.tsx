'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import { GraduationCap, BookOpen, Award, Clock, Users, CheckCircle2, Play, FileText } from 'lucide-react';
import { useState } from 'react';

export default function TrainingPlatformSection() {
  const [activeCourse, setActiveCourse] = useState(0);

  const courses = [
    {
      title: "Understanding ADHD in the Classroom",
      duration: "2.5 hours",
      modules: 6,
      cpd: "2.5 CPD hours",
      level: "Foundation",
      audience: "Teachers, TAs, SENCOs"
    },
    {
      title: "Dyslexia Support Strategies",
      duration: "3 hours",
      modules: 8,
      cpd: "3 CPD hours",
      level: "Intermediate",
      audience: "Teachers, SENCOs"
    },
    {
      title: "Autism Spectrum: Inclusive Practice",
      duration: "4 hours",
      modules: 10,
      cpd: "4 CPD hours",
      level: "Advanced",
      audience: "SENCOs, EPs, School Leaders"
    }
  ];

  const features = [
    {
      icon: GraduationCap,
      title: "10+ CPD Courses",
      description: "Evidence-based training across SEND, behaviour, wellbeing, and inclusive practice"
    },
    {
      icon: Award,
      title: "Certificated Learning",
      description: "Downloadable certificates automatically generated upon course completion"
    },
    {
      icon: Clock,
      title: "CPD Hour Tracking",
      description: "Automatic tracking of professional development hours for appraisal evidence"
    },
    {
      icon: Users,
      title: "Team Training",
      description: "Enroll whole-school teams—track progress across departments and staff"
    }
  ];

  const topics = [
    "ADHD & Executive Function",
    "Autism Spectrum Conditions",
    "Dyslexia & Literacy Support",
    "Anxiety & Emotional Wellbeing",
    "Behaviour Management",
    "Sensory Processing",
    "Speech & Language Support",
    "Trauma-Informed Practice",
    "Working Memory Strategies",
    "Social Communication"
  ];

  return (
    <section className="py-12 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-full px-5 py-2 mb-6 shadow-lg"
          >
            <GraduationCap className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-bold text-emerald-900">
              Professional Development Platform
            </span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            Training & CPD Marketplace
          </h2>

          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive, certificated professional development courses designed by educational
            psychologists. Build your team's SEND expertise with evidence-based training that
            automatically tracks CPD hours.
          </p>
        </div>

        {/* Key Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-xl border-2 border-slate-100 hover:border-emerald-300 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Sample Courses Showcase */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Left: Course List */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Featured Courses</h3>
            {courses.map((course, idx) => (
              <button
                key={idx}
                onClick={() => setActiveCourse(idx)}
                className={`w-full text-left p-6 rounded-xl border-2 transition-all ${
                  activeCourse === idx
                    ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300 shadow-lg'
                    : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-bold text-slate-900 text-lg pr-4">{course.title}</h4>
                  {activeCourse === idx && (
                    <Play className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  )}
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {course.duration}
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-1" />
                    {course.modules} modules
                  </div>
                  <div className="flex items-center">
                    <Award className="w-4 h-4 mr-1" />
                    {course.cpd}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    course.level === 'Foundation' ? 'bg-blue-100 text-blue-700' :
                    course.level === 'Intermediate' ? 'bg-purple-100 text-purple-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {course.level}
                  </span>
                  <span className="text-xs text-slate-500">{course.audience}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Right: Course Preview */}
          <div
            key={activeCourse}
            className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-8 text-white shadow-2xl"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold opacity-90">Course Preview</div>
                <div className="text-lg font-bold">{courses[activeCourse].title}</div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="font-semibold mb-2">What You'll Learn:</div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-emerald-300" />
                    <span>Evidence-based understanding of the condition</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-emerald-300" />
                    <span>Practical classroom strategies and adaptations</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-emerald-300" />
                    <span>Communication with parents and multi-agency working</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-emerald-300" />
                    <span>Case studies and real-world application</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="font-semibold mb-2">Course Structure:</div>
                <div className="grid grid-cols-3 gap-3 text-center text-sm">
                  <div>
                    <div className="text-2xl font-bold">{courses[activeCourse].modules}</div>
                    <div className="text-xs opacity-90">Modules</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{courses[activeCourse].duration}</div>
                    <div className="text-xs opacity-90">Total Time</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{courses[activeCourse].cpd}</div>
                    <div className="text-xs opacity-90">CPD Hours</div>
                  </div>
                </div>
              </div>
            </div>

            <button className="w-full py-3 bg-white text-emerald-600 rounded-xl font-bold hover:shadow-xl transition-all">
              Preview Course Content
            </button>
          </div>
        </div>

        {/* Topics Covered */}
        <div
          className="bg-white rounded-2xl p-8 border-2 border-slate-100 shadow-lg"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              10+ Topics Across SEND & Inclusive Practice
            </h3>
            <p className="text-slate-600">
              Comprehensive training library covering the full spectrum of SEND support
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {topics.map((topic, idx) => (
              <div
                key={idx}
                className="px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-50 rounded-full text-sm font-semibold text-slate-700 border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all"
              >
                {topic}
              </div>
            ))}
          </div>
        </div>

        {/* Marketplace Callout */}
        <div
          className="mt-12 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border-2 border-amber-200 text-center"
        >
          <FileText className="w-12 h-12 text-amber-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-900 mb-3">
            Purchase Individual Courses or Get Full Access
          </h3>
          <p className="text-lg text-slate-700 mb-6 max-w-2xl mx-auto">
            Buy courses individually (£50-150 per course) or get unlimited access with
            LA and School subscriptions. CPD certificates automatically generated on completion.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="#pricing"
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              View Subscription Plans
            </a>
            <a
              href="#waitlist"
              className="px-6 py-3 bg-white text-emerald-600 border-2 border-emerald-600 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Explore Marketplace
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
