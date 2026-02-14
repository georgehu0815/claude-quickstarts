# Authentication Explained: Agency OAuth vs API Keys

## ⚠️ Important Distinction

There are **two different authentication methods** for using Claude:

### 1. Agency/Claude Code (OAuth)
- Used by: `agency claude`, Claude Code CLI
- Method: OAuth authentication to Claude's web service
- Storage: Session tokens in keychain, not API keys
- No API key needed for Agency/Claude Code itself

### 2. Direct API Access (API Key)
- Used by: Your own applications (like this customer-support-agent)
- Method: Direct API calls to Anthropic's API using SDK
- Requires: `ANTHROPIC_API_KEY` from console.anthropic.com
- Storage: Environment variable or `.env.local` file

## What's in Your Keychain?

When you use Agency or Claude Code, your macOS keychain contains:

```json
{
  "mcpOAuth": {
    "plugin:supabase:supabase": {
      "serverName": "plugin:supabase:supabase",
      "clientSecret": "sba_...",
      "accessToken": "",
      "expiresAt": 0
    }
  }
}
```

This is **MCP OAuth tokens for plugins**, NOT Anthropic API keys.

## Why You Need an API Key for This Project

The customer-support-agent uses the `@anthropic-ai/sdk` package, which requires a direct API key to make API calls to Anthropic's service.

**Agency's OAuth tokens cannot be used for this** because:
1. They authenticate with Claude's web service (different endpoint)
2. They use OAuth flow (not bearer token authentication)
3. They're for Agency's internal use, not public API access

## How to Get an API Key

1. Visit https://console.anthropic.com/
2. Sign in (you can use the same account as Agency/Claude Code)
3. Navigate to "API Keys"
4. Click "Create Key"
5. Copy the key (format: `sk-ant-api03-...`)
6. Add to your project:
   ```bash
   echo 'ANTHROPIC_API_KEY=sk-ant-api03-your-key' > .env.local
   ```

## TokenManager's Role

The TokenManager we built:
- ✅ Checks environment variables first
- ✅ Falls back to keychain (for potential future use)
- ✅ Handles errors gracefully
- ⚠️ Currently, keychain doesn't have API keys (as designed by Agency)

## Summary

| Method | Used By | Authentication | Stored In |
|--------|---------|----------------|-----------|
| **OAuth** | Agency, Claude Code | OAuth tokens | Keychain (session tokens) |
| **API Key** | Your apps, SDK | Bearer token | Environment / .env.local |

**Bottom line:** To use this customer-support-agent, you need an API key from console.anthropic.com. Agency's authentication is separate and cannot be used here.

## Related Files

- `lib/token-manager.ts` - Checks environment then keychain
- `README.md` - Setup instructions
- `setup-api-key.sh` - Helper script to configure API key
