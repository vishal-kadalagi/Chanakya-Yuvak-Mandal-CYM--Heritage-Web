import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';

interface SectionTitleProps {
  badge?: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
  className?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  badge,
  title,
  subtitle,
  align = 'center',
  className = 'mb-10 sm:mb-12',
}) => {
  const { language } = useLanguage();
  const isCenter = align === 'center';

  return (
    <div className={`${isCenter ? 'text-center mx-auto' : 'text-left'} max-w-3xl ${className}`}>
      {badge && (
        <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase mb-2 text-[#E5A812]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E5A812]" />
          <span className={language === 'kn' ? 'font-kannada text-xs tracking-normal font-bold' : 'font-display tracking-widest'}>
            {badge}
          </span>
        </div>
      )}

      <h2 className={`text-black text-xl sm:text-3xl lg:text-4xl py-0.5 ${
        language === 'kn'
          ? 'font-kannada font-bold leading-snug tracking-normal'
          : 'font-sans sm:font-display font-black sm:font-extrabold uppercase tracking-tight leading-tight'
      }`}>
        {title}
      </h2>

      {subtitle && (
        <p className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed max-w-xl mx-auto font-sans font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
};
