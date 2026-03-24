'use client';

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 *
 * Landing page video section — 3 focused videos matching the updated narrative.
 * Scripts: docs/video-scripts/landing-video-scripts.md
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Brain, FileText, Target, X } from 'lucide-react';
import { VideoTutorialPlayer } from '@/components/video/VideoTutorialPlayer';

const LANDING_VIDEOS = [
  {
    key: 'landing-platform-overview',
    title: 'Why I Built EdPsych Connect',
    subtitle: 'Dr Scott Ighavongbe-Patrick, Chartered EP',
    description: 'The problem every EP, SENCO, and school leader recognises — and the platform built to solve it from the inside.',
    icon: Brain,
    accent: 'from-indigo-500 to-purple-600',
    accentLight: 'bg-indigo-500/10',
    accentText: 'text-indigo-400',
    duration: '90 sec',
  },
  {
    key: 'landing-ehcp-workflow',
    title: 'EHCP Made Manageable',
    subtitle: 'Statutory workflow, built in',
    description: 'From EHC needs assessment request to finalised plan — statutory deadlines tracked, multi-agency contributions coordinated, compliant export ready.',
    icon: FileText,
    accent: 'from-cyan-500 to-blue-600',
    accentLight: 'bg-cyan-500/10',
    accentText: 'text-cyan-400',
    duration: '100 sec',
  },
  {
    key: 'landing-intervention-engine',
    title: 'Interventions That Stay Connected',
    subtitle: 'Assessment → plan → review → report',
    description: "Every intervention linked to the assessment that informed it. Goals, frequency, reviews, outcomes — one traceable thread from EP visit to annual review.",
    icon: Target,
    accent: 'from-amber-500 to-orange-600',
    accentLight: 'bg-amber-500/10',
    accentText: 'text-amber-400',
    duration: '100 sec',
  },
];

export default function VideoPremiereSection() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const activeConfig = LANDING_VIDEOS.find((v) => v.key === activeVideo);

  return (
    <section className="py-24 bg-slate-900 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-300 text-sm font-medium mb-6"
          >
            <Play className="w-4 h-4" />
            <span>See It In Action</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Hear it from the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              EP who built it
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto"
          >
            Three short videos. The problem, the workflow, and the clinical core — explained by a practising Chartered Educational Psychologist.
          </motion.p>
        </div>

        {/* Video cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {LANDING_VIDEOS.map((video, index) => {
            const Icon = video.icon;
            return (
              <motion.div
                key={video.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-slate-800/60 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/10"
                onClick={() => setActiveVideo(video.key)}
              >
                {/* Gradient top bar */}
                <div className={`h-1 w-full bg-gradient-to-r ${video.accent}`} />

                <div className="p-6">
                  {/* Icon + duration */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl ${video.accentLight} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${video.accentText}`} />
                    </div>
                    <span className="text-xs text-slate-500 font-mono">{video.duration}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">
                    {video.title}
                  </h3>
                  <p className={`text-xs font-medium mb-3 ${video.accentText}`}>{video.subtitle}</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{video.description}</p>

                  {/* Play button */}
                  <div className="mt-5 flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${video.accent} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <Play className="w-3.5 h-3.5 text-white ml-0.5" fill="white" />
                    </div>
                    <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                      Watch now
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Attribution */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-4 pt-2"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-500/30 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/dr-scott-landing.jpg" alt="Dr Scott Ighavongbe-Patrick" className="w-full h-full object-cover" />
          </div>
          <p className="text-sm text-slate-400">
            <span className="text-white font-medium">Dr Scott Ighavongbe-Patrick</span>
            {' '}· Chartered Educational Psychologist · HCPC PYL042340 · Founder, EdPsych Connect
          </p>
        </motion.div>
      </div>

      {/* Video modal */}
      {activeVideo && activeConfig && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setActiveVideo(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-3xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-white">{activeConfig.title}</h3>
                <p className={`text-xs ${activeConfig.accentText}`}>{activeConfig.subtitle}</p>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="aspect-video w-full bg-slate-950">
              <VideoTutorialPlayer
                videoKey={activeVideo}
                title={activeConfig.title}
                autoPlay={true}
              />
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}
