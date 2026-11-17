export interface HeroSlide {
  id: string;
  type: 'video' | 'image' | 'blank';
  url: string;
  titleEn: string;
  titleKn: string;
  captionEn?: string;
  captionKn?: string;
  order?: number;
  // Dynamic history attributes
  isHistory?: boolean;
  historyYear?: number;
  pandalThemeKn?: string;
  pandalThemeEn?: string;
  summaryKn?: string;
  summaryEn?: string;
  highlightsKn?: string[];
  highlightsEn?: string[];
}

/**
 * Static mock hero slides removed per user instruction.
 * The Hero section dynamically renders admin-uploaded media or history milestones
 * marked with 'Display in Hero Section'.
 */
export const heroSlides: HeroSlide[] = [];
