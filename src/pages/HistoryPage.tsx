import React, { useState, useEffect, useMemo } from 'react';
import { Crown } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { subscribeToHistory, HistoryMilestoneDoc } from '../services/historyService';
import { ExpandedCardsRail } from '../components/history/ExpandedCardsRail';
import { SacredGeometryOverlay } from '../components/common/SacredGeometryOverlay';

export const HistoryPage: React.FC = () => {
  const { language } = useLanguage();
  const [historyItems, setHistoryItems] = useState<HistoryMilestoneDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeYear, setActiveYear] = useState<number | 'all'>('all');

  useEffect(() => {
    const unsubscribe = subscribeToHistory(
      (data) => {
        setHistoryItems(data.filter((item) => item.isActive !== false));
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Strictly Live Admin-Controlled History Milestones
  const effectiveItems = historyItems;

  const maxFestivalYear = useMemo(() => {
    const years = effectiveItems.map((item) => item.year);
    return years.length > 0 ? Math.max(...years, 2026) : 2026;
  }, [effectiveItems]);

  const totalHeritageYears = maxFestivalYear - 2019 + 1;

  return (
    <div className="relative pt-4 sm:pt-6 pb-12 sm:pb-16 bg-[#F8F7F4] text-stone-900 min-h-screen overflow-hidden selection:bg-amber-400 selection:text-stone-950">
      {/* Background Sacred Geometric Yantras (Subtle light warm gold) */}
      <div className="absolute -top-32 -right-32 pointer-events-none opacity-20">
        <SacredGeometryOverlay size={650} opacity={0.12} />
      </div>
      <div className="absolute top-1/2 -left-48 pointer-events-none opacity-15">
        <SacredGeometryOverlay size={600} opacity={0.1} />
      </div>

      {/* Radiant Sunlit Ambient Atmosphere */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-b from-amber-200/25 via-orange-100/15 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-gradient-to-b from-yellow-200/20 via-amber-100/10 to-transparent rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ================= PAGE HEADER (CONCISE & SLEEK) ================= */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 font-mono text-[11px] font-bold uppercase tracking-wider mb-3 shadow-xs">
            <Crown className="w-3.5 h-3.5 text-amber-600" />
            <span>{`2019 – ${maxFestivalYear} ${language === 'kn' ? 'ಇತಿಹಾಸ' : 'HISTORY'}`}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse ml-1" />
          </div>

          <h1
            className={`text-2xl sm:text-3xl md:text-4xl font-black text-stone-900 tracking-tight leading-tight ${
              language === 'kn' ? 'font-kannada' : 'font-sans'
            }`}
          >
            {language === 'kn' ? (
              <span>
                ಉತ್ಸವದ <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-700">ಸುವರ್ಣ ಇತಿಹಾಸ</span>
              </span>
            ) : (
              <span>
                OUR GOLDEN <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-700">HISTORY</span>
              </span>
            )}
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-stone-500 font-sans">
            {language === 'kn'
              ? `ಕಡಲಗಿ ಖೂಟ, ಯಮಕನಮರಡಿ • ${totalHeritageYears}+ ವರ್ಷಗಳ ಪವಿತ್ರ ಸೇವಾ ಪರಂಪರೆ`
              : `Kadalagi Khoot, Yamakanmardi • ${totalHeritageYears}+ years of sacred heritage & seva`}
          </p>
        </div>

        {/* ================= YEAR QUICK FILTER BAR ================= */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-stone-200 flex-wrap gap-4">
          <div className="text-xs font-mono font-bold text-stone-500 uppercase tracking-wider">
            {language === 'kn' ? 'ವರ್ಷ ಆಯ್ಕೆಮಾಡಿ:' : 'SELECT FESTIVAL YEAR:'}
          </div>

          {/* Year Filter Buttons */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setActiveYear('all')}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeYear === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-300'
              }`}
            >
              {language === 'kn' ? 'ಎಲ್ಲಾ' : 'ALL'}
            </button>

            {Array.from(new Set(effectiveItems.map((item) => item.year)))
              .sort((a, b) => b - a)
              .map((yr) => (
                <button
                  key={yr}
                  onClick={() => setActiveYear(yr)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeYear === yr
                      ? 'bg-amber-500 text-white font-black shadow-xs'
                      : 'bg-white border border-stone-200 text-stone-600 hover:text-amber-700 hover:border-amber-300'
                  }`}
                >
                  {yr}
                </button>
              ))}
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="mt-8 space-y-6 max-w-4xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl border border-stone-200 p-6 animate-pulse h-56" />
            ))}
          </div>
        )}

        {/* ================= EXCLUSIVE EXPANDED CARDS SYSTEM ================= */}
        {!loading && effectiveItems.length === 0 && (
          <div className="text-center py-16 px-6 bg-white rounded-3xl border border-amber-200/90 max-w-lg mx-auto mt-6 shadow-[0_4px_25px_rgba(0,0,0,0.04)] relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300" />
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-400/40 flex items-center justify-center text-amber-700 mx-auto mb-4 shadow-2xs">
              <Crown className="w-8 h-8 text-amber-600 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-1 font-kannada">
              {language === 'kn' ? 'ಉತ್ಸವದ ಇತಿಹಾಸ ಶೀಘ್ರದಲ್ಲೇ ಲಭ್ಯ' : 'Festival History Coming Soon'}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 font-sans leading-relaxed max-w-sm mx-auto">
              {language === 'kn'
                ? 'ಕಡಲಗಿ ಖೂಟದ ವಾರ್ಷಿಕ ಮಹೋತ್ಸವಗಳ ಸಮಗ್ರ ಸುವರ್ಣ ಮೈಲಿಗಲ್ಲುಗಳು ಶೀಘ್ರದಲ್ಲೇ ಇಲ್ಲಿ ಪ್ರಕಟವಾಗಲಿವೆ.'
                : 'Comprehensive archival records of our annual Ganesh Mahotsavs will be documented here shortly.'}
            </p>
          </div>
        )}

        {!loading && effectiveItems.length > 0 && (
          <div className="w-full">
            <ExpandedCardsRail
              items={effectiveItems}
              selectedYear={activeYear}
              onYearChange={(yr) => setActiveYear(yr)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
