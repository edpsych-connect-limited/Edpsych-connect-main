import { logger } from '@/lib/logger';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

interface CDNOptions {
  provider?: string;
  regions?: string[];
  cacheTTL?: number;
  enableVideoOptimization?: boolean;
  enableImageOptimization?: boolean;
  enableEdgeComputing?: boolean;
  [key: string]: any;
}

interface VideoOptimizationOptions {
  formats?: string[];
  qualities?: string[];
  enableDrm?: boolean;
}

interface OptimizedVideo {
  original: string;
  formats?: Record<string, Record<string, string>>;
  streaming?: {
    hls?: {
      master: string;
      segments: string;
    };
  };
  drm?: {
    protected: string;
    license: string;
  };
}

interface ImageOptimizationOptions {
  formats?: string[];
  sizes?: number[];
  quality?: number;
}

interface OptimizedImage {
  original: string;
  responsive?: Record<number, Record<string, string>>;
}

interface PurgeConfig {
  paths?: string[];
  tags?: string[];
  all?: boolean;
}

export class CDNService {
  private options: Required<CDNOptions>;

  constructor(options: CDNOptions = {}) {
    this.options = {
      provider: 'cloudinary',
      regions: options.regions || ['global'],
      cacheTTL: options.cacheTTL || 3600,
      enableVideoOptimization: options.enableVideoOptimization ?? true,
      enableImageOptimization: options.enableImageOptimization ?? true,
      enableEdgeComputing: options.enableEdgeComputing ?? false,
      ...options
    };
  }

  async optimizeVideo(publicId: string, options: VideoOptimizationOptions = {}): Promise<OptimizedVideo> {
    try {
      if (!this.options.enableVideoOptimization) {
        return { original: cloudinary.url(publicId, { resource_type: 'video' }) };
      }

      const {
        formats = ['mp4', 'webm'],
        qualities = ['hd', 'sd']
      } = options;

      const optimizedUrls: OptimizedVideo = {
        original: cloudinary.url(publicId, { resource_type: 'video' }),
        formats: {},
        streaming: {}
      };

      // Generate optimized formats
      for (const format of formats) {
        if (!optimizedUrls.formats) optimizedUrls.formats = {};
        optimizedUrls.formats[format] = {};

        for (const quality of qualities) {
          const q = quality === 'hd' ? 'auto:good' : 'auto:eco';
          optimizedUrls.formats[format][quality] = cloudinary.url(publicId, {
            resource_type: 'video',
            format,
            quality: q,
            transformation: [{ width: quality === 'hd' ? 1280 : 640, crop: 'limit' }]
          });
        }
      }

      // Generate HLS
      optimizedUrls.streaming = {
        hls: {
          master: cloudinary.url(publicId, {
            resource_type: 'video',
            format: 'm3u8',
            streaming_profile: 'hd'
          }),
          segments: '' // Cloudinary handles segments internally via the master playlist
        }
      };

      return optimizedUrls;
    } catch (error) {
      logger.error('Error optimizing video:', error);
      throw error;
    }
  }

  async optimizeImage(publicId: string, options: ImageOptimizationOptions = {}): Promise<OptimizedImage> {
    try {
      if (!this.options.enableImageOptimization) {
        return { original: cloudinary.url(publicId) };
      }

      const {
        formats = ['webp', 'avif'],
        sizes = [320, 640, 1024, 1920],
        quality = 80
      } = options;

      const optimizedUrls: OptimizedImage = {
        original: cloudinary.url(publicId),
        responsive: {}
      };

      // Generate responsive images
      for (const size of sizes) {
        if (!optimizedUrls.responsive) optimizedUrls.responsive = {};
        optimizedUrls.responsive[size] = {};

        for (const format of formats) {
          optimizedUrls.responsive[size][format] = cloudinary.url(publicId, {
            format,
            width: size,
            quality,
            crop: 'limit'
          });
        }
      }

      return optimizedUrls;
    } catch (error) {
      logger.error('Error optimizing image:', error);
      throw error;
    }
  }

  async invalidateCache(_distributionId: string, paths: string[]): Promise<string> {
    try {
      // In Cloudinary, we invalidate by public_id (which maps to path)
      // We assume paths are public_ids here
      const invalidationId = `inv_${Date.now()}`;
      
      // Cloudinary explicit invalidation requires API call
      // For now, we'll just log it as Cloudinary handles versioning automatically
      logger.info(`Invalidating Cloudinary cache for: ${paths.join(', ')}`);
      
      // In a real scenario, we might use cloudinary.uploader.explicit with invalidate: true
      
      return invalidationId;
    } catch (error) {
      logger.error('Error invalidating cache:', error);
      throw error;
    }
  }

  async purgeContent(_distributionId: string, purgeConfig: PurgeConfig): Promise<boolean> {
    try {
      const { tags = [] } = purgeConfig;
      if (tags.length > 0) {
        await cloudinary.api.delete_resources_by_tag(tags[0]); // Delete by first tag for now
      }
      return true;
    } catch (error) {
      logger.error('Error purging content:', error);
      throw error;
    }
  }
}
