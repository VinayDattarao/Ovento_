// Centralized configuration system for Ovento
// Manages feature flags and prototype mode based on available environment variables

export interface AppConfig {
  // Feature flags
  openaiEnabled: boolean;
  sendgridEnabled: boolean;
  stripeEnabled: boolean;
  authEnabled: boolean;
  dbEnabled: boolean;
  
  // Mode flags
  prototypeMode: boolean;
  isDevelopment: boolean;
  
  // Environment values (safe to access)
  openaiApiKey: string | undefined;
  sendgridApiKey: string | undefined;
  stripeSecretKey: string | undefined;
  databaseUrl: string | undefined;
  replitDomains: string | undefined;
  
  // Server configuration
  port: number;
  host: string;
}

function checkEnvironmentVariable(key: string): string | undefined {
  const value = process.env[key];
  return value && value.trim() !== '' ? value : undefined;
}

function createConfig(): AppConfig {
  // Check environment variables
  const openaiApiKey = checkEnvironmentVariable('OPENAI_API_KEY');
  const sendgridApiKey = checkEnvironmentVariable('SENDGRID_API_KEY');
  const stripeSecretKey = checkEnvironmentVariable('STRIPE_SECRET_KEY');
  const databaseUrl = checkEnvironmentVariable('DATABASE_URL');
  const replitDomains = checkEnvironmentVariable('REPLIT_DOMAINS');
  
  // Determine feature availability
  const openaiEnabled = !!openaiApiKey;
  const sendgridEnabled = !!sendgridApiKey;
  const stripeEnabled = !!stripeSecretKey;
  const authEnabled = !!replitDomains;
  const dbEnabled = !!databaseUrl;
  
  // Prototype mode is active when core payment/auth services are missing
  const prototypeMode = !stripeEnabled || !authEnabled;
  
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  const config: AppConfig = {
    openaiEnabled,
    sendgridEnabled,
    stripeEnabled,
    authEnabled,
    dbEnabled,
    prototypeMode,
    isDevelopment,
    openaiApiKey,
    sendgridApiKey,
    stripeSecretKey,
    databaseUrl,
    replitDomains,
    port: parseInt(process.env.PORT || '5000', 10),
    host: '0.0.0.0'
  };
  
  // Log configuration status
  console.log('🔧 Ovento Configuration:');
  console.log(`   Mode: ${prototypeMode ? '🟡 PROTOTYPE' : '🟢 PRODUCTION'}`);
  console.log(`   OpenAI: ${openaiEnabled ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`   SendGrid: ${sendgridEnabled ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`   Stripe: ${stripeEnabled ? '✅ Enabled' : '🟡 Prototype Mode'}`);
  console.log(`   Auth: ${authEnabled ? '✅ Enabled' : '🟡 Mock Mode'}`);
  console.log(`   Database: ${dbEnabled ? '✅ Connected' : '🟡 In-Memory Fallback'}`);
  
  if (prototypeMode) {
    console.log('');
    console.log('⚠️  PROTOTYPE MODE ACTIVE:');
    console.log('   • Payments will be mocked (no real charges)');
    console.log('   • Authentication uses mock users');
    console.log('   • Some features may have limited functionality');
    console.log('   • This is safe for development and testing');
  }
  
  return config;
}

// Export the global configuration
export const config = createConfig();