import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Film,
  Youtube,
  Maximize2,
  Calendar,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { siteConfig } from '../../data/site';
import { GalleryItem } from '../../data/gallery';
import { LightboxModal } from '../gallery/LightboxModal';
import { subscribeToPublicMedia } from '../../services/mediaService';
import { subscribeToHistory, HistoryMilestoneDoc } from '../../services/historyService';
import { subscribeToAchievements, AchievementDoc } from '../../services/achievementsService';
import { subscribeToEvents, CommunityEventDoc } from '../../services/eventsService';
import { MediaItem } from '../../types/media';
import { getHdMediaUrl, getReelMediaUrl, getVideoPosterUrl } from '../../utils/mediaUtils';
import { extractYoutubeVideoId, getYoutubeThumbnailUrl } from '../../utils/youtubeUtils';

interface ReelItemCardProps {
  item: GalleryItem;
  frameNum: string;
  language: string;
  onSelect: () => void;
}

const ReelItemCard: React.FC<ReelItemCardProps> = ({ item, frameNum, language, onSelect }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const ytId = extractYoutubeVideoId(item.imageUrl);
  const isVideo =
    item.mediaType === 'video' ||
    /\.(mp4|webm|mov|ogg|m4v)($|\?)/i.test(item.imageUrl) ||
    Boolean(item.imageUrl && item.imageUrl.includes('/video/upload/'));

  // IntersectionObserver: Only play videos that are in or near viewport.
  // This frees GPU & network from decoding off-screen videos, guaranteeing buttery smooth playback.
  useEffect(() => {
    if (!isVideo) return;
    const cardEl = cardRef.current;
    const videoEl = videoRef.current;
    if (!cardEl || !videoEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoEl.defaultMuted = true;
            videoEl.muted = true;
            if (videoEl.paused) {
              videoEl.play().catch(() => {});
            }
          } else {
            if (!videoEl.paused) {
              videoEl.pause();
            }
          }
        });
      },
      { threshold: 0.05, rootMargin: '120px' }
    );

    observer.observe(cardEl);
    return () => observer.disconnect();
  }, [isVideo]);

  // Resume playback smoothly if browser tab or window changes visibility
  useEffect(() => {
    if (!isVideo) return;
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && videoRef.current) {
        videoRef.current.defaultMuted = true;
        videoRef.current.muted = true;
        if (videoRef.current.paused) {
          videoRef.current.play().catch(() => {});
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isVideo]);

  const displayImage = ytId
    ? getYoutubeThumbnailUrl(ytId)
    : isVideo
    ? getVideoPosterUrl(item.imageUrl)
    : getHdMediaUrl(item.imageUrl, 'image');

  return (
    <div
      ref={cardRef}
      onClick={onSelect}
      className="group relative flex-shrink-0 w-72 sm:w-80 md:w-[340px] bg-neutral-950 border-r border-neutral-800 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:border-amber-400/70 hover:shadow-2xl hover:scale-[1.01]"
    >
      {/* ---------- TOP SPROCKET MARGIN ---------- */}
      <div className="h-8 bg-[#08080a] border-b border-neutral-800 flex items-center justify-between px-3">
        <div className="flex items-center space-x-2">
          {[...Array(6)].map((_, sIdx) => (
            <span
              key={sIdx}
              className="w-3 h-2 rounded-[2px] bg-neutral-700/80 group-hover:bg-amber-400/80 transition-colors block shadow-2xs"
            />
          ))}
        </div>

        <div className="flex items-center space-x-1.5 text-[9px] font-mono tracking-wider text-amber-400 uppercase font-bold">
          <span>35MM FILM</span>
          <span className="text-neutral-400">▶ {frameNum}A</span>
        </div>
      </div>

      {/* ---------- APERTURE PHOTO / VIDEO FRAME ---------- */}
      <div className="relative aspect-[4/3] bg-neutral-900 overflow-hidden mx-1.5 my-1.5 border border-neutral-800 rounded-sm group-hover:border-amber-400/80 transition-all">
        {ytId ? (
          <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
            <img
              src={getYoutubeThumbnailUrl(ytId)}
              alt={language === 'kn' ? item.titleKn : item.titleEn}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-black/25 flex items-center justify-center group-hover:bg-black/10 transition-colors">
              <div className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                <Play className="w-4 h-4 fill-white translate-x-0.5" />
              </div>
            </div>
            <div className="absolute bottom-2 right-2 z-10 flex items-center space-x-1 px-2 py-0.5 rounded bg-black/85 border border-red-500/50 text-[9px] font-mono font-bold text-red-400 backdrop-blur-md">
              <Youtube className="w-3 h-3 text-red-500" />
              <span>YOUTUBE</span>
            </div>
          </div>
        ) : isVideo ? (
          <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
            <video
              ref={(el) => {
                videoRef.current = el;
                if (el) {
                  el.defaultMuted = true;
                  el.muted = true;
                }
              }}
              src={getReelMediaUrl(item.imageUrl, 'video')}
              poster={getVideoPosterUrl(item.imageUrl)}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              onCanPlay={(e) => {
                const el = e.currentTarget;
                el.defaultMuted = true;
                el.muted = true;
              }}
              onLoadedData={(e) => {
                const el = e.currentTarget;
                el.defaultMuted = true;
                el.muted = true;
              }}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108 pointer-events-none"
            />
            {/* Video Indicator Stamp */}
            <div className="absolute bottom-2 right-2 z-10 flex items-center space-x-1 px-2 py-0.5 rounded bg-black/85 border border-red-500/50 text-[9px] font-mono font-bold text-red-400 backdrop-blur-md pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span>VIDEO</span>
            </div>
          </div>
        ) : displayImage ? (
          <img
            src={displayImage}
            alt={language === 'kn' ? item.titleKn : item.titleEn}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full bg-[#111114] flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-1.5 z-10 group-hover:border-amber-400/60 transition-colors">
              <Film className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-[11px] text-neutral-400 font-sans z-10">
              {language === 'kn' ? item.titleKn : item.titleEn}
            </span>
          </div>
        )}

        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

        {/* Frame & Year Connected Stamp */}
        <div className="absolute top-2 left-2 z-10 flex items-center space-x-1.5">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/80 border border-white/20 text-amber-300 backdrop-blur-sm">
            FRAME {frameNum}A
          </span>
          {item.year && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-amber-400 text-neutral-950 shadow-md">
              {item.year} UTSAV
            </span>
          )}
        </div>

        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="w-6 h-6 rounded-full bg-amber-400/90 text-neutral-950 flex items-center justify-center shadow-lg">
            <Maximize2 className="w-3 h-3" />
          </span>
        </div>

        {/* Clean Film Frame Caption (Single year display) */}
        <div className="absolute bottom-2 inset-x-2 z-10 bg-black/70 backdrop-blur-xs rounded px-2.5 py-1 border border-white/10">
          <p className="text-[11px] font-mono font-bold text-amber-300 flex items-center space-x-1.5 truncate">
            <span className="text-amber-400 shrink-0">{item.year}</span>
            <span className="text-white/40 shrink-0">•</span>
            <span className="text-white/95 font-sans font-medium truncate">
              {language === 'kn'
                ? (item.titleKn || item.descriptionKn || 'ಉತ್ಸವ ದರ್ಶನ').replace(new RegExp(`^${item.year}\\s*[•\\-]\\s*`, 'i'), '')
                : (item.titleEn || item.descriptionEn || 'Festival Darshan').replace(new RegExp(`^${item.year}\\s*[•\\-]\\s*`, 'i'), '')}
            </span>
          </p>
        </div>
      </div>

      {/* ---------- BOTTOM SPROCKET MARGIN ---------- */}
      <div className="h-8 bg-[#08080a] border-t border-neutral-800 flex items-center justify-between px-3">
        <div className="flex items-center space-x-1.5 text-[9px] font-mono tracking-wider text-amber-400 uppercase font-bold">
          <span>KADALAGI KHOOT</span>
          <span className="text-neutral-400">• ESTD 2019</span>
        </div>

        <div className="flex items-center space-x-2">
          {[...Array(6)].map((_, sIdx) => (
            <span
              key={sIdx}
              className="w-3 h-2 rounded-[2px] bg-neutral-700/80 group-hover:bg-amber-400/80 transition-colors block shadow-2xs"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export const DarshanCarousel: React.FC = () => {
  const { language } = useLanguage();
  const [cloudItems, setCloudItems] = useState<MediaItem[]>([]);
  const [historyItems, setHistoryItems] = useState<HistoryMilestoneDoc[]>([]);
  const [sevaItems, setSevaItems] = useState<AchievementDoc[]>([]);
  const [eventItems, setEventItems] = useState<CommunityEventDoc[]>([]);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Clear legacy localStorage cache on mount so no stale cached items ever flash
  useEffect(() => {
    try {
      localStorage.removeItem('cym_reel_items_cache');
    } catch (e) {}
  }, []);

  // Subscribe in real-time to Media Library, History Milestones, Seva Initiatives, and Community Events
  useEffect(() => {
    const unsubMedia = subscribeToPublicMedia('carousel', (items) => {
      setCloudItems(items || []);
    });

    const unsubHistory = subscribeToHistory((items) => {
      // Include history milestones where showIn35mm is enabled (or has coverImage and not explicitly false)
      const reelHistory = items.filter(
        (h) =>
          h.isActive !== false &&
          Boolean(h.coverImage) &&
          (h.showIn35mm === true || h.showIn35mm === undefined)
      );
      setHistoryItems(reelHistory);
    });

    const unsubAchievements = subscribeToAchievements((items) => {
      // Include seva initiatives where showIn35mm is enabled
      const reelSeva = items.filter(
        (a) =>
          a.isActive !== false &&
          a.showIn35mm === true &&
          Boolean(a.mediaUrl || a.imageUrl)
      );
      setSevaItems(reelSeva);
    });

    const unsubEvents = subscribeToEvents((items) => {
      // Include community events where showIn35mm is enabled (or not explicitly false)
      const reelEvents = items.filter(
        (e) =>
          e.isActive !== false &&
          (e.showIn35mm === true || e.showIn35mm === undefined) &&
          Boolean(e.mediaUrl)
      );
      setEventItems(reelEvents);
    });

    return () => {
      unsubMedia();
      unsubHistory();
      unsubAchievements();
      unsubEvents();
    };
  }, []);

  // Merge all sources into GalleryItems connected through the festival years
  const galleryMapped: GalleryItem[] = useMemo(() => {
    const items: GalleryItem[] = [];

    // 1. Media Library items tagged for 35mm reel
    cloudItems.forEach((c) => {
      const isVideo =
        c.mediaType === 'video' ||
        /\.(mp4|webm|mov|ogg|m4v)($|\?)/i.test(c.mediaUrl) ||
        Boolean(c.mediaUrl && c.mediaUrl.includes('/video/upload/'));

      items.push({
        id: c.id,
        year: c.year || 2026,
        category: (c.category as GalleryItem['category']) || 'darshan',
        titleEn: c.titleEn || 'CYM 35mm Celluloid Archive',
        titleKn: c.titleKn || 'ಚಾಣಕ್ಯ ಯುವಕ ಮಂಡಳ 35mm ಸಾಕ್ಷ್ಯಚಿತ್ರ',
        imageUrl: c.mediaUrl,
        mediaType: isVideo ? 'video' : 'image',
        descriptionEn: c.descriptionEn || `${c.year || 2026} • 35mm Archival Reel`,
        descriptionKn: c.descriptionKn || `${c.year || 2026} • 35mm ಐತಿಹಾಸಿಕ ರೀಲ್ ಸಂಗ್ರಹ`,
      });
    });

    // 2. Festival History Milestones connected by year
    historyItems.forEach((h) => {
      if (!h.coverImage) return;
      const isVideo =
        h.mediaType === 'video' ||
        /\.(mp4|webm|mov|ogg|m4v)($|\?)/i.test(h.coverImage) ||
        h.coverImage.includes('/video/upload/');

      items.push({
        id: `hist-${h.id}`,
        year: h.year || 2026,
        category: 'pandal',
        titleEn: h.titleEn || `${h.year} Royal Ganesh Mahotsav`,
        titleKn: h.titleKn || `${h.year} ಶ್ರೀ ಗಣೇಶ ಮಹೋತ್ಸವ`,
        imageUrl: h.coverImage,
        mediaType: isVideo ? 'video' : 'image',
        themeEn: h.pandalThemeEn,
        themeKn: h.pandalThemeKn,
        highlightsEn: h.highlightsEn,
        highlightsKn: h.highlightsKn,
        descriptionEn: h.summaryEn || (h.pandalThemeEn ? `Theme: ${h.pandalThemeEn}` : `${h.year} Festival Milestone`),
        descriptionKn: h.summaryKn || (h.pandalThemeKn ? `ಮಂಟಪ ಥೀಮ್: ${h.pandalThemeKn}` : `${h.year} ಹಬ್ಬದ ಐತಿಹಾಸಿಕ ಸಾಕ್ಷ್ಯಚಿತ್ರ`),
      });
    });

    // 3. Seva Initiatives with photos/videos connected by year
    sevaItems.forEach((a) => {
      const mediaList: { url: string; type: 'image' | 'video' }[] = [];
      if (a.galleryMedia && a.galleryMedia.length > 0) {
        a.galleryMedia.forEach((m) => {
          if (m.url) mediaList.push({ url: m.url, type: m.type });
        });
      } else if (a.mediaUrl || a.imageUrl) {
        mediaList.push({
          url: a.mediaUrl || a.imageUrl || '',
          type: (a.mediaType || 'image') as 'image' | 'video',
        });
      }

      const parsedYear =
        a.year ||
        (a.eventDate ? parseInt(a.eventDate.match(/\d{4}/)?.[0] || '2026') : 2026);

      mediaList.forEach((m, mIdx) => {
        if (!m.url) return;
        const isVideo =
          m.type === 'video' ||
          /\.(mp4|webm|mov|ogg|m4v)($|\?)/i.test(m.url) ||
          m.url.includes('/video/upload/');

        items.push({
          id: `seva-${a.id}-${mIdx}`,
          year: parsedYear,
          category: 'seva',
          titleEn: a.titleEn || 'Seva Initiative',
          titleKn: a.titleKn || 'ಸೇವಾ ಕೈಂಕರ್ಯ',
          imageUrl: m.url,
          mediaType: isVideo ? 'video' : 'image',
          sponsorNameEn: a.sponsorNameEn,
          sponsorNameKn: a.sponsorNameKn,
          eventDate: a.eventDate,
          highlightsEn: a.highlightsEn,
          highlightsKn: a.highlightsKn,
          descriptionEn: a.descriptionEn || 'Devotional community seva drive.',
          descriptionKn: a.descriptionKn || 'ದಿವ್ಯ ಸಮುದಾಯ ಸೇವಾ ದಾಖಲೆ.',
        });
      });
    });

    // 4. Community Events & Extra-Curricular initiatives
    eventItems.forEach((ev) => {
      const mediaList: { url: string; type: 'image' | 'video' }[] = [];
      if (ev.galleryMedia && ev.galleryMedia.length > 0) {
        ev.galleryMedia.forEach((m) => {
          if (m.url) mediaList.push({ url: m.url, type: m.type });
        });
      } else if (ev.mediaUrl) {
        mediaList.push({
          url: ev.mediaUrl,
          type: (ev.mediaType || 'image') as 'image' | 'video',
        });
      }

      mediaList.forEach((m, mIdx) => {
        if (!m.url) return;
        const isVideo =
          m.type === 'video' ||
          /\.(mp4|webm|mov|ogg|m4v)($|\?)/i.test(m.url) ||
          m.url.includes('/video/upload/');

        items.push({
          id: `evt-${ev.id}-${mIdx}`,
          year: ev.year || 2026,
          category: 'cultural',
          titleEn: ev.titleEn || 'CYM Community Activity',
          titleKn: ev.titleKn || 'ಚಾಣಕ್ಯ ಯುವಕ ಮಂಡಳ ಸಾಮಾಜಿಕ ಕಾರ್ಯಕ್ರಮ',
          imageUrl: m.url,
          mediaType: isVideo ? 'video' : 'image',
          eventDate: ev.eventDate,
          highlightsEn: ev.highlightsEn,
          highlightsKn: ev.highlightsKn,
          descriptionEn: ev.descriptionEn || `${ev.year || 2026} • Community Initiative`,
          descriptionKn: ev.descriptionKn || `${ev.year || 2026} • ಸಾರ್ವಜನಿಕ ಸೇವಾ ಕಾರ್ಯಕ್ರಮ`,
        });
      });
    });

    // Deduplicate by media URL
    const seen = new Set<string>();
    const unique = items.filter((item) => {
      if (!item.imageUrl) return false;
      if (seen.has(item.imageUrl)) return false;
      seen.add(item.imageUrl);
      return true;
    });

    // MIX ALL YEARS RANDOMLY (User requirement: display mixture of all years randomly)
    // Deterministic pseudo-random shuffle so order is stable during a user session
    const shuffled = [...unique];
    let seed = 98765;
    const rng = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  }, [cloudItems, historyItems, sevaItems, eventItems]);

  // Compute connected festival years
  const connectedYears = useMemo(() => {
    const years = Array.from(new Set(galleryMapped.map((i) => i.year))).filter(Boolean).sort((a, b) => b - a);
    return years;
  }, [galleryMapped]);

  // Ensure enough items so the reel spans comfortably across ultra-wide monitors
  const baseReelList = useMemo(() => {
    if (galleryMapped.length === 0) return [];
    let list = [...galleryMapped];
    while (list.length < 8) {
      list = [...list, ...galleryMapped];
    }
    return list;
  }, [galleryMapped]);

  // Seamless 2-part reel: -50% translateX animation resets seamlessly with 0 visual glitch
  const seamlessReel = useMemo(() => {
    if (baseReelList.length === 0) return [];
    return [...baseReelList, ...baseReelList];
  }, [baseReelList]);

  // Constant slow speed calculation:
  // Each 35mm frame rolls at a fixed, slow, serene pace (~7.5s per frame)
  // Regardless of whether there are 10, 25, or 60 photos, the rolling speed is identical and calm
  const reelDurationSeconds = useMemo(() => {
    if (baseReelList.length === 0) return 60;
    const secondsPerFrame = 7.5; // Calm, relaxing, slow cinematic speed
    return Math.max(50, Math.round(baseReelList.length * secondsPerFrame));
  }, [baseReelList]);

  // Devotional Filmstrip Skeleton while initial network connection resolves
  if (galleryMapped.length === 0) {
    return (
      <section
        id="explore-section"
        data-theme="dark"
        className="py-12 sm:py-16 md:py-20 bg-[#0a0a0c] text-white border-t border-b border-neutral-900 relative overflow-hidden select-none"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between pb-5 mb-6 border-b border-neutral-800/80">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 animate-pulse">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <div className="h-4 w-36 bg-neutral-800 rounded animate-pulse mb-1" />
                <div className="h-3 w-56 bg-neutral-800/60 rounded animate-pulse" />
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4 overflow-hidden opacity-60">
            {[...Array(4)].map((_, idx) => (
              <div
                key={idx}
                className="w-72 sm:w-80 md:w-[340px] h-64 bg-neutral-900/60 border border-neutral-800 rounded-sm shrink-0 flex flex-col justify-between p-2"
              >
                <div className="flex justify-between">
                  <div className="flex space-x-1">
                    {[...Array(4)].map((_, s) => (
                      <span key={s} className="w-3 h-2 rounded-[2px] bg-neutral-800 block" />
                    ))}
                  </div>
                  <span className="w-12 h-2 rounded bg-neutral-800 block" />
                </div>
                <div className="h-40 bg-neutral-950/80 rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-neutral-800 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const handleManualScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 350;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section
      id="explore-section"
      data-theme="dark"
      className="py-14 sm:py-20 md:py-24 bg-[#0a0a0c] text-white border-t border-b border-neutral-900 relative overflow-hidden select-none"
    >
      {/* Devotional Ambient Light Backdrops */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ================= SECTION HEADER ================= */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between pb-5 sm:pb-6 mb-6 sm:mb-8 gap-4 border-b border-neutral-800/80">
          <div>
            <div className="inline-flex items-center space-x-2 text-amber-400 bg-amber-500/10 border border-amber-400/30 px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider mb-2.5">
              <Film className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'kn' ? '35mm ಫಿಲ್ಮ್ ರೀಲ್ ಸಿಸ್ಟಮ್' : '35MM CINEMATIC REEL'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse ml-1" />
            </div>

            <h2
              className={`text-white text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-snug ${
                language === 'kn' ? 'font-kannada' : 'font-sans'
              }`}
            >
              {language === 'kn' ? (
                <span>
                  ಉತ್ಸವ ದರ್ಶನ ಮತ್ತು <span className="text-amber-400">ಫಿಲ್ಮ್ ಸಂಗ್ರಹ</span>
                </span>
              ) : (
                <span>
                  SACRED FESTIVAL & <span className="text-amber-400">ARCHIVAL REEL</span>
                </span>
              )}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 font-sans mt-1">
              {language === 'kn'
                ? 'ಕಡಲಗಿ ಖೂಟದ ದಿವ್ಯ ಆಚರಣೆಯ 35mm ಸಾಕ್ಷ್ಯಚಿತ್ರ ಚೌಕಟ್ಟುಗಳು • ವರ್ಷವಾರು ಇತಿಹಾಸ ಸಂಗ್ರಹ.'
                : '35mm celluloid frames documenting royal celebrations in Yamakanmardi across festival years.'}
            </p>

            {/* Connected Years Timeline Indicator */}
            {connectedYears.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider font-bold flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-amber-400" />
                  <span>{language === 'kn' ? 'ವರ್ಷಗಳ ಪಯಣ:' : 'TIMELINE:'}</span>
                </span>
                {connectedYears.map((yr) => (
                  <Link
                    key={yr}
                    to={`/gallery?year=${yr}`}
                    className="px-2.5 py-0.5 rounded-full bg-amber-400/15 hover:bg-amber-400/30 border border-amber-400/35 hover:border-amber-400 text-[10px] font-mono font-bold text-amber-300 transition-all cursor-pointer shadow-xs"
                    title={`View ${yr} Darshan Gallery`}
                  >
                    {yr}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Controls & External Links */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:space-x-3 w-full sm:w-auto">
            {/* Play/Pause & Scroll Nudge Controls */}
            <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto">
              <div className="flex items-center space-x-1.5 bg-neutral-900/90 border border-neutral-800 rounded-full px-2.5 py-1.5 shadow-sm shrink-0">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-300 hover:text-amber-400 transition-colors cursor-pointer"
                  title={isPlaying ? 'Pause Reel' : 'Play Reel'}
                  aria-label={isPlaying ? 'Pause Reel' : 'Play Reel'}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-amber-400" />}
                </button>
                <button
                  onClick={() => handleManualScroll('left')}
                  className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  title="Scroll Left"
                  aria-label="Scroll Left"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleManualScroll('right')}
                  className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  title="Scroll Right"
                  aria-label="Scroll Right"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Mobile-only 35mm Status Indicator */}
              <div className="sm:hidden inline-flex items-center space-x-1.5 text-[10px] font-mono font-bold tracking-wider text-amber-400/80 bg-neutral-900/80 border border-neutral-800 px-3 py-1 rounded-full uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>35MM REEL</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center sm:gap-2.5">
              <a
                href={siteConfig.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-full bg-red-600/90 hover:bg-red-600 text-white transition-all shadow-sm font-bold text-xs cursor-pointer active:scale-98"
                title="Official YouTube Channel"
              >
                <Youtube className="w-3.5 h-3.5 shrink-0" />
                <span className="font-mono text-[11px] uppercase tracking-wider">
                  {language === 'kn' ? 'ಯೂಟ್ಯೂಬ್' : 'YOUTUBE'}
                </span>
              </a>

              <Link
                to="/gallery"
                className="inline-flex items-center justify-center space-x-1.5 px-3 py-2 sm:px-5 sm:py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-neutral-950 transition-all shadow-sm font-bold text-xs group cursor-pointer active:scale-98 whitespace-nowrap"
              >
                <span className="font-sans text-xs uppercase tracking-wider font-bold">
                  {language === 'kn' ? 'ಎಲ್ಲಾ ಚಿತ್ರಗಳು' : 'ALL ARCHIVES'}
                </span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 35MM CINEMA FILMSTRIP REEL ================= */}
      <div
        ref={scrollContainerRef}
        className="relative w-full overflow-hidden no-scrollbar select-none cursor-grab active:cursor-grabbing py-2"
      >
        <div
          className={`animate-film-reel flex items-stretch ${
            !isPlaying ? 'film-reel-paused' : ''
          }`}
          style={{
            animationDuration: `${reelDurationSeconds}s`,
          }}
        >
          {seamlessReel.map((item, idx) => {
            const frameNum = String((idx % galleryMapped.length) + 1).padStart(2, '0');
            return (
              <ReelItemCard
                key={`${item.id}-${idx}`}
                item={item}
                frameNum={frameNum}
                language={language}
                onSelect={() => setSelectedItem(item)}
              />
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedItem && (
        <LightboxModal
          item={selectedItem}
          items={galleryMapped}
          onClose={() => setSelectedItem(null)}
          onNavigate={(nextItem) => setSelectedItem(nextItem)}
        />
      )}
    </section>
  );
};
