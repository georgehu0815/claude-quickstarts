/**
 * Token Manager for extracting Claude/Anthropic credentials from macOS keychain.
 *
 * This module provides utilities to automatically retrieve API tokens and OAuth credentials
 * from the macOS keychain where Agency and Claude Code store their authentication data.
 *
 * @module token-manager
 */

import { execSync } from 'child_process';

/**
 * Container for Claude/Anthropic authentication credentials
 */
export interface ClaudeCredentials {
  apiKey?: string;
  mcpOAuthTokens?: Record<string, any>;
  sessionToken?: string;
}

/**
 * Configuration for TokenManager
 */
export interface TokenManagerConfig {
  verbose?: boolean;
  account?: string;
}

/**
 * Keychain service names where credentials are stored
 *
 * IMPORTANT: "Claude Code" service contains the actual API key!
 * "Claude Code-credentials" contains MCP OAuth tokens only.
 */
const KEYCHAIN_SERVICES = {
  claudeCode: 'Claude Code',  // Contains actual API key - check this FIRST
  claudeCodeCredentials: 'Claude Code-credentials',  // MCP OAuth tokens
  claudeSafeStorage: 'Claude Safe Storage',  // Encryption keys
} as const;

/**
 * Manages extraction of tokens from macOS keychain and environment
 */
export class TokenManager {
  private verbose: boolean;
  private account?: string;

  constructor(config: TokenManagerConfig = {}) {
    this.verbose = config.verbose ?? false;
    this.account = config.account;
  }

  /**
   * Log a message if verbose mode is enabled
   */
  private log(message: string): void {
    if (this.verbose) {
      console.log(`[TokenManager] ${message}`);
    }
  }

  /**
   * Retrieve a password from the macOS keychain
   *
   * @param service - The keychain service name
   * @param account - The account name (optional)
   * @returns The password/token if found, undefined otherwise
   */
  private getKeychainPassword(service: string, account?: string): string | undefined {
    try {
      // Build command string with proper escaping
      let command = `security find-generic-password -s "${service}" -w`;
      if (account) {
        command += ` -a "${account}"`;
      }

      const result = execSync(command, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      }).trim();

      this.log(`Successfully retrieved credential from service: ${service}`);
      return result;
    } catch (error) {
      this.log(`No credential found for service: ${service}`);
      return undefined;
    }
  }

  /**
   * Extract API key from MCP credentials JSON
   *
   * The Claude Code credentials in keychain contain OAuth tokens for MCP servers,
   * but may also contain API keys or session tokens.
   *
   * @param credentialsJson - JSON string from keychain
   * @returns API key if found, undefined otherwise
   */
  private extractApiKeyFromMcpCredentials(credentialsJson: string): string | undefined {
    try {
      const data = JSON.parse(credentialsJson);

      // Check for direct API key
      if (data.apiKey) {
        return data.apiKey;
      }

      // Check for anthropic API key in various locations
      if (data.anthropic && typeof data.anthropic === 'object') {
        if (data.anthropic.apiKey) {
          return data.anthropic.apiKey;
        }
      }

      // Check mcpOAuth tokens - may contain session info
      if (data.mcpOAuth) {
        this.log(`Found MCP OAuth tokens for ${Object.keys(data.mcpOAuth).length} services`);
      }

      return undefined;
    } catch (error) {
      this.log(`Failed to parse credentials JSON: ${error}`);
      return undefined;
    }
  }

  /**
   * Retrieve Claude credentials from macOS keychain
   *
   * This method attempts to extract credentials from various keychain locations
   * where Agency and Claude Code store their authentication data.
   *
   * @returns ClaudeCredentials object containing available credentials
   */
  public getClaudeCredentials(): ClaudeCredentials {
    const credentials: ClaudeCredentials = {
      apiKey: undefined,
      mcpOAuthTokens: undefined,
      sessionToken: undefined,
    };

    // FIRST: Try "Claude Code" service - this contains the actual API key!
    const claudeCodeApiKey = this.getKeychainPassword(
      KEYCHAIN_SERVICES.claudeCode,
      this.account
    );

    if (claudeCodeApiKey && claudeCodeApiKey.startsWith('sk-ant-')) {
      this.log('Found Anthropic API key in Claude Code keychain service');
      credentials.apiKey = claudeCodeApiKey;
      return credentials;  // Found the API key, we're done!
    }

    // SECOND: Try "Claude Code-credentials" (contains MCP OAuth tokens)
    const claudeCodeCreds = this.getKeychainPassword(
      KEYCHAIN_SERVICES.claudeCodeCredentials,
      this.account
    );

    if (claudeCodeCreds) {
      try {
        const credsData = JSON.parse(claudeCodeCreds);
        credentials.mcpOAuthTokens = credsData.mcpOAuth || {};

        // Try to extract API key from credentials
        const apiKey = this.extractApiKeyFromMcpCredentials(claudeCodeCreds);
        if (apiKey) {
          credentials.apiKey = apiKey;
        }
      } catch (error) {
        this.log('Could not parse Claude Code credentials as JSON');
      }
    }

    // THIRD: Try Claude Safe Storage (encryption keys)
    const safeStorage = this.getKeychainPassword(KEYCHAIN_SERVICES.claudeSafeStorage);
    if (safeStorage && !credentials.apiKey) {
      // Safe storage might contain encrypted API key or session token
      credentials.sessionToken = safeStorage;
    }

    return credentials;
  }

  /**
   * Get Anthropic API key from keychain or environment
   *
   * Attempts multiple sources in order of preference:
   * 1. Environment variable ANTHROPIC_API_KEY
   * 2. Claude keychain credentials
   * 3. Agency configuration
   *
   * @returns API key if found, undefined otherwise
   */
  public getAnthropicApiKey(): string | undefined {
    // Check environment first
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      this.log('Using ANTHROPIC_API_KEY from environment');
      return apiKey;
    }

    // Try to get from keychain
    const credentials = this.getClaudeCredentials();

    if (credentials.apiKey) {
      this.log('Retrieved API key from keychain');
      return credentials.apiKey;
    }

    this.log('No API key found in environment or keychain');
    return undefined;
  }

  /**
   * Set up environment variables from keychain credentials
   *
   * This method retrieves credentials from the keychain and returns
   * a record of environment variables that can be used to configure
   * the Anthropic client.
   *
   * @returns Record of environment variables to set
   */
  public setupEnvironment(): Record<string, string> {
    const envVars: Record<string, string> = {};

    const apiKey = this.getAnthropicApiKey();
    if (apiKey) {
      envVars.ANTHROPIC_API_KEY = apiKey;
      this.log('ANTHROPIC_API_KEY configured from keychain');
    }

    return envVars;
  }
}

