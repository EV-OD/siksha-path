#!/usr/bin/env ts-node

/**
 * Connection Test Script for SikshaPath
 * Tests all external service connections: Database, Redis, Supabase, Zoom API
 */

import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { createClient } from 'redis';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Load environment variables
config();

interface TestResult {
  service: string;
  status: 'SUCCESS' | 'FAILED';
  message: string;
  details?: any;
  responseTime?: number;
}

class ConnectionTester {
  private results: TestResult[] = [];

  private logResult(result: TestResult) {
    this.results.push(result);
    const icon = result.status === 'SUCCESS' ? '✅' : '❌';
    const time = result.responseTime ? ` (${result.responseTime}ms)` : '';
    console.log(`${icon} ${result.service}: ${result.message}${time}`);
    if (result.details && result.status === 'FAILED') {
      console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
    }
  }

  async testDatabase(): Promise<void> {
    console.log('\n🔍 Testing Database Connection...');
    const startTime = Date.now();

    try {
      const connectionString = process.env.DATABASE_URL;
      if (!connectionString) {
        throw new Error('DATABASE_URL not found in environment variables');
      }

      // Create connection
      const client = postgres(connectionString);
      const db = drizzle(client);

      // Test query
      const result = await client`SELECT version(), current_database(), current_user`;
      const responseTime = Date.now() - startTime;

      await client.end();

      this.logResult({
        service: 'PostgreSQL Database',
        status: 'SUCCESS',
        message: `Connected to ${result[0].current_database} as ${result[0].current_user}`,
        responseTime,
        details: {
          version: result[0].version.split(' ')[0] + ' ' + result[0].version.split(' ')[1],
          database: result[0].current_database,
          user: result[0].current_user
        }
      });

    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logResult({
        service: 'PostgreSQL Database',
        status: 'FAILED',
        message: `Connection failed: ${error.message}`,
        responseTime,
        details: error
      });
    }
  }

  async testRedis(): Promise<void> {
    console.log('\n🔍 Testing Redis Connection...');
    const startTime = Date.now();

    try {
      const redisConfig = {
        socket: {
          host: process.env.REDIS_HOST,
          port: parseInt(process.env.REDIS_PORT || '6379'),
        },
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD
      };

      if (!redisConfig.socket.host) {
        throw new Error('REDIS_HOST not found in environment variables');
      }

      const client = createClient(redisConfig);
      
      client.on('error', (err) => {
        throw new Error(`Redis Client Error: ${err.message}`);
      });

      await client.connect();

      // Test Redis operations
      const testKey = 'connection-test';
      const testValue = JSON.stringify({ timestamp: new Date().toISOString(), test: 'connection' });
      
      await client.set(testKey, testValue, { EX: 10 }); // 10 second expiry
      const retrievedValue = await client.get(testKey);
      
      if (retrievedValue !== testValue) {
        throw new Error('Redis set/get test failed - values do not match');
      }

      // Get Redis info
      const info = await client.info('server');
      const redisVersion = info.match(/redis_version:([^\r\n]+)/)?.[1] || 'unknown';
      
      await client.del(testKey);
      await client.disconnect();

      const responseTime = Date.now() - startTime;

      this.logResult({
        service: 'Redis Cache',
        status: 'SUCCESS',
        message: `Connected to Redis Cloud and tested set/get operations`,
        responseTime,
        details: {
          host: redisConfig.socket.host,
          port: redisConfig.socket.port,
          version: redisVersion,
          username: redisConfig.username
        }
      });

    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logResult({
        service: 'Redis Cache',
        status: 'FAILED',
        message: `Connection failed: ${error.message}`,
        responseTime,
        details: error
      });
    }
  }

