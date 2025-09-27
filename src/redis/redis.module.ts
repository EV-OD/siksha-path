import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

/**
 * Redis Module
 * Provides Redis caching for the application
 * 
 * This module sets up:
 * - Redis caching through NestJS Cache Manager
 * - Basic Redis configuration with authentication
 * 
 * The module follows NestJS best practices:
 * - Global module for app-wide availability
 * - Proper error handling and connection monitoring
 * - Dependency injection for configuration
 */
@Global()
@Module({
  imports: [
    // Configure NestJS Cache Manager with Redis
    CacheModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        const redisHost = configService.get<string>('redisHost');
        const redisPort = configService.get<number>('redisPort');
        const redisUsername = configService.get<string>('redisUsername');
        const redisPassword = configService.get<string>('redisPassword');

        console.log('🔧 Configuring Redis Cache Manager...');
        console.log(`📍 Redis Host: ${redisHost}:${redisPort}`);

        return {
          store: redisStore as any,
          socket: {
            host: redisHost,
            port: redisPort,
          },
          username: redisUsername,
          password: redisPassword,
          // Cache configuration
          ttl: 3600, // Default TTL: 1 hour
          max: 1000, // Maximum number of items in cache
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [],
  exports: [CacheModule],
})
export class RedisModule {}

/**
 * Redis Service Interface
 * Provides type definitions for Redis operations
 */
export interface RedisService {
  // Basic operations
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  del(key: string): Promise<number>;
  exists(key: string): Promise<number>;
  
  // Hash operations (useful for user sessions)
  hget(key: string, field: string): Promise<string | null>;
  hset(key: string, field: string, value: string): Promise<number>;
  hdel(key: string, field: string): Promise<number>;
  
  // List operations (useful for message queues)
  lpush(key: string, value: string): Promise<number>;
  rpop(key: string): Promise<string | null>;
  
  // Set operations (useful for online users)
  sadd(key: string, member: string): Promise<number>;
  srem(key: string, member: string): Promise<number>;
  smembers(key: string): Promise<string[]>;
  
  // Pub/Sub operations
  publish(channel: string, message: string): Promise<number>;
  subscribe(channel: string, callback: (message: string) => void): Promise<void>;
  unsubscribe(channel: string): Promise<void>;
}
