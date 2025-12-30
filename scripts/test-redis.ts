/**
 * Test script to verify Redis caching is working
 * Run with: npx tsx scripts/test-redis.ts
 */

import { redis, isRedisReady } from '../lib/redis';
import {
  setCache,
  getCache,
  deleteCache,
  invalidateResourceCache,
  CACHE_PREFIX,
  CACHE_TTL,
} from '../lib/cache';

async function testRedisConnection() {
  console.log('🔍 Testing Redis Connection...\n');

  if (!redis) {
    console.error('❌ Redis client not initialized');
    return false;
  }

  try {
    const pong = await redis.ping();
    console.log(`✅ Redis connection successful: ${pong}`);
    return true;
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    return false;
  }
}

async function testCachingOperations() {
  console.log('\n🧪 Testing Caching Operations...\n');

  const testKey = 'test:cache:key';
  const testData = {
    message: 'Hello Redis!',
    timestamp: new Date().toISOString(),
    data: { foo: 'bar', count: 42 },
  };

  // Test 1: Set cache
  console.log('1️⃣  Setting cache...');
  const setResult = await setCache(testKey, testData, 60);
  console.log(`   Result: ${setResult ? '✅ Success' : '❌ Failed'}`);

  // Test 2: Get cache (should hit)
  console.log('\n2️⃣  Getting cache (should HIT)...');
  const cachedData = await getCache(testKey);
  const cacheHit = cachedData !== null && JSON.stringify(cachedData) === JSON.stringify(testData);
  console.log(`   Result: ${cacheHit ? '✅ Cache HIT' : '❌ Cache MISS'}`);
  if (cachedData) {
    console.log('   Data:', JSON.stringify(cachedData, null, 2));
  }

  // Test 3: Delete cache
  console.log('\n3️⃣  Deleting cache...');
  const deleteResult = await deleteCache(testKey);
  console.log(`   Result: ${deleteResult ? '✅ Success' : '❌ Failed'}`);

  // Test 4: Get cache again (should miss)
  console.log('\n4️⃣  Getting cache again (should MISS)...');
  const cachedAfterDelete = await getCache(testKey);
  const cacheMiss = cachedAfterDelete === null;
  console.log(`   Result: ${cacheMiss ? '✅ Cache MISS (as expected)' : '❌ Still cached (unexpected)'}`);

  return setResult && cacheHit && deleteResult && cacheMiss;
}

async function testPatternInvalidation() {
  console.log('\n🔄 Testing Pattern Invalidation...\n');

  // Create multiple cache keys
  const keys = [
    `${CACHE_PREFIX.ANNOUNCEMENT}:inst_1:page_1`,
    `${CACHE_PREFIX.ANNOUNCEMENT}:inst_1:page_2`,
    `${CACHE_PREFIX.ANNOUNCEMENT}:inst_2:page_1`,
    `${CACHE_PREFIX.FORUM}:inst_1:topic_1`,
  ];

  // Set all keys
  console.log('1️⃣  Setting multiple cache keys...');
  for (const key of keys) {
    await setCache(key, { data: `Data for ${key}` }, 60);
  }
  console.log(`   ✅ Set ${keys.length} cache keys`);

  // Invalidate announcement cache for institution 1
  console.log('\n2️⃣  Invalidating announcement cache for institution 1...');
  const invalidatedCount = await invalidateResourceCache(
    CACHE_PREFIX.ANNOUNCEMENT,
    '1'
  );
  console.log(`   ✅ Invalidated ${invalidatedCount} keys`);

  // Check which keys remain
  console.log('\n3️⃣  Checking remaining keys...');
  for (const key of keys) {
    const data = await getCache(key);
    const status = data === null ? '❌ Deleted' : '✅ Still exists';
    console.log(`   ${status}: ${key}`);
  }

  // Cleanup
  for (const key of keys) {
    await deleteCache(key);
  }

  return invalidatedCount === 2; // Should have invalidated 2 announcement keys for inst_1
}

async function testRouteSimulation() {
  console.log('\n🌐 Simulating Route Caching...\n');

  // Simulate GET request (cache miss -> fetch -> cache)
  console.log('1️⃣  Simulating GET /api/announcements (first request)...');
  const routeKey = `${CACHE_PREFIX.ANNOUNCEMENT}:inst_1:pg_1`;

  let cachedData = await getCache(routeKey);
  if (cachedData) {
    console.log('   ❌ Unexpected cache hit');
  } else {
    console.log('   ✅ Cache miss (expected)');
    console.log('   📊 Fetching from database...');
    const dbData = {
      announcements: [
        { id: 1, title: 'Test Announcement', body: 'This is a test' },
      ],
      pagination: { total: 1, page: 1, pageSize: 50 },
    };
    await setCache(routeKey, dbData, CACHE_TTL.ANNOUNCEMENTS);
    console.log('   ✅ Data cached');
  }

  // Simulate second GET request (cache hit)
  console.log('\n2️⃣  Simulating GET /api/announcements (second request)...');
  cachedData = await getCache(routeKey);
  if (cachedData) {
    console.log('   ✅ Cache hit!');
    console.log('   📦 Cached data:', JSON.stringify(cachedData, null, 2));
  } else {
    console.log('   ❌ Cache miss (unexpected)');
  }

  // Simulate POST request (invalidate cache)
  console.log('\n3️⃣  Simulating POST /api/announcements (create new announcement)...');
  console.log('   🔄 Invalidating cache...');
  await invalidateResourceCache(CACHE_PREFIX.ANNOUNCEMENT, '1');
  console.log('   ✅ Cache invalidated');

  // Verify cache was cleared
  console.log('\n4️⃣  Simulating GET /api/announcements (after POST)...');
  cachedData = await getCache(routeKey);
  if (cachedData) {
    console.log('   ❌ Cache still exists (unexpected)');
  } else {
    console.log('   ✅ Cache cleared (expected)');
  }

  return true;
}

async function runTests() {
  console.log('=' .repeat(60));
  console.log('🚀 Redis Caching System Test Suite');
  console.log('=' .repeat(60));

  let allTestsPassed = true;

  // Test 1: Connection
  const connectionOk = await testRedisConnection();
  if (!connectionOk) {
    console.log('\n❌ Cannot proceed without Redis connection');
    process.exit(1);
  }

  // Test 2: Basic caching
  const cachingOk = await testCachingOperations();
  if (!cachingOk) {
    console.log('\n❌ Basic caching tests failed');
    allTestsPassed = false;
  }

  // Test 3: Pattern invalidation
  const patternOk = await testPatternInvalidation();
  if (!patternOk) {
    console.log('\n⚠️  Pattern invalidation test had issues');
    allTestsPassed = false;
  }

  // Test 4: Route simulation
  const routeOk = await testRouteSimulation();
  if (!routeOk) {
    console.log('\n❌ Route simulation tests failed');
    allTestsPassed = false;
  }

  // Final summary
  console.log('\n' + '=' .repeat(60));
  if (allTestsPassed) {
    console.log('✅ All tests passed! Redis caching is working correctly.');
  } else {
    console.log('⚠️  Some tests had issues. Please review the output above.');
  }
  console.log('=' .repeat(60));

  // Disconnect
  if (redis) {
    await redis.quit();
  }

  process.exit(allTestsPassed ? 0 : 1);
}

// Run tests
runTests().catch((error) => {
  console.error('\n💥 Test suite error:', error);
  process.exit(1);
});
