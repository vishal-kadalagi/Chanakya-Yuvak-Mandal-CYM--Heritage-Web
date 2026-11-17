import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  Sparkles,
  CheckCircle2,
  Camera,
  Calendar,
  Heart,
  Film,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Filter,
  Maximize2,
  X,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { subscribeToAchievements, AchievementDoc } from '../services/achievementsService';
import { getHdMediaUrl, getVideoPosterUrl } from '../utils/mediaUtils';

// Sub-component for rendering interactive single or multiple photos/videos per Seva card
const SevaMediaGallery: React.FC<{
  galleryMedia?: { url: string; type: 'image' | 'video' }[];
  primaryUrl?: string;
  primaryType?: 'image' | 'video';
  title: string;
  onOpenLightbox?: (index: number) => void;
}> = ({ galleryMedia, primaryUrl, primaryType = 'image', title, onOpenLightbox }) => {
  const mediaList: { url: string; type: 'image' | 'video' }[] = useMemo(() => {
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
      return [{ url: primaryUrl, type: isVideo ? 'video' : 'image' }];
    }
    return [];
  }, [galleryMedia, primaryUrl, primaryType]);

  const [currentIndex, setCurrentIndex] = useState(0);

  if (mediaList.length === 0) {
    return (
      <div className="relative rounded-2xl overflow-hidden h-52 sm:h-60 bg-gradient-to-br from-[#121215] to-[#1c1c22] border border-amber-300/40 flex flex-col items-center justify-center p-6 text-center select-none shadow-inner">
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 mb-2">
          <Camera className="w-6 h-6" />
        </div>
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
          Seva Archive
        </span>
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
      <div className="relative rounded-2xl overflow-hidden h-52 sm:h-56 border border-amber-200/80 shadow-inner group-hover:scale-[1.01] transition-transform bg-neutral-950 flex items-center justify-center">
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
            onClick={() => onOpenLightbox?.(currentIndex)}
          />
        ) : (
          <img
            key={currentItem.url}
            src={getHdMediaUrl(currentItem.url, 'image')}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out cursor-pointer"
            onClick={() => onOpenLightbox?.(currentIndex)}
          />
        )}

        {/* Top Controls: Fullscreen / Expand button on top-left */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenLightbox?.(currentIndex);
          }}
          className="absolute top-2.5 left-2.5 z-10 p-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-white/90 hover:text-white border border-white/20 transition-all cursor-pointer shadow-md"
          title="Fullscreen / ವಿಸ್ತರಿಸಿ"
          aria-label="Fullscreen"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {/* Top-Right: Media Type & Counter Badge */}
        <div className="absolute top-2.5 right-2.5 flex items-center space-x-1.5 z-10 pointer-events-none">
          {isCurrentVideo && (
            <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-sm text-amber-400 text-[10px] font-mono font-bold flex items-center space-x-1 border border-amber-400/30">
              <Film className="w-3 h-3" />
              <span>VID</span>
            </span>
          )}
          {mediaList.length > 1 && (
            <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-sm text-white text-[10px] font-mono font-bold border border-white/20">
              {currentIndex + 1} / {mediaList.length}
            </span>
          )}
        </div>

        {/* Navigation Arrows for multi-media */}
        {mediaList.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer shadow-md"
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
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer shadow-md"
              aria-label="Next Media"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Mini Thumbnail Strip if >1 item */}
      {mediaList.length > 1 && (
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 px-1 scrollbar-none">
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
                    : 'border-neutral-700/80 opacity-70 hover:opacity-100'
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

export const AchievementsPage: React.FC = () => {
  const { language } = useLanguage();
  const [achievements, setAchievements] = useState<AchievementDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [lightboxMedia, setLightboxMedia] = useState<{ url: string; type: 'image' | 'video'; title: string }[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

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
    if (!lightboxMedia) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxMedia(null);
      if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev === 0 ? lightboxMedia.length - 1 : prev - 1));
      if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev === lightboxMedia.length - 1 ? 0 : prev + 1));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxMedia]);

  useEffect(() => {
    const unsubscribe = subscribeToAchievements(
      (data) => {
        setAchievements(data.filter((item) => item.isActive !== false));
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const availableYears = useMemo(() => {
    const s = new Set<number>();
    achievements.forEach((a) => {
      if (a.year) s.add(a.year);
    });
    return Array.from(s).sort((a, b) => b - a);
  }, [achievements]);

  const filteredAchievements = useMemo(() => {
    return achievements.filter((item) => {
      const matchCat =
        activeCategory === 'all'
          ? true
          : activeCategory === 'pooja'
          ? item.category === 'pooja' || item.category === 'pandal' || item.category === 'cultural'
          : item.category === activeCategory;
      const matchYear = selectedYear === 'all' ? true : item.year === selectedYear;
      return matchCat && matchYear;
    });
  }, [achievements, activeCategory, selectedYear]);

  return (
    <div className="pt-24 sm:pt-28 md:pt-32 pb-14 sm:pb-20 md:pb-24 bg-gradient-to-b from-[#FAF8F5] via-white to-[#F5F2EB] min-h-screen relative overflow-hidden">
      {/* Devotional Ambient Light */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-amber-400/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/6 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ================= COMPACT LUXURY HEADER ================= */}
        <div className="text-center max-w-2xl mx-auto mb-4 sm:mb-6">
          <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500/15 to-amber-400/25 border border-amber-400/40 text-[11px] font-mono font-bold uppercase tracking-wider text-amber-950 mb-2 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{language === 'kn' ? 'ಸೇವಾ ಕೈಂಕರ್ಯಗಳು & ಸಾಧನೆ' : 'COMMUNITY SEVA & MILESTONES'}</span>
          </div>

          <h1
            className={`text-2xl sm:text-3xl md:text-4xl font-black text-neutral-950 tracking-tight leading-tight ${
              language === 'kn' ? 'font-kannada' : 'font-sans'
            }`}
          >
            {language === 'kn' ? (
              <span>
                ಸಮಾಜಮುಖಿ ಸೇವೆ ಮತ್ತು <span className="text-[#D48B00]">ಸಾಧನೆಗಳು</span>
              </span>
            ) : (
              <span>
                DEVOTIONAL SEVA & <span className="text-[#D48B00]">ACHIEVEMENTS</span>
              </span>
            )}
          </h1>

          <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm text-neutral-600 font-sans max-w-lg mx-auto">
            {language === 'kn'
              ? 'ಕಡಲಗಿ ಖೂಟ • ಮಹಾ ಅನ್ನಸಂತರ್ಪಣೆ, ಕಂಬ ಪೂಜೆ, ಪ್ರವಚನ ಹಾಗೂ ಧಾರ್ಮಿಕ ಸೇವಾ ದಾಖಲೆಗಳು'
              : 'Kadalagi Khoot • Devotional Seva, Anna Prasada Feasts, Kambha Pooja & Welfare Records'}
          </p>
        </div>

        {/* ================= COMPACT DROPDOWN FILTER TOOLBAR ================= */}
        <div className="p-2 sm:p-2.5 rounded-2xl bg-white/90 border border-amber-200/90 shadow-xs mb-6 sm:mb-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[260px]">
            {/* Category Dropdown */}
            <div className="relative flex-1 sm:flex-initial min-w-[180px]">
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl bg-amber-50/60 border border-amber-300/80 text-xs sm:text-sm font-bold text-neutral-900 focus:outline-none focus:border-amber-500 cursor-pointer transition-all shadow-2xs"
              >
                <option value="all">✦ {language === 'kn' ? 'ಎಲ್ಲಾ ಸೇವೆಗಳು' : 'All Seva Initiatives'}</option>
                <option value="feast">🔥 {language === 'kn' ? 'ಮಹಾ ಅನ್ನಸಂತರ್ಪಣೆ' : 'Maha Annasantarpane'}</option>
                <option value="pooja">✨ {language === 'kn' ? 'ಕಂಬ ಪೂಜೆ & ಪ್ರವಚನ' : 'Kambha Pooja & Pravachana'}</option>
                <option value="miravanige">👥 {language === 'kn' ? 'ವಿಸರ್ಜನಾ ಮೆರವಣಿಗೆ' : 'Visarjan Miravanige'}</option>
                <option value="other">❤️ {language === 'kn' ? 'ಇತರ ಸೇವೆಗಳು' : 'Other Initiatives'}</option>
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
          </div>

          {/* Result Count Badge */}
          <div className="text-[11px] sm:text-xs font-mono font-bold text-amber-900 bg-amber-100/70 border border-amber-300 px-3 py-1 rounded-xl shrink-0">
            {filteredAchievements.length} {language === 'kn' ? 'ಸೇವಾ ದಾಖಲೆಗಳು' : 'Initiatives'}
          </div>
        </div>

        {/* ================= INITIATIVES CARDS: 2-COLUMN SIDE-BY-SIDE GRID ================= */}
        {loading ? (
          <div className="py-16 text-center text-neutral-500 text-sm">
            {language === 'kn' ? 'ಸೇವಾ ದಾಖಲೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...' : 'Loading seva initiatives...'}
          </div>
        ) : filteredAchievements.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white rounded-3xl border border-amber-200/90 max-w-lg mx-auto shadow-[0_4px_25px_rgba(0,0,0,0.04)] relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300" />
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-400/40 flex items-center justify-center text-amber-700 mx-auto mb-4 shadow-2xs">
              <Award className="w-8 h-8 text-amber-600 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-1 font-kannada">
              {language === 'kn' ? 'ಸೇವಾ ದಾಖಲೆಗಳು ಶೀಘ್ರದಲ್ಲೇ ಅಪ್‌ಡೇಟ್ ಆಗಲಿವೆ' : 'Seva Initiatives Coming Soon'}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 font-sans leading-relaxed max-w-sm mx-auto">
              {language === 'kn'
                ? 'ಕಡಲಗಿ ಖೂಟದಲ್ಲಿ ನೆರವೇರುವ ಮಹಾ ಅನ್ನಸಂತರ್ಪಣೆ, ಕಂಬ ಪೂಜೆ, ಪ್ರವಚನ ಮತ್ತು ಇತರ ಸೇವಾ ಕಾರ್ಯಗಳ ವಿವರಗಳನ್ನು ಆಡಳಿತ ಮಂಡಳಿಯು ಶೀಘ್ರದಲ್ಲೇ ಇಲ್ಲಿ ಪ್ರಕಟಿಸಲಿದೆ.'
                : 'Documented records of our community welfare programs and annasantarpane drives will be updated shortly.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7 items-stretch">
            {filteredAchievements.map((item) => {
              const isExpanded = expandedIds.has(item.id);
              const hasExtraContent = Boolean(
                item.sponsorNameKn ||
                item.sponsorNameEn ||
                item.impactMetricKn ||
                item.impactMetricEn ||
                item.descriptionKn ||
                item.descriptionEn ||
                (item.highlightsKn && item.highlightsKn.length > 0) ||
                (item.highlightsEn && item.highlightsEn.length > 0)
              );

              return (
                <div
                  key={item.id}
                  className="group bg-white rounded-3xl border border-amber-200/90 shadow-2xs hover:shadow-2xl hover:border-amber-400/80 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  <div className="flex-1 flex flex-col">
                    {/* Media Gallery Viewport at Top */}
                    <div className="p-3 sm:p-3.5 pb-2">
                      <SevaMediaGallery
                        galleryMedia={item.galleryMedia}
                        primaryUrl={item.mediaUrl || item.imageUrl}
                        primaryType={item.mediaType}
                        title={item.titleEn || item.titleKn}
                        onOpenLightbox={(idx) => {
                          const mList = (item.galleryMedia && item.galleryMedia.length > 0)
                            ? item.galleryMedia
                            : [{ url: item.mediaUrl || item.imageUrl || '', type: item.mediaType || 'image' }];
                          setLightboxMedia(mList.map((m) => ({ ...m, title: item.titleKn || item.titleEn })));
                          setLightboxIndex(idx);
                        }}
                      />
                    </div>

                    {/* Narrative Details */}
                    <div className="p-4 sm:p-5 pt-1 space-y-2.5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5 mb-2">
                          {/* Category Badge */}
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-900 text-[11px] font-mono font-bold uppercase">
                            {item.category === 'feast'
                              ? language === 'kn'
                                ? 'ಅನ್ನಸಂತರ್ಪಣೆ'
                                : 'Annasantarpane'
                              : item.category === 'pooja'
                              ? language === 'kn'
                                ? 'ಕಂಬ ಪೂಜೆ & ಪ್ರವಚನ'
                                : 'Kambha Pooja & Pravachana'
                              : item.category === 'miravanige'
                              ? language === 'kn'
                                ? 'ಮೆರವಣಿಗೆ'
                                : 'Miravanige'
                              : language === 'kn'
                              ? 'ಇತರ ಸೇವೆ'
                              : 'Other Seva'}
                          </span>

                          {/* Event Date Badge if available */}
                          {item.eventDate && (
                            <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700 font-mono text-[11px] font-medium">
                              <Calendar className="w-3 h-3 text-amber-600" />
                              <span>{item.eventDate}</span>
                            </div>
                          )}

                          {/* Year Badge if available */}
                          {(item.yearKn || item.yearEn) && !item.eventDate?.includes(item.yearKn || '') && !item.eventDate?.includes(String(item.year || '')) && (
                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-950 font-mono text-[11px] font-bold">
                              <span>
                                {language === 'kn'
                                  ? item.yearKn || item.yearEn
                                  : item.yearEn || item.yearKn}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <h3
                          className={`font-bold text-base sm:text-lg text-neutral-950 group-hover:text-amber-700 transition-colors leading-snug ${
                            language === 'kn' ? 'font-kannada' : 'font-sans'
                          }`}
                        >
                          {language === 'kn'
                            ? item.titleKn || item.titleEn
                            : item.titleEn || item.titleKn}
                        </h3>
                      </div>

                      {/* Collapsible Details: Shown only when expanded */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-amber-100/90 space-y-3 animate-fadeIn">
                          {/* Sponsor / Sevadar Highlight Banner */}
                          {(item.sponsorNameKn || item.sponsorNameEn) && (
                            <div className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/12 via-amber-400/10 to-transparent border border-amber-300/60 shadow-2xs">
                              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
                                <Heart className="w-3.5 h-3.5 text-amber-600 fill-amber-500/30" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-900 block">
                                  {language === 'kn'
                                    ? '🙏 ಸೇವಾಕರ್ತರು / ದಾನಿಗಳು'
                                    : '🙏 Seva Sponsor / Donor'}
                                </span>
                                <span className="font-sans font-bold text-xs text-neutral-900 block truncate">
                                  {language === 'kn'
                                    ? item.sponsorNameKn || item.sponsorNameEn
                                    : item.sponsorNameEn || item.sponsorNameKn}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Impact Metric Banner */}
                          {(item.impactMetricKn || item.impactMetricEn) && (
                            <div className="p-2 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-950 text-xs font-bold flex items-center space-x-2">
                              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span className="truncate">
                                {language === 'kn'
                                  ? item.impactMetricKn || item.impactMetricEn
                                  : item.impactMetricEn || item.impactMetricKn}
                              </span>
                            </div>
                          )}

                          {/* Description */}
                          {(item.descriptionKn || item.descriptionEn) && (
                            <p className="text-xs text-neutral-600 leading-relaxed font-sans">
                              {language === 'kn'
                                ? item.descriptionKn || item.descriptionEn
                                : item.descriptionEn || item.descriptionKn}
                            </p>
                          )}

                          {/* Bullet Highlights */}
                          {((language === 'kn' ? item.highlightsKn : item.highlightsEn) || []).length > 0 && (
                            <div className="pt-1 space-y-1.5 font-sans">
                              {(language === 'kn'
                                ? item.highlightsKn
                                : item.highlightsEn
                              )?.map((hl, i) => (
                                <div
                                  key={i}
                                  className="flex items-start space-x-2 text-xs text-neutral-700"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                  <span className="leading-snug">{hl}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Expand / Collapse Button with Down Arrow */}
                      {hasExtraContent && (
                        <button
                          type="button"
                          onClick={() => toggleCardExpand(item.id)}
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
      {lightboxMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6"
          onClick={() => setLightboxMedia(null)}
        >
          {/* Top Bar: Counter & Close */}
          <div
            className="w-full max-w-5xl flex items-center justify-between pb-3 text-white z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xs sm:text-sm font-mono font-bold text-amber-400 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{lightboxIndex + 1} / {lightboxMedia.length}</span>
              <span className="text-neutral-400 font-sans truncate max-w-xs sm:max-w-md">
                • {lightboxMedia[lightboxIndex]?.title}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setLightboxMedia(null)}
              className="p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 transition-all cursor-pointer"
              title="Close (Esc)"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Media Center Viewport */}
          <div
            className="relative w-full max-w-5xl max-h-[80vh] flex items-center justify-center overflow-hidden rounded-2xl bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            {lightboxMedia[lightboxIndex]?.type === 'video' ||
            lightboxMedia[lightboxIndex]?.url.match(/\.(mp4|webm|mov)$/i) ||
            lightboxMedia[lightboxIndex]?.url.includes('/video/upload/') ? (
              <video
                key={lightboxMedia[lightboxIndex]?.url}
                src={getHdMediaUrl(lightboxMedia[lightboxIndex]?.url, 'video')}
                controls
                muted
                autoPlay
                playsInline
                className="max-h-[75vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
              />
            ) : (
              <img
                key={lightboxMedia[lightboxIndex]?.url}
                src={getHdMediaUrl(lightboxMedia[lightboxIndex]?.url, 'image')}
                alt={lightboxMedia[lightboxIndex]?.title}
                className="max-h-[75vh] w-auto max-w-full rounded-xl object-contain shadow-2xl select-none"
              />
            )}

            {/* Lightbox Navigation Chevrons */}
            {lightboxMedia.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) => (prev === 0 ? lightboxMedia.length - 1 : prev - 1));
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/75 hover:bg-black/95 text-white border border-white/20 transition-all cursor-pointer shadow-lg"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) => (prev === lightboxMedia.length - 1 ? 0 : prev + 1));
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/75 hover:bg-black/95 text-white border border-white/20 transition-all cursor-pointer shadow-lg"
                  aria-label="Next"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
