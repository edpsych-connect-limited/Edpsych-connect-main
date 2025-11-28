'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, X } from 'lucide-react';

export default function VideoPremiereSection() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const videos = [
    {
      id: 'demo-1',
      title: "Data Autonomy & Trust",
      description: "See how we protect sensitive student data with NHS-level encryption.",
      thumbnailColor: "bg-indigo-100",
      iconColor: "text-blue-600",
      videoUrl: "/content/training_videos/ehcp-mastery/ehcp-m1-l1.mp4"
    },
    {
      id: 'demo-2',
      title: "No Child Left Behind",
      description: "Watch our orchestration engine differentiate lessons for 40 students instantly.",
      thumbnailColor: "bg-amber-100",
      iconColor: "text-purple-600",
      videoUrl: "/content/training_videos/send-fundamentals/send-fund-m1-l1.mp4"
    },
    {
      id: 'demo-3',
      title: "Gamification Integrity",
      description: "Experience how we make assessments engaging without compromising validity.",
      thumbnailColor: "bg-green-100",
      iconColor: "text-emerald-600",
      videoUrl: "/content/training_videos/assessment-essentials/assess-m1-l1.mp4"
    }
  ];

  return (
    <section className="py-24 bg-slate-900 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            See The Magic In Action
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 max-w-2xl mx-auto"
          >
            Explore our comprehensive video library demonstrating the power of the platform.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {videos.map((video, idx) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group relative rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 hover:border-indigo-500 transition-all cursor-pointer"
              onClick={() => setActiveVideo(video.videoUrl)}
            >
              <div className={`aspect-video ${video.thumbnailColor} relative opacity-50 group-hover:opacity-70 transition-opacity`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg mb-2">{video.title}</h3>
                <p className="text-slate-400 text-sm mb-4">{video.description}</p>
                <div className="flex items-center gap-2 text-sm text-indigo-400 font-medium group-hover:text-indigo-300">
                  Watch Now <Play className="w-3 h-3" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
            <button 
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              aria-label="Close video"
            >
              <X className="w-6 h-6" />
            </button>
            <video 
              src={activeVideo} 
              controls 
              autoPlay 
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </section>
  );
}