/**
 * Convenience function to get API key from keychain
 *
 * @param verbose - Enable detailed logging
 * @returns API key if found, undefined otherwise
 */
export function getApiKeyFromKeychain(verbose = false): string | undefined {
  const manager = new TokenManager({ verbose });
  return manager.getAnthropicApiKey();
}

/**
 * Convenience function to get Claude credentials from keychain
 *
 * @param account - macOS username (optional)
 * @param verbose - Enable detailed logging
 * @returns ClaudeCredentials object
 */
export function getClaudeCredentials(
  account?: string,
  verbose = false
): ClaudeCredentials {
  const manager = new TokenManager({ account, verbose });
  return manager.getClaudeCredentials();
}

/**
 * Get Anthropic API key with automatic fallback
 *
 * This is the main function you should use in your application.
 * It tries:
 * 1. Environment variable ANTHROPIC_API_KEY
 * 2. macOS keychain
 * 3. Returns undefined if not found
 *
 * @param options - Configuration options
 * @returns API key or undefined
 */
export function getApiKey(options: TokenManagerConfig = {}): string | undefined {
  const manager = new TokenManager(options);
  return manager.getAnthropicApiKey();
}

/**
 * Check if running on macOS (keychain operations only work on macOS)
 */
export function isMacOS(): boolean {
  return process.platform === 'darwin';
}

/**
 * Get API key with platform check
 * On macOS: tries environment and keychain
 * On other platforms: only tries environment
 *
 * @param options - Configuration options
 * @returns API key or undefined
 */
export function getApiKeyWithPlatformCheck(options: TokenManagerConfig = {}): string | undefined {
  // On non-macOS platforms, only check environment
  if (!isMacOS()) {
    if (options.verbose) {
      console.log('[TokenManager] Not on macOS, skipping keychain access');
    }
    return process.env.ANTHROPIC_API_KEY;
  }

  // On macOS, use full token manager
  return getApiKey(options);
}

// Default export
export default TokenManager;
