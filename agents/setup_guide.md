# Claude Agent Setup Guide

## Quick Start

Your agent now has **automatic token detection** from the macOS keychain! 🎉

## Current Status

✅ Token manager successfully retrieves credentials from keychain
✅ Agent class integrated with automatic keychain fallback
✅ MCP OAuth tokens detected (1 service configured)
⚠️  Direct API key not found in keychain (see solutions below)

## Understanding Token Types

### 1. MCP OAuth Tokens (Found in Keychain)
- Used by Claude Code for MCP plugin authentication
- Stored in `Claude Code-credentials` keychain entry
- **Currently detected**: 1 service (likely Supabase)
- **Not usable** for direct Anthropic API calls

### 2. Anthropic API Key (Required for Agent)
- Direct authentication with Anthropic API
- Format: `sk-ant-api03-...`
- **Where to get it**: https://console.anthropic.com/

## Solution Options

### Option 1: Use Environment Variable (Recommended)

Set `ANTHROPIC_API_KEY` in your environment:

```bash
# Add to ~/.zshrc or ~/.bashrc
export ANTHROPIC_API_KEY="sk-ant-api03-your-key-here"

# Or set for current session
export ANTHROPIC_API_KEY="your-key"
```

Then your agent will work automatically:

```python
from agents.agent import Agent

agent = Agent(
    name="MyAgent",
    system="You are helpful."
)
# Will use ANTHROPIC_API_KEY from environment
```

### Option 2: Pass API Key Directly

```python
from anthropic import Anthropic
from agents.agent import Agent

client = Anthropic(api_key="your-api-key-here")

agent = Agent(
    name="MyAgent",
    system="You are helpful.",
    client=client
)
```

### Option 3: Store in Keychain Manually

Add your API key to the keychain:

```bash
# Add API key to keychain
security add-generic-password \
  -a "$(whoami)" \
  -s "anthropic-api-key" \
  -w "sk-ant-api03-your-key-here"
```

Then update `token_manager.py` to read from this service.

### Option 4: Use Agency OAuth (Advanced)

If Agency has OAuth tokens, you could:
1. Extract the OAuth token from keychain
2. Exchange it for an API key via Anthropic's OAuth flow
3. Cache the API key

This would require implementing OAuth token exchange.

## How the Agent Works Now

The `Agent` class tries authentication in this order:

```python
# Simplified flow
if client_provided:
    use_provided_client()
elif ANTHROPIC_API_KEY_in_environment:
    use_environment_key()
elif api_key_in_keychain:
    use_keychain_key()  # ← Currently returns None
else:
    use_empty_string()  # Will fail on API call
```

## Files Created

1. **`token_manager.py`** - Core token extraction from keychain
   - `TokenManager` class
   - `get_api_key_from_keychain()` function
   - `get_claude_credentials()` function

2. **`agent.py`** (updated) - Agent with automatic token detection
   - Imports `get_api_key_from_keychain`
   - Falls back to keychain if env var not set

3. **`test_token_capture.py`** - Test/demo script
   - Test token manager functionality
   - Test agent initialization
   - Optional API call test

4. **`TOKEN_CAPTURE_README.md`** - Detailed documentation
   - Full usage guide
   - Security notes
   - Troubleshooting

5. **`setup_guide.md`** (this file) - Quick setup guide

## Testing Your Setup

### Test 1: Token Manager

```bash
python3 agents/token_manager.py
```

Expected output:
- ✓ Credential retrieval from keychain
- ✓ MCP OAuth tokens detected
- ✗ API key not found (expected)

### Test 2: Full Agent Test

```bash
# Set your API key first
export ANTHROPIC_API_KEY="sk-ant-api03-your-key"

# Run full test
python3 agents/test_token_capture.py
```

### Test 3: Use Your Agent

```python
from agents.agent import Agent, ModelConfig

# Create agent (will use env var or keychain)
agent = Agent(
    name="MyAgent",
    system="You are a helpful AI assistant.",
    config=ModelConfig(model="claude-sonnet-4-20250514"),
    verbose=True
)

# Run a query
response = agent.run("What is 2+2?")

# Print response
for block in response.content:
    if hasattr(block, 'text'):
        print(block.text)
```

## Next Steps

1. **Get an API Key**
   - Go to https://console.anthropic.com/
   - Generate a new API key
   - Keep it secure!

2. **Set Environment Variable**
   ```bash
   echo 'export ANTHROPIC_API_KEY="sk-ant-api03-your-key"' >> ~/.zshrc
   source ~/.zshrc
   ```

3. **Test Your Agent**
   ```bash
   python3 agents/test_token_capture.py
   ```

4. **Build Your Application**
   - Your agent is ready to use!
   - No need to pass API keys in code
   - Automatic keychain fallback for convenience

## Keychain Investigation Results

Based on investigation of your macOS keychain and Agency setup:

```
Keychain Services Found:
├── Claude Code-credentials
│   ├── Account: ghu
│   ├── Contains: MCP OAuth tokens
│   └── Services: plugin:supabase:supabase
│
├── Claude Safe Storage
│   ├── Contains: Encryption key
│   └── Used by: Claude Code for secure storage
│
└── Claude Code
    └── Contains: Session information
```

**Key Finding**: Agency and Claude Code use OAuth tokens for authentication, not direct API keys. The keychain stores OAuth tokens for MCP plugins, but not Anthropic API keys.

## Why This Matters

With this setup, you can now:
- ✅ Run agents without hardcoding API keys
- ✅ Automatic credential detection
- ✅ Secure keychain integration (when API key is added)
- ✅ Fallback to environment variables
- ✅ Compatible with Agency/Claude Code workflows

## Support

If you encounter issues:

1. **Check keychain access**
   ```bash
   security find-generic-password -s "Claude Code-credentials" -g
   ```

2. **Verify environment variable**
   ```bash
   echo $ANTHROPIC_API_KEY
   ```

3. **Test Anthropic client directly**
   ```python
   from anthropic import Anthropic
   client = Anthropic()  # Should work with env var set
   ```

4. **Enable verbose mode**
   ```python
   agent = Agent(..., verbose=True)
   # Shows which credential source is used
   ```

---

**Summary**: Your token capture system is working! The keychain successfully stores MCP OAuth tokens. To use your agent, set `ANTHROPIC_API_KEY` in your environment or pass it directly to the agent.
