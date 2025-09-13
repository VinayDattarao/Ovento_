// Firebase integration with fallback to mock authentication
// Based on Firebase integration blueprint for Ovento platform

import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider, type Auth, type User } from "firebase/auth";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if Firebase environment variables are available
const isFirebaseConfigured = !!(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID &&
  import.meta.env.VITE_FIREBASE_STORAGE_BUCKET &&
  import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID &&
  import.meta.env.VITE_FIREBASE_APP_ID
);

let app: FirebaseApp | null = null;
let firebaseAuthInstance: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

// Initialize Firebase only if configuration is available
if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    firebaseAuthInstance = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    console.log("🔥 Firebase initialized successfully");
  } catch (error) {
    console.warn("🔥 Firebase initialization failed:", error);
    console.log("🟡 Falling back to mock authentication");
  }
} else {
  console.log("🟡 Firebase not configured - using mock authentication");
}

// Firebase authentication functions
export const firebaseAuth = {
  // Check if Firebase is available
  isAvailable: () => !!firebaseAuthInstance && !!googleProvider,

  // Sign in with Google
  signInWithGoogle: async (): Promise<User | null> => {
    if (!firebaseAuthInstance || !googleProvider) {
      throw new Error("Firebase not configured");
    }
    try {
      const result = await signInWithPopup(firebaseAuthInstance, googleProvider);
      return result.user;
    } catch (error) {
      console.error("Firebase sign-in error:", error);
      throw error;
    }
  },

  // Sign out
  signOut: async (): Promise<void> => {
    if (!firebaseAuthInstance) {
      throw new Error("Firebase not configured");
    }
    try {
      await signOut(firebaseAuthInstance);
    } catch (error) {
      console.error("Firebase sign-out error:", error);
      throw error;
    }
  },

  // Listen to auth state changes
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    if (!firebaseAuthInstance) {
      return () => {}; // Return empty unsubscribe function
    }
    return onAuthStateChanged(firebaseAuthInstance, callback);
  },

  // Get current user
  getCurrentUser: (): User | null => {
    return firebaseAuthInstance?.currentUser || null;
  }
};

// Mock authentication for fallback
const mockUser = {
  uid: "mock-user-1",
  email: "demo@example.com",
  displayName: "Demo User",
  photoURL: null,
  emailVerified: true,
};

// Store authentication listeners for mock auth
const mockAuthListeners = new Set<(user: any) => void>();

// Mock authentication functions
export const mockAuth = {
  currentUser: null as any,
  
  // Notify all listeners of auth state change
  notifyListeners: (user: any) => {
    mockAuthListeners.forEach(callback => {
      try {
        callback(user);
      } catch (error) {
        console.error('Error in mock auth listener:', error);
      }
    });
  },
  
  signInWithGoogle: async () => {
    mockAuth.currentUser = mockUser;
    // Store in localStorage for persistence
    localStorage.setItem('mockUser', JSON.stringify(mockUser));
    
    // Notify all listeners immediately
    mockAuth.notifyListeners(mockUser);
    
    return mockUser;
  },

  signOut: async () => {
    mockAuth.currentUser = null;
    localStorage.removeItem('mockUser');
    
    // Notify all listeners immediately
    mockAuth.notifyListeners(null);
  },

  onAuthStateChanged: (callback: (user: any) => void) => {
    // Add listener to the set
    mockAuthListeners.add(callback);
    
    // Check for stored user on initialization and call callback immediately
    const storedUser = localStorage.getItem('mockUser');
    if (storedUser) {
      mockAuth.currentUser = JSON.parse(storedUser);
      // Use setTimeout to ensure callback is called asynchronously
      setTimeout(() => callback(mockAuth.currentUser), 0);
    } else {
      // Use setTimeout to ensure callback is called asynchronously
      setTimeout(() => callback(null), 0);
    }
    
    // Return unsubscribe function that removes the listener
    return () => {
      mockAuthListeners.delete(callback);
    };
  },

  getCurrentUser: () => mockAuth.currentUser
};

// Unified auth interface that uses Firebase when available, falls back to mock
export const authService = {
  isFirebaseEnabled: isFirebaseConfigured && firebaseAuth.isAvailable(),

  signInWithGoogle: async () => {
    if (authService.isFirebaseEnabled) {
      return await firebaseAuth.signInWithGoogle();
    } else {
      return await mockAuth.signInWithGoogle();
    }
  },

  signOut: async () => {
    if (authService.isFirebaseEnabled) {
      await firebaseAuth.signOut();
    } else {
      await mockAuth.signOut();
    }
  },

  onAuthStateChanged: (callback: (user: any) => void) => {
    if (authService.isFirebaseEnabled) {
      return firebaseAuth.onAuthStateChanged(callback);
    } else {
      return mockAuth.onAuthStateChanged(callback);
    }
  },

  getCurrentUser: () => {
    if (authService.isFirebaseEnabled) {
      return firebaseAuth.getCurrentUser();
    } else {
      return mockAuth.getCurrentUser();
    }
  }
};

export default authService;