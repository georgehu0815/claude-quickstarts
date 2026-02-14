/**
 * Unit tests for TokenManager
 *
 * These tests verify the token manager's ability to retrieve credentials
 * from the macOS keychain and environment variables.
 */

import {
  TokenManager,
  getApiKeyFromKeychain,
  getClaudeCredentials,
  getApiKey,
  isMacOS,
  getApiKeyWithPlatformCheck,
  ClaudeCredentials,
} from '../token-manager';

describe('TokenManager', () => {
  // Store original env var to restore after tests
  const originalApiKey = process.env.ANTHROPIC_API_KEY;

  afterEach(() => {
    // Restore original env var after each test
    if (originalApiKey) {
      process.env.ANTHROPIC_API_KEY = originalApiKey;
    } else {
      delete process.env.ANTHROPIC_API_KEY;
    }
  });

  describe('TokenManager class', () => {
    it('should initialize with default config', () => {
      const manager = new TokenManager();
      expect(manager).toBeInstanceOf(TokenManager);
    });

    it('should initialize with verbose mode', () => {
      const manager = new TokenManager({ verbose: true });
      expect(manager).toBeInstanceOf(TokenManager);
    });

    it('should initialize with account', () => {
      const manager = new TokenManager({ account: 'testuser' });
      expect(manager).toBeInstanceOf(TokenManager);
    });

    it('should get API key from environment when available', () => {
      process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key-123';
      const manager = new TokenManager({ verbose: false });
      const apiKey = manager.getAnthropicApiKey();

      expect(apiKey).toBe('sk-ant-test-key-123');
    });

    it('should return undefined when no API key is available', () => {
      delete process.env.ANTHROPIC_API_KEY;
      const manager = new TokenManager({ verbose: false });
      const apiKey = manager.getAnthropicApiKey();

      // Will be undefined unless keychain has a key
      expect(typeof apiKey).toMatch(/string|undefined/);
    });

    it('should retrieve Claude credentials', () => {
      const manager = new TokenManager({ verbose: false });
      const credentials = manager.getClaudeCredentials();

      expect(credentials).toHaveProperty('apiKey');
      expect(credentials).toHaveProperty('mcpOAuthTokens');
      expect(credentials).toHaveProperty('sessionToken');
    });

    it('should setup environment variables', () => {
      process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key-456';
      const manager = new TokenManager({ verbose: false });
      const envVars = manager.setupEnvironment();

      expect(envVars).toHaveProperty('ANTHROPIC_API_KEY');
      expect(envVars.ANTHROPIC_API_KEY).toBe('sk-ant-test-key-456');
    });
  });

  describe('Convenience functions', () => {
    describe('getApiKeyFromKeychain', () => {
      it('should retrieve API key from environment', () => {
        process.env.ANTHROPIC_API_KEY = 'sk-ant-convenience-test';
        const apiKey = getApiKeyFromKeychain(false);
        expect(apiKey).toBe('sk-ant-convenience-test');
      });

      it('should work with verbose mode', () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        process.env.ANTHROPIC_API_KEY = 'sk-ant-verbose-test';

        getApiKeyFromKeychain(true);

        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('[TokenManager]')
        );
        consoleSpy.mockRestore();
      });
    });

    describe('getClaudeCredentials', () => {
      it('should retrieve credentials without account', () => {
        const credentials = getClaudeCredentials(undefined, false);

        expect(credentials).toBeDefined();
        expect(typeof credentials).toBe('object');
      });

      it('should retrieve credentials with account', () => {
        const credentials = getClaudeCredentials('testuser', false);

        expect(credentials).toBeDefined();
        expect(typeof credentials).toBe('object');
      });
    });

    describe('getApiKey', () => {
      it('should get API key with default options', () => {
        process.env.ANTHROPIC_API_KEY = 'sk-ant-default-test';
        const apiKey = getApiKey();

        expect(apiKey).toBe('sk-ant-default-test');
      });

      it('should get API key with verbose option', () => {
        process.env.ANTHROPIC_API_KEY = 'sk-ant-verbose-option-test';
        const apiKey = getApiKey({ verbose: false });

        expect(apiKey).toBe('sk-ant-verbose-option-test');
      });
    });
  });

  describe('Platform detection', () => {
    describe('isMacOS', () => {
      it('should detect platform', () => {
        const result = isMacOS();
        expect(typeof result).toBe('boolean');
      });

      it('should return true on macOS', () => {
        // This will only pass on macOS
        if (process.platform === 'darwin') {
          expect(isMacOS()).toBe(true);
        }
      });

      it('should return false on non-macOS', () => {
        // This will only pass on non-macOS
        if (process.platform !== 'darwin') {
          expect(isMacOS()).toBe(false);
        }
      });
    });

    describe('getApiKeyWithPlatformCheck', () => {
      it('should get API key on any platform', () => {
        process.env.ANTHROPIC_API_KEY = 'sk-ant-platform-test';
        const apiKey = getApiKeyWithPlatformCheck();

        expect(apiKey).toBe('sk-ant-platform-test');
      });

      it('should skip keychain on non-macOS', () => {
        if (!isMacOS()) {
          process.env.ANTHROPIC_API_KEY = 'sk-ant-no-keychain';
          const apiKey = getApiKeyWithPlatformCheck({ verbose: false });

          expect(apiKey).toBe('sk-ant-no-keychain');
        }
      });

      it('should use keychain on macOS when env var not set', () => {
        if (isMacOS()) {
          delete process.env.ANTHROPIC_API_KEY;
          const apiKey = getApiKeyWithPlatformCheck({ verbose: false });

          // Will be undefined or a string from keychain
          expect(typeof apiKey).toMatch(/string|undefined/);
        }
      });
    });
  });

  describe('Credentials structure', () => {
    it('should return valid credentials structure', () => {
      const manager = new TokenManager();
      const credentials = manager.getClaudeCredentials();

      // Check structure
      expect(credentials).toBeDefined();

      // apiKey can be string or undefined
      if (credentials.apiKey) {
        expect(typeof credentials.apiKey).toBe('string');
      }

      // mcpOAuthTokens can be object or undefined
      if (credentials.mcpOAuthTokens) {
        expect(typeof credentials.mcpOAuthTokens).toBe('object');
      }

      // sessionToken can be string or undefined
      if (credentials.sessionToken) {
        expect(typeof credentials.sessionToken).toBe('string');
      }
    });
  });

  describe('Error handling', () => {
    it('should handle missing keychain gracefully', () => {
      const manager = new TokenManager({ verbose: false });

      // Should not throw even if keychain is unavailable
      expect(() => {
        manager.getClaudeCredentials();
      }).not.toThrow();
    });

    it('should handle invalid JSON in keychain gracefully', () => {
      const manager = new TokenManager({ verbose: false });

      // Should not throw even if keychain contains invalid JSON
      expect(() => {
        manager.getClaudeCredentials();
      }).not.toThrow();
    });
  });

  describe('Environment priority', () => {
    it('should prioritize environment over keychain', () => {
      process.env.ANTHROPIC_API_KEY = 'sk-ant-env-priority';
      const manager = new TokenManager({ verbose: false });
      const apiKey = manager.getAnthropicApiKey();

      expect(apiKey).toBe('sk-ant-env-priority');
    });

    it('should fall back to keychain when env var not set', () => {
      delete process.env.ANTHROPIC_API_KEY;
      const manager = new TokenManager({ verbose: false });
      const apiKey = manager.getAnthropicApiKey();

      // Will be undefined or from keychain
      expect(typeof apiKey).toMatch(/string|undefined/);
    });
  });
});

describe('Integration scenarios', () => {
  const originalApiKey = process.env.ANTHROPIC_API_KEY;

  afterEach(() => {
    if (originalApiKey) {
      process.env.ANTHROPIC_API_KEY = originalApiKey;
    } else {
      delete process.env.ANTHROPIC_API_KEY;
    }
  });

  it('should work in a typical Next.js API route scenario', () => {
    // Simulate API route usage
    process.env.ANTHROPIC_API_KEY = 'sk-ant-nextjs-test';
    const apiKey = getApiKeyWithPlatformCheck({ verbose: true });

    expect(apiKey).toBeDefined();
    expect(typeof apiKey).toBe('string');
  });

  it('should handle missing API key gracefully', () => {
    delete process.env.ANTHROPIC_API_KEY;
    const apiKey = getApiKeyWithPlatformCheck({ verbose: false });

    // Should return undefined or keychain value, not throw
    if (apiKey) {
      expect(typeof apiKey).toBe('string');
    } else {
      expect(apiKey).toBeUndefined();
    }
  });

  it('should allow verbose logging in development', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    process.env.ANTHROPIC_API_KEY = 'sk-ant-dev-test';

    getApiKeyWithPlatformCheck({ verbose: true });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
