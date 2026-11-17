import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Filter, ChevronDown, Check, X, Folder, Camera } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { GalleryCategory } from '../../data/gallery';

interface GalleryFilterProps {
  selectedYear: number | 'all';
  onSelectYear: (year: number | 'all') => void;
  selectedCategory: GalleryCategory;
  onSelectCategory: (category: GalleryCategory) => void;
  availableYears: number[];
  totalCount: number;
  viewMode?: 'albums' | 'photos';
  onToggleViewMode?: (mode: 'albums' | 'photos') => void;
}

export const GalleryFilter: React.FC<GalleryFilterProps> = ({
  selectedYear,
  onSelectYear,
  selectedCategory,
  onSelectCategory,
  availableYears,
  totalCount,
  viewMode = 'albums',
  onToggleViewMode,
}) => {
  const { language } = useLanguage();
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);

  const catRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setIsCatOpen(false);
      }
      if (yearRef.current && !yearRef.current.contains(e.target as Node)) {
        setIsYearOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categories: { key: GalleryCategory; labelKn: string; labelEn: string; icon: string }[] = [
    { key: 'all', labelKn: 'ಎಲ್ಲಾ ವರ್ಗಗಳು', labelEn: 'All Categories', icon: '✦' },
    { key: 'darshan', labelKn: 'ದಿವ್ಯ ದರ್ಶನ', labelEn: 'Royal Darshan', icon: '🪔' },
    { key: 'aagamana', labelKn: 'ಗಣಪತಿ ಆಗಮನ (ಪ್ರಾರಂಭ)', labelEn: 'Ganesh Aagamana & Opening', icon: '🚩' },
    { key: 'saval', labelKn: 'ಪವಿತ್ರ ಸವಾಲ್ & ಲೇಲಾವ್', labelEn: 'Sacred Saval & Auction', icon: '👑' },
    { key: 'aarti', labelKn: 'ಮಹಾ ಮಂಗಳಾರತಿ', labelEn: 'Maha Aarti', icon: '🔥' },
    { key: 'pandal', labelKn: 'ಭವ್ಯ ಮಂಟಪ', labelEn: 'Pandal & Decor', icon: '🏛️' },
    { key: 'visarjan', labelKn: 'ವಿಸರ್ಜನಾ ಮೆರವಣಿಗೆ', labelEn: 'Visarjan Procession', icon: '🥁' },
    { key: 'cultural', labelKn: 'ಸಾಂಸ್ಕೃತಿಕ ವೈಭವ', labelEn: 'Folk Arts & Culture', icon: '🎭' },
    { key: 'seva', labelKn: 'ಮಹಾ ಅನ್ನದಾಸೋಹ', labelEn: 'Maha Prasad Seva', icon: '🙏' },
  ];

  const currentCat = categories.find((c) => c.key === selectedCategory) || categories[0];
  const isFiltered = selectedYear !== 'all' || selectedCategory !== 'all';

  const defaultYears = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019];
  const yearsToList = availableYears && availableYears.length > 0 ? availableYears : defaultYears;
  const latestYear = yearsToList.length > 0 ? Math.max(...yearsToList) : 2026;

  const resetFilters = () => {
    onSelectYear('all');
    onSelectCategory('all');
    setIsCatOpen(false);
    setIsYearOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto select-none">
      {/* Sleek Compact Container with Top Hairline (NO overflow-hidden so dropdowns are never clipped!) */}
      <div className="relative z-30 bg-white/95 backdrop-blur-md rounded-2xl border border-stone-200 shadow-xs p-2 sm:p-2.5 flex items-center justify-between flex-wrap gap-2.5">
        {/* Top Gold Hairline Glint */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300 rounded-t-2xl pointer-events-none" />

        {/* Left Side: Two Luxury Custom Dropdowns */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
          {/* ================= 1. CATEGORY DROPDOWN ================= */}
          <div className="relative w-full sm:w-auto" ref={catRef}>
            <button
              type="button"
              onClick={() => {
                setIsCatOpen(!isCatOpen);
                setIsYearOpen(false);
              }}
              className={`w-full sm:w-auto inline-flex items-center justify-between sm:justify-start space-x-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                selectedCategory !== 'all'
                  ? 'bg-stone-900 text-amber-300 border-stone-900 shadow-xs'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
              }`}
            >
              <div className="flex items-center space-x-1.5 truncate">
                <Filter className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="shrink-0">{currentCat.icon}</span>
                <span className="font-sans truncate">
                  {language === 'kn' ? currentCat.labelKn : currentCat.labelEn}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-stone-400 shrink-0 transition-transform duration-200 ${
                  isCatOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Category Popover Menu */}
            <AnimatePresence>
              {isCatOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-2 w-64 max-w-[calc(100vw-2.5rem)] bg-white rounded-2xl border border-stone-200 shadow-xl p-1.5 z-50 overflow-hidden"
                >
                  <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100 mb-1">
                    {language === 'kn' ? 'ವರ್ಗ ಆಯ್ಕೆಮಾಡಿ' : 'FILTER BY CATEGORY'}
                  </div>

                  <div className="space-y-0.5">
                    {categories.map((cat) => {
                      const isSelected = selectedCategory === cat.key;
                      return (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => {
                            onSelectCategory(cat.key);
                            setIsCatOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-amber-50 text-amber-900 font-bold'
                              : 'text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          <span className="flex items-center space-x-2">
                            <span>{cat.icon}</span>
                            <span>{language === 'kn' ? cat.labelKn : cat.labelEn}</span>
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-600" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ================= 2. YEAR DROPDOWN ================= */}
          <div className="relative w-full sm:w-auto" ref={yearRef}>
            <button
              type="button"
              onClick={() => {
                setIsYearOpen(!isYearOpen);
                setIsCatOpen(false);
              }}
              className={`w-full sm:w-auto inline-flex items-center justify-between sm:justify-start space-x-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                selectedYear !== 'all'
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
              }`}
            >
              <div className="flex items-center space-x-1.5 truncate">
                <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="font-mono truncate">
                  {selectedYear === 'all'
                    ? language === 'kn'
                      ? 'ವರ್ಷ: ಎಲ್ಲಾ'
                      : 'Year: All'
                    : `${selectedYear} Utsav`}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-stone-400 shrink-0 transition-transform duration-200 ${
                  isYearOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Year Popover Menu */}
            <AnimatePresence>
              {isYearOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-56 max-w-[calc(100vw-2.5rem)] bg-white rounded-2xl border border-amber-300/80 shadow-2xl p-1.5 z-50 overflow-hidden"
                >
                  <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100 mb-1 flex items-center justify-between">
                    <span>{language === 'kn' ? 'ಉತ್ಸವ ವರ್ಷ' : 'FESTIVAL YEAR'}</span>
                    <span className="text-[9px] text-amber-600 font-bold">2019–2026</span>
                  </div>

                  <div className="space-y-0.5 max-h-60 overflow-y-auto no-scrollbar">
                    {/* All Years Option */}
                    <button
                      type="button"
                      onClick={() => {
                        onSelectYear('all');
                        setIsYearOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                        selectedYear === 'all'
                          ? 'bg-amber-500 text-white font-bold shadow-xs'
                          : 'text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <span className="font-sans">
                        {language === 'kn' ? `ಎಲ್ಲಾ ವರ್ಷಗಳು (2019–${latestYear})` : `All Years (2019–${latestYear})`}
                      </span>
                      {selectedYear === 'all' && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>

                    {/* Available Years */}
                    {yearsToList.map((yr) => {
                      const isSelected = selectedYear === yr;
                      return (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => {
                            onSelectYear(yr);
                            setIsYearOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500 text-white font-bold shadow-xs'
                              : 'text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          <span className="flex items-center space-x-2 font-mono">
                            <span>{yr}</span>
                            {yr === latestYear && (
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded-full font-sans font-bold ${
                                  isSelected
                                    ? 'bg-white text-neutral-900'
                                    : 'bg-amber-100 text-amber-900'
                                }`}
                              >
                                NEW
                              </span>
                            )}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Reset Filters Pill (Appears only when filtered) */}
          {isFiltered && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
              title="Reset filters"
            >
              <X className="w-3.5 h-3.5" />
              <span>{language === 'kn' ? 'ತೆರವುಗೊಳಿಸಿ' : 'Clear'}</span>
            </button>
          )}
        </div>

        {/* Right Side: View Mode & Photo Count */}
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-2 pt-1.5 sm:pt-0 border-t border-stone-100 sm:border-t-0">
          {onToggleViewMode && (
            <div className="flex items-center space-x-1 bg-stone-100 p-0.5 rounded-xl border border-stone-200">
              <button
                type="button"
                onClick={() => onToggleViewMode('albums')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                  viewMode === 'albums'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
                title={language === 'kn' ? 'ವರ್ಷವಾರು ಆಲ್ಬಮ್‌ಗಳು' : 'Year Albums'}
              >
                <Folder className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-[11px] font-sans">{language === 'kn' ? 'ಆಲ್ಬಮ್' : 'Albums'}</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleViewMode('photos')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                  viewMode === 'photos'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
                title={language === 'kn' ? 'ಎಲ್ಲಾ ಫೋಟೋಗಳು' : 'All Photos'}
              >
                <Camera className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-[11px] font-sans">{language === 'kn' ? 'ಫೋಟೋ' : 'Photos'}</span>
              </button>
            </div>
          )}

          <span className="text-xs font-mono font-bold text-stone-600 px-2.5 py-1 bg-stone-50 border border-stone-200/80 rounded-xl whitespace-nowrap">
            {totalCount} {language === 'kn' ? 'ಚಿತ್ರಗಳು' : 'Photos'}
          </span>
        </div>
      </div>
    </div>
  );
};
