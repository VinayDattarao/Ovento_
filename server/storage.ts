import { config } from "./config";
import { InMemoryStorage, type IStorage } from "./memoryStorage";

// Simple storage factory that chooses between database and memory storage
function createStorage(): IStorage {
  if (config.dbEnabled) {
    console.log('🔧 DATABASE_URL found, but using in-memory storage for Render deployment');
    console.log('🔧 In-memory storage provides full functionality with sample data');
  }
  
  return new InMemoryStorage();
}

// Export the storage instance
export const storage = createStorage();

// Re-export the interface for type checking
export type { IStorage } from "./memoryStorage";