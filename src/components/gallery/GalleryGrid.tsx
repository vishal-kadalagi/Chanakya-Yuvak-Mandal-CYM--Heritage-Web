import React from 'react';
import { Calendar, Maximize2, Camera, Play, Youtube } from 'lucide-react';
import { GalleryItem } from '../../data/gallery';
import { useLanguage } from '../../i18n/LanguageContext';
import { getHdMediaUrl, getReelMediaUrl, getVideoPosterUrl } from '../../utils/mediaUtils';
import { extractYoutubeVideoId, getYoutubeThumbnailUrl } from '../../utils/youtubeUtils';

interface GalleryGridProps {
  items: GalleryItem[];
  onOpenLightbox: (item: GalleryItem) => void;
}

// Authentic visual fallback based on category / year to ensure every card displays vibrant photography
const getFallbackImage = (item: GalleryItem): string => {
  if (item.imageUrl) return getHdMediaUrl(item.imageUrl, 'image');
  if (item.category === 'darshan') return '/assets/images/ganapati.jpg';
  if (item.category === 'aagamana') return '/assets/images/hero_group_darshan.jpg';
  if (item.category === 'saval') return '/assets/images/hero_committee_group.jpg';
  if (item.category === 'aarti') return '/assets/images/ganapati.jpg';
  if (item.category === 'visarjan' || (item.category as string) === 'miravanige') return '/assets/images/hero_group_darshan.jpg';
  if (item.category === 'pandal') return '/assets/ganesh_watermark.jpg';
  if (item.category === 'seva') return '/assets/images/hero_committee_group.jpg';
  if (item.category === 'cultural') return '/assets/images/hero_committee_clean.jpg';
  return '/assets/images/grand_ganesha_logo_opt.png';
};

