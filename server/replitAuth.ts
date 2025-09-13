// Firebase authentication for EventHorizon platform
// Requires Firebase configuration - no mock authentication
import session from "express-session";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";
import MemoryStore from "memorystore";
import { initializeApp as initializeAdminApp, cert, getApps } from "firebase-admin/app";
import { getAuth as getAdminAuth } from "firebase-admin/auth";

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    // Check for Firebase service account key
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const projectId = process.env.FIREBASE_PROJECT_ID;
    
    if (!projectId) {
      throw new Error("FIREBASE_PROJECT_ID environment variable is required");
    }
    
    if (serviceAccountKey) {
      // Use service account key if provided
      const serviceAccount = JSON.parse(serviceAccountKey);
      initializeAdminApp({
        credential: cert(serviceAccount),
        projectId,
      });
    } else {
      // Use default credentials (for development)
      initializeAdminApp({
        projectId,
      });
    }
    console.log("🔥 Firebase Admin SDK initialized");
  }
  return getAdminAuth();
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Require SESSION_SECRET in production
  const sessionSecret = process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === 'production' && !sessionSecret) {
    throw new Error("SESSION_SECRET environment variable is required in production");
  }
  
  // Use memory store for sessions
  console.log("🔧 Setting up session store for Firebase authentication");
  const memoryStoreConstructor = MemoryStore(session);
  const sessionStore = new memoryStoreConstructor({
    checkPeriod: 86400000, // Prune expired entries every 24h
  });
  
  return session({
    secret: sessionSecret || 'firebase-session-secret-dev',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: sessionTtl,
    },
  });
}

// Firebase authentication implementation

export async function setupAuth(app: Express) {
  console.log("🔒 Setting up Firebase authentication system");
  
  app.set("trust proxy", 1);
  
  // Setup session middleware
  app.use(getSession());
  
  // Firebase authentication endpoints
  app.get("/api/login", (req, res) => {
    // Redirect to frontend for Firebase authentication
    res.redirect("/?auth=required");
  });

  app.get("/api/logout", (req, res) => {
    console.log("🔥 Clearing user session");
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
      }
      res.redirect("/");
    });
  });
  
  // Secure endpoint to authenticate Firebase user via ID token verification
  app.post("/api/auth/firebase-user", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Authorization header with Bearer token required" });
      }
      
      const idToken = authHeader.split('Bearer ')[1];
      if (!idToken) {
        return res.status(401).json({ message: "ID token required" });
      }
      
      // Verify the Firebase ID token
      const adminAuth = initializeFirebaseAdmin();
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      
      // Extract verified user data from token
      const { uid, email, name, picture } = decodedToken;
      
      if (!uid || !email) {
        return res.status(400).json({ message: "Invalid token - missing required fields" });
      }
      
      // Create user object for session using verified data only
      const user = {
        id: uid,
        email,
        firstName: name?.split(' ')[0] || '',
        lastName: name?.split(' ').slice(1).join(' ') || '',
        profileImageUrl: picture || null,
        claims: {
          sub: uid,
          email,
          first_name: name?.split(' ')[0] || '',
          last_name: name?.split(' ').slice(1).join(' ') || '',
          profile_image_url: picture || null
        }
      };
      
      // Store user in session
      (req.session as any).user = user;
      
      // Upsert user to storage
      await storage.upsertUser({
        id: uid,
        email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
      });
      
      console.log("✅ Firebase user authenticated and verified:", email);
      res.json({ success: true });
    } catch (error) {
      console.error("Error verifying Firebase token:", error);
      res.status(401).json({ message: "Invalid or expired token" });
    }
  });
  
  console.log("✅ Firebase authentication routes configured");
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = (req.session as any)?.user;

  if (!user) {
    console.log("🔒 Authentication required - user not found in session");
    return res.status(401).json({ message: "Authentication required" });
  }

  // Set the user on the request object
  (req as any).user = user;
  next();
};
