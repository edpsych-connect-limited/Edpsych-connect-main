'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * Universal Video Tutorial Player Component
 * 
 * Video Priority System for 100% Uptime:
 * 1. Local MP4 files (public/content/training_videos/) - No external dependency
 * 2. Cloudinary CDN (if configured) - 99.9% SLA, global distribution
 * 3. HeyGen Direct MP4 URL - Fetched via API, temporary signed URLs
 * 4. HeyGen embed as last resort - May not work reliably
 * 
 * Used across Help Centre, Parent Portal, LA Dashboard, and all tutorial contexts.
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Play, AlertCircle, CheckCircle, Clock, X, Loader2 } from 'lucide-react';
import { HEYGEN_VIDEO_IDS, LOCAL_VIDEO_PATHS } from '@/lib/training/heygen-video-urls';

// Cloudinary URLs - All 87 training videos uploaded and globally distributed
const CLOUDINARY_VIDEO_URLS: Record<string, string> = {
  // ADHD Courses (16 videos)
  'adhd-m1-l1': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533363/edpsych-connect/videos/adhd-m1-l1.mp4',
  'adhd-m1-l2': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533402/edpsych-connect/videos/adhd-m1-l2.mp4',
  'adhd-m2-l1': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533368/edpsych-connect/videos/adhd-m2-l1.mp4',
  'adhd-m2-l2': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533371/edpsych-connect/videos/adhd-m2-l2.mp4',
  'adhd-m3-l1': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533407/edpsych-connect/videos/adhd-m3-l1.mp4',
  'adhd-m3-l2': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533412/edpsych-connect/videos/adhd-m3-l2.mp4',
  'adhd-m4-l1': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533417/edpsych-connect/videos/adhd-m4-l1.mp4',
  'adhd-m4-l2': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533377/edpsych-connect/videos/adhd-m4-l2.mp4',
  'adhd-m5-l1': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533381/edpsych-connect/videos/adhd-m5-l1.mp4',
  'adhd-m5-l2': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533422/edpsych-connect/videos/adhd-m5-l2.mp4',
  'adhd-m6-l1': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533386/edpsych-connect/videos/adhd-m6-l1.mp4',
  'adhd-m6-l2': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533428/edpsych-connect/videos/adhd-m6-l2.mp4',
  'adhd-m7-l1': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533392/edpsych-connect/videos/adhd-m7-l1.mp4',
  'adhd-m7-l2': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533434/edpsych-connect/videos/adhd-m7-l2.mp4',
  'adhd-m8-l1': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533398/edpsych-connect/videos/adhd-m8-l1.mp4',
  'adhd-m8-l2': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533441/edpsych-connect/videos/adhd-m8-l2.mp4',
  
  // Autism Courses (16 videos)
  'autism-m1-l1': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533450/edpsych-connect/videos/autism-m1-l1.mp4',
  'autism-m1-l2': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533456/edpsych-connect/videos/autism-m1-l2.mp4',
  'autism-m2-l1': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533463/edpsych-connect/videos/autism-m2-l1.mp4',
  'autism-m2-l2': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533519/edpsych-connect/videos/autism-m2-l2.mp4',
  'autism-m3-l1': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533471/edpsych-connect/videos/autism-m3-l1.mp4',
  'autism-m3-l2': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533527/edpsych-connect/videos/autism-m3-l2.mp4',
  'autism-m4-l1': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533478/edpsych-connect/videos/autism-m4-l1.mp4',
  'autism-m4-l2': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533535/edpsych-connect/videos/autism-m4-l2.mp4',
  'autism-m5-l1': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533486/edpsych-connect/videos/autism-m5-l1.mp4',
  'autism-m5-l2': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533544/edpsych-connect/videos/autism-m5-l2.mp4',
  'autism-m6-l1': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533495/edpsych-connect/videos/autism-m6-l1.mp4',
  'autism-m6-l2': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533551/edpsych-connect/videos/autism-m6-l2.mp4',
  'autism-m7-l1': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533502/edpsych-connect/videos/autism-m7-l1.mp4',
  'autism-m7-l2': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533560/edpsych-connect/videos/autism-m7-l2.mp4',
  'autism-m8-l1': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533568/edpsych-connect/videos/autism-m8-l1.mp4',
  'autism-m8-l2': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533510/edpsych-connect/videos/autism-m8-l2.mp4',
  
  // Dyslexia Courses (24 videos)
  'dyslexia-m1-l1': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533587/edpsych-connect/videos/dyslexia-m1-l1.mp4',
  'dyslexia-m1-l2': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533594/edpsych-connect/videos/dyslexia-m1-l2.mp4',
  'dyslexia-m2-l1': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533601/edpsych-connect/videos/dyslexia-m2-l1.mp4',
  'dyslexia-m2-l2': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533686/edpsych-connect/videos/dyslexia-m2-l2.mp4',
  'dyslexia-m3-l1': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533609/edpsych-connect/videos/dyslexia-m3-l1.mp4',
  'dyslexia-m3-l2': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533695/edpsych-connect/videos/dyslexia-m3-l2.mp4',
  'dyslexia-m4-l1': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533616/edpsych-connect/videos/dyslexia-m4-l1.mp4',
  'dyslexia-m4-l2': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533621/edpsych-connect/videos/dyslexia-m4-l2.mp4',
  'dyslexia-m5-l1': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533627/edpsych-connect/videos/dyslexia-m5-l1.mp4',
  'dyslexia-m5-l2': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533634/edpsych-connect/videos/dyslexia-m5-l2.mp4',
  'dyslexia-m6-l1': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533643/edpsych-connect/videos/dyslexia-m6-l1.mp4',
  'dyslexia-m6-l2': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533704/edpsych-connect/videos/dyslexia-m6-l2.mp4',
  'dyslexia-m7-l1': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533651/edpsych-connect/videos/dyslexia-m7-l1.mp4',
  'dyslexia-m7-l2': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533660/edpsych-connect/videos/dyslexia-m7-l2.mp4',
  'dyslexia-m8-l1': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533668/edpsych-connect/videos/dyslexia-m8-l1.mp4',
  'dyslexia-m8-l2': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533679/edpsych-connect/videos/dyslexia-m8-l2.mp4',
  // Dys variants (8 videos)
  'dys-m1-l1': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533571/edpsych-connect/videos/dys-m1-l1.mp4',
  'dys-m2-l1': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533572/edpsych-connect/videos/dys-m2-l1.mp4',
  'dys-m3-l1': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533574/edpsych-connect/videos/dys-m3-l1.mp4',
  'dys-m4-l1': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533575/edpsych-connect/videos/dys-m4-l1.mp4',
  'dys-m5-l1': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533577/edpsych-connect/videos/dys-m5-l1.mp4',
  'dys-m6-l2': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533578/edpsych-connect/videos/dys-m6-l2.mp4',
  'dys-m7-l1': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533580/edpsych-connect/videos/dys-m7-l1.mp4',
  'dys-m8-l1': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533581/edpsych-connect/videos/dys-m8-l1.mp4',
  
  // Assessment & Intervention (6 videos)
  'assess-m1-l1': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533443/edpsych-connect/videos/assess-m1-l1.mp4',
  'assess-m2-l1': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533445/edpsych-connect/videos/assess-m2-l1.mp4',
  'assess-m2-l2': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533446/edpsych-connect/videos/assess-m2-l2.mp4',
  'int-m1-l1': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533709/edpsych-connect/videos/int-m1-l1.mp4',
  'int-m2-l1': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533710/edpsych-connect/videos/int-m2-l1.mp4',
  
  // SEND Funding (3 videos)
  'send-fund-m1-l1': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533712/edpsych-connect/videos/send-fund-m1-l1.mp4',
  'send-fund-m2-l1': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533713/edpsych-connect/videos/send-fund-m2-l1.mp4',
  'send-fund-m2-l2': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533715/edpsych-connect/videos/send-fund-m2-l2.mp4',
  
  // EHCP Training (6 videos)
  'ehcp-m1-l1': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533706/edpsych-connect/videos/ehcp-m1-l1.mp4',
  'ehcp-application-journey': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533977/edpsych-connect/videos/ehcp-application-journey.mp4',
  'ehcp-evidence-gathering': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533989/edpsych-connect/videos/ehcp-evidence-gathering.mp4',
  'ehcp-annual-review': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764534004/edpsych-connect/videos/ehcp-annual-review.mp4',
  'ehcp-appeals-process': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764534023/edpsych-connect/videos/ehcp-appeals-process.mp4',
  'ehcp-annual-review-process': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764534034/edpsych-connect/videos/ehcp-annual-review-process.mp4',
  
  // Marketing Videos (4 videos)
  'platform-introduction': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533750/edpsych-connect/videos/platform-introduction.mp4',
  'data-autonomy': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533766/edpsych-connect/videos/data-autonomy.mp4',
  'no-child-left-behind': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533789/edpsych-connect/videos/no-child-left-behind.mp4',
  'gamification-integrity': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533803/edpsych-connect/videos/gamification-integrity.mp4',
  
  // Onboarding Videos (6 videos)
  'onboarding-welcome': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533816/edpsych-connect/videos/onboarding-welcome.mp4',
  'onboarding-role-selection': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533828/edpsych-connect/videos/onboarding-role-selection.mp4',
  'onboarding-goals': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533841/edpsych-connect/videos/onboarding-goals.mp4',
  'onboarding-knowledge-check': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533870/edpsych-connect/videos/onboarding-knowledge-check.mp4',
  'onboarding-completion': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533882/edpsych-connect/videos/onboarding-completion.mp4',
  
  // LA Portal Videos (2 videos)
  'la-ehcp-portal-intro': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533892/edpsych-connect/videos/la-ehcp-portal-intro.mp4',
  'la-dashboard-overview': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764534507/edpsych-connect/videos/la-dashboard-overview.mp4',
  
  // Help Centre Videos (5 videos)
  'help-getting-started': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533911/edpsych-connect/videos/help-getting-started.mp4',
  'help-first-assessment': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533929/edpsych-connect/videos/help-first-assessment.mp4',
  'help-data-security': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533939/edpsych-connect/videos/help-data-security.mp4',
  'help-finding-interventions': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533952/edpsych-connect/videos/help-finding-interventions.mp4',
  'help-technical-support': 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1764533963/edpsych-connect/videos/help-technical-support.mp4',
};

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
  const [videoSource, setVideoSource] = useState<'loading' | 'local' | 'cloudinary' | 'heygen' | 'error'>('loading');
  const [_errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch video URL with priority: Local > Cloudinary > HeyGen API
  useEffect(() => {
    async function findVideoSource() {
      // 1. Try local file first
      const localPath = LOCAL_VIDEO_PATHS[videoKey];
      if (localPath) {
        try {
          const response = await fetch(localPath, { method: 'HEAD' });
          if (response.ok) {
            setVideoUrl(localPath);
            setVideoSource('local');
            return;
          }
        } catch {
          // Local file doesn't exist, continue
        }
      }

      // 2. Try Cloudinary
      const cloudinaryUrl = CLOUDINARY_VIDEO_URLS[videoKey];
      if (cloudinaryUrl) {
        setVideoUrl(cloudinaryUrl);
        setVideoSource('cloudinary');
        return;
      }

      // 3. Try HeyGen API for direct MP4 URL
      const heygenId = HEYGEN_VIDEO_IDS[videoKey];
      if (heygenId) {
        try {
          const response = await fetch(`/api/video/heygen-url?key=${videoKey}`);
          if (response.ok) {
            const data = await response.json();
            if (data.url) {
              setVideoUrl(data.url);
              setVideoSource('heygen');
              return;
            }
          }
        } catch {
          // HeyGen API failed
        }
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
              Source: {videoSource === 'local' ? 'Local' : videoSource === 'cloudinary' ? 'CDN' : 'HeyGen'}
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
