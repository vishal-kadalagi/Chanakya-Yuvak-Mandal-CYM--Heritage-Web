import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Youtube,
  ExternalLink,
  Camera,
  Folder,
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { siteConfig } from '../data/site';
import { GalleryItem, GalleryCategory } from '../data/gallery';
import { GalleryFilter } from '../components/gallery/GalleryFilter';
import { GalleryGrid } from '../components/gallery/GalleryGrid';
import { LightboxModal } from '../components/gallery/LightboxModal';
import { SacredGeometryOverlay } from '../components/common/SacredGeometryOverlay';
import { subscribeToPublicMedia } from '../services/mediaService';
import { subscribeToHistory, HistoryMilestoneDoc } from '../services/historyService';
import { subscribeToAchievements, AchievementDoc } from '../services/achievementsService';
import { subscribeToEvents, CommunityEventDoc } from '../services/eventsService';
import { getHdMediaUrl } from '../utils/mediaUtils';

export const GALLERY_CATEGORIES: {
  key: GalleryCategory;
  labelKn: string;
  labelEn: string;
  icon: string;
  descKn?: string;
  descEn?: string;
}[] = [
  { key: 'all', labelKn: 'ಎಲ್ಲಾ ಮೀಡಿಯಾ', labelEn: 'All Media', icon: '✦', descKn: 'ಸಂಪೂರ್ಣ ಸಂಗ್ರಹ', descEn: 'Complete Collection' },
  { key: 'aagamana', labelKn: 'ಗಣಪತಿ ಆಗಮನ', labelEn: 'Ganesh Aagamana', icon: '🚩', descKn: 'ಪ್ರತಿಷ್ಠಾಪನೆ & ಸ್ವಾಗತ', descEn: 'Grand Idol Arrival' },
  { key: 'darshan', labelKn: 'ದಿವ್ಯ ದರ್ಶನ', labelEn: 'Royal Darshan', icon: '🪔', descKn: 'ಮೂರ್ತಿ ದರ್ಶನ & ಅಲಂಕಾರ', descEn: 'Divine Deity Darshan' },
  { key: 'saval', labelKn: 'ಪವಿತ್ರ ಸವಾಲ್', labelEn: 'Sacred Saval', icon: '👑', descKn: 'ಹರಾಜು & ಲೇಲಾವ್', descEn: 'Prasad Auction' },
  { key: 'aarti', labelKn: 'ಮಂಗಳಾರತಿ', labelEn: 'Maha Aarti', icon: '🔥', descKn: 'ದೇವರಿಗೆ ಮಹಾ ಆರತಿ', descEn: 'Devotional Aarti' },
  { key: 'pandal', labelKn: 'ಭವ್ಯ ಮಂಟಪ', labelEn: 'Pandal & Decor', icon: '🏛️', descKn: 'ವೇದಿಕೆ & ದೀಪಾಲಂಕಾರ', descEn: 'Theme & Stage Decor' },
  { key: 'visarjan', labelKn: 'ವಿಸರ್ಜನೆ', labelEn: 'Visarjan Procession', icon: '🥁', descKn: 'ಭವ್ಯ ಶೋಭಾಯಾತ್ರೆ', descEn: 'Immersion Procession' },
  { key: 'cultural', labelKn: 'ಸಾಂಸ್ಕೃತಿಕ', labelEn: 'Cultural Events', icon: '🎭', descKn: 'ಸಂಗೀತ & ನಾಟಕ', descEn: 'Stage Performances' },
  { key: 'seva', labelKn: 'ಅನ್ನದಾಸೋಹ', labelEn: 'Prasad Seva', icon: '🙏', descKn: 'ಸಮುದಾಯ ಅನ್ನದಾನ', descEn: 'Community Prasad Seva' },
];

export const getYearEdition = (year: number, language: string): string => {
  const diff = year - 2019 + 1;
  if (language === 'kn') {
    if (year === 2023) return '೫ನೇ ಪಂಚಮ ವರ್ಷೋತ್ಸವ';
    if (year === 2028) return '೧೦ನೇ ದಶಮ ವರ್ಷೋತ್ಸವ';
    return `${diff}ನೇ ವಾರ್ಷಿಕ ಮಹೋತ್ಸವ`;
  }
  if (year === 2023) return '5th Jubilee Anniversary';
  if (year === 2028) return '10th Decennial Jubilee';
  const suffixes = ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th'];
  const s = diff % 100 > 10 && diff % 100 < 14 ? 'th' : suffixes[diff % 10] || 'th';
  return `${diff}${s} Annual Festival`;
};

