'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * Universal Video Tutorial Player Component
 * 
 * Video Priority System for 100% Uptime:
 * 1. Local MP4 files (public/content/training_videos/) - Most reliable, no external dependency
 * 2. HeyGen embed as fallback - For videos not yet downloaded locally
 * 
 * Used across Help Centre, Parent Portal, LA Dashboard, and all tutorial contexts.
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Play, AlertCircle, CheckCircle, Clock, X, Loader2 } from 'lucide-react';
import { HEYGEN_VIDEO_IDS, LOCAL_VIDEO_PATHS } from '@/lib/training/heygen-video-urls';

// Note: Cloudinary URLs removed - all videos are served locally from public/content/training_videos/
// Local serving is more reliable and doesn't depend on external CDN

export interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  duration?: string;
  category?: string;
  tags?: string[];
}

interface VideoTutorialPlayerProps {
  videoKey: string; // Key from HEYGEN_VIDEO_IDS (e.g., 'help-getting-started')
  title: string;
  description?: string;
  duration?: string;
  onComplete?: () => void;
  autoPlay?: boolean;
  showProgress?: boolean;
  className?: string;
  compact?: boolean;
}

export const VideoTutorialPlayer: React.FC<VideoTutorialPlayerProps> = ({
  videoKey,
  title,
  description,
  duration,
  onComplete,
  autoPlay = false,
  showProgress: _showProgress = true, // Keep for API compatibility
  className = '',
  compact = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [_isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(autoPlay);
  const [_progress, setProgress] = useState(0); // Track for completion detection
  const [isComplete, setIsComplete] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoSource, setVideoSource] = useState<'loading' | 'local' | 'heygen' | 'error'>('loading');
  const [_errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch video URL with priority: Local MP4 > HeyGen Embed
  // Local files are served directly by Next.js from public/ - most reliable!
  useEffect(() => {
    function findVideoSource() {
      // 1. Try local file FIRST (these are in public/content/training_videos/)
      // No HEAD request needed - just use the path directly, video element handles errors
      const localPath = LOCAL_VIDEO_PATHS[videoKey];
      if (localPath) {
        setVideoUrl(localPath);
        setVideoSource('local');
        return;
      }

      // 2. Fallback to HeyGen embed URL (for videos not yet downloaded locally)
      const heygenId = HEYGEN_VIDEO_IDS[videoKey];
      if (heygenId) {
        // Use HeyGen embed directly - more reliable than API
        setVideoUrl(`https://app.heygen.com/embed/${heygenId}`);
        setVideoSource('heygen');
        return;
      }

      // No video source available
      setVideoSource('error');
      setErrorMessage('Video not available');
    }

    findVideoSource();
  }, [videoKey]);

  const hasVideo = videoSource !== 'error' && videoSource !== 'loading';

  const handleVideoError = useCallback(() => {
    console.warn(`Video failed for ${videoKey}`);
    setVideoSource('error');
    setErrorMessage('Failed to load video');
  }, [videoKey]);

  const handlePlay = useCallback(() => {
    setHasStarted(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(currentProgress);
    
    if (currentProgress >= 95 && !isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [isComplete, onComplete]);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setIsComplete(true);
    onComplete?.();
  }, [onComplete]);

  // Loading state
  if (videoSource === 'loading') {
    return (
      <div className={`bg-slate-900 rounded-xl flex items-center justify-center aspect-video ${className}`}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-400">Loading video...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!hasVideo || !videoUrl) {
    return (
      <div className={`bg-slate-100 rounded-xl p-6 text-center aspect-video flex items-center justify-center ${className}`}>
        <div>
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <p className="text-slate-700 font-medium">Video not available</p>
          <p className="text-sm text-slate-500 mt-1">Key: {videoKey}</p>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`bg-white rounded-lg border border-slate-200 overflow-hidden ${className}`}>
        <div className="relative aspect-video bg-slate-900">
          {!hasStarted ? (
            <button
              onClick={handlePlay}
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-900/80 to-purple-900/80 group"
              aria-label={`Play ${title}`}
            >
              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 text-indigo-600 ml-0.5" />
              </div>
            </button>
          ) : (
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full"
              controls
              autoPlay
              playsInline
              onError={handleVideoError}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
              src={videoUrl}
            />
          )}
        </div>
        <div className="p-3">
          <h4 className="font-medium text-slate-900 text-sm line-clamp-1">{title}</h4>
          {duration && (
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
              <Clock className="w-3 h-3" />
              {duration}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200 ${className}`}>
      {/* Video Container */}
      <div className="relative aspect-video bg-slate-900">
        {!hasStarted ? (
          <button
            onClick={handlePlay}
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-900/80 to-purple-900/80 group"
            aria-label={`Play ${title}`}
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform mx-auto mb-4">
                <Play className="w-8 h-8 text-indigo-600 ml-1" />
              </div>
              <p className="text-white font-medium text-lg">{title}</p>
              {duration && (
                <p className="text-white/70 text-sm mt-1 flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4" /> {duration}
                </p>
              )}
            </div>
          </button>
        ) : (
          <>
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full"
              autoPlay
              playsInline
              controls
              onError={handleVideoError}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
              src={videoUrl || undefined}
            />
            {/* Video Source Indicator */}
            {videoSource === 'heygen' && (
              <div className="absolute top-2 right-2 bg-yellow-500/90 text-yellow-900 text-xs px-2 py-1 rounded flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                External
              </div>
            )}
            {/* Completion badge overlay */}
            {isComplete && (
              <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Complete
              </div>
            )}
          </>
        )}
      </div>

      {/* Info Section */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            {description && (
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">{description}</p>
            )}
            {/* Source indicator */}
            <p className="text-xs text-slate-400 mt-2">
              Source: {videoSource === 'local' ? 'Local' : 'HeyGen'}
            </p>
          </div>
          {isComplete && (
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Video Modal for popup viewing
interface VideoModalProps {
  videoKey: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  videoKey: _videoKey,
  title,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          aria-label="Close video modal"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        {/* Using videoKey for VideoTutorialPlayer */}
        <VideoTutorialPlayer
          videoKey={_videoKey}
          title={title}
          autoPlay
        />
      </div>
    </div>
  );
};

// Video Thumbnail Card for grids
interface VideoThumbnailProps {
  videoKey: string;
  title: string;
  description?: string;
  duration?: string;
  onClick?: () => void;
  isWatched?: boolean;
}

export const VideoThumbnail: React.FC<VideoThumbnailProps> = ({
  videoKey: _videoKey,
  title,
  description,
  duration,
  onClick,
  isWatched = false,
}) => {
  // videoKey available via _videoKey for future use (e.g., analytics, tracking)
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-indigo-300 hover:shadow-lg transition-all text-left group w-full"
    >
      <div className="relative aspect-video bg-gradient-to-br from-indigo-900 to-purple-900">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 text-indigo-600 ml-0.5" />
          </div>
        </div>
        {duration && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {duration}
          </div>
        )}
        {isWatched && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Watched
          </div>
        )}
      </div>
      <div className="p-4">
        <h4 className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-2">
          {title}
        </h4>
        {description && (
          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{description}</p>
        )}
      </div>
    </button>
  );
};

export default VideoTutorialPlayer;
