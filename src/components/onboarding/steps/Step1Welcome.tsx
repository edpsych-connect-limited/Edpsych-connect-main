'use client'

/**
 * FILE: src/components/onboarding/steps/Step1Welcome.tsx
 * PURPOSE: Step 1 - Welcome screen with video and key benefits
 *
 * FEATURES:
 * - Personalized welcome message
 * - Introduction video with watch tracking
 * - Key benefits showcase (6 benefits)
 * - Get Started CTA button
 * - WCAG 2.1 AA compliant
 * - Responsive design
 * 
 * Video Priority System:
 * 1. Local files (for development)
 * 2. Cloudinary CDN (PRIMARY - verified working, optimised delivery)
 * 3. HeyGen API (fallback for video regeneration)
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, CheckCircle, Target, Zap, Shield, Users, TrendingUp, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useOnboarding } from '../OnboardingProvider';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LOCAL_VIDEO_PATHS } from '@/lib/training/heygen-video-urls';

// Cloudinary video URL - PRIMARY source for production
const CLOUDINARY_WELCOME_VIDEO = 'https://res.cloudinary.com/dncfu2j0r/video/upload/v1749900766/edpsych-connect/videos/onboarding-welcome.mp4';

// Local video path for onboarding welcome - for local development
const LOCAL_WELCOME_VIDEO = LOCAL_VIDEO_PATHS['onboarding-welcome'] || '/content/training_videos/onboarding/onboarding-welcome.mp4';

export function Step1Welcome() {
  const { state, updateStep } = useOnboarding();
  const [videoStarted, setVideoStarted] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [videoWatchPercentage, setVideoWatchPercentage] = useState(state.step1Data.videoWatchPercentage || 0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fetch video URL when play is clicked
  const fetchVideoUrl = useCallback(async () => {
    setIsLoadingVideo(true);

    // 1. Try local file first (for development)
    try {
      const response = await fetch(LOCAL_WELCOME_VIDEO, { method: 'HEAD' });
      if (response.ok) {
        setVideoUrl(LOCAL_WELCOME_VIDEO);
        setIsLoadingVideo(false);
        return;
      }
    } catch {
      // Local file doesn't exist, continue
    }

    // 2. Try Cloudinary CDN (PRIMARY source for production)
    try {
      const response = await fetch(CLOUDINARY_WELCOME_VIDEO, { method: 'HEAD' });
      if (response.ok) {
        setVideoUrl(CLOUDINARY_WELCOME_VIDEO);
        setIsLoadingVideo(false);
        return;
      }
    } catch {
      // Cloudinary failed, continue to fallback
    }

    // 3. Try HeyGen API as fallback
    try {
      const response = await fetch('/api/video/heygen-url?key=onboarding-welcome');
      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          setVideoUrl(data.url);
          setIsLoadingVideo(false);
          return;
        }
      }
    } catch {
      // HeyGen API failed
    }

    // Fallback - just use local path and let it error naturally
    setVideoUrl(LOCAL_WELCOME_VIDEO);
    setIsLoadingVideo(false);
  }, []);

  // Auto-play when video URL is loaded
  useEffect(() => {
    if (videoUrl && videoStarted && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [videoUrl, videoStarted]);

  const handleVideoPlay = () => {
    setVideoStarted(true);
    if (!videoUrl) {
      fetchVideoUrl();
    }
  };

  const benefits = [
    {
      icon: Target,
      title: 'Evidence-Based Practice',
      description: '51 validated assessment templates and 69 research-backed interventions',
      color: 'indigo'
    },
    {
      icon: Zap,
      title: 'Save Time',
      description: 'Reduce assessment time by 45% with automated scoring and report generation',
      color: 'purple'
    },
    {
      icon: Shield,
      title: 'GDPR Compliant',
      description: 'Enterprise-grade security with UK data residency and NHS-level encryption',
      color: 'green'
    },
    {
      icon: Users,
      title: 'Collaborative',
      description: 'Multi-stakeholder input from parents, teachers, and specialists',
      color: 'blue'
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Longitudinal data tracking with goal attainment scaling (GAS)',
      color: 'orange'
    },
    {
      icon: CheckCircle,
      title: 'CPD Certified',
      description: 'Earn CPD certificates and unlock professional development achievements',
      color: 'pink'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; icon: string; border: string }> = {
      indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', border: 'border-indigo-200' },
      purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-200' },
      green: { bg: 'bg-green-50', icon: 'text-green-600', border: 'border-green-200' },
      blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-200' },
      orange: { bg: 'bg-orange-50', icon: 'text-orange-600', border: 'border-orange-200' },
      pink: { bg: 'bg-pink-50', icon: 'text-pink-600', border: 'border-pink-200' }
    };
    return colors[color] || colors.indigo;
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Welcome Message */}
      <div className="text-center">
        <motion.h2 
          className="text-4xl font-bold text-gray-900 mb-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Welcome! 👋
        </motion.h2>
        <motion.p 
          className="text-lg text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          We&apos;re excited to have you join EdPsych Connect World - the UK&apos;s leading platform for educational psychology professionals.
        </motion.p>
      </div>

      {/* Video Section */}
      <motion.div 
        className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
            <Play className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              Quick Introduction (2 minutes)
            </h3>
            <p className="text-sm text-gray-600">
              Learn what makes EdPsych Connect World the most powerful tool for SEND professionals
            </p>
          </div>
        </div>

        {/* Video Player Placeholder */}
        {/* NOTE: Uses Cloudinary CDN as primary source with HeyGen API fallback */}
        <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-lg">
          {!videoStarted ? (
            <button
              onClick={handleVideoPlay}
              className="absolute inset-0 flex items-center justify-center group cursor-pointer"
              aria-label="Play introduction video"
            >
              {/* Gradient background for visual appeal */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 opacity-80" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform border border-white/30">
                  <Play className="w-10 h-10 text-white fill-white ml-1" />
                </div>
                <p className="mt-4 text-lg font-medium">Watch Introduction</p>
                <p className="text-sm text-white/70">2 minutes • AI Presenter</p>
              </div>
            </button>
          ) : isLoadingVideo ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-3" />
                <p className="text-white text-sm">Loading video...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Video Player - Using Cloudinary CDN as primary source */}
              <video
                ref={videoRef}
                src={videoUrl || undefined}
                className="w-full h-full object-cover"
                controls
                autoPlay
                controlsList="nodownload"
                playsInline
                poster="/images/video-poster-welcome.jpg"
                onPlay={() => {
                  if (videoWatchPercentage < 10) {
                    setVideoWatchPercentage(10);
                    updateStep(1, { videoWatchPercentage: 10 }, false);
                  }
                }}
                onTimeUpdate={(e) => {
                  const video = e.currentTarget;
                  if (video.duration) {
                    const percentage = Math.round((video.currentTime / video.duration) * 100);
                    if (percentage > videoWatchPercentage) {
                      setVideoWatchPercentage(percentage);
                      updateStep(1, { videoWatchPercentage: percentage }, false);
                      if (percentage >= 80 && !state.step1Data.videoWatched) {
                        updateStep(1, { videoWatched: true }, false);
                      }
                    }
                  }
                }}
                onEnded={() => {
                  setVideoWatchPercentage(100);
                  updateStep(1, { 
                    videoWatchPercentage: 100,
                    videoWatched: true 
                  }, false);
                }}
                onError={() => {
                  console.warn('Video failed to load');
                }}
              >
                {/* Fallback message */}
                Your browser does not support the video tag.
              </video>
              {/* Manual completion button for iframe videos */}
              {videoWatchPercentage < 80 && (
                <div className="absolute bottom-4 right-4">
                  <button
                    onClick={() => {
                      setVideoWatchPercentage(100);
                      updateStep(1, { 
                        videoWatchPercentage: 100,
                        videoWatched: true 
                      }, false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors shadow-lg"
                  >
                    ✅ Mark as Watched
                  </button>
                </div>
              )}
            </>
          )}

          {/* Progress Indicator */}
          {videoStarted && videoWatchPercentage > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 bg-opacity-50">
              <ProgressBar 
                value={videoWatchPercentage} 
                max={100} 
                colorClass="bg-indigo-600" 
                heightClass="h-full" 
                className="rounded-none" 
                trackColorClass="bg-transparent"
              />
            </div>
          )}
        </div>

        {videoStarted && videoWatchPercentage >= 80 && (
          <motion.div 
            className="mt-4 flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Great! You&apos;ve completed the introduction video</span>
          </motion.div>
        )}
      </motion.div>

      {/* Key Benefits Grid */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1 text-center">
          Why professionals choose us
        </h3>
        <p className="text-gray-600 mb-6 text-center">
          Trusted by 500+ educational psychologists, SENCOs, and schools across the UK
        </p>

        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {benefits.map((benefit, index) => {
            const colors = getColorClasses(benefit.color);
            const Icon = benefit.icon;

            return (
              <motion.div
                key={index}
                variants={item}
                className={`${colors.bg} border ${colors.border} rounded-xl p-5 transition-all hover:shadow-md hover:scale-105`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center border ${colors.border}`}>
                    <Icon className={`w-5 h-5 ${colors.icon}`} aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {benefit.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Statistics */}
      <motion.div 
        className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">500+</div>
            <div className="text-indigo-100 text-sm">Active Professionals</div>
          </div>
          <div className="text-center border-l border-r border-indigo-400 border-opacity-30">
            <div className="text-3xl font-bold mb-1">10,000+</div>
            <div className="text-indigo-100 text-sm">Assessments Completed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">98%</div>
            <div className="text-indigo-100 text-sm">User Satisfaction</div>
          </div>
        </div>
      </motion.div>

      {/* CTA Message */}
      <motion.div 
        className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <p className="text-gray-700 mb-2">
          <strong>Ready to get started?</strong> Let&apos;s set up your account in just a few steps.
        </p>
        <p className="text-sm text-gray-600">
          It&apos;ll only take 3-4 minutes, and you can skip optional steps.
        </p>
      </motion.div>

      {/* Screen Reader Instructions */}
      <div className="sr-only" aria-live="polite">
        This is step 1 of the onboarding process. You can watch an introduction video and learn about the key benefits of EdPsych Connect World. Click Next to continue to role selection.
      </div>
    </motion.div>
  );
}