export const getYearCoverImage = (
  year: number,
  historyDocs: HistoryMilestoneDoc[],
  galleryMedia: GalleryItem[]
): string => {
  // 1. Direct photo uploaded in History Section (User's primary requirement)
  const historyDoc = historyDocs.find(
    (h) => h.year === year && h.coverImage && h.coverImage.trim() !== ''
  );
  if (historyDoc?.coverImage) {
    return getHdMediaUrl(historyDoc.coverImage, 'image');
  }

  // 2. Darshan category photo uploaded for that year
  const darshanMedia = galleryMedia.find(
    (m) => m.year === year && m.category === 'darshan' && m.imageUrl && m.imageUrl.trim() !== ''
  );
  if (darshanMedia?.imageUrl) {
    return getHdMediaUrl(darshanMedia.imageUrl, 'image');
  }

  // 3. Any uploaded photo for that year
  const anyMedia = galleryMedia.find(
    (m) => m.year === year && m.imageUrl && m.imageUrl.trim() !== ''
  );
  if (anyMedia?.imageUrl) {
    return getHdMediaUrl(anyMedia.imageUrl, 'image');
  }

  // 4. Authentic historical fallback
  const fallbacks: Record<number, string> = {
    2026: '/assets/images/grand_ganesha_logo_opt.png',
    2025: '/assets/images/ganapati.jpg',
    2024: '/assets/images/hero_group_darshan.jpg',
    2023: '/assets/images/hero_committee_group.jpg',
    2022: '/assets/images/hero_committee_clean.jpg',
    2021: '/assets/ganesh_watermark.jpg',
    2020: '/assets/images/ganesha_colored_watermark.png',
    2019: '/assets/images/grand_ganesha_logo_opt.png',
  };
  return fallbacks[year] || '/assets/images/ganapati.jpg';
};

