'use client';

import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function EnterpriseLanding() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);


  const testimonials = [
    {
      quote: "EdPsych Connect transformed our entire research workflow. What used to take weeks now happens in hours.",
      author: "Dr. Sarah Chen",
      role: "Director of Research",
      institution: "Stanford University",
      avatar: "/images/testimonials/sarah-chen.jpg"
    },
    {
      quote: "The AI agents are like having a team of expert research assistants available 24/7.",
      author: "Prof. Michael Rodriguez",
      role: "Department Chair",
      institution: "MIT",
      avatar: "/images/testimonials/michael-rodriguez.jpg"
    },
    {
      quote: "Our student engagement metrics improved by 340% after implementing the Battle Royale system.",
      author: "Dr. Emily Watson",
      role: "VP of Academic Innovation",
      institution: "University of Toronto",
      avatar: "/images/testimonials/emily-watson.jpg"
    }
  ];

  return (
    <>
      <Head>
        <title>EdPsych Connect | Transform Education with AI</title>
        <meta name="description" content="Save teachers 15+ hours per week while making learning addictive. AI automation, gamification, and parent engagement built for UK schools." />
      </Head>

      {/* Enhanced Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-2xl border-b border-slate-200/50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 via-primary-500 to-accent-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-105">
                  <Image
                    src="/images/logo/edpsych-logo.svg"
                    alt="EdPsych Connect"
                    width={28}
                    height={28}
                    className="filter brightness-0 invert"
                  />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">EdPsych Connect</div>
                  <div className="text-xs text-slate-500 font-medium">Enterprise Edition</div>
                </div>
              </Link>

              <div className="hidden xl:flex items-center space-x-8">
                {[
                  { href: '#platform', label: 'Platform' },
                  { href: '#solutions', label: 'Solutions' },
                  { href: '#research', label: 'Research' },
                  { href: '#security', label: 'Security' },
                  { href: '#pricing', label: 'Pricing' }
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-slate-700 hover:text-primary-600 transition-all duration-300 font-semibold relative group py-2"
                  >
                    {item.label}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-600 to-accent-600 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <Link href="/demo" className="text-slate-700 hover:text-primary-600 transition-all duration-300 font-semibold hidden lg:block">
                Book Demo
              </Link>
              <Link href="/login" className="text-slate-700 hover:text-primary-600 transition-all duration-300 font-semibold hidden md:block">
                Sign In
              </Link>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Link
                  href="/register-trial"
                  className="bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 hover:from-primary-700 hover:via-primary-600 hover:to-accent-700 text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform"
                >
                  Start Free Trial
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-primary-400/30 to-accent-400/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
              x: [0, 50, 0],
              y: [0, -30, 0]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-accent-400/20 to-primary-400/20 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
              x: [0, -70, 0],
              y: [0, 40, 0]
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column */}
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-center lg:text-left"
            >
              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex items-center justify-center lg:justify-start space-x-6 mb-8"
              >
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Trusted by 500+ Institutions</span>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  ))}
                  <span className="text-sm text-slate-600 font-medium ml-2">4.9/5 Rating</span>
                </div>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-5xl lg:text-7xl xl:text-8xl font-black mb-8 leading-tight"
              >
                Save Teachers 15+ Hours Per Week <br />
                <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 bg-clip-text text-transparent">
                  While Making Learning Addictive
                </span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-xl lg:text-2xl text-slate-600 mb-12 leading-relaxed max-w-2xl"
              >
                The only education platform that transforms teaching through AI automation, engages students with gamification, and connects parents in their native language. Built specifically for UK schools.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-6 mb-16"
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Link
                    href="/register-trial"
                    className="group bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 hover:from-primary-700 hover:via-primary-600 hover:to-accent-700 text-white font-bold py-5 px-10 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 text-center block"
                  >
                    <span className="flex items-center justify-center space-x-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="text-lg">Start Free 30-Day Trial</span>
                    </span>
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Link
                    href="/demo"
                    className="group bg-white hover:bg-slate-50 text-slate-900 font-bold py-5 px-10 rounded-2xl shadow-xl hover:shadow-2xl border-2 border-slate-200 hover:border-primary-300 transition-all duration-500 text-center block"
                  >
                    <span className="flex items-center justify-center space-x-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span className="text-lg">Watch Product Demo</span>
                    </span>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Enterprise Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="grid grid-cols-3 gap-8"
              >
                {[
                  { icon: '🔒', label: 'Enterprise Security', desc: 'SOC 2 Type II Certified' },
                  { icon: '⚡', label: 'Lightning Fast', desc: '< 100ms Response Time' },
                  { icon: '🌍', label: 'Global Scale', desc: '99.9% Uptime SLA' }
                ].map((feature) => (
                  <motion.div
                    key={feature.label}
                    className="text-center group"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                    <div className="font-bold text-slate-900 mb-1">{feature.label}</div>
                    <div className="text-sm text-slate-600">{feature.desc}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Column - Interactive Demo */}
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              className="relative"
            >
              <div className="relative">
                {/* Main Dashboard Preview */}
                <motion.div
                  className="bg-white rounded-3xl shadow-2xl border border-slate-200/50 overflow-hidden"
                  whileHover={{ y: -10, rotateY: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="bg-gradient-to-r from-primary-600 to-accent-600 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Image
                          src="/images/logo/edpsych-logo.svg"
                          alt="EdPsych Connect"
                          width={32}
                          height={32}
                          className="filter brightness-0 invert"
                        />
                        <span className="text-white font-bold text-lg">EdPsych Connect</span>
                      </div>
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                        <div className="w-3 h-3 bg-white/60 rounded-full"></div>
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="grid grid-cols-2 gap-6 mb-8">
                      <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-6 rounded-2xl">
                        <div className="text-3xl font-black text-primary-600 mb-2">537</div>
                        <div className="text-sm text-slate-600 font-medium">Active Features</div>
                      </div>
                      <div className="bg-gradient-to-br from-accent-50 to-accent-100 p-6 rounded-2xl">
                        <div className="text-3xl font-black text-accent-600 mb-2">24/7</div>
                        <div className="text-sm text-slate-600 font-medium">AI Support</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <span className="text-primary-600 font-bold">🧠</span>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">NeuroConnect Analytics</div>
                          <div className="text-sm text-slate-600">Real-time brain activity monitoring</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl">
                        <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                          <span className="text-accent-600 font-bold">🎯</span>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">Battle Royale Learning</div>
                          <div className="text-sm text-slate-600">Gamified competitive education</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Elements */}
                <motion.div
                  className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-4 border border-slate-200/50"
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="text-2xl mb-1">🚀</div>
                  <div className="text-xs font-bold text-slate-900">3.4x</div>
                  <div className="text-xs text-slate-600">Engagement</div>
                </motion.div>

                <motion.div
                  className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 border border-slate-200/50"
                  animate={{
                    y: [0, 10, 0],
                    rotate: [0, -5, 0]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="text-2xl mb-1">🔬</div>
                  <div className="text-xs font-bold text-slate-900">48%</div>
                  <div className="text-xs text-slate-600">More Research</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-8 h-14 border-2 border-slate-400 rounded-full flex justify-center cursor-pointer hover:border-primary-500 transition-colors"
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          >
            <motion.div
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-4 bg-slate-400 rounded-full mt-3"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-4">
              Trusted by Leading Institutions Worldwide
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Join universities, research institutions, and educational organizations revolutionizing education
            </p>
          </motion.div>

          {/* Logo Cloud */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center"
          >
            {[
              'Stanford', 'MIT', 'Harvard', 'Oxford', 'Cambridge', 'Berkeley',
              'Yale', 'Princeton', 'Columbia', 'UCLA', 'Toronto', 'Melbourne'
            ].map((university) => (
              <motion.div
                key={university}
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="bg-slate-100 hover:bg-slate-200 rounded-2xl p-6 transition-colors duration-300">
                  <div className="text-lg font-bold text-slate-700">{university}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-4">
              What Our Partners Say
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Real results from real institutions transforming education
            </p>
          </motion.div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 border border-slate-200/50"
              >
                <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-8 lg:space-y-0 lg:space-x-12">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center">
                      <span className="text-3xl text-white font-bold">
                        {testimonials[activeTestimonial].author.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 text-center lg:text-left">
                    <blockquote className="text-2xl lg:text-3xl font-bold text-slate-900 mb-6 leading-relaxed">
                      &ldquo;{testimonials[activeTestimonial].quote}&rdquo;
                    </blockquote>

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="font-bold text-slate-900 text-lg">{testimonials[activeTestimonial].author}</div>
                        <div className="text-slate-600">{testimonials[activeTestimonial].role}</div>
                        <div className="text-primary-600 font-medium">{testimonials[activeTestimonial].institution}</div>
                      </div>

                      <div className="flex items-center space-x-1 mt-4 lg:mt-0">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Dots */}
            <div className="flex justify-center space-x-3 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeTestimonial
                      ? 'bg-primary-600 scale-125'
                      : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-6">
              Ready to Transform Education?
            </h2>
            <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
              Join 500+ institutions already revolutionizing learning outcomes with EdPsych Connect.
              Start your free trial today.
            </p>

            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link
                href="/register-trial"
                className="inline-block bg-white text-primary-600 font-bold py-5 px-12 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 text-xl"
              >
                Start Free 30-Day Trial
              </Link>
            </motion.div>

            <p className="text-white/80 mt-6 text-sm">
              No credit card required • Full access to all features • Enterprise support included
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}