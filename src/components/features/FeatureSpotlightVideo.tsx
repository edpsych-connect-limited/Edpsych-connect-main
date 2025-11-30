'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * Feature Spotlight Video Component
 * 
 * Video Priority System for 100% Uptime:
 * 1. Local MP4 files (public/content/training_videos/marketing/)
 * 2. Cloudinary CDN (PRIMARY - verified working, optimised delivery)
 * 3. HeyGen API (fallback for video regeneration)
 * 
 * This ensures videos ALWAYS play with optimal performance.
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Shield, Users, Gamepad2, AlertCircle, Loader2 } from 'lucide-react';

/**
 * Cloudinary video URLs - PRIMARY SOURCE
 * These are hosted on Cloudinary CDN with global edge delivery
 * Cloud: dncfu2j0r | 90 videos uploaded | ~915MB total
 */
const CLOUDINARY_VIDEO_URLS: Record<string, string> = {
  // Platform Introduction (main landing page)
  '4db447c48f65403e991e37ec0be981d6': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1749900766/edpsych-connect/videos/platform-introduction.mp4',
  'platform-introduction': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1749900766/edpsych-connect/videos/platform-introduction.mp4',
  
  // Data Autonomy & Trust
  '99735ae8bf3d410fb73ee651d8fac4f7': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1749900766/edpsych-connect/videos/data-autonomy.mp4',
  'data-autonomy': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1749900766/edpsych-connect/videos/data-autonomy.mp4',
  
  // No Child Left Behind
  '70ec101b44744460a79c70cee1573bb0': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1749900766/edpsych-connect/videos/no-child-left-behind.mp4',
  'no-child-left-behind': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1749900766/edpsych-connect/videos/no-child-left-behind.mp4',
  
  // Gamification Integrity
  '810c3c4bdd644530b498f2dff546409a': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1749900766/edpsych-connect/videos/gamification-integrity.mp4',
  'gamification-integrity': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1749900766/edpsych-connect/videos/gamification-integrity.mp4',
};

/**
 * Local video paths for marketing videos (checked first for local development)
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const getIcon = () => {
    switch (icon) {
      case 'security': return <Shield className="w-6 h-6 text-blue-600" />;
      case 'differentiation': return <Users className="w-6 h-6 text-purple-600" />;
      case 'gamification': return <Gamepad2 className="w-6 h-6 text-green-600" />;
      default: return <Shield className="w-6 h-6 text-blue-600" />;
    }
  };

  // Fetch video URL when play is clicked
  const fetchVideoUrl = useCallback(async () => {
    setIsLoading(true);
    setVideoError(false);

    // 1. Try local file first (for local development)
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

    // 2. Try Cloudinary CDN (PRIMARY source for production)
    const cloudinaryUrl = CLOUDINARY_VIDEO_URLS[videoId];
    if (cloudinaryUrl) {
      try {
        const response = await fetch(cloudinaryUrl, { method: 'HEAD' });
        if (response.ok) {
          setVideoUrl(cloudinaryUrl);
          setIsLoading(false);
          return;
        }
      } catch {
        // Cloudinary failed, continue to fallback
      }
    }

    // 3. Try HeyGen API as fallback
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

    // No video available
    setVideoError(true);
    setIsLoading(false);
  }, [videoId]);

  const handleVideoError = () => {
    console.warn(`Video failed for ${videoId}`);
    setVideoError(true);
  };

  const handlePlay = () => {
    setIsPlaying(true);
    if (!videoUrl) {
      fetchVideoUrl();
    } else if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  // Auto-play when video URL is loaded
  useEffect(() => {
    if (videoUrl && isPlaying && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [videoUrl, isPlaying]);

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
          ) : isLoading ? (
            // LOADING STATE
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Loading video...</p>
              </div>
            </div>
          ) : videoUrl && !videoError ? (
            // VIDEO PLAYER
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full"
              controls
              autoPlay
              playsInline
              onError={handleVideoError}
              src={videoUrl}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            // ERROR STATE
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Video unavailable</p>
                <p className="text-slate-500 text-xs mt-1">Please try again later</p>
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
