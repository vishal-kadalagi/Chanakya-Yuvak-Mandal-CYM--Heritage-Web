export type AchievementCategory = 'all' | 'feast' | 'pooja' | 'miravanige' | 'other';

export interface AchievementItem {
  id: string;
  category: 'feast' | 'pooja' | 'miravanige' | 'other' | string;
  titleEn: string;
  titleKn: string;
  yearEn?: string;
  yearKn?: string;
  impactMetricEn?: string;
  impactMetricKn?: string;
  descriptionEn?: string;
  descriptionKn?: string;
  imageUrl?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  sponsorNameKn?: string;
  sponsorNameEn?: string;
  eventDate?: string;
  highlightsEn?: string[];
  highlightsKn?: string[];
}

/**
 * Static mock data is emptied so that all initiatives and records
 * are 100% dynamically managed by the admin via Admin Dashboard.
 */
export const achievementsData: AchievementItem[] = [];
