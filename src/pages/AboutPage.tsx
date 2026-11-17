import React from 'react';
import { Shield, Heart, Landmark, Flame } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { siteConfig } from '../data/site';
import { SectionTitle } from '../components/common/SectionTitle';

export const AboutPage: React.FC = () => {
  const { language, t } = useLanguage();

  const pillars = [
    {
      num: '01',
      icon: Flame,
      titleKn: 'ಭಕ್ತಿ',
      tagKn: 'DEVOTION',
      titleEn: 'Bhakti',
      tagEn: 'DEVOTION',
      desc: t.about.pillar1Desc,
    },
    {
      num: '02',
      icon: Heart,
      titleKn: 'ಏಕತೆ',
      tagKn: 'UNITY',
      titleEn: 'Ekata',
      tagEn: 'UNITY',
      desc: t.about.pillar2Desc,
    },
    {
      num: '03',
      icon: Shield,
      titleKn: 'ಸೇವೆ',
      tagKn: 'SERVICE',
      titleEn: 'Seva',
      tagEn: 'SERVICE',
      desc: t.about.pillar3Desc,
    },
    {
      num: '04',
      icon: Landmark,
      titleKn: 'ಸಂಸ್ಕೃತಿ',
      tagKn: 'CULTURE',
      titleEn: 'Samskruti',
      tagEn: 'CULTURE',
      desc: t.about.pillar4Desc,
    },
  ];

  return (
    <div className="pt-4 sm:pt-6 pb-14 md:pb-20 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          badge={language === 'kn' ? 'ಸ್ಥಾಪನೆ: 2019' : 'ESTABLISHED 2019'}
          title={t.about.heroTitle}
          subtitle={t.about.heroSub}
        />

        {/* Origin Story Section */}
        <div className="mt-8 sm:mt-14 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Mobile: order-2 (below image), Desktop: lg:order-1 (left column) */}
          <div className="order-2 lg:order-1 lg:col-span-7 space-y-5 text-sm sm:text-base text-gray-600 leading-relaxed font-sans">
            <h3 className="font-sans sm:font-display font-black sm:font-extrabold text-xl sm:text-3xl text-black uppercase tracking-tight leading-snug sm:leading-tight">
              {t.about.storyTitle}
            </h3>

            <p>{t.about.storyP1}</p>
            <p>{t.about.storyP2}</p>
            <p>{t.about.storyP3}</p>

            <div className="p-4 sm:p-5 rounded-2xl bg-[#F8F8F7] border border-[#EEEEEE] border-l-4 border-l-[#E5A812] text-xs sm:text-sm text-black font-sans sm:font-display font-bold sm:font-extrabold uppercase tracking-wide">
              "{language === 'kn' ? siteConfig.taglineKn : siteConfig.taglineEn}"
            </div>
          </div>

          {/* Mobile: order-1 (at the top), Desktop: lg:order-2 (right column) */}
          <div className="order-1 lg:order-2 lg:col-span-5">
            <div className="rounded-3xl overflow-hidden border border-[#EEEEEE] bg-[#F8F8F7] p-6 sm:p-10 flex flex-col items-center justify-center shadow-md hover:shadow-lg transition-shadow">
              <div className="w-64 h-64 sm:w-80 sm:h-80 lg:w-[340px] lg:h-[340px] flex items-center justify-center relative group p-2">
                <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-amber-400/20 via-amber-300/10 to-transparent blur-2xl group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
                <img
                  src="/assets/logo_transparent.png"
                  alt="Chanakya Yuvak Mandal"
                  className="relative z-10 w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/assets/logo_transparent.png';
                  }}
                />
              </div>
              <div className="mt-5 sm:mt-6 pt-5 text-center border-t border-gray-200/80 w-full">
                <p className="font-sans sm:font-display font-bold sm:font-extrabold text-base sm:text-lg text-black uppercase tracking-wide">
                  {language === 'kn' ? siteConfig.nameKn : siteConfig.nameEn}
                </p>
                <p className="text-xs sm:text-sm text-[#E5A812] font-sans sm:font-display font-bold uppercase tracking-wider mt-1.5">
                  Kadalagi Khoot, Yamakanmardi • Est. 2019
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Pillars Section */}
        <div className="mt-14 sm:mt-20 pt-10 sm:pt-16 border-t border-amber-900/10">
          <SectionTitle
            badge={language === 'kn' ? 'ಮೂಲ ಮೌಲ್ಯಗಳು' : 'CORE PILLARS'}
            title={t.about.pillarsTitle}
            subtitle={t.about.pillarsSub}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 mt-8 sm:mt-10">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              const title = language === 'kn' ? pillar.titleKn : pillar.titleEn;
              const tag = language === 'kn' ? pillar.tagKn : pillar.tagEn;

              return (
                <div
                  key={pillar.num}
                  className="group relative bg-white rounded-2xl border border-stone-200/90 hover:border-amber-400 p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md hover:-translate-y-1 overflow-hidden"
                >
                  {/* Subtle top gold hairline glint */}
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300 group-hover:h-[3px] transition-all" />

                  <div>
                    {/* Top Header Row: Icon + Tag + Numeral Badge */}
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-amber-400/10 border border-amber-400/40 flex items-center justify-center text-amber-700 shadow-2xs group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5 text-amber-600" />
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                        <span className="text-[10px] font-mono font-extrabold text-neutral-400 bg-stone-100 px-1.5 py-0.5 rounded">
                          {pillar.num}
                        </span>
                      </div>
                    </div>

                    {/* Pillar Title */}
                    <h4
                      className={`text-base sm:text-lg font-bold text-neutral-950 mb-1.5 tracking-tight group-hover:text-amber-700 transition-colors ${
                        language === 'kn' ? 'font-kannada' : 'font-sans'
                      }`}
                    >
                      {title}
                    </h4>

                    {/* Pillar Description */}
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-sans">
                      {pillar.desc}
                    </p>
                  </div>

                  {/* Bottom Decorative Indicator */}
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] font-medium text-amber-700/80">
                    <span className="inline-flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>{language === 'kn' ? 'ಮೂಲ ಸ್ಥಂಭ' : 'Core Pillar'}</span>
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400 font-bold">CYM • 2019</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vision & Heritage Quote */}
        <div className="mt-14 sm:mt-20 rounded-3xl bg-[#111111] border border-amber-500/20 text-white p-6 sm:p-12 text-center max-w-4xl mx-auto shadow-md relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300" />
          <div className="inline-flex items-center space-x-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-widest mb-3 bg-amber-400/10 border border-amber-400/30 px-3 py-0.5 rounded-full">
            <span>{language === 'kn' ? 'ಧ್ಯೇಯ ವಾಕ್ಯ' : 'OUR VISION'}</span>
          </div>
          <blockquote
            className={`text-lg sm:text-2xl text-white tracking-tight leading-snug ${
              language === 'kn' ? 'font-kannada font-bold' : 'font-sans sm:font-display font-extrabold uppercase'
            }`}
          >
            "{language === 'kn'
              ? 'ಪರಂಪರೆಯ ರಕ್ಷಣೆ, ಗ್ರಾಮೀಣ ಯುವಕರ ಏಕತೆ ಮತ್ತು ಸಮಾಜದ ಸರ್ವತೋಮುಖ ವಿಕಾಸವೇ ನಮ್ಮ ಧ್ಯೇಯ.'
              : 'Preserving our sacred heritage, uniting village youth, and serving our community with devotion and courage.'}"
          </blockquote>
          <p className="mt-4 text-xs font-sans text-neutral-400 uppercase tracking-widest font-semibold">
            Chanakya Yuvak Mandal • Kadalagi Khoot, Yamakanmardi
          </p>
        </div>
      </div>
    </div>
  );
};
