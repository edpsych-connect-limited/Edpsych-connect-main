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
 * UPDATED: Uses HeyGen API with local file fallback for maximum reliability
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, X, Loader2 } from 'lucide-react';

// Local video paths - for local development/testing (not deployed to Vercel)
const LOCAL_VIDEO_PATHS: Record<string, string> = {
  'data-autonomy': '/content/training_videos/marketing/data-autonomy.mp4',
  'no-child-left-behind': '/content/training_videos/marketing/no-child-left-behind.mp4',
  'gamification-integrity': '/content/training_videos/marketing/gamification-integrity.mp4',
};

// HeyGen video IDs - primary source for production
const HEYGEN_VIDEO_IDS: Record<string, string> = {
  'data-autonomy': '99735ae8bf3d410fb73ee651d8fac4f7',
  'no-child-left-behind': '70ec101b44744460a79c70cee1573bb0',
  'gamification-integrity': '810c3c4bdd644530b498f2dff546409a',
};

// Cloudinary URLs - PRIMARY CDN (99.9% SLA)
const CLOUDINARY_VIDEO_URLS: Record<string, string> = {
  'data-autonomy': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533766/edpsych-connect/videos/data-autonomy.mp4',
  'no-child-left-behind': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533789/edpsych-connect/videos/no-child-left-behind.mp4',
  'gamification-integrity': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533803/edpsych-connect/videos/gamification-integrity.mp4',
};

export default function VideoPremiereSection() {
  const [activeVideo, setActiveVideo] = useState<{ id: string; title: string } | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch video URL when modal opens - Cloudinary is PRIMARY
  const fetchVideoUrl = useCallback(async (videoId: string) => {
    setIsLoading(true);
    setVideoUrl(null);

    // 1. Try local file first (for development)
    const localPath = LOCAL_VIDEO_PATHS[videoId];
    if (localPath) {
      try {
        const response = await fetch(localPath, { method: 'HEAD' });
        if (response.ok) {
          setVideoUrl(localPath);
          setIsLoading(false);
          return;
        }
      } catch {
        // Local file doesn't exist, continue
      }
    }

    // 2. Try Cloudinary CDN (PRIMARY for production)
    const cloudinaryUrl = CLOUDINARY_VIDEO_URLS[videoId];
    if (cloudinaryUrl) {
      setVideoUrl(cloudinaryUrl);
      setIsLoading(false);
      return;
    }

    // 3. Fallback to HeyGen API
    const heygenId = HEYGEN_VIDEO_IDS[videoId];
    if (heygenId) {
      try {
        const response = await fetch(`/api/video/heygen-url?key=${videoId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.url) {
            setVideoUrl(data.url);
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // HeyGen API failed
      }
    }

    // No video available
    setIsLoading(false);
  }, []);

  // Fetch video when modal opens
  useEffect(() => {
    if (activeVideo) {
      fetchVideoUrl(activeVideo.id);
    }
  }, [activeVideo, fetchVideoUrl]);

  const videos = [
    {
      id: 'data-autonomy',
      title: "Data Autonomy & Trust",
      description: "See how we protect sensitive student data with NHS-level encryption and BYOD architecture.",
      thumbnailColor: "bg-gradient-to-br from-indigo-500 to-blue-600",
    },
    {
      id: 'no-child-left-behind',
      title: "No Child Left Behind",
      description: "Watch our orchestration engine differentiate lessons for 40 students instantly.",
      thumbnailColor: "bg-gradient-to-br from-amber-500 to-orange-600",
    },
    {
      id: 'gamification-integrity',
      title: "Gamification Integrity",
      description: "Experience how we make assessments engaging without compromising validity.",
      thumbnailColor: "bg-gradient-to-br from-emerald-500 to-green-600",
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
            Experience our AI-powered platform through these short demonstrations of core capabilities.
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
              onClick={() => setActiveVideo({ id: video.id, title: video.title })}
            >
              <div className={`aspect-video ${video.thumbnailColor} relative`}>
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 group-hover:bg-white/30 transition-all shadow-lg">
                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                  </div>
                </div>
                {/* AI Avatar badge */}
                <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs font-medium text-white/80">
                  🤖 AI Presenter
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

      {/* Video Modal - Using HeyGen API with local fallback */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
            <button 
              onClick={() => {
                setActiveVideo(null);
                setVideoUrl(null);
              }}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              aria-label="Close video"
            >
              <X className="w-6 h-6" />
            </button>
            
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mx-auto mb-3" />
                  <p className="text-slate-400">Loading video...</p>
                </div>
              </div>
            ) : videoUrl ? (
              <video
                src={videoUrl}
                className="w-full h-full object-contain"
                controls
                autoPlay
                controlsList="nodownload"
                playsInline
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-slate-400">Video unavailable</p>
                  <p className="text-sm text-slate-500 mt-2">Please try again later</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
