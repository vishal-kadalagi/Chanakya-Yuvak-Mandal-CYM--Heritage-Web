import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook to generate a silky smooth, grapheme-aware rolling ticker in the browser tab title.
 * 
 * Smoothness design:
 * 1. Initial 2.2s reading hold when opening/navigating pages so the title is clearly readable.
 * 2. Butter-smooth 165ms cadence for fluid leftward gliding without jitter.
 * 3. Spacious 10-character buffer between loops so the tail glides off cleanly before restart.
 * 4. 1.8s pause at loop completion for an elegant, calm, professional rhythm.
 * 5. Full Intl.Segmenter preservation of Kannada conjunct aksharas (e.g. ತ್ಯ, ರ್ಡಿ, ಕ್ಯ) & emojis.
 */
const getMarqueeText = (pathname: string): string => {
  if (pathname === '/') {
    return '🚩 Chanakya Yuvak Mandal  |  ಚಾಣಕ್ಯ ಯುವಕ ಮಂಡಳ  •  ಕಡಲಗಿ ಖೂಟ, ಯಮಕನಮರಡಿ  •  2019–2026          ';
  }
  if (pathname.startsWith('/history/')) {
    const year = pathname.split('/')[2];
    return `🚩 ${year} ಶ್ರೀ ಗಣೇಶ ಮಹೋತ್ಸವ  |  ${year} Festival Archive  •  ಚಾಣಕ್ಯ ಯುವಕ ಮಂಡಳ          `;
  }
  if (pathname === '/history') {
    return '📜 ಇತಿಹಾಸ ಪಯಣ (2019–2026)  |  Festival History  •  ಚಾಣಕ್ಯ ಯುವಕ ಮಂಡಳ          ';
  }
  if (pathname === '/gallery') {
    return '📸 ದರ್ಶನ ಗ್ಯಾಲರಿ  |  Darshan Gallery  •  ಚಾಣಕ್ಯ ಯುವಕ ಮಂಡಳ, ಯಮಕನಮರಡಿ          ';
  }
  if (pathname === '/committee') {
    return '👥 ಕಮಿಟಿ ಸದಸ್ಯರು  |  Committee Members  •  ಚಾಣಕ್ಯ ಯುವಕ ಮಂಡಳ, ಯಮಕನಮರಡಿ          ';
  }
  if (pathname === '/achievements') {
    return '🏆 ಯುವ ಸೇವೆ & ಸಾಧನೆಗಳು  |  Seva Achievements  •  ಚಾಣಕ್ಯ ಯುವಕ ಮಂಡಳ          ';
  }
  if (pathname === '/about') {
    return '🚩 ನಮ್ಮ ಬಗ್ಗೆ & ಧ್ಯೇಯ  |  About CYM  •  ಕಡಲಗಿ ಖೂಟ, ಯಮಕನಮರಡಿ          ';
  }
  if (pathname === '/contact') {
    return '📍 ಕಡಲಗಿ ಖೂಟ, ಯಮಕನಮರಡಿ  |  Mandir Location & Map  •  CYM          ';
  }
  if (pathname.startsWith('/admin')) {
    return '⚙️ CYM Admin Portal  |  ಚಾಣಕ್ಯ ಯುವಕ ಮಂಡಳ          ';
  }
  return '🚩 Chanakya Yuvak Mandal  |  ಚಾಣಕ್ಯ ಯುವಕ ಮಂಡಳ  •  Yamakanmardi          ';
};

interface IntlSegmenterInstance {
  segment(input: string): Iterable<{ segment: string }>;
}

interface IntlConstructorWithSegmenter {
  Segmenter?: new (locale?: string, options?: { granularity?: string }) => IntlSegmenterInstance;
}

export const useTitleMarquee = () => {
  const location = useLocation();
  const stepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const fullText = getMarqueeText(location.pathname);

    // Use Intl.Segmenter to preserve Kannada conjunct glyphs and emojis as single units
    let segments: string[];
    try {
      const intlWithSeg = Intl as unknown as IntlConstructorWithSegmenter;
      if (typeof intlWithSeg.Segmenter === 'function') {
        const segmenter = new intlWithSeg.Segmenter('kn', { granularity: 'grapheme' });
        segments = Array.from(segmenter.segment(fullText)).map((s) => s.segment);
      } else {
        segments = Array.from(fullText);
      }
    } catch {
      segments = Array.from(fullText);
    }

    if (!segments.length) return;

    let currentIndex = 0;
    const len = segments.length;

    // Immediately display the steady initial title
    document.title = fullText.trimEnd();

    const clearTimers = () => {
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    };

    const tick = () => {
      currentIndex = (currentIndex + 1) % len;

      if (currentIndex === 0) {
        // Full loop completed: pause at the start so user can read again cleanly
        document.title = fullText.trimEnd();
        pauseTimerRef.current = setTimeout(() => {
          tick();
        }, 1800);
      } else {
        const rolled = segments.slice(currentIndex).concat(segments.slice(0, currentIndex)).join('');
        document.title = rolled;
        stepTimerRef.current = setTimeout(tick, 165);
      }
    };

    // Hold steady for 2.2 seconds on page arrival, then initiate smooth roll
    pauseTimerRef.current = setTimeout(() => {
      tick();
    }, 2200);

    return () => {
      clearTimers();
    };
  }, [location.pathname]);
};
