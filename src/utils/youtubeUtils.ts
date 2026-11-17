/**
 * YouTube Utility functions for extracting Video IDs and creating Embed/Watch URLs
 */

export function extractYoutubeVideoId(input?: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // 1. Direct 11-char ID (e.g., dQw4w9WgXcQ)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // 2. Standard watch URL: youtube.com/watch?v=VIDEO_ID
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];

  // 3. Shortened URL: youtu.be/VIDEO_ID
  // 4. Live URL: youtube.com/live/VIDEO_ID
  // 5. Embed URL: youtube.com/embed/VIDEO_ID
  const pathMatch = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:live|embed|v|shorts)\/)([a-zA-Z0-9_-]{11})/
  );
  if (pathMatch) return pathMatch[1];

  return null;
}

export function getYoutubeEmbedUrl(videoId: string, autoplay: boolean = true): string {
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    enablejsapi: '1',
  });
  if (autoplay) {
    params.set('autoplay', '1');
    params.set('mute', '0');
  }
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

export function getYoutubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}
