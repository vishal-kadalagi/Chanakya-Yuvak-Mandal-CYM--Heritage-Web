import React, { useState, useEffect } from 'react';
import { Megaphone, X, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { subscribeToSiteSettings, SiteSettings } from '../../services/siteService';

export const AnnouncementBanner: React.FC = () => {
  const { language } = useLanguage();
  const [settings, setSettings] = useState<SiteSettings>({});
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const unsub = subscribeToSiteSettings((s) => {
      setSettings(s);
    });
    return () => unsub();
  }, []);

  if (!settings.announcementActive || dismissed) {
    return null;
  }

  const text = language === 'kn' ? settings.announcementKn : settings.announcementEn;
  if (!text) return null;

  return (
    <div className="relative z-40 bg-gradient-to-r from-amber-600 via-[#E5A812] to-amber-600 text-black px-4 py-2 text-xs font-sans font-bold flex items-center justify-between shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2 text-center flex-1 px-4">
        <Megaphone className="w-4 h-4 shrink-0 text-black animate-bounce" />
        <span className="leading-snug">{text}</span>
        {settings.announcementLink && (
          <a
            href={settings.announcementLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 underline hover:text-black/80 ml-1.5 shrink-0"
          >
            <span>{language === 'kn' ? 'ಹೆಚ್ಚಿನ ವಿವರ' : 'Learn more'}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="p-1 rounded-full hover:bg-black/10 transition-colors shrink-0"
        aria-label="Dismiss banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
