import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Calendar,
  Check,
  Layers,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { subscribeToHistory, HistoryMilestoneDoc } from '../../services/historyService';
import { SacredGeometryOverlay } from '../common/SacredGeometryOverlay';

export const QuickTimeline: React.FC = () => {
  const { language } = useLanguage();
  const [historyItems, setHistoryItems] = useState<HistoryMilestoneDoc[]>([]);

  // Mobile Archive Dropdown & Expansion state
  const [selectedPastYear, setSelectedPastYear] = useState<number>(2024);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isExpandedAll, setIsExpandedAll] = useState<boolean>(false);

  useEffect(() => {
    const unsub = subscribeToHistory((data) => {
      setHistoryItems(data.filter((item) => item.isActive !== false));
    });
    return () => unsub();
  }, []);

  // Built-in foundational festival milestone cards (2026 down to 2019 founding)
  const defaultMilestones: HistoryMilestoneDoc[] = [
    {
      id: 'default-2026',
      year: 2026,
      titleEn: '8th Annual Royal Ganesh Mahotsav 2026',
      titleKn: '೮ನೇ ವಾರ್ಷಿಕ ಭವ್ಯ ಶ್ರೀ ಗಣೇಶ ಮಹೋತ್ಸವ ೨೦೨೬',
      pandalThemeEn: 'Hoysala Belur Heritage Architecture & Royal Darbar',
      pandalThemeKn: 'ಹೊಯ್ಸಳ ಬೇಲೂರು-ಹಳೇಬೀಡು ಶಿಲ್ಪಕಲಾ ಶೈಲಿಯ ಐತಿಹಾಸಿಕ ಮಂಟಪ',
      summaryEn:
        'Celebrating 8 continuous years of youth devotion, rural empowerment, and an all-new grand temple durbar pandal welcoming devotees from across Belagavi.',
      summaryKn:
        'ಯುವಕರ ಭಕ್ತಿ ಪರಂಪರೆ, ಗ್ರಾಮೀಣ ಸಬಲೀಕರಣ ಹಾಗೂ ಬೆಳಗಾವಿ ಜಿಲ್ಲೆಯ ಭಕ್ತರನ್ನು ಸ್ವಾಗತಿಸುವ ನೂತನ ರಾಜ ದರ್ಬಾರ್ ಮಂಟಪದೊಂದಿಗೆ ಆಚರಿಸಲಾಗುತ್ತಿರುವ 8ನೇ ವರ್ಷದ ಸಂಭ್ರಮ.',
      coverImage: '/assets/images/hero_group_darshan.jpg',
      highlightsEn: ['8th Annual Edition', '12-foot Sacred Murti', '5-Day Maha Annasantarpane'],
      highlightsKn: ['೮ನೇ ವರ್ಷದ ಸಂಭ್ರಮ', 'ರಾಜವೈಭವದ ೧೨ ಅಡಿ ಮೂರ್ತಿ', '೫ ದಿನಗಳ ಮಹಾ ಅನ್ನಸಂತರ್ಪಣೆ'],
      isActive: true,
    },
    {
      id: 'default-2025',
      year: 2025,
      titleEn: '7th Grand Royal Ganesh Mahotsav',
      titleKn: '೭ನೇ ವರ್ಷದ ಭವ್ಯ ಶ್ರೀ ಗಣೇಶ ಮಹೋತ್ಸವ',
      pandalThemeEn: 'Golden Mandir Architecture & Maha Prasad Dasoha for 5,000+ devotees',
      pandalThemeKn: 'ಸುವರ್ಣ ಮಂದಿರ ಕಲಾಕೃತಿ & ೫೦೦೦ಕ್ಕೂ ಹೆಚ್ಚು ಭಕ್ತರಿಗೆ ಮಹಾ ಅನ್ನಪ್ರಸಾದ ದಾಸೋಹ',
      summaryEn: 'Celebrated with historic devotion, grand cultural programs, and youth unity.',
      summaryKn: 'ಅದ್ಭುತ ಸಾಂಸ್ಕೃತಿಕ ಕಾರ್ಯಕ್ರಮಗಳು ಮತ್ತು ಗ್ರಾಮದ ಸೌಹಾರ್ದತೆಯೊಂದಿಗೆ ಸಂಭ್ರಮ.',
      coverImage: '/assets/images/hero_group_darshan.jpg',
      highlightsEn: ['Eco-Friendly Clay Murti', '5,000+ Devotee Feast', 'Grand Nashik Dhol Procession'],
      highlightsKn: ['ಪವಿತ್ರ ಮೃತ್ತಿಕಾ ಗಣೇಶ', 'ಅನ್ನಪ್ರಸಾದ ದಾಸೋಹ', 'ಭವ್ಯ ನಾಸಿಕ್ ಡೋಲ್ ಮೆರವಣಿಗೆ'],
      isActive: true,
    },
    {
      id: 'default-2024',
      year: 2024,
      titleEn: '6th Annual Cultural Utsav',
      titleKn: '೬ನೇ ವರ್ಷದ ಸಾಂಸ್ಕೃತಿಕ ಗಣೇಶೋತ್ಸವ',
      pandalThemeEn: 'Ancient Karnataka Temple Splendor & Folk Music',
      pandalThemeKn: 'ಪುರಾತನ ಕರ್ನಾಟಕ ದೇವಾಲಯ ಶೈಲಿ & ಸಾಂಪ್ರದಾಯಿಕ ಜಾನಪದ ಕಲಾ ವೈಭವ',
      summaryEn: 'A magnificent spiritual confluence featuring regional artists and community feasts.',
      summaryKn: 'ಗ್ರಾಮದ ಯುವಕರು ಮತ್ತು ಹಿರಿಯರು ಒಗ್ಗೂಡಿ ನಡೆಸಿದ ಭಕ್ತಿಪೂರ್ವಕ ಸೇವಾ ಮಹೋತ್ಸವ.',
      coverImage: '/assets/images/hero_committee_group.jpg',
      highlightsEn: ['Traditional Pooja', 'Bhajan Sandhya', 'Youth Volunteer Seva'],
      highlightsKn: ['ಪಾರಂಪರಿಕ ಮಹಾಪೂಜೆ', 'ಭಜನಾ ಸಂಧ್ಯೆ', 'ಯುವ ಸ್ವಯಂಸೇವಕರ ಶ್ರಮದಾನ'],
      isActive: true,
    },
    {
      id: 'default-2023',
      year: 2023,
      titleEn: '5th Milestone Silver Celebrations',
      titleKn: '೫ನೇ ವರ್ಷದ ಮೈಲಿಗಲ್ಲು ಪಂಚಮೋತ್ಸವ',
      pandalThemeEn: 'Royal Darbar Theme & Public Welfare Drives',
      pandalThemeKn: 'ರಾಜದರ್ಬಾರ್ ಕಲಾ ಮಂಟಪ & ಸಾರ್ವಜನಿಕ ಸಮಾಜಮುಖಿ ಸೇವಾ ಕಾರ್ಯಗಳು',
      summaryEn: 'Completed 5 glorious years of selfless cultural seva at Kadalagi Khoot.',
      summaryKn: 'ಕಡಲಗಿ ಖೂಟದಲ್ಲಿ ೫ ವರ್ಷಗಳ ಸಾರ್ಥಕ ಧಾರ್ಮಿಕ ಮತ್ತು ಸಾಮಾಜಿಕ ಸೇವಾ ಪಯಣ.',
      coverImage: '/assets/images/hero_committee_clean.jpg',
      highlightsEn: ['Silver Milestone', 'Social Seva', 'Village Unity'],
      highlightsKn: ['೫ನೇ ವರ್ಷದ ಸಂಭ್ರಮ', 'ಸಮಾಜಮುಖಿ ಸೇವೆ', 'ಗ್ರಾಮ ಸೌಹಾರ್ದತೆ'],
      isActive: true,
    },
    {
      id: 'default-2022',
      year: 2022,
      titleEn: '4th Year: Festive Resurgence & Unity',
      titleKn: '೪ನೇ ವರ್ಷದ ನವ ಚೈತನ್ಯದ ಗಣೇಶೋತ್ಸವ',
      pandalThemeEn: 'Traditional Wooden Carvings & Natural Floral Mantapa',
      pandalThemeKn: 'ಸಾಂಪ್ರದಾಯಿಕ ಮರದ ಕೆತ್ತನೆ ಹಾಗೂ ನೈಸರ್ಗಿಕ ಪುಷ್ಪ ಮಂಟಪ',
      summaryEn: 'Resuming full-scale public celebrations post-pandemic with heartfelt devotion.',
      summaryKn: 'ಸಂಕಷ್ಟದ ನಂತರ ಗ್ರಾಮಸ್ಥರೆಲ್ಲರೂ ಒಗ್ಗೂಡಿ ನವೋತ್ಸಾಹದಿಂದ ಆಚರಿಸಿದ ಅದ್ಭುತ ಗಣೇಶೋತ್ಸವ ಸಂಭ್ರಮ.',
      coverImage: '/assets/images/hero_group_darshan.jpg',
      highlightsEn: ['Bal Ganesha Murti', 'Satyanarayana Pooja', 'Rural Folk Dance'],
      highlightsKn: ['ಬಾಲ ಗಣಪತಿ ಮೂರ್ತಿ', 'ಸತ್ಯನಾರಾಯಣ ಪೂಜೆ', 'ಜಾನಪದ ನೃತ್ಯ ವೈಭವ'],
      isActive: true,
    },
    {
      id: 'default-2021',
      year: 2021,
      titleEn: '3rd Year: Resilient Devotion & Seva',
      titleKn: '೩ನೇ ವರ್ಷದ ಸೇವಾ ಸಮರ್ಪಿತ ಉತ್ಸವ',
      pandalThemeEn: 'Serene Vedic Prayer Hall with Tulsi & Diya Decor',
      pandalThemeKn: 'ಪವಿತ್ರ ತುಳಸಿ ಹಾಗೂ ನಂದಾದೀಪಗಳಿಂದ ಶೋಭಿಸಿದ ಸರಳ ವೈದಿಕ ಪ್ರಾರ್ಥನಾ ಮಂದಿರ',
      summaryEn: 'Conducted with solemn devotion prioritizing community health assistance and food kits.',
      summaryKn: 'ಗ್ರಾಮಸ್ಥರ ಆರೋಗ್ಯ ಮತ್ತು ಸಂಕಷ್ಟದಲ್ಲಿರುವವರಿಗೆ ನೆರವು ನೀಡುವುದಕ್ಕೆ ಹೆಚ್ಚಿನ ಆದ್ಯತೆ ನೀಡಲಾಯಿತು.',
      coverImage: '/assets/images/hero_committee_group.jpg',
      highlightsEn: ['Health Protocols', 'Prasad Distribution', 'Atharvashirsha Chanting'],
      highlightsKn: ['ಆರೋಗ್ಯ ನೆರವು', 'ಪ್ರಸಾದ ವಿತರಣೆ', 'ಅಥರ್ವಶೀರ್ಷ ಪಾರಾಯಣ'],
      isActive: true,
    },
    {
      id: 'default-2020',
      year: 2020,
      titleEn: '2nd Year: The Flame of Faith Kept Alive',
      titleKn: '೨ನೇ ವರ್ಷ: ಭಕ್ತಿಯ ದಿವ್ಯಜ್ಯೋತಿ',
      pandalThemeEn: 'Chhatrapati Shivaji Maharaj Fort Darbar Miniature',
      pandalThemeKn: 'ಛತ್ರಪತಿ ಶಿವಾಜಿ ಮಹಾರಾಜರ ಕೋಟೆ ದರ್ಬಾರ್ ಕಿರು ಮಾದರಿ',
      summaryEn: 'Daily morning-evening aartis ensuring sacred continuity at Kadalagi Khoot.',
      summaryKn: 'ಕಠಿಣ ಸನ್ನಿವೇಶದಲ್ಲೂ ಗಣಪತಿಯ ಪೂಜೆಯನ್ನು ನಿಲ್ಲಿಸದೆ, ನಿತ್ಯ ಮುಂಜಾನೆ-ಸಂಜೆ ಮಹಾಮಂಗಳಾರತಿ ನಡೆಸಿ ಭಕ್ತಿಯ ದೀಪ ಪ್ರಜ್ವಲಿಸಲಾಯಿತು.',
      coverImage: '/assets/images/hero_committee_clean.jpg',
      highlightsEn: ['Daily Mangalaarti', 'Live Stream for Devotees', 'Shanti Homa'],
      highlightsKn: ['ನಿತ್ಯ ಮಹಾಮಂಗಳಾರತಿ', 'ನೇರ ಪ್ರಸಾರ ಸೇವೆ', 'ಶಾಂತಿ ಹೋಮ'],
      isActive: true,
    },
    {
      id: 'default-2019',
      year: 2019,
      titleEn: 'The Historic Genesis at Kadalagi Khoot',
      titleKn: 'ಕಡಲಗಿ ಖೂಟದಲ್ಲಿ ಐತಿಹಾಸಿಕ ಸ್ಥಾಪನೆ',
      pandalThemeEn: 'Founding Year of Chanakya Yuvak Mandal',
      pandalThemeKn: 'ಚಾಣಕ್ಯ ಯುವಕ ಮಂಡಳದ ಪ್ರಥಮ ವರ್ಷದ ಪಾದಾರ್ಪಣೆ',
      summaryEn: 'Village youth united with a solemn pledge for cultural preservation and seva.',
      summaryKn: 'ಗ್ರಾಮದ ಧಾರ್ಮಿಕ ಪರಂಪರೆ ಮತ್ತು ಯುವ ಶಕ್ತಿಯ ಒಗ್ಗಟ್ಟಿಗಾಗಿ ಸ್ಥಾಪನೆಗೊಂಡ ಮಂಡಳ.',
      coverImage: '/assets/logo_transparent.png',
      highlightsEn: ['Inaugural Festival', 'Clay Idol Tradition', 'Unity Pledge'],
      highlightsKn: ['ಪ್ರಥಮ ವರ್ಷದ ಉತ್ಸವ', 'ಮೃತ್ತಿಕಾ ಗಣಪತಿ', 'ಸೌಹಾರ್ದ ಪ್ರತಿಜ್ಞೆ'],
      isActive: true,
    },
  ];

  // Prioritize live Firestore items, fallback to default milestones
  const activeMilestones = historyItems.length > 0 ? historyItems : defaultMilestones;

  // Desktop shows top 5 milestones
  const desktopMilestones = activeMilestones.slice(0, 5);

  // Mobile shows strictly the 2 latest milestones, remainder in interactive dropdown / archive
  const latestMilestones = activeMilestones.slice(0, 2);
  const pastMilestones = activeMilestones.slice(2);

  const selectedPastMilestone =
    pastMilestones.find((m) => m.year === selectedPastYear) || pastMilestones[0] || activeMilestones[0];

  const getEditionLabel = (year: number, lang: string) => {
    const edition = year - 2019 + 1;
    if (edition === 1) {
      return lang === 'kn' ? '೧ನೇ ವರ್ಷದ ಸ್ಥಾಪನೆ' : '1st Foundation Year';
    }
    return lang === 'kn' ? `${edition}ನೇ ವರ್ಷದ ಉತ್ಸವ` : `${edition}th Edition`;
  };

  return (
    <section className="py-10 sm:py-20 bg-gradient-to-b from-[#FBF9F5] via-white to-[#F5F2EB] border-b border-amber-900/10 relative overflow-hidden">
      {/* Helix Style Slow Rotating Sacred Yantra in Background */}
      <SacredGeometryOverlay className="absolute -top-32 -right-32" size={600} opacity={0.06} />
      <SacredGeometryOverlay className="absolute -bottom-32 -left-32" size={550} opacity={0.05} />

      {/* Decorative Warm Ambient Glows */}
      <div className="absolute top-10 right-0 w-96 h-96 bg-amber-400/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-amber-500/6 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ================= SECTION HEADER ================= */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-5 sm:pb-6 mb-5 sm:mb-8 gap-4 border-b border-amber-200/80">
          <div>
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center space-x-2 text-xs font-sans font-bold tracking-wider text-amber-950 bg-gradient-to-r from-amber-500/15 to-amber-400/25 border border-amber-400/40 px-3.5 py-1 rounded-full uppercase mb-2.5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{language === 'kn' ? '2019 – 2026 ಇತಿಹಾಸ ಸಂಗ್ರಹ' : '2019 – 2026 FESTIVAL ARCHIVE'}</span>
            </div>

            {/* Main Headline */}
            <h2
              className={`text-neutral-950 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-snug ${
                language === 'kn' ? 'font-kannada' : 'font-sans'
              }`}
            >
              {language === 'kn' ? (
                <span>
                  ಉತ್ಸವದ ಹೆಜ್ಜೆಗುರುತುಗಳು & <span className="text-[#D48B00]">ಇತಿಹಾಸ</span>
                </span>
              ) : (
                <span>
                  FESTIVAL MILESTONES & <span className="text-[#D48B00]">HISTORY</span>
                </span>
              )}
            </h2>

            <p className="text-xs sm:text-sm text-neutral-600 font-sans mt-1">
              {language === 'kn'
                ? '2019 ರಿಂದ 2026 ರವರೆಗೆ ಪ್ರಾರಂಭವಾದ ಶ್ರೀ ಗಣೇಶ ಮಹೋತ್ಸವದ ಸುವರ್ಣ ಮೈಲಿಗಲ್ಲುಗಳು'
                : 'Key historical milestones and seva accomplishments from 2019 to 2026 in Yamakanmardi.'}
            </p>
          </div>

          {/* View All Full Timeline Button */}
          <Link
            to="/history"
            className="inline-flex items-center space-x-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-neutral-950 text-white hover:bg-neutral-900 hover:ring-2 hover:ring-amber-400/50 transition-all font-bold text-xs uppercase tracking-wider shadow-sm hover:shadow-md shrink-0 self-start sm:self-auto group cursor-pointer"
          >
            <span>{language === 'kn' ? 'ಸಂಪೂರ್ಣ ಇತಿಹಾಸ ನೋಡಿ' : 'VIEW FULL TIMELINE'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* ==================== MOBILE VIEW (EXCLUSIVELY LG:HIDDEN) ================ */}
        {/* ========================================================================= */}
        <div className="lg:hidden space-y-3.5">
          {/* 1. TOP 2 LATEST MILESTONE CARDS */}
          <div className="space-y-3">
            {latestMilestones.map((item) => {
              const edition = getEditionLabel(item.year, language);
              const is2026 = item.year === 2026;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border p-4 transition-all relative overflow-hidden shadow-2xs ${
                    is2026
                      ? 'border-amber-400 ring-2 ring-amber-400/25'
                      : 'border-amber-200/90'
                  }`}
                >
                  {/* Subtle top gold accent glint */}
                  <div
                    className={`absolute top-0 inset-x-0 h-[2px] ${
                      is2026
                        ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300'
                        : 'bg-amber-300/40'
                    }`}
                  />

                  {/* Top Bar: Edition & Status Stamp */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[9.5px] font-sans font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        is2026
                          ? 'bg-amber-400 text-neutral-950 font-black'
                          : 'text-amber-950 bg-amber-500/15 border border-amber-400/30'
                      }`}
                    >
                      {edition}
                    </span>

                    {is2026 && (
                      <span className="text-[9px] font-mono font-extrabold uppercase tracking-wider text-amber-900 bg-amber-400/30 border border-amber-400 px-2 py-0.5 rounded-full flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
                        <span>{language === 'kn' ? 'ನೂತನ' : 'NEW'}</span>
                      </span>
                    )}
                  </div>

                  {/* Big Year Stamp */}
                  <div className="flex items-baseline space-x-1.5 mb-1.5">
                    <span className="text-2xl font-black font-sans text-neutral-950">
                      {item.year}
                    </span>
                    <span className="text-xs text-amber-600 font-bold">🚩</span>
                  </div>

                  {/* Title */}
                  <h3
                    className={`text-sm font-bold text-neutral-900 leading-snug mb-1.5 ${
                      language === 'kn' ? 'font-kannada' : 'font-sans'
                    }`}
                  >
                    {language === 'kn' ? item.titleKn : item.titleEn}
                  </h3>

                  {/* Theme / Description */}
                  {(item.pandalThemeKn || item.pandalThemeEn) && (
                    <p className="text-xs text-neutral-600 font-sans line-clamp-2 leading-relaxed mb-3">
                      {language === 'kn' ? item.pandalThemeKn : item.pandalThemeEn}
                    </p>
                  )}

                  {/* Card Action Link */}
                  <div className="pt-2 border-t border-amber-100 flex items-center justify-between">
                    <Link
                      to={`/history/${item.year}`}
                      className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors"
                    >
                      <span>
                        {language === 'kn' ? 'ಪೂರ್ಣ ವಿವರ ನೋಡಿ' : 'Explore Full Details'}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2. MOBILE ARCHIVE DROPDOWN & PREVIEW PANEL */}
          {pastMilestones.length > 0 && (
            <div className="bg-white rounded-2xl border border-amber-200/90 shadow-[0_4px_25px_rgba(0,0,0,0.04)] p-4 relative overflow-hidden space-y-3.5">
              {/* Top Hairline Glint */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300" />

              {/* Dropdown Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-700 shadow-2xs shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider leading-tight">
                      {language === 'kn' ? 'ಹಿಂದಿನ ಉತ್ಸವಗಳ ಸಂಗ್ರಹ' : 'PAST EDITIONS ARCHIVE'}
                    </h4>
                    <p className="text-[10px] text-neutral-500 font-sans">
                      {language === 'kn'
                        ? '2024 ರಿಂದ 2019 ರವರೆಗಿನ ದಾಖಲೆಗಳು'
                        : 'Editions from 2024 down to 2019'}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-full shrink-0">
                  {pastMilestones.length} {language === 'kn' ? 'ವರ್ಷಗಳು' : 'Years'}
                </span>
              </div>

              {/* Interactive Dropdown Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-50/80 to-white hover:bg-amber-50 border border-amber-300/80 active:scale-[0.99] transition-all shadow-2xs text-left"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                    <div className="truncate">
                      <span className="text-xs font-black text-neutral-900">
                        {selectedPastMilestone.year}
                      </span>
                      <span className="text-[11px] text-neutral-600 font-medium ml-1.5 truncate">
                        • {getEditionLabel(selectedPastMilestone.year, language)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                    <span className="text-[10px] font-bold text-amber-800">
                      {language === 'kn' ? 'ಬದಲಾಯಿಸಿ ▾' : 'Change ▾'}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-amber-800 transition-transform duration-300 ${
                        isDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Dropdown Menu Modal / Sheet */}
                {isDropdownOpen && (
                  <>
                    {/* Backdrop for outside click */}
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsDropdownOpen(false)}
                    />

                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-amber-300 rounded-xl shadow-xl z-40 p-1.5 space-y-1 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-2.5 py-1 text-[10px] font-bold text-amber-900/70 uppercase tracking-wider border-b border-amber-100 flex items-center justify-between">
                        <span>{language === 'kn' ? 'ವರ್ಷ ಆಯ್ಕೆ ಮಾಡಿ' : 'SELECT EDITION'}</span>
                        <span className="font-mono text-[9px]">2024 – 2019</span>
                      </div>

                      {pastMilestones.map((pastItem) => {
                        const isSelected = pastItem.year === selectedPastMilestone.year;
                        const editionLabel = getEditionLabel(pastItem.year, language);

                        return (
                          <button
                            key={pastItem.id}
                            type="button"
                            onClick={() => {
                              setSelectedPastYear(pastItem.year);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all ${
                              isSelected
                                ? 'bg-amber-500 text-white font-bold shadow-2xs'
                                : 'hover:bg-amber-50 text-neutral-800 border border-transparent hover:border-amber-200/60'
                            }`}
                          >
                            <div className="flex items-center space-x-2 min-w-0">
                              <span
                                className={`font-mono text-xs font-bold ${
                                  isSelected ? 'text-white' : 'text-neutral-900'
                                }`}
                              >
                                {pastItem.year}
                              </span>
                              <span
                                className={`text-xs truncate max-w-[170px] ${
                                  isSelected ? 'text-amber-50' : 'text-neutral-700'
                                }`}
                              >
                                {language === 'kn' ? pastItem.titleKn : pastItem.titleEn}
                              </span>
                            </div>

                            <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                              <span
                                className={`text-[9.5px] font-bold ${
                                  isSelected ? 'text-white' : 'text-neutral-500'
                                }`}
                              >
                                {editionLabel}
                              </span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Selected Year Summary Card (Shown when not expanded all) */}
              {!isExpandedAll && (
                <div className="bg-gradient-to-br from-amber-50/40 via-white to-amber-50/20 border border-amber-200/80 rounded-xl p-3.5 space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] font-bold text-amber-950 bg-amber-500/15 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                      {getEditionLabel(selectedPastMilestone.year, language)}
                    </span>

                    <span className="text-base font-black font-sans text-neutral-950 flex items-center space-x-1">
                      <span>{selectedPastMilestone.year}</span>
                      <span className="text-xs text-amber-600">🚩</span>
                    </span>
                  </div>

                  <h5
                    className={`text-xs sm:text-sm font-bold text-neutral-900 leading-snug ${
                      language === 'kn' ? 'font-kannada' : 'font-sans'
                    }`}
                  >
                    {language === 'kn'
                      ? selectedPastMilestone.titleKn
                      : selectedPastMilestone.titleEn}
                  </h5>

                  {(selectedPastMilestone.pandalThemeKn ||
                    selectedPastMilestone.pandalThemeEn) && (
                    <p className="text-[11px] text-neutral-600 line-clamp-2 leading-relaxed">
                      {language === 'kn'
                        ? selectedPastMilestone.pandalThemeKn
                        : selectedPastMilestone.pandalThemeEn}
                    </p>
                  )}

                  <div className="pt-2 border-t border-amber-100 flex items-center justify-between">
                    <Link
                      to={`/history/${selectedPastMilestone.year}`}
                      className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors"
                    >
                      <span>
                        {language === 'kn'
                          ? `${selectedPastMilestone.year}ರ ಪೂರ್ಣ ವಿವರ ನೋಡಿ`
                          : `View ${selectedPastMilestone.year} Details`}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}

              {/* Expanded All Past Cards Inline (When user taps "Expand All") */}
              {isExpandedAll && (
                <div className="space-y-2.5 pt-1 animate-in fade-in duration-200">
                  {pastMilestones.map((pastItem) => (
                    <div
                      key={pastItem.id}
                      className="bg-white border border-amber-200/80 rounded-xl p-3 hover:border-amber-400 transition-all shadow-2xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9.5px] font-bold text-amber-950 bg-amber-500/15 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                          {getEditionLabel(pastItem.year, language)}
                        </span>
                        <span className="text-sm font-black font-sans text-neutral-950">
                          {pastItem.year} 🚩
                        </span>
                      </div>

                      <h5
                        className={`text-xs font-bold text-neutral-900 mb-1 leading-snug ${
                          language === 'kn' ? 'font-kannada' : 'font-sans'
                        }`}
                      >
                        {language === 'kn' ? pastItem.titleKn : pastItem.titleEn}
                      </h5>

                      {(pastItem.pandalThemeKn || pastItem.pandalThemeEn) && (
                        <p className="text-[11px] text-neutral-600 line-clamp-2 leading-relaxed mb-2">
                          {language === 'kn' ? pastItem.pandalThemeKn : pastItem.pandalThemeEn}
                        </p>
                      )}

                      <div className="pt-1.5 border-t border-amber-100 flex items-center justify-between text-[11px] font-bold text-amber-700">
                        <Link
                          to={`/history/${pastItem.year}`}
                          className="inline-flex items-center space-x-1 hover:underline"
                        >
                          <span>{language === 'kn' ? 'ವಿವರ ನೋಡಿ' : 'Details'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Bottom Dual Action Buttons */}
              <div className="pt-1 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsExpandedAll(!isExpandedAll)}
                  className="py-2 px-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-[10.5px] text-center flex items-center justify-center space-x-1.5 transition-all active:scale-98"
                >
                  <Layers className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                  <span className="truncate">
                    {isExpandedAll
                      ? language === 'kn'
                        ? '▴ ಕಡಿಮೆ ತೋರಿಸಿ'
                        : '▴ Show Less'
                      : language === 'kn'
                      ? `▾ ಎಲ್ಲಾ (${pastMilestones.length}) ವರ್ಷ`
                      : `▾ Expand (${pastMilestones.length})`}
                  </span>
                </button>

                <Link
                  to="/history"
                  className="py-2 px-2 rounded-xl bg-neutral-950 hover:bg-neutral-900 text-white font-bold text-[10.5px] text-center flex items-center justify-center space-x-1.5 transition-all active:scale-98 shadow-2xs"
                >
                  <span className="truncate">
                    {language === 'kn' ? 'ಸಂಪೂರ್ಣ ಇತಿಹಾಸ' : 'All History'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* ==================== DESKTOP VIEW (EXCLUSIVELY HIDDEN LG:BLOCK) ========= */}
        {/* ========================================================================= */}
        <div className="hidden lg:block">
          {/* Glowing Trajectory Track (2026 to 2019) */}
          <div className="flex items-center justify-between mb-8 px-4 relative">
            <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300 z-0" />
            {desktopMilestones.map((m) => (
              <div key={m.id} className="relative z-10 flex flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-white border-2 border-amber-500 shadow-md flex items-center justify-center">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      m.year === 2026 ? 'bg-amber-500 animate-ping' : 'bg-amber-500'
                    }`}
                  />
                </div>
                <span className="mt-1.5 text-[10px] font-mono font-bold text-amber-950 uppercase tracking-wider bg-white/95 px-2.5 py-0.5 rounded-full shadow-2xs border border-amber-200/60">
                  {m.year}
                </span>
              </div>
            ))}
          </div>

          {/* 5 ORA-Style Chapter Milestone Cards */}
          <div className="grid grid-cols-5 gap-4">
            {desktopMilestones.map((item) => {
              const edition = getEditionLabel(item.year, language);
              const is2026 = item.year === 2026;

              return (
                <Link
                  key={item.id}
                  to={`/history/${item.year}`}
                  className={`group relative bg-white border rounded-2xl p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden shadow-2xs ${
                    is2026
                      ? 'border-amber-400 ring-2 ring-amber-400/30'
                      : 'border-amber-200/90 hover:border-amber-400'
                  }`}
                >
                  {/* Subtle Radial Glow */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(229,168,18,0.14)_0%,transparent_70%)] pointer-events-none" />

                  <div>
                    {/* Top Bar: Edition & Status Stamp */}
                    <div className="flex items-center justify-between mb-2.5 relative z-10">
                      <span
                        className={`text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          is2026
                            ? 'bg-amber-400 text-neutral-950 font-black'
                            : 'text-amber-950 bg-amber-500/15 border border-amber-400/30'
                        }`}
                      >
                        {edition}
                      </span>

                      {is2026 && (
                        <span className="text-[8.5px] font-mono font-extrabold uppercase tracking-wider text-amber-900 bg-amber-400/30 border border-amber-400 px-1.5 py-0.5 rounded-full">
                          {language === 'kn' ? 'ನೂತನ' : 'NEW'}
                        </span>
                      )}
                    </div>

                    {/* Big Year Watermark / Badge */}
                    <div className="flex items-baseline space-x-1 mb-1.5 relative z-10">
                      <span className="text-xl sm:text-2xl font-black font-sans text-neutral-950 group-hover:text-amber-600 transition-colors">
                        {item.year}
                      </span>
                      <span className="text-xs text-amber-600 font-bold">🚩</span>
                    </div>

                    {/* Title */}
                    <h3
                      className={`text-xs sm:text-sm font-bold text-neutral-900 group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug mb-2 relative z-10 ${
                        language === 'kn' ? 'font-kannada' : 'font-sans'
                      }`}
                    >
                      {language === 'kn' ? item.titleKn : item.titleEn}
                    </h3>

                    {/* Theme / Description */}
                    {(item.pandalThemeKn || item.pandalThemeEn) && (
                      <p className="text-[11px] text-neutral-600 font-sans line-clamp-2 leading-relaxed mb-3 relative z-10">
                        {language === 'kn' ? item.pandalThemeKn : item.pandalThemeEn}
                      </p>
                    )}
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="mt-3 pt-2.5 border-t border-amber-100 flex items-center justify-between text-xs font-bold text-neutral-900 group-hover:text-amber-700 transition-colors relative z-10">
                    <span className="font-sans text-[10px] uppercase tracking-wider">
                      {language === 'kn' ? 'ಪೂರ್ಣ ವಿವರ' : 'Explore'}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-500 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
