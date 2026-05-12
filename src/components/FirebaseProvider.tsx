import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string;
  role: string;
  rewardPoints: number;
}

interface FirebaseContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const FirebaseContext = createContext<FirebaseContextType>({ user: null, profile: null, loading: true });

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: any = null;
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch profile
        const profileRef = doc(db, 'users', currentUser.uid);
        unsubscribeProfile = onSnapshot(profileRef, (profileSnap) => {
          if (profileSnap.exists()) {
            setProfile(profileSnap.data() as UserProfile);
          } else {
            setProfile({
              displayName: currentUser.displayName || 'Anonymous',
              email: currentUser.email || '',
              photoURL: currentUser.photoURL || '',
              role: 'member',
              rewardPoints: 0,
            });
          }
        });
      } else {
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  return (
    <FirebaseContext.Provider value={{ user, profile, loading }}>
      {children}
    </FirebaseContext.Provider>
  );
};
