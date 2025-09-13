import { useState, useEffect } from "react";
import authService from "@/lib/firebase";

interface User {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  profileImageUrl?: string;
  photoURL?: string;
  skills?: string[];
  interests?: string[];
  bio?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        // Transform Firebase user to our User interface
        const transformedUser: User = {
          id: firebaseUser.uid || firebaseUser.id,
          email: firebaseUser.email || undefined,
          displayName: firebaseUser.displayName || undefined,
          firstName: firebaseUser.displayName?.split(' ')[0] || undefined,
          lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || undefined,
          profileImageUrl: firebaseUser.photoURL || undefined,
          photoURL: firebaseUser.photoURL || undefined,
          skills: [],
          interests: [],
          bio: undefined,
        };
        setUser(transformedUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.signInWithGoogle();
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await authService.signOut();
    } catch (err) {
      setError(err as Error);
    }
  };

  const isAuthenticated = !!user;
  
  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    signInWithGoogle,
    signOut,
    isFirebaseEnabled: authService.isFirebaseEnabled,
  };
}
