import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  getDocs,
  setDoc,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Case } from '../types/court';

const CASES_COLLECTION = 'cases';

/**
 * Real-time listener for cases - subscribes to Firestore updates
 * @param callback Function to call when cases change
 * @param constraints Optional Firestore query constraints (e.g., where, orderBy)
 * @returns Unsubscribe function
 */
export const subscribeToRealTimeCases = (
  callback: (cases: Case[]) => void,
  constraints: QueryConstraint[] = [],
  onError?: (error: any) => void
): (() => void) => {
  try {
    const q = query(collection(db, CASES_COLLECTION), ...constraints);
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const cases: Case[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          cases.push({
            ...data,
            id: doc.id,
            filingDate: data.filingDate?.toDate?.() || new Date(data.filingDate),
            nextHearingDate: data.nextHearingDate?.toDate?.() || new Date(data.nextHearingDate),
            lastHearingDate: data.lastHearingDate?.toDate?.() || new Date(data.lastHearingDate),
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
          } as Case);
        });
        callback(cases);
      },
      (error) => {
        // Handle permission errors gracefully
        if (error.code === 'permission-denied') {
          console.error(
            'Firestore Permission Denied. Please check:',
            '1. Your Firestore security rules',
            '2. That you are logged in',
            '3. See FIRESTORE_RULES_FIX.md for help'
          );
        } else {
          console.error('Error subscribing to cases:', error);
        }
        onError?.(error);
        // Return empty array instead of crashing
        callback([]);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up real-time listener:', error);
    return () => {};
  }
};

/**
 * Update case status in Firestore - triggers real-time updates for all subscribers
 */
export const updateCaseStatus = async (
  caseId: string,
  newStatus: string,
  userId: string,
  userName?: string
): Promise<void> => {
  try {
    const caseRef = doc(db, CASES_COLLECTION, caseId);
    await updateDoc(caseRef, {
      status: newStatus,
      lastModifiedBy: userId,
      lastModifiedByName: userName,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating case status:', error);
    throw error;
  }
};

/**
 * Update any case field in Firestore
 */
export const updateCaseField = async (
  caseId: string,
  updates: Partial<Case>,
  userId: string,
  userName?: string
): Promise<void> => {
  try {
    const caseRef = doc(db, CASES_COLLECTION, caseId);
    await updateDoc(caseRef, {
      ...updates,
      lastModifiedBy: userId,
      lastModifiedByName: userName,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating case:', error);
    throw error;
  }
};

/**
 * Create a new case in Firestore
 */
export const createCase = async (
  caseData: Omit<Case, 'id'>,
  userId: string,
  userName?: string
): Promise<string> => {
  try {
    const caseRef = doc(collection(db, CASES_COLLECTION));
    const newCaseData = {
      ...caseData,
      createdBy: userId,
      createdByName: userName,
      lastModifiedBy: userId,
      lastModifiedByName: userName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(caseRef, newCaseData);
    return caseRef.id;
  } catch (error) {
    console.error('Error creating case:', error);
    throw error;
  }
};

/**
 * Get all cases for a specific court
 */
export const getCasesForCourt = (courtId: string) => {
  try {
    const q = query(
      collection(db, CASES_COLLECTION),
      where('courtId', '==', courtId)
    );
    
    return onSnapshot(q, (snapshot) => {
      const cases: Case[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        cases.push({
          ...data,
          id: doc.id,
          filingDate: data.filingDate?.toDate?.() || new Date(data.filingDate),
          nextHearingDate: data.nextHearingDate?.toDate?.() || new Date(data.nextHearingDate),
          lastHearingDate: data.lastHearingDate?.toDate?.() || new Date(data.lastHearingDate),
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
        } as Case);
      });
      return cases;
    });
  } catch (error) {
    console.error('Error getting cases for court:', error);
    throw error;
  }
};

/**
 * Get all cases involving a specific citizen (as a party or case creator)
 */
export const getCasesForCitizen = (citizenPortalUserId: string) => {
  try {
    const q = query(
      collection(db, CASES_COLLECTION),
      where('respondent.citizenPortalUserId', '==', citizenPortalUserId)
    );
    
    return onSnapshot(q, (snapshot) => {
      const cases: Case[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        cases.push({
          ...data,
          id: doc.id,
          filingDate: data.filingDate?.toDate?.() || new Date(data.filingDate),
          nextHearingDate: data.nextHearingDate?.toDate?.() || new Date(data.nextHearingDate),
          lastHearingDate: data.lastHearingDate?.toDate?.() || new Date(data.lastHearingDate),
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
        } as Case);
      });
      return cases;
    });
  } catch (error) {
    console.error('Error getting cases for citizen:', error);
    throw error;
  }
};

/**
 * Migrate mock cases or cases.json data to Firestore
 * This is a one-time operation to populate Firestore
 */
export const migrateCasesToFirestore = async (
  cases: any[],
  userId: string,
  userName?: string
): Promise<void> => {
  try {
    for (const caseData of cases) {
      const caseId = caseData.id || caseData.caseNumber || `case-${Date.now()}-${Math.random()}`;
      const caseRef = doc(db, CASES_COLLECTION, String(caseId));
      
      const firestoreData = {
        ...caseData,
        id: caseId,
        createdBy: userId,
        createdByName: userName,
        lastModifiedBy: userId,
        lastModifiedByName: userName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Ensure dates are properly formatted
        filingDate: caseData.filingDate instanceof Date 
          ? Timestamp.fromDate(caseData.filingDate) 
          : caseData.filingDate,
        nextHearingDate: caseData.nextHearingDate instanceof Date
          ? Timestamp.fromDate(caseData.nextHearingDate)
          : caseData.nextHearingDate,
        lastHearingDate: caseData.lastHearingDate instanceof Date
          ? Timestamp.fromDate(caseData.lastHearingDate)
          : caseData.lastHearingDate,
      };
      
      await setDoc(caseRef, firestoreData);
    }
  } catch (error) {
    console.error('Error migrating cases to Firestore:', error);
    throw error;
  }
};

/**
 * Delete a case from Firestore
 */
export const deleteCase = async (caseId: string): Promise<void> => {
  try {
    const caseRef = doc(db, CASES_COLLECTION, caseId);
    // Instead of actually deleting, mark as archived
    await updateDoc(caseRef, {
      isArchived: true,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error deleting case:', error);
    throw error;
  }
};
