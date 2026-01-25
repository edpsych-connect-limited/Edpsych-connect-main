import { HEYGEN_VIDEO_IDS } from '@/lib/training/heygen-video-urls';

/**
 * Video Source Configuration
 * Represents a resolved video source with fallback capabilities.
 */
export interface VideoSource {
  key: string;
  provider: 'heygen' | 'cloudinary' | 'youtube';
  id: string;
  fallbackId?: string;
  title?: string;
  duration?: string;
}

/**
 * Central Video Registry Strategy
 * 
 * Purpose:
 * - Decouple component video keys from specific provider IDs
 * - Allow simple switching between HeyGen (Production) and Cloudinary (Backup/Dev)
 * - Provide a single source of truth for video metadata
 */
class VideoRegistryService {
  private static instance: VideoRegistryService;
  private registry: Map<string, VideoSource> = new Map();
  private useHeyGenPrimary: boolean = true; // Default to HeyGen in production

  private constructor() {
    this.initializeRegistry();
  }

  public static getInstance(): VideoRegistryService {
    if (!VideoRegistryService.instance) {
      VideoRegistryService.instance = new VideoRegistryService();
    }
    return VideoRegistryService.instance;
  }

  /**
   * Initialize the registry with known video IDs.
   * In a real app, this might fetch from an API or load from a JSON manifest.
   */
  private initializeRegistry() {
    // 1. Load HeyGen IDs (Primary Source)
    Object.entries(HEYGEN_VIDEO_IDS).forEach(([key, heyGenId]) => {
      this.register(key, {
        key,
        provider: 'heygen',
        id: heyGenId,
        // Fallback strategy: In a real scenario, map this to a specific Cloudinary ID
        // For now, we assume Cloudinary IDs follow a specific naming convention
        fallbackId: `edpsych-connect/videos/${key}` 
      });
    });

    // 2. Register "Coders of Tomorrow" specific videos (if not already in HeyGen list)
    this.register('intro-coding-journey', {
      key: 'intro-coding-journey',
      provider: 'heygen', 
      id: '1504b108b783451e9246cfac493b163f', // Reuse platform intro for demo if specific one missing
      title: 'Welcome to Your Coding Journey',
      duration: '5:30'
    });

    this.register('blocks-intro', {
      key: 'blocks-intro',
      provider: 'heygen',
      id: 'e0fd73d582534c23acdf88c81fd4e616', // Placeholder
      title: 'Introduction to Block Coding',
      duration: '8:15'
    });
  }

  /**
   * Register or update a video source
   */
  public register(key: string, source: VideoSource) {
    this.registry.set(key, source);
  }

  /**
   * Get the primary source ID for a given key.
   * Returns a Cloudinary ID if HeyGen is disabled or missing.
   */
  public getSource(key: string): VideoSource | undefined {
    return this.registry.get(key);
  }

  /**
   * Get the "best" playback candidate.
   * Useful for the <CloudinaryVideoPlayer /> component which accepts both types.
   */
  public getPlaybackCandidate(key: string): { type: 'heygen' | 'cloudinary', id: string } {
    const source = this.registry.get(key);
    
    if (!source) {
      // Emergency fallback if key is unknown
      console.warn(`[VideoRegistry] Unknown key: ${key}. Falling back to Cloudinary convention.`);
      return { type: 'cloudinary', id: `edpsych-connect/videos/${key}` };
    }

    if (this.useHeyGenPrimary && source.provider === 'heygen') {
      return { type: 'heygen', id: source.id };
    }

    if (source.fallbackId) {
      return { type: 'cloudinary', id: source.fallbackId };
    }

    // Default return
    return { type: 'cloudinary', id: `edpsych-connect/videos/${key}` };
  }
}

export const VideoRegistry = VideoRegistryService.getInstance();
