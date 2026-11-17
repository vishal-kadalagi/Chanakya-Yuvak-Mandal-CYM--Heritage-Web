import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export const AudioPlayer: React.FC = () => {
  const { t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const intervalRef = useRef<number | null>(null);

  const toggleAudio = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  const startAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 3);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      const baseFreqs = [138.59, 207.65, 277.18, 349.23, 415.30];
      const oscList: OscillatorNode[] = [];

      baseFreqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.2 + idx * 0.1, ctx.currentTime);
        lfoGain.gain.setValueAtTime(1.2, ctx.currentTime);
        lfo.connect(osc.frequency);
        lfo.start();

        const baseVol = [0.2, 0.15, 0.12, 0.08, 0.05][idx] || 0.08;
        oscGain.gain.setValueAtTime(baseVol, ctx.currentTime);

        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();
        oscList.push(osc);
      });

      oscillatorsRef.current = oscList;
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (gainNodeRef.current && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, ctx.currentTime);
      gainNodeRef.current.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

      setTimeout(() => {
        try {
          oscillatorsRef.current.forEach(osc => {
            try { osc.stop(); } catch { /* ignore */ }
          });
          oscillatorsRef.current = [];
          if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
            audioCtxRef.current.close();
          }
        } catch {
          // ignore
        }
      }, 1300);
    }
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  return (
    <button
      onClick={toggleAudio}
      className={`relative inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors border ${
        isPlaying 
          ? 'bg-[#15171E] border-[#D4AF37] text-[#F0D675]' 
          : 'bg-[#15171E] border-white/10 text-[#9CA3AF] hover:text-white hover:border-white/20'
      }`}
      title={isPlaying ? t.nav.audioOn : t.nav.audioOff}
      aria-label="Toggle ambient temple sound"
    >
      {isPlaying ? (
        <>
          <Volume2 className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="hidden sm:inline">{t.nav.audioAarti}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
        </>
      ) : (
        <>
          <VolumeX className="w-3.5 h-3.5 text-[#9CA3AF]" />
          <span className="hidden sm:inline">{t.nav.audioAarti}</span>
        </>
      )}
    </button>
  );
};
