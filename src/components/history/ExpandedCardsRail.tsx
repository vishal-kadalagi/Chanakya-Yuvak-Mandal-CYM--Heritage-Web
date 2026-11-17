import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Calendar, CheckCircle2, Crown, Camera } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { HistoryMilestoneDoc } from '../../services/historyService';
import { getHdMediaUrl, getVideoPosterUrl } from '../../utils/mediaUtils';

interface ExpandedCardsRailProps {
  items: HistoryMilestoneDoc[];
  selectedYear?: number | 'all';
  onYearChange?: (year: number) => void;
}

const yearThemeLightMap: Record<number, { accentBadge: string; themeIcon: string; subtleTint: string }> = {
  2028: {
    accentBadge: 'bg-amber-500 text-white',
    themeIcon: '👑',
    subtleTint: 'from-amber-50/40 via-white to-white',
  },
  2027: {
    accentBadge: 'bg-amber-500 text-white',
    themeIcon: '🚩',
    subtleTint: 'from-amber-50/40 via-white to-white',
  },
  2026: {
    accentBadge: 'bg-amber-500 text-white',
    themeIcon: '🏛️',
    subtleTint: 'from-amber-50/40 via-white to-white',
  },
  2025: {
    accentBadge: 'bg-amber-600 text-white',
    themeIcon: '🛕',
    subtleTint: 'from-orange-50/40 via-white to-white',
  },
  2024: {
    accentBadge: 'bg-stone-800 text-amber-300',
    themeIcon: '👑',
    subtleTint: 'from-yellow-50/40 via-white to-white',
  },
  2023: {
    accentBadge: 'bg-stone-900 text-white',
    themeIcon: '⭐',
    subtleTint: 'from-stone-50/40 via-white to-white',
  },
  2022: {
    accentBadge: 'bg-stone-800 text-white',
    themeIcon: '🪔',
    subtleTint: 'from-amber-50/30 via-white to-white',
  },
  2021: {
    accentBadge: 'bg-stone-800 text-white',
    themeIcon: '🌾',
    subtleTint: 'from-stone-50/30 via-white to-white',
  },
  2020: {
    accentBadge: 'bg-stone-800 text-white',
    themeIcon: '🚩',
    subtleTint: 'from-orange-50/30 via-white to-white',
  },
  2019: {
    accentBadge: 'bg-amber-600 text-white',
    themeIcon: '✨',
    subtleTint: 'from-amber-50/50 via-white to-white',
  },
};

