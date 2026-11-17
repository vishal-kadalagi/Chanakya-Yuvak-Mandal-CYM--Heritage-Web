import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface AchievementMediaItem {
  url: string;
  type: 'image' | 'video';
  showInHero?: boolean;
  captionKn?: string;
  captionEn?: string;
}

export interface AchievementDoc {
  id: string;
  category: 'feast' | 'pooja' | 'miravanige' | 'pandal' | 'cultural' | 'other' | string;
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
  galleryMedia?: AchievementMediaItem[];
  sponsorNameKn?: string;
  sponsorNameEn?: string;
  eventDate?: string;
  year?: number;
  showInHero?: boolean;
  showIn35mm?: boolean;
  showInGallery?: boolean;
  highlightsEn?: string[];
  highlightsKn?: string[];
  order?: number;
  isActive?: boolean;
  createdAt?: any;
}

const COLLECTION_NAME = 'achievements_items';

/**
 * Subscribe to all achievements in real-time
 */
export function subscribeToAchievements(
  callback: (items: AchievementDoc[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(collection(db, COLLECTION_NAME), orderBy('order', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: AchievementDoc[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<AchievementDoc, 'id'>),
      }));
      callback(items);
    },
    (err) => {
      console.warn('Firestore achievements subscription notice:', err.message);
      const fallbackQuery = collection(db, COLLECTION_NAME);
      return onSnapshot(
        fallbackQuery,
        (snapshot) => {
          const items: AchievementDoc[] = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<AchievementDoc, 'id'>),
          }));
          items.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
          callback(items);
        },
        (e) => {
          if (onError) onError(e);
        }
      );
    }
  );
}

/**
 * Add a new achievement item
 */
export async function addAchievement(
  item: Omit<AchievementDoc, 'id' | 'createdAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...item,
    isActive: item.isActive ?? true,
    order: item.order ?? 1,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Update an existing achievement item
 */
export async function updateAchievement(
  id: string,
  updates: Partial<Omit<AchievementDoc, 'id' | 'createdAt'>>
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, updates);
}

/**
 * Delete an achievement item
 */
export async function deleteAchievement(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}
