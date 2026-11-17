import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Globe } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { MobileDrawer } from './MobileDrawer';
import { subscribeToSiteSettings } from '../../services/siteService';
import { extractYoutubeVideoId } from '../../utils/youtubeUtils';

export const Navbar: React.FC = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navLinks = [
    { to: '/', label: t.nav.home },
    { to: '/gallery', label: t.nav.gallery },
    { to: '/about', label: t.nav.about },
    { to: '/history', label: t.nav.history },
    { to: '/committee', label: t.nav.committee },
    { to: '/achievements', label: t.nav.achievements },
    { to: '/events', label: t.nav.events },
    { to: '/contact', label: t.nav.contact },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navigate = useNavigate();
  const [tapCount, setTapCount] = useState(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isLiveStreamActive, setIsLiveStreamActive] = useState(false);

  useEffect(() => {
    const unsub = subscribeToSiteSettings((s) => {
      const vid = extractYoutubeVideoId(s.liveStreamYoutubeUrl);
      setIsLiveStreamActive(Boolean(s.liveStreamActive && vid));
    });
    return () => unsub();
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Secret Admin Portal Trigger: Tapping 5 times on CYM opens the admin portal
  const handleBrandClick = (e: React.MouseEvent) => {
    const nextTap = tapCount + 1;
    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);

    if (nextTap >= 5) {
      e.preventDefault();
      setTapCount(0);
      navigate('/admin');
    } else {
      setTapCount(nextTap);
      handleScrollToTop();
      tapTimeoutRef.current = setTimeout(() => {
        setTapCount(0);
      }, 2500); // 2.5 second window to complete 5 taps
    }
  };

  return (
    <>
      {/* ================= FLOATING APPLE iOS SEMI-TRANSPARENT GLASS NAVBAR ================= */}
      <header className="fixed top-3 sm:top-4 inset-x-3 sm:inset-x-6 lg:inset-x-8 max-w-7xl mx-auto z-50 transition-all duration-300">
        <div
          className="rounded-full bg-[#0a0a0a]/50 backdrop-blur-2xl backdrop-saturate-190 border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.3)] px-4 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between flex-nowrap gap-2 sm:gap-4"
          style={{
            WebkitBackdropFilter: 'blur(28px) saturate(190%) contrast(105%)',
            backdropFilter: 'blur(28px) saturate(190%) contrast(105%)',
          }}
        >
          {/* Left: Brand Identity (Big Crisp Logo + Premium Balanced Wordmark) */}
          <Link
            to="/"
            onClick={handleBrandClick}
            className="flex items-center gap-2 sm:gap-2.5 group focus:outline-none shrink-0 cursor-pointer"
            aria-label="CYM Homepage"
          >
            {/* Big & Crystal Clear Mandal Emblem (Tightly cropped, zero wasted space) */}
            <img
              src="/assets/logo_tight.png"
              alt="CYM Emblem"
              className="h-10 w-auto sm:h-12 sm:w-auto object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/assets/logo_transparent.png';
              }}
            />

            {/* Clean & Professional Brand Typography */}
            <div className="flex flex-col justify-center select-none">
              <span className="font-sans font-black text-xl sm:text-2xl tracking-wide uppercase leading-none text-white group-hover:text-[#E5A812] transition-colors">
                CYM
              </span>
              <span className="text-[8.5px] sm:text-[9.5px] font-sans font-bold tracking-[0.2em] text-[#E5A812] uppercase leading-tight mt-0.5">
                {language === 'kn' ? 'ಯಮಕನಮರಡಿ' : 'YAMAKANMARDI'}
              </span>
            </div>
          </Link>

          {/* Center: Desktop Navigation Links (All 7 links with Glowing Gold Active Pill) */}
          <nav
            className="hidden lg:flex items-center space-x-0.5 xl:space-x-1.5 flex-nowrap shrink"
            aria-label="Main Navigation"
          >
            {navLinks.map((link) => {
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => {
                    if (link.to === '/') handleScrollToTop();
                  }}
                  className={`relative px-2.5 py-1.5 xl:px-3.5 xl:py-1.5 rounded-full font-bold transition-all duration-200 whitespace-nowrap ${
                    language === 'kn'
                      ? 'font-kannada text-xs xl:text-[13px] tracking-normal'
                      : 'font-sans text-[11px] xl:text-xs tracking-wider uppercase font-bold'
                  } ${
                    active
                      ? 'bg-[#E5A812] text-black font-black shadow-[0_0_18px_rgba(229,168,18,0.55)] scale-102'
                      : 'text-white/80 hover:text-white hover:bg-white/10 active:scale-95'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Live Pill, Language Pill & Mobile Drawer Toggle */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Live Indicator Pill (if live streaming is on) */}
            {isLiveStreamActive && (
              <a
                href="#live-darshan-section"
                onClick={(e) => {
                  if (location.pathname === '/') {
                    e.preventDefault();
                    document.getElementById('live-darshan-section')?.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    navigate('/');
                    setTimeout(() => {
                      document.getElementById('live-darshan-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 300);
                  }
                }}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full bg-red-600 hover:bg-red-500 border border-red-400 text-white text-[11px] sm:text-xs font-bold tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(239,68,68,0.7)] animate-pulse cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>LIVE</span>
              </a>
            )}

            {/* Language Capsule */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1.5 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/25 border border-white/25 text-xs font-bold text-white transition-all duration-200 shadow-2xs focus:outline-none cursor-pointer whitespace-nowrap"
              title={language === 'kn' ? 'Switch to English' : 'ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಿ'}
              aria-label="Language switcher"
            >
              <Globe className="w-3.5 h-3.5 text-[#E5A812]" />
              <span className="font-sans uppercase text-[11px] sm:text-xs font-bold tracking-wider text-white">
                {language === 'kn' ? 'ENGLISH' : 'ಕನ್ನಡ'}
              </span>
            </button>

            {/* Mobile Menu Button (Visible on mobile/tablet) */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="lg:hidden p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/25 text-white transition-all focus:outline-none cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out Mobile Navigation Drawer */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        navLinks={navLinks}
        isActive={isActive}
      />
    </>
  );
};
