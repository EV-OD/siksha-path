import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createDatabaseConnection,
  DATABASE_CONNECTION,
} from '../config/database.config';

/**
 * Database Module
 * Provides database connection using Drizzle ORM
 * This is a global module so it's available throughout the application
 *
 * The module follows NestJS best practices:
 * - Uses dependency injection for configuration
 * - Exports the database connection for use in other modules
 * - Implements proper error handling and connection management
 */
@Global()
@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: (configService: ConfigService) => {
        try {
          return createDatabaseConnection(configService);
        } catch (error) {
          console.error('Failed to create database connection:', error);
          throw error;
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
