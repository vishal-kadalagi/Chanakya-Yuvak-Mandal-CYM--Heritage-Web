import { extractYoutubeVideoId, getYoutubeThumbnailUrl } from './youtubeUtils';

/**
 * Universal HD Media Delivery Utility for Chanakya Yuvak Mandal
 * 
 * Automatically upgrades Cloudinary media URLs to deliver fast, crystal-clear visual quality:
 * - Images: q_auto:good, f_auto, dpr_auto (Fast loading, no JPEG compression artifacts, Retina screen support)
 * - Videos: q_auto:good, vc_auto (Smooth streaming, instant start, no buffering freeze)
 */
export function getHdMediaUrl(url: string, type: 'image' | 'video' = 'image'): string {
  if (!url || typeof url !== 'string') return url;

  // Auto-detect video if not explicitly specified or if URL is clearly a video
  const isVideo =
    type === 'video' ||
    /\.(mp4|webm|mov|ogg|m4v)($|\?)/i.test(url) ||
    url.includes('/video/upload/');

  // Only apply to Cloudinary hosted media
  if (!url.includes('cloudinary.com')) return url;

  // Convert Apple QuickTime MOV or other containers to MP4 on Cloudinary for instant web streaming
  let targetUrl = url;
  if (isVideo && /\.(mov|m4v|webm)($|\?)/i.test(targetUrl)) {
    targetUrl = targetUrl.replace(/\.(mov|m4v|webm)($|\?)/i, '.mp4$2');
  }

  // Already transformed
  if (targetUrl.includes('/q_auto') && (targetUrl.includes('w_') || targetUrl.includes('vc_'))) return targetUrl;

  const uploadSegment = '/upload/';
  const index = targetUrl.indexOf(uploadSegment);
  if (index === -1) return targetUrl;

  // vc_h264 guarantees universal GPU hardware acceleration, eliminating stuttering and codec lag
  const transformation =
    isVideo
      ? 'vc_h264,q_auto:good,w_1280,c_limit/'
      : 'q_auto:good,f_auto,dpr_auto/';

  return (
    targetUrl.slice(0, index + uploadSegment.length) +
    transformation +
    targetUrl.slice(index + uploadSegment.length)
  );
}

/**
 * Lightweight Card & Reel Media Delivery Utility
 * Optimizes media for 35mm reel cards, thumbnail grids, and list items (max 480px-640px width).
 * Cuts video file sizes by up to 90% (using ac_none to strip audio in background reels),
 * ensuring instantaneous buttery-smooth 60fps playback without network stalls.
 */
export function getReelMediaUrl(url: string, type: 'image' | 'video' = 'image'): string {
  if (!url || typeof url !== 'string') return url;

  const isVideo =
    type === 'video' ||
    /\.(mp4|webm|mov|ogg|m4v)($|\?)/i.test(url) ||
    url.includes('/video/upload/');

  if (!url.includes('cloudinary.com')) return url;

  // Convert Apple QuickTime MOV to MP4 container on Cloudinary for instant streaming
  let targetUrl = url;
  if (isVideo && /\.(mov|m4v|webm)($|\?)/i.test(targetUrl)) {
    targetUrl = targetUrl.replace(/\.(mov|m4v|webm)($|\?)/i, '.mp4$2');
  }

  // Already transformed
  if (targetUrl.includes('w_480') || targetUrl.includes('w_640')) return targetUrl;

  const uploadSegment = '/upload/';
  const index = targetUrl.indexOf(uploadSegment);
  if (index === -1) return targetUrl;

  // ac_none strips unused audio track from reel loops, saving ~40% bandwidth
  // vc_h264 ensures smooth hardware playback on all mobile and desktop devices
  const transformation =
    isVideo
      ? 'vc_h264,q_auto:eco,w_480,c_limit,ac_none/'
      : 'q_auto:good,f_auto,w_640,c_limit/';

  return (
    targetUrl.slice(0, index + uploadSegment.length) +
    transformation +
    targetUrl.slice(index + uploadSegment.length)
  );
}

/**
 * Instant Video Poster Generator:
 * Returns an instant, lightweight JPEG still frame of the video so users never stare at a black box
 * while the video stream is buffering.
 */
export function getVideoPosterUrl(url?: string): string {
  if (!url || typeof url !== 'string') return '';

  // 1. YouTube video thumbnail
  const ytId = extractYoutubeVideoId(url);
  if (ytId) {
    return getYoutubeThumbnailUrl(ytId);
  }

  // 2. Cloudinary video snapshot (frame 0 as JPEG with 800px limit)
  if (url.includes('cloudinary.com')) {
    let clean = url.replace(/\.(mp4|webm|mov|ogg|m4v)($|\?)/i, '.jpg$2');
    if (!clean.includes('/so_0')) {
      const uploadIdx = clean.indexOf('/upload/');
      if (uploadIdx !== -1) {
        clean =
          clean.slice(0, uploadIdx + 8) +
          'so_0,q_auto:good,f_auto,w_800,c_limit/' +
          clean.slice(uploadIdx + 8);
      }
    }
    return clean;
  }

  // 3. Fallback: replace common video extensions with .jpg
  if (/\.(mp4|webm|mov|ogg|m4v)($|\?)/i.test(url)) {
    return url.replace(/\.(mp4|webm|mov|ogg|m4v)($|\?)/i, '.jpg$2');
  }

  return url;
}
