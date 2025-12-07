'use client'

/**
 * Cloudinary Video Player Component
 * 
 * Enterprise-grade video player that integrates with Cloudinary CDN
 * for 99.9% uptime video delivery across all demo and production pages.
 * 
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 */

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward, Settings, Loader2, AlertCircle } from 'lucide-react';

// Import Cloudinary video URL mapping
import cloudinaryUrls from '@/../cloudinary-video-urls.json';

interface CloudinaryVideoPlayerProps {
  videoId: string;
  title?: string;
  description?: string;
  autoPlay?: boolean;
  showControls?: boolean;
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
  className?: string;
  posterTime?: number;
  enableVoiceNarration?: boolean;
}

// Direct mapping for common video IDs to Cloudinary URLs
const VIDEO_URL_MAP: Record<string, string> = cloudinaryUrls as Record<string, string>;

// Fallback URLs for specific categories
const FALLBACK_VIDEOS: Record<string, string> = {
  'intro': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1765110693/edpsych-connect/onboarding/edpsych-connect/onboarding/platform-introduction-v3.mp4',
  'training': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764768583/edpsych-connect/videos/welcome.mp4',
  'assessment': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764768608/edpsych-connect/videos/assessment.mp4',
  'coding': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764769501/edpsych-connect/videos/features.mp4',
};

function getVideoUrl(videoId: string): string | null {
  // Direct match
  if (VIDEO_URL_MAP[videoId]) {
    return VIDEO_URL_MAP[videoId];
  }
  
  // Try with module/lesson format (e.g., autism-m1-l1)
  const normalizedId = videoId.toLowerCase().replace(/\s+/g, '-');
  if (VIDEO_URL_MAP[normalizedId]) {
    return VIDEO_URL_MAP[normalizedId];
  }
  
  // Try course-specific paths
  const courseMapping: Record<string, string> = {
    'autism-m1-l1': 'autism-spectrum-support/autism-m1-l1',
    'autism-m1-l2': 'autism-spectrum-support/autism-m1-l2',
    'autism-m2-l1': 'autism-spectrum-support/autism-m2-l1',
    'autism-m2-l2': 'autism-spectrum-support/autism-m2-l2',
    'adhd-m1-l1': 'adhd-understanding-support/adhd-m1-l1',
    'adhd-m1-l2': 'adhd-understanding-support/adhd-m1-l2',
  };
  
  if (courseMapping[normalizedId] && VIDEO_URL_MAP[courseMapping[normalizedId]]) {
    return VIDEO_URL_MAP[courseMapping[normalizedId]];
  }
  
  // Category-based fallback
  if (videoId.includes('intro') || videoId.includes('welcome')) {
    return FALLBACK_VIDEOS['intro'];
  }
  if (videoId.includes('training') || videoId.includes('course')) {
    return FALLBACK_VIDEOS['training'];
  }
  if (videoId.includes('assess')) {
    return FALLBACK_VIDEOS['assessment'];
  }
  if (videoId.includes('coding') || videoId.includes('code')) {
    return FALLBACK_VIDEOS['coding'];
  }
  
  // Default fallback
  return FALLBACK_VIDEOS['intro'];
}

