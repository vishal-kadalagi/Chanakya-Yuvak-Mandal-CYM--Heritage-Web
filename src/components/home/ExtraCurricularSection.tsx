import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Calendar,
  MapPin,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  subscribeToEvents,
  CommunityEventDoc,
  EventCategory,
} from '../../services/eventsService';
import { getHdMediaUrl, getReelMediaUrl, getVideoPosterUrl } from '../../utils/mediaUtils';

export const ExtraCurricularSection: React.FC = () => {
  const { language } = useLanguage();
  const [events, setEvents] = useState<CommunityEventDoc[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToEvents((items) => {
      setEvents(items.filter((e) => e.isActive !== false));
    });
    return () => unsubscribe();
  }, []);

  if (events.length === 0) return null;

  const previewEvents = events.slice(0, 3);

  const getCategoryBadge = (cat: EventCategory) => {
    switch (cat) {
      case 'sports':
        return {
          labelKn: 'ಕ್ರೀಡಾ ಕೂಟ',
          labelEn: 'Sports',
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
          labelEn: 'Education',
          bg: 'bg-blue-500/15 text-blue-800 border-blue-400/40',
        };
      case 'cultural':
        return {
          labelKn: 'ಸಾಂಸ್ಕೃತಿಕ ಉತ್ಸವ',
          labelEn: 'Cultural',
          bg: 'bg-purple-500/15 text-purple-800 border-purple-400/40',
        };
      default:
        return {
          labelKn: 'ಸಮಾಜ ಸೇವೆ',
          labelEn: 'Community Seva',
          bg: 'bg-amber-500/15 text-amber-900 border-amber-400/40',
        };
    }
  };

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-white via-[#FCFBF8] to-white relative overflow-hidden">
      {/* Ambient Radial Highlights */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-[11px] font-mono font-bold uppercase tracking-wider text-amber-950 mb-3 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{language === 'kn' ? 'ಯುವ ಸಮಾಜ ಸೇವೆ • EXTRA ACTIVITIES' : 'YOUTH SEVA • EXTRA-CURRICULAR'}</span>
            </div>

            <h2
              className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-950 tracking-tight leading-tight ${
                language === 'kn' ? 'font-kannada' : 'font-sans'
              }`}
            >
              {language === 'kn' ? (
                <span>
                  ಗ್ರಾಮದ ಯುವ ಚಟುವಟಿಕೆಗಳು & <span className="text-[#D48B00]">ವಿಶೇಷ ಕಾರ್ಯಕ್ರಮಗಳು</span>
                </span>
              ) : (
                <span>
                  YOUTH INITIATIVES & <span className="text-[#D48B00]">COMMUNITY EVENTS</span>
                </span>
              )}
            </h2>

            <p className="mt-2 text-xs sm:text-sm text-neutral-600 font-sans leading-relaxed">
              {language === 'kn'
                ? 'ಗಣೇಶೋತ್ಸವದೊಂದಿಗೆ ಗ್ರಾಮದಲ್ಲಿ ಕ್ರೀಡೆ, ಆರೋಗ್ಯ ಶಿಬಿರ, ಶೈಕ್ಷಣಿಕ ಕಿಟ್ ವಿತರಣೆ ಮತ್ತು ಸಾಮಾಜಿಕ ಕಲ್ಯಾಣ ಕೈಂಕರ್ಯಗಳನ್ನು ಯುವಕರು ನಿರಂತರವಾಗಿ ನಡೆಸುತ್ತಿದ್ದಾರೆ.'
                : 'Beyond the annual festival, CYM volunteers actively organize sports tournaments, voluntary blood camps, student aids, and village welfare activities.'}
            </p>
          </div>

          <Link
            to="/events"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm tracking-wide transition-all shadow-sm hover:shadow self-start md:self-auto shrink-0 group"
          >
            <span>{language === 'kn' ? 'ಎಲ್ಲಾ ಕಾರ್ಯಕ್ರಮಗಳು ವೀಕ್ಷಿಸಿ' : 'View All Activities'}</span>
            <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 3 Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {previewEvents.map((evt) => {
            const badge = getCategoryBadge(evt.category);
            const isVideo =
              evt.mediaType === 'video' ||
              (evt.mediaUrl &&
                (evt.mediaUrl.match(/\.(mp4|webm|mov)$/i) || evt.mediaUrl.includes('/video/upload/')));

            return (
              <div
                key={evt.id}
                className="group relative bg-white rounded-3xl border border-amber-200/90 shadow-xs hover:shadow-xl hover:border-amber-400 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Media Preview */}
                {evt.mediaUrl ? (
                  <div className="relative aspect-video w-full overflow-hidden bg-black">
                    {isVideo ? (
                      <div className="relative w-full h-full bg-black flex items-center justify-center">
                        <video
                          src={getReelMediaUrl(evt.mediaUrl, 'video')}
                          poster={getVideoPosterUrl(evt.mediaUrl)}
                          autoPlay
                          loop
                          muted
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute bottom-2.5 right-2.5 z-10 flex items-center space-x-1 px-2 py-0.5 rounded bg-black/85 border border-red-500/50 text-[9px] font-mono font-bold text-red-400 backdrop-blur-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          <span>VIDEO</span>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={getHdMediaUrl(evt.mediaUrl, 'image')}
                        alt={evt.titleEn}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md shadow-sm ${badge.bg}`}>
                        {language === 'kn' ? badge.labelKn : badge.labelEn}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 pb-0">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                      {language === 'kn' ? badge.labelKn : badge.labelEn}
                    </span>
                  </div>
                )}

                {/* Content */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-[11px] font-mono text-neutral-500">
                      <Calendar className="w-3 h-3 text-amber-600" />
                      <span>{evt.eventDate}</span>
                    </div>

                    <h3
                      className={`text-base sm:text-lg font-black text-neutral-950 group-hover:text-amber-800 transition-colors leading-snug line-clamp-2 ${
                        language === 'kn' ? 'font-kannada' : 'font-sans'
                      }`}
                    >
                      {language === 'kn' ? evt.titleKn : evt.titleEn}
                    </h3>

                    <p className="text-xs text-neutral-600 leading-relaxed font-sans line-clamp-3">
                      {language === 'kn' ? evt.descriptionKn : evt.descriptionEn}
                    </p>
                  </div>

                  {evt.locationKn && (
                    <div className="pt-2 border-t border-amber-100 flex items-center space-x-1 text-[11px] text-neutral-500">
                      <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                      <span className="truncate">{language === 'kn' ? evt.locationKn : evt.locationEn}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
