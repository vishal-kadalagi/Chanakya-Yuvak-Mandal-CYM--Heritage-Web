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

export interface HistoryMilestoneDoc {
  id: string;
  year: number;
  samvatsaraEn?: string;
  samvatsaraKn?: string;
  titleEn: string;
  titleKn: string;
  summaryEn?: string;
  summaryKn?: string;
  pandalThemeEn?: string;
  pandalThemeKn?: string;
  datesMuhurtaEn?: string;
  datesMuhurtaKn?: string;
  shilpiEn?: string;
  shilpiKn?: string;
  highlightsEn?: string[];
  highlightsKn?: string[];
  coverImage?: string;
  mediaType?: 'image' | 'video';
  showInHero?: boolean;
  showIn35mm?: boolean;
  showInGallery?: boolean;
  isActive?: boolean;
  order?: number;
  createdAt?: any;
}

const COLLECTION_NAME = 'history_milestones';

/**
 * Subscribe to all history milestones in real-time
 */
export function subscribeToHistory(
  callback: (items: HistoryMilestoneDoc[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(collection(db, COLLECTION_NAME), orderBy('year', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: HistoryMilestoneDoc[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<HistoryMilestoneDoc, 'id'>),
      }));
      callback(items);
    },
    (err) => {
      console.warn('Firestore history subscription notice:', err.message);
      const fallbackQuery = collection(db, COLLECTION_NAME);
      return onSnapshot(
        fallbackQuery,
        (snapshot) => {
          const items: HistoryMilestoneDoc[] = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<HistoryMilestoneDoc, 'id'>),
          }));
          items.sort((a, b) => b.year - a.year);
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
 * Add a new history milestone
 */
export async function addHistoryMilestone(
  item: Omit<HistoryMilestoneDoc, 'id' | 'createdAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...item,
    isActive: item.isActive ?? true,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Update an existing history milestone
 */
export async function updateHistoryMilestone(
  id: string,
  updates: Partial<Omit<HistoryMilestoneDoc, 'id' | 'createdAt'>>
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, updates);
}

/**
 * Delete a history milestone
 */
export async function deleteHistoryMilestone(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}
