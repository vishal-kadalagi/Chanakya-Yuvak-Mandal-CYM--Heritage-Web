import React, { useState, useEffect } from 'react';

interface InitialLoaderProps {
  onLoaded?: () => void;
}

export const InitialLoader: React.FC<InitialLoaderProps> = ({ onLoaded }) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const minDisplayTime = 1200; // 1.2s sleek, luxury presentation duration
    let isWindowLoaded = document.readyState === 'complete';

    const handleWindowLoad = () => {
      isWindowLoaded = true;
    };

    if (!isWindowLoaded) {
      window.addEventListener('load', handleWindowLoad);
    }

    // Smooth, refined progress line
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const timeRatio = Math.min(1, elapsed / minDisplayTime);

      if (timeRatio < 1) {
        setProgress(Math.floor(timeRatio * 92));
      } else if (isWindowLoaded) {
        setProgress(100);
        clearInterval(interval);
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            setIsDone(true);
            if (onLoaded) onLoaded();
          }, 500); // 500ms smooth cinematic fade
        }, 200);
      }
    }, 30);

    return () => {
      clearInterval(interval);
      window.removeEventListener('load', handleWindowLoad);
    };
  }, [onLoaded]);

  if (isDone) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#060508] text-white select-none transition-all duration-500 ease-out overflow-hidden ${
        isFadingOut ? 'opacity-0 scale-[1.02] pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Subtle Premium Golden Amber Ambient Halo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] sm:w-[500px] h-[380px] sm:h-[500px] bg-[radial-gradient(circle,rgba(229,168,18,0.16)_0%,rgba(184,114,0,0.06)_40%,transparent_70%)] rounded-full blur-3xl pointer-events-none" />

      {/* Main Minimalist Centerpiece */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm w-full">
        {/* Lord Ganesha Emblem - Clean Floating Silhouette */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
            <img
              src="/assets/images/grand_ganesha_logo_opt.png"
              alt="Lord Ganesha"
              className="w-full h-full object-contain filter drop-shadow-[0_10px_25px_rgba(229,168,18,0.35)] transition-transform duration-700 ease-out"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/images/logo.jpg';
              }}
            />
          </div>
        </div>

        {/* Brand Typography - Clean, Crisp & Bilingual */}
        <div className="space-y-1.5 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold font-kannada tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-amber-400 drop-shadow-sm">
            ಚಾಣಕ್ಯ ಯುವಕ ಮಂಡಳ
          </h1>
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-neutral-400 uppercase font-sans">
            CHANAKYA YUVAK MANDAL
          </p>
          <p className="text-[10px] sm:text-[11px] text-amber-400/80 font-mono tracking-wider pt-0.5">
            ಕಡಲಗಿ ಖೂಟ • ಯಮಕನಮರಡಿ • 591246
          </p>
        </div>

        {/* Minimal Hairline Progress Bar */}
        <div className="w-48 sm:w-56 space-y-2 flex flex-col items-center">
          <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-amber-300 to-amber-200 rounded-full transition-all duration-100 ease-out shadow-[0_0_8px_rgba(229,168,18,0.7)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] font-mono tracking-widest text-neutral-500 font-medium">
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );
};
