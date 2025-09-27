import { defineConfig } from 'drizzle-kit';

/**
 * Drizzle Kit Configuration
 * This file configures database migrations, schema generation, and introspection
 * 
 * Features configured:
 * - PostgreSQL dialect for compatibility
 * - Migration scripts location
 * - Schema files location  
 * - Database connection via environment variable
 */
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/database/schemas/*.ts',
  out: './src/database/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
