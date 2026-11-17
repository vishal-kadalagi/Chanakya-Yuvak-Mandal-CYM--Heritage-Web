import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  MapPin,
  Camera,
  Heart,
  ChevronRight,
  Film,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { SacredGeometryOverlay } from '../common/SacredGeometryOverlay';
import { subscribeToPublicMedia } from '../../services/mediaService';
import { MediaItem } from '../../types/media';
import { subscribeToHistory, HistoryMilestoneDoc } from '../../services/historyService';
import { subscribeToCommittee, CommitteeMemberDoc } from '../../services/committeeService';
import { getHdMediaUrl, getReelMediaUrl, getVideoPosterUrl } from '../../utils/mediaUtils';

export const CommitteeMessage: React.FC = () => {
  const { language } = useLanguage();
  const [galleryMedia, setGalleryMedia] = useState<MediaItem[]>([]);
  const [historyMedia, setHistoryMedia] = useState<MediaItem[]>([]);
  const [historyMilestones, setHistoryMilestones] = useState<HistoryMilestoneDoc[]>([]);
  const [committeeMembers, setCommitteeMembers] = useState<CommitteeMemberDoc[]>([]);

  // Real-time dynamic subscriptions from Admin uploaded data
  useEffect(() => {
    // 1. Subscribe to Public Media
    const unsubMedia = subscribeToPublicMedia(undefined, (items) => {
      if (items && items.length > 0) {
        // Gallery media items
        const gItems = items.filter(
          (i) =>
            i.placement === 'gallery' ||
            !i.placement ||
            (Array.isArray(i.placements) && i.placements.includes('gallery')) ||
            i.category === 'darshan'
        );
        setGalleryMedia(gItems);

        // History media items
        const hItems = items.filter(
          (i) =>
            i.placement === 'history' ||
            (Array.isArray(i.placements) && i.placements.includes('history'))
        );
        setHistoryMedia(hItems);
      } else {
        setGalleryMedia([]);
        setHistoryMedia([]);
      }
    });

    // 2. Subscribe to History Milestones
    const unsubHistory = subscribeToHistory((milestones) => {
      setHistoryMilestones(milestones.filter((m) => m.isActive !== false));
    });

    // 3. Subscribe to Committee Members
    const unsubCommittee = subscribeToCommittee((members) => {
      setCommitteeMembers(members.filter((m) => m.isActive !== false));
    });

    return () => {
      unsubMedia();
      unsubHistory();
      unsubCommittee();
    };
  }, []);

  // Compute Latest Dynamic Items
  const latestGallery = galleryMedia[0] || null;
  const latestMilestone = historyMilestones[0] || null;
  const latestHistoryMedia = historyMedia[0] || null;

  // Compute Dynamic Max Year & Legacy Count
  const maxYear = useMemo(() => {
    const years = [
      ...historyMilestones.map((h) => h.year),
      ...galleryMedia.map((g) => g.year),
    ].filter(Boolean);
    return years.length > 0 ? Math.max(...years, 2026) : 2026;
  }, [historyMilestones, galleryMedia]);

  const yearsCount = Math.max(1, maxYear - 2019 + 1);

  // Dynamic Gallery Card Content
  const galleryCard = {
    titleKn: latestGallery?.titleKn || 'ಗಣೇಶ ದರ್ಶನ',
    titleEn: latestGallery?.titleEn || 'Ganesh Darshan',
    subKn: latestGallery
      ? `${latestGallery.year} • ${
          latestGallery.category === 'darshan'
            ? 'ದಿವ್ಯ ದರ್ಶನ'
            : latestGallery.category === 'visarjan'
            ? 'ಮೆರವಣಿಗೆ'
            : latestGallery.category === 'pandal'
            ? 'ಮಂಟಪ'
            : 'ಪವಿತ್ರ ಗ್ಯಾಲರಿ'
        }`
      : 'ಪವಿತ್ರ ದಿವ್ಯ ಮೂರ್ತಿ',
    subEn: latestGallery
      ? `${latestGallery.year} • ${latestGallery.category?.toUpperCase() || 'DARSHAN'}`
      : 'Sacred Clay Murti',
    tagKn: 'ಚಿತ್ರಾವಳಿ',
    tagEn: 'GALLERY',
    linkTo: '/gallery',
    mediaUrl: latestGallery?.mediaUrl
      ? getHdMediaUrl(latestGallery.mediaUrl, latestGallery.mediaType)
      : '/assets/images/hero_group_darshan.jpg',
    mediaType: latestGallery?.mediaType || 'image',
  };

  // Dynamic History Card Content
  const historyCoverUrl = latestMilestone?.coverImage
    ? getHdMediaUrl(latestMilestone.coverImage)
    : latestHistoryMedia?.mediaUrl
    ? getHdMediaUrl(latestHistoryMedia.mediaUrl, latestHistoryMedia.mediaType)
    : '/assets/images/hero_committee_group.jpg';

  const historyCard = {
    titleKn:
      latestMilestone?.titleKn ||
      latestHistoryMedia?.titleKn ||
      'ಭವ್ಯ ಮೆರವಣಿಗೆ & ಸೇವೆ',
    titleEn:
      latestMilestone?.titleEn ||
      latestHistoryMedia?.titleEn ||
      'Miravanige & Seva',
    subKn: latestMilestone
      ? `${latestMilestone.year} • ${
          latestMilestone.samvatsaraKn ||
          latestMilestone.pandalThemeKn ||
          'ಇತಿಹಾಸ ಮೈಲಿಗಲ್ಲು'
        }`
      : latestHistoryMedia
      ? `${latestHistoryMedia.year} • ಐತಿಹಾಸಿಕ ಸಂಗ್ರಹ`
      : 'ಸಾಂಸ್ಕೃತಿಕ ವೈಭವ',
    subEn: latestMilestone
      ? `${latestMilestone.year} • ${
          latestMilestone.pandalThemeEn || 'Heritage Milestone'
        }`
      : latestHistoryMedia
      ? `${latestHistoryMedia.year} • Festival History`
      : 'Grand Cultural Seva',
    tagKn: 'ಇತಿಹಾಸ',
    tagEn: 'HISTORY',
    linkTo: '/history',
    mediaUrl: historyCoverUrl,
    mediaType: latestHistoryMedia?.mediaType || 'image',
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-[#FDFBF7] via-white to-[#F8F6F0] border-b border-amber-900/10 relative overflow-hidden">
      {/* Helix Style Slow Rotating Sacred Yantra in Background */}
      <SacredGeometryOverlay className="absolute -top-24 -left-24" size={550} opacity={0.06} />
      <SacredGeometryOverlay className="absolute -bottom-24 -right-24" size={500} opacity={0.05} />

      {/* Decorative Warm Ambient Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-400/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-amber-500/6 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ================= LEFT COLUMN: ROYAL HERITAGE SHOWCASE & VISUAL ARCHIVE ================= */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[430px] space-y-3.5">
              
              {/* Primary Heritage Brand Card */}
              <div className="relative rounded-2xl bg-gradient-to-b from-amber-50/70 via-white to-amber-100/40 border border-amber-300/80 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden">
                {/* Subtle Radial Glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(229,168,18,0.14)_0%,transparent_70%)] pointer-events-none" />

                {/* Top Badges Bar */}
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/40 text-amber-950 text-[11px] font-sans font-bold tracking-wide shadow-2xs">
                    <span>🚩</span>
                    <span>{language === 'kn' ? 'ಕಡಲಗಿ ಖೂಟ' : 'Kadalagi Khoot'}</span>
                  </div>

                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/15 to-amber-400/20 border border-amber-400/50 text-amber-950 text-[10px] font-mono font-bold uppercase tracking-wider shadow-2xs">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>ESTD 2019</span>
                  </div>
                </div>

                {/* Official CYM Emblem with Gentle Breathing Scale Animation */}
                <div className="py-2.5 flex items-center justify-center relative">
                  <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-b from-amber-200/30 to-amber-100/10 absolute -z-0 blur-xl scale-90" />
                  <img
                    src="/assets/logo_transparent.png"
                    alt="Chanakya Yuvak Mandal"
                    className="max-h-28 sm:max-h-32 w-auto object-contain transition-transform duration-500 ease-out group-hover:scale-105 filter drop-shadow relative z-10"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/assets/logo_transparent.png';
                    }}
                  />
                </div>

                {/* Location Footnote Pill */}
                <div className="mt-3 pt-3 border-t border-amber-200/80 flex items-center justify-center space-x-1.5 text-xs font-sans font-semibold text-amber-950/90">
                  <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    {language === 'kn'
                      ? 'ಯಮಕನಮರಡಿ • ಹುಕ್ಕೇರಿ • ಬೆಳಗಾವಿ'
                      : 'Yamakanmardi • Hukkeri • Belagavi'}
                  </span>
                </div>
              </div>

              {/* Bottom Row: 2 Rich Dynamic Archive Cards (Live Admin Content) */}
              <div className="grid grid-cols-2 gap-3">
                {/* 1. Dynamic Gallery Preview Card */}
                <Link
                  to={galleryCard.linkTo}
                  className="group relative rounded-xl overflow-hidden bg-neutral-900 border border-amber-300/70 shadow-xs hover:border-amber-500 hover:shadow-lg transition-all duration-300 h-28 sm:h-32 p-3 flex flex-col justify-between transform hover:-translate-y-0.5"
                >
                  {galleryCard.mediaType === 'video' ? (
                    <video
                      src={getReelMediaUrl(galleryCard.mediaUrl, 'video')}
                      poster={getVideoPosterUrl(galleryCard.mediaUrl)}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="none"
                      className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500 ease-out"
                    />
                  ) : (
                    <img
                      src={getHdMediaUrl(galleryCard.mediaUrl, 'image')}
                      alt={galleryCard.titleEn}
                      className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500 ease-out"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/assets/images/hero_group_darshan.jpg';
                      }}
                    />
                  )}
                  {/* Gradient Tint Overlay for Crisp Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/35 pointer-events-none" />

                  {/* Top Bar with Icon and Tag */}
                  <div className="flex items-center justify-between relative z-10">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-400/50 backdrop-blur-xs flex items-center justify-center text-amber-300 group-hover:scale-110 group-hover:bg-amber-400 group-hover:text-neutral-950 transition-all">
                      {galleryCard.mediaType === 'video' ? (
                        <Film className="w-3.5 h-3.5" />
                      ) : (
                        <Camera className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <span className="inline-flex items-center space-x-0.5 text-[9px] font-mono font-bold tracking-wider uppercase text-amber-300 bg-black/60 border border-amber-400/40 px-1.5 py-0.5 rounded backdrop-blur-xs group-hover:border-amber-300 transition-colors">
                      <span>{language === 'kn' ? galleryCard.tagKn : galleryCard.tagEn}</span>
                      <ArrowUpRight className="w-2.5 h-2.5" />
                    </span>
                  </div>

                  {/* Text Label Bar */}
                  <div className="relative z-10">
                    <span className="text-white text-xs font-bold leading-tight block truncate drop-shadow group-hover:text-amber-300 transition-colors">
                      {language === 'kn' ? galleryCard.titleKn : galleryCard.titleEn}
                    </span>
                    <span className="text-[10px] text-amber-300/90 font-medium block mt-0.5 truncate drop-shadow-xs">
                      {language === 'kn' ? galleryCard.subKn : galleryCard.subEn}
                    </span>
                  </div>
                </Link>

                {/* 2. Dynamic History Milestone Preview Card */}
                <Link
                  to={historyCard.linkTo}
                  className="group relative rounded-xl overflow-hidden bg-neutral-900 border border-amber-300/70 shadow-xs hover:border-amber-500 hover:shadow-lg transition-all duration-300 h-28 sm:h-32 p-3 flex flex-col justify-between transform hover:-translate-y-0.5"
                >
                  {historyCard.mediaType === 'video' ? (
                    <video
                      src={getReelMediaUrl(historyCard.mediaUrl, 'video')}
                      poster={getVideoPosterUrl(historyCard.mediaUrl)}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="none"
                      className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500 ease-out"
                    />
                  ) : (
                    <img
                      src={historyCard.mediaUrl}
                      alt={historyCard.titleEn}
                      className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500 ease-out"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/assets/images/hero_committee_group.jpg';
                      }}
                    />
                  )}
                  {/* Gradient Tint Overlay for Crisp Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/35 pointer-events-none" />

                  {/* Top Bar with Icon and Tag */}
                  <div className="flex items-center justify-between relative z-10">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-400/50 backdrop-blur-xs flex items-center justify-center text-amber-300 group-hover:scale-110 group-hover:bg-amber-400 group-hover:text-neutral-950 transition-all">
                      <Heart className="w-3.5 h-3.5" />
                    </div>
                    <span className="inline-flex items-center space-x-0.5 text-[9px] font-mono font-bold tracking-wider uppercase text-amber-300 bg-black/60 border border-amber-400/40 px-1.5 py-0.5 rounded backdrop-blur-xs group-hover:border-amber-300 transition-colors">
                      <span>{language === 'kn' ? historyCard.tagKn : historyCard.tagEn}</span>
                      <ArrowUpRight className="w-2.5 h-2.5" />
                    </span>
                  </div>

                  {/* Text Label Bar */}
                  <div className="relative z-10">
                    <span className="text-white text-xs font-bold leading-tight block truncate drop-shadow group-hover:text-amber-300 transition-colors">
                      {language === 'kn' ? historyCard.titleKn : historyCard.titleEn}
                    </span>
                    <span className="text-[10px] text-amber-300/90 font-medium block mt-0.5 truncate drop-shadow-xs">
                      {language === 'kn' ? historyCard.subKn : historyCard.subEn}
                    </span>
                  </div>
                </Link>
              </div>

            </div>
          </div>

          {/* ================= RIGHT COLUMN: ROYAL STORY, STATS & ACTIONS ================= */}
          <div className="lg:col-span-7 space-y-5 text-left">
            
            {/* Eyebrow Badge */}
            <div className="flex items-center">
              <div className="inline-flex items-center space-x-2 text-xs font-sans font-bold tracking-wider text-amber-950 bg-gradient-to-r from-amber-500/15 to-amber-400/25 border border-amber-400/40 px-3.5 py-1 rounded-full uppercase shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>{language === 'kn' ? 'ನಮ್ಮ ಬಗ್ಗೆ & ಧ್ಯೇಯ' : 'OUR HERITAGE & MISSION'}</span>
              </div>
            </div>

            {/* Royal Heading */}
            <div>
              <h2 className={`text-neutral-950 text-2xl sm:text-3xl lg:text-4xl leading-tight font-extrabold tracking-tight ${
                language === 'kn' ? 'font-kannada' : 'font-sans'
              }`}>
                {language === 'kn' ? (
                  <span>
                    ಚಾಣಕ್ಯ <span className="text-[#D48B00]">ಯುವಕ</span> ಮಂಡಳ
                  </span>
                ) : (
                  <span>
                    CHANAKYA <span className="text-[#D48B00]">YUVAK</span> MANDAL
                  </span>
                )}
              </h2>
              <p className="text-xs sm:text-sm font-medium text-amber-900/80 mt-1 flex items-center space-x-1.5">
                <span>📍</span>
                <span>
                  {language === 'kn'
                    ? 'ಕಡಲಗಿ ಖೂಟ, ಯಮಕನಮರಡಿ • 2019 ರಿಂದ ನಿರಂತರ ಸಾಂಸ್ಕೃತಿಕ ಹಾಗೂ ಜನಸೇವಾ ಪಯಣ'
                    : 'Kadalagi Khoot, Yamakanmardi • Dedicated Cultural & Community Seva Since 2019'}
                </span>
              </p>
            </div>

            {/* Narrative Story Box */}
            <div className="rounded-xl p-4 sm:p-5 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/40 border-l-4 border-l-[#D48B00] border-y border-r border-amber-200/70 shadow-2xs">
              <p className="text-sm sm:text-[15px] text-neutral-800 leading-relaxed font-sans">
                {language === 'kn'
                  ? '2019 ರಲ್ಲಿ ಯಮಕನಮರಡಿಯ ಕಡಲಗಿ ಖೂಟದ ಯುವಕರು ಒಗ್ಗೂಡಿ ಆರಂಭಿಸಿದ ಸಾಂಸ್ಕೃತಿಕ ಸಂಘಟನೆ. ನಮ್ಮ ಪಾರಂಪರಿಕ ಗಣೇಶೋತ್ಸವವನ್ನು ರಾಜವೈಭವದಿಂದ ಆಚರಿಸುತ್ತಾ, ಮಹಾ ಅನ್ನಸಂತರ್ಪಣೆ, ಸಾಂಸ್ಕೃತಿಕ ಕಾರ್ಯಕ್ರಮಗಳು ಮತ್ತು ಗ್ರಾಮದ ಸೌಹಾರ್ದತೆಗೆ ನಿಸ್ವಾರ್ಥವಾಗಿ ಸೇವೆ ಸಲ್ಲಿಸುತ್ತಿದ್ದೇವೆ.'
                  : 'Founded in 2019 at Kadalagi Khoot by dedicated village youth, Chanakya Yuvak Mandal preserves ancient royal cultural traditions while celebrating Ganesh Utsav with grand pandals, maha annasantarpane, and youth unity in Yamakanmardi.'}
              </p>
            </div>

            {/* 2 Refined Royal Stat Cards (Live Dynamic Numbers) */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-1 max-w-md">
              {/* Stat 1: Years */}
              <div className="rounded-xl sm:rounded-2xl bg-white border border-amber-200/90 shadow-2xs hover:border-amber-400 hover:shadow-md transition-all duration-300 p-3 sm:p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-mono font-bold text-amber-800/70 uppercase bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50">
                    2019-{String(maxYear).slice(-2)}
                  </span>
                </div>
                <div>
                  <div className="font-sans font-black text-2xl sm:text-3xl text-neutral-950 leading-none tracking-tight">
                    {yearsCount}+
                  </div>
                  <div className="text-[11px] sm:text-xs text-neutral-600 font-sans font-medium mt-1 truncate">
                    {language === 'kn' ? 'ವರ್ಷಗಳ ಇತಿಹಾಸ' : 'Years of Legacy'}
                  </div>
                </div>
              </div>

              {/* Stat 2: Committee Members */}
              <div className="rounded-xl sm:rounded-2xl bg-white border border-amber-200/90 shadow-2xs hover:border-amber-400 hover:shadow-md transition-all duration-300 p-3 sm:p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0">
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-mono font-bold text-amber-800/70 uppercase bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50">
                    SEVA
                  </span>
                </div>
                <div>
                  <div className="font-sans font-black text-2xl sm:text-3xl text-neutral-950 leading-none tracking-tight">
                    {committeeMembers.length > 0 ? `${committeeMembers.length}+` : '35+'}
                  </div>
                  <div className="text-[11px] sm:text-xs text-neutral-600 font-sans font-medium mt-1 truncate">
                    {language === 'kn' ? 'ಕಮಿಟಿ ಸದಸ್ಯರು' : 'Committee Members'}
                  </div>
                </div>
              </div>
            </div>

            {/* High-Contrast Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/about"
                className="inline-flex items-center space-x-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-neutral-950 text-white hover:bg-neutral-900 hover:ring-2 hover:ring-amber-400/50 shadow-sm hover:shadow-md transition-all font-bold text-xs sm:text-sm group cursor-pointer"
              >
                <span>{language === 'kn' ? 'ನಮ್ಮ ಬಗ್ಗೆ ಇನ್ನಷ್ಟು' : 'MORE ABOUT US'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-amber-400" />
              </Link>

              <Link
                to="/history"
                className="inline-flex items-center space-x-1.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-white border border-neutral-300 hover:border-amber-500 hover:text-amber-950 hover:bg-amber-50/30 transition-all font-bold text-xs sm:text-sm text-neutral-800 shadow-2xs group cursor-pointer"
              >
                <span>{language === 'kn' ? 'ಇತಿಹಾಸ ಪಯಣ' : 'OUR HISTORY'}</span>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
