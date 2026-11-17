import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface SiteSettings {
  announcementActive?: boolean;
  announcementKn?: string;
  announcementEn?: string;
  announcementLink?: string;
  emergencyNotice?: string;

  // YouTube Live Stream Setup
  liveStreamActive?: boolean;
  liveStreamYoutubeUrl?: string;
  liveStreamTitleKn?: string;
  liveStreamTitleEn?: string;
  liveStreamDescriptionKn?: string;
  liveStreamDescriptionEn?: string;

  updatedAt?: any;
}

export function subscribeToSiteSettings(
  callback: (settings: SiteSettings) => void
): () => void {
  const docRef = doc(db, 'site_settings', 'general');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as SiteSettings);
      } else {
        callback({});
      }
    },
    (err) => {
      console.warn('Site settings subscription notice:', err.message);
    }
  );
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
  const docRef = doc(db, 'site_settings', 'general');
  await setDoc(docRef, { ...settings, updatedAt: new Date().toISOString() }, { merge: true });
}
