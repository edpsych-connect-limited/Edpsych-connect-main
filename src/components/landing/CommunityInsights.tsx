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
import { Users, Heart, MessageCircle, ArrowRight, BookOpen } from 'lucide-react';

export default function CommunityInsights() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 text-rose-800 text-sm font-semibold mb-6"
          >
            <Heart className="w-4 h-4" />
            Support For Everyone
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold text-slate-900 mb-6"
          >
            Empowering the Whole <span className="text-rose-600">Village</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-600 max-w-3xl mx-auto"
          >
            It takes a village to raise a child. We provide dedicated resources for every member of that village.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Parents */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 hover:border-rose-200 transition-colors"
          >
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mb-6">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">For Parents</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Demystify the SEND process. Access plain-English guides on EHCPs, 
              home support strategies, and how to advocate for your child effectively.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-slate-700 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-3" />
                Parent Advocacy Guides
              </li>
              <li className="flex items-center text-slate-700 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-3" />
                Home Learning Strategies
              </li>
              <li className="flex items-center text-slate-700 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-3" />
                Jargon Buster
              </li>
            </ul>
            <Link href="/parents" className="text-rose-600 font-semibold flex items-center hover:text-rose-700">
              Visit Parent Hub <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </motion.div>

          {/* Teachers */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 hover:border-indigo-200 transition-colors"
          >
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">For Teachers</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Reclaim your evenings. Get instant differentiation, automated paperwork, 
              and classroom strategies that actually work without the burnout.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-slate-700 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-3" />
                3-Minute Differentiation
              </li>
              <li className="flex items-center text-slate-700 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-3" />
                Classroom Management Tools
              </li>
              <li className="flex items-center text-slate-700 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-3" />
                CPD Micro-Learning
              </li>
            </ul>
            <Link href="/teachers" className="text-indigo-600 font-semibold flex items-center hover:text-indigo-700">
              Teacher Resources <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </motion.div>

          {/* Community */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 hover:border-purple-200 transition-colors"
          >
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Community Blog</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Latest insights from the world of Educational Psychology, policy updates, 
              and success stories from schools across the UK.
            </p>
            <div className="space-y-4 mb-8">
              <div className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                <div className="text-xs text-slate-500 mb-1">New Article</div>
                <div className="font-semibold text-slate-900 text-sm">Navigating the 2025 SEND Reforms</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                <div className="text-xs text-slate-500 mb-1">Case Study</div>
                <div className="font-semibold text-slate-900 text-sm">How St Mary&apos;s Reduced Exclusions by 80%</div>
              </div>
            </div>
            <Link href="/blog" className="text-purple-600 font-semibold flex items-center hover:text-purple-700">
              Read the Blog <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}