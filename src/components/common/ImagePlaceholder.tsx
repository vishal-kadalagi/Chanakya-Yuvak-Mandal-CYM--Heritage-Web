import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface ImagePlaceholderProps {
  className?: string;
  label?: string;
  sublabel?: string;
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  className = "w-full h-full min-h-[200px]",
  label,
  sublabel,
}) => {
  const { language } = useLanguage();

  return (
    <div
      className={`bg-gray-50/80 border border-dashed border-gray-200/90 rounded-2xl flex flex-col items-center justify-center p-6 text-center select-none transition-colors hover:bg-gray-50 ${className}`}
    >
      <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 shadow-2xs mb-2">
        <ImageIcon className="w-5 h-5 text-gray-300" />
      </div>
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {label || (language === 'kn' ? 'ಫೋಟೋ ಜಾಗ' : 'Photo Space')}
      </span>
      {sublabel && (
        <span className="text-[11px] text-gray-400 mt-0.5">
          {sublabel}
        </span>
      )}
    </div>
  );
};
