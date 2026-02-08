import React, { createContext, useContext, useState, useEffect } from 'react';
import { Case } from '../types/court';
import { subscribeToRealTimeCases } from '../services/casesService';

interface CasesContextType {
  cases: Case[];
  loading: boolean;
  error: string | null;
  getCaseById: (caseId: string) => Case | undefined;
  getCasesByUserId: (userId: string) => Case[];
  refreshCases: () => void;
}

const CasesContext = createContext<CasesContextType | undefined>(undefined);

export const CasesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unsubscribe, setUnsubscribe] = useState<(() => void) | null>(null);

  // Subscribe to real-time case updates
  useEffect(() => {
    try {
      const unsub = subscribeToRealTimeCases(
        (updatedCases) => {
          setCases(updatedCases);
          setLoading(false);
          setError(null);
        },
        [],
        (err) => {
          const message = err?.code === 'permission-denied'
            ? 'Permission denied. Please update Firestore rules and confirm you are logged in.'
            : 'Failed to load cases.';
          setError(message);
          setLoading(false);
        }
      );

      setUnsubscribe(() => unsub);

      // Cleanup subscription on unmount
      return () => {
        if (unsub) {
          unsub();
        }
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cases');
      setLoading(false);
    }
  }, []);

  const getCaseById = (caseId: string): Case | undefined => {
    return cases.find(c => c.id === caseId);
  };

  const getCasesByUserId = (userId: string): Case[] => {
    return cases.filter(c =>
      c.respondent?.citizenPortalUserId === userId ||
      c.createdBy === userId ||
      c.lastModifiedBy === userId
    );
  };

  const refreshCases = () => {
    // Unsubscribe and resubscribe to get fresh data
    if (unsubscribe) {
      unsubscribe();
    }

    setLoading(true);
    const unsub = subscribeToRealTimeCases((updatedCases) => {
      setCases(updatedCases);
      setLoading(false);
    });

    setUnsubscribe(() => unsub);
  };

  const value: CasesContextType = {
    cases,
    loading,
    error,
    getCaseById,
    getCasesByUserId,
    refreshCases,
  };

  return (
    <CasesContext.Provider value={value}>
      {children}
    </CasesContext.Provider>
  );
};

export const useCases = () => {
  const context = useContext(CasesContext);
  if (!context) {
    throw new Error('useCases must be used within a CasesProvider');
  }
  return context;
};
