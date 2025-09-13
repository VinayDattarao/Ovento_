// Mock Authentication System for Prototype Mode
// Provides a simple authentication system when Replit OIDC is not available

import type { Express, RequestHandler } from "express";
import session from "express-session";
import MemoryStore from "memorystore";

// Create a mock user for prototype mode
const mockUser = {
  id: "mock-user-1",
  email: "demo@example.com",
  firstName: "Demo",
  lastName: "User",
  profileImageUrl: null,
  claims: {
    sub: "mock-user-1",
    email: "demo@example.com",
    first_name: "Demo",
    last_name: "User",
    profile_image_url: null
  },
  access_token: "mock-access-token",
  refresh_token: "mock-refresh-token",
  expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
};

export function setupMockAuth(app: Express) {
  console.log("🟡 Setting up MOCK AUTHENTICATION (Prototype Mode)");
  
  app.set("trust proxy", 1);
  
  // Use memory store for sessions in prototype mode
  const memoryStoreConstructor = MemoryStore(session);
  const sessionStore = new memoryStoreConstructor({
    checkPeriod: 86400000, // Prune expired entries every 24h
  });
  
  app.use(session({
    secret: 'mock-session-secret-for-prototype',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Allow HTTP in prototype mode
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    },
  }));

  // Mock authentication routes
  app.get("/api/login", (req, res) => {
    console.log("🟡 MOCK LOGIN: Auto-authenticating demo user");
    (req.session as any).user = mockUser;
    res.redirect("/");
  });

  app.get("/api/callback", (req, res) => {
    // Mock callback - just redirect to home
    res.redirect("/");
  });

  app.get("/api/logout", (req, res) => {
    console.log("🟡 MOCK LOGOUT: Clearing demo user session");
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying mock session:", err);
      }
      res.redirect("/");
    });
  });

  console.log("✅ Mock authentication routes configured");
}

export const isMockAuthenticated: RequestHandler = async (req, res, next) => {
  const user = (req.session as any)?.user;

  if (!user) {
    // In prototype mode, automatically authenticate the user for convenience
    console.log("🟡 MOCK AUTH: Auto-authenticating user for prototype mode");
    (req.session as any).user = mockUser;
    (req as any).user = mockUser;
    return next();
  }

  // Set the user on the request object
  (req as any).user = user;
  next();
};

// Helper function to get mock user data for storage operations
export async function upsertMockUser(storage: any) {
  try {
    await storage.upsertUser({
      id: mockUser.id,
      email: mockUser.email,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
      profileImageUrl: mockUser.profileImageUrl,
    });
    console.log("✅ Mock user upserted to storage");
  } catch (error) {
    console.error("Error upserting mock user:", error);
  }
}