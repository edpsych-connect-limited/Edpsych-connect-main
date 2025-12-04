'use client'

/**
 * EHCP Module Video Introduction Component
 * Reusable component for displaying training videos on EHCP module pages
 * 
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 */

import React, { useState } from 'react';
import { Play, X } from 'lucide-react';
import { VideoTutorialPlayer } from '@/components/video/VideoTutorialPlayer';

interface EHCPModuleVideoIntroProps {
  videoKey: string;
  title: string;
  description: string;
  duration?: string;
  gradient?: string;
}

export function EHCPModuleVideoIntro({
  videoKey,
  title,
  description,
  duration = '3-4 min',
  gradient = 'from-blue-600 to-indigo-600'
}: EHCPModuleVideoIntroProps) {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <>
      {/* Video Introduction Banner */}
      <div className={`bg-gradient-to-r ${gradient} rounded-xl shadow-lg overflow-hidden mb-6`}>
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-white/90 text-sm font-medium mb-2">
                <Play className="w-3 h-3" />
                Video Training
              </div>
              <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
              <p className="text-white/80 text-sm mb-3">{description}</p>
              <button
                onClick={() => setShowVideo(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-900 font-semibold rounded-lg hover:bg-white/90 transition text-sm"
              >
                <Play className="w-4 h-4 fill-current" />
                Watch Now
              </button>
            </div>
            <div 
              className="relative w-full md:w-48 aspect-video bg-black/20 rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => setShowVideo(true)}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition">
                  <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                </div>
              </div>
              <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded text-xs text-white">
                {duration}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <button 
                onClick={() => setShowVideo(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-white"
                aria-label="Close video"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video">
              <VideoTutorialPlayer
                videoKey={videoKey}
                title={title}
                autoPlay={true}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default EHCPModuleVideoIntro;
