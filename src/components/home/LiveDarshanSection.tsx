import React, { useState, useEffect } from 'react';
import { Youtube, ExternalLink, Share2, Check } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { subscribeToSiteSettings, SiteSettings } from '../../services/siteService';
import { extractYoutubeVideoId, getYoutubeEmbedUrl } from '../../utils/youtubeUtils';

export const LiveDarshanSection: React.FC = () => {
  const { language } = useLanguage();
  const [settings, setSettings] = useState<SiteSettings>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsub = subscribeToSiteSettings((s) => {
      setSettings(s);
    });
    return () => unsub();
  }, []);

  // Check if live stream is actively turned on by admin and has a valid YouTube link
  const videoId = extractYoutubeVideoId(settings.liveStreamYoutubeUrl);
  const isLive = Boolean(settings.liveStreamActive && videoId);

  if (!isLive || !videoId) {
    return null;
  }

  const title =
    (language === 'kn' ? settings.liveStreamTitleKn : settings.liveStreamTitleEn) ||
    (language === 'kn'
      ? 'ಶ್ರೀ ಗಣೇಶ ಮಹೋತ್ಸವ | ಮಹಾಮಂಗಳಾರತಿ ನೇರ ಪ್ರಸಾರ'
      : 'Shri Ganesh Mahotsav | Live Darshan Streaming');

  const subtitle =
    (language === 'kn' ? settings.liveStreamDescriptionKn : settings.liveStreamDescriptionEn) ||
    (language === 'kn'
      ? 'ಕಡಲಗಿ ಖೂಟ, ಯಮಕನಮರಡಿ • ನಿತ್ಯ ದರ್ಶನ ಹಾಗೂ ಮಹಾಮಂಗಳಾರತಿ ನೇರ ವೀಕ್ಷಣೆ'
      : 'Kadalagi Khoot, Yamakanmardi • Daily Darshan & Mahamangalaarti Live Broadcast');

  const liveUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: subtitle,
          url: liveUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(liveUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section
      id="live-darshan-section"
      data-theme="dark"
      className="relative py-10 sm:py-16 bg-[#0A0A0C] text-white overflow-hidden scroll-mt-20 border-b border-amber-500/20"
    >
      {/* Devotional Ambient Lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ================= HEADER STRIP ================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            {/* Live Indicator Pill */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/50 text-red-400 font-mono text-xs font-bold uppercase tracking-wider mb-2.5 shadow-lg shadow-red-900/20">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
              <span>{language === 'kn' ? 'ನೇರ ಪ್ರಸಾರ • ಲೈವ್ ದರ್ಶನ' : 'LIVE BROADCAST • DARSHAN'}</span>
            </div>

            <h2
              className={`text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight ${
                language === 'kn' ? 'font-kannada' : 'font-sans'
              }`}
            >
              {title}
            </h2>

            <p className="mt-1.5 text-xs sm:text-sm text-neutral-400 font-sans max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-500 text-white font-sans text-xs font-bold tracking-wider uppercase transition-all shadow-lg hover:shadow-red-600/30 cursor-pointer"
            >
              <Youtube className="w-4 h-4" />
              <span>{language === 'kn' ? 'ಯೂಟ್ಯೂಬ್‌ನಲ್ಲಿ ವೀಕ್ಷಿಸಿ' : 'Open in YouTube'}</span>
              <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
            </a>

            <button
              onClick={handleShare}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-semibold transition-all cursor-pointer"
              title="Share Live Stream"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? (language === 'kn' ? 'ನಕಲಿಸಲಾಗಿದೆ' : 'Copied!') : (language === 'kn' ? 'ಹಂಚಿಕೊಳ್ಳಿ' : 'Share')}</span>
            </button>
          </div>
        </div>

        {/* ================= CINEMA 16:9 YOUTUBE EMBED PLAYER ================= */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-amber-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.8)] bg-black">
          {/* Top Decorative Border Accent */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 via-amber-400 to-red-600 z-10" />

          {/* 16:9 Aspect Ratio Container */}
          <div className="relative w-full pb-[56.25%] bg-black">
            <iframe
              src={getYoutubeEmbedUrl(videoId, true)}
              title={title}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          {/* Bottom Broadcast Bar */}
          <div className="px-4 py-3 bg-neutral-950/95 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400 flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[11px] text-neutral-300">
                {language === 'kn' ? 'ಅಧಿಕೃತ ನೇರ ಪ್ರಸಾರ ವಾಹಿನಿ' : 'Official CYM Broadcast'}
              </span>
            </div>

            <div className="font-mono text-[11px] text-amber-400/80">
              {language === 'kn' ? '🚩 ಶ್ರೀ ಗಣೇಶ ಮಹೋತ್ಸವ ಯಮಕನಮರಡಿ' : '🚩 Shri Ganesh Mahotsav Yamakanmardi'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
