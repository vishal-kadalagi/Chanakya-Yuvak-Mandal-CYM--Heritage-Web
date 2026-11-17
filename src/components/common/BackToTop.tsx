import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export const BackToTop: React.FC = () => {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      title={t.common.backToTop}
      aria-label={t.common.backToTop}
      className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 p-2.5 sm:p-3 rounded-full bg-neutral-900/90 hover:bg-amber-400 text-white hover:text-neutral-950 border border-white/20 hover:border-amber-400 shadow-xl backdrop-blur-md transition-all duration-200 transform hover:scale-110 active:scale-95 cursor-pointer"
    >
      <ArrowUp className="w-4 h-4" />
    </button>
  );
};
