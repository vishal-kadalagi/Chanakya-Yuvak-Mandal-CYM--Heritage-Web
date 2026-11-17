import React, { useState } from 'react';
import { MapPin, Clock, Navigation, Mail, Instagram, Youtube, Layers, Eye, Compass, ExternalLink, Check, Copy } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { siteConfig } from '../../data/site';
import { SacredGeometryOverlay } from '../common/SacredGeometryOverlay';

type MapViewMode = 'roadmap' | 'satellite' | 'streetview';

export const InteractiveMap: React.FC = () => {
  const { language, t } = useLanguage();
  const [viewMode, setViewMode] = useState<MapViewMode>('satellite');
  const [copied, setCopied] = useState(false);

  // Exact coordinates for Chanakya Yuvak Mandal, Kadalagi Khoot, Yamakanmardi
  const lat = '16.129842';
  const lng = '74.5290432';

  // Embed URLs for different view modes
  const roadmapEmbedUrl = siteConfig.googleMapsEmbedUrl;
  
  // High-resolution Hybrid Satellite Embed (Satellite imagery + road labels)
  const satelliteEmbedUrl = `https://maps.google.com/maps?q=${lat},${lng}+(Chanakya+Yuvak+Mandal+Kadalagi+Khoot)&t=k&z=19&ie=UTF8&iwloc=B&output=embed`;
  
  // Street view / surroundings embed
  const streetViewEmbedUrl = `https://maps.google.com/maps?q=&layer=c&cbll=${lat},${lng}&cbp=12,90,,0,5&output=svembed`;

  // Direct full-app links
  const directSatelliteUrl = `https://www.google.com/maps/place/Chanakya+Yuvak+Mandal,+Kadalagi+Khoot,+Yamakanmardi/@${lat},${lng},20z/data=!3m1!1e3`;
  const directStreetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;

  const copyAddress = () => {
    const addressText = language === 'kn' ? 'ಕಡಲಗಿ ಖೂಟ, ಯಮಕನಮರಡಿ' : 'Kadalagi Khoot, Yamakanmardi';
    navigator.clipboard.writeText(addressText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="py-14 md:py-20 bg-gradient-to-b from-[#FAF9F6] via-white to-[#F8F6F0] border-b border-gray-200/90 relative overflow-hidden">
      {/* Helix Style Slow Rotating Sacred Yantra in Background */}
      <SacredGeometryOverlay className="absolute -top-28 -right-28" size={560} opacity={0.06} />
      <SacredGeometryOverlay className="absolute -bottom-28 -left-28" size={500} opacity={0.05} />

      {/* Subtle Devotional Warm Ambient Lighting */}
      <div className="absolute top-1/3 -left-20 w-80 h-80 bg-amber-400/6 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ================= SECTION HEADER ================= */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center space-x-2 text-xs font-sans font-bold tracking-wider text-amber-900 bg-amber-500/15 border border-amber-400/40 px-3.5 py-1 rounded-full uppercase">
            <MapPin className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>{language === 'kn' ? 'ಮಂಡಳದ ಸ್ಥಳ ಮತ್ತು ನಕ್ಷೆ' : 'PANDAL LOCATION & LIVE MAP'}</span>
          </div>

          {/* Headline */}
          <h2 className={`text-gray-950 text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight ${
            language === 'kn' ? 'font-kannada leading-snug' : 'font-sans sm:font-display font-black sm:font-extrabold uppercase leading-snug sm:leading-tight'
          }`}>
            {language === 'kn' ? (
              <span>
                ಪವಿತ್ರ ಮಂಟಪದ ಸ್ಥಳ ಮತ್ತು <span className="text-[#D48B00]">ನಕ್ಷೆ</span>
              </span>
            ) : (
              <span>
                VISIT PANDAL & <span className="text-[#D48B00]">LIVE MAP</span>
              </span>
            )}
          </h2>

          <p className="text-xs sm:text-sm text-gray-600 font-sans">
            {language === 'kn'
              ? 'ಕಡಲಗಿ ಖೂಟ, ಯಮಕನಮರಡಿ — ಗಣೇಶೋತ್ಸವ ಮಂಟಪಕ್ಕೆ ನೇರ ಗೂಗಲ್ ನಕ್ಷೆ, ಉಪಗ್ರಹ ಹಾಗೂ ರಸ್ತೆ ನೋಟ.'
              : 'Direct GPS navigation, high-resolution satellite imagery, and street view for Kadalagi Khoot pandal, Yamakanmardi.'}
          </p>
        </div>

        {/* ================= MAIN INTERACTIVE GRID ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* ================= MOBILE VIEW (COMPACT, PROFESSIONAL & PREMIUM) ================= */}
          <div className="lg:hidden bg-white rounded-2xl border border-stone-200/90 shadow-[0_4px_25px_rgba(0,0,0,0.04)] p-4 space-y-3.5 relative overflow-hidden">
            {/* Top Amber Hairline Accent */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300" />

            {/* Pandal Header + 1-Tap Copy Address Button */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-700 shadow-2xs shrink-0">
                  <MapPin className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className={`text-base font-extrabold text-neutral-950 leading-tight ${
                    language === 'kn' ? 'font-kannada' : 'font-sans uppercase font-bold'
                  }`}>
                    {language === 'kn' ? 'ಕಡಲಗಿ ಖೂಟ ಗಣೇಶ ಮಂಟಪ' : 'Kadalagi Khoot Pandal'}
                  </h3>
                  <p className="text-[11px] text-neutral-500 font-sans font-medium mt-0.5">
                    Yamakanmardi • Belagavi 591246
                  </p>
                </div>
              </div>

              {/* 1-Tap Copy Button */}
              <button
                onClick={copyAddress}
                className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200/70 text-amber-900 text-[10.5px] font-sans font-bold transition-all shrink-0 cursor-pointer shadow-2xs active:scale-95"
                title="Copy Address"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">{language === 'kn' ? 'ಕಾಪಿ ಆಗಿದೆ' : 'Copied'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-amber-700" />
                    <span>{language === 'kn' ? 'ವಿಳಾಸ ಕಾಪಿ' : 'Copy'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Primary Action: Direct Google Maps Navigation */}
            <a
              href={siteConfig.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-neutral-950 text-white font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center space-x-2 shadow-xs hover:bg-black transition-all active:scale-98 cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'kn' ? 'ಗೂಗಲ್ ಮ್ಯಾಪ್ಸ್‌ನಲ್ಲಿ ತೆರೆಯಿರಿ' : 'OPEN IN GOOGLE MAPS'}</span>
              <ExternalLink className="w-3 h-3 text-neutral-400" />
            </a>

            {/* Balanced 2-Card Specs: Timings + Distances */}
            <div className="grid grid-cols-2 gap-2">
              {/* Card 1: Darshan Timings */}
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 flex flex-col justify-between">
                <div className="flex items-center space-x-1.5 text-amber-900 font-bold text-[10px] uppercase tracking-wider">
                  <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                  <span>{t.common.visitingHours}</span>
                </div>
                <div className="mt-1">
                  <p className="text-[11px] font-bold text-neutral-900 leading-tight">
                    {language === 'kn' ? 'ಬೆಳಗ್ಗೆ 6:00 – ರಾತ್ರಿ 11:30' : '6:00 AM – 11:30 PM'}
                  </p>
                  <span className="text-[9.5px] text-neutral-500 block mt-0.5">
                    {language === 'kn' ? 'ಉತ್ಸವ ದಿನಗಳಲ್ಲಿ' : 'Festival Days'}
                  </span>
                </div>
              </div>

              {/* Card 2: Highway Distances & GPS */}
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/70 flex flex-col justify-between">
                <div className="flex items-center space-x-1.5 text-stone-700 font-bold text-[10px] uppercase tracking-wider">
                  <Compass className="w-3 h-3 text-amber-600 shrink-0" />
                  <span>{language === 'kn' ? 'ಸಮೀಪದ ನಗರಗಳು' : 'NEARBY CITIES'}</span>
                </div>
                <div className="mt-1">
                  <p className="text-[10.5px] font-mono font-bold text-neutral-800 leading-tight">
                    Belagavi 28km • Sankeshwar 12km
                  </p>
                  <span className="text-[9.5px] font-mono text-neutral-500 block mt-0.5">
                    GPS: 16.1298° N, 74.5290° E
                  </span>
                </div>
              </div>
            </div>

            {/* Landmark Chips */}
            <div className="flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-[10.5px] font-semibold text-neutral-800 whitespace-nowrap">
                🏛️ {language === 'kn' ? 'ಭವ್ಯ ಮಂಟಪ' : 'Main Pandal'}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-[10.5px] font-semibold text-neutral-800 whitespace-nowrap">
                🍛 {language === 'kn' ? 'ಅನ್ನಪ್ರಸಾದ ಭವನ' : 'Maha Prasada'}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-[10.5px] font-semibold text-neutral-800 whitespace-nowrap">
                🚩 {language === 'kn' ? 'ಮೆರವಣಿಗೆ ಮಾರ್ಗ' : 'Procession'}
              </span>
            </div>

            {/* Social Connectivity Strip: 3 Equal-Width Pills */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100">
              <a
                href={siteConfig.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-1.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white font-bold text-[11px] text-center flex items-center justify-center space-x-1 transition-all active:scale-98 shadow-2xs"
              >
                <Youtube className="w-3.5 h-3.5 shrink-0" />
                <span>YouTube</span>
              </a>

              <a
                href={siteConfig.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-[11px] text-center flex items-center justify-center space-x-1 transition-all active:scale-98 shadow-2xs"
              >
                <Instagram className="w-3.5 h-3.5 shrink-0" />
                <span>Instagram</span>
              </a>

              <a
                href={`mailto:${siteConfig.email}`}
                className="py-2 px-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 font-bold text-[11px] text-center flex items-center justify-center space-x-1 transition-all active:scale-98"
              >
                <Mail className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                <span>Email</span>
              </a>
            </div>
          </div>

          {/* ================= DESKTOP VIEW: ROYAL LOCATION & CONTACT CARD (PRESERVED) ================= */}
          <div className="hidden lg:flex lg:col-span-5 bg-white rounded-2xl border border-amber-200/80 shadow-xs hover:shadow-md transition-all p-6 sm:p-7 flex-col justify-between space-y-6">
            
            <div className="space-y-5">
              {/* Pandal Identity Header */}
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-700 shadow-2xs shrink-0">
                  <MapPin className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className={`text-lg font-bold text-gray-950 leading-tight ${
                    language === 'kn' ? 'font-kannada' : 'font-sans uppercase font-bold'
                  }`}>
                    {language === 'kn' ? 'ಕಡಲಗಿ ಖೂಟ ಗಣೇಶ ಮಂಟಪ' : 'KADALAGI KHOOT PANDAL'}
                  </h3>
                  <p className="text-xs text-amber-800/80 font-sans font-semibold mt-0.5">
                    Yamakanmardi, Hukkeri, Belagavi – 591246
                  </p>
                </div>
              </div>

              {/* Exact Address Box with Copy Button */}
              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-gray-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-sans font-bold text-amber-900 uppercase tracking-wider">
                    {language === 'kn' ? 'ವಿಳಾಸ' : 'ADDRESS'}
                  </span>
                  <button
                    onClick={copyAddress}
                    className="inline-flex items-center space-x-1 text-[11px] font-sans font-semibold text-gray-600 hover:text-amber-700 transition-colors"
                    title="Copy Address"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">{language === 'kn' ? 'ಕಾಪಿ ಆಗಿದೆ' : 'Copied!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-gray-400" />
                        <span>{language === 'kn' ? 'ಕಾಪಿ ಮಾಡಿ' : 'Copy'}</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-sm font-bold text-gray-950 font-sans">
                  {language === 'kn' ? 'ಕಡಲಗಿ ಖೂಟ, ಯಮಕನಮರಡಿ' : 'Kadalagi Khoot, Yamakanmardi'}
                </p>
              </div>

              {/* Location & GPS */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/70">
                  <span className="text-[10px] font-sans font-bold text-gray-400 uppercase tracking-wider block">
                    {language === 'kn' ? 'ಸ್ಥಳ' : 'LOCATION'}
                  </span>
                  <span className="text-xs font-semibold text-gray-900 mt-1 block">
                    {language === 'kn' ? 'ಕಡಲಗಿ ಖೂಟ, ಯಮಕನಮರಡಿ' : 'Kadalagi Khoot, Yamakanmardi'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/70">
                  <span className="text-[10px] font-sans font-bold text-gray-400 uppercase tracking-wider block">
                    {language === 'kn' ? 'ಜಿಪಿಎಸ್ ನಿರ್ದೇಶಾಂಕ' : 'GPS COORDINATES'}
                  </span>
                  <span className="text-xs font-mono font-semibold text-gray-900 mt-1 block">
                    16.1298° N, 74.5290° E
                  </span>
                </div>
              </div>

              {/* Distance from Major Cities */}
              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 flex items-center justify-between text-[11px] font-mono font-bold text-amber-950">
                <span className="flex items-center space-x-1">
                  <span>🚗</span>
                  <span>Belagavi: 28km</span>
                </span>
                <span className="text-amber-300">•</span>
                <span>Sankeshwar: 12km</span>
                <span className="text-amber-300">•</span>
                <span>Hukkeri: 18km</span>
              </div>

              {/* Landmark Chips */}
              <div className="space-y-1.5 text-xs font-sans">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  {language === 'kn' ? 'ಪ್ರಮುಖ ತಾಣಗಳು' : 'KEY FESTIVAL LANDMARKS'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-[11px] font-semibold text-neutral-800">
                    🏛️ {language === 'kn' ? 'ಭವ್ಯ ಮಂಟಪ' : 'Main Pandal'}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-[11px] font-semibold text-neutral-800">
                    🍛 {language === 'kn' ? 'ಅನ್ನಪ್ರಸಾದ ಭವನ' : 'Maha Prasada Hall'}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-[11px] font-semibold text-neutral-800">
                    🚩 {language === 'kn' ? 'ಮೆರವಣಿಗೆ ಮಾರ್ಗ' : 'Procession Route'}
                  </span>
                </div>
              </div>

              {/* Visiting Hours Pill */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-start space-x-3">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs font-sans">
                  <p className="font-bold text-amber-950 uppercase">{t.common.visitingHours}</p>
                  <p className="text-amber-900 font-medium mt-0.5">{t.common.visitingTime}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons: Directions, Instagram, Email */}
            <div className="space-y-2.5 pt-2 border-t border-gray-100">
              <a
                href={siteConfig.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-full bg-gray-950 text-white font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center space-x-2 hover:bg-black hover:ring-2 hover:ring-amber-400/40 shadow-xs transition-all group"
              >
                <Navigation className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                <span>{language === 'kn' ? 'ಗೂಗಲ್ ಮ್ಯಾಪ್ಸ್‌ನಲ್ಲಿ ತೆರೆಯಿರಿ' : 'OPEN IN GOOGLE MAPS'}</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </a>

              <div className="grid grid-cols-3 gap-2">
                <a
                  href={siteConfig.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-2 rounded-full bg-[#FF0000] hover:bg-[#d90000] text-white font-bold text-xs text-center flex items-center justify-center space-x-1 shadow-2xs transition-colors"
                >
                  <Youtube className="w-3.5 h-3.5 shrink-0" />
                  <span>YouTube</span>
                </a>

                <a
                  href={siteConfig.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-2 rounded-full bg-[#E1306C] hover:bg-[#c22058] text-white font-bold text-xs text-center flex items-center justify-center space-x-1 shadow-2xs transition-colors"
                >
                  <Instagram className="w-3.5 h-3.5 shrink-0" />
                  <span>Instagram</span>
                </a>

                <a
                  href={`mailto:${siteConfig.email}`}
                  className="py-2.5 px-2 rounded-full bg-white border border-gray-300 text-gray-800 hover:border-black font-bold text-xs text-center flex items-center justify-center space-x-1 shadow-2xs transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <span>Email</span>
                </a>
              </div>

              {/* Complete Official Email Display */}
              <div className="pt-1 text-center">
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="inline-flex items-center space-x-1.5 text-[11px] font-sans font-medium text-gray-600 hover:text-black transition-colors break-all"
                >
                  <Mail className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{siteConfig.email}</span>
                </a>
              </div>
            </div>

          </div>

          {/* ================= RIGHT COLUMN: LIVE INTERACTIVE MAP WITH SATELLITE & STREET VIEW ================= */}
          <div className="lg:col-span-7 flex flex-col rounded-2xl overflow-hidden border border-amber-300/80 shadow-md bg-neutral-900 min-h-[460px] relative">
            
            {/* Map Mode Controller Toolbar (Top Bar) */}
            <div className="bg-gray-950/95 backdrop-blur-md p-2 sm:p-3 border-b border-white/10 flex items-center justify-between flex-wrap gap-2 z-20">
              {/* Mode Switcher Tabs */}
              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start rounded-xl bg-black/60 p-1 border border-white/10 overflow-x-auto no-scrollbar gap-1">
                <button
                  onClick={() => setViewMode('satellite')}
                  className={`flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer whitespace-nowrap ${
                    viewMode === 'satellite'
                      ? 'bg-amber-500 text-black shadow-xs'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 shrink-0" />
                  <span className="sm:hidden">{language === 'kn' ? 'ಉಪಗ್ರಹ' : 'Satellite'}</span>
                  <span className="hidden sm:inline">{language === 'kn' ? 'ಉಪಗ್ರಹ ನೋಟ (Satellite)' : 'Satellite'}</span>
                </button>

                <button
                  onClick={() => setViewMode('roadmap')}
                  className={`flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer whitespace-nowrap ${
                    viewMode === 'roadmap'
                      ? 'bg-amber-500 text-black shadow-xs'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 shrink-0" />
                  <span className="sm:hidden">{language === 'kn' ? 'ನಕ್ಷೆ' : 'Map'}</span>
                  <span className="hidden sm:inline">{language === 'kn' ? 'ರಸ್ತೆ ನಕ್ಷೆ (Roadmap)' : 'Roadmap'}</span>
                </button>

                <button
                  onClick={() => setViewMode('streetview')}
                  className={`flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer whitespace-nowrap ${
                    viewMode === 'streetview'
                      ? 'bg-amber-500 text-black shadow-xs'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 shrink-0" />
                  <span className="sm:hidden">{language === 'kn' ? '360° ನೋಟ' : '360° View'}</span>
                  <span className="hidden sm:inline">{language === 'kn' ? 'ರಸ್ತೆ ನೋಟ (Street View)' : 'Street View'}</span>
                </button>
              </div>

              {/* External Fullscreen Launcher */}
              <a
                href={viewMode === 'satellite' ? directSatelliteUrl : viewMode === 'streetview' ? directStreetViewUrl : siteConfig.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-mono font-bold text-amber-400 hover:text-amber-300 transition-colors px-2.5 py-1 rounded-lg bg-white/5 border border-white/10"
              >
                <span>Google Maps ↗</span>
              </a>
            </div>

            {/* Map Frame Container */}
            <div className="relative flex-1 w-full min-h-[380px] bg-neutral-900">
              {viewMode === 'satellite' && (
                <iframe
                  title="Chanakya Yuvak Mandal Satellite Imagery"
                  src={satelliteEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 w-full h-full"
                />
              )}

              {viewMode === 'roadmap' && (
                <iframe
                  title="Chanakya Yuvak Mandal Roadmap"
                  src={roadmapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 w-full h-full"
                />
              )}

              {viewMode === 'streetview' && (
                <div className="absolute inset-0 w-full h-full flex flex-col">
                  {/* Street View iframe embed */}
                  <iframe
                    title="Chanakya Yuvak Mandal Street View"
                    src={streetViewEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    className="flex-1 w-full h-full"
                  />
                  
                  {/* Floating Action Hint Overlay */}
                  <div className="absolute bottom-3 inset-x-3 sm:inset-x-6 z-10 p-3 rounded-xl bg-black/85 backdrop-blur-md border border-amber-400/40 flex items-center justify-between gap-3 text-white">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-sans font-semibold">
                        {language === 'kn' ? 'ಕಡಲಗಿ ಖೂಟ ಮಂಟಪ ಮಾರ್ಗದ 360° ರಸ್ತೆ ನೋಟ' : '360° Street View & Pandal Approach'}
                      </span>
                    </div>

                    <a
                      href={directStreetViewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shrink-0 transition-colors flex items-center space-x-1"
                    >
                      <span>360° Fullscreen</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* Floating Bottom Watermark Indicator */}
              <div className="absolute top-3 right-3 pointer-events-none z-10">
                <span className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-white font-mono text-[10px] font-bold">
                  📍 Kadalagi Khoot, Yamakanmardi
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