// Premium Exhibition Photography Card (Clean, Deducted Content, Pure Visual Focus)
const GalleryCard: React.FC<{
  item: GalleryItem;
  categoryLabel: string;
  language: string;
  onOpen: () => void;
}> = ({ item, categoryLabel, language, onOpen }) => {
  const ytId = extractYoutubeVideoId(item.imageUrl);
  const displayImage = ytId ? getYoutubeThumbnailUrl(ytId) : getFallbackImage(item);

  return (
    <div
      onClick={onOpen}
      className="group relative cursor-pointer select-none rounded-2xl sm:rounded-3xl overflow-hidden border border-stone-200/90 hover:border-amber-400 bg-stone-950 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Top Gold Hairline Glint */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300 z-20 opacity-80 group-hover:opacity-100 transition-opacity" />

      {/* Media Image or Video Frame */}
      <div className="relative h-60 sm:h-64 lg:h-72 w-full overflow-hidden bg-stone-950">
        {ytId ? (
          <div className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center">
            <img
              src={getYoutubeThumbnailUrl(ytId)}
              alt={language === 'kn' ? item.titleKn : item.titleEn}
              className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
              loading="lazy"
            />
            {/* Play Button Overlay */}
            <div className="absolute inset-0 bg-black/25 flex items-center justify-center group-hover:bg-black/10 transition-colors">
              <div className="w-11 h-11 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 fill-white translate-x-0.5" />
              </div>
            </div>
            {/* YouTube Badge Stamp */}
            <div className="absolute bottom-12 right-3 z-10 flex items-center space-x-1 px-2 py-0.5 rounded bg-black/85 border border-red-500/50 text-[9px] font-mono font-bold text-red-400 backdrop-blur-md">
              <Youtube className="w-3 h-3 text-red-500" />
              <span>YOUTUBE</span>
            </div>
          </div>
        ) : item.mediaType === 'video' || /\.(mp4|webm|mov|ogg|m4v)($|\?)/i.test(item.imageUrl) || (item.imageUrl && item.imageUrl.includes('/video/upload/')) ? (
          <div className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center">
            <video
              src={getReelMediaUrl(item.imageUrl, 'video')}
              poster={getVideoPosterUrl(item.imageUrl)}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
            />
            {/* Video Stamp */}
            <div className="absolute bottom-12 right-3 z-10 flex items-center space-x-1 px-2 py-0.5 rounded bg-black/85 border border-red-500/50 text-[9px] font-mono font-bold text-red-400 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span>VID</span>
            </div>
          </div>
        ) : (
          <img
            src={displayImage}
            alt={language === 'kn' ? item.titleKn : item.titleEn}
            className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/images/grand_ganesha_logo_opt.png';
            }}
          />
        )}

        {/* Cinematic Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/35 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-neutral-950/80 backdrop-blur-md text-amber-300 font-mono text-[10px] font-bold uppercase border border-amber-400/30 shadow-xs">
            <Calendar className="w-3 h-3 text-amber-400" />
            <span>{item.year}</span>
          </span>

          <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-stone-900 font-sans text-[10px] font-bold uppercase tracking-wider border border-white/40 shadow-xs">
            {categoryLabel}
          </span>
        </div>

        {/* Center Hover Action */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
          <span className="px-3.5 py-1.5 rounded-full bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
            <Maximize2 className="w-3.5 h-3.5" />
            <span>{language === 'kn' ? 'ವೀಕ್ಷಿಸಿ' : 'View Full Photo'}</span>
          </span>
        </div>

        {/* Bottom Title Bar (Content Deducted to Clean Single-Line Title) */}
        <div className="absolute bottom-0 inset-x-0 p-3.5 sm:p-4 z-10 bg-gradient-to-t from-black/95 via-black/60 to-transparent">
          <div className="flex items-center justify-between gap-2">
            <h3
              className={`text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors leading-snug line-clamp-1 drop-shadow-sm ${
                language === 'kn' ? 'font-kannada' : 'font-sans'
              }`}
            >
              {language === 'kn' ? item.titleKn : item.titleEn}
            </h3>

            <span className="text-[10px] font-mono text-amber-300/80 uppercase font-bold shrink-0 hidden sm:inline">
              HD
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const GalleryGrid: React.FC<GalleryGridProps> = ({ items, onOpenLightbox }) => {
  const { language } = useLanguage();

  if (items.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-white rounded-3xl border border-amber-200/90 max-w-lg mx-auto mt-6 shadow-[0_4px_25px_rgba(0,0,0,0.04)] relative overflow-hidden">
        {/* Top Gold Hairline */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300" />

        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-400/40 flex items-center justify-center text-amber-700 mx-auto mb-4 shadow-2xs">
          <Camera className="w-8 h-8 text-amber-600 animate-pulse" />
        </div>

        <h3 className="text-lg font-bold text-neutral-900 mb-1 font-kannada">
          {language === 'kn' ? 'ಗ್ಯಾಲರಿ ಛಾಯಾಚಿತ್ರಗಳು ಸದ್ಯದಲ್ಲೇ ಲಭ್ಯ' : 'Gallery Archives Coming Soon'}
        </h3>

        <p className="text-xs sm:text-sm text-neutral-500 font-sans leading-relaxed max-w-sm mx-auto">
          {language === 'kn'
            ? 'ಪವಿತ್ರ ಗಣೇಶೋತ್ಸವದ ಅಧಿಕೃತ ಛಾಯಾಚಿತ್ರಗಳು ಮತ್ತು ದಿವ್ಯ ದರ್ಶನದ ಕ್ಷಣಗಳು ಶೀಘ್ರದಲ್ಲೇ ಇಲ್ಲಿ ಲಭ್ಯವಾಗಲಿವೆ.'
            : 'Official high-resolution festival photographs and sacred darshan moments will be available here shortly.'}
        </p>
      </div>
    );
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'darshan':
        return language === 'kn' ? '🪔 ದರ್ಶನ' : '🪔 Darshan';
      case 'aagamana':
        return language === 'kn' ? '🚩 ಗಣಪತಿ ಆಗಮನ' : '🚩 Aagamana';
      case 'saval':
        return language === 'kn' ? '👑 ಪವಿತ್ರ ಸವಾಲ್' : '👑 Saval';
      case 'aarti':
        return language === 'kn' ? '🔥 ಮಂಗಳಾರತಿ' : '🔥 Maha Aarti';
      case 'pandal':
        return language === 'kn' ? '🏛️ ಮಂಟಪ' : '🏛️ Pandal';
      case 'visarjan':
      case 'miravanige':
        return language === 'kn' ? '🥁 ವಿಸರ್ಜನೆ' : '🥁 Visarjan';
      case 'cultural':
        return language === 'kn' ? '🎭 ಸಾಂಸ್ಕೃತಿಕ' : '🎭 Cultural';
      case 'seva':
        return language === 'kn' ? '🙏 ದಾಸೋಹ' : '🙏 Seva';
      default:
        return language === 'kn' ? '✦ ಸಾಮಾನ್ಯ' : '✦ General';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {items.map((item) => (
        <GalleryCard
          key={item.id}
          item={item}
          categoryLabel={getCategoryLabel(item.category)}
          language={language}
          onOpen={() => onOpenLightbox(item)}
        />
      ))}
    </div>
  );
};
