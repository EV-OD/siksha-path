import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
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
    
    // Feature modules will be added here as we develop them:
    // AuthModule,
    // UsersModule, 
    // CoursesModule,
    // PaymentsModule,
    // etc.
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
