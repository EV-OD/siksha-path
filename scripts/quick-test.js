#!/usr/bin/env node

/**
 * Simple Connection Test Script (JavaScript version)
 * Quick test for all external service connections
 */

const { config } = require('dotenv');

// Load environment variables
config();

console.log('🚀 Quick Connection Test for SikshaPath\n');

async function quickTest() {
  const tests = [];
  
  // Test Database URL
  console.log('🔍 Checking Database configuration...');
  if (process.env.DATABASE_URL) {
    console.log('✅ DATABASE_URL is configured');
    tests.push({ service: 'Database', status: 'configured' });
  } else {
    console.log('❌ DATABASE_URL is missing');
    tests.push({ service: 'Database', status: 'missing' });
  }

  // Test Redis configuration
  console.log('\n🔍 Checking Redis configuration...');
  if (process.env.REDIS_HOST && process.env.REDIS_PORT && process.env.REDIS_PASSWORD) {
    console.log('✅ Redis configuration is complete');
    console.log(`   Host: ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);
    tests.push({ service: 'Redis', status: 'configured' });
  } else {
    console.log('❌ Redis configuration is incomplete');
    tests.push({ service: 'Redis', status: 'missing' });
  }

  // Test Supabase configuration
  console.log('\n🔍 Checking Supabase configuration...');
  if (process.env.PROJECT_URL && process.env.ANON_KEY) {
    console.log('✅ Supabase configuration is complete');
    console.log(`   Project: ${process.env.PROJECT_URL}`);
    tests.push({ service: 'Supabase', status: 'configured' });
  } else {
    console.log('❌ Supabase configuration is incomplete');
    tests.push({ service: 'Supabase', status: 'missing' });
  }

  // Test Zoom configuration
  console.log('\n🔍 Checking Zoom API configuration...');
  if (process.env.Account_ID && process.env.Client_ID && process.env.Client_Secret) {
    console.log('✅ Zoom API configuration is complete');
    console.log(`   Account ID: ${process.env.Account_ID}`);
    tests.push({ service: 'Zoom API', status: 'configured' });
  } else {
    console.log('❌ Zoom API configuration is incomplete');
    tests.push({ service: 'Zoom API', status: 'missing' });
  }

  // Test JWT Secret
  console.log('\n🔍 Checking JWT configuration...');
  if (process.env.JWT_SECRET) {
    console.log('✅ JWT_SECRET is configured');
    tests.push({ service: 'JWT', status: 'configured' });
  } else {
    console.log('❌ JWT_SECRET is missing');
    tests.push({ service: 'JWT', status: 'missing' });
  }

  // Summary
  const configured = tests.filter(t => t.status === 'configured').length;
  const missing = tests.filter(t => t.status === 'missing').length;
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 CONFIGURATION SUMMARY');
  console.log('-'.repeat(30));
  console.log(`✅ Configured: ${configured}/${tests.length}`);
  console.log(`❌ Missing: ${missing}/${tests.length}`);
  
  if (missing > 0) {
    console.log('\n⚠️  MISSING CONFIGURATIONS:');
    tests
      .filter(t => t.status === 'missing')
      .forEach(t => console.log(`   • ${t.service}`));
  }
  
  console.log('\n' + (missing === 0 ? '🎉 All services configured!' : '⚠️  Some configurations missing'));
  console.log('\nFor full connection testing, run: pnpm test:connection');
}

quickTest().catch(console.error);
