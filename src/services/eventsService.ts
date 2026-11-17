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

export type EventCategory =
  | 'sports'
  | 'health'
  | 'education'
  | 'social'
  | 'cultural'
  | 'other';

export interface EventMediaItem {
  url: string;
  type: 'image' | 'video';
  showInHero?: boolean;
  captionKn?: string;
  captionEn?: string;
}

export interface CommunityEventDoc {
  id: string;
  titleKn: string;
  titleEn: string;
  category: EventCategory;
  eventDate: string;
  year?: number;
  locationKn?: string;
  locationEn?: string;
  descriptionKn: string;
  descriptionEn: string;
  highlightsKn?: string[];
  highlightsEn?: string[];
  chiefGuestsKn?: string;
  chiefGuestsEn?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  galleryMedia?: EventMediaItem[];
  order?: number;
  isActive?: boolean;
  showInHero?: boolean;
  showIn35mm?: boolean;
  showInGallery?: boolean;
  createdAt?: any;
}

const COLLECTION_NAME = 'community_events';

/**
 * Subscribe to all community and extra-curricular events in real-time
 * Pure dynamic data from Firestore (no fake static fallback)
 */
export function subscribeToEvents(
  callback: (events: CommunityEventDoc[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(collection(db, COLLECTION_NAME), orderBy('order', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        callback([]);
        return;
      }
      const items: CommunityEventDoc[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<CommunityEventDoc, 'id'>),
      }));
      items.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
      callback(items);
    },
    (err) => {
      console.warn('Firestore community_events subscription fallback:', err.message);
      // Fallback query if index on 'order' is not yet built
      const fallbackQuery = collection(db, COLLECTION_NAME);
      return onSnapshot(
        fallbackQuery,
        (snapshot) => {
          if (snapshot.empty) {
            callback([]);
            return;
          }
          const items: CommunityEventDoc[] = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<CommunityEventDoc, 'id'>),
          }));
          items.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
          callback(items);
        },
        (e) => {
          callback([]);
          if (onError) onError(e);
        }
      );
    }
  );
}

/**
 * Add a new extra-curricular event
 */
export async function addEvent(
  event: Omit<CommunityEventDoc, 'id' | 'createdAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...event,
    isActive: event.isActive ?? true,
    order: event.order ?? 1,
    showInHero: event.showInHero ?? false,
    showIn35mm: event.showIn35mm ?? false,
    showInGallery: event.showInGallery ?? true,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Update an existing extra-curricular event
 */
export async function updateEvent(
  id: string,
  updates: Partial<Omit<CommunityEventDoc, 'id' | 'createdAt'>>
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, updates);
}

/**
 * Delete an extra-curricular event
 */
export async function deleteEvent(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}
