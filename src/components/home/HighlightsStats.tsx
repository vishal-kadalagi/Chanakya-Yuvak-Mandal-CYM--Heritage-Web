import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Instagram, Users } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { siteConfig } from '../../data/site';

export const HighlightsStats: React.FC = () => {
  const { language } = useLanguage();

  return (
    <section className="bg-gradient-to-b from-[#FAF8F5] to-white border-b border-amber-900/10 py-8 sm:py-14 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ================= MOBILE VIEW (COMPACT, PROFESSIONAL & PREMIUM) ================= */}
        <div className="lg:hidden bg-white rounded-2xl border border-stone-200/90 shadow-[0_4px_25px_rgba(0,0,0,0.04)] p-4 relative overflow-hidden space-y-3.5">
          {/* Top Gold Hairline Glint */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300" />

          {/* Header Row: Icon + Badge + Village */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500/20 to-amber-400/10 border border-amber-400/40 flex items-center justify-center text-amber-700 shadow-2xs shrink-0">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div className="leading-tight">
                <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-[9.5px] font-mono font-bold uppercase tracking-wider text-amber-900">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>CYM YOUTH SEVA NETWORK</span>
                </div>
                <p className="text-[10px] text-neutral-500 font-sans mt-0.5 flex items-center space-x-1">
                  <span>📍 Kadalagi Khoot, Yamakanmardi</span>
                </p>
              </div>
            </div>

            <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full shrink-0">
              ESTD 2019
            </span>
          </div>

          {/* Headline Motto */}
          <div className="border-l-2 border-amber-400 pl-3 py-0.5">
            <h3
              className={`text-sm sm:text-base text-neutral-950 font-black tracking-tight leading-snug ${
                language === 'kn' ? 'font-kannada' : 'font-sans'
              }`}
            >
              {language === 'kn'
                ? 'ಗ್ರಾಮ ಸೌಹಾರ್ದತೆ, ಯುವ ಶಕ್ತಿ ಮತ್ತು ನಿರಂತರ ದಾಸೋಹ'
                : 'YOUTH UNITY & TIMELESS CULTURAL SEVA'}
            </h3>
          </div>

          {/* Symmetrical 3-Pill Micro-Grid */}
          <div className="grid grid-cols-3 gap-1.5 pt-0.5">
            <div className="px-1.5 py-1.5 rounded-xl bg-amber-50/70 border border-amber-200/70 text-[10.5px] font-semibold text-amber-950 flex flex-col items-center justify-center text-center leading-tight">
              <span className="text-sm mb-0.5">🪔</span>
              <span>{language === 'kn' ? 'ಭವ್ಯ ದರ್ಶನ' : 'Darshan'}</span>
            </div>
            <div className="px-1.5 py-1.5 rounded-xl bg-amber-50/70 border border-amber-200/70 text-[10.5px] font-semibold text-amber-950 flex flex-col items-center justify-center text-center leading-tight">
              <span className="text-sm mb-0.5">🌾</span>
              <span>{language === 'kn' ? 'ಅನ್ನಸಂತರ್ಪಣೆ' : 'Prasada'}</span>
            </div>
            <div className="px-1.5 py-1.5 rounded-xl bg-amber-50/70 border border-amber-200/70 text-[10.5px] font-semibold text-amber-950 flex flex-col items-center justify-center text-center leading-tight">
              <span className="text-sm mb-0.5">🚩</span>
              <span>{language === 'kn' ? 'ಗ್ರಾಮ ಸೌಹಾರ್ದ' : 'Village Unity'}</span>
            </div>
          </div>

          {/* Symmetrical 50/50 Dual Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100">
            <a
              href={siteConfig.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-pink-50 hover:bg-pink-100/80 border border-pink-200/70 text-pink-700 text-xs font-bold transition-all active:scale-98 cursor-pointer"
              title="Official Instagram"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px] uppercase tracking-wider">Instagram</span>
            </a>

            <Link
              to="/committee"
              className="inline-flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-neutral-950 text-white hover:bg-neutral-900 text-xs font-bold uppercase tracking-wider shadow-xs transition-all active:scale-98 cursor-pointer group"
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'kn' ? 'ಕಮಿಟಿ ಸದಸ್ಯರು' : 'COMMITTEE'}</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform text-amber-400" />
            </Link>
          </div>
        </div>

        {/* ================= DESKTOP VIEW (PRESERVED) ================= */}
        <div className="hidden lg:flex bg-white rounded-3xl border border-amber-200/90 p-7 items-center justify-between gap-6 shadow-sm hover:shadow-md hover:border-amber-400 transition-all duration-300">
          
          {/* Left Title & Handle */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-amber-400/15 to-transparent border border-amber-400/40 flex items-center justify-center text-amber-600 shadow-2xs shrink-0">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>

            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-900 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>CYM YOUTH SEVA NETWORK</span>
              </div>
              <p
                className={`text-lg text-neutral-950 font-extrabold tracking-tight ${
                  language === 'kn' ? 'font-kannada' : 'font-sans'
                }`}
              >
                {language === 'kn'
                  ? 'ಗ್ರಾಮ ಸೌಹಾರ್ದತೆ, ಯುವ ಶಕ್ತಿ ಮತ್ತು ನಿರಂತರ ದಾಸೋಹ'
                  : 'YOUTH UNITY & TIMELESS CULTURAL SEVA'}
              </p>
              <p className="text-xs text-neutral-500 font-sans mt-0.5 flex items-center space-x-1.5">
                <span>📍 Kadalagi Khoot, Yamakanmardi 591246</span>
              </p>
            </div>
          </div>

          {/* Center Pillars Badges */}
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200/70 text-xs font-sans font-semibold text-amber-950 flex items-center space-x-1.5">
              <span>🪔</span>
              <span>{language === 'kn' ? 'ಭವ್ಯ ದರ್ಶನ' : 'Royal Darshan'}</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200/70 text-xs font-sans font-semibold text-amber-950 flex items-center space-x-1.5">
              <span>🌾</span>
              <span>{language === 'kn' ? 'ಅನ್ನಸಂತರ್ಪಣೆ' : 'Maha Annasantarpane'}</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200/70 text-xs font-sans font-semibold text-amber-950 flex items-center space-x-1.5">
              <span>🚩</span>
              <span>{language === 'kn' ? 'ಗ್ರಾಮ ಸೌಹಾರ್ದ' : 'Village Unity'}</span>
            </span>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <a
              href={siteConfig.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-full bg-pink-500/10 hover:bg-pink-500/20 border border-pink-400/30 text-pink-700 text-xs font-bold transition-all cursor-pointer"
              title="Official Instagram"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px] uppercase tracking-wider">Instagram</span>
            </a>

            <Link
              to="/committee"
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-full bg-neutral-950 text-white hover:bg-neutral-900 hover:ring-2 hover:ring-amber-400/50 text-xs font-bold uppercase tracking-wider shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'kn' ? 'ಕಮಿಟಿ ಸದಸ್ಯರು' : 'COMMITTEE'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-amber-400" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};