export const GalleryPage: React.FC = () => {
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlYear = searchParams.get('year');
  const initialYear = urlYear ? (urlYear === 'all' ? 'all' : parseInt(urlYear, 10)) : 'all';

  const [cloudItems, setCloudItems] = useState<GalleryItem[]>([]);
  const [historyItems, setHistoryItems] = useState<HistoryMilestoneDoc[]>([]);
  const [allHistoryDocs, setAllHistoryDocs] = useState<HistoryMilestoneDoc[]>([]);
  const [sevaItems, setSevaItems] = useState<AchievementDoc[]>([]);
  const [eventItems, setEventItems] = useState<CommunityEventDoc[]>([]);
  const [viewMode, setViewMode] = useState<'albums' | 'photos'>('albums');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>(
    !isNaN(initialYear as number) ? initialYear : 'all'
  );
  const [selectedCategory, setSelectedCategory] = useState<GalleryCategory>('all');
  const [activeLightboxItem, setActiveLightboxItem] = useState<GalleryItem | null>(null);

  // Sync with URL query parameter changes
  useEffect(() => {
    const yr = searchParams.get('year');
    if (yr) {
      if (yr === 'all') {
        setSelectedYear('all');
      } else {
        const parsed = parseInt(yr, 10);
        if (!isNaN(parsed)) {
          setSelectedYear(parsed);
        }
      }
    }
    const cat = searchParams.get('category') as GalleryCategory;
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  const handleSelectYear = (year: number | 'all') => {
    setSelectedYear(year);
    const newParams = new URLSearchParams(searchParams);
    if (year === 'all') {
      newParams.delete('year');
    } else {
      newParams.set('year', String(year));
    }
    setSearchParams(newParams, { replace: true });
  };

  const handleSelectCategory = (category: GalleryCategory) => {
    setSelectedCategory(category);
    const newParams = new URLSearchParams(searchParams);
    if (category === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', category);
    }
    setSearchParams(newParams, { replace: true });
  };

  // Subscribe to real-time Admin Media, History Milestones, Seva, and Community Events across all years
  useEffect(() => {
    const unsubMedia = subscribeToPublicMedia(undefined, (items) => {
      if (items && items.length > 0) {
        const galleryMedia = items.filter(
          (i) =>
            i.placement === 'gallery' ||
            !i.placement ||
            (Array.isArray(i.placements) && i.placements.includes('gallery'))
        );
        const mapped: GalleryItem[] = galleryMedia.map((i) => ({
          id: i.id,
          year: i.year || 2026,
          category: (i.category as GalleryItem['category']) || 'darshan',
          titleEn: i.titleEn || 'CYM Festival Darshan',
          titleKn: i.titleKn || 'ಚಾಣಕ್ಯ ಯುವಕ ಮಂಡಳ ದರ್ಶನ',
          imageUrl: i.mediaUrl,
          mediaType:
            i.mediaType === 'video' ||
            /\.(mp4|webm|mov|ogg|m4v)($|\?)/i.test(i.mediaUrl) ||
            Boolean(i.mediaUrl && i.mediaUrl.includes('/video/upload/'))
              ? 'video'
              : 'image',
          descriptionEn: i.descriptionEn || `Archival photograph for ${i.titleEn}.`,
          descriptionKn: i.descriptionKn || `${i.titleKn} ಐತಿಹಾಸಿಕ ಛಾಯಾಚಿತ್ರ.`,
        }));
        setCloudItems(mapped);
      } else {
        setCloudItems([]);
      }
    });

    const unsubHistory = subscribeToHistory((items) => {
      setAllHistoryDocs(items || []);
      const galleryHistory = (items || []).filter(
        (h) =>
          h.isActive !== false &&
          Boolean(h.coverImage) &&
          (h.showInGallery === true || h.showInGallery === undefined)
      );
      setHistoryItems(galleryHistory);
    });

    const unsubAchievements = subscribeToAchievements((items) => {
      const gallerySeva = items.filter(
        (a) =>
          a.isActive !== false &&
          (a.showInGallery === true || a.showInGallery === undefined) &&
          Boolean(a.mediaUrl || a.imageUrl || (a.galleryMedia && a.galleryMedia.length > 0))
      );
      setSevaItems(gallerySeva);
    });

    const unsubEvents = subscribeToEvents((items) => {
      const galleryEvents = items.filter(
        (e) =>
          e.isActive !== false &&
          (e.showInGallery === true || e.showInGallery === undefined) &&
          Boolean(e.mediaUrl || (e.galleryMedia && e.galleryMedia.length > 0))
      );
      setEventItems(galleryEvents);
    });

    return () => {
      unsubMedia();
      unsubHistory();
      unsubAchievements();
      unsubEvents();
    };
  }, []);

  // Merge all sources connected through the years
  const allGalleryItems = useMemo(() => {
    const items: GalleryItem[] = [...cloudItems];

    // Add History milestones
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
        descriptionEn: h.summaryEn || (h.pandalThemeEn ? `Theme: ${h.pandalThemeEn}` : `${h.year} Archival Photo`),
        descriptionKn: h.summaryKn || (h.pandalThemeKn ? `ಥೀಮ್: ${h.pandalThemeKn}` : `${h.year} ಐತಿಹಾಸಿಕ ಛಾಯಾಚಿತ್ರ`),
      });
    });

    // Add Seva initiatives
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
          descriptionEn: a.descriptionEn || 'Devotional community seva initiative.',
          descriptionKn: a.descriptionKn || 'ದಿವ್ಯ ಸಮುದಾಯ ಸೇವಾ ಕೈಂಕರ್ಯ.',
        });
      });
    });

    // Add Community Events
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
          titleEn: ev.titleEn || 'CYM Community Initiative',
          titleKn: ev.titleKn || 'ಚಾಣಕ್ಯ ಯುವಕ ಮಂಡಳ ಸಾಮಾಜಿಕ ಕಾರ್ಯಕ್ರಮ',
          imageUrl: m.url,
          mediaType: isVideo ? 'video' : 'image',
          eventDate: ev.eventDate,
          highlightsEn: ev.highlightsEn,
          highlightsKn: ev.highlightsKn,
          descriptionEn: ev.descriptionEn || `${ev.year || 2026} • Community Initiative`,
          descriptionKn: ev.descriptionKn || `${ev.year || 2026} • ಸಾಮಾಜಿಕ ಸೇವಾ ಕಾರ್ಯಕ್ರಮ`,
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

    unique.sort((a, b) => b.year - a.year);
    return unique;
  }, [cloudItems, historyItems, sevaItems, eventItems]);

  // Compute available festival years: Established years (2019 to 2026),
  // PLUS dynamically added future years (> 2026) ONLY IF they exist in database
  const availableYears = useMemo(() => {
    const baseYears = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019];
    const mediaYears = allGalleryItems.map((item) => item.year).filter((y): y is number => Boolean(y));
    const historyYears = allHistoryDocs.map((h) => h.year).filter((y): y is number => Boolean(y));
    const allExistingYears = new Set([...mediaYears, ...historyYears]);

    // Only include future years (> 2026) if actually added by admin
    const dynamicFutureYears = Array.from(allExistingYears).filter((yr) => yr > 2026);

    return Array.from(new Set([...dynamicFutureYears, ...baseYears])).sort((a, b) => b - a);
  }, [allGalleryItems, allHistoryDocs]);

  // Filter items by Year and Category
  const filteredItems = useMemo(() => {
    return allGalleryItems.filter((item) => {
      const matchYear = selectedYear === 'all' || item.year === selectedYear;
      const matchCategory =
        selectedCategory === 'all' ||
        item.category === selectedCategory ||
        (selectedCategory === 'visarjan' && (item.category as string) === 'miravanige');
      return matchYear && matchCategory;
    });
  }, [allGalleryItems, selectedYear, selectedCategory]);

  // Active Year History Document (if selected)
  const activeYearHistory = useMemo(() => {
    if (selectedYear === 'all') return null;
    return allHistoryDocs.find((h) => h.year === selectedYear) || null;
  }, [allHistoryDocs, selectedYear]);

  // Determine whether to display the Year Album Tiles view
  const isAlbumHomeView = selectedYear === 'all' && selectedCategory === 'all' && viewMode === 'albums';

  return (
    <div className="relative pt-4 sm:pt-6 pb-12 sm:pb-16 bg-[#F8F7F4] text-stone-900 min-h-screen overflow-hidden selection:bg-amber-400 selection:text-stone-950">
      {/* Background Sacred Geometric Yantras */}
      <div className="absolute -top-32 -right-32 pointer-events-none opacity-20">
        <SacredGeometryOverlay size={600} opacity={0.1} />
      </div>
      <div className="absolute top-1/2 -left-48 pointer-events-none opacity-15">
        <SacredGeometryOverlay size={550} opacity={0.08} />
      </div>

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 relative z-10">
        {/* Streamlined Compact Luxury Header */}
        <div className="text-center max-w-2xl mx-auto mb-4 sm:mb-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 font-mono text-[11px] font-bold uppercase tracking-wider mb-2 sm:mb-2.5 shadow-xs">
            <Camera className="w-3.5 h-3.5 text-amber-600" />
            <span>{language === 'kn' ? 'ವರ್ಷವಾರು ದರ್ಶನ ಗ್ಯಾಲರಿ' : 'TIMELINE DARSHAN GALLERY'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse ml-0.5" />
          </div>

          <h1
            className={`text-2xl sm:text-3xl md:text-4xl font-black text-stone-900 tracking-tight leading-tight ${
              language === 'kn' ? 'font-kannada' : 'font-sans'
            }`}
          >
            {language === 'kn' ? (
              <span>
                ದಿವ್ಯ ದರ್ಶನ <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-700">ಸಂಗ್ರಹ</span>
              </span>
            ) : (
              <span>
                DIVYA DARSHAN <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-700">GALLERY</span>
              </span>
            )}
          </h1>

          <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm text-stone-500 font-sans max-w-lg mx-auto">
            {language === 'kn'
              ? 'ಕಡಲಗಿ ಖೂಟ, ಯಮಕನಮರಡಿ • ಪವಿತ್ರ ಗಣೇಶೋತ್ಸವದ ಐತಿಹಾಸಿಕ ಛಾಯಾಚಿತ್ರಗಳು ಹಾಗೂ ವಿಡಿಯೋಗಳು'
              : 'Kadalagi Khoot, Yamakanmardi • Archival photography & festival darshan across the years'}
          </p>

          {/* YouTube Video Link Pill */}
          <div className="mt-2.5 flex items-center justify-center">
            <a
              href={siteConfig.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-600 hover:bg-red-700 text-white text-[11px] sm:text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <Youtube className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>{language === 'kn' ? 'ಯೂಟ್ಯೂಬ್ ವಿಡಿಯೋಗಳು' : 'Watch on YouTube'}</span>
              <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white/80" />
            </a>
          </div>
        </div>

        {/* Compact Dropdown Filter Bar with View Mode Toggle */}
        <div className="mb-6 sm:mb-8">
          <GalleryFilter
            selectedYear={selectedYear}
            onSelectYear={handleSelectYear}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            availableYears={availableYears}
            totalCount={filteredItems.length}
            viewMode={viewMode}
            onToggleViewMode={setViewMode}
          />
        </div>

        {/* ================= VIEW 1: YEAR ALBUM TILES (HOME VIEW) ================= */}
        {isAlbumHomeView ? (
          <div>
            {/* Year Albums Section Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-400/40 flex items-center justify-center text-amber-700 shrink-0">
                  <Folder className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-xl font-black text-stone-900 tracking-tight flex items-center space-x-2">
                    <span>{language === 'kn' ? 'ವರ್ಷವಾರು ಮಹೋತ್ಸವ ಆಲ್ಬಮ್‌ಗಳು' : 'Festival Year Albums'}</span>
                    <span className="text-[10px] sm:text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                      2019 – {availableYears[0] || 2026}
                    </span>
                  </h2>
                  <p className="text-[11px] sm:text-xs text-stone-500">
                    {language === 'kn'
                      ? 'ಯಾವುದೇ ವರ್ಷದ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ ಆಗಮನ, ದರ್ಶನ, ಸವಾಲ್, ಮಂಟಪ ಮತ್ತು ವಿಸರ್ಜನಾ ಫೋಲ್ಡರ್‌ಗಳನ್ನು ವೀಕ್ಷಿಸಿ'
                      : 'Click any festival year to explore its Aagamana, Darshan, Saval, Aarti and Visarjan photo albums'}
                  </p>
                </div>
              </div>
            </div>

            {/* Year Tiles Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 mb-10">
              {availableYears.map((yr) => {
                const coverImg = getYearCoverImage(yr, allHistoryDocs, allGalleryItems);
                const yearHist = allHistoryDocs.find((h) => h.year === yr);
                const countForYr = allGalleryItems.filter((i) => i.year === yr).length;
                const editionLabel = getYearEdition(yr, language);
                const themeTitle = language === 'kn'
                  ? (yearHist?.pandalThemeKn || yearHist?.titleKn)
                  : (yearHist?.pandalThemeEn || yearHist?.titleEn);

                return (
                  <div
                    key={yr}
                    onClick={() => {
                      handleSelectYear(yr);
                      handleSelectCategory('all');
                    }}
                    className="group relative cursor-pointer rounded-2xl sm:rounded-3xl overflow-hidden bg-stone-900 border border-stone-200/60 shadow-md hover:shadow-2xl hover:border-amber-400 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-end aspect-[4/5] sm:aspect-[3/4]"
                  >
                    {/* Year Front Cover Photo from History Section */}
                    <img
                      src={coverImg}
                      alt={`${yr} Mahotsav`}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/assets/images/ganapati.jpg';
                      }}
                    />

                    {/* Dark Cinematic Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10 group-hover:via-black/30 transition-all duration-300" />
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl sm:rounded-3xl group-hover:ring-amber-400/50 transition-colors" />

                    {/* Top Floating Badges */}
                    <div className="absolute top-2.5 sm:top-3.5 inset-x-2.5 sm:inset-x-3.5 flex items-center justify-between z-10">
                      <div className="inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-stone-900/85 backdrop-blur-md border border-amber-400/40 text-amber-300 shadow-md">
                        <span className="font-mono font-black text-sm sm:text-base tracking-tight">{yr}</span>
                        {yr === 2026 && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full font-black bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 uppercase">
                            {language === 'kn' ? 'ಹೊಸದು' : 'LATEST'}
                          </span>
                        )}
                      </div>

                      <div className="inline-flex items-center space-x-1 px-2 py-0.8 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-white/90 text-[10px] sm:text-xs font-mono font-semibold">
                        <Camera className="w-3 h-3 text-amber-400" />
                        <span>{countForYr}</span>
                      </div>
                    </div>

                    {/* Bottom Content Info */}
                    <div className="relative z-10 p-3 sm:p-4 text-white">
                      <div className="text-[10px] sm:text-xs font-mono font-bold text-amber-300 tracking-wider uppercase mb-0.5 sm:mb-1">
                        {editionLabel}
                      </div>
                      <h3 className="text-xs sm:text-base font-black leading-snug text-white line-clamp-1 group-hover:text-amber-200 transition-colors">
                        {themeTitle || (language === 'kn' ? `${yr} ಶ್ರೀ ಗಣೇಶ ಮಹೋತ್ಸವ` : `${yr} Royal Mahotsav`)}
                      </h3>

                      {/* Quick category badges on larger screens */}
                      <div className="mt-2 hidden sm:flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/15 backdrop-blur-xs text-white/90">🚩 ಆಗಮನ</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/15 backdrop-blur-xs text-white/90">🪔 ದರ್ಶನ</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/15 backdrop-blur-xs text-white/90">👑 ಸವಾಲ್</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/15 backdrop-blur-xs text-white/90">🥁 ವಿಸರ್ಜನೆ</span>
                      </div>

                      {/* Explore Action Cue */}
                      <div className="mt-2 sm:mt-2.5 pt-1.5 sm:pt-2 border-t border-white/15 flex items-center justify-between text-[11px] sm:text-xs font-bold text-amber-300 group-hover:text-amber-200">
                        <span>{language === 'kn' ? 'ಫೋಲ್ಡರ್‌ಗಳನ್ನು ನೋಡಿ' : 'Explore Folders'}</span>
                        <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : selectedYear !== 'all' && viewMode === 'albums' ? (
          /* ================= VIEW 2: YEAR VIEW WITH CATEGORY FOLDERS ================= */
          <div>
            {/* Active Year Navigation Banner */}
            <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 mb-5 shadow-xl border border-amber-500/30 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 relative z-10">
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      handleSelectYear('all');
                      handleSelectCategory('all');
                    }}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-md border border-white/15 transition-all cursor-pointer transform hover:-translate-x-0.5 shrink-0"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
                    <span>{language === 'kn' ? 'ಎಲ್ಲಾ ವರ್ಷಗಳು' : 'All Years'}</span>
                  </button>

                  <div className="truncate">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-lg sm:text-2xl font-black text-amber-400">
                        {selectedYear}
                      </span>
                      <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                        {getYearEdition(selectedYear as number, language)}
                      </span>
                    </div>
                    <div className="text-xs text-stone-300 truncate mt-0.5">
                      {activeYearHistory?.titleKn || activeYearHistory?.titleEn || (
                        language === 'kn'
                          ? `${selectedYear} ಶ್ರೀ ಗಣೇಶ ಮಹೋತ್ಸವದ ವರ್ಗವಾರು ಫೋಲ್ಡರ್‌ಗಳು`
                          : `${selectedYear} Royal Ganesh Mahotsav Category Folders`
                      )}
                      {activeYearHistory?.pandalThemeKn && ` • ${activeYearHistory.pandalThemeKn}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-start sm:self-auto shrink-0">
                  <span className="text-xs font-mono text-stone-300 px-2.5 py-1 rounded-xl bg-white/10 border border-white/10">
                    {allGalleryItems.filter((i) => i.year === selectedYear).length} {language === 'kn' ? 'ಮೀಡಿಯಾ' : 'Media'}
                  </span>
                </div>
              </div>
            </div>

            {/* Category Folders Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Folder className="w-4 h-4 text-amber-600" />
                  <span className="text-xs sm:text-sm font-bold text-stone-800">
                    {language === 'kn' ? `${selectedYear}ರ ವರ್ಗವಾರು ಫೋಲ್ಡರ್‌ಗಳು` : `${selectedYear} Category Folders`}
                  </span>
                </div>
                {selectedCategory !== 'all' && (
                  <button
                    type="button"
                    onClick={() => handleSelectCategory('all')}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 underline cursor-pointer"
                  >
                    {language === 'kn' ? 'ಎಲ್ಲಾ ಫೋಲ್ಡರ್‌ಗಳು (Show All)' : 'Show All Folders'}
                  </button>
                )}
              </div>

              {/* Category Folders Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
                {GALLERY_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.key;
                  const countInYear = allGalleryItems.filter((i) => {
                    if (i.year !== selectedYear) return false;
                    if (cat.key === 'all') return true;
                    return i.category === cat.key || (cat.key === 'visarjan' && (i.category as string) === 'miravanige');
                  }).length;

                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => handleSelectCategory(cat.key)}
                      className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative group ${
                        isSelected
                          ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white border-amber-500 shadow-md ring-2 ring-amber-400'
                          : countInYear > 0
                          ? 'bg-white hover:bg-amber-50/50 text-stone-800 border-stone-200 hover:border-amber-300 shadow-xs hover:shadow-sm'
                          : 'bg-stone-50/70 hover:bg-stone-100 text-stone-500 border-stone-200/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg sm:text-xl p-1.5 rounded-xl bg-black/5 group-hover:bg-amber-100/40 transition-colors">
                          {cat.icon}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : countInYear > 0
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-stone-100 text-stone-400'
                          }`}
                        >
                          {countInYear}
                        </span>
                      </div>

                      <div>
                        <div className={`text-xs sm:text-sm font-bold line-clamp-1 ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                          {language === 'kn' ? cat.labelKn : cat.labelEn}
                        </div>
                        <div
                          className={`text-[10px] mt-0.5 line-clamp-1 ${
                            isSelected ? 'text-white/80' : 'text-stone-400'
                          }`}
                        >
                          {language === 'kn' ? (cat.descKn || '') : (cat.descEn || '')}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Folder Media Grid */}
            <div className="mt-4 sm:mt-6">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-200">
                <div className="flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4 text-amber-600" />
                  <span className="text-xs sm:text-sm font-bold text-stone-800">
                    {selectedCategory === 'all'
                      ? (language === 'kn' ? `ಎಲ್ಲಾ ಫೋಟೋಗಳು & ವಿಡಿಯೋಗಳು (${filteredItems.length})` : `All Photos & Videos (${filteredItems.length})`)
                      : (language === 'kn'
                          ? `${GALLERY_CATEGORIES.find((c) => c.key === selectedCategory)?.labelKn} ಫೋಲ್ಡರ್ (${filteredItems.length})`
                          : `${GALLERY_CATEGORIES.find((c) => c.key === selectedCategory)?.labelEn} Folder (${filteredItems.length})`)}
                  </span>
                </div>
              </div>

              {filteredItems.length > 0 ? (
                <GalleryGrid
                  items={filteredItems}
                  onOpenLightbox={(item) => setActiveLightboxItem(item)}
                />
              ) : (
                <div className="text-center py-12 px-4 bg-white rounded-3xl border border-stone-200 shadow-xs max-w-md mx-auto my-6">
                  <Folder className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-stone-800 mb-1">
                    {language === 'kn' ? 'ಈ ಫೋಲ್ಡರ್‌ನಲ್ಲಿ ಇನ್ನೂ ಮೀಡಿಯಾ ಇಲ್ಲ' : 'No Media in this Folder Yet'}
                  </h3>
                  <p className="text-xs text-stone-500 mb-4">
                    {language === 'kn'
                      ? 'ಈ ವರ್ಗಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ಛಾಯಾಚಿತ್ರಗಳನ್ನು ಶೀಘ್ರದಲ್ಲೇ ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾಗುತ್ತದೆ.'
                      : 'Photographs and videos for this category folder will be added soon.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleSelectCategory('all')}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    {language === 'kn' ? 'ಎಲ್ಲಾ ಮೀಡಿಯಾ ವೀಕ್ಷಿಸಿ' : 'View All Media for this Year'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ================= VIEW 3: DIRECT PHOTOS VIEW ================= */
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Camera className="w-4 h-4 text-amber-600" />
                <span className="text-xs sm:text-sm font-bold text-stone-800">
                  {selectedYear !== 'all' ? `${selectedYear} ` : ''}
                  {selectedCategory !== 'all'
                    ? `${GALLERY_CATEGORIES.find((c) => c.key === selectedCategory)?.labelKn || selectedCategory} `
                    : ''}
                  {language === 'kn' ? 'ಛಾಯಾಚಿತ್ರಗಳು & ವಿಡಿಯೋಗಳು' : 'Photographs & Videos'} ({filteredItems.length})
                </span>
              </div>
            </div>

            <GalleryGrid
              items={filteredItems}
              onOpenLightbox={(item) => setActiveLightboxItem(item)}
            />
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {activeLightboxItem && (
        <LightboxModal
          item={activeLightboxItem}
          items={filteredItems}
          onClose={() => setActiveLightboxItem(null)}
          onNavigate={(nextItem) => setActiveLightboxItem(nextItem)}
        />
      )}
    </div>
  );
};
