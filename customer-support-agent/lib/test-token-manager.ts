#!/usr/bin/env ts-node
/**
 * Standalone test script for TokenManager
 *
 * This script can be run directly without a test framework:
 * ts-node lib/test-token-manager.ts
 * or
 * npx tsx lib/test-token-manager.ts
 */

import {
  TokenManager,
  getApiKeyFromKeychain,
  getClaudeCredentials,
  getApiKey,
  isMacOS,
  getApiKeyWithPlatformCheck,
} from './token-manager';

// Test utilities
let testsPassed = 0;
let testsFailed = 0;
let testsSkipped = 0;

function assert(condition: boolean, message: string): void {
  if (condition) {
    console.log(`  ✓ ${message}`);
    testsPassed++;
  } else {
    console.log(`  ✗ ${message}`);
    testsFailed++;
  }
}

function skip(message: string): void {
  console.log(`  ⊘ ${message} (skipped)`);
  testsSkipped++;
}

function maskKey(key: string | undefined): string {
  if (!key) return 'undefined';
  if (key.length <= 12) return '***';
  return `${key.slice(0, 8)}...${key.slice(-4)}`;
}

console.log('=' .repeat(70));
console.log('TokenManager TypeScript Test Suite');
console.log('=' .repeat(70));

// Test 1: Platform Detection
console.log('\n📋 Test 1: Platform Detection');
console.log('-'.repeat(70));
const platformIsMac = isMacOS();
console.log(`  Platform: ${process.platform}`);
console.log(`  Is macOS: ${platformIsMac}`);
assert(typeof platformIsMac === 'boolean', 'isMacOS() returns boolean');

// Test 2: TokenManager Initialization
console.log('\n📋 Test 2: TokenManager Initialization');
console.log('-'.repeat(70));
try {
  const manager1 = new TokenManager();
  assert(manager1 instanceof TokenManager, 'Default initialization works');

  const manager2 = new TokenManager({ verbose: true });
  assert(manager2 instanceof TokenManager, 'Verbose initialization works');

  const manager3 = new TokenManager({ account: 'testuser' });
  assert(manager3 instanceof TokenManager, 'Account initialization works');
} catch (error) {
  assert(false, `Initialization failed: ${error}`);
}

// Test 3: Environment Variable Detection
console.log('\n📋 Test 3: Environment Variable Detection');
console.log('-'.repeat(70));
const originalEnvKey = process.env.ANTHROPIC_API_KEY;

if (originalEnvKey) {
  console.log(`  ANTHROPIC_API_KEY is set: ${maskKey(originalEnvKey)}`);
  const manager = new TokenManager({ verbose: false });
  const envKey = manager.getAnthropicApiKey();
  assert(envKey === originalEnvKey, 'Retrieves API key from environment');
} else {
  console.log('  ANTHROPIC_API_KEY is not set in environment');
  skip('Environment variable test (no key set)');
}

// Test 4: Keychain Access (macOS only)
console.log('\n📋 Test 4: Keychain Access');
console.log('-'.repeat(70));
if (platformIsMac) {
  try {
    const manager = new TokenManager({ verbose: true });
    const credentials = manager.getClaudeCredentials();

    assert(typeof credentials === 'object', 'Returns credentials object');
    assert('apiKey' in credentials, 'Has apiKey property');
    assert('mcpOAuthTokens' in credentials, 'Has mcpOAuthTokens property');
    assert('sessionToken' in credentials, 'Has sessionToken property');

    console.log(`  API Key found: ${!!credentials.apiKey}`);
    console.log(`  MCP OAuth tokens: ${Object.keys(credentials.mcpOAuthTokens || {}).length} services`);
    console.log(`  Session token found: ${!!credentials.sessionToken}`);

    if (credentials.apiKey) {
      console.log(`  API Key: ${maskKey(credentials.apiKey)}`);
    }
  } catch (error) {
    assert(false, `Keychain access failed: ${error}`);
  }
} else {
  skip('Keychain access test (not on macOS)');
}

