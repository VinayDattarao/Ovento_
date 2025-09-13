// PROTOTYPE MODE: All authentication replaced with hardcoded mock auth
// No external authentication services - everything runs standalone
import session from "express-session";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";
import { config } from "./config";
import { setupMockAuth, isMockAuthenticated, upsertMockUser } from "./mockAuth";

// Removed OIDC configuration - using hardcoded mock auth only

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Always use memory store in prototype mode
  console.log("🟡 PROTOTYPE MODE - Using memory session store");
  const MemoryStore = require("memorystore")(session);
  const sessionStore = new MemoryStore({
    checkPeriod: 86400000, // Prune expired entries every 24h
  });
  
  return session({
    secret: 'hardcoded-session-secret-prototype',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Allow HTTP in prototype mode
      maxAge: sessionTtl,
    },
  });
}

// Removed token update functions - using hardcoded mock auth only

// Removed real user upsertion - using mock user only

export async function setupAuth(app: Express) {
  console.log("🔒 PROTOTYPE MODE - Using hardcoded mock authentication system");
  setupMockAuth(app);
  // Create mock user in storage for consistency
  setTimeout(() => {
    upsertMockUser(storage);
  }, 1000);
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // Always use mock authentication in prototype mode
  return isMockAuthenticated(req, res, next);
};
