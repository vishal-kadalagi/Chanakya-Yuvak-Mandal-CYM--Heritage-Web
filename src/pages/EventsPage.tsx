import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  Sparkles,
  Calendar,
  MapPin,
  CheckCircle2,
  Users,
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Film,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import {
  subscribeToEvents,
  CommunityEventDoc,
  EventCategory,
  EventMediaItem,
} from '../services/eventsService';
import { getHdMediaUrl, getVideoPosterUrl } from '../utils/mediaUtils';

interface EventMediaGalleryProps {
  galleryMedia?: EventMediaItem[];
  primaryUrl?: string;
  primaryType?: 'image' | 'video';
  title: string;
  badge: { labelKn: string; labelEn: string; bg: string };
  year?: number;
  eventDate?: string;
  language: string;
  onOpenLightbox?: (index: number, mediaList: { url: string; type: 'image' | 'video' }[]) => void;
}

const EventMediaGallery: React.FC<EventMediaGalleryProps> = ({
  galleryMedia,
  primaryUrl,
  primaryType = 'image',
  title,
  badge,
  year,
  eventDate,
  language,
  onOpenLightbox,
}) => {
  const mediaList = useMemo(() => {
    if (galleryMedia && galleryMedia.length > 0) {
      return galleryMedia;
    }
    if (primaryUrl) {
      const isVideo =
        primaryType === 'video' ||
        primaryUrl.toLowerCase().includes('.mp4') ||
        primaryUrl.toLowerCase().includes('.webm') ||
        primaryUrl.toLowerCase().includes('.mov') ||
        primaryUrl.toLowerCase().includes('/video/upload/');
      return [{ url: primaryUrl, type: isVideo ? ('video' as const) : ('image' as const) }];
    }
    return [];
  }, [galleryMedia, primaryUrl, primaryType]);

  const [currentIndex, setCurrentIndex] = useState(0);

  if (mediaList.length === 0) {
    return (
      <div className="p-4 pb-0 flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
            {language === 'kn' ? badge.labelKn : badge.labelEn}
          </span>
          {year && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-100 text-neutral-800 border border-neutral-300">
              {year}
            </span>
          )}
        </div>
        {eventDate && (
          <span className="text-[11px] font-mono font-bold text-neutral-500 flex items-center space-x-1">
            <Calendar className="w-3 h-3 text-amber-600" />
            <span>{eventDate}</span>
          </span>
        )}
      </div>
    );
  }

  const currentItem = mediaList[currentIndex] || mediaList[0];
  const isCurrentVideo =
    currentItem.type === 'video' ||
    currentItem.url.toLowerCase().includes('.mp4') ||
    currentItem.url.toLowerCase().includes('.webm') ||
    currentItem.url.toLowerCase().includes('.mov') ||
    currentItem.url.toLowerCase().includes('/video/upload/');

  return (
    <div className="space-y-2">
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-neutral-950 flex items-center justify-center">
        {isCurrentVideo ? (
          <video
            ref={(el) => {
              if (el) {
                el.defaultMuted = true;
                el.muted = true;
                el.play().catch(() => {});
              }
            }}
            key={currentItem.url}
            src={getHdMediaUrl(currentItem.url, 'video')}
            poster={getVideoPosterUrl(currentItem.url)}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => onOpenLightbox?.(currentIndex, mediaList)}
          />
        ) : (
          <img
            key={currentItem.url}
            src={getHdMediaUrl(currentItem.url, 'image')}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
            onClick={() => onOpenLightbox?.(currentIndex, mediaList)}
          />
        )}

        {/* Fullscreen HD Expand Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenLightbox?.(currentIndex, mediaList);
          }}
          className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-white/90 hover:text-white border border-white/20 transition-all cursor-pointer shadow-md"
          title="Fullscreen / ವಿಸ್ತರಿಸಿ"
          aria-label="Fullscreen"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {/* Floating Badges on Media */}
        <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5 z-10 pointer-events-none">
          {isCurrentVideo && (
            <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-sm text-amber-400 text-[10px] font-mono font-bold flex items-center space-x-1 border border-amber-400/30">
              <Film className="w-3 h-3" />
              <span>VID</span>
            </span>
          )}
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md shadow-sm ${badge.bg}`}>
            {language === 'kn' ? badge.labelKn : badge.labelEn}
          </span>
          {year && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-900/90 text-amber-300 border border-amber-400/40 backdrop-blur-md shadow-sm">
              {year}
            </span>
          )}
          {mediaList.length > 1 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/80 text-white border border-white/20 backdrop-blur-md shadow-sm">
              {currentIndex + 1} / {mediaList.length}
            </span>
          )}
        </div>

        {eventDate && (
          <div className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-neutral-700 text-amber-300 text-[10px] font-mono font-bold flex items-center space-x-1 shadow pointer-events-none">
            <Calendar className="w-3 h-3 text-amber-400" />
            <span>{eventDate}</span>
          </div>
        )}

        {/* Previous / Next Arrows if multiple media */}
        {mediaList.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer shadow-md"
              aria-label="Previous Media"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex((prev) => (prev === mediaList.length - 1 ? 0 : prev + 1));
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer shadow-md"
              aria-label="Next Media"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Mini Thumbnail Strip if >1 item */}
      {mediaList.length > 1 && (
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 px-3 no-scrollbar">
          {mediaList.map((m, idx) => {
            const isVid = m.type === 'video' || m.url.match(/\.(mp4|webm|mov)$/i);
            const isSelected = idx === currentIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-12 h-9 rounded-lg overflow-hidden border shrink-0 transition-all cursor-pointer bg-neutral-900 ${
                  isSelected
                    ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105'
                    : 'border-neutral-300/80 opacity-70 hover:opacity-100'
                }`}
              >
                {isVid ? (
                  <img src={getVideoPosterUrl(m.url)} alt={`Thumb ${idx}`} className="w-full h-full object-cover pointer-events-none" />
                ) : (
                  <img src={m.url} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                )}
                {isVid && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                    <Film className="w-2.5 h-2.5 text-amber-300" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const EventsPage: React.FC = () => {
  const { language } = useLanguage();
  const [events, setEvents] = useState<CommunityEventDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'all'>('all');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [lightboxState, setLightboxState] = useState<{
    items: { url: string; type: 'image' | 'video' }[];
    currentIndex: number;
    title: string;
  } | null>(null);

  const toggleCardExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  useEffect(() => {
    if (!lightboxState) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxState(null);
      if (e.key === 'ArrowLeft' && lightboxState.items.length > 1) {
        setLightboxState((prev) =>
          prev
            ? {
                ...prev,
                currentIndex: (prev.currentIndex - 1 + prev.items.length) % prev.items.length,
              }
            : null
        );
      }
      if (e.key === 'ArrowRight' && lightboxState.items.length > 1) {
        setLightboxState((prev) =>
          prev
            ? {
                ...prev,
                currentIndex: (prev.currentIndex + 1) % prev.items.length,
              }
            : null
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxState]);

  useEffect(() => {
    const unsubscribe = subscribeToEvents((items) => {
      setEvents(items.filter((e) => e.isActive !== false));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    events.forEach((e) => {
      if (e.year) yearsSet.add(e.year);
    });
    if (yearsSet.size === 0) {
      [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019].forEach((y) => yearsSet.add(y));
    }
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [events]);

  const categoryOptions: { id: EventCategory | 'all'; labelKn: string; labelEn: string; icon: string }[] = [
    { id: 'all', labelKn: 'ಎಲ್ಲಾ ಕಾರ್ಯಕ್ರಮಗಳು', labelEn: 'All Activities', icon: '✦' },
    { id: 'sports', labelKn: 'ಕ್ರೀಡಾ ಪಂದ್ಯಾವಳಿ', labelEn: 'Sports', icon: '🏆' },
    { id: 'health', labelKn: 'ಆರೋಗ್ಯ & ರಕ್ತದಾನ', labelEn: 'Health & Blood Seva', icon: '❤️' },
    { id: 'education', labelKn: 'ಶಿಕ್ಷಣ ಸೇವೆ', labelEn: 'Education Support', icon: '🎓' },
    { id: 'social', labelKn: 'ಸಮಾಜ ಸೇವೆ', labelEn: 'Social Welfare', icon: '🤝' },
    { id: 'cultural', labelKn: 'ಸಾಂಸ್ಕೃತಿಕ & ಉತ್ಸವ', labelEn: 'Cultural & Festival', icon: '✨' },
  ];

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const matchesCategory = selectedCategory === 'all' || evt.category === selectedCategory;
      const matchesYear = selectedYear === 'all' || evt.year === selectedYear;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory && matchesYear;

      const matchesSearch =
        (evt.titleKn && evt.titleKn.toLowerCase().includes(q)) ||
        (evt.titleEn && evt.titleEn.toLowerCase().includes(q)) ||
        (evt.descriptionKn && evt.descriptionKn.toLowerCase().includes(q)) ||
        (evt.descriptionEn && evt.descriptionEn.toLowerCase().includes(q)) ||
        (evt.eventDate && evt.eventDate.toLowerCase().includes(q)) ||
        (evt.locationKn && evt.locationKn.toLowerCase().includes(q)) ||
        (evt.locationEn && evt.locationEn.toLowerCase().includes(q));

      return matchesCategory && matchesYear && matchesSearch;
    });
  }, [events, selectedCategory, selectedYear, searchQuery]);

  const getCategoryBadge = (cat: EventCategory) => {
    switch (cat) {
      case 'sports':
        return {
          labelKn: 'ಕ್ರೀಡಾ ಕೂಟ',
          labelEn: 'Sports Tournament',
          bg: 'bg-emerald-500/15 text-emerald-800 border-emerald-400/40',
        };
      case 'health':
        return {
          labelKn: 'ಆರೋಗ್ಯ & ರಕ್ತದಾನ',
          labelEn: 'Health & Blood Seva',
          bg: 'bg-rose-500/15 text-rose-800 border-rose-400/40',
        };
      case 'education':
        return {
          labelKn: 'ಶೈಕ್ಷಣಿಕ ಸೇವೆ',
          labelEn: 'Education Support',
          bg: 'bg-blue-500/15 text-blue-800 border-blue-400/40',
        };
      case 'social':
        return {
          labelKn: 'ಸಮಾಜ ಕಲ್ಯಾಣ',
          labelEn: 'Social Welfare',
          bg: 'bg-amber-500/15 text-amber-900 border-amber-400/40',
        };
      case 'cultural':
        return {
          labelKn: 'ಸಾಂಸ್ಕೃತಿಕ ಆಚರಣೆ',
          labelEn: 'Cultural Heritage',
          bg: 'bg-purple-500/15 text-purple-800 border-purple-400/40',
        };
      default:
        return {
          labelKn: 'ವಿಶೇಷ ಕಾರ್ಯಕ್ರಮ',
          labelEn: 'Special Event',
          bg: 'bg-neutral-500/15 text-neutral-800 border-neutral-400/40',
        };
    }
  };

  return (
    <div className="pt-24 sm:pt-28 md:pt-32 pb-16 md:pb-24 bg-gradient-to-b from-[#FDFBF7] via-white to-[#F8F6F0] min-h-screen relative overflow-hidden">
      {/* Devotional Ambient Glows */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ================= COMPACT LUXURY HEADER ================= */}
        <div className="text-center max-w-2xl mx-auto mb-4 sm:mb-6">
          <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500/15 to-amber-400/25 border border-amber-400/40 text-[11px] font-mono font-bold uppercase tracking-wider text-amber-950 mb-2 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{language === 'kn' ? 'ಯುವ ಸಮಾಜ ಸೇವೆ • ಸ್ಥಾಪನೆ 2019' : 'COMMUNITY INITIATIVES • ESTD 2019'}</span>
          </div>

          <h1
            className={`text-2xl sm:text-3xl md:text-4xl font-black text-neutral-950 tracking-tight leading-tight ${
              language === 'kn' ? 'font-kannada' : 'font-sans'
            }`}
          >
            {language === 'kn' ? (
              <span>
                ಇತರ ಚಟುವಟಿಕೆಗಳು & <span className="text-[#D48B00]">ವಿಶೇಷ ಕಾರ್ಯಕ್ರಮಗಳು</span>
              </span>
            ) : (
              <span>
                EXTRA-CURRICULAR & <span className="text-[#D48B00]">COMMUNITY EVENTS</span>
              </span>
            )}
          </h1>

          <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm text-neutral-600 font-sans max-w-lg mx-auto">
            {language === 'kn'
              ? 'ಕಡಲಗಿ ಖೂಟ • ಕ್ರೀಡೆ, ಶಿಕ್ಷಣ, ಆರೋಗ್ಯ ಮತ್ತು ಯುವ ಸಬಲೀಕರಣ ಕಾರ್ಯಕ್ರಮಗಳು'
              : 'Kadalagi Khoot • Sports, Healthcare, Education & Youth Community Initiatives'}
          </p>
        </div>

        {/* ================= COMPACT FILTER TOOLBAR (SEARCH + DROPDOWNS) ================= */}
        <div className="p-2 sm:p-2.5 rounded-2xl bg-white/90 border border-amber-200/90 shadow-xs mb-6 sm:mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Left: Quick Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'kn'
                  ? 'ಕಾರ್ಯಕ್ರಮ ಹುಡುಕಿ (ಕ್ರಿಕೆಟ್, ರಕ್ತದಾನ...)'
                  : 'Search activities (cricket, health...)'
              }
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-amber-50/50 border border-amber-300/80 text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-amber-500 shadow-2xs transition-all"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Right: Dropdowns & Count */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Dropdown */}
            <div className="relative flex-1 sm:flex-initial min-w-[170px]">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as EventCategory | 'all')}
                className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl bg-amber-50/60 border border-amber-300/80 text-xs sm:text-sm font-bold text-neutral-900 focus:outline-none focus:border-amber-500 cursor-pointer transition-all shadow-2xs"
              >
                {categoryOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.icon} {language === 'kn' ? opt.labelKn : opt.labelEn}
                  </option>
                ))}
              </select>
              <Filter className="w-3.5 h-3.5 text-amber-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Year Dropdown */}
            {availableYears.length > 0 && (
              <div className="relative min-w-[130px]">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl bg-amber-50/60 border border-amber-300/80 text-xs sm:text-sm font-bold text-neutral-900 focus:outline-none focus:border-amber-500 cursor-pointer transition-all shadow-2xs font-mono"
                >
                  <option value="all">📅 {language === 'kn' ? 'ಎಲ್ಲಾ ವರ್ಷಗಳು' : 'All Years'}</option>
                  {availableYears.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
                <Calendar className="w-3.5 h-3.5 text-amber-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}

            {/* Total Results Count */}
            <div className="text-[11px] sm:text-xs font-mono font-bold text-amber-900 bg-amber-100/70 border border-amber-300 px-3 py-1 rounded-xl shrink-0">
              {filteredEvents.length} {language === 'kn' ? 'ಕಾರ್ಯಕ್ರಮಗಳು' : 'Events'}
            </div>
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-3xl border border-amber-200/60 p-6 animate-pulse space-y-4 h-80" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredEvents.length === 0 && (
          <div className="bg-white rounded-3xl border border-amber-200/90 p-8 sm:p-14 text-center max-w-xl mx-auto shadow-sm my-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-700 mb-4">
              <Trophy className="w-7 h-7" />
            </div>

            <h3 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight">
              {language === 'kn' ? 'ಯಾವುದೇ ಕಾರ್ಯಕ್ರಮಗಳು ಕಂಡುಬಂದಿಲ್ಲ' : 'No Activities Found'}
            </h3>

            <p className="text-xs sm:text-sm text-neutral-600 mt-2 font-sans max-w-md mx-auto leading-relaxed">
              {language === 'kn'
                ? 'ನೀವು ಆಯ್ಕೆಮಾಡಿದ ವಿಭಾಗದಲ್ಲಿ ಸದ್ಯಕ್ಕೆ ಯಾವುದೇ ಮಾಹಿತಿ ಇಲ್ಲ. ಶೀಘ್ರದಲ್ಲೇ ಹೊಸ ಕಾರ್ಯಕ್ರಮಗಳು ಸೇರಿಸಲಾಗುವುದು.'
                : 'No activities found matching your selected category. Check back soon for updates.'}
            </p>
          </div>
        )}

        {/* Events Cards Grid */}
        {!loading && filteredEvents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7 items-stretch">
            {filteredEvents.map((evt) => {
              const badge = getCategoryBadge(evt.category);
              const isExpanded = expandedIds.has(evt.id);
              const hasExtraContent = Boolean(
                evt.descriptionKn ||
                evt.descriptionEn ||
                (evt.highlightsKn && evt.highlightsKn.length > 0) ||
                (evt.highlightsEn && evt.highlightsEn.length > 0) ||
                evt.locationKn ||
                evt.locationEn ||
                evt.chiefGuestsKn ||
                evt.chiefGuestsEn
              );

              return (
                <div
                  key={evt.id}
                  className="group relative bg-white rounded-3xl border border-amber-200/90 shadow-2xs hover:shadow-2xl hover:border-amber-400/80 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  {/* Subtle Top Ambient Accent */}
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 z-10" />

                  <div className="flex-1 flex flex-col">
                    {/* Card Media Banner (Multi-Media Gallery) */}
                    <EventMediaGallery
                      galleryMedia={evt.galleryMedia}
                      primaryUrl={evt.mediaUrl}
                      primaryType={evt.mediaType}
                      title={language === 'kn' ? evt.titleKn : evt.titleEn}
                      badge={badge}
                      year={evt.year}
                      eventDate={evt.eventDate}
                      language={language}
                      onOpenLightbox={(idx, mList) => {
                        setLightboxState({
                          items: mList,
                          currentIndex: idx,
                          title: language === 'kn' ? evt.titleKn : evt.titleEn,
                        });
                      }}
                    />

                    {/* Content Body */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                      {/* Always visible: Title */}
                      <div>
                        <h3
                          className={`text-base sm:text-lg font-bold text-neutral-950 group-hover:text-amber-800 transition-colors leading-snug ${
                            language === 'kn' ? 'font-kannada' : 'font-sans'
                          }`}
                        >
                          {language === 'kn' ? evt.titleKn : evt.titleEn}
                        </h3>

                        {language !== 'kn' && evt.titleKn && (
                          <p className="text-[11px] text-neutral-400 font-kannada mt-0.5 line-clamp-1">{evt.titleKn}</p>
                        )}
                        {language === 'kn' && evt.titleEn && (
                          <p className="text-[11px] text-neutral-400 font-sans mt-0.5 line-clamp-1">{evt.titleEn}</p>
                        )}
                      </div>

                      {/* Collapsible Details: Shown only when expanded */}
                      {isExpanded && (
                        <div className="pt-3 border-t border-amber-100/90 space-y-3 animate-fadeIn">
                          {(evt.descriptionKn || evt.descriptionEn) && (
                            <p className="text-xs text-neutral-600 leading-relaxed font-sans">
                              {language === 'kn' ? evt.descriptionKn : evt.descriptionEn}
                            </p>
                          )}

                          {/* Highlights bullet list if provided */}
                          {((language === 'kn' && evt.highlightsKn && evt.highlightsKn.length > 0) ||
                            (language !== 'kn' && evt.highlightsEn && evt.highlightsEn.length > 0)) && (
                            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block font-mono">
                                {language === 'kn' ? 'ಮುಖ್ಯಾಂಶಗಳು (Highlights)' : 'Key Highlights'}
                              </span>
                              <ul className="space-y-1">
                                {(language === 'kn' ? evt.highlightsKn : evt.highlightsEn)?.map((item, idx) => (
                                  <li key={idx} className="flex items-start space-x-2 text-xs text-neutral-700 leading-relaxed font-sans">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                    <span className="leading-snug">{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Bottom Metadata: Location & Dignitaries */}
                          {(evt.locationKn || evt.locationEn || evt.chiefGuestsKn || evt.chiefGuestsEn) && (
                            <div className="pt-2 border-t border-amber-100/70 flex items-center justify-between flex-wrap gap-2 text-xs">
                              {(evt.locationKn || evt.locationEn) && (
                                <span className="inline-flex items-center space-x-1 text-neutral-600 font-medium">
                                  <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  <span>{language === 'kn' ? evt.locationKn : evt.locationEn}</span>
                                </span>
                              )}

                              {(evt.chiefGuestsKn || evt.chiefGuestsEn) && (
                                <span className="inline-flex items-center space-x-1 text-amber-950 bg-amber-100/60 px-2 py-0.5 rounded-md font-sans text-[11px] font-semibold border border-amber-200/70">
                                  <Users className="w-3 h-3 text-amber-700 shrink-0" />
                                  <span>{language === 'kn' ? evt.chiefGuestsKn : evt.chiefGuestsEn}</span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Down Arrow Toggle Button */}
                      {hasExtraContent && (
                        <button
                          type="button"
                          onClick={() => toggleCardExpand(evt.id)}
                          className="mt-3 w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-950 border border-amber-300/50 hover:border-amber-400 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all duration-200 cursor-pointer shadow-2xs group/btn"
                        >
                          <span>
                            {isExpanded
                              ? (language === 'kn' ? 'ವಿವರಗಳನ್ನು ಮರೆಮಾಡಿ' : 'Hide Details')
                              : (language === 'kn' ? 'ವಿವರಗಳನ್ನು ನೋಡಿ' : 'View Details')}
                          </span>
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-amber-700 transition-transform duration-300 ${
                              isExpanded ? 'rotate-180' : 'rotate-0'
                            }`}
                          />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fullscreen HD Media Lightbox Modal */}
      {lightboxState && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-6"
          onClick={() => setLightboxState(null)}
        >
          {/* Top Bar: Title & Close */}
          <div
            className="w-full max-w-5xl flex items-center justify-between pb-3 text-white z-20 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xs sm:text-sm font-mono font-bold text-amber-400 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-neutral-200 font-sans truncate max-w-xs sm:max-w-md">
                {lightboxState.title}
              </span>
              {lightboxState.items.length > 1 && (
                <span className="text-xs text-amber-300 font-mono">
                  ({lightboxState.currentIndex + 1} / {lightboxState.items.length})
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setLightboxState(null)}
              className="p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 transition-all cursor-pointer"
              title="Close (Esc)"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Media Center Viewport */}
          <div
            className="relative w-full max-w-5xl flex-1 max-h-[75vh] flex items-center justify-center overflow-hidden rounded-2xl bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const currentMedia = lightboxState.items[lightboxState.currentIndex] || lightboxState.items[0];
              const isVid =
                currentMedia.type === 'video' ||
                currentMedia.url.match(/\.(mp4|webm|mov)$/i) ||
                currentMedia.url.includes('/video/upload/');

              return isVid ? (
                <video
                  key={currentMedia.url}
                  src={getHdMediaUrl(currentMedia.url, 'video')}
                  controls
                  muted
                  autoPlay
                  playsInline
                  className="max-h-[72vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
                />
              ) : (
                <img
                  key={currentMedia.url}
                  src={getHdMediaUrl(currentMedia.url, 'image')}
                  alt={lightboxState.title}
                  className="max-h-[72vh] w-auto max-w-full rounded-xl object-contain shadow-2xl select-none"
                />
              );
            })()}

            {/* Left / Right Navigation in Lightbox */}
            {lightboxState.items.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxState((prev) =>
                      prev
                        ? {
                            ...prev,
                            currentIndex: (prev.currentIndex - 1 + prev.items.length) % prev.items.length,
                          }
                        : null
                    );
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all cursor-pointer shadow-xl"
                  title="Previous"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxState((prev) =>
                      prev
                        ? {
                            ...prev,
                            currentIndex: (prev.currentIndex + 1) % prev.items.length,
                          }
                        : null
                    );
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all cursor-pointer shadow-xl"
                  title="Next"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails Strip in Lightbox */}
          {lightboxState.items.length > 1 && (
            <div
              className="w-full max-w-2xl flex items-center justify-center space-x-2 pt-3 overflow-x-auto no-scrollbar z-20 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              {lightboxState.items.map((m, idx) => {
                const isVid = m.type === 'video' || m.url.match(/\.(mp4|webm|mov)$/i);
                const isSelected = idx === lightboxState.currentIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      setLightboxState((prev) => (prev ? { ...prev, currentIndex: idx } : null))
                    }
                    className={`relative w-14 h-10 rounded-lg overflow-hidden border shrink-0 transition-all cursor-pointer bg-neutral-900 ${
                      isSelected
                        ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105'
                        : 'border-white/20 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {isVid ? (
                      <img src={getVideoPosterUrl(m.url)} alt="" className="w-full h-full object-cover pointer-events-none" />
                    ) : (
                      <img src={m.url} alt="" className="w-full h-full object-cover" />
                    )}
                    {isVid && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                        <Film className="w-3 h-3 text-amber-300" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
