import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Pause,
  Play,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { HeroSlide } from '../../data/heroSlides';
import { subscribeToPublicMedia } from '../../services/mediaService';
import { subscribeToHistory, HistoryMilestoneDoc } from '../../services/historyService';
import { subscribeToAchievements, AchievementDoc } from '../../services/achievementsService';
import { subscribeToEvents, CommunityEventDoc } from '../../services/eventsService';
import { subscribeToSiteSettings } from '../../services/siteService';
import { extractYoutubeVideoId } from '../../utils/youtubeUtils';
import { getHdMediaUrl, getVideoPosterUrl } from '../../utils/mediaUtils';

// Authentic sacred initial fallback so users never see an empty black screen while network is connecting
const DEFAULT_INITIAL_HERO_SLIDE: HeroSlide = {
  id: 'cym-heritage-welcome',
  type: 'image',
  url: '/assets/images/hero_group_darshan.jpg',
  titleKn: 'ಶ್ರೀ ಚಾಣಕ್ಯ ಯುವಕ ಮಂಡಳ ಗಣೇಶೋತ್ಸವ',
  titleEn: 'Chanakya Yuvak Mandal Ganesh Mahotsava',
  captionKn: 'ಕಡಲಗಿ ಖೂಟ, ಯಮಕನಮರಡಿ • ೨೦೧೯ ರಿಂದ ನಿರಂತರ ಭಕ್ತಿ, ಸೇವೆ & ಸಂಸ್ಕೃತಿ',
  captionEn: 'Kadalagi Khoot, Yamakanmardi • Unity, Heritage & Devotion since 2019',
  order: 0,
};

