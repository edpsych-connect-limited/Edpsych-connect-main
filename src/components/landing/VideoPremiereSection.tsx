'use client';

import { motion } from 'framer-motion';
import { Clock, Lock } from 'lucide-react';

export default function VideoPremiereSection() {
  const videos = [
    {
      title: "The Differentiation Engine",
      duration: "3:45",
      status: "Coming Soon",
      imageColor: "bg-indigo-100"
    },
    {
      title: "Battle Royale: Deep Dive",
      duration: "4:20",
      status: "Coming Soon",
      imageColor: "bg-amber-100"
    },
    {
      title: "EHCP Automation Workflow",
      duration: "5:10",
      status: "Coming Soon",
      imageColor: "bg-green-100"
    }
  ];

  return (
    <section className="py-24 bg-slate-900 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">See The Magic In Action</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Our comprehensive video library is in production. Join the waitlist to be notified when the premiere drops.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {videos.map((video, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group relative rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 hover:border-indigo-500 transition-all"
            >
              {/* Thumbnail Placeholder */}
              <div className={`aspect-video ${video.imageColor} relative opacity-50 group-hover:opacity-70 transition-opacity`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg group-hover:text-indigo-400 transition-colors">{video.title}</h3>
                  <span className="text-xs font-mono bg-slate-900 px-2 py-1 rounded text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {video.duration}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-indigo-400 font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                  {video.status}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <button className="px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-indigo-50 transition-colors">
            Join Premiere Waitlist
          </button>
        </div>
      </div>
    </section>
  );
}
