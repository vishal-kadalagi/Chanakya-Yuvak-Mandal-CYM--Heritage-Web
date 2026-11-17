export type GalleryCategory =
  | 'all'
  | 'darshan'
  | 'aagamana'
  | 'saval'
  | 'aarti'
  | 'pandal'
  | 'visarjan'
  | 'miravanige'
  | 'cultural'
  | 'seva';

export interface GalleryItem {
  id: string;
  titleEn: string;
  titleKn: string;
  year: number;
  category:
    | 'darshan'
    | 'aagamana'
    | 'saval'
    | 'aarti'
    | 'pandal'
    | 'visarjan'
    | 'miravanige'
    | 'cultural'
    | 'seva';
  imageUrl: string;
  thumbnailUrl?: string;
  descriptionEn: string;
  descriptionKn: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
  mediaType?: 'image' | 'video';
  themeEn?: string;
  themeKn?: string;
  sponsorNameEn?: string;
  sponsorNameKn?: string;
  eventDate?: string;
  highlightsEn?: string[];
  highlightsKn?: string[];
}

// Live gallery items are fully uploaded and managed dynamically by the Mandal Admin via the Admin Dashboard.
export const galleryItems: GalleryItem[] = [];
