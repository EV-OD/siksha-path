import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

/**
 * Database configuration factory
 * Sets up Drizzle ORM with PostgreSQL connection
 * Uses connection pooling for better performance
 */
export const createDatabaseConnection = (configService: ConfigService) => {
  const connectionString = configService.get<string>('DATABASE_URL');

  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined in environment variables');
  }

  // Create postgres client with connection pooling
  const client = postgres(connectionString, {
    max: 20, // Maximum number of connections in the pool
    idle_timeout: 20, // Close idle connections after 20 seconds
    connect_timeout: 30, // Connection timeout in seconds
  });

  // Return drizzle instance
  return drizzle(client);
};

/**
 * Database provider for NestJS dependency injection
 * This will be used to inject the database instance into services
 */
export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';
