// Firebase authentication integration - Firebase required for sign-in
// Based on Firebase integration blueprint for Ovento platform

import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider, type Auth, type User } from "firebase/auth";

// Firebase configuration from environment variables
let firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if Firebase environment variables are available
let isFirebaseConfigured = !!(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID &&
  import.meta.env.VITE_FIREBASE_STORAGE_BUCKET &&
  import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID &&
  import.meta.env.VITE_FIREBASE_APP_ID
);

// Function to try loading Firebase config from server
async function loadFirebaseConfigFromServer() {
  try {
    const response = await fetch('/api/config/firebase');
    if (response.ok) {
      const serverConfig = await response.json();
      if (serverConfig.configured && serverConfig.apiKey) {
        firebaseConfig = serverConfig;
        isFirebaseConfigured = true;
        console.log("🔥 Using Firebase config from server");
        return true;
      } else {
        console.log("🔥 Firebase not configured on server");
        return false;
      }
    }
  } catch (error) {
    console.log("⚠️ Could not fetch Firebase config from server:", error);
  }
  return false;
}

let app: FirebaseApp | null = null;
let firebaseAuthInstance: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

// Initialize Firebase with server config fallback
async function initializeFirebase() {
  // If not configured with VITE variables, try loading from server
  if (!isFirebaseConfigured) {
    const serverConfigLoaded = await loadFirebaseConfigFromServer();
    if (!serverConfigLoaded) {
      console.log("🔥 Firebase not configured - running without authentication");
      return false;
    }
  }

  // Initialize Firebase if configuration is available
  if (isFirebaseConfigured) {
    try {
      app = initializeApp(firebaseConfig);
      firebaseAuthInstance = getAuth(app);
      googleProvider = new GoogleAuthProvider();
      console.log("🔥 Firebase initialized successfully");
      return true;
    } catch (error) {
      console.error("🔥 Firebase initialization failed:", error);
      return false;
    }
  } else {
    console.log("🔥 Firebase not configured - running without authentication");
    return false;
  }
}

// Initialize Firebase (will be called when needed)
let firebaseInitPromise: Promise<boolean> | null = null;

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

// Firebase authentication service - no mock authentication
export const firebaseAuthService = {
  // Check if Firebase is properly initialized and ready
  isReady: () => isFirebaseConfigured && firebaseAuthInstance && googleProvider,
  
  // Get current Firebase auth instance
  getAuth: () => firebaseAuthInstance,
  
  // Check if user is currently signed in
  isSignedIn: () => firebaseAuthInstance?.currentUser !== null,
  
  // Get current user
  getCurrentUser: () => firebaseAuthService.isReady() ? firebaseAuthInstance!.currentUser : null,
};

// Firebase-only authentication service - requires Firebase configuration
export const authService = {
  isFirebaseEnabled: false,
  
  // Initialize Firebase - graceful fallback if not configured
  async ensureFirebaseInitialized() {
    if (!firebaseInitPromise) {
      firebaseInitPromise = initializeFirebase();
    }
    const initSuccess = await firebaseInitPromise;
    this.isFirebaseEnabled = initSuccess && isFirebaseConfigured && firebaseAuth.isAvailable();
    
    return this.isFirebaseEnabled;
  },

  // Firebase Google sign-in - only method available
  signInWithGoogle: async () => {
    await authService.ensureFirebaseInitialized();
    
    if (!isFirebaseConfigured || !firebaseAuth.isAvailable()) {
      throw new Error("Firebase authentication is not available. Please configure Firebase to sign in.");
    }
    
    try {
      console.log("🔥 Attempting Firebase Google sign-in...");
      const result = await firebaseAuth.signInWithGoogle();
      console.log("✅ Firebase authentication successful");
      return result;
    } catch (error) {
      console.error("🔥 Firebase sign-in failed:", error);
      throw error;
    }
  },

  // Firebase sign-out
  signOut: async () => {
    if (!firebaseAuth.isAvailable()) {
      console.warn("⚠️ Cannot sign out - Firebase not available");
      return;
    }
    
    try {
      console.log("🔥 Signing out from Firebase...");
      await firebaseAuth.signOut();
      console.log("✅ Sign-out successful");
    } catch (error) {
      console.error("⚠️ Firebase sign-out failed:", error);
      throw error;
    }
  },

  // Firebase auth state listener with server sync
  onAuthStateChanged: (callback: (user: any) => void) => {
    let unsubscribeRef: (() => void) | null = null;
    
    // Initialize Firebase asynchronously
    authService.ensureFirebaseInitialized().then(() => {
      if (isFirebaseConfigured && firebaseAuth.isAvailable()) {
        console.log("🔥 Setting up Firebase auth state listener...");
        
        unsubscribeRef = firebaseAuth.onAuthStateChanged(async (user) => {
          if (user) {
            // Sync user with server using secure ID token
            try {
              const idToken = await user.getIdToken();
              const response = await fetch('/api/auth/firebase-user', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${idToken}`,
                  'Content-Type': 'application/json',
                },
              });
              
              if (response.ok) {
                console.log("✅ User authenticated and synced with server");
              } else {
                const error = await response.text();
                console.error("⚠️ Failed to authenticate with server:", error);
              }
            } catch (error) {
              console.error("⚠️ Failed to get ID token or sync with server:", error);
            }
          }
          callback(user);
        });
      } else {
        console.error("🔥 Firebase not configured - authentication unavailable");
        callback(null);
      }
    }).catch((error) => {
      console.error("🔥 Failed to initialize Firebase authentication:", error);
      callback(null);
    });

    // Return unsubscribe function
    return () => {
      if (unsubscribeRef) {
        unsubscribeRef();
      }
    };
  },

  // Get current user from Firebase only
  getCurrentUser: () => {
    if (firebaseAuth.isAvailable()) {
      return firebaseAuth.getCurrentUser();
    }
    return null;
  },

  // Check if Firebase is configured (for UI display)
  isFirebaseConfigured: () => isFirebaseConfigured,
  
  // Check if user is currently authenticated
  isAuthenticated: () => {
    return firebaseAuth.isAvailable() && firebaseAuth.getCurrentUser() !== null;
  },

  // Get current authentication method (always firebase now)
  getAuthMethod: () => {
    return isFirebaseConfigured ? 'firebase' : 'none';
  }
};

export default authService;