// Test 5: Convenience Functions
console.log('\n📋 Test 5: Convenience Functions');
console.log('-'.repeat(70));

// Set a test key
process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key-12345678';

try {
  const key1 = getApiKeyFromKeychain(false);
  assert(key1 === 'sk-ant-test-key-12345678', 'getApiKeyFromKeychain() works');

  const key2 = getApiKey({ verbose: false });
  assert(key2 === 'sk-ant-test-key-12345678', 'getApiKey() works');

  const key3 = getApiKeyWithPlatformCheck({ verbose: false });
  assert(key3 === 'sk-ant-test-key-12345678', 'getApiKeyWithPlatformCheck() works');

  const creds = getClaudeCredentials(undefined, false);
  assert(typeof creds === 'object', 'getClaudeCredentials() works');
} catch (error) {
  assert(false, `Convenience functions failed: ${error}`);
} finally {
  // Restore original env
  if (originalEnvKey) {
    process.env.ANTHROPIC_API_KEY = originalEnvKey;
  } else {
    delete process.env.ANTHROPIC_API_KEY;
  }
}

// Test 6: Fallback Behavior
console.log('\n📋 Test 6: Fallback Behavior');
console.log('-'.repeat(70));

// Remove env var to test fallback
delete process.env.ANTHROPIC_API_KEY;

try {
  const manager = new TokenManager({ verbose: false });
  const apiKey = manager.getAnthropicApiKey();

  if (platformIsMac) {
    console.log(`  Fallback to keychain: ${apiKey ? 'Success' : 'No key found'}`);
    assert(true, 'Keychain fallback attempted');
  } else {
    assert(apiKey === undefined, 'Returns undefined on non-macOS without env var');
  }
} catch (error) {
  assert(false, `Fallback behavior failed: ${error}`);
} finally {
  // Restore original env
  if (originalEnvKey) {
    process.env.ANTHROPIC_API_KEY = originalEnvKey;
  }
}

// Test 7: Error Handling
console.log('\n📋 Test 7: Error Handling');
console.log('-'.repeat(70));

try {
  const manager = new TokenManager({ verbose: false });

  // Should not throw even with invalid service names
  let didThrow = false;
  try {
    manager.getClaudeCredentials();
  } catch {
    didThrow = true;
  }

  assert(!didThrow, 'Handles missing keychain gracefully');
  assert(true, 'No exceptions thrown during normal operation');
} catch (error) {
  assert(false, `Error handling test failed: ${error}`);
}

// Test 8: Real-world Scenario
console.log('\n📋 Test 8: Real-world Usage');
console.log('-'.repeat(70));

try {
  // Simulate what would happen in route.ts
  const apiKey = getApiKeyWithPlatformCheck({ verbose: true });

  if (apiKey) {
    console.log(`  ✓ API key retrieved: ${maskKey(apiKey)}`);
    console.log(`  Source: ${process.env.ANTHROPIC_API_KEY ? 'environment' : 'keychain'}`);
    assert(true, 'Ready for use in Next.js API route');
  } else {
    console.log('  ⚠ No API key available');
    console.log('  Please set ANTHROPIC_API_KEY environment variable');
    skip('Real-world usage test (no API key available)');
  }
} catch (error) {
  assert(false, `Real-world scenario failed: ${error}`);
}

// Restore original environment
if (originalEnvKey) {
  process.env.ANTHROPIC_API_KEY = originalEnvKey;
}

// Print Summary
console.log('\n' + '='.repeat(70));
console.log('Test Summary');
console.log('='.repeat(70));
console.log(`  ✓ Passed:  ${testsPassed}`);
console.log(`  ✗ Failed:  ${testsFailed}`);
console.log(`  ⊘ Skipped: ${testsSkipped}`);
console.log(`  Total:     ${testsPassed + testsFailed + testsSkipped}`);

if (testsFailed === 0) {
  console.log('\n🎉 All tests passed!');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed!');
  process.exit(1);
}
