
import { HEYGEN_VIDEO_IDS, CLOUDINARY_VIDEO_URLS } from '../src/lib/training/heygen-video-urls';

const missing = Object.keys(HEYGEN_VIDEO_IDS).filter(key => !CLOUDINARY_VIDEO_URLS[key]);
console.log('Missing Cloudinary URLs for:', missing);
console.log('Total missing:', missing.length);
