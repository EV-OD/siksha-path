/**
 * Application configuration module
 * Centralizes all environment variables and app settings
 * Follows NestJS configuration best practices
 */

export interface AppConfig {
  // Server settings
  port: number;
  nodeEnv: string;

  // Database settings
  databaseUrl: string;

  // JWT settings
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtRefreshExpiresIn: string;

  // Supabase storage settings
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  supabaseBucket: string;

  // Zoom API settings
  zoomAccountId: string;
  zoomClientId: string;
  zoomClientSecret: string;
  zoomSecretToken: string;

  // Redis settings
  redisHost: string;
  redisPort: number;
  redisUsername: string;
  redisPassword: string;
}

export default (): AppConfig => ({
  // Server configuration
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database configuration
  databaseUrl: process.env.DATABASE_URL || '',

  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // Supabase storage configuration
  supabaseUrl: process.env.PROJECT_URL || '',
  supabaseAnonKey: process.env.ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SERVICE_ROLE_KEY || '',
  supabaseBucket: process.env.SUPABASE_BUCKET || 'resources',

  // Zoom API configuration
  zoomAccountId: process.env.Account_ID || '',
  zoomClientId: process.env.Client_ID || '',
  zoomClientSecret: process.env.Client_Secret || '',
  zoomSecretToken: process.env.secret_token || '',

  // Redis configuration
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
  redisUsername: process.env.REDIS_USERNAME || '',
  redisPassword: process.env.REDIS_PASSWORD || '',
});
