'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

// Script anchors (video audit):
// EdPsych Connect was built by me.
// When you use this platform, you're using something designed by a colleague.

;

import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Building2, 
  GraduationCap, 
  Heart, 
  Lightbulb, 
  Users, 
  Award,
  Target,
  Sparkles,
  Globe,
  Code2,
  BookOpen,
  Shield,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';

interface TeamMember {
  name: string;
  role: string;
  image: string;
  credentials?: string;
  bio?: string;
  isFounder?: boolean;
  imagePosition?: string; // Custom object-position for image cropping
}

const teamMembers: TeamMember[] = [
  {
    name: 'Dr Scott I-Patrick',
    role: 'Founder & Developer',
    image: '/images/dr-scott-landing.jpg',
    credentials: 'DEdPsych CPsychol | HCPC: PYL042340',
    bio: 'Dr Scott founded and developed EdPsych Connect after a distinguished career in educational psychology. Following his First Class Honours in Psychology from Buckinghamshire New University, he trained at the University of Southampton where his doctoral research explored children\'s experiences of school sanctions through restorative justice. As Senior Educational Psychologist at Buckinghamshire Council, he conceived and named TEAM-UP (Termly Early Action Multi-Agency Unified Planning)-a pioneering early intervention initiative that was developed and implemented through collaborative multi-agency effort with the Head of Children\'s Services and partners. He resigned in 2023 to focus full-time on EdPsych Connect, combining his clinical expertise with self-taught software development skills.',
    isFounder: true,
    imagePosition: 'center top',
  },
  {
    name: 'Samantha Patrick',
    role: 'Business Administration Manager',
    image: '/images/samantha-patrick.jpg',
    bio: 'Oversees all business operations, ensuring smooth day-to-day running of EdPsych Connect Limited.',
    imagePosition: 'center 25%', // Show head and upper torso, include chin
  },
  {
    name: 'Emmanuel Oyerinde',
    role: 'Chief Technical Officer',
    image: '/images/emmanuel-oyerinde.jpg',
    bio: 'Leads technical strategy and architecture, ensuring our platform maintains enterprise-grade security and performance.',
    imagePosition: 'center 20%', // Professional headshot framing
  },
  {
    name: 'George Randall',
    role: 'Quality Assurance',
    image: '/images/george-randall.jpg',
    bio: 'Ensures every feature meets our rigorous standards for reliability, accessibility, and user experience.',
    imagePosition: 'center top',
  },
  {
    name: 'Louis Young',
    role: 'Business Development Manager',
    image: '/images/louis-young.jpg',
    bio: 'Drives partnerships with Local Authorities, Multi-Academy Trusts, and educational institutions across the UK.',
    imagePosition: 'center 5%', // Show top of head
  },
  {
    name: 'Hannah I-Patrick',
    role: 'Assistant Psychologist',
    image: '/images/hannah-i-patrick.jpg',
    bio: 'Provides psychological support and contributes to assessment development and research initiatives.',
    imagePosition: 'center 30%', // Show head and torso properly framed
  },
];

const values = [
  {
    icon: Heart,
    title: 'Child-Centred',
    description: 'Every decision we make prioritises the wellbeing and educational outcomes of children and young people.',
  },
  {
    icon: Shield,
    title: 'Evidence-Based',
    description: 'Our platform is built on peer-reviewed research and validated psychological methodologies.',
  },
  {
    icon: Users,
    title: 'Collaborative',
    description: 'We believe in breaking down silos between teachers, parents, and professionals.',
  },
  {
    icon: Lightbulb,
    title: 'Innovative',
    description: 'We leverage cutting-edge technology to solve real-world educational challenges.',
  },
  {
    icon: Globe,
    title: 'Inclusive',
    description: 'Designed for accessibility, ensuring no child is left behind regardless of their needs.',
  },
  {
    icon: Award,
    title: 'Excellence',
    description: 'We maintain the highest professional standards in everything we do.',
  },
];

