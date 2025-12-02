'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 * 
 * See The Magic In Action - Premium Feature Video Showcase
 * Features AI-generated HeyGen videos showcasing core platform capabilities
 * UPDATED: December 2025 - Comprehensive video library with new value proposition videos
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, X, ArrowRight, Sparkles, Shield, Users, Brain, Target, Zap } from 'lucide-react';
import { VideoTutorialPlayer } from '@/components/video/VideoTutorialPlayer';

// Video configuration - maps to centralized HEYGEN_VIDEO_IDS
const SHOWCASE_VIDEOS = {
  hero: {
    id: 'value-enterprise-platform',
    title: 'EdPsych Connect World',
    subtitle: 'The UK\'s first SEND orchestration platform',
  },
  featured: [
    {
      id: 'value-edtech-problem',
      title: 'The EdTech Problem We Solve',
      description: 'Why existing tools fail schools and how orchestration changes everything.',
      icon: Target,
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      id: 'value-complete-solution',
      title: 'The Complete Solution',
      description: 'See how every component works together seamlessly.',
      icon: Sparkles,
      gradient: 'from-indigo-500 to-purple-600',
    },
    {
      id: 'feature-nclb-engine',
      title: 'No Child Left Behind Engine',
      description: 'Watch differentiation happen automatically for 40 students.',
      icon: Users,
      gradient: 'from-emerald-500 to-teal-600',
    },
  ],
  secondary: [
    {
      id: 'trust-security',
      title: 'Enterprise Security',
      description: 'NHS-level encryption and GDPR compliance built-in.',
      icon: Shield,
      gradient: 'from-slate-500 to-slate-700',
    },
    {
      id: 'feature-byod-architecture',
      title: 'BYOD Architecture',
      description: 'Your data never leaves your control.',
      icon: Brain,
      gradient: 'from-cyan-500 to-blue-600',
    },
    {
      id: 'addon-ai-power-pack',
      title: 'Intelligent Assistance',
      description: 'Experience responsive support that understands your needs.',
      icon: Zap,
      gradient: 'from-violet-500 to-purple-600',
    },
  ]
};

export default function VideoPremiereSection() {
  const [activeVideo, setActiveVideo] = useState<{ id: string; title: string } | null>(null);

  return (
    <section className="py-24 bg-slate-900 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-centre mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-centre gap-2 px-4 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-300 text-sm font-medium mb-4"
          >
            <Play className="w-4 h-4" />
            Video Showcase
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-4"
          >
            See The Magic In Action
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg max-w-2xl mx-auto"
          >
            Discover how our platform transforms SEND provision through guided demonstrations of our core features.
          </motion.p>
        </div>

        {/* Hero Video */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-2xl font-bold">{SHOWCASE_VIDEOS.hero.title}</h3>
              <p className="text-slate-400 mt-1">{SHOWCASE_VIDEOS.hero.subtitle}</p>
            </div>
            <div className="aspect-video">
              <VideoTutorialPlayer
                videoKey={SHOWCASE_VIDEOS.hero.id}
                title={SHOWCASE_VIDEOS.hero.title}
                autoPlay={false}
                className="w-full h-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Featured Videos - Primary Row */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-6 flex items-centre gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Featured Demonstrations
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {SHOWCASE_VIDEOS.featured.map((video, idx) => {
              const Icon = video.icon;
              return (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 hover:border-indigo-500 transition-all cursor-pointer"
                  onClick={() => setActiveVideo({ id: video.id, title: video.title })}
                >
                  <div className={`aspect-video bg-gradient-to-br ${video.gradient} relative`}>
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute inset-0 flex items-centre justify-centre">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-centre justify-centre border border-white/30 group-hover:scale-110 group-hover:bg-white/30 transition-all shadow-lg">
                        <Play className="w-8 h-8 text-white fill-white ml-1" />
                      </div>
                    </div>
                    <div className="absolute top-3 left-3 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-centre justify-centre">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs font-medium text-white/80">
                      ▶️ Video Guide
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="font-bold text-lg mb-2">{video.title}</h4>
                    <p className="text-slate-400 text-sm mb-4">{video.description}</p>
                    <div className="flex items-centre gap-2 text-sm text-indigo-400 font-medium group-hover:text-indigo-300">
                      Watch Now <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Secondary Videos - Additional Row */}
        <div>
          <h3 className="text-xl font-semibold mb-6 flex items-centre gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            Deep Dives
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {SHOWCASE_VIDEOS.secondary.map((video, idx) => {
              const Icon = video.icon;
              return (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 + 0.3 }}
                  className="group relative rounded-2xl overflow-hidden bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all cursor-pointer"
                  onClick={() => setActiveVideo({ id: video.id, title: video.title })}
                >
                  <div className={`aspect-video bg-gradient-to-br ${video.gradient} relative`}>
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                    <div className="absolute inset-0 flex items-centre justify-centre">
                      <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-full flex items-centre justify-centre border border-white/20 group-hover:scale-110 transition-all">
                        <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute top-3 left-3 w-8 h-8 bg-white/15 backdrop-blur-sm rounded-lg flex items-centre justify-centre">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="p-5">
                    <h4 className="font-semibold text-base mb-1">{video.title}</h4>
                    <p className="text-slate-400 text-sm">{video.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-centre"
        >
          <a
            href="/pricing"
            className="inline-flex items-centre gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            Explore All Pricing Videos
            <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>
      </div>

      {/* Video Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-centre justify-centre bg-black/90 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-5xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
            <div className="flex items-centre justify-between p-4 border-b border-slate-800">
              <h3 className="text-lg font-semibold">{activeVideo.title}</h3>
              <button 
                onClick={() => setActiveVideo(null)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Close video"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video">
              <VideoTutorialPlayer
                videoKey={activeVideo.id}
                title={activeVideo.title}
                autoPlay={true}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
