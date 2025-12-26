'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * Universal Video Tutorial Player Component
 * 
 * Video Priority System (canonical):
 * 1) Live demo recordings (real platform operations) when available
 * 2) Cloudinary CDN (primary delivery)
 * 3) Local MP4 (development/offline fallback)
 * 4) HeyGen embed (last-resort fallback)
 * 
 * Used across Help Centre, Parent Portal, LA Dashboard, and all tutorial contexts.
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Play, AlertCircle, CheckCircle, Clock, X, Loader2 } from 'lucide-react';
import { VIDEO_OVERLAYS, getVideoSourceCandidates, type VideoSourceCandidate, type VideoSourceType } from '@/lib/training/heygen-video-urls';

function toPlayerSource(t: VideoSourceType): 'live' | 'cdn' | 'local' | 'heygen' {
  switch (t) {
    case 'live':
      return 'live';
    case 'cloudinary':
      return 'cdn';
    case 'local':
      return 'local';
    case 'heygen':
      return 'heygen';
  }
}

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
  const [videoSource, setVideoSource] = useState<'loading' | 'live' | 'cdn' | 'local' | 'heygen' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<VideoSourceCandidate[]>([]);
  const [candidateIndex, setCandidateIndex] = useState(0);

  const overlayImage = VIDEO_OVERLAYS[videoKey];
  const captionsSrc = `/api/video/captions?key=${encodeURIComponent(videoKey)}`;

  const applyCandidate = useCallback((nextIndex: number, list: VideoSourceCandidate[]) => {
    const next = list[nextIndex];

    if (!next) {
      setVideoSource('error');
      setErrorMessage('Video not available');
      setVideoUrl(null);
      return;
    }

    setCandidateIndex(nextIndex);
    setVideoUrl(next.url);
    setVideoSource(toPlayerSource(next.type));
    setErrorMessage(null);
  }, []);

  // Resolve candidates (canonical priority) and select the first one.
  useEffect(() => {
    setVideoSource('loading');
    const nextCandidates = getVideoSourceCandidates(videoKey);
    setCandidates(nextCandidates);
    applyCandidate(0, nextCandidates);
  }, [applyCandidate, videoKey]);

  const handleRetry = useCallback(() => {
    setIsComplete(false);
    setProgress(0);
    setHasStarted(autoPlay);
    setVideoSource('loading');

    const nextCandidates = getVideoSourceCandidates(videoKey);
    setCandidates(nextCandidates);
    applyCandidate(0, nextCandidates);
  }, [applyCandidate, autoPlay, videoKey]);

  const hasVideo = videoSource !== 'error' && videoSource !== 'loading';

  const handleVideoError = useCallback(() => {
    // Self-healing: fall back to the next candidate automatically.
    const current = candidates[candidateIndex];
    const nextIndex = candidateIndex + 1;
    const next = candidates[nextIndex];

    const currentLabel = current ? `${current.type} (${current.kind})` : 'unknown';
    const nextLabel = next ? `${next.type} (${next.kind})` : 'none';
    console.warn(`Video failed for ${videoKey}. Current=${currentLabel}. Next=${nextLabel}`);

    if (next) {
      applyCandidate(nextIndex, candidates);
      return;
    }

    setVideoSource('error');
    // If HeyGen was the last resort, try to fetch a human-readable error message.
    // (e.g. missing HEYGEN_API_KEY in production returns 503 JSON.)
    if (current?.type === 'heygen') {
      void (async () => {
        try {
          const diagnosticUrl = `/api/video/heygen-url?key=${encodeURIComponent(videoKey)}`;
          const res = await fetch(diagnosticUrl, { method: 'GET' });
          const data = await res.json().catch(() => null);
          const message =
            (data && typeof data === 'object' && 'error' in data && typeof (data as any).error === 'string')
              ? (data as any).error
              : 'Failed to load video';
          setErrorMessage(message);
        } catch {
          setErrorMessage('Failed to load video');
        }
      })();
    } else {
      setErrorMessage('Failed to load video');
    }
  }, [applyCandidate, candidateIndex, candidates, videoKey]);

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
      <div
        className={`bg-slate-900 rounded-xl flex items-center justify-center aspect-video ${className}`}
        data-testid="video-tutorial-player"
        data-video-key={videoKey}
        data-video-state="loading"
        data-video-source="loading"
      >
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
      <div
        className={`bg-slate-100 rounded-xl p-6 text-center aspect-video flex items-center justify-center ${className}`}
        data-testid="video-tutorial-player"
        data-video-key={videoKey}
        data-video-state="error"
        data-video-source="error"
      >
        {overlayImage ? (
          <div className="w-full h-full relative rounded-lg overflow-hidden border border-slate-200 bg-white">
            <img
              src={overlayImage}
              alt="Walkthrough snapshot"
              className="absolute inset-0 w-full h-full object-contain bg-slate-900"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/20 to-black/60" />

            <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
              Interactive Walkthrough
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-5 text-left">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold">Video temporarily unavailable</p>
                  <p className="text-sm text-white/80 mt-1">
                    {errorMessage || 'This walkthrough snapshot is still available. You can retry the video in a moment.'}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleRetry}
                      className="px-4 py-2 bg-white/90 hover:bg-white text-slate-900 rounded-md text-sm font-medium"
                    >
                      Retry video
                    </button>
                    <span className="text-xs text-white/70">Key: {videoKey}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <p className="text-slate-700 font-medium">{errorMessage || 'Video not available'}</p>
            <p className="text-sm text-slate-500 mt-1">Key: {videoKey}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="mt-4 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-md text-sm font-medium text-slate-800"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    );
  }

  const currentCandidate = candidates[candidateIndex];
  const isIframeCandidate = currentCandidate?.kind === 'iframe';

  if (compact) {
    return (
      <div
        className={`bg-white rounded-lg border border-slate-200 overflow-hidden ${className}`}
        data-testid="video-tutorial-player"
        data-video-key={videoKey}
        data-video-state="ready"
        data-video-source={videoSource}
      >
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
          ) : isIframeCandidate ? (
            <iframe
              className="absolute inset-0 w-full h-full border-0"
              src={videoUrl || ''}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              title={title}
            />
          ) : (
            <video
              key={`${videoKey}:${candidateIndex}`}
              ref={videoRef}
              className="absolute inset-0 w-full h-full"
              controls
              autoPlay
              playsInline
              crossOrigin="anonymous"
              onError={handleVideoError}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
              src={videoUrl || ''}
            >
              <track kind="captions" src={captionsSrc} srcLang="en" label="English" default />
            </video>
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
    <div
      className={`bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200 ${className}`}
      data-testid="video-tutorial-player"
      data-video-key={videoKey}
      data-video-state="ready"
      data-video-source={videoSource}
    >
      {/* Video Container */}
      <div className="relative aspect-video bg-slate-900 group">
        
        {/* Snapshot Overlay (Walkthrough Mode) */}
        {overlayImage && (
            <>
                <img 
                    src={overlayImage} 
                    alt="Lesson Snapshot" 
                    className="absolute inset-0 w-full h-full object-contain opacity-90 z-0"
                />
                <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm z-10">
                    📸 Interactive Walkthrough
                </div>
            </>
        )}

        {/* Video Player Wrapper */}
        <div className={overlayImage ? "absolute bottom-4 right-4 w-1/3 aspect-video shadow-2xl rounded-lg overflow-hidden border-2 border-white bg-black z-10 transition-transform hover:scale-105" : "absolute inset-0 w-full h-full"}>
            {!hasStarted ? (
            <button
                onClick={handlePlay}
                className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-900/80 to-purple-900/80 group"
                aria-label={`Play ${title}`}
            >
                <div className="text-center">
                <div className={`${overlayImage ? 'w-12 h-12' : 'w-20 h-20'} bg-white/90 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform mx-auto mb-4`}>
                    <Play className={`${overlayImage ? 'w-5 h-5' : 'w-8 h-8'} text-indigo-600 ml-1`} />
                </div>
                {!overlayImage && (
                    <>
                        <p className="text-white font-medium text-lg">{title}</p>
                        {duration && (
                            <p className="text-white/70 text-sm mt-1 flex items-center justify-center gap-1">
                            <Clock className="w-4 h-4" /> {duration}
                            </p>
                        )}
                    </>
                )}
                </div>
            </button>
            ) : isIframeCandidate ? (
            <>
                <iframe
                className="absolute inset-0 w-full h-full border-0"
                src={videoUrl || ''}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                title={title}
                />
                {/* Streaming indicator */}
                {videoSource === 'heygen' && (
                  <div className="absolute top-2 right-2 bg-indigo-500/90 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Streaming
                  </div>
                )}
            </>
            ) : (
            <>
                <video
                key={`${videoKey}:${candidateIndex}`}
                ref={videoRef}
                className="absolute inset-0 w-full h-full"
                autoPlay
                playsInline
                controls
                crossOrigin="anonymous"
                onError={handleVideoError}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                src={videoUrl || undefined}
                >
                  <track kind="captions" src={captionsSrc} srcLang="en" label="English" default />
                </video>
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
              Source: {(() => {
                if (!currentCandidate) return videoSource;
                switch (currentCandidate.type) {
                  case 'live':
                    return 'Live demo';
                  case 'cloudinary':
                    return 'CDN';
                  case 'local':
                    return 'Local';
                  case 'heygen':
                    return 'HeyGen';
                }
              })()}
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
