import { Controller, Get, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('redis-test')
  async testRedis() {
    // Test Redis caching
    const key = 'test-key';
    const value = { message: 'Redis is working!', timestamp: new Date() };

    // Set value in cache
    await this.cacheManager.set(key, value, 300000); // 5 minutes TTL

    // Get value from cache
    const cachedValue = await this.cacheManager.get(key);

    return {
      status: 'success',
      cached: cachedValue,
      message: 'Redis caching is working correctly!',
    };
  }
}
