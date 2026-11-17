import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Sparkles, CheckCircle2, AlertCircle, ArrowRight, Camera, MapPin, Maximize2, Crown } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { historyData, YearHistory } from '../data/history';
import { GalleryItem } from '../data/gallery';
import { SectionTitle } from '../components/common/SectionTitle';
import { LightboxModal } from '../components/gallery/LightboxModal';
import { subscribeToHistory, HistoryMilestoneDoc } from '../services/historyService';
import { subscribeToPublicMedia } from '../services/mediaService';
import { getHdMediaUrl } from '../utils/mediaUtils';

export const YearDetailPage: React.FC = () => {
  const { year: yearParam } = useParams<{ year: string }>();
  const { language, t } = useLanguage();
  const [selectedLightboxItem, setSelectedLightboxItem] = useState<GalleryItem | null>(null);
  const [firestoreItems, setFirestoreItems] = useState<HistoryMilestoneDoc[]>([]);
  const [liveYearMedia, setLiveYearMedia] = useState<GalleryItem[]>([]);

  const numericYear = yearParam ? parseInt(yearParam, 10) : NaN;

  // Real-time History Milestones
  useEffect(() => {
    const unsub = subscribeToHistory((items) => {
      setFirestoreItems(items);
    });
    return () => unsub();
  }, []);

  // Real-time Media for this specific festival year
  useEffect(() => {
    if (isNaN(numericYear)) return;
    const unsub = subscribeToPublicMedia(undefined, (items) => {
      const yearItems = items.filter(
        (m) => m.year === numericYear && m.isActive !== false
      );
      const mapped: GalleryItem[] = yearItems.map((i) => ({
        id: i.id,
        year: i.year || numericYear,
        category: (i.category as GalleryItem['category']) || 'darshan',
        titleEn: i.titleEn || `${numericYear} Darshan`,
        titleKn: i.titleKn || `${numericYear} ದರ್ಶನ`,
        imageUrl: i.mediaUrl,
        descriptionEn: i.descriptionEn || '',
        descriptionKn: i.descriptionKn || '',
      }));
      setLiveYearMedia(mapped);
    });
    return () => unsub();
  }, [numericYear]);

  // Check Firestore first, then fallback to historyData
  const firestoreMilestone = firestoreItems.find((h) => h.year === numericYear);
  const localYearData = historyData.find((h) => h.year === numericYear);

  const yearData: Partial<YearHistory> | null = firestoreMilestone
    ? {
        year: firestoreMilestone.year,
        titleKn: firestoreMilestone.titleKn,
        titleEn: firestoreMilestone.titleEn,
        samvatsaraKn: firestoreMilestone.samvatsaraKn || '',
        samvatsaraEn: firestoreMilestone.samvatsaraEn || '',
        summaryKn: firestoreMilestone.summaryKn || '',
        summaryEn: firestoreMilestone.summaryEn || '',
        pandalThemeKn: firestoreMilestone.pandalThemeKn || '',
        pandalThemeEn: firestoreMilestone.pandalThemeEn || '',
        highlightsKn: firestoreMilestone.highlightsKn || [],
        highlightsEn: firestoreMilestone.highlightsEn || [],
        coverImage: firestoreMilestone.coverImage || '',
        galleryImages: [],
      }
    : localYearData ?? null;

  const availableYearsList = Array.from(
    new Set([
      ...firestoreItems.map((h) => h.year),
      ...historyData.map((h) => h.year),
    ])
  ).sort((a, b) => b - a);

  const prevYearNum = availableYearsList.filter((y) => y < numericYear)[0] || null;
  const nextYearNum = availableYearsList.filter((y) => y > numericYear).slice(-1)[0] || null;

  const coverAsGalleryItem: GalleryItem | null = yearData?.coverImage
    ? {
        id: `cover-${yearData.year}`,
        year: yearData.year || numericYear,
        category: 'darshan',
        titleEn: yearData.titleEn || `${yearData.year} Ganesh Utsav`,
        titleKn: yearData.titleKn || `${yearData.year} ಶ್ರೀ ಗಣೇಶ ಮಹೋತ್ಸವ`,
        imageUrl: yearData.coverImage,
        themeEn: yearData.pandalThemeEn,
        themeKn: yearData.pandalThemeKn,
        highlightsEn: yearData.highlightsEn,
        highlightsKn: yearData.highlightsKn,
        descriptionEn: yearData.summaryEn || '',
        descriptionKn: yearData.summaryKn || '',
      }
    : null;

  const displayGalleryItems = liveYearMedia;
  const allModalItems = coverAsGalleryItem
    ? [coverAsGalleryItem, ...displayGalleryItems.filter((i) => i.imageUrl !== coverAsGalleryItem.imageUrl)]
    : displayGalleryItems;

  if (!yearData || isNaN(numericYear)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-20 px-4 bg-[#F8F8F7]">
        <div className="bg-white rounded-3xl border border-[#EEEEEE] p-8 sm:p-12 text-center max-w-md mx-auto shadow-sm">
          <AlertCircle className="w-12 h-12 text-[#E5A812] mx-auto mb-4" />
          <h2 className="font-display font-extrabold uppercase text-2xl text-black">
            {t.yearDetail.notFoundTitle}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-500 font-sans">
            {t.yearDetail.notFoundDesc}
          </p>
          <div className="mt-6">
            <Link
              to="/history"
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full bg-black text-white hover:bg-[#E5A812] hover:text-black font-display text-xs font-extrabold uppercase tracking-wider transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.yearDetail.backToTimeline}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4 sm:pt-6 pb-12 md:pb-20 bg-[#F8F8F7] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-[#EEEEEE]">
          <Link
            to="/history"
            className="inline-flex items-center space-x-2 text-xs font-display font-bold uppercase tracking-wider text-black hover:text-[#E5A812] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.yearDetail.backToTimeline}</span>
          </Link>

          <div className="flex items-center space-x-2">
            {prevYearNum && (
              <Link
                to={`/history/${prevYearNum}`}
                className="px-3.5 py-1.5 rounded-full bg-white border border-[#EEEEEE] text-black font-display text-xs font-bold uppercase hover:border-[#E5A812] hover:text-[#E5A812] transition-colors shadow-xs"
              >
                ← {prevYearNum}
              </Link>
            )}
            {nextYearNum && (
              <Link
                to={`/history/${nextYearNum}`}
                className="px-3.5 py-1.5 rounded-full bg-white border border-[#EEEEEE] text-black font-display text-xs font-bold uppercase hover:border-[#E5A812] hover:text-[#E5A812] transition-colors shadow-xs"
              >
                {nextYearNum} →
              </Link>
            )}
          </div>
        </div>

        {/* ================= HERO SACRED DEITY SHOWCASE (NEVER CROPS GANAPATI'S FACE) ================= */}
        <div className="relative mt-6 sm:mt-8 rounded-3xl overflow-hidden border border-amber-400/40 bg-[#0A0A0E] text-white shadow-xl">
          {/* Subtle Ambient Glowing Backdrop */}
          {yearData.coverImage && (
            <img
              src={getHdMediaUrl(yearData.coverImage, 'image')}
              alt=""
              className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-20 scale-125 pointer-events-none"
            />
          )}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* 2-Column Split: Content on Left, Dedicated Uncropped Murti on Right */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center p-6 sm:p-8 lg:p-10">
            {/* LEFT COLUMN (7 COLS): Year Identity, Title, Samvatsara, Theme */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-400 text-neutral-950 font-mono text-[11px] font-black uppercase tracking-wider shadow-sm">
                  <Crown className="w-3.5 h-3.5 text-neutral-950" />
                  <span>GANESH MAHOTSAV {yearData.year}</span>
                </span>

                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-neutral-200 text-xs font-mono font-bold uppercase tracking-wider">
                  {yearData.year ? `${yearData.year - 2019 + 1}th Annual Utsav` : 'Annual Utsav'}
                </span>

                {(yearData.samvatsaraKn || yearData.samvatsaraEn) && (
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>{language === 'kn' ? yearData.samvatsaraKn : yearData.samvatsaraEn}</span>
                  </span>
                )}
              </div>

              <div>
                <h1
                  className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight drop-shadow ${
                    language === 'kn' ? 'font-kannada' : 'font-sans'
                  }`}
                >
                  {language === 'kn' ? yearData.titleKn : yearData.titleEn}
                </h1>

                <p className="mt-2 text-xs sm:text-sm font-medium text-neutral-300 flex items-center space-x-1.5 font-sans">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>
                    {language === 'kn' ? 'ಕಡಲಗಿ ಖೂಟ, ಯಮಕನಮರಡಿ' : 'Kadalagi Khoot, Yamakanmardi'}
                  </span>
                </p>
              </div>

              {(yearData.pandalThemeKn || yearData.pandalThemeEn) && (
                <div className="p-3.5 rounded-2xl bg-amber-400/15 border border-amber-400/35 text-amber-300">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 mb-0.5">
                    🏛️ {language === 'kn' ? 'ಮಂಟಪ ಥೀಮ್:' : 'PANDAL THEME:'}
                  </div>
                  <div className="text-sm sm:text-base font-bold text-white">
                    {language === 'kn' ? yearData.pandalThemeKn : yearData.pandalThemeEn}
                  </div>
                </div>
              )}

              {(yearData.summaryKn || yearData.summaryEn) && (
                <p className="text-xs sm:text-sm text-neutral-300/90 leading-relaxed font-sans max-w-xl">
                  {language === 'kn' ? yearData.summaryKn : yearData.summaryEn}
                </p>
              )}
            </div>

            {/* RIGHT COLUMN (5 COLS): DEDICATED COMPLETE DEITY PORTRAIT (OBJECT-CONTAIN) */}
            <div className="lg:col-span-5 flex justify-center">
              <div
                onClick={() => {
                  if (coverAsGalleryItem) {
                    setSelectedLightboxItem(coverAsGalleryItem);
                  }
                }}
                className="relative w-full max-w-md rounded-2xl sm:rounded-3xl border border-amber-400/50 bg-black/80 shadow-2xl p-2.5 sm:p-3.5 flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[460px] max-h-[500px] overflow-hidden group cursor-pointer hover:border-amber-400 transition-all"
                title="Click to view full HD darshan"
              >
                {yearData.coverImage ? (
                  <>
                    {/* Ambient subtle glow */}
                    <img
                      src={yearData.coverImage}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover blur-md opacity-25 scale-110 pointer-events-none"
                    />

                    {/* ENTIRE PHOTO PRESERVED WITH OBJECT-CONTAIN (FACE & CROWN NEVER CROPPED!) */}
                    <img
                      src={getHdMediaUrl(yearData.coverImage, 'image')}
                      alt={`Ganesh Utsav ${yearData.year}`}
                      className="relative z-10 w-full h-full max-h-[440px] object-contain rounded-xl select-none group-hover:scale-102 transition-transform duration-500 shadow-xl"
                    />

                    {/* Top Chip */}
                    <div className="absolute top-3 left-3 z-20 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider shadow-sm">
                      <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                      <span>{language === 'kn' ? 'ದಿವ್ಯ ದರ್ಶನ' : 'SACRED DARSHAN'}</span>
                    </div>

                    {/* Expand icon pill on hover */}
                    <div className="absolute bottom-3 inset-x-3 z-20 flex justify-center opacity-90 group-hover:opacity-100 transition-opacity">
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-400 text-neutral-950 text-[11px] font-mono font-black uppercase tracking-wider shadow-lg">
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>{language === 'kn' ? 'ಪೂರ್ಣ ಎಚ್‌ಡಿ ದರ್ಶನ' : 'EXPAND FULL HD'}</span>
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 select-none relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#E5A812] mb-3 shadow-inner">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#E5A812]">
                      Chanakya Yuvak Mandal
                    </span>
                    <span className="text-xs text-neutral-400 font-sans mt-0.5">
                      Kadalagi Khoot • Yamakanmardi
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-10">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#EEEEEE] p-5 sm:p-8 shadow-sm">
              <h3 className="font-sans sm:font-display font-bold sm:font-extrabold uppercase text-lg sm:text-xl text-black flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-[#E5A812]" />
                <span>{t.yearDetail.pandalHighlight}</span>
              </h3>

              <div className="mt-3.5 p-3 rounded-xl bg-[#E5A812]/10 border border-[#E5A812]/20 font-display text-xs sm:text-sm font-extrabold uppercase tracking-wider text-black">
                {language === 'kn' ? yearData.pandalThemeKn : yearData.pandalThemeEn}
              </div>

              <p className="mt-4 text-xs sm:text-sm text-gray-600 leading-relaxed font-sans">
                {language === 'kn' ? yearData.summaryKn : yearData.summaryEn}
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-[#EEEEEE] p-8 shadow-sm">
              <h3 className="font-display font-extrabold uppercase text-xl text-black mb-4">
                {t.yearDetail.eventsTitle}
              </h3>

              <div className="space-y-3 font-sans">
                {((language === 'kn' ? yearData.highlightsKn : yearData.highlightsEn) || []).map((hl, idx) => (
                  <div key={idx} className="flex items-start space-x-3 text-xs sm:text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-[#E5A812] flex-shrink-0 mt-0.5" />
                    <span>{hl}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-[#EEEEEE] p-6 shadow-sm">
              <h4 className="font-display font-extrabold text-xs uppercase tracking-wider pb-3 border-b border-gray-100 flex items-center space-x-2 text-black">
                <Calendar className="w-4 h-4 text-[#E5A812]" />
                <span>{t.yearDetail.datesMuhurta}</span>
              </h4>
              <p className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed font-sans">
                {language === 'kn' ? yearData.datesMuhurtaKn : yearData.datesMuhurtaEn}
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-[#EEEEEE] p-6 shadow-sm">
              <h4 className="font-display font-extrabold text-xs uppercase tracking-wider pb-3 border-b border-gray-100 flex items-center space-x-2 text-black">
                <User className="w-4 h-4 text-[#E5A812]" />
                <span>{t.yearDetail.shilpiTitle}</span>
              </h4>
              <p className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed font-sans">
                {language === 'kn' ? yearData.shilpiKn : yearData.shilpiEn}
              </p>
            </div>
          </div>
        </div>

        {/* Gallery for this year */}
        <div className="mt-16 pt-12 border-t border-[#EEEEEE]">
          <SectionTitle
            badge={`Ganesh Utsav ${yearData.year}`}
            title={t.yearDetail.galleryTitle}
            subtitle={language === 'kn' ? `${yearData.year} ರ ಸವಿ ನೆನಪುಗಳು` : `Photographs from ${yearData.year}`}
          />

          {displayGalleryItems.length === 0 ? (
            <div className="text-center py-12 px-6 bg-white rounded-3xl border border-gray-200/80 max-w-md mx-auto mt-6 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto mb-3">
                <Camera className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-neutral-900">
                {language === 'kn' ? `${yearData.year} ರ ಛಾಯಾಚಿತ್ರಗಳು ಶೀಘ್ರದಲ್ಲೇ ಲಭ್ಯ` : `Photographs for ${yearData.year} Coming Soon`}
              </h4>
              <p className="text-xs text-neutral-500 mt-1 font-sans">
                {language === 'kn'
                  ? 'ಈ ವರ್ಷದ ದರ್ಶನ ಮತ್ತು ಮಂಟಪದ ಫೋಟೋಗಳು ಶೀಘ್ರದಲ್ಲೇ ಪ್ರಕಟವಾಗಲಿವೆ.'
                  : 'Archival photographs for this annual utsav will be documented shortly.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
              {displayGalleryItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedLightboxItem(item)}
                  className="bg-white rounded-3xl overflow-hidden border border-gray-200/90 shadow-xs hover:shadow-xl hover:border-[#E5A812]/50 group cursor-pointer flex flex-col transition-all duration-300"
                >
                  <div className="relative h-48 w-full bg-black overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={getHdMediaUrl(item.imageUrl, 'image')}
                        alt={item.titleEn}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-stone-900 text-stone-400">
                        <Camera className="w-8 h-8 text-amber-400 mb-1" />
                        <span className="text-[10px] font-mono">{item.year}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <p className="font-display font-bold text-xs uppercase tracking-wider text-gray-800 line-clamp-1 group-hover:text-[#C88A00] transition-colors">
                      {language === 'kn' ? item.titleKn : item.titleEn}
                    </p>
                    <p className="mt-1 text-[11px] text-gray-500 line-clamp-1 font-sans">
                      {language === 'kn' ? item.descriptionKn : item.descriptionEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-10 text-center">
            <Link
              to="/gallery"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-black text-white hover:bg-[#E5A812] hover:text-black font-display text-xs font-extrabold uppercase tracking-wider transition-all"
            >
              <span>{t.common.viewGallery}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {selectedLightboxItem && (
        <LightboxModal
          item={selectedLightboxItem}
          items={allModalItems}
          onClose={() => setSelectedLightboxItem(null)}
          onNavigate={(nextItem) => setSelectedLightboxItem(nextItem)}
        />
      )}
    </div>
  );
};
