export type MediaPlacement = 'hero' | 'carousel' | 'gallery' | 'history' | 'seva' | 'showcase';
export type MediaCategory =
  | 'darshan'
  | 'aagamana'
  | 'saval'
  | 'aarti'
  | 'pandal'
  | 'visarjan'
  | 'miravanige'
  | 'cultural'
  | 'seva';

export interface MediaItem {
  id: string;
  titleEn: string;
  titleKn: string;
  descriptionEn?: string;
  descriptionKn?: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  publicId?: string;
  placement: MediaPlacement; // Primary placement for backward compatibility
  placements?: MediaPlacement[]; // Multi-select array e.g. ['hero', 'carousel', 'gallery', 'history', 'seva']
  category: MediaCategory;
  year: number;
  order: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}
