import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Instagram, Youtube, MapPin, ExternalLink, Sparkles } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { siteConfig } from '../../data/site';

export const Footer: React.FC = () => {
  const { language, t } = useLanguage();
  const [secretClicks, setSecretClicks] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  // Secret Admin Door: Triple-click / Triple-tap on the © copyright symbol
  const handleCopyrightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const nextCount = secretClicks + 1;
    if (timerRef.current) clearTimeout(timerRef.current);

    if (nextCount >= 3) {
      setSecretClicks(0);
      navigate('/admin/login');
    } else {
      setSecretClicks(nextCount);
      timerRef.current = setTimeout(() => {
        setSecretClicks(0);
      }, 1200);
    }
  };

  return (
    <footer
      data-theme="dark"
      className="relative bg-[#0A0908] text-neutral-400 border-t border-neutral-800/80 pt-10 sm:pt-14 pb-5 overflow-hidden select-none"
    >
      {/* Devotional Ambient Light Backdrops */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[250px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-36 bg-gradient-to-t from-amber-500/10 via-amber-600/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ================= TOP CONNECT / SEVA PANEL (SCROLLTIDE CLOSE STYLE) ================= */}
        <div className="mb-8 sm:mb-10 p-5 sm:p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800/90 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden">
          {/* Subtle Ambient Glint */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/25 text-amber-400 font-mono text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{language === 'kn' ? 'ಯುವ ಸೇವಾ ನೆಟ್‌ವರ್ಕ್ • ಸ್ಥಾಪನೆ 2019' : 'YOUTH SEVA NETWORK • EST. 2019'}</span>
            </div>

            <h3
              className={`text-xl sm:text-2xl font-black text-white tracking-tight ${
                language === 'kn' ? 'font-kannada' : 'font-sans'
              }`}
            >
              {language === 'kn'
                ? 'ಚಾಣಕ್ಯ ಯುವಕ ಮಂಡಳದೊಂದಿಗೆ ಸಂಪರ್ಕದಲ್ಲಿರಿ'
                : 'Connect with Chanakya Yuvak Mandal'}
            </h3>

            <p className="text-xs sm:text-sm text-neutral-400 font-sans max-w-xl">
              {language === 'kn'
                ? 'ಯಮಕನಮರಡಿ ಗ್ರಾಮದ ಸಾಂಸ್ಕೃತಿಕ ಏಕತೆ, ಪವಿತ್ರ ಮಹೋತ್ಸವ ಹಾಗೂ ಸಮಾಜಮುಖಿ ಜನಸೇವೆಗೆ ಸಮರ್ಪಿತ.'
                : 'Dedicated to cultural unity, sacred Ganesha festivities, and selfless community seva in Yamakanmardi.'}
            </p>
          </div>

          {/* Social Quick Action Buttons */}
          <div className="flex items-center flex-wrap justify-center gap-3 shrink-0">
            <a
              href={siteConfig.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-sans text-xs font-bold uppercase tracking-wider transition-all shadow-md transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Youtube className="w-4 h-4" />
              <span>{language === 'kn' ? 'ಯೂಟ್ಯೂಬ್ ಚಾನೆಲ್' : 'YouTube Channel'}</span>
              <ExternalLink className="w-3 h-3 text-white/80" />
            </a>

            <a
              href={siteConfig.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white font-sans text-xs font-bold uppercase tracking-wider transition-all shadow-md transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Instagram className="w-4 h-4 text-pink-400" />
              <span>Instagram</span>
              <ExternalLink className="w-3 h-3 text-neutral-400" />
            </a>
          </div>
        </div>

        {/* ================= 4 LINK COLUMNS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8 pb-8 sm:pb-10 border-b border-neutral-800/80">
          
          {/* Column 1: Brand & Heritage (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src="/assets/logo_transparent.png"
                alt="CYM Emblem"
                className="h-12 w-auto object-contain filter drop-shadow-[0_2px_10px_rgba(229,168,18,0.3)]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/logo_transparent.png';
                }}
              />
              <div className="flex flex-col leading-none">
                <span className="font-sans sm:font-display font-black text-base sm:text-lg tracking-tight text-white uppercase">
                  {language === 'kn' ? siteConfig.nameKn : siteConfig.nameEn}
                </span>
                <span className="text-[10px] font-mono font-bold tracking-wider text-amber-400 uppercase mt-1">
                  KADALAGI KHOOT • YAMAKANMARDI
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-sm font-sans">
              {t.footer.aboutCYM}
            </p>

            <div className="pt-1">
              <p className="text-xs text-amber-300 font-sans font-semibold italic border-l-2 border-amber-400 pl-3 py-1 bg-amber-500/5 rounded-r-lg">
                "{language === 'kn' ? siteConfig.taglineKn : siteConfig.taglineEn}"
              </p>
            </div>
          </div>

          {/* Column 2: Pages Navigation */}
          <div>
            <h4 className="font-mono text-xs font-bold text-white tracking-widest uppercase mb-4 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>{language === 'kn' ? 'ಪುಟಗಳು' : 'PAGES'}</span>
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link to="/" className="text-neutral-400 hover:text-amber-400 transition-colors">
                  {t.nav.home}
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-neutral-400 hover:text-amber-400 transition-colors">
                  {t.nav.gallery}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-neutral-400 hover:text-amber-400 transition-colors">
                  {t.nav.about}
                </Link>
              </li>
              <li>
                <Link to="/history" className="text-neutral-400 hover:text-amber-400 transition-colors">
                  {t.nav.history}
                </Link>
              </li>
              <li>
                <Link to="/committee" className="text-neutral-400 hover:text-amber-400 transition-colors">
                  {t.nav.committee}
                </Link>
              </li>
              <li>
                <Link to="/achievements" className="text-neutral-400 hover:text-amber-400 transition-colors">
                  {t.nav.achievements}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-neutral-400 hover:text-amber-400 transition-colors">
                  {t.nav.contact}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Festival History Archives */}
          <div>
            <h4 className="font-mono text-xs font-bold text-white tracking-widest uppercase mb-4 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>{language === 'kn' ? 'ಉತ್ಸವ ಇತಿಹಾಸ' : 'ARCHIVES'}</span>
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link to="/history/2026" className="text-neutral-400 hover:text-amber-400 transition-colors flex items-center space-x-1.5">
                  <span>2026 Mahotsav</span>
                  <span className="text-[9px] bg-amber-400 text-neutral-950 font-bold px-1.5 py-0.2 rounded-full font-mono">
                    8th
                  </span>
                </Link>
              </li>
              <li>
                <Link to="/history/2025" className="text-neutral-400 hover:text-amber-400 transition-colors">
                  2025 Mahotsav (7th)
                </Link>
              </li>
              <li>
                <Link to="/history/2024" className="text-neutral-400 hover:text-amber-400 transition-colors">
                  2024 Mahotsav (6th)
                </Link>
              </li>
              <li>
                <Link to="/history/2023" className="text-neutral-400 hover:text-amber-400 transition-colors">
                  2023 Jubilee (5th)
                </Link>
              </li>
              <li>
                <Link to="/history/2019" className="text-neutral-400 hover:text-amber-400 transition-colors">
                  2019 Genesis (1st)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Location & Contact */}
          <div>
            <h4 className="font-mono text-xs font-bold text-white tracking-widest uppercase mb-4 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>{language === 'kn' ? 'ಸಂಪರ್ಕಿಸಿ' : 'CONTACT'}</span>
            </h4>
            <div className="space-y-3 text-xs">
              <a
                href={`mailto:${siteConfig.email}`}
                className="flex items-center space-x-2 text-neutral-400 hover:text-amber-300 transition-colors break-all"
              >
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{siteConfig.email}</span>
              </a>

              <div className="flex items-start space-x-2 text-neutral-400 pt-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-snug">
                  Kadalagi Khoot, Yamakanmardi<br />
                  Taluk: Hukkeri, Belagavi 591246
                </span>
              </div>

              <div className="pt-2 text-[11px] font-mono text-neutral-500">
                GPS: 16.1298° N, 74.5290° E
              </div>
            </div>
          </div>
        </div>

        {/* ================= SIGNATURE WORDMARK (SCROLLTIDE PORTFOLIO CLOSE - EXACT COLOR & DESIGN) ================= */}
        <div className="pt-6 sm:pt-8 pb-3 relative flex flex-col items-center justify-center text-center overflow-hidden pointer-events-none select-none">
          {language === 'kn' ? (
            /* KANNADA SELECTED: Display 'ಚಾಣಕ್ಯ' with exact antique bronze gold gradient & monumental design from reference */
            <div className="w-full flex flex-col items-center justify-center leading-none">
              <span
                className="font-kannada font-black text-[13vw] sm:text-[12vw] lg:text-[10vw] leading-[0.88] text-transparent bg-clip-text bg-gradient-to-b from-amber-400/30 via-amber-500/15 to-transparent drop-shadow-sm select-none px-2"
                aria-label="ಚಾಣಕ್ಯ"
              >
                ಚಾಣಕ್ಯ
              </span>
              <div className="mt-2 inline-flex items-center space-x-2 text-[10px] sm:text-xs font-mono tracking-widest text-amber-400/60 uppercase">
                <span>ಕಡಲಗಿ ಖೂಟ</span>
                <span>•</span>
                <span>ಯಮಕನಮರಡಿ</span>
                <span>•</span>
                <span>ಸ್ಥಾಪನೆ ೨೦೧೯</span>
              </div>
            </div>
          ) : (
            /* ENGLISH SELECTED: Display 'CHANAKYA®' with exact sleek titanium metallic gradient & monumental design from reference */
            <div className="w-full flex flex-col items-center justify-center leading-none">
              <div className="flex items-baseline justify-center space-x-1.5 sm:space-x-2 max-w-full px-2">
                <span
                  className="font-display font-black text-[10vw] sm:text-[9vw] lg:text-[7.5vw] leading-none uppercase text-transparent bg-clip-text bg-gradient-to-b from-white/20 via-neutral-400/10 to-transparent tracking-[0.06em] drop-shadow-sm select-none"
                  aria-label="CHANAKYA"
                >
                  CHANAKYA
                </span>
                <span className="text-[2.2vw] sm:text-[1.8vw] lg:text-[1.3vw] text-amber-400/40 font-mono font-bold align-super">
                  ®
                </span>
              </div>
              <div className="mt-2 inline-flex items-center space-x-2 text-[10px] sm:text-xs font-mono tracking-widest text-amber-400/60 uppercase">
                <span>KADALAGI KHOOT</span>
                <span>•</span>
                <span>YAMAKANMARDI</span>
                <span>•</span>
                <span>ESTD 2019</span>
              </div>
            </div>
          )}
        </div>

        {/* ================= BOTTOM METADATA STRIP ================= */}
        <div className="pt-6 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-3 text-center sm:text-left">
          <p className="flex items-center">
            <span
              onClick={handleCopyrightClick}
              role="button"
              tabIndex={0}
              className="inline-flex items-center justify-center p-2 -m-2 cursor-default select-none transition-colors active:text-amber-400 hover:text-amber-400"
              title="Chanakya Yuvak Mandal"
            >
              ©
            </span>
            <span className="ml-1">
              2019 – {new Date().getFullYear()} {siteConfig.nameEn}. {t.footer.rights}
            </span>
          </p>

          <p className="text-amber-400/80 font-semibold font-mono text-[11px]">
            {language === 'kn' ? siteConfig.invocationKn : siteConfig.invocationEn}
          </p>

          <p className="text-[11px] text-neutral-500 font-sans">
            {language === 'kn' ? '🚩 ಯಮಕನಮರಡಿ ಗ್ರಾಮಕ್ಕಾಗಿ ಸಮರ್ಪಿತ' : '🚩 Dedicated to Yamakanmardi Village'}
          </p>
        </div>
      </div>
    </footer>
  );
};
