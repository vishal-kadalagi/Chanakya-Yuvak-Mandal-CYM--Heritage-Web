import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Globe, ChevronRight, Youtube, Instagram, Mail } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { siteConfig } from '../../data/site';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: { to: string; label: string }[];
  isActive: (path: string) => boolean;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  navLinks,
  isActive,
}) => {
  const { language, toggleLanguage } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
      {/* iOS Translucent Dim Backdrop */}
      <div
        className="fixed inset-0 bg-black/35 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* iOS Semi-Transparent Glass Door Drawer Panel */}
      <div
        className="relative w-full max-w-xs h-[100dvh] bg-[#0a0a0a]/60 backdrop-blur-2xl backdrop-saturate-190 border-l border-white/25 flex flex-col justify-between overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.7),inset_1px_0_0_rgba(255,255,255,0.3)] z-10"
        style={{
          WebkitBackdropFilter: 'blur(25px) saturate(190%)',
        }}
      >
        <div>
          {/* Frosted Glass Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/15 bg-white/[0.04]">
            <Link
              to="/"
              onClick={() => {
                onClose();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center space-x-2.5 focus:outline-none"
            >
              <img
                src="/assets/logo_tight.png"
                alt="CYM Logo"
                className="h-10 w-auto object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/assets/logo_transparent.png';
                }}
              />
              <div>
                <p className={`text-white font-bold leading-tight ${
                  language === 'kn' ? 'font-kannada text-sm' : 'font-sans font-extrabold text-xs uppercase tracking-wide'
                }`}>
                  {language === 'kn' ? siteConfig.nameKn : siteConfig.nameEn}
                </p>
                <p className="text-[10px] text-[#E5A812] font-sans font-semibold mt-0.5 drop-shadow-xs">
                  {language === 'kn' ? 'ಕಡಲಗಿ ಖೂಟ • ಯಮಕನಮರಡಿ' : 'Kadalagi Khoot • Yamakanmardi'}
                </p>
              </div>
            </Link>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white border border-white/25 transition-all cursor-pointer shadow-sm backdrop-blur-md"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* iOS Language Glass Switcher Capsule */}
          <div className="p-3 border-b border-white/15">
            <button
              onClick={toggleLanguage}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-full bg-white/10 hover:bg-white/15 active:bg-white/25 text-xs font-sans font-bold uppercase tracking-wider text-white border border-white/25 transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-md"
            >
              <Globe className="w-3.5 h-3.5 text-[#E5A812]" />
              <span>{language === 'kn' ? 'Switch to English' : 'ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಿ'}</span>
            </button>
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-1.5" aria-label="Mobile Navigation">
            {navLinks.map((link) => {
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => {
                    onClose();
                    if (link.to === '/') {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className={`flex items-center justify-between px-4 py-2.5 sm:py-3 rounded-2xl transition-all duration-200 ${
                    language === 'kn' ? 'font-kannada font-bold text-sm tracking-normal' : 'font-sans font-bold text-xs uppercase tracking-wider'
                  } ${
                    active
                      ? 'bg-[#E5A812] text-black shadow-[0_0_20px_rgba(229,168,18,0.55)] border border-[#E5A812] font-black'
                      : 'text-white/90 hover:text-white hover:bg-white/15 active:bg-white/20 border border-white/[0.08] hover:border-white/20 backdrop-blur-sm'
                  }`}
                >
                  <span>{link.label}</span>
                  <ChevronRight className={`w-3.5 h-3.5 ${active ? 'text-black' : 'text-white/50'}`} />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer in Drawer with Direct Social Links */}
        <div className="p-4 border-t border-white/15 bg-black/25 backdrop-blur-md text-center">
          <div className="flex items-center justify-center space-x-2.5 mb-3">
            <a
              href={siteConfig.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#FF0000]/15 hover:bg-[#FF0000]/25 text-[#FF6B6B] hover:text-white border border-[#FF0000]/30 transition-all text-[11px] font-sans font-bold"
            >
              <Youtube className="w-3.5 h-3.5 text-[#FF0000]" />
              <span>YouTube</span>
            </a>
            <a
              href={siteConfig.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#E1306C]/15 hover:bg-[#E1306C]/25 text-[#FF75A0] hover:text-white border border-[#E1306C]/30 transition-all text-[11px] font-sans font-bold"
            >
              <Instagram className="w-3.5 h-3.5 text-[#E1306C]" />
              <span>Instagram</span>
            </a>
          </div>

          <div className="pt-1">
            <a
              href={`mailto:${siteConfig.email}`}
              className="inline-flex items-center space-x-1.5 text-[11px] font-sans text-neutral-200 hover:text-white transition-colors break-all"
            >
              <Mail className="w-3 h-3 text-[#E5A812] shrink-0" />
              <span>{siteConfig.email}</span>
            </a>
          </div>
          <p className="text-[10px] text-neutral-400 font-sans mt-0.5">
            Kadalagi Khoot, Yamakanmardi
          </p>
        </div>
      </div>
    </div>
  );
};