export const HeroSection: React.FC = () => {
  const { language } = useLanguage();
  const [cloudSlides, setCloudSlides] = useState<HeroSlide[]>([]);
  const [historySlides, setHistorySlides] = useState<HeroSlide[]>([]);
  const [sevaSlides, setSevaSlides] = useState<HeroSlide[]>([]);
  const [eventSlides, setEventSlides] = useState<HeroSlide[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [slideProgress, setSlideProgress] = useState(0);
  const [isLiveStreamActive, setIsLiveStreamActive] = useState(false);

  // Clear legacy localStorage cache on mount so no stale cached video ever flashes
  useEffect(() => {
    try {
      localStorage.removeItem('cym_hero_slides_cache');
    } catch (e) {}
  }, []);

  useEffect(() => {
    const unsub = subscribeToSiteSettings((s) => {
      const vid = extractYoutubeVideoId(s.liveStreamYoutubeUrl);
      setIsLiveStreamActive(Boolean(s.liveStreamActive && vid));
    });
    return () => unsub();
  }, []);

  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const heroContainerRef = useRef<HTMLDivElement | null>(null);
  const spotlightRef = useRef<HTMLDivElement | null>(null);

  // 1. Subscribe to admin-uploaded Hero Media in real-time
  useEffect(() => {
    const unsubscribe = subscribeToPublicMedia('hero', (items) => {
      if (items && items.length > 0) {
        const mapped: HeroSlide[] = items.map((item) => ({
          id: item.id,
          type: item.mediaType,
          url: item.mediaUrl,
          titleEn: item.titleEn,
          titleKn: item.titleKn,
          order: item.order ?? 999,
        }));
        setCloudSlides(mapped);
      } else {
        setCloudSlides([]);
      }
      setHasInitialized(true);
    });

    return unsubscribe;
  }, []);

  // 2. Subscribe to History Milestones with 'showInHero: true' in real-time
  useEffect(() => {
    const unsubscribe = subscribeToHistory((items: HistoryMilestoneDoc[]) => {
      const heroHistory = items.filter(
        (h) => h.isActive !== false && h.showInHero === true
      );

      const mapped: HeroSlide[] = heroHistory.map((h) => {
        const mediaUrl = h.coverImage || '';
        const isVid =
          h.mediaType === 'video' ||
          (mediaUrl
            ? mediaUrl.toLowerCase().includes('.mp4') ||
              mediaUrl.toLowerCase().includes('.webm') ||
              mediaUrl.toLowerCase().includes('.mov') ||
              mediaUrl.toLowerCase().includes('/video/upload/')
            : false);

        return {
          id: `hist-${h.id}`,
          type: isVid ? 'video' : mediaUrl ? 'image' : 'blank',
          url: mediaUrl,
          titleEn: h.titleEn,
          titleKn: h.titleKn,
          captionEn: h.pandalThemeEn || h.summaryEn,
          captionKn: h.pandalThemeKn || h.summaryKn,
          order: h.order ?? 999,
          isHistory: true,
          historyYear: h.year,
          pandalThemeKn: h.pandalThemeKn,
          pandalThemeEn: h.pandalThemeEn,
          summaryKn: h.summaryKn,
          summaryEn: h.summaryEn,
          highlightsKn: h.highlightsKn,
          highlightsEn: h.highlightsEn,
        };
      });

      setHistorySlides(mapped);
    });

    return unsubscribe;
  }, []);

  // 3. Subscribe to Seva Initiatives with 'showInHero: true' or individual galleryMedia marked for hero
  useEffect(() => {
    const unsubscribe = subscribeToAchievements((items: AchievementDoc[]) => {
      const heroSeva = items.filter(
        (a) =>
          a.isActive !== false &&
          (a.showInHero === true || a.galleryMedia?.some((m) => m.showInHero === true))
      );

      const mapped: HeroSlide[] = [];

      heroSeva.forEach((a) => {
        const parsedYear =
          a.year ||
          (a.eventDate ? parseInt(a.eventDate.match(/\d{4}/)?.[0] || '2026') : 2026);

        // Determine which media items should be featured in Hero
        let mediaToFeature: { url: string; type: 'image' | 'video' }[] = [];

        if (a.galleryMedia && a.galleryMedia.length > 0) {
          // Feature items explicitly marked with showInHero === true
          mediaToFeature = a.galleryMedia.filter((m) => m.showInHero === true);
          // If the record itself has showInHero === true but no individual items were tagged yet, fallback to first item
          if (mediaToFeature.length === 0 && a.showInHero === true) {
            mediaToFeature = [a.galleryMedia[0]];
          }
        } else if (a.showInHero === true && (a.mediaUrl || a.imageUrl)) {
          // Fallback to legacy primary single mediaUrl / imageUrl only if no galleryMedia exists
          mediaToFeature = [
            {
              url: a.mediaUrl || a.imageUrl || '',
              type: (a.mediaType || 'image') as 'image' | 'video',
            },
          ];
        }

        mediaToFeature.forEach((m, idx) => {
          if (!m.url) return;
          const isVid =
            m.type === 'video' ||
            m.url.toLowerCase().includes('.mp4') ||
            m.url.toLowerCase().includes('.webm') ||
            m.url.toLowerCase().includes('.mov') ||
            m.url.toLowerCase().includes('/video/upload/');

          mapped.push({
            id: `seva-${a.id}-${idx}`,
            type: isVid ? 'video' : 'image',
            url: m.url,
            titleEn: a.titleEn,
            titleKn: a.titleKn,
            captionEn: a.sponsorNameEn ? `Sponsor: ${a.sponsorNameEn}` : a.descriptionEn,
            captionKn: a.sponsorNameKn ? `ಸೇವಾಕರ್ತರು: ${a.sponsorNameKn}` : a.descriptionKn,
            order: a.order ?? 999,
            isHistory: true,
            historyYear: parsedYear,
            pandalThemeKn: a.sponsorNameKn ? `ಸೇವಾಕರ್ತರು: ${a.sponsorNameKn}` : undefined,
            pandalThemeEn: a.sponsorNameEn ? `Sponsor: ${a.sponsorNameEn}` : undefined,
            summaryKn: a.descriptionKn,
            summaryEn: a.descriptionEn,
            highlightsKn: a.highlightsKn,
            highlightsEn: a.highlightsEn,
          });
        });
      });

      setSevaSlides(mapped);
    });

    return unsubscribe;
  }, []);

  // 4. Subscribe to Community & Extra-Curricular Events with 'showInHero: true' or individual galleryMedia marked for hero
  useEffect(() => {
    const unsubscribe = subscribeToEvents((items: CommunityEventDoc[]) => {
      const heroEvents = items.filter(
        (e) =>
          e.isActive !== false &&
          (e.showInHero === true || e.galleryMedia?.some((m) => m.showInHero === true))
      );

      const mapped: HeroSlide[] = [];

      heroEvents.forEach((e) => {
        let mediaToFeature: { url: string; type: 'image' | 'video' }[] = [];

        if (e.galleryMedia && e.galleryMedia.length > 0) {
          // Feature items explicitly marked with showInHero === true
          mediaToFeature = e.galleryMedia.filter((m) => m.showInHero === true);
          // If the event itself has showInHero === true but no individual items were tagged yet, fallback to first item
          if (mediaToFeature.length === 0 && e.showInHero === true) {
            mediaToFeature = [e.galleryMedia[0]];
          }
        } else if (e.showInHero === true && e.mediaUrl) {
          mediaToFeature = [
            {
              url: e.mediaUrl,
              type: (e.mediaType || 'image') as 'image' | 'video',
            },
          ];
        }

        mediaToFeature.forEach((m, idx) => {
          if (!m.url) return;
          const isVid =
            m.type === 'video' ||
            m.url.toLowerCase().includes('.mp4') ||
            m.url.toLowerCase().includes('.webm') ||
            m.url.toLowerCase().includes('.mov') ||
            m.url.toLowerCase().includes('/video/upload/');

          mapped.push({
            id: `evt-${e.id}-${idx}`,
            type: isVid ? 'video' : 'image',
            url: m.url,
            titleEn: e.titleEn,
            titleKn: e.titleKn,
            captionEn: e.descriptionEn,
            captionKn: e.descriptionKn,
            order: e.order ?? 999,
            isHistory: true,
            historyYear: e.year || 2026,
            summaryKn: e.descriptionKn,
            summaryEn: e.descriptionEn,
            highlightsKn: e.highlightsKn,
            highlightsEn: e.highlightsEn,
          });
        });
      });

      setEventSlides(mapped);
    });

    return unsubscribe;
  }, []);

  // Combine Admin Hero Media, History Milestones, Seva Initiatives, and Community Events (strictly sorted by priority order!)
  const activeSlides: HeroSlide[] = useMemo(() => {
    const combined = [...cloudSlides, ...historySlides, ...sevaSlides, ...eventSlides];
    if (combined.length === 0) {
      return hasInitialized ? [] : [DEFAULT_INITIAL_HERO_SLIDE];
    }
    return combined.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  }, [cloudSlides, historySlides, sevaSlides, eventSlides, hasInitialized]);
  const slideCount = activeSlides.length;

  // Keep currentSlide within valid bounds if items change
  useEffect(() => {
    if (slideCount === 0) {
      setCurrentSlide(0);
    } else if (currentSlide >= slideCount) {
      setCurrentSlide(0);
    }
  }, [slideCount, currentSlide]);

  const goToPrev = useCallback(() => {
    if (slideCount <= 1) return;
    setSlideProgress(0);
    setCurrentSlide((prev) => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  const goToNext = useCallback(() => {
    if (slideCount <= 1) return;
    setSlideProgress(0);
    setCurrentSlide((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  // ================= GOLDEN EMBER PARTICLE CANVAS (HARDWARE ACCELERATED & INTERSECTION-AWARE) =================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number = 0;
    let isVisible = true;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Pre-render glowing ember sprite onto an offscreen canvas to avoid 1,700 createRadialGradient calls/sec
    const offCanvas = document.createElement('canvas');
    offCanvas.width = 32;
    offCanvas.height = 32;
    const offCtx = offCanvas.getContext('2d');
    if (offCtx) {
      const grad = offCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 215, 0, 1)');
      grad.addColorStop(0.35, 'rgba(229, 168, 18, 0.7)');
      grad.addColorStop(0.8, 'rgba(229, 168, 18, 0.2)');
      grad.addColorStop(1, 'rgba(229, 168, 18, 0)');
      offCtx.fillStyle = grad;
      offCtx.fillRect(0, 0, 32, 32);
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // Pause canvas animation when hero is scrolled out of view to free 100% GPU/CPU
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animId) {
          render();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    const particleCount = 28;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.8,
      speedY: Math.random() * 0.45 + 0.2,
      speedX: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * 0.02 + 0.01,
    }));

    const render = () => {
      if (!isVisible) {
        animId = 0;
        return;
      }

      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y -= p.speedY;
        p.x += p.speedX;
        p.alpha += Math.sin(Date.now() * p.pulse * 0.05) * 0.005;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.globalAlpha = Math.max(0.1, Math.min(0.85, p.alpha));
        const d = p.size * 5;
        ctx.drawImage(offCanvas, p.x - d / 2, p.y - d / 2, d, d);
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animId) cancelAnimationFrame(animId);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Zero-rerender cursor spotlight tracking (updates DOM style directly without React state re-renders)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!spotlightRef.current || !heroContainerRef.current) return;
    const rect = heroContainerRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    spotlightRef.current.style.background = `radial-gradient(circle 600px at ${x}% ${y}%, rgba(229,168,18,0.12) 0%, transparent 75%)`;
  };

  // Smart Slide Lifecycle & Progress Timer (plays full video until natural onEnded, images 6.5s)
  useEffect(() => {
    if (!isPlaying || slideCount <= 1) {
      setSlideProgress(0);
      return;
    }

    const active = activeSlides[currentSlide];
    const isVid = active && active.type === 'video';

    setSlideProgress(0);

    // If active slide is a video: video plays completely to the end and calls onEnded
    if (isVid) {
      const vid = videoRefs.current[active.id];
      if (vid) {
        vid.muted = isMuted;
        if (vid.paused) {
          vid.play().catch(() => {});
        }
      }

      // Safety timeout: only advance if video takes over 5 minutes or hangs indefinitely
      const safetyTimeout = setTimeout(() => {
        goToNext();
      }, 300000);

      return () => {
        clearTimeout(safetyTimeout);
      };
    }

    // If active slide is an image: 6.5s smooth progress bar and auto-advance
    const duration = 6500;
    const startTime = Date.now();

    const intervalId = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setSlideProgress(progress);

      if (elapsed >= duration) {
        clearInterval(intervalId);
        goToNext();
      }
    }, 50);

    return () => {
      clearInterval(intervalId);
    };
  }, [currentSlide, isPlaying, slideCount, activeSlides, goToNext, isMuted]);

  // Video play/pause and synchronization across slides
  useEffect(() => {
    if (slideCount === 0) return;
    activeSlides.forEach((slide, idx) => {
      if (slide.type === 'video') {
        const vid = videoRefs.current[slide.id];
        if (vid) {
          vid.muted = isMuted;
          if (idx === currentSlide) {
            if (isPlaying && vid.paused) {
              vid.play().catch(() => {});
            } else if (!isPlaying) {
              vid.pause();
            }
          } else {
            vid.pause();
          }
        }
      }
    });
  }, [isPlaying, currentSlide, activeSlides, slideCount, isMuted]);

  const activeSlide: HeroSlide | undefined =
    slideCount > 0 ? activeSlides[currentSlide] || activeSlides[0] : undefined;

  return (
    <div
      ref={heroContainerRef}
      data-theme="dark"
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden bg-black text-white min-h-[100dvh] flex flex-col justify-between select-none"
      onClick={() => {
        if (isFocusMode) setIsFocusMode(false);
      }}
    >
      {/* ================= BACKGROUND SLIDER / CAROUSEL (DYNAMIC ADMIN MEDIA & HISTORY) ================= */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {slideCount > 0 ? (
          activeSlides.map((slide, idx) => {
            const isActive = idx === currentSlide;

            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-all duration-1000 ease-out transform ${
                  isActive
                    ? 'opacity-100 scale-100 z-10'
                    : 'opacity-0 scale-105 pointer-events-none z-0'
                }`}
              >
                {slide.type === 'video' && slide.url ? (
                  (() => {
                    const ytId = extractYoutubeVideoId(slide.url);
                    if (ytId) {
                      return (
                        <div className="w-full h-full relative overflow-hidden bg-black pointer-events-none">
                          <iframe
                            src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&playsinline=1&modestbranding=1&rel=0`}
                            title={language === 'kn' ? slide.titleKn : slide.titleEn}
                            className="w-full h-full object-cover scale-125 pointer-events-none"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          />
                        </div>
                      );
                    }
                    const posterUrl = getVideoPosterUrl(slide.url);
                    return (
                      <div className="relative w-full h-full bg-black overflow-hidden">
                        {/* Instant Still Frame Backdrop: eliminates black box while video buffers */}
                        {posterUrl && (
                          <img
                            src={posterUrl}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover object-top sm:object-center"
                            loading={idx === 0 ? 'eager' : 'lazy'}
                          />
                        )}
                        <video
                          ref={(el) => {
                            videoRefs.current[slide.id] = el;
                          }}
                          src={getHdMediaUrl(slide.url, 'video')}
                          poster={posterUrl}
                          autoPlay={isActive}
                          loop={false}
                          muted={isMuted}
                          playsInline
                          preload={isActive ? 'auto' : (idx === (currentSlide + 1) % slideCount ? 'auto' : 'none')}
                          onCanPlay={(e) => {
                            if (isActive && isPlaying && e.currentTarget.paused) {
                              e.currentTarget.play().catch(() => {});
                            }
                          }}
                          onLoadedData={(e) => {
                            if (isActive && isPlaying && e.currentTarget.paused) {
                              e.currentTarget.play().catch(() => {});
                            }
                          }}
                          onTimeUpdate={(e) => {
                            if (isActive) {
                              const v = e.currentTarget;
                              if (v.duration && v.duration > 0 && !isNaN(v.duration)) {
                                const currentPct = Math.round((v.currentTime / v.duration) * 100);
                                setSlideProgress((prev) => (prev !== currentPct ? currentPct : prev));
                              }
                            }
                          }}
                          onEnded={() => {
                            if (isActive && isPlaying) {
                              setSlideProgress(100);
                              goToNext();
                            }
                          }}
                          onError={() => {
                            if (isActive) {
                              setTimeout(() => {
                                goToNext();
                              }, 2500);
                            }
                          }}
                          className="relative w-full h-full object-cover object-top sm:object-center z-10"
                        />
                      </div>
                    );
                  })()
                ) : slide.type === 'image' && slide.url ? (
                  <img
                    src={getHdMediaUrl(slide.url, 'image')}
                    alt={language === 'kn' ? slide.titleKn : slide.titleEn}
                    className="w-full h-full object-cover object-top sm:object-center transition-transform duration-7000 ease-out"
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                ) : (
                  /* Ambient backdrop for history milestones without cover media */
                  <div className="w-full h-full bg-gradient-to-b from-[#111115] via-[#09090c] to-[#040405] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#E5A812_1px,transparent_1px)] [background-size:32px_32px]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(229,168,18,0.15)_0%,transparent_65%)]" />
                  </div>
                )}
              </div>
            );
          })
        ) : (
          /* Empty State: Serene Devotional Obsidian Atmosphere (No static mock media) */
          <div className="w-full h-full bg-gradient-to-b from-[#0e0e12] via-[#09090b] to-black flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#E5A812_1.5px,transparent_1.5px)] [background-size:36px_36px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(229,168,18,0.12)_0%,transparent_70%)]" />
          </div>
        )}

        {/* Dynamic Cursor-Tracking Ambient Spotlight (Direct DOM updated, 0 React re-renders) */}
        <div
          ref={spotlightRef}
          className="absolute inset-0 z-[12] pointer-events-none transition-opacity duration-700"
          style={{
            background: 'radial-gradient(circle 600px at 50% 50%, rgba(229,168,18,0.12) 0%, transparent 75%)',
          }}
        />

        {/* Living Temple Particle Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-[14] pointer-events-none opacity-80"
        />

        {/* High-End Vignette & Feathered Gradients */}
        <div className="absolute inset-0 z-[15] bg-gradient-to-t from-black/95 via-black/40 via-30% to-transparent pointer-events-none" />
        <div className="absolute inset-0 z-[15] bg-gradient-to-b from-black/75 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* ================= TOP HUD TELEMETRY BAR ================= */}
      <div className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 flex items-center justify-between gap-3">
        {/* Left: Monospace Coordinates & Live Status */}
        <div className="hidden sm:inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-mono text-neutral-300">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-amber-400 font-bold uppercase">LIVE UTSAV</span>
          <span className="text-neutral-500">•</span>
          <span>16.1298° N, 74.5290° E</span>
          <span className="text-neutral-500">•</span>
          <span>YAMAKANMARDI</span>
        </div>

        {/* Right: Audio Ambience & Focus Mode Toggles */}
        <div className="flex items-center space-x-2 ml-auto">
          {activeSlide && activeSlide.type === 'video' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/20 text-xs font-mono font-bold text-white transition-all shadow-lg hover:border-amber-400 cursor-pointer"
              title={isMuted ? 'Unmute Festival Audio' : 'Mute Video'}
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="text-[10px] uppercase">
                    {language === 'kn' ? 'ಧ್ವನಿ ಆನ್' : 'UNMUTE'}
                  </span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span className="text-[10px] uppercase text-amber-400 font-bold">
                    {language === 'kn' ? 'ಧ್ವನಿ ಇದೆ' : 'AUDIO ON'}
                  </span>
                </>
              )}
            </button>
          )}

          {slideCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFocusMode(!isFocusMode);
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/20 text-xs font-sans font-bold text-white transition-all shadow-lg hover:border-amber-400 cursor-pointer"
              title="Toggle Clean Photo View"
            >
              {isFocusMode ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px]">{language === 'kn' ? 'ವಿವರ' : 'Show Details'}</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-neutral-300" />
                  <span className="text-[11px]">{language === 'kn' ? 'ಫೋಟೋ ನೋಟ' : 'Clean View'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ================= CENTER VIEWPORT ================= */}
      <div className="flex-1 pointer-events-none" />

      {/* ================= BOTTOM SECTION: ROYAL FROSTED GLASS DOCK ================= */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-3 sm:pb-4">
        <div
          className={`transition-all duration-500 transform ${
            isFocusMode
              ? 'opacity-0 translate-y-8 pointer-events-none'
              : 'opacity-100 translate-y-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-[#09090b]/85 backdrop-blur-2xl backdrop-saturate-150 border border-amber-400/35 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.18)] hover:border-amber-400/50 transition-all duration-300">
            {/* Proud Mandal Identity Showcase (as of previous) */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Left Column: Identity & Presentation */}
              <div className="space-y-1.5 flex flex-col items-center lg:items-start text-center lg:text-left min-w-0">
                <div className="flex items-center justify-center lg:justify-start flex-wrap gap-2">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider shadow-2xs">
                    <Sparkles className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
                    <span>{language === 'kn' ? 'ಸ್ಥಾಪನೆ: 2019' : 'ESTD 2019'}</span>
                  </div>

                  <div className="inline-flex items-center space-x-1 text-neutral-300 text-[11px] font-sans">
                    <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>
                      {language === 'kn' ? 'ಕಡಲಗಿ ಖೂಟ, ಯಮಕನಮರಡಿ' : 'Kadalagi Khoot, Yamakanmardi'}
                    </span>
                  </div>
                </div>

                {/* Mandal Title */}
                <h1 className="drop-shadow leading-tight">
                  {language === 'kn' ? (
                    <div className="flex items-baseline justify-center lg:justify-start flex-wrap gap-x-2 text-center lg:text-left">
                      <span className="font-kannada font-extrabold text-2xl sm:text-3xl lg:text-4xl text-amber-400">
                        ಚಾಣಕ್ಯ
                      </span>
                      <span className="font-kannada font-extrabold text-xl sm:text-2xl lg:text-3xl text-white">
                        ಯುವಕ ಮಂಡಳ
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-baseline justify-center lg:justify-start flex-wrap gap-x-2 font-sans font-black text-xl sm:text-2xl lg:text-3xl tracking-wide uppercase text-center lg:text-left">
                      <span className="text-white">CHANAKYA</span>
                      <span className="text-amber-400">YUVAK</span>
                      <span className="text-white">MANDAL</span>
                    </div>
                  )}
                </h1>

                <p className="text-[11px] sm:text-xs text-neutral-300/90 font-sans">
                  {language === 'kn'
                    ? 'ಶ್ರೀ ಗಣೇಶ ಮಹೋತ್ಸವ • 2019 ರಿಂದ ನಿರಂತರ ಸಾಂಸ್ಕೃತಿಕ ಹಾಗೂ ಜನಸೇವಾ ರಾಜವೈಭವ'
                    : 'Royal Ganesh Mahotsav • Dedicated Cultural & Community Seva Since 2019'}
                </p>
              </div>

              {/* Right Column: CTA Buttons */}
              <div className="flex items-center justify-center lg:justify-end flex-wrap gap-2.5 sm:gap-3 shrink-0">
                {isLiveStreamActive && (
                  <a
                    href="#live-darshan-section"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('live-darshan-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-[0_0_25px_rgba(239,68,68,0.55)] border border-red-400/50 transition-all font-bold text-xs transform hover:-translate-y-0.5 cursor-pointer uppercase tracking-wider animate-pulse"
                  >
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span>{language === 'kn' ? '🔴 ನೇರ ದರ್ಶನ' : '🔴 LIVE DARSHAN'}</span>
                  </a>
                )}

                <Link
                  to="/gallery"
                  className="inline-flex items-center space-x-2 px-5 sm:px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 shadow-lg hover:shadow-amber-500/20 transition-all font-bold text-xs transform hover:-translate-y-0.5 cursor-pointer uppercase tracking-wider"
                >
                  <span>{language === 'kn' ? 'ದರ್ಶನ ಗ್ಯಾಲರಿ' : 'VIEW GALLERY'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  to="/history"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 hover:border-amber-400/50 text-white shadow-md transition-all font-bold text-xs transform hover:-translate-y-0.5 cursor-pointer uppercase tracking-wider"
                >
                  <span>{language === 'kn' ? 'ಇತಿಹಾಸ ಪಯಣ' : 'OUR HISTORY'}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= HERO FOOTER CONTROLS & CHAPTER SCRUBBER ================= */}
      <div
        className={`relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3 sm:pb-4 transition-opacity duration-300 ${
          isFocusMode ? 'opacity-40 hover:opacity-100' : 'opacity-100'
        }`}
      >
        {/* Scroll Down Prompt Button */}
        <div className="flex justify-center mb-2.5">
          <button
            onClick={() => {
              const el = document.getElementById('explore-section');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              } else {
                window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' });
              }
            }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 hover:border-amber-400 text-white/90 hover:text-amber-400 backdrop-blur-md transition-all duration-300 text-[10px] sm:text-[11px] font-mono font-bold tracking-widest uppercase cursor-pointer group shadow-lg"
            title="Scroll down to explore the website"
          >
            <span>{language === 'kn' ? 'ಕೆಳಗೆ ಸ್ಕ್ರಾಲ್ ಮಾಡಿ' : 'EXPLORE WEBSITE'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-amber-400 group-hover:translate-y-0.5 transition-transform animate-bounce" />
          </button>
        </div>

        {/* Playback HUD & Chapter Scrubber */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-t border-white/10">
          {slideCount > 0 ? (
            <>
              {/* Active Chapter Label */}
              <div className="flex items-center space-x-2 text-left min-w-0">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <span className="font-mono font-bold uppercase text-[10px] sm:text-xs tracking-wider text-amber-400 shrink-0">
                  {slideCount > 1
                    ? `FRAME ${String(currentSlide + 1).padStart(2, '0')}/${String(slideCount).padStart(2, '0')} :`
                    : activeSlide?.isHistory
                    ? `${activeSlide.historyYear} UTSAV :`
                    : 'CYM DARSHAN :'}
                </span>
                <span className="text-white/90 font-medium text-xs sm:text-sm truncate max-w-[200px] sm:max-w-md">
                  {activeSlide && (language === 'kn' ? activeSlide.titleKn : activeSlide.titleEn)}
                </span>
              </div>

              {/* Cinema Scrubber & Controls (Clean, luxury, non-cluttered design for all screen sizes) */}
              {slideCount > 1 && (
                <div className="flex items-center space-x-2.5 sm:space-x-3 w-full sm:w-auto justify-between sm:justify-end py-0.5">
                  {/* Continuous Luxury Timeline Scrubber Track */}
                  <div className="flex items-center space-x-2 sm:space-x-2.5 flex-1 sm:flex-initial">
                    {/* Clickable Progress Bar */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const percentage = Math.max(0, Math.min(1, clickX / rect.width));
                        const targetSlide = Math.min(slideCount - 1, Math.floor(percentage * slideCount));
                        setSlideProgress(0);
                        setCurrentSlide(targetSlide);
                      }}
                      className="group/track relative w-20 sm:w-36 h-2 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md cursor-pointer overflow-hidden p-0.5 transition-all border border-white/10"
                      title={language === 'kn' ? 'ಸ್ಲೈಡ್‌ಗೆ ಜಂಪ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ' : 'Click to jump to slide'}
                    >
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full transition-all duration-150 ease-out shadow-xs group-hover/track:brightness-110"
                        style={{
                          width: `${Math.min(100, Math.max(4, ((currentSlide + slideProgress / 100) / slideCount) * 100))}%`,
                        }}
                      />
                    </div>

                    {/* Numeric Frame Counter Badge */}
                    <div className="px-2 py-0.5 rounded-md bg-black/60 border border-white/15 backdrop-blur-md font-mono text-[11px] font-bold text-amber-300 flex items-center space-x-1 shrink-0 shadow-xs">
                      <span className="text-amber-400">{String(currentSlide + 1).padStart(2, '0')}</span>
                      <span className="text-white/40">/</span>
                      <span className="text-white/70">{String(slideCount).padStart(2, '0')}</span>
                    </div>
                  </div>

                  {/* Cinema Transport Controls */}
                  <div className="flex items-center space-x-1 shrink-0">
                    {/* Prev Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToPrev();
                      }}
                      aria-label="Previous Slide"
                      className="p-1.5 sm:p-2 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 text-white hover:text-amber-400 transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>

                    {/* Play/Pause Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPlaying(!isPlaying);
                      }}
                      aria-label={isPlaying ? 'Pause Slideshow' : 'Play Slideshow'}
                      className="p-1.5 sm:p-2 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 text-amber-400 hover:text-amber-300 transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>

                    {/* Next Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToNext();
                      }}
                      aria-label="Next Slide"
                      className="p-1.5 sm:p-2 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 text-white hover:text-amber-400 transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Clean telemetry status when empty */
            <div className="flex items-center justify-between w-full text-[10px] sm:text-xs text-neutral-400 font-mono">
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>{language === 'kn' ? 'ಕಡಲಗಿ ಖೂಟ • ಯಮಕನಮರಡಿ' : 'KADALAGI KHOOT • YAMAKANMARDI'}</span>
              </span>
              <span>{language === 'kn' ? 'ಶ್ರೀ ಗಣೇಶ ಮಹೋತ್ಸವ' : 'SHRI GANESH MAHOTSAV'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
