import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import { CourtUser, UserRole, PERMISSIONS, ROLE_PERMISSIONS } from '../types/court';

interface CourtAuthContextType {
  currentUser: User | null;
  courtUser: CourtUser | null;
  loading: boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  isJudge: boolean;
  isClerk: boolean;
  isAdmin: boolean;
}

const CourtAuthContext = createContext<CourtAuthContextType | undefined>(undefined);

export const useCourtAuth = () => {
  const context = useContext(CourtAuthContext);
  if (!context) {
    throw new Error('useCourtAuth must be used within CourtAuthProvider');
  }
  return context;
};

interface CourtAuthProviderProps {
  children: ReactNode;
}

export const CourtAuthProvider: React.FC<CourtAuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [courtUser, setCourtUser] = useState<CourtUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch court user profile from Firestore
        // For now, using mock data - replace with actual Firestore call
        const mockCourtUser: CourtUser = {
          uid: user.uid,
          email: user.email || '',
          name: user.displayName || 'Judge User',
          role: 'judge', // This should come from Firestore
          courtId: 'DLI-001',
          courtName: 'District Court, Delhi',
          designation: 'District Judge',
          photoURL: user.photoURL || undefined,
          phone: '+91 9876543210',
          createdAt: new Date(),
          lastLogin: new Date(),
          permissions: ROLE_PERMISSIONS.judge,
          isActive: true,
        };
        setCourtUser(mockCourtUser);
      } else {
        setCourtUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const hasPermission = (permission: string): boolean => {
    if (!courtUser) return false;
    return courtUser.permissions.includes(permission);
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!courtUser) return false;
    if (Array.isArray(role)) {
      return role.includes(courtUser.role);
    }
    return courtUser.role === role;
  };

  const value: CourtAuthContextType = {
    currentUser,
    courtUser,
    loading,
    hasPermission,
    hasRole,
    isJudge: courtUser?.role === 'judge',
    isClerk: courtUser?.role === 'clerk',
    isAdmin: courtUser?.role === 'admin',
  };

  return (
    <CourtAuthContext.Provider value={value}>
      {!loading && children}
    </CourtAuthContext.Provider>
  );
};

// Higher-Order Component for protected routes
export const withPermission = (
  Component: React.ComponentType<any>,
  requiredPermission: string
) => {
  return (props: any) => {
    const { hasPermission } = useCourtAuth();
    
    if (!hasPermission(requiredPermission)) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
            <p className="text-slate-600">
              You don't have permission to access this feature.
            </p>
            <p className="text-sm text-slate-500 mt-4">
              Required permission: <code className="bg-slate-100 px-2 py-1 rounded">{requiredPermission}</code>
            </p>
          </div>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
};

// Hook for checking permissions in components
export const usePermission = (permission: string): boolean => {
  const { hasPermission } = useCourtAuth();
  return hasPermission(permission);
};

// Hook for checking roles in components
export const useRole = (role: UserRole | UserRole[]): boolean => {
  const { hasRole } = useCourtAuth();
  return hasRole(role);
};