  async testSupabase(): Promise<void> {
    console.log('\n🔍 Testing Supabase Storage...');
    const startTime = Date.now();

    try {
      const projectUrl = process.env.PROJECT_URL;
      const anonKey = process.env.ANON_KEY;
      const bucketName = process.env.SUPABASE_BUCKET;

      if (!projectUrl || !anonKey) {
        throw new Error('PROJECT_URL or ANON_KEY not found in environment variables');
      }

      const supabase = createSupabaseClient(projectUrl, anonKey);

      // Test bucket access
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        throw new Error(`Failed to list buckets: ${bucketsError.message}`);
      }

      // Check if our bucket exists
      const targetBucket = buckets?.find(bucket => bucket.name === bucketName);
      if (!targetBucket && bucketName) {
        console.log(`   ⚠️  Bucket '${bucketName}' not found, but connection is working`);
      }

      // Test file listing (this should work even if bucket is empty)
      const { data: files, error: filesError } = await supabase.storage
        .from(bucketName || 'resources')
        .list('', { limit: 1 });

      const responseTime = Date.now() - startTime;

      if (filesError && !filesError.message.includes('not found')) {
        throw new Error(`Storage access failed: ${filesError.message}`);
      }

      this.logResult({
        service: 'Supabase Storage',
        status: 'SUCCESS',
        message: `Connected to Supabase and accessed storage`,
        responseTime,
        details: {
          projectUrl: projectUrl,
          bucketsFound: buckets?.length || 0,
          targetBucket: targetBucket?.name || 'not found',
          bucketPublic: targetBucket?.public || false
        }
      });

    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logResult({
        service: 'Supabase Storage',
        status: 'FAILED',
        message: `Connection failed: ${error.message}`,
        responseTime,
        details: error
      });
    }
  }

  async testZoomAPI(): Promise<void> {
    console.log('\n🔍 Testing Zoom API...');
    const startTime = Date.now();

    try {
      const accountId = process.env.Account_ID;
      const clientId = process.env.Client_ID;
      const clientSecret = process.env.Client_Secret;

      if (!accountId || !clientId || !clientSecret) {
        throw new Error('Zoom API credentials not found in environment variables');
      }

      // Get OAuth token using Account Credentials method (Server-to-Server OAuth)
      const tokenUrl = 'https://zoom.us/oauth/token';
      const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'account_credentials',
          account_id: accountId
        })
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text();
        throw new Error(`Token request failed: ${tokenResponse.status} ${tokenResponse.statusText} - ${errorData}`);
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Test API call - Get user info
      const apiResponse = await fetch('https://api.zoom.us/v2/users/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.text();
        throw new Error(`API call failed: ${apiResponse.status} ${apiResponse.statusText} - ${errorData}`);
      }

      const userData = await apiResponse.json();
      const responseTime = Date.now() - startTime;

      this.logResult({
        service: 'Zoom API',
        status: 'SUCCESS',
        message: `Connected to Zoom API and retrieved user info`,
        responseTime,
        details: {
          accountId: userData.account_id,
          email: userData.email,
          accountType: userData.type === 1 ? 'Basic' : userData.type === 2 ? 'Licensed' : 'On-prem',
          status: userData.status,
          tokenType: tokenData.token_type
        }
      });

    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logResult({
        service: 'Zoom API',
        status: 'FAILED',
        message: `Connection failed: ${error.message}`,
        responseTime,
        details: error
      });
    }
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting SikshaPath Connection Tests...\n');
    console.log('=' .repeat(60));

    try {
      await this.testDatabase();
      await this.testRedis();
      await this.testSupabase();
      await this.testZoomAPI();

      console.log('\n' + '=' .repeat(60));
      this.printSummary();
    } catch (error) {
      console.error('\n❌ Test runner failed:', error);
      process.exit(1);
    }
  }

  private printSummary(): void {
    const successful = this.results.filter(r => r.status === 'SUCCESS').length;
    const failed = this.results.filter(r => r.status === 'FAILED').length;
    const total = this.results.length;

    console.log('\n📊 TEST SUMMARY');
    console.log('-' .repeat(30));
    console.log(`✅ Successful: ${successful}/${total}`);
    console.log(`❌ Failed: ${failed}/${total}`);
    
    if (failed > 0) {
      console.log('\n⚠️  FAILED SERVICES:');
      this.results
        .filter(r => r.status === 'FAILED')
        .forEach(r => console.log(`   • ${r.service}: ${r.message}`));
    }

    const avgResponseTime = this.results
      .filter(r => r.responseTime)
      .reduce((sum, r) => sum + (r.responseTime || 0), 0) / 
      this.results.filter(r => r.responseTime).length;

    if (!isNaN(avgResponseTime)) {
      console.log(`\n⏱️  Average Response Time: ${Math.round(avgResponseTime)}ms`);
    }

    console.log('\n' + (failed === 0 ? '🎉 All connections successful!' : '⚠️  Some connections failed - check configuration'));
    
    if (failed > 0) {
      process.exit(1);
    }
  }
}

// Install required packages if they don't exist
async function ensureDependencies() {
  try {
    await import('@supabase/supabase-js');
  } catch (error) {
    console.log('📦 Installing missing dependencies...');
    const { execSync } = await import('child_process');
    execSync('pnpm add @supabase/supabase-js', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully\n');
  }
}

// Run the tests
async function main() {
  await ensureDependencies();
  const tester = new ConnectionTester();
  await tester.runAllTests();
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error);
}

export { ConnectionTester };
