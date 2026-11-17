import React, { useEffect, useState, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Camera,
  Sparkles,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { GalleryItem } from '../../data/gallery';
import { useLanguage } from '../../i18n/LanguageContext';
import { getHdMediaUrl } from '../../utils/mediaUtils';
import { extractYoutubeVideoId, getYoutubeEmbedUrl } from '../../utils/youtubeUtils';

interface LightboxModalProps {
  item: GalleryItem | null;
  items: GalleryItem[];
  onClose: () => void;
  onNavigate: (item: GalleryItem) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  item,
  items,
  onClose,
  onNavigate,
}) => {
  const { language, t } = useLanguage();
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const currentIndex = item ? items.findIndex((i) => i.id === item.id) : -1;

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate(items[currentIndex - 1]);
    } else if (items.length > 0) {
      onNavigate(items[items.length - 1]);
    }
  }, [currentIndex, items, onNavigate]);

  const handleNext = useCallback(() => {
    if (currentIndex >= 0 && currentIndex < items.length - 1) {
      onNavigate(items[currentIndex + 1]);
    } else if (items.length > 0) {
      onNavigate(items[0]);
    }
  }, [currentIndex, items, onNavigate]);

  useEffect(() => {
    if (!item) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [item, handlePrev, handleNext, onClose]);

  if (!item) return null;

  const ytId = item ? extractYoutubeVideoId(item.imageUrl) : null;
  const isVideo =
    Boolean(ytId) ||
    item.mediaType === 'video' ||
    /\.(mp4|webm|mov|ogg|m4v)($|\?)/i.test(item.imageUrl) ||
    (item.imageUrl && item.imageUrl.includes('/video/upload/'));

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    setTouchStartX(null);
  };

  const categoryNameMap: Record<string, { kn: string; en: string }> = {
    darshan: { kn: 'ದರ್ಶನ', en: 'Darshan' },
    visarjan: { kn: 'ವಿಸರ್ಜನೆ', en: 'Visarjan' },
    pandal: { kn: 'ಮಂಟಪ', en: 'Pandal' },
    cultural: { kn: 'ಸಾಂಸ್ಕೃತಿಕ', en: 'Cultural' },
    seva: { kn: 'ಅನ್ನಸಂತರ್ಪಣೆ & ಸೇವೆ', en: 'Seva & Prasada' },
  };

  const activeCategory = categoryNameMap[item.category] || {
    kn: item.category,
    en: item.category,
  };

  const titleText = language === 'kn' ? item.titleKn || item.titleEn : item.titleEn || item.titleKn;
  const descriptionText =
    language === 'kn'
      ? item.descriptionKn || item.descriptionEn
      : item.descriptionEn || item.descriptionKn;

  const sponsorText =
    language === 'kn'
      ? item.sponsorNameKn || item.sponsorNameEn
      : item.sponsorNameEn || item.sponsorNameKn;

  const themeText =
    language === 'kn' ? item.themeKn || item.themeEn : item.themeEn || item.themeKn;

  const highlights =
    language === 'kn'
      ? item.highlightsKn || item.highlightsEn || []
      : item.highlightsEn || item.highlightsKn || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl select-none p-2 sm:p-4 md:p-6"
      onClick={onClose}
    >
      {/* ================= MODAL DIALOG CONTAINER: 2-COLUMN SPLIT VIEW ================= */}
      <div
        className="relative w-full max-w-6xl max-h-[94vh] bg-[#0c0c10] border border-amber-400/35 rounded-2xl sm:rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col lg:flex-row z-10"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* ================= LEFT SIDE: UNBROKEN SACRED MEDIA (PHOTO / VIDEO) ================= */}
        <div className="relative flex-1 lg:flex-[1.4] bg-black flex items-center justify-center min-h-[260px] sm:min-h-[380px] lg:min-h-[580px] max-h-[48vh] sm:max-h-[55vh] lg:max-h-[88vh] overflow-hidden group">
          {/* Ambient Glowing Backdrop (from media) */}
          {item.imageUrl && !isVideo && !ytId && (
            <img
              src={getHdMediaUrl(item.imageUrl, 'image')}
              alt=""
              className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-20 scale-125 pointer-events-none"
            />
          )}

          {/* Media Player / Image: Entire Photo Displayed Without Cropping (object-contain) */}
          {ytId ? (
            <div className="relative w-full h-full min-h-[260px] sm:min-h-[360px] lg:min-h-[480px] flex items-center justify-center p-2 z-10">
              <iframe
                src={getYoutubeEmbedUrl(ytId, true)}
                title={titleText}
                className="w-full h-full max-h-[46vh] sm:max-h-[52vh] lg:max-h-[85vh] aspect-video rounded-xl shadow-2xl border border-neutral-800"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : isVideo ? (
            <div className="relative w-full h-full flex items-center justify-center p-2 z-10">
              <video
                src={getHdMediaUrl(item.imageUrl, 'video')}
                controls
                autoPlay
                playsInline
                className="w-full h-full max-h-[46vh] sm:max-h-[52vh] lg:max-h-[85vh] object-contain rounded-xl shadow-2xl"
              />
            </div>
          ) : item.imageUrl ? (
            <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-4 z-10">
              <img
                src={getHdMediaUrl(item.imageUrl, 'image')}
                alt={titleText}
                className="w-full h-full max-h-[46vh] sm:max-h-[52vh] lg:max-h-[85vh] object-contain rounded-xl select-none shadow-2xl"
              />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-neutral-400 relative z-10">
              <Camera className="w-12 h-12 text-amber-400 mb-3 opacity-60" />
              <p className="font-mono text-xs">{language === 'kn' ? 'ಮಾಧ್ಯಮ ಲಭ್ಯವಿಲ್ಲ' : 'Media Preview Unavailable'}</p>
            </div>
          )}

          {/* On-Media Navigation Arrows */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-amber-400 text-white hover:text-black border border-white/20 hover:border-amber-400 transition-all cursor-pointer shadow-lg group-hover:scale-105"
            aria-label="Previous media"
            title="Previous (Left Arrow)"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-amber-400 text-white hover:text-black border border-white/20 hover:border-amber-400 transition-all cursor-pointer shadow-lg group-hover:scale-105"
            aria-label="Next media"
            title="Next (Right Arrow)"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Bottom Left Frame Counter Pill */}
          <div className="absolute bottom-3 left-3 z-20 hidden sm:inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-[10px] font-mono text-neutral-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>
              {currentIndex + 1} / {items.length}
            </span>
          </div>
        </div>

        {/* ================= RIGHT SIDE: COMPLETE CONTENT & METADATA PANEL ================= */}
        <div className="lg:w-[380px] xl:w-[420px] bg-[#111116] border-t lg:border-t-0 lg:border-l border-white/10 p-5 sm:p-6 flex flex-col justify-between overflow-y-auto max-h-[46vh] sm:max-h-[40vh] lg:max-h-[88vh] text-white">
          <div className="space-y-4">
            {/* Top Bar: Badges & Close Button */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-neutral-950 font-mono text-[10px] font-black uppercase tracking-wider shadow-sm">
                  {item.year} UTSAV
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-neutral-300 font-sans text-[10px] font-bold uppercase tracking-wider">
                  {language === 'kn' ? activeCategory.kn : activeCategory.en}
                </span>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/10 hover:bg-red-500/80 text-white transition-colors cursor-pointer"
                title={t.nav.close}
                aria-label={t.nav.close}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Title */}
            <div>
              <h2
                className={`text-lg sm:text-xl font-black text-white leading-snug drop-shadow ${
                  language === 'kn' ? 'font-kannada' : 'font-sans'
                }`}
              >
                {titleText}
              </h2>

              <div className="mt-1 flex items-center space-x-1.5 text-xs text-neutral-400 font-sans">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  {language === 'kn' ? 'ಕಡಲಗಿ ಖೂಟ, ಯಮಕನಮರಡಿ' : 'Kadalagi Khoot, Yamakanmardi'}
                </span>
              </div>
            </div>

            {/* Pandal Theme (if present) */}
            {themeText && (
              <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/25 text-amber-300 text-xs font-sans space-y-0.5">
                <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  🏛️ {language === 'kn' ? 'ಮಂಟಪ ಥೀಮ್:' : 'PANDAL THEME:'}
                </div>
                <div className="text-white font-semibold">{themeText}</div>
              </div>
            )}

            {/* Devotional Sponsor (if present) */}
            {sponsorText && (
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/15 to-orange-500/10 border border-amber-400/35 text-amber-300 text-xs font-sans space-y-0.5">
                <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  🙏 {language === 'kn' ? 'ಸೇವಾಕರ್ತರು / ದಾನಿಗಳು:' : 'SEVA SPONSOR:'}
                </div>
                <div className="text-white font-bold">{sponsorText}</div>
              </div>
            )}

            {/* Description Text */}
            {descriptionText && (
              <div className="text-xs sm:text-sm text-neutral-300/90 leading-relaxed font-sans space-y-1">
                <p>{descriptionText}</p>
              </div>
            )}

            {/* Highlights (if present) */}
            {highlights.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                  {language === 'kn' ? 'ವಿಶೇಷತೆಗಳು:' : 'HIGHLIGHTS:'}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {highlights.map((hl, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 text-[11px] text-amber-300 font-sans"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                      <span>{hl}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Footer Actions */}
          <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between gap-2">
            {/* View Full Resolution or Watch on YouTube */}
            {ytId ? (
              <a
                href={`https://www.youtube.com/watch?v=${ytId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-red-600/90 hover:bg-red-600 text-white text-xs font-sans font-semibold transition-colors cursor-pointer shadow-sm"
                title="Watch on YouTube"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{language === 'kn' ? 'YouTube ನಲ್ಲಿ ವೀಕ್ಷಿಸಿ' : 'Watch on YouTube'}</span>
              </a>
            ) : item.imageUrl ? (
              <a
                href={getHdMediaUrl(item.imageUrl, isVideo ? 'video' : 'image')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white text-xs font-sans font-semibold transition-colors cursor-pointer"
                title="Open high-definition original"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{language === 'kn' ? 'ಪೂರ್ಣ ಎಚ್‌ಡಿ ವೀಕ್ಷಣೆ' : 'Full HD'}</span>
              </a>
            ) : null}

            {/* Navigation Buttons for details side */}
            <div className="flex items-center space-x-1.5 ml-auto">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-full bg-white/10 hover:bg-amber-400 hover:text-black text-white transition-colors cursor-pointer"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-full bg-white/10 hover:bg-amber-400 hover:text-black text-white transition-colors cursor-pointer"
                title="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
