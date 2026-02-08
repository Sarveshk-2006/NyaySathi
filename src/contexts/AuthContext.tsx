import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase'; // Import auth from your firebase.ts file
import { Loader2 } from 'lucide-react';

// Define the shape of your context
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  userRole: 'citizen' | 'court' | null;
}

// Create the context
const AuthContext = createContext<AuthContextType>({ 
  currentUser: null, 
  loading: true,
  userRole: null
});

// Create a custom hook to easily use the context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Create the AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'citizen' | 'court' | null>(null);

  useEffect(() => {
    // This is the magic! Firebase checks the user's login state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed, user:", user ? user.email : 'null');
      setCurrentUser(user);

      if (!user) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      try {
        const profileRef = doc(db, 'users', user.uid);
        const profileSnap = await getDoc(profileRef);

        if (!profileSnap.exists()) {
          const defaultRole: 'citizen' = 'citizen';
          await setDoc(profileRef, {
            uid: user.uid,
            email: user.email || '',
            role: defaultRole,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp()
          });
          setUserRole(defaultRole);
        } else {
          const data = profileSnap.data();
          const role = data?.role === 'court' ? 'court' : 'citizen';
          setUserRole(role);
          await setDoc(profileRef, { lastLogin: serverTimestamp() }, { merge: true });
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
        setUserRole('citizen');
      } finally {
        setLoading(false);
      }
    });

    // Cleanup the listener when the component unmounts
    return unsubscribe;
  }, []);

  // Show a full-screen loader while Firebase is checking the user's status
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  // Once loading is done, provide the user status to the rest of the app
  const value = {
    currentUser,
    loading,
    userRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};