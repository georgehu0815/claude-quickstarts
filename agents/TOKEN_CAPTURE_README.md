# Claude Token Capture from macOS Keychain

This module provides automatic token retrieval from the macOS keychain where Agency and Claude Code store their authentication credentials.

## Overview

When you use `agency claude` or the Claude Code CLI, authentication tokens are stored in your macOS keychain. This `token_manager` module allows you to extract those tokens programmatically so your Python agents can authenticate without manually setting `ANTHROPIC_API_KEY`.

## How It Works

### Authentication Flow

1. **Agency/Claude Code Login**: When you authenticate via `agency claude` or `claude` CLI
2. **Keychain Storage**: Credentials are stored in macOS Keychain under services:
   - `Claude Code-credentials` - Contains MCP OAuth tokens and session data
   - `Claude Safe Storage` - Contains encrypted storage key
   - `Claude Code` - Contains session information

3. **Token Retrieval**: The `TokenManager` class uses the macOS `security` command to retrieve these credentials

4. **Agent Integration**: The `Agent` class automatically tries keychain as a fallback if `ANTHROPIC_API_KEY` is not set

## Usage

### Method 1: Automatic Agent Integration (Recommended)

The `Agent` class now automatically tries to get credentials from the keychain:

```python
from agents.agent import Agent, ModelConfig

# No need to set ANTHROPIC_API_KEY!
agent = Agent(
    name="MyAgent",
    system="You are a helpful assistant.",
    config=ModelConfig(model="claude-sonnet-4-20250514"),
    verbose=True  # Shows when keychain is used
)

# Use the agent normally
response = agent.run("Hello, Claude!")
```

### Method 2: Manual Token Management

Use the `TokenManager` directly for more control:

```python
from agents.token_manager import TokenManager
import os

# Create token manager
manager = TokenManager(verbose=True)

# Get all Claude credentials
credentials = manager.get_claude_credentials()
print(f"API Key: {credentials.api_key}")
print(f"MCP OAuth Tokens: {credentials.mcp_oauth_tokens}")

# Or just get the API key
api_key = manager.get_anthropic_api_key()

# Set up environment automatically
env_vars = manager.setup_environment()
os.environ.update(env_vars)
```

### Method 3: Convenience Functions

Quick one-liners for common tasks:

```python
from agents.token_manager import get_api_key_from_keychain, get_claude_credentials

# Get API key directly
api_key = get_api_key_from_keychain(verbose=True)

# Get full credentials
credentials = get_claude_credentials(verbose=True)
```

## Testing

Run the test script to verify everything works:

```bash
python3 agents/test_token_capture.py
```

Or run it directly (it's executable):

```bash
./agents/test_token_capture.py
```

The test script will:
1. ✅ Test token manager functionality
2. ✅ Show retrieved credentials (masked for security)
3. ✅ Test agent initialization with keychain
4. ✅ Optionally test an actual API call

## Credential Priority

The `Agent` class tries sources in this order:

1. **Provided `client`** - If you pass an `Anthropic` client directly
2. **Environment Variable** - `ANTHROPIC_API_KEY` from environment
3. **macOS Keychain** - Retrieved via `token_manager`
4. **Empty String** - Falls back to empty (will fail on API call)

## Security Notes

### What This Does

- ✅ Reads credentials from YOUR macOS keychain
- ✅ Only accessible with your user permissions
- ✅ Same security model as Agency/Claude Code
- ✅ No credentials are stored in code or files

### What This Does NOT Do

- ❌ Does not bypass authentication
- ❌ Does not extract or share credentials outside your machine
- ❌ Does not store credentials in plaintext anywhere
- ❌ Does not work on other operating systems (macOS only)

### Keychain Access

When you first run code that accesses the keychain, macOS will prompt:

```
"Terminal" wants to access key "Claude Code-credentials" in your keychain.
```

Click **Always Allow** to avoid repeated prompts.

## Troubleshooting

### Issue: No API Key Found

```python
[TokenManager] No credential found for service: Claude Code-credentials
```

**Solutions:**
1. Make sure you're logged in: `agency claude` or `claude`
2. Check keychain: `security find-generic-password -s "Claude Code-credentials"`
3. Fall back to manual: `export ANTHROPIC_API_KEY="your-key"`

### Issue: Permission Denied

```
security: SecKeychainSearchCopyNext: The specified item could not be found
```

**Solutions:**
1. Allow keychain access when prompted by macOS
2. Check Keychain Access.app → "Claude Code-credentials" → Access Control
3. Add your terminal app to the allowed applications

### Issue: Token Expired

If you get authentication errors even with keychain tokens:

```bash
# Re-authenticate with Agency
agency claude

# Or with Claude Code directly
claude
```

## Files

- `token_manager.py` - Main token management module
- `test_token_capture.py` - Test/demo script
- `agent.py` - Updated Agent class with keychain integration
- `TOKEN_CAPTURE_README.md` - This file

## How Agency Stores Tokens

Based on investigation of Agency and Claude Code:

1. **OAuth Tokens**: MCP plugin OAuth tokens stored in `Claude Code-credentials`
   ```json
   {
     "mcpOAuth": {
       "plugin:supabase:supabase|...": {
         "serverName": "plugin:supabase:supabase",
         "tokens": {...}
       }
     }
   }
   ```

2. **Session Management**: Agency creates session directories in `~/.claude/session-env/`

3. **Token Scrubbing**: Agency removes sensitive tokens (like `SYSTEM_ACCESSTOKEN`) before passing to subprocesses

4. **Keychain Integration**: Uses macOS Keychain Services API for secure storage

## Future Enhancements

Potential improvements for this module:

- [ ] Support for Linux keyring (via `secretstorage`)
- [ ] Support for Windows Credential Manager
- [ ] Automatic token refresh for expired credentials
- [ ] Integration with Agency's MCP OAuth flow
- [ ] Session token management
- [ ] Credential encryption/decryption utilities

## References

- [Anthropic Python SDK](https://github.com/anthropics/anthropic-sdk-python)
- [Agency CLI](https://aka.ms/agency)
- [Claude Code](https://www.anthropic.com/claude/code)
- [macOS Keychain Services](https://developer.apple.com/documentation/security/keychain_services)

## License

Same as the parent repository.
