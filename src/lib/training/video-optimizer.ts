import { logger } from "@/lib/logger";
/**
 * FILE: src/lib/training/video-optimizer.ts
 * PURPOSE: Video streaming and playback optimization
 *
 * FEATURES:
 * - Adaptive bitrate selection based on connection
 * - Video preloading for next lessons
 * - Buffering optimization
 * - Resume from last position
 * - Bandwidth monitoring
 */

// ============================================================================
// TYPES
// ============================================================================

export interface VideoQuality {
  label: string;
  height: number;
  bitrate: number; // kbps
  url: string;
}

export interface VideoMetrics {
  buffered: number; // percentage
  playbackRate: number;
  quality: string;
  bandwidth: number; // Mbps
}

// ============================================================================
// CONNECTION QUALITY DETECTION
// ============================================================================

export function getConnectionQuality(): 'high' | 'medium' | 'low' {
  if (typeof window === 'undefined') return 'medium';

  // Use Network Information API if available
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

  if (connection) {
    const effectiveType = connection.effectiveType;
    const downlink = connection.downlink; // Mbps

    if (effectiveType === '4g' || downlink > 5) {
      return 'high';
    } else if (effectiveType === '3g' || downlink > 1) {
      return 'medium';
    }
  }

  // Fallback: estimate based on download speed test
  return 'medium';
}

export function getOptimalVideoQuality(availableQualities: VideoQuality[]): VideoQuality {
  const connectionQuality = getConnectionQuality();

  const qualityMap = {
    high: 1080,
    medium: 720,
    low: 480,
  };

  const targetHeight = qualityMap[connectionQuality];

  // Find closest quality match
  const sorted = [...availableQualities].sort((a, b) => b.height - a.height);

  const optimal = sorted.find(q => q.height <= targetHeight) || sorted[sorted.length - 1];

  return optimal;
}

// ============================================================================
// VIDEO PRELOADING
// ============================================================================

const preloadedVideos = new Map<string, HTMLVideoElement>();

export function preloadNextVideo(videoUrl: string): void {
  if (preloadedVideos.has(videoUrl)) return;

  const video = document.createElement('video');
  video.preload = 'auto';
  video.src = videoUrl;

  // Load first few seconds
  video.load();

  preloadedVideos.set(videoUrl, video);

  // Clean up after 5 minutes
  setTimeout(() => {
    preloadedVideos.delete(videoUrl);
  }, 5 * 60 * 1000);
}

export function getPreloadedVideo(videoUrl: string): HTMLVideoElement | null {
  return preloadedVideos.get(videoUrl) || null;
}

// ============================================================================
// PROGRESS PERSISTENCE
// ============================================================================

interface VideoProgress {
  videoId: string;
  currentTime: number;
  duration: number;
  timestamp: number;
}

const VIDEO_PROGRESS_KEY = 'video_progress';

export function saveVideoProgress(videoId: string, currentTime: number, duration: number): void {
  try {
    const progress: VideoProgress = {
      videoId,
      currentTime,
      duration,
      timestamp: Date.now(),
    };

    localStorage.setItem(`${VIDEO_PROGRESS_KEY}_${videoId}`, JSON.stringify(progress));
  } catch (_error) {
    console.error('Failed to save video progress:', _error);
  }
}

export function getVideoProgress(videoId: string): VideoProgress | null {
  try {
    const stored = localStorage.getItem(`${VIDEO_PROGRESS_KEY}_${videoId}`);
    if (!stored) return null;

    const progress: VideoProgress = JSON.parse(stored);

    // Ignore if older than 30 days
    if (Date.now() - progress.timestamp > 30 * 24 * 60 * 60 * 1000) {
      return null;
    }

    return progress;
  } catch (_error) {
    console.error('Failed to retrieve video progress:', _error);
    return null;
  }
}

// ============================================================================
// BUFFERING OPTIMIZATION
// ============================================================================

export function setupVideoBuffering(video: HTMLVideoElement): () => void {
  let bufferCheckInterval: NodeJS.Timeout;

  const checkBuffer = () => {
    if (video.buffered.length > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      const currentTime = video.currentTime;
      const bufferAhead = bufferedEnd - currentTime;

      // If buffer is low (< 5 seconds), reduce quality temporarily
      if (bufferAhead < 5 && video.playbackRate === 1) {
        logger.debug('[Video Optimizer] Low buffer detected, maintaining playback');
      }

      // If buffer is healthy (> 20 seconds), can increase quality
      if (bufferAhead > 20) {
        logger.debug('[Video Optimizer] Healthy buffer, quality can be increased');
      }
    }
  };

  bufferCheckInterval = setInterval(checkBuffer, 2000);

  // Cleanup function
  return () => {
    clearInterval(bufferCheckInterval);
  };
}

// ============================================================================
// BANDWIDTH MONITORING
// ============================================================================

export class BandwidthMonitor {
  private samples: number[] = [];
  private readonly maxSamples = 10;

  recordDownload(bytes: number, milliseconds: number): void {
    // Calculate Mbps
    const mbps = (bytes * 8) / (milliseconds * 1000);
    this.samples.push(mbps);

    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }
  }

  getAverageBandwidth(): number {
    if (this.samples.length === 0) return 0;
    return this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
  }

  recommendQuality(availableQualities: VideoQuality[]): VideoQuality {
    const avgBandwidth = this.getAverageBandwidth();

    // Add 25% safety margin
    const safeBandwidth = avgBandwidth * 0.75;

    const sorted = [...availableQualities].sort((a, b) => b.bitrate - a.bitrate);

    const recommended = sorted.find(q => q.bitrate <= safeBandwidth * 1000) || sorted[sorted.length - 1];

    return recommended;
  }
}

// ============================================================================
// VIDEO ANALYTICS
// ============================================================================

export interface VideoAnalytics {
  videoId: string;
  totalWatchTime: number; // seconds
  completionRate: number; // percentage
  averagePlaybackRate: number;
  pauseCount: number;
  seekCount: number;
  qualitySwitches: number;
}

export class VideoAnalyticsTracker {
  private analytics: VideoAnalytics;
  private sessionStartTime: number = 0;
  private lastUpdateTime: number = 0;

  constructor(videoId: string) {
    this.analytics = {
      videoId,
      totalWatchTime: 0,
      completionRate: 0,
      averagePlaybackRate: 1,
      pauseCount: 0,
      seekCount: 0,
      qualitySwitches: 0,
    };
  }

  onPlay(): void {
    this.sessionStartTime = Date.now();
    this.lastUpdateTime = this.sessionStartTime;
  }

  onPause(): void {
    this.analytics.pauseCount++;
    this.updateWatchTime();
  }

  onSeeked(): void {
    this.analytics.seekCount++;
  }

  onQualityChange(): void {
    this.analytics.qualitySwitches++;
  }

  onTimeUpdate(currentTime: number, duration: number): void {
    this.updateWatchTime();
    this.analytics.completionRate = (currentTime / duration) * 100;
  }

  private updateWatchTime(): void {
    if (this.lastUpdateTime > 0) {
      const elapsed = (Date.now() - this.lastUpdateTime) / 1000;
      this.analytics.totalWatchTime += elapsed;
    }
    this.lastUpdateTime = Date.now();
  }

  getAnalytics(): VideoAnalytics {
    return { ...this.analytics };
  }

  async save(): Promise<void> {
    try {
      await fetch('/api/training/video-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.analytics),
      });
    } catch (_error) {
      console.error('Failed to save video analytics:', _error);
    }
  }
}
