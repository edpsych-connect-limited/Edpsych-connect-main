/**
 * Cloudinary Integration for Video Hosting
 * 
 * PURPOSE: Provide 100% uptime video delivery without external dependencies
 * 
 * How Other Websites Maintain Video Uptime:
 * 1. Netflix/YouTube: Own CDN infrastructure ($$$)
 * 2. Most Startups: Use Cloudinary/Mux/Cloudflare Stream (affordable, reliable)
 * 3. Enterprise: Akamai/CloudFront + S3 (high cost, high reliability)
 * 
 * Our Approach:
 * - Generate videos with HeyGen (best AI avatars)
 * - Download MP4 files locally
 * - Upload to Cloudinary CDN (configured in Vercel)
 * - Serve from Cloudinary with 99.9% SLA
 * - Local files as ultimate fallback
 */

import { v2 as cloudinary } from 'cloudinary';

// Configuration from environment variables (set in Vercel Dashboard)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  duration: number;
  format: string;
  bytes: number;
  width: number;
  height: number;
  thumbnail_url: string;
}

/**
 * Upload a video to Cloudinary
 * @param filePath - Local path to the video file
 * @param publicId - Unique identifier for the video (e.g., 'training/autism-m1-l1')
 * @returns CloudinaryUploadResult with URLs
 */
export async function uploadVideo(
  filePath: string,
  publicId: string
): Promise<CloudinaryUploadResult> {
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: 'video',
    public_id: publicId,
    folder: 'edpsych-connect/videos',
    overwrite: true,
    // Optimize for web delivery
    eager: [
      { format: 'mp4', quality: 'auto' },
      { format: 'webm', quality: 'auto' },
    ],
    eager_async: true,
    // Generate thumbnail
    eager_notification_url: process.env.CLOUDINARY_WEBHOOK_URL,
  });

  return {
    public_id: result.public_id,
    secure_url: result.secure_url,
    duration: result.duration,
    format: result.format,
    bytes: result.bytes,
    width: result.width,
    height: result.height,
    thumbnail_url: cloudinary.url(result.public_id, {
      resource_type: 'video',
      format: 'jpg',
      transformation: [
        { width: 640, height: 360, crop: 'fill' },
        { start_offset: '2' }, // Thumbnail at 2 seconds
      ],
    }),
  };
}

/**
 * Get optimized video URL from Cloudinary
 * @param publicId - The Cloudinary public ID
 * @param options - Transformation options
 * @returns Optimized video URL
 */
export function getVideoUrl(
  publicId: string,
  options: {
    quality?: 'auto' | 'low' | 'good' | 'best';
    format?: 'mp4' | 'webm' | 'auto';
    width?: number;
    height?: number;
  } = {}
): string {
  return cloudinary.url(publicId, {
    resource_type: 'video',
    secure: true,
    transformation: [
      { quality: options.quality || 'auto' },
      { format: options.format || 'auto' },
      ...(options.width ? [{ width: options.width }] : []),
      ...(options.height ? [{ height: options.height }] : []),
    ],
  });
}

/**
 * Get video thumbnail URL
 * @param publicId - The Cloudinary public ID
 * @param timestamp - Time in video to capture (seconds)
 * @returns Thumbnail URL
 */
export function getVideoThumbnail(
  publicId: string,
  timestamp: number = 2
): string {
  return cloudinary.url(publicId, {
    resource_type: 'video',
    format: 'jpg',
    secure: true,
    transformation: [
      { width: 640, height: 360, crop: 'fill' },
      { start_offset: timestamp.toString() },
    ],
  });
}

/**
 * Delete a video from Cloudinary
 * @param publicId - The Cloudinary public ID
 */
export async function deleteVideo(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId, {
    resource_type: 'video',
  });
}

/**
 * Video URLs - Cloudinary CDN
 * These are the uploaded marketing/training videos
 */
export const CLOUDINARY_VIDEO_URLS: Record<string, string> = {
  // Marketing videos (to be uploaded)
  'platform-introduction': '',
  'data-autonomy': '',
  'no-child-left-behind': '',
  'gamification-integrity': '',
  
  // Onboarding videos (to be uploaded)
  'onboarding-welcome': '',
  'onboarding-role-selection': '',
  'onboarding-goals': '',
  'onboarding-platform-tour': '',
  'onboarding-knowledge-check': '',
  'onboarding-completion': '',
  
  // Training videos will use local files (too many to upload)
  // But we CAN upload them to Cloudinary for premium delivery
};

/**
 * Get the best video source with Cloudinary priority
 * Priority: Cloudinary CDN > Local MP4 > HeyGen Embed
 */
export function getBestVideoSourceWithCloudinary(
  lessonId: string
): { url: string; source: 'cloudinary' | 'local' | 'heygen' } | undefined {
  // 1. Check Cloudinary CDN first (100% uptime)
  const cloudinaryUrl = CLOUDINARY_VIDEO_URLS[lessonId];
  if (cloudinaryUrl) {
    return { url: cloudinaryUrl, source: 'cloudinary' };
  }
  
  // 2. Check local files (no external dependency)
  const { LOCAL_VIDEO_PATHS, HEYGEN_VIDEO_IDS } = require('./training/heygen-video-urls');
  const localPath = LOCAL_VIDEO_PATHS[lessonId];
  if (localPath) {
    return { url: localPath, source: 'local' };
  }
  
  // 3. Fallback to HeyGen (external dependency - may fail)
  const heygenId = HEYGEN_VIDEO_IDS[lessonId];
  if (heygenId) {
    return { url: `https://app.heygen.com/embed/${heygenId}`, source: 'heygen' };
  }
  
  return undefined;
}

export default cloudinary;
