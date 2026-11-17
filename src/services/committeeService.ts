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

export interface CommitteeMemberDoc {
  id: string;
  nameEn: string;
  nameKn: string;
  roleEn: string;
  roleKn: string;
  category: 'office' | 'core' | 'youth' | 'advisory';
  servicePeriodEn: string;
  servicePeriodKn: string;
  photoUrl?: string;
  isFounding?: boolean;
  order?: number;
  isActive?: boolean;
  createdAt?: any;
}

const COLLECTION_NAME = 'committee_members';

export const COMMITTEE_ROLE_HIERARCHY = [
  'ಅಧ್ಯಕ್ಷರು',
  'ಉಪಾಧ್ಯಕ್ಷರು',
  'ಖಜಾಂಚಿ',
  'ಗೌರವ ಸಲಹೆಗಾರರು',
  'ಕಾರ್ಯದರ್ಶಿ',
  'ಕಮಿಟಿ ಸದಸ್ಯರು',
] as const;

/**
 * Strict role rank based on user-specified mandatory hierarchy:
 * 1. ಅಧ್ಯಕ್ಷರು (President)
 * 2. ಉಪಾಧ್ಯಕ್ಷರು (Vice President)
 * 3. ಖಜಾಂಚಿ (Treasurer)
 * 4. ಗೌರವ ಸಲಹೆಗಾರರು (Advisor)
 * 5. ಕಾರ್ಯದರ್ಶಿ (Secretary)
 * 6. ಕಮಿಟಿ ಸದಸ್ಯರು (Committee Member)
 * 7. Other coordinators/leads
 * 8. Other custom
 */
export function getCommitteeRoleRank(member: { roleKn?: string; roleEn?: string }): number {
  const roleKn = (member.roleKn || '').trim();
  const roleEn = (member.roleEn || '').toLowerCase().trim();

  // 2. Check Vice President FIRST so it is not caught by 'president' / 'ಅಧ್ಯಕ್ಷ'
  if (
    roleKn.includes('ಉಪಾಧ್ಯಕ್ಷ') ||
    roleEn.includes('vice')
  ) {
    return 2;
  }

  // 1. ಅಧ್ಯಕ್ಷರು (President / Honorary President)
  if (
    roleKn.includes('ಅಧ್ಯಕ್ಷ') ||
    roleEn.includes('president')
  ) {
    return 1;
  }

  // 3. ಖಜಾಂಚಿ (Treasurer / Joint Treasurer)
  if (
    roleKn.includes('ಖಜಾಂಚಿ') ||
    roleEn.includes('treasurer')
  ) {
    return 3;
  }

  // 4. ಗೌರವ ಸಲಹೆಗಾರರು (Advisor / Chief Advisor)
  if (
    roleKn.includes('ಸಲಹೆಗಾರ') ||
    roleEn.includes('advisor') ||
    roleEn.includes('adviser')
  ) {
    return 4;
  }

  // 5. ಕಾರ್ಯದರ್ಶಿ (Secretary / General Secretary / Joint Secretary)
  if (
    roleKn.includes('ಕಾರ್ಯದರ್ಶಿ') ||
    roleEn.includes('secretary')
  ) {
    return 5;
  }

  // 6. ಕಮಿಟಿ ಸದಸ್ಯರು (Committee Member)
  if (
    roleKn.includes('ಸದಸ್ಯ') ||
    roleEn.includes('member')
  ) {
    return 6;
  }

  // 7. Coordinators / Leads (ಸಂಚಾಲಕರು, ಪ್ರಮುಖರು)
  if (
    roleKn.includes('ಸಂಚಾಲಕ') ||
    roleKn.includes('ಪ್ರಮುಖ') ||
    roleEn.includes('coordinator') ||
    roleEn.includes('lead')
  ) {
    return 7;
  }

  return 8;
}

/**
 * Deterministically sorts committee members by manual priority order first (if set),
 * then strict role rank, then name.
 */
export function sortCommitteeMembers<
  T extends { roleKn?: string; roleEn?: string; order?: number; nameKn?: string; nameEn?: string }
>(members: T[]): T[] {
  return [...members].sort((a, b) => {
    const orderA = a.order ?? 999;
    const orderB = b.order ?? 999;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    const rankA = getCommitteeRoleRank(a);
    const rankB = getCommitteeRoleRank(b);
    if (rankA !== rankB) {
      return rankA - rankB;
    }
    return (a.nameKn || a.nameEn || '').localeCompare(b.nameKn || b.nameEn || '');
  });
}

/**
 * Subscribe to all committee members in real-time (for Admin Dashboard and Public Site)
 */
export function subscribeToCommittee(
  callback: (members: CommitteeMemberDoc[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(collection(db, COLLECTION_NAME), orderBy('order', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: CommitteeMemberDoc[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<CommitteeMemberDoc, 'id'>),
      }));
      callback(sortCommitteeMembers(items));
    },
    (err) => {
      console.warn('Firestore committee subscription notice:', err.message);
      // Fallback query if index on 'order' is not yet built
      const fallbackQuery = collection(db, COLLECTION_NAME);
      return onSnapshot(
        fallbackQuery,
        (snapshot) => {
          const items: CommitteeMemberDoc[] = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<CommitteeMemberDoc, 'id'>),
          }));
          callback(sortCommitteeMembers(items));
        },
        (e) => {
          if (onError) onError(e);
        }
      );
    }
  );
}

/**
 * Add a new committee member
 */
export async function addCommitteeMember(
  member: Omit<CommitteeMemberDoc, 'id' | 'createdAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...member,
    isActive: member.isActive ?? true,
    order: member.order ?? 1,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Update an existing committee member
 */
export async function updateCommitteeMember(
  id: string,
  updates: Partial<Omit<CommitteeMemberDoc, 'id' | 'createdAt'>>
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, updates);
}

/**
 * Delete a committee member
 */
export async function deleteCommitteeMember(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}
