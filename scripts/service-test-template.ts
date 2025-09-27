#!/usr/bin/env ts-node

/**
 * Service Test Template
 * Copy this template when adding new external service integrations
 * 
 * Instructions:
 * 1. Copy this file to `test-[service-name].ts`
 * 2. Replace [SERVICE_NAME] with actual service name
 * 3. Update environment variables section
 * 4. Implement actual service connection logic
 * 5. Add script to package.json
 * 6. Update main test-connections.ts to include new service
 */

import { config } from 'dotenv';

// Load environment variables
config();

interface TestResult {
  service: string;
  status: 'SUCCESS' | 'FAILED';
  message: string;
  details?: any;
  responseTime?: number;
}

class ServiceNameTester {
  private serviceName = '[SERVICE_NAME]';

  private logResult(result: TestResult) {
    const icon = result.status === 'SUCCESS' ? '✅' : '❌';
    const time = result.responseTime ? ` (${result.responseTime}ms)` : '';
    console.log(`${icon} ${result.service}: ${result.message}${time}`);
    
    if (result.details && result.status === 'FAILED') {
      console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
    }
  }

  async testServiceConnection(): Promise<void> {
    console.log(`\n🔍 Testing ${this.serviceName} Connection...`);
    const startTime = Date.now();

    try {
      // 1. Check required environment variables
      const requiredEnvs = ['SERVICE_URL', 'SERVICE_API_KEY']; // Update these
      const missing = requiredEnvs.filter(env => !process.env[env]);
      
      if (missing.length > 0) {
        throw new Error(`Missing environment variables: ${missing.join(', ')}`);
      }

      // 2. Initialize service client
      // const client = new ServiceClient({
      //   url: process.env.SERVICE_URL,
      //   apiKey: process.env.SERVICE_API_KEY
      // });

      // 3. Test connection
      // const connectionResult = await client.testConnection();

      // 4. Test basic operations
      // const operationResult = await client.testBasicOperation();

      // 5. Simulate successful result
      const result = {
        connected: true,
        version: 'v1.0.0',
        status: 'healthy'
      };

      const responseTime = Date.now() - startTime;

      this.logResult({
        service: this.serviceName,
        status: 'SUCCESS',
        message: `Connected successfully and tested operations`,
        responseTime,
        details: {
          version: result.version,
          status: result.status,
          // Add other relevant details
        }
      });

    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logResult({
        service: this.serviceName,
        status: 'FAILED',
        message: `Connection failed: ${error.message}`,
        responseTime,
        details: error
      });
      
      // Exit with error code for CI/CD
      process.exit(1);
    }
  }

  async runTest(): Promise<void> {
    console.log(`🚀 Starting ${this.serviceName} Connection Test...\n`);
    console.log('=' .repeat(60));

    try {
      await this.testServiceConnection();
      console.log('\n' + '=' .repeat(60));
      console.log(`🎉 ${this.serviceName} connection test successful!`);
    } catch (error) {
      console.error(`\n❌ ${this.serviceName} test failed:`, error);
      process.exit(1);
    }
  }
}

// Run the test if executed directly
if (require.main === module) {
  const tester = new ServiceNameTester();
  tester.runTest().catch(console.error);
}

export { ServiceNameTester };