const milestones = [
  {
    year: '2016-2019',
    title: 'Achieving for Children',
    description: 'Dr Scott began his career as Maingrade Educational Psychologist at Achieving for Children (Windsor & Maidenhead).',
  },
  {
    year: '2019-2023',
    title: 'Buckinghamshire Council',
    description: 'Senior Educational Psychologist role where TEAM-UP was conceived and implemented.',
  },
  {
    year: '2023',
    title: 'EdPsych Connect Founded',
    description: 'Dr Scott resigned from Buckinghamshire Council to focus full-time on building EdPsych Connect.',
  },
  {
    year: '2024',
    title: 'Platform Development',
    description: 'Intensive development phase, building the complete ecosystem from scratch.',
  },
  {
    year: '2025',
    title: 'Beta Launch',
    description: 'Platform enters beta testing with selected UK schools and Local Authorities.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <Link href="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-slate-900">About EdPsych Connect</h1>
          </div>
          <p className="text-slate-600 mt-2">The story behind our mission to ensure no child is left behind</p>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Teaching That Adapts Itself
              </h2>
              <p className="text-xl text-indigo-100 mb-6">
                EdPsych Connect World is the UK&apos;s first platform intelligence system that automatically builds student profiles, 
                differentiates lessons for entire classrooms, and seamlessly connects teachers, parents, and educational psychologists.
              </p>
              <p className="text-lg text-indigo-200">
                Founded by a practising educational psychologist who saw the need for better tools, 
                EdPsych Connect represents the fusion of clinical expertise and cutting-edge technology.
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold">47+</div>
                    <div className="text-indigo-200 text-sm">Hours Saved Monthly</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold">100%</div>
                    <div className="text-indigo-200 text-sm">UK GDPR Compliant</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold">HCPC</div>
                    <div className="text-indigo-200 text-sm">Registered Founder</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold">AI</div>
                    <div className="text-indigo-200 text-sm">Powered Platform</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Details */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <div className="flex items-center gap-3 mb-8">
              <Building2 className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-slate-900">Company Information</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-slate-900 mb-4">Registered Details</h3>
                <ul className="space-y-3 text-slate-600">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Company Name:</strong> EdPsych Connect Limited</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Company Number:</strong> 14989115</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Registered in:</strong> England and Wales</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>HCPC Registration:</strong> PYL042340</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-slate-900 mb-4">Registered Address</h3>
                <address className="not-italic text-slate-600 leading-relaxed">
                  38 Buckingham View<br />
                  Chesham<br />
                  Buckinghamshire<br />
                  HP5 3HA<br />
                  United Kingdom
                </address>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16 bg-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <Target className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Mission</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              To democratise access to educational psychology expertise, ensuring every child receives 
              the support they need to thrive, regardless of postcode or circumstance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Empower Educators</h3>
              <p className="text-slate-600">
                Give teachers the tools to understand and support every learner in their classroom without additional workload.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Connect Professionals</h3>
              <p className="text-slate-600">
                Break down silos between schools, Local Authorities, EPs, and families through seamless collaboration.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Transform Outcomes</h3>
              <p className="text-slate-600">
                Use AI-powered insights to identify needs early and deliver evidence-based interventions that work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <Heart className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Values</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              The principles that guide everything we build and every decision we make.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value) => (
              <div 
                key={value.title}
                className="bg-white rounded-xl p-6 shadow-md border border-slate-100 hover:border-indigo-200 transition-colors"
              >
                <value.icon className="w-8 h-8 text-indigo-600 mb-4" />
                <h3 className="font-semibold text-slate-900 mb-2">{value.title}</h3>
                <p className="text-slate-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Journey */}
      <section className="py-16 bg-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <BookOpen className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Journey</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              From frontline practice to platform innovation.
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-indigo-200 transform md:-translate-x-1/2"></div>

            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div 
                  key={milestone.year}
                  className={`relative flex items-start gap-8 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'} hidden md:block`}>
                    <div className={`inline-block bg-white rounded-xl p-6 shadow-md ${
                      index % 2 === 0 ? 'md:mr-8' : 'md:ml-8'
                    }`}>
                      <div className="text-indigo-600 font-bold text-lg mb-1">{milestone.year}</div>
                      <h3 className="font-semibold text-slate-900 mb-2">{milestone.title}</h3>
                      <p className="text-slate-600 text-sm">{milestone.description}</p>
                    </div>
                  </div>
                  
                  {/* Dot */}
                  <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-indigo-600 rounded-full transform -translate-x-1/2 border-4 border-white shadow"></div>
                  
                  {/* Mobile content */}
                  <div className="flex-1 md:hidden ml-12">
                    <div className="bg-white rounded-xl p-6 shadow-md">
                      <div className="text-indigo-600 font-bold text-lg mb-1">{milestone.year}</div>
                      <h3 className="font-semibold text-slate-900 mb-2">{milestone.title}</h3>
                      <p className="text-slate-600 text-sm">{milestone.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 hidden md:block"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Team */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <Users className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Meet the Team</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              The passionate individuals behind EdPsych Connect.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <motion.div
                key={member.name}
                layout
                className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition-colors ${
                  member.isFounder ? 'border-indigo-300 md:col-span-2 lg:col-span-3' : 'border-transparent hover:border-indigo-200'
                }`}
              >
                <div className={`${member.isFounder ? 'md:flex' : ''}`}>
                  <div className={`relative ${member.isFounder ? 'md:w-1/3' : ''}`}>
                    <div className={`aspect-square ${member.isFounder ? 'md:aspect-auto md:h-full' : ''} relative`}>
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover"
                        style={{ objectPosition: member.imagePosition || 'center top' }}
                        sizes={member.isFounder ? '(max-width: 768px) 100vw, 33vw' : '(max-width: 768px) 100vw, 33vw'}
                      />
                    </div>
                    {member.isFounder && (
                      <div className="absolute top-4 left-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        <Code2 className="w-3 h-3" />
                        Founder & Developer
                      </div>
                    )}
                  </div>
                  
                  <div className={`p-6 ${member.isFounder ? 'md:w-2/3 md:p-8' : ''}`}>
                    <h3 className="text-xl font-bold text-slate-900">{member.name}</h3>
                    <p className="text-indigo-600 font-medium">{member.role}</p>
                    {member.credentials && (
                      <p className="text-slate-500 text-sm mt-1">{member.credentials}</p>
                    )}
                    {member.bio && (
                      <p className={`text-slate-600 mt-4 ${member.isFounder ? '' : 'text-sm'}`}>
                        {member.bio}
                      </p>
                    )}
                    {member.isFounder && (
                      <div className="mt-6 space-y-4">
                        <div className="flex flex-wrap gap-3">
                          <a
                            href="https://www.researchgate.net/publication/369982171_What_Can_Children_and_Young_People_Tell_Us_About_School_Sanctions_and_Social_Relationships_An_Exploration_of_Exclusionary_and_Restorative_Justice_Practices"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Doctoral Thesis on ResearchGate
                          </a>
                        </div>
                        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                          <h4 className="font-semibold text-slate-900 mb-2">Available for Speaking & Consulting</h4>
                          <p className="text-slate-600 text-sm mb-3">
                            Dr Scott is available for keynote speeches, workshops, and consulting engagements 
                            on topics including AI in education, SEND assessment, restorative practices, and 
                            educational technology innovation.
                          </p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="px-2 py-1 bg-white rounded text-xs text-slate-600 border border-slate-200">
                              AI in Education
                            </span>
                            <span className="px-2 py-1 bg-white rounded text-xs text-slate-600 border border-slate-200">
                              SEND Assessment
                            </span>
                            <span className="px-2 py-1 bg-white rounded text-xs text-slate-600 border border-slate-200">
                              Restorative Practice
                            </span>
                            <span className="px-2 py-1 bg-white rounded text-xs text-slate-600 border border-slate-200">
                              EdTech Innovation
                            </span>
                            <span className="px-2 py-1 bg-white rounded text-xs text-slate-600 border border-slate-200">
                              TEAM-UP Model
                            </span>
                          </div>
                          <a
                            href="mailto:speaking@edpsychconnect.com"
                            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Enquire about speaking engagements
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Practice?</h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join the growing community of schools, Local Authorities, and educational psychologists 
            using EdPsych Connect to make a difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/beta-register"
              className="inline-flex items-center justify-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold hover:bg-indigo-50 transition-colors"
            >
              Get Started Free
              <Sparkles className="w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-white px-8 py-4 rounded-xl font-semibold border-2 border-white hover:bg-white/10 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Related Links */}
      <div className="py-8 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center gap-6 text-sm">
          <Link href="/contact" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Contact Us &gt;
          </Link>
          <Link href="/privacy" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Privacy Policy &gt;
          </Link>
          <Link href="/terms" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Terms of Service &gt;
          </Link>
          <Link href="/" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Back to Home ->
          </Link>
        </div>
      </div>
    </div>
  );
}
