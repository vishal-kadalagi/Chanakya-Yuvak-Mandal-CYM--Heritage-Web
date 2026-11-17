import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';

interface PhraseItem {
  en: string;
  kn: string;
  isHighlight?: boolean;
}

// Highly optimized geometry cache: checks if a point intersects any dark section without layout thrashing
interface DarkBand {
  top: number;
  bottom: number;
}

let cachedDarkBands: DarkBand[] = [];
let lastCacheTimestamp = 0;

const refreshDarkBands = () => {
  const now = performance.now();
  if (now - lastCacheTimestamp < 150) return; // Cache valid for 150ms
  lastCacheTimestamp = now;

  if (typeof document === 'undefined') return;

  const darkNodes = document.querySelectorAll(
    '[data-theme="dark"], #explore-section, #live-darshan-section, footer'
  );

  const bands: DarkBand[] = [];
  darkNodes.forEach((node) => {
    const rect = node.getBoundingClientRect();
    if (rect.height > 0) {
      bands.push({ top: rect.top, bottom: rect.bottom });
    }
  });

  cachedDarkBands = bands;
};

const checkPointIsLight = (centerY: number): boolean => {
  if (typeof window === 'undefined') return true;
  refreshDarkBands();

  // Fast mathematical check: does this centerY fall inside any active dark section?
  for (let i = 0; i < cachedDarkBands.length; i++) {
    if (centerY >= cachedDarkBands[i].top && centerY <= cachedDarkBands[i].bottom) {
      return false; // Background is dark
    }
  }

  return true; // Background is light
};

const DynamicRailItem: React.FC<{
  item: PhraseItem;
  language: string;
  isRightRail?: boolean;
}> = ({ item, language }) => {
  const itemRef = useRef<HTMLSpanElement>(null);
  const [isLightBg, setIsLightBg] = useState(() => {
    if (typeof window === 'undefined') return true;
    const isHomePage = window.location.pathname === '/' || window.location.pathname === '';
    if (isHomePage && (window.scrollY || 0) < window.innerHeight * 0.8) {
      return false;
    }
    return true;
  });

  useEffect(() => {
    const evaluateTheme = () => {
      if (itemRef.current) {
        const rect = itemRef.current.getBoundingClientRect();
        const centerY = Math.max(15, Math.min(window.innerHeight - 15, rect.top + rect.height / 2));
        setIsLightBg(checkPointIsLight(centerY));
      }
    };

    evaluateTheme();

    // Calm 350ms cadence: smooth color adaptation without triggering layout thrashing
    const timer = setInterval(evaluateTheme, 350);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <span
      ref={itemRef}
      className={`text-[11px] uppercase whitespace-nowrap transition-colors duration-200 select-none pointer-events-none font-bold ${
        isLightBg
          ? item.isHighlight
            ? 'text-amber-800 font-extrabold'
            : 'text-stone-900 font-bold'
          : item.isHighlight
            ? 'text-[#F5B418] font-extrabold [text-shadow:0_1px_2px_rgba(0,0,0,0.9)]'
            : 'text-white/95 font-bold [text-shadow:0_1px_2px_rgba(0,0,0,0.9)]'
      } ${
        language === 'kn' ? 'font-kannada text-[12px] tracking-normal' : 'font-display tracking-[0.25em]'
      }`}
    >
      {language === 'kn' ? item.kn : item.en}
    </span>
  );
};

export const AnimatedSideRails: React.FC = () => {
  const { language } = useLanguage();

  const leftPhrases: PhraseItem[] = [
    { en: "CHANAKYA YUVAK MANDAL", kn: "ಚಾಣಕ್ಯ ಯುವಕ ಮಂಡಳ", isHighlight: true },
    { en: "ESTABLISHED 2019", kn: "ಸ್ಥಾಪನೆ 2019" },
    { en: "GANESH MAHOTSAV", kn: "ಗಣೇಶ ಮಹೋತ್ಸವ" },
    { en: "KADALAGI KHOOT", kn: "ಕಡಲಗಿ ಖೂಟ" },
    { en: "YAMAKANMARDI", kn: "ಯಮಕನಮರಡಿ" },
  ];

  const rightPhrases: PhraseItem[] = [
    { en: "CHANAKYA YUVAK MANDAL", kn: "ಚಾಣಕ್ಯ ಯುವಕ ಮಂಡಳ", isHighlight: true },
    { en: "BELAGAVI DISTRICT", kn: "ಬೆಳಗಾವಿ ಜಿಲ್ಲೆ" },
    { en: "YOUTH UNITY", kn: "ಯುವ ಏಕತೆ" },
    { en: "COMMUNITY SEVA", kn: "ಜನಸೇವೆ" },
    { en: "HERITAGE & CULTURE", kn: "ಸಂಸ್ಕೃತಿ & ಸಂಪ್ರದಾಯ" },
  ];

  // 4 seamless repeated sets for smooth mathematical 50% loop
  const fullLeftList = [...leftPhrases, ...leftPhrases, ...leftPhrases, ...leftPhrases];
  const fullRightList = [...rightPhrases, ...rightPhrases, ...rightPhrases, ...rightPhrases];

  return (
    <div className="hidden xl:block pointer-events-none select-none z-40" aria-hidden="true">
      {/* ================= LEFT RAIL (Infinite Upward Motion) ================= */}
      <aside className="fixed left-2 xl:left-3 2xl:left-6 inset-y-0 h-screen w-9 2xl:w-10 overflow-hidden flex justify-center pointer-events-none select-none">
        <div className="animate-rail-up pointer-events-none">
          {fullLeftList.map((item, idx) => (
            <div
              key={idx}
              className="py-8 flex flex-col items-center [writing-mode:vertical-rl] rotate-180 pointer-events-none"
            >
              <DynamicRailItem item={item} language={language} isRightRail={false} />
            </div>
          ))}
        </div>
      </aside>

      {/* ================= RIGHT RAIL (Infinite Downward Motion) ================= */}
      <aside className="fixed right-2 xl:right-3 2xl:right-6 inset-y-0 h-screen w-9 2xl:w-10 overflow-hidden flex justify-center pointer-events-none select-none">
        <div className="animate-rail-down pointer-events-none">
          {fullRightList.map((item, idx) => (
            <div
              key={idx}
              className="py-8 flex flex-col items-center [writing-mode:vertical-rl] pointer-events-none"
            >
              <DynamicRailItem item={item} language={language} isRightRail={true} />
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};
