import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export const NotFoundPage: React.FC = () => {
  const { language, t } = useLanguage();

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-20 px-4 bg-[#F8F8F7]">
      <div className="bg-white rounded-3xl border border-[#EEEEEE] p-8 sm:p-12 text-center max-w-md w-full shadow-sm">
        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <img
            src="/assets/logo_transparent.png"
            alt="CYM Logo"
            className="h-16 w-auto object-contain drop-shadow-sm"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/assets/logo_transparent.png';
            }}
          />
        </div>

        <div className="font-display font-extrabold text-5xl text-[#E5A812]">
          404
        </div>

        <h2 className="mt-2 font-display font-extrabold uppercase text-2xl text-black">
          {language === 'kn' ? 'ಪುಟ ಕಂಡುಬಂದಿಲ್ಲ' : 'Page Not Found'}
        </h2>

        <p className="mt-3 text-xs sm:text-sm text-gray-500 leading-relaxed font-sans">
          {language === 'kn'
            ? 'ನೀವು ಹುಡುಕುತ್ತಿರುವ ಪುಟವು ಲಭ್ಯವಿಲ್ಲ ಅಥವಾ ಸ್ಥಳಾಂತರಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ.'
            : 'The page you requested does not exist or has been moved. Please return to the homepage.'}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#E5A812] text-black font-display text-xs font-extrabold uppercase tracking-wider flex items-center justify-center space-x-1.5 hover:bg-[#d4980a] transition-colors shadow-xs"
          >
            <Home className="w-4 h-4" />
            <span>{t.nav.home}</span>
          </Link>

          <Link
            to="/history"
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-black text-white font-display text-xs font-extrabold uppercase tracking-wider flex items-center justify-center space-x-1.5 hover:bg-[#E5A812] hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.nav.history}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
