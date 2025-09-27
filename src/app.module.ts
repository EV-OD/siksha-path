import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import appConfig from './config/app.config';

/**
 * Root Application Module
 *
 * Follows NestJS modular architecture principles:
 * - ConfigModule for environment variables and app settings
 * - DatabaseModule for Drizzle ORM database connection
 * - Feature modules will be added as we implement them
 *
 * The module is designed to be:
 * - Scalable: Easy to add new feature modules
 * - Maintainable: Clear separation of concerns
 * - Testable: Dependency injection for all services
 */
@Module({
  imports: [
    // Global configuration module
    ConfigModule.forRoot({
      isGlobal: true, // Makes config available throughout the app
      load: [appConfig], // Load our custom configuration
      envFilePath: '.env', // Specify .env file location
      cache: true, // Cache configuration for better performance
    }),

    // Database connection module
    DatabaseModule,

    // Redis module for caching and real-time features
    RedisModule,

    // Authentication and authorization module
    AuthModule,

    // User management module
    UsersModule,

    // Future feature modules:
    // CoursesModule,
    // PaymentsModule,
    // etc.
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global JWT Authentication Guard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global Role-Based Access Control Guard
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