// Curated authentic visual fallbacks for each year
const yearPhotoFallbackMap: Record<number, { image: string; captionEn: string; captionKn: string }> = {
  2028: {
    image: '/assets/images/grand_ganesha_logo_opt.png',
    captionEn: '10th Year Historic Dashama Varshotsava Mahotsav',
    captionKn: '10ನೇ ವರ್ಷದ ಐತಿಹಾಸಿಕ ದಶಮ ವರ್ಷೋತ್ಸವ ಸಂಭ್ರಮ',
  },
  2027: {
    image: '/assets/images/grand_ganesha_logo_opt.png',
    captionEn: '9th Year Grand Ganesh Mahotsav Celebration',
    captionKn: '9ನೇ ವರ್ಷದ ಭವ್ಯ ಶ್ರೀ ಗಣೇಶ ಮಹೋತ್ಸವ',
  },
  2026: {
    image: '/assets/images/grand_ganesha_logo_opt.png',
    captionEn: '8th Year Royal Hoysala Pandal Design & Darbar',
    captionKn: '8ನೇ ವರ್ಷದ ಹೊಯ್ಸಳ ಶೈಲಿಯ ಭವ್ಯ ಕಲಾ ಮಂಟಪ ಮಾದರಿ',
  },
  2025: {
    image: '/assets/images/ganapati.jpg',
    captionEn: '7th Year Divya Lalbaghcha Raja Posture Vignaharta',
    captionKn: '7ನೇ ವರ್ಷದ ದಿವ್ಯ ಲಾಲ್‌ಬಾಗ್‌ಚಾ ರಾಜ ಗಣಪತಿ ದರ್ಶನ',
  },
  2024: {
    image: '/assets/images/hero_group_darshan.jpg',
    captionEn: '6th Year Mysore Palace Golden Darbar & Devotees',
    captionKn: '6ನೇ ವರ್ಷದ ಮೈಸೂರು ಅರಮನೆ ಸುವರ್ಣ ದರ್ಬಾರ್ ಮಹೋತ್ಸವ',
  },
  2023: {
    image: '/assets/images/hero_committee_group.jpg',
    captionEn: '5th Milestone Jubilee Seva Youth Committee',
    captionKn: '5ನೇ ವರ್ಷದ ಐತಿಹಾಸಿಕ ಪಂಚಮೋತ್ಸವ ಸಂಭ್ರಮ',
  },
  2022: {
    image: '/assets/images/hero_committee_clean.jpg',
    captionEn: '4th Year Resurgence & Youth Seva Dedication',
    captionKn: '4ನೇ ವರ್ಷದ ನವ ಚೈತನ್ಯದ ಯುವ ಸೇವಾ ಸಂಘಟನೆ',
  },
  2021: {
    image: '/assets/ganesh_watermark.jpg',
    captionEn: '3rd Year Sacred Vignaharta Puja & Village Seva',
    captionKn: '3ನೇ ವರ್ಷದ ಭಕ್ತಿಪೂರ್ವಕ ಪೂಜಾ ಆರಾಧನೆ & ಸೇವೆ',
  },
  2020: {
    image: '/assets/images/ganesha_colored_watermark.png',
    captionEn: '2nd Year Sacred Morning-Evening Mahamangalaarti',
    captionKn: '2ನೇ ವರ್ಷದ ನಿರಂತರ ಮಹಾಮಂಗಳಾರತಿ ಸೇವೆ',
  },
  2019: {
    image: '/assets/images/grand_ganesha_logo_opt.png',
    captionEn: '1st Year Foundation of Chanakya Yuvak Mandal',
    captionKn: '1ನೇ ವರ್ಷದ ಐತಿಹಾಸಿಕ ಸ್ಥಾಪನೆಯ ಶುಭಾರಂಭ',
  },
};

