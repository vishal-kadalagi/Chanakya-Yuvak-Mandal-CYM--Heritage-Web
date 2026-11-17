import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MediaItem } from '../types/media';

const COLLECTION_NAME = 'media_items';

/**
 * Subscribe to all media items in real-time (for Admin Dashboard)
 */
export function subscribeToAllMedia(
  callback: (items: MediaItem[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: MediaItem[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<MediaItem, 'id'>),
      }));
      callback(items);
    },
    (err) => {
      console.warn('Firestore subscription notice:', err.message);
      if (onError) onError(err);
    }
  );
}

/**
 * Subscribe to active public media items in real-time (for Public Website)
 * Supports multi-placement arrays and backwards-compatible single placement string.
 */
export function subscribeToPublicMedia(
  placement?: string,
  callback?: (items: MediaItem[]) => void
): () => void {
  // Query active items in Firestore
  const q = query(
    collection(db, COLLECTION_NAME),
    where('isActive', '==', true)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: MediaItem[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<MediaItem, 'id'>),
      }));

      let filtered = items;
      if (placement) {
        filtered = items.filter((item) => {
          // 1. Check multi-select placements array
          if (Array.isArray(item.placements) && item.placements.includes(placement as any)) {
            return true;
          }
          // 2. Check legacy single placement string
          if (item.placement === placement) {
            return true;
          }
          // 3. For gallery, also include untagged legacy items
          if (
            placement === 'gallery' &&
            !item.placement &&
            (!item.placements || item.placements.length === 0)
          ) {
            return true;
          }
          return false;
        });

        // 35mm Reel (carousel) Smart Hybrid Fallback:
        // If dedicated carousel items are fewer than 8, complement with active media so reel stays vibrant
        if (placement === 'carousel' && filtered.length < 8 && items.length > 0) {
          const remaining = items.filter((i) => !filtered.some((f) => f.id === i.id));
          filtered = [...filtered, ...remaining.slice(0, 8 - filtered.length)];
        }
      }

      // Sort by order ascending or createdAt descending
      filtered.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      if (callback) callback(filtered);
    },
    (err) => {
      console.warn('Firestore public media read notice:', err.message);
    }
  );
}

/**
 * Add a new media item (Create)
 */
export async function addMediaItem(
  item: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const now = Date.now();
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...item,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
}

/**
 * Update an existing media item (Update)
 */
export async function updateMediaItem(
  id: string,
  updates: Partial<Omit<MediaItem, 'id' | 'createdAt'>>
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Date.now(),
  });
}

/**
 * Delete a media item (Delete)
 */
export async function deleteMediaItem(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

/**
 * Toggle media active/hidden status
 */
export async function toggleMediaActive(
  id: string,
  currentStatus: boolean
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    isActive: !currentStatus,
    updatedAt: Date.now(),
  });
}