export default function CloudinaryVideoPlayer({
  videoId,
  title,
  description,
  autoPlay = false,
  showControls = true,
  onComplete,
  onProgress,
  className = '',
  posterTime = 2,
  enableVoiceNarration = false
}: CloudinaryVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  
  const videoUrl = getVideoUrl(videoId);
  
  // Generate poster URL from Cloudinary
  const posterUrl = videoUrl 
    ? videoUrl.replace('/upload/', `/upload/so_${posterTime},c_fill,w_1280,h_720/`).replace('.mp4', '.jpg')
    : undefined;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      const progress = (video.currentTime / video.duration) * 100;
      onProgress?.(progress);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onComplete?.();
    };

    const handleError = () => {
      setError('Failed to load video. Please try again.');
      setIsLoading(false);
    };

    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [onComplete, onProgress]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        await container.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const skipTime = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, duration));
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Voice narration for accessibility
  const _speak = (text: string) => {
    if (enableVoiceNarration && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-GB';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Caption URL derivation
  const captionUrl = videoUrl ? videoUrl.replace(/\.mp4$/, '.vtt') : null;

  if (!videoUrl) {
    return (
      <div className={`bg-slate-900 rounded-xl flex items-center justify-center aspect-video ${className}`}>
        <div className="text-center text-slate-400">
          <AlertCircle className="w-12 h-12 mx-auto mb-2" />
          <p>Video not available</p>
          <p className="text-sm text-slate-500 mt-1">ID: {videoId}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative bg-black rounded-xl overflow-hidden group ${className}`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl}
        className="w-full h-full object-contain"
        autoPlay={autoPlay}
        playsInline
        onClick={togglePlay}
        crossOrigin="anonymous"
      >
        {captionUrl && (
          <track 
            kind="captions" 
            src={captionUrl} 
            srcLang="en" 
            label="English" 
            default 
          />
        )}
      </video>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center text-white">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 text-red-500" />
            <p>{error}</p>
            <button 
              onClick={() => {
                setError(null);
                videoRef.current?.load();
              }}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Play Button Overlay (when paused) */}
      {!isPlaying && !isLoading && !error && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
          onClick={togglePlay}
        >
          <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
            <Play className="w-10 h-10 text-indigo-600 ml-1" />
          </div>
        </div>
      )}

      {/* Title/Description Overlay */}
      {title && !isPlaying && (
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent">
          <h3 className="text-white font-bold text-lg">{title}</h3>
          {description && <p className="text-white/80 text-sm mt-1">{description}</p>}
        </div>
      )}

      {/* Controls */}
      {showControls && (
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity ${
          isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
        }`}>
          {/* Progress Bar */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-white text-xs font-mono">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              aria-label="Video progress"
              title="Video progress"
              className="flex-1 h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500"
            />
            <span className="text-white text-xs font-mono">{formatTime(duration)}</span>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Skip Back */}
              <button
                onClick={() => skipTime(-10)}
                className="p-2 text-white/80 hover:text-white transition-colors"
                aria-label="Skip back 10 seconds"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="p-2 text-white hover:text-indigo-400 transition-colors"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>

              {/* Skip Forward */}
              <button
                onClick={() => skipTime(10)}
                className="p-2 text-white/80 hover:text-white transition-colors"
                aria-label="Skip forward 10 seconds"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              {/* Volume */}
              <div 
                className="relative flex items-center"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <button
                  onClick={toggleMute}
                  className="p-2 text-white/80 hover:text-white transition-colors"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                {showVolumeSlider && (
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    aria-label="Volume control"
                    title="Volume"
                    className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer ml-1"
                  />
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Playback Speed */}
              <div className="relative">
                <button
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className="p-2 text-white/80 hover:text-white transition-colors text-sm font-medium"
                  aria-label="Playback speed"
                >
                  {playbackSpeed}x
                </button>
                {showSpeedMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-slate-900 rounded-lg shadow-lg py-1 min-w-[80px]">
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                      <button
                        key={speed}
                        onClick={() => {
                          setPlaybackSpeed(speed);
                          setShowSpeedMenu(false);
                        }}
                        className={`w-full px-3 py-1 text-left text-sm hover:bg-slate-800 ${
                          playbackSpeed === speed ? 'text-indigo-400' : 'text-white'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Settings */}
              <button
                className="p-2 text-white/80 hover:text-white transition-colors"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-2 text-white/80 hover:text-white transition-colors"
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple video preview card component
export function VideoPreviewCard({
  videoId,
  title,
  duration,
  onPlay
}: {
  videoId: string;
  title: string;
  duration?: string;
  onPlay: () => void;
}) {
  const videoUrl = getVideoUrl(videoId);
  const posterUrl = videoUrl 
    ? videoUrl.replace('/upload/', '/upload/so_2,c_fill,w_400,h_225/').replace('.mp4', '.jpg')
    : undefined;

  return (
    <button
      onClick={onPlay}
      className="group relative w-full aspect-video bg-slate-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-indigo-500 transition-all"
    >
      {posterUrl && (
        <img 
          src={posterUrl} 
          alt={title}
          className="w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <Play className="w-6 h-6 text-indigo-600 ml-0.5" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
        <p className="text-white text-sm font-medium text-left truncate">{title}</p>
        {duration && <p className="text-white/70 text-xs text-left">{duration}</p>}
      </div>
    </button>
  );
}

// Export the utility function for getting video URLs
export { getVideoUrl };