export const ExpandedCardsRail: React.FC<ExpandedCardsRailProps> = ({
  items,
  selectedYear,
  onYearChange,
}) => {
  const { language } = useLanguage();
  const sortedItems = [...items].sort((a, b) => b.year - a.year);
  
  // Use controlled selectedYear if provided and numeric, otherwise internal state
  const [internalActiveYear, setInternalActiveYear] = useState<number>(sortedItems[0]?.year || 2026);
  const activeYear = typeof selectedYear === 'number' ? selectedYear : internalActiveYear;

  const handleSelect = (year: number) => {
    setInternalActiveYear(year);
    if (onYearChange) {
      onYearChange(year);
    }
  };

  const getEditionLabel = (year: number) => {
    const edition = year - 2019 + 1;
    return language === 'kn' ? `${edition}ನೇ ವಾರ್ಷಿಕ ಮಹೋತ್ಸವ` : `${edition}th Annual Edition`;
  };

  return (
    <div className="w-full select-none">
      {/* ================= DESKTOP / TABLET: EXPANDING CARDS RAIL ================= */}
      <div className="hidden md:flex h-[580px] lg:h-[620px] w-full gap-2.5 lg:gap-3 overflow-hidden rounded-3xl p-2.5 bg-[#F5F4EE] border border-stone-300/80 shadow-md relative">
        {sortedItems.map((item) => {
          const isExpanded = activeYear === item.year;
          const config = yearThemeLightMap[item.year] || yearThemeLightMap[2026];
          const photoData = yearPhotoFallbackMap[item.year] || yearPhotoFallbackMap[2026];
          const displayImage = item.coverImage || photoData.image;

          return (
            <motion.div
              key={item.year}
              layout
              transition={{
                layout: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
              }}
              onMouseEnter={() => handleSelect(item.year)}
              onClick={() => handleSelect(item.year)}
              className={`relative rounded-2xl cursor-pointer overflow-hidden transition-all duration-300 border ${
                isExpanded
                  ? 'flex-[5] bg-white border-amber-400 shadow-[0_12px_40px_rgba(217,119,6,0.12)]'
                  : 'flex-[0.7] bg-[#FCFBF8] hover:bg-white border-stone-200 hover:border-amber-300 shadow-xs'
              }`}
            >
              {/* Subtle Warm Gradient Wash */}
              <div
                className={`absolute inset-0 bg-gradient-to-b ${config.subtleTint} transition-opacity duration-500 ${
                  isExpanded ? 'opacity-100' : 'opacity-60'
                }`}
              />

              {/* Watermark Crest behind card */}
              <div
                className={`absolute right-0 bottom-0 pointer-events-none transition-all duration-700 select-none ${
                  isExpanded ? 'opacity-[0.05] scale-100 translate-x-10 translate-y-10' : 'opacity-[0.03] scale-75'
                }`}
              >
                <img
                  src="/assets/images/grand_ganesha_logo_opt.png"
                  alt="CYM Watermark"
                  className="w-80 h-80 object-contain filter grayscale"
                />
              </div>

              {/* Top Accent Strip */}
              <div
                className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 transition-opacity duration-500 ${
                  isExpanded ? 'opacity-100' : 'opacity-0'
                }`}
              />

              {/* ================= COLLAPSED SLIVER VIEW ================= */}
              {!isExpanded && (
                <div className="absolute inset-0 flex flex-col justify-between items-center py-6 px-2 text-stone-600">
                  {/* Top Year Tag */}
                  <div className="flex flex-col items-center space-y-1 font-mono text-[10px] font-bold text-amber-700 tracking-wider">
                    <span>{item.year}</span>
                    <div className="w-1 h-4 bg-amber-400/50 rounded-full" />
                  </div>

                  {/* Vertical Rotated Headline */}
                  <div className="flex-1 flex items-center justify-center my-4 overflow-hidden">
                    <span
                      className={`text-xs lg:text-sm font-bold tracking-wider uppercase whitespace-nowrap [writing-mode:vertical-rl] rotate-180 transition-colors ${
                        language === 'kn' ? 'font-kannada text-stone-800' : 'font-sans text-stone-700'
                      }`}
                    >
                      {language === 'kn' ? item.titleKn : item.titleEn}
                    </span>
                  </div>

                  {/* Bottom Year Number */}
                  <div className="flex flex-col items-center">
                    <span className="font-display font-black text-base lg:text-lg text-stone-900 tracking-tight">
                      {item.year}
                    </span>
                    <span className="text-[9px] font-mono text-stone-400 uppercase">
                      {item.year === 2026 ? 'LEAD' : 'UTSAV'}
                    </span>
                  </div>
                </div>
              )}

              {/* ================= EXPANDED FULL CARD VIEW (WITH DEDICATED IMAGE AREA) ================= */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.35, delay: 0.1 }}
                  className="relative h-full flex flex-col justify-between p-6 lg:p-7 z-10 text-stone-900 overflow-hidden"
                >
                  {/* Top Header Badges */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-3.5 border-b border-stone-200">
                    <div className="flex items-center space-x-2.5">
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-stone-900 text-amber-300 font-mono font-bold text-[11px] uppercase tracking-wider shadow-xs">
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        <span>{item.year}</span>
                      </span>

                      <span className="text-xs font-sans font-bold uppercase tracking-wider text-amber-800">
                        {getEditionLabel(item.year)}
                      </span>
                    </div>

                    {(item.samvatsaraKn || item.samvatsaraEn) && (
                      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-mono font-bold">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>{language === 'kn' ? item.samvatsaraKn : item.samvatsaraEn}</span>
                      </span>
                    )}
                  </div>

                  {/* 2-Column Body: Left Content + Right Image Area */}
                  <div className="my-auto py-3 grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-6 items-stretch h-[calc(100%-110px)] overflow-hidden">
                    
                    {/* LEFT COLUMN: Narrative & Specs (7 cols) */}
                    <div className="md:col-span-7 flex flex-col justify-between overflow-y-auto no-scrollbar pr-1">
                      <div>
                        {/* Title & Theme */}
                        <h3
                          className={`text-xl sm:text-2xl font-black text-stone-900 tracking-tight leading-snug ${
                            language === 'kn' ? 'font-kannada' : 'font-sans'
                          }`}
                        >
                          {language === 'kn' ? item.titleKn : item.titleEn}
                        </h3>

                        {(item.pandalThemeKn || item.pandalThemeEn) && (
                          <div className="mt-2.5 inline-flex items-center space-x-2 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-sans font-bold">
                            <span>{config.themeIcon}</span>
                            <span className="line-clamp-1">
                              {language === 'kn' ? item.pandalThemeKn : item.pandalThemeEn}
                            </span>
                          </div>
                        )}

                        {/* Summary Paragraph */}
                        <p className="mt-3 text-xs sm:text-sm text-stone-600 font-sans leading-relaxed line-clamp-3">
                          {language === 'kn' ? item.summaryKn : item.summaryEn}
                        </p>
                      </div>

                      {/* Key Highlights Grid */}
                      {((language === 'kn' ? item.highlightsKn : item.highlightsEn) || []).length > 0 && (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(language === 'kn' ? item.highlightsKn : item.highlightsEn)?.slice(0, 4).map((hl, i) => (
                            <div key={i} className="flex items-start space-x-2 text-[11px] text-stone-700 bg-stone-50 border border-stone-200/70 rounded-lg p-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{hl}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* RIGHT COLUMN: DEDICATED IMAGE/VIDEO AREA (5 cols) - UNBROKEN MURTI */}
                    <div className="md:col-span-5 relative h-full min-h-[220px] rounded-2xl overflow-hidden border border-stone-300/80 shadow-md group/img bg-stone-950 flex flex-col justify-between">
                      {/* Ambient blur background to frame the full idol */}
                      <img
                        src={displayImage}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover blur-xl opacity-35 scale-110 pointer-events-none"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/images/grand_ganesha_logo_opt.png';
                        }}
                      />

                      {/* Actual Video or Image - Uncropped Deity Preservation */}
                      {/\.(mp4|webm|mov|ogg|m4v)($|\?)/i.test(displayImage) || displayImage.includes('/video/upload/') ? (
                        <video
                          src={getHdMediaUrl(displayImage, 'video')}
                          poster={getVideoPosterUrl(displayImage)}
                          autoPlay
                          loop
                          muted
                          playsInline
                          preload="metadata"
                          className="relative z-1 w-full h-full object-contain p-1 group-hover/img:scale-102 transition-transform duration-500"
                        />
                      ) : (
                        <img
                          src={displayImage}
                          alt={item.titleEn}
                          className="relative z-1 w-full h-full object-contain p-1 group-hover/img:scale-102 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/images/grand_ganesha_logo_opt.png';
                          }}
                        />
                      )}

                      {/* Top Translucent Photo/Video Chip */}
                      <div className="relative z-10 m-3 flex items-center justify-between">
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-stone-950/80 backdrop-blur-md text-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider shadow-sm">
                          {/\.(mp4|webm|mov|ogg|m4v)($|\?)/i.test(displayImage) || displayImage.includes('/video/upload/') ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                              <span>{language === 'kn' ? 'ಐತಿಹಾಸಿಕ ವಿಡಿಯೋ' : 'ARCHIVE VIDEO'}</span>
                            </>
                          ) : (
                            <>
                              <Camera className="w-3 h-3 text-amber-400" />
                              <span>{language === 'kn' ? 'ಐತಿಹಾಸಿಕ ಛಾಯಾಚಿತ್ರ' : 'ARCHIVE PHOTO'}</span>
                            </>
                          )}
                        </span>

                        <span className="px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-stone-900 font-mono text-[10px] font-bold shadow-xs">
                          {item.year}
                        </span>
                      </div>

                      {/* Bottom Caption Overlay */}
                      <div className="relative z-10 mt-auto bg-gradient-to-t from-stone-950/90 via-stone-950/60 to-transparent p-3.5 pt-8 text-white">
                        <p className="text-xs font-sans font-semibold text-white/95 line-clamp-1 leading-snug">
                          {language === 'kn' ? photoData.captionKn : photoData.captionEn}
                        </p>
                        <span className="text-[10px] font-mono text-amber-300 block mt-0.5">
                          📍 Kadalagi Khoot, Yamakanmardi
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Footer Actions */}
                  <div className="pt-3 border-t border-stone-200 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center space-x-2 text-xs text-stone-500 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      <span className="line-clamp-1">
                        {language === 'kn' ? item.datesMuhurtaKn || 'ಕಡಲಗಿ ಖೂಟ' : item.datesMuhurtaEn || 'Kadalagi Khoot'}
                      </span>
                    </div>

                    <Link
                      to={`/history/${item.year}`}
                      className="inline-flex items-center space-x-2 px-6 py-2 rounded-full bg-stone-900 hover:bg-amber-500 text-white hover:text-stone-950 font-sans text-xs font-black uppercase tracking-wider transition-all shadow-sm group cursor-pointer"
                    >
                      <span>
                        {language === 'kn'
                          ? `${item.year} ಪೂರ್ಣ ದಾಖಲೆ ನೋಡಿ`
                          : `EXPLORE ${item.year} ARCHIVE`}
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ================= MOBILE: EXPANDING ACCORDION STACK WITH IMAGE AREA ================= */}
      <div className="flex md:hidden flex-col space-y-3 w-full">
        {sortedItems.map((item) => {
          const isExpanded = activeYear === item.year;
          const config = yearThemeLightMap[item.year] || yearThemeLightMap[2026];
          const photoData = yearPhotoFallbackMap[item.year] || yearPhotoFallbackMap[2026];
          const displayImage = item.coverImage || photoData.image;

          return (
            <div
              key={item.year}
              onClick={() => handleSelect(item.year)}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isExpanded
                  ? 'border-amber-400 bg-white shadow-md'
                  : 'border-stone-200 bg-white hover:border-amber-200'
              }`}
            >
              {/* Header Bar of Accordion */}
              <div className="p-4 flex items-center justify-between cursor-pointer">
                <div className="flex items-center space-x-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase ${
                      isExpanded
                        ? 'bg-amber-500 text-white'
                        : 'bg-stone-100 text-stone-700 border border-stone-200'
                    }`}
                  >
                    {item.year}
                  </span>

                  <div>
                    <h4
                      className={`text-sm font-bold text-stone-900 line-clamp-1 ${
                        language === 'kn' ? 'font-kannada' : 'font-sans'
                      }`}
                    >
                      {language === 'kn' ? item.titleKn : item.titleEn}
                    </h4>
                    <span className="text-[10px] font-sans font-semibold text-amber-800 uppercase tracking-wider">
                      {getEditionLabel(item.year)}
                    </span>
                  </div>
                </div>

                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-stone-500 bg-stone-100 transition-transform duration-300 ${
                    isExpanded ? 'rotate-90 text-amber-600' : ''
                  }`}
                >
                  ▶
                </span>
              </div>

              {/* Expanded Mobile Body with Image Area */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-stone-100 text-stone-600 text-xs font-sans space-y-3 bg-[#FAF8F5]">
                  
                  {/* MOBILE IMAGE AREA - UNBROKEN MURTI */}
                  <div className="w-full h-56 rounded-xl overflow-hidden relative border border-stone-200 shadow-xs mt-2 bg-stone-950 flex items-center justify-center">
                    <img
                      src={displayImage}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover blur-lg opacity-30 scale-110 pointer-events-none"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/images/grand_ganesha_logo_opt.png';
                      }}
                    />
                    <img
                      src={displayImage}
                      alt={item.titleEn}
                      className="relative z-1 w-full h-full object-contain p-1"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/images/grand_ganesha_logo_opt.png';
                      }}
                    />
                    <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-stone-950/85 to-transparent p-2.5 text-white">
                      <p className="text-[11px] font-semibold text-white line-clamp-1">
                        {language === 'kn' ? photoData.captionKn : photoData.captionEn}
                      </p>
                    </div>
                  </div>

                  {(item.pandalThemeKn || item.pandalThemeEn) && (
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-white border border-stone-200 text-stone-800 text-[11px]">
                      <span>{config.themeIcon}</span>
                      <span>{language === 'kn' ? item.pandalThemeKn : item.pandalThemeEn}</span>
                    </div>
                  )}

                  <p className="text-stone-600 leading-relaxed">
                    {language === 'kn' ? item.summaryKn : item.summaryEn}
                  </p>

                  <div className="pt-2">
                    <Link
                      to={`/history/${item.year}`}
                      className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-full bg-stone-900 text-white font-bold uppercase tracking-wider text-xs shadow-xs"
                    >
                      <span>{language === 'kn' ? `${item.year} ದಾಖಲೆ ನೋಡಿ` : `VIEW ${item.year} ARCHIVE`}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
