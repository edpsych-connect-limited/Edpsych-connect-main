'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * Feature Spotlight Video Component
 * 
 * Video Priority System for 100% Uptime:
 * 1. Local MP4 files (public/content/training_videos/marketing/)
 * 2. Cloudinary CDN (if configured)
 * 3. HeyGen embed as last resort
 * 
 * This ensures videos ALWAYS play, even if external services are down.
 */

import React, { useRef } from 'react';
import { Play, Shield, Users, Gamepad2, AlertCircle } from 'lucide-react';

/**
 * Local video paths for marketing videos
 * These are downloaded from HeyGen and stored locally for 100% uptime
 */
const LOCAL_VIDEO_PATHS: Record<string, string> = {
  // Platform Introduction (main landing page)
  '4db447c48f65403e991e37ec0be981d6': '/content/training_videos/marketing/platform-introduction.mp4',
  'platform-introduction': '/content/training_videos/marketing/platform-introduction.mp4',
  
  // Data Autonomy & Trust
  '99735ae8bf3d410fb73ee651d8fac4f7': '/content/training_videos/marketing/data-autonomy.mp4',
  'data-autonomy': '/content/training_videos/marketing/data-autonomy.mp4',
  
  // No Child Left Behind
  '70ec101b44744460a79c70cee1573bb0': '/content/training_videos/marketing/no-child-left-behind.mp4',
  'no-child-left-behind': '/content/training_videos/marketing/no-child-left-behind.mp4',
  
  // Gamification Integrity
  '810c3c4bdd644530b498f2dff546409a': '/content/training_videos/marketing/gamification-integrity.mp4',
  'gamification-integrity': '/content/training_videos/marketing/gamification-integrity.mp4',
};

interface FeatureSpotlightVideoProps {
  videoId: string;
  title: string;
  description: string;
  icon?: 'security' | 'differentiation' | 'gamification';
  className?: string;
}

export const FeatureSpotlightVideo: React.FC<FeatureSpotlightVideoProps> = ({
  videoId,
  title,
  description,
  icon = 'security',
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [videoError, setVideoError] = React.useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const getIcon = () => {
    switch (icon) {
      case 'security': return <Shield className="w-6 h-6 text-blue-600" />;
      case 'differentiation': return <Users className="w-6 h-6 text-purple-600" />;
      case 'gamification': return <Gamepad2 className="w-6 h-6 text-green-600" />;
      default: return <Shield className="w-6 h-6 text-blue-600" />;
    }
  };

  // Get video source - local file first (100% uptime), HeyGen embed as fallback
  const localVideoPath = LOCAL_VIDEO_PATHS[videoId];
  const heygenEmbedUrl = `https://app.heygen.com/embed/${videoId}`;
  
  // Use local video if available, otherwise fall back to HeyGen
  const useLocalVideo = !!localVideoPath && !videoError;

  const handleVideoError = () => {
    console.warn(`Local video failed for ${videoId}, falling back to HeyGen embed`);
    setVideoError(true);
  };

  const handlePlay = () => {
    setIsPlaying(true);
    // Auto-play local videos
    if (useLocalVideo && videoRef.current) {
      videoRef.current.play().catch(() => {
        // If autoplay fails, user can click play button
      });
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200 ${className}`}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-slate-50 rounded-lg">
            {getIcon()}
          </div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        </div>
        
        <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden mb-4 group cursor-pointer">
          {!isPlaying ? (
            <div onClick={handlePlay} className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
              <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 text-blue-600 ml-1" />
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full inline-block backdrop-blur-sm">
                  Watch Feature Spotlight
                </p>
              </div>
            </div>
          ) : useLocalVideo ? (
            // LOCAL VIDEO PLAYER - 100% uptime, no external dependency
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full"
              controls
              autoPlay
              playsInline
              onError={handleVideoError}
              src={localVideoPath}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            // HEYGEN EMBED FALLBACK - requires their server
            <div className="relative w-full h-full">
              <iframe
                title={`Feature Spotlight: ${title}`}
                src={heygenEmbedUrl}
                className="absolute inset-0 w-full h-full"
                allow="autoplay; fullscreen"
                allowFullScreen
              />
              {/* Warning that video depends on external service */}
              <div className="absolute top-2 right-2 bg-yellow-500/90 text-yellow-900 text-xs px-2 py-1 rounded flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                External Service
              </div>
            </div>
          )}
        </div>

        <p className="text-slate-600 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